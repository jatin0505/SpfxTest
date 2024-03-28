import { IService, IServiceDescriptor, DeveloperService, SharePointService } from "common/services";
import { Configuration } from 'schema';
import { OnlineConfigurationService } from "./OnlineConfigurationService";
import { MockConfigurationService } from "./MockConfigurationService";

export const ConfigurationService: unique symbol = Symbol("Configuration Service");

export interface IConfigurationService extends IService {
    readonly active: Configuration;
    persist(): Promise<void>;
}

export type ConfigurationServiceProp = {
    [ConfigurationService]: IConfigurationService;
};

export const ConfigurationServiceDescriptor: IServiceDescriptor<typeof ConfigurationService, IConfigurationService, ConfigurationServiceProp> = {
    symbol: ConfigurationService,
    dependencies: [SharePointService, DeveloperService],
    online: OnlineConfigurationService,
    local: MockConfigurationService
};