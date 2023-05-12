import React, { useState, useEffect } from "react";
import { Select } from "../../../../UIComponents/Select/Select";
import close from "../../../../assets/close.svg";
import add from "../../../../assets/icons/plus-blue-circle-reverse.svg";
import { Button } from "UIComponents/Button/Button";
import "../ConditionsBlock/ConditionsBlock.scss";
import { getRuleTriggers } from "modules/workflow/service/api";
import { useDispatch, useSelector } from "react-redux";
import { setEditAutomationRule } from "../../redux/workflow";

export default function WhenBlock({
	rule,
	workflowType,
	setShowResetConditionModal,
	isEditable,
}) {
	const dispatch = useDispatch();

	const [showAddTrigger, setShowAddTrigger] = useState(false);
	const [triggers, setTriggers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [trigger, setTrigger] = useState();

	useEffect(() => {
		if (
			!rule?.trigger ||
			(rule?.trigger && Object.keys(rule?.trigger).length === 0)
		) {
			setTrigger(null);
			setShowAddTrigger(false);
		}
		if (
			rule?.triggerName ||
			// rule?.triggerValues ||
			(rule?.trigger && Object.keys(rule?.trigger).length > 0)
		) {
			const data = {
				...rule,
				triggerName:
					//  rule?.triggerName ||
					rule?.trigger?.title || "",
				triggerValues:
					// rule?.triggerValues ||
					rule?.trigger?.values || [],
			};
			setTrigger(data);
		}
	}, [rule]);

	const addTrigger = () => {
		setShowAddTrigger(true);
		if (!triggers || triggers?.length === 0) {
			setIsLoading(true);
			getRuleTriggers(rule.tag).then((res) => {
				setTriggers(res);
				setIsLoading(false);
			});
		}
	};

	const onTriggerSelect = (trigger) => {
		const data = {
			// ...rule,
			audit_log_event: trigger.audit_log_event,
			triggerName: trigger.title,
			trigger: { ...rule?.trigger, ...trigger },
			triggerValues: trigger.values,
		};
		setTrigger(trigger);
		setShowAddTrigger(false);
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
			};
			dispatch(setEditAutomationRule(data));
		}
	};

	return (
		<div
			style={{
				backgroundColor: "#FFFFFF",
				padding: "16px",
				borderRadius: "4px",
				marginTop: "3px",
			}}
		>
			<div>
				<div className="d-flex flex-row align-items-center">
					<h4 className="tab_content_header flex-1 m-0">WHEN..</h4>
					<p className="font-10 grey-1 m-0">
						Define a trigger that runs your automation
					</p>
				</div>
				<div
					style={{ borderTop: "1px solid #EBEBEB", marginTop: "8px" }}
				/>
				<div className="rule-block mt-3 mb-3 border-radius-8">
					{!showAddTrigger && !trigger && (
						<Button
							className="d-block bold-600"
							onClick={() => {
								addTrigger();
							}}
							type="dashed"
						>
							<img alt="" src={add} height="14" />
							<span className="ml-2">Add trigger</span>
						</Button>
					)}
					{showAddTrigger && (
						<Select
							filter
							search
							options={triggers}
							placeholder="Search for triggers"
							isLoading={isLoading}
							fieldNames={{ label: "title", value: "path" }}
							onChange={(trigger) => {
								onTriggerSelect(trigger);
							}}
						/>
					)}
					{trigger && (
						<div className="attribution-conditon-block  mb-5 p-3 border-radius-8">
							<div className="d-flex  justify-content-between workflow-trigger-row">
								<div className="flex-fill border-radius-4 font-14 d-flex white-bg align-items-center justify-content-between mb-2  mt-2 pl-3 pr-3 pt-1 pb-1">
									<div className="d-flex w-100 align-items-center flex-wrap">
										<p className="m-0 font-14 black-1 w-auto mr-3 rule-block mt-3 mb-3 text-capitalize">
											{trigger.title ||
												trigger?.triggerName}
										</p>
										{false &&
											trigger?.triggerValues?.length >
												0 && (
												<Select
													className="black-1 w-auto mr-3 grey-bg text-lowercase attribute-operators-select"
													options={
														trigger?.triggerValues
															? trigger.triggerValues
															: null
													}
													value={
														(trigger &&
															trigger.triggerValues &&
															trigger
																.triggerValues[0]) ||
														null
													}
													fieldNames={{
														label: "label",
														value: "value",
													}}
													placeholder="Select"
													onChange={(obj) => {
														onSelectTriggerValue(
															obj
														);
													}}
												/>
											)}
									</div>
									{isEditable && (
										<img
											alt=""
											src={close}
											width={14}
											className="mr-1 pointer"
											onClick={() => {
												setShowResetConditionModal(
													true
												);
											}}
										/>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
