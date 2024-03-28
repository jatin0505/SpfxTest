import { Entity, IEntity } from "../Entity";
import { User } from "../User";

export interface IListItemEntity extends IEntity {
    readonly title: string;
    readonly created: Date;
    readonly modified: Date;
    readonly author: User;
    readonly editor: User;
}

export interface IEntityState {
    title: string;
    created: Date;
    modified: Date;
    author: User;
    editor: User;
}

export abstract class ListItemEntity<S> extends Entity<S & IEntityState> {
    constructor(author: User, editor?: User, created?: Date, modified?: Date, id: number = 0) {
        super(id);
        this.state.title = "";
        this.state.created = created || new Date();
        this.state.modified = modified || this.state.created;
        this.state.author = author;
        this.state.editor = editor || this.state.author;
    }

    public get title(): string { return this.state.title; }
    public get created(): Date { return this.state.created; }
    public get modified(): Date { return this.state.modified; }
    public get author(): User { return this.state.author; }
    public get editor(): User { return this.state.editor; }

    public set title(val: string) { this.state.title = val; }

    public get displayName(): string {
        return this.title;
    }

    public immortalize() {
        this.state.modified = new Date();
        super.immortalize();
    }

    public setId(id: number) {
        if (this.isNew) {
            this.state.created = new Date();
        }
        super.setId(id);
    }

    public setAuthor(author: User) {
        if (!this.state.author) {
            this.state.author = author;
            this.state.editor = author;
        }
    }
}

export abstract class SoftDeleteListItemEntity<S> extends ListItemEntity<S> {
    constructor(author: User, editor?: User, created?: Date, modified?: Date, id: number = 0) {
        super(author, editor, created, modified, id);
    }

    public get softDeleteSupported(): boolean {
        return true;
    }
}