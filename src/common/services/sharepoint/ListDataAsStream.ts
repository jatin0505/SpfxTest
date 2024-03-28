import { extend } from "@pnp/common";
import { SharePointQueryable, RenderListDataParameters } from "@pnp/sp";
import { ListDataResult, ListItemResult, ViewResult } from '../../sharepoint';
import { IPagedListDataStream } from "./IPagedListDataStream";

export class ListDataAsStream<T, TRow extends ListItemResult> extends SharePointQueryable implements IPagedListDataStream<T> {
    public static beginStream<T, TRow extends ListItemResult>(base: SharePointQueryable, view: ViewResult, search: string, parameters: RenderListDataParameters, overrideParameters: any, rowMap: (row: TRow) => T | Promise<T>): Promise<IPagedListDataStream<T>> {
        const renderListDataAsStreamQueryable = new SharePointQueryable(base, "RenderListDataAsStream");
        const listDataAsStream = new ListDataAsStream<T, TRow>(
            renderListDataAsStreamQueryable, view, search, parameters, overrideParameters, rowMap);
        return listDataAsStream._renderPage();
    }

    private _view: ViewResult;
    private _search: string;
    private _parameters: RenderListDataParameters;
    private _overrideParameters: any;
    private _rowMap: (row: TRow) => T | Promise<T>;
    private _nextPageHref: string;
    private _previousPageHref: string;
    private _results: T[];

    constructor(base: SharePointQueryable, view: ViewResult, search: string, parameters: RenderListDataParameters, overrideParameters: any, rowMap: (row: TRow) => T | Promise<T>, next?: string, prev?: string, results?: T[]) {
        super(base);

        parameters.ViewXml = parameters.ViewXml || view.ListViewXml;

        this._view = view;
        this._search = search;
        this._parameters = parameters;
        this._overrideParameters = overrideParameters;
        this._rowMap = rowMap;
        this._nextPageHref = next;
        this._previousPageHref = prev;
        this._results = results;
    }

    public get hasNext(): boolean {
        return this._nextPageHref != null && this._nextPageHref.length > 0;
    }

    public get hasPrevious(): boolean {
        return this._previousPageHref != null && this._previousPageHref.length > 0;
    }

    public get results(): T[] {
        return this._results;
    }

    public next(): Promise<IPagedListDataStream<T>> {
        if (this.hasNext) {
            return this._renderPage(this._nextPageHref);
        } else {
            return Promise.resolve(this);
        }
    }

    public previous(): Promise<IPagedListDataStream<T>> {
        if (this.hasPrevious) {
            return this._renderPage(this._previousPageHref);
        } else {
            return Promise.resolve(this);
        }
    }

    private _renderPage(pagingHref?: string): Promise<IPagedListDataStream<T>> {
        const postBody = {
            overrideParameters: extend({
                "__metadata": { "type": "SP.RenderListDataOverrideParameters" }
            }, this._overrideParameters),
            parameters: extend({
                "__metadata": { "type": "SP.RenderListDataParameters" },
            }, this._parameters)
        };

        if (this._search && this._search.length > 0) {
            this.query.set("InplaceSearchQuery", encodeURIComponent(this._search));
        }

        if (pagingHref) {
            const pagingKeyValuePairs = (pagingHref || "").split("&");
            pagingKeyValuePairs.forEach(kvp => {
                let pagingParameterComponents = kvp.split("=");
                this.query.set(pagingParameterComponents[0], pagingParameterComponents[1]);
            });
        }

        this.query.set("View", this._view.Id);

        let self = this;
        return this.postCore({ body: JSON.stringify(postBody) })
            .then(async (data: ListDataResult<TRow>) => {
                const nextPageHref = (data.NextHref || "").slice(1);
                const previousPageHref = (data.PrevHref || "").slice(1);
                const results = await Promise.all(data.Row.map(row => self._rowMap(row)));

                return new ListDataAsStream<T, TRow>(self,
                    self._view, self._search, self._parameters, self._overrideParameters,
                    self._rowMap, nextPageHref, previousPageHref, results);
            });
    }
}