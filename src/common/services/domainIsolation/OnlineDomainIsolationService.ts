import { Item, sp, Site, Web } from "@pnp/sp";
import { SiteResult, FileResult } from "../../sharepoint";
import { currentPageServerRelativeUrl, isExecutingInWorkbench, isExecutingInTeamsTab } from "../../Utils";
import { IDomainIsolationService } from "./DomainIsolationServiceDescriptor";

export class OnlineDomainIsolationService implements IDomainIsolationService {
    public readonly originalUrl: string;

    private _currentSitePrimaryUrl: string;
    private _currentPageListItem: Item;
    private _currentPageRelativeUrl: string;

    constructor() {
        this.originalUrl = window.location.href;
    }

    public async initialize(): Promise<void> {
        this._currentSitePrimaryUrl = (await sp.site.get<SiteResult>()).PrimaryUri;

        const url = new URL(this.originalUrl);

        if (url.pathname.includes("/_layouts/15/webpart.aspx")) {
            if (url.searchParams.has("list") && url.searchParams.has("id")) {
                // executing inside isolated domain iframe - get list and item id for current page from the query string
                const listId = url.searchParams.get("list");
                const itemId = parseInt(url.searchParams.get("id"), 10);
                this._currentPageListItem = sp.web.lists.getById(listId).items.getById(itemId);
            } else {
                this._currentPageListItem = null;
            }
        } else if (!isExecutingInWorkbench() && !isExecutingInTeamsTab()) {
            const currentPageRelativeUrl = await currentPageServerRelativeUrl();
            this._currentPageListItem = await sp.web.getFileByServerRelativeUrl(currentPageRelativeUrl).getItem();
        }

        if (isExecutingInWorkbench() || !this._currentPageListItem)
            this._currentPageRelativeUrl = url.pathname;
        else
            this._currentPageRelativeUrl = (await this._currentPageListItem.file.get<FileResult>()).ServerRelativeUrl;
    }

    public get currentSitePrimaryUrl(): string {
        return this._currentSitePrimaryUrl;
    }

    public get currentPageRelativeUrl(): string {
        return this._currentPageRelativeUrl;
    }

    public get currentPageListItem(): Item {
        return this._currentPageListItem && this._currentPageListItem.as(Item); // clone the Item so callers can't modify this._currentPageListItem
    }

    public convertToAppDomainUrl(url: string): string {
        const original = new URL(url, this.originalUrl);
        return new URL(original.pathname + original.search, this.originalUrl).toString();
    }

    public convertToPrimaryUrl(url: string): string {
        const original = new URL(url, this._currentSitePrimaryUrl);
        return new URL(original.pathname + original.search, this._currentSitePrimaryUrl).toString();
    }

    public async siteCompositeId(url: string): Promise<string> {
        const appDomainUrl = this.convertToAppDomainUrl(url);
        const primaryUrl = this.convertToPrimaryUrl(url);

        const [site, web] = await Promise.all([
            new Site(appDomainUrl).select("Id").get(),
            new Web(appDomainUrl).select("Id,Url").get()
        ]);

        const hostName = new URL(primaryUrl).hostname;
        return `${hostName},${site.Id},${web.Id}`;
    }
}