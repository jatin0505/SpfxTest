import * as cstrings from "CommonStrings";
import { Text } from "@microsoft/sp-core-library";
import { Entity } from './Entity';

export class ValidationRule<E extends Entity<any>> {
    constructor(
        public readonly validate: (enitity: E) => boolean,
        public readonly failMessage: string
    ) { }
}

export class RequiredValidationRule<E extends Entity<any>> extends ValidationRule<E> {
    constructor(
        field: (entity: E) => string | object,
        failMessage: string = cstrings.Validation.Required
    ) {
        super((e: E) => RequiredValidationRule.hasValue(field(e)), failMessage);
    }

    public static hasValue(val: any): boolean {
        if (typeof val === "string") {
            return !RequiredValidationRule._isBlank(val);
        } else if (Array.isArray(val)) {
            return val.length > 0;
        } else {
            return !!val;
        }
    }

    private static _isBlank(val: string): boolean {
        return (!val || /^\s*$/.test(val));
    }
}

export class MaxLengthValidationRule<E extends Entity<any>> extends ValidationRule<E> {
    constructor(
        field: (entity: E) => string,
        maxLength: number,
        failMessage: string = cstrings.Validation.MaximumLength
    ) {
        super((e: E) => field(e).length <= maxLength, Text.format(failMessage, maxLength));
    }
}

export class UrlValidationRule<E extends Entity<any>> extends ValidationRule<E> {
    constructor(
        field: (entity: E) => string,
        failMessage: string = cstrings.Validation.Url
    ) {
        super((e: E) => this._isUrl(field(e)), failMessage);
    }

    private _isUrl(val: any): boolean {
        const regexp = /^(((https|http|ftp):\/\/)(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?)?$/;
        if (regexp.test(val)) {
            return true;
        }
        else {
            return false;
        }
    }
}