import { getRuleTriggers } from "modules/workflow/service/api";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "UIComponents/Button/Button";
import _ from "underscore";
import close from "../../../../assets/close.svg";
import add from "../../../../assets/icons/plus-blue-circle-reverse.svg";
import { Select } from "../../../../UIComponents/Select/Select";
import { setEditAutomationRule } from "../../redux/workflow";
import "../ConditionsBlock/ConditionsBlock.scss";

const APP_REQUISITION_OPTIONS = [
	{ name: "License or Application", key: "license_or_application" },
	{ name: "License", key: "license" },
	{ name: "Application", key: "application" },
];

export default function IfBlock({ rule, workflowType, isEditable }) {
	const dispatch = useDispatch();

	const [triggers, setTriggers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [trigger, setTrigger] = useState();

	useEffect(() => {
		if (rule?.triggerName && rule?.triggerValues) {
			const data = {
				...rule,
				triggerName: rule.triggerName,
			};
			setTrigger(data);
		}
		
	}, [JSON.stringify(rule)]);
	
	useEffect(() => {
		if(rule?.id){
		getRuleTriggers(rule.tag).then((res) => {
			if(res && !_.isEmpty(res)){
			const data = res.map((item) => {
				return {
					...item,
					triggerName: item.name,
					triggerValues: item.values,
					triggerIdentifier: item.identifier,
				};
			});
			setTriggers(data);
			onTriggerSelect(data[0]);
			setIsLoading(false);
		}
		});
	}

	}, [rule?.id]);
	
	

	const onTriggerSelect = (trigger) => {
		const data = {
			triggerIdentifier: trigger.identifier,
			triggerName: trigger.triggerName,
		};
		setTrigger(trigger);
		dispatch(setEditAutomationRule(data));
	};

	const onSelectTriggerValue = (obj) => {
		if (
			(Array.isArray(rule?.triggerValues) && rule?.triggerValues.length > 0 &&
				rule?.triggerValues.find(item => obj.name === item.value) &&
				rule?.triggerValues[0]?.value !== obj.value) ||
			!rule?.triggerValues
		) {
			const data = {
				trigger: {
					field: rule?.triggerName,
					value: obj.name
				},
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
					<h4 className="tab_content_header flex-1 m-0">IF..</h4>
				</div>
				<div
					style={{ borderTop: "1px solid #EBEBEB", marginTop: "8px" }}
				/>
				<div className="rule-block mt-3 mb-3 border-radius-8">
					<div className="d-flex my-3">
						<Select
							filter
							search
							value={APP_REQUISITION_OPTIONS.find(opt => opt.name === rule?.trigger?.value) ? [APP_REQUISITION_OPTIONS.find(opt => opt.name === rule?.trigger?.value)] : [APP_REQUISITION_OPTIONS[0]]}
							disabled={!isEditable}
							options={APP_REQUISITION_OPTIONS}
                            className="w-25"
							placeholder={"Search for attributes"}
							isLoading={isLoading}
							fieldNames={{ label: "name", value: "path" }}
							onChange={(attribute) => {
								onSelectTriggerValue(attribute, -1);
							}}
							mode="single"
						/>
						<div className="d-flex justify-content-center align-items-center ml-2 font-14">
							{" "}
							is requested
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}