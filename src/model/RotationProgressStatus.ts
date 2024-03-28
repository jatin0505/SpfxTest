export class RotationProgressStatus {
    public static readonly UpcomingGraduation = new RotationProgressStatus("Upcoming Graduation", 1);
    public static readonly UpcomingRotationChange = new RotationProgressStatus("Upcoming Rotation Change", 2);
    public static readonly New = new RotationProgressStatus("New", 3);
    public static readonly InProgress = new RotationProgressStatus("In Progress", 4);

    private static readonly _allRotationStatus = [RotationProgressStatus.UpcomingGraduation, RotationProgressStatus.UpcomingRotationChange, RotationProgressStatus.New, RotationProgressStatus.InProgress];
    private static readonly _rotationStatusByName = new Map<string, RotationProgressStatus>(RotationProgressStatus._allRotationStatus.map(s => [s.name, s] as [string, RotationProgressStatus]));

    private constructor(public readonly name: string, public readonly id: number) {
    }

    public static get all(): ReadonlyArray<RotationProgressStatus> {
        return RotationProgressStatus._allRotationStatus;
    }

    public static get allSortByID(): ReadonlyArray<RotationProgressStatus> {
        return RotationProgressStatus._allRotationStatus.sort((a, b) => a.id > b.id ? 1 : -1);
    }

    public static fromName(name: string) {
        return RotationProgressStatus._rotationStatusByName.get(name);
    }
}