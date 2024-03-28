export class RotationStatus {
    public static readonly None = new RotationStatus("New");
    public static readonly Active = new RotationStatus("Active");
    public static readonly Graduate = new RotationStatus("Graduate");
    public static readonly Hold = new RotationStatus("Hold");
    public static readonly Terminated = new RotationStatus("Terminated");

    private static readonly _allRotationStatus = [RotationStatus.None, RotationStatus.Active,
    RotationStatus.Graduate, RotationStatus.Hold, RotationStatus.Terminated];
    private static readonly _rotationStatusByName = new Map<string, RotationStatus>(RotationStatus._allRotationStatus.map(s => [s.name, s] as [string, RotationStatus]));

    private constructor(public readonly name: string) {
    }

    public static get all(): ReadonlyArray<RotationStatus> {
        return RotationStatus._allRotationStatus;
    }

    public static fromName(name: string) {
        return RotationStatus._rotationStatusByName.get(name);
    }
}