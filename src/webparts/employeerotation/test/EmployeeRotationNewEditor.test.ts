import * as React from 'react';
import { configure, mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import _ from 'lodash';
import { PivotItem, Pivot, PrimaryButton, TextField, Dropdown, DefaultButton } from '@fluentui/react';
import { EmployeeRotationEditor, IEmployeeProps, IEmployeeState } from 'components/EmployeeRotationEditor';
//import { FocusAreaAssignmentEditor, IProps, IOwnState } from 'components/FocusAreaAssignmentEditor';
import { employeeRotationServicesMock, configurationServicesMock } from './MockData/MockData_Instances';
import { EmployeeRotation, FocusArea, FocusAreaAssignment, FocusAreaStatus, Store } from 'model';
import { getEmployeeRotation } from './MockData/EmployeeRotationMockData';
import { getFocusArea } from './MockData/FocusAreaMockData';
import { getStores } from './MockData/StoreMockData';
import moment from 'moment-timezone';
import { User } from 'common';


configure({ adapter: new Adapter() });

describe('Test case when adding the new employee rotation with shallow', () => {
    let reactEmployeeRotationEditorNewComponent: ShallowWrapper<IEmployeeProps, IEmployeeState>;

    let employeeRotation: EmployeeRotation = new EmployeeRotation();
    let focusAreaAssignments = employeeRotation.employeeAssignment.get();
    let focusAreaArr: FocusArea[] = getFocusArea();
    let allStores: Store[] = getStores();
    let mockServiceProp: any = { employeeRotationServicesMock, configurationServicesMock };

    beforeEach(() => {
        reactEmployeeRotationEditorNewComponent = shallow(
            React.createElement(
                EmployeeRotationEditor,
                {
                    onSelectedFocusArea: jest.fn(),
                    onClose: jest.fn(),
                    services: mockServiceProp, //employeeRotationServicesMock,
                    componentRef: ref => ref.edit(employeeRotation),
                    allEmployees: getEmployeeRotation()
                }
            ));
    });

    afterEach(() => {
        reactEmployeeRotationEditorNewComponent.unmount();

    });

    it('Should render Employee Rotation Editor Panel', () => {
        let parentDiv = reactEmployeeRotationEditorNewComponent.find('.employeeRotationDiv').first();
        let parentDivLen = parentDiv.length;
        expect(parentDivLen).toBe(1);

    });

    it('Should render employee details in edit format if employee rotation new form is opened', () => {
        let employeeReadOnlyDetailsDiv = reactEmployeeRotationEditorNewComponent.find('.employeeRotationEditorSection').first();
        let employeeReadOnlyDetailsDivLen = employeeReadOnlyDetailsDiv.length;
        expect(employeeReadOnlyDetailsDivLen).toBe(1);
    });

    it('Should trigger the onchange event of Postgraduation text field', () => {
        let newValue = "New Postgraduation";
        let textFields = reactEmployeeRotationEditorNewComponent.find(TextField);
        let PostgraduationField = textFields.at(0);

        PostgraduationField.prop('onChange')(null, newValue);
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();

        let textFields1 = reactEmployeeRotationEditorNewComponent.find(TextField);
        let PostgraduationField1 = textFields1.at(0);
        expect(PostgraduationField1.props().value).toBe(newValue);
    });

    it('Should trigger the onchange event of Organization text field', () => {
        let newValue = "New Organization";
        let textFields = reactEmployeeRotationEditorNewComponent.find(TextField);
        let organizationField = textFields.at(1);

        organizationField.prop('onChange')(null, newValue);
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();

        let textFields1 = reactEmployeeRotationEditorNewComponent.find(TextField);
        let organizationField1 = textFields1.at(1);
        expect(organizationField1.props().value).toBe(newValue);
    });

    it('Should trigger the onchange event of Hub Dropdown field', () => {


        let dropdownFields = reactEmployeeRotationEditorNewComponent.find(Dropdown);
        let hubDropdownField = dropdownFields.at(0);

        hubDropdownField.props().onChanged({ key: allStores[0].id, text: allStores[0].storeDescription });
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();

        let dropdownFields1 = reactEmployeeRotationEditorNewComponent.find(Dropdown);
        let hubDropdownField1 = dropdownFields1.at(0);
        expect(hubDropdownField1.props().defaultSelectedKey).toBe(allStores[0].id);
    });

    it('Should trigger the onchange event of Graduation status field', () => {

        let dropdownFields = reactEmployeeRotationEditorNewComponent.find(Dropdown);
        let GraduationStatusField = dropdownFields.at(1);

        GraduationStatusField.props().onChanged({ key: "Active", text: "Active" });
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();

        let dropdownFields1 = reactEmployeeRotationEditorNewComponent.find(Dropdown);
        let GraduationStatusField1 = dropdownFields1.at(1);
        expect(GraduationStatusField1.props().defaultSelectedKey).toBe("Active");

    });

    it('Should trigger cancel button', () => {
        let backFocusAreaButton = reactEmployeeRotationEditorNewComponent.find(DefaultButton).first();
        backFocusAreaButton.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();
        expect(reactEmployeeRotationEditorNewComponent.state("isEdited")).toBe(false);
    });
});

describe('Test case when adding the new employee rotation with mount', () => {

    let reactEmployeeRotationEditorNewComponent: ReactWrapper<IEmployeeProps, IEmployeeState>;

    let employeeRotation: EmployeeRotation = new EmployeeRotation();
    let focusAreaAssignments = employeeRotation.employeeAssignment.get();
    let focusAreaArr: FocusArea[] = getFocusArea();
    let allStores: Store[] = getStores();
    let mockServiceProp: any = { employeeRotationServicesMock, configurationServicesMock };

    beforeEach(() => {
        reactEmployeeRotationEditorNewComponent = mount(
            React.createElement(
                EmployeeRotationEditor,
                {
                    onSelectedFocusArea: jest.fn(),
                    onClose: jest.fn(),
                    services: mockServiceProp, //employeeRotationServicesMock,
                    componentRef: ref => ref.edit(employeeRotation),
                    allEmployees: getEmployeeRotation()
                }
            ));
    });

    afterEach(() => {
        reactEmployeeRotationEditorNewComponent.unmount();

    });

    it('Should render completed focus Area details section with no assignments', () => {
        let focusAreaCompletedDiv = reactEmployeeRotationEditorNewComponent.find('.focusAreaCompleted').hostNodes();
        expect(focusAreaCompletedDiv.length).toBe(0);
    });

    it('Should render current focus Area details section with no assignments', () => {
        let focusAreaCurrentDiv = reactEmployeeRotationEditorNewComponent.find('.focusAreaCurrent').hostNodes();
        expect(focusAreaCurrentDiv.length).toBe(0);
    });

    it('Should render next focus Area details section with no assignments', () => {
        let focusAreaNextdDiv = reactEmployeeRotationEditorNewComponent.find('.focusAreaNext').hostNodes();
        expect(focusAreaNextdDiv.length).toBe(0);
    });

    it('Should validate the required field validations on submittion', () => {
        let submitbutton = reactEmployeeRotationEditorNewComponent.find(".submitInsidePanel").hostNodes();
        submitbutton.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();
        let showValidationFeedback = reactEmployeeRotationEditorNewComponent.state("showValidationFeedback");
        expect(showValidationFeedback).toBe(true);
        //let employeeRotationEditorSection = reactEmployeeRotationEditorNewComponent.find('.employeeRotationEditorSection').hostNodes();

        //let errorDiv = reactEmployeeRotationEditorNewComponent.find('.error-message').hostNodes();
        //expect(errorDiv.length).toBe(5);
    });

    it('Should validate the required field validations on add Focus Area Button', () => {
        let submitbutton = reactEmployeeRotationEditorNewComponent.find(".addFocusAreaButton").hostNodes();
        submitbutton.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();
        let errorDiv = reactEmployeeRotationEditorNewComponent.find('.error-message').hostNodes();
        expect(errorDiv.length).toBe(5);
    });

});

describe('Test case when adding the new Focus Area with data in fields', () => {

    let reactEmployeeRotationEditorNewComponent: ReactWrapper<IEmployeeProps, IEmployeeState>;

    let employeeRotation: EmployeeRotation = new EmployeeRotation();
    let focusAreaAssignment: FocusAreaAssignment = new FocusAreaAssignment();

    let focusAreaArr: FocusArea[] = getFocusArea();
    let allStores: Store[] = getStores();
    let mockServiceProp: any = { employeeRotationServicesMock, configurationServicesMock };

    employeeRotation.employeeName = new User(8, "Jashwanth", "Jashwanth@spstudiodev.onmicrosoft.com", "Jashwanth@spstudiodev.onmicrosoft.com", "", 1);
    employeeRotation.reporteeManager = new User(8, "Jashwanth", "Jashwanth@spstudiodev.onmicrosoft.com", "Jashwanth@spstudiodev.onmicrosoft.com", "", 1);
    employeeRotation.homeStore = allStores[0];
    employeeRotation.startDate = moment(new Date()).subtract(5, "weeks");
    employeeRotation.expectedEndDate = moment(new Date()).add(8, "weeks");

    focusAreaAssignment.focusArea = focusAreaArr[0];
    focusAreaAssignment.startDate = moment(new Date()).subtract(4, "weeks");
    focusAreaAssignment.endDate = moment(new Date()).add(4, "weeks");
    focusAreaAssignment.store = allStores[0];
    focusAreaAssignment.focusAreaManager = new User(8, "Jashwanth", "Jashwanth@spstudiodev.onmicrosoft.com", "Jashwanth@spstudiodev.onmicrosoft.com", "", 1);
    focusAreaAssignment.employeeRotation.set(employeeRotation);
    beforeEach(() => {
        reactEmployeeRotationEditorNewComponent = mount(
            React.createElement(
                EmployeeRotationEditor,
                {
                    onSelectedFocusArea: jest.fn(),
                    onClose: jest.fn(),
                    services: mockServiceProp, //employeeRotationServicesMock,
                    componentRef: ref => ref.edit(employeeRotation),
                    allEmployees: getEmployeeRotation()
                }
            ));
    });

    afterEach(() => {
        reactEmployeeRotationEditorNewComponent.unmount();

    });


    it('Should render focus area assignment component in panel on click of add assignmment button', () => {

        let addFocusAreabutton = reactEmployeeRotationEditorNewComponent.find(".addFocusAreaButton").hostNodes();
        addFocusAreabutton.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();

        let focusAreaAssignmentEditorElem = reactEmployeeRotationEditorNewComponent.find(".focusAreaAssignmentEditor").hostNodes();
        let isAddAssignmentState = reactEmployeeRotationEditorNewComponent.state("isAddAssignment");
        expect(isAddAssignmentState).toBe(true);
        expect(focusAreaAssignmentEditorElem.length).toBe(1);
    });

    it('Should render Focus Area Editor Div', () => {
        let addFocusAreabutton = reactEmployeeRotationEditorNewComponent.find(".addFocusAreaButton").hostNodes();
        addFocusAreabutton.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();

        let parentDiv = reactEmployeeRotationEditorNewComponent.find('.focusAreaAssignmentEditor').hostNodes();
        let parentDivLen = parentDiv.length;
        expect(parentDivLen).toBe(1);
    });

    it('Should validate the required field validations of Focus Area assignment editor on submittion', () => {
        let submitbutton = reactEmployeeRotationEditorNewComponent.find(".submitInsidePanel").hostNodes();
        submitbutton.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();

        //let errorDiv = reactEmployeeRotationEditorNewComponent.find('.error-message').hostNodes();
        //expect(errorDiv.length).toBe(4);
    });

    it('Should show approver dropdown only to admin user', () => {
        let addFocusAreabutton = reactEmployeeRotationEditorNewComponent.find(".addFocusAreaButton").hostNodes();
        addFocusAreabutton.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();

        let focusAreaStatusDropdownDiv = reactEmployeeRotationEditorNewComponent.find('.FocusAreaStatusDropdown').hostNodes();
        expect(focusAreaStatusDropdownDiv.length).toBe(1);
    });

    it('Focus area assignment should validate and submit succesfully on submittion button', () => {
        let employeeRotationWrapperInstance = reactEmployeeRotationEditorNewComponent.instance();
        let addFocusAreabutton = reactEmployeeRotationEditorNewComponent.find(".addFocusAreaButton").hostNodes();
        addFocusAreabutton.simulate('click');
        employeeRotationWrapperInstance.forceUpdate();
        //===========================================================================================================//

        employeeRotationWrapperInstance.setState({ newAssignment: focusAreaAssignment });

        //===========================================================================================================//
        let submitbutton = reactEmployeeRotationEditorNewComponent.find(".submitInsidePanel").hostNodes();
        submitbutton.simulate('click');
        employeeRotationWrapperInstance.forceUpdate();

        let errorDiv = reactEmployeeRotationEditorNewComponent.find('.error-message').hostNodes();
        expect(errorDiv.length).toBe(0);
    });

    it('Employee Rotation should validate and get submit succesfully on submittion button', () => {
        let submitbutton = reactEmployeeRotationEditorNewComponent.find(".submitInsidePanel").hostNodes();
        submitbutton.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();

        let errorDiv = reactEmployeeRotationEditorNewComponent.find('.error-message').hostNodes();
        expect(errorDiv.length).toBe(0);
    });

    it('Should trigger back button after add assignment button', () => {
        let addFocusAreabutton = reactEmployeeRotationEditorNewComponent.find(".addFocusAreaButton").hostNodes();
        addFocusAreabutton.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();

        let backFocusAreaButton = reactEmployeeRotationEditorNewComponent.find('.backInsidePanel').hostNodes();
        backFocusAreaButton.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();
        expect(reactEmployeeRotationEditorNewComponent.state("isAddAssignment")).toBe(false);
    });



});

describe('Test case when editing the existing employee rotation and Focus Area', () => {

    let reactEmployeeRotationEditorNewComponent: ReactWrapper<IEmployeeProps, IEmployeeState>;

    let employeeRotation: EmployeeRotation = getEmployeeRotation()[0];
    let focusAreaAssignments = employeeRotation.employeeAssignment.get();

    let focusAreaArr: FocusArea[] = getFocusArea();
    let allStores: Store[] = getStores();
    let mockServiceProp: any = { employeeRotationServicesMock, configurationServicesMock };

    beforeEach(() => {
        reactEmployeeRotationEditorNewComponent = mount(
            React.createElement(
                EmployeeRotationEditor,
                {
                    onSelectedFocusArea: jest.fn(),
                    onClose: jest.fn(),
                    services: mockServiceProp, //employeeRotationServicesMock,
                    componentRef: ref => ref.edit(employeeRotation),
                    allEmployees: getEmployeeRotation()
                }
            ));
    });

    afterEach(() => {
        reactEmployeeRotationEditorNewComponent.unmount();

    });

    it("Should render the employee field in readonly mode", () => {
        let parentDiv = reactEmployeeRotationEditorNewComponent.find('.employeeReadOnlyDetails').hostNodes();
        let parentDivLen = parentDiv.length;
        expect(parentDivLen).toBe(1);
    });

    it('Should render Completed focus area Tiles', () => {
        const completedAssignment = focusAreaAssignments && focusAreaAssignments.filter(assign => assign.endDate && assign.endDate.isBefore(moment()));

        let focusAreaCompletedDiv = reactEmployeeRotationEditorNewComponent.find('.focusAreaCompleted').hostNodes();
        let focusAreaCompletedTilesLength = focusAreaCompletedDiv.findWhere(el => el.hasClass("focusAreaTile")).length
        expect(focusAreaCompletedDiv.length).toBe(1);
        expect(focusAreaCompletedTilesLength).toBe(completedAssignment.length);
    });

    it('Should render Current focus Area Tiles', () => {
        const currentAssignment = focusAreaAssignments && focusAreaAssignments.filter(assign => assign.startDate && assign.endDate && (assign.startDate.isSameOrBefore(moment()) && assign.endDate.isSameOrAfter(moment())));

        let focusAreaCurrentDiv = reactEmployeeRotationEditorNewComponent.find('.focusAreaCurrent').hostNodes();
        let focusAreaCurrentTilesLength = focusAreaCurrentDiv.findWhere(el => el.hasClass("focusAreaTile")).length

        expect(focusAreaCurrentDiv.length).toBe(1);
        expect(focusAreaCurrentTilesLength).toBe(currentAssignment.length);
    });

    it('Should render Next focus Area Tiles', () => {
        const nextAssignment = focusAreaAssignments && focusAreaAssignments.filter(assign => assign.startDate && assign.startDate.isAfter(moment()));

        let focusAreaNextdDiv = reactEmployeeRotationEditorNewComponent.find('.focusAreaNext').hostNodes();
        let focusAreaNextTilesLength = focusAreaNextdDiv.findWhere(el => el.hasClass("focusAreaTile")).length

        expect(focusAreaNextdDiv.length).toBe(1);
        expect(focusAreaNextTilesLength).toBe(nextAssignment.length);
    });

    it('Should render Focus Area Panel on click of Current Focus area Tile', () => {
        let focusAreaCurrentDiv = reactEmployeeRotationEditorNewComponent.find('.focusAreaCurrent').hostNodes();
        let focusAreaCurrentTiles = focusAreaCurrentDiv.findWhere(el => el.hasClass("focusAreaTile")).hostNodes().first();

        reactEmployeeRotationEditorNewComponent.instance().setState({ isEdited: true });
        focusAreaCurrentTiles.simulate('click');
        reactEmployeeRotationEditorNewComponent.instance().forceUpdate();
        expect(reactEmployeeRotationEditorNewComponent.state("isAddAssignment")).toBe(true);
    });

});

describe('Test case when editing the existing employee rotation and Focus Area', () => {

    let reactEmployeeRotationEditorNewComponent: ReactWrapper<IEmployeeProps, IEmployeeState>;

    let employeeRotation: EmployeeRotation = getEmployeeRotation()[0];
    let focusAreaAssignments = employeeRotation.employeeAssignment.get();

    let focusAreaArr: FocusArea[] = getFocusArea();
    let allStores: Store[] = getStores();
    let mockServiceProp: any = { employeeRotationServicesMock, configurationServicesMock };

    beforeEach(() => {
        reactEmployeeRotationEditorNewComponent = mount(
            React.createElement(
                EmployeeRotationEditor,
                {
                    onSelectedFocusArea: jest.fn(),
                    onClose: jest.fn(),
                    services: mockServiceProp, //employeeRotationServicesMock,
                    componentRef: ref => ref.display(employeeRotation),
                    allEmployees: getEmployeeRotation()
                }
            ));
    });

    afterEach(() => {
        reactEmployeeRotationEditorNewComponent.unmount();

    });

    it("Should render the employee field in readonly mode", () => {
        let parentDiv = reactEmployeeRotationEditorNewComponent.find('.employeeRotationDisplay').hostNodes();
        let parentDivLen = parentDiv.length;
        expect(parentDivLen).toBe(1);
    });
});