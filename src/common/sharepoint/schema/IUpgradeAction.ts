export interface IUpgradeAction {
    description: string;
    execute(services: {}): Promise<void>;
}