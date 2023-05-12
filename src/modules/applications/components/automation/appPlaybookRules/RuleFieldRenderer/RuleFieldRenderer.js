import { INPUT_TYPE } from "../../../../../../constants/ui";
import React, { useCallback, useState } from "react";
import { Select } from "../../../../../../UIComponents/Select/Select";
import { debounce } from "../../../../../../utils/common";
import {
	searchAllAppsV2,
	searchAllDepartmentsV2,
	searchAllUsersV2,
	searchUsers,
	searchUserSource,
} from "services/api/search";

const entityTypeService = {
	user: {
		api: searchUsers,
		label: "user_name",
		value: "user_id",
		imageKey: "profile_img",
	},
	department: {
		api: searchAllDepartmentsV2,
		label: "dept_name",
		value: "dept_id",
		imageKey: "profile_img",
	},
	orgintegrationuser: {
		api: searchUserSource,
		label: "name",
		value: "org_integration_id",
		imageKey: "logo",
	},
	orgapplications: {
		api: searchAllAppsV2,
		label: "app_name",
		value: "app_id",
		imageKey: "app_logo",
	},
	orgusers: {
		api: searchAllUsersV2,
		label: "user_name",
		value: "user_id",
		imageKey: "user_profile",
	},
};

const entityTypeFieldRenderer = {
	in: "in",
	inPrimarySource: "inPrimarySource",
};

const RuleFieldRenderer = (props) => {
	const { key, field, handleOnChangeSetupForm } = props;

	const [entityData, setEntityData] = useState([]);
	const [loading, setLoading] = useState(false);

	const debouncedChangeHandler = useCallback(
		debounce((query) => {
			if (query || query === "") {
				entityTypeService[field.search_entity]
					.api(
						query || " ",
						null,
						field?.type === INPUT_TYPE.ENTITY ? 0 : true
					)
					.then((res) => {
						if (res.data || res.results || res) {
							setEntityData(res.data || res.results || res);
							setLoading(false);
						}
					})
					.catch((err) => {
						console.log("err", err);
					});
			}
		}, 1000),
		[]
	);

	const getMultiSelectedOption = (field) => {
		return field.selectedValue;
	};

	const getSelectedOption = (field) => {
		const value = field.selectedValue;
		// const values = field.values;
		return value ? value : null;
	};

	const getMultiSelectedEntity = (field) => {
		return field.selectedValue;
	};

	const getSelectedEntity = (field) => {
		const value = field.selectedValue;
		return field?.selectedValue
			? [
					{
						[entityTypeService[field.search_entity].label]:
							value?.label,
						[entityTypeService[field.search_entity].value]:
							value?.value,
					},
			  ]
			: null;
	};

	const renderField = () => {
		switch (field.type) {
			case INPUT_TYPE.ENTITY:
			case INPUT_TYPE.REFERENCE:
				switch (field?.operator) {
					case entityTypeFieldRenderer[field?.operator]:
						return (
							<Select
								disabled={!props?.isEditable}
								mode="multi"
								// className="flex-fill black-1 w-auto mr-3 grey-bg"
								className="rule-after-operator"
								inputClassName="rule-attribute-content"
								optionsFieldClassName="rule-option-style"
								placeholderClassName="rule-select-placeholder"
								optionsContainerClassName="rule-select-options"
								selectorClassStyle={{
									width: "max-content",
									maxWidth: "324px",
								}}
								isOptionsLoading={loading}
								value={getMultiSelectedEntity(field) || ""}
								options={entityData || null}
								fieldNames={{
									label: entityTypeService[
										field.search_entity
									].label,
									value: entityTypeService[
										field.search_entity
									].value,
								}}
								search
								onSearch={(query) => {
									setLoading(true);
									debouncedChangeHandler(query);
								}}
								placeholder={field.name}
								onChange={(obj) => {
									const value = [];
									const selectedValue = [];
									obj.map((item) => {
										value.push(
											item[
												entityTypeService[
													field.search_entity
												].value
											]
										);
										selectedValue.push({
											[entityTypeService[
												field.search_entity
											].label]:
												item[
													entityTypeService[
														field.search_entity
													].label
												],
											[entityTypeService[
												field.search_entity
											].value]:
												item[
													entityTypeService[
														field.search_entity
													].value
												],
										});
									});
									handleOnChangeSetupForm({
										target: {
											name: field.name,
											value,
											selectedValue,
											data: "multiselect",
										},
									});
								}}
							/>
						);
					default:
						return (
							<Select
								// className="flex-fill black-1 w-auto mr-3 grey-bg"
								inputClassName="rule-attribute-content"
								className="rule-after-operator"
								optionsContainerClassName="rule-select-options"
								optionsFieldClassName="rule-option-style"
								placeholderClassName="rule-select-placeholder"
								selectorClassStyle={{
									width: "max-content",
									maxWidth: "324px",
								}}
								disabled={!props?.isEditable}
								isOptionsLoading={loading}
								value={getSelectedEntity(field) || ""}
								options={entityData || null}
								fieldNames={{
									label: entityTypeService[
										field.search_entity
									].label,
									value: entityTypeService[
										field.search_entity
									].value,
								}}
								search
								onSearch={(query) => {
									setLoading(true);
									debouncedChangeHandler(query);
								}}
								placeholder={field.name}
								onChange={(obj) => {
									handleOnChangeSetupForm({
										target: {
											name: field.name,
											value: obj[
												entityTypeService[
													field.search_entity
												].value
											],
											selectedValue: {
												label: obj[
													entityTypeService[
														field.search_entity
													].label
												],
												value: obj[
													entityTypeService[
														field.search_entity
													].value
												],
											},
										},
									});
								}}
							/>
						);
				}
			case INPUT_TYPE.SELECT:
			case INPUT_TYPE.BOOL:
				switch (field?.operator) {
					case entityTypeFieldRenderer[field?.operator]:
						return (
							<Select
								// className="flex-fill black-1 w-auto mr-3 grey-bg"
								inputClassName="rule-attribute-content"
								className="rule-after-operator"
								optionsContainerClassName="rule-select-options"
								optionsFieldClassName="rule-option-style"
								placeholderClassName="rule-select-placeholder"
								selectorClassStyle={{
									width: "max-content",
									maxWidth: "324px",
								}}
								value={getMultiSelectedOption(field) || ""}
								options={field?.values || null}
								fieldNames={{
									label: "label",
									value: "value",
								}}
								disabled={!props?.isEditable}
								placeholder={field.name}
								onChange={(obj) => {
									const value = [];
									const selectedValue = [];
									obj.map((item) => {
										value.push(item.value);
										selectedValue.push({
											label: item.label,
											value: item.value,
										});
									});
									handleOnChangeSetupForm({
										target: {
											name: field.name,
											value,
											selectedValue,
											data: "multiselect",
										},
									});
								}}
								mode="multi"
							/>
						);
					default:
						return (
							<Select
								// className="flex-fill black-1 w-auto mr-3 grey-bg"
								inputClassName="rule-attribute-content"
								className="rule-after-operator"
								optionsContainerClassName="rule-select-options"
								optionsFieldClassName="rule-option-style"
								placeholderClassName="rule-select-placeholder"
								selectorClassStyle={{
									width: "max-content",
									maxWidth: "324px",
								}}
								disabled={!props?.isEditable}
								value={getSelectedOption(field) || ""}
								options={field?.values || null}
								fieldNames={{
									label: "label",
									value: "value",
								}}
								placeholder={field.name}
								onChange={(obj) => {
									handleOnChangeSetupForm({
										target: {
											name: field.name,
											value: obj.value,
											selectedValue: {
												label: obj.label,
												value: obj.value,
											},
										},
									});
								}}
							/>
						);
				}
			case INPUT_TYPE.STRING:
				return (
					<>
						<input
							className={`p-2 w-100 flex-fill ${
								props.defaultInputClassName || ""
							}`}
							type="text"
							name={field.name}
							disabled={!props?.isEditable}
							placeholder={field.name}
							id={key}
							onChange={(e) => {
								handleOnChangeSetupForm({
									target: {
										name: field.name,
										value: e.target.value,
									},
								});
							}}
							value={field.value || null}
						/>
					</>
				);
			case INPUT_TYPE.NUMERIC:
				return (
					<>
						<input
							className={`p-2 w-100 flex-fill ${
								props.defaultInputClassName || ""
							}`}
							type="number"
							disabled={!props?.isEditable}
							name={field.name}
							placeholder={field.name}
							id={key}
							onChange={(e) => {
								handleOnChangeSetupForm({
									target: {
										name: field.name,
										value: e.target.value,
									},
								});
							}}
							value={field.value || null}
						/>
					</>
				);
			case INPUT_TYPE.DATE:
				return (
					<>
						<input
							className={`p-2 w-100 flex-fill ${
								props.defaultInputClassName || ""
							}`}
							disabled={!props?.isEditable}
							type={field.type}
							name={field.name}
							placeholder={field.name}
							id={key}
							onChange={(e) => {
								handleOnChangeSetupForm({
									target: {
										name: field.name,
										value: e.target.value,
									},
								});
							}}
							value={field.value || null}
						/>
					</>
				);
			default:
				return (
					<>
						<input
							className={`p-2 w-100 flex-fill ${
								props.defaultInputClassName || ""
							}`}
							disabled={!props?.isEditable}
							type="text"
							name={field.name}
							placeholder={field.name}
							id={key}
							onChange={(e) => {
								handleOnChangeSetupForm({
									target: {
										name: field.name,
										value: e.target.value,
									},
								});
							}}
							value={field.value || null}
						/>
					</>
				);
		}
	};

	const renderUI = () => {
		return <>{renderField()}</>;
	};

	return <React.Fragment>{renderUI()}</React.Fragment>;
};

export default RuleFieldRenderer;
