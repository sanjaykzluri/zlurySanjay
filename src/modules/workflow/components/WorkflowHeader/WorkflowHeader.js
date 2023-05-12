import React, { useEffect, useState } from "react";
import { Breadcrumb, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { useHistory, useLocation } from "react-router";
import backIcon from "../../../../assets/back-nav.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import playButton from "../../../../assets/playButton.svg";
import "./WorkflowHeader.css";
import WorkflowName from "../WorkflowName/WorkflowName";
import SaveTemplate from "../SaveTemplate/SaveTemplate";
import { editWorkFlowDetails } from "../../redux/workflow";
import { useSelector } from "react-redux";
import { timeSince } from "../../../../utils/DateUtility";
import { trackActionSegment } from "modules/shared/utils/segment";
import { editWorkflowDetails } from "modules/workflow/service/api";
import { TriggerIssue } from "utils/sentry";
import CompileWorkflow from "../CompileWorkflow/CompileWorkflow";

function WorkflowHeader(props) {
	const { isTemplate } = props;
	const history = useHistory();
	const location = useLocation();
	const runsPathname = location.pathname.split("/")[3];
	const workflow = useSelector((state) => state.workflows.workflow);
	const [isValidated, setIsValidated] = useState(false);
	const [editedOn, setEditedOn] = useState(null);
	const [isPublishPlaybook, setIsPublishPlaybook] = useState(false);
	const [showTooltip, setShowTooltip] = useState(false);
	const [showCompileScreen, setShowCompileScreen] = useState(false);

	useEffect(() => {
		if (workflow) {
			if (editedOn) {
				setEditedOn(new Date());
			} else {
				setEditedOn(workflow.updatedOn);
			}
			setIsValidated(
				!workflow?.nodes?.filter(
					(app) =>
						app?.actions?.filter(
							(act) =>
								!act.isValidated ||
								(act.type === "integration" &&
									!act.orgIntegrationID)
						).length
				).length &&
					workflow?.nodes?.filter((app) => app?.actions?.length)
						.length
			);
		}
	}, [workflow]);

	const publishPlaybook = () => {
		setIsPublishPlaybook(true);
		editWorkflowDetails(
			workflow?.id,
			{
				is_published: !workflow?.is_published,
			},
			props.isTemplate
		)
			.then((res) => {
				setIsPublishPlaybook(false);
				history.push(`/workflows/${res.type}#overview`);
			})
			.catch((err) => {
				setIsPublishPlaybook(false);
				TriggerIssue("Error in publish playbook", err);
			});
	};

	return (
		<div className="workflow-header NavH border-bottom">
			<div
				className="ins-1 "
				style={{
					paddingRight: "10px",
					paddingBottom: "10px",
					paddingTop: "10px",
				}}
			>
				<Breadcrumb bsPrefix="my-bread">
					<img
						alt=""
						src={backIcon}
						width={14}
						className="mr-2 cursor-pointer mt-auto mb-auto"
						onClick={() =>
							history.push(`/workflows/${workflow.type}#overview`)
						}
					/>
					<button
						className="my-bread-item my-bread-itemnew o-10"
						onClick={() =>
							history.push(`/workflows/${workflow.type}#overview`)
						}
					>
						Workflow
					</button>
					<Breadcrumb.Item
						active
						bsPrefix="my-bread-item"
						className="d-flex"
					>
						<WorkflowName
							isTemplate={props.isTemplate}
							entity="workflows"
							editWorkFlowDetails={editWorkFlowDetails}
						/>
					</Breadcrumb.Item>
				</Breadcrumb>
			</div>
			<div className="ins-2" style={{ alignItems: "center" }}>
				{!workflow?.isExecuted && (
					<div className="ml-3 pl-4 pr-4 py-3">
						<h3 className="grey-1 font-13 m-0">
							Auto saved as{" "}
							{props.isTemplate ? "playbook" : "draft"}
						</h3>
						<p className="grey-1 font-10 m-0 text-center">{`${timeSince(
							new Date(),
							editedOn
						)} ago`}</p>
					</div>
				)}
				{!props.isTemplate && <SaveTemplate />}

				{!runsPathname &&
					!workflow.isExecuted &&
					!workflow?.is_published && (
						<div
							onMouseEnter={() => {
								if (!isValidated) setShowTooltip(true);
							}}
							onMouseLeave={() => {
								if (!isValidated) setShowTooltip(false);
							}}
						>
							<OverlayTrigger
								placement="bottom"
								show={showTooltip && !isValidated}
								overlay={(props) => {
									const text = `${
										isTemplate
											? "Playbook can’t be published"
											: "Workflow can’t be run"
									} as some actions are not set up properly`;
									return (
										<Tooltip {...props} id="button-tooltip">
											{text}
										</Tooltip>
									);
								}}
							>
								<Button
									disabled={!isValidated || isPublishPlaybook}
									onClick={() => {
										trackActionSegment(
											"Clicked on Run Workflow Button"
										);
										if (
											props.isTemplate &&
											!workflow?.is_published
										) {
											publishPlaybook();
										} else {
											setShowCompileScreen(true);
										}
									}}
									className="font-13 ml-3 pl-4 pr-4 align-self-center workflow-run"
								>
									{isPublishPlaybook && (
										<Spinner
											style={{ top: "0px" }}
											className="ml-2 mr-2 blue-spinner action-edit-spinner"
											animation="border"
										/>
									)}
									{!props.isTemplate && (
										<img
											alt=""
											src={playButton}
											width={14}
											className="mr-1"
										/>
									)}
									{props.isTemplate && !workflow?.is_published
										? "Publish Playbook"
										: "Run"}
								</Button>
							</OverlayTrigger>
						</div>
					)}
			</div>
			{showCompileScreen && (
				<CompileWorkflow
					modalClass="workflows-modal"
					openModal={showCompileScreen}
					onCloseModal={() => setShowCompileScreen(false)}
					isTemplate={isTemplate}
				/>
			)}
		</div>
	);
}

export default WorkflowHeader;
