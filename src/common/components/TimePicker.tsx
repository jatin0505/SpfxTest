import React from "react";
import moment, { Duration } from "moment-timezone";
import { css, DefaultButton, Dropdown, IDropdownOption, Label } from "office-ui-fabric-react";
import { now } from "../Utils";

import styles from "./styles/TimePicker.module.scss";

export interface ITimePickerProps {
    className?: string;
    disabled?: boolean;
    label?: string;
    required?: boolean;
    value?: Duration;
    onChanged?: (value: Duration) => void;
}

const HoursOptions: IDropdownOption[] = [
    { key: 1, text: '1' },
    { key: 2, text: '2' },
    { key: 3, text: '3' },
    { key: 4, text: '4' },
    { key: 5, text: '5' },
    { key: 6, text: '6' },
    { key: 7, text: '7' },
    { key: 8, text: '8' },
    { key: 9, text: '9' },
    { key: 10, text: '10' },
    { key: 11, text: '11' },
    { key: 0, text: '12' }
];

const MinutesOptions: IDropdownOption[] = [
    { key: 0, text: '00' },
    { key: 15, text: '15' },
    { key: 30, text: '30' },
    { key: 45, text: '45' },
];

export const TimePicker: React.FC<ITimePickerProps> = (props: ITimePickerProps) => {
    const time = {
        hour: props.value.hours() % 12,
        minute: Math.floor(props.value.minutes() / 15) * 15, // round down to the closest 15-minute increment
        ampm: props.value.hours() >= 12
    };

    const constructDuration = (hour: number, minute: number, ampm: boolean) => {
        return moment.duration({ hours: hour + (ampm ? 12 : 0), minutes: minute });
    };

    const onHourChanged = (option: IDropdownOption) => {
        let newHour = option.key as number;
        props.onChanged(constructDuration(newHour, time.minute, time.ampm));
    };

    const onMinuteChanged = (option: IDropdownOption) => {
        let newMinute = option.key as number;
        props.onChanged(constructDuration(time.hour, newMinute, time.ampm));
    };

    const onAMPMClicked = () => {
        props.onChanged(constructDuration(time.hour, time.minute, !time.ampm));
    };

    return (
        <div>
            {props.label && <Label aria-label={props.required ? props.label + "." + props.required : props.label} required={props.required}>{props.label}</Label>}
            <div className={css(styles.timePicker, props.className)}>
                <Dropdown
                    ariaLabel={props.label ? "Set the hour of the" + props.label : "Set the hour."}
                    disabled={props.disabled}
                    options={HoursOptions}
                    selectedKey={time.hour}
                    onChange={(event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => onHourChanged(option)}
                />
                <Dropdown
                    ariaLabel={props.label ? "Set the minute of the" + props.label : "Set the minute."}
                    disabled={props.disabled}
                    options={MinutesOptions}
                    selectedKey={time.minute}
                    onChange={(event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => onMinuteChanged(option)}
                />
                <DefaultButton aria-label={time.ampm ? 'PM' : 'AM'} disabled={props.disabled} text={time.ampm ? 'PM' : 'AM'} onClick={onAMPMClicked} />
            </div>
        </div>
    );
};

TimePicker.defaultProps = {
    value: moment.duration({ hours: now().hours() }),
    onChanged: () => { },
    disabled: false,
    className: ''
};