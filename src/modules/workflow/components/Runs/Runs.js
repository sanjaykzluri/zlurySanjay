import React, { useState, useEffect } from "react";
import "../WorkflowSidebar/WorkflowSidebar.css";
import _ from "underscore";
import warningIcon from "../../../../assets/icons/delete-warning.svg";
import emptyRunsIcon from "../../../../assets/empty-runs.svg";
import warningBrowser from "../../../../assets/workflow/warningBrowser.png";
import refresh_icon from "../../../../assets/icons/refresh.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import UserWorkflowStatusCard from "../UserWorkflowStatusCard/UserWorkflowStatusCard";
import { useHistory, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
	clearWorkflow,
	clearWorkflowLogs,
	fetchListOfRuns,
	getWorkFlow,
} from "../../redux/workflow";
import { getValueFromLocalStorage } from "../../../../utils/localStorage";
import { refreshRunsAPI } from "../../service/api";

function Runs(props) {
	const { showBlockedRefreshModal, setShowBlockedRefreshModal } = props;
	const { data: listOfRuns, meta } = useSelector(
		(state) => state.workflows.listOfRuns
	);
	const workflow = useSelector((state) => state.workflows.workflow);

	const [selectedUser, setSelectedUser] = useState({});
	const [loading, setLoading] = useState(false);
	const [errorFetching, setErrorFetching] = useState(false);
	const history = useHistory();
	const location = useLocation();
	const workflowId = location.pathname.split("/")[2];
	const runPathname = location.pathname.split("/")[3];
	const runId = location.pathname.split("/")[4];
	const dispatch = useDispatch();
	const [isHardRefreshed, setIsHardRefreshed] = useState(false);

	useEffect(() => {
		if (workflow.isExecuted && listOfRuns?.length > 0) {
			const status = listOfRuns.filter((run) => {
				if (run.workflow_status === "pending") run.workflow_status;
			});
			if (status.length > 0) {
				var timer = setInterval(
					() =>
						dispatch(
							fetchListOfRuns(
								workflowId,
								workflow.type,
								setErrorFetching
							)
						),
					5000
				);
				return function cleanup() {
					clearInterval(timer);
				};
			}
		}
	});

	useEffect(() => {
		if (
			Object.keys(workflow).length &&
			runPathname === "runs" &&
			!listOfRuns?.length
		) {
			workflow.isExecuted && fetchRuns();
		}
		return () => {
			dispatch(clearWorkflowLogs());
		};
	}, [workflow, runPathname]);

	useEffect(() => {
		const userData = listOfRuns?.filter((run) => {
			return run._id === runId;
		});

		setSelectedUser(runId ? userData?.[0] : listOfRuns?.[0]);
		listOfRuns && setLoading(false);
	}, [listOfRuns, runId]);

	useEffect(() => {
		if (runId) {
			!listOfRuns && !runId && fetchRuns();
		}
	}, [runId]);

	const fetchRuns = () => {
		setLoading(true);
		dispatch(fetchListOfRuns(workflowId, workflow.type, setErrorFetching));
	};

	const refreshRuns = () => {
		if (isHardRefreshed) {
			setShowBlockedRefreshModal(true);
			return;
		}
		if (listOfRuns?.length > 0) {
			setLoading(true);
			const orgId = getValueFromLocalStorage("userInfo")
				? getValueFromLocalStorage("userInfo").org_id
				: undefined;
			const un_refreshed_workflow_executions = listOfRuns.map((run) => {
				return {
					org_id: orgId,
					workflowRunId: run._id,
					workflowId: run.workflow_id,
				};
			});
			refreshRunsAPI(un_refreshed_workflow_executions)
				.then(() => {
					setLoading(false);
					setIsHardRefreshed(true);
					setShowBlockedRefreshModal(true);
				})
				.catch((error) => {
					console.log("error", error);
				});
		}
	};

	function handleRunClick(runLog) {
		history.push(`/workflow/${workflowId}/runs/${runLog._id}`);
	}

	function handleRefresh(e) {
		e.stopPropagation();
		dispatch(clearWorkflowLogs());
		refreshRuns();
	}

	return (
		<div className="tab_content">
			<div className="d-flex flex-1 flex-row">
				<div className="tab_content_header">Runs</div>
				<div className="workflow_status">
					<button
						className="mr-1 mb-1 font-12 d-flex align-items-center"
						onClick={(e) => handleRefresh(e)}
						style={{
							width: "auto",
							backgroundColor: "transparent",
							border: "none",
						}}
					>
						<img
							alt=""
							className="pr-1"
							style={{ width: "20px" }}
							src={refresh_icon}
						/>
						Refresh All
					</button>
				</div>
			</div>
			<div className="runtab_content_body">
				{loading ? (
					<div>
						<UserWorkflowStatusCard
							loading={true}
							number_of_loaders={5}
						/>
					</div>
				) : errorFetching ? (
					<div className="d-flex flex-column align-items-center warningMessage w-auto p-4 ml-3 mt-2">
						<img src={warningIcon} width={45} />
						<div className="font-18 mt-3 text-center">
							Failed to fetch runs
						</div>
						<div className="font-14 mt-1 text-center">
							An error occured during fetching run logs
						</div>
						<Button className="mt-3" onClick={() => fetchRuns()}>
							Retry
						</Button>
					</div>
				) : listOfRuns &&
				  Array.isArray(listOfRuns) &&
				  listOfRuns.length ? (
					listOfRuns.map((runLog, index) => (
						<div
							key={index}
							onClick={() => {
								handleRunClick(runLog);
							}}
						>
							<UserWorkflowStatusCard
								logDetails={runLog}
								index={index}
								isSelected={runLog?._id === selectedUser?._id}
								onSelectLog={(user_id) =>
									setSelectedUser(user_id)
								}
								workflowId={workflowId}
								loading={loading}
								handleRefresh={handleRefresh}
							/>
						</div>
					))
				) : !listOfRuns && !listOfRuns?.length && !loading ? (
					<div className="d-flex flex-column align-items-center w-auto p-4 ml-3 mt-8">
						<img src={emptyRunsIcon} />
						<p className="grey-1 o-8 font-12 mt-4">No runs yet</p>
					</div>
				) : (
					<div>
						<UserWorkflowStatusCard
							loading={true}
							number_of_loaders={5}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default Runs;
