import { DateTimeFieldFormatType, RoleType } from "@pnp/sp";
import {
    IListDefinition, IFieldDefinition, FieldType, IViewDefinition,
    RoleOperation, includeStandardViewFields
} from "common/sharepoint";
import { StoreStatus } from "model/StoreStatus";
import { Defaults } from "../Defaults";

const Field_City: IFieldDefinition = {
    name: 'City',
    displayName: "City",
    type: FieldType.Text
};

const Field_ClosedDate: IFieldDefinition = {
    name: 'ClosedDate',
    displayName: "Closed Date",
    type: FieldType.DateTime,
    dateTimeFormat: DateTimeFieldFormatType.DateTime,
};

const Field_CostCenter: IFieldDefinition = {
    name: 'CostCenter',
    displayName: "Cost Center",
    type: FieldType.Text
};

const Field_Country: IFieldDefinition = {
    name: 'Country',
    displayName: "Country",
    type: FieldType.Text
};

const Field_FacilitiesManager: IFieldDefinition = {
    name: 'FacilitiesManager',
    displayName: "Facilities Manager",
    type: FieldType.User,
    userSelectionMode: "PeopleOnly",
};

const Field_HRBP: IFieldDefinition = {
    name: 'HRBP',
    displayName: "HR BP",
    type: FieldType.User,
    userSelectionMode: "PeopleOnly",
};

const Field_LossPreventionManager: IFieldDefinition = {
    name: 'LossPreventionManager',
    displayName: "Loss Prevention Manager",
    type: FieldType.User,
    userSelectionMode: "PeopleOnly",
};

const Field_Market: IFieldDefinition = {
    name: 'Market',
    displayName: "Market",
    type: FieldType.Text,
    default: "",
};

const Field_MarketBusinessAdmin: IFieldDefinition = {
    name: 'MarketBusinessAdmin',
    displayName: "Market Business Admin",
    type: FieldType.User,
    userSelectionMode: "PeopleOnly",
};

const Field_MarketManager: IFieldDefinition = {
    name: 'MarketManager',
    displayName: "Market Manager",
    type: FieldType.User,
    userSelectionMode: "PeopleOnly",
};

const Field_MarketPerformanceSpecialist: IFieldDefinition = {
    name: 'MarketPerformanceSpecialist',
    displayName: "Market Performance Specialist",
    type: FieldType.User,
    userSelectionMode: "PeopleOnly",
};

const Field_MarketLookup: IFieldDefinition = {
    name: 'MarketLookup',
    displayName: "Market Lookup",
    type: FieldType.Text
};

const Field_NSOExecReceptionHost: IFieldDefinition = {
    name: 'NSOExecReceptionHost',
    displayName: "NSO-Exec Reception Host",
    type: FieldType.Text
};

const Field_NSORibbonCutter: IFieldDefinition = {
    name: 'NSORibbonCutter',
    displayName: "NSO-Ribbon Cutter",
    type: FieldType.Text
};

const Field_OpenDate: IFieldDefinition = {
    name: 'OpenDate',
    displayName: "Open Date",
    type: FieldType.DateTime,
    dateTimeFormat: DateTimeFieldFormatType.DateTime,
};

const Field_PrinterQueueName: IFieldDefinition = {
    name: 'PrinterQueueName',
    displayName: "Printer Queue Name",
    type: FieldType.Text
};

const Field_RegionDirector: IFieldDefinition = {
    name: 'RegionDirector',
    displayName: "Region Director",
    type: FieldType.User,
    userSelectionMode: "PeopleOnly",
};

const Field_ReportingDescription: IFieldDefinition = {
    name: 'ReportingDescription',
    displayName: "Reporting Description",
    type: FieldType.Text
};

const Field_SMASMAlias: IFieldDefinition = {
    name: 'SMASMAlias',
    displayName: "SM + ASM Alias",
    type: FieldType.Text
};

const Field_SpecialtySize: IFieldDefinition = {
    name: 'SpecialtySize',
    displayName: "Specialty Size",
    type: FieldType.Text
};

const Field_StateProvince: IFieldDefinition = {
    name: 'StateProvince',
    displayName: "State Province",
    type: FieldType.Text
};

const Field_StoreCode: IFieldDefinition = {
    name: 'StoreCode',
    displayName: "Store Code",
    type: FieldType.Text
};

const Field_StoreDescription: IFieldDefinition = {
    name: 'StoreDescription',
    displayName: "Store Description",
    type: FieldType.Text
};

const Field_StoreMailingAddress: IFieldDefinition = {
    name: 'StoreMailingAddress',
    displayName: "Store Mailing Address",
    type: FieldType.Text,
    multi: true
};

const Field_StoreManager: IFieldDefinition = {
    name: 'StoreManager',
    displayName: "Store Manager",
    type: FieldType.User,
    userSelectionMode: "PeopleOnly",
};

const Field_StoreNumber: IFieldDefinition = {
    name: 'StoreNumber',
    displayName: "Store Number",
    type: FieldType.Text
};

const Field_Street: IFieldDefinition = {
    name: 'Street',
    displayName: "Street",
    type: FieldType.Text
};

const Field_Street2: IFieldDefinition = {
    name: 'Street2',
    displayName: "Street 2",
    type: FieldType.Text
};

const Field_ZIPorPostalCode: IFieldDefinition = {
    name: 'ZIPorPostalCode',
    displayName: "ZIP/Postal Code",
    type: FieldType.Text
};


const Field_MarketNumber: IFieldDefinition = {
    name: 'MarketNumber',
    displayName: "Market#",
    type: FieldType.Text,
    default: "001"
};

const Field_Region: IFieldDefinition = {
    name: 'Region',
    displayName: "Region",
    type: FieldType.Text,
    default: "",
};

const Field_RetailRole: IFieldDefinition = {
    name: 'RetailRole',
    displayName: "Retail Role",
    type: FieldType.Text,
    default: "",
};

const Field_StoreStatus: IFieldDefinition = {
    name: 'StoreStatus',
    displayName: "Store Status",
    type: FieldType.Choice,
    choices: StoreStatus.all.map(s => s.name),
    default: ""
};

const Field_TimeZone: IFieldDefinition = {
    name: 'TimeZone',
    displayName: "Time Zone",
    type: FieldType.Text,
    default: ""
};

const View_AllStores: IViewDefinition = {
    title: "All Stores",
    paged: true,
    rowLimit: 100,
    query: '',
    fields: includeStandardViewFields(
        Field_City,
        Field_ClosedDate,
        Field_CostCenter,
        Field_Country,
        Field_Market,
        Field_StoreCode,
        Field_StoreDescription,
        Field_StoreMailingAddress,
        Field_StoreManager,
        Field_StoreNumber,
        Field_StoreStatus,
        Field_StateProvince
    )
};

const View_AllActiveStores: IViewDefinition = {
    title: "All Active Stores",
    paged: true,
    rowLimit: 100,
    query: `<Where>`
        + `    <Eq>`
        + `      <FieldRef Name="${Field_StoreStatus.name}" />`
        + `      <Value Type="Text">${StoreStatus.StoreOpen.name}</Value>`
        + `    </Eq>`
        + `</Where>`,
    fields: includeStandardViewFields(
        Field_City,
        Field_ClosedDate,
        Field_CostCenter,
        Field_Country,
        Field_Market,
        Field_StoreCode,
        Field_StoreDescription,
        Field_StoreMailingAddress,
        Field_StoreManager,
        Field_StoreNumber,
        Field_StoreStatus,
        Field_StateProvince
    )
};

export interface IStoreListDefinition extends IListDefinition {
    view_AllStores: IViewDefinition;
    view_AllActiveStores: IViewDefinition;
}

export const StoreList: IStoreListDefinition = {
    title: Defaults.StoreListTitle,
    description: '',
    template: 100,
    siteFields: [],
    updateFields: [
    ],
    permissions: {
        copyRoleAssignments: false,
        userRoles: [{
            userType: 'ownerGroup',
            roleType: RoleType.Administrator,
            operation: RoleOperation.Add
        }, {
            userType: 'memberGroup',
            roleType: RoleType.Reader,
            operation: RoleOperation.Add
        }, {
            userType: 'visitorGroup',
            roleType: RoleType.Reader,
            operation: RoleOperation.Add
        }]
    },
    fields: [
        Field_City,
        Field_ClosedDate,
        Field_CostCenter,
        Field_Country,
        Field_Market,
        Field_StoreCode,
        Field_StoreDescription,
        Field_StoreMailingAddress,
        Field_StoreManager,
        Field_StoreNumber,
        Field_StoreStatus,
        Field_StateProvince
    ],
    views: [
        View_AllStores,
        View_AllActiveStores
    ],
    view_AllStores: View_AllStores,
    view_AllActiveStores: View_AllActiveStores
};