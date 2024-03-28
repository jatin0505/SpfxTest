import { RoleType, DateTimeFieldFormatType } from "@pnp/sp";
import {
    IListDefinition, IFieldDefinition, FieldType, IViewDefinition,
    RoleOperation, includeStandardViewFields
} from "common/sharepoint";
import { FocusAreaStatus } from "model";
import { Defaults } from "../Defaults";

const Field_FocusArea: IFieldDefinition = {
    name: 'FocusArea',
    displayName: "Focus Area",
    type: FieldType.Lookup,
    lookupListTitle: Defaults.FocusAreaListTitle,
    showField: 'Title',
    required: true
};

const Field_Employee: IFieldDefinition = {
    name: 'Employee',
    displayName: "Employe Rotation ID",
    type: FieldType.Lookup,
    lookupListTitle: Defaults.EmployeeRotationListTitle,
    showField: 'ID',
    required: true
};

const Field_StartDate: IFieldDefinition = {
    name: 'StartDate',
    displayName: "Start Date",
    type: FieldType.DateTime,
    dateTimeFormat: DateTimeFieldFormatType.DateOnly,
    required: true
};

const Field_EndDate: IFieldDefinition = {
    name: 'EndDate',
    displayName: "End Date",
    type: FieldType.DateTime,
    dateTimeFormat: DateTimeFieldFormatType.DateOnly,
    required: true
};

const Field_Store: IFieldDefinition = {
    name: 'Store',
    displayName: "Store",
    type: FieldType.Lookup,
    lookupListTitle: Defaults.StoreListTitle,
    showField: 'Title',
    required: true
};

const Field_Status: IFieldDefinition = {
    name: 'Status',
    displayName: "Focus Area Status",
    type: FieldType.Choice,
    choices: FocusAreaStatus.all.map(s => s.name),
    required: true
};

const Field_CurrentFocusArea: IFieldDefinition = {
    name: 'CurrentFocusArea',
    displayName: "Current Focus Area",
    type: FieldType.Boolean,
    default: "0"
};

const Field_FocusAreaManager: IFieldDefinition = {
    name: 'FocusAreaManager',
    displayName: "Focus Area Manager",
    type: FieldType.User,
    userSelectionMode: "PeopleAndGroups",
    required: true
};


const View_AllItems: IViewDefinition = {
    title: "All Assignments",
    default: true,
    paged: true,
    rowLimit: 1000,
    query: '',
    fields: includeStandardViewFields(
        Field_Employee,
        Field_FocusArea,
        Field_StartDate,
        Field_EndDate,
        Field_Store,
        Field_Status,
        Field_CurrentFocusArea,
        Field_FocusAreaManager
    )
};

export interface IFocusAreaAssignmentListDefinition extends IListDefinition {
    view_AllItems: IViewDefinition;
}

export const FocusAreaAssignmentList: IFocusAreaAssignmentListDefinition = {
    title: Defaults.FocusAreaAssignmentListTitle,
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
        Field_Employee,
        Field_FocusArea,
        Field_StartDate,
        Field_EndDate,
        Field_Store,
        Field_Status,
        Field_CurrentFocusArea,
        Field_FocusAreaManager
    ],
    views: [View_AllItems],
    view_AllItems: View_AllItems
};