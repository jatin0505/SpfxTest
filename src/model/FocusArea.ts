import _ from 'lodash';
import { User, ValidationRule } from "common";
import { ListItemEntity } from "common/sharepoint";

class State {
    public managers: User[];
}

export class FocusArea extends ListItemEntity<State> {

    constructor(author?: User, editor?: User, created?: Date, modified?: Date, id?: number) {
        super(author, editor, created, modified, id);

        this.state.managers = null;
    }

    public get managers(): User[] { return this.state.managers; }
    public set managers(val: User[]) { this.state.managers = val; }

    protected validationRules(): ValidationRule<FocusArea>[] {
        return [
        ];
    }

}

export type FocusAreaMap = Map<number, FocusArea>;
export type ReadonlyFocusAreaMap = ReadonlyMap<number, FocusArea>;
