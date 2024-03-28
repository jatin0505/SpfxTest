import _ from 'lodash';
import { Entity } from "./Entity";

export abstract class Loader<E extends Entity<any>> {
    protected readonly _trackedEntities: E[] = [];
    protected readonly _entities: E[] = [];
    protected readonly _entitiesById: Map<number, E> = new Map<number, E>();

    public abstract entitiesById(): Promise<ReadonlyMap<number, E>>;

    public get entitiesWithChanges(): readonly E[] {
        return [
            ...this._trackedEntities,
            ...this._entities.filter(e => e.hasChanges())
        ];
    }

    public track(entity: E): void {
        if (!_.includes(this._trackedEntities, entity) && !_.includes(this._entities, entity)) {
            this._trackedEntities.push(entity);
        }
    }

    protected untrack(entity: E): void {
        _.remove(this._trackedEntities, entry => entry === entity);
    }

    public async persist(): Promise<void> {
        const previous = this._previousPersistPromise;
        await (this._previousPersistPromise = (async () => {
            await previous;
            await this.persistCore();
        })());
    }
    protected _previousPersistPromise: Promise<any> = Promise.resolve();

    protected abstract persistCore(): Promise<void>;

    protected readonly refreshEntityCollections = (): void => {
        _.remove(this._entities, entity => !entity.softDeleteSupported && entity.isDeleted);

        const committed = _.remove(this._trackedEntities, e => !e.isNew);
        this._entities.push(...committed);

        this._entitiesById.clear();
        this._entities.forEach(entity => {
            this._entitiesById.set(entity.id, entity);
        });
    }
}