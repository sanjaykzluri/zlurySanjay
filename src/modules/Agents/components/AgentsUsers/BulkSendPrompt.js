import React, { useEffect, useRef, useState } from "react";
import { PromptModal } from "../Modals/PromptModal";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { sendAgentPromptOptions } from "modules/Agents/constants/AgentConstants";
import arrowdropdown from "assets/arrowdropdown.svg";

const BulkSendPrompt = (props) => {
	const [sendPromptAgentType, setSendPromptAgentType] = useState("");
	const [showPromptModal, setShowPromptModal] = useState(false);

	function clickedOnSendBulkPropmt(type) {
		setSendPromptAgentType(type);
		setShowPromptModal(true);
	}

	return (
		<>
			<div>
				<Dropdown
					options={sendAgentPromptOptions}
					top={35}
					optionFormatter={(option) => (
						<div
							className="d-flex flex-column"
							style={{
								fontSize: "13px",
								fontWeight: "400",
							}}
						>
							{option.label}
						</div>
					)}
					onOptionSelect={(option) =>
						clickedOnSendBulkPropmt(option.value)
					}
					toggler={
						<div
							className="d-flex align-items-center border-1 border-radius-4"
							style={{
								height: "34px",
								padding: "0 8px",
								borderColor: "#dddddd !important",
							}}
						>
							<div className="font-13 ml-1">Send Prompt</div>
							<img
								src={arrowdropdown}
								style={{ marginLeft: "8px" }}
							/>
						</div>
					}
					menuStyle={{ overflow: "unset", width: "250px" }}
					optionStyle={{ padding: "0px !important" }}
				/>
			</div>
			{showPromptModal && (
				<PromptModal
					setPromptSentSuccessfully={props.setPromptSentSuccessfully}
					agentType={sendPromptAgentType}
					selectedIds={props.selectedIds}
					isOpen={showPromptModal}
					closeModal={() => setShowPromptModal(false)}
				></PromptModal>
			)}
		</>
	);
};

export default BulkSendPrompt;
