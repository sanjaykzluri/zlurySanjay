import React, { useRef, useState } from "react";
import { Calendar } from "react-calendar";
import { useOutsideClickListener } from "utils/clickListenerHook";
import { UTCDateFormatter } from "utils/DateUtility";
import cal from "../DateRangePicker/calendarNew.svg";
import moment from "moment";

export default function LatestDatePicker({
	value = null,
	calendarContainerClassName = "default-date-range-picker-calendar-class",
	calendarClassName,
	minDate,
	maxDate,
	defaultCalendarView = "month",
	calendarView = "month",
	dateFormatter = (date, format) => UTCDateFormatter(date, format),
	dateFormat = "DD MMM YYYY",
	style,
	onChange,
	onClickMonth = false,
	onClickYear = false,
	placeholder = "Date",
	height = "36px",
	width = "auto",
	disabled = false,
}) {
	const ref = useRef();
	const [showCalendar, setShowCalendar] = useState(false);

	useOutsideClickListener(ref, () => {
		setShowCalendar(false);
	});

	const handleDateChange = (date) => {
		onChange && onChange(date);
		setShowCalendar(false);
	};

	return (
		<div
			key={`${value}`}
			className={`d-flex flex-row border-1 border-radius-4 font-12 align-items-center pl-1 pr-2 position-relative ${
				disabled ? "background-disabled" : "cursor-pointer"
			}`}
			style={{
				height: height,
				width: width,
				minWidth: "125px",
				...style,
			}}
			ref={ref}
			onClick={() => !disabled && setShowCalendar(true)}
		>
			<img
				src={cal}
				height={24}
				width={24}
				className="date-range-picker-calendar-img mr-2"
			/>
			<div>{value ? moment(value).format(dateFormat) : placeholder}</div>
			{showCalendar && (
				<div
					className={`position-absolute z-index-20 ${calendarContainerClassName}`}
				>
					<Calendar
						value={value}
						onClickMonth={(date) =>
							onClickMonth && handleDateChange(date)
						}
						onClickYear={(date) =>
							onClickYear && handleDateChange(date)
						}
						onChange={(date) => handleDateChange(date)}
						view={calendarView}
						maxDate={maxDate ? new Date(maxDate) : null}
						minDate={minDate ? new Date(minDate) : null}
						className={calendarClassName ? calendarClassName : ""}
					/>
				</div>
			)}
		</div>
	);
}
