import React, { useEffect, useState } from "react";
import { Breadcrumb, Spinner } from "react-bootstrap";
import { useHistory } from "react-router";
import backIcon from "../../../../assets/back-nav.svg";
import { Button } from "../../../../UIComponents/Button/Button";
// import playButton from "../../../../assets/playButton.svg";
import "./AutomationRuleHeader.css";
import AutomationRuleName from "../AutomationRuleName/AutomationRuleName";
import { useDispatch, useSelector } from "react-redux";
import { updateAutomationRule } from "../../redux/workflow";
import { trackActionSegment } from "modules/shared/utils/segment";
import { WorkFlowAutomationRuleRequestModel } from "modules/workflow/model/model";
import _ from "underscore";
import { validation } from "utils/automationRuleValidator";

function AutomationRuleHeader(props) {
	const { workflowType, setShowDiscardModal, rule } = props;
	const history = useHistory();
	const dispatch = useDispatch();

	const initialAutomationRuleState = useSelector(
		(state) => state.workflows.initialAutomationRuleState
	);

	const [btnLoading, setBtnLoading] = useState(false);

	useEffect(() => {
		setBtnLoading(false);
	}, [rule]);

	const addCondition = () => {
		if (
			!rule?.conditions ||
			(rule?.conditions &&
				Object.keys(rule?.conditions).length > 0 &&
				rule?.conditions?.any?.length === 0)
		) {
			return {
				any: [
					{
						all: [
							{
								fact: "no_conditions",
								operator: "equal",
								value: "true",
							},
						],
					},
				],
			};
		} else {
			return rule?.conditions;
		}
	};

	const saveRule = () => {
		const allowedTags = ["onboarding", "offboarding"];
		setBtnLoading(true);
		trackActionSegment(
			"Clicked on Save Rule Button in Automation Rules Section",
			{ rule: rule },
			true
		);
		const ruleData = { ...rule, conditions: addCondition() };
		if (!ruleData.showNotifyUsers) {
			ruleData.notifyUsers = [];
		}
		if (ruleData?.events?.[0]?.type === "auto_rejection") {
			ruleData.approvers = [];
		}
		if (allowedTags.includes(ruleData?.tag)) {
			ruleData.stop_processing_other_rules = false;
			ruleData.stopProcessingOtherRules = false;
		}
		dispatch(updateAutomationRule(ruleData));
	};

	const goBack = () => {
		const ruleData = { ...rule };
		if (!ruleData.showNotifyUsers) {
			ruleData.notifyUsers = [];
		}
		if (
			!_.isEqual(
				new WorkFlowAutomationRuleRequestModel(
					initialAutomationRuleState
				),
				new WorkFlowAutomationRuleRequestModel(ruleData)
			)
		) {
			setShowDiscardModal(true);
		} else {
			history.push(`/workflows/${workflowType}#rules`);
		}
	};

	return (
		<div className="NavH border-bottom">
			<div
				className="ins-1 "
				style={{
					paddingRight: "10px",
					paddingBottom: "10px",
					paddingTop: "10px",
				}}
			>
				<Breadcrumb bsPrefix="my-bread">
					<img
						alt=""
						src={backIcon}
						width={14}
						className="mr-2 cursor-pointer mt-auto mb-auto"
						onClick={() => {
							goBack();
						}}
					/>
					<button
						onClick={() => {
							goBack();
						}}
						className="my-bread-item my-bread-itemnew o-5"
					>
						Automation Rules
					</button>
					<Breadcrumb.Item
						active
						bsPrefix="my-bread-item"
						className="d-flex"
					>
						<AutomationRuleName rule={rule} />
					</Breadcrumb.Item>
				</Breadcrumb>
			</div>
			<div className="ins-2" style={{ alignItems: "center" }}>
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
		</div>
	);
}

export default AutomationRuleHeader;
