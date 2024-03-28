import { TypedHash } from "@pnp/common";
import { RoleType, DateTimeFieldFormatType, PermissionKind } from "@pnp/sp";
import { IUpgradeAction } from "./IUpgradeAction";

export enum FieldType {
    Text,
    DateTime,
    Number,
    Image,
    Hyperlink,
    Boolean,
    Currency,
    Choice,
    Lookup,
    User
}

export enum RoleOperation {
    Add,
    Remove
}

export enum ReadAccess {
    ByAll = 1,
    ByAuthor = 2
}

export enum WriteAccess {
    ByAll = 1,
    ByAuthor = 2,
    None = 4
}

export enum DraftVisibilityType {
    Reader = 0,
    Author = 1,
    Approver = 2
}

export interface IFieldDefinition {
    name: string;
    displayName?: string;
    description?: string;
    type: FieldType;
    required?: boolean;
    hidden?: boolean;
    readonly?: boolean;
    hideInDisplayForm?: boolean;
    hideInNewForm?: boolean;
    hideInEditForm?: boolean;
    choices?: string[];
    default?: string;
    lookupListTitle?: string;
    lookupListId?: string;
    showField?: string;
    multi?: boolean;
    richText?: boolean;
    userSelectionMode?: "PeopleOnly" | "PeopleAndGroups";
    dateTimeFormat?: DateTimeFieldFormatType;
}

export const includeStandardViewFields = (...fields: (string | IFieldDefinition)[]) => {
    return [
        "ID",
        "LinkTitle",
        ...fields.map(f => (f as IFieldDefinition).name || f as string),
        "Author",
        "Created",
        "Editor",
        "Modified"
    ];
};

export interface IViewDefinition {
    title: string;
    default?: boolean;
    rowLimit?: number;
    paged?: boolean;
    query?: string;
    fields: string[];

    list?: IListDefinition;
}

export interface IPrepopulatedListItem extends TypedHash<any> {
    Title?: string;
}

export interface IPermissionLevel {
    name: string;
    description: string;
    copyFrom?: RoleType;
    permissions: PermissionKind[];
}

export interface ISiteGroup {
    name: string;
    description?: string;
    allowMembersEditMembership?: boolean;
    allowRequestToJoinLeave?: boolean;
    autoAcceptRequestToJoinLeave?: boolean;
    onlyAllowMembersViewMembership?: boolean;
    requestToJoinLeaveEmailSetting?: string;
}

export interface IUserRole {
    operation: RoleOperation;
    roleType: RoleType | string;
    userType: "custom" | "ownerGroup" | "memberGroup" | "visitorGroup";
    customName?: string;
}

export interface IListPermissions {
    copyRoleAssignments: boolean;
    userRoles: IUserRole[];
}

export interface IListDefinition {
    title: string;
    description: string;
    template: number;
    readSecurity?: ReadAccess;
    writeSecurity?: WriteAccess;
    draftVersionVisibility?: DraftVisibilityType;
    siteFields?: IFieldDefinition[];
    updateFields?: IFieldDefinition[];
    fields: IFieldDefinition[];
    listItems?: IPrepopulatedListItem[];
    siteGroups?: ISiteGroup[];
    permissions?: IListPermissions;
    enableModeration?: boolean;
    enableVersioning?: boolean;
    views?: IViewDefinition[];
    dependencies?: IListDefinition[];
}

export interface IUpgrade {
    fromVersion: number;
    toVersion: number;
    actions: IUpgradeAction[];
}

export interface IElementDefinitions {
    version: number;
    permissionLevels?: IPermissionLevel[];
    siteGroups?: ISiteGroup[];
    siteFields?: IFieldDefinition[];
    lists?: IListDefinition[];
    upgrades?: IUpgrade[];
}

export const buildLiveSchema = <T extends IElementDefinitions>(schema: T): T => {
    schema.lists.forEach(list => {
        list.views.forEach(view => {
            view.list = list;
        });
    });

    return schema;
};