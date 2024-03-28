import { User } from "./User";

export class UserListChange {
    constructor(
        public readonly user: User,
        public readonly operation: 'add' | 'remove'
    ) { }
}