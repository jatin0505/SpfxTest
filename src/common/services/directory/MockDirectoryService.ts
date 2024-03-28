import { Web, PrincipalType, SPBatch } from "@pnp/sp";
import { SharePointGroup } from "../../sharepoint";
import { User } from "../../User";
import { IDirectoryService } from "./DirectoryServiceDescriptor";

export class MockDirectoryService implements IDirectoryService {
    private readonly _mockCurrentUser: User = new User(1, "Dev User", "user@dev.local", "dev.user@dev.local", "", PrincipalType.User);

    public async initialize(): Promise<void> {
    }

    public get currentUser(): User {
        return this._mockCurrentUser;
    }

    public get isSiteCollAdmin(): boolean {
        return true;
    }

    public get storeNumber(): string {
        return "";
    }

    public async resolve(input: string[]): Promise<User[]> {
        return input.map(val => new User(0, val, val, val, '', PrincipalType.None));
    }

    public async search(input: string): Promise<User[]> {
        return [new User(0, input, input, input, '', PrincipalType.None)];
    }

    public async ensureUsers(principals: User[], batch?: SPBatch, customWeb?: Web): Promise<User[]> {
        return principals;
    }

    public async siteOwnersGroup(customWeb?: Web): Promise<SharePointGroup> {
        return new SharePointGroup(1000, "Site Owners", [this.currentUser]);
    }

    public async siteMembersGroup(customWeb?: Web): Promise<SharePointGroup> {
        return new SharePointGroup(1001, "Site Members", [this.currentUser]);
    }

    public async loadGroup(id: number, customWeb?: Web): Promise<SharePointGroup> {
        return new SharePointGroup(id, 'Custom Group', [this.currentUser]);
    }

    public async findGroupByTitle(title: string, customWeb?: Web): Promise<SharePointGroup> {
        return new SharePointGroup(1002, title, [this.currentUser]);
    }

    public async persistGroup(group: SharePointGroup, customWeb?: Web): Promise<void> {
    }

    public async changeGroupOwner(group: SharePointGroup, owner: SharePointGroup | User): Promise<void> {
    }
}