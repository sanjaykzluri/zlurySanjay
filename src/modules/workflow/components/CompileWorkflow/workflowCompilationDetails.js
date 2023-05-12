import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import React, { useEffect, useState } from "react";
import { Accordion, Card, Spinner } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { Button, BUTTON_TYPE } from "UIComponents/Button/Button";
import SchedulePlaybook from "../SchedulePlaybook/SchedulePlaybook";
import schedulePlaybook from "assets/workflow/schedule-playbook.svg";
import action_error from "assets/workflow/action_error.svg";
import {
	bulkRunAPlaybookForUsers,
	bulkScheduleRuns,
	runCompiledWorkflow,
} from "modules/workflow/service/api";
import { getHyperLinkMetaData } from "modules/workflow/utils/workflowUtils.js";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { workflowTagClassifications } from "modules/workflow/constants/constant";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";
import ViewPlaybookAction from "../ViewPlaybook/ViewPlaybookAction";
import CompileworkflowAction from "./compileWorkflowAction";
import { TAB_TYPES } from "modules/workflow/constants";

const WorkflowCompilationDetails = ({
	loading,
	playbookData,
	entity,
	onCloseModal,
	currentUser,
	isTemplate,
}) => {
	const history = useHistory();

	const selectedTab = useSelector((state) => state.router.location.hash);
	const selectedUsers = useSelector(
		(state) => state.workflows.workflow.users || []
	);
	const compiledExecDocs = useSelector(
		(state) => state.workflows.compiledExecDocs || []
	);
	const keyId = isTemplate ? "templateId" : "draftId";
	const keyName = isTemplate ? "templateName" : "draftName";

	const [selectedSection, setSelectedSection] = useState("runs");
	const [confirmationText, setConfirmationText] = useState("");
	const [schedulePlaybookData, setSchedulePlaybookData] = useState();
	const workflow = useSelector((state) => state.workflows.workflow);
	const [isAPICalling, setIsAPICalling] = useState(false);
	const validateWorkflow = () => {
		let isValid = true;

		for (let exec_doc of compiledExecDocs) {
			for (let node of exec_doc.nodes) {
				if (!node.isSchemaValid) {
					isValid = false;
					break;
				}
			}
		}
		return isValid;
	};

	const onConfirmRun = () => {
		setIsAPICalling(true);
		if (selectedSection === "schedule") {
			const data = {
				user_ids: selectedUsers?.map((user) => user?._id),
				scheduledData: schedulePlaybookData,
				draftId: playbookData?.workflow_id,
				draftName: playbookData?.template_name,
			};
			bulkScheduleRuns(playbookData?.type, data, "draft")
				.then((res) => {
					const workflowId = [playbookData?.workflow_id];

					history.push(
						`/workflows/${
							playbookData.type
						}?metaData=${getHyperLinkMetaData(
							workflowTagClassifications.RUNS,
							workflowId,
							res?.entity
						)}#runs`
					);
					onCloseModal();
				})
				.catch((err) => {
					setIsAPICalling(false);
					ApiResponseNotification({
						title: "Error in Schedule a playbook kb1",
						responseType: apiResponseTypes.ERROR,
						errorObj: err,
						retry: onConfirmRun,
					});
				});
		} else {
			runCompiledWorkflow(workflow?.id)
				.then((res) => {
					if (entity === "appPlaybooks") {
						history.push(
							`/applications/${workflow?.mini_playbook_data?.app_id}?selectedTab=runs#automation`
						);
					} else {
						history.push(`/workflows/${workflow.type}#completed`);
					}
					onCloseModal();
				})
				.catch((err) => {
					setIsAPICalling(false);
					ApiResponseNotification({
						title: "Error in bulk running a playbook kb2",
						responseType: apiResponseTypes.ERROR,
						errorObj: err,
						retry: onConfirmRun,
					});
				});
		}
	};

	const runPlaybookUI = (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				width: "100%",
			}}
			className="mt-2"
		>
			<input
				className="mr-2 p-2 flex-2"
				style={{ height: "auto" }}
				value={confirmationText}
				type="text"
				placeholder="Type ‘CONFIRM’"
				onKeyPress={(event) => {
					if (
						event.key === "Enter" &&
						confirmationText === "CONFIRM"
					) {
						onConfirmRun();
					}
				}}
				onChange={(e) => {
					setConfirmationText(e.target.value);
				}}
			/>
			<Button
				className="p-3"
				style={{ flex: 1, border: "1px solid" }}
				disabled={
					!selectedUsers.length > 0 ||
					confirmationText !== "CONFIRM" ||
					isAPICalling
				}
				onClick={() => {
					onConfirmRun();
				}}
			>
				{isAPICalling && (
					<Spinner
						className="mr-2 blue-spinner action-edit-spinner"
						animation="border"
					/>
				)}
				Run
			</Button>
			<Button
				className="p-3 ml-1 d-flex justify-content-center"
				style={{
					border: "1px solid #2266e2",
					color: "#2266E2",
					backgroundColor: "#EFF8FF",
					fontWeight: "500",
					flex: 1,
				}}
				onClick={() => {
					setSelectedSection("runs");
					setConfirmationText("");
				}}
			>
				Cancel
			</Button>
		</div>
	);

	const schedulePlaybookUI = (
		<SchedulePlaybook
			buttonText="Schedule"
			confirmationText={confirmationText}
			setConfirmationText={setConfirmationText}
			onConfirmRun={onConfirmRun}
			onCancelClick={() => {
				setSelectedSection("runs");
				setConfirmationText("");
			}}
			selectedUsers={selectedUsers}
			isAPICalling={isAPICalling}
			schedulePlaybookData={schedulePlaybookData}
			setSchedulePlaybookData={setSchedulePlaybookData}
		/>
	);

	const runPlaybookBtn = (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				width: "100%",
			}}
			className="mt-2"
		>
			<Button
				className="p-3"
				style={{ flex: 1, border: "1px solid" }}
				disabled={!validateWorkflow()}
				onClick={() => {
					setSelectedSection("runnow");
				}}
			>
				Run Workflow Now
			</Button>
			{entity !== "appPlaybooks" && (
				<Button
					className="p-3 ml-1 d-flex justify-content-center"
					style={{
						border: "1px solid #2266e2",
						color: "#2266E2",
						backgroundColor: "#EFF8FF",
						gap: "5px",
						fontWeight: "500",
						flex: 1,
					}}
					disabled={!validateWorkflow()}
					onClick={() => {
						setSelectedSection("schedule");
					}}
				>
					<img alt="" src={schedulePlaybook} /> Schedule for later
				</Button>
			)}
		</div>
	);

	const schemaNotValidMessageUi = playbookData.schemaValidationError &&
		Object.keys(playbookData.schemaValidationError).length > 0 &&
		playbookData.schemaValidationError.message && (
			<div
				className="m-2"
				style={{
					backgroundColor: "#FFE9E5",
					borderRadius: "8px",
					fontSize: "11px",
					padding: "8px",
				}}
			>
				<img src={action_error} style={{ marginRight: "10px" }} />
				{playbookData.schemaValidationError.message}
			</div>
		);

	const applications =
		!loading &&
		playbookData.nodes &&
		playbookData.nodes.map((app, index) => {
			return (
				<div key={index}>
					<Accordion
						style={{ backgroundColor: "rgba(250, 251, 252, 0.5)" }}
						className="pr-3 pb-3 m-2"
						defaultActiveKey="0"
					>
						<Card>
							<Card.Header
								className="p-0"
								style={{
									backgroundColor: "transparent",
								}}
							>
								<Accordion.Toggle
									className="border-0"
									as={Card.Header}
									variant="link"
									eventKey="0"
								>
									{app?.apps && app?.apps?.length > 0 ? (
										<>
											<div className="position-relative d-flex mr-3">
												{app.apps
													.map((app, index) => (
														<GetImageOrNameBadge
															key={index}
															name={app.name}
															url={app.logo}
															width={15}
															height={15}
															imageClassName={
																index === 0
																	? " mr-n2 z-index-1  img-circle white-bg"
																	: null +
																	  "border-radius-4 object-contain avatar"
															}
															nameClassName={
																index === 0
																	? " mr-n2 z-index-1  img-circle white-bg"
																	: null +
																	  "img-circle avatar  mr-n2 z-index-1"
															}
														/>
													))
													.slice(0, 2)}
												<p className="bold-600 font-11 m-0 text-capitalize ml-2">
													{app.apps
														.map((res) => res.name)
														.slice(0, 2)
														.join(", ")}
													<span className="text-lowercase">
														{app.apps.length > 2 &&
															` ,+ ${
																app.apps
																	.length - 2
															} more apps`}
													</span>
												</p>
											</div>
										</>
									) : (
										<p className="bold-600 font-11 m-0">
											<img
												height={15}
												width={15}
												src={app?.app_logo}
												alt=""
												className="mr-2"
											/>
											{app?.app_name}
										</p>
									)}
								</Accordion.Toggle>
							</Card.Header>
							<Accordion.Collapse eventKey="0">
								<Card.Body className="p-0">
									<CompileworkflowAction
										loading={loading}
										actions={app?.actions}
										application={app}
									/>
								</Card.Body>
							</Accordion.Collapse>
						</Card>
					</Accordion>
				</div>
			);
		});

	return (
		<div className="d-flex flex-column" style={{ width: "100%" }}>
			<div
				className="pt-1"
				style={{
					width: "100%",
					backgroundColor: "#FFFFFF",
					borderRadius: "8px",
					height: "45vh",
				}}
			>
				{/* {totalAppAction} */}
				<div style={{ overflowY: "auto", height: "43vh" }}>
					<div className="m-2 d-flex flex-column">
						<small style={{ color: "#717171", fontSize: "8px" }}>
							Preview for
						</small>
						<div>
							<GetImageOrNameBadge
								name={currentUser.user_name}
								url={
									currentUser.user_logo ||
									currentUser?.user_profile
								}
								width={25}
								height={25}
								imageClassName="img-circle avatar  mr-1 z-index-1"
								nameClassName="img-circle avatar  mr-1 z-index-1"
							/>
							<span
								style={{ fontSize: "12px", fontWeight: "600" }}
							>
								{currentUser.user_name}
							</span>
						</div>
					</div>
					{playbookData?.nodes?.length > 0
						? applications
						: schemaNotValidMessageUi}{" "}
				</div>
			</div>
			{selectedSection === "schedule" ? (
				<div className="schedule-playbook-bottom ml-2 mr-2">
					{schedulePlaybookUI}
				</div>
			) : (
				<div
					className="d-flex justify-content-evenly compile-screen-bottom"
					style={{ marginTop: "auto", marginBottom: "10px" }}
				>
					{selectedSection === "runs" && runPlaybookBtn}
					{selectedSection === "runnow" && runPlaybookUI}
				</div>
			)}
		</div>
	);
};

export default WorkflowCompilationDetails;
