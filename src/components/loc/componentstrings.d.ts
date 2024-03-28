declare module 'ComponentStrings' {
    import { IButtonStrings } from "common";

    interface IConfigurationWizardStrings {
        Heading: string;
        Description: string;
        SetupComplete: string;
    }

    interface IUpgradeStrings {
        Heading: string;
        InProgressHeading: string;
        CompletedHeading: string;
        Description: string;
        CannotUpgrade: string;
        UpgradeButton: IButtonStrings;
    }

    interface IEmployeeRotationStrings {
    }

    interface IComponentStrings {
        ConfigurationWizard: IConfigurationWizardStrings;
        UpgradeStrings: IUpgradeStrings;
        EmployeeRotation: IEmployeeRotationStrings;
    }

    const strings: IComponentStrings;
    export = strings;
}
