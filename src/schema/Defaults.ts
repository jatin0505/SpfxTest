const Environments = {
    LOCAL: { Prefix: 'LCL' },
    DEV: { Prefix: 'DEV' },
    UAT: { Prefix: 'UAT' },
    PROD: { Prefix: '' }
};

const Environment = Environments.DEV;
const AppPrefix = "ERP";

export namespace Defaults {
    const combine = (...segments: string[]) => segments.join(' ').trim();
    const title = (baseTitle: string) => combine(Environment.Prefix, AppPrefix, baseTitle);

    const applicationTitle = (instanceName: string, baseTitle: string) => instanceName != "" ? combine(Environment.Prefix, AppPrefix, instanceName, baseTitle) :
        combine(Environment.Prefix, AppPrefix, baseTitle);

    export const ConfigurationListTitle = title("Configuration");
    export const EmployeeRotationListTitle = title("EmployeeRotation");
    export const StoreListTitle = "Store";
    export const FocusAreaAssignmentListTitle = title("FocusAreaAssignment");
    export const FocusAreaListTitle = title("FocusArea");
    export const EmailConfigurationListTitle = title("Email Configuration");

    export const ERPManagersGroup = title("Managers");
}