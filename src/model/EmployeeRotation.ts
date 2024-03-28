import _ from 'lodash';
import { User, ValidationRule, OneToManyRelationship, IOneToManyRelationship, RequiredValidationRule, MaxLengthValidationRule } from "../common";
import { ListItemEntity } from "../common/sharepoint";
import moment, { Moment } from "moment-timezone";
import { RotationStatus, FocusAreaAssignment, Store } from "../model";
import { RotationProgressStatus } from './RotationProgressStatus';
import { FocusArea } from './FocusArea';
import { FocusAreaStatus } from './FocusAreaStatus';

class State {
    public employeeName: User;
    public homeStore: Store;
    public territoryManager: string;
    public hubManager: string;
    public reporteeManager: User;
    public startDate: Moment;
    public expectedEndDate: Moment;
    public rotationStatus: RotationStatus;
    public postGraduationPosition: string;
    public organization: string;
    public employeeFullName: string;
    public directManagerName: string;
    public pern: number;
}

export class EndDateAfterStartDateValidationRule extends ValidationRule<EmployeeRotation> {
    constructor() {
        super(e => e.expectedEndDate.isSameOrAfter(e.startDate), 'Expected end date must be after start date');
    }
}

export class EmployeeRotation extends ListItemEntity<State> {

    public static readonly EmployeeNameValidations = [
        new RequiredValidationRule<EmployeeRotation>(e => e.employeeFullName ? e.employeeFullName : e.employeeName, "Employee Name field is required")
    ];

    public static readonly HomeStoreValidations = [
        new RequiredValidationRule<EmployeeRotation>(e => e.homeStore, "Hub field is required")
    ];

    public static readonly ManagerValidations = [
        new RequiredValidationRule<EmployeeRotation>(e => e.directManagerName ? e.directManagerName : e.reporteeManager, "Direct Manager field is required")
    ];

    public static readonly StartDateValidations = [
        new RequiredValidationRule<EmployeeRotation>(e => e.startDate, "Start date field is required")
    ];

    public static readonly EndDateValidations = [
        new RequiredValidationRule<EmployeeRotation>(e => e.expectedEndDate, "Expected end date field is required"),
        new EndDateAfterStartDateValidationRule()
    ];

    constructor(author?: User, editor?: User, created?: Date, modified?: Date, id?: number) {
        super(author, editor, created, modified, id);

        this.state.employeeName = null;
        this.state.homeStore = null;
        this.state.territoryManager = '';
        this.state.hubManager = '';
        this.state.reporteeManager = null;
        this.state.startDate = null;
        this.state.expectedEndDate = null;
        this.state.rotationStatus = RotationStatus.None;
        this.state.postGraduationPosition = '';
        this.state.organization = '';
        this.state.employeeFullName = '';
        this.state.directManagerName = '';
        this.state.pern = 0;
        this.employeeAssignment = OneToManyRelationship.create<EmployeeRotation, FocusAreaAssignment>(this, 'employeeRotation');
    }

    public readonly employeeAssignment: IOneToManyRelationship<FocusAreaAssignment>;

    private _SearchHelpers: string[] = [];

    public get employeeName(): User { return this.state.employeeName; }
    public get homeStore(): Store { return this.state.homeStore; }
    public get territoryManager(): string { return this.state.territoryManager; }
    public get hubManager(): string { return this.state.hubManager; }
    public get reporteeManager(): User { return this.state.reporteeManager; }
    public get startDate(): Moment { return this.state.startDate; }
    public get expectedEndDate(): Moment { return this.state.expectedEndDate; }
    public get rotationStatus(): RotationStatus { return this.state.rotationStatus; }
    public get postGraduationPosition(): string { return this.state.postGraduationPosition; }
    public get organization(): string { return this.state.organization; }
    public get employeeFullName(): string { return this.state.employeeFullName; }
    public get directManagerName(): string { return this.state.directManagerName; }
    public get pern(): number { return this.state.pern; }

    public set employeeName(val: User) { this.state.employeeName = val; }
    public set homeStore(val: Store) { this.state.homeStore = val; }
    public set territoryManager(val: string) { this.state.territoryManager = val; }
    public set hubManager(val: string) { this.state.hubManager = val; }
    public set reporteeManager(val: User) { this.state.reporteeManager = val; }
    public set startDate(val: Moment) { this.state.startDate = val; }
    public set expectedEndDate(val: Moment) { this.state.expectedEndDate = val; }
    public set rotationStatus(val: RotationStatus) { this.state.rotationStatus = val; }
    public set postGraduationPosition(val: string) { this.state.postGraduationPosition = val; }
    public set organization(val: string) { this.state.organization = val; }
    public set employeeFullName(val: string) { this.state.employeeFullName = val; }
    public set directManagerName(val: string) { this.state.directManagerName = val; }
    public set pern(val: number) { this.state.pern = val; }

    public get rotationProgessStatus(): RotationProgressStatus {
        const assignments = this.employeeAssignment.get();
        const plus4WeeksDate = moment(new Date()).add(4, "weeks");
        let status = RotationProgressStatus.New;
        if (this.expectedEndDate.isSameOrAfter(moment(new Date())) && this.expectedEndDate.isSameOrBefore(plus4WeeksDate)) {
            status = RotationProgressStatus.UpcomingGraduation;
        }
        else if (assignments.length > 0) {
            let currentFocusArea = assignments.filter(f => f.currentFocusArea)[0];
            if (currentFocusArea) {
                if (currentFocusArea.endDate.isSameOrAfter(moment(new Date())) && currentFocusArea.endDate.isSameOrBefore(plus4WeeksDate)) {
                    status = RotationProgressStatus.UpcomingRotationChange;
                }
                else {
                    status = RotationProgressStatus.InProgress;
                }
            }
            else {
                status = RotationProgressStatus.InProgress;
            }
        }
        return status;
    }

    public get focusAreaApprovalStatus(): FocusAreaStatus {
        const assignments = this.employeeAssignment.get();

        const pendingFocusArea = assignments.filter(a => a.isPending).length;
        const approvedFocusArea = assignments.filter(a => a.isApproved).length;
        const rejectedFocusArea = assignments.filter(a => a.isRejected).length;

        return rejectedFocusArea > 0 ? FocusAreaStatus.Rejected : pendingFocusArea ? FocusAreaStatus.Pending : approvedFocusArea > 0 ? FocusAreaStatus.Approved : FocusAreaStatus.None;
    }
    public get pendingFocusAreaCount(): number {
        const assignments = this.employeeAssignment.get();

        return assignments.filter(a => a.isPending).length;
    }
    public buildSearchHelperStrings(): string[] {
        let searchHelpers: string[] = [];
        if (this.id != 0) {
            this.employeeAssignment.get().forEach(focusArea =>
                focusArea.currentFocusArea == true ? searchHelpers.push(focusArea.focusArea.title) : ""
            );
            if (this.employeeName)
                searchHelpers.push(this.employeeName.title);
        }
        return searchHelpers;
    }

    public immortalize() {
        super.immortalize();
    }

    protected validationRules(): ValidationRule<EmployeeRotation>[] {
        return [
            ...EmployeeRotation.EmployeeNameValidations,
            ...EmployeeRotation.HomeStoreValidations,
            ...EmployeeRotation.StartDateValidations,
            ...EmployeeRotation.EndDateValidations,
            ...EmployeeRotation.ManagerValidations
        ];
    }
}

export type EmployeeRotationMap = Map<number, EmployeeRotation>;
export type ReadonlyEmployeeRotationMap = ReadonlyMap<number, EmployeeRotation>;
