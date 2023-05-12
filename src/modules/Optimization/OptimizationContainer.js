import React, { useContext, useEffect, useRef, useState } from "react";
import { DatePicker } from "UIComponents/DatePicker/DatePicker";
import navigationarrow1 from "assets/optimization/navigationarrow1.svg";
import { Button } from "react-bootstrap";
import {
	dateResetTimeZone,
	getDateByDateMonthYear,
	UTCDateFormatter,
} from "utils/DateUtility";
import ApplicationOptimization from "./ApplicationOptimization";
import { TriggerIssue } from "utils/sentry";
import {
	generateOptimizationStatuses,
	reportRegenerateTypes,
} from "./constants/OptimizationConstants";
import reminderBell from "assets/licenses/reminderbell.svg";
import { Loader } from "common/Loader/Loader";
import OptimizationError from "./OptimizationError";
import ModifyOrRefreshOptimizationReport from "./ModifyOrRefreshOptimizationReport";
import OptimizationGeneratePDF from "./OptimizationGeneratePDF";
import { useSelector } from "react-redux";
import OptimizationGetStarted from "./OptimizationGetStarted";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";
import { ProgressBarLoader } from "common/Loader/ProgressBarLoader";
import { userRoles } from "constants/userRole";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";
import RoleContext from "services/roleContext/roleContext";

export default function OptimizationContainer({
	api,
	app,
	entityId,
	entityType,
	showGetStarted = false,
	contractCount = 0,
	userAppLicenseCount = 0,
	licenseCount = 0,
}) {
	const activelyUsedRef = useRef();
	const unassignedRef = useRef();
	const underUsedRef = useRef();
	const unusedRef = useRef();
	const leftOrgRef = useRef();
	const overviewRef = useRef();

	const licenseUsageRefObj = {
		overview: overviewRef,
		unassigned: unassignedRef,
		left_org: leftOrgRef,
		unused: unusedRef,
		under_used: underUsedRef,
		actively_used: activelyUsedRef,
	};
	const { userRole } = useContext(RoleContext);
	const [startDate, setStartDate] = useState();
	const [endDate, setEndDate] = useState();
	const [data, setData] = useState();
	const [dataSet, setDataSet] = useState();
	const [loading, setLoading] = useState(true);
	const [firstLoading, setFirstLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [showReport, setShowReport] = useState(false);
	const [error, setError] = useState(false);
	const [regenerateType, setRegenerateType] = useState();
	const { partner } = useContext(RoleContext);

	const { selected_filter: selectedFilter } = useSelector(
		(state) => state.optimization
	);

	useEffect(() => {
		if (firstLoading || regenerateType === reportRegenerateTypes.REFRESH) {
			callGenerateOptimization(firstLoading);
		}
	}, [firstLoading, regenerateType]);

	useEffect(() => {
		if (dataSet) setData(dataSet[selectedFilter].data);
	}, [selectedFilter]);

	useEffect(() => {
		if (generating) {
			var timer = setInterval(
				() => callGenerateOptimization(true),
				10000
			);
			return function cleanup() {
				clearInterval(timer);
			};
		}
	});

	const callGenerateOptimization = (firstLoad = false) => {
		if (!generating) {
			setLoading(true);
		}
		let api_call = firstLoad
			? api(entityId, firstLoad)
			: api(
					entityId,
					firstLoad,
					startDate.getMonth() + 1,
					startDate.getFullYear(),
					endDate.getMonth() + 1,
					endDate.getFullYear(),
					30,
					30
			  );
		api_call
			.then((res) => {
				if (res && res.data) {
					setDataSet(res.data);
					if (
						res.data.status ===
						generateOptimizationStatuses.NOT_GENERATED
					) {
						setLoading(false);
						setGenerating(false);
						setShowReport(false);
					} else if (
						res.data.status === generateOptimizationStatuses.PENDING
					) {
						setLoading(false);
						setGenerating(true);
						setShowReport(false);
					} else if (
						res.data.status ===
						generateOptimizationStatuses.COMPLETED
					) {
						setLoading(false);
						setGenerating(false);
						setData(res.data[selectedFilter].data);
						setStartDate(
							getDateByDateMonthYear(
								res.data[selectedFilter].data.start_month,
								res.data[selectedFilter].data.start_year
							)
						);
						setEndDate(
							getDateByDateMonthYear(
								res.data[selectedFilter].data.end_month,
								res.data[selectedFilter].data.end_year
							)
						);
						setShowReport(true);
					} else {
						TriggerIssue(
							"Unexpected status from generate optimization report API",
							res
						);
						setLoading(false);
						setGenerating(false);
						setError(true);
					}
				}
				if (firstLoading) {
					setFirstLoading(false);
				}
				if (regenerateType) {
					setRegenerateType();
				}
			})
			.catch((error) => {
				TriggerIssue("Error in generating optimization report", error);
				setLoading(false);
				setGenerating(false);
				setError(true);
			});
	};

	return (
		<>
			{userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView height="700px" />
			) : (
				<>
					<div
						className="d-flex flex-column"
						style={{ padding: "24px 40px 0 40px" }}
					>
						<div className="d-flex flex-row align-items-center justify-content-between">
							<div className="bold-600 mr-3">
								License Utilization Optimization
							</div>
							{showReport && (
								<div className="d-flex flex-row">
									<OptimizationGeneratePDF
										licenseUsageRefObj={licenseUsageRefObj}
									/>
									<ModifyOrRefreshOptimizationReport
										entityId={entityId}
										entityType={entityType}
										setShowReport={setShowReport}
										regenerateType={regenerateType}
										onDeleteReport={(deleteType) => {
											setRegenerateType(deleteType);
											setShowReport(false);
										}}
									/>
								</div>
							)}
						</div>
						<hr className="w-100 mb-0" />
					</div>
					{error ? (
						<OptimizationError
							entityId={entityId}
							entityType={entityType}
							setError={setError}
						/>
					) : (
						<>
							{showReport ? (
								<ApplicationOptimization
									application={app}
									licenseUsageDataLoading={loading}
									optimizationLicenseUsageData={data}
									start={startDate}
									end={endDate}
									licenseUsageRefObj={licenseUsageRefObj}
									key={selectedFilter}
								/>
							) : (
								<>
									{firstLoading || loading || !app ? (
										<div className="generate_optimization_div">
											<Loader width={150} height={150} />
										</div>
									) : showGetStarted ? (
										<OptimizationGetStarted
											contractCount={contractCount}
											userAppLicenseCount={
												userAppLicenseCount
											}
											entityId={entityId}
											entityType={entityType}
											licenseCount={licenseCount}
										/>
									) : (
										<>
											<div className="generate_optimization_div">
												<div className="bold-500 font-24">
													Find your requirements for
													tomorrow, today.
												</div>
												<div
													className="font-16 mt-1"
													style={{ width: "693px" }}
												>
													{partner?.name} helps you
													identify and eliminate
													ununsed and underused
													licenses and estimate your
													future license requirements.
												</div>
												<div className="generate_optimization_bullet_grid">
													{[
														"Select a reference period",
														"Select the month for which you want the forecast",
														"Select the license categories you want to optimise for",
														"Save it as a plan",
													].map((bullet, index) => (
														<div
															className="d-flex align-items-center"
															key={index}
														>
															<div
																className="mr-1"
																style={{
																	background:
																		"#6967E0",
																	borderRadius:
																		"50%",
																	width: "8px",
																	height: "8px",
																}}
															/>
															<div> {bullet}</div>
														</div>
													))}
												</div>
												{!generating ? (
													<>
														<div className="d-flex mt-3">
															<div className="d-flex flex-column">
																<div
																	className="font-11 grey-1"
																	style={{
																		height: "23px",
																	}}
																>
																	Optimization
																	Reference
																	Period
																</div>
																<NewDatePicker
																	key={`${startDate}`}
																	value={
																		startDate
																	}
																	placeholder={`Start Month`}
																	calendarClassName="rangefilter-calendar"
																	calendarContainerClassName="schedule-date-calendar"
																	style={{
																		width: "170px",
																	}}
																	calendarView="year"
																	onClickMonth={
																		true
																	}
																	maxDate={
																		new Date(
																			new Date().getFullYear(),
																			new Date().getMonth() -
																				1,
																			1
																		)
																	}
																	dateFormatter={(
																		date
																	) =>
																		UTCDateFormatter(
																			date,
																			"MMM YYYY"
																		)
																	}
																	onChange={(
																		date
																	) =>
																		setStartDate(
																			date
																		)
																	}
																/>
															</div>
															<div className="d-flex flex-column">
																<div
																	className="font-11 grey-1"
																	style={{
																		height: "23px",
																	}}
																/>
																<img
																	src={
																		navigationarrow1
																	}
																	className="mx-2 mt-1"
																	height={24}
																	width={24}
																/>
															</div>
															<div className="d-flex flex-column">
																<div
																	className="font-11 grey-1"
																	style={{
																		height: "23px",
																	}}
																/>
																<NewDatePicker
																	key={dateResetTimeZone(
																		new Date()
																	)}
																	placeholder={`${UTCDateFormatter(
																		dateResetTimeZone(
																			new Date()
																		),
																		"MMM YYYY"
																	)} (Now)`}
																	calendarClassName="rangefilter-calendar"
																	calendarContainerClassName="schedule-date-calendar"
																	style={{
																		width: "170px",
																	}}
																	disabled
																/>
															</div>
															<div className="d-flex flex-column">
																<div
																	className="font-11 grey-1"
																	style={{
																		height: "23px",
																	}}
																/>
																<img
																	src={
																		navigationarrow1
																	}
																	className="mx-2 mt-1"
																	height={24}
																	width={24}
																/>
															</div>
															<div className="d-flex flex-column">
																<div
																	className="font-11 grey-1"
																	style={{
																		height: "23px",
																	}}
																>
																	Forecast
																	Month
																</div>
																<NewDatePicker
																	key={`${endDate}`}
																	value={
																		endDate
																	}
																	placeholder={`End Month`}
																	calendarClassName="rangefilter-calendar"
																	calendarContainerClassName="schedule-date-calendar"
																	style={{
																		width: "170px",
																	}}
																	calendarView="year"
																	onClickMonth={
																		true
																	}
																	minDate={
																		new Date(
																			new Date().getFullYear(),
																			new Date().getMonth() +
																				2,
																			0
																		)
																	}
																	dateFormatter={(
																		date
																	) =>
																		UTCDateFormatter(
																			date,
																			"MMM YYYY"
																		)
																	}
																	onChange={(
																		date
																	) =>
																		setEndDate(
																			date
																		)
																	}
																/>
															</div>
														</div>
														<Button
															className="z-btn-primary mt-3"
															type="submit"
															onClick={() =>
																callGenerateOptimization(
																	false
																)
															}
															style={{
																width: "237px",
																height: "38px",
																fontSize:
																	"13px",
															}}
															disabled={
																!startDate ||
																!endDate
															}
														>
															Generate
															Optimization Report
														</Button>
													</>
												) : (
													<>
														<div className="optimization_in_progress">
															<div>
																<ProgressBarLoader
																	height={20}
																	width={35}
																/>
															</div>
															<div>
																Optimization in
																progress
															</div>
														</div>
														<div className="font-12 bold-500">
															<img
																src={
																	reminderBell
																}
																className="mr-1"
															/>
															This will take a
															couple of minutes to
															complete.
														</div>
													</>
												)}
											</div>
										</>
									)}
								</>
							)}
						</>
					)}
				</>
			)}
		</>
	);
}
