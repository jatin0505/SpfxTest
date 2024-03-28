import { PrincipalInfo } from "@pnp/sp";
import { GroupMemberResult } from './sharepoint/query/GroupMemberResult';

export class User {
    public static equal(user1: User, user2: User): boolean {
        if (user1 && user2)
            return (user1.id > 0 && user2.id > 0 && user1.id == user2.id)
                || user1.login == user2.login
                || user1.email == user2.email;
        else
            return false;
    }

    public static except(users1: User[], users2: User[]): User[] {
        return users1.filter(om => users2.filter(m => User.equal(om, m)).length == 0);
    }

    public static fromPrincipalInfo(info: PrincipalInfo): User {
        return new User(info.PrincipalId, info.DisplayName, info.Email, info.LoginName, '', info.PrincipalType);
    }

    public static fromGroupMemberResult(result: GroupMemberResult): User {
        return new User(parseInt(result.Id, 10), result.Title, result.Email, result.LoginName, '', null);
    }

    private _id: number;
    public get id(): number { return this._id; }

    constructor(
        id: number,
        public readonly title: string,
        public readonly email: string,
        public readonly login: string,
        public readonly picture: string,
        public readonly type: number) {

        this._id = id;
    }

    public updateId(id: number) {
        this._id = id;
    }
}