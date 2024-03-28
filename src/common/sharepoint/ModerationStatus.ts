export class ModerationStatus {
    public static readonly Approved = new ModerationStatus("Approved", 0);
    public static readonly Rejected = new ModerationStatus("Rejected", 1);
    public static readonly Pending = new ModerationStatus("Pending", 2);
    public static readonly Draft = new ModerationStatus("Draft", 3);
    public static readonly Scheduled = new ModerationStatus("Scheduled", 4);

    private static readonly _allModerationStatuses = [
        ModerationStatus.Approved,
        ModerationStatus.Rejected,
        ModerationStatus.Pending,
        ModerationStatus.Draft,
        ModerationStatus.Scheduled
    ];
    private static readonly _moderationStatusesByName = new Map<string, ModerationStatus>(ModerationStatus._allModerationStatuses.map(s => [s.name, s] as [string, ModerationStatus]));

    private constructor(
        public readonly name: string,
        public readonly value: number) {
    }

    public static get all() {
        return ModerationStatus._allModerationStatuses;
    }

    public static fromName(name: string) {
        return ModerationStatus._moderationStatusesByName.get(name);
    }
}