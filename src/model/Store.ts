import _ from 'lodash';
import { User, ValidationRule } from "common";
import { ListItemEntity } from "common/sharepoint";
import { Moment } from 'moment-timezone';
import { StoreStatus } from './StoreStatus';

class State {
    public city: string;
    public closedDate: Moment;
    public costCenter: string;
    public country: string;
    public market: string;
    public storeCode: string;
    public storeDescription: string;
    public storeMailingAddress: string;
    public storeManager: User;
    public territoryManager: User;
    public storeNumber: string;
    public storeStatus: StoreStatus;
    public stateProvince: string;
}

export class Store extends ListItemEntity<State> {

    constructor(author?: User, editor?: User, created?: Date, modified?: Date, id?: number) {
        super(author, editor, created, modified, id);

        this.state.city = null;
        this.state.closedDate = null;
        this.state.costCenter = null;
        this.state.country = null;
        this.state.market = null;
        this.state.storeCode = null;
        this.state.storeDescription = null;
        this.state.storeMailingAddress = null;
        this.state.storeManager = null;
        this.state.territoryManager = null;
        this.state.storeNumber = null;
        this.state.storeStatus = null;
        this.state.stateProvince = null;
    }

    public get city(): string { return this.state.city; }
    public get closedDate(): Moment { return this.state.closedDate; }
    public get costCenter(): string { return this.state.costCenter; }
    public get country(): string { return this.state.country; }
    public get market(): string { return this.state.market; }
    public get storeCode(): string { return this.state.storeCode; }
    public get storeDescription(): string { return this.state.storeDescription; }
    public get storeMailingAddress(): string { return this.state.storeMailingAddress; }
    public get storeManager(): User { return this.state.storeManager; }
    public get territoryManager(): User { return this.state.territoryManager; }
    public get storeNumber(): string { return this.state.storeNumber; }
    public get storeStatus(): StoreStatus { return this.state.storeStatus; }
    public get stateProvince(): string { return this.state.stateProvince; }

    public set city(val: string) { this.state.city = val; }
    public set closedDate(val: Moment) { this.state.closedDate = val; }
    public set costCenter(val: string) { this.state.costCenter = val; }
    public set country(val: string) { this.state.country = val; }
    public set market(val: string) { this.state.market = val; }
    public set storeCode(val: string) { this.state.storeCode = val; }
    public set storeDescription(val: string) { this.state.storeDescription = val; }
    public set storeMailingAddress(val: string) { this.state.storeMailingAddress = val; }
    public set storeManager(val: User) { this.state.storeManager = val; }
    public set territoryManager(val: User) { this.state.territoryManager = val; }
    public set storeNumber(val: string) { this.state.storeNumber = val; }
    public set storeStatus(val: StoreStatus) { this.state.storeStatus = val; }
    public set stateProvince(val: string) { this.state.stateProvince = val; }

    protected validationRules(): ValidationRule<Store>[] {
        return [
        ];
    }

}

export type StoreMap = Map<number, Store>;
export type ReadonlyStoreMap = ReadonlyMap<number, Store>;
