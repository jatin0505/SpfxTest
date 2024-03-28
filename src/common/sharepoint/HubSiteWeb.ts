import { extend } from "@pnp/common";
import { Web, NavigationNode } from "@pnp/sp";

export interface IFixedHubSiteData {
    isHubSite: boolean;
    themeKey?: string;
    name?: string;
    url?: string;
    logoUrl?: string;
    usesMetadataNavigation?: boolean;
    navigation?: NavigationNode;
}

export class HubSiteWeb extends Web {
    public async fixedHubSiteData(forceRefresh = false): Promise<IFixedHubSiteData> {
        const result = await this.clone(HubSiteWeb, `hubSiteData(${forceRefresh})`).get();
        if (result['odata.null'])
            return { isHubSite: false };
        else
            return extend({ isHubSite: true }, JSON.parse(result));
    }
}