import React, { useEffect, useState } from "react";
import "./AutomationRuleBuilder.css";
import { Link, useHistory, useLocation } from "react-router-dom";
import WhenBlock from "../WhenBlock/WhenBlock";
import ConditionsBlock from "../ConditionsBlock/ConditionsBlock";
import ThenBlock from "../ThenBlock/ThenBlock";
import Line from "assets/Line1.svg";

export default function AutomationRuleBuilder({
	rule,
	workflowType,
	application,
	type,
	ruleFormErrors,
	setRuleFormErrors,
}) {
	return (
		<div>
			<div className="col-md-12 mt-4 mb-6">
				<div className="m-2">
					<WhenBlock
						rule={rule}
						workflowType={workflowType}
						application={application}
						ruleFormErrors={ruleFormErrors}
						setRuleFormErrors={setRuleFormErrors}
					/>
					<ConditionsBlock
						automationRule={rule}
						type={type}
						isEditable={!rule?.is_default}
					/>
					<hr style={{ marginBottom: "36px" }} />
					<ThenBlock
						rule={rule}
						workflowType={workflowType}
						ruleFormErrors={ruleFormErrors}
						setRuleFormErrors={setRuleFormErrors}
					/>
				</div>
			</div>
		</div>
	);
}
