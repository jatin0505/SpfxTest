import moment from "moment";
import _, { isEmpty } from 'lodash';
import { User } from "common";
import { FocusAreaAssignment } from 'model';
import { EmailProperties } from "@pnp/sp";
import { Configuration } from "schema";
import { FocusAreaStatus } from "./FocusAreaStatus";


export class EmailConfiguration {
    private _emailTo: User[];
    private _emailCC: User[];
    private _emailSubject: string;
    private _emailMessage: string;
    private _sendNotification: boolean;


    constructor(pFocusAreaAssignment?: FocusAreaAssignment, pStatus?: string, pCurrentUser?: User, pHQUser?: User[]) {
        this.sendNotification = false;
        this.emailTo = null;
        this.emailCC = null;
        this.emailMessage = "";
        this.emailSubject = "";

        if (pFocusAreaAssignment && pStatus) {
            this.createEmailStructure(pFocusAreaAssignment, pStatus, pCurrentUser, pHQUser);
        }

    }

    public get emailTo(): User[] { return this._emailTo; }
    public set emailTo(val: User[]) { this._emailTo = val; }

    public get emailCC(): User[] { return this._emailCC; }
    public set emailCC(val: User[]) { this._emailCC = val; }

    public get emailSubject(): string { return this._emailSubject; }
    public set emailSubject(val: string) { this._emailSubject = val; }

    public get emailMessage(): string { return this._emailMessage; }
    public set emailMessage(val: string) { this._emailMessage = val; }

    public get sendNotification(): boolean { return this._sendNotification; }
    public set sendNotification(val: boolean) { this._sendNotification = val; }

    private createEmailStructure(assignment: FocusAreaAssignment, requestStatus: string, pCurrentUser?: User, pHQUser?: User[]): void {
        switch (requestStatus) {
            case "Approved": {
                let employeeRotation = assignment.employeeRotation.get();
                this.emailTo = [assignment.author ? assignment.author : pCurrentUser];
                this.emailCC = [assignment.store.storeManager, assignment.store.territoryManager];
                this.emailSubject = "Your Focus Area assignment request is Approved.";
                this.emailMessage = "Focus Area assignment submitted for employee : " + (employeeRotation.employeeName == null || employeeRotation.employeeName == undefined ? employeeRotation.employeeFullName : employeeRotation.employeeName.title) + " has been Approved.";

            }
                break;
            case "Rejected": {
                let employeeRotation = assignment.employeeRotation.get();
                this.emailTo = [assignment.author ? assignment.author : pCurrentUser];
                this.emailCC = [assignment.store.storeManager, assignment.store.territoryManager];
                this.emailSubject = "Your Focus Area assignment request is declined";
                this.emailMessage = "Focus Area assignment submitted for employee : " + (employeeRotation.employeeName == null || employeeRotation.employeeName == undefined ? employeeRotation.employeeFullName : employeeRotation.employeeName.title) + " has been Rejected.";
            }
                break;
            case "Pending": {
                let employeeRotation = assignment.employeeRotation.get();
                this.emailTo = pHQUser;
                this.emailCC = [assignment.store.storeManager, assignment.store.territoryManager];
                this.emailSubject = "Your approval is requested";
                this.emailMessage = "A focus area assignment request requiring your approval has been submitted for Employee : " + (employeeRotation.employeeName == null || employeeRotation.employeeName == undefined ? employeeRotation.employeeFullName : employeeRotation.employeeName.title) + " by " + pCurrentUser.title;
                this.sendNotification = true;
            }
                break;
            default: {
                this._emailTo = [];
                this._emailCC = [];
                this._emailSubject = "";
                this._emailMessage = "";
            }
                break;
        }
    }

    public _constructEmail(assignment: FocusAreaAssignment,): EmailProperties {
        let email: EmailProperties;
        const employeeRotation = assignment.employeeRotation.get();
        let body: string = null;
        let emailSubject: string = "";
        let toAddresses: string[] = [];
        let ccAddresses: string[] = [];
        const focusAreaDetailTable = this._constructFocusAreaDetailsHtml(assignment);

        switch (assignment.status.name.toLowerCase()) {
            case "rejected":
                body =
                    //`<p>Focus Area assignment submitted for employee : ${employeeRotation.employeeName.title} has been Rejected.</p>` +
                    `<p>${this._emailMessage}</p>` +
                    `<br />` +
                    `<p>Below are the focus area assignment details.</p>` +
                    `<h3>Assignment details:</h3>` +
                    focusAreaDetailTable;
                assignment.emailConfiguration.emailTo.forEach(user => toAddresses.push(user.email));
                assignment.emailConfiguration.emailCC.forEach(user => ccAddresses.push(user.email));
                break;
            case "approved":
                body =
                    //`<p>Focus Area assignment submitted for employee : ${employeeRotation.employeeName.title} has been Approved.</p>` +
                    `<p>${this._emailMessage}</p>` +
                    `<br />` +
                    `<p>Below are the focus area assignment details.</p>` +
                    `<h3>Assignment details:</h3>` +
                    focusAreaDetailTable;
                assignment.emailConfiguration.emailTo.forEach(user => toAddresses.push(user.email));
                assignment.emailConfiguration.emailCC.forEach(user => ccAddresses.push(user.email));
                break;

            default:
                body =
                    `<p>${this._emailMessage}</p>` +
                    `<br />` +
                    `<p>Please approve or reject this focus area assignment request.</p>` +
                    `<h3>Assignment details:</h3>` +
                    focusAreaDetailTable;

                //below lines added temporary until logic is applied to fetch user based on environment  
                //if (!isEnvProd) {
                assignment.emailConfiguration.emailTo.forEach(user => toAddresses.push(user.email));
                assignment.emailConfiguration.emailCC.forEach(user => ccAddresses.push(user.email));
                // toAddresses = ["rspadm@microsoft.com"];
                // ccAddresses = ["v-jatinbatra@microsoft.com", "v-jagoud@microsoft.com"];
                // }
                break;

        }
        try {
            emailSubject = assignment.emailConfiguration.emailSubject;
            email = {
                To: toAddresses,
                CC: ccAddresses,
                Subject: emailSubject,
                Body: body
            };
        } catch (e) {
            console.log("Email not triggered");
        }
        return email;
    }

    private _constructFocusAreaDetailsHtml(focusArea: FocusAreaAssignment): string {
        const owners = focusArea.focusAreaManager ? focusArea.focusAreaManager.title : focusArea.focusAreaManagerName;
        let siteURL: string = window.location.href.split('?')[0];
        let parameterString = focusArea.status === FocusAreaStatus.Pending ? "RotationID=" + focusArea.employeeRotation.get().id + "&AssignmentID=" + focusArea.id : "RotationID=" + focusArea.employeeRotation.get().id;
        return (
            `<table>` +
            `   <tr><td>Focus Area Assignment:</td> <td>${focusArea.focusArea.title}</td></tr>` +
            `   <tr><td>Assignment Start Date:</td> <td>${moment(focusArea.startDate).format('MMM DD, YYYY')}</td></tr>` +
            `   <tr><td>Assignment End Date:</td> <td>${moment(focusArea.endDate).format('MMM DD, YYYY')}</td></tr>` +
            `   <tr><td>Hub:</td> <td>${focusArea.store.storeDescription}</td></tr>` +
            `   <tr><td>Focus Area Manager:</td> <td>${owners}</td></tr>` +
            `   <tr><td colspan="2"></td></tr>` +
            `   <tr><td colspan="2">Click <a href="${siteURL}?${parameterString}">here</a> to view the request</td></tr>` +
            `</table>`);
    }

}