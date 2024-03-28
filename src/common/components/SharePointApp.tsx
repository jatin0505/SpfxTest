import _ from 'lodash';
import React, { ReactElement, ReactNode, Component } from "react";
import { setup, LibraryConfiguration } from "@pnp/common";
import { initializeIcons, Fabric, Shimmer } from "office-ui-fabric-react";
import { ServiceManager, ServicesType, ServicesProvider, ServiceDescriptorArray, SpfxContext } from "common/services";

require('office-ui-fabric-react/dist/css/fabric.min.css');

type ServiceManagerType<D extends ServiceDescriptorArray> = ServiceManager<ServicesType<D>>;

interface ISharePointAppProps<D extends ServiceDescriptorArray> {
    appName: string;
    spfxContext: SpfxContext;
    serviceDescriptors: D;
    shimmerElements?: ReactNode;
    onInitBeforeServices?: () => Promise<any>;
    onInitAfterServices?: (services: ServicesType<D>) => Promise<any>;
    children: (services: ServicesType<D>) => ReactElement;
}

interface IState<S extends ServiceDescriptorArray> {
    serviceManager: ServiceManagerType<S>;
}

export class SharePointApp<P extends ISharePointAppProps<S>, S extends ServiceDescriptorArray> extends Component<P, IState<S>> {
    constructor(props: P) {
        super(props);

        this.state = {
            serviceManager: null
        };
    }

    public async componentDidMount() {
        const { onInitBeforeServices = _.noop, onInitAfterServices } = this.props;
        try {
            initializeIcons(undefined, { disableWarnings: true });

            this._configurePnP();

            const [
                _unused,
                serviceManager
            ] = await Promise.all([
                onInitBeforeServices(),
                this._createServiceManager()
            ]);

            if (onInitAfterServices) {
                await onInitAfterServices(serviceManager.services);
            }

            this.setState({ serviceManager });
        } catch (e) {
            console.error(e);
        }
    }

    private _configurePnP() {
        const { appName, spfxContext } = this.props;
        const { version } = spfxContext.manifest;
        const xClientTag = `NONISV|Microsoft|${appName}/${version}`;

        setup({
            spfxContext: this.props.spfxContext,
            sp: {
                headers: {
                    "X-ClientTag": xClientTag,
                    "User-Agent": xClientTag
                }
            }
        } as LibraryConfiguration);
    }

    private readonly _createServiceManager = (): Promise<ServiceManagerType<S>> => {
        const { spfxContext, serviceDescriptors } = this.props;
        const { manifest: { alias: appName } } = spfxContext;

        return ServiceManager.create(appName, spfxContext, serviceDescriptors);
    }

    public render(): ReactElement<P> {
        const { children, shimmerElements } = this.props;
        const { serviceManager } = this.state;

        return (
            <Fabric>
                <Shimmer isDataLoaded={!!serviceManager} customElementsGroup={shimmerElements}>
                    {!!serviceManager &&
                        <ServicesProvider value={serviceManager.services}>
                            {children(serviceManager.services)}
                        </ServicesProvider>
                    }
                </Shimmer>
            </Fabric>
        );
    }
}