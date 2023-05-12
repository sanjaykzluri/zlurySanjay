import React, { useEffect, useRef, useState } from "react";
import { Form, Col } from "react-bootstrap";
import { reportsConstants } from "../../../../constants/reports";
import { useDispatch, useSelector } from "react-redux";
import "./RangeFilter.css";
import { ACTION_TYPE } from "../../../../components/Users/Applications/Modals/FiltersRenderer/redux";
import { DatePicker } from "../../../../UIComponents/DatePicker/DatePicker";
import { dateResetTimeZone } from "../../../../utils/DateUtility";
import daysFilterIcon from "assets/icons/days-filter.svg";
import moment from "moment";
import { useOutsideClickListener } from "utils/clickListenerHook";
import { DayFilter } from "./DayFilter";

export function DateRangeFilter({ timestamp_type = true, ...props }) {
	const dispatch = useDispatch();
	const [filterObj, setFilterObj] = useState({
		fieldValues: [],
		fieldOrder: [],
		timestamp_type: true,
	});
	const [startDate, setStartDate] = useState();
	const [endDate, setEndDate] = useState();
	const [minRange, setMinRange] = useState();
	const [maxRange, setMaxRange] = useState();
	const [dd1active, setdd1active] = useState(false);
	const [dd2active, setdd2active] = useState(false);
	const [warning, setWarning] = useState(false);
	const [showDaysFilter, setShowDaysFilter] = useState(false);
	const [numberOfDays, setNumberOfDays] = useState();
	const [timeStampType, setTimeStampType] = useState(timestamp_type);
	const ref = useRef(null);

	useEffect(() => {
		if (
			Array.isArray(props.appliedValue) &&
			props.appliedValue?.[0]?.time
		) {
			setNumberOfDays(props.appliedValue[0]?.time);
			setTimeStampType(false);
			setStartDate();
			setMinRange(props.appliedOrder[0]);
		} else if (
			Array.isArray(props.appliedValue) &&
			props.appliedValue.length === 1 &&
			props.appliedOrder[0] !== "lte"
		) {
			setStartDate(new Date(props.appliedValue[0]));
			setMinRange(props.appliedOrder[0]);
		} else if (
			Array.isArray(props.appliedValue) &&
			props.appliedValue.length > 1
		) {
			setStartDate(new Date(props.appliedValue[0]));
			setMinRange(props.appliedOrder[0]);
			setEndDate(new Date(props.appliedValue[1]));
			setMaxRange(props.appliedOrder[1]);
		} else if (
			Array.isArray(props.appliedValue) &&
			props.appliedValue.length === 1 &&
			props.appliedOrder[0] === "lte"
		) {
			setEndDate(new Date(props.appliedValue[0]));
			setMaxRange(props.appliedOrder[0]);
			setStartDate(null);
			setMaxRange("gte");
		}
		if (props.appliedValue === undefined) {
			setMinRange(null);
			setMaxRange(null);
		}
	}, [props.appliedValue]);

	useEffect(() => {
		let tempFilterObj = { ...filterObj };
		let finaltemp = {
			fieldValues: [
				{
					time: numberOfDays,
					unit: "days",
				},
			],
			fieldOrder: [minRange],
			timestamp_type: false,
		};
		tempFilterObj = finaltemp;
		setTimeStampType(numberOfDays ? false : true);

		setFilterObj(tempFilterObj);
		props.handleDateRange && props.handleDateRange(tempFilterObj, warning);
	}, [numberOfDays]);

	const handleInputChange1 = (value) => {
		setStartDate(dateResetTimeZone(value));
		setNumberOfDays(null);
		setTimeStampType(true);
		if (value < 0) {
			setWarning(true);
		}
		if (endDate && endDate > 0 && value > endDate) {
			setWarning(true);
		}
		if (endDate && endDate > 0 && value < endDate) {
			setWarning(false);
		}
		if (
			(!endDate && value > 0) ||
			value === 0 ||
			value === null ||
			value === ""
		) {
			setWarning(false);
		}
	};
	useEffect(() => {
		let tempFilterObj = { ...filterObj };
		if (!timeStampType && minRange && numberOfDays) {
			tempFilterObj.fieldValues[0] = {
				time: numberOfDays,
				unit: "days",
			};
			tempFilterObj.fieldOrder[0] = minRange;
			tempFilterObj.timestamp_type = false;
		}
		if (timeStampType) {
			tempFilterObj.timestamp_type = true;
			if (minRange && startDate !== null) {
				tempFilterObj.fieldValues[0] = startDate;
				tempFilterObj.fieldOrder[0] = minRange;
			}
			if (minRange && startDate === "") {
				tempFilterObj.fieldOrder.splice(0, 1);
				tempFilterObj.fieldValues.splice(0, 1);
			}
			if (minRange && startDate === "" && maxRange && endDate) {
				let finaltemp = {
					fieldValues: [],
					fieldOrder: [],
				};
				finaltemp.fieldOrder[0] = maxRange;
				finaltemp.fieldValues[0] = endDate;
				tempFilterObj = finaltemp;
			}
			if (minRange && startDate && maxRange && endDate) {
				let finaltemp = {
					fieldValues: [],
					fieldOrder: [],
				};
				finaltemp.fieldOrder[0] = minRange;
				finaltemp.fieldValues[0] = startDate;
				finaltemp.fieldOrder[1] = maxRange;
				finaltemp.fieldValues[1] = endDate;
				tempFilterObj = finaltemp;
			}
			if (minRange && startDate && maxRange && startDate > endDate) {
				tempFilterObj.fieldOrder.splice(1, 1);
				tempFilterObj.fieldValues.splice(1, 1);
			}
			if (
				!maxRange &&
				!minRange &&
				(startDate === "" || startDate === null) &&
				(endDate === "" || endDate === null)
			) {
				let finaltemp = {
					fieldValues: [],
					fieldOrder: [],
					timestamp_type: true,
				};
				tempFilterObj = finaltemp;
			}
		}
		setFilterObj(tempFilterObj);

		props.handleDateRange && props.handleDateRange(tempFilterObj, warning);
	}, [startDate, timeStampType]);

	const handleInputChange2 = (value) => {
		setEndDate(dateResetTimeZone(value));
		setNumberOfDays(null);
		setTimeStampType(true);
		if (
			value !== (0 || null || "") &&
			(value < startDate || value < 0 || startDate < 0)
		) {
			setWarning(true);
		} else {
			setWarning(false);
		}
	};
	useEffect(() => {
		let tempFilterObj = { ...filterObj };
		if (maxRange && endDate !== null) {
			tempFilterObj.fieldValues[1] = endDate;
			tempFilterObj.fieldOrder[1] = maxRange;
		}
		if ((maxRange && endDate === "") || endDate === null) {
			tempFilterObj.fieldOrder.splice(1, 1);
			tempFilterObj.fieldValues.splice(1, 1);
		}
		if (
			minRange &&
			(startDate === "" || startDate === null) &&
			maxRange &&
			endDate === ""
		) {
			let finaltemp = {
				fieldValues: [],
				fieldOrder: [],
			};
			// finaltemp.fieldOrder[0] = maxRange
			// finaltemp.fieldValues[0] = endDate
			tempFilterObj = finaltemp;
		}
		if (
			minRange &&
			(startDate === "" || startDate === null) &&
			maxRange &&
			endDate
		) {
			let finaltemp = {
				fieldValues: [],
				fieldOrder: [],
			};
			finaltemp.fieldOrder[0] = maxRange;
			finaltemp.fieldValues[0] = endDate;
			tempFilterObj = finaltemp;
		}
		if (minRange && startDate && maxRange && startDate > endDate) {
			tempFilterObj.fieldOrder.splice(1, 1);
			tempFilterObj.fieldValues.splice(1, 1);
		}
		if (
			!maxRange &&
			!minRange &&
			(startDate === "" || startDate === null) &&
			(endDate === "" || endDate === null)
		) {
			let finaltemp = {
				fieldValues: [],
				fieldOrder: [],
			};
			tempFilterObj = finaltemp;
		}
		props.handleDateRange && props.handleDateRange(tempFilterObj, warning);
		setFilterObj(tempFilterObj);
	}, [endDate]);

	const handleFilterClick1 = (value) => {
		props.isFilterModal &&
			dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: {
					key: props.field_id,
					value: {
						...props,
					},
				},
			});
		setWarning(false);
		setMinRange(value);
		setMaxRange();
		setStartDate(null);
		setEndDate(null);
		setdd1active(false);
		setFilterObj({
			fieldValues: [],
			fieldOrder: [],
		});
		setNumberOfDays(null);
		setTimeStampType(true);
		setShowDaysFilter(false);
	};
	const handleFilterClick2 = (value) => {
		props.isFilterModal &&
			dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: {
					key: props.field_id,
					value: {},
				},
			});
		setWarning(false);
		setMinRange(reportsConstants.GREATER_THAN_EQUAL);
		setMaxRange(reportsConstants.LESS_THAN_EQUAL);
		setStartDate(null);
		setEndDate(null);
		setFilterObj({
			fieldValues: [],
			fieldOrder: [],
		});
		setNumberOfDays(null);
		setTimeStampType(true);
		setShowDaysFilter(false);
	};

	useOutsideClickListener(ref, () => {
		setShowDaysFilter(false);
	});

	function handleDaysFilter(value, unit, isManual = false) {
		if (value === "") {
			setNumberOfDays(null);
			return;
		}
		setNumberOfDays(value);
		setStartDate(null);
		setTimeStampType(false);
		!isManual && setShowDaysFilter(false);

		// let tempFilterObj = { ...filterObj };
		// let finaltemp = {
		// 	fieldValues: [
		// 		{
		// 			time: value,
		// 			unit: "days",
		// 		},
		// 	],
		// 	fieldOrder: [minRange],
		// 	timestamp_type: false,
		// };
		// tempFilterObj = finaltemp;

		// setFilterObj(tempFilterObj);
		// props.handleDateRange && props.handleDateRange(tempFilterObj, warning);
		// handleInputChange1(value);
	}

	const radioId = props.field_id ? props.field_id : "formHorizontalRadios";

	return (
		<>
			<Col style={props.isFilterModal ? { paddingLeft: "0px" } : null}>
				<Form.Check
					type="radio"
					label="Date is"
					name={props.name ? props.name : "formHorizontalRadios"}
					id={radioId + "7"}
					value={reportsConstants.EQUAL_TO}
					onClick={(e) => handleFilterClick1(e.target.value)}
					checked={minRange === "eq"}
				/>
				{minRange === reportsConstants.EQUAL_TO && (
					<>
						<div
							style={{ marginTop: "10px", marginBottom: "10px" }}
						>
							<DatePicker
								value={startDate}
								timestamp_type={timeStampType}
								className="rangefilter-datepicker"
								onChange={(value) => handleInputChange1(value)}
								calendarClassName="rangefilter-calendar"
								calendarContainerClassName="rangefilter-calendar-container"
							/>
						</div>
					</>
				)}
				<Form.Check
					type="radio"
					label="Date is before"
					name={props.name ? props.name : "formHorizontalRadios"}
					id={radioId + "8"}
					value={reportsConstants.LESS_THAN}
					onClick={(e) => handleFilterClick1(e.target.value)}
					checked={minRange === "lt"}
				/>
				{minRange === reportsConstants.LESS_THAN && (
					<>
						<div
							style={{ marginTop: "10px", marginBottom: "10px" }}
						>
							<div
								style={{
									background: "#FFFFFF",
									border: "1px solid #DDDDDD",
									borderRadius: "4px",
								}}
								className="flex flex-row justify-content-between align-items-center"
							>
								<DatePicker
									timestamp_type={timeStampType}
									days={numberOfDays}
									value={startDate}
									className="rangefilter-datepicker border-none"
									onChange={(value) =>
										handleInputChange1(value)
									}
									calendarClassName="rangefilter-calendar"
									calendarContainerClassName="rangefilter-calendar-container"
									placeholder="Select Date"
									setShowDaysFilter={setShowDaysFilter}
								/>
								<div className="mr-2">
									<img
										onClick={() => {
											setShowDaysFilter(!showDaysFilter);
										}}
										src={daysFilterIcon}
									/>
								</div>
							</div>
							{showDaysFilter && (
								<DayFilter
									handleDaysFilter={handleDaysFilter}
									ref={ref}
								/>
							)}
						</div>
					</>
				)}
				<Form.Check
					type="radio"
					label="Date is after"
					name={props.name ? props.name : "formHorizontalRadios"}
					id={radioId + "9"}
					value={reportsConstants.GREATER_THAN}
					onClick={(e) => handleFilterClick1(e.target.value)}
					checked={minRange === "gt"}
				/>
				{minRange === reportsConstants.GREATER_THAN && (
					<>
						<div
							style={{ marginTop: "10px", marginBottom: "10px" }}
						>
							<div
								style={{
									background: "#FFFFFF",
									border: "1px solid #DDDDDD",
									borderRadius: "4px",
								}}
								className="flex flex-row justify-content-between align-items-center"
							>
								<DatePicker
									timestamp_type={timeStampType}
									days={numberOfDays}
									value={startDate}
									className="rangefilter-datepicker border-none"
									onChange={(value) =>
										handleInputChange1(value)
									}
									calendarClassName="rangefilter-calendar"
									calendarContainerClassName="rangefilter-calendar-container"
									placeholder="Select Date"
									setShowDaysFilter={setShowDaysFilter}
								/>
								<div className="mr-2">
									<img
										onClick={() => {
											setShowDaysFilter(!showDaysFilter);
										}}
										src={daysFilterIcon}
									/>
								</div>
							</div>
							{showDaysFilter && (
								<DayFilter
									handleDaysFilter={handleDaysFilter}
									ref={ref}
								/>
							)}
						</div>
					</>
				)}

				<Form.Check
					type="radio"
					label="Date Range"
					name={props.name ? props.name : "formHorizontalRadios"}
					id={radioId + "10"}
					value="range"
					onClick={(e) => handleFilterClick2(e.target.value)}
					checked={minRange === "gte" || maxRange === "lte"}
				/>
				{minRange === reportsConstants.GREATER_THAN_EQUAL && (
					<>
						<div
							className="rangeFilter__rangediv"
							style={{ marginTop: "10px", marginBottom: "10px" }}
						>
							<DatePicker
								timestamp_type={timeStampType}
								value={startDate}
								className="rangefilter-datepicker"
								onChange={(value) => handleInputChange1(value)}
								calendarClassName="rangefilter-calendar"
								calendarContainerClassName="rangefilter-calendar-container"
							/>
							<span
								style={{
									marginRight: "10px",
									marginLeft: "10px",
								}}
							>
								-
							</span>
							<DatePicker
								timestamp_type={timeStampType}
								value={endDate}
								className="rangefilter-datepicker"
								onChange={(value) => handleInputChange2(value)}
								calendarClassName="rangefilter-calendar"
								calendarContainerClassName={
									props.calendarContainerClassName ||
									"rangefilter-end-calendar-container"
								}
							/>
						</div>
					</>
				)}
			</Col>
		</>
	);
}
