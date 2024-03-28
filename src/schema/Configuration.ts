import { User } from "common";
import { ListItemEntity } from "common/sharepoint";
import { IEmployeeRotationSchema, EmployeeRotationSchema, CurrentSchemaVersion } from "./EmployeeRotationSchema";

interface IState {
    schemaVersion: number;
    currentUpgradeAction: number;
    //isEnvProd: boolean;
    hqTeamEmail: User[];
    isSendEmail: boolean;
}

export class Configuration extends ListItemEntity<IState> {
    private _schema: IEmployeeRotationSchema;
    public static hqTeamEmail: User[];

    constructor(author?: User, editor?: User, created?: Date, modified?: Date, id?: number) {
        super(author, editor, created, modified, id);

        this.state.schemaVersion = CurrentSchemaVersion;
        this.state.currentUpgradeAction = 0;
        this.hqTeamEmail = this.state.hqTeamEmail;

        this._schema = EmployeeRotationSchema;
    }

    public get schema(): IEmployeeRotationSchema { return this._schema; }

    public get schemaVersion(): number { return this.state.schemaVersion; }
    public get currentUpgradeAction(): number { return this.state.currentUpgradeAction; }

    public set schemaVersion(val: number) { this.state.schemaVersion = val; }
    public set currentUpgradeAction(val: number) { this.state.currentUpgradeAction = val; }

    public set hqTeamEmail(val: User[]) { this.state.hqTeamEmail = val; }
    public get hqTeamEmail(): User[] { return this.state.hqTeamEmail; }

    public set isSendEmail(val: boolean) { this.state.isSendEmail = val; }
    public get isSendEmail(): boolean { return this.state.isSendEmail; }
}

export type ConfigurationMap = Map<number, Configuration>;
export type ReadonlyConfigurationMap = ReadonlyMap<number, Configuration>;