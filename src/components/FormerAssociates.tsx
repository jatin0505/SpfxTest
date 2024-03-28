import _ from 'lodash';
import React, { Component, ReactElement } from "react";
import {
    DetailsList, DetailsListLayoutMode, SelectionMode, IColumn,
    SearchBox, IDropdownOption, Dropdown, Label, classNamesFunction, IDropdownStyleProps, IDropdownStyles
} from '@fluentui/react';
import { ResponsiveGrid, GridRow, GridCol, UserList } from 'common/components';
import { withServices, ServicesProp, EmployeeRotationServiceProp, EmployeeRotationService } from "services";
import { EmployeeRotation, RotationStatus } from 'model';
import { Entity } from 'common';
import styles from "./styles/FormerAssociates.module.scss";


let hubOptions: IDropdownOption[] = [];
let participationStatusOptions: IDropdownOption[] = [];

interface IOwnProps {
    employeeRotation: EmployeeRotation[];
    onSelectEmployee: (employeeRotation: EmployeeRotation) => void;
}
export type IProps = IOwnProps & ServicesProp<EmployeeRotationServiceProp>;


export interface IState {
    currentPageNumber: number;
    columns: IColumn[];
    hubFilter: string;
    searchFilter: string;
    participationStatusFilter: string;
    filteredEmployeeRotation: EmployeeRotation[];

}
export class FormerAssociates extends Component<IProps, IState>{
    private _defaultFilterValue: string = "All";
    private _defaultSearchText: string = "";

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
                isRowHeader: true,
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
                isRowHeader: true,
                isResizable: true,
                isMultiline: true,
                data: 'string'
            },
            {
                key: "rotationstartDate",
                name: "Rotation Start Date",
                fieldName: "startDate",
                ariaLabel: "Rotation Start Date",
                minWidth: 150,
                maxWidth: 180,
                isRowHeader: true,
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
                minWidth: 150,
                maxWidth: 180,
                isRowHeader: true,
                isResizable: true,
                data: 'string',
                onRender: (item) => (
                    <div className={styles.detailsListCol}>
                        {item.expectedEndDate ? item.expectedEndDate.format('MMM DD, YYYY') : ""}
                    </div>)
            },
            {
                key: "rotationStatus",
                name: "Participation Status",
                fieldName: "rotationStatus",
                ariaLabel: "Participation Status",
                minWidth: 150,
                maxWidth: 180,
                isRowHeader: true,
                isResizable: true,
                data: 'string'
            }
        ];

        this.state = {
            currentPageNumber: 1,
            columns: columns,
            hubFilter: this._defaultFilterValue,
            searchFilter: this._defaultSearchText,
            participationStatusFilter: this._defaultFilterValue,
            filteredEmployeeRotation: this.props.employeeRotation.sort((a, b) => (a.employeeFullName < b.employeeFullName) ? -1 : 1),
        };
    }

    private async _bindFilters() {
        if (hubOptions.length == 0) {
            const stores = await this.props.services[EmployeeRotationService].fetchStores;
            hubOptions.push({ key: "All", text: "All" });
            stores.map(store => hubOptions.push({ key: store.id, text: store.storeDescription }));
        }
        if (participationStatusOptions.length == 0) {
            participationStatusOptions.push({ key: "All", text: "All" });
            participationStatusOptions.push(
                { key: RotationStatus.Graduate.name, text: RotationStatus.Graduate.name },
                { key: RotationStatus.Terminated.name, text: RotationStatus.Terminated.name });
        }
    }

    public async componentDidMount() {
        this._bindFilters();
    }

    private _resetFilters() {
        this.setState({
            hubFilter: this._defaultFilterValue,
            participationStatusFilter: this._defaultFilterValue,
            searchFilter: this._defaultSearchText
        });
    }

    public componentDidUpdate(nextProps: IProps) {
        if (nextProps.employeeRotation != this.props.employeeRotation) {
            this.setState({
                filteredEmployeeRotation: [...nextProps.employeeRotation]
            });
            this._filterEmployeeRotations(this.state.hubFilter, this.state.participationStatusFilter, this.state.searchFilter);
        }
    }

    private _onItemInvoked = (item: EmployeeRotation) => {
        this.props.onSelectEmployee(item);
    }

    private _filterEmployeeRotations(hubVal: string, participationStatusVal: string, searchTerm: string) {
        const { employeeRotation } = this.props;
        let filteredEmployeeRotations: EmployeeRotation[] = employeeRotation;

        if (hubVal != this._defaultFilterValue) {
            filteredEmployeeRotations = filteredEmployeeRotations.filter(e =>
                e.homeStore.storeDescription === hubVal
            );
        }
        if (participationStatusVal != this._defaultFilterValue) {
            filteredEmployeeRotations = filteredEmployeeRotations.filter(e =>
                e.rotationStatus.name === participationStatusVal
            );
        }

        if (searchTerm != this._defaultSearchText) {
            filteredEmployeeRotations = Entity.search(this.props.employeeRotation, searchTerm, false);
        }

        this.setState({
            filteredEmployeeRotation: filteredEmployeeRotations.sort((a, b) => (a.employeeFullName < b.employeeFullName) ? -1 : 1),
            hubFilter: hubVal,
            searchFilter: searchTerm
        });
    }

    private _renderItemColumn(item: EmployeeRotation, index: number, column: IColumn) {
        const fieldContent = item[column.fieldName as keyof EmployeeRotation] as any;
        switch (column.key) {
            case "employeeName":
                const nameofEmployee = item.employeeName;
                return <div>
                    <UserList users={nameofEmployee ? [nameofEmployee] : []} optionalTitle={item.employeeFullName} />
                </div>;
            case "hub":
                const hub = item.homeStore ? item.homeStore.storeDescription : "-";
                return <div className={styles.detailsListCol}>
                    {hub}
                </div>;
            case "rotationStatus":
                const status = fieldContent == null || fieldContent == undefined ? "" : fieldContent.name;
                return <div className={styles.detailsListCol}>
                    {status}
                </div>;
            default:
                return <span className={styles.detailsListCol}>{fieldContent}</span >;

        }
    }


    public render(): ReactElement<IProps> {
        const { filteredEmployeeRotation, hubFilter, participationStatusFilter, searchFilter, columns } = this.state;
        const formerEmployeeRotations = filteredEmployeeRotation.filter(employeeRotation =>
            employeeRotation.rotationStatus == RotationStatus.Graduate || employeeRotation.rotationStatus == RotationStatus.Terminated);
        const dropdownStyles = classNamesFunction<IDropdownStyleProps, IDropdownStyles>()({});
        dropdownStyles.dropdown = styles.onFocusDrodown;
        return (
            <ResponsiveGrid className={styles.formerAssociates}>
                <GridRow className={styles.filterRow}>
                    <GridCol sm={12} md={4} className={styles.searchCointainer}>
                        <SearchBox
                            placeholder="Search Name or Program Name"
                            ariaLabel="Search Name or Program Name"
                            onSearch={searchVal => this._filterEmployeeRotations(hubFilter, participationStatusFilter, searchVal)}
                            onClear={() => this._filterEmployeeRotations(hubFilter, participationStatusFilter, this._defaultSearchText)}
                            disableAnimation
                            className={styles.onFocus}
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
                                this._filterEmployeeRotations(val.text, participationStatusFilter, searchFilter);
                            }}
                            styles={dropdownStyles}
                            aria-describedby="noItem"
                            className="HubFilterDropdown"
                        />
                    </GridCol>
                    <GridCol sm={12} md={2}>
                        <Dropdown
                            label="Participation Status"
                            placeholder="Participation Status"
                            ariaLabel="Participation Status Filter."
                            defaultSelectedKey={participationStatusFilter}
                            options={participationStatusOptions}
                            onChanged={(val) => {
                                this._filterEmployeeRotations(hubFilter, val.text, searchFilter);
                            }}
                            styles={dropdownStyles}
                            aria-describedby="noItem"
                            className="PartiStatusDropdown"
                        />
                    </GridCol>
                </GridRow>
                <GridRow className={styles.detailListContainer}>
                    <GridCol>
                        {formerEmployeeRotations.length <= 0 && <div id={"noItem"} className={styles.noItemText}> There are no employees available..</div>}
                        {formerEmployeeRotations.length > 0 && <div id={"noItem"} className={styles.detailGridView}>
                            {formerEmployeeRotations.length + " employees results are shown below."}
                            <DetailsList
                                setKey="items"
                                className={styles.detailsListRow}
                                items={formerEmployeeRotations}
                                columns={columns}
                                layoutMode={DetailsListLayoutMode.justified}
                                isHeaderVisible={true}
                                selectionMode={SelectionMode.none}
                                onItemInvoked={this._onItemInvoked}
                                onRenderItemColumn={this._renderItemColumn.bind(this)}
                            >
                            </DetailsList></div>}
                    </GridCol>
                </GridRow>
            </ResponsiveGrid>);




    }

}
export default withServices(FormerAssociates);