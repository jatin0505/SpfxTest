import _ from 'lodash';
import React, { Component, ReactElement } from "react";
import {
    DetailsList, IGroup, DetailsListLayoutMode, SelectionMode, IColumn, IIconProps,
    SearchBox, IDropdownOption, Dropdown, classNamesFunction, IDropdownStyleProps, IDropdownStyles, DefaultButton, IDropdownSubComponentStyles, IGroupRenderProps, IGroupHeaderProps, GroupHeader
} from '@fluentui/react';
import { ResponsiveGrid, GridRow, GridCol, UserList } from 'common/components';
import { withServices, ServicesProp, EmployeeRotationServiceProp, EmployeeRotationService } from "services";
import { EmployeeRotation, FocusAreaAssignment, FocusAreaStatus } from 'model';
import { RotationProgressStatus } from 'model/RotationProgressStatus';
import { Entity } from 'common';

import styles from "./styles/CurrentAssociates.module.scss";

let hubOptions: IDropdownOption[] = [];
let focusAreaOptions: IDropdownOption[] = [];
let groups: IGroup[] = [];
let statusOptions: IDropdownOption[] = [];
let viewOptions: IDropdownOption[] = [{ key: "list", text: "List" }, { key: "group", text: "Group" }];

interface IOwnProps {
    employeeRotation: EmployeeRotation[];
    onSelectEmployee: (employeeRotation: EmployeeRotation) => void;
    onSelectFocusArea?: (employeeRotation: EmployeeRotation, FocusAreaAssignment: FocusAreaAssignment) => void;
    pageLoadCount: number;
}
export type IProps = IOwnProps & ServicesProp<EmployeeRotationServiceProp>;

export interface IState {
    currentPageNumber: number;
    columns: IColumn[];
    focusAreaFilter: string;
    hubFilter: string;
    statusFilter: string;
    searchTermFilter: string;
    filteredemployeeRotation: EmployeeRotation[];
    isListView: boolean;

}

// const viewListIcon: IIconProps = { iconName: 'GroupedList' };
// const groupListIcon: IIconProps = { iconName: 'GroupList' };

export class CurrentAssociates extends Component<IProps, IState>{
    private _defaultFilterValue: string = "All";
    private _defaultSearhText: string = "";

    constructor(props: IProps) {
        super(props);

        const columns: IColumn[] = [
            {
                key: "employeeName",
                name: "Employee Name",
                fieldName: "employeeName",
                ariaLabel: "Employee Name",
                minWidth: 150,
                maxWidth: 180,
                isResizable: true,
                data: 'string'
            },
            {
                key: "hub",
                name: "Hub",
                fieldName: "homeStore",
                ariaLabel: "Hub",
                minWidth: 100,
                maxWidth: 130,
                isResizable: true,
                data: 'string',
                isMultiline: true
            },
            {
                key: "currentfocusArea",
                name: "Current Focus Area",
                fieldName: "currentfocusArea",
                ariaLabel: "Current Focus Area",
                minWidth: 140,
                maxWidth: 180,
                isResizable: true,
                data: 'string'
            },
            {
                key: "focusareaendDate",
                name: "Focus Area End Date",
                fieldName: "focusareaendDate",
                ariaLabel: "Focus Area End Date",
                minWidth: 140,
                maxWidth: 180,
                isResizable: true,
                data: 'string',
            },
            {
                key: "focusareaManager",
                name: "Focus Area Manager",
                fieldName: "focusareaManager",
                ariaLabel: "Focus Area Manager",
                minWidth: 140,
                maxWidth: 180,
                isResizable: true,
                data: 'string'
            },
            {
                key: "rotationstartDate",
                name: "Rotation Start Date",
                fieldName: "startDate",
                ariaLabel: "Rotation Start Date",
                minWidth: 100,
                maxWidth: 130,
                isResizable: true,
                data: 'string',
                onRender: (item) => (
                    <div className={styles.detailsListCol}>
                        {item.startDate ? item.startDate.format('MMM DD, YYYY') : ""}
                    </div>)
            },
            {
                key: "rotationendDate",
                name: "Rotation End Date",
                fieldName: "expectedEndDate",
                ariaLabel: "Rotation End Date",
                minWidth: 100,
                maxWidth: 130,
                isResizable: true,
                data: 'string',
                onRender: (item) => (
                    <div className={styles.detailsListCol}>
                        {item.expectedEndDate ? item.expectedEndDate.format('MMM DD, YYYY') : ""}
                    </div>)
            },
            {
                key: "focusAreaApprovalStatus",
                name: "Status",
                fieldName: "focusAreaApprovalStatus",
                ariaLabel: "focusArea Approval Status",
                minWidth: 100,
                maxWidth: 130,
                isResizable: true,
                data: 'string'
            }
        ];

        this.state = {
            currentPageNumber: 1,
            columns: columns,
            focusAreaFilter: this._defaultFilterValue,
            hubFilter: this._defaultFilterValue,
            statusFilter: this._defaultFilterValue,
            searchTermFilter: this._defaultSearhText,
            filteredemployeeRotation: this.props.employeeRotation,
            isListView: true
        };

    }

    private async _bindFilters() {
        if (focusAreaOptions.length == 0) {
            const focusAreas = await this.props.services[EmployeeRotationService].fetchFocusAreas;
            focusAreaOptions.push({ key: this._defaultFilterValue, text: this._defaultFilterValue });
            focusAreas.map(focusArea => focusAreaOptions.push({ key: focusArea.id, text: focusArea.title }));
        }
        if (hubOptions.length == 0) {
            const stores = await this.props.services[EmployeeRotationService].fetchStores;
            hubOptions.push({ key: this._defaultFilterValue, text: this._defaultFilterValue });
            stores.map(store => hubOptions.push({ key: store.id, text: store.storeDescription }));
        }
        if (statusOptions.length == 0) {
            statusOptions.push({ key: this._defaultFilterValue, text: this._defaultFilterValue });
            FocusAreaStatus.all.map(status => statusOptions.push({ key: status.name, text: status.name }));
        }
        // if (viewOptions.length == 0) {
        //     viewOptions.push({ key: "list", text: "List" }, { key: "group", text: "Group" });
        // }
    }

    private _bindGroupList() {
        const { filteredemployeeRotation } = this.state;
        let start = 0;
        groups = [];
        RotationProgressStatus.allSortByID.map(status => {
            const count = filteredemployeeRotation.filter(e => e.rotationProgessStatus === status).length;
            groups.push({ key: status.name, name: status.name, startIndex: start, count: count, level: 0 });
            start += count;
        });
    }

    public async componentDidMount() {
        const { filteredemployeeRotation } = this.state;
        this._bindFilters();
        this._redirectToEditorPanel();
        this._bindGroupList();
    }

    private _redirectToEditorPanel() {
        const { filteredemployeeRotation } = this.state;
        let pageCount = this.props.pageLoadCount;
        let employeeRotation: EmployeeRotation;
        let focusAreaAssignment: FocusAreaAssignment;
        const url = new URL(window.location.href);
        if (url.searchParams.has("RotationID")) {
            let _employeeRotationID: number = parseInt(url.searchParams.get("RotationID"));
            employeeRotation = filteredemployeeRotation.find(employee => employee.id == _employeeRotationID);
            if (url.searchParams.has("AssignmentID")) {
                let _focusAssignmentID: number = parseInt(url.searchParams.get("AssignmentID"));
                focusAreaAssignment = employeeRotation.employeeAssignment.get().find(assignment => assignment.id == _focusAssignmentID);
                if (employeeRotation && focusAreaAssignment && pageCount == 1) {
                    this.props.onSelectFocusArea(employeeRotation, focusAreaAssignment);
                }
            }
            else {
                if (employeeRotation && pageCount == 1) {
                    this.props.onSelectEmployee(employeeRotation);
                }
            }
        }
    }

    private _resetFilters() {
        this.setState({
            focusAreaFilter: this._defaultFilterValue,
            hubFilter: this._defaultFilterValue,
            statusFilter: this._defaultFilterValue,
            searchTermFilter: ""
        });
    }

    public componentDidUpdate(nextProps: IProps) {
        if (nextProps.employeeRotation != this.props.employeeRotation) {
            this.setState({
                filteredemployeeRotation: [...nextProps.employeeRotation],
            });

            this._filterEmployeeRotations(this.state.statusFilter, this.state.hubFilter, this.state.focusAreaFilter, this.state.searchTermFilter);
        }
    }

    private _onItemInvoked = (item: EmployeeRotation) => {
        this.props.onSelectEmployee(item);
    }

    private readonly customGroupProps: IGroupRenderProps = {
        showEmptyGroups: true,
        onRenderHeader: (props?: IGroupHeaderProps): JSX.Element => (
            <GroupHeader expandButtonProps={{ 'aria-label': props.group.name }} {...props} />
        ),
    };

    private _renderItemColumn(item: EmployeeRotation, index: number, column: IColumn) {
        const fieldContent = item[column.fieldName as keyof EmployeeRotation] as any;
        switch (column.key) {
            case "employeeName":
                const nameofEmployee = item.employeeName;
                return <div>
                    <UserList users={nameofEmployee ? [nameofEmployee] : []} optionalTitle={item.employeeName.title} />
                </div>;
            case "hub":
                const hub = item.homeStore ? item.homeStore.storeDescription : "-";
                return <div className={styles.detailsListCol}>
                    {hub}
                </div>;
            case "currentfocusArea":
                const currentFocusArea = item.employeeAssignment.get().filter(focusArea => focusArea.currentFocusArea == true)[0];
                return <div className={styles.detailsListCol}>
                    {currentFocusArea ? currentFocusArea.focusArea.title : "Not Yet Assigned"}
                </div>;
            case "focusareaManager":
                const focusAreaAssignment = item.employeeAssignment.get().filter(focusArea => focusArea.currentFocusArea == true)[0];
                const managerName = focusAreaAssignment ? focusAreaAssignment.focusAreaManager : null;
                return <div >
                    {managerName ? <UserList users={[managerName]} optionalTitle={focusAreaAssignment.focusAreaManager.title} /> : <div className={styles.detailsListCol}>{"Not Yet Assigned"}</div>}
                </div>;
            case "focusareaendDate":
                const focusAreaEndDate = item.employeeAssignment.get().filter(focusArea => focusArea.currentFocusArea == true)[0];
                return <div className={styles.detailsListCol}>
                    {focusAreaEndDate ? focusAreaEndDate.endDate ? focusAreaEndDate.endDate.format('MMM DD, YYYY') : "" : "Not Yet Assigned"}
                </div>;
            case "focusAreaApprovalStatus":
                return <div className={styles.detailsListCol}>
                    {item.focusAreaApprovalStatus.name}
                </div>;
            default:
                return <span className={styles.detailsListCol}>{fieldContent}</span >;
        }
    }

    // private _filterEmployeeRotation(searchTerm: string) {
    //     const { filteredemployeeRotation } = this.state;
    //     const filteredData = Entity.search(filteredemployeeRotation, searchTerm, false);
    //     this.setState({ filteredemployeeRotation: filteredData });
    // }

    private _onViewChange(viewVal: string) {
        if (viewVal === "List") {
            this.setState({
                isListView: true
            });
        }
        else {
            this.setState({
                isListView: false
            });
        }
        // const { isListView } = this.state;
        // this.setState({
        //     isListView: !isListView
        // });
    }

    private _filterEmployeeRotations(statusVal: string, hubVal: string, focusVal: string, searchTerm: string) {
        const { employeeRotation } = this.props;
        let filteredRotations: EmployeeRotation[] = employeeRotation;

        if (focusVal != this._defaultFilterValue) {
            filteredRotations = filteredRotations.filter(e =>
                e.employeeAssignment.get().
                    some(a => a.currentFocusArea &&
                        a.focusArea.title === focusVal
                    )
            );
        }

        if (hubVal != this._defaultFilterValue) {
            filteredRotations = filteredRotations.filter(e =>
                e.homeStore.storeDescription === hubVal
            );
        }

        if (statusVal != this._defaultFilterValue) {
            filteredRotations = filteredRotations.filter(e =>
                e.focusAreaApprovalStatus.name === statusVal
            );
        }

        if (searchTerm != this._defaultSearhText) {
            filteredRotations = Entity.search(filteredRotations, searchTerm, false);
        }

        this.setState({
            filteredemployeeRotation: filteredRotations,
            focusAreaFilter: focusVal,
            statusFilter: statusVal,
            hubFilter: hubVal,
            searchTermFilter: searchTerm
        });
    }

    public render(): ReactElement<IProps> {
        const { columns, focusAreaFilter, hubFilter, filteredemployeeRotation, isListView, statusFilter, searchTermFilter } = this.state;
        const employeeRotations = isListView ? filteredemployeeRotation.sort((a, b) => (a.employeeName.title > b.employeeName.title) ? 1 : -1) : filteredemployeeRotation.sort((a, b) => (a.rotationProgessStatus.id > b.rotationProgessStatus.id) ? 1 : -1);
        const dropdownStyles = classNamesFunction<IDropdownStyleProps, IDropdownStyles>()({});
        dropdownStyles.dropdown = styles.onFocusDropdown;
        //const iconName = isListView ? viewListIcon : groupListIcon;
        //const viewButtonLabel = isListView ? "List" : "Group";
        if (!isListView) {
            this._bindGroupList();
        }
        return (
            <ResponsiveGrid className={styles.currentAssociates}>
                <GridRow className={styles.filterRow}>
                    <GridCol sm={12} md={4} className={styles.searchCointainer}>
                        <SearchBox
                            placeholder="Search Name or Program Name"
                            ariaLabel="Search Name or Program Name"
                            onSearch={searchVal => this._filterEmployeeRotations(statusFilter, hubFilter, focusAreaFilter, searchVal)}
                            onClear={() => this._filterEmployeeRotations(statusFilter, hubFilter, focusAreaFilter, this._defaultSearhText)}
                            disableAnimation
                            aria-describedby="noItem"
                            className={styles.onFocus}
                        />
                    </GridCol>
                    <GridCol sm={12} md={2}>
                        <Dropdown
                            label="Focus Area"
                            placeholder="Focus Area"
                            ariaLabel="Focus Area Filter."
                            defaultSelectedKey={focusAreaFilter}
                            options={focusAreaOptions}
                            onChanged={(val) => {
                                this._filterEmployeeRotations(statusFilter, hubFilter, val.text, searchTermFilter);
                            }}
                            styles={dropdownStyles}
                            aria-describedby="noItem"
                        />
                    </GridCol>
                    <GridCol sm={12} md={2}>
                        <Dropdown
                            label="Hub"
                            placeholder="Hub"
                            ariaLabel="Hub Filter."
                            defaultSelectedKey={hubFilter}
                            options={hubOptions}
                            onChanged={(val) => {
                                this._filterEmployeeRotations(statusFilter, val.text, focusAreaFilter, searchTermFilter);
                            }}
                            styles={dropdownStyles}
                            aria-describedby="noItem"
                        />
                    </GridCol>
                    <GridCol sm={12} md={2}>
                        <Dropdown
                            label="Status"
                            placeholder="Status"
                            ariaLabel="Status Filter."
                            defaultSelectedKey={statusFilter}
                            options={statusOptions}
                            onChanged={(val) => {
                                this._filterEmployeeRotations(val.text, hubFilter, focusAreaFilter, searchTermFilter);
                            }}
                            styles={dropdownStyles}
                            aria-describedby="noItem"
                        />
                    </GridCol>
                    <GridCol sm={12} md={2} className={styles.viewActionCointainer}>
                        {/* <ActionButton iconProps={iconName}
                            toggle
                            tabIndex={0}
                            text={"View By " + viewButtonLabel}
                            ariaLabel={"View By " + viewButtonLabel}
                            onClick={() => this._onViewChange()}>
                        </ActionButton> */}
                        {/* <div className={styles.viewIconLabel}>{'Selected View'}</div> */}
                        <Dropdown
                            label="Selected View"
                            placeholder="Selected View"
                            ariaLabel={"Selected View. "}
                            options={viewOptions}
                            defaultSelectedKey={['list']}
                            onChanged={(val) => this._onViewChange(val.text)}
                            aria-describedby={"SelectedViewErrorId"}
                            styles={dropdownStyles}
                            className="SelectedViewDropdownField"
                        />
                        {/* <DefaultButton
                            toggle
                            checked={isListView}
                            text={isListView ? 'List' : 'Group'}
                            iconProps={isListView ? viewListIcon : groupListIcon}
                            onClick={() => this._onViewChange("list")}
                            tabIndex={0}
                        /> */}
                    </GridCol>
                </GridRow>
                <GridRow className={styles.detailListContainer}>
                    <GridCol>
                        {employeeRotations.length <= 0 && <div id={"noItem"} className={styles.noItemText}> There are no employees available..</div>}
                        {employeeRotations.length > 0 && <div id={"noItem"} className={styles.detailGridView}>
                            {employeeRotations.length + " employees results are shown below."}
                            {isListView && <DetailsList
                                setKey="items"
                                className={styles.detailsList}
                                items={employeeRotations}
                                columns={columns}
                                layoutMode={DetailsListLayoutMode.justified}
                                isHeaderVisible={true}
                                selectionMode={SelectionMode.none}
                                onItemInvoked={this._onItemInvoked}
                                onRenderItemColumn={this._renderItemColumn.bind(this)}
                            >
                            </DetailsList>}
                            {!isListView && <DetailsList
                                className={styles.detailsList}
                                items={employeeRotations}
                                columns={columns}
                                groups={groups}
                                layoutMode={DetailsListLayoutMode.justified}
                                selectionMode={SelectionMode.none}
                                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                                ariaLabelForSelectionColumn="Toggle selection"
                                checkButtonAriaLabel="select row"
                                groupProps={this.customGroupProps}
                                compact={true}
                                onItemInvoked={this._onItemInvoked}
                                onRenderItemColumn={this._renderItemColumn.bind(this)}
                            >
                            </DetailsList>}
                        </div>}
                    </GridCol>
                </GridRow>
            </ResponsiveGrid >);
    }
}
export default withServices(CurrentAssociates);