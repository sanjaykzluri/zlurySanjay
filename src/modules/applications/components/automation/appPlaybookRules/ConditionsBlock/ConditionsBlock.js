import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Select } from "UIComponents/Select/Select";
import close from "assets/close.svg";
import add from "assets/icons/plus-blue-circle-reverse.svg";
import { Button } from "UIComponents/Button/Button";
import "./ConditionsBlock.scss";
import { getRuleAttributes } from "modules/workflow/service/api";
import RuleFieldRenderer from "../RuleFieldRenderer/RuleFieldRenderer";
// import { INPUT_TYPE } from "../../../../constants/ui";
import { setEditAutomationRule } from "../../redux/action";
import { AutomationRuleCustomFieldModel } from "modules/workflow/model/model";
import { CUSTOM_FIELD_INPUT_TYPE } from "modules/workflow/constants/constant";

export default function ConditionsBlock({
	automationRule,
	type,
	isEditable = true,
}) {
	const dispatch = useDispatch();
	const [showAddAttributes, setShowAddAttributes] = useState(false);
	const [showAddAttributesAt, setShowAddAttributesAt] = useState(null);
	const [attributes, setAttributes] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [conditions, setConditions] = useState({
		any: [],
	});

	const getOperatorsForCustomField = (obj) => {
		switch (obj.field_type) {
			case CUSTOM_FIELD_INPUT_TYPE.TEXT:
			case CUSTOM_FIELD_INPUT_TYPE.BOOL:
				return [
					{
						label: "equals",
						value: "keyValueArrayEqual",
					},
					{
						label: "not equals",
						value: "keyValueArrayNotEqual",
					},
				];
			case CUSTOM_FIELD_INPUT_TYPE.REFERENCE:
			case CUSTOM_FIELD_INPUT_TYPE.SELECT:
				return [
					{
						label: "equals",
						value: "keyValueArrayEqual",
					},
					{
						label: "not equals",
						value: "keyValueArrayNotEqual",
					},
				];
			case CUSTOM_FIELD_INPUT_TYPE.DATE:
				return [
					{
						label: "is before",
						value: "keyValueArrayLessThan",
					},
					{
						label: "is after",
						value: "keyValueArrayGreaterThan",
					},
				];
			default:
				return;
		}
	};

	const combineAttributesAndCustomFields = (obj) => {
		const { attributes, custom_fields } = obj;
		const data = [...(attributes || [])];
		custom_fields?.map((entity) =>
			entity?.custom_fields?.map((field) =>
				data.push({
					...new AutomationRuleCustomFieldModel(field),
					operators: getOperatorsForCustomField(field),
					logo: "https://zluri-assets-new.s3.us-west-1.amazonaws.com/files/assets/logos/custom-field.svg",
				})
			)
		);
		return data;
	};

	useEffect(() => {
		if (automationRule?.conditions) {
			setConditions(automationRule.conditions);
			if (attributes.length === 0) {
				const facts = automationRule?.selectedTrigger?.facts
					? automationRule.selectedTrigger.facts
					: ["application_coll"];
				setIsLoading(true);
				getRuleAttributes(facts).then((res) => {
					const newData = combineAttributesAndCustomFields(res.data);
					setAttributes(newData);
					setIsLoading(false);
				});
			}
		} else {
			setConditions({
				any: [],
			});
		}
	}, [automationRule]);

	const addAttribute = () => {
		setShowAddAttributes(true);
		const facts = automationRule?.selectedTrigger?.facts
			? automationRule.selectedTrigger.facts
			: ["application_coll"];
		setIsLoading(true);
		getRuleAttributes(facts).then((res) => {
			const newData = combineAttributesAndCustomFields(res.data);
			setAttributes(newData);
			setIsLoading(false);
		});
	};

	const addToConditions = (attr, at) => {
		const condition = Object.assign({}, conditions);
		if (at < 0) {
			condition.any.push({ all: [attr] });
		} else {
			condition.any[at]["all"].push(attr);
		}
		setShowAddAttributesAt(null);
		setShowAddAttributes(false);
		setConditions(condition);
	};

	const addAnyToConditions = () => {
		setShowAddAttributesAt(null);
		const condition = Object.assign({}, conditions);
		condition.any.push({ all: [] });
		setConditions(condition);
	};

	const handleOnChangeSetupForm = (e, attr, idx, index, key) => {
		const condition = Object.assign({}, conditions);
		let obj = { ...attr };
		if (key === "operator") {
			obj = { ...attr, operator: e.value };
		} else if (key === "entity") {
			obj = {
				...attr,
				value: attr.isCustomField
					? {
							keyPath: "field_id",
							valuePath: "field_value",
							key: attr._id,
							value: e.target.value,
							type: typeof e.target.value,
					  }
					: e.target.value,
				selectedValue: e.target.selectedValue,
			};
		} else {
			obj = {
				...attr,
				value: attr.isCustomField
					? {
							keyPath: "field_id",
							valuePath: "field_value",
							key: attr._id,
							value: e.target.value,
							type: typeof e.target.value,
					  }
					: e.target.value,
				selectedValue: e.target.selectedValue,
			};
		}
		condition.any[index]["all"][idx] = obj;
		const data = { ...automationRule, conditions: condition };
		dispatch(setEditAutomationRule(data));
		refresh && setRefresh(false);
	};

	// useEffect(() => {}, [refresh]);

	const conditionFormUI = (attr, idx, index) => {
		return (
			<RuleFieldRenderer
				key={`${attr?.operators[0]?._id}`}
				handleOnChangeSetupForm={(e) =>
					handleOnChangeSetupForm(e, attr, idx, index, attr.type)
				}
				field={attr}
				isEditable={isEditable}
				defaultInputClassName="border-0 font-13 rule-attribute-content rule-after-operator"
			/>
		);
	};

	const getOperatorValue = (attr, idx, index) => {
		const operator = conditions.any[index]["all"][idx].operator;
		const operators = conditions.any[index]["all"][idx].operators;
		return operator ? operators.find((op) => op.value === operator) : null;
	};

	const conditionsUI = conditions?.any?.map(
		(anyAttr, index) =>
			anyAttr?.all && (
				<div
					key={index}
					className="app-attribution-conditon-block border-radius-8"
				>
					{anyAttr?.all?.map((attr, idx) => (
						<div
							key={`${idx}_anyAttr_${attr?.operators[0]?._id}`}
							className="d-flex app-rule-attribute-condition-row mb-1"
						>
							<div className="border-radius-4 font-14 d-flex align-items-center justify-content-between">
								<div
									className="d-flex align-items-center pl-3 ml-3"
									style={{
										background: "rgba(34, 102, 226, 0.1)",
										width: "max-content",
									}}
								>
									{attr?.logo && (
										<img
											className="mr-2"
											height="20px"
											width="20px"
											src={
												attr.logo ||
												"https://zluri-assets-new.s3.us-west-1.amazonaws.com/files/assets/logos/custom-field.svg"
											}
											alt=""
										/>
									)}
									<p
										className="m-0 font-13 font-weight-bold w-auto"
										style={{
											minWidth: "fit-content",
											color: "#484848",
										}}
									>
										{attr.name}
									</p>
									<Select
										key={Math.random()}
										disabled={!isEditable}
										value={
											getOperatorValue(
												attr,
												idx,
												index
											) || null
										}
										// className="black-1 w-auto text-lowercase attribute-operators-select rule-if-operator"
										inputClassName="rule-attribute-content"
										optionsFieldClassName="rule-option-style"
										className="rule-after-operator"
										placeholderClassName="rule-select-placeholder"
										optionsContainerClassName="rule-select-options"
										selectorClassStyle={{
											width: "max-content",
										}}
										placeholder="select operator"
										options={attr.operators}
										fieldNames={{
											label: "label",
											value: "value",
										}}
										onChange={(e) => {
											handleOnChangeSetupForm(
												e,
												attr,
												idx,
												index,
												"operator"
											);
										}}
									/>
									{conditionFormUI(attr, idx, index)}
								</div>
							</div>
							{isEditable && (
								<>
									<img
										alt=""
										src={close}
										width={14}
										className="ml-2 pointer"
										onClick={() => {
											const condition = Object.assign(
												{},
												conditions
											);
											condition.any[index]["all"].splice(
												idx,
												1
											);
											if (
												condition.any[index]["all"]
													.length === 0
											) {
												condition.any.splice(index, 1);
											}
											const data = {
												...automationRule,
												conditions: condition,
											};
											dispatch(
												setEditAutomationRule(data)
											);
										}}
									/>
									<Button
										className="ml-2 bold-600 text-center px-0 if-condition-button"
										onClick={() => {
											setShowAddAttributesAt(index);
										}}
									>
										And
									</Button>
								</>
							)}
							{anyAttr.all.length - 1 === idx && isEditable && (
								<Button
									className="d-block ml-2 bold-600 text-center px-0 if-condition-button"
									onClick={() => {
										addAnyToConditions();
									}}
								>
									Or
								</Button>
							)}
						</div>
					))}
					{showAddAttributesAt === index && (
						<Select
							filter
							search
							options={attributes}
							inputClassName="rule-attribute-content"
							optionsFieldClassName="rule-option-style"
							placeholder="Search condition"
							className="rule-if-attribute"
							isLoading={isLoading}
							fieldNames={{
								label: "name",
								value: "path",
							}}
							onChange={(attribute) => {
								addToConditions(attribute, index);
							}}
						/>
					)}
					{anyAttr.all.length === 0 && (
						<Select
							filter
							search
							options={attributes}
							inputClassName="rule-attribute-content"
							optionsFieldClassName="rule-option-style"
							placeholder="Search condition"
							className="rule-if-attribute"
							isLoading={isLoading}
							fieldNames={{
								label: "name",
								value: "path",
							}}
							onChange={(attribute) => {
								addToConditions(attribute, index);
							}}
						/>
					)}
				</div>
			)
	);

	return (
		<div className="d-flex flex-row mt-3 mb-3">
			<div className="rule_start_text">if</div>

			<div className="rule-block">
				{!showAddAttributes && conditions.any.length === 0 && (
					<Button
						className="d-block bold-600"
						onClick={() => {
							addAttribute();
						}}
					>
						<img src={add} height="14" />
						<span className="ml-2">Add attribute</span>
					</Button>
				)}
				{showAddAttributes && (
					<Select
						filter
						search
						options={attributes}
						placeholder="Search condition"
						inputClassName="rule-attribute-content"
						optionsFieldClassName="rule-option-style"
						className="rule-if-attribute"
						isLoading={isLoading}
						fieldNames={{
							label: "name",
							value: "path",
							logo: "logo",
						}}
						onChange={(attribute) => {
							addToConditions(attribute, -1);
						}}
						style={{ maxWidth: "268px" }}
					/>
				)}
				{conditions && conditionsUI}
			</div>
		</div>
	);
}
