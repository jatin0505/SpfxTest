import React, { Component, ReactElement } from "react";
import { css, Dropdown, IDropdownOption, classNamesFunction, IDropdownStyleProps, IDropdown, IDropdownStyles, IDatePickerStyleProps, IDatePickerStyles, IProcessedStyleSet, Toggle, TextField, ITextFieldStyles, ITextFieldStyleProps } from '@fluentui/react';
import moment from "moment-timezone";
import { withServices, ServicesProp, EmployeeRotationServiceProp, EmployeeRotationService, ConfigurationServiceProp, ConfigurationService } from "services";
import { GridCol, GridRow, ResponsiveGrid, Validation, UserPicker } from "common/components";
import { FocusAreaAssignment, EmployeeRotation, Store, FocusArea, FocusAreaStatus } from "model";
import { DatePickerControl } from 'components/DatePickerControl';
import { User, ValidationRule } from "common";
import { isEmpty } from "lodash";

import styles from './styles/FocusAreaAssignmentEditor.module.scss';
import { EmailConfiguration } from "model/EmailConfig";


let focusAreaOptions: IDropdownOption[] = [];
let storeOptions: IDropdownOption[] = [];
let focusAreaStatusOption: IDropdownOption[] = [];
let isCurrentUserHQ: boolean;
let emailConfigure: EmailConfiguration;
let HQUsers: User[];
let currentUser: User;

interface IOwnProps {
    employeeRotation: EmployeeRotation;
    assignment: FocusAreaAssignment;
    onAssignmentUpdate?: () => void;
    focusAreaArr: FocusArea[];
    storesArr: Store[];
    isValidationApplied: boolean;
    manageFocus: boolean;
}
export interface IOwnState {
    focusAreas: FocusArea[];
    stores: Store[];
    selectedFocusArea: FocusArea;
    showValidationMessage: boolean;
    isUpdated: boolean;
    isNotify: boolean;
    toEmail: User[];
    ccEmail: User[];
    emailSubject: string;
    emailMessage: string;
}
export type IProps = IOwnProps & ServicesProp<EmployeeRotationServiceProp & ConfigurationServiceProp>;

class EndDateBetweenStartDateEndDateofProgramValidationRule extends ValidationRule<FocusAreaAssignment> {
    constructor(pEmployeeRotation: EmployeeRotation) {
        super(focusArea => focusArea.endDate.isSameOrAfter(moment(focusArea.employeeRotation.get().startDate)) && focusArea.endDate.isSameOrBefore(moment(focusArea.employeeRotation.get().expectedEndDate)), EndDateBetweenStartDateEndDateofProgramValidationRule.errorMessage(pEmployeeRotation));
    }

    private static errorMessage(employeeRotation: EmployeeRotation) {
        return 'Assignment end date must be between program start date (' + employeeRotation.startDate.format('MMM DD, YYYY') + ') and end date (' + employeeRotation.expectedEndDate.format('MMM DD, YYYY') + ')';
    }
}

class StartDateBetweenStartDateEndDateofProgramValidationRule extends ValidationRule<FocusAreaAssignment> {
    constructor(pEmployeeRotation: EmployeeRotation) {
        super(focusArea => focusArea.startDate.isSameOrAfter(moment(focusArea.employeeRotation.get().startDate)) && focusArea.startDate.isSameOrBefore(moment(focusArea.employeeRotation.get().expectedEndDate)), StartDateBetweenStartDateEndDateofProgramValidationRule.errorMessage(pEmployeeRotation));
    }
    private static errorMessage(employeeRotation: EmployeeRotation) {
        return 'Assignment start date must be between program start date (' + employeeRotation.startDate.format('MMM DD, YYYY') + ') and end date (' + employeeRotation.expectedEndDate.format('MMM DD, YYYY') + ')';
    }
}

class FocusAreaManagerValidationRule extends ValidationRule<FocusAreaAssignment> {
    constructor(allFocusAreas: FocusArea[]) {
        super(fa => FocusAreaManagerValidationRule.isValidManager(allFocusAreas, fa), FocusAreaManagerValidationRule.errorMessage());
    }

    private static isValidManager(allFocusAreas: FocusArea[], faAssignment: FocusAreaAssignment): boolean {
        const fa = allFocusAreas.filter(f => f.title === faAssignment.focusArea.title)[0];
        return fa.managers.some(f => User.equal(f, faAssignment.focusAreaManager));
    }
    private static errorMessage() {
        return 'Please add correct focus area manager.';
    }
}

export class FocusAreaAssignmentEditor extends Component<IProps, IOwnState> {
    public static _endDateValidationRule: EndDateBetweenStartDateEndDateofProgramValidationRule;
    public static _startDateValidationRule: StartDateBetweenStartDateEndDateofProgramValidationRule;

    private areaDropdownRef = React.createRef<IDropdown>();
    private hubDropdownRef = React.createRef<IDropdown>();
    private _managerFocus: boolean = true;

    constructor(props: IProps) {
        super(props);

        isCurrentUserHQ = this.props.services[EmployeeRotationService].isHQUser;
        currentUser = this.props.services[EmployeeRotationService].currentUser;
        //this.props.services[ConfigurationService].getHQUsers().then(users => HQUsers = users);
        HQUsers = this.props.services[ConfigurationService].active.hqTeamEmail;

        this.state = {
            focusAreas: [],
            stores: [],
            selectedFocusArea: null,
            showValidationMessage: this.props.isValidationApplied,
            isUpdated: false,
            isNotify: false,
            toEmail: [this.props.assignment.author],
            ccEmail: [this.props.assignment.store.storeManager, this.props.assignment.store.territoryManager, currentUser],
            emailSubject: "",
            emailMessage: ""
        };




        emailConfigure = new EmailConfiguration(this.props.assignment, this.props.assignment.status.name, currentUser, HQUsers);
        this.props.assignment.emailConfiguration = emailConfigure;

        if (focusAreaStatusOption.length == 0) {
            FocusAreaStatus.all.forEach(typeOption => {
                if (!isEmpty(typeOption.name) && typeOption != FocusAreaStatus.None) {
                    focusAreaStatusOption.push({ key: typeOption.name, text: typeOption.name });
                }
            });
        }

        if (focusAreaOptions.length == 0) {
            this.props.focusAreaArr.map(focusArea => focusAreaOptions.push({ key: focusArea.id, text: focusArea.title }));
        }

        if (storeOptions.length == 0) {
            this.props.storesArr.map(store => storeOptions.push({ key: store.id, text: store.storeDescription }));
        }

        FocusAreaAssignmentEditor._endDateValidationRule = new EndDateBetweenStartDateEndDateofProgramValidationRule(this.props.employeeRotation);
        FocusAreaAssignmentEditor._startDateValidationRule = new StartDateBetweenStartDateEndDateofProgramValidationRule(this.props.employeeRotation);


        let heading: HTMLElement = document.querySelector(".customEmployeePanel > .ms-Panel-main > div.ms-Panel-contentInner > .ms-Panel-header > p.ms-Panel-headerText");
        if (heading)
            heading.setAttribute("aria-live", "polite");
    }

    public async componentDidMount() {
        let element: HTMLElement = document.querySelector(".customEmployeePanel > .ms-Panel-main > .ms-Panel-commands > div[class*='navigation']");
        if (element)
            element.focus();

    }

    public componentDidUpdate(prevProps: IProps) {
        const { manageFocus } = this.props;

        //if (prevProps.manageFocus != manageFocus) {
        this._managerFocus = manageFocus;
        //}

    }

    private _setValidationFocus() {
        const { isValidationApplied } = this.props;
        if (isValidationApplied && this._managerFocus) {
            const divElement = document.querySelector(".validation-error");
            if (divElement) {
                const lblElement = divElement.querySelector("label");
                const text = lblElement.innerHTML;
                switch (text) {
                    case "Focus Area":
                        this.areaDropdownRef.current!.focus(true);
                        this._managerFocus = false;
                        break;
                    case "Hub":
                        this.hubDropdownRef.current!.focus(true);
                        this._managerFocus = false;
                        break;
                }
                const inputElement = divElement.querySelector("input");
                if (inputElement) {
                    inputElement.focus();
                    this._managerFocus = false;
                }
            }
            else {
                setTimeout(() => {
                    this._setValidationFocus();
                }, 100);
            }

        }
    }

    public render(): ReactElement<IProps> {
        const { assignment, isValidationApplied, storesArr, focusAreaArr } = this.props;
        const endDateValidationRules = [
            ...FocusAreaAssignment.FocusAreaEndDateValidations,
            FocusAreaAssignmentEditor._endDateValidationRule
        ];

        const startDateValidationRules = [
            ...FocusAreaAssignment.FocusAreaStartDateValidations,
            FocusAreaAssignmentEditor._startDateValidationRule
        ];

        const datePickerStyles: IProcessedStyleSet<IDatePickerStyles> = classNamesFunction<IDatePickerStyleProps, IDatePickerStyles>()({});
        datePickerStyles.subComponentStyles = styles.onFocus;

        const dropdownStyles = classNamesFunction<IDropdownStyleProps, IDropdownStyles>()({});
        dropdownStyles.dropdown = styles.onFocusDropdown;

        const textFieldStyle: IProcessedStyleSet<ITextFieldStyles> = classNamesFunction<ITextFieldStyleProps, ITextFieldStyles>()({});
        textFieldStyle.field = styles.onFocus;

        this._setValidationFocus();
        return (
            <div className={styles.focusAreaAssignmentEditor}>
                <ResponsiveGrid className={styles.focusAreaAssignmentGrid}>
                    <GridRow className={styles.focusAreaProgramHeadingDiv}>
                        <GridCol sm={12} md={12}>
                            <label className={css(styles.focusAreaProgramHeading)} role="heading" aria-level={3}>Program Details</label>
                            <hr className={css(styles.focusAreaProgramHeadingRow)}></hr>
                        </GridCol>
                    </GridRow>
                    <GridRow>
                        <GridCol sm={12} md={6}>
                            <Validation entity={assignment} active={isValidationApplied} rules={FocusAreaAssignment.FocusAreaValidations} errorMessageID="FocusAreaErrorId">
                                <Dropdown
                                    componentRef={this.areaDropdownRef}
                                    placeholder="Select a focus Area"
                                    label="Focus Area"
                                    ariaLabel={"Focus Area Filter. " + (assignment.focusArea ? assignment.focusArea.title : "")}
                                    defaultSelectedKey={assignment.focusArea && assignment.focusArea.id}
                                    options={focusAreaOptions}
                                    required
                                    onChanged={(val) => {
                                        assignment.focusArea = focusAreaArr.filter(area => val.key == area.id)[0];
                                        this.setState({ selectedFocusArea: assignment.focusArea });
                                    }}
                                    aria-describedby={"FocusAreaErrorId"}
                                    styles={dropdownStyles}
                                />
                            </Validation>
                        </GridCol>
                        <GridCol sm={12} md={6}></GridCol>
                    </GridRow>
                    <GridRow>
                        <GridCol sm={12} md={6}>
                            <Validation entity={assignment} active={isValidationApplied} rules={startDateValidationRules} errorMessageID="FocusStartDateErrorId">
                                <DatePickerControl
                                    label="Assignment Start Date"
                                    required
                                    dateValue={assignment && assignment.startDate ? assignment.startDate.toDate() : null}
                                    disabled={false}
                                    ariaDescribedBy={"FocusStartDateErrorId"}
                                    disableAutoFocus
                                    onDateChange={val => { assignment.startDate = moment(val); }}
                                    styles={datePickerStyles}
                                />
                            </Validation>
                        </GridCol>
                        <GridCol sm={12} md={6}>
                            <Validation entity={assignment} active={isValidationApplied} rules={endDateValidationRules} errorMessageID="FocusEndDateErrorId">
                                <DatePickerControl
                                    label="Assignment End Date"
                                    required
                                    dateValue={assignment && assignment.endDate ? assignment.endDate.toDate() : null}
                                    disabled={false}
                                    ariaDescribedBy={"FocusEndDateErrorId"}
                                    disableAutoFocus
                                    onDateChange={val => { assignment.endDate = moment(val); }}
                                    styles={datePickerStyles}
                                />
                            </Validation>
                        </GridCol>
                    </GridRow>
                    <GridRow>
                        <GridCol sm={12} md={6}>
                            <Validation entity={assignment} active={isValidationApplied} rules={FocusAreaAssignment.StoreValidations} errorMessageID="HubErrorId">
                                <Dropdown
                                    componentRef={this.hubDropdownRef}
                                    placeholder="Select a hub"
                                    required
                                    label="Hub"
                                    ariaLabel={"Hub " + (assignment.store ? assignment.store.storeDescription : "")}
                                    defaultSelectedKey={assignment.store && assignment.store.id}
                                    options={storeOptions}
                                    onChanged={(val) => {
                                        assignment.store = storesArr.filter(store => val.key == store.id)[0];
                                        this.setState({ isUpdated: !this.state.isUpdated });
                                    }}
                                    aria-describedby={"HubErrorId"}
                                    styles={dropdownStyles}
                                />
                            </Validation>
                        </GridCol>
                        <GridCol sm={12} md={6}>
                            <Validation entity={assignment} active={isValidationApplied} rules={FocusAreaAssignment.FocusAreaManagerValidations} errorMessageID="FocusAreaManagerErrorId">
                                <UserPicker
                                    label="Rotation Focus Area Manager"
                                    users={assignment.focusAreaManager ? [assignment.focusAreaManager] : []}
                                    onChanged={val => {
                                        assignment.focusAreaManager = val[0];
                                        this.setState({ isUpdated: !this.state.isUpdated });
                                    }}
                                    required
                                    itemLimit={1}
                                />
                            </Validation>
                        </GridCol>
                    </GridRow>

                    {isCurrentUserHQ &&
                        <GridRow>
                            <GridCol sm={12} md={12} className={styles.focusAreaProgramHeadingRowDiv}>
                                <hr className={css(styles.focusAreaProgramHeadingRow)}></hr>
                            </GridCol>
                        </GridRow>}
                    {isCurrentUserHQ &&
                        <GridRow>
                            <GridCol sm={12} md={6}>
                                <Dropdown
                                    placeholder="Status"
                                    label="Status"
                                    ariaLabel={"Status " + assignment.status.name}
                                    defaultSelectedKey={assignment.status.name}
                                    options={focusAreaStatusOption}
                                    onChanged={(val) => {
                                        assignment.status = FocusAreaStatus.fromName(val.text);
                                        emailConfigure = this.state.isNotify ? new EmailConfiguration(assignment, val.text, currentUser, HQUsers) :
                                            assignment.status == FocusAreaStatus.Pending ? new EmailConfiguration(assignment, val.text, currentUser, HQUsers) : new EmailConfiguration();
                                        assignment.status != FocusAreaStatus.Pending ? emailConfigure.sendNotification = this.state.isNotify : emailConfigure.sendNotification = true;
                                        assignment.emailConfiguration = emailConfigure;
                                        this.setState({
                                            isUpdated: !this.state.isUpdated
                                        });

                                    }}
                                    styles={dropdownStyles}
                                    className={"FocusAreaStatusDropdown"}
                                />
                            </GridCol>
                            {assignment.status != FocusAreaStatus.Pending &&
                                <GridCol sm={12} md={6}>
                                    <Toggle
                                        label={"Send notification"}
                                        onText={"Yes"}
                                        offText={"No"}
                                        checked={this.state.isNotify}
                                        onChanged={(val) => {
                                            this.setState({ isNotify: val });
                                            emailConfigure = val ? new EmailConfiguration(assignment, assignment.status.name, currentUser, HQUsers) : new EmailConfiguration();
                                            emailConfigure.sendNotification = val;
                                            assignment.emailConfiguration = emailConfigure;
                                        }
                                        }
                                        ariaLabel={"Send notification"}
                                    />
                                </GridCol>
                            }
                        </GridRow>
                    }
                    {isCurrentUserHQ && this.state.isNotify && assignment.status != FocusAreaStatus.Pending &&
                        <div>
                            <GridRow>
                                <GridCol sm={12} md={12}>
                                    <Validation entity={assignment} active={isValidationApplied && this.state.isNotify} rules={FocusAreaAssignment.EmaiToValidations} errorMessageID="FocusAreaEmailToErrorId">
                                        <UserPicker
                                            label="To"
                                            users={emailConfigure.emailTo}
                                            onChanged={val => {
                                                this.setState({ isUpdated: !this.state.isUpdated });
                                                emailConfigure.emailTo = val;
                                                assignment.emailConfiguration = emailConfigure;
                                            }}
                                            aria-describedby={"FocusAreaEmailToErrorId"}
                                            required
                                        />
                                    </Validation>
                                </GridCol>
                            </GridRow>
                            <GridRow>
                                <GridCol sm={12} md={12}>
                                    <UserPicker
                                        label="CC"
                                        users={emailConfigure.emailCC}
                                        onChanged={val => {
                                            this.setState({ isUpdated: !this.state.isUpdated });
                                            emailConfigure.emailCC = val;
                                            assignment.emailConfiguration = emailConfigure;
                                        }}
                                    />
                                </GridCol>
                            </GridRow>
                            <GridRow>
                                <GridCol sm={12} md={12}>
                                    <Validation entity={assignment} active={isValidationApplied && this.state.isNotify} rules={FocusAreaAssignment.EmaiSubjectValidations} errorMessageID="FocusAreaEmailSubjErrorId">
                                        <TextField
                                            label="Subject"
                                            required={true}
                                            value={emailConfigure.emailSubject}
                                            maxLength={255}
                                            placeholder={"Add a subject"}
                                            styles={textFieldStyle}
                                            onChange={(element, val) => {
                                                this.setState({ isUpdated: !this.state.isUpdated });
                                                emailConfigure.emailSubject = val;
                                                assignment.emailConfiguration = emailConfigure;
                                            }}
                                            aria-describedby={"FocusAreaEmailSubjErrorId"}
                                        />
                                    </Validation>
                                </GridCol>
                            </GridRow>
                            <GridRow>
                                <GridCol sm={12} md={12}>
                                    <Validation entity={assignment} active={isValidationApplied && this.state.isNotify} rules={FocusAreaAssignment.EmaiMessageValidations} errorMessageID="FocusAreaEmailMessageErrorId">
                                        <TextField
                                            label="Message"
                                            required={true}
                                            value={emailConfigure.emailMessage}
                                            multiline={true}
                                            placeholder={"Add a mail body"}
                                            rows={20}
                                            styles={textFieldStyle}
                                            onChange={(element, val) => {
                                                this.setState({ isUpdated: !this.state.isUpdated });
                                                emailConfigure.emailMessage = val;
                                                assignment.emailConfiguration = emailConfigure;
                                            }}
                                            aria-describedby={"FocusAreaEmailMessageErrorId"}
                                        />
                                    </Validation>
                                </GridCol>
                            </GridRow>
                        </div>
                    }
                </ResponsiveGrid>
            </div>
        );
    }
}


export default withServices(FocusAreaAssignmentEditor);