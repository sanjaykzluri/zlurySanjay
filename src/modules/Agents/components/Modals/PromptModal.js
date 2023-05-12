import React, { useState, useEffect } from "react";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { useDispatch, useSelector } from "react-redux";
import warning from "../../../../assets/icons/delete-warning.svg";
import { useLocation } from "react-router-dom";
import "./PromptModal.css";
import {
	sendPrompts,
	sendPromptsOverview,
	sendPromptsAgentsNotInstalled,
} from "../../../../services/api/agents";

import { TriggerIssue } from "../../../../utils/sentry";
import { trackActionSegment } from "modules/shared/utils/segment";
export function PromptModal(props) {
	const [isRequesting, setIsRequesting] = useState(false);
	const [note, setNote] = useState("");
	const location = useLocation();
	const id = location.pathname.split("/")[2];
	const handleSubmit = () => {
		let idArray = [];
		if (props.data) {
			idArray.push(props.data.user_id);
		} else {
			idArray = props.selectedIds;
		}

		const promptReqBody = {
			user_ids: idArray,
			type: [props.agentType],
			message: note,
		};
		setIsRequesting(true);
		sendPrompts(promptReqBody)
			.then((res) => {
				if (res.status === "success") {
					trackActionSegment("Clicked On Send Button", {
						currentCategory: "Agents",
						currentPageName: "Send Optional Message for Prompt",
						additionalData: promptReqBody,
					});
					props.setPromptSentSuccessfully(true);
					props.closeModal();
				}
				setIsRequesting(false);
			})
			.catch((error) => {
				setIsRequesting(false);
				TriggerIssue(
					"An error occured while sending prompt to user",
					error
				);
				props.closeModal();
			});
	};
	const handleSumbitOverview = () => {
		setIsRequesting(true);
		sendPromptsOverview(id)
			.then((res) => {
				if (res.status === "success") {
					props.closeModal();
				}
				setIsRequesting(false);
			})
			.catch((error) => {
				setIsRequesting(false);
				TriggerIssue(
					"An error occured while sending prompt to user",
					error
				);
				props.closeModal();
			});
	};
	const handleSubmitProgressSection = () => {
		setIsRequesting(true);
		sendPromptsAgentsNotInstalled()
			.then((res) => {
				if (res.status === "success") {
					props.closeModal();
				}
				setIsRequesting(false);
			})
			.catch((error) => {
				setIsRequesting(false);
				TriggerIssue(
					"An error occured while sending prompt to users",
					error
				);
				props.closeModal();
			});
	};
	return (
		<Modal
			show={props.isOpen}
			onClose={() => {
				props.closeModal();
				trackActionSegment("Closed Send Prompt Modal", {
					currentCategory: "Agents",
					currentPageName: "Send Optional Message for Prompt",
				});
			}}
			footer={true}
			onOk={
				props.isAgentOverview
					? handleSumbitOverview
					: props.isProgressSection
					? handleSubmitProgressSection
					: handleSubmit
			}
			ok={"Send"}
			cancel={"Cancel"}
			submitInProgress={isRequesting}
			disableOkButton={isRequesting}
			dialogClassName="modal-602w"
		>
			<div className="d-flex flex-column">
				<div className="d-flex flex-column">
					<div
						style={{
							padding: "46px 60px 22px",
							color: "#222222",
							fontSize: "18px",
							fontWeight: "600",
						}}
						className="text-center"
					>
						Would you like to add an optional message to the prompt?
					</div>
					<textarea
						className="sendprompt__customtextarea"
						style={{ alignSelf: "center" }}
						onChange={(e) => setNote(e.target.value)}
						value={note}
						placeholder="Add a message"
					/>
				</div>
				<hr style={{ margin: "0px 10px" }}></hr>
			</div>
		</Modal>
	);
}
