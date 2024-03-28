import * as React from 'react';
import { configure, mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import _ from 'lodash';
import { PendingRequests, IProps, IState } from '../../../components/PendingRequests';
import { employeeRotationServicesMock } from './MockData/MockData_Instances';
import { DefaultButton, DetailsList, Dropdown, SearchBox } from '@fluentui/react';
import { getFocusAreaAssignment } from './MockData/FocusAreaAssignmentMockData';


configure({ adapter: new Adapter() });

describe('Pending Request Component Test suite', () => {

    let reactPendingRequestComponent: ReactWrapper<IProps, IState>;
    let allfocusAreaAssignments = getFocusAreaAssignment();
    let focusAreaSelectMockFunction = jest.fn();
    console.log("allfocusAreaAssignments " + allfocusAreaAssignments.length);


    beforeEach(() => {
        reactPendingRequestComponent = mount(
            React.createElement(
                PendingRequests,
                {
                    focusAreaAssignments: allfocusAreaAssignments,
                    onSelectEmployee: focusAreaSelectMockFunction,
                    services: employeeRotationServicesMock
                }
            ));
    });

    afterEach(() => {
        reactPendingRequestComponent.unmount();

    });
    console.log("before 1 test case");

    it('Should search the pending requests onchange of search box value', () => {
        let searchBoxElement = reactPendingRequestComponent.find(SearchBox);
        searchBoxElement.props().onSearch("Chaitanya");
        reactPendingRequestComponent.instance().forceUpdate();
        expect(reactPendingRequestComponent.state('searchTermFilter')).toBe("Chaitanya");
    });

    it('Should search the pending requests onchange of Focus Area dropdown', () => {
        let Element = reactPendingRequestComponent.find(Dropdown).filterWhere(x => x.props().label == "Focus Area");
        let eventValue = { target: { key: 1, text: 'SMB' } };
        //Element.simulate('onChange', eventValue.target);
        Element.props().onChanged(eventValue.target);
        reactPendingRequestComponent.instance().forceUpdate();
        expect(reactPendingRequestComponent.state('focusAreaFilter')).toBe("SMB");
    });

    it('Should search the pending requests onchange of Hub dropdown', () => {
        let Element = reactPendingRequestComponent.find(Dropdown).filterWhere(x => x.props().label == "Hub");
        let eventValue = { target: { key: 1, text: '0001 Store' } };
        //Element.invoke('onChange', eventValue);
        //let event: React.FormEvent<HTMLDivElement>;
        Element.props().onChanged(eventValue.target);
        reactPendingRequestComponent.instance().forceUpdate();
        expect(reactPendingRequestComponent.state('hubFilter')).toBe("0001 Store");
    });
    it('Should search the Pending requests onchange of Territory Manager dropdown', () => {
        let Element = reactPendingRequestComponent.find(Dropdown).filterWhere(x => x.props().label == "Territory Manager");
        let eventValue = { target: { key: 1, text: 'Jatin@spstudiodev.onmicrosoft.com' } };
        //Element.simulate('onChange', eventValue.target);
        Element.props().onChanged(eventValue.target);
        reactPendingRequestComponent.instance().forceUpdate();
        expect(reactPendingRequestComponent.state('territoryManagerFilter')).toBe("Jatin@spstudiodev.onmicrosoft.com");
    });
    it('Should sort the Pending requests onchange of Order by dropdown', () => {
        let Element = reactPendingRequestComponent.find(Dropdown).filterWhere(x => x.props().label == "Order by");
        let event: React.FormEvent<HTMLDivElement>;
        let eventValue = { target: { key: 1, text: 'Employee Name' } };
        //Element.simulate('onChange', eventValue.target);
        Element.props().onChanged(eventValue.target);
        reactPendingRequestComponent.instance().forceUpdate();
        expect(reactPendingRequestComponent.state('orderBy')).toBe("Employee Name");
    });

    it('Should invoke the function to open panel on select of row in listview', () => {
        let DetailListElement = reactPendingRequestComponent.find(".detailsList");
        let rowElement = DetailListElement.find('.ms-FocusZone .ms-DetailsRow').filterWhere(x => x.props().role == "row").at(0);
        let event: React.MouseEvent<HTMLElement>;
        rowElement.props().onClick(event);
        //rowElement..onClick simulate('click');
        reactPendingRequestComponent.instance().forceUpdate();
        expect(focusAreaSelectMockFunction).toBeCalled();
    });

});