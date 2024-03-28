import { IConfigurationService } from "./ConfigurationServiceDescriptor";
import { Configuration } from 'schema';

export class MockConfigurationService implements IConfigurationService {
    private _configuration: Configuration;

    public async initialize(): Promise<void> {
        this._configuration = new Configuration();
    }

    public get active(): Configuration {
        return this._configuration;
    }

    public async persist(): Promise<void> {
        this._configuration.immortalize();
    }
}