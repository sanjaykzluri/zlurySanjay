import React, { useEffect, useState } from "react";
import "./AutomationRuleBuilder.css";
import { Link, useHistory, useLocation } from "react-router-dom";
import WhenBlock from "../WhenBlock/WhenBlock";
import ConditionsBlock from "../ConditionsBlock/ConditionsBlock";
import ThenBlock from "../ThenBlock/ThenBlock";
import Line from "../../../../assets/Line1.svg";
import IfBlock from "../IfBlock/IfBlock";
import AppRequisitionThenBlock from "../AppRequisition/AppRequistionThenBlock";

export default function AutomationRuleBuilder({
	rule,
	workflowType,
	type,
	showResetConditionModal,
	setShowResetConditionModal,
}) {
	const history = useHistory();
	const location = useLocation();
	const ruleId = location.pathname.split("/")[3];
	return (
		<div className="row">
			<div className="col-md-12 mt-3 mb-6">
				<div className="m-2">
					{/* {type === "apprequisition" && (
						<IfBlock
							rule={rule}
							workflowType={workflowType}
							isEditable={!rule?.is_default}
					/> */}
					{/* {type !== "apprequisition" && ( */}
					<WhenBlock
						rule={rule}
						workflowType={workflowType}
						setShowResetConditionModal={setShowResetConditionModal}
						isEditable={!rule.is_default}
					/>
					{/* )} */}
					{!(type === "apprequisition" && rule.is_default) && (
						<ConditionsBlock
							rule={rule}
							type={type}
							isEditable={!rule?.is_default}
						/>
					)}
					<img src={Line} alt="line" style={{ marginLeft: "50%" }} />
					{type === "apprequisition" ? (
						<AppRequisitionThenBlock
							rule={rule}
							workflowType={workflowType}
						/>
					) : (
						<ThenBlock rule={rule} workflowType={workflowType} />
					)}
				</div>
			</div>
		</div>
	);
}
