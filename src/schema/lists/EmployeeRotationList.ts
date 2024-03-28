import { RoleType, DateTimeFieldFormatType } from "@pnp/sp";
import {
    IListDefinition, IFieldDefinition, FieldType, IViewDefinition,
    RoleOperation, includeStandardViewFields
} from "common/sharepoint";
import { RotationStatus } from "model";
import { Defaults } from "../Defaults";


const Field_EmployeeName: IFieldDefinition = {
    name: 'EmployeeName',
    displayName: "Employee Name",
    type: FieldType.User,
    userSelectionMode: "PeopleAndGroups",
    required: true
};

const Field_HomeStore: IFieldDefinition = {
    name: 'HomeStore',
    displayName: "Home Store",
    type: FieldType.Lookup,
    lookupListTitle: Defaults.StoreListTitle,
    showField: 'Title',
    required: true
};
const Field_TerritoryManager: IFieldDefinition = {
    name: 'TerritoryManager',
    displayName: "Territory Manager",
    type: FieldType.Text
};

const Field_HubManager: IFieldDefinition = {
    name: 'HubManager',
    displayName: "HubManager",
    type: FieldType.Text
};

const Field_ReportingManager: IFieldDefinition = {
    name: 'ReporteeManager',
    displayName: "Direct Manager​",
    type: FieldType.User,
    userSelectionMode: "PeopleAndGroups",
    required: true
};

const Field_StartDate: IFieldDefinition = {
    name: 'StartDate',
    displayName: "Rotation Program Start Date",
    type: FieldType.DateTime,
    dateTimeFormat: DateTimeFieldFormatType.DateOnly,
    required: true
};

const Field_ExpectedEndDate: IFieldDefinition = {
    name: 'ExpectedEndDate',
    displayName: "Expected Rotation Program End Date",
    type: FieldType.DateTime,
    dateTimeFormat: DateTimeFieldFormatType.DateOnly,
    required: true
};

const Field_RotationStatus: IFieldDefinition = {
    name: 'RotationStatus',
    displayName: "Rotation Status",
    type: FieldType.Choice,
    choices: RotationStatus.all.map(s => s.name),
    required: true
};

const Field_PostGraduationPosition: IFieldDefinition = {
    name: 'PostGraduationPosition',
    displayName: "Post Graduation Position",
    type: FieldType.Text
};

const Field_Organization: IFieldDefinition = {
    name: 'Organization',
    displayName: "Organization",
    type: FieldType.Text
};

const View_AllItems: IViewDefinition = {
    title: "All Employee",
    default: true,
    paged: true,
    rowLimit: 100,
    query: '',
    fields: includeStandardViewFields(
        Field_EmployeeName,
        Field_HomeStore,
        Field_TerritoryManager,
        Field_HubManager,
        Field_ReportingManager,
        Field_StartDate,
        Field_ExpectedEndDate,
        Field_RotationStatus,
        Field_PostGraduationPosition,
        Field_Organization
    )
};

export interface IEmployeeRotationListDefinition extends IListDefinition {
    view_AllItems: IViewDefinition;
}

export const EmployeeRotationList: IEmployeeRotationListDefinition = {
    title: Defaults.EmployeeRotationListTitle,
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
        },
        {
            userType: 'custom',
            customName: Defaults.ERPManagersGroup,
            roleType: RoleType.Contributor,
            operation: RoleOperation.Add
        }
        ]
    },
    fields: [
        // Field_Description,
        Field_EmployeeName,
        Field_HomeStore,
        Field_TerritoryManager,
        Field_HubManager,
        Field_ReportingManager,
        Field_StartDate,
        Field_ExpectedEndDate,
        Field_RotationStatus,
        Field_PostGraduationPosition,
        Field_Organization
    ],
    views: [View_AllItems],
    view_AllItems: View_AllItems
};