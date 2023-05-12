import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form } from "react-bootstrap";
import "../WorkflowSidebar/WorkflowSidebar.css";
import { useDispatch, useSelector } from "react-redux";

import {
	setEditAutomationRule,
	getAllUsers,
	getUsersBySearch,
} from "../../redux/workflow";
import { searchUsers } from "services/api/search";
import { Select } from "../../../../UIComponents/Select/Select";
import { checkSpecialCharacters } from "../../../../services/api/search";
import { debounce } from "../../../../utils/common";
import { client } from "../../../../../src/utils/client";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";
import { getUserslistServiceV2 } from "modules/workflow/service/api";
import { getSearchReqObj } from "modules/workflow/constants/constant";
import { TriggerIssue } from "utils/sentry";

const RulesConfiguration = ({ rule, hideTrigger }) => {
	const dispatch = useDispatch();
	// const automationRule = useSelector(
	// 	(state) => state.workflows.automationRule
	// );

	const InitialState = {
		name: {
			value: rule?.name || "",
			error: false,
			required: true,
			message: "Rule name is required",
		},
		description: {
			value: rule?.description || "",
			error: false,
			required: true,
			message: "Rule description is required",
		},
		showNotifyUsers: {
			value: rule?.showNotifyUsers,
			error: false,
			required: false,
		},
		notifyUsers: {
			value: rule?.notifyUsers || [],
			error: false,
			required: false,
		},
		approvalBeforeRunning: {
			value: rule?.approvalBeforeRunning || false,
			error: false,
			required: false,
		},
		approvalBeforeRunningData: {
			value: rule?.approvalBeforeRunningData || [],
			error: false,
			required: false,
		},
		stopProcessingOtherRules: {
			value: rule?.stopProcessingOtherRules || true,
			error: false,
			required: false,
		},
	};

	const users = useSelector((state) => state.workflows.users);
	const [data, setData] = useState(InitialState);
	const [isStateUpdating, setisStateUpdating] = useState(false);
	const [searchQuery, setSearchQuery] = useState();
	const [usersLoader, setUsersLoader] = useState(true);
	const [userList, setUserList] = useState([]);

	const cancelToken = useRef();
	const validation = () => {
		// const obj = Object.assign({}, data);
		const obj = { ...data };
		let isError = false;
		for (let key in obj) {
			if (!obj[key].value && obj[key].required) {
				obj[key] = {
					...obj[key],
					error: true,
				};
				isError = true;
			}
		}
		setData(obj);
		return !isError;
	};

	useEffect(() => {
		const ruleData = { ...rule };
		const localData = { ...data };
		if (Object.keys(ruleData).length > 0) {
			Object.keys(localData).forEach((item) => {
				Object.keys(ruleData).forEach((key) => {
					if (item === key) {
						localData[key] = {
							...localData[key],
							value: ruleData[key],
							error: false,
						};
						if (!localData[key].value && localData[key].required) {
							localData[key] = {
								...localData[key],
								error: true,
							};
						}
					}
				});
			});
		}
		setData(localData);
		setisStateUpdating(false);

		// validation();
	}, [rule]);

	//API call to get all users
	const getUsersForWorkflow = (page = 0, row = 10) => {
		const reqBody = {
			filter_by: [
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
			],
			sort_by: [],
			columns: [],
			// screen_tag: 9,
		};
		dispatch(getAllUsers(page, row, reqBody));
	};

	useEffect(() => {
		if (users?.data) {
			setUserList(users?.data);
			setUsersLoader(false);
		}
	}, [users]);

	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		setUsersLoader(true);
		if (searchQuery) {
			cancelToken.current = client.CancelToken.source();
			if (checkSpecialCharacters(searchQuery, true)) {
				setUsersLoader(false);
			} else {
				const reqBody = {
					filter_by: [
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
					],
					sort_by: [],
					columns: [],
				};
				reqBody.filter_by.push(
					getSearchReqObj(searchQuery, "user_name", "User Name")
				);
				getUserslistServiceV2(0, 30, reqBody)
					.then((res) => {
						if (res?.data) {
							setUserList(res?.data);
							setUsersLoader(false);
						}
					})
					.catch((err) =>
						TriggerIssue("Errors in getUserslistServiceV2", err)
					);
			}
		} else {
			getUsersForWorkflow();
		}
	}, [searchQuery]);

	const handleChange = (e) => {
		e.persist();

		setData((prevState) => ({
			...prevState,
			[e.target?.name]: {
				...data[e.target?.name],
				value:
					e.target?.type === "checkbox"
						? e.target?.checked
						: e.target?.value,
				error: false,
			},
		}));
		setisStateUpdating(true);
	};
	useEffect(() => {
		if (isStateUpdating) {
			updateRule();
		}
	}, [data, isStateUpdating]);

	const handleChangeApprover = (obj, type) => {
		const newObj = {
			...rule,
			[type]: obj,
			showNotifyUsers: obj.length > 0 ? true : false,
		};
		dispatch(setEditAutomationRule(newObj));
	};

	const updateRule = () => {
		validation();
		const config = { ...rule };
		Object.keys(data).forEach((item) => {
			config[item] = data[item].value;
		});
		dispatch(setEditAutomationRule(config));
	};

	return (
		<div className="tab_content">
			<div className="tab_content_header">Configuration</div>
			<div style={{ borderTop: "1px solid #EBEBEB", marginTop: "8px" }} />
			<div className="tab_content_body">
				<div className="mb-2 d-flex justify-content-between flex-column">
					<div className="mb-3">
						<label className="font-12 grey mb-1">Rule Name</label>
						<input
							className="w-100 mt-2 p-2 font-14"
							name="name"
							type="text"
							value={data.name.value}
							onChange={(e) => {
								handleChange(e);
							}}
							//onBlur={() => updateRule()}
						/>
					</div>
					{data.name.error && (
						<div className="text-danger font-12 mb-2">
							{data.name.message}
						</div>
					)}
					<div className="mb-3">
						<label className="font-12 grey mb-1">Description</label>
						<textarea
							rows={4}
							name="description"
							className="w-100 mt-2 p-2 font-14"
							placeholder="Add a message"
							value={data.description.value}
							onChange={(e) => {
								handleChange(e);
							}}
							//onBlur={() => updateRule()}
						/>
					</div>
					{data.description.error && (
						<div className="text-danger font-12 mb-2">
							{data.description.message}
						</div>
					)}
					{/* <div className="mb-3 flex-row d-flex">
						<Form.Check
							className="checkbox-container margin-right-15"
							type="checkbox"
							name="approvalBeforeRunning"
							value={data.approvalBeforeRunning.value}
							checked={data.approvalBeforeRunning.value}
							onChange={(e) => {
								handleChange(e);
							}}
							onBlur={() => updateRule()}
						/>
						<div className="d-flex flex-column justify-content-center w-100">
							<label className="font-14 mb-1">
								Ask for approval before running workflow
							</label>
							<label className="font-12 grey mb-0">
								Sends you an approval email to trigger the
								workflow
							</label>
							{data.approvalBeforeRunning.value && (
								<>
									<label className="font-14 mb-1 mt-2">
										Add approvers
									</label>
									<Select
										search
										value={
											data.approvalBeforeRunningData.value
										}
										onSearch={(query) => {
											setUsersLoader(true);
											setUserList([]);
											debounce(
												setSearchQuery(query),
												300
											);
										}}
										isOptionsLoading={usersLoader || true}
										options={userList || []}
										fieldNames={{
											label: "user_name",
											description: "user_email",
											logo: "profile_img",
										}}
										optionRender={(option, props) => {
											return (
												<div className="text-capitalize">
													<div className="d-flex object-contain img-circle align-items-center">
														{props.fieldNames
															.logo && (
															<GetImageOrNameBadge
																name={
																	option[
																		props
																			.fieldNames
																			.label
																	]
																}
																url={
																	option[
																		props
																			.fieldNames
																			.logo
																	]
																}
																width={26}
																height={26}
																imageClassName={
																	"border-radius-4 mr-2 object-contain"
																}
																nameClassName={
																	"mr-2 border-radius-4 d-inline-block"
																}
															/>
														)}
														<div>
															<p className="font-14 grey mb-1">
																{
																	option[
																		props
																			.fieldNames
																			.label
																	]
																}
															</p>
															{option[
																props.fieldNames
																	.description
															] && (
																<p className="font-9 grey-1 mb-0">
																	{
																		option[
																			props
																				.fieldNames
																				.description
																		]
																	}
																</p>
															)}
														</div>
													</div>
												</div>
											);
										}}
										placeholder={"Add approvers"}
										onChange={(obj) => {
											handleChangeApprover(obj);
											// handleOnChangeSetupForm(
											// 	{
											// 		target: {
											// 			option: obj,
											// 			name: field.key,
											// 			value: obj.map(
											// 				(i) =>
											// 					i[
											// 						field
											// 							.valueFillModels[0]
											// 							.key
											// 					]
											// 			),
											// 			label:
											// 				depsTriggerResponse &&
											// 				field?.dependencies
											// 					.length > 0 &&
											// 				depsTriggerResponse[
											// 					field
											// 						.dependencies[0]
											// 						.depTriggerId
											// 				]?.name,
											// 			description:
											// 				description,
											// 			logo: logo,
											// 		},
											// 	},
											// 	users
											// );
										}}
										mode="multi"
									/>
								</>
							)}
						</div>
					</div> */}
					{/* <div className="mb-3 flex-row d-flex w-100">
						<Form.Check
							className="checkbox-container margin-right-15"
							type="checkbox"
							name="stopProcessingOtherRules"
							value={data.stopProcessingOtherRules.value}
							checked={true}
							onChange={(e) => {
								handleChange(e);
							}}
							disabled
							onBlur={() => updateRule()}
						/>
						<div className="d-flex flex-column justify-content-center">
							<label className="font-14 mb-1">
								Stop processing other rules
							</label>
							<label className="font-12 grey mb-0">
								Stops other rules from running on successfully
								running this rule
							</label>
						</div>
					</div> */}
					<div className="mb-3 flex-row d-flex">
						{!hideTrigger && (
							<>
								<Form.Check
									className="checkbox-container margin-right-15"
									type="checkbox"
									name="showNotifyUsers"
									value={data.showNotifyUsers.value}
									checked={data.showNotifyUsers.value}
									onChange={(e) => {
										handleChange(e);
									}}
									//onBlur={() => updateRule()}
								/>
								<div className="d-flex flex-column justify-content-center w-100">
									<label className="font-14 mb-1">
										Notify on trigger
									</label>
									<label className="font-12 grey mb-0">
										Sends an email on trigger of workflow
									</label>
									{data.showNotifyUsers.value && (
										<>
											<label className="font-14 mb-1 mt-2">
												Add people
											</label>
											<Select
												search
												value={data.notifyUsers.value}
												onSearch={(query) => {
													setUsersLoader(true);
													setUserList([]);
													debounce(
														setSearchQuery(query),
														300
													);
												}}
												isOptionsLoading={
													usersLoader || false
												}
												options={userList || []}
												//onBlur={() => updateRule()}
												fieldNames={{
													label: "user_name",
													description: "user_email",
													logo: "profile_img",
												}}
												optionRender={(
													option,
													props
												) => {
													return (
														<div className="text-capitalize">
															<div className="d-flex object-contain img-circle align-items-center">
																{props
																	.fieldNames
																	.logo && (
																	<GetImageOrNameBadge
																		name={
																			option[
																				props
																					.fieldNames
																					.label
																			]
																		}
																		url={
																			option[
																				props
																					.fieldNames
																					.logo
																			]
																		}
																		width={
																			26
																		}
																		height={
																			26
																		}
																		imageClassName={
																			"border-radius-4 mr-2 object-contain"
																		}
																		nameClassName={
																			"mr-2 border-radius-4 d-inline-block"
																		}
																	/>
																)}
																<div>
																	<p className="font-14 grey mb-1">
																		{
																			option[
																				props
																					.fieldNames
																					.label
																			]
																		}
																	</p>
																	{option[
																		props
																			.fieldNames
																			.description
																	] && (
																		<p className="font-9 grey-1 mb-0">
																			{
																				option[
																					props
																						.fieldNames
																						.description
																				]
																			}
																		</p>
																	)}
																</div>
															</div>
														</div>
													);
												}}
												placeholder={"Add people"}
												onChange={(obj) => {
													const data = [];
													obj.map((item) =>
														data.push({
															user_id:
																item.user_id,
															user_name:
																item.user_name,
															user_email:
																item.user_email,
															user_logo:
																item.profile_img,
														})
													);
													handleChangeApprover(
														data,
														"notifyUsers"
													);
												}}
												mode="multi"
											/>
										</>
									)}
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default RulesConfiguration;
