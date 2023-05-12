import React, { useContext, useEffect, useState } from "react";
import {
	Accordion,
	Card,
	OverlayTrigger,
	Tooltip,
	Spinner,
} from "react-bootstrap";
import { useAccordionToggle } from "react-bootstrap/AccordionToggle";
import collapsedICon from "assets/collapsed_icon_log.svg";
import downArrowIcon from "assets/arrowdropdown.svg";
import info from "assets/applications/info.svg";
import CsvDownload from "react-json-to-csv";
import { NameBadge } from "../../../../../common/NameBadge";
import GetImageOrNameBadge from "../../../../../common/GetImageOrNameBadge";
import UserWorkflowStatusCard from "../../../../workflow/components/UserWorkflowStatusCard/UserWorkflowStatusCard";
import _ from "underscore";
import { generateCsvDataLogs } from "./RunLogs";
import SummarisedRunLogTabs from "modules/workflow/containers/Workflow/SummarisedRunLogTabs";
import { actionStatus } from "./actionStatus";
import { ActionPendingCard } from "./actionCards/actionPendingCard";

const SummarisedRunLogs = ({
	setShowRawLogs,
	showRawLogs,
	summarisedData,
	handleRunAction,
	retryAllFailedAction,
	retryFailedAction,
	showFailedButton,
	showRetryAllFailedButtonLoading,
	showRetryFailedButtonLoading,
	retryFailedObject,
	handleActionTask,
}) => {
	const getFirstAbortedElement = () => {
		const index =
			summarisedData?.run_log?.length &&
			summarisedData?.run_log?.findIndex(
				(item, idx) => item.action.action_status === "aborted"
			);
		return index;
	};

	return (
		<div>
			{!_.isEmpty(summarisedData) ? (
				<div
					style={{
						border: "none!important",
						lineHeight: "18px",
						fontSize: "14px",
						marginBottom: "20px",
						width: "90%",
					}}
					className="d-flex flex-column justify-content-end align-items-end"
				>
					<div
						style={{
							padding: "20px",
						}}
						className="flex"
					>
						<div className="flex" style={{}}>
							{showFailedButton &&
								summarisedData?.validRetryAttempt && (
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
														retryAllFailedAction(
															summarisedData
														);
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
								onClick={() => setShowRawLogs(!showRawLogs)}
								className="mr-4 primary-color font-13 cursor-pointer"
							>
								View Raw Log
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
											background: "#FAFBFF",
											border: "none",
										}}
										data={generateCsvDataLogs(
											summarisedData?.run_log
										)}
										className="primary-color"
									>
										Export
									</CsvDownload>
								</OverlayTrigger>
							</div>
						</div>
					</div>
					<div
						style={{
							border: "1px solid #EBEBEB",
							width: "90%",
							overflowY: "auto",
							height: "75vh",
						}}
					>
						{summarisedData?.run_log &&
						summarisedData?.run_log?.length === 0 &&
						summarisedData?.workflow_status === "completed" ? (
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
									None of the workflow actions were applicable
									to this user
								</div>
							</div>
						) : (
							summarisedData?.run_log?.map(
								(node, parentIndex) => (
									<div key={node.node_id + parentIndex}>
										{getFirstAbortedElement() ===
											parentIndex && (
											<div
												style={{
													justifyContent: "center",
												}}
												className="d-flex px-5 py-2"
											>
												<div
													className="d-flex flex-row p-2 px-3"
													style={{
														backgroundColor:
															"#F8F9FB",
														justifyContent:
															"center",
														borderRadius: "30px",
														alignItems: "center",
													}}
												>
													<span
														className="font-12 bold-600"
														style={{
															color: "#FF6767",
															marginRight: "5px",
														}}
													>
														Break on Error :
													</span>
													<span
														className="font-12 bold-400 mr-1"
														style={{
															color: "#717171",
														}}
													>
														Rest of the actions
														cancelled
													</span>
													<span
														onClick={() => {
															if (
																!retryFailedObject
															) {
																retryAllFailedAction(
																	summarisedData
																);
															}
														}}
														className="font-12 bold-400 ml-2"
														style={{
															color: "#2266E2",
															cursor: "pointer",
														}}
													>
														Run remaining tasks
													</span>
												</div>
											</div>
										)}
										<Accordion
											key={parentIndex + 1}
											defaultActiveKey={parentIndex + 1}
										>
											<Card
												style={{
													border: "none",
													lineHeight: "18px",
													fontSize: "14px",
												}}
											>
												<div className="px-5 py-2">
													<Card.Header
														className="d-flex flex-row"
														style={{
															backgroundColor:
																"#fff",
															border: "none",
															marginLeft:
																node?.group_state
																	? "10px"
																	: "0px",
														}}
													>
														{node.group_state ? (
															<>
																<div
																	style={{
																		backgroundColor:
																			"rgba(235, 235, 235, 0.5)",
																		borderRadius:
																			"30px",
																		width: "max-content",
																	}}
																	className="d-flex px-2 py-1"
																>
																	<div className="position-relative d-flex">
																		{node?.apps &&
																			node
																				?.apps
																				.length >
																				0 &&
																			node.apps
																				.map(
																					(
																						app,
																						index
																					) => (
																						<GetImageOrNameBadge
																							key={
																								index
																							}
																							name={
																								app.app_name
																							}
																							url={
																								app.app_logo
																							}
																							width={
																								20
																							}
																							height={
																								20
																							}
																							imageClassName={
																								index ===
																								0
																									? " mr-n2 z-index-20  img-circle white-bg"
																									: "border-radius-4 object-contain avatar"
																							}
																							nameClassName={
																								index ===
																								0
																									? " mr-n2 z-index-20  img-circle white-bg"
																									: "img-circle avatar  mr-n2 z-index-20"
																							}
																						/>
																					)
																				)
																				.slice(
																					0,
																					2
																				)}
																	</div>
																	<p className="ml-3 font-13 text-capitalize m-0 grey text-capitalize">
																		{node?.apps &&
																			node
																				?.apps
																				.length >
																				0 &&
																			node?.apps
																				.map(
																					(
																						res
																					) =>
																						res.app_name
																				)
																				.slice(
																					0,
																					2
																				)
																				.join(
																					", "
																				)}
																		<span className="ml-1 font-13 text-capitalize text-lowercase">
																			{node?.apps &&
																				node
																					?.apps
																					.length >
																					0 &&
																				node
																					?.apps
																					.length >
																					2 &&
																				` , + ${
																					node
																						?.apps
																						.length -
																					2
																				} more apps`}
																		</span>
																	</p>
																</div>
															</>
														) : (
															<div
																style={{
																	backgroundColor:
																		"rgba(235, 235, 235, 0.5)",
																	borderRadius:
																		"30px",
																	width: "max-content",
																}}
																className="d-flex px-2 py-1 ml-3"
															>
																<span>
																	{node.app_logo ? (
																		<img
																			alt=""
																			src={
																				node.app_logo
																			}
																			width={
																				20
																			}
																			height={
																				20
																			}
																		/>
																	) : (
																		<NameBadge
																			name={
																				node.app_name ||
																				""
																			}
																			height={
																				20
																			}
																			width={
																				20
																			}
																			borderRadius={
																				"50%"
																			}
																		/>
																	)}
																</span>
																<span className="ml-1 font-13 text-capitalize">
																	{
																		node.app_name
																	}
																</span>
															</div>
														)}
													</Card.Header>

													<div
														style={{
															justifyContent:
																"space-between",
															backgroundColor:
																"#fff",
														}}
														className="flex"
													>
														<div>
															<span
																className="font-17 bold-500 px-2 py-1"
																style={{
																	backgroundColor:
																		"grey",
																	color: "#fff",
																	borderRadius:
																		"20%",
																}}
															>
																{parentIndex +
																	1}
															</span>
															<span className="font-18 bold-600 ml-3 text-capitalize">
																{node.group_state &&
																node.apps
																	?.length > 0
																	? `${
																			node
																				.action
																				.action_name ||
																			"Action name"
																	  } from ${
																			node
																				.apps
																				?.length
																	  } ${
																			node.group_state ===
																			"needs_review"
																				? "uncategorized"
																				: node.group_state
																	  } apps `
																	: node
																			.action
																			.action_name ||
																	  "Action name"}
															</span>
															{node.action
																.action_type ===
																"manual" && (
																<span
																	style={{
																		backgroundColor:
																			"#5ABAFF",
																	}}
																	className="position-relative font-10 p-1 primary-color-bg white bold-700 ml-2 mb-1"
																>
																	TASK
																</span>
															)}
															{Array.isArray(
																node.action
																	.action_log
															) &&
																node.action
																	.action_log
																	.length >
																	0 && (
																	<ContextAwareToggle
																		eventKey={
																			parentIndex +
																			1
																		}
																	></ContextAwareToggle>
																)}
														</div>
														<div>
															{actionStatus(
																node.action
																	.action_status
															)}
														</div>
													</div>
													<div className="font-13  ml-4 px-3 py-2">
														{node.action
															.action_description ||
															"Action description"}
													</div>

													{node.action
														.isScheduledAction &&
														node.action
															.action_status ===
															"scheduled" && (
															<div className="ml-4 px-3 pb-2">
																<span
																	onClick={(
																		e
																	) => {
																		e.stopPropagation();
																		handleActionTask(
																			"RunNow",
																			node?.action
																		);
																	}}
																	className="mr-4 primary-color font-12 cursor-pointer"
																>
																	Run now
																</span>
																<span
																	onClick={() => {
																		handleRunAction(
																			node?.action,
																			"ModifySchedule"
																		);
																	}}
																	className="mr-4 primary-color font-12 cursor-pointer"
																>
																	Modify
																	Schedule
																</span>
																<span
																	onClick={() => {
																		handleActionTask(
																			"Cancel",
																			node?.action
																		);
																	}}
																	className="mr-4 primary-color font-12 cursor-pointer"
																>
																	Cancel
																</span>
															</div>
														)}

													{node.action
														.isSetForApproval &&
														node.action
															.action_status ===
															"set_for_approval" && (
															<div className="ml-4 px-3 pb-2">
																<span
																	onClick={(
																		e
																	) => {
																		e.stopPropagation();
																		handleActionTask(
																			"RunNowApproval",
																			node?.action
																		);
																	}}
																	className="mr-4 primary-color font-12 cursor-pointer"
																>
																	Run now
																</span>
																<span
																	onClick={() => {
																		handleActionTask(
																			"CancelApproval",
																			node?.action
																		);
																	}}
																	className="mr-4 primary-color font-12 cursor-pointer"
																>
																	Cancel
																</span>
															</div>
														)}

													{node.action
														.action_status !==
														"aborted" &&
														node.action
															.action_type ===
															"manual" &&
														node.action
															.action_status !==
															"scheduled" &&
														node.action
															.action_status !==
															"set_for_approval" &&
														node.action
															.action_status !==
															"rejected" &&
														node.action
															.action_status !==
															"completed" && (
															<div className="ml-4 px-3 pb-2">
																<span
																	onClick={() => {
																		let groupState;
																		if (
																			node?.group_state
																		) {
																			groupState =
																				node?.group_state;
																		} else {
																			groupState =
																				null;
																		}
																		handleRunAction(
																			node.action,
																			"sendReminder",
																			groupState
																		);
																	}}
																	className="mr-4 primary-color font-12 cursor-pointer"
																>
																	Send
																	Reminder
																</span>
																<span
																	onClick={() =>
																		handleRunAction(
																			node.action,
																			"reassignTask"
																		)
																	}
																	className="mr-4 primary-color font-12 cursor-pointer"
																>
																	Reassign
																</span>
															</div>
														)}

													{node.action
														.action_status ===
														"failed" &&
														node.action
															.action_type !==
															"manual" && (
															<div className="ml-4 px-3 pb-2">
																{node?.action
																	?.validRetryAttempt && (
																	<>
																		{showRetryFailedButtonLoading &&
																		retryFailedObject._id ===
																			node
																				.action
																				._id ? (
																			<Spinner
																				className="mr-4 blue-spinner action-edit-spinner"
																				animation="border"
																			/>
																		) : (
																			<span
																				onClick={() =>
																					retryFailedAction(
																						node.action
																					)
																				}
																				className="mr-4 primary-color font-13 cursor-pointer"
																			>
																				{`Retry ${
																					node
																						.action
																						.action_type ===
																					"manual"
																						? "Task"
																						: "Action"
																				}`}
																			</span>
																		)}
																	</>
																)}
																{node.action
																	.action_type !==
																	"manual" && (
																	<span
																		onClick={() =>
																			handleRunAction(
																				node.action,
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

													{node.action
														.action_status ===
														"aborted" && (
														<div className="ml-4 px-3 pb-2">
															{/* {node?.action
														?.validRetryAttempt && (
														<> */}
															{showRetryFailedButtonLoading &&
															retryFailedObject._id ===
																node.action
																	._id ? (
																<Spinner
																	className="mr-4 blue-spinner action-edit-spinner"
																	animation="border"
																/>
															) : (
																<span
																	onClick={() =>
																		retryFailedAction(
																			node.action,
																			"run"
																		)
																	}
																	className="mr-4 primary-color font-13 cursor-pointer"
																>
																	{`Run ${
																		node
																			.action
																			.action_type ===
																		"manual"
																			? "Task"
																			: "Action"
																	}`}
																</span>
															)}
															{/* </>
													)} */}
															{node.action
																.action_type !==
																"manual" && (
																<span
																	onClick={() =>
																		handleRunAction(
																			node.action,
																			"convertToManual"
																		)
																	}
																	className="mr-4 primary-color font-13 cursor-pointer"
																>
																	Convert to
																	Manual Task
																</span>
															)}
														</div>
													)}

													{node.action
														.action_status ===
														"pending" &&
													Array.isArray(
														node.action.action_log
													) &&
													!node.action.action_log
														.length ? (
														<ActionPendingCard
															className="ml-4"
															title={
																node.action
																	.title
															}
															description={
																node.action
																	.description
															}
															logData={
																node.action
															}
															handleRunAction={
																handleRunAction
															}
														/>
													) : (
														""
													)}

													{Array.isArray(
														node.action.action_log
													) &&
														node.action.action_log
															.length > 0 && (
															<Accordion.Collapse
																eventKey={
																	parentIndex +
																	1
																}
															>
																<SummarisedRunLogTabs
																	node={node}
																	handleRunAction={
																		handleRunAction
																	}
																	retryFailedAction={
																		retryFailedAction
																	}
																	showRetryFailedButtonLoading={
																		showRetryFailedButtonLoading
																	}
																	retryFailedObject={
																		retryFailedObject
																	}
																/>
															</Accordion.Collapse>
														)}
													<div className="mb-4"></div>
												</div>
											</Card>
										</Accordion>
									</div>
								)
							)
						)}
					</div>
				</div>
			) : (
				<UserWorkflowStatusCard
					loading={true}
					number_of_loaders={5}
					hideFewBars={true}
				/>
			)}
		</div>
	);
};

function ContextAwareToggle({ children, eventKey, callback }) {
	const [toggleState, setToggleState] = useState(false);

	const decoratedOnClick = useAccordionToggle(eventKey, () => {
		setToggleState(!toggleState);
		callback && callback(eventKey);
	});

	return (
		<span className="pl-1">
			<img
				alt=""
				onClick={decoratedOnClick}
				src={toggleState ? collapsedICon : downArrowIcon}
				width="10px"
				className="ml-2"
			/>
		</span>
	);
}

export { SummarisedRunLogs };
