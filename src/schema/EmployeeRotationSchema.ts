import { buildLiveSchema, IElementDefinitions, IListDefinition } from "common/sharepoint";
import {
    ConfigurationList, EmployeeRotationList, IEmployeeRotationListDefinition,
    StoreList, IStoreListDefinition,
    FocusAreaAssignmentList, IFocusAreaAssignmentListDefinition,
    FocusAreaList, IFocusAreaListDefinition,
    EmailConfigurationList, IEmailConfigListDefinition
} from "./lists";
import {
    IERPManagersSPGroup, ERPManagersSPGroup
} from "./SiteGroups";

export const CurrentSchemaVersion: number = 1.0;

export interface IEmployeeRotationSchema extends IElementDefinitions {
    configurationList: IListDefinition;
    storeList: IStoreListDefinition;
    focusAreaList: IFocusAreaListDefinition;
    employeeRotation: IEmployeeRotationListDefinition;
    focusAreaAssignmentList: IFocusAreaAssignmentListDefinition;
    emailConfigurationList: IEmailConfigListDefinition;
    managersSPGroup: IERPManagersSPGroup;
}

export const EmployeeRotationSchema = buildLiveSchema<IEmployeeRotationSchema>({
    version: CurrentSchemaVersion,
    siteFields: [
    ],
    lists: [
        ConfigurationList,
        StoreList,
        FocusAreaList,
        EmployeeRotationList,
        FocusAreaAssignmentList,
        EmailConfigurationList
    ],
    siteGroups: [
        ERPManagersSPGroup
    ],
    upgrades: [
    ],
    configurationList: ConfigurationList,
    storeList: StoreList,
    focusAreaList: FocusAreaList,
    employeeRotation: EmployeeRotationList,
    focusAreaAssignmentList: FocusAreaAssignmentList,
    emailConfigurationList: EmailConfigurationList,
    managersSPGroup: ERPManagersSPGroup
});