import React from "react";
import { DatePicker, DayOfWeek, IDatePickerStrings, IDatePickerStyleProps, IDatePickerStyles, IStyleFunctionOrObject } from '@fluentui/react';

const DayPickerStrings: IDatePickerStrings = {
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],

    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

    goToToday: 'Go to today',
    prevMonthAriaLabel: 'Go to previous month',
    nextMonthAriaLabel: 'Go to next month',
    prevYearAriaLabel: 'Go to previous year',
    nextYearAriaLabel: 'Go to next year',
    closeButtonAriaLabel: 'Close date picker',
    prevYearRangeAriaLabel: 'Previous year range',
    nextYearRangeAriaLabel: 'Next year range'

};

export interface IDatePickerControlProps {
    label?: string;
    dateValue: Date;
    disabled: boolean;
    onDateChange: (value: Date) => void;
    minDate?: Date;
    required?: boolean;
    placeHolder?: string;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    disableAutoFocus?: boolean;
    styles?: IStyleFunctionOrObject<IDatePickerStyleProps, IDatePickerStyles>;
}

export const DatePickerControl: React.FC<IDatePickerControlProps> = (props: IDatePickerControlProps) => {
    return (
        <DatePicker
            label={props.label}
            isRequired={props.required}
            firstDayOfWeek={DayOfWeek.Sunday}
            minDate={props.minDate}
            strings={DayPickerStrings}
            placeholder={props.placeHolder ? props.placeHolder : "Select a date..."}
            ariaLabel={props.ariaLabel ? props.ariaLabel : "Select a date..."}
            value={props.dateValue}
            disabled={props.disabled}
            onSelectDate={(val) => {
                props.onDateChange(val);
            }}
            textField={{

                "aria-describedby": props.ariaDescribedBy,

                styles: { field: { border: '1px solid black' }, fieldGroup: { border: '0px solid black' } }

            }}
            //textField={{ "aria-describedby": props.ariaDescribedBy }}
            disableAutoFocus={props.disableAutoFocus}
            styles={props.styles}
        />

    );
};

DatePickerControl.defaultProps = {
    label: "",
    required: false
};
