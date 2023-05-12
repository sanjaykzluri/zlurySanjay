import React, { useEffect, useState } from "react";
import schedulereportsheader from "../assets/reports/schedulereportsheader.svg";
import cross from "../assets/reports/cross.svg";
import { DatePicker } from "../UIComponents/DatePicker/DatePicker";
import MultiEmailSelect from "../modules/reports/components/MultiSelect/MultiEmailSelect";
import { scheduleConstants, scheduleWeekConstants } from "../constants/reports";
import { Form, Modal } from "react-bootstrap";
import { Button } from "../UIComponents/Button/Button";
import {
	patchScheduleName,
	scheduleReportExport,
	updateSchedule,
} from "../services/api/scheduleReportExport";
import { TriggerIssue } from "../utils/sentry";
import greenTick from "../assets/green_tick.svg";
import inactive from "../assets/agents/inactive.svg";
import moment from "moment";
import { Loader } from "./Loader/Loader";
import { arrayOfFirstGivenNumbers, isEmpty } from "../utils/common";
import { InlineEditField } from "../modules/shared/containers/InlineEditField/InlineEditField";
import { Popover } from "../UIComponents/Popover/Popover";
import { trackActionSegment } from "modules/shared/utils/segment";

export default function ScheduleReportExport(props) {
	const {
		onHide,
		exportRequestObj,
		scheduleName,
		scheduleType,
		isReport,
		setScheduleExportSuccess,
		setScheduleExportError,
		exportEntity,
		setScheduleDate,
		setScheduleIsRecurring,
		setCompleteExportScheduleId,
		id,
		screenEntityFromProps,
	} = props;
	let screenEntity =
		screenEntityFromProps || window.location.pathname.split("/")[1];

	const defaultScheduleObject = {
		filter_by: exportRequestObj.filter_by,
		file_type: "csv",
		columns_required: exportRequestObj.columns_required,
		is_sample: exportRequestObj.is_sample,
		reportEmailDesc: exportRequestObj.reportEmailDesc,
		isReport: exportRequestObj.isReport,
		schedule_date: "",
		is_recurring: false,
		recurring_frequency: "days",
		recurring_interval: 1,
		recurring_on: 1,
		user_ids: [],
		export_name: scheduleName,
		type: scheduleType,
		export_entity: exportEntity,
		applicationId: screenEntity === "applications" ? id : null,
		userId: screenEntity === "users" ? id : null,
		departmentId: screenEntity === "departments" ? id : null,
		["start_month"]: exportRequestObj.start_month || "",
		["start_year"]: exportRequestObj.start_year || "",
		["end_month"]: exportRequestObj.end_month || "",
		["end_year"]: exportRequestObj.end_year || "",
	};

	const [scheduleReqObj, setScheduleReqObj] = useState({
		...defaultScheduleObject,
	});
	const [selectedUserIds, setSelectedUserIds] = useState([]);
	const [selectedEmails, setSelectedEmails] = useState([]);
	const [scheduleInterval, setScheduleInterval] = useState(
		scheduleConstants.DAY
	);
	const [submitting, setSubmitting] = useState(false);
	const [scheduleComplete, setScheduleComplete] = useState(false);
	const [scheduleError, setScheduleError] = useState(false);
	const [completedScheduleId, setCompletedScheduleId] = useState("");

	let requiredFields = scheduleReqObj.is_recurring
		? scheduleReqObj.recurring_frequency !== "days"
			? ["recurring_on"]
			: []
		: ["schedule_date"];

	const handleScheduleReqObjChange = (key, value) => {
		let tempScheduleReqObj;
		if (key === "recurring_frequency") {
			switch (value) {
				case "days":
					tempScheduleReqObj = {
						...scheduleReqObj,
						[key]: value,
					};
					break;
				case "weeks":
					tempScheduleReqObj = {
						...scheduleReqObj,
						[key]: value,
						recurring_on: 1,
					};
					break;
				case "months":
					tempScheduleReqObj = {
						...scheduleReqObj,
						[key]: value,
						recurring_on: 1,
					};
					break;
				case "years":
				default:
					tempScheduleReqObj = {
						...scheduleReqObj,
						[key]: value,
						recurring_on: "",
					};
					break;
			}
		} else {
			tempScheduleReqObj = {
				...scheduleReqObj,
				[key]: value,
			};
		}
		setScheduleReqObj(tempScheduleReqObj);
	};

	const handleMultiUserIdSelect = (field_id, data) => {
		setSelectedUserIds(field_id);
	};

	const handleClose = () => {
		onHide();
		setScheduleReqObj({ ...defaultScheduleObject });
	};

	useEffect(() => {
		let tempScheduleReqObj = { ...scheduleReqObj };
		tempScheduleReqObj.user_ids = [...selectedUserIds];
		setScheduleReqObj(tempScheduleReqObj);
	}, [selectedUserIds]);

	const handleSubmit = () => {
		setSubmitting(true);
		trackActionSegment(
			"Clicked on Schedule Report Button in Reports Section",
			{
				additionalInfo: scheduleReqObj,
			}
		);
		scheduleReportExport(scheduleReqObj)
			.then((res) => {
				if (res.status === "success") {
					trackActionSegment(
						"Succesfully Scheduled Report in Reports Section",
						{
							additionalInfo: scheduleReqObj,
						}
					);
					setSubmitting(false);
					if (res.scheduledData) {
						setCompletedScheduleId(res.scheduledData._id);
						setCompleteExportScheduleId &&
							setCompleteExportScheduleId(res.scheduledData._id);
					}
					if (isReport) {
						setScheduleComplete(true);
					} else {
						setScheduleExportSuccess(true);
					}
				} else {
					setSubmitting(false);
					if (isReport) {
						setScheduleComplete(true);
						setScheduleError(true);
					} else {
						setScheduleExportSuccess(true);
						setScheduleExportError(true);
						handleClose();
					}
					TriggerIssue("Unexpected response from schedule API");
				}
			})
			.catch((error) => {
				setSubmitting(false);
				if (isReport) {
					setScheduleComplete(true);
					setScheduleError(true);
				} else {
					setScheduleExportSuccess(true);
					setScheduleExportError(true);
					handleClose();
				}
				TriggerIssue("Schedule API error", error);
			});
	};

	return (
		<div
			className="generatereport__cont__schedulereports__cont"
			style={
				scheduleType === "export"
					? { minHeight: "461px" }
					: { minHeight: "432px" }
			}
		>
			<div className="generatereport__cont__schedulereports__cont__header">
				<img src={schedulereportsheader} />
				<div className="d-flex flex-column ml-2">
					<div className="font-18 bold-600">
						Schedule{" "}
						{scheduleType === "export" ? "Export" : "Report"}
					</div>
					<div className="font-12">for {scheduleName}</div>
				</div>
				<img
					src={cross}
					height={12}
					width={12}
					onClick={handleClose}
					className="generatereport__cont__closebutton"
				></img>
			</div>
			<div className="generatereport__cont__schedulereports__cont__forms">
				{submitting ? (
					<Loader height={150} width={100} />
				) : !scheduleComplete ? (
					<>
						<div
							className="customswitch__cont"
							onClick={() => {
								!isReport &&
									setScheduleIsRecurring(
										!scheduleReqObj.is_recurring
									);
								handleScheduleReqObjChange(
									"is_recurring",
									!scheduleReqObj.is_recurring
								);
							}}
						>
							<div
								className={`cursor-pointer ${
									!scheduleReqObj.is_recurring
										? "customswitch__cont__option__active"
										: "customswitch__cont__option"
								}`}
							>
								One-time
							</div>
							<div
								className={`cursor-pointer ${
									scheduleReqObj.is_recurring
										? "customswitch__cont__option__active"
										: "customswitch__cont__option"
								}`}
							>
								Recurring
							</div>
						</div>
						<div
							style={{
								width: "300px",
								justifyContent: "flex-start",
								marginTop: "16px",
							}}
							className="d-flex flex-column"
						>
							{!scheduleReqObj.is_recurring ? (
								<>
									<div className="generatereport__cont__schedulereports__cont__forms__heading">
										Select Date
									</div>
									<DatePicker
										minDate={
											new Date(
												moment().add(1, "days").toDate()
											)
										}
										onChange={(value) => {
											!isReport && setScheduleDate(value);
											handleScheduleReqObjChange(
												"schedule_date",
												value
											);
										}}
										calendarContainerClassName="schedule-date-calendar"
									/>
								</>
							) : (
								<>
									<div className="d-flex flex-row justify-content-between">
										<div>
											<div className="generatereport__cont__schedulereports__cont__forms__heading">
												Repeat Every
											</div>
											<div className="d-flex flex-row">
												<Form.Control
													bsPrefix="recurring_frequency_input form-control"
													value={
														scheduleReqObj.recurring_interval
													}
													onChange={(e) =>
														handleScheduleReqObjChange(
															"recurring_interval",
															e.target.value
														)
													}
													type="number"
												/>
												<Form.Control
													bsPrefix="recurring_interval_dropdown form-control text-capitalize"
													value={
														scheduleReqObj.recurring_frequency
													}
													as="select"
													onChange={(e) => {
														handleScheduleReqObjChange(
															"recurring_frequency",
															e.target.value
														);
													}}
												>
													{Object.values(
														scheduleConstants
													).map((interval) => (
														<option
															className="text-capitalize"
															value={interval}
															key={interval}
														>
															{interval}
														</option>
													))}
												</Form.Control>
											</div>
										</div>
										<div
											hidden={
												scheduleReqObj.recurring_frequency ===
												"days"
											}
										>
											<div className="generatereport__cont__schedulereports__cont__forms__heading">
												Repeat On
											</div>
											<div className="d-flex flex-row">
												{scheduleReqObj.recurring_frequency ===
												"weeks" ? (
													<Form.Control
														bsPrefix="recurring_interval_dropdown form-control text-capitalize"
														value={
															scheduleReqObj.recurring_on
														}
														as="select"
														onChange={(e) =>
															handleScheduleReqObjChange(
																"recurring_on",
																e.target.value
															)
														}
													>
														{Object.keys(
															scheduleWeekConstants
														).map((day) => (
															<option
																className="text-capitalize"
																value={
																	scheduleWeekConstants[
																		day
																	]
																}
																key={
																	scheduleWeekConstants[
																		day
																	]
																}
															>
																{day}
															</option>
														))}
													</Form.Control>
												) : scheduleReqObj.recurring_frequency ===
												  "months" ? (
													<Form.Control
														bsPrefix="recurring_interval_dropdown form-control text-capitalize"
														value={
															scheduleReqObj.recurring_on
														}
														as="select"
														onChange={(e) =>
															handleScheduleReqObjChange(
																"recurring_on",
																e.target.value
															)
														}
													>
														{arrayOfFirstGivenNumbers(
															31
														).map((n) => (
															<option
																className="text-capitalize"
																value={n}
																key={n}
															>
																Day {n}
															</option>
														))}
													</Form.Control>
												) : (
													<DatePicker
														className="recurring-on-datepicker"
														onChange={(value) =>
															handleScheduleReqObjChange(
																"recurring_on",
																value
															)
														}
														calendarContainerClassName="repeat-on-schedule-datepicker"
													/>
												)}
											</div>
										</div>
									</div>
								</>
							)}
							<div
								className="generatereport__cont__schedulereports__cont__forms__heading"
								style={{
									marginTop: "14px",
								}}
							>
								Additional Emails
							</div>
							<MultiEmailSelect
								className="multi-user-select-schedule-report"
								field_id={"user_email"}
								onChangeFilter={handleMultiUserIdSelect}
								value={selectedEmails}
								selectedIds={selectedUserIds}
							/>
							<hr
								style={{
									margin: "19px 0px 0px",
								}}
							></hr>
							<div id="schedule-report-button-section">
								<Button
									type="link"
									size="sm"
									className="mr-2"
									onClick={handleClose}
								>
									Cancel
								</Button>
								<Button
									disabled={requiredFields.some((field) =>
										isEmpty(scheduleReqObj[field])
									)}
									size="sm"
									onClick={handleSubmit}
								>
									Schedule
								</Button>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="generatereport__cont__schedulereports__cont__forms mb-5">
							<img
								src={scheduleError ? inactive : greenTick}
								height="66px"
								width="66px"
								style={{ marginBottom: "10px" }}
							/>
							{scheduleError ? (
								<>
									<h5>Server Error!</h5>
									<p>We couldn't complete your request.</p>
								</>
							) : (
								<>
									<h5>
										{scheduleReqObj.is_recurring
											? "Recurring"
											: "One time"}{" "}
										Report Scheduled
									</h5>
									{!scheduleReqObj.is_recurring && (
										<p>
											for{" "}
											{moment(
												scheduleReqObj.schedule_date
											).format("DD MMM YYYY")}
										</p>
									)}
									<div
										className="schedule-name-edit"
										style={{ width: "255px" }}
									>
										<div className="font-11 mb-1">
											Schedule Name
										</div>
										<InlineEditField
											updateService={patchScheduleName}
											patch={{
												op: "replace",
												field: "export_name",
												value: scheduleName,
											}}
											id={completedScheduleId}
											inlineValueClassName="schedule-name-inline-edit"
											type="text"
											isMandatory={true}
										/>
									</div>
								</>
							)}
							<Button onClick={handleClose}>Close</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export function EditScheduleExportReport(props) {
	const { schedule, show, onHide, handleRefresh } = props;
	let userIds = [];
	let userEmails = [];
	if (schedule.user_ids && Array.isArray(schedule.user_ids)) {
		userIds = schedule.user_ids.map((user) => user._id);
		userEmails = schedule.user_ids.map((user) => user.email);
	}
	const initialScheduleObject = {
		schedule_date: schedule.schedule_date,
		is_recurring: schedule.is_recurring,
		recurring_frequency: schedule.recurring_frequency || "days",
		recurring_interval: schedule.recurring_interval || 1,
		recurring_on:
			schedule.recurring_on ||
			(schedule.recurring_frequency === "years" ? new Date() : 1),
		user_ids: userIds || [],
		export_name: schedule.export_name,
		type: schedule.type,
		export_entity: schedule.export_entity,
	};

	const [scheduleReqObj, setScheduleReqObj] = useState({
		...initialScheduleObject,
	});

	const [selectedUserIds, setSelectedUserIds] = useState(userIds);
	const [selectedEmails, setSelectedEmails] = useState(userEmails);
	const [scheduleInterval, setScheduleInterval] = useState(
		scheduleConstants.DAY
	);
	const [submitting, setSubmitting] = useState(false);
	const [scheduleComplete, setScheduleComplete] = useState(false);
	const [scheduleError, setScheduleError] = useState(false);
	const [completedScheduleId, setCompletedScheduleId] = useState("");

	let requiredFields = scheduleReqObj.is_recurring
		? scheduleReqObj.recurring_frequency !== "days"
			? ["recurring_on"]
			: []
		: ["schedule_date"];

	const handleScheduleReqObjChange = (key, value) => {
		let tempScheduleReqObj;
		if (key === "recurring_frequency") {
			switch (value) {
				case "days":
					tempScheduleReqObj = {
						...scheduleReqObj,
						[key]: value,
					};
					break;
				case "weeks":
					tempScheduleReqObj = {
						...scheduleReqObj,
						[key]: value,
						recurring_on: 1,
					};
					break;
				case "months":
					tempScheduleReqObj = {
						...scheduleReqObj,
						[key]: value,
						recurring_on: 1,
					};
					break;
				case "years":
				default:
					tempScheduleReqObj = {
						...scheduleReqObj,
						[key]: value,
						recurring_on: "",
					};
					break;
			}
		} else {
			tempScheduleReqObj = {
				...scheduleReqObj,
				[key]: value,
			};
		}
		setScheduleReqObj(tempScheduleReqObj);
	};

	const handleMultiUserIdSelect = (field_id, data) => {
		setSelectedUserIds(field_id);
	};

	const handleClose = () => {
		onHide();
		setScheduleReqObj({ ...initialScheduleObject });
	};

	useEffect(() => {
		let tempScheduleReqObj = { ...scheduleReqObj };
		tempScheduleReqObj.user_ids = selectedUserIds;
		setScheduleReqObj(tempScheduleReqObj);
	}, [selectedUserIds]);

	const handleSubmit = () => {
		setSubmitting(true);
		updateSchedule(scheduleReqObj, schedule._id)
			.then((res) => {
				if (res.status === "success") {
					setSubmitting(false);
					setScheduleComplete(true);
					handleRefresh && handleRefresh();
					handleClose();
				} else {
					setSubmitting(false);
					setScheduleComplete(true);
					setScheduleError(true);
					TriggerIssue("Unexpected response from schedule API");
				}
			})
			.catch((error) => {
				setSubmitting(false);
				setScheduleComplete(true);
				setScheduleError(true);
				TriggerIssue("Schedule API error", error);
			});
	};

	return (
		<Popover
			centered
			show={show}
			onClose={onHide}
			className={"edit_schedule_popover"}
		>
			<div>
				<div className="d-flex">
					<h3 className="z__header-secondary flex-fill m-0">
						{`Edit ${
							schedule.is_recurring ? "Recurring" : "One Time"
						} Schedule`}
					</h3>
				</div>
				<hr className="w-100" />
				<div>
					{submitting ? (
						<Loader height={150} width={100} />
					) : !scheduleComplete ? (
						<>
							<div
								style={{
									width: "300px",
									justifyContent: "flex-start",
									marginTop: "16px",
								}}
								className="d-flex flex-column"
							>
								{!scheduleReqObj.is_recurring ? (
									<>
										<div className="generatereport__cont__schedulereports__cont__forms__heading">
											Select Date
										</div>
										<DatePicker
											minDate={
												new Date(
													moment()
														.add(1, "days")
														.toDate()
												)
											}
											onChange={(value) => {
												handleScheduleReqObjChange(
													"schedule_date",
													value
												);
											}}
											value={
												new Date(
													scheduleReqObj.schedule_date
												)
											}
											calendarContainerClassName="schedule-date-calendar"
										/>
									</>
								) : (
									<>
										<div className="d-flex flex-row justify-content-between">
											<div>
												<div className="generatereport__cont__schedulereports__cont__forms__heading">
													Repeat Every
												</div>
												<div className="d-flex flex-row">
													<Form.Control
														bsPrefix="recurring_frequency_input form-control"
														value={
															scheduleReqObj.recurring_interval
														}
														onChange={(e) =>
															handleScheduleReqObjChange(
																"recurring_interval",
																e.target.value
															)
														}
														type="number"
													/>
													<Form.Control
														bsPrefix="recurring_interval_dropdown form-control text-capitalize"
														value={
															scheduleReqObj.recurring_frequency
														}
														as="select"
														onChange={(e) => {
															handleScheduleReqObjChange(
																"recurring_frequency",
																e.target.value
															);
														}}
													>
														{Object.values(
															scheduleConstants
														).map((interval) => (
															<option
																className="text-capitalize"
																value={interval}
																key={interval}
															>
																{interval}
															</option>
														))}
													</Form.Control>
												</div>
											</div>
											<div
												hidden={
													scheduleReqObj.recurring_frequency ===
													"days"
												}
											>
												<div className="generatereport__cont__schedulereports__cont__forms__heading">
													Repeat On
												</div>
												<div className="d-flex flex-row">
													{scheduleReqObj.recurring_frequency ===
													"weeks" ? (
														<Form.Control
															bsPrefix="recurring_interval_dropdown form-control text-capitalize"
															value={
																scheduleReqObj.recurring_on
															}
															as="select"
															onChange={(e) =>
																handleScheduleReqObjChange(
																	"recurring_on",
																	e.target
																		.value
																)
															}
														>
															{Object.keys(
																scheduleWeekConstants
															).map((day) => (
																<option
																	className="text-capitalize"
																	value={
																		scheduleWeekConstants[
																			day
																		]
																	}
																	key={
																		scheduleWeekConstants[
																			day
																		]
																	}
																>
																	{day}
																</option>
															))}
														</Form.Control>
													) : scheduleReqObj.recurring_frequency ===
													  "months" ? (
														<Form.Control
															bsPrefix="recurring_interval_dropdown form-control text-capitalize"
															value={
																scheduleReqObj.recurring_on
															}
															as="select"
															onChange={(e) =>
																handleScheduleReqObjChange(
																	"recurring_on",
																	e.target
																		.value
																)
															}
														>
															{arrayOfFirstGivenNumbers(
																31
															).map((n) => (
																<option
																	className="text-capitalize"
																	value={n}
																	key={n}
																>
																	Day {n}
																</option>
															))}
														</Form.Control>
													) : (
														<DatePicker
															className="recurring-on-datepicker"
															onChange={(value) =>
																handleScheduleReqObjChange(
																	"recurring_on",
																	value
																)
															}
															value={
																schedule.recurring_frequency ===
																	"years" &&
																moment(
																	new Date(
																		scheduleReqObj.recurring_on
																	)
																).isValid() &&
																new Date(
																	scheduleReqObj.recurring_on
																)
															}
															calendarContainerClassName="repeat-on-schedule-datepicker"
														/>
													)}
												</div>
											</div>
										</div>
									</>
								)}
								<div
									className="generatereport__cont__schedulereports__cont__forms__heading"
									style={{
										marginTop: "14px",
									}}
								>
									Additional Emails
								</div>
								<MultiEmailSelect
									className="multi-user-select-schedule-report"
									field_id={"user_email"}
									onChangeFilter={handleMultiUserIdSelect}
									value={selectedEmails}
									selectedIds={selectedUserIds}
								/>
								<div className="d-flex flex-row justify-content-end mt-3">
									<Button
										type="link"
										size="sm"
										className="mr-2"
										onClick={handleClose}
									>
										Cancel
									</Button>
									<Button
										disabled={requiredFields.some((field) =>
											isEmpty(scheduleReqObj[field])
										)}
										size="sm"
										onClick={handleSubmit}
									>
										Save
									</Button>
								</div>
							</div>
						</>
					) : (
						<>
							<div className="generatereport__cont__schedulereports__cont__forms mb-5">
								<img
									src={scheduleError ? inactive : greenTick}
									height="66px"
									width="66px"
									style={{ marginBottom: "10px" }}
								/>
								{scheduleError ? (
									<>
										<h5>Server Error!</h5>
										<p>
											We couldn't complete your request.
										</p>
									</>
								) : (
									<>
										<h5>
											{scheduleReqObj.is_recurring
												? "Recurring"
												: "One time"}{" "}
											Report Scheduled
										</h5>
										{!scheduleReqObj.is_recurring && (
											<p>
												for{" "}
												{moment(
													scheduleReqObj.schedule_date
												).format("DD MMM YYYY")}
											</p>
										)}
										<div
											className="schedule-name-edit"
											style={{ width: "255px" }}
										>
											<div className="font-11 mb-1">
												Schedule Name
											</div>
											<InlineEditField
												updateService={
													patchScheduleName
												}
												patch={{
													op: "replace",
													field: "export_name",
													value: scheduleReqObj.export_name,
												}}
												id={completedScheduleId}
												inlineValueClassName="schedule-name-inline-edit"
												type="text"
												isMandatory={true}
											/>
										</div>
									</>
								)}
								<Button onClick={handleClose}>Close</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</Popover>
	);
}

export const scheduleExportTableFilters = {
	applications: "Applications",
	users: "Users",
	departments: "Departments",
	applications_users: "Application-users",
	users_applications: "User-applications",
	departments_applications: "Department-applications",
	departments_users: "Department-users",
	recognized_transactions: "Recognized Transactions",
	unrecognized_transactions: "Unrecognized Transactions",
	archived_transactions: "Archived Transactions",
};
