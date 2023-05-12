import React, { useState, useRef } from "react";
import Calendar from "react-calendar";
import cal from "./calendarNew.svg";
import "./DateRangePicker.css";
import { useOutsideClickListener } from "../../utils/clickListenerHook";
import threeLines from "./threeLines.svg";
import { Dropdown } from "react-bootstrap";
import { dateResetTimeZone, UTCDateFormatter } from "utils/DateUtility";

const date_range_picker_dropdown = React.forwardRef(
	({ children, onClick }, ref) => (
		<a className="cursor-pointer" ref={ref} onClick={(e) => onClick(e)}>
			{children}
		</a>
	)
);

export default function DateRangePicker({
	start = new Date(),
	end = new Date(),
	calendarContainerClassName = "default-date-range-picker-calendar-class",
	minDate,
	maxDate,
	onStartChange,
	onEndChange,
	defaultCalendarView = "year",
	showDropdownToggle = false,
	dropdownOptions = [],
	dropdownOptionsFormatter = (option) => (
		<div className="d-flex justify-content-between">
			<div className="black">{option.text}</div>
			<div className="d-flex font-11 grey">
				{option.start.toISOString() === option.end.toISOString()
					? UTCDateFormatter(option.start, "MMM YYYY")
					: `${UTCDateFormatter(
							option.start,
							"MMM YYYY"
					  )}-${UTCDateFormatter(option.end, "MMM YYYY")}`}
			</div>
		</div>
	),
	dateFormatter = (date, format) => UTCDateFormatter(date, format),
	dateFormat = "DD MMM YYYY",
	calendarClassName,
	style,
}) {
	const [showStartCalender, setShowStartCalendar] = useState(false);
	const [showEndCalender, setShowEndCalendar] = useState(false);
	const [startDate, setStartDate] = useState(
		new Date(start).getTimezoneOffset() < 0
			? new Date(
					new Date(start).setSeconds(
						new Date(start).getSeconds() -
							new Date(start).getTimezoneOffset() * 60
					)
			  )
			: new Date(start).getTimezoneOffset() > 0
			? new Date(
					new Date(start).setSeconds(
						new Date(start).getSeconds() +
							new Date(start).getTimezoneOffset() * 60
					)
			  )
			: new Date(start)
	);
	const [endDate, setEndDate] = useState(
		new Date(end).getTimezoneOffset() < 0
			? new Date(
					new Date(end).setSeconds(
						new Date(end).getSeconds() -
							new Date(end).getTimezoneOffset() * 60
					)
			  )
			: new Date(end).getTimezoneOffset() > 0
			? new Date(
					new Date(end).setSeconds(
						new Date(end).getSeconds() +
							new Date(end).getTimezoneOffset() * 60
					)
			  )
			: new Date(end)
	);
	const ref = useRef();

	const handleShowCalendar = (dateType) => {
		if (dateType === "start") {
			setShowStartCalendar(true);
			setShowEndCalendar(false);
		} else {
			setShowStartCalendar(false);
			setShowEndCalendar(true);
		}
	};

	useOutsideClickListener(ref, () => {
		setShowStartCalendar(false);
		setShowEndCalendar(false);
	});

	const handleDateChange = (date) => {
		date = dateResetTimeZone(date);
		if (showStartCalender) {
			setStartDate(date);
			onStartChange(date);
		} else {
			setEndDate(date);
			onEndChange(date);
		}
		setShowStartCalendar(false);
		setShowEndCalendar(false);
	};

	const handleShowDropdown = () => {
		setShowStartCalendar(false);
		setShowEndCalendar(false);
	};

	const handleDropdownOptionAction = (option) => {
		setStartDate(option.start);
		setEndDate(option.end);
	};

	return (
		<div
			key={`${start}_${end}`}
			className="d-flex flex-row border-1 border-radius-4 font-12 align-items-center pl-1 pr-2 position-relative"
			style={{
				height: "32px",
				...style,
			}}
			ref={ref}
		>
			<img
				src={cal}
				height={24}
				width={24}
				className="date-range-picker-calendar-img mr-2"
			/>
			<div
				className={`cursor-pointer ${
					showStartCalender && "active-calendar-date"
				}`}
				onClick={() => handleShowCalendar("start")}
			>
				{dateFormatter(startDate, dateFormat)}
			</div>
			<div className="ml-2 mr-2">-</div>
			<div
				className={`cursor-pointer ${
					showEndCalender && "active-calendar-date"
				}`}
				onClick={() => handleShowCalendar("end")}
			>
				{dateFormatter(endDate, dateFormat)}
			</div>
			{(showStartCalender || showEndCalender) && (
				<div
					className={`position-absolute ${calendarContainerClassName}`}
				>
					<Calendar
						value={showStartCalender ? startDate : endDate}
						onClickMonth={(date) => handleDateChange(date)}
						onClickYear={(date) =>
							defaultCalendarView === "decade" &&
							handleDateChange(date)
						}
						onChange={(date) =>
							defaultCalendarView === "month" &&
							handleDateChange(date)
						}
						defaultView={defaultCalendarView}
						maxDate={
							showStartCalender
								? new Date(endDate)
								: maxDate
								? new Date(maxDate)
								: ""
						}
						minDate={
							showEndCalender
								? new Date(startDate)
								: minDate
								? new Date(minDate)
								: ""
						}
						className={calendarClassName ? calendarClassName : ""}
					/>
				</div>
			)}
			{showDropdownToggle && (
				<Dropdown>
					<Dropdown.Toggle as={date_range_picker_dropdown}>
						<img
							src={threeLines}
							className="ml-3 cursor-pointer"
							onClick={handleShowDropdown}
						/>
					</Dropdown.Toggle>
					<Dropdown.Menu
						bsPrefix="date-range-picker-dropdown-menu"
						className="date-range-picker-dropdown-position"
					>
						{dropdownOptions.map((option) => (
							<Dropdown.Item
								onClick={() =>
									handleDropdownOptionAction(option)
								}
							>
								{dropdownOptionsFormatter(option)}
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown>
			)}
		</div>
	);
}
