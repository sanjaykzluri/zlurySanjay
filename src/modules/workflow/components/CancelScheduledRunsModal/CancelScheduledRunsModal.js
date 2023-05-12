import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import { TriggerIssue } from "../../../../utils/sentry";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { Button } from "../../../../UIComponents/Button/Button";
import failedIcon from "../../../../assets/cancelled_icon.svg";
import { cancelScheduledRunWorkflow } from "../../service/api";
import "./cancelScheduledRunsModal.css";

function CancelScheduledRunsModal({
	type,
	workflow_id,
	setShowCancelScheduledRunsModal,
	showCancelScheduledRunsModal,
	refreshTable,
	workflow,
}) {
	const [cancelScheduledRun, setCancelScheduledRun] = useState(false);
	const handleDeleteWorkflow = () => {
		if (cancelScheduledRun) {
			return;
		}
		setCancelScheduledRun(true);
		if (type === "#runs") {
			const data = {
				scheduledIds: [workflow_id],
			};
			cancelScheduledRunWorkflow(data)
				.then((res) => {
					if (res.status) {
						refreshTable();
						setTimeout(() => {
							setCancelScheduledRun(false);
							setShowCancelScheduledRunsModal(false);
						}, 1000);
					}
				})
				.catch((err) => {
					TriggerIssue(`Error cancelling ${type}`, err);
					setCancelScheduledRun(false);
				});
		}
	};

	return (
		<Modal
			show={showCancelScheduledRunsModal}
			onClose={() => {
				setShowCancelScheduledRunsModal(false);
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
					src={failedIcon}
					style={{
						marginBottom: "20px",
						height: "40px",
						width: "40px",
					}}
				/>
				<h3 className="font-600 font-18 grey mb-2 warning-text">
					Cancel Run
				</h3>
				<p className="grey-1 font-14 font-500 mb-4">
					Are you sure you want to cancel the run?
				</p>
				<div
					style={{ justifyContent: "space-around" }}
					className="d-flex px-4"
				>
					<Button
						type="border"
						onClick={() => {
							setShowCancelScheduledRunsModal(false);
						}}
						className="text-center mx-2 flex-1"
						style={{
							backgroundColor: "#EBEBEB",
							borderRadius: "8px",
						}}
					>
						Close
					</Button>
					<Button
						style={{
							borderRadius: "8px",
						}}
						className="text-center mx-2 flex-1"
						onClick={() => {
							handleDeleteWorkflow();
						}}
					>
						Proceed{" "}
						{cancelScheduledRun && (
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

export default CancelScheduledRunsModal;
