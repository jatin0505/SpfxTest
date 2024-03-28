import { ListItemResult, SPField } from 'common/sharepoint';
import { Configuration } from 'schema';

export class ConfigurationListItemResult extends ListItemResult {
    public static readonly viewFields: string[] = [
        ...ListItemResult.viewFields,
        "SchemaVersion",
        "CurrentUpgradeAction",
        "HQTeamEmail",
        "SendEmail"
    ];

    public SchemaVersion: SPField.Query_Number;
    public CurrentUpgradeAction: SPField.Query_Number;
    public HQTeamEmail: SPField.Query_UserMulti;
    public SendEmail: SPField.Query_Boolean;

    public static toConfiguration(row: ConfigurationListItemResult): Configuration {
        let config: Configuration = null;

        try {
            config = new Configuration(SPField.toUser(row.Author), SPField.toUser(row.Editor), new Date(row.Created), new Date(row.Modified), parseInt(row.ID, 10));
            config.title = row.Title;
            config.schemaVersion = SPField.fromFloat(row.SchemaVersion);
            config.currentUpgradeAction = SPField.fromInteger(row.CurrentUpgradeAction, 0);
            config.hqTeamEmail = SPField.toUsers(row.HQTeamEmail);
            config.isSendEmail = SPField.fromYesNo(row.SendEmail);
            //row.HQTeamEmail.forEach(user=>config.hqTeamEmail.push(user));
            //config.hqTeamEmail.push(row.HQTeamEmail=>)
        } catch (e) {
            console.warn(e);
        }

        return config;
    }
}

export class ConfigurationUpdateListItem {
    // 1.0 fields
    public readonly Title: SPField.Update_Text;
    public readonly SchemaVersion: SPField.Update_Number;
    public readonly CurrentUpgradeAction: SPField.Update_Number;
    public readonly HQTeamEmail: SPField.Update_UserIdMulti;

    constructor(config: Configuration) {
        this.Title = config.title;
        this.SchemaVersion = config.schemaVersion;
        this.CurrentUpgradeAction = config.currentUpgradeAction;
        //this.HQTeamEmail = config.hqTeamEmail;

        //config.hqTeamEmail.forEach(user => this.HQTeamEmail.push(user.id));
        //row.HQTeamEmail.forEach(user=>config.hqTeamEmail.push(user));

        // if (config.schemaVersion >= 1.1) {
        // }
    }
}
