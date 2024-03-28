import { PagedViewLoader, ListItemResult, SPField } from 'common/sharepoint';
import { ISharePointService } from "common/services";
import { FocusArea, Store, StoreStatus } from "model";
import { IEmployeeRotationSchema } from "schema";
import moment from "moment-timezone";

export class TeamRoasterUpdateListItem {
    constructor(focusArea: FocusArea) {
    }
}

class FocusAreaListItemResult extends ListItemResult {
    public readonly Managers: SPField.Query_UserMulti;
}

const toFocusArea = (row: FocusAreaListItemResult): FocusArea => {
    let focusArea: FocusArea = null;

    try {
        focusArea = new FocusArea(SPField.toUser(row.Author), SPField.toUser(row.Editor), new Date(row.Created), new Date(row.Modified), parseInt(row.ID, 10));
        focusArea.title = row.Title;
        focusArea.managers = SPField.toUsers(row.Managers);
    } catch (e) {
        console.warn(e);
    }
    return focusArea;
};



export class FocusAreaLoader extends PagedViewLoader<FocusArea> {
    constructor(schema: IEmployeeRotationSchema, repo: ISharePointService) {
        super(schema.focusAreaList.view_AllItems, repo);
    }

    protected readonly toEntity = (row: FocusAreaListItemResult) =>
        toFocusArea(row)
    protected readonly updateListItem = TeamRoasterUpdateListItem;
}


export class StoreUpdateListItem {
    constructor(store: Store) {
    }
}

class StoreListItemResult extends ListItemResult {
    public readonly City: SPField.Query_Text;
    public readonly ClosedDate: SPField.Query_DateTime;
    public readonly CostCenter: SPField.Query_Text;
    public readonly Country: SPField.Query_Text;
    public readonly Market: SPField.Query_Text;
    public readonly StoreCode: SPField.Query_Text;
    public readonly StoreDescription: SPField.Query_Text;
    public readonly StoreMailingAddress: SPField.Query_Text;
    public readonly StoreManager: SPField.Query_User;
    public readonly Territory_x0020_Manager: SPField.Query_User;
    public readonly StoreNumber: SPField.Query_Text;
    public readonly StoreStatus: SPField.Query_Choice;
    public readonly StateProvince: SPField.Query_Text;
}

const toStore = (row: StoreListItemResult): Store => {
    let store: Store = null;

    try {
        store = new Store(SPField.toUser(row.Author), SPField.toUser(row.Editor), new Date(row.Created), new Date(row.Modified), parseInt(row.ID, 10));

        store.title = row.Title;
        store.city = row.City;
        store.closedDate = moment(row.ClosedDate);
        store.costCenter = row.CostCenter;
        store.country = row.Country;
        store.market = row.Market;
        store.storeCode = row.StoreCode;
        store.storeDescription = row.StoreDescription;
        store.storeMailingAddress = row.StoreMailingAddress;
        store.storeManager = SPField.toUser(row.StoreManager);
        store.territoryManager = SPField.toUser(row.Territory_x0020_Manager);
        store.storeNumber = row.StoreNumber;
        store.storeStatus = StoreStatus.fromName(row.StoreStatus);
        store.stateProvince = row.StateProvince;
    } catch (e) {
        console.warn(e);
    }
    return store;
};



export class StoreLoader extends PagedViewLoader<Store> {
    constructor(schema: IEmployeeRotationSchema, repo: ISharePointService) {
        super(schema.storeList.view_AllStores, repo);
    }

    protected readonly toEntity = (row: StoreListItemResult) =>
        toStore(row)
    protected readonly updateListItem = StoreUpdateListItem;
}