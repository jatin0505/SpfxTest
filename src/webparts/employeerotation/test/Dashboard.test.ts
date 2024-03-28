import * as React from 'react';
import { configure, mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import _ from 'lodash';
import { Dashboard, IProps, IState } from '../../../components/Dashboard';
import { employeeRotationServicesMock } from './MockData/MockData_Instances';
import { PivotItem, Pivot, PrimaryButton } from '@fluentui/react';
import { EmployeeRotationEditor } from '../../../components/EmployeeRotationEditor';
import { CurrentAssociates } from '../../../components/CurrentAssociates';
import { getEmployeeRotation } from './MockData/EmployeeRotationMockData';
import { FormerAssociates } from '../../../components/FormerAssociates';


configure({ adapter: new Adapter() });

describe('Enzyme basics', () => {

    let reactDashbaordComponent: ReactWrapper<IProps, IState>;


    beforeEach(() => {
        reactDashbaordComponent = mount(
            React.createElement(
                Dashboard,
                {
                    services: employeeRotationServicesMock
                }
            ));
    });

    afterEach(() => {
        reactDashbaordComponent.unmount();

    });

    it('Should render Dashboard Div', () => {
        let parentDiv = reactDashbaordComponent.find('.dashboard');
        let parentDivLen = parentDiv.length;
        expect(parentDivLen).toBe(1);
    });

    it('Should trigger the function to open panel on click of Add new button at Dashboard', () => {
        let primaryButton = reactDashbaordComponent.find(PrimaryButton);
        primaryButton.simulate('click');
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('selectedEmployeeRotation')).not.toBe(null);
    });

    it('Should trigger the function to on click of Tabs at Dashboard', () => {
        let pivot = reactDashbaordComponent.find(Pivot);
        let CurrentAssociateItem: PivotItem = pivot.getElement().props.children[0];
        let FormerAssociateItem: PivotItem = pivot.getElement().props.children[1];

        pivot.props().onLinkClick(CurrentAssociateItem);
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('selectedKey')).toBe("0");

        pivot.props().onLinkClick(FormerAssociateItem);
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('selectedKey')).toBe("1");
    });

    it('Should trigger the function to open edit panel on select of employee rotation from Current Associates', () => {
        let currentAssociatesElement = reactDashbaordComponent.find(CurrentAssociates);
        currentAssociatesElement.props().onSelectEmployee(getEmployeeRotation()[0]);
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('selectedKey')).not.toBe(null);
    });

    it('Should trigger the function to open edit panel on select of employee rotation from Former Associates', () => {
        let FormerAssociatesElement = reactDashbaordComponent.find(FormerAssociates);
        FormerAssociatesElement.props().onSelectEmployee(getEmployeeRotation()[1]);
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('selectedKey')).not.toBe(null);
    });

    it('Should trigger the function to open edit panel on select of employee rotation from Former Associates', () => {
        let employeeEditorElement = reactDashbaordComponent.find(EmployeeRotationEditor);
        employeeEditorElement.props().onClose();
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('reloadList')).toBe(true);
    });



});