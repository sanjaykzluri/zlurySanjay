import React, { useContext, useEffect, useState } from "react";
import {
	Accordion,
	Card,
	OverlayTrigger,
	Tooltip,
	Spinner,
} from "react-bootstrap";
import pendingIcon from "../../../../assets/pending_icon.svg";
import failedIcon from "../../../../assets/cancelled_icon.svg";
import selectedIcon from "../../../../assets/selected_round_checkbox_icon.svg";
import info from "../../../../assets/applications/info.svg";
import aborted from "../../../../assets/icons/aborted.svg";
import completedIcon from "../../../../assets/completed_icon.svg";
import cancelled from "../../../../assets/workflow/Cancelled.svg";
import UserWorkflowStatusCard from "../../components/UserWorkflowStatusCard/UserWorkflowStatusCard";
import uncheckedFilterIcon from "../../../../assets/unchecked-filter.svg";
import dayjs from "dayjs";
import CsvDownload from "react-json-to-csv";
import { ProgressBarLoader } from "../../../../common/Loader/ProgressBarLoader";
import { NameBadge } from "../../../../common/NameBadge";
import { generateCsvDataLogs } from "./RunLogs";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";
import _ from "underscore";

const RawRunLogs = ({
	setShowRawLogs,
	rawDataLogs,
	handleRunAction,
	showCompleted,
	setShowCompleted,
	showPending,
	setShowPending,
	showFailed,
	setShowFailed,
	showAllLogs,
	handleShowAllLogs,
	retryAllFailedAction,
	retryFailedAction,
	showFailedButton,
	showRetryAllFailedButtonLoading,
	showRetryFailedButtonLoading,
	retryFailedObject,
	handleActionTask,
	forceUpdateManualTask,
	forceCompleteLoading,
	forceCancelLoading,
	selectedData,
	forceCancelAllPendingTaskLoading,
}) => {
	const [isLoading, setIsLoading] = useState(false);

	const isPendingTask = () => {
		let isPending = false;
		rawDataLogs?.run_log?.length &&
			rawDataLogs?.run_log?.map((log) => {
				if (
					log?.action_initiated &&
					log?.action_type === "manual" &&
					log?.action_status === "pending"
				) {
					isPending = true;
				}
			});
		return isPending;
	};

	return (
		<>
			{!_.isEmpty(rawDataLogs) ? (
				<Card
					style={{
						border: "1px solid #EBEBEB",
						lineHeight: "18px",
						fontSize: "14px",
						marginBottom: "20px",
					}}
				>
					<div
						style={{
							justifyContent: "space-between",
						}}
						className="flex p-4"
					>
						<div className="font-16 bold-600">Run Log</div>
						<div className="flex">
							{isPendingTask() && (
								<>
									{forceCancelAllPendingTaskLoading ? (
										<Spinner
											className="mr-4 blue-spinner action-edit-spinner"
											animation="border"
										/>
									) : (
										<div
											onClick={() => {
												forceUpdateManualTask(
													rawDataLogs,
													"cancelAllTask"
												);
											}}
											className="mr-4 primary-color font-13 cursor-pointer"
										>
											Cancel pending Manual task
										</div>
									)}
								</>
							)}
							{showFailedButton &&
								rawDataLogs?.validRetryAttempt && (
									<>
										{showRetryAllFailedButtonLoading ? (
											<Spinner
												className="mr-4 blue-spinner action-edit-spinner"
												animation="border"
											/>
										) : (
											<div
												onClick={() => {
													if (!retryFailedObject) {
														retryAllFailedAction();
													}
												}}
												className="mr-4 primary-color font-13 cursor-pointer"
											>
												Retry All Failed
											</div>
										)}
									</>
								)}
							<div
								onClick={() => setShowRawLogs(false)}
								className="mr-4 primary-color font-13 cursor-pointer"
							>
								View Summarised Log
							</div>
							<div className="mr-2 primary-color font-13 cursor-pointer">
								<OverlayTrigger
									placement="top"
									isStickyTooltip
									overlay={
										<Tooltip>
											Exports log data as CSV.
										</Tooltip>
									}
								>
									<CsvDownload
										style={{
											background: "#fff",
											border: "none",
										}}
										className="primary-color"
										data={generateCsvDataLogs(
											rawDataLogs?.run_log,
											true
										)}
									>
										Export
									</CsvDownload>
								</OverlayTrigger>
							</div>
						</div>
					</div>
					<hr
						style={{
							marginTop: "0px",
							marginBottom: "0px",
						}}
					/>
					{rawDataLogs?.run_log && rawDataLogs?.run_log?.length > 0 && (
						<div className="d-flex px-4 py-2">
							<div
								onClick={() => handleShowAllLogs(!showAllLogs)}
								className="mr-3 cursor-pointer"
							>
								<img
									className="mr-2 cursor-pointer"
									src={
										showAllLogs
											? selectedIcon
											: uncheckedFilterIcon
									}
								/>
								Show all
							</div>
							<div
								onClick={() => setShowCompleted(!showCompleted)}
								className="mr-3 cursor-pointer"
							>
								<img
									className="mr-2 cursor-pointer"
									src={
										showCompleted
											? selectedIcon
											: uncheckedFilterIcon
									}
								/>
								Completed
							</div>
							<div
								onClick={() => setShowPending(!showPending)}
								className="mr-3 cursor-pointer"
							>
								<img
									className="mr-2 cursor-pointer"
									src={
										showPending
											? selectedIcon
											: uncheckedFilterIcon
									}
								/>
								Pending
							</div>
							<div
								onClick={() => setShowFailed(!showFailed)}
								className="mr-3 cursor-pointer"
							>
								<img
									className="mr-2 cursor-pointer"
									src={
										showFailed
											? selectedIcon
											: uncheckedFilterIcon
									}
								/>
								Error
							</div>
						</div>
					)}
					<hr
						style={{
							marginTop: "0px",
						}}
					/>
					{rawDataLogs &&
					(showAllLogs ||
						showCompleted ||
						showPending ||
						showFailed) &&
					!isLoading ? (
						<div>
							<div
								style={{ flexDirection: "column" }}
								className="d-flex"
							>
								{rawDataLogs?.run_log &&
								rawDataLogs?.run_log?.length === 0 &&
								rawDataLogs?.workflow_status === "completed" ? (
									<div
										style={{
											height: window.innerHeight * 0.6,
											alignItems: "center",
											flexDirection: "column",
											justifyContent: "center",
										}}
										className="d-flex ml-1 text-center"
									>
										{/* <span> */}
										<img
											height={"32px"}
											width={"32px"}
											alt=""
											// className="font-32"
											src={info}
										/>
										{/* </span> */}
										<div
											style={{
												color: "#484848",
												fontWeight: 600,
											}}
											className="font-12 my-2 ml-3"
										>
											None of the workflow actions were
											applicable to this user
										</div>
									</div>
								) : (
									rawDataLogs?.run_log &&
									rawDataLogs?.run_log?.map(
										(actionLog, index) => (
											<div
												key={
													actionLog.action_id + index
												}
											>
												{actionLog.action_status ===
													"scheduled" &&
													actionLog.action_name &&
													showPending && (
														<div className="px-4 py-3">
															<div className="d-flex">
																<RawLogTimeStamp
																	timestamp={
																		actionLog
																			?.action_log
																			?.timestamp
																	}
																/>
																<div
																	style={{
																		width: "100%",
																	}}
																	className="px-4"
																>
																	<div
																		style={{
																			justifyContent:
																				"space-between",
																		}}
																		className="flex"
																	>
																		<div>
																			<div className="font-13 bold-600 flex">
																				<div className="mr-1">
																					{actionLog
																						.action_log
																						?.title ||
																						actionLog.action_name}
																					{actionLog
																						?.action_log
																						?.schedule_timestamp
																						? dayjs(
																								actionLog
																									.action_log
																									.schedule_timestamp
																						  ).format(
																								" D MMM, HH:mm "
																						  )
																						: ""}
																					{actionLog.action_type ===
																						"manual" && (
																						<span
																							style={{
																								backgroundColor:
																									"#5ABAFF",
																							}}
																							className="position-relative font-10 p-1 primary-color-bg white bold-700 ml-2"
																						>
																							MANUAL
																							TASK
																						</span>
																					)}
																				</div>
																				<div>
																					<ProgressBarLoader
																						height={
																							20
																						}
																						width={
																							20
																						}
																					/>
																				</div>
																			</div>
																			<ActionAppInfo
																				actionLog={
																					actionLog
																				}
																			/>
																			<div className="font-12 my-2">
																				{actionLog
																					.action_log
																					?.description ||
																					actionLog.action_description}
																			</div>
																			<div>
																				<span
																					onClick={(
																						e
																					) => {
																						e.stopPropagation();
																						handleActionTask(
																							"RunNow",
																							actionLog
																						);
																					}}
																					className="mr-4 primary-color font-13 cursor-pointer"
																				>
																					Run
																					now
																				</span>
																				<span
																					onClick={() => {
																						handleRunAction(
																							actionLog,
																							"ModifySchedule"
																						);
																					}}
																					className="mr-4 primary-color font-13 cursor-pointer"
																				>
																					Modify
																					Schedule
																				</span>
																				<span
																					onClick={() => {
																						handleActionTask(
																							"Cancel",
																							actionLog
																						);
																					}}
																					className="mr-4 primary-color font-13 cursor-pointer"
																				>
																					Cancel
																				</span>
																			</div>
																		</div>
																		<div>
																			<span>
																				<img
																					alt=""
																					src={
																						pendingIcon
																					}
																				/>
																			</span>{" "}
																			<span className="font-13">
																				Scheduled
																			</span>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													)}
												{actionLog.action_status ===
													"set_for_approval" &&
													actionLog.action_name &&
													showPending && (
														<div className="px-4 py-3">
															<div className="d-flex">
																<RawLogTimeStamp
																	timestamp={
																		actionLog
																			?.action_log
																			?.timestamp
																	}
																/>
																<div
																	style={{
																		width: "100%",
																	}}
																	className="px-4"
																>
																	<div
																		style={{
																			justifyContent:
																				"space-between",
																		}}
																		className="flex"
																	>
																		<div>
																			<div className="font-13 bold-600 flex">
																				<div className="mr-1">
																					{actionLog
																						.action_log
																						?.title ||
																						actionLog.action_name}
																					{actionLog
																						?.action_log
																						?.schedule_timestamp
																						? dayjs(
																								actionLog
																									.action_log
																									.schedule_timestamp
																						  ).format(
																								" D MMM, HH:mm "
																						  )
																						: ""}
																					{actionLog.action_type ===
																						"manual" && (
																						<span
																							style={{
																								backgroundColor:
																									"#5ABAFF",
																							}}
																							className="position-relative font-10 p-1 primary-color-bg white bold-700 ml-2"
																						>
																							MANUAL
																							TASK
																						</span>
																					)}
																				</div>
																				<div>
																					<ProgressBarLoader
																						height={
																							20
																						}
																						width={
																							20
																						}
																					/>
																				</div>
																			</div>
																			<ActionAppInfo
																				actionLog={
																					actionLog
																				}
																			/>
																			<div className="font-12 my-2">
																				{actionLog
																					.action_log
																					?.description ||
																					actionLog.action_description}
																			</div>
																			<div
																			// className="ml-4 px-3 pb-2"
																			>
																				<span
																					onClick={(
																						e
																					) => {
																						e.stopPropagation();
																						handleActionTask(
																							"RunNowApproval",
																							actionLog
																						);
																					}}
																					className="mr-4 primary-color font-13 cursor-pointer"
																				>
																					Run
																					now
																				</span>
																				<span
																					onClick={() => {
																						handleActionTask(
																							"CancelApproval",
																							actionLog
																						);
																					}}
																					className="mr-4 primary-color font-13 cursor-pointer"
																				>
																					Cancel
																				</span>
																			</div>
																		</div>
																		<div>
																			<span>
																				<img
																					alt=""
																					src={
																						pendingIcon
																					}
																				/>
																			</span>{" "}
																			<span className="font-13">
																				Awaiting
																				approval
																			</span>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													)}
												{actionLog.action_status ===
													"rejected" &&
													actionLog.action_name &&
													showPending && (
														<div className="px-4 py-3">
															<div className="d-flex">
																<RawLogTimeStamp
																	timestamp={
																		actionLog
																			?.action_log
																			?.timestamp
																	}
																/>
																<div
																	style={{
																		width: "100%",
																	}}
																	className="px-4"
																>
																	<div
																		style={{
																			justifyContent:
																				"space-between",
																		}}
																		className="flex"
																	>
																		<div>
																			<div className="font-13 bold-600 flex">
																				<div className="mr-1">
																					{actionLog
																						.action_log
																						?.title ||
																						actionLog.action_name}
																					{actionLog
																						?.action_log
																						?.schedule_timestamp
																						? dayjs(
																								actionLog
																									.action_log
																									.schedule_timestamp
																						  ).format(
																								" D MMM, HH:mm "
																						  )
																						: ""}
																					{actionLog.action_type ===
																						"manual" && (
																						<span
																							style={{
																								backgroundColor:
																									"#5ABAFF",
																							}}
																							className="position-relative font-10 p-1 primary-color-bg white bold-700 ml-2"
																						>
																							MANUAL
																							TASK
																						</span>
																					)}
																				</div>
																				<div>
																					<ProgressBarLoader
																						height={
																							20
																						}
																						width={
																							20
																						}
																					/>
																				</div>
																			</div>
																			<ActionAppInfo
																				actionLog={
																					actionLog
																				}
																			/>
																			<div className="font-12 my-2">
																				{actionLog
																					.action_log
																					?.description ||
																					actionLog.action_description}
																			</div>
																		</div>
																		<div>
																			<span>
																				<img
																					alt=""
																					src={
																						failedIcon
																					}
																				/>
																			</span>{" "}
																			<span className="font-13">
																				Approval
																				Denied
																			</span>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													)}
												{actionLog.action_status ===
													"pending" &&
													actionLog.action_name &&
													showPending && (
														<div className="px-4 py-3">
															<div className="d-flex">
																<RawLogTimeStamp
																	timestamp={
																		actionLog
																			?.action_log
																			?.timestamp
																	}
																/>
																<div
																	style={{
																		width: "100%",
																	}}
																	className="px-4"
																>
																	<div
																		style={{
																			justifyContent:
																				"space-between",
																		}}
																		className="flex"
																	>
																		<div>
																			<div className="font-13 bold-600 flex">
																				<div className="mr-1">
																					{actionLog
																						.action_log
																						?.title ||
																						actionLog.action_name}
																					{actionLog
																						?.action_log
																						?.schedule_timestamp
																						? dayjs(
																								actionLog
																									.action_log
																									.schedule_timestamp
																						  ).format(
																								" D MMM, HH:mm "
																						  )
																						: ""}
																					{actionLog.action_type ===
																						"manual" && (
																						<span
																							style={{
																								backgroundColor:
																									"#5ABAFF",
																							}}
																							className="position-relative font-10 p-1 primary-color-bg white bold-700 ml-2"
																						>
																							MANUAL
																							TASK
																						</span>
																					)}
																				</div>
																				<div>
																					<ProgressBarLoader
																						height={
																							20
																						}
																						width={
																							20
																						}
																					/>
																				</div>
																			</div>
																			<ActionAppInfo
																				actionLog={
																					actionLog
																				}
																			/>
																			<div className="font-12 my-2">
																				{actionLog
																					.action_log
																					?.description ||
																					actionLog.action_description}
																			</div>
																			{actionLog.action_type ===
																				"manual" && (
																				<div>
																					<span
																						onClick={() => {
																							let groupState;
																							if (
																								actionLog?.group_state
																							) {
																								groupState =
																									actionLog?.group_state;
																							} else {
																								groupState =
																									null;
																							}
																							handleRunAction(
																								actionLog,
																								"sendReminder",
																								groupState
																							);
																						}}
																						className="mr-4 primary-color font-13 cursor-pointer"
																					>
																						Send
																						Reminder
																					</span>
																					<span
																						onClick={() =>
																							handleRunAction(
																								actionLog,
																								"reassignTask"
																							)
																						}
																						className="mr-4 primary-color font-13 cursor-pointer"
																					>
																						Reassign
																					</span>
																					{actionLog?.action_initiated && (
																						<>
																							{forceCompleteLoading &&
																							selectedData?._id ===
																								actionLog._id ? (
																								<Spinner
																									className="mr-4 blue-spinner action-edit-spinner"
																									animation="border"
																								/>
																							) : (
																								<span
																									onClick={() => {
																										forceUpdateManualTask(
																											actionLog,
																											"completed"
																										);
																									}}
																									className="mr-4 primary-color font-12 cursor-pointer"
																								>
																									Mark
																									as
																									Completed
																								</span>
																							)}
																						</>
																					)}
																					{actionLog?.action_initiated && (
																						<>
																							{forceCancelLoading &&
																							selectedData?._id ===
																								actionLog._id ? (
																								<Spinner
																									className="mr-4 blue-spinner action-edit-spinner"
																									animation="border"
																								/>
																							) : (
																								<span
																									onClick={() => {
																										forceUpdateManualTask(
																											actionLog,
																											"cancelled"
																										);
																									}}
																									className="mr-4 primary-color font-12 cursor-pointer"
																								>
																									Cancel
																									Task
																								</span>
																							)}
																						</>
																					)}
																				</div>
																			)}
																		</div>
																		<div>
																			<span>
																				<img
																					src={
																						pendingIcon
																					}
																				/>
																			</span>{" "}
																			<span className="font-13">
																				Pending
																			</span>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													)}
												{actionLog.action_status ===
													"failed" &&
													showFailed &&
													actionLog?.action_log && (
														<div className="px-4 py-3">
															<div className="d-flex">
																<RawLogTimeStamp
																	timestamp={
																		actionLog &&
																		actionLog?.action_log &&
																		actionLog
																			?.action_log
																			?.timestamp
																			? actionLog
																					?.action_log
																					?.timestamp
																			: null
																	}
																/>
																{actionLog
																	?.action_log
																	?.type ===
																	"error" ||
																actionLog
																	?.action_log
																	?.type ===
																	"info" ? (
																	<div
																		style={{
																			width: "100%",
																		}}
																		className="px-4"
																	>
																		<div
																			style={{
																				justifyContent:
																					"space-between",
																			}}
																			className="flex"
																		>
																			<div>
																				<div
																					style={{
																						color: "#FF6767",
																					}}
																					className="font-13 bold-600"
																				>
																					{
																						actionLog
																							?.action_log
																							?.title
																					}
																					{actionLog
																						?.action_log
																						?.schedule_timestamp
																						? dayjs(
																								actionLog
																									.action_log
																									.schedule_timestamp
																						  ).format(
																								" D MMM, HH:mm "
																						  )
																						: ""}
																					{actionLog.action_type ===
																						"manual" && (
																						<span
																							style={{
																								backgroundColor:
																									"#5ABAFF",
																							}}
																							className="position-relative font-10 p-1 primary-color-bg white bold-700 ml-2"
																						>
																							MANUAL
																							TASK
																						</span>
																					)}
																				</div>
																				<ActionAppInfo
																					actionLog={
																						actionLog
																					}
																				/>
																				<div className="font-12 my-2">
																					{
																						actionLog
																							.action_log
																							?.description
																					}
																				</div>

																				{actionLog.action_status ===
																					"failed" && (
																					<div>
																						{actionLog?.validRetryAttempt && (
																							<>
																								{showRetryFailedButtonLoading &&
																								retryFailedObject._id ===
																									actionLog._id ? (
																									<Spinner
																										className="mr-4 blue-spinner action-edit-spinner"
																										animation="border"
																									/>
																								) : (
																									<span
																										onClick={() => {
																											retryFailedAction(
																												actionLog
																											);
																										}}
																										className="mr-4 primary-color font-13 cursor-pointer"
																									>
																										{`Retry ${
																											actionLog.action_type ===
																											"manual"
																												? "Task"
																												: "Action"
																										}`}
																									</span>
																								)}
																							</>
																						)}
																						{actionLog.action_type !==
																							"manual" && (
																							<span
																								onClick={() =>
																									handleRunAction(
																										actionLog,
																										"convertToManual"
																									)
																								}
																								className="mr-4 primary-color font-13 cursor-pointer"
																							>
																								Convert
																								to
																								Manual
																								Task
																							</span>
																						)}
																					</div>
																				)}
																			</div>
																			<div>
																				<span>
																					<img
																						src={
																							failedIcon
																						}
																					/>
																				</span>{" "}
																				<span className="font-13">
																					Failed
																				</span>
																			</div>
																		</div>
																	</div>
																) : actionLog
																		.action_log
																		.type ===
																  "info" ? (
																	<>
																		<ActionInfoCard
																			actionLog={
																				actionLog
																			}
																		/>
																	</>
																) : actionLog
																		.action_log
																		.type ===
																  "aborted" ? (
																	<>
																		<ActionInfoCard
																			actionLog={
																				actionLog
																			}
																		/>
																	</>
																) : (
																	""
																)}
															</div>
														</div>
													)}
												{actionLog.action_status ===
													"aborted" &&
													showFailed && (
														<div className="px-4 py-3">
															<div className="d-flex">
																<RawLogTimeStamp
																	timestamp={
																		actionLog
																			?.action_log
																			?.timestamp
																	}
																/>
																{actionLog
																	.action_log
																	.type ===
																"aborted" ? (
																	<div
																		style={{
																			width: "100%",
																		}}
																		className="px-4"
																	>
																		<div
																			style={{
																				justifyContent:
																					"space-between",
																			}}
																			className="flex"
																		>
																			<div>
																				<div
																					style={{
																						color: "#FF6767",
																					}}
																					className="font-13 bold-600"
																				>
																					{
																						actionLog
																							.action_log
																							?.title
																					}
																					{actionLog
																						?.action_log
																						?.schedule_timestamp
																						? dayjs(
																								actionLog
																									.action_log
																									.schedule_timestamp
																						  ).format(
																								" D MMM, HH:mm "
																						  )
																						: ""}
																					{actionLog.action_type ===
																						"manual" && (
																						<span
																							style={{
																								backgroundColor:
																									"#5ABAFF",
																							}}
																							className="position-relative font-10 p-1 primary-color-bg white bold-700 ml-2"
																						>
																							MANUAL
																							TASK
																						</span>
																					)}
																				</div>
																				<ActionAppInfo
																					actionLog={
																						actionLog
																					}
																				/>
																				<div className="font-12 my-2">
																					{
																						actionLog
																							.action_log
																							?.description
																					}
																				</div>

																				{actionLog.action_status ===
																					"aborted" && (
																					<div>
																						{actionLog?.validRetryAttempt && (
																							<>
																								{showRetryFailedButtonLoading &&
																								retryFailedObject._id ===
																									actionLog._id ? (
																									<Spinner
																										className="mr-4 blue-spinner action-edit-spinner"
																										animation="border"
																									/>
																								) : (
																									<span
																										onClick={() => {
																											retryFailedAction(
																												actionLog,
																												"run"
																											);
																										}}
																										className="mr-4 primary-color font-13 cursor-pointer"
																									>
																										{`Run ${
																											actionLog.action_type ===
																											"manual"
																												? "Task"
																												: "Action"
																										}`}
																									</span>
																								)}
																							</>
																						)}
																						{actionLog.action_type !==
																							"manual" && (
																							<span
																								onClick={() =>
																									handleRunAction(
																										actionLog,
																										"convertToManual"
																									)
																								}
																								className="mr-4 primary-color font-13 cursor-pointer"
																							>
																								Convert
																								to
																								Manual
																								Task
																							</span>
																						)}
																					</div>
																				)}
																			</div>
																			<div>
																				<span>
																					<img
																						src={
																							aborted
																						}
																					/>
																				</span>{" "}
																				<span className="font-13">
																					Aborted
																				</span>
																			</div>
																		</div>
																	</div>
																) : actionLog
																		.action_log
																		.type ===
																  "info" ? (
																	<>
																		<ActionInfoCard
																			actionLog={
																				actionLog
																			}
																		/>
																	</>
																) : (
																	""
																)}
															</div>
														</div>
													)}
												{actionLog.action_status ===
													"cancelled" &&
													showFailed && (
														<div className="px-4 py-3">
															<div className="d-flex">
																<RawLogTimeStamp
																	timestamp={
																		actionLog
																			?.action_log
																			?.timestamp
																	}
																/>
																{actionLog
																	?.action_log
																	?.type ===
																"error" ? (
																	<div
																		style={{
																			width: "100%",
																		}}
																		className="px-4"
																	>
																		<div
																			style={{
																				justifyContent:
																					"space-between",
																			}}
																			className="flex"
																		>
																			<div>
																				<div
																					style={{
																						color: "#FF6767",
																					}}
																					className="font-13 bold-600"
																				>
																					{
																						actionLog
																							.action_log
																							?.title
																					}
																					{actionLog
																						?.action_log
																						?.schedule_timestamp
																						? dayjs(
																								actionLog
																									.action_log
																									.schedule_timestamp
																						  ).format(
																								" D MMM, HH:mm "
																						  )
																						: ""}
																					{actionLog.action_type ===
																						"manual" && (
																						<span
																							style={{
																								backgroundColor:
																									"#5ABAFF",
																							}}
																							className="position-relative font-10 p-1 primary-color-bg white bold-700 ml-2"
																						>
																							MANUAL
																							TASK
																						</span>
																					)}
																				</div>
																				<ActionAppInfo
																					actionLog={
																						actionLog
																					}
																				/>
																				<div className="font-12 my-2">
																					{
																						actionLog
																							?.action_log
																							?.description
																					}
																				</div>
																			</div>
																			<div>
																				<span>
																					<img
																						alt=""
																						src={
																							cancelled
																						}
																					/>
																				</span>{" "}
																				<span className="font-13">
																					Cancelled
																				</span>
																			</div>
																		</div>
																	</div>
																) : actionLog
																		?.action_log
																		?.type ===
																		"info" ||
																  actionLog
																		?.action_log
																		?.type ===
																		"cancelled" ? (
																	<>
																		<ActionInfoCard
																			actionLog={
																				actionLog
																			}
																		/>
																	</>
																) : (
																	""
																)}
															</div>
														</div>
													)}
												{actionLog.action_status ===
													"completed" &&
													showCompleted && (
														<div className="px-4 py-3">
															<div className="d-flex">
																<RawLogTimeStamp
																	timestamp={
																		actionLog
																			?.action_log
																			?.timestamp
																	}
																/>
																<div
																	style={{
																		width: "100%",
																	}}
																	className="px-4"
																>
																	<div
																		style={{
																			justifyContent:
																				"space-between",
																		}}
																		className="flex"
																	>
																		<div>
																			<div className="font-13 bold-600 flex">
																				<div className="mr-1">
																					{actionLog
																						.action_log
																						?.title ||
																						actionLog.action_name}
																					{actionLog
																						?.action_log
																						?.schedule_timestamp
																						? dayjs(
																								actionLog
																									.action_log
																									.schedule_timestamp
																						  ).format(
																								" D MMM, HH:mm "
																						  )
																						: ""}
																					{actionLog?.action_type ===
																						"manual" && (
																						<span
																							style={{
																								backgroundColor:
																									"#5ABAFF",
																							}}
																							className="position-relative font-10 p-1 primary-color-bg white bold-700 ml-2"
																						>
																							MANUAL
																							TASK
																						</span>
																					)}
																				</div>
																			</div>
																			<ActionAppInfo
																				actionLog={
																					actionLog
																				}
																			/>
																			<div className="font-12 my-2">
																				{actionLog
																					.action_log
																					?.description ||
																					actionLog.action_description}
																			</div>
																		</div>
																		<div>
																			<span>
																				<img
																					alt=""
																					src={
																						completedIcon
																					}
																				/>
																			</span>{" "}
																			<span className="font-13">
																				Completed
																			</span>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													)}
											</div>
										)
									)
								)}
							</div>
						</div>
					) : (
						<div>
							<UserWorkflowStatusCard
								loading={isLoading}
								number_of_loaders={5}
								hideFewBars={true}
							/>
						</div>
					)}
				</Card>
			) : (
				<div>
					<UserWorkflowStatusCard
						loading={true}
						number_of_loaders={5}
						hideFewBars={true}
					/>
				</div>
			)}
		</>
	);
};

export { RawRunLogs };

function actionStatus(actionStatus) {
	let statusMap = {
		completed: (
			<>
				<span>
					<img alt="" src={completedIcon} />
				</span>{" "}
				<span className="font-13">Completed</span>
			</>
		),
		pending: (
			<>
				<span>
					<img alt="" src={pendingIcon} />
				</span>{" "}
				<span className="font-13">Pending</span>
			</>
		),
		failed: (
			<>
				<span>
					<img alt="" src={failedIcon} />
				</span>{" "}
				<span className="font-13">Failed</span>
			</>
		),
		cancelled: (
			<>
				<span>
					<img alt="" src={cancelled} />
				</span>{" "}
				<span className="font-13">Cancelled</span>
			</>
		),
		aborted: (
			<>
				<span>
					<img alt="" src={aborted} />
				</span>{" "}
				<span className="font-13">Aborted</span>
			</>
		),
		scheduled: (
			<>
				<span>
					<img alt="" src={pendingIcon} />
				</span>{" "}
				<span className="font-13">Scheduled</span>
			</>
		),
		set_for_approval: (
			<>
				<span>
					<img alt="" src={pendingIcon} />
				</span>{" "}
				<span className="font-13">Awaiting approval</span>
			</>
		),
		rejected: (
			<>
				<span>
					<img alt="" src={failedIcon} />
				</span>{" "}
				<span className="font-13">Approval Denied</span>
			</>
		),
	};

	return statusMap[actionStatus];
}

const ActionInfoCard = ({ actionLog }) => {
	return (
		<>
			<div
				style={{
					width: "100%",
				}}
				className="px-4"
			>
				<div
					style={{
						justifyContent: "space-between",
					}}
					className="flex"
				>
					<div>
						<div
							className={`font-14 ${
								actionLog.action_type === "manual" ? "mb-2" : ""
							}`}
						>
							<span
								style={{
									color:
										actionLog.action_status === "aborted"
											? "#FF6767"
											: "",
								}}
							>
								{actionLog.action_log?.title}
								{actionLog?.action_log?.schedule_timestamp
									? dayjs(
											actionLog?.action_log
												?.schedule_timestamp
									  ).format(" D MMM, HH:mm ")
									: ""}
							</span>
							{actionLog.action_type === "manual" && (
								<span
									style={{
										backgroundColor: "#5ABAFF",
									}}
									className="position-relative font-10 p-1 primary-color-bg white bold-700 ml-2"
								>
									MANUAL TASK
								</span>
							)}
						</div>

						<ActionAppInfo actionLog={actionLog} />
						<div className="font-12 my-2">
							{actionLog?.action_log?.description}
						</div>
					</div>
					<div>
						{/* <span>
							<img alt="" src={failedIcon} />
						</span>{" "}
						<span className="font-13">Failed</span> */}
						{actionStatus(actionLog?.action_status)}
					</div>
				</div>
			</div>
		</>
	);
};

const RawLogTimeStamp = ({ timestamp }) => {
	var [date, setDate] = useState(new Date());

	useEffect(() => {
		var timer = setInterval(() => setDate(new Date()), 1000);
		return function cleanup() {
			clearInterval(timer);
		};
	});
	return (
		<div className="raw_logs_timestamp">
			{timestamp
				? dayjs(timestamp).format("HH:mm:ss")
				: dayjs(date).format("HH:mm:ss")}
		</div>
	);
};

const ActionAppInfo = ({ actionLog }) => {
	return (
		<div className="mt-2 d-flex flex-row align-items-center">
			{actionLog?.group_state ? (
				<>
					<div className="position-relative d-flex">
						{actionLog?.group_state &&
							actionLog?.apps &&
							actionLog?.apps.length > 0 &&
							actionLog.apps
								.map((app, index) => (
									<GetImageOrNameBadge
										key={index}
										name={app.app_name}
										url={app.app_logo}
										width={20}
										height={20}
										imageClassName={
											index === 0
												? " mr-n2 z-index-20  img-circle white-bg"
												: "border-radius-4 object-contain avatar"
										}
										nameClassName={
											index === 0
												? " mr-n2 z-index-20  img-circle white-bg"
												: "img-circle avatar  mr-n2 z-index-20"
										}
									/>
								))
								.slice(0, 2)}
					</div>
					<p className="ml-3 font-11 text-capitalize m-0 grey text-capitalize">
						{actionLog?.apps &&
							actionLog?.apps.length > 0 &&
							actionLog?.apps
								.map((res) => res.app_name)
								.slice(0, 2)
								.join(", ")}
						<span className="ml-1 font-11 text-capitalize text-lowercase">
							{actionLog?.apps &&
								actionLog?.apps.length > 0 &&
								actionLog?.apps.length > 2 &&
								` , + ${actionLog?.apps.length - 2} more apps`}
						</span>
						<span className="font-11 text-capitalize">
							{` |  Delete account from ${
								actionLog?.apps.length
							} ${
								actionLog?.group_state === "needs_review"
									? "uncategorized"
									: actionLog?.group_state
							} apps`}
						</span>
					</p>
				</>
			) : (
				<>
					<span>
						{actionLog?.app_logo ? (
							<img
								className="mr-1"
								src={actionLog?.app_logo}
								width={20}
								height={20}
							/>
						) : (
							<NameBadge
								className="mr-1"
								name={actionLog?.app_name || ""}
								height={20}
								width={20}
								borderRadius={"50%"}
							/>
						)}
						{/* <img src={actionLog?.app_logo} width={10} height={10} /> */}
					</span>
					<span
						style={{ marginRight: actionLog?.app_name ? 3 : 0 }}
						className="font-11"
					>
						{actionLog?.app_name}
						{actionLog?.app_name && ` | `}
					</span>
					<span className="font-11">{actionLog?.action_name}</span>
				</>
			)}
		</div>
	);
};
