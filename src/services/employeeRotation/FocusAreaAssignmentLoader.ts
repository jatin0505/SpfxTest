import { PagedViewLoader, ListItemResult, SPField } from 'common/sharepoint';
import { ISharePointService } from "common/services";
import { formatDateTime } from 'common/Utils';
import moment from "moment-timezone";
import { FocusArea, FocusAreaAssignment, FocusAreaStatus, Store, FocusAreaMap, StoreMap } from "model";
import { IEmployeeRotationSchema } from "schema";
import { EmployeeRotationLoader } from "./EmployeeRotationLoader";
import { FocusAreaLoader, StoreLoader } from "./FocusAreaAndStoreLoader";

class FocusAreaAssignmentListItemResult extends ListItemResult {
    public readonly FocusArea: SPField.Query_Lookup;
    public readonly Employee: SPField.Query_Lookup;
    public readonly StartDate: SPField.Query_DateTime;
    public readonly EndDate: SPField.Query_DateTime;
    public readonly Store: SPField.Query_Lookup;
    public readonly Status: SPField.Query_Choice;
    public readonly CurrentFocusArea: SPField.Query_Boolean;
    public readonly FocusAreaManager: SPField.Query_User;
    public readonly FocusAreaManagerName: SPField.Query_Text;
}

class FocusAreaAssignmentUpdateListItem {
    public readonly FocusAreaId: SPField.Update_LookupId;
    public readonly EmployeeId: SPField.Update_LookupId;
    public readonly StartDate: SPField.Update_DateTime;
    public readonly EndDate: SPField.Update_DateTime;
    public readonly StoreId: SPField.Update_LookupId;
    public readonly Status: SPField.Update_Choice;
    public readonly CurrentFocusArea: SPField.Update_Boolean;
    public readonly FocusAreaManagerId: SPField.Update_UserId;
    public readonly FocusAreaManagerName: SPField.Update_Text;
    constructor(focusAreaAssign: FocusAreaAssignment) {
        if (focusAreaAssign.focusArea) this.FocusAreaId = focusAreaAssign.focusArea.id;
        this.EmployeeId = focusAreaAssign.employeeRotation.get().id;
        this.StartDate = focusAreaAssign.startDate != null ? formatDateTime(moment(SPField.toDateTime(focusAreaAssign.startDate))) : formatDateTime(moment());
        this.EndDate = focusAreaAssign.endDate != null ? formatDateTime(moment(SPField.toDateTime(focusAreaAssign.endDate))) : formatDateTime(moment());
        if (focusAreaAssign.store) this.StoreId = focusAreaAssign.store.id;
        if (focusAreaAssign.status) this.Status = focusAreaAssign.status.name;
        if (focusAreaAssign.focusAreaManager) this.FocusAreaManagerId = SPField.fromUser(focusAreaAssign.focusAreaManager);
        this.CurrentFocusArea = focusAreaAssign.currentFocusArea;
        this.FocusAreaManagerName = focusAreaAssign.focusAreaManagerName;
    }
}

const toFocusAreaAssignment = async (row: FocusAreaAssignmentListItemResult, employeeRotationLoader: EmployeeRotationLoader, focusAreaLoader: FocusAreaLoader, storeLoader: StoreLoader): Promise<FocusAreaAssignment> => {
    let assignment: FocusAreaAssignment = null;
    let focusAreas: FocusAreaMap = null;
    let stores: StoreMap = null;

    try {
        assignment = new FocusAreaAssignment(SPField.toUser(row.Author), SPField.toUser(row.Editor), new Date(row.Created), new Date(row.Modified), parseInt(row.ID, 10));

        focusAreas = new Map((await focusAreaLoader.all()).map((values: FocusArea) => [values.id, values]));
        stores = new Map((await storeLoader.all()).map((values: Store) => [values.id, values]));
        assignment.focusArea = await SPField.fromLookup(row.FocusArea, focusAreas);
        assignment.store = await SPField.fromLookup(row.Store, stores);
        assignment.employeeRotation.set(await SPField.fromLookupAsync(row.Employee, employeeRotationLoader.getById));
        assignment.startDate = row.StartDate ? moment(row.StartDate) : null;
        assignment.endDate = row.EndDate ? moment(row.EndDate) : null;
        assignment.status = FocusAreaStatus.fromName(row.Status);
        assignment.currentFocusArea = row.CurrentFocusArea == "Yes" ? true : false;
        assignment.focusAreaManager = SPField.toUser(row.FocusAreaManager);
        assignment.focusAreaManagerName = row.FocusAreaManagerName;
        assignment.title = row.Title;

        assignment.buildSearchHelperStrings();
        //assignment.employeeRotation.get().buildSearchHelperStrings();
        assignment.immortalize();

    } catch (e) {
        console.warn(e);
    }
    return assignment;
};



export class FocusAreaAssignmentLoader extends PagedViewLoader<FocusAreaAssignment> {
    constructor(schema: IEmployeeRotationSchema, repo: ISharePointService, private readonly _employeeRotationLoader: EmployeeRotationLoader, private readonly _focusAreaLoader: FocusAreaLoader, private readonly _storeLoader: StoreLoader) {
        super(schema.focusAreaAssignmentList.view_AllItems, repo);
    }

    protected readonly toEntity = (row: FocusAreaAssignmentListItemResult) =>
        toFocusAreaAssignment(row, this._employeeRotationLoader, this._focusAreaLoader, this._storeLoader)
    protected readonly updateListItem = FocusAreaAssignmentUpdateListItem;

    protected readonly extractReferencedUsers = (entity: FocusAreaAssignment) =>
        [entity.focusAreaManager]
}