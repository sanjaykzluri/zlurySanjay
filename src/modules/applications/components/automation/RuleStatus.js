import ChangeRuleStatusModal from "modules/workflow/components/ChangeRuleStatusModal/ChangeRuleStatusModal";
import React from "react";
import { useState } from "react";
import ToggleSwitch from "react-switch";

const RuleStatus = ({ rule, handleRefresh }) => {
	const [showRuleStatusModal, setShowRuleStatusModal] = useState(false);
	const [showStatusLoader, setShowStatusLoader] = useState(false);

	const statusFormatter = (rule) => {
		let status = rule?.status === "active" ? true : false;
		return (
			<div className="workflows-workflow-status">
				<div className="flex flex-row align-items-center workflow-status-component">
					<div className="d-flex flex-column workflow-status-container">
						<div
							className="truncate_10vw workflow-status-user"
							style={{ margin: "auto" }}
						>
							<div
								style={{
									display: "flex",
									width: "auto",
								}}
							>
								<div
									className="align-self-centermt-1"
									style={{
										minWidth: "126px",
									}}
								>
									<h4 className="grey-1 font-12 m-0">
										<ToggleSwitch
											height={18}
											width={31}
											checked={status}
											onChange={(v) => {
												if (!showStatusLoader) {
													handleStatusChange(v, rule);
												}
											}}
											checkedIcon={false}
											uncheckedIcon={false}
											onColor={"#2266E2"}
											offColor={"#EBEBEB"}
										/>
										<span
											className="ml-2 position-relative"
											style={{
												bottom: "5px",
											}}
										>
											{rule?.status
												?.charAt(0)
												?.toUpperCase() +
												rule?.status?.slice(1)}
										</span>
									</h4>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const handleStatusChange = (status, rule) => {
		const data = { ...rule, status: status ? "active" : "inactive" };
		setShowRuleStatusModal(true);
	};
	return (
		<>
			<div className="d-flex flex-1">{statusFormatter(rule)}</div>

			{showRuleStatusModal && (
				<ChangeRuleStatusModal
					rule={rule}
					type={"#app_rules"}
					rule_id={rule?.rule_id || rule?._id}
					rule_name={rule?.rule_name || rule?.name}
					setShowRuleStatusModal={setShowRuleStatusModal}
					showRuleStatusModal={showRuleStatusModal}
					refreshTable={handleRefresh}
					// upadteAppRuleSerive={updateRule}
				/>
			)}
		</>
	);
};

export default RuleStatus;
