import { User } from 'common';
import { RotationStatus } from 'model';
import { getStores } from './StoreMockData';
import { EmployeeRotation } from 'model/EmployeeRotation';
import { getFocusAreaAssignment } from './FocusAreaAssignmentMockData';
import moment from 'moment-timezone';

export const employeeRotationArr = [{
    employeeName: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    homeStore: getStores()[0],
    territoryManager: "Jatin@spstudiodev.onmicrosoft.com",
    hubManager: "Jatin@spstudiodev.onmicrosoft.com",
    reporteeManager: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    startDate: moment(new Date()).subtract(5, "weeks"),
    expectedEndDate: moment(new Date()).add(8, "weeks"),
    rotationStatus: RotationStatus.Active.name,
    postGraduationPosition: "",
    organization: "",

    ID: 1,
    Created: new Date("11/12/2020"),
    Modified: new Date("11/12/2020"),
    Author: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    Editor: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
},
{
    employeeName: new User(8, "Jashwanth", "Jashwanth@spstudiodev.onmicrosoft.com", "Jashwanth@spstudiodev.onmicrosoft.com", "", 1),
    homeStore: getStores()[0],
    territoryManager: "Jatin@spstudiodev.onmicrosoft.com",
    hubManager: "Jatin@spstudiodev.onmicrosoft.com",
    reporteeManager: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    startDate: moment(new Date()).subtract(5, "weeks"),
    expectedEndDate: moment(new Date()).add(8, "weeks"),
    rotationStatus: RotationStatus.Graduate.name,
    postGraduationPosition: "Graduated",
    organization: "Microsoft",

    ID: 2,
    Created: new Date("10/12/2020"),
    Modified: new Date("10/12/2020"),
    Author: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
    Editor: new User(7, "Chaitanya", "Chaitanya@spstudiodev.onmicrosoft.com", "Chaitanya@spstudiodev.onmicrosoft.com", "", 1),
}];

const toEmployeeRotation = (row: any): EmployeeRotation => {
    let employeeRotation: EmployeeRotation = null;
    try {
        employeeRotation = new EmployeeRotation(row.Author, row.Editor, row.Created, row.Modified, parseInt(row.ID, 10));
        employeeRotation.employeeName = row.employeeName;
        employeeRotation.homeStore = row.homeStore;
        employeeRotation.territoryManager = row.territoryManager;

        employeeRotation.reporteeManager = row.reporteeManager;
        employeeRotation.startDate = row.startDate;
        employeeRotation.expectedEndDate = row.expectedEndDate;
        employeeRotation.rotationStatus = RotationStatus.fromName(row.rotationStatus);
        employeeRotation.postGraduationPosition = row.postGraduationPosition;
        employeeRotation.organization = row.organization;
        getFocusAreaAssignment().forEach(assignment => employeeRotation.employeeAssignment.add(assignment));

    } catch (e) {
        console.warn(e);
    }
    return employeeRotation;

};

export const getEmployeeRotation = (): EmployeeRotation[] => {
    return employeeRotationArr.map(employeeRotation => toEmployeeRotation(employeeRotation));
};
