import moment, { Moment } from "moment-timezone";
import { ITimeZone } from '../services';
import { User } from "../User";
import { parseFloatOrDefault, parseIntOrDefault } from '../Utils';
import { LookupResult } from "./query/LookupResult";
import { UserInfoResult } from "./query/UserInfoResult";
import { UpdateHyperlink } from "./update/UpdateHyperlink";
import { UpdateMultiChoice } from "./update/UpdateMultiChoice";
import { UpdateMultiLookup } from "./update/UpdateMultiLookup";

export namespace SPField {
    const sharepointDateTimeFormat = 'M/D/YYYY h:mm A';

    export type Query_Boolean = string;
    export type Query_Choice = string;
    export type Query_ChoiceMulti = string[];
    export type Query_DateTime = string;
    export type Query_Lookup = LookupResult[];
    export type Query_LookupMulti = LookupResult[];
    export type Query_Number = string;
    export type Query_Text = string;
    export type Query_TextMultiLine = string;
    export type Query_User = UserInfoResult[];
    export type Query_UserMulti = UserInfoResult[];
    export type Query_Url = string;
    export type Query_Image = string;

    export type Update_Boolean = boolean;
    export type Update_Choice = string;
    export type Update_ChoiceMulti = UpdateMultiChoice;
    export type Update_DateTime = string;
    export type Update_LookupId = number;
    export type Update_LookupIdMulti = UpdateMultiLookup;
    export type Update_Number = number;
    export type Update_Text = string;
    export type Update_TextMultiLine = string;
    export type Update_UserId = number;
    export type Update_UserIdMulti = UpdateMultiLookup;
    export type Update_Url = UpdateHyperlink;
    export type Update_Image = string;

    const toUserCore = (result: UserInfoResult): User => {
        return new User(result.id, result.title, result.email, result.email, result.picture, result.PrincipalType);
    };

    export const toUser = (result: Query_User): User => {
        return (result || []).map(toUserCore)[0];
    };

    export const toUsers = (results: Query_UserMulti): User[] => {
        return (results || []).map(toUserCore);
    };

    export const fromUser = (user: User): Update_UserId => {
        return user && user.id;
    };

    export const fromUsers = (users: User[]): Update_UserIdMulti => {
        return new UpdateMultiLookup(users.map(u => u.id));
    };

    export const fromDateTime = (result: Query_DateTime, siteTimeZone: ITimeZone): Moment => {
        return result ? moment.tz(result, [moment.ISO_8601, sharepointDateTimeFormat], siteTimeZone.momentId) : null;
    };

    export const toDateTime = (dateTime: Moment): Update_DateTime => {
        return dateTime ? dateTime.toISOString() : null;
    };

    export const fromYesNo = (value: Query_Boolean, defaultValue: boolean = false): boolean => {
        return value ? value == 'Yes' : defaultValue;
    };

    const removeThousandsSeparater = (value: Query_Number): Query_Number => {
        return (value || '').replace(/,/g, '');
    };

    export const fromInteger = (value: Query_Number, defaultValue: number = Number.NaN, radix: number = 10): number => {
        return parseIntOrDefault(removeThousandsSeparater(value), defaultValue, radix);
    };

    export const fromFloat = (value: Query_Number, defaultValue: number = Number.NaN): number => {
        return parseFloatOrDefault(removeThousandsSeparater(value), defaultValue);
    };

    export const lookupHasValue = (value: Query_Lookup) => {
        return value && value.length > 0 && value[0].lookupId > 0 && !!value[0].lookupValue;
    };

    export const fromLookup = <T>(value: Query_Lookup, lookup: ReadonlyMap<number, T>) => {
        return lookupHasValue(value) ? lookup.get(value[0].lookupId) : null;
    };

    export const fromLookupAsync = async <T>(value: Query_Lookup, lookup: (id: number) => T | Promise<T>) => {
        return lookupHasValue(value) ? await lookup(value[0].lookupId) : null;
    };
}