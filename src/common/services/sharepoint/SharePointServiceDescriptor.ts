import { SPBatch } from "@pnp/sp";
import { User } from "common";
import { ModeratedUpdateListItem, IListDefinition, ListItemResult, Query, ChoiceFieldValue, ListItemEntity, IViewDefinition } from "common/sharepoint";
import { DirectoryService } from "../directory";
import { IService } from "../IService";
import { IServiceDescriptor } from "../IServiceDescriptor";
import { OnlineSharePointService } from "./OnlineSharePointService";
import { IPagedListDataStream } from "./IPagedListDataStream";

export const SharePointService: unique symbol = Symbol("SharePoint Service");

export type UpdateListItemClass<T> = new (entity: T) => {} | ModeratedUpdateListItem;

export interface ISharePointService extends IService {
    registerListForPreflight(listDefinition: IListDefinition): void;
    registerViewForPreflight(viewDefinition: IViewDefinition): void;
    preflightSchema(): Promise<void>;

    preflightEnsureUsers(principals: User[]): Promise<void>;

    pagedListItems<TRow extends ListItemResult, T>(
        viewDefinition: IViewDefinition,
        search: string,
        rowMap: (row: TRow) => T | Promise<T>,
        datesInUtc?: boolean
    ): Promise<IPagedListDataStream<T>>;

    listItems<TRow extends ListItemResult, T>(
        listDefinition: IListDefinition,
        rowLimit: number,
        viewFields: string[],
        query: Query,
        rowMap: (row: TRow) => T,
        datesInUtc?: boolean
    ): Promise<T[]>;

    serverRelativeListItems<TRow extends ListItemResult, T>(
        listDefinition: IListDefinition,
        folderServerRelativeUrl: string,
        recursive: boolean,
        rowLimit: number,
        viewFields: string[],
        query: Query,
        rowMap: (row: TRow) => T,
        datesInUtc?: boolean
    ): Promise<T[]>;

    listItemsAsMap<TRow extends ListItemResult, T, K>(listDefinition: IListDefinition, rowLimit: number, viewFields: string[], keyFn: (item: T) => K, rowMap: (row: TRow) => T): Promise<Map<K, T>>;

    field<T>(fieldName: string, listDefinition?: IListDefinition): Promise<T>;

    fieldChoices<T extends ChoiceFieldValue>(
        choiceFieldValueType: { new(name: string): T },
        fieldName: string,
        listDefinition?: IListDefinition
    ): Promise<T[]>;

    fieldChoicesAsMap<T extends ChoiceFieldValue>(choiceFieldValueType: { new(name: string): T }, fieldName: string, listDefinition?: IListDefinition): Promise<Map<string, T>>;

    persistEntity<T extends ListItemEntity<any>>(entity: T, listDefinition: IListDefinition, UpdateListItem: UpdateListItemClass<T>, batch?: SPBatch): Promise<any>;
}

export type SharePointServiceProp = {
    [SharePointService]: ISharePointService;
};

export const SharePointServiceDescriptor: IServiceDescriptor<typeof SharePointService, ISharePointService, SharePointServiceProp> = {
    symbol: SharePointService,
    dependencies: [DirectoryService],
    online: OnlineSharePointService
};
