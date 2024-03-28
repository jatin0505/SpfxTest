import _ from "lodash";
import React, { Component, ReactElement } from "react";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { SharePointApp, WebPartTitle } from "../common/components";
import { ElementProvisioner } from "../common/sharepoint";
import {
    ServicesType,
    DeveloperServiceDescriptor, DirectoryServiceDescriptor, DomainIsolationServiceDescriptor, TimeZoneServiceDescriptor, SharePointServiceDescriptor,
    ConfigurationServiceDescriptor, ConfigurationService, SharePointService, EmployeeRotationServiceDescriptor, EmployeeRotationService
} from "../services";

import { Dashboard, ConfigurationWizard } from '../components';

const AppServiceDescriptors = [
    DeveloperServiceDescriptor,
    DirectoryServiceDescriptor,
    DomainIsolationServiceDescriptor,
    TimeZoneServiceDescriptor,
    SharePointServiceDescriptor,
    ConfigurationServiceDescriptor,
    EmployeeRotationServiceDescriptor
];

type AppServices = ServicesType<typeof AppServiceDescriptors>;

interface IProps {
    title: string;
    showTitle: boolean;
    spfxContext: BaseComponentContext;
}

class EmployeeRotationApp extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
    }

    private readonly _preflight = async (services: AppServices) => {
        const {
            [SharePointService]: spo
        } = services;

        await spo.preflightSchema();
    }

    private readonly _onSetupComplete = async (services: AppServices) => {
        const {
            [EmployeeRotationService]: employeeRotation
        } = services;

        await employeeRotation.initialize();

        await this._preflight(services);


        this.setState({});
    }

    private readonly _renderApp = (services: AppServices) => {
        const {
            [ConfigurationService]: configurations
        } = services;

        if (configurations.active.isNew) {
            const onSetupComplete = () => this._onSetupComplete(services);
            return <ConfigurationWizard onSetupComplete={onSetupComplete} />;
        } else {
            const { title, showTitle } = this.props;
            return (
                <WebPartTitle title={title} show={showTitle}>
                    <Dashboard />
                </WebPartTitle>
            );
        }
    }

    public render(): ReactElement<IProps> {
        const { spfxContext } = this.props;

        return (
            <SharePointApp
                appName="Retail Stores Employee Rotation Program"
                spfxContext={spfxContext} serviceDescriptors={AppServiceDescriptors} onInitAfterServices={this._preflight}>
                {this._renderApp}
            </SharePointApp>
        );
    }
}

export default EmployeeRotationApp;