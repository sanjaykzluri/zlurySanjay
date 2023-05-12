import React, { useEffect, useState } from "react";
import WorkflowHeader from "../../components/WorkflowHeader/WorkflowHeader";
import WorkflowSidebar from "../../components/WorkflowSidebar/WorkflowSidebar";
import RunLogModal from "./RunLogModal";
import { RunLogs } from "./RunLogs";
import SelectUser from "../../components/SelectUser/SelectUser";
import "./Workflow.css";
import Application from "../../components/Application/Application";
import AddApplication from "../../components/AddApplication/AddApplication";
import { useDispatch, useSelector } from "react-redux";
import {
	clearWorkflow,
	clearWorkflowLogs,
	editWorkFlowDetails,
	getWorkFlow,
	workflowExecuted,
	getPendingAppList,
} from "../../redux/workflow";
import { useLocation, useHistory } from "react-router";
import { LoaderPage } from "../../../../common/Loader/LoaderPage";
import RunConfirmationModal from "../../components/RunConfirmationModal/RunConfirmationModal";
import { executeWorkflow } from "../../service/api";
import { TriggerIssue } from "../../../../utils/sentry";
import { WORFKFLOW_TYPE } from "../../constants/constant";
import SelectUserModal from "../../components/SelectUserModal/SelectUserModal";
import ProtectedRoute from "../../../../common/ProtectedRoute";
import { Switch, useRouteMatch } from "react-router-dom";
import { WorkflowPendingApps } from "../../components/WorkflowPendingApps/WorkflowPendingApps";
import RunPlaybookBulkUserModal from "modules/workflow/components/RunPlaybookBulkUserModal/RunPlaybookBulkUserModal";
import UnpublishPlaybookModal from "modules/workflow/components/UnpublishPlaybookModal/UnpublishPlaybookModal";

function Workflow() {
	let { url } = useRouteMatch();
	const history = useHistory();
	const [showRunLogs, setShowRunLogs] = useState(false);
	const workflow = useSelector((state) => state.workflows.workflow);
	const pendingApps = useSelector((state) => state.workflows.pendingAppList);
	const selectedTab = useSelector((state) => state.router.location.hash);
	const [isLoading, setIsLoading] = useState(true);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [showRunLogModal, setShowRunLogModal] = useState(false);
	const [showAddUserModal, setShowAddUserModal] = useState(false);
	const [runLogExecutionResponse, setRunLogExecutionResponse] = useState();
	const dispatch = useDispatch();
	const location = useLocation();
	const runsPathname = location.pathname.split("/")[3];
	const runId = location.pathname.split("/")[4];
	const [showUnpublishPlaybookModal, setshowUnpublishPlaybookModal] =
		useState(false);
	const isTemplate = location.pathname.split("/").includes("playbook")
		? true
		: false;
	const workflowId = location.pathname.split("/")[2];
	const [showBlockedRefreshModal, setShowBlockedRefreshModal] =
		useState(false);

	useEffect(() => {
		if (!Object.keys(workflow).length) {
			dispatch(getWorkFlow({ id: workflowId, isTemplate: isTemplate }));
		} else {
			setIsLoading(false);
			setShowAddUserModal(false);
			if (workflow.is_published) {
				setshowUnpublishPlaybookModal(true);
			}
		}
	}, [workflow]);

	useEffect(() => {
		return () => {
			dispatch(clearWorkflow());
			dispatch(clearWorkflowLogs());
		};
	}, []);

	const applications =
		!isLoading &&
		workflow.nodes &&
		workflow.nodes.map((app, index) => {
			return (
				<div key={index}>
					<Application
						application={app}
						index={index}
						isTemplate={isTemplate}
					/>
					{!workflow.isExecuted && (
						<AddApplication
							positionAt={index + 1}
							isTemplate={isTemplate}
						/>
					)}
				</div>
			);
		});

	const onConfirmRun = () => {
		setShowConfirmationModal(false);
		setShowRunLogModal(true);
		executeWorkflow(workflow.id)
			.then((res) => {
				setRunLogExecutionResponse(res);
				dispatch(workflowExecuted());
				history.push(`/workflow/${workflow.id}/runs`);
			})
			.catch((err) => {
				TriggerIssue("Workflow execution failed", err);
			});
	};

	const onUserSelected = (selectedUsers) => {
		dispatch(
			editWorkFlowDetails(workflow.id, {
				users_ids: selectedUsers.map((user) => user.user_id),
			})
		);
	};

	const WorkflowActions = () => {
		return (
			<div className="z-workflow-actions w-75 m-auto">
				{!isTemplate && (
					<SelectUser
						addMore={() => {
							setShowAddUserModal(true);
						}}
					/>
				)}
				{!workflow.isExecuted && (
					<AddApplication positionAt={0} isTemplate={isTemplate} />
				)}
				{applications}
			</div>
		);
	};

	return (
		<>
			<div className="container-fluid">
				{isLoading ? (
					<LoaderPage />
				) : (
					<div className="row">
						<div className="col-md-12">
							<header>
								<WorkflowHeader
									isTemplate={isTemplate}
									run={() => {
										setShowConfirmationModal(true);
									}}
								/>
							</header>
							<section>
								<div className="row">
									<div className="col-md-4 z-workflow-sidebar p-0">
										<WorkflowSidebar
											isTemplate={isTemplate}
											showBlockedRefreshModal={
												showBlockedRefreshModal
											}
											setShowBlockedRefreshModal={
												setShowBlockedRefreshModal
											}
										/>
									</div>
									<div className="col-md-8 z-workflow-actions-container">
										<div className="row">
											<div className="col-md-12 mt-3 mb-6">
												{!workflow.isExecuted &&
													workflow.type ===
														WORFKFLOW_TYPE.OFFBOARDING &&
													// pendingApps.length > 0 &&
													!isTemplate && (
														<WorkflowPendingApps className="w-75 mb-3" />
													)}
												<Switch>
													<ProtectedRoute
														path={`${url}/:runs/:id`}
														children={<RunLogs />}
													/>

													<ProtectedRoute
														path={`${url}/:runs`}
														children={
															workflow.isExecuted ||
															runId ? (
																<RunLogs />
															) : (
																<WorkflowActions />
															)
														}
													/>
													<ProtectedRoute
														path={`${url}`}
														children={
															workflow.isExecuted ||
															runId ? (
																<RunLogs />
															) : (
																<WorkflowActions />
															)
														}
													/>
												</Switch>
											</div>
										</div>
									</div>
								</div>
							</section>
						</div>
						{showBlockedRefreshModal && (
							<RunPlaybookBulkUserModal
								modalClass="workflows-template-modal"
								onCloseModal={setShowBlockedRefreshModal}
								openModal={showBlockedRefreshModal}
								showButton={false}
								title={`Refreshing all Runs`}
							/>
						)}
						<RunConfirmationModal
							showConfirmationModal={showConfirmationModal}
							closeConfirmationModal={() =>
								setShowConfirmationModal(false)
							}
							confirmed={() => {
								onConfirmRun();
							}}
							workflowId={workflow?.id || workflowId}
						/>
						<RunLogModal
							showModal={showRunLogModal}
							runLogExecutionResponse={runLogExecutionResponse}
							setShowModal={() => {
								setShowRunLogModal(false);
							}}
						/>
						<SelectUserModal
							selectedUsers={workflow.users || []}
							modalClass="workflows-template-modal"
							onCloseModal={() => {
								setShowAddUserModal(false);
							}}
							openModal={showAddUserModal}
							onContinue={(selectedUsers) => {
								onUserSelected(selectedUsers);
							}}
							buttonTitle="Continue"
							title={`Select users for ${workflow.type}`}
						/>
						{showUnpublishPlaybookModal && (
							<UnpublishPlaybookModal
								show={showUnpublishPlaybookModal}
								onHide={() => {
									setshowUnpublishPlaybookModal(false);
									history.push(
										"/workflows/onboarding#overview"
									);
								}}
								onClose={() => {
									setshowUnpublishPlaybookModal(false);
									dispatch(
										getWorkFlow({
											id: workflowId,
											isTemplate: isTemplate,
										})
									);
								}}
								data={workflow}
							/>
						)}
					</div>
				)}
			</div>
		</>
	);
}

export default Workflow;
