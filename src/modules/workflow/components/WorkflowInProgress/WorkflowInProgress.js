import React, { useEffect, useState } from "react";
import "../WorkflowSidebar/WorkflowSidebar.css";
import { useDispatch, useSelector } from "react-redux";
import TemplateCard from "../TemplateCard/TemplateCard";
import { Button } from "UIComponents/Button/Button";
import {
	getAllCompletedWorkflows,
	getInProgressWorkflows,
} from "modules/workflow/redux/workflow";
import { useHistory } from "react-router-dom";
import { TemplateCardLoader } from "../TemplateCardLoader/TemplateCardLoader";

export default function WorkflowInProgress() {
	const templates = useSelector((state) => state.workflows.inProgress);
	const [pageNo, setPageNo] = useState(0);
	const pathname = useSelector((state) => state.router.location.pathname);
	const [workflowType, setWorkflowType] = useState(null);
	const dispatch = useDispatch();
	const history = useHistory();

	const templatesCards =
		templates &&
		templates.data
			.filter((template) => template.workflow_status === "pending")
			.slice(0, 3)
			.map((template, index) => (
				<TemplateCard
					key={index}
					template={template}
					inProgress={true}
				/>
			));

	useEffect(() => {
		if (workflowType) {
			dispatch(getInProgressWorkflows(workflowType, pageNo, () => {}));
		}
	}, [workflowType]);

	useEffect(() => {
		if (pathname) {
			setWorkflowType(pathname.split("/")[2]);
		}
	}, [pathname]);

	return (
		<>
			{!templatesCards ||
			(templatesCards && templatesCards.length > 0) ? (
				<div className={`mx-auto flex-1 flex-row d-flex pr-4 mt-4`}>
					<div className="d-inline-flex flex-1 flex-column justify-content-center">
						<p className="font-18 bold-600 black mb-0 text-captalize">
							<span style={{ textTransform: "capitalize" }}>
								In Progress
							</span>{" "}
						</p>
					</div>
					<Button
						type="link"
						onClick={() => {
							history.push(`#completed`);
						}}
						className="font-13 ml-3"
					>
						View All
					</Button>
				</div>
			) : null}
			<div className="mt-2 mb-2">
				{templatesCards && templatesCards.length >= 0 ? (
					<div className="d-flex  flex-wrap">{templatesCards}</div>
				) : (
					<div className="d-flex justify-content-between flex-wrap">
						<TemplateCardLoader />
					</div>
				)}
			</div>
		</>
	);
}
