import { RoleType } from "@pnp/sp";
import {
    IListDefinition, IFieldDefinition, FieldType, IViewDefinition,
    RoleOperation, includeStandardViewFields
} from "common/sharepoint";
import { Defaults } from "../Defaults";



const Field_Managers: IFieldDefinition = {
    name: 'Managers',
    displayName: "Focus Area Managers",
    type: FieldType.User,
    userSelectionMode: "PeopleAndGroups",
    required: true,
    multi: true
};


const View_AllItems: IViewDefinition = {
    title: "All FocusAreas",
    default: true,
    paged: true,
    rowLimit: 1000,
    query: '',
    fields: includeStandardViewFields(
        Field_Managers
    )
};

export interface IFocusAreaListDefinition extends IListDefinition {
    view_AllItems: IViewDefinition;
}

export const FocusAreaList: IFocusAreaListDefinition = {
    title: Defaults.FocusAreaListTitle,
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
            roleType: RoleType.Reader,
            operation: RoleOperation.Add
        }

        ]
    },
    fields: [
        Field_Managers
    ],
    views: [View_AllItems],
    view_AllItems: View_AllItems
};