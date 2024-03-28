import * as React from 'react';
import { configure, mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import _ from 'lodash';
import { FormerAssociates, IProps, IState } from '../../../components/FormerAssociates';
import { employeeRotationServicesMock } from './MockData/MockData_Instances';
import { getEmployeeRotation } from './MockData/EmployeeRotationMockData';
import { DefaultButton, DetailsList, Dropdown, SearchBox } from '@fluentui/react';
import { RotationStatus } from 'model';


configure({ adapter: new Adapter() });

describe('Enzyme basics', () => {

    let reactFormerAssociateComponent: ShallowWrapper<IProps, IState>;
    let EmployeeSelectMockFunction = jest.fn();

    beforeEach(() => {
        reactFormerAssociateComponent = shallow(
            React.createElement(
                FormerAssociates,
                {
                    employeeRotation: getEmployeeRotation().filter(e => e.rotationStatus === RotationStatus.Graduate),
                    onSelectEmployee: EmployeeSelectMockFunction,
                    services: employeeRotationServicesMock
                }
            ));
    });

    afterEach(() => {
        reactFormerAssociateComponent.unmount();

    });

    it('Should render Former Associates Div', () => {
        let parentDiv = reactFormerAssociateComponent.find('.formerAssociates');
        let parentDivLen = parentDiv.length;
        expect(parentDivLen).toBe(1);
    });

    it('Should search the employees onchange of seacrh box value', () => {
        let searchBoxElement = reactFormerAssociateComponent.find(SearchBox);
        searchBoxElement.props().onSearch("Chaitanya");

        reactFormerAssociateComponent.instance().forceUpdate();
        expect(reactFormerAssociateComponent.state('searchFilter')).toBe("Chaitanya");

        searchBoxElement.props().onClear();
        reactFormerAssociateComponent.instance().forceUpdate();
        expect(reactFormerAssociateComponent.state('searchFilter')).toBe("");
    });

    it('Should search the employees onchange of Hub dropdown', () => {
        let Element = reactFormerAssociateComponent.find(Dropdown).filterWhere(x => x.props().label == "Hub");
        Element.props().onChanged({ key: 1, text: "0001 Store" });
        reactFormerAssociateComponent.instance().forceUpdate();
        expect(reactFormerAssociateComponent.state('hubFilter')).toBe("0001 Store");
    });


});


describe('Enzyme basics', () => {

    let reactFormerAssociateComponent: ReactWrapper<IProps, IState>;
    let EmployeeSelectMockFunction = jest.fn();

    beforeEach(() => {
        reactFormerAssociateComponent = mount(
            React.createElement(
                FormerAssociates,
                {
                    employeeRotation: getEmployeeRotation().filter(e => e.rotationStatus === RotationStatus.Graduate),
                    onSelectEmployee: EmployeeSelectMockFunction,
                    services: employeeRotationServicesMock
                }
            ));
    });

    afterEach(() => {
        reactFormerAssociateComponent.unmount();

    });

    it('Should invoke the function to open panel on select of row in listview', () => {

        let DetailListElement = reactFormerAssociateComponent.find(".detailsListRow");
        let rowElement = DetailListElement.hostNodes().find('.ms-FocusZone .ms-DetailsRow').filterWhere(x => x.props().role == "row").hostNodes();
        // let event: React.MouseEvent<HTMLElement>;
        // let event1: React.KeyboardEvent<HTMLElement>;

        // rowElement.parent().prop("onClick");
        // //     rowElement.props().onKeyDown(event1);
        // rowElement.props().onMouseDownCapture(event);
        // rowElement.prop("onClick");
        // rowElement.invoke("onKeyDown");
        // rowElement.invoke("onMouseDownCapture");

        // rowElement.simulate('keydown', { key: 'Enter' });
        //expect(EmployeeSelectMockFunction).toBeCalled();
    });

});