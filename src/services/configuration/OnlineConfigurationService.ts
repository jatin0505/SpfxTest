import { sp } from "@pnp/sp";
import { ErrorHandler } from "common";
import { ServiceContext, DeveloperService, DeveloperServiceProp, ISharePointService, SharePointServiceProp, SharePointService, IDeveloperService } from "common/services";
import { Configuration, ConfigurationList } from "schema";
import { IConfigurationService } from "./ConfigurationServiceDescriptor";
import { ConfigurationUpdateListItem, ConfigurationListItemResult } from "./ConfigurationListItems";

const MaximumConfigurations = 1;

export class OnlineConfigurationService implements IConfigurationService {
    private readonly _dev: IDeveloperService;
    private readonly _repo: ISharePointService;

    private _configuration: Configuration;

    constructor({
        [SharePointService]: repo,
        [DeveloperService]: dev
    }: ServiceContext<SharePointServiceProp & DeveloperServiceProp>) {
        this._dev = dev;
        this._repo = repo;
    }

    public async initialize(): Promise<void> {
        this._configuration = (await this._loadConfigurations())[0] || new Configuration();

        if (!this._configuration.isNew) {
            this._repo.registerListForPreflight(ConfigurationList);
        }

        this._dev.registerScripts(this._devScripts);
    }

    public get active(): Configuration {
        return this._configuration;
    }

    private async _loadConfigurations(): Promise<Configuration[]> {
        try {
            return await this._repo.listItems(ConfigurationList, MaximumConfigurations, ConfigurationListItemResult.viewFields, null, ConfigurationListItemResult.toConfiguration);
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    public async persist(): Promise<void> {
        await this._repo.persistEntity(this._configuration, ConfigurationList, ConfigurationUpdateListItem);
    }

    private readonly _devScripts = {
        schema: {
            obliterate: async () => {
                console.log(`Starting 'obliterate()'`);

                const schema = this._configuration.schema;
                const eh = new ErrorHandler();
                const batch = sp.web.createBatch();

                schema.lists.forEach(list => {
                    sp.web.lists.getByTitle(list.title).inBatch(batch).delete().catch(eh.catch);
                });

                await batch.execute();
                eh.reportIfError();

                console.log(`Completed 'obliterate()'`);
            }
        }
    };
}