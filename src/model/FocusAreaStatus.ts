export class FocusAreaStatus {
    public static readonly None = new FocusAreaStatus("New");
    public static readonly Pending = new FocusAreaStatus("Pending");
    public static readonly Approved = new FocusAreaStatus("Approved");
    public static readonly Rejected = new FocusAreaStatus("Rejected");

    private static readonly _allFocusAreaStatus = [FocusAreaStatus.None, FocusAreaStatus.Pending, FocusAreaStatus.Approved, FocusAreaStatus.Rejected];
    private static readonly _focusAreaStatusByName = new Map<string, FocusAreaStatus>(FocusAreaStatus._allFocusAreaStatus.map(s => [s.name, s] as [string, FocusAreaStatus]));

    private constructor(public readonly name: string) {
    }

    public static get all(): ReadonlyArray<FocusAreaStatus> {
        return FocusAreaStatus._allFocusAreaStatus;
    }

    public static fromName(name: string) {
        return FocusAreaStatus._focusAreaStatusByName.get(name);
    }
}