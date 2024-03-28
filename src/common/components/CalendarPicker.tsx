import React from "react";
import moment, { Moment } from "moment-timezone";
import { ActionButton, Calendar, DayOfWeek, DateRangeType, Callout, DirectionalHint, FocusTrapZone } from 'office-ui-fabric-react';
import { now } from "../Utils";
import { StatefulComponent } from "./StatefulComponent";

export interface ICalendarPickerProps {
    dateLabel: string;
    dateRangeType?: DateRangeType;
    disabled?: boolean;
    date?: Moment;
    onSelectDate?: (date: Moment) => void;
}

export interface ICalendarPickerState {
    showCalendar: boolean;
}

const DayPickerStrings = {
    months: moment.months(),
    shortMonths: moment.monthsShort(),
    days: moment.weekdays(),
    shortDays: moment.weekdaysMin(),
    goToToday: 'Go to today',
    prevMonthAriaLabel: 'Go to previous month',
    nextMonthAriaLabel: 'Go to next month',
    prevYearAriaLabel: 'Go to previous year',
    nextYearAriaLabel: 'Go to next year'
};

export class CalendarPicker extends StatefulComponent<ICalendarPickerProps, ICalendarPickerState> {
    public static defaultProps: Partial<ICalendarPickerProps> = {
        dateRangeType: DateRangeType.Day,
        disabled: false,
        date: now(),
        onSelectDate: (date: Moment) => { }
    };

    private _calendarButtonElement: HTMLElement;

    constructor(props: ICalendarPickerProps) {
        super(props);

        this.state = {
            showCalendar: false
        };
    }

    private readonly _toggleCalendar = () => {
        this.setState({
            showCalendar: !this.state.showCalendar
        });
    }

    private readonly _onSelectDate = (date: Moment) => {
        this.props.onSelectDate(date);
        this.setState({ showCalendar: false });
    }

    public render(): JSX.Element {
        return (
            <div>
                <div ref={(calendarBtn) => this._calendarButtonElement = calendarBtn}>
                    <ActionButton
                        disabled={this.props.disabled}
                        onClick={this._toggleCalendar}
                        text={this.props.dateLabel}
                    />
                </div>
                {this.state.showCalendar && (
                    <Callout
                        onDismiss={() => this.setState({ showCalendar: false })}
                        isBeakVisible={false}
                        gapSpace={0}
                        doNotLayer={false}
                        target={this._calendarButtonElement}
                        directionalHint={DirectionalHint.bottomLeftEdge}
                        setInitialFocus={true}
                    >
                        <FocusTrapZone isClickableOutsideFocusTrap={true}>
                            <Calendar
                                dateRangeType={this.props.dateRangeType}
                                onSelectDate={date => this._onSelectDate(moment(date).tz(moment.tz.guess()))}
                                value={this.props.date.clone().tz(moment.tz.guess(), true).toDate()}
                                firstDayOfWeek={DayOfWeek.Sunday}
                                strings={DayPickerStrings}
                            />
                        </FocusTrapZone>
                    </Callout>
                )}
            </div>
        );
    }
}