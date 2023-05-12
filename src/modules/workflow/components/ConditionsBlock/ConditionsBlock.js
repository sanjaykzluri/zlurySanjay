import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "../../../../UIComponents/Select/Select";
import close from "../../../../assets/close.svg";
import add from "../../../../assets/icons/plus-blue-circle-reverse.svg";
import { Button } from "UIComponents/Button/Button";
import "./ConditionsBlock.scss";
import { getRuleAttributes } from "modules/workflow/service/api";
import RuleFieldRenderer from "../RuleFieldRenderer/RuleFieldRenderer";
import { INPUT_TYPE } from "../../../../constants/ui";
import { setEditAutomationRule } from "../../redux/workflow";
import { AutomationRuleCustomFieldModel } from "modules/workflow/model/model";
import { CUSTOM_FIELD_INPUT_TYPE } from "modules/workflow/constants/constant";
import _ from "underscore";

export default function ConditionsBlock({
	rule,
	type,
	isEditable = true,
	label,
}) {
	const dispatch = useDispatch();
	const automationRule = useSelector(
		(state) => state.workflows.automationRule
	);

	const [showAddAttributes, setShowAddAttributes] = useState(false);
	const [showAddAttributesAt, setShowAddAttributesAt] = useState(null);
	const [attributes, setAttributes] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
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
					// {
					// 	label: "is in",
					// 	value: "in",
					// },
				];
			case CUSTOM_FIELD_INPUT_TYPE.DATE:
				return [
					// {
					// 	label: "is on",
					// 	value: "keyValueArrayEqual",
					// },
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

	const deleteEmptyCondition = () => {
		if (
			rule?.conditions &&
			Object.keys(rule?.conditions).length > 0 &&
			rule?.conditions?.any?.length > 0 &&
			rule?.conditions?.any?.[0]?.all?.[0]?.fact === "no_conditions"
		) {
			return {
				any: [],
			};
		} else {
			return rule?.conditions;
		}
	};

	useEffect(() => {
		if (!rule?.trigger || _.isElement(rule?.trigger)) {
			setShowAddAttributes(false);
			setShowAddAttributesAt(null);
			setIsLoading(false);
		}
		if (rule?.conditions) {
			let emptyConditions = deleteEmptyCondition();
			setConditions(emptyConditions);
			if (attributes.length === 0) {
				const facts = rule?.trigger?.facts;
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
	}, [rule]);

	const addAttribute = () => {
		setShowAddAttributes(true);
		const facts = rule?.trigger?.facts;
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
		dispatch(setEditAutomationRule({ conditions: condition }));
	};

	const addAnyToConditions = () => {
		setShowAddAttributesAt(null);
		const condition = Object.assign({}, conditions);
		condition.any.push({ all: [] });
		setConditions(condition);
		dispatch(setEditAutomationRule({ conditions: condition }));
	};

	const handleOnChangeSetupForm = (e, attr, idx, index, key) => {
		const condition = Object.assign({}, conditions);
		let obj = { ...attr };
		if (key === "operator") {
			delete attr.value;
			delete attr.selectedValue;
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
		// setConditions(condition);
		const data = { ...automationRule, conditions: condition };
		dispatch(setEditAutomationRule(data));
	};

	const conditionFormUI = (attr, idx, index) => {
		return (
			<RuleFieldRenderer
				key={`${attr?.operators[0]?._id}`}
				handleOnChangeSetupForm={(e) =>
					handleOnChangeSetupForm(e, attr, idx, index, attr.type)
				}
				field={attr}
				isEditable={isEditable}
			/>
		);
	};

	const getOperatorValue = (attr, idx, index) => {
		const operator = conditions.any[index]["all"][idx].operator;
		const operators = conditions.any[index]["all"][idx].operators;
		return operator ? operators.find((op) => op.value === operator) : null;
	};

	const conditionsUI = conditions.any.map((anyAttr, index) => (
		<div
			key={index}
			className="attribution-conditon-block  mb-5 p-3 border-radius-8"
		>
			{anyAttr.all.map((attr, idx) => (
				<div
					key={`${idx}_anyAttr_${attr?.operators[0]?._id}`}
					className="d-flex  attribute-condition-row justify-content-between"
				>
					<div className="flex-fill border-radius-4 font-14 d-flex white-bg align-items-center justify-content-between mb-2  mt-2 pl-3 pr-3 pt-1 pb-1">
						<div className="d-flex w-100 align-items-center flex-wrap">
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
							<p className="m-0 font-14 black-1 w-auto mr-3 my-1">
								{attr.name}
							</p>
							<Select
								key={Math.random()}
								disabled={!isEditable}
								value={
									getOperatorValue(attr, idx, index) || null
								}
								className="black-1 w-auto mr-3 grey-bg text-lowercase attribute-operators-select my-1"
								options={attr.operators}
								fieldNames={{
									label: "label",
									value: "value",
								}}
								placeholder="Select"
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
							{attr?.operator &&
								conditionFormUI(attr, idx, index)}
						</div>
						{isEditable && (
							<img
								alt=""
								src={close}
								width={14}
								className="mr-1 pointer"
								onClick={() => {
									const condition = Object.assign(
										{},
										conditions
									);
									condition.any[index]["all"].splice(idx, 1);
									if (
										condition.any[index]["all"].length === 0
									) {
										condition.any.splice(index, 1);
									}
									const data = {
										...automationRule,
										conditions: condition,
									};
									dispatch(setEditAutomationRule(data));
								}}
							/>
						)}
					</div>
					{isEditable && (
						<Button
							className="mt-3 mb-3 ml-2 reverse bold-600  text-center"
							type="reverse"
							onClick={() => {
								setShowAddAttributesAt(index);
							}}
						>
							And
						</Button>
					)}
					{anyAttr.all.length - 1 === idx && isEditable && (
						<Button
							className="mt-3 mb-3 ml-2 reverse bold-600  text-center"
							type="reverse"
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
					placeholder="Search for attributes"
					isLoading={isLoading}
					fieldNames={{
						label: "name",
						value: "path",
						logo: "logo",
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
					placeholder="Search for attributes"
					isLoading={isLoading}
					fieldNames={{
						label: "name",
						value: "path",
						logo: "logo",
					}}
					onChange={(attribute) => {
						addToConditions(attribute, index);
					}}
				/>
			)}
		</div>
	));

	const resetConditions = () => {
		const data = {
			conditions: {
				any: [],
			},
		};
		dispatch(setEditAutomationRule(data));
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
					<h4 className="tab_content_header flex-1 m-0">
						CONDITIONS
						<p
							onClick={() => {
								resetConditions();
							}}
							style={{ color: "#2266E2", cursor: "pointer" }}
							className="font-10 my-1"
						>
							Reset Conditions
						</p>
					</h4>
					<p className="font-10 grey-1 m-0">
						Selectively run the automation based on these conditions
					</p>
				</div>
				<div
					style={{ borderTop: "1px solid #EBEBEB", marginTop: "8px" }}
				/>
				<div className="rule-block mt-3 mb-3 border-radius-8">
					{!showAddAttributes && conditions.any.length === 0 && (
						<Button
							className="d-block bold-600"
							onClick={() => {
								addAttribute();
							}}
							type="dashed"
						>
							<img alt="" src={add} height="14" />
							<span className="ml-2">Add attribute</span>
						</Button>
					)}
					{showAddAttributes && (
						<Select
							filter
							search
							options={attributes}
							placeholder="Search for attributes"
							isLoading={isLoading}
							fieldNames={{
								label: "name",
								value: "path",
								logo: "logo",
							}}
							onChange={(attribute) => {
								addToConditions(attribute, -1);
							}}
						/>
					)}
					{conditionsUI}
				</div>
			</div>
		</div>
	);
}
