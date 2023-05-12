import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import close from "../../../../assets/close.svg";
import ActionStatusBar from "../../components/ActionStatusBar/ActionStatusBar";
import { NameBadge } from "../../../../common/NameBadge";
import refresh_icon from "../../../../assets/new-refresh-icon.svg";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Button } from "../../../../UIComponents/Button/Button";
import UserWorkflowStatusCard from "../../components/UserWorkflowStatusCard/UserWorkflowStatusCard";
import { getSummarisedRunLogData } from "../../service/api";
import { TriggerIssue } from "../../../../utils/sentry";
import { useSelector } from "react-redux";
import _ from "underscore";
import { ProgressBarLoader } from "../../../../common/Loader/ProgressBarLoader";

export default function RunLogModal({
	showModal,
	setShowModal,
	runLogExecutionResponse,
}) {
	const [selectedUserId, setSelectedUserId] = useState(
		runLogExecutionResponse?.[0]?._id
	);
	const { data: listOfRuns, meta } = useSelector(
		(state) => state.workflows.listOfRuns
	);

	const [runsData, setRunsData] = useState(runLogExecutionResponse);
	const [errorData, setErrorData] = useState();
	const [isLoading, setIsLoading] = useState(false);
	const history = useHistory();
	const location = useLocation();
	const isWorkflowExecuted =
		runsData && Array.isArray(runsData) && runsData.length;
	const workflow = useSelector((state) => state.workflows.workflow);

	const workflowId = location.pathname.split("/")[2] || workflow?.id;

	useEffect(() => {
		setRunsData(runLogExecutionResponse);
	}, [runLogExecutionResponse]);

	useEffect(() => {
		!_.isEmpty(listOfRuns) && setRunsData(listOfRuns);
	}, [listOfRuns]);

	async function fetchRunLogs(isRefresh, workflowId, runId) {
		setIsLoading(true);
		try {
			let data = await getSummarisedRunLogData(
				workflowId,
				runId,
				isRefresh,
				workflow?.type
			);

			let newRunData = runsData.map((run) => {
				if (data[0]._id === run._id) {
					run = data[0];
				}
				return run;
			});
			setRunsData(newRunData);
			if (data.error) {
				setErrorData(data.error);
			}
			setIsLoading(false);
		} catch (error) {
			setErrorData(error);
			TriggerIssue("Error in fetching summarised logs", error);
			setIsLoading(false);
		}
	}

	function handleRefresh(e, workflowId, runId) {
		e.preventDefault();
		fetchRunLogs(true, workflowId, runId, workflow.type);
	}

	const statusNameMap = {
		failed: "Failed",
		completed: "Completed",
		pending: "In Progress",
	};

	return (
		<>
			<Modal
				show={showModal}
				scrollable={true}
				style={{
					maxWidth: "50%!important",
					paddingTop: "2%",
				}}
				onHide={() => setShowModal(false)}
				className="custom-map-modal-lg"
			>
				<div
					className="text-align-center"
					style={{ backgroundColor: "rgba(235, 235, 235, 0.5)" }}
				>
					<div className="d-flex flex-row align-items-center pt-4">
						<div className="m-auto">
							<span className="contracts__heading d-flex flex-row">
								Running{" "}
								{workflow?.type === "onboarding"
									? "Onboarding"
									: "Offboarding"}{" "}
								Workflow..
							</span>
						</div>
						<img
							className="pr-4 cursor-pointer"
							alt="Close"
							onClick={() => setShowModal(false)}
							src={close}
						/>
					</div>

					<div
						className="text-align-center py-1 font-13"
						style={{ color: "grey" }}
					>
						{isWorkflowExecuted
							? `Showing ${runsData?.length} users`
							: ""}
					</div>
				</div>

				{isWorkflowExecuted ? (
					<>
						<Modal.Body className="border-bottom">
							<div className="d-flex flex-column align-items-center pb-5 px-3 mt-4">
								{isWorkflowExecuted &&
									runsData?.map((runLog, index) => (
										<div
											className={`${
												runLog._id === selectedUserId
													? "light-blue"
													: "light-grey-bg"
											} workflowStatusCard my-1`}
											style={{
												width: "80%",
												height: "auto",
											}}
											onClick={() =>
												setSelectedUserId(runLog._id)
											}
										>
											<div className="d-flex flex-row">
												{runLog?.user_logo ||
												runLog?.run_for_user_logo ? (
													<div className="mr-2">
														<img
															src={
																runLog.user_logo ||
																runLog.run_for_user_logo
															}
															width="10px"
														/>
													</div>
												) : (
													<NameBadge
														name={
															runLog?.user_name ||
															runLog.run_for_user_name
														}
														className="status_user_logo"
													/>
												)}
												<div className="font-16 bold-600 align-self-center">
													{runLog?.user_name ||
														runLog.run_for_user_name}
												</div>
												<div className="workflow_status">
													{runLog.status?.icon && (
														<img
															src={
																runLog.status
																	.icon
															}
															width={10}
														/>
													)}
													{runLog.status ===
														"completed" ||
													runLog.workflow_status ===
														"completed" ? (
														<Link
															to={`/workflow/${
																runLog.workflow_id ||
																workflowId
															}/runs/${
																runLog._id
															}`}
														>
															<div
																style={{
																	color: "#2266e2",
																}}
																onClick={() =>
																	setShowModal(
																		false
																	)
																}
																className="status_name font-13 cursor-pointer"
															>
																View detailed
																log
															</div>
														</Link>
													) : (
														<>
															<button
																className="mr-1"
																onClick={(e) =>
																	handleRefresh(
																		e,
																		runLog.workflow_id ||
																			workflowId,
																		runLog._id
																	)
																}
																style={{
																	width: "auto",
																	backgroundColor:
																		"transparent",
																	border: "none",
																}}
															>
																<img
																	className=" m-auto"
																	style={{
																		width: "15px",
																	}}
																	src={
																		refresh_icon
																	}
																/>
															</button>
															{runLog.status ===
																"pending" ||
																(runLog.workflow_status ===
																	"pending" && (
																	<ProgressBarLoader
																		height={
																			20
																		}
																		width={
																			20
																		}
																	/>
																))}
														</>
													)}
												</div>
											</div>
											<div
												style={{
													color: "rgba(113, 113, 113, 1)",
												}}
												className="font-11 grey mt-2 ml-4 font-13"
											>
												{
													statusNameMap[
														runLog.status ||
															runLog.workflow_status
													]
												}
											</div>

											{runLog.status !== "completed" && (
												<>
													<hr
														style={{
															marginTop: "10px",
															marginBottom: "5px",
														}}
													/>
													<ActionStatusBar
														runLog={runLog}
														showDetailedLogButton={
															true
														}
														workflowId={workflowId}
														setShowModal={
															setShowModal
														}
													/>
												</>
											)}
										</div>
									))}
							</div>
						</Modal.Body>
						<Modal.Footer>
							<div className="m-auto">
								<Link to={`/workflow/${workflowId}/runs`}>
									<Button
										className="z__button px-6 py-4 mb-4"
										onClick={() => setShowModal(false)}
									>
										View Detailed Log
									</Button>
								</Link>
							</div>
						</Modal.Footer>
					</>
				) : errorData ? (
					<div className="d-flex justify-content-center align-items-center flex-column mb-4">
						<div
							style={{
								fontSize: 26,
								fontWeight: 700,
								lineHeight: "32.76px",
								marginBottom: 23,
							}}
						>
							Something went wrong
						</div>
						<button
							onClick={() => setShowModal(false)}
							className="ov__button2"
							style={{ width: 230 }}
						>
							Try again
						</button>
					</div>
				) : (
					<div className="p-2">
						<UserWorkflowStatusCard
							loading={true}
							number_of_loaders={3}
						/>
					</div>
				)}
			</Modal>
		</>
	);
}
