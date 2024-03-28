import { Web, SPBatch } from "@pnp/sp";
import { SharePointGroup } from "../../sharepoint";
import { User } from "../../User";
import { IService } from "../IService";
import { IServiceDescriptor } from "../IServiceDescriptor";
import { OnlineDirectoryService } from "./OnlineDirectoryService";
import { MockDirectoryService } from "./MockDirectoryService";

export const DirectoryService: unique symbol = Symbol("Directory Service");

export interface IDirectoryService extends IService {
    currentUser: User;
    isSiteCollAdmin: boolean;
    storeNumber: string;

    resolve(input: string[]): Promise<User[]>;
    search(input: string): Promise<User[]>;
    ensureUsers(principals: User[], batch?: SPBatch, customWeb?: Web): Promise<User[]>;
    siteOwnersGroup(customWeb?: Web): Promise<SharePointGroup>;
    siteMembersGroup(customWeb?: Web): Promise<SharePointGroup>;
    loadGroup(id: number, customWeb?: Web): Promise<SharePointGroup>;
    findGroupByTitle(title: string, customWeb?: Web): Promise<SharePointGroup>;
    persistGroup(group: SharePointGroup, customWeb?: Web): Promise<void>;
    changeGroupOwner(group: SharePointGroup, owner: SharePointGroup | User): Promise<void>;
}

export type DirectoryServiceProp = {
    [DirectoryService]: IDirectoryService;
};

export const DirectoryServiceDescriptor: IServiceDescriptor<typeof DirectoryService, IDirectoryService, DirectoryServiceProp> = {
    symbol: DirectoryService,
    dependencies: [],
    online: OnlineDirectoryService,
    local: MockDirectoryService
};