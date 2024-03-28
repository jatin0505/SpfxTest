import _ from 'lodash';
import React, { Component, ReactElement } from "react";
import {
    DetailsList, DetailsListLayoutMode, SelectionMode, IColumn,
    SearchBox, IDropdownOption, Dropdown, classNamesFunction, IDropdownStyleProps, IDropdownStyles,
} from '@fluentui/react';
import { ResponsiveGrid, GridRow, GridCol, UserList } from 'common/components';
import { withServices, ServicesProp, EmployeeRotationServiceProp, EmployeeRotationService } from "services";
import { EmployeeRotation, FocusAreaAssignment, FocusAreaStatus } from 'model';
import { Entity } from 'common';

import styles from "./styles/PendingRequests.module.scss";

let hubOptions: IDropdownOption[] = [];
let focusAreaOptions: IDropdownOption[] = [];
let territoryManagerOptions: IDropdownOption[] = [];
let orderByOptions: IDropdownOption[] = [
    { key: "createddate", text: "Created Date" },
    { key: "employeeName", text: "Employee Name" },
    { key: "startdate", text: "Start Date" }
];

interface IOwnProps {
    focusAreaAssignments: FocusAreaAssignment[];
    onSelectEmployee: (item: FocusAreaAssignment) => void;
}
export type IProps = IOwnProps & ServicesProp<EmployeeRotationServiceProp>;

export interface IState {
    currentPageNumber: number;
    columns: IColumn[];
    focusAreaFilter: string;
    hubFilter: string;
    territoryManagerFilter: string;
    searchTermFilter: string;
    pendingFocusAreaAssignments: FocusAreaAssignment[];
    isSortDesc: boolean;
    filteredFocusAreas: FocusAreaAssignment[];
    orderBy: string;

}

export class PendingRequests extends Component<IProps, IState>{
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
                key: "focusArea",
                name: "Focus Area",
                fieldName: "focusArea",
                ariaLabel: "Focus Area",
                minWidth: 140,
                maxWidth: 180,
                isResizable: true,
                data: 'string'
            },
            {
                key: "focusareastartDate",
                name: "Focus Area Start Date",
                fieldName: "focusareastartDate",
                ariaLabel: "Focus Area Start Date",
                minWidth: 140,
                maxWidth: 180,
                isResizable: true,
                data: 'string'
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
                key: "rotationstartdate",
                name: "Rotation Start Date",
                fieldName: "startDate",
                ariaLabel: "Rotation Start Date",
                minWidth: 100,
                maxWidth: 130,
                isResizable: true,
                data: 'string'
            },
            {
                key: "rotationenddate",
                name: "Rotation End Date",
                fieldName: "expectedEndDate",
                ariaLabel: "Rotation End Date",
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
            territoryManagerFilter: this._defaultFilterValue,
            searchTermFilter: this._defaultSearhText,
            pendingFocusAreaAssignments: this.props.focusAreaAssignments,
            isSortDesc: true,
            filteredFocusAreas: this.props.focusAreaAssignments,
            orderBy: ""
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

        if (territoryManagerOptions.length == 0) {
            territoryManagerOptions.push({ key: this._defaultFilterValue, text: this._defaultFilterValue });
            this.state.filteredFocusAreas.forEach(item =>
                territoryManagerOptions.find(dropdownItem => dropdownItem.text == item.employeeRotation.get().territoryManager) ?
                    "Do Nothing" : territoryManagerOptions.push({ key: item.id, text: item.employeeRotation.get().territoryManager }));
        }

    }

    public async componentDidMount() {
        const { pendingFocusAreaAssignments } = this.state;
        this._bindFilters();
    }

    private _resetFilters() {
        this.setState({
            focusAreaFilter: this._defaultFilterValue,
            hubFilter: this._defaultFilterValue,
            territoryManagerFilter: this._defaultFilterValue,
            searchTermFilter: "",
            isSortDesc: true,
            orderBy: ""
        });
    }

    public componentDidUpdate(nextProps: IProps) {
        if (nextProps.focusAreaAssignments != this.props.focusAreaAssignments) {
            this.setState({
                filteredFocusAreas: [...nextProps.focusAreaAssignments],
            });

            this._filterEmployeeRotations(this.state.territoryManagerFilter, this.state.hubFilter, this.state.focusAreaFilter, this.state.searchTermFilter);
        }
    }

    private _onItemInvoked = (item: FocusAreaAssignment) => {
        this.props.onSelectEmployee(item);
    }

    private _renderItemColumn(item: FocusAreaAssignment, index: number, column: IColumn) {
        const fieldContent = item[column.fieldName as keyof FocusAreaAssignment] as any;
        let employeeRotation = item.employeeRotation.get();
        switch (column.key) {
            case "employeeName":
                const nameofEmployee = employeeRotation.employeeName;
                return <div>
                    <UserList users={nameofEmployee ? [nameofEmployee] : []} optionalTitle={employeeRotation.employeeFullName} />
                </div>;
            case "hub":
                const hub = employeeRotation.homeStore ? employeeRotation.homeStore.storeDescription : "-";
                return <div className={styles.detailsListCol}>
                    {hub}
                </div>;
            case "focusArea":
                return <div className={styles.detailsListCol}>
                    {item.focusArea.title}
                </div>;
            case "focusareaManager":
                const managerName = item.focusAreaManager ? item.focusAreaManager : null;
                return <div >
                    {managerName ? <UserList users={[managerName]} optionalTitle={item.focusAreaManagerName} /> : <div className={styles.detailsListCol}>{"Not Yet Assigned"}</div>}
                </div>;
            case "focusareastartDate":
                const focusAreaStartDate = item.startDate;
                return <div className={styles.detailsListCol}>
                    {focusAreaStartDate.format('MMM DD, YYYY')}
                </div>;
            case "rotationstartdate":
                const rotationStartDate = employeeRotation.startDate;
                return <div className={styles.detailsListCol}>
                    {rotationStartDate.format('MMM DD, YYYY')}
                </div>;
            case "rotationenddate":
                const rotationEndDate = employeeRotation.expectedEndDate;
                return <div className={styles.detailsListCol}>
                    {rotationEndDate.format('MMM DD, YYYY')}
                </div>;
            default:
                return <span className={styles.detailsListCol}>{fieldContent}</span >;
        }
    }

    private _onOrderChange(viewVal: string) {
        let filteredFocusAssignment = this._sortFocusAssignments(viewVal, this.state.filteredFocusAreas);

        this.setState({
            filteredFocusAreas: [...filteredFocusAssignment],
            orderBy: viewVal
        });
    }

    private _sortFocusAssignments(orderBy: String, filteredFocusAreas: FocusAreaAssignment[]): FocusAreaAssignment[] {
        let FocusAreaAssignments: FocusAreaAssignment[] = [];
        switch (orderBy) {
            case "Created Date":
                FocusAreaAssignments = filteredFocusAreas.sort((a, b) => (a.created < b.created) ? -1 : 1);
                break;
            case "Employee Name":
                FocusAreaAssignments = filteredFocusAreas.sort((a, b) => (a.employeeRotation.get().employeeFullName < b.employeeRotation.get().employeeFullName) ? -1 : 1);
                break;
            case "Start Date":
                FocusAreaAssignments = filteredFocusAreas.sort((a, b) => (a.startDate < b.startDate) ? -1 : 1);
                break;
            default:
                FocusAreaAssignments = filteredFocusAreas;
                break;
        }
        return FocusAreaAssignments;
    }

    private _filterEmployeeRotations(territoryManagerVal: string, hubVal: string, focusVal: string, searchTerm: string) {
        const { focusAreaAssignments } = this.props;
        let filteredFocusAssignment: FocusAreaAssignment[] = focusAreaAssignments;

        if (focusVal != this._defaultFilterValue) {
            filteredFocusAssignment = filteredFocusAssignment.filter(e =>
                e.focusArea.title === focusVal

            );
        }

        if (hubVal != this._defaultFilterValue) {
            filteredFocusAssignment = filteredFocusAssignment.filter(e =>
                e.employeeRotation.get().homeStore.storeDescription === hubVal
            );
        }

        if (territoryManagerVal != this._defaultFilterValue) {
            filteredFocusAssignment = filteredFocusAssignment.filter(e =>
                e.employeeRotation.get().territoryManager === territoryManagerVal
            );
        }

        if (searchTerm != this._defaultSearhText) {
            filteredFocusAssignment = Entity.search(filteredFocusAssignment, searchTerm, false);
        }

        this.setState({
            filteredFocusAreas: [...this._sortFocusAssignments(this.state.orderBy, filteredFocusAssignment)],
            focusAreaFilter: focusVal,
            territoryManagerFilter: territoryManagerVal,
            hubFilter: hubVal,
            searchTermFilter: searchTerm
        });
    }



    public render(): ReactElement<IProps> {
        const { columns, orderBy, focusAreaFilter, hubFilter, filteredFocusAreas, isSortDesc, territoryManagerFilter, searchTermFilter } = this.state;
        let focusAreaAssignments = filteredFocusAreas;
        const dropdownStyles = classNamesFunction<IDropdownStyleProps, IDropdownStyles>()({});
        dropdownStyles.dropdown = styles.onFocusDropdown;

        return (
            <ResponsiveGrid className={styles.PendingRequests}>
                <GridRow className={styles.filterRow}>
                    <GridCol sm={12} md={4} className={styles.searchCointainer}>
                        <SearchBox
                            placeholder="Search Name or Program Name"
                            ariaLabel="Search Name or Program Name"
                            onSearch={searchVal => this._filterEmployeeRotations(territoryManagerFilter, hubFilter, focusAreaFilter, searchVal)}
                            onClear={() => this._filterEmployeeRotations(territoryManagerFilter, hubFilter, focusAreaFilter, this._defaultSearhText)}
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
                                this._filterEmployeeRotations(territoryManagerFilter, hubFilter, val.text, searchTermFilter);
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
                                this._filterEmployeeRotations(territoryManagerFilter, val.text, focusAreaFilter, searchTermFilter);
                            }}
                            styles={dropdownStyles}
                            aria-describedby="noItem"
                        />
                    </GridCol>
                    <GridCol sm={12} md={2}>
                        <Dropdown
                            label="Territory Manager"
                            placeholder="Territory Manager"
                            ariaLabel="Territory Manager Filter."
                            defaultSelectedKey={territoryManagerFilter}
                            options={territoryManagerOptions}
                            onChanged={(val) => {
                                this._filterEmployeeRotations(val.text, hubFilter, focusAreaFilter, searchTermFilter);
                            }}
                            styles={dropdownStyles}
                            aria-describedby="noItem"
                        />
                    </GridCol>
                    <GridCol sm={12} md={2} className={styles.orderByCointainer}>
                        <Dropdown
                            label="Order by"
                            placeholder="Order by"
                            ariaLabel={"Order the results by "}
                            options={orderByOptions}
                            defaultSelectedKey={'createddate'}
                            onChanged={(val) => this._onOrderChange(val.text)}
                            //aria-describedby={"SelectedViewErrorId"}
                            styles={dropdownStyles}
                        />
                    </GridCol>
                </GridRow>
                <GridRow className={styles.detailListContainer}>
                    <GridCol>
                        {focusAreaAssignments.length <= 0 && <div id={"noItem"} className={styles.noItemText}> There are no employees available..</div>}
                        {focusAreaAssignments.length > 0 && <div id={"noItem"} className={styles.detailGridView}>
                            {focusAreaAssignments.length + " employees results are shown below."}
                            <DetailsList
                                setKey="items"
                                className={styles.detailsList}
                                items={focusAreaAssignments}
                                columns={columns}
                                layoutMode={DetailsListLayoutMode.justified}
                                isHeaderVisible={true}
                                selectionMode={SelectionMode.none}
                                onItemInvoked={this._onItemInvoked}
                                onRenderItemColumn={this._renderItemColumn.bind(this)}
                            >
                            </DetailsList>
                        </div>}
                    </GridCol>
                </GridRow>
            </ResponsiveGrid >);
    }
}
export default withServices(PendingRequests);