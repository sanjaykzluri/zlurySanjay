import React, { useEffect, useState } from "react";
import AutomationRuleHeader from "../../components/AutomationRuleHeader/AutomationRuleHeader";
import AutomationRuleSidebar from "../../components/AutomationRuleSidebar/AutomationRuleSidebar";
import AutomationRuleBuilder from "../../components/AutomationRuleBuilder/AutomationRuleBuilder";
import "../Workflow/Workflow.css";
import { useDispatch, useSelector } from "react-redux";
import { getAutomationRule } from "../../redux/workflow";
import { useLocation, useHistory } from "react-router-dom";
import { LoaderPage } from "../../../../common/Loader/LoaderPage";
import DiscardModal from "../../components/DiscardModal/DiscardModal";
import ResetConditionModal from "modules/workflow/components/ResetConditionModal/ResetConditionModal";

function AutomationRule({ type }) {
	const history = useHistory();
	const [state] = useState(history?.location?.state);
	const dispatch = useDispatch();
	const location = useLocation();
	const ruleId = location.pathname.split("/")[3];
	const automationRule = useSelector(
		(state) => state.workflows.automationRule
	);
	const [isLoading, setIsLoading] = useState(true);
	const [showDiscardModal, setShowDiscardModal] = useState(false);
	const [showResetConditionModal, setShowResetConditionModal] =
		useState(false);

	const [rule, setRule] = useState(null);

	useEffect(() => {
		if (ruleId) {
			dispatch(getAutomationRule(ruleId));
		}
	}, [dispatch, ruleId]);

	useEffect(() => {
		if (automationRule) {
			setRule(automationRule);
			setIsLoading(false);
		}
	}, [automationRule]);

	return (
		<>
			<div className="container-fluid">
				{isLoading ? (
					<LoaderPage />
				) : (
					<div className="row">
						<div className="col-md-12">
							<header>
								<AutomationRuleHeader
									setShowDiscardModal={setShowDiscardModal}
									showDiscardModal={showDiscardModal}
									workflowType={rule.tag}
									rule={rule}
								/>
							</header>
							<section>
								<div className="row">
									<div className="col-md-8 z-workflow-rule-container">
										<AutomationRuleBuilder
											rule={rule}
											workflowType={rule.tag}
											type={type}
											showResetConditionModal={
												showResetConditionModal
											}
											setShowResetConditionModal={
												setShowResetConditionModal
											}
										/>
									</div>
									<div
										style={{ backgroundColor: "#F5F6F9" }}
										className="col-md-4 z-workflow-sidebar p-0 pr-3"
									>
										<AutomationRuleSidebar
											rule={rule}
											type={type}
										/>
									</div>
								</div>
							</section>
						</div>
					</div>
				)}
			</div>
			{showDiscardModal && (
				<DiscardModal
					workflowType={rule.tag}
					setShowDiscardModal={setShowDiscardModal}
					showDiscardModal={showDiscardModal}
					rule={rule}
				/>
			)}
			{showResetConditionModal && (
				<ResetConditionModal
					workflowType={rule.tag}
					setShowResetConditionModal={setShowResetConditionModal}
					showResetConditionModal={showResetConditionModal}
					rule={rule}
				/>
			)}
		</>
	);
}

export default AutomationRule;
