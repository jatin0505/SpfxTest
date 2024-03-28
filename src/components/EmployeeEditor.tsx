import _ from 'lodash';
import React, { } from "react";
import {
    PrimaryButton, DefaultButton, TextField, Toggle
} from "@fluentui/react";
import { withServices, ServicesProp, EmployeeRotationServiceProp, EmployeeRotationService } from "../services";
import {
    IDataPanelBaseProps, IDataPanelBaseState, DataPanelMode, EntityPanelBase, ResponsiveGrid, GridRow, GridCol
} from "common/components";
import { EmployeeRotation, FocusAreaAssignment } from "model";


interface IOwnState {
    employeeRotation: EmployeeRotation;
    isAddAssignment: boolean;
    newAssignment: FocusAreaAssignment;
}

export interface IOwnProps {
    showPanel: boolean;
    onDismiss: () => void;
}
type IEmployeeProps = IOwnProps & IDataPanelBaseProps<EmployeeRotation> & ServicesProp<EmployeeRotationServiceProp>;
type IEmployeeState = IOwnState & IDataPanelBaseState<EmployeeRotation>;


class EmployeeEditor extends EntityPanelBase<EmployeeRotation, IEmployeeProps, IEmployeeState> {
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
            employeeRotation: this.entity,
            isAddAssignment: false,
            newAssignment: null
        };
    }

    protected async persistChangesCore() {
        const { [EmployeeRotationService]: employeeRotation } = this.props.services;
        employeeRotation.track(this.entity);
        await employeeRotation.persistEmployeeRotation();
        if (this.state.isAddAssignment) {
            this.state.newAssignment.employeeRotation.set(this.entity);
            employeeRotation.track(this.state.newAssignment);
            await employeeRotation.persistFocusAreaAssignment();
        }
    }

    public get title(): string {
        return "New Program";
    }

    private _addNewAssignment() {
        let assignment = new FocusAreaAssignment();
        this.setState({ isAddAssignment: true, newAssignment: assignment });
    }

    public renderEditContent(): JSX.Element {
        return (
            <ResponsiveGrid>
                <GridRow>
                    {!this.state.isAddAssignment && <GridCol sm={6} md={6}>
                        <TextField
                            label={"Organisation"}
                            maxLength={100}
                            value={this.entity && this.entity.organization}
                            onChange={(el, val) =>
                                this.updateField(emp => emp.organization = val)
                            }
                            required={true}
                            ariaLabel={"Organisation"}
                            title={"Organisation"}
                            tabIndex={0}
                        />
                        <PrimaryButton text="Add Assignment" onClick={() => this._addNewAssignment()} />

                    </GridCol>}
                    {this.state.isAddAssignment && <GridCol sm={6} md={6}>
                        <Toggle label={"currentFocusArea"}
                            checked={this.state.newAssignment && this.state.newAssignment.currentFocusArea}
                            onText={this.state.newAssignment && this.state.newAssignment.currentFocusArea ? "Yes" : "No"}
                            offText={this.state.newAssignment && this.state.newAssignment.currentFocusArea ? "Yes" : "No"}
                            onChange={(el, val) => {
                                this.state.newAssignment.currentFocusArea = val;
                            }}
                            ariaLabel={"currentFocusArea"}
                            title={"currentFocusArea"}
                            tabIndex={0}
                        />
                    </GridCol>}
                </GridRow>
            </ResponsiveGrid>
        );
    }

    protected renderEditFooterElements(): JSX.Element[] {
        const { submitting } = this.state;
        const onSubmit = () => this.submit(() => this.setState({ isAddAssignment: false, newAssignment: null }));
        const onConfirmDiscard = () => this.confirmDiscard();
        return [
            <PrimaryButton text="Save" onClick={onSubmit} disabled={submitting} />,
            <DefaultButton text="Cancel" onClick={onConfirmDiscard} disabled={submitting} />
        ];
    }
}

export default withServices(EmployeeEditor);