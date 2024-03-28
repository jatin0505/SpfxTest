import React from "react";
import moment, { Duration } from "moment-timezone";
import { Dropdown, IDropdownOption, Label } from "office-ui-fabric-react";

export interface ILengthOfTimePickerProps {
    label?: string;
    length: Duration;
    onChanged: (val: Duration) => void;
}

const hoursDropDownOptions: IDropdownOption[] = [
    { key: 0, text: '-' },
    { key: 1, text: '1 hour' },
    { key: 2, text: '2 hours' },
    { key: 3, text: '3 hours' },
    { key: 4, text: '4 hours' },
    { key: 5, text: '5 hours' },
    { key: 6, text: '6 hours' },
    { key: 7, text: '7 hours' },
    { key: 8, text: '8 hours' }
];

const minutesDropDownOptions: IDropdownOption[] = [
    { key: 0, text: '0 minutes' },
    { key: 5, text: '5 minutes' },
    { key: 10, text: '10 minutes' },
    { key: 15, text: '15 minutes' },
    { key: 20, text: '20 minutes' },
    { key: 25, text: '25 minutes' },
    { key: 30, text: '30 minutes' },
    { key: 35, text: '35 minutes' },
    { key: 40, text: '40 minutes' },
    { key: 45, text: '45 minutes' },
    { key: 50, text: '50 minutes' },
    { key: 55, text: '55 minutes' },
];

export const LengthOfTimePicker: React.FC<ILengthOfTimePickerProps> = (props: ILengthOfTimePickerProps) => {
    const { label, length } = props;

    const hours = Math.min(length.hours(), 8);
    const minutes = Math.floor(length.minutes() / 5) * 5; // round down to the closest 5-minute increment

    const onHoursChanged = (option: IDropdownOption) => {
        const newHours = option.key as number;
        props.onChanged(moment.duration({ hours: newHours, minutes: minutes }));
    };

    const onMinutesChanged = (option: IDropdownOption) => {
        const newMinutes = option.key as number;
        props.onChanged(moment.duration({ hours: hours, minutes: newMinutes }));
    };

    return (
        <div className="ms-Grid" aria-label={label}>
            <div className="ms-Grid-row">
                {label && <div className="ms-Grid-col ms-sm12">
                    <Label>{label}</Label>
                </div>}
            </div>
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-lg5">
                    <Dropdown
                        aria-label={"hours"}
                        selectedKey={hours}
                        options={hoursDropDownOptions}
                        onChange={(event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => onHoursChanged(option)}
                    />
                </div>
                <div className="ms-Grid-col ms-sm12 ms-lg7">
                    <Dropdown
                        aria-label={"minutes"}
                        selectedKey={minutes}
                        options={minutesDropDownOptions}
                        onChange={(event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => onMinutesChanged(option)}
                    />
                </div>
            </div>
        </div>
    );
};