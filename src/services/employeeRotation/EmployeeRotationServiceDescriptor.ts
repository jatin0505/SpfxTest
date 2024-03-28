import { IAsyncData, User } from "common";
import { IService, IServiceDescriptor, SharePointService, DeveloperService, TimeZoneService } from "common/services";
import { EmployeeRotation, FocusAreaAssignment, FocusArea, Store } from "model";
import { ConfigurationService } from "../configuration";
import { OnlineEmployeeRotationService } from "./OnlineEmployeeRotationService";
import { MockEmployeeRotationService } from "./MockEmployeeRotationService";
import { EmailConfiguration } from "model/EmailConfig";

export const EmployeeRotationService: unique symbol = Symbol("EmployeeRotation Service");

export interface IEmployeeRotationService extends IService {
    readonly employeeRotationsAsync: IAsyncData<EmployeeRotation[]>;
    readonly focusAreaAssignmentAsync: IAsyncData<FocusAreaAssignment[]>;
    readonly fetchFocusAreas: Promise<FocusArea[]>;
    readonly fetchStores: Promise<Store[]>;


    isHQUser: boolean;
    currentUser: User;


    track(entity: EmployeeRotation): void;
    track(entity: FocusAreaAssignment): void;
    persistEmployeeRotation(): Promise<void>;
    persistFocusAreaAssignment(): Promise<void>;
    getHQUsers(): Promise<User[]>;
    getCurrentUserStoreNumber(): Promise<string>;
    triggerMailToApprover(focusArea: FocusAreaAssignment): void;
    configureEmployeeRotationItemPermissions(item: EmployeeRotation): void;
    configureFocusAreaAssignmentItemPermissions(item: FocusAreaAssignment): void;
    configureFocusAreaAssignmentItemPermissionsOnRejection(item: FocusAreaAssignment): void;
}

export type EmployeeRotationServiceProp = {
    [EmployeeRotationService]: IEmployeeRotationService;
};

export const EmployeeRotationServiceDescriptor: IServiceDescriptor<typeof EmployeeRotationService,
    IEmployeeRotationService,
    EmployeeRotationServiceProp> = {
    symbol: EmployeeRotationService,
    dependencies: [DeveloperService, TimeZoneService, SharePointService, ConfigurationService],
    online: OnlineEmployeeRotationService,
    local: MockEmployeeRotationService
};