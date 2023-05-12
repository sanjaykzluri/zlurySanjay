import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { Button } from "../../../../UIComponents/Button/Button";
import warningExclaimation from "../../../../assets/warningExclaimation.svg";
import info from "../../../../assets/icons/info-orange.svg";
import "./ResetConditionModal.css";
import { setEditAutomationRule } from "modules/workflow/redux/workflow";

function ResetConditionModal({
	setShowResetConditionModal,
	showResetConditionModal,
	workflowType,
	rule,
}) {
	const dispatch = useDispatch();

	const [btnLoading, setBtnLoading] = useState(false);

	const removeTrigger = () => {
		setBtnLoading(true);
		let data = {};
		data.triggerName = null;
		data.triggerValues = null;
		data.audit_log_event = null;
		data.trigger = null;
		data.conditions = {
			any: [],
		};
		data.events = [];
		dispatch(setEditAutomationRule(data));
		setShowResetConditionModal(false);
	};

	return (
		<Modal
			show={showResetConditionModal}
			onClose={() => {
				setShowResetConditionModal(false);
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
					alt=""
					src={info}
					style={{
						marginBottom: "10px",
						height: "60px",
						width: "60px",
					}}
				/>
				<h3 className="font-600 font-18 grey mb-2 warning-text">
					Removing the trigger will reset all conditions and actions{" "}
				</h3>
				<p className="grey-1 font-14 mb-2">
					Do you still want to proceed?
				</p>
			</div>
			<div style={{ borderTop: "1px solid #EBEBEB", marginTop: "8px" }} />
			<div
				style={{
					marginTop: "20px",
					marginBottom: "20px",
					marginRight: "30px",
					marginLeft: "30px",
				}}
				className="d-flex justify-content-end"
			>
				<Button
					type="link"
					className="text-center mr-3"
					onClick={() => {
						setShowResetConditionModal(false);
					}}
				>
					Cancel
				</Button>
				<Button
					disabled={btnLoading}
					onClick={() => removeTrigger()}
					className="d-flex font-13 ml-3 pl-4 pr-4 align-self-center workflow-run"
				>
					{btnLoading && (
						<div className="d-flex align-items-center mr-2  mt-1">
							<Spinner
								animation="border"
								variant="light"
								bsPrefix="my-custom-spinner"
								className="my-custom-spinner"
							/>
						</div>
					)}
					Remove Trigger
				</Button>
			</div>
		</Modal>
	);
}

export default ResetConditionModal;
