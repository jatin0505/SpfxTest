import _ from 'lodash';
import { Entity } from "../Entity";
import { User } from "../User";
import { UserListChange } from "../UserListChange";

interface State {
    title: string;
    members: User[];
    description?: string;
    allowMembersEditMembership?: boolean;
    allowRequestToJoinLeave?: boolean;
    autoAcceptRequestToJoinLeave?: boolean;
    onlyAllowMembersViewMembership?: boolean;
    requestToJoinLeaveEmailSetting?: string;
    hasMembershipChanges: boolean;
    hasMetadataChanges: boolean;
}

export class SharePointGroup extends Entity<State> {
    constructor(id?: number, name: string = '', members: User[] = []) {
        super(id);

        this.state.title = name;
        this.state.members = members.slice();
        this.state.description = '';
        this.state.requestToJoinLeaveEmailSetting = '';
        this.state.allowMembersEditMembership = true;
        this.state.allowRequestToJoinLeave = false;
        this.state.autoAcceptRequestToJoinLeave = false;
        this.state.onlyAllowMembersViewMembership = false;
    }

    public get displayName(): string { return this.state.title; }
    public get title(): string { return this.state.title; }
    public get members(): User[] { return this.state.members; }
    public get description(): string { return this.state.description; }
    public get requestToJoinLeaveEmailSetting(): string { return this.state.requestToJoinLeaveEmailSetting; }
    public get allowMembersEditMembership(): boolean { return this.state.allowMembersEditMembership; }
    public get allowRequestToJoinLeave(): boolean { return this.state.allowRequestToJoinLeave; }
    public get autoAcceptRequestToJoinLeave(): boolean { return this.state.autoAcceptRequestToJoinLeave; }
    public get onlyAllowMembersViewMembership(): boolean { return this.state.onlyAllowMembersViewMembership; }

    public set title(val: string) { this.state.title = val; }
    public set members(val: User[]) { this.state.members = val; }
    public set description(val: string) { this.state.description = val; }
    public set requestToJoinLeaveEmailSetting(val: string) { this.state.requestToJoinLeaveEmailSetting = val; }
    public set allowMembersEditMembership(val: boolean) { this.state.allowMembersEditMembership = val; }
    public set allowRequestToJoinLeave(val: boolean) { this.state.allowRequestToJoinLeave = val; }
    public set autoAcceptRequestToJoinLeave(val: boolean) { this.state.autoAcceptRequestToJoinLeave = val; }
    public set onlyAllowMembersViewMembership(val: boolean) { this.state.onlyAllowMembersViewMembership = val; }

    public hasMetadataChanges(): boolean {
        if (this.isNew) {
            return true;
        } else if (this.hasSnapshot) {
            const { members: membersOriginal, ...metadataOriginal } = this.originalState;
            const { members, ...metadata } = this.state;

            return !_.isEqual(metadata, metadataOriginal);
        } else {
            return false;
        }
    }

    public hasMembershipChanges(): boolean {
        return this.hasSnapshot && !_.isEqual(this.state.members, this.originalState.members);
    }

    public membersDifference(): UserListChange[] {
        return this.usersDifference(state => state.members);
    }
}