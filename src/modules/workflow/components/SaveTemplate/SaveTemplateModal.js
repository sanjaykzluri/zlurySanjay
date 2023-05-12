import { getWorkFlow } from "modules/workflow/redux/workflow";
import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import completeiconimg from "../../../../components/Applications/Overview/completeicon.svg";
import { createWorkflowTemplate } from "../../service/api";
import { TriggerIssue } from "../../../../utils/sentry";
import { useSelector } from "react-redux";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { Button } from "../../../../UIComponents/Button/Button";
import { trackActionSegment } from "modules/shared/utils/segment";
import SaveTemplate from "./SaveTemplate";

const SaveTemplateDropdown = ({
	showSaveTemplateModal,
	setShowSaveTemplateModal,
}) => {
	const workflow = useSelector((state) => state.workflows.workflow);
	const [workflowTemplate, setWorkflowTemplate] = useState(
		Object.assign({}, workflow, { name: "" })
	);
	const [savingTemplate, setSavingTemplate] = useState(false);
	const [isActionAdded, setIsActionAdded] = useState(false);
	const [templateSaved, setTemplateSaved] = useState(false);

	useEffect(() => {
		if (showSaveTemplateModal) {
			setWorkflowTemplate(Object.assign({}, workflow, { name: "" }));
		}
	}, [showSaveTemplateModal]);

	useEffect(() => {
		if (workflow.nodes && workflow.nodes.length >= 0) {
			setIsActionAdded(
				workflow.nodes.filter((nodes) => nodes.actions.length).length >
					0
			);
			setWorkflowTemplate(Object.assign({}, workflow, { name: "" }));
		}
	}, [workflow]);

	const handleSaveTemplate = () => {
		if (savingTemplate || templateSaved) {
			return;
		}
		setSavingTemplate(true);
		createWorkflowTemplate({ workflow: workflowTemplate })
			.then((res) => {
				setTemplateSaved(true);
				setTimeout(() => {
					setSavingTemplate(false);
					setTemplateSaved(false);
					setShowSaveTemplateModal(false);
				}, 1000);
				setTemplateSaved(true);
				trackActionSegment(
					"Workflow saved as Playbook",
					{
						workflow: workflowTemplate,
					},
					true
				);
			})
			.catch((err) => {
				TriggerIssue("Error on saving workplace playbook", err);
				setSavingTemplate(false);
			});
	};

	const onHandleChange = (e) => {
		setWorkflowTemplate(
			Object.assign({}, workflowTemplate, { name: e.target.value })
		);
	};

	return (
		<Modal
			show={showSaveTemplateModal}
			onClose={() => {
				setShowSaveTemplateModal(false);
			}}
			size="md"
		>
			<div className="p-6 text-center">
				<h3 className="font-600 font-18 grey mb-2">
					Save this workflow as a playbook?
				</h3>
				<p className="grey-1 font-14 mb-2">
					Please add a name for the playbook to continue
				</p>

				<div
					className="d-flex mb-1 justify-content-center"
					style={{
						backgroundColor: "rgba(82, 135, 232, 0.1)",
						borderRadius: "4px",
						padding: "12px",
					}}
				>
					<p className="grey-1 font-11 m-0">
						Note: The Playbook created will be unpublished
					</p>
				</div>

				<input
					className="w-100 mb-3 p-2"
					type="text"
					name="name"
					placeholder="Playbook Name"
					value={workflowTemplate.name}
					onChange={(e) => {
						onHandleChange(e);
					}}
				/>
				<Button
					className="text-center"
					disabled={!workflowTemplate.name || !isActionAdded}
					onClick={() => {
						handleSaveTemplate();
					}}
				>
					Save playbook
					{savingTemplate && (
						<div className="d-inline-flex align-items-center mr-2 ml-2">
							{!templateSaved && (
								<Spinner
									className="mr-2 ml-2 blue-spinner action-edit-spinner"
									animation="border"
								/>
							)}
							{templateSaved && (
								<img
									style={{
										position: "relative",
										top: "2px",
									}}
									src={completeiconimg}
									width={14}
								/>
							)}
						</div>
					)}
				</Button>
			</div>
		</Modal>
	);
};

export default SaveTemplateDropdown;
