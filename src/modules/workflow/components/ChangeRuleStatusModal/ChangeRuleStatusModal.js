import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import completeiconimg from "../../../../components/Applications/Overview/completeicon.svg";
import { TriggerIssue } from "../../../../utils/sentry";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { Button } from "../../../../UIComponents/Button/Button";
import { updateAutomationRulesService } from "../../service/api";
import "./ChangeRuleStatusModal.css";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import check from "../../../../assets/applications/check.svg";
import arrowRight from "../../../../assets/workflow/arrow-right.svg";

function ChangeRuleStatusModal({
	type,
	rule_name,
	setShowRuleStatusModal,
	showRuleStatusModal,
	refreshTable,
	rule,
}) {
	const [updatingStatus, setUpdatingStatus] = useState(false);
	const [statusUpdated, setStatusUpdated] = useState(false);

	const getCurrentStatus = () => {
		if (rule?.status === "active") {
			return "active";
		} else {
			return "inactive";
		}
	};

	const handleStatusChange = () => {
		if (updatingStatus || statusUpdated) {
			return;
		}
		setUpdatingStatus(true);
		const data = {
			...rule,
			status: getCurrentStatus() === "active" ? "inactive" : "active",
		};
		updateAutomationRulesService(data)
			.then((res) => {
				if (res.status) {
					setStatusUpdated(true);
					refreshTable();
					setTimeout(() => {
						setUpdatingStatus(false);
						setStatusUpdated(false);
						setShowRuleStatusModal(false);
					}, 1000);
				}
			})
			.catch((err) => {
				TriggerIssue(`Error deleting ${type}`, err);
			});
	};

	return (
		<Modal
			show={showRuleStatusModal}
			onClose={() => {
				setShowRuleStatusModal(false);
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
				<div className="d-flex flex-1 flex-row justify-content-center align-items-center">
					<div className="d-flex flex-row delete-modal-rule-name align-items-center px-3 py-2">
						<img
							className="mr-2"
							alt=""
							src={
								getCurrentStatus() === "active"
									? check
									: inactivecheck
							}
							style={{
								height: "12px",
								width: "12px",
							}}
						/>
						<h3 className="font-600 font-16 grey m-0 delete-modal-workflow-name-holder">
							{getCurrentStatus() === "active"
								? "Active"
								: "Inactive"}
						</h3>
					</div>
					<img
						className="ml-2 mr-2"
						style={{
							height: "12px",
							width: "12px",
						}}
						alt=""
						src={arrowRight}
					/>
					<div className="d-flex flex-row delete-modal-rule-name align-items-center px-3 py-2">
						<img
							className="mr-2"
							alt=""
							src={
								getCurrentStatus() === "active"
									? inactivecheck
									: check
							}
							style={{
								height: "12px",
								width: "12px",
							}}
						/>
						<h3 className="font-600 font-16 grey m-0 delete-modal-workflow-name-holder">
							{getCurrentStatus() === "active"
								? "Inactive"
								: "Active"}
						</h3>
					</div>
				</div>
				<h3 className="font-500 font-14 grey mb-3 mt-3 warning-text">
					You're changing the status from{" "}
					{getCurrentStatus() === "active" ? "Active " : "Inactive "}{" "}
					to
					{getCurrentStatus() === "active"
						? " Inactive"
						: " Active"}{" "}
					for the following rule:{" "}
				</h3>
				<h3 className="font-600 font-18 grey mb-3 delete-modal-workflow-name-holder">
					<div className="delete-modal-workflow-name">
						{rule_name ? rule_name : "rule"}
					</div>
				</h3>
				{getCurrentStatus() === "inactive" && (
					<p className="font-400 font-10 grey-1 mb-3">
						this means that everytime this rule is triggered and
						conditons match, an action will inititate.
					</p>
				)}
				<Button
					className="text-center"
					onClick={() => {
						handleStatusChange();
					}}
				>
					Continue{" "}
					{updatingStatus && (
						<div className=" ml-2 d-inline-flex align-items-center">
							{statusUpdated ? (
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

export default ChangeRuleStatusModal;
