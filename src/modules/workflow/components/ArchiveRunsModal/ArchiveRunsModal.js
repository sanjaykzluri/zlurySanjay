import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import { TriggerIssue } from "../../../../utils/sentry";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { Button } from "../../../../UIComponents/Button/Button";
import archived from "../../../../assets/workflow/archived.svg";
import {
	archiveRunWorkflow,
	cancelScheduledRunWorkflow,
	unArchiveRunWorkflow,
} from "../../service/api";
import "./ArchiveRunsModal.css";

function ArchiveRunsModal({
	type,
	workflow_id,
	setShowArchiveRunsModal,
	showArchiveRunsModal,
	refreshTable,
	workflow,
}) {
	const [archiveRun, setArchiveRun] = useState(false);
	const handleArchiveRun = () => {
		if (archiveRun) {
			return;
		}
		setArchiveRun(true);
		if (workflow.archive) {
			unArchiveRunWorkflow(workflow?.workflow_runId)
				.then((res) => {
					if (res.status) {
						refreshTable();
						setTimeout(() => {
							setArchiveRun(false);
							setShowArchiveRunsModal(false);
						}, 1000);
					}
				})
				.catch((err) => {
					TriggerIssue(`Error archiving ${type}`, err);
					setArchiveRun(false);
				});
		} else {
			archiveRunWorkflow(workflow?.workflow_runId)
				.then((res) => {
					if (res.status) {
						refreshTable();
						setTimeout(() => {
							setArchiveRun(false);
							setShowArchiveRunsModal(false);
						}, 1000);
					}
				})
				.catch((err) => {
					TriggerIssue(`Error unarchiving ${type}`, err);
					setArchiveRun(false);
				});
		}
	};

	return (
		<Modal
			show={showArchiveRunsModal}
			onClose={() => {
				setShowArchiveRunsModal(false);
			}}
			size="md"
		>
			<div
				className="text-center"
				style={{
					margin: "20px",
				}}
			>
				<img
					alt=""
					src={archived}
					style={{
						marginBottom: "20px",
						height: "40px",
						width: "40px",
					}}
				/>
				<h3 className="font-600 font-18 grey mb-2 warning-text">
					{workflow.archive ? "Unarchive" : "Archive"} Run
				</h3>
				<p className="grey-1 font-14 font-500 mb-4">
					This will {workflow.archive ? "unarchive" : "archive"} this
					run, you can still remove filter and see all runs
				</p>
				<div
					style={{ justifyContent: "space-around" }}
					className="d-flex px-4"
				>
					<Button
						type="border"
						onClick={() => {
							setShowArchiveRunsModal(false);
						}}
						className="text-center mx-2 flex-1"
						style={{
							backgroundColor: "#EBEBEB",
							borderRadius: "8px",
						}}
					>
						Cancel
					</Button>
					<Button
						style={{
							borderRadius: "8px",
						}}
						className="text-center mx-2 flex-1"
						onClick={() => {
							handleArchiveRun();
						}}
					>
						Proceed{" "}
						{archiveRun && (
							<Spinner
								className="ml-2 blue-spinner action-edit-spinner"
								animation="border"
							/>
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
}

export default ArchiveRunsModal;
