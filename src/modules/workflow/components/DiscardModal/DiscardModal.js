import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";
import { TriggerIssue } from "../../../../utils/sentry";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { Button } from "../../../../UIComponents/Button/Button";
import warningExclaimation from "../../../../assets/warningExclaimation.svg";
import { WorkFlowAutomationRuleRequestModel } from "../../model/model";
import { updateAutomationRuleService } from "../../service/api";
import "./discardModal.css";
import { validation } from "utils/automationRuleValidator";

function DiscardModal({
	setShowDiscardModal,
	showDiscardModal,
	workflowType,
	rule,
}) {
	const history = useHistory();
	// const automationRule = useSelector(
	// 	(state) => state.workflows.automationRule
	// );

	const [btnLoading, setBtnLoading] = useState(false);

	const saveRule = () => {
		setBtnLoading(true);
		const ruleData = { ...rule };
		if (!ruleData.showNotifyUsers) {
			ruleData.notifyUsers = [];
		}
		const requestModel = new WorkFlowAutomationRuleRequestModel(ruleData);
		updateAutomationRuleService(requestModel)
			.then((res) => {
				setBtnLoading(false);
				setShowDiscardModal(false);
				history.push(`/workflows/${workflowType}#rules`);
			})
			.catch((err) => {
				TriggerIssue(`Error saving ${workflowType} Rule`, err);
			});
	};

	return (
		<Modal
			show={showDiscardModal}
			onClose={() => {
				setShowDiscardModal(false);
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
					src={warningExclaimation}
					style={{
						marginBottom: "10px",
						height: "60px",
						width: "60px",
					}}
				/>
				<h3 className="font-600 font-18 grey mb-2 warning-text">
					There are unsaved changes for this rule{" "}
				</h3>
				<p className="grey-1 font-14 mb-2">
					Do you want to save before exiting?
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
						history.push(`/workflows/${workflowType}#rules`);
					}}
				>
					Cancel
				</Button>
				<Button
					disabled={!validation(rule) || btnLoading}
					onClick={() => saveRule()}
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
					Save Rule
				</Button>
			</div>
		</Modal>
	);
}

export default DiscardModal;
