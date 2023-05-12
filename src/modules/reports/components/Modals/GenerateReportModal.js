import React, { useEffect, useState, useRef } from "react";
import { Modal, Spinner } from "react-bootstrap";
import checked from "../../../../assets/reports/checked.svg";
import cross from "../../../../assets/reports/cross.svg";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../../UIComponents/Button/Button";
import "./GenerateReportModal.css";
import { searchAllApps } from "../../../../services/api/search";
import { PaymentFilterNew } from "../PaymentFilter/PaymentFilterNew";
import { AsyncTypeahead } from "../../../../common/Typeahead/AsyncTypeahead";
import { reportsConstants } from "../../../../constants/reports";
import { RangeFilter } from "../RangeFilter/RangeFilter";
import { DateRangeFilter } from "../RangeFilter/DateRangeFilter";
import schedulereports from "../../../../assets/reports/schedulereports.svg";
import { MultiSelect } from "../MultiSelect/MultiSelect";
import ScheduleReportExport from "../../../../common/ScheduleReportExport";
import moment from "moment";
import DateRangePicker from "../../../../UIComponents/DateRangePicker/DateRangePicker";
import { getDateByDateMonthYear } from "../../../../utils/DateUtility";
import { TriggerIssue } from "../../../../utils/sentry";
import { Form } from "react-bootstrap";
import { trackActionSegment } from "modules/shared/utils/segment";
import { generateExportReportCSV } from "common/Export/Export.service";

export function GenerateReportModal(props) {
	const cancelToken = useRef();
	const defaultExportObj = {
		filter_by: [],
		file_type: "csv",
		columns_required: [],
		reportEmailDesc: "",
		isReport: true,
		reportName: "",
	};
	const defaultSelectionObject = {
		application: [],
		users: [],
		dept: [],
		payment: [],
		auth: [],
	};
	const defaultTargetApp = { app_id: null, app_name: null, app_logo: null };
	const [disableButton, setDisableButton] = useState(false);
	const [disableButtonPayment, setDisableButtonPayment] = useState(false);
	const [disableButtonSingleApp, setDisableButtonSingleApp] = useState(true);

	const [exportRequestObj, setExportRequestObj] = useState({
		...defaultExportObj,
	});
	const [selectionData, setSelectionData] = useState({
		application: [],
		dept: [],
		users: [],
		payment: [],
		auth: [],
	});

	const [clickedOnGenerateButton, setClickedOnGenerateButton] =
		useState(false);
	const [filterLength, setFilterLength] = useState();
	const [scheduleReportsSectionOpen, setScheduleReportsSectionOpen] =
		useState(false);
	const [targetApp, setTargetApp] = useState({ ...defaultTargetApp });
	const [noOfDays, setNoOfDays] = useState();
	const [submittingReport, setSubmittingReport] = useState(false);
	const [selectedAllApps, setSelectedAllApps] = useState(false);

	useEffect(() => {
		setSelectionData({
			...selectionData,
			application: props.appData,
			dept: props.deptData,
			payment: props.payData,
		});
	}, [props]);

	useEffect(() => {
		setFilterLength(props.report.filters.length);
		let tempExportRequestObj = {
			...exportRequestObj,
			["columns_required"]: props.report.columns,
			["reportEmailDesc"]: props.report.reportMailDesc,
			["reportName"]: props.report.name,
			...(props.report.filters.includes("Month Range") && {
				["start_month"]: startDate.getMonth() + 1,
				["start_year"]: startDate.getFullYear(),
				["end_month"]: endDate.getMonth() + 1,
				["end_year"]: endDate.getFullYear(),
			}),
			...(props.report.defaultFilter &&
				Object.keys(props.report.defaultFilter) && {
					[reportsConstants.FILTER_BY]: [props.report.defaultFilter],
				}),
		};
		setExportRequestObj(tempExportRequestObj);
	}, []);
	const clickedOnGenerate = () => {
		trackActionSegment(
			"Clicked On Generate Report Button in Reports Section",
			{
				additionalInfo: exportRequestObj,
			},
			true
		);
		setSubmittingReport(true);
		const entity = selectedAllApps
			? props.report?.allAppsSelectedEntity
			: props.report.entity;
		generateExportReportCSV(exportRequestObj, entity, targetApp && targetApp?.app_id)
			.then((res) => {
				if (res?.status === "success") {
					trackActionSegment("Generated Report Successfully", {
						additionalInfo: exportRequestObj,
					});
					setClickedOnGenerateButton(true);
					setFilterLength(1);
					setSelectionData(defaultSelectionObject);
					setTargetApp({ ...defaultTargetApp });
				}
				setSubmittingReport(false);
			})
			.catch((error) => {
				setSubmittingReport(false);
				TriggerIssue("Error in sending report", error);
			});
	};

	const handleMultiSelect = (selection, actionMeta, key, selectionKey) => {
		setSelectionData({ ...selectionData, [selectionKey]: selection });
		if (selection.length === 0) {
			if (selectionKey === "payment") {
				setDisableButtonPayment(true);
			} else {
				setDisableButton(true);
			}
		} else {
			if (selectionKey === "payment") {
				setDisableButtonPayment(false);
			} else {
				setDisableButton(false);
			}
		}
		let tempReportArray = [];
		selection.forEach((el) => {
			tempReportArray.push(el.value);
		});
		if (
			tempReportArray.length > 0 &&
			tempReportArray.includes(reportsConstants.ALL)
		) {
		} else if (tempReportArray.length > 0) {
			let tempArray = [...exportRequestObj[reportsConstants.FILTER_BY]];
			tempArray = tempArray.filter((obj) => obj["field_id"] !== key);
			tempArray.push({
				field_values: tempReportArray,
				field_id: key,
				filter_type: "string",
				negative: false,
				is_custom: false,
			});
			let tempExportRequestObj = {
				...exportRequestObj,
				[reportsConstants.FILTER_BY]: tempArray,
			};
			setExportRequestObj(tempExportRequestObj);
		}
	};

	const handleDateRange = (range, warning) => {
		if (warning) {
			setDisableButton(true);
		} else {
			setDisableButton(false);
		}
		let tempArray = [];
		if (range?.fieldOrder.length === 0) {
		} else {
			tempArray = [...exportRequestObj[reportsConstants.FILTER_BY]];
			tempArray = tempArray.filter(
				(obj) => obj["field_id"] !== props.report.dateRangeFilterId
			);
			tempArray.push({
				field_values: range.fieldValues,
				field_order: range.fieldOrder,
				field_id: props.report.dateRangeFilterId,
				filter_type: "date_range",
				negative: false,
				is_custom: false,
			});
		}
		let tempExportRequestObj = {
			...exportRequestObj,
			[reportsConstants.FILTER_BY]: tempArray,
		};
		setExportRequestObj(tempExportRequestObj);
	};

	const handleRange = (range, warning) => {
		if (warning) {
			setDisableButton(true);
		} else {
			setDisableButton(false);
		}
		let tempArray = [];
		if (range?.fieldOrder.length === 0) {
		} else {
			tempArray = [...exportRequestObj[reportsConstants.FILTER_BY]];
			tempArray = tempArray.filter(
				(obj) => obj["field_id"] !== "dept_budget_spend"
			);
			tempArray.push({
				field_values: range.fieldValues,
				field_order: range.fieldOrder,
				field_id: "dept_budget_spend",
				filter_type: "range",
				negative: false,
				is_custom: false,
			});
		}
		let tempExportRequestObj = {
			...exportRequestObj,
			[reportsConstants.FILTER_BY]: tempArray,
		};
		setExportRequestObj(tempExportRequestObj);
	};

	const handleSingleAppSelection = (app) => {
		setTargetApp(app);
		if (app) {
			if (app.app_name) {
				setDisableButtonSingleApp(false);
			} else {
				setDisableButtonSingleApp(true);
			}
		} else {
			setDisableButtonSingleApp(true);
		}
		let tempArray = [...exportRequestObj[reportsConstants.FILTER_BY]];
		tempArray = tempArray.filter((obj) => obj["field_id"] !== "app_name");
		tempArray.push({
			field_values: [app?.app_name],
			field_id: "app_name",
			filter_type: "string",
			negative: false,
			is_custom: false,
		});
		let tempExportRequestObj = {};
		if (props.report.name === "License Optimization Report") {
			tempExportRequestObj = {
				...exportRequestObj,
				[reportsConstants.FILTER_BY]: tempArray,
				reportEmailDesc: `The license optimization report for the app ${app.app_name} is ready to download.`,
				applicationId: app?.app_id,
			};
		} else {
			tempExportRequestObj = {
				...exportRequestObj,
				[reportsConstants.FILTER_BY]: tempArray,
				applicationId: app?.app_id,
			};
		}
		setExportRequestObj(tempExportRequestObj);
	};
	const handleNoOfDaysChange = (value) => {
		setNoOfDays(value);
		if (!value) {
			let tempArray = [...exportRequestObj[reportsConstants.FILTER_BY]];
			tempArray = tempArray.filter(
				(obj) => obj["field_id"] !== "user_app_last_used"
			);
			let tempExportRequestObj = {
				...exportRequestObj,
				[reportsConstants.FILTER_BY]: tempArray,
			};
			setExportRequestObj(tempExportRequestObj);
			return;
		}
		let tempDate = new Date(moment().subtract(value, "days").toDate());
		let tempArray = [...exportRequestObj[reportsConstants.FILTER_BY]];
		tempArray = tempArray.filter(
			(obj) => obj["field_id"] !== "user_app_last_used"
		);
		tempArray.push({
			field_values: [tempDate],
			field_order: ["lt"],
			field_id: "user_app_last_used",
			filter_type: "date_range",
			negative: false,
			is_custom: false,
		});
		let tempExportRequestObj = {
			...exportRequestObj,
			[reportsConstants.FILTER_BY]: tempArray,
		};
		setExportRequestObj(tempExportRequestObj);
	};

	let startMonth = useSelector((state) => state.userInfo?.org_fy_start_month);
	let startYear =
		startMonth <= moment().month() ? moment().year() : moment().year() - 1;
	const [startDate, setStartDate] = useState(
		getDateByDateMonthYear(startMonth, startYear)
	);
	const [endDate, setEndDate] = useState(new Date());

	const handleMonthSelect = (date, month_key, year_key) => {
		let tempExportRequestObj = {
			...exportRequestObj,
			[month_key]: date.getMonth() + 1,
			[year_key]: date.getFullYear(),
		};
		setExportRequestObj(tempExportRequestObj);
	};

	const multiSelectFn = (el) => {
		return (
			<MultiSelect
				onChange={handleMultiSelect}
				options={el.options}
				value={el.value}
				category={el.category}
				selectionKey={el.selectionKey}
			></MultiSelect>
		);
	};

	const PaymentFilterNewFn = (el) => {
		return (
			<PaymentFilterNew
				onChange={handleMultiSelect}
				options={el.options}
				value={el.value}
				category={el.category}
				selectionKey={el.selectionKey}
			></PaymentFilterNew>
		);
	};

	const multiSelectObject = {
		"App Name": {
			options: props.appData,
			value: selectionData.application,
			category: "app_name",
			selectionKey: "application",
			name: "Application Name",
			selectFunction: multiSelectFn,
		},
		"User Name": {
			options: props.userData,
			value: selectionData.users,
			category: "user_name",
			selectionKey: "users",
			name: "User Name",
			selectFunction: multiSelectFn,
		},
		"Department Name": {
			options: props.deptData,
			value: selectionData.dept,
			category: "department_name",
			selectionKey: "dept",
			name: "Department Name",
			selectFunction: multiSelectFn,
		},
		"Payment Method": {
			options: props.payData,
			value: selectionData.payment,
			category: "payment_method_name",
			selectionKey: "payment",
			name: "Payment Method",
			selectFunction: PaymentFilterNewFn,
		},
		Auth: {
			options: [
				{ value: "centrally managed", label: "Centrally Managed" },
				{ value: "team managed", label: "Team Managed" },
				{
					value: "individually managed",
					label: "Individually Managed",
				},
				{ value: "unmanaged", label: "Unmanaged " },
				{ value: "restricted", label: "Restricted " },
				{ value: "needs review", label: "Needs Review" },
			],
			value: selectionData.auth,
			category: "app_state",
			selectionKey: "auth",
			name: "Authorization Status",
			selectFunction: multiSelectFn,
		},
	};

	const disableCheck = () => {
		return (
			disableButton ||
			disableButtonPayment ||
			(props.report.filters.includes("Single App") &&
				disableButtonSingleApp) ||
			(props.report.filters.includes("No of Days") && !noOfDays)
		);
	};

	return (
		<>
			{filterLength === 0 ? (
				<Modal
					show={props.isOpen}
					onHide={props.handleClose}
					centered
					dialogClassName="modal-15w"
				>
					<div className="generatereport__cont__nofilter">
						<div className="generatereport__cont__d1__d1__nofilter">
							<img
								src={props.report.url}
								width={72}
								height={72}
							></img>
							<div className="generatereport__cont__d1__d1__d2">
								{props.report.name}
							</div>
							<div className="generatereport__cont__d1__d1__d3">
								{props.report.description}
							</div>
							<div className="d-flex flex-row justify-content-between w-100">
								<Button
									className="z__button "
									style={{
										width: "62%",
										marginTop: "50px",
										height: "48px",
									}}
									onClick={clickedOnGenerate}
								>
									{submittingReport ? (
										<Spinner
											animation="border"
											role="status"
											variant="light"
											size="sm"
											className="ml-2"
											style={{ borderWidth: 2 }}
										>
											<span className="sr-only">
												Loading...
											</span>
										</Spinner>
									) : (
										"Generate Report"
									)}
								</Button>
								<div className="d-flex flex-column justify-content-end">
									<img
										src={schedulereports}
										className="cursor-pointer"
										onClick={() => {
											setScheduleReportsSectionOpen(true);
										}}
									></img>
								</div>
							</div>
						</div>
						{!scheduleReportsSectionOpen && (
							<img
								src={cross}
								height={12}
								width={12}
								onClick={() => props.handleClose()}
								className="generatereport__cont__closebutton"
							></img>
						)}
					</div>
					{scheduleReportsSectionOpen && (
						<ScheduleReportExport
							onHide={() => setScheduleReportsSectionOpen(false)}
							exportRequestObj={exportRequestObj}
							isReport={true}
							scheduleName={props.report.name}
							scheduleType="report"
							exportEntity={
								selectedAllApps
									? props.report.scheduleEntity
										? props.report.scheduleEntity
										: props.report.entity
									: props.report.entity
							}
							screenEntityFromProps="applications"
							id={targetApp?.app_id}
						/>
					)}
				</Modal>
			) : (
				<Modal
					show={props.isOpen}
					onHide={props.handleClose}
					centered
					dialogClassName="generatereport__modal"
				>
					<div className="generatereport__cont">
						<div className="generatereport__cont__d1">
							<div className="generatereport__cont__d1__d1">
								<img
									src={props.report.url}
									width={72}
									height={72}
								></img>
								<div className="generatereport__cont__d1__d1__d2">
									{props.report.name}
								</div>
								<div className="generatereport__cont__d1__d1__d3">
									{props.report.description}
								</div>
							</div>
							<div
								className={
									!clickedOnGenerateButton
										? "generatereport__cont__d1__d2"
										: "generatereport__cont__d1__d2c"
								}
							>
								{!clickedOnGenerateButton ? (
									<>
										<div
											className="d-flex flex-column"
											style={{
												maxHeight: "300px",
												minHeight: "270px",
												overflowY: "auto",
												padding: "0px 80px 0px 77px",
												overflowX: "hidden",
											}}
										>
											{props.report.filters.map((el) => {
												if (
													multiSelectObject[el] &&
													Array.isArray(
														Object.keys(
															multiSelectObject[
																el
															]
														)
													) &&
													Object.keys(
														multiSelectObject[el]
													).length
												) {
													return (
														<>
															<div className="generatereport__cont__d1__d2__d1">
																{
																	multiSelectObject[
																		el
																	].name
																}
															</div>
															<span
																style={{
																	marginBottom:
																		"20px",
																}}
															>
																{multiSelectObject[
																	el
																].selectFunction(
																	multiSelectObject[
																		el
																	]
																)}
															</span>
														</>
													);
												} else if (
													typeof el === "object" &&
													!Array.isArray(el) &&
													el !== null
												) {
													if (
														el?.filter_name?.includes(
															"dropdown"
														)
													) {
														return (
															<>
																<div className="generatereport__cont__d1__d2__d1">
																	{
																		el.field_name
																	}
																</div>
																<select
																	className=" form-control  text-capitalize "
																	as="select"
																	onChange={(
																		e
																	) => {
																		if (
																			el.field_name ===
																			"Consider inactive since"
																		) {
																			let tempColumns =
																				[
																					...props
																						.report
																						.columns,
																				];
																			tempColumns[
																				tempColumns.length -
																					1
																			] =
																				e.target.value;
																			setExportRequestObj(
																				{
																					...exportRequestObj,
																					columns_required:
																						tempColumns,
																				}
																			);
																		}
																	}}
																	defaultValue={
																		el.defaultValue
																	}
																>
																	{el.options.map(
																		(
																			row
																		) => (
																			<option
																				value={
																					row.value
																				}
																			>
																				{
																					row.key
																				}
																			</option>
																		)
																	)}
																</select>
															</>
														);
													}
												} else {
													return;
												}
											})}
											{props.report.filters.includes(
												"Budget Value"
											) ? (
												<>
													<div className="generatereport__cont__d1__d2__d1">
														Budget Value
													</div>
													<div className="generatereport__cont__d1__d2__d1__range">
														<RangeFilter
															handleRange={
																handleRange
															}
														></RangeFilter>
													</div>
												</>
											) : null}
											{props.report.filters.includes(
												"Single App"
											) && (
												<div className="position-relative">
													<AsyncTypeahead
														label="Target App"
														placeholder="Application"
														fetchFn={searchAllApps}
														onSelect={(selection) =>
															handleSingleAppSelection(
																selection
															)
														}
														keyFields={{
															id: "app_id",
															image: "app_logo",
															value: "app_name",
														}}
														allowFewSpecialCharacters={
															true
														}
														onChange={() => {
															setTargetApp({
																...defaultTargetApp,
															});
															setDisableButtonSingleApp(
																true
															);
														}}
														disabled={
															selectedAllApps
														}
														defaultValue={
															targetApp?.app_name ||
															""
														}
													/>
													<div
														className="d-flex position-absolute "
														style={{
															right: "0px",
															top: "5px",
														}}
													>
														<Form.Check
															className=""
															checked={
																selectedAllApps
															}
															onChange={() => {
																if (
																	selectedAllApps ===
																	false
																) {
																	setTargetApp(
																		{
																			...defaultTargetApp,
																		}
																	);
																	setDisableButtonSingleApp(
																		false
																	);
																} else {
																	setDisableButtonSingleApp(
																		true
																	);
																}
																setSelectedAllApps(
																	!selectedAllApps
																);
															}}
														/>
														<div
															className="font-11 mr-2"
															style={{
																marginTop:
																	"4px",
															}}
														>
															Select All Apps
														</div>
													</div>
												</div>
											)}
											{props.report.filters.includes(
												"No of Days"
											) && (
												<>
													<div className="generatereport__cont__d1__d2__d1">
														No of Days since usage
													</div>
													<input
														type="number"
														style={{
															height: "36px",
															marginRight: "10px",
															border: "1px solid #dddddd",
														}}
														className="w-100 border-radius-4 font-13"
														onChange={(e) =>
															handleNoOfDaysChange(
																e.target.value
															)
														}
													></input>
												</>
											)}
											{props.report.filters.includes(
												"Date Range"
											) && (
												<>
													<div className="generatereport__cont__d1__d2__d1">
														Date Range
													</div>
													<DateRangeFilter
														handleDateRange={
															handleDateRange
														}
														name={
															props.report
																.dateRangeFilterRadioId
														}
														className="recurring-on-datepicker"
														calendarContainerClassName="repeat-on-schedule-datepicker"
													></DateRangeFilter>
												</>
											)}
											{props.report.filters.includes(
												"Month Range"
											) && (
												<>
													<div className="generatereport__cont__d1__d2__d1">
														Month Range
													</div>
													<div
														style={{
															maxWidth: "200px",
														}}
													>
														<DateRangePicker
															start={startDate}
															end={endDate}
															onStartChange={(
																date
															) => {
																setStartDate(
																	date
																);
																handleMonthSelect(
																	date,
																	"start_month",
																	"start_year"
																);
															}}
															onEndChange={(
																date
															) => {
																setEndDate(
																	date
																);
																handleMonthSelect(
																	date,
																	"end_month",
																	"end_year"
																);
															}}
															showDropdownToggle={
																false
															}
															style={{
																height: "40px",
															}}
															dateFormat="MMM YYYY"
														/>
													</div>
												</>
											)}
										</div>
										<div
											className="d-flex flex-row"
											style={{
												marginTop: "50px",
												padding: "0px 90px 0px 77px",
											}}
										>
											<Button
												className="z__button "
												style={{
													width: "227px",
													height: "48px",
													marginRight: "15px",
												}}
												disabled={disableCheck()}
												onClick={clickedOnGenerate}
											>
												{submittingReport ? (
													<Spinner
														animation="border"
														role="status"
														variant="light"
														size="sm"
														className="ml-2"
														style={{
															borderWidth: 2,
														}}
													>
														<span className="sr-only">
															Loading...
														</span>
													</Spinner>
												) : (
													"Generate Report"
												)}
											</Button>
											<img
												src={schedulereports}
												className={`cursor-pointer ${
													disableCheck() && "o-6"
												}`}
												onClick={() =>
													!disableCheck() &&
													setScheduleReportsSectionOpen(
														true
													)
												}
											></img>
										</div>
									</>
								) : (
									<>
										<img
											style={{ marginTop: "92px" }}
											src={checked}
											height={54}
											width={54}
										></img>
										<div className="generatereport__cont__d1__d2__d2c">
											Your report is being generated
										</div>
										<div className="generatereport__cont__d1__d2__d3c">
											We’ll mail you as soon as the report
											is ready
										</div>
										<Button
											className="z__button"
											type="link"
											style={{
												border: "1px solid #2266E2",
												marginTop: "16px",
												width: "91px",
												height: "34px",
											}}
											onClick={() => {
												setClickedOnGenerateButton(
													false
												);
												props.handleClose();
												setFilterLength(
													props.report.filters.length
												);
												setExportRequestObj({
													...defaultExportObj,
													["columns_required"]:
														props.report.columns,
													["reportEmailDesc"]:
														props.report
															.reportMailDesc,
												});
											}}
										>
											Close
										</Button>
									</>
								)}
							</div>
							{scheduleReportsSectionOpen && (
								<ScheduleReportExport
									onHide={() =>
										setScheduleReportsSectionOpen(false)
									}
									exportRequestObj={exportRequestObj}
									isReport={true}
									scheduleName={props.report.name}
									scheduleType="report"
									exportEntity={
										selectedAllApps
											? props.report.scheduleEntity
												? props.report.scheduleEntity
												: props.report.entity
											: props.report.entity
									}
									screenEntityFromProps="applications"
									id={targetApp?.app_id}
								/>
							)}
							{!scheduleReportsSectionOpen && (
								<img
									src={cross}
									height={12}
									width={12}
									onClick={() => {
										setClickedOnGenerateButton(false);
										props.handleClose();
									}}
									className="generatereport__cont__closebutton"
								></img>
							)}
						</div>
					</div>
				</Modal>
			)}
		</>
	);
}
