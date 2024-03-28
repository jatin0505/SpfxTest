import { User } from 'common';
import { FocusAreaStatus, EmployeeRotation, RotationStatus } from 'model';
import { getStores } from './StoreMockData';
import { FocusAreaAssignment } from 'model/FocusAreaAssignment';
import { getFocusArea } from './FocusAreaMockData';
import { employeeRotationArr, getEmployeeRotation } from './EmployeeRotationMockData';
import moment from 'moment-timezone';


const FocusAreaAssignmentArr = [{
    focusArea: getFocusArea()[0],
    startDate: moment(new Date()).subtract(2, "weeks"),
    endDate: moment(new Date()).add(5, "weeks"),
    status: FocusAreaStatus.Approved.name,
    store: getStores()[0],
    currentFocusArea: true,
    focusAreaManager: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),

    ID: 1,
    Created: new Date("10/12/2020"),
    Modified: new Date("10/12/2020"),
    Author: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    Editor: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
},
{
    focusArea: getFocusArea()[1],
    startDate: moment(new Date()).subtract(2, "weeks"),
    endDate: moment(new Date()).subtract(1, "weeks"),
    status: FocusAreaStatus.Approved.name,
    store: getStores()[0],
    currentFocusArea: true,
    focusAreaManager: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),

    ID: 1,
    Created: new Date("10/12/2020"),
    Modified: new Date("10/12/2020"),
    Author: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    Editor: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
}
    ,
{
    focusArea: getFocusArea()[1],
    startDate: moment(new Date()).add(1, "weeks"),
    endDate: moment(new Date()).add(4, "weeks"),
    status: FocusAreaStatus.Approved.name,
    store: getStores()[0],
    currentFocusArea: true,
    focusAreaManager: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),

    ID: 1,
    Created: new Date("10/12/2020"),
    Modified: new Date("10/12/2020"),
    Author: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    Editor: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
}

];

const toFocusAreaAssignment = (row: any): FocusAreaAssignment => {
    let focusAreaAssignment: FocusAreaAssignment = null;
    try {
        focusAreaAssignment = new FocusAreaAssignment(row.Author, row.Editor, row.Created, row.Modified, parseInt(row.ID, 10));
        focusAreaAssignment.focusArea = row.focusArea;
        focusAreaAssignment.startDate = row.startDate;
        focusAreaAssignment.endDate = row.endDate;
        focusAreaAssignment.status = FocusAreaStatus.fromName(row.status);
        focusAreaAssignment.store = row.store;
        focusAreaAssignment.currentFocusArea = row.currentFocusArea;
        focusAreaAssignment.focusAreaManager = row.focusAreaManager;
        focusAreaAssignment.employeeRotation.set(getEmployeeRotationInstance());
    } catch (e) {
        console.warn(e);
    }
    return focusAreaAssignment;

};

const getEmployeeRotationInstance = (): EmployeeRotation => {
    let row = employeeRotationArr[0];
    let employeeRotation = new EmployeeRotation(row.Author, row.Editor, row.Created, row.Modified, 10);
    employeeRotation.employeeName = row.employeeName;
    employeeRotation.homeStore = row.homeStore;
    employeeRotation.territoryManager = row.territoryManager;
    employeeRotation.reporteeManager = row.reporteeManager;
    employeeRotation.startDate = row.startDate;
    employeeRotation.expectedEndDate = row.expectedEndDate;
    employeeRotation.rotationStatus = RotationStatus.fromName(row.rotationStatus);
    employeeRotation.postGraduationPosition = row.postGraduationPosition;
    employeeRotation.organization = row.organization;
    return employeeRotation;
}

export const getFocusAreaAssignment = (): FocusAreaAssignment[] => {
    return FocusAreaAssignmentArr.map(focusAreaAssignment => toFocusAreaAssignment(focusAreaAssignment));
};
