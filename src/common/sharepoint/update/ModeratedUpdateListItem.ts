import { ModerationStatus } from "../ModerationStatus";

export class ModeratedUpdateListItem {
    public OData__ModerationStatus: number;

    constructor(moderationStatus: ModerationStatus) {
        this.OData__ModerationStatus = moderationStatus && moderationStatus.value;
    }
}