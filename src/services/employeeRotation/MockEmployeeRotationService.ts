import { IAsyncData, AsyncData, User } from "common";
import { EmployeeRotation, FocusAreaAssignment, FocusArea, Store } from "model";
import { IEmployeeRotationService } from "./EmployeeRotationServiceDescriptor";

export class MockEmployeeRotationService implements IEmployeeRotationService {
    public getHQUsers(): Promise<User[]> {
        let Users: Promise<User[]>;
        return Users;
    }
    private _rotation: EmployeeRotation;

    public async initialize() {
    }

    public get employeeRotationsAsync(): IAsyncData<EmployeeRotation[]> {
        return AsyncData.createWithData([]);
    }
    public get focusAreaAssignmentAsync(): IAsyncData<FocusAreaAssignment[]> {
        return AsyncData.createWithData([]);
    }

    public track(employeeRotation: EmployeeRotation): void;

    public track(employeeRotation: FocusAreaAssignment): void;
    public track(entity: EmployeeRotation | FocusAreaAssignment): void {

    }
    public get fetchFocusAreas(): Promise<FocusArea[]> {
        return Promise.resolve(null);
    }

    public get fetchStores(): Promise<Store[]> {
        return Promise.resolve(null);
    }

    public get isHQUser(): boolean {
        return true;
    }

    public get currentUser(): User {
        return null;
    }

    public async getCurrentUserStoreNumber(): Promise<string> {
        return Promise.resolve("");
    }

    public async triggerMailToApprover() {
    }

    public async persistEmployeeRotation(): Promise<void> {
        this._rotation.immortalize();
    }
    public async persistFocusAreaAssignment(): Promise<void> {

    }

    public async configureEmployeeRotationItemPermissions(item: EmployeeRotation) {
    }

    public async configureFocusAreaAssignmentItemPermissions(item: FocusAreaAssignment) {
    }

    public async configureFocusAreaAssignmentItemPermissionsOnRejection(item: FocusAreaAssignment) {
    }
}