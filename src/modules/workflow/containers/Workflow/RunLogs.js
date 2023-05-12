import React, { useContext, useEffect, useState } from "react";
import { RawRunLogs } from "./RawRunLog";
import ReminderModal from "./ReminderModal";
import { ReassignTaskModal } from "./ReassignTaskModal";
import { ManualTaskModal } from "./ManualTaskModal";
import RunLogHeader from "./RunLogHeader";
import {
	convertToManualTask,
	reassignManualTask,
	sendWorkflowActionReminder,
	retryAllFailedActionAPI,
	retryFailedActionAPI,
	runAbortedActionAPI,
	modifyScheduleAPI,
	scheduleNowAPI,
	cancelScheduleAPI,
	runNowApprovalAPI,
	cancelApprovalAPI,
	forceUpdateManualTaskAPI,
} from "../../service/api";
import { useLocation } from "react-router";
import UserWorkflowStatusCard from "../../components/UserWorkflowStatusCard/UserWorkflowStatusCard";
import info from "../../../../assets/icons/info-orange.svg";
import aborted from "../../../../assets/icons/aborted.svg";
import { TriggerIssue } from "../../../../utils/sentry";
import { useDispatch, useSelector } from "react-redux";
import { SummarisedRunLogs } from "./SummarisedRunLog";
import {
	clearWorkflowLogs,
	fetchListOfRuns,
	fetchRawRunLogs,
	fetchSummarisedRunLogs,
	getWorkFlow,
} from "../../redux/workflow";
import _ from "underscore";
import { getValueFromLocalStorage } from "../../../../utils/localStorage";
import dayjs from "dayjs";
import RetryWorkflow from "./RetryWorkflow";
import ModifyScheduleModal from "./ModifyScheduleModal";

const RunLogs = () => {
	const [headerData, setHeaderData] = useState({});
	const summarisedDataStore = useSelector(
		(state) => state.workflows.summarisedRunLogs
	);
	const [showError, setShowError] = useState(false);
	const rawDataLogsStore = useSelector((state) => state.workflows.rawRunLogs);
	const [isDataLoaded, setisDataLoaded] = useState(false);
	const [isWorkflowCompleted, setIsWorkflowCompleted] = useState(false);
	const [showRawLogs, setShowRawLogs] = useState(false);
	const [refreshLogs, setRefreshLogs] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showReminderModal, setShowReminderModal] = useState(false);
	const [showReassignTaskModal, setShowReassignTaskModal] = useState(false);
	const [showManualTaskModal, setShowManualTaskModal] = useState(false);
	const [showAllLogs, setShowAllLogs] = useState(true);
	const [showCompleted, setShowCompleted] = useState(true);
	const [showPending, setShowPending] = useState(true);
	const [showFailed, setShowFailed] = useState(true);
	const [showFailedButton, setShowFailedButton] = useState(false);
	const [
		showRetryAllFailedButtonLoading,
		setShowRetryAllFailedButtonLoading,
	] = useState(false);
	const [showRetryFailedButtonLoading, setShowRetryFailedButtonLoading] =
		useState(false);
	const [retryFailedObject, setRetryFailedObject] = useState(null);
	const [retryError, setRetryError] = useState(null);

	const [forceCompleteLoading, setForceCompleteLoading] = useState(false);
	const [forceCancelLoading, setForceCancelLoading] = useState(false);
	const [
		forceCancelAllPendingTaskLoading,
		setForceCancelAllPendingTaskLoading,
	] = useState(false);
	const [selectedData, setSelectedData] = useState(null);

	const [runActionData, setRunActionData] = useState([]);
	const [groupState, setGroupState] = useState(null);
	const [appId, setAppId] = useState(null);
	const location = useLocation();
	const workflowId = location.pathname.split("/")[2];
	const dispatch = useDispatch();
	const workflow = useSelector((state) => state.workflows.workflow);

	const runId = location.pathname.split("/")[4];
	const [workflowError, setWorkflowError] = useState(false);

	const [showModifyScheduleModal, setShowModifyScheduleModal] =
		useState(false);

	const { data: listOfRuns, meta } = useSelector(
		(state) => state.workflows.listOfRuns
	);

	function handleShowAllLogs(boolValue) {
		setShowAllLogs(boolValue); //to maintain the UI state
		setShowCompleted(boolValue);
		setShowFailed(boolValue);
		setShowPending(boolValue);
	}

	async function fetchSummarisedData(isRefresh, isManualRefresh = true) {
		!isRefresh && setIsLoading(true);
		const run = runId || listOfRuns?.[0]?._id || null;
		dispatch(
			fetchSummarisedRunLogs(
				workflowId,
				run,
				isRefresh,
				workflow.type,
				setShowError,
				isManualRefresh
			)
		)
			.then(() => {
				setIsLoading(false);
				isManualRefresh && setRefreshLogs(false);
				if (isRefresh) {
					dispatch(fetchListOfRuns(workflowId, workflow.type));
					fetchRawData(isRefresh, isManualRefresh);
				}
			})
			.catch((error) => {
				setIsLoading(false);
				isManualRefresh && setRefreshLogs(false);
				TriggerIssue("Error in fetching summarised logs", error);
			});
	}

	async function fetchRawData(isRefresh, isManualRefresh = true) {
		!isRefresh && setIsLoading(true);
		dispatch(
			fetchRawRunLogs(
				workflowId,
				runId || listOfRuns?.[0]?._id,
				isRefresh,
				workflow.type,
				setShowError,
				isManualRefresh
			)
		)
			.then(() => {
				setIsLoading(false);
				isManualRefresh && setRefreshLogs(false);
			})
			.catch((error) => {
				setIsLoading(false);
				isManualRefresh && setRefreshLogs(false);
				TriggerIssue("Error in fetching raw run logs", error);
			});
	}

	function handleRefresh(refreshData = true, isManualRefresh = true) {
		if (isLoading) return;
		setIsLoading(true);
		isManualRefresh && setRefreshLogs(true);
		isManualRefresh && setShowError(false);
		fetchSummarisedData(refreshData, isManualRefresh);
		setIsLoading(false);
	}

	function handleRunAction(actionData, runType, groupState, appId) {
		let a =
			runType === "sendReminder"
				? setShowReminderModal(true)
				: runType === "reassignTask"
				? setShowReassignTaskModal(true)
				: runType === "convertToManual"
				? setShowManualTaskModal(true)
				: runType === "ModifySchedule"
				? setShowModifyScheduleModal(true)
				: null;
		setRunActionData(actionData);
		setGroupState(groupState);
		setAppId(appId);
		setIsModalOpen(true);
	}

	useEffect(() => {
		if (
			!_.isEmpty(workflow) &&
			workflow.isExecuted &&
			runId &&
			!isLoading
		) {
			fetchSummarisedData();
		}
		return () => {
			clearLogs();
			setShowRawLogs(false);
			setisDataLoaded(false);
			setHeaderData();
			setShowError(false);
		};
	}, [workflow, runId]);

	useEffect(() => {
		if (!_.isEmpty(workflow)) {
			!runId &&
				!isLoading &&
				listOfRuns &&
				listOfRuns.length > 0 &&
				!refreshLogs &&
				_.isEmpty(summarisedDataStore) &&
				fetchSummarisedData();
		}
	}, [runId, workflow, listOfRuns]);

	useEffect(() => {
		if (
			Object.keys(summarisedDataStore).length ||
			Object.keys(rawDataLogsStore).length
		) {
			let header = summarisedDataStore || rawDataLogsStore;
			header.workflow_status === "completed"
				? setIsWorkflowCompleted(true)
				: setIsWorkflowCompleted(false);
			setisDataLoaded(true);
			setHeaderData(header);
			setRefreshLogs(false);
			setWorkflowError(header?.workflow_error ? true : false);

			const failedLogs = header?.run_log?.filter((log) =>
				log.action
					? log.action.action_status === "failed"
					: log.action_status === "failed"
			);
			if (failedLogs && failedLogs.length) {
				setShowFailedButton(true);
			}
		}
		if (
			!runId &&
			_.isEmpty(summarisedDataStore) &&
			listOfRuns &&
			listOfRuns.length > 0
		) {
			fetchSummarisedData();
		}
	}, [summarisedDataStore, rawDataLogsStore]);

	useEffect(() => {
		if (Object.keys(workflow).length) {
			showRawLogs &&
				!isLoading &&
				_.isEmpty(rawDataLogsStore) &&
				fetchRawData();
		}
	}, [showRawLogs, workflow]);

	async function handleActionTask(actionType = "manual", reqObj) {
		if (reqObj && actionType === "reassign") {
			const action_data = reqObj?.data?.map((item) => {
				return {
					k: item.k,
					v: {
						...item.v,
						...reqObj.action_data,
						assignee: item.v.assignee,
						message: item.v.message,
					},
				};
			});
			runActionData.action_data = action_data;
			runActionData.dueDateData = reqObj.dueDateData;
		} else if (reqObj && actionType === "manual") {
			runActionData.action_data = reqObj.data;
			runActionData.dueDateData = reqObj.dueDateData;
		} else if (reqObj && actionType === "ScheduleAction") {
			const scheduledData = {
				...runActionData?.scheduledData,
				...reqObj,
			};
			runActionData.scheduledData = scheduledData;
		} else if (actionType === "RunNow") {
			const data = {
				duration: "0 minutes",
				selectedUnit: {
					unit: "minutes",
				},
				time: "0",
				unit: "minutes",
			};
			const scheduledData = {
				...reqObj?.scheduledData,
				...data,
			};
			runActionData._id = reqObj?._id;
			runActionData.action_id = reqObj?.action_id;
			runActionData.scheduledData = scheduledData;
		} else if (actionType === "Cancel") {
			runActionData._id = reqObj?._id;
			runActionData.action_id = reqObj?.action_id;
			runActionData.scheduledData = reqObj?.scheduledData;
		} else if (actionType === "RunNowApproval") {
			runActionData._id = reqObj?._id;
			runActionData.action_id = reqObj?.action_id;
		} else if (actionType === "CancelApproval") {
			runActionData._id = reqObj?._id;
			runActionData.action_id = reqObj?.action_id;
		}
		let api = {
			manual: convertToManualTask,
			reassign: reassignManualTask,
			reminder: sendWorkflowActionReminder,
			ScheduleAction: modifyScheduleAPI,
			RunNow: scheduleNowAPI,
			Cancel: cancelScheduleAPI,
			RunNowApproval: runNowApprovalAPI,
			CancelApproval: cancelApprovalAPI,
		};
		setShowManualTaskModal(false);
		setShowReassignTaskModal(false);
		setShowReminderModal(false);
		setShowModifyScheduleModal(false);
		const user = getValueFromLocalStorage("userInfo");
		let otherData = {
			runId: runId || listOfRuns?.[0]?._id,
		};
		if (groupState) {
			otherData.group_state = groupState;
		} else {
			delete otherData.group_state;
		}
		if (appId) {
			otherData.app_id = appId;
		} else {
			delete otherData.app_id;
		}
		try {
			let data = await api[actionType](
				workflowId,
				runActionData._id || runActionData.action_id, //actionId
				runActionData, //actionData
				otherData
			);
			handleRefresh(true);
			setIsModalOpen(false);
		} catch (error) {
			handleRefresh(false);
			setIsModalOpen(false);
		}
	}

	function clearLogs() {
		setIsLoading(true);
		dispatch(clearWorkflowLogs()).then(() => {
			setIsLoading(false);
		});
	}

	useEffect(() => {
		let timeInSeconds = 3;
		let timeCounter = 4;
		let timer;

		if (isWorkflowCompleted) {
			return;
		}

		async function init() {
			function fibonacci(num) {
				if (num < 2) {
					return num;
				} else {
					return fibonacci(num - 1) + fibonacci(num - 2);
				}
			}
			await new Promise(
				(resolve) => (timer = setTimeout(resolve, timeInSeconds * 1000))
			);
			timeInSeconds = fibonacci(timeCounter + 1);
			isDataLoaded && !isModalOpen && handleRefresh(true, false);
			timeCounter++;
			init();
		}
		init();

		return () => {
			clearTimeout(timer);
		};
	}, [isWorkflowCompleted, runId, isDataLoaded, isModalOpen]);

	const retryAllFailedAction = () => {
		const workflowExecutionId = runId || listOfRuns?.[0]?._id;
		if (workflowExecutionId) {
			setShowRetryAllFailedButtonLoading(true);
			retryAllFailedActionAPI({ workflowExecutionId })
				.then((res) => {
					setIsLoading(true);
					setTimeout(function () {
						handleRefresh(true, false);
						setShowRetryAllFailedButtonLoading(false);
					}, 3000);
					if (!res.success) {
						setShowRetryAllFailedButtonLoading(false);
						setRetryError(res);
					}
				})
				.catch((error) => {
					setIsLoading(true);
					setShowRetryAllFailedButtonLoading(false);
					setRetryError(error);
					TriggerIssue("Error in Retry All failed Action", error);
				});
		}
	};

	const retryFailedAction = (data, key) => {
		setRetryFailedObject(data);
		const workflowExecutionId = runId || listOfRuns?.[0]?._id;
		const actionId = data._id;
		if (workflowExecutionId && actionId) {
			setShowRetryFailedButtonLoading(true);
			if (key === "run") {
				runAbortedActionAPI({ workflowExecutionId, actionId })
					.then((res) => {
						setIsLoading(true);
						setTimeout(function () {
							handleRefresh(true, false);
							setShowRetryFailedButtonLoading(false);
						}, 3000);
						if (!res.success) {
							setShowRetryFailedButtonLoading(false);
							setRetryError(res);
							setRetryFailedObject(null);
						}
					})
					.catch((error) => {
						setShowRetryFailedButtonLoading(false);
						setRetryError(error);
						setRetryFailedObject(null);
						setIsLoading(false);
						TriggerIssue("Error in Run Aborted Action", error);
					});
			} else {
				retryFailedActionAPI({ workflowExecutionId, actionId })
					.then((res) => {
						setIsLoading(true);
						setTimeout(function () {
							handleRefresh(true, false);
							setShowRetryFailedButtonLoading(false);
							setRetryFailedObject(null);
						}, 3000);
						if (!res.success) {
							setShowRetryFailedButtonLoading(false);
							setRetryFailedObject(null);
							setRetryError(res);
						}
					})
					.catch((error) => {
						setShowRetryFailedButtonLoading(false);
						setRetryFailedObject(null);
						setRetryError(error);
						setIsLoading(false);
						TriggerIssue("Error in Retry Failed Action", error);
					});
			}
		}
	};

	const forceUpdateManualTask = (node, key) => {
		const id_array = [];
		const zluri_actions_id_array = [];
		if (key === "cancelAllTask") {
			node?.run_log?.map((log) => {
				if (log?.group_state) {
					log?.apps?.map((app, index) =>
						id_array.push({
							workflow_action_id: log?.action?._id || log?._id,
							app_id: app?.app_id,
						})
					);
				}
				if (log?.app_id) {
					id_array.push({
						workflow_action_id: log?.action?._id || log?._id,
						app_id: log?.app_id,
					});
				} else if (log?.app_name === "Zluri Actions") {
					zluri_actions_id_array.push({
						workflow_action_id: log?.action?._id || log?._id,
						workflow_application_id: log?.node_id,
					});
				}
			});
		} else {
			if (node?.group_state) {
				node?.apps?.map((app, index) =>
					id_array.push({
						workflow_action_id: node?.action?._id || node?._id,
						app_id: app?.app_id,
					})
				);
			}
			if (node?.app_id) {
				id_array.push({
					workflow_action_id: node?.action?._id || node?._id,
					app_id: node?.app_id,
				});
			} else if (node?.app_name === "Zluri Actions") {
				zluri_actions_id_array.push({
					workflow_action_id: node?.action?._id || node?._id,
					workflow_application_id: node?.node_id,
				});
			}
		}
		const reqObj = { id_array, zluri_actions_id_array };
		setSelectedData(node);
		if (key === "completed") {
			setForceCompleteLoading(true);
		} else if (key === "cancelAllTask") {
			setForceCancelAllPendingTaskLoading(true);
		} else {
			setForceCancelLoading(true);
		}
		forceUpdateManualTaskAPI(
			headerData?.workflow_id,
			headerData?.run_for_user_id,
			headerData?.workflow_type,
			key === "cancelAllTask" ? "cancelled" : key,
			reqObj
		)
			.then((res) => {
				setForceCancelLoading(false);
				setForceCompleteLoading(false);
				setForceCancelAllPendingTaskLoading(false);
				handleRefresh();
			})
			.catch((err) => {
				setForceCancelLoading(false);
				setForceCompleteLoading(false);
				setForceCancelAllPendingTaskLoading(false);
				handleRefresh();
				TriggerIssue("Error in force update", err);
			});
	};

	return (
		<div className="p-2">
			{!_.isEmpty(headerData) && (
				<RunLogHeader
					handleRefresh={handleRefresh}
					runLogData={headerData}
					showRawLogs={showRawLogs}
				/>
			)}
			{!isLoading && workflowError && (
				<RetryWorkflow handleRefresh={retryAllFailedAction} />
			)}
			{showError && !isLoading && (
				<div
					style={{
						justifyContent: "space-between",
						backgroundColor: "#FFF7F0",
						padding: "10px",
					}}
					className="d-flex mb-3 "
				>
					<div className="font-14">
						<span className="mr-2">
							<img src={info} />
						</span>
						We could not refresh your log data. Please try again.
					</div>
					<div
						className="primary-color font-14 bold-600 cursor-pointer"
						onClick={(e) => !isLoading && handleRefresh(true, true)}
					>
						Refresh Log
					</div>
				</div>
			)}
			{isDataLoaded && !refreshLogs && !isLoading ? (
				<>
					{showRawLogs ? (
						<RawRunLogs
							rawDataLogs={rawDataLogsStore}
							workflowId={workflowId}
							workflowRunId={runId}
							showRawLogs={showRawLogs}
							setShowRawLogs={setShowRawLogs}
							setShowReminderModal={setShowReminderModal}
							setShowReassignTaskModal={setShowReassignTaskModal}
							setShowManualTaskModal={setShowManualTaskModal}
							handleRunAction={handleRunAction}
							showCompleted={showCompleted}
							setShowCompleted={setShowCompleted}
							showPending={showPending}
							setShowPending={setShowPending}
							showFailed={showFailed}
							setShowFailed={setShowFailed}
							showAllLogs={showAllLogs}
							handleShowAllLogs={handleShowAllLogs}
							retryAllFailedAction={retryAllFailedAction}
							retryFailedAction={retryFailedAction}
							showFailedButton={showFailedButton}
							showRetryAllFailedButtonLoading={
								showRetryAllFailedButtonLoading
							}
							showRetryFailedButtonLoading={
								showRetryFailedButtonLoading
							}
							retryFailedObject={retryFailedObject}
							handleActionTask={handleActionTask}
							forceUpdateManualTask={forceUpdateManualTask}
							forceCompleteLoading={forceCompleteLoading}
							forceCancelLoading={forceCancelLoading}
							selectedData={selectedData}
							forceCancelAllPendingTaskLoading={
								forceCancelAllPendingTaskLoading
							}
						/>
					) : (
						<SummarisedRunLogs
							summarisedData={summarisedDataStore}
							workflowId={runId || workflowId}
							setShowRawLogs={setShowRawLogs}
							showRawLogs={showRawLogs}
							setShowReminderModal={setShowReminderModal}
							setShowReassignTaskModal={setShowReassignTaskModal}
							setShowManualTaskModal={setShowManualTaskModal}
							handleRunAction={handleRunAction}
							retryAllFailedAction={retryAllFailedAction}
							retryFailedAction={retryFailedAction}
							showFailedButton={showFailedButton}
							showRetryAllFailedButtonLoading={
								showRetryAllFailedButtonLoading
							}
							showRetryFailedButtonLoading={
								showRetryFailedButtonLoading
							}
							retryFailedObject={retryFailedObject}
							handleActionTask={handleActionTask}
							forceUpdateManualTask={forceUpdateManualTask}
							forceCompleteLoading={forceCompleteLoading}
							forceCancelLoading={forceCancelLoading}
							selectedData={selectedData}
							forceCancelAllPendingTaskLoading={
								forceCancelAllPendingTaskLoading
							}
						/>
					)}
					<ReminderModal
						show={showReminderModal}
						runActionData={runActionData}
						handleActionTask={handleActionTask}
						onHide={() => {
							setShowReminderModal(false);
							setIsModalOpen(false);
						}}
					/>
					<ReassignTaskModal
						show={showReassignTaskModal}
						runActionData={runActionData}
						handleActionTask={handleActionTask}
						onHide={() => {
							setShowReassignTaskModal(false);
							setIsModalOpen(false);
						}}
					/>
					<ManualTaskModal
						show={showManualTaskModal}
						runActionData={runActionData}
						handleActionTask={handleActionTask}
						onHide={() => {
							setShowManualTaskModal(false);
							setIsModalOpen(false);
						}}
					/>
					<ModifyScheduleModal
						show={showModifyScheduleModal}
						runActionData={runActionData}
						handleActionTask={handleActionTask}
						onHide={() => {
							setShowModifyScheduleModal(false);
							setIsModalOpen(false);
						}}
					/>
				</>
			) : (
				<div>
					<UserWorkflowStatusCard
						loading={true}
						number_of_loaders={5}
						hideFewBars={true}
					/>
				</div>
			)}
		</div>
	);
};

export { RunLogs };

export function generateCsvDataLogs(logData, isRawLog = false) {
	function requiredFormat(action) {
		return {
			"App Name": action.app_name,
			"Action Type": action.action_type || action.action?.action_type,
			"Action Name":
				isRawLog && action.action_type === "manual"
					? action.action_log?.title
					: action.action_name || action.action?.action_name,
			"Action Description":
				isRawLog && action.action_type === "manual"
					? action.action_log?.description
					: action.action_description ||
					  action.action?.action_description,
			"Action Status":
				action.action_status || action.action?.action_status,
			Timestamp:
				dayjs(
					action.action_log?.timestamp ||
						action.action?.action_log?.timestamp
				).format("D MMM, HH:mm:ss ") || "NA",
		};
	}

	let csvData = logData?.map(requiredFormat);
	return csvData;
}
