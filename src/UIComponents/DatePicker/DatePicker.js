import React, { useState, useRef, useEffect } from "react";
import PropTypes, { func } from "prop-types";
import Calendar from "react-calendar";
import "./DatePicker.css";
import cal from "./calendar.svg";
import daysFilterIcon from "assets/icons/days-filter.svg";
import { useOutsideClickListener } from "../../utils/clickListenerHook";
import dropdownarrow from "../../components/Applications/Overview/dropdownarrow.svg";
import { dateResetTimeZone, fixDateTimezone } from "../../utils/DateUtility";
export function DatePicker({
	days,
	setShowDaysFilter,
	timestamp_type,
	...props
}) {
	const [date, setDate] = useState(
		props.value
			? props.value?.getTimezoneOffset() > 0
				? new Date(
						props.value?.setSeconds(
							props.value?.getSeconds() +
								props.value?.getTimezoneOffset() * 60
						)
				  )
				: props.value
			: null
	);
	const [numberOfDays, setNumberOfDays] = useState(days);
	const [timeStampType, setTimeStampType] = useState(timestamp_type);
	const [showCalender, setShowcalendar] = useState(false);
	const ref = useRef(null);

	/**
	 * On date change emit the value
	 * @param {*} date
	 */
	const onChange = (date) => {
		let offset = date.getTimezoneOffset();
		if (offset > 0) {
			date = new Date(date.setSeconds(date.getSeconds() + offset * 60));
		}
		if (date) {
			setNumberOfDays(null);
			setTimeStampType(true);
		}
		setDate(date);
		onDateChange(date);
	};

	const onDateChange = (d) => {
		props.onChange(d);
		setShowcalendar(false);
	};

	useEffect(() => {
		if (props.value) {
			setDate(props.value);
		} else setDate("");
	}, [props.value]);

	useEffect(() => {
		if (days) {
			setNumberOfDays(days);
			setDate(null);
			setTimeStampType(false);
		} else setNumberOfDays();
	}, [days]);

	/**
	 *  Function to execute when show calender is called.
	 */
	const onShowCalender = () => {
		!props.disabled && setShowcalendar(true);
		setShowDaysFilter && setShowDaysFilter(false);
	};

	useOutsideClickListener(ref, () => {
		setShowcalendar(false);
	});

	return (
		<div
			className={
				props.className
					? `z__date-picker ${props.className}`
					: `z__date-picker`
			}
			role="button"
			onClick={onShowCalender}
			ref={ref}
			style={props.style}
		>
			{!props.hideIcon && (
				<img src={props.calendarImage || cal} className="mr-1" />
			)}
			{numberOfDays && !timeStampType ? (
				`${numberOfDays} days from today`
			) : date && timeStampType && !numberOfDays ? (
				<span>{props.formatter.call(null, date)}</span>
			) : (
				<span className="z__date-picker--placeholder pl-1">
					{props.placeholder}{" "}
				</span>
			)}
			{props.showDropDown && <img src={dropdownarrow} className="ml-1" />}
			{showCalender && (
				<div
					className={props.calendarContainerClassName}
					style={props.calendarContainerStyle}
				>
					<Calendar
						minDate={props.minDate}
						onChange={(date) => onChange(date)}
						onClickMonth={(date) =>
							props.onClickMonth && onChange(date)
						}
						value={date}
						maxDate={props.maxDate}
						className={props.calendarClassName}
						view={props.calendarView || "month"}
					/>
				</div>
			)}
		</div>
	);
}

DatePicker.propTypes = {
	value: PropTypes.instanceOf(Date) || PropTypes.string,
	hideIcon: PropTypes.bool,
	placeholder: PropTypes.string,
	formatter: PropTypes.func,
	onChange: PropTypes.func,
	classNames: PropTypes.string,
};

DatePicker.defaultProps = {
	placeholder: "Date",
	hideIcon: false,
	formatter: (d) => d.toLocaleDateString(),
};

function addDays(date, days) {
	date.setDate(date.getDate() + days);
	return date;
}
