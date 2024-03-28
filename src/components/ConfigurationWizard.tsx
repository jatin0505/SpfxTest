import React from "react";
import { Icon, Label } from "@fluentui/react";
import { StatefulComponent, Wizard, IWizardPageProps, IWizardStepProps } from "common/components";
import { ElementProvisioner } from "common/sharepoint";
import { withServices, ServicesProp, DirectoryServiceProp, ConfigurationServiceProp, ConfigurationService } from "services";

import * as strings from 'ComponentStrings';
import styles from "./styles/ConfigurationWizard.module.scss";

interface IOwnProps {
    onSetupComplete: () => void;
}
type IConfigurationWizardProps = IOwnProps & ServicesProp<DirectoryServiceProp & ConfigurationServiceProp>;

interface IConfigurationWizardState {
}

type IWizardData = {
};
type IConfigurationWizardPageProps = IWizardPageProps<IWizardData>;
type IConfigurationWizardStepProps = IWizardStepProps<IWizardData>;

const Heading = () => <Label><h1><Icon iconName="People" />&nbsp;&nbsp;{strings.ConfigurationWizard.Heading}</h1></Label>;

const Page_Start = (props: IConfigurationWizardPageProps) =>
    <div className={styles.pageLabel}>
        <Label>{strings.ConfigurationWizard.Description}</Label>
    </div>;

const Page_Success = (props: IConfigurationWizardPageProps) =>
    <h2>{strings.ConfigurationWizard.SetupComplete}</h2>;


class ConfigurationWizard extends StatefulComponent<IConfigurationWizardProps, IConfigurationWizardState> {
    constructor(props: IConfigurationWizardProps) {
        super(props);

        this.state = {
        };
    }

    private readonly _finalizeSetup = async (data: IWizardData) => {
        const {
            services: {
                [ConfigurationService]: configurations
            }
        } = this.props;

        const provisioner = new ElementProvisioner();
        await provisioner.ensureElements(configurations.active.schema);

        await configurations.persist();
    }

    public render(): React.ReactElement<IConfigurationWizardProps> {
        const data: IWizardData = {
        };

        return (
            <Wizard
                data={data}
                renderHeading={Heading}
                className={styles.configWizard}
                footerClassName={styles.footer}
                startPage={Page_Start}
                stepPages={[]}
                execute={this._finalizeSetup}
                successPage={Page_Success}
                readonlyWizrad={false}
                strings={{ startButton: { Text: "Setup" } }}
                onWizardComplete={this.props.onSetupComplete}
            />
        );
    }
}

export default withServices(ConfigurationWizard);