import _ from 'lodash';
import { User, ValidationRule, RequiredValidationRule, IManyToOneRelationship, ManyToOneRelationship } from "../common";
import { ListItemEntity } from "../common/sharepoint";
import moment, { Moment } from "moment-timezone";
import { FocusArea, EmployeeRotation, FocusAreaStatus, Store } from "../model";
import { EmailConfiguration } from './EmailConfig';

class State {
    public focusArea: FocusArea;
    public employeeRotation: EmployeeRotation;
    public startDate: Moment;
    public endDate: Moment;
    public store: Store;
    public status: FocusAreaStatus;
    public currentFocusArea: boolean;
    public focusAreaManager: User;
    public focusAreaManagerName: string;
}

export class StartDateBetweenStartDateEndDateofProgramValidationRule extends ValidationRule<FocusAreaAssignment> {
    constructor() {
        super(focusArea => focusArea.startDate.isSameOrAfter(moment(focusArea.employeeRotation.get().startDate)) && focusArea.startDate.isSameOrBefore(moment(focusArea.employeeRotation.get().expectedEndDate)), 'Assignment start date must be between program start date and end date');
    }
}

export class EndDateAfterStartDateValidationRule extends ValidationRule<FocusAreaAssignment> {
    constructor() {
        super(focusArea => focusArea.endDate.isSameOrAfter(focusArea.startDate), 'Assignment end date must be after start date');
    }
}

export class EndDateBetweenStartDateEndDateofProgramValidationRule extends ValidationRule<FocusAreaAssignment> {
    constructor() {
        super(focusArea => focusArea.endDate.isSameOrAfter(moment(focusArea.employeeRotation.get().startDate)) && focusArea.endDate.isSameOrBefore(moment(focusArea.employeeRotation.get().expectedEndDate)), 'Assignment end date must be between program start date and end date');
    }

    private static errorMessage(employeeRotation: EmployeeRotation) {
        return 'Assignment end date must be between program start date (' + employeeRotation.startDate.toString() + ') and end date (' + employeeRotation.expectedEndDate.toString() + ')';
    }
}

export class FocusAreaAssignment extends ListItemEntity<State> {

    public static readonly FocusAreaValidations = [
        new RequiredValidationRule<FocusAreaAssignment>(m => m.focusArea, "Focus Area field is required")
    ];
    public static readonly StoreValidations = [
        new RequiredValidationRule<FocusAreaAssignment>(m => m.store, "Hub field is required")
    ];

    public static readonly FocusAreaManagerValidations = [
        new RequiredValidationRule<FocusAreaAssignment>(m => m.focusAreaManager, "Focus Area Manager field is required")
    ];

    public static readonly FocusAreaStartDateValidations = [
        new RequiredValidationRule<FocusAreaAssignment>(m => m.startDate, "Start date field is required"),
        new StartDateBetweenStartDateEndDateofProgramValidationRule()
    ];

    public static readonly FocusAreaEndDateValidations = [
        new RequiredValidationRule<FocusAreaAssignment>(m => m.endDate, "End date field is required"),
        new EndDateAfterStartDateValidationRule(),
        new EndDateBetweenStartDateEndDateofProgramValidationRule()
    ];
    public static readonly EmaiToValidations = [
        new RequiredValidationRule<FocusAreaAssignment>(m => m._emailconfigure.sendNotification ? m._emailconfigure.emailTo : "hasValue", "Email To field is required")
    ];

    public static readonly EmaiSubjectValidations = [
        new RequiredValidationRule<FocusAreaAssignment>(m => m._emailconfigure.sendNotification ? m._emailconfigure.emailSubject : "hasValue", "Email Subject field is required")
    ];


    public static readonly EmaiMessageValidations = [
        new RequiredValidationRule<FocusAreaAssignment>(m => m._emailconfigure.sendNotification ? m._emailconfigure.emailSubject : "hasValue", "Email Message field is required")
    ];
    constructor(author?: User, editor?: User, created?: Date, modified?: Date, id?: number) {
        super(author, editor, created, modified, id);

        this.state.focusArea = null;
        this.state.employeeRotation = null;
        this.state.startDate = null;
        this.state.endDate = null;
        this.state.status = FocusAreaStatus.Approved;
        this.state.store = null;
        this.state.currentFocusArea = false;
        this.state.focusAreaManager = null;
        this.state.focusAreaManagerName = '';
        this.employeeRotation = ManyToOneRelationship.create<FocusAreaAssignment, EmployeeRotation>(this, 'employeeRotation', 'employeeAssignment');
        this.emailConfiguration = new EmailConfiguration(this, "New", null, null);
    }
    private _emailconfigure: EmailConfiguration;
    public readonly employeeRotation: IManyToOneRelationship<EmployeeRotation>;

    public get focusArea(): FocusArea { return this.state.focusArea; }
    public get startDate(): Moment { return this.state.startDate; }
    public get endDate(): Moment { return this.state.endDate; }
    public get status(): FocusAreaStatus { return this.state.status; }
    public get store(): Store { return this.state.store; }
    public get currentFocusArea(): boolean { return this.state.currentFocusArea; }
    public get focusAreaManager(): User { return this.state.focusAreaManager; }
    public get focusAreaManagerName(): string { return this.state.focusAreaManagerName; }
    public get emailConfiguration(): EmailConfiguration { return this._emailconfigure; }

    public set focusArea(val: FocusArea) { this.state.focusArea = val; }
    public set startDate(val: Moment) { this.state.startDate = val; }
    public set endDate(val: Moment) { this.state.endDate = val; }
    public set status(val: FocusAreaStatus) { this.state.status = val; }
    public set store(val: Store) { this.state.store = val; }
    public set currentFocusArea(val: boolean) { this.state.currentFocusArea = val; }
    public set focusAreaManager(val: User) { this.state.focusAreaManager = val; }
    public set focusAreaManagerName(val: string) { this.state.focusAreaManagerName = val; }
    public set emailConfiguration(val: EmailConfiguration) { this._emailconfigure = val; }

    public get isApproved(): boolean { return this.status === FocusAreaStatus.Approved; }
    public get isPending(): boolean { return this.status === FocusAreaStatus.Pending; }
    public get isRejected(): boolean { return this.status === FocusAreaStatus.Rejected; }

    public buildSearchHelperStrings(): string[] {
        let searchHelpers: string[] = [];
        if (this.id != 0) {
            searchHelpers.push(this.focusArea.title);
            if (this.employeeRotation.get().employeeName)
                searchHelpers.push(this.employeeRotation.get().employeeName.title);
        }
        return searchHelpers;
    }

    protected validationRules(): ValidationRule<FocusAreaAssignment>[] {
        return [
            ...FocusAreaAssignment.FocusAreaValidations,
            ...FocusAreaAssignment.StoreValidations,
            ...FocusAreaAssignment.FocusAreaManagerValidations,
            ...FocusAreaAssignment.FocusAreaStartDateValidations,
            ...FocusAreaAssignment.FocusAreaEndDateValidations,
            ...FocusAreaAssignment.EmaiToValidations,
            ...FocusAreaAssignment.EmaiMessageValidations,
            ...FocusAreaAssignment.EmaiSubjectValidations
        ];
    }

    public immortalize() {
        super.immortalize();
    }

}

export type FocusAreaAssignmentMap = Map<number, FocusAreaAssignment>;
export type ReadonlyFocusAreaAssignmentMap = ReadonlyMap<number, FocusAreaAssignment>;
