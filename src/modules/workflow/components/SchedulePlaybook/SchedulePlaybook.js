import moment from "moment";
import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";
import { Select } from "UIComponents/Select/Select";
import {
	addTimeToDate,
	getNthDayBeforeDate,
	timeGenerator,
} from "utils/DateUtility";
import "./SchedulePlaybook.css";
import { getTimezones } from "services/api/users";
import { TriggerIssue } from "utils/sentry";

const SchedulePlaybook = ({
	buttonText,
	confirmationText,
	setConfirmationText,
	onConfirmRun,
	selectedUsers,
	isAPICalling,
	schedulePlaybookData,
	setSchedulePlaybookData,
	onCancelClick,
}) => {
	const [error, setError] = useState();
	const [timsezones, setTimezones] = useState();
	const [isValidated, setIsValidated] = useState(false);

	useEffect(() => {
		if (isValidated) {
			handleChange({
				target: {},
			});
		}
	}, [isValidated]);

	useEffect(() => {
		if (schedulePlaybookData) {
			isScheduleValidated();
		}
	}, [schedulePlaybookData]);

	useEffect(() => {
		if (timsezones && !schedulePlaybookData?.timezone) {
			const localTimeZone = moment.tz.guess();
			const defaultTimezone = timsezones?.filter((timezone) =>
				timezone?.utc?.includes(localTimeZone)
			);
			let defaultValues = [
				{
					name: "timezone",
					value: defaultTimezone?.[0],
				},
			];
			defaultValues?.map((item) =>
				handleChange({
					target: { name: item.name, value: item.value },
				})
			);
		} else {
			handleChange({
				target: {},
			});
		}
	}, [timsezones]);

	useEffect(() => {
		if (!timsezones)
			getTimezones()
				.then((res) => {
					if (Array.isArray(res)) {
						setTimezones(res);
					} else {
						setTimezones([]);
					}
				})
				.catch((err) => {
					setTimezones([]);
					TriggerIssue("Error in get Timezones", err);
				});
	}, [timsezones]);

	const validateDate = () => {
		if (schedulePlaybookData?.scheduled_date) {
			const { scheduled_date, timezone } = schedulePlaybookData;

			let dateInSelectedTimeZone = new Date()
				.toISOString()
				.toLocaleString("en-US", {
					timeZone: timezone.utc[0],
				});
			let selectedTimezoneCurrentDate = new Date(
				dateInSelectedTimeZone
			).toUTCString();

			let selectedDateInSelectedTimeZone = new Date(scheduled_date)
				.toISOString()
				.toLocaleString("en-US", {
					timeZone: timezone.utc[0],
				});

			let selectedTimezoneSelectedDate = new Date(
				selectedDateInSelectedTimeZone
			).toISOString();
			if (
				Date.parse(selectedTimezoneSelectedDate) <
				Date.parse(selectedTimezoneCurrentDate)
			) {
				setError("Please select future date & time");
				return true;
			} else {
				setError(null);
				return false;
			}
		}
	};

	const handleChange = (e) => {
		const { name, value } = e?.target;
		setError(null);

		setSchedulePlaybookData((prev = {}) => {
			if (
				(name === "time" || prev?.time) &&
				(name === "label_date" || prev?.label_date) &&
				(name === "timezone" || prev?.timezone)
			) {
				const t = name === "time" ? value : prev?.time;
				const d = name === "label_date" ? value : prev?.label_date;
				const tz =
					name === "timezone" ? value?.utc : prev?.timezone?.utc;
				let splittedTime = t?.split(" ");
				let u = splittedTime[1];
				const newDate = addTimeToDate(t, u, d);
				const selectedTimeZone = tz?.[0];
				const localTimeZone = moment.tz.guess();
				if (!moment().tz()) moment.tz.setDefault(selectedTimeZone);
				prev.scheduled_date = moment(newDate)
					.tz(selectedTimeZone, true)
					.toJSON();
				moment.tz.setDefault(localTimeZone);
			}
			const obj = {};
			if (name && value) {
				obj[name] = value;
			}
			return { ...prev, ...obj };
		});
	};

	const runTimeUI = (
		<div className="d-flex">
			<Select
				selectorClassStyle={{
					textTransform: "none !important",
					minWidth: "130px",
				}}
				optionsContainerClassName="schedule-time-picker"
				className="flex-fill black-1 w-auto"
				options={timeGenerator(30)}
				fieldNames={{
					label: "time",
				}}
				placeholder="Time"
				value={
					schedulePlaybookData?.time
						? {
								time: schedulePlaybookData?.time,
								value: schedulePlaybookData?.time,
						  }
						: null
				}
				onChange={(obj) => {
					handleChange({
						target: {
							name: "time",
							value: obj?.value,
						},
					});
				}}
			/>
		</div>
	);

	const getLabelDate = (date) => {
		return date ? new Date(date)?.toISOString() : null;
	};

	const isScheduleValidated = () => {
		if (schedulePlaybookData) {
			const { label_date, scheduled_date, time } = schedulePlaybookData;
			if (label_date && scheduled_date && time) {
				setIsValidated(true);
				return true;
			} else {
				setIsValidated(false);
				return false;
			}
		}
	};

	return (
		<>
			<div className="d-flex flex-column">
				<div className="d-flex justify-content-center mt-1 flex-wrap">
					<div className="schedule-playbook-timezone-container mr-2">
						<span style={{ fontSize: "12px", fontWeight: "400" }}>
							Select Timezone
						</span>
						<Select
							key={Math.random()}
							filter
							search
							selectorClassStyle={{
								textTransform: "none !important",
							}}
							isOptionsLoading={!timsezones}
							className="flex-fill black-1 w-auto "
							options={timsezones}
							fieldNames={{
								label: "text",
							}}
							placeholder="Timezone"
							value={
								schedulePlaybookData?.timezone
									? [schedulePlaybookData?.timezone]
									: null
							}
							onChange={(obj) => {
								handleChange({
									target: {
										name: "timezone",
										value: obj,
									},
								});
							}}
						/>
					</div>
					<div className="flex-1 mr-2">
						<span style={{ fontSize: "12px", fontWeight: "400" }}>
							Schedule Run
						</span>
						<NewDatePicker
							key={
								JSON.stringify(schedulePlaybookData) ||
								"schedulePlaybookData"
							}
							placeholder="Schedule Date"
							// minDate={new Date(moment().toDate())}
							minDate={getNthDayBeforeDate(1, new Date())}
							name="label_date"
							value={getLabelDate(
								schedulePlaybookData?.label_date
							)}
							onChange={(value) => {
								handleChange({
									target: {
										name: "label_date",
										value: new Date(value)?.toISOString(),
									},
								});
							}}
							calendarContainerClassName="schedule-date-calendar-picker schedule-playbook-date-picker-width"
							calendarClassName="schedule-playbook-date-picker-width"
						/>
					</div>
					<div className="flex-1">
						<span style={{ fontSize: "12px", fontWeight: "400" }}>
							Run time
						</span>
						{runTimeUI}
					</div>
				</div>
				{schedulePlaybookData && schedulePlaybookData?.scheduled_date && (
					<span
						className="mt-2 p-2"
						style={{
							fontSize: "12px",
							fontWeight: "400",
							backgroundColor: "rgba(239, 248, 255, 1)",
						}}
					>
						Selected Time in UTC :{" "}
						{moment
							.utc(schedulePlaybookData?.scheduled_date)
							.format("DD MMM 'YY, hh:mm A")}
					</span>
				)}
				{error && (
					<span
						className="mt-1"
						style={{
							fontSize: "12px",
							fontWeight: "400",
							color: "#FF6767",
						}}
					>
						{error}
					</span>
				)}

				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
					className="mt-2"
				>
					<input
						className="mr-2 p-2 type-confirm-container"
						value={confirmationText}
						type="text"
						placeholder="Type ‘CONFIRM’"
						onKeyPress={(event) => {
							if (
								event.key === "Enter" &&
								confirmationText === "CONFIRM"
							) {
								if (!validateDate()) {
									onConfirmRun();
								}
							}
						}}
						onChange={(e) => {
							setConfirmationText(e.target.value);
						}}
					/>
					<Button
						className="p-3"
						style={{
							border: "1px solid",
							height: "36px",
							display: "inline-flex",
							alignItems: "center",
						}}
						disabled={
							!isValidated ||
							!selectedUsers.length > 0 ||
							confirmationText !== "CONFIRM" ||
							isAPICalling
						}
						onClick={() => {
							if (!validateDate()) {
								onConfirmRun();
							}
						}}
					>
						{isAPICalling && (
							<Spinner
								className="mr-2 blue-spinner action-edit-spinner"
								animation="border"
							/>
						)}
						{buttonText || "Schedule"}
					</Button>
					<Button
						className="p-3 ml-1 d-flex justify-content-center align-items-center"
						style={{
							border: "1px solid #2266e2",
							color: "#2266E2",
							backgroundColor: "#EFF8FF",
							fontWeight: "500",
							height: "36px",
						}}
						onClick={onCancelClick}
					>
						Cancel
					</Button>
				</div>
			</div>
		</>
	);
};

export default SchedulePlaybook;
