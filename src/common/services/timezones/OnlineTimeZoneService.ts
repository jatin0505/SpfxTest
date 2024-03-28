import { sp } from '@pnp/sp';
import { ErrorHandler } from '../../ErrorHandler';
import { arrayToMap, } from '../../Utils';
import { ITimeZone, ITimeZoneService } from './TimeZoneServiceDescriptor';

interface TimeZoneMapping {
    readonly name: string;
    readonly momentId: string;
    readonly sharepointId: number;
}
const timezoneMappings = require('./timezone-mappings.json') as TimeZoneMapping[];
const timezoneMappingsBySharePointId = arrayToMap(tz => tz.sharepointId, timezoneMappings);

class TimeZoneResult {
    public Id: number;
    public Description: string;
    public Information: {
        Bias: number;
        DaylightBias: number;
        StandardBias: number;
    };
}

class TimeZone implements ITimeZone {
    public static fromTimeZoneResult(result: TimeZoneResult): TimeZone {
        return new TimeZone(result.Id, result.Description);
    }

    private readonly _mapping: TimeZoneMapping;

    public get hasMomentMapping(): boolean { return !!this._mapping; }
    public get momentId(): string { return this._mapping.momentId; }

    constructor(
        public readonly id: number,
        public readonly description: string
    ) {
        this._mapping = timezoneMappingsBySharePointId.get(id);
    }
}

export class OnlineTimeZoneService implements ITimeZoneService {
    private _timeZones: TimeZone[];
    private _timeZonesBySharePointId: Map<number, TimeZone>;
    private _siteTimeZone: TimeZone;

    public get timeZones(): ITimeZone[] {
        return this._timeZones;
    }

    public get siteTimeZone(): ITimeZone {
        return this._siteTimeZone;
    }

    public timeZoneFromId(id: number): ITimeZone {
        return this._timeZonesBySharePointId.get(id);
    }

    constructor(
    ) {
    }

    public async initialize(): Promise<void> {
        const [
            timeZoneResults,
            siteTimeZoneResult
        ] = await Promise.all([
            sp.web.regionalSettings.timeZones.get<TimeZoneResult[]>(),
            sp.web.regionalSettings.timeZone.get<TimeZoneResult>()
        ]);

        this._timeZones = timeZoneResults.map(result => TimeZone.fromTimeZoneResult(result)).filter(tz => tz.hasMomentMapping);
        this._timeZonesBySharePointId = arrayToMap(tz => tz.id, this._timeZones);

        this._siteTimeZone = TimeZone.fromTimeZoneResult(siteTimeZoneResult);
        if (!this._siteTimeZone.hasMomentMapping)
            console.warn(`Site time zone (${this._siteTimeZone.id} - ${this._siteTimeZone.description}) cannot be mapped to an IANA time zone for moment library.`);
    }
}                                                                                                                               