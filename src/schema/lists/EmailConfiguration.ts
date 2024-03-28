import { Field } from "@pnp/sp";
import { IListDefinition, IFieldDefinition, FieldType, IViewDefinition, includeStandardViewFields } from "common/sharepoint";
import { Defaults } from "../Defaults";

const Field_Subject: IFieldDefinition = {
    name: 'Subject',
    displayName: 'Subject',
    type: FieldType.Text
};

const Field_EmailTo: IFieldDefinition = {
    name: 'EmailTo',
    displayName: "EmailTo",
    type: FieldType.User,
    userSelectionMode: "PeopleAndGroups",
    required: false
};

const Field_EmailCC: IFieldDefinition = {
    name: 'EmailCC',
    displayName: "EmailCC",
    type: FieldType.User,
    userSelectionMode: "PeopleAndGroups",
    required: false
};

const View_AllItems: IViewDefinition = {
    title: "All Configurations",
    default: true,
    paged: true,
    rowLimit: 1000,
    query: '',
    fields: includeStandardViewFields(
        Field_Subject,
        Field_EmailTo,
        Field_EmailCC
    )
};

export interface IEmailConfigListDefinition extends IListDefinition {
    view_AllItems: IViewDefinition;
}

export const EmailConfigurationList: IEmailConfigListDefinition = {
    title: Defaults.EmailConfigurationListTitle,
    description: '',
    template: 100,
    siteFields: [],
    updateFields: [
    ],
    fields: [
        Field_Subject,
        Field_EmailTo,
        Field_EmailCC
    ],
    views: [View_AllItems],
    view_AllItems: View_AllItems
};
