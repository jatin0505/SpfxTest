import { IListDefinition, IFieldDefinition, FieldType, IViewDefinition, includeStandardViewFields } from "common/sharepoint";
import { Defaults } from "../Defaults";

const Field_SchemaVersion: IFieldDefinition = {
    name: 'SchemaVersion',
    displayName: "Schema Version",
    type: FieldType.Number
};

const Field_CurrentUpgradeAction: IFieldDefinition = {
    name: 'CurrentUpgradeAction',
    displayName: "Current Upgrade Action",
    type: FieldType.Number
};

const View_AllItems: IViewDefinition = {
    title: "All Configurations",
    default: true,
    query: '',
    fields: includeStandardViewFields(
        Field_SchemaVersion,
        Field_CurrentUpgradeAction
    )
};

export const ConfigurationList: IListDefinition = {
    title: Defaults.ConfigurationListTitle,
    description: '',
    template: 100,
    siteFields: [],
    updateFields: [
    ],
    fields: [
        Field_SchemaVersion,
        Field_CurrentUpgradeAction
    ],
    views: [View_AllItems]
};