import * as React from 'react';
import { configure, mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import _ from 'lodash';
import { CurrentAssociates, IProps, IState } from '../../../components/CurrentAssociates';
import { employeeRotationServicesMock } from './MockData/MockData_Instances';
import { getEmployeeRotation } from './MockData/EmployeeRotationMockData';
import { DefaultButton, DetailsList, Dropdown, SearchBox } from '@fluentui/react';


configure({ adapter: new Adapter() });

describe('Enzyme basics', () => {

    let reactDashbaordComponent: ReactWrapper<IProps, IState>;
    let EmployeeSelectMockFunction = jest.fn();

    beforeEach(() => {
        reactDashbaordComponent = mount(
            React.createElement(
                CurrentAssociates,
                {
                    employeeRotation: getEmployeeRotation(),
                    onSelectEmployee: EmployeeSelectMockFunction,
                    services: employeeRotationServicesMock,
                    pageLoadCount: 1
                }
            ));
    });

    afterEach(() => {
        reactDashbaordComponent.unmount();

    });

    // it('Should render currentAssociates Div', () => {
    //     let parentDiv = reactDashbaordComponent.find('.currentAssociates');
    //     let parentDivLen = parentDiv.length;
    //     expect(parentDivLen).toBe(1);
    // });

    it('Should search the employees onchange of seacrh box value', () => {
        let searchBoxElement = reactDashbaordComponent.find(SearchBox);
        searchBoxElement.props().onSearch("Chaitanya");
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('searchTermFilter')).toBe("Chaitanya");
    });

    it('Should search the employees onchange of Focus Area dropdown', () => {
        let Element = reactDashbaordComponent.find(Dropdown).filterWhere(x => x.props().label == "Focus Area");
        Element.props().onChanged({ key: 1, text: "SMB" });
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('focusAreaFilter')).toBe("SMB");
    });

    it('Should search the employees onchange of Hub dropdown', () => {
        let Element = reactDashbaordComponent.find(Dropdown).filterWhere(x => x.props().label == "Hub");
        Element.props().onChanged({ key: 1, text: "0001 Store" });
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('hubFilter')).toBe("0001 Store");
    });
    it('Should search the employees onchange of Status dropdown', () => {
        let Element = reactDashbaordComponent.find(Dropdown).filterWhere(x => x.props().label == "Status");
        Element.props().onChanged({ key: "Approved", text: "Approved" });
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('statusFilter')).toBe("Approved");
    });
    it('Should change the view on click of icon', () => {
        let Element = reactDashbaordComponent.find(DefaultButton).filterWhere(x => x.props().text == "List");
        let event: React.MouseEvent<HTMLElement>;
        Element.props().onClick(event);
        reactDashbaordComponent.instance().forceUpdate();
        expect(reactDashbaordComponent.state('isListView')).toBe(false);
    });

    it('Should invoke the function to open panel on select of row in listview', () => {
        let DetailListElement = reactDashbaordComponent.find(".detailsList");
        let rowElement = DetailListElement.find('.ms-FocusZone .ms-DetailsRow').filterWhere(x => x.props().role == "row").at(0);
        let event: React.MouseEvent<HTMLElement>;
        rowElement.props().onClick(event);
    });

});