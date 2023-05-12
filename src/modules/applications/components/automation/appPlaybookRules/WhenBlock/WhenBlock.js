import React, { useState, useEffect } from "react";
import { Select } from "../../../../../../UIComponents/Select/Select";
import close from "assets/close.svg";
import add from "assets/icons/plus-blue-circle-reverse.svg";
import { Button } from "UIComponents/Button/Button";
import "../ConditionsBlock/ConditionsBlock.scss";
import "../AutomationRuleBuilder/AutomationRuleBuilder.css";
import { getRuleTriggers } from "../../../../../workflow/service/api";
import { useDispatch } from "react-redux";
import { setEditAutomationRule } from "../../redux/action";
import { updateTriggerTitle } from "../../../../utils/applicationutils";

export default function WhenBlock({
	rule,
	workflowType,
	application,
	ruleFormErrors,
	setRuleFormErrors,
}) {
	const dispatch = useDispatch();

	const [showAddTrigger, setShowAddTrigger] = useState(false);
	const [triggers, setTriggers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [trigger, setTrigger] = useState();
	const [triggerOptions, setTriggerOptions] = useState(null);

	useEffect(() => {
		if (rule?.triggerName || rule?.triggerValues) {
			const data = {
				...rule,
				triggerName: rule?.triggerName,
				triggerValues: rule?.triggerValues,
				title: rule?.triggerName,
				values: rule?.triggerValues,
			};
			setTrigger(data);
			!trigger && onTriggerSelect(data || null);
		}
	}, [rule]);

	const addTrigger = () => {
		setShowAddTrigger(true);
		if (!triggers || triggers?.length === 0) {
			setIsLoading(true);
			const tag = rule?.tag ? "app_rule" : undefined;
			getRuleTriggers(tag).then((res) => {
				const new_triggers = [];
				res.map((tri) => {
					new_triggers.push({
						...tri,
						title: updateTriggerTitle(tri.title, application),
					});
				});
				setTriggers(new_triggers);
				setIsLoading(false);
			});
		}
	};

	const onTriggerSelect = (trigger) => {
		const data = {
			// ...rule,
			audit_log_event: trigger.audit_log_event,
			triggerName: trigger.title,
			selectedTrigger: trigger,
			triggerValues: trigger.values,
			selected_trigger: {
				value: [],
			},
		};
		setTrigger(trigger);
		setTriggerOptions(trigger.values);
		setShowAddTrigger(false);
		setRuleFormErrors({
			...ruleFormErrors,
			whenError: { ...ruleFormErrors.whenError, error: false },
			thenError: { ...ruleFormErrors.thenError, error: false },
		});
		dispatch(setEditAutomationRule(data));
	};

	const onSelectTriggerValue = (obj) => {
		if (
			(rule?.triggerValues &&
				rule?.triggerValues[0] &&
				rule?.triggerValues[0]?.value !== obj.value) ||
			!rule?.triggerValues
		) {
			const data = {
				...rule,
				triggerValues: [obj],
				selected_trigger: {
					value: [obj],
				},
			};
			dispatch(setEditAutomationRule(data));
		}
	};

	return (
		<div className="d-flex flex-row mt-16">
			<div className="rule_start_text">when</div>
			<div className="rule-block mb-3">
				{!showAddTrigger && !trigger && (
					<>
						<Button
							className="d-block bold-600"
							onClick={() => {
								addTrigger();
							}}
						>
							<img alt="" src={add} height="14" />
							<span className="ml-2">Add trigger</span>
						</Button>
						{ruleFormErrors?.whenError?.error && (
							<div className="rule-form-error">
								{ruleFormErrors?.whenError?.message}
							</div>
						)}
					</>
				)}
				{showAddTrigger && (
					<>
						<Select
							filter
							search
							options={triggers}
							placeholder="Search for triggers"
							inputClassName="rule-attribute-content"
							optionsFieldClassName="rule-option-style"
							className={`rule-if-attribute ${
								ruleFormErrors?.whenError?.error
									? "rule-select-form-error"
									: ""
							}`}
							isLoading={isLoading}
							fieldNames={{ label: "title", value: "path" }}
							onChange={(trigger) => {
								onTriggerSelect(trigger);
							}}
						/>
						{ruleFormErrors?.whenError?.error && (
							<div className="rule-form-error">
								{ruleFormErrors?.whenError?.message}
							</div>
						)}
					</>
				)}
				{trigger && (
					<div className="app-attribution-conditon-block border-radius-8">
						<div className="d-flex app-rule-attribute-condition-row justify-content-between">
							<div className="flex-fill border-radius-4 font-14 d-flex align-items-center justify-content-between">
								<div
									className="d-flex w-100 align-items-center px-3 ml-3 flex-wrap"
									style={{
										background: "rgba(34, 102, 226, 0.1)",
										minHeight: "36px",
									}}
								>
									<p
										className="m-0 font-13 font-weight-bold w-auto text-capitalize"
										style={{
											minWidth: "fit-content",
											color: "#484848",
										}}
									>
										{updateTriggerTitle(
											trigger?.title ||
												trigger?.triggerName,
											application
										)}
									</p>
									{/* {trigger?.triggerValues?.length > 0 && (
										<Select
											className="black-1 w-auto text-lowercase attribute-operators-select rule-if-operator"
											inputClassName="rule-attribute-content"
											optionsFieldClassName="rule-option-style"
											options={triggerOptions}
											value={
												(trigger &&
													trigger.selected_trigger
														?.value &&
													trigger.selected_trigger
														?.value.length > 0 &&
													trigger.selected_trigger
														?.value[0]) ||
												null
											}
											fieldNames={{
												label: "label",
												value: "value",
											}}
											placeholder="Select"
											onChange={(obj) => {
												onSelectTriggerValue(obj);
											}}
										/>
									)} */}
								</div>
								<img
									alt=""
									src={close}
									width={14}
									className="ml-3 mr-1 pointer"
									onClick={() => {
										setTrigger(null);
										setShowAddTrigger(false);
										let data = {};
										data.triggerName = null;
										data.triggerValues = null;
										data.audit_log_event = null;
										data.selectedTrigger = null;
										data.conditions = null;
										dispatch(setEditAutomationRule(data));
									}}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
