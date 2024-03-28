import { IService } from "../IService";
import { IServiceDescriptor } from "../IServiceDescriptor";
import { OnlineTimeZoneService } from "./OnlineTimeZoneService";

export const TimeZoneService: unique symbol = Symbol("Time Zone Service");

export interface ITimeZone {
    readonly id: number;
    readonly description: string;
    readonly hasMomentMapping: boolean;
    readonly momentId: string;
}

export interface ITimeZoneService extends IService {
    readonly timeZones: ITimeZone[];
    readonly siteTimeZone: ITimeZone;
    timeZoneFromId(id: number): ITimeZone;
}

export type TimeZoneServiceProp = {
    [TimeZoneService]: ITimeZoneService;
};

export const TimeZoneServiceDescriptor: IServiceDescriptor<typeof TimeZoneService, ITimeZoneService, TimeZoneServiceProp> = {
    symbol: TimeZoneService,
    dependencies: [],
    online: OnlineTimeZoneService
};