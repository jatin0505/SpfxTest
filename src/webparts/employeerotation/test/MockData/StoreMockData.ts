import { User } from "common";
import { Store, StoreStatus } from "model";
import moment from "moment-timezone";

let storesMock = [{
    title: "Store 1",
    description: "0001 Store",
    closeDate: moment(new Date()).add(10, "weeks"),
    storeCode: "0001",
    storeStatus: "Open",
    costCenter: "0001",
    storeNumber: "0001",
    storeMailingAddress: "",
    country: "Canada",
    city: "Canada",
    market: "Canada",
    stateProvince: "Canada",
    storeManager: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    territoryManager: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    ID: 1,
    author: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    editor: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    created: new Date("10/12/2020"),
    modified: new Date("10/12/2020"),
}
];

const toStore = (row: any): Store => {
    let store: Store = null;
    try {
        store = new Store(row.Author, row.Editor, row.Created, row.Modified, parseInt(row.ID, 10));
        store.title = row.Title;
        store.storeDescription = row.Description;
        store.closedDate = row.closeDate;

        store.storeCode = row.storeCode;
        store.storeStatus = StoreStatus.fromName(row.storeStatus);
        store.costCenter = row.costCenter;
        store.storeNumber = row.storeNumber;
        store.storeMailingAddress = row.storeMailingAddress;
        store.storeManager = row.storeManager;
        store.territoryManager = row.territoryManager;
        store.country = row.country;
        store.city = row.City;
        store.market = row.Market;
        store.stateProvince = row.stateProvince;


    } catch (e) {
        console.warn(e);
    }
    return store;

};

export const getStores = (): Store[] => {
    return storesMock.map(store => toStore(store));
};