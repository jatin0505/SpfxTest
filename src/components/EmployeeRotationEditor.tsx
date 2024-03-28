import React, { } from "react";
import {
    css, PrimaryButton, DefaultButton, MessageBar, MessageBarType, IProcessedStyleSet,
    ITextFieldStyleProps, ITextFieldStyles, classNamesFunction, TextField,
    IDropdownOption, Dropdown, IDropdownStyleProps, IDropdownStyles, IDropdown, IDatePickerStyles, IDatePickerStyleProps
} from '@fluentui/react';
import moment from "moment-timezone";
import { withServices, ServicesProp, EmployeeRotationServiceProp, EmployeeRotationService, ConfigurationServiceProp, ConfigurationService } from "services";
import { IDataPanelBaseProps, IDataPanelBaseState, DataPanelMode, Validation, EntityPanelBase, UserPicker, UserList, ResponsiveGrid, GridRow, GridCol } from "common/components";
import * as strings from "CommonStrings";
import { ValidationRule } from "common";
import { User } from './../common/User';
import { EmployeeRotation, FocusAreaAssignment, FocusArea, Store, FocusAreaStatus, RotationStatus } from "model";
import { DatePickerControl } from 'components/DatePickerControl';
import { FocusAreaTile } from './FocusAreaTile';

import styles from './styles/EmployeeRotationEditor.module.scss';
import { FocusAreaAssignmentEditor } from "./FocusAreaAssignmentEditor";
import { SPField } from "common/sharepoint";

let focusAreas: FocusArea[] = [];
let stores: Store[] = [];
let rotationStatusOptions: IDropdownOption[] = [];
let storeOptions: IDropdownOption[] = [];


interface IOwnProps {
    onSelectedFocusArea?: () => void;
    allEmployees: EmployeeRotation[];
    onClose?: () => void;
    editFocusArea?: boolean;
    selectedFocusAreaAssignment?: FocusAreaAssignment;
}

interface IOwnState {
    employeeRotation: EmployeeRotation;
    isAddAssignment: boolean;
    newAssignment: FocusAreaAssignment;
    FocusArea: string;
    successMessage: string;
    isEdited: boolean;
    employeeRotationAll: EmployeeRotation[];
}

class duplicateEmployeeValidationRule extends ValidationRule<EmployeeRotation> {
    constructor(pEmployeeEntity: EmployeeRotation, allEmployeeRotation: EmployeeRotation[]) {
        super(employeeEntity =>
            employeeEntity.id > 0 ? true :
                allEmployeeRotation.filter(e => e.employeeName == undefined || e.employeeName == null ? false : e.employeeName.email == employeeEntity.employeeName.email).length == 0,
            'An entry for this user already exists.'
        );
    }
}

export type IEmployeeProps = IOwnProps & IDataPanelBaseProps<EmployeeRotation> & ServicesProp<EmployeeRotationServiceProp & ConfigurationServiceProp>;
export type IEmployeeState = IOwnState & IDataPanelBaseState<EmployeeRotation>;
export class EmployeeRotationEditor extends EntityPanelBase<EmployeeRotation, IEmployeeProps, IEmployeeState> {

    private _managerFocus: boolean = true;
    public _duplicateEmployeeValidationRule: duplicateEmployeeValidationRule;

    constructor(props: IEmployeeProps) {
        super(props);

        this.state = {
            data: null,
            mode: DataPanelMode.Edit,
            showValidationFeedback: false,
            submitting: false,
            showConfirmDiscard: false,
            showConfirmDelete: false,
            errorMessage: null,
            hidden: true,
            FocusArea: "",
            employeeRotation: this.entity,
            isAddAssignment: false,
            newAssignment: this.props.selectedFocusAreaAssignment,
            successMessage: null,
            isEdited: false,
            employeeRotationAll: this.props.allEmployees
        };

        if (rotationStatusOptions.length == 0) {
            RotationStatus.all.map(r => rotationStatusOptions.push({ key: r.name, text: r.name }));
        }
        this.loadStoreandFocusAreas();
    }

    // public componentDidMount() {
    //     this.setState({
    //         newAssignment: this.props.selectedFocusAreaAssignment,
    //     });
    // }

    // public componentDidUpdate(nextProps: IEmployeeProps) {
    //     console.log("ComponentDidUpdate");
    //     // if (nextProps.selectedFocusAreaAssignment != this.props.selectedFocusAreaAssignment) {
    //     //     this.setState({
    //     //         newAssignment: nextProps.selectedFocusAreaAssignment,
    //     //     });

    //     // }
    // }

    private successFocusAreaMessage = "Focus area assignment has been submitted successfully.";
    private successMailSentMessage = "The notification has been successfully sent.";

    protected validate(): boolean {

        this._duplicateEmployeeValidationRule = new duplicateEmployeeValidationRule(this.entity, this.props.allEmployees);
        const isEmployeeValid: boolean = this._duplicateEmployeeValidationRule.validate(this.entity);

        const isValid = super.validate() && isEmployeeValid;

        if (!isValid) {
            this.setState({ errorMessage: "Please input the valid field values." });
            this._managerFocus = true;
            return false;
        }
        else {
            this._managerFocus = false;
        }
        return isValid;
    }

    protected async persistChangesCore(): Promise<void> {
        const { entity } = this;
        const { isAddAssignment, newAssignment } = this.state;
        const { [EmployeeRotationService]: employeeRotationServiceObj } = this.props.services;
        //const { [EmployeeRotationService]: { isHQUser, currentUser, triggerMailToApprover } } = this.props.services;

        const isNewEmployee = entity.isNew;

        if (entity.rotationStatus == RotationStatus.None) {
            entity.rotationStatus = RotationStatus.Active;
        }
        try {

            employeeRotationServiceObj.track(this.entity);

            await employeeRotationServiceObj.persistEmployeeRotation();
            if (isNewEmployee)
                employeeRotationServiceObj.configureEmployeeRotationItemPermissions(entity);

            if (isAddAssignment || this.props.editFocusArea) {
                let assignment = newAssignment;
                if (assignment.startDate.isSameOrBefore(moment(new Date())) && assignment.endDate.isSameOrAfter(moment(new Date())) && assignment.status == FocusAreaStatus.Approved) {
                    assignment.currentFocusArea = true;
                }
                else {
                    assignment.currentFocusArea = false;
                }

                employeeRotationServiceObj.isHQUser ? assignment.status = assignment.status : assignment.status = FocusAreaStatus.Pending;
                assignment.employeeRotation.set(this.entity);
                assignment.focusAreaManagerName = assignment.focusAreaManager.title;

                employeeRotationServiceObj.track(assignment);

                await employeeRotationServiceObj.persistFocusAreaAssignment();
                if (assignment.status == FocusAreaStatus.Rejected)
                    employeeRotationServiceObj.configureFocusAreaAssignmentItemPermissionsOnRejection(assignment);

                if (assignment.emailConfiguration.sendNotification)
                    employeeRotationServiceObj.triggerMailToApprover(assignment);
            }

            this.entity.immortalize();
        }
        catch (error) {
            throw error;
        }
    }

    private _resetStates() {
        this.setState({ isAddAssignment: false, newAssignment: null, showValidationFeedback: false, successMessage: null, errorMessage: null });
    }

    private readonly openFocusAreaEditor = (assign: FocusAreaAssignment) => {
        assign.snapshot();
        this.setState({ isAddAssignment: true, newAssignment: assign, showValidationFeedback: false, successMessage: null, errorMessage: null });
    }

    private readonly addnewFocusArea = () => {
        const { entity } = this;
        if (entity.isNew ? entity.valid() && this.props.allEmployees.filter(e => e.employeeName == undefined || e.employeeName == null ? false : e.employeeName.email == this.data.employeeName.email).length == 0 : entity.valid()) {
            let assign = new FocusAreaAssignment();
            assign.employeeRotation.set(entity);
            assign.store = entity.homeStore;
            assign.snapshot();
            this.setState({
                isAddAssignment: true,
                newAssignment: assign,
                showValidationFeedback: false,
                successMessage: null,
                errorMessage: null
            });
        }
        else {
            this.setState({
                showValidationFeedback: true,
                errorMessage: "Please input the valid field values."
            });
        }
    }

    public resetOnDiscard() {
        this.setState({ isEdited: false });
        this._resetStates();
        this.props.onClose();
    }

    private _setValidationFocus() {
        const { showValidationFeedback } = this.state;
        if (showValidationFeedback && this._managerFocus) {
            const divElement = document.querySelector(".validation-error");
            if (divElement) {
                const inputElement = divElement.querySelector("input");
                if (inputElement) {
                    inputElement.focus();
                    //this._managerFocus = false;
                }
            } else {
                setTimeout(() => {
                    this._setValidationFocus();
                }, 100);
            }
        }
    }

    public resetOnBack() {
        this.state.newAssignment.revert();
        this._resetStates();
        let element: HTMLElement = document.querySelector(".customEmployeePanel > .ms-Panel-main > .ms-Panel-commands > div[class*='navigation']");
        element.focus();
    }

    private async loadStoreandFocusAreas() {
        focusAreas = await this.props.services[EmployeeRotationService].fetchFocusAreas;
        stores = await this.props.services[EmployeeRotationService].fetchStores;

        if (storeOptions.length == 0) {
            stores.map(s => storeOptions.push({ key: s.id, text: s.storeDescription }));
        }
    }

    private isFocusAreaAssignmentValid(): boolean {
        const { newAssignment } = this.state;


        this.setState({ showValidationFeedback: true });
        return this.state.newAssignment.valid() && FocusAreaAssignmentEditor._startDateValidationRule.validate(newAssignment) && FocusAreaAssignmentEditor._endDateValidationRule.validate(newAssignment);
    }

    public get title(): string {
        const headingElement: HTMLElement = document.querySelector(".customEmployeePanel > .ms-Panel-main > div.ms-Panel-contentInner > .ms-Panel-header > p.ms-Panel-headerText");
        let headingTitle: string;
        if (this.state.isAddAssignment || this.props.editFocusArea) {
            headingTitle = "Focus Area Details";
        }
        else {
            headingTitle = "Associate Focus Area Details";
        }
        if (headingElement != null) {
            headingElement.setAttribute("aria-label", headingTitle + " dialog");
        }
        return headingTitle;
    }

    private _renderReadonlyEmployeeDetails() {
        const { entity } = this;
        return (<div className={"employeeReadOnlyDetails"}>
            <GridRow>
                <GridCol sm={12}>
                    <div className={styles.label}>Employee Name</div>
                    <div>
                        <UserList className={styles.employeeName} users={this.entity.employeeName ? [entity.employeeName] : []} optionalTitle={this.entity.employeeFullName} />
                    </div>
                </GridCol>
            </GridRow>
            <GridRow>
                <GridCol sm={12} md={6}>
                    <div className={styles.label}>Direct Manager</div>
                    <div className={styles.text}> {entity.reporteeManager ? entity.reporteeManager.title : entity.directManagerName} </div>
                </GridCol>
                <GridCol sm={12} md={6}>
                    <div className={styles.label}>Hub Manager</div>
                    <div className={styles.text}> {entity.hubManager} </div>
                </GridCol>
            </GridRow>
            <GridRow>
                <GridCol sm={12} md={6}>
                    <div className={styles.label}>Territory Manager</div>
                    <div className={styles.text}> {entity.territoryManager} </div>
                </GridCol>
                <GridCol sm={12} md={6}>
                    <div className={styles.label}>Hub</div>
                    <div className={styles.text}> {entity.homeStore ? entity.homeStore.storeDescription : ""} </div>
                </GridCol>
            </GridRow>
            <GridRow>
                <GridCol sm={12} md={6}>
                    <div className={styles.label}>Program Entry Start Date</div>
                    <div className={styles.text}>{entity.startDate ? entity.startDate.format('MMM DD, YYYY') : ""} </div>
                </GridCol>
                <GridCol sm={12} md={6}>
                    <div className={styles.label}>Expected Program End Date</div>
                    <div className={styles.text}> {entity.expectedEndDate ? entity.expectedEndDate.format('MMM DD, YYYY') : ""} </div>
                </GridCol>
            </GridRow>
            <GridRow>
                <GridCol sm={12} md={6}>
                    <div className={styles.label}>PERN</div>
                    <div className={styles.text}>{entity.pern > 0 ? entity.pern : ""} </div>
                </GridCol>
            </GridRow>
        </div>);
    }

    private async _onHubChange(val: IDropdownOption) {
        const { [EmployeeRotationService]: rotationService } = this.props.services;
        if (val === undefined) {
            val = null;
            this.updateField(r => r.homeStore = null);
        }
        else {
            let storeDetails = stores.filter(s => val.key === s.id)[0];
            console.log("logged in user StoreNumber updated : " + storeDetails.storeManager.email);
            console.log("logged in user storeDetails updated : " + storeDetails);
            if (storeDetails) {
                this.updateField(r => r.homeStore = storeDetails);
                this.updateField(r => r.hubManager = storeDetails.storeManager ? storeDetails.storeManager.title : "");
                this.updateField(r => r.territoryManager = storeDetails.territoryManager ? storeDetails.territoryManager.title : "");
            }
        }
    }

    private _renderEditEmployeeDetails() {
        const { entity } = this;
        const { showValidationFeedback } = this.state;
        const employeeEntity = this.entity;
        const employeeRotationFull = this.props.allEmployees;
        const datePickerStyles: IProcessedStyleSet<IDatePickerStyles> = classNamesFunction<IDatePickerStyleProps, IDatePickerStyles>()({});
        //datePickerStyles.subComponentStyles = styles.datePickerCustomBorder;

        const textFieldStyle: IProcessedStyleSet<ITextFieldStyles> = classNamesFunction<ITextFieldStyleProps, ITextFieldStyles>()({});
        textFieldStyle.field = styles.onFocus;

        const textFieldStyle_Number: IProcessedStyleSet<ITextFieldStyles> = classNamesFunction<ITextFieldStyleProps, ITextFieldStyles>()({});
        textFieldStyle_Number.field = styles.onNumber;

        this._duplicateEmployeeValidationRule = new duplicateEmployeeValidationRule(employeeEntity, employeeRotationFull);

        const employeenameValidationRules = [
            ...EmployeeRotation.EmployeeNameValidations,
            this._duplicateEmployeeValidationRule
        ];

        const dropdownStyles = classNamesFunction<IDropdownStyleProps, IDropdownStyles>()({});
        dropdownStyles.dropdown = styles.onFocusDropdown;

        this._setValidationFocus();
        return (<ResponsiveGrid className={styles.employeeRotationEditorSection} >
            <GridRow>
                <GridCol sm={12}>
                    <Validation entity={this.entity} active={showValidationFeedback} rules={employeenameValidationRules}>
                        <UserPicker
                            label="Employee Name"
                            users={entity.employeeName ? [entity.employeeName] : []}
                            onChanged={val => {
                                this.updateField(e => {
                                    e.employeeName = val[0];
                                    e.employeeFullName = val[0].title;
                                });
                            }}
                            required
                            itemLimit={1}
                        />
                    </Validation>
                </GridCol>
            </GridRow>
            <GridRow>
                <GridCol sm={12} md={6}>
                    <Validation entity={this.entity} active={showValidationFeedback} rules={EmployeeRotation.ManagerValidations}>
                        <UserPicker
                            label="Direct Manager"
                            users={entity.reporteeManager ? [entity.reporteeManager] : []}
                            onChanged={val => {
                                this.updateField(e => {
                                    e.reporteeManager = val[0];
                                    e.directManagerName = val[0].title;
                                });
                            }}
                            required
                            itemLimit={1}
                        />
                    </Validation>
                </GridCol>
                <GridCol sm={12} md={6}>
                    <Validation entity={this.entity} active={showValidationFeedback} rules={EmployeeRotation.HomeStoreValidations}>
                        <Dropdown
                            placeholder="Select a hub"
                            required
                            label="Hub"
                            ariaLabel={"Hub " + (entity.homeStore ? entity.homeStore.storeDescription : "")}
                            defaultSelectedKey={entity.homeStore && entity.homeStore.id}
                            options={storeOptions}
                            onChanged={(val) => {
                                this._onHubChange(val);
                            }}
                            aria-describedby={"HubErrorId"}
                            styles={dropdownStyles}
                            aria-invalid="true"
                        />
                    </Validation>
                </GridCol>
            </GridRow>
            <GridRow className={styles.noValues}>
                <GridCol sm={12} md={6}>
                    <div className={styles.label}>Hub Manager</div>
                    <div className={styles.text}> {entity.hubManager} </div>
                </GridCol>
                <GridCol sm={12} md={6}>
                    <div className={styles.label}>Territory Manager</div>
                    <div className={styles.text}> {entity.territoryManager} </div>
                </GridCol>

            </GridRow>
            <GridRow>
                <GridCol sm={12} md={6}>
                    <Validation entity={this.entity} active={showValidationFeedback} rules={EmployeeRotation.StartDateValidations}>
                        <DatePickerControl
                            label="Program Entry Start Date"
                            required={true}
                            dateValue={entity && entity.startDate ? entity.startDate.toDate() : null}
                            disabled={false}
                            ariaDescribedBy={"ExpectedProgramStartDateErrorId"}
                            disableAutoFocus={true}
                            onDateChange={val => { entity.startDate = moment(val); }}
                            styles={datePickerStyles}
                        />
                    </Validation>
                </GridCol>
                <GridCol sm={12} md={6}>
                    <Validation entity={this.entity} active={showValidationFeedback} rules={EmployeeRotation.EndDateValidations}>
                        <DatePickerControl
                            label="Expected Program End Date"
                            required={true}
                            dateValue={entity && entity.expectedEndDate ? entity.expectedEndDate.toDate() : null}
                            disabled={false}
                            ariaDescribedBy={"ExpectedProgramEndDateErrorId"}
                            disableAutoFocus={true}
                            onDateChange={val => { entity.expectedEndDate = moment(val); }}
                            styles={datePickerStyles}
                        />
                    </Validation>
                </GridCol>
            </GridRow>
            <GridRow>
                <GridCol sm={12} md={6}>
                    <TextField
                        type={"number"}
                        label="PERN"
                        value={entity.pern.toString()}
                        maxLength={255}
                        placeholder={"Add a personal number"}
                        styles={textFieldStyle_Number}
                        onChange={(changeEvent, val) => {
                            this.updateField(rotation => rotation.pern = parseInt(val));
                        }}
                    />
                </GridCol>
            </GridRow>
        </ResponsiveGrid >);
    }

    public renderDisplayContent(): JSX.Element {
        const { entity } = this;
        return (
            <ResponsiveGrid className={styles.employeeRotationEditor}>
                <GridRow className={styles.headerSection}>
                    <GridCol sm={12}>
                        <label className={css(styles.employeeRotationHeading)} role="heading" aria-level={3} >Associate Details</label>
                        <hr className={css(styles.employeeRotationHeadingRow)}></hr>
                    </GridCol>
                </GridRow>
                {this._renderReadonlyEmployeeDetails()}
                <GridRow className={styles.headerSection}>
                    <GridCol sm={12}>
                        <label className={css(styles.employeeRotationHeading)} role="heading" aria-level={3}>Focus Area Details</label>
                        <hr className={css(styles.employeeRotationHeadingRow)}></hr>
                    </GridCol>
                </GridRow>
                <GridRow>
                    <GridCol sm={12} >
                        {this._renderFocusAreas()}
                    </GridCol>
                </GridRow>
                <GridRow className={styles.headerSection}>
                    <GridCol sm={12} className={styles.employeeRotationHeadingRowDiv}>
                        <label className={css(styles.employeeRotationHeading)} role="heading" aria-level={3}>Participation Details</label>
                        <hr className={css(styles.employeeRotationHeadingRow)}></hr>
                    </GridCol>
                </GridRow>
                <GridRow className={styles.noValues}>
                    <GridCol sm={12}>
                        <div className={styles.label}>Participation Status</div>
                        <div className={styles.text}> {entity.rotationStatus ? entity.rotationStatus.name : ""} </div>
                    </GridCol>
                </GridRow>
                <GridRow className={styles.noValues}>
                    <GridCol sm={12}>
                        <div className={styles.label}>Post-graduation Position / Permanent Role</div>
                        <div className={styles.text}> {entity.postGraduationPosition ? entity.postGraduationPosition : ""} </div>
                    </GridCol>
                </GridRow>
                <GridRow className={styles.noValues}>
                    <GridCol sm={12}>
                        <div className={styles.label}>Organization</div>
                        <div className={styles.text}> {entity.organization ? entity.organization : ""} </div>
                    </GridCol>
                </GridRow>

            </ResponsiveGrid>);
    }

    private _renderFocusAreas() {
        const { entity } = this;
        const currentDate = moment().format('L');
        const employeeAssignments = entity.employeeAssignment.get();
        const completedAssignment = employeeAssignments && employeeAssignments.filter(assign => assign.endDate && assign.endDate.isBefore(currentDate));
        const currentAssignment = employeeAssignments && employeeAssignments.filter(assign => assign.startDate && assign.endDate && (assign.startDate.isSameOrBefore(currentDate) && assign.endDate.isSameOrAfter(currentDate)));
        const nextAssignment = employeeAssignments && employeeAssignments.filter(assign => assign.startDate && assign.startDate.isAfter(currentDate));

        return (<div>
            {completedAssignment.length > 0 ? <div role="list">
                <div className={styles.label}>COMPLETED</div>
                {completedAssignment.map(assignment =>
                    <FocusAreaTile focusAreaAssignment={assignment}
                        focusAreaStatus={"Completed"}
                        onSelectedFocusArea={(item) => "Do Nothing"}>
                    </FocusAreaTile>
                )}
            </div> :
                <div>
                    <div className={styles.label}>COMPLETED</div>
                    <h4>Not Available</h4>
                </div>
            }
            {currentAssignment.length > 0 ? <div role="list" className="focusAreaCurrent">
                <div className={styles.label}>CURRENT</div>
                {currentAssignment.map(assignment =>
                    <FocusAreaTile focusAreaAssignment={assignment}
                        focusAreaStatus={"Current Program"}
                        onSelectedFocusArea={(item) => this.state.isEdited ? this.openFocusAreaEditor(item) : "Do Nothing"}
                        isEdited={this.state.isEdited} ></FocusAreaTile>
                )}
            </div> :
                <div>
                    <div className={styles.label}>CURRENT</div>
                    <h4>Not Available</h4>
                </div>
            }
            {nextAssignment.length > 0 ? <div role="list" className="focusAreaNext">
                <div className={styles.label}>NEXT</div>
                {nextAssignment.map(assignment =>
                    <FocusAreaTile focusAreaAssignment={assignment}
                        focusAreaStatus={"Next Program"}
                        onSelectedFocusArea={(item) => this.state.isEdited ? this.openFocusAreaEditor(item) : "Do Nothing"}
                        isEdited={this.state.isEdited} ></FocusAreaTile>
                )}
            </div> :
                <div>
                    <div className={styles.label}>NEXT</div>
                    <h4>Not Available</h4>
                </div>
            }
        </div>);
    }

    public renderEditContent(): JSX.Element {
        const { entity } = this;
        const { isAddAssignment, successMessage, newAssignment, showValidationFeedback } = this.state;

        if (newAssignment == null && this.props.selectedFocusAreaAssignment != null) {
            this.setState({ newAssignment: this.props.selectedFocusAreaAssignment });
        }

        if (newAssignment != null && this.props.selectedFocusAreaAssignment != null) {
            if (newAssignment != this.props.selectedFocusAreaAssignment) {
                this.setState({ newAssignment: this.props.selectedFocusAreaAssignment });
            }
        }

        // const completedAssignment = employeeAssignments && employeeAssignments.filter(assign => assign.endDate && assign.endDate.isBefore(moment()));
        // const currentAssignment = employeeAssignments && employeeAssignments.filter(assign => assign.startDate && assign.endDate && (assign.startDate.isSameOrBefore(moment()) && assign.endDate.isSameOrAfter(moment())));
        // const nextAssignment = employeeAssignments && employeeAssignments.filter(assign => assign.startDate && assign.startDate.isAfter(moment()));

        const dropdownStyles = classNamesFunction<IDropdownStyleProps, IDropdownStyles>()({});
        dropdownStyles.dropdown = styles.onFocusDropdown;

        const textFieldStyle: IProcessedStyleSet<ITextFieldStyles> = classNamesFunction<ITextFieldStyleProps, ITextFieldStyles>()({});
        textFieldStyle.field = styles.onFocus;

        return (
            <div>
                {successMessage &&
                    <MessageBar messageBarType={MessageBarType.success}>
                        {successMessage}
                    </MessageBar>
                }
                {(!isAddAssignment && !this.props.editFocusArea) && <ResponsiveGrid className={styles.employeeRotationEditor + " employeeRotationDiv"}>
                    <GridRow className={styles.headerSection}>
                        <GridCol sm={12}>
                            <label className={css(styles.employeeRotationHeading)} role="heading" aria-level={3}>Associate Details</label>
                            <hr className={css(styles.employeeRotationHeadingRow)}></hr>
                        </GridCol>
                    </GridRow>
                    {entity.isNew ? this._renderEditEmployeeDetails() : this._renderReadonlyEmployeeDetails()}
                    <GridRow className={styles.headerSection}>
                        <GridCol sm={12}>
                            <label className={css(styles.employeeRotationHeading)} role="heading" aria-level={3}>Focus Area Details</label>
                            <hr className={css(styles.employeeRotationHeadingRow)}></hr>
                        </GridCol>
                    </GridRow>
                    <GridRow>
                        <GridCol sm={12} >{this._renderFocusAreas()}</GridCol>
                    </GridRow>
                    <GridRow>
                        <GridCol sm={12}>
                            <PrimaryButton className={styles.rotationbutton + " addFocusAreaButton"} text="+ Add Focus Area" onClick={() => this.addnewFocusArea()} ></PrimaryButton>
                        </GridCol>
                    </GridRow>
                    <GridRow className={styles.headerSection}>
                        <GridCol sm={12} className={styles.employeeRotationHeadingRowDiv}>
                            <label className={css(styles.employeeRotationHeading)} role="heading" aria-level={3}>Participation Details</label>
                            <hr className={css(styles.employeeRotationGraduateHeadingRow)}></hr>
                        </GridCol>
                    </GridRow>
                    <GridRow>
                        <GridCol sm={12}>
                            <Dropdown
                                placeholder="Select a Status"
                                label="Participation Status"
                                title="Participation Status"
                                ariaLabel={"Participation Status"}
                                defaultSelectedKey={entity.rotationStatus && entity.rotationStatus.name}
                                options={rotationStatusOptions}
                                onChanged={(val) => this.updateField(empRotation => empRotation.rotationStatus = RotationStatus.fromName(val.text))}
                                styles={dropdownStyles}
                                aria-describedby={"GraduationStatusErrorId"}
                                aria-invalid="true"
                            />
                        </GridCol>
                    </GridRow>
                    <GridRow>
                        <GridCol className={styles.positionContainer} sm={12} md={6}>
                            <TextField
                                className="PostGraduationTextField"
                                label="Post-graduation Position / Permanent Role"
                                required={false}
                                value={this.entity.postGraduationPosition}
                                maxLength={255}
                                styles={textFieldStyle}
                                onChange={(element, val) => this.updateField(empRotation => empRotation.postGraduationPosition = val)}
                            />
                        </GridCol>
                        <GridCol className={styles.organizationContainer} sm={12} md={6}>
                            <TextField
                                label="Organization"
                                required={false}
                                value={this.entity.organization}
                                maxLength={255}
                                styles={textFieldStyle}
                                onChange={(element, val) => this.updateField(empRotation => empRotation.organization = val)}
                                className="OrganizationTextField"
                            />
                        </GridCol>
                    </GridRow>

                </ResponsiveGrid>}
                {(isAddAssignment || this.props.editFocusArea) && newAssignment &&
                    <FocusAreaAssignmentEditor
                        employeeRotation={this.entity}
                        assignment={newAssignment}
                        services={this.props.services}
                        focusAreaArr={focusAreas}
                        storesArr={stores}
                        isValidationApplied={showValidationFeedback}
                        manageFocus={this._managerFocus}
                    ></FocusAreaAssignmentEditor>
                }
            </div>);
    }

    protected renderEditFooterElements(): JSX.Element[] {
        const { submitting, newAssignment, isAddAssignment, errorMessage, successMessage } = this.state;
        try {
            const onSubmit = () => {
                if (isAddAssignment || this.props.editFocusArea) {
                    if (this.isFocusAreaAssignmentValid()) {
                        this.submit(() => {
                            let successfullMessage = this.state.newAssignment.emailConfiguration.sendNotification && this.state.newAssignment.status != FocusAreaStatus.Pending ? this.successMailSentMessage : this.successFocusAreaMessage;
                            this.setState({ isAddAssignment: false, errorMessage: null, successMessage: successfullMessage });
                            this.props.editFocusArea ? setTimeout(() => { this.resetState(); this.discard(); this.props.onClose(); }, 2000) : this.setState({ newAssignment: null });
                            let element: HTMLElement = document.querySelector(".customEmployeePanel > .ms-Panel-main > .ms-Panel-commands > div[class*='navigation']");
                            if (element) element.focus();
                        });
                    }
                    else {
                        this.setState({ errorMessage: "Please input the valid field values." });
                    }

                }
                else {
                    this.submit(() => {
                        this.setState({ isAddAssignment: false, newAssignment: null, errorMessage: null, successMessage: null });
                        this.discard();
                        this.props.onClose();
                    });
                }
            };

            const onConfirmDiscard = () => {
                if (this.props.editFocusArea) {
                    this.state.newAssignment.revert();
                }
                this.setState({ isEdited: false });
                this.confirmDiscard();
            };

            return [
                <div className={styles.employeeRotationEditor}>
                    {isAddAssignment && !this.props.editFocusArea &&
                        <DefaultButton className={styles.rotationbutton} text="Back" onClick={this.resetOnBack.bind(this)} disabled={submitting} />
                    },
                    <PrimaryButton className={styles.rotationbutton} text="Submit" aria-label={"Submit"} onClick={onSubmit} disabled={submitting} />,
                    <DefaultButton className={styles.rotationbutton} text="Cancel" onClick={onConfirmDiscard} disabled={submitting} />
                </div>
            ];
        }
        catch (e) {
            if (this.state.newAssignment.emailConfiguration.sendNotification)
                this.setState({ errorMessage: "An error has occured. The notification could not be sent." });
            else
                this.setState({ errorMessage: strings.GenericError });
        }
    }

    protected renderDisplayFooterElements(): JSX.Element[] {
        const onDiscard = () => this.discard();
        return this.entity && this.entity.rotationStatus != RotationStatus.Graduate && this.entity.rotationStatus != RotationStatus.Terminated ? [
            <PrimaryButton className={styles.rotationbutton} text="Edit" onClick={() => { this.setState({ isEdited: true }); this.edit(); }} />,
            <DefaultButton className={styles.rotationbutton} text="Close" onClick={() => { /*this.setState({ isEdited: false });*/ this.discard(); }} />
        ] : [<DefaultButton className={styles.rotationbutton} text="Close" onClick={() => { /*this.setState({ isEdited: false }); */this.discard(); }} />];
    }
}

export default withServices(EmployeeRotationEditor);