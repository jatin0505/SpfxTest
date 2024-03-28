import { EmployeeRotationServiceProp, DirectoryServiceProp, DirectoryService, EmployeeRotationService, MockDirectoryService, ConfigurationServiceProp, ConfigurationService } from "services";
import { MockEmployeeRotationService } from "services/employeeRotation/MockEmployeeRotationService";
import { MockConfigurationService } from "services/configuration/MockConfigurationService";

export const employeeRotationServicesMock: EmployeeRotationServiceProp = {
    [EmployeeRotationService]: new MockEmployeeRotationService()
};

export const employeeRotationDirectoryServicesMock: EmployeeRotationServiceProp & DirectoryServiceProp = {

    [EmployeeRotationService]: new MockEmployeeRotationService(),

    [DirectoryService]: new MockDirectoryService()

};

export const configurationServicesMock: ConfigurationServiceProp = {
    [ConfigurationService]: new MockConfigurationService()
};
