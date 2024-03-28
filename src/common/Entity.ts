import _ from 'lodash';
import { User } from "./User";
import { UserListChange } from "./UserListChange";
import { ValidationRule } from "./ValidationRules";
import { PropsOfType } from './Utils';

interface IEntityState {
    id: number;
    deleted: boolean;
}

export interface IEntity {
    readonly id: number;
    readonly displayName: string;
    readonly isNew: boolean;
    readonly isDeleted: boolean;
    readonly softDeleteSupported: boolean;
    readonly hasSnapshot: boolean;
    hasChanges(): boolean;
    valid(): boolean;
    delete(): void;
    snapshot(): void;
    revert(): void;
    immortalize(persisted: boolean): void;
    isSearchMatch(text: string, matchAllWords?: boolean): boolean;
}

export abstract class Entity<S> implements IEntity {
    public static DisplayNameAscComparer<S>(a: Entity<S>, b: Entity<S>) {
        return a.displayName.localeCompare(b.displayName);
    }
    public static DisplayNameDescComparer<S>(a: Entity<S>, b: Entity<S>) {
        return -Entity.DisplayNameAscComparer(a, b);
    }

    public static notDeletedFilter<S>(entity: Entity<S>): boolean {
        return !entity.isDeleted;
    }

    public static search<E extends Entity<S>, S>(entities: E[], text: string, matchAllWords: boolean = true): E[] {
        if (text) {
            const words = Entity._buildSearchWords(text);
            return entities.filter(entity => entity._isSearchMatchCore(words, matchAllWords));
        } else {
            return entities;
        }
    }

    private static _buildSearchWords(text: string): string[] {
        return text.toLocaleLowerCase().split(' ');
    }

    private readonly _validateRules: ValidationRule<Entity<S>>[];

    private _state: S & IEntityState;
    private _snapshotState: S & IEntityState;
    private _searchHelpers: string[];

    constructor(id: number = 0) {
        this._validateRules = this.validationRules() || [];

        this._state = <S & IEntityState>{
            id: id,
            deleted: false
        };

        this._searchHelpers = [];
    }

    public get id(): number { return this._state.id; }

    public abstract get displayName(): string;

    public get isNew(): boolean {
        return !(this._state.id && this._state.id > 0);
    }

    public get isDeleted(): boolean {
        return this._state.deleted;
    }

    public setId(id: number) {
        if (this.isNew) {
            this._state.id = id;
        }
    }

    public hasChanges(): boolean {
        return (this.hasSnapshot && !_.isEqual(this._state, this._snapshotState)) || (!this.allowGhosting && this.isNew);
    }

    public valid(): boolean {
        return this._validateRules.every(rule => rule.validate(this));
    }

    public delete() {
        this._state.deleted = true;
    }

    public get hasSnapshot(): boolean {
        return !!this._snapshotState;
    }

    public snapshot() {
        if (!this._snapshotState)
            this._snapshotState = { ...this._state };
    }

    public revert() {
        if (this._snapshotState) {
            this._state = this._snapshotState;
            this.immortalize();
            this._createSearchHelpers();
        }
    }

    public immortalize() {
        this._snapshotState = null;
        this._createSearchHelpers();
    }

    public isSearchMatch(text: string, matchAllWords: boolean = true): boolean {
        return text ? this._isSearchMatchCore(Entity._buildSearchWords(text), matchAllWords) : true;
    }

    public get softDeleteSupported(): boolean {
        return false;
    }

    protected get state(): S {
        return this._state;
    }

    protected get originalState(): S {
        return this._snapshotState;
    }

    protected get allowGhosting(): boolean {
        return false;
    }

    protected usersDifference(prop: (state: S) => User[]): UserListChange[] {
        if (this.hasSnapshot) {
            const current = prop(this.state);
            const original = prop(this.originalState);

            return [
                ...User.except(current, original).map(om => new UserListChange(om, 'add')),
                ...User.except(original, current).map(om => new UserListChange(om, 'remove'))
            ];
        } else {
            return [];
        }
    }

    private _createSearchHelpers() {
        this._searchHelpers = [
            this.displayName,
            ...this.buildSearchHelperStrings()
        ].map(str => str && str.toLocaleLowerCase() || '');
    }

    private _searchHelpersContain(text: string) {
        return this._searchHelpers.some(helper => helper.search(text) != -1);
    }

    private _isSearchMatchCore(words: string[], matchAllWords: boolean = true): boolean {
        if (matchAllWords)
            return words.every(word => this._searchHelpersContain(word));
        else
            return words.some(word => this._searchHelpersContain(word));
    }

    protected buildSearchHelperStrings(): string[] { return []; }
    protected validationRules(): ValidationRule<Entity<S>>[] { return []; }
}


type ExtractEntityStateType<E> = E extends Entity<infer S> ? S : never;

export interface IOneToManyRelationship<TChild> {
    get(): ReadonlyArray<TChild>;
    add(entity: TChild): void;
    remove(entity: TChild): void;
}

export interface IManyToOneRelationship<TParent> {
    get(): TParent;
    set(val: TParent): void;
}

export class OneToManyRelationship<TParent extends Entity<any>, TChild extends Entity<any>> implements IOneToManyRelationship<TChild> {
    public static create<TParent extends Entity<any>, TChild extends Entity<any>>(
        parent: TParent,
        property: PropsOfType<TChild, IManyToOneRelationship<TParent>>
    ): IOneToManyRelationship<TChild> {
        return new OneToManyRelationship<TParent, TChild>(parent, property);
    }

    private _items: TChild[] = [];

    private constructor(
        private readonly _parent: TParent,
        private readonly _property: PropsOfType<TChild, IManyToOneRelationship<TParent>>
    ) { }

    public get(): ReadonlyArray<TChild> {
        return this._items;
    }

    public add(entity: TChild) {
        if (!_.includes(this._items, entity)) {
            this._items.push(entity);
            this._parentRelationship(entity).set(this._parent);
        }
    }

    public remove(entity: TChild): void {
        _.remove(this._items, item => item === entity)
            .map(this._parentRelationship)
            .map(r => r.set(null));
    }

    private _parentRelationship = (entity: TChild): IManyToOneRelationship<TParent> => {
        return (entity as any)[this._property];
    }
}

export class ManyToOneRelationship<TChild extends Entity<any>, TParent extends Entity<any>> implements IManyToOneRelationship<TParent> {
    public static create<TChild extends Entity<any>, TParent extends Entity<any>>(
        entity: TChild,
        stateProperty: keyof ExtractEntityStateType<TChild>,
        childCollectionProperty: PropsOfType<TParent, IOneToManyRelationship<TChild>>
    ): IManyToOneRelationship<TParent> {
        return new ManyToOneRelationship<TChild, TParent>(entity, stateProperty, childCollectionProperty);
    }

    private constructor(
        private readonly _entity: TChild,
        private readonly _stateProperty: keyof ExtractEntityStateType<TChild>,
        private readonly _childCollectionProperty: PropsOfType<TParent, IOneToManyRelationship<TChild>>
    ) { }

    public get(): TParent {
        return this._entity['state'][this._stateProperty] as TParent;
    }

    public set(val: TParent) {
        const current = this.get();

        if (current !== val) {
            this._entity['state'][this._stateProperty] = val;

            if (!!current) {
                this._childRelationship(current).remove(this._entity);
            }

            if (val) {
                this._childRelationship(val).add(this._entity);
            }
        }
    }

    private _childRelationship = (entity: TParent): IOneToManyRelationship<TChild> => {
        return (entity as any)[this._childCollectionProperty];
    }
}