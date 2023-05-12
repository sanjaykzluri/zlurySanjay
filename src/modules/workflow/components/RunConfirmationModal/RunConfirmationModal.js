import React, { useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import play from "../../../../assets/icons/play-yellow.svg";
import { Link } from "react-router-dom";

export default function RunConfirmationModal(props) {
	const [confirmationText, setConfirmationText] = useState("");
	return (
		<>
			<Modal
				size="md"
				show={props.showConfirmationModal}
				onClose={() => props.closeConfirmationModal()}
			>
				<div className="text-center p-4">
					<img
						src={play}
						width={46}
						height={46}
						className="mb-4 mt-3"
					/>
					<h3 className="bold-600 font-18 grey mb-2">
						Confirm you want to run this Workflow
					</h3>
					<p className="font-14 grey-1 mb-3">
						Once confirmed, the workflow cannot be paused or stopped
						till it completes. Are you sure you want to continue?
					</p>
					<div className="mb-4">
						<input
							className="mr-2 p-2"
							value={confirmationText}
							type="text"
							placeholder="Type ‘CONFIRM’"
							onKeyPress={(event) => {
								if (
									event.key === "Enter" &&
									confirmationText === "CONFIRM"
								) {
									props.confirmed();
								}
							}}
							onChange={(e) => {
								setConfirmationText(e.target.value);
							}}
						/>
						<Link
							to={
								confirmationText === "CONFIRM" &&
								`/workflow/${props.workflowId}/runs`
							}
						>
							<Button
								disabled={confirmationText != "CONFIRM"}
								onClick={() => {
									props.confirmed();
								}}
							>
								{" "}
								Run Workflow
							</Button>
						</Link>
					</div>
				</div>
			</Modal>
		</>
	);
}
