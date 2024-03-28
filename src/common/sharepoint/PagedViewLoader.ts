import _ from 'lodash';
import { sp } from "@pnp/sp";
import { ErrorHandler, User } from "common";
import { ISharePointService, IPagedListDataStream, UpdateListItemClass } from 'common/services';
import { Loader } from "../Loader";
import { IViewDefinition } from "./schema/IElementDefinitions";
import { ListItemResult } from "./query/ListItemResult";
import { ListItemEntity } from "./ListItemEntity";

export abstract class PagedViewLoader<E extends ListItemEntity<any>> extends Loader<E> {
    private _ensureLoadedPromise: Promise<void> = null;

    constructor(
        public readonly view: IViewDefinition,
        protected readonly repo: ISharePointService
    ) {
        super();

        repo.registerListForPreflight(view.list);
        repo.registerViewForPreflight(view);
    }

    protected abstract readonly toEntity: (row: ListItemResult) => E | Promise<E>;
    protected abstract readonly updateListItem: UpdateListItemClass<E>;

    protected readonly prepareToLoadEntities: () => Promise<void> = async () => { };
    protected readonly extractReferencedUsers: (entity: E) => User[] = () => [];

    public readonly all = async (): Promise<E[]> => {
        await this.ensureLoaded();
        return this._entities;
    }

    public readonly getById = async (id: number): Promise<E> => {
        await this.ensureLoaded();
        return this._entitiesById.get(id);
    }

    public async entitiesById(): Promise<ReadonlyMap<number, E>> {
        await this.ensureLoaded();
        return this._entitiesById;
    }

    public async ensureLoaded(progressCallback: () => void = _.noop): Promise<void> {
        await (this._ensureLoadedPromise = (this._ensureLoadedPromise || this._loadEntities(progressCallback)));
    }

    protected async persistCore(): Promise<void> {
        const referencedUsers = _.flatten(this.entitiesWithChanges.map(this.extractReferencedUsers));
        await this.repo.preflightEnsureUsers(referencedUsers);

        const eh = new ErrorHandler();
        const batch = sp.web.createBatch();

        const persistEntity = (entity: E) =>
            this.repo.persistEntity(entity, this.view.list, this.updateListItem, batch)
                .catch(() => {
                    if (entity.isNew) this.untrack(entity);
                });

        const persistPromise = Promise.all(this.entitiesWithChanges.map(persistEntity));
        const refreshEntityCollectionsPromise = persistPromise.then(this.refreshEntityCollections);

        await batch.execute();
        eh.throwIfError();

        await refreshEntityCollectionsPromise;
    }

    private async _loadEntities(progressCallback: () => void): Promise<void> {
        await this.prepareToLoadEntities();

        const toEntityIgnoreAlreadyLoaded = (row: ListItemResult) => {
            const id = parseInt(row.ID, 10);
            return !this._entitiesById.has(id) ? this.toEntity(row) : null;
        };

        return new Promise((resolve, reject) => {
            let modelsPagedPromise = this.repo.pagedListItems(this.view, null, toEntityIgnoreAlreadyLoaded);

            const fetchPage = () => modelsPagedPromise.then((stream: IPagedListDataStream<E>) => {
                this._entities.push(...stream.results.filter(Boolean));
                stream.results.filter(Boolean).forEach(r => this._entitiesById.set(r.id, r));
                if (stream.hasNext) {
                    progressCallback();
                    modelsPagedPromise = stream.next();
                    fetchPage();
                } else {
                    resolve();
                }
            }, reject);

            fetchPage();
        });
    }
}