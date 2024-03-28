import React from "react";
import moment, { Moment } from "moment-timezone";
import * as cstrings from 'CommonStrings';
import { IconButton, DateRangeType } from "office-ui-fabric-react";
import { CalendarPicker } from "./CalendarPicker";

import styles from "./styles/DateRotator.module.scss";

export interface IDateRotatorProps {
    date: Moment;
    dateString: string;
    dateRangeType?: DateRangeType;
    onPrevious: () => void;
    onNext: () => void;
    onDateChanged: (date: Moment) => void;
}

export const DateRotator: React.FC<IDateRotatorProps> = (props: IDateRotatorProps) => {
    return (
        <div className={styles.dateRotator}>
            <IconButton
                iconProps={{ iconName: 'ChevronLeft' }}
                className={styles.previousDate}
                title={cstrings.DateRotator.PreviousDateButton.Text}
                onClick={props.onPrevious} />
            <CalendarPicker
                dateLabel={props.dateString}
                date={props.date}
                dateRangeType={props.dateRangeType}
                onSelectDate={props.onDateChanged}
            />
            <IconButton
                iconProps={{ iconName: 'ChevronRight' }}
                className={styles.nextDate}
                title={cstrings.DateRotator.NextDateButton.Text}
                onClick={props.onNext} />
        </div>
    );
};