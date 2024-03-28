import React, { Component, ReactElement } from "react";
import { PivotItem, Pivot, PrimaryButton } from '@fluentui/react';
import { withServices, ServicesProp, EmployeeRotationServiceProp, EmployeeRotationService } from "services";
import { IDataPanelBase, AsyncDataComponent } from "common/components";
import { IAsyncData } from "common";
import { EmployeeRotation, FocusAreaAssignment, FocusAreaStatus, RotationStatus } from "model";
import EmployeeRotationEditor from "./EmployeeRotationEditor";
import FocusAreaAssignmentEditor from "./FocusAreaAssignmentEditor";
import CurrentAssociates from "./CurrentAssociates";
import PendingRequests from "./PendingRequests";

import styles from './styles/Dashboard.module.scss';
import FormerAssociates from "./FormerAssociates";

interface IOwnProps {
}
export type IProps = IOwnProps & ServicesProp<EmployeeRotationServiceProp>;

export interface IState {
    employeeRotationAsync: IAsyncData<EmployeeRotation[]>;
    focusAreaAssigmentAsync: IAsyncData<FocusAreaAssignment[]>;
    selectedEmployeeRotation: EmployeeRotation;
    selectedKey: string;
    selectedFocusArea: FocusAreaAssignment;
    reloadList: boolean;
    editFocusAreaAssignment: boolean;
}

export class Dashboard extends Component<IProps, IState> {
    private _employeeRotationPanel: IDataPanelBase<EmployeeRotation>;
    private _focusAreaAssignmentPanel: IDataPanelBase<FocusAreaAssignment>;
    private _pageloadCount: number = 0;
    constructor(props: IProps) {
        super(props);

        this.state = {
            employeeRotationAsync: props.services[EmployeeRotationService].employeeRotationsAsync,
            focusAreaAssigmentAsync: props.services[EmployeeRotationService].focusAreaAssignmentAsync,
            selectedKey: "",
            selectedEmployeeRotation: null,
            selectedFocusArea: null,
            editFocusAreaAssignment: false,
            reloadList: false
        };
    }

    private readonly _openEmployeeRotationEditor = (item: EmployeeRotation) => {
        this.setState({ selectedEmployeeRotation: item, selectedFocusArea: null, editFocusAreaAssignment: false });
        item.snapshot();
        this._employeeRotationPanel.display(item);
    }

    private readonly _openFocusAreaAssignmentEditor = (itemEmployeeRotation: EmployeeRotation, item: FocusAreaAssignment) => {
        this.setState({ selectedFocusArea: item, editFocusAreaAssignment: true });
        item.snapshot();
        this._employeeRotationPanel.edit(itemEmployeeRotation);
    }

    private readonly _newEmployeeRotationEditor = () => {
        let item = new EmployeeRotation();
        this.setState({
            selectedEmployeeRotation: item,
            selectedFocusArea: null, editFocusAreaAssignment: false
        });
        this._employeeRotationPanel.edit(item);
    }

    private readonly _openFormerEmployeeRotationDisplay = (item: EmployeeRotation) => {
        this.setState({ selectedEmployeeRotation: item, selectedFocusArea: null, editFocusAreaAssignment: false });
        item.snapshot();
        this._employeeRotationPanel.display(item);
    }

    private readonly _renderEmployeeDetails = (employees: EmployeeRotation[]) => {
        ++this._pageloadCount;
        return <CurrentAssociates employeeRotation={employees.filter(e => e.rotationStatus === RotationStatus.Active || e.rotationStatus === RotationStatus.Hold)}
            onSelectEmployee={(employee) => this._openEmployeeRotationEditor(employee)}
            onSelectFocusArea={(employee, assignment) => this._openFocusAreaAssignmentEditor(employee, assignment)}
            pageLoadCount={this._pageloadCount}
        ></CurrentAssociates>;
    }
    private readonly _renderPendingRequestDetails = (focusAreas: FocusAreaAssignment[]) => {
        const rotationDataFiltered = focusAreas.filter(e => e.status === FocusAreaStatus.Pending);

        return <PendingRequests focusAreaAssignments={rotationDataFiltered}
            onSelectEmployee={(focusAreaAssignment) => this._openFocusAreaAssignmentEditor(focusAreaAssignment.employeeRotation.get(), focusAreaAssignment)}></PendingRequests>;
    }
    private readonly _renderFormerEmployeeDetails = (employees: EmployeeRotation[]) => {
        return <FormerAssociates employeeRotation={employees.filter(e => e.rotationStatus === RotationStatus.Graduate || e.rotationStatus === RotationStatus.Terminated)}
            onSelectEmployee={(employee) => this._openFormerEmployeeRotationDisplay(employee)}></FormerAssociates>;
    }

    public render(): ReactElement<IProps> {
        const { employeeRotationAsync, selectedKey, focusAreaAssigmentAsync } = this.state;

        return (
            <div className={styles.dashboard} >
                <div>
                    <div className={styles.actions}>
                        <PrimaryButton text={"Add Associate"} iconProps={{ iconName: "New" }} onClick={() => this._newEmployeeRotationEditor()}></PrimaryButton>
                    </div>
                    <Pivot
                        selectedKey={selectedKey}
                        onLinkClick={(item) => {
                            this.setState({ selectedKey: item.props.itemKey });
                        }}
                    >
                        <PivotItem itemKey="0" headerText="Current Associates">
                            <div><AsyncDataComponent dataAsync={employeeRotationAsync}>
                                {this._renderEmployeeDetails}
                            </AsyncDataComponent>
                            </div>
                        </PivotItem>
                        <PivotItem itemKey="1" headerText="Pending Requests">
                            <div><AsyncDataComponent dataAsync={focusAreaAssigmentAsync}>
                                {this._renderPendingRequestDetails}
                            </AsyncDataComponent>
                            </div>
                        </PivotItem>
                        <PivotItem itemKey="2" headerText="Former Program Associates">
                            <div><AsyncDataComponent dataAsync={employeeRotationAsync}>
                                {this._renderFormerEmployeeDetails}
                            </AsyncDataComponent>
                            </div>
                        </PivotItem>
                    </Pivot>
                </div>

                <EmployeeRotationEditor
                    componentRef={ref => this._employeeRotationPanel = ref}
                    onClose={() => this.setState({ reloadList: true })}
                    allEmployees={employeeRotationAsync.data}
                    className={"customEmployeePanel"}
                    editFocusArea={this.state.editFocusAreaAssignment}
                    selectedFocusAreaAssignment={this.state.selectedFocusArea}
                ></EmployeeRotationEditor>
            </div>
        );
    }


}

export default withServices(Dashboard);