import { PagedViewLoader, ListItemResult, SPField } from '../../common/sharepoint';
import { ISharePointService } from "../../common/services";
import { formatDateTime } from '../../common/Utils';
import moment from "moment-timezone";
import { EmployeeRotation, RotationStatus, StoreMap, Store } from "../../model";
import { IEmployeeRotationSchema } from "../../schema";
import { StoreLoader } from './FocusAreaAndStoreLoader';

class EmployeeRotationListItemResult extends ListItemResult {
    public readonly Description: SPField.Query_TextMultiLine;
    public readonly EmployeeName: SPField.Query_User;
    public readonly HomeStore: SPField.Query_Lookup;
    public readonly TerritoryManager: SPField.Query_Text;
    public readonly HubManager: SPField.Query_Text;
    public readonly ReporteeManager: SPField.Query_User;
    public readonly StartDate: SPField.Query_DateTime;
    public readonly ExpectedEndDate: SPField.Query_DateTime;
    public readonly RotationStatus: SPField.Query_Choice;
    public readonly PostGraduationPosition: SPField.Query_Text;
    public readonly Organization: SPField.Query_Text;
    public readonly EmployeeFullName: SPField.Query_Text;
    public readonly DirectManagerName: SPField.Query_Text;
    public readonly PERN: SPField.Query_Number;
}

class EmployeeRotationUpdateListItem {
    public readonly EmployeeNameId: SPField.Update_UserId;
    public readonly HomeStoreId: SPField.Update_LookupId;
    public readonly TerritoryManager: SPField.Update_Text;
    public readonly HubManager: SPField.Update_Text;
    public readonly ReporteeManagerId: SPField.Update_UserId;
    public readonly StartDate: SPField.Update_DateTime;
    public readonly ExpectedEndDate: SPField.Update_DateTime;
    public readonly RotationStatus: SPField.Update_Choice;
    public readonly PostGraduationPosition: SPField.Update_Text;
    public readonly Organization: SPField.Update_Text;
    public readonly EmployeeFullName: SPField.Update_Text;
    public readonly DirectManagerName: SPField.Update_Text;
    public readonly PERN: SPField.Update_Number;
    constructor(empRotation: EmployeeRotation) {
        this.EmployeeNameId = SPField.fromUser(empRotation.employeeName);
        this.HomeStoreId = empRotation.homeStore.id;
        this.TerritoryManager = empRotation.territoryManager;
        this.HubManager = empRotation.hubManager;
        this.ReporteeManagerId = SPField.fromUser(empRotation.reporteeManager);
        if (empRotation.startDate != null) this.StartDate = formatDateTime(moment(SPField.toDateTime(empRotation.startDate)));
        if (empRotation.expectedEndDate != null) this.ExpectedEndDate = formatDateTime(moment(SPField.toDateTime(empRotation.expectedEndDate)));
        this.RotationStatus = empRotation.rotationStatus.name;
        this.PostGraduationPosition = empRotation.postGraduationPosition;
        this.Organization = empRotation.organization;
        this.EmployeeFullName = empRotation.employeeFullName;
        this.DirectManagerName = empRotation.directManagerName;
        this.PERN = empRotation.pern | 0;
    }
}

const toEmployeeRotation = async (row: EmployeeRotationListItemResult, storeLoader: StoreLoader): Promise<EmployeeRotation> => {
    let rotation: EmployeeRotation = null;
    let stores: StoreMap = null;

    try {
        stores = new Map((await storeLoader.all()).map((values: Store) => [values.id, values]));

        rotation = new EmployeeRotation(SPField.toUser(row.Author), SPField.toUser(row.Editor), new Date(row.Created), new Date(row.Modified), parseInt(row.ID, 10));
        rotation.homeStore = await SPField.fromLookup(row.HomeStore, stores);
        rotation.territoryManager = row.TerritoryManager;
        rotation.hubManager = row.HubManager;
        rotation.reporteeManager = SPField.toUser(row.ReporteeManager);
        rotation.startDate = row.StartDate ? moment(row.StartDate) : null;
        rotation.expectedEndDate = row.ExpectedEndDate ? moment(row.ExpectedEndDate) : null;
        rotation.rotationStatus = RotationStatus.fromName(row.RotationStatus);
        rotation.postGraduationPosition = row.PostGraduationPosition;
        rotation.organization = row.Organization;
        rotation.employeeName = SPField.toUser(row.EmployeeName);
        rotation.employeeFullName = row.EmployeeFullName;
        rotation.directManagerName = row.DirectManagerName;
        rotation.pern = row.PERN ? parseInt(row.PERN.replace(/,/g, '')) : 0;
        rotation.title = row.Title;
        rotation.immortalize();
        rotation.buildSearchHelperStrings();

    } catch (e) {
        console.warn(e);
    }
    return rotation;
};



export class EmployeeRotationLoader extends PagedViewLoader<EmployeeRotation> {
    constructor(schema: IEmployeeRotationSchema, repo: ISharePointService, private readonly _storeLoader: StoreLoader) {
        super(schema.employeeRotation.view_AllItems, repo);
    }

    protected readonly toEntity = (row: EmployeeRotationListItemResult) =>
        toEmployeeRotation(row, this._storeLoader)
    protected readonly updateListItem = EmployeeRotationUpdateListItem;
    protected readonly extractReferencedUsers = (entity: EmployeeRotation) =>
        [entity.employeeName, entity.reporteeManager]
}