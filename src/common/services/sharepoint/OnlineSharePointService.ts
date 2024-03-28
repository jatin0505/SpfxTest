import _ from 'lodash';
import { sp, List, Web, Items, ItemAddResult, SPBatch, RenderListDataParameters, RenderListDataOptions } from "@pnp/sp";
import { User, ErrorHandler, setToArray } from "common";
import { ChoiceFieldResult, ListDataResult, ListItemResult, ViewResult, IListDefinition, ModeratedUpdateListItem, ChoiceFieldValue, ListItemEntity, Query, ModerationStatus, IViewDefinition } from "common/sharepoint";
import { IDirectoryService, DirectoryService, DirectoryServiceProp } from "../directory";
import { ServiceContext } from "../IService";
import { fixSPBatchParser } from "./fixSPBatchParser";
import { IPagedListDataStream } from "./IPagedListDataStream";
import { ListDataAsStream } from "./ListDataAsStream";
import { ISharePointService, UpdateListItemClass } from "./SharePointServiceDescriptor";

const PendingStatusUpdateListItem: ModeratedUpdateListItem = {
    OData__ModerationStatus: ModerationStatus.Pending.value
};
function isPendingModeratedItem(updateListItem: any): updateListItem is ModeratedUpdateListItem {
    if (updateListItem instanceof ModeratedUpdateListItem)
        return updateListItem.OData__ModerationStatus == ModerationStatus.Pending.value;
    else
        return false;
}

const listFromTitle = (listTitle: string, siteUrl?: string): List =>
    (siteUrl ? new Web(siteUrl) : sp.web).lists.getByTitle(listTitle);

const listFromDefinition = (listDefinition: IListDefinition, siteUrl?: string): List =>
    listFromTitle(listDefinition.title, siteUrl);

const preflightRegisteredLists = new Set<IListDefinition>();
const listItemEntityTypeFullNameCache = new Map<IListDefinition, string>();

const preflightRegisteredViews = new Set<IViewDefinition>();
const listViewCache = new Map<IViewDefinition, ViewResult>();

export class OnlineSharePointService implements ISharePointService {
    private readonly _directory: IDirectoryService;

    constructor({
        [DirectoryService]: directory,
    }: ServiceContext<DirectoryServiceProp>) {
        this._directory = directory;
    }

    public async initialize() {
        fixSPBatchParser();
    }

    public registerListForPreflight(listDefinition: IListDefinition) {
        preflightRegisteredLists.add(listDefinition);
    }

    public registerViewForPreflight(viewDefinition: IViewDefinition) {
        preflightRegisteredViews.add(viewDefinition);
    }

    public async preflightSchema(): Promise<void> {
        const eh = new ErrorHandler();
        const batch = sp.web.createBatch();

        const lietfnPromises = setToArray(preflightRegisteredLists).map(async listDefinition => {
            if (!listItemEntityTypeFullNameCache.has(listDefinition)) {
                await listFromDefinition(listDefinition).select('ListItemEntityTypeFullName')
                    .inBatch(batch).get()
                    .then(result => listItemEntityTypeFullNameCache.set(listDefinition, result.ListItemEntityTypeFullName));
            }
        });

        const viewPromises = setToArray(preflightRegisteredViews).map(async viewDefinition => {
            if (!listViewCache.has(viewDefinition)) {
                await listFromDefinition(viewDefinition.list)
                    .views.getByTitle(viewDefinition.title).inBatch(batch).get<ViewResult>()
                    .then(view => listViewCache.set(viewDefinition, view));
            }
        });

        await batch.execute();
        await Promise.all(lietfnPromises);
        await Promise.all(viewPromises);
        eh.throwIfError();
    }

    public async preflightEnsureUsers(principals: User[]): Promise<void> {
        await this._directory.ensureUsers(principals);
    }

    public async pagedListItems<TRow extends ListItemResult, T>(
        viewDefinition: IViewDefinition,
        search: string,
        rowMap: (row: TRow) => T | Promise<T>,
        datesInUtc: boolean = undefined
    ): Promise<IPagedListDataStream<T>> {

        const renderParams: RenderListDataParameters = {
            DatesInUtc: datesInUtc,
            RenderOptions: RenderListDataOptions.ListData
        };

        const list = listFromDefinition(viewDefinition.list);
        const view = listViewCache.get(viewDefinition) || await list.views.getByTitle(viewDefinition.title).get<ViewResult>();

        return ListDataAsStream.beginStream(list, view, search, renderParams, null, rowMap);
    }

    public async listItems<TRow extends ListItemResult, T>(
        listDefinition: IListDefinition,
        rowLimit: number,
        viewFields: string[],
        query: Query,
        rowMap: (row: TRow) => T,
        datesInUtc: boolean = undefined
    ): Promise<T[]> {
        return this.serverRelativeListItems(listDefinition, undefined, false, rowLimit, viewFields, query, rowMap, datesInUtc);
    }

    public async serverRelativeListItems<TRow extends ListItemResult, T>(
        listDefinition: IListDefinition,
        folderServerRelativeUrl: string,
        recursive: boolean,
        rowLimit: number,
        viewFields: string[],
        query: Query,
        rowMap: (row: TRow) => T,
        datesInUtc: boolean = undefined
    ): Promise<T[]> {
        const queryXml: string = query ? `<Query>${query.caml}</Query>` : "";
        const viewFieldXml: string = viewFields.map(field => `<FieldRef Name='${field}' />`).join("");
        const rowLimitXml: string = `<RowLimit>${rowLimit}</RowLimit>`;
        const scope: string = recursive ? `Scope='Recursive'` : ``;
        let params: RenderListDataParameters = {
            ViewXml: `<View ${scope}>${queryXml}<ViewFields>${viewFieldXml}</ViewFields>${rowLimitXml}</View>`,
            RenderOptions: RenderListDataOptions.ListData,
            FolderServerRelativeUrl: folderServerRelativeUrl,
            DatesInUtc: datesInUtc
        };

        const list = listFromDefinition(listDefinition);
        const data: ListDataResult<TRow> = await list.renderListDataAsStream(params);
        return data.Row.map(row => rowMap(row));
    }

    public async listItemsAsMap<TRow extends ListItemResult, T, K>(listDefinition: IListDefinition, rowLimit: number, viewFields: string[], keyFn: (item: T) => K, rowMap: (row: TRow) => T): Promise<Map<K, T>> {
        const mapKeyValuePair = (item: T) => [keyFn(item), item] as [K, T];
        const items = await this.listItems(listDefinition, rowLimit, viewFields, Query.none, rowMap);
        return new Map<K, T>(items.map(mapKeyValuePair));
    }

    public field<T>(fieldName: string, listDefinition?: IListDefinition): Promise<T> {
        const fields = listDefinition ? listFromDefinition(listDefinition).fields : sp.web.fields;
        return fields.getByInternalNameOrTitle(fieldName).get<T>();
    }

    public async fieldChoices<T extends ChoiceFieldValue>(
        choiceFieldValueType: { new(name: string): T },
        fieldName: string,
        listDefinition?: IListDefinition
    ): Promise<T[]> {
        const field = await this.field<ChoiceFieldResult>(fieldName, listDefinition);
        return field.Choices.map(choice => new choiceFieldValueType(choice));
    }

    public async fieldChoicesAsMap<T extends ChoiceFieldValue>(choiceFieldValueType: { new(name: string): T }, fieldName: string, listDefinition?: IListDefinition): Promise<Map<string, T>> {
        const mapKeyValuePair = (choice: T) => [choice.name, choice] as [string, T];
        const choices = await this.fieldChoices(choiceFieldValueType, fieldName, listDefinition);
        return new Map<string, T>(choices.map(mapKeyValuePair));
    }

    public async persistEntity<T extends ListItemEntity<any>>(entity: T, listDefinition: IListDefinition, UpdateListItem: UpdateListItemClass<T>, batch?: SPBatch): Promise<any> {
        let entityPromise: Promise<any> = Promise.resolve();

        if (entity.hasChanges()) {
            const items = listFromDefinition(listDefinition).items;

            if (entity.isDeleted && !entity.softDeleteSupported && !entity.isNew) {
                const listItem = items.getById(entity.id);
                const batchedItem = (batch ? listItem.inBatch(batch) : listItem);
                entityPromise = batchedItem.delete();
            }
            else if (!entity.isDeleted || entity.softDeleteSupported) {
                const listItemEntityTypeFullName = listItemEntityTypeFullNameCache.get(listDefinition);
                const updateListItem = new UpdateListItem(entity);

                if (entity.isNew) {
                    const batchedItems = (batch ? new Items(items, '').inBatch(batch) : items);
                    entityPromise = batchedItems.add(updateListItem, listItemEntityTypeFullName).then((result: ItemAddResult) => {
                        entity.setAuthor(this._directory.currentUser);
                        entity.setId(result.data.ID);
                    });
                }
                else {
                    const item = items.getById(entity.id);
                    const batchedItem = batch ? item.inBatch(batch) : item;

                    // Need to force the item in to Pending status if the list uses moderation,
                    // otherwise a new draft version will be created rather than replacing the existing approved version
                    if (isPendingModeratedItem(updateListItem)) {
                        entityPromise = batchedItem.update(PendingStatusUpdateListItem, undefined, listItemEntityTypeFullName);
                        updateListItem.OData__ModerationStatus = undefined;

                        if (!batch) await entityPromise;
                    }

                    entityPromise = batchedItem.update(updateListItem, undefined, listItemEntityTypeFullName);
                }
            }
        }

        return entityPromise;
    }
}