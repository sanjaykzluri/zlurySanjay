import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import completeiconimg from "../../../../components/Applications/Overview/completeicon.svg";
import { TriggerIssue } from "../../../../utils/sentry";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { Button } from "../../../../UIComponents/Button/Button";
import warningExclaimation from "../../../../assets/warningExclaimation.svg";
import { deleteDraft, deleteTemplate, deleteRule } from "../../service/api";
import { deleteAppRule } from "../../../../modules/applications/components/automation/service/automation-api";
import "./deleteWorkflowModal.css";

function DeleteWorkflowModal({
	type,
	workflow_id,
	workflow_name,
	setShowDeleteWorkflowModal,
	showDeleteWorkflowModal,
	refreshTable,
	workflow,
}) {
	const [deletingWorkflow, setDeletingWorkflow] = useState(false);
	const [workflowDeleted, setWorkflowDeleted] = useState(false);
	const handleDeleteWorkflow = () => {
		if (deletingWorkflow || workflowDeleted) {
			return;
		}
		setDeletingWorkflow(true);
		if (type == "#drafts" || type == "#overview") {
			deleteDraft(workflow_id)
				.then((res) => {
					if (res.status) {
						setWorkflowDeleted(true);
						refreshTable();
						setTimeout(() => {
							setDeletingWorkflow(false);
							setWorkflowDeleted(false);
							setShowDeleteWorkflowModal(false);
						}, 1000);
					}
				})
				.catch((err) => {
					TriggerIssue(`Error deleting ${type}`, err);
				});
		} else if (type == "#playbooks" || type === "#app_playbooks") {
			deleteTemplate(workflow_id)
				.then((res) => {
					if (res.status) {
						setWorkflowDeleted(true);
						setTimeout(() => {
							setDeletingWorkflow(false);
							setWorkflowDeleted(false);
							setShowDeleteWorkflowModal(false);
							refreshTable();
						}, 500);
					}
				})
				.catch((err) => {
					TriggerIssue(`Error deleting ${type}`, err);
				});
		} else if (type === "#rules" || type === "#app_rules") {
			deleteRule(workflow_id, workflow?.tag, workflow?.priority_order)
				.then((res) => {
					if (res.success) {
						setWorkflowDeleted(true);
						setTimeout(() => {
							setDeletingWorkflow(false);
							setWorkflowDeleted(false);
							setShowDeleteWorkflowModal(false);
							refreshTable();
						}, 500);
					}
				})
				.catch((err) => {
					TriggerIssue(`Error deleting ${type}`, err);
				});
		}
	};

	return (
		<Modal
			show={showDeleteWorkflowModal}
			onClose={() => {
				setShowDeleteWorkflowModal(false);
			}}
			size="md"
		>
			<div
				className="p-3 text-center"
				style={{
					marginTop: "30px",
					marginBottom: "30px",
					marginRight: "20px",
					marginLeft: "20px",
				}}
			>
				<img
					src={warningExclaimation}
					style={{
						marginBottom: "10px",
						height: "60px",
						width: "60px",
					}}
				/>
				<h3 className="font-600 font-18 grey mb-2 warning-text">
					You're about to delete the following{" "}
					{type === "#drafts" || type === "#overview"
						? "draft"
						: type === "#rules" || type === "#app_rules"
						? "rule"
						: "playbook"}
					:
				</h3>
				<h3 className="font-600 font-18 grey mb-2 delete-modal-workflow-name-holder">
					<div className="delete-modal-workflow-name">
						{workflow_name ? workflow_name : "workflow"}
					</div>
				</h3>
				<p className="grey-1 font-14 mb-2">
					Are you sure you want to continue?
				</p>
				<Button
					className="text-center"
					onClick={() => {
						handleDeleteWorkflow();
					}}
				>
					Delete{" "}
					{type === "#drafts" || type === "#overview"
						? "Draft"
						: type === "#rules" || type === "#app_rules"
						? "Rule"
						: "Playbook"}
					{deletingWorkflow && (
						<div className=" ml-2 d-inline-flex align-items-center">
							{workflowDeleted ? (
								<img
									style={{
										position: "relative",
										top: "2px",
									}}
									src={completeiconimg}
									width={14}
								/>
							) : (
								<Spinner
									className="ml-2 blue-spinner action-edit-spinner"
									animation="border"
								/>
							)}
						</div>
					)}
				</Button>
			</div>
		</Modal>
	);
}

export default DeleteWorkflowModal;
