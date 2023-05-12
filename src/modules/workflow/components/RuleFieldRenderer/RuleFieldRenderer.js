import { INPUT_TYPE } from "../../../../constants/ui";
import React, { useCallback, useState } from "react";
import { Select } from "../../../../UIComponents/Select/Select";
import { debounce } from "../../../../utils/common";
import {
	searchAllAppsV2,
	searchAllDepartmentsV2,
	searchAllUsersV2,
	searchUsers,
	searchUserSource,
} from "services/api/search";
import {
	defaultReqBody,
	getSearchReqObj,
	userSourceResponseFormater,
} from "modules/workflow/constants/constant";
import { getUsersServiceV2 } from "modules/workflow/service/api";
import { searchAllDepartments } from "services/api/search";

function getDefaultFilters(key, q) {
	if (key === "department") {
		let reqObj = defaultReqBody;
		reqObj.reset_filter = false;
		const filter_by = [
			{
				field_values: false,
				field_id: "dept_archive",
				filter_type: "boolean",
				field_name: "Archive",
				negative: false,
				is_custom: false,
			},
		];
		if (q) {
			filter_by.push(getSearchReqObj(q, "dept_name", "Department Name"));
		}
		reqObj.filter_by = filter_by;
		return reqObj;
	} else if (key === "user") {
		let reqObj = defaultReqBody;
		reqObj.reset_filter = false;
		const filter_by = [
			{
				field_id: "user_account_type",
				field_name: "User Account Type",
				field_values: ["employee"],
				filter_type: "string",
				field_order: "contains",
				negative: false,
				is_custom: false,
			},
			{
				field_name: "Status",
				field_type: "select",
				field_values: ["active"],
				field_id: "user_status",
				filter_type: "string",
				negative: false,
				is_custom: false,
			},
			{
				field_id: "user_archive",
				field_name: "Archive",
				field_values: false,
				filter_type: "boolean",
				is_custom: false,
				negative: false,
			},
		];
		if (q) {
			filter_by.push(getSearchReqObj(q, "user_name", "User Name"));
		}
		reqObj.filter_by = filter_by;
		return reqObj;
	}
}

const entityTypeService = {
	user: {
		api: getUsersServiceV2,
		label: "user_name",
		value: "user_id",
		imageKey: "profile_img",
		filters: getDefaultFilters,
	},
	department: {
		api: searchAllDepartments,
		label: "department_name_path",
		value: "department_id",
		imageKey: "department_logo_url",
		// filters: getDefaultFilters,
	},
	orgintegrationuser: {
		api: searchUserSource,
		label: "source_name" || "org_integration_name",
		value: "org_integration_id",
		imageKey: "logo",
		responseFormater: userSourceResponseFormater,
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
	notIn: "notIn",
};

const RuleFieldRenderer = (props) => {
	const { key, field, handleOnChangeSetupForm } = props;

	const [entityData, setEntityData] = useState([]);
	const [loading, setLoading] = useState(false);

	const debouncedChangeHandler = useCallback(
		debounce((query) => {
			if (query || query === "") {
				setEntityData([]);
				entityTypeService[field.search_entity]
					.api(
						entityTypeService[field.search_entity].filters
							? entityTypeService[field.search_entity].filters(
									field.search_entity,
									query || ""
							  )
							: query || " ",
						null,
						field?.type === INPUT_TYPE.REFERENCE ||
							field.search_entity === "orgapplications"
							? 0
							: true
					)
					.then((res) => {
						if (res.data || res.results || res) {
							setEntityData(
								(entityTypeService[field.search_entity]
									?.responseFormater &&
									entityTypeService[
										field.search_entity
									]?.responseFormater(res)) ||
									res.data ||
									res.results ||
									res
							);
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
								key={`${JSON.stringify(field)}`}
								disabled={!props?.isEditable}
								mode="multi"
								className="flex-fill black-1 w-auto mr-3 grey-bg my-1"
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
									logo: entityTypeService[field.search_entity]
										.imageKey,
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
								key={`${JSON.stringify(field)}`}
								className="flex-fill black-1 w-auto mr-3 grey-bg my-1"
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
									logo: entityTypeService[field.search_entity]
										.imageKey,
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
								key={`${JSON.stringify(field)}`}
								className="flex-fill black-1 w-auto mr-3 grey-bg my-1"
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
								key={`${JSON.stringify(field)}`}
								className="flex-fill black-1 w-auto mr-3 grey-bg my-1"
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
							className="p-2 w-100 flex-fill my-1"
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
							value={
								typeof field.value === "object"
									? field?.value?.value
									: field.value || null
							}
						/>
					</>
				);
			case INPUT_TYPE.NUMERIC:
				return (
					<>
						<input
							className="p-2 w-100 flex-fill my-1"
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
							value={
								typeof field.value === "object"
									? field?.value?.value
									: field.value || null
							}
						/>
					</>
				);
			case INPUT_TYPE.DATE:
				return (
					<>
						<input
							key={`${JSON.stringify(field)}`}
							className="p-2 w-100 flex-fill my-1"
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
							value={
								typeof field.value === "object"
									? field?.value?.value
									: field.value || null
							}
						/>
					</>
				);
			default:
				return (
					<>
						<input
							className="p-2 w-100 flex-fill my-1"
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
							value={
								typeof field.value === "object"
									? field?.value?.value
									: field.value || null
							}
						/>
					</>
				);
		}
	};

	const renderUI = () => {
		return (
			<div className="align-items-centerp-2">
				<div className="d-flex justify-content-between">
					{renderField()}
				</div>
			</div>
		);
	};

	return <React.Fragment>{renderUI()}</React.Fragment>;
};

export default RuleFieldRenderer;
