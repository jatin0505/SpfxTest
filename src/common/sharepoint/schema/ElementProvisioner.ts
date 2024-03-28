import { getGUID } from "@pnp/common";
import { sp, Web, List, Fields, SiteGroupAddResult, PrincipalType, PrincipalSource, AddFieldOptions, UrlFieldFormatType, SPBatch, RoleType, BasePermissions, PermissionKind } from "@pnp/sp";
import { ErrorHandler } from "../../ErrorHandler";
import { User } from "../../User";
import { IListDefinition, IFieldDefinition, FieldType, RoleOperation, IListPermissions, IUserRole, WriteAccess, ReadAccess, ISiteGroup, IViewDefinition, IElementDefinitions, DraftVisibilityType, IPermissionLevel } from './IElementDefinitions';
import { RoleDefinitionResult } from "../query/RoleDefinitionResult";

class ResolvedUserRole {
    constructor(
        public readonly userRole: IUserRole,
        public readonly principalId: number,
        public readonly roleDefinitionId: number
    ) { }
}

class FieldResult {
    public Id: string;
    public Description: string;
    public Hidden: boolean;
    public Group: string;
    public InternalName: string;
    public Required: boolean;
    public SchemaXml: string;
    public Title: string;
}

class SiteGroupResult {
    public AllowMembersEditMembership: boolean;
    public AllowRequestToJoinLeave: boolean;
    public AutoAcceptRequestToJoinLeave: boolean;
    public Description: string;
    public Id: number;
    public IsHiddenInUI: boolean;
    public LoginName: string;
    public OnlyAllowMembersViewMembership: boolean;
    public OwnerTitle: string;
    public PrincipalType: PrincipalType;
    public Title: string;
}

class SiteUserResult {
    public readonly Id: number;
    public readonly IsHiddenInUI: boolean;
    public readonly Title: string;
    public readonly LoginName: string;
    public readonly PrincipalType: number;
    public readonly Email: string;
    public readonly IsSiteAdmin: boolean;
    public readonly UserPrincipalName: string;
}

export class ElementProvisioner {
    private readonly _ensureFieldsPromiseCache: Map<string, Promise<FieldResult>>;

    constructor() {
        this._ensureFieldsPromiseCache = new Map<string, Promise<FieldResult>>();
    }

    public async ensureElements(elementDefinitions: IElementDefinitions, web?: Web): Promise<void> {
        try {
            const { permissionLevels, siteGroups, siteFields, lists } = elementDefinitions;
            web = web || sp.web;

            if (permissionLevels) {
                await Promise.all(permissionLevels.map(level => this._ensurePermissionLevel(web, level)));
            }

            if (siteGroups) {
                await Promise.all(siteGroups.map(siteGroup => this._ensureSiteGroup(web, siteGroup)));
            }

            if (siteFields) {
                await Promise.all(siteFields.map(siteField => this._ensureField(web, web.fields, siteField)));
            }

            if (lists) {
                await this._ensureListsRespectingDependencies(web, lists);
            }
        } catch (e) {
            ErrorHandler.throw(e);
        }
    }

    public async ensureList(listDefinition: IListDefinition, web?: Web): Promise<void> {
        web = web || sp.web;

        try {
            await this._ensureListsRespectingDependencies(web, [listDefinition]);
        } catch (e) {
            ErrorHandler.throw(e);
        }
    }

    public async ensureField(fieldDefinition: IFieldDefinition, listDefinition: IListDefinition, web?: Web): Promise<void> {
        web = web || sp.web;
        const list = web.lists.getByTitle(listDefinition.title);

        try {
            const retrieveLookupsBatch = web.createBatch();
            this._retrieveLookupListId(web, fieldDefinition, retrieveLookupsBatch);
            await retrieveLookupsBatch.execute();

            await this._ensureField(web, list.fields, fieldDefinition);
        } catch (e) {
            ErrorHandler.throw(e);
        }
    }

    public async updateField(fieldDefinition: IFieldDefinition, listDefinition: IListDefinition, web?: Web): Promise<void> {
        web = web || sp.web;
        const list = web.lists.getByTitle(listDefinition.title);
        const eh = new ErrorHandler();
        const batch = web.createBatch();
        this._updateField(fieldDefinition, list.fields, batch, eh);
        await batch.execute();
        eh.throwIfError();
    }

    public async deleteField(fieldDefinition: IFieldDefinition, listDefinition: IListDefinition, web?: Web): Promise<void> {
        web = web || sp.web;
        const list = web.lists.getByTitle(listDefinition.title);
        const field = list.fields.getByInternalNameOrTitle(fieldDefinition.name);

        try {
            try {
                await field.get(); // check if the field exists before attempting to delete
            } catch (e) {
                return; // field does not exist
            }

            await field.delete();
        } catch (e) {
            ErrorHandler.throw(e);
        }
    }

    public async addOrUpdateView(viewDefinition: IViewDefinition, listDefinition: IListDefinition, web?: Web): Promise<void> {
        web = web || sp.web;
        const list = web.lists.getByTitle(listDefinition.title);

        try {
            await list.views.getByTitle(viewDefinition.title)
                .delete()
                .catch(() => { }); // if view doesn't exist, swallow the exception
            await this._createView(web, list, viewDefinition);
        } catch (e) {
            ErrorHandler.throw(e);
        }
    }

    public async deleteSiteField(fieldDefinition: IFieldDefinition, web?: Web): Promise<void> {
        web = web || sp.web;

        try {
            await web.fields.getByInternalNameOrTitle(fieldDefinition.name)
                .delete()
                .catch(() => { }); // if column doesn't exist, swallow the exception
        } catch (e) {
            ErrorHandler.throw(e);
        }
    }

    public async deleteView(viewTitle: string, listDefinition: IListDefinition, web?: Web): Promise<void> {
        web = web || sp.web;
        const list = web.lists.getByTitle(listDefinition.title);

        try {
            await list.views.getByTitle(viewTitle).delete();
        } catch (e) {
            ErrorHandler.throw(e);
        }
    }

    public async configurePermissions(listDefinition: IListDefinition, web?: Web, forcePermissionReset: boolean = false): Promise<void> {
        web = web || sp.web;

        try {
            await this._configurePermissions(listDefinition, web, forcePermissionReset);
        } catch (e) {
            ErrorHandler.throw(e);
        }
    }

    private async _ensureListsRespectingDependencies(web: Web, listDefinitions: IListDefinition[]): Promise<void> {
        for (var list of listDefinitions) {
            if (list.dependencies && list.dependencies.length > 0) {
                await this._ensureListsRespectingDependencies(web, list.dependencies);
            }

            await this._ensureList(web, list);
        }
    }

    private async _ensureList(web: Web, listDefinition: IListDefinition): Promise<void> {
        const { title, description, template, readSecurity, writeSecurity, enableModeration, enableVersioning, draftVersionVisibility } = listDefinition;

        const listSettings = {
            EnableModeration: enableModeration,
            EnableVersioning: enableVersioning,
            ReadSecurity: readSecurity || ReadAccess.ByAll,
            WriteSecurity: writeSecurity || WriteAccess.ByAll,
            DraftVersionVisibility: enableModeration ? (draftVersionVisibility || DraftVisibilityType.Reader) : undefined
        };

        const listEnsureResult = await web.lists.ensure(title, description, template, false, listSettings);

        if (listEnsureResult.created)
            await this._configureList(web, listDefinition, listEnsureResult.list);
    }

    private async _configureList(web: Web, listDefinition: IListDefinition, list: List): Promise<void> {
        const siteFields = listDefinition.siteFields || [];
        const siteGroups = listDefinition.siteGroups || [];
        const fields = listDefinition.fields || [];
        const updateFields = listDefinition.updateFields || [];
        const views = listDefinition.views || [];

        const retrieveLookupsBatch = web.createBatch();
        fields.forEach(field => this._retrieveLookupListId(web, field, retrieveLookupsBatch));
        await retrieveLookupsBatch.execute();

        await Promise.all(siteGroups.map(siteGroup => this._ensureSiteGroup(web, siteGroup)));
        const siteFieldResults = await Promise.all(siteFields.map(field => this._ensureField(web, web.fields, field)));

        const eh = new ErrorHandler();
        const fieldsBatch = web.createBatch();
        fields.forEach(field => this._createField(field, list.fields, fieldsBatch, eh));
        updateFields.forEach(field => this._updateField(field, list.fields, fieldsBatch, eh));
        siteFieldResults.forEach(field => this._addSiteField(field, list.fields, fieldsBatch, eh));

        await fieldsBatch.execute();
        eh.throwIfError();
        for (let view of views) {
            await this._createView(web, list, view);
        }
        await this._configurePermissions(listDefinition, web, false);
        await this._createPrepopulatedListItems(web, listDefinition);
    }

    private async _createView(web: Web, list: List, view: IViewDefinition): Promise<void> {
        const viewSettings = {
            RowLimit: view.rowLimit === undefined ? 30 : view.rowLimit,
            Paged: view.paged === undefined ? true : view.paged,
            DefaultView: view.default === undefined ? false : view.default,
            ViewQuery: view.query || ''
        };

        const viewAddResult = await list.views.add(view.title, false, viewSettings);

        const eh = new ErrorHandler();
        const batch = web.createBatch();
        const batchedFields = viewAddResult.view.fields.inBatch(batch);

        batchedFields.removeAll().catch(eh.catch);
        view.fields.forEach(field => batchedFields.add(field).catch(eh.catch));

        await batch.execute();

        eh.throwIfError();
    }

    private async _configurePermissions(listDefinition: IListDefinition, web: Web, forcePermissionReset: boolean): Promise<void> {
        const { permissions } = listDefinition;

        const eh = new ErrorHandler();
        const batch = web.createBatch();
        const list = web.lists.getByTitle(listDefinition.title).inBatch(batch);

        if (forcePermissionReset) {
            list.resetRoleInheritance().catch(eh.catch);
        }

        if (permissions) {
            const [
                roles,
                adminRoleDefinition,
                currentUser
            ] = await Promise.all([
                Promise.all(this._resolveUserRoles(web, permissions)),
                web.roleDefinitions.getByType(RoleType.Administrator).get<RoleDefinitionResult>(),
                web.currentUser.get<SiteUserResult>()
            ]);

            list.breakRoleInheritance(permissions.copyRoleAssignments, false).catch(eh.catch);

            roles.forEach(role => {
                const assignments = list.roleAssignments.inBatch(batch);

                switch (role.userRole.operation) {
                    case RoleOperation.Add:
                        assignments.add(role.principalId, role.roleDefinitionId).catch(eh.catch);
                        break;
                    case RoleOperation.Remove:
                        assignments.remove(role.principalId, role.roleDefinitionId).catch(eh.catch);
                        break;
                }
            });

            list.roleAssignments.inBatch(batch).remove(currentUser.Id, adminRoleDefinition.Id).catch(eh.catch);
        }

        await batch.execute();
        eh.throwIfError();
    }

    private async _ensureField(web: Web, fields: Fields, fieldDefinition: IFieldDefinition): Promise<FieldResult> {
        const name = fieldDefinition.name;
        const cacheKey = fields.toUrlAndQuery() + name;

        if (this._ensureFieldsPromiseCache.has(cacheKey)) {
            return await this._ensureFieldsPromiseCache.get(cacheKey);
        } else {
            const promise = (async () => {
                try {
                    return await fields.getByInternalNameOrTitle(name).get<FieldResult>();
                } catch (e) {
                    const eh = new ErrorHandler();
                    const batch = web.createBatch();
                    this._createField(fieldDefinition, fields, batch, eh);
                    await batch.execute();
                    eh.throwIfError();
                    return await fields.getByInternalNameOrTitle(name).get<FieldResult>();
                }
            })();
            this._ensureFieldsPromiseCache.set(cacheKey, promise);
            return await promise;
        }
    }

    private _updateField(fieldDefinition: IFieldDefinition, fields: Fields, batch: SPBatch, eh: ErrorHandler) {
        const name = fieldDefinition.name;
        const displayName = fieldDefinition.displayName || name;
        const description = fieldDefinition.description || '';
        const required = fieldDefinition.required || false;

        const field = fields.getByInternalNameOrTitle(name);
        const batchedField = field.inBatch(batch);

        const properties = {
            Title: displayName,
            Description: description,
            Required: required
        };

        batchedField.update(properties).catch(eh.catch);

        if (fieldDefinition.type == FieldType.Choice) {
            batchedField.update({ Choices: { results: fieldDefinition.choices } } as any, 'SP.FieldChoice').catch(eh.catch);
        }
    }

    private _createField(fieldDefinition: IFieldDefinition, fields: Fields, batch: SPBatch, eh: ErrorHandler) {
        const batchedFields = fields.inBatch(batch);

        const name = fieldDefinition.name;
        const displayName = fieldDefinition.displayName || name;
        const description = fieldDefinition.description || '';
        const defaultValue = fieldDefinition.default || '';
        const required = fieldDefinition.required || false;
        const hidden = fieldDefinition.hidden || false;
        const readonly = fieldDefinition.readonly || false;
        const hideInDisplayForm = fieldDefinition.hideInDisplayForm || false;
        const hideInNewForm = fieldDefinition.hideInNewForm || false;
        const hideInEditForm = fieldDefinition.hideInEditForm || false;
        const richText = fieldDefinition.richText || false;

        const baseProperties = {
            Description: description,
            DefaultValue: defaultValue,
            Hidden: hidden,
            ReadOnlyField: readonly,
            Required: required
        };

        const boolProp = (propName: string, val: boolean, emitOnFalse: boolean = true) => {
            if (val || emitOnFalse)
                return `${propName}="${val ? "TRUE" : "FALSE"}"`;
            else
                return '';
        };
        const requiredProp = () => boolProp("Required", required);
        const hiddenProp = () => boolProp("Hidden", hidden);
        const readonlyProp = () => boolProp("ReadOnly", readonly);
        const multProp = () => boolProp("Mult", fieldDefinition.multi, false);

        switch (fieldDefinition.type) {
            case FieldType.Text:
                if (fieldDefinition.multi)
                    batchedFields.addMultilineText(name, 3, richText, false, false, false, baseProperties).catch(eh.catch);
                else
                    batchedFields.addText(name, undefined, baseProperties).catch(eh.catch);
                break;

            case FieldType.DateTime:
                batchedFields.addDateTime(name, fieldDefinition.dateTimeFormat, undefined, undefined, baseProperties).catch(eh.catch);
                break;

            case FieldType.Number:
                batchedFields.addNumber(name, undefined, undefined, baseProperties).catch(eh.catch);
                break;

            case FieldType.Hyperlink:
                batchedFields.addUrl(name, UrlFieldFormatType.Hyperlink, baseProperties).catch(eh.catch);
                break;

            case FieldType.Image:
                batchedFields.addUrl(name, UrlFieldFormatType.Image, baseProperties).catch(eh.catch);
                break;

            case FieldType.Currency:
                batchedFields.addCurrency(name, undefined, undefined, undefined, baseProperties).catch(eh.catch);
                break;

            case FieldType.Boolean:
                const schemaBoolean =
                    `<Field ID="{${getGUID()}}" DisplayName="${name}" Description="${description}"`
                    + ` Type="Boolean" ${requiredProp()} ${hiddenProp()} ${readonlyProp()}>`
                    + `<Default>${defaultValue}</Default>`
                    + '</Field>';
                batchedFields.createFieldAsXml(schemaBoolean).catch(eh.catch);
                break;

            case FieldType.Choice:
                const schemaChoice =
                    `<Field ID="{${getGUID()}}" DisplayName="${name}" Description="${description}"`
                    + ` Type="${fieldDefinition.multi ? "MultiChoice" : "Choice"}"`
                    + ` ${requiredProp()} ${hiddenProp()} ${readonlyProp()}>`
                    + '<CHOICES>'
                    + fieldDefinition.choices.map(choice => `<CHOICE>${choice}</CHOICE>`).join('')
                    + '</CHOICES>'
                    + `<Default>${defaultValue}</Default>`
                    + '</Field>';
                batchedFields.createFieldAsXml(schemaChoice).catch(eh.catch);
                break;

            case FieldType.Lookup:
                const schemaLookup =
                    `<Field ID="{${getGUID()}}" DisplayName="${name}" Description="${description}"`
                    + ` Type="Lookup" List="{${fieldDefinition.lookupListId}}" ShowField="${fieldDefinition.showField || 'ID'}"`
                    + ` ${requiredProp()} ${hiddenProp()} ${readonlyProp()}></Field>`;
                batchedFields.createFieldAsXml(schemaLookup).catch(eh.catch);
                break;

            case FieldType.User:
                const schemaUser =
                    `<Field ID="{${getGUID()}}" DisplayName="${name}" Description="${description}"`
                    + ` Type="${fieldDefinition.multi ? "UserMulti" : "User"}" List="UserInfo" ShowField="ImnName"`
                    + ` UserSelectionMode="${fieldDefinition.userSelectionMode}" UserSelectionScope="0"`
                    + ` ${requiredProp()} ${hiddenProp()} ${readonlyProp()} ${multProp()}/>`;
                batchedFields.createFieldAsXml(schemaUser).catch(eh.catch);
                break;

            default: break;
        }

        const field = fields.getByInternalNameOrTitle(name);
        const batchedField = field.inBatch(batch);

        if (displayName != name)
            batchedField.update({ Title: displayName }).catch(eh.catch);
        if (hideInDisplayForm)
            batchedField.setShowInDisplayForm(!hideInDisplayForm).catch(eh.catch);
        if (hideInNewForm)
            batchedField.setShowInNewForm(!hideInNewForm).catch(eh.catch);
        if (hideInEditForm)
            batchedField.setShowInEditForm(!hideInEditForm).catch(eh.catch);
    }

    private _addSiteField(fieldToAdd: FieldResult, fields: Fields, batch: SPBatch, eh: ErrorHandler) {
        fields.inBatch(batch).createFieldAsXml({ SchemaXml: fieldToAdd.SchemaXml, Options: AddFieldOptions.AddFieldInternalNameHint }).catch(eh.catch);
    }

    private async _createPrepopulatedListItems(web: Web, listDefinition: IListDefinition): Promise<void> {
        const list = web.lists.getByTitle(listDefinition.title);
        const eh = new ErrorHandler();
        const itemBatch = web.createBatch();
        const items = (listDefinition.listItems || []);

        items.forEach(item => {
            list.items.inBatch(itemBatch).add(item).catch(eh.catch);
        });

        await itemBatch.execute();

        eh.throwIfError();
    }

    private async _ensureSiteGroup(web: Web, siteGroup: ISiteGroup): Promise<void> {
        try {
            await web.siteGroups.getByName(siteGroup.name).get();
        } catch (e) {
            await this._createSiteGroup(web, siteGroup);
        }
    }

    private async _createSiteGroup(web: Web, siteGroup: ISiteGroup): Promise<SiteGroupAddResult> {
        const properties = {
            Title: siteGroup.name,
            Description: siteGroup.description || '',
            AllowMembersEditMembership: siteGroup.allowMembersEditMembership || false,
            AllowRequestToJoinLeave: siteGroup.allowRequestToJoinLeave || false,
            AutoAcceptRequestToJoinLeave: siteGroup.autoAcceptRequestToJoinLeave || false,
            OnlyAllowMembersViewMembership: siteGroup.onlyAllowMembersViewMembership || false,
            RequestToJoinLeaveEmailSetting: siteGroup.requestToJoinLeaveEmailSetting || ''
        };

        return await web.siteGroups.add(properties);
    }

    private _resolveUserRoles(web: Web, permissions: IListPermissions): Promise<ResolvedUserRole>[] {
        return permissions.userRoles.map(async userRole => {
            let principalId: number;

            switch (userRole.userType) {
                case 'ownerGroup':
                    principalId = (await web.associatedOwnerGroup.get<SiteGroupResult>()).Id;
                    break;
                case 'memberGroup':
                    principalId = (await web.associatedMemberGroup.get<SiteGroupResult>()).Id;
                    break;
                case 'visitorGroup':
                    principalId = (await web.associatedVisitorGroup.get<SiteGroupResult>()).Id;
                    break;
                case 'custom':
                    const principals = await sp.utility.searchPrincipals(userRole.customName, PrincipalType.All, PrincipalSource.All, '', 1);
                    const principal = principals[0];
                    const user = User.fromPrincipalInfo(principal);

                    if (principal.PrincipalType == PrincipalType.User) {
                        const result = await web.ensureUser(user.login);
                        user.updateId(result.data.Id);
                    } else {
                        user.updateId(principal.PrincipalId);
                    }

                    principalId = user.id;
                    break;
            }

            let definition = null;
            if (typeof userRole.roleType === "string")
                definition = await web.roleDefinitions.getByName(userRole.roleType).get();
            else
                definition = await web.roleDefinitions.getByType(userRole.roleType).get();

            return new ResolvedUserRole(userRole, principalId, definition.Id);
        });
    }

    private async _ensurePermissionLevel(web: Web, levelDefinition: IPermissionLevel): Promise<void> {
        const { name, description, copyFrom, permissions } = levelDefinition;

        let basePermissions: BasePermissions = null;
        if (copyFrom) {
            const roleDefinition = await web.roleDefinitions.getByType(copyFrom).get();
            basePermissions = this._buildBasePermissions(permissions, roleDefinition.BasePermissions);
        } else {
            basePermissions = this._buildBasePermissions(permissions);
        }

        try {
            // check for an existing permission level with the same name and update it
            const existingRoleDefinition = await web.roleDefinitions.getByName(name).get();

            basePermissions = {
                Low: basePermissions.Low | existingRoleDefinition.BasePermissions.Low,
                High: basePermissions.High | existingRoleDefinition.BasePermissions.High,
            };

            await web.roleDefinitions.getByName(name).update({
                Description: description,
                BasePermissions: basePermissions
            });
        } catch {
            // no existing permission level exists with this name, so create a new one
            await web.roleDefinitions.add(name, description, 0, basePermissions);
        }
    }

    private _buildBasePermissions(permissions: PermissionKind[], basePerm?: BasePermissions): BasePermissions {
        const newPerm: BasePermissions = {
            Low: basePerm ? basePerm.Low : 0,
            High: basePerm ? basePerm.High : 0
        };

        permissions.forEach(permission => {
            if (permission == PermissionKind.FullMask) {
                newPerm.Low = newPerm.High = 0xFFFFFFFF;
            } else if (permission == PermissionKind.EmptyMask) {
                // do nothing
            } else {
                const mask = 0x1 << (permission - 1);
                if (permission <= 32)
                    newPerm.Low |= mask;
                else // if (permission > 32)
                    newPerm.High |= mask;
            }
        });

        return newPerm;
    }

    private _retrieveLookupListId(web: Web, fieldDefinition: IFieldDefinition, batch: SPBatch) {
        if (fieldDefinition.type == FieldType.Lookup && !fieldDefinition.lookupListId) {
            const list = web.lists.getByTitle(fieldDefinition.lookupListTitle);
            list.inBatch(batch).get().then(result => {
                const lookupListId = result['Id'];
                fieldDefinition.lookupListId = lookupListId;
            }, ErrorHandler.throw);
        }
    }
}