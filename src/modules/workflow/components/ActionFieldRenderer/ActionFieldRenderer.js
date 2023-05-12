import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { INPUT_TYPE, VALUE_TYPE } from "../../../../constants/ui";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import multi from "../../../../assets/icons/multi-input.svg";
import quest from "../../../../assets/icons/question-circle.svg";
import plus from "../../../../assets/icons/plus-blue-bold.svg";
import { Select } from "../../../../UIComponents/Select/Select";
import {
	CAPTURE_CONSTRAINT,
	EXCLUDE_MULTIPLE_USER_INPUT_BUTTON,
	MANUAL_TASK_INPUT_FIELD,
	NO_ASSIGNEE_DATA,
} from "../../constants/constant";
import { debounce } from "../../../../utils/common";
import { DatePicker } from "UIComponents/DatePicker/DatePicker";
import moment from "moment";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import { searchUsers } from "services/api/search";
import RichTextEdior from "UIComponents/RichTextEdior/RichTextEdior";
import ActionDocumentUpload from "../ActionDocumentUpload/ActionDocumentUpload";

export function ActionFieldRenderer(props) {
	const {
		field,
		action,
		formInputValidation,
		depsTriggerResponse,
		handleOnChangeSetupForm,
		openMulitInputDrawer,
		onRefresh,
		workflow,
		userSpecificField,
		users = [],
		formData,
		resolveDependency,
		selectedDynamicOptions,
		isTemplate,
		renderSingleRow,
		manualTaskAssigneeData,
	} = props;

	const [selectedFields, setSelectedFields] = useState([]);

	const renderToolTip = () => (
		<OverlayTrigger
			placement="right"
			delay={{ show: 250, hide: 400 }}
			overlay={(props) => (
				<Tooltip {...props} id="button-tooltip">
					<p className="m-0 font-12 grey-1 mb-2">
						{" "}
						{field.description}
					</p>
				</Tooltip>
			)}
		>
			<img src={quest} width={10} className="ml-2  mb-1" />
		</OverlayTrigger>
	);

	const renderMultiInputSidebarButtom = () => {
		const isMultiUserSelected = workflow.users.length > 1;
		if (
			isMultiUserSelected &&
			!userSpecificField &&
			!renderSingleRow &&
			field?.inputType !== INPUT_TYPE.RADIO &&
			field?.inputType !== INPUT_TYPE.CHECKBOX &&
			!EXCLUDE_MULTIPLE_USER_INPUT_BUTTON.includes(field?.inputType)
			// && field.captureConstraint != CAPTURE_CONSTRAINT.SINGLE_ONLY
		) {
			return (
				<Button
					style={{ height: "36px" }}
					className="border-1 border-radius-4 p-1 ml-2"
					type="normal"
					onClick={() => {
						openMulitInputDrawer(field);
					}}
				>
					<img className=" img-responsive" src={multi} width={30} />
				</Button>
			);
		}
	};

	const renderFieldValidationError =
		formInputValidation[field.key] &&
		formInputValidation[field.key].error &&
		isTemplate &&
		formInputValidation[field.key].errorAtUsersID.includes("template") ? (
			<p className="font-12 mt-1 red mb-0">
				{formInputValidation[field.key].error_message}
			</p>
		) : (
			formInputValidation[field.key] &&
			formInputValidation[field.key].error &&
			users.filter((user) =>
				formInputValidation[field.key].errorAtUsersID.includes(
					user.user_id
				)
			).length > 0 && (
				<p className="font-12 mt-1 red mb-0">
					{formInputValidation[field.key].error_message}
				</p>
			)
		);

	const getSelectedOption = (field) => {
		const keys = Object.keys(selectedDynamicOptions || {});
		if (keys.length) {
			if (userSpecificField) {
				return selectedDynamicOptions[users[0]["user_id"]]
					? selectedDynamicOptions[users[0]["user_id"]][field.key]
					: null;
			} else if (isTemplate) {
				// return selectedDynamicOptions["template"][field.key];
				return selectedDynamicOptions[keys[0]][field.key];
			} else {
				return selectedDynamicOptions[keys[0]][field.key];
			}
		}
		return null;
	};

	const renderOptionalField = () => {
		return (
			<>
				<div>
					<Button
						className="bold-600"
						type="link"
						onClick={() => {
							const arr = [...selectedFields];
							const idx = arr.indexOf(field.id);
							if (idx === -1) {
								arr.push(field.id);
							}
							setSelectedFields(arr);
						}}
					>
						<img src={plus} /> Add {field?.name || "a field"}{" "}
						(optional)
					</Button>
				</div>
			</>
		);
	};

	const multipleValues = () => {
		return (
			<div
				className={`${
					userSpecificField ? "mb-4" : ""
				} align-items-center mb-2`}
			>
				{!userSpecificField && (
					<label className="w-100 mb-1 font-12 d-block">
						{field.name}
						{renderToolTip(field)}
					</label>
				)}
				<div className="d-flex">
					<input
						style={{
							backgroundColor: "#f9f9f9",
							marginRight: "20px",
						}}
						disabled={true}
						className="p-2 w-100 flex-fill"
						type="text"
						name={field.key}
						id={field.key}
						value={"Multiple values"}
					/>
					<Button
						style={{
							height: "36px",
							marginLeft: -60,
							zIndex: 1,
							color: "#2266E2",
						}}
						className="p-1"
						type="normal"
						onClick={() => {
							openMulitInputDrawer(field);
						}}
					>
						EDIT
					</Button>
					{renderMultiInputSidebarButtom(
						field,
						workflow.users.length > 1
					)}
				</div>
			</div>
		);
	};

	const debouncedChangeHandler = useCallback(
		debounce((query) => {
			if (query || query === "") {
				resolveDependency(field, query);
			}
		}, 1000),
		[]
	);

	const isMultiValueAdded = () => {
		let data = new Set();
		formData.forEach((userData) => {
			if (userData.v[field.key]) {
				data.add(JSON.stringify(userData.v[field.key]));
			}
		});
		return field?.inputType === "radio" || field?.inputType === "checkbox"
			? 0
			: data.size > 1;
	};

	const getDefaultAssigneeList = () => {
		const obj = { ...manualTaskAssigneeData };
		const arr = [];
		for (var key in obj) {
			var value = obj[key];
			if (!value.assignee) {
				value.description = NO_ASSIGNEE_DATA[key];
				value.disabled = true;
			}
			for (var k in value.assignee) {
				if (
					value.assignee[k].length === 0 ||
					!value.assignee[k][0]?.user_id
				) {
					value.description = NO_ASSIGNEE_DATA[key];
					value.disabled = true;
				}
				if (value.assignee[k][0]?.user_logo) {
					value.profile_img = value.assignee[k][0]?.user_logo;
				} else {
					value.text = value.title;
				}
			}
			value.key = key;
			arr.push(value);
		}
		return arr.length > 0 ? arr : null;
	};

	const handleAssigneeChange = (val) => {
		const assignee = isTemplate
			? val.assignee || val.assignee[Object.keys(val.assignee)]
			: val.assignee[workflow.users[0].user_id] ||
			  val.assignee[Object.keys(val.assignee)];
		if (val.key) {
			if (isTemplate && assignee.length === 0) {
				const obj = { title: val.title, key: val.key };
				assignee.push(obj);
			} else {
				assignee[0].title = val.title;
				assignee[0].count = val.count;
				assignee[0].key = val.key;
			}
		}
		handleOnChangeSetupForm(
			{
				target: {
					name: field.key || "assignee",
					value: assignee?.[0]?.user_email || assignee?.[0]?.key,
					option: assignee || [],
					label: assignee?.[0]?.user_id
						? "user_name" || "user_email"
						: "key",
				},
			},
			users
		);
	};

	const renderField = () => {
		const value = getSelectedOption(field);
		const response =
			field.hasOwnProperty("dependencies") &&
			field.dependencies.length > 0 &&
			depsTriggerResponse.hasOwnProperty(
				field.dependencies[0].depTriggerId
			)
				? depsTriggerResponse[field.dependencies[0].depTriggerId]
				: null;
		const isOptionAvailable =
			field && field.options && field.options.length;
		const label = isOptionAvailable
			? "name"
			: value?.label || response?.name;
		const description = isOptionAvailable
			? "description"
			: value?.description || response?.description;
		const logo = isOptionAvailable ? "logo" : value?.logo || response?.logo;
		switch (field.renderType) {
			case INPUT_TYPE.SELECT:
				return (
					<Select
						className="flex-fill"
						isOptionsLoading={
							!value?.option?.length &&
							!isOptionAvailable &&
							!response
						}
						value={value?.option}
						options={
							isOptionAvailable ? field.options : response?.value
						}
						fieldNames={{
							label: label,
							description: description,
							logo: logo,
						}}
						filter
						search
						placeholder={field.name}
						onChange={(obj) => {
							handleOnChangeSetupForm(
								{
									target: {
										name: field.key,
										value: isOptionAvailable
											? obj["value"]
											: obj[field.valueFillModels[0].key],
										label: label,
										description: description,
										logo: logo,
										option: obj,
									},
								},
								users
							);
						}}
					/>
				);
			case INPUT_TYPE.SEARCH_SELECT:
				return (
					<>
						<Select
							search
							value={value?.option}
							onSearch={(query) => {
								debouncedChangeHandler(query);
							}}
							isOptionsLoading={!response}
							options={response?.value || []}
							fieldNames={{
								label:
									(depsTriggerResponse &&
										field?.dependencies.length > 0 &&
										depsTriggerResponse[
											field.dependencies[0].depTriggerId
										]?.name) ||
									value?.label,
								description: description,
								logo: logo,
							}}
							placeholder={field.name}
							onRefresh={(query) => {
								resolveDependency(field, query);
							}}
							onChange={(obj) => {
								handleOnChangeSetupForm(
									{
										target: {
											option: [obj],
											name: field.key,
											value: obj[
												field.valueFillModels[0].key
											],
											label: depsTriggerResponse[
												field.dependencies[0]
													.depTriggerId
											]?.name,
											description: description,
											logo: logo,
										},
									},
									users
								);
							}}
						/>
					</>
				);
			case INPUT_TYPE.MULTI_SEARCH_SELECT:
				return (
					<>
						<Select
							search
							value={value?.option}
							onSearch={(query) => {
								debouncedChangeHandler(query);
							}}
							isOptionsLoading={!response}
							options={response?.value || []}
							fieldNames={{
								label:
									(depsTriggerResponse &&
										field?.dependencies.length > 0 &&
										depsTriggerResponse[
											field.dependencies[0].depTriggerId
										]?.name) ||
									value?.label,
								description: description,
								logo: logo,
							}}
							onRefresh={(query) => {
								resolveDependency(field, query);
							}}
							placeholder={field.name}
							onChange={(obj) => {
								handleOnChangeSetupForm(
									{
										target: {
											option: obj,
											name: field.key,
											value: obj.map(
												(i) =>
													i[
														field.valueFillModels[0]
															.key
													]
											),
											label:
												depsTriggerResponse &&
												field?.dependencies.length >
													0 &&
												depsTriggerResponse[
													field.dependencies[0]
														.depTriggerId
												]?.name,
											description: description,
											logo: logo,
										},
									},
									users
								);
							}}
							mode="multi"
						/>
					</>
				);
			case INPUT_TYPE.MULTI_SELECT:
				return (
					<>
						<Select
							value={value?.option}
							isOptionsLoading={
								!value?.option?.length &&
								!response?.value?.length &&
								!isOptionAvailable
							}
							options={
								isOptionAvailable
									? field.options
									: response?.value
							}
							fieldNames={{
								label: label,
								description: description,
								logo: logo,
							}}
							filter
							search
							onRefresh={(query) => {
								debouncedChangeHandler(query);
							}}
							placeholder={field.name}
							onChange={(obj) => {
								handleOnChangeSetupForm(
									{
										target: {
											option: obj,
											name: field.key,
											value: isOptionAvailable
												? obj.map((i) => i["value"])
												: obj.map(
														(i) =>
															i[
																field
																	.valueFillModels[0]
																	.key
															]
												  ),
											label: label,
											description: description,
											logo: logo,
										},
									},
									users
								);
							}}
							mode="multi"
						/>
					</>
				);
			case INPUT_TYPE.DATE:
				return (
					<>
						<input
							className="p-2 w-100 flex-fill grey-1 font-12"
							type="datetime-local"
							name={field.key}
							id={field.key}
							onChange={(e) => {
								handleOnChangeSetupForm(
									{
										target: {
											name: field.key,
											value: e.target.value,
											label: "name",
										},
									},
									users
								);
							}}
							value={
								props.defaultValue ||
								(value && value?.value) ||
								""
							}
						/>
					</>
				);
			case MANUAL_TASK_INPUT_FIELD.STATIC_MANUAL_INPUT_FIELD:
				switch (field.inputType) {
					case MANUAL_TASK_INPUT_FIELD.ASSIGNEE:
						return (
							<>
								<AsyncTypeahead
									defaultValue={value?.option?.[0] || null}
									className="m-0 select-user-mt w-100"
									placeholder="Select an assignee"
									fetchFn={searchUsers}
									defaultList={getDefaultAssigneeList()}
									onSelect={(user) => {
										if (user.isSuggestion) {
											handleAssigneeChange(user);
										} else {
											handleOnChangeSetupForm(
												{
													target: {
														name:
															field.key ||
															"assignee",
														value:
															user?.user_id !==
															null
																? user?.user_email ||
																  null
																: null,
														label:
															user?.user_id !==
															null
																? user?.user_id
																	? "user_name" ||
																	  "user_email"
																	: "key"
																: null,
														option:
															user?._id &&
															user?.user_id !==
																null
																? [
																		{
																			user_id:
																				user._id,
																			user_name:
																				user.user_name,
																			user_email:
																				user.user_email,
																			user_logo:
																				user.profile_img,
																			key: null,
																		},
																  ]
																: [],
													},
												},
												users
											);
										}
									}}
									keyFields={{
										id: "user_id",
										image: "profile_img",
										title: "title",
										value: "user_name",
										email: "user_email",
										count: "count",
										appAuthStatus: true,
									}}
									allowFewSpecialCharacters={true}
								/>
							</>
						);
					default:
						return;
				}
			case INPUT_TYPE.INPUT:
			default:
				switch (field.inputType) {
					case INPUT_TYPE.RADIO:
						return (
							<>
								{field.options.map((option, index) => (
									<React.Fragment key={index}>
										<label className=" mb-1 font-12 flex-fill">
											<input
												style={{ top: "3px" }}
												className="p-2 mr-2"
												checked={
													props.defaultValue ===
														option?.value ||
													value?.value ===
														option?.value
														? true
														: false
												}
												// checked={
												// 	props.defaultValue ===
												// 		field.value ||
												// 	isTemplate
												// 		? value?.value ===
												// 		  option?.value
												// 		: false
												// }
												value={option.value}
												type={field.inputType}
												name={field.key}
												id={option.id}
												onChange={(e) => {
													handleOnChangeSetupForm(
														{
															target: {
																name: field.key,
																value: e.target
																	.value,
																label: "name",
															},
														},
														users
													);
												}}
											/>
											{option.label}
										</label>
									</React.Fragment>
								))}
							</>
						);
					case INPUT_TYPE.CHECKBOX:
						return (
							<>
								{field.options.map((option, index) => (
									<React.Fragment key={index}>
										<label className=" mb-1 font-12 flex-fill">
											<input
												style={{ top: "3px" }}
												className="p-2 mr-2"
												type={field?.inputType}
												// checked={
												// 	props.defaultValue ===
												// 		field?.value || isTemplate
												// 		? value?.value === field?.value
												// 		: false
												// }
												checked={
													props.defaultValue ===
														option?.value ||
													value?.value ===
														option?.value
														? true
														: false
												}
												name={field.key}
												value={option?.value}
												id={option?.id}
												onChange={(e) => {
													handleOnChangeSetupForm(
														{
															target: {
																name: field.key,
																value: e.target
																	.checked
																	? e.target
																			.value
																	: "",
																label: "name",
															},
														},
														users
													);
												}}
											/>
											{option.label}
											{/* {renderToolTip(field)} */}
										</label>
									</React.Fragment>
								))}
							</>
						);
					case INPUT_TYPE.TEXT_AREA:
						return (
							<>
								<textarea
									className="p-2 w-100 flex-fill"
									rows={4}
									name={field.key}
									id={field.key}
									autoComplete="new-password"
									onChange={(e) => {
										handleOnChangeSetupForm(
											{
												target: {
													name: field.key,
													value: e.target.value,
													label: "name",
												},
											},
											users
										);
									}}
									value={
										props.defaultValue ||
										(value && value?.value) ||
										""
									}
								/>
							</>
						);
					case INPUT_TYPE.RICHTEXT:
						return (
							<>
								<RichTextEdior
									value={props.defaultValue || ""}
									onChange={(value) => {
										handleOnChangeSetupForm(
											{
												target: {
													name: field.key,
													value: value,
													label: "name",
												},
											},
											users
										);
									}}
								/>
							</>
						);
					case INPUT_TYPE.DOCUMENT:
						return (
							<div className="flex-1">
								<ActionDocumentUpload
									value={props.defaultValue || ""}
									onChange={(value) => {
										handleOnChangeSetupForm(
											{
												target: {
													name: field.key,
													value: value,
													label: "name",
												},
											},
											users
										);
									}}
								/>
							</div>
						);
					default:
						return (
							<>
								<input
									className="p-2 w-100 flex-fill"
									type={field.inputType}
									name={field.key}
									id={field.key}
									autoComplete="new-password"
									onChange={(e) => {
										handleOnChangeSetupForm(
											{
												target: {
													name: field.key,
													value:
														field?.valueType ===
														VALUE_TYPE.NUMBER
															? parseInt(
																	e.target
																		.value
															  )
															: e.target.value,
													label: "name",
												},
											},
											users
										);
									}}
									value={
										props.defaultValue ||
										(value && value?.value) ||
										""
									}
								/>
							</>
						);
				}
		}
	};

	const renderUI = () => {
		if (field.isOptional && !selectedFields.includes(field.id)) {
			return <div>{renderOptionalField()}</div>;
		} else if (!userSpecificField && isMultiValueAdded()) {
			return <div>{multipleValues()}</div>;
		} else
			return (
				<div
					className={`${
						renderSingleRow ? "flex-1" : ""
					} align-items-center mb-4 p-2`}
					// className="align-items-center mb-4 p-2"
				>
					{!userSpecificField && (
						<label
							className={`${
								!field.name && renderSingleRow ? "pb-3" : ""
							} w-100 mb-1 font-12 d-block`}
						>
							{field.name}
							{field.description && renderToolTip(field)}
						</label>
					)}
					<div className="d-flex justify-content-between">
						{renderField()}
						{renderMultiInputSidebarButtom()}
					</div>
					{renderFieldValidationError}
				</div>
			);
	};

	return (
		<div
			className={`${renderSingleRow ? "d-flex flex-1 flex-wrap" : ""}`}
			key={field.id}
		>
			{renderUI()}
		</div>
	);
}
