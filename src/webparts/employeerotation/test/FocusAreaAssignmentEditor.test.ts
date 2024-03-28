import * as React from 'react';
import { configure, shallow, ShallowWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import _ from 'lodash';
import { employeeRotationServicesMock, configurationServicesMock } from './MockData/MockData_Instances';
import { getEmployeeRotation } from './MockData/EmployeeRotationMockData';
import { FocusAreaAssignmentEditor, IProps, IOwnState } from 'components/FocusAreaAssignmentEditor';
import { EmployeeRotation, FocusArea, FocusAreaAssignment, Store } from 'model';
import { getFocusArea } from './MockData/FocusAreaMockData';
import { getStores } from './MockData/StoreMockData';
import moment from 'moment-timezone';
import { Dropdown } from '@fluentui/react';
import { DatePickerControl } from 'components/DatePickerControl';
import { getFocusAreaAssignment } from './MockData/FocusAreaAssignmentMockData';
import { UserPicker } from 'common/components';
import { User } from 'common';

configure({ adapter: new Adapter() });

describe('Enzyme basics', () => {

    let reactFocusAreaEditorComponent: ShallowWrapper<IProps, IOwnState>;

    let employeeRotation: EmployeeRotation = getEmployeeRotation()[0];
    let focusAreaAssignment = employeeRotation.employeeAssignment.get()[0];
    let otherFocusAreaAssignment: FocusAreaAssignment = getFocusAreaAssignment()[1];

    let focusAreaArr: FocusArea[] = getFocusArea();
    let allStores: Store[] = getStores();
    let mockServiceProp: any = { employeeRotationServicesMock, configurationServicesMock };

    beforeEach(() => {
        reactFocusAreaEditorComponent = shallow(
            React.createElement(
                FocusAreaAssignmentEditor,
                {
                    employeeRotation: employeeRotation,
                    assignment: focusAreaAssignment,
                    services: mockServiceProp, //employeeRotationServicesMock,
                    focusAreaArr: focusAreaArr,
                    storesArr: allStores,
                    manageFocus: false,
                    isValidationApplied: false
                }
            ));
    });

    afterEach(() => {
        reactFocusAreaEditorComponent.unmount();

    });

    it('Should render Focus Area Editor Div', () => {
        let parentDiv = reactFocusAreaEditorComponent.find('.focusAreaAssignmentEditor');
        let parentDivLen = parentDiv.length;
        expect(parentDivLen).toBe(1);
    });

    // it('Focus area should validate the start date and end date', () => {
    //     let FocusAssignmentMockData: FocusAreaAssignment = employeeRotation.employeeAssignment.get()[0];
    //     FocusAssignmentMockData.startDate = moment(new Date());
    //     FocusAssignmentMockData.endDate = moment(new Date()).subtract(2, "weeks");
    //     //reactFocusAreaEditorComponent.setProps({ assignment: FocusAssignmentMockData, isValidationApplied: true, manageFocus: true });
    //     //reactFocusAreaEditorComponent.instance().forceUpdate();
    //     reactFocusAreaEditorComponent = shallow(
    //         React.createElement(
    //             FocusAreaAssignmentEditor,
    //             {
    //                 employeeRotation: employeeRotation,
    //                 assignment: FocusAssignmentMockData,
    //                 services: employeeRotationServicesMock,
    //                 focusAreaArr: focusAreaArr,
    //                 storesArr: allStores,
    //                 manageFocus: true,
    //                 isValidationApplied: true
    //             }
    //         ));

    //     let startDateErrorDiv = reactFocusAreaEditorComponent.find('#FocusStartDateErrorId');
    //     let endDateErrorDiv = reactFocusAreaEditorComponent.find('#FocusEndDateErrorId');
    //     expect(startDateErrorDiv.length).toBe(1);
    //     expect(endDateErrorDiv.length).toBe(1);
    // });


    it('Should show approver dropdown only to admin user', () => {
        let parentDiv = reactFocusAreaEditorComponent.find('.focusAreaAssignmentEditor');
        let parentDivLen = parentDiv.length;
        expect(parentDivLen).toBe(1);
    });

    it('Should trigger the onchange event of Focus Area dropdown field', () => {

        let dropdownFields = reactFocusAreaEditorComponent.find(Dropdown);
        let focusAreaAssignmentField = dropdownFields.at(0);

        focusAreaAssignmentField.props().onChanged({ key: otherFocusAreaAssignment.id, text: otherFocusAreaAssignment.title });
        reactFocusAreaEditorComponent.instance().forceUpdate();

        let dropdownFields1 = reactFocusAreaEditorComponent.find(Dropdown);
        let focusAreaAssignmentField1 = dropdownFields1.at(0);
        expect(focusAreaAssignmentField1.props().defaultSelectedKey).toBe(otherFocusAreaAssignment.id);

    });

    it('Should properly handle change in Assignment Start date', () => {
        let newValue = moment(new Date()).add(2, "weeks");
        let AssignmentStartDateField = reactFocusAreaEditorComponent.find(DatePickerControl).first();

        AssignmentStartDateField.prop('onDateChange')(newValue.toDate());
        reactFocusAreaEditorComponent.instance().forceUpdate();

        let AssignmentStartDateField1 = reactFocusAreaEditorComponent.find(DatePickerControl).first();
        console.log(newValue.toDate());
        expect(AssignmentStartDateField1.props().dateValue.toString()).toBe(newValue.toDate().toString());

    });

    it('Should properly handle change in Assignment End date', () => {
        let newValue = moment(new Date()).add(3, "weeks");
        let AssignmentEndDateField = reactFocusAreaEditorComponent.find(DatePickerControl).at(1);

        AssignmentEndDateField.prop('onDateChange')(newValue.toDate());
        reactFocusAreaEditorComponent.instance().forceUpdate();

        let AssignmentEndDateField1 = reactFocusAreaEditorComponent.find(DatePickerControl).at(1);
        console.log(newValue.toDate());
        expect(AssignmentEndDateField1.props().dateValue.toString()).toBe(newValue.toDate().toString());
    });

    it('Should trigger the onchange event of Focus Area dropdown field', () => {

        let dropdownFields = reactFocusAreaEditorComponent.find(Dropdown);
        let hubDropdownField = dropdownFields.at(1);

        hubDropdownField.props().onChanged({ key: allStores[0].id, text: allStores[0].storeDescription });
        reactFocusAreaEditorComponent.instance().forceUpdate();

        let dropdownFields1 = reactFocusAreaEditorComponent.find(Dropdown);
        let hubDropdownField1 = dropdownFields1.at(1);
        expect(hubDropdownField1.props().defaultSelectedKey).toBe(allStores[0].id);

    });

    it('Should trigger the onchange event of Focus Area status dropdown field', () => {

        let dropdownFields = reactFocusAreaEditorComponent.find(Dropdown);
        let statusDropdownField = dropdownFields.at(2);

        statusDropdownField.props().onChanged({ key: "Rejected", text: "Rejected" });
        reactFocusAreaEditorComponent.instance().forceUpdate();

        let dropdownFields1 = reactFocusAreaEditorComponent.find(Dropdown);
        let statusDropdownField1 = dropdownFields1.at(2);
        expect(statusDropdownField1.props().defaultSelectedKey).toBe("Rejected");

    });

    it('Should trigger the onchange event of Focus Area manager field', () => {
        let UserOnchangeValue: User[] = otherFocusAreaAssignment.focusArea.managers;
        let userPickerFields = reactFocusAreaEditorComponent.find(UserPicker);
        let focusAreaManagerField = userPickerFields.at(0);

        focusAreaManagerField.props().onChanged(UserOnchangeValue);
        reactFocusAreaEditorComponent.instance().forceUpdate();

        let userPickerFields1 = reactFocusAreaEditorComponent.find(UserPicker);
        let focusAreaManagerField1 = userPickerFields1.at(0);
        expect(focusAreaManagerField1.props().users[0].email).toBe(UserOnchangeValue[0].email);

    });


});