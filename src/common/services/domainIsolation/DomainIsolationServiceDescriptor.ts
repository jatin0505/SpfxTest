import { Item } from "@pnp/sp";
import { IService } from "../IService";
import { IServiceDescriptor } from "../IServiceDescriptor";
import { OnlineDomainIsolationService } from "./OnlineDomainIsolationService";
import { MockDomainIsolationService } from "./MockDomainIsolationService";

export const DomainIsolationService: unique symbol = Symbol("Domain Isolation Service");

export interface IDomainIsolationService extends IService {
    readonly originalUrl: string;
    readonly currentSitePrimaryUrl: string;
    readonly currentPageListItem: Item;
    readonly currentPageRelativeUrl: string;
    convertToAppDomainUrl(url: string): string;
    convertToPrimaryUrl(url: string): string;
    siteCompositeId(url: string): Promise<string>;
}

export type DomainIsolationServiceProp = {
    [DomainIsolationService]: IDomainIsolationService;
};

export const DomainIsolationServiceDescriptor: IServiceDescriptor<typeof DomainIsolationService, IDomainIsolationService, DomainIsolationServiceProp> = {
    symbol: DomainIsolationService,
    dependencies: [],
    online: OnlineDomainIsolationService,
    local: MockDomainIsolationService
};