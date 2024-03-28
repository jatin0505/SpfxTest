import _ from "lodash";
import { sp, Web, WebEnsureUserResult, PrincipalType, PrincipalSource, SPBatch } from "@pnp/sp";
import { SiteGroup } from "@pnp/sp/src/sitegroups";
import { Guid } from "@microsoft/sp-core-library";
import { SPHttpClient, ISPHttpClientOptions } from "@microsoft/sp-http";
import { SharePointGroup, GroupResult, GroupMemberResult } from "../../sharepoint";
import { ErrorHandler } from "../../ErrorHandler";
import { User } from "../../User";
import { mapGetOrAdd } from "../../Utils";
import { ServiceContext } from "../IService";
import { SpfxContext } from "../SpfxContext";
import { IDirectoryService } from "./DirectoryServiceDescriptor";

export class OnlineDirectoryService implements IDirectoryService {
    private readonly _context: SpfxContext;
    private readonly _siteId: Guid;
    private readonly _webAbsoluteUrl: string;
    private readonly _spHttpClient: SPHttpClient;
    private readonly _resolveCache: Map<string, Promise<User[]>> = new Map<string, Promise<User[]>>();
    private readonly _searchCache: Map<string, Promise<User[]>> = new Map<string, Promise<User[]>>();
    private readonly _ensureUserCache: Map<string, Promise<User>> = new Map<string, Promise<User>>();
    private _currentUser: User;
    private _isSiteCollAdmin: boolean;
    private _storeNunmber: string;

    constructor({ spfxContext }: ServiceContext) {
        this._context = spfxContext;
        this._siteId = spfxContext.pageContext.site.id;
        this._spHttpClient = spfxContext.spHttpClient;
        this._webAbsoluteUrl = spfxContext.pageContext.web.absoluteUrl;
    }

    public get currentUser(): User {
        return this._currentUser;
    }

    public get isSiteCollAdmin(): boolean {
        return this._isSiteCollAdmin;
    }

    public get storeNumber(): string {
        return this._storeNunmber;
    }

    public async initialize(): Promise<void> {
        const users = await this.resolve([this._context.pageContext.user.email]);
        this._currentUser = users[0];
        this._isSiteCollAdmin = await this._isCurrentUserisAdmin();
        this._storeNunmber = await sp.profiles.getUserProfilePropertyFor(this._currentUser.email, "RetailStoreNumber");

    }

    private async _isCurrentUserisAdmin(): Promise<boolean> {
        const isSiteAdmin = await sp.web.currentUser.get().then(result => {
            return result.IsSiteAdmin;
        });
        return Promise.resolve(isSiteAdmin);
    }

    public async resolve(inputs: string[]): Promise<User[]> {
        if (inputs == null || inputs.length === 0) {
            return [];
        }

        const principalGroups = await Promise.all(inputs.map(input => this.resolveCore(input)));

        return _.flatten(principalGroups);
    }

    private resolveCore(input: string): Promise<User[]> {
        if (input == null || input.length === 0) {
            return Promise.resolve([]);
        }

        if (!this._resolveCache.has(input)) {
            const promise = sp.utility.expandGroupsToPrincipals([input])
                .then(results => results.map(info => User.fromPrincipalInfo(info)));
            this._resolveCache.set(input, promise);
        }

        return this._resolveCache.get(input);
    }

    public search(input: string): Promise<User[]> {
        if (!this._searchCache.has(input)) {
            const promise = sp.utility.searchPrincipals(input, PrincipalType.All, PrincipalSource.All, "", 10)
                .then(results => results.map(info => User.fromPrincipalInfo(info)));
            this._searchCache.set(input, promise);
        }

        return this._searchCache.get(input);
    }

    public ensureUsers(users: User[], batch?: SPBatch, customWeb?: Web): Promise<User[]> {
        const web = (customWeb || sp.web);
        const batchedWeb = batch ? web.inBatch(batch) : web;

        const ensureUserPromises = users.map(async user => {
            const ensuredUser = await this._ensureUserCore(user, batchedWeb);
            user.updateId(ensuredUser.id);
            return ensuredUser;
        });

        return Promise.all(ensureUserPromises);
    }

    private _ensureUserCore(user: User, web: Web): Promise<User> {
        return mapGetOrAdd(this._ensureUserCache, user.login, () => {
            if (user.id && user.id > 0) {
                return Promise.resolve(user);
            } else {
                return web.ensureUser(user.login).then((result: WebEnsureUserResult) => {
                    user.updateId(result.data.Id);
                    return user;
                });
            }
        });
    }

    public siteOwnersGroup(customWeb?: Web): Promise<SharePointGroup> {
        const web = customWeb || sp.web;
        return this._loadSiteGroup(web.associatedOwnerGroup);
    }

    public siteMembersGroup(customWeb?: Web): Promise<SharePointGroup> {
        const web = customWeb || sp.web;
        return this._loadSiteGroup(web.associatedMemberGroup);
    }

    public async loadGroup(id: number, customWeb?: Web): Promise<SharePointGroup> {
        const web = customWeb || sp.web;
        return this._loadSiteGroup(web.siteGroups.getById(id));
    }

    public async findGroupByTitle(title: string, customWeb?: Web): Promise<SharePointGroup> {
        const web = customWeb || sp.web;
        try {
            return await this._loadSiteGroup(web.siteGroups.getByName(title));
        } catch (e) {
            // group does not exist
            return null;
        }
    }

    private async _loadSiteGroup(siteGroup: SiteGroup): Promise<SharePointGroup> {
        const groupResult = await siteGroup.get<GroupResult>();
        const userResults = await siteGroup.users.get<GroupMemberResult[]>();
        const users = userResults.map(User.fromGroupMemberResult);
        return new SharePointGroup(groupResult.Id, groupResult.LoginName, users);
    }

    public async persistGroup(group: SharePointGroup, customWeb?: Web): Promise<void> {
        const web = customWeb || sp.web;

        if (group.hasChanges() && group.isDeleted && !group.isNew) {
            await web.siteGroups.removeById(group.id);
        }
        else if (group.hasChanges() && !group.isDeleted) {
            if (group.hasMetadataChanges()) {
                const groupProperties = {
                    Title: group.title,
                    Description: group.description,
                    AllowRequestToJoinLeave: group.allowRequestToJoinLeave,
                    AutoAcceptRequestToJoinLeave: group.autoAcceptRequestToJoinLeave,
                    RequestToJoinLeaveEmailSetting: group.requestToJoinLeaveEmailSetting,
                    AllowMembersEditMembership: group.allowMembersEditMembership,
                    OnlyAllowMembersViewMembership: group.onlyAllowMembersViewMembership
                };

                if (group.isNew) {
                    const saveResult = await web.siteGroups.add(groupProperties);
                    group.setId(saveResult.data.Id);
                } else {
                    await web.siteGroups.getById(group.id).update(groupProperties);
                }
            }

            if (group.hasMembershipChanges()) {
                const membersDifference = group.membersDifference();
                if (membersDifference.length > 0) {
                    const eh = new ErrorHandler();
                    const usersBatch = web.createBatch();
                    const batchedGroupUsers = web.siteGroups.getById(group.id).users.inBatch(usersBatch);
                    group.membersDifference().forEach(diff => {
                        if (diff.operation == 'add')
                            batchedGroupUsers.add(diff.user.login).catch(eh.catch);
                        else if (diff.operation == 'remove')
                            batchedGroupUsers.removeByLoginName(diff.user.login).catch(eh.catch);
                    });
                    await usersBatch.execute();
                    eh.throwIfError();
                }
            }
        }

        group.immortalize();
    }

    public async changeGroupOwner(group: SharePointGroup, owner: SharePointGroup | User): Promise<void> {
        const rootId = '740c6a0b-85e2-48a0-a494-e0f1759d4aa7';
        const processQuery = `${this._webAbsoluteUrl}/_vti_bin/client.svc/ProcessQuery`;
        const ownerType = owner instanceof SharePointGroup ? 'g' : 'u';

        const options: ISPHttpClientOptions = {
            body:
                `<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="15.0.0.0" ApplicationName=".NET Library" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009">
                <Actions>
                    <SetProperty Id="1" ObjectPathId="2" Name="Owner">
                        <Parameter ObjectPathId="3" />
                    </SetProperty>
                    <Method Name="Update" Id="4" ObjectPathId="2" />
                </Actions>
                <ObjectPaths>
                    <Identity Id="2" Name="${rootId}:site:${this._siteId.toString()}:g:${group.id}" />
                    <Identity Id="3" Name="${rootId}:site:${this._siteId.toString()}:${ownerType}:${owner.id}" />
                </ObjectPaths>
            </Request>`
        };

        await this._spHttpClient.post(processQuery, SPHttpClient.configurations.v1, options);
    }
}