export class StoreStatus {
    public static readonly StoreOpen = new StoreStatus("Open");
    public static readonly StorePlanned = new StoreStatus("Planned");
    public static readonly StoreClosed = new StoreStatus("Closed");

    private static readonly _allStoreStatus = [StoreStatus.StoreOpen, StoreStatus.StorePlanned, StoreStatus.StoreClosed];
    private static readonly _StoreStatusByName = new Map<string, StoreStatus>(StoreStatus._allStoreStatus.map(s => [s.name, s] as [string, StoreStatus]));

    private constructor(public readonly name: string) {
    }

    public static get all(): ReadonlyArray<StoreStatus> {
        return StoreStatus._allStoreStatus;
    }

    public static fromName(name: string) {
        return StoreStatus._StoreStatusByName.get(name);
    }
}