import moment, { Moment, Duration, MomentZone } from "moment-timezone";
import { sp } from "@pnp/sp";
import { IDropdownOption } from "office-ui-fabric-react";
import sanitizeHTML from 'sanitize-html';

export type ArrayType<A> = A extends Array<infer T> ? T : never;
export type UnionToIntersectionType<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export type PropsOfType<T, TProp> = keyof Pick<T, { [Key in keyof T]: T[Key] extends TProp ? Key : never }[keyof T]>;

export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const now = (zoneName?: string): Moment => {
    const n = moment();
    const defaultZone = (moment as any).defaultZone as MomentZone;
    const zone = zoneName || (defaultZone && defaultZone.name);
    if (zone) n.tz(zone);
    return n;
};

export const parseIntOrDefault = (val: string, _default: number = 0.0, radix: number = 10): number => {
    const num = parseInt(val, radix);
    return isNaN(num) ? _default : num;
};

export const parseFloatOrDefault = (val: string, _default: number = 0.0): number => {
    const num = parseFloat(val);
    return isNaN(num) ? _default : num;
};

export const nameofFactory = <T extends {}>() => (name: keyof T) => name;

export const stringToEnum = <T extends string>(o: Array<T>): { [K in T]: K } & { [x: string]: T | undefined } => {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
};

export const setToArray = <V>(set: Set<V>): V[] => {
    let array: V[] = [];
    let values: Iterator<V> = set.values();
    let current: IteratorResult<V> = values.next();
    while (!current.done) {
        array.push(current.value);
        current = values.next();
    }
    return array;
};

export const mapToArray = <K, V>(map: Map<K, V>): V[] => {
    let array: V[] = [];
    let values: Iterator<V> = map.values();
    let current: IteratorResult<V> = values.next();
    while (!current.done) {
        array.push(current.value);
        current = values.next();
    }
    return array;
};

export const mapForEach = <K, V>(map: Map<K, V>, callbackFn: (key: K, value: V) => void): void => {
    let values: Iterator<[K, V]> = map.entries();
    let current: IteratorResult<[K, V]> = values.next();
    while (!current.done) {
        callbackFn(current.value[0], current.value[1]);
        current = values.next();
    }
};

export const mapGetOrAdd = <K, V>(map: Map<K, V>, key: K, create: () => V): V => {
    if (map.has(key)) {
        return map.get(key);
    } else {
        const value = create();
        map.set(key, value);
        return value;
    }
};

export const arrayToMap = <K, V>(mapFn: (val: V) => K, items: V[]): Map<K, V> => {
    return new Map<K, V>(items.map(item => [mapFn(item), item] as [K, V]));
};

export const distinct = <K, V>(items: V[], keyFn: (val: V) => K): V[] => {
    const map = new Map<K, V>();
    items.forEach(item => mapGetOrAdd(map, keyFn(item), () => item));
    return mapToArray(map);
};

export const groupBy = <K, V>(mapFn: (val: V) => K, items: V[]): Map<K, V[]> => {
    const groups = new Map<K, V[]>();
    items.forEach(item => {
        mapGetOrAdd(groups, mapFn(item), () => [])
            .push(item);
    });
    return groups;
};

export const dropdownTextAscComparer = (opt_a: IDropdownOption, opt_b: IDropdownOption): number => {
    if (opt_a.text == opt_b.text)
        return 0;
    else
        return opt_a.text > opt_b.text ? 1 : -1;
};

export const todayOrAfter = (date: Moment) => {
    return moment.max(now(date.tz()).startOf('day'), date);
};

export const timeAsDuration = (date: Moment): Duration => {
    return moment.duration(date.diff(moment(date).startOf('day')));
};

export const countAsString = (val: number, singularUnit: string, pluralUnit: string) => {
    return val == 0 ? `no ${pluralUnit}` : [val, val > 1 ? pluralUnit : singularUnit].join(' ');
};

export const humanizeDuration = (duration: Duration) => {
    if (duration.asMinutes() % 60 > 0 && duration.asMinutes() > 60) {
        return [
            countAsString(duration.hours(), 'hr', 'hrs'),
            countAsString(duration.minutes(), 'min', 'mins')
        ].join(' ').trim();
    } else if (duration.asMinutes() < 60) {
        return countAsString(duration.minutes(), 'min', 'mins').trim();
    } else if (duration.asHours() > 0) {
        return countAsString(duration.hours(), 'hr', 'hrs').trim();
    } else {
        return '';
    }
};

export const humanizeList = (items: string[], separator: string = ',', conjunction: string = 'and') => {
    if (items.length <= 1) {
        return items[0] || '';
    }
    else if (items.length == 2) {
        return `${items[0]} ${conjunction} ${items[1]}`;
    }
    else {
        return `${items.slice(0, -1).join(separator)}${separator} ${conjunction} ${items.slice(-1)}`;
    }
};

export const scrollParent = (element: Element, includeHidden: boolean): Element => {
    try {
        var style = getComputedStyle(element);
        var excludeStaticParent = style.position === "absolute";
        var overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

        if (style.position === "fixed") return document.body;
        for (var parent = element; (parent = parent.parentElement);) {
            style = getComputedStyle(parent);
            if (excludeStaticParent && style.position === "static") {
                continue;
            }
            if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
        }
    }
    catch (e) { }

    return document.body;
};

export const formatDateTime = (dateTime: Moment) => {
    return dateTime ? dateTime.format('M/D/YYYY 00:00 A') : null;
    //return dateTime ? dateTime.format('YYYY-MM-DDTHH:mmZ') : null;
};

export const publicMembersOnlyReplacer = (key: string, val: any) => key[0] == '_' ? undefined : val;

export const isExecutingInWorkbench = () => window.location.pathname.indexOf('/_layouts/15/workbench.aspx') > 0;
export const isExecutingInTeamsTab = () => window.location.pathname.indexOf('/_layouts/15/teamshostedapp.aspx') > 0;

export const currentPageServerRelativeUrl = async (): Promise<string> => {
    const pathname = window.location.pathname;
    if (pathname.indexOf(".aspx") > 0) {
        return pathname;
    } else {
        const href = window.location.href;
        const rootFolder = await sp.web.rootFolder.get();
        return new URL(rootFolder.ServerRelativeUrl + rootFolder.WelcomePage, href).pathname;
    }
};

export const renderSanitizedHTML = (value: string) => {
    return sanitizeHTML(value, {
        allowedTags: ['div', 'span', 'strong', 'b', 'p', 'a', 'title', 'h1', 'h2', 'h3', 'h4', 'h5', 'i', 'u',
            'strike', 'ol', 'ul', 'li', 'font', 'br', 'hr', 'link',
            'table', 'th', 'tr', 'td'],
        allowedAttributes: false
    });
};