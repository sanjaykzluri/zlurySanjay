import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Spinner } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import AssignedDropdown from "../ManualTask/AssignedDropdown";
import { useDispatch, useSelector } from "react-redux";
import {
	getAllManualTaskTemplates,
	getManualTaskTemplateData,
	setEditActionWorkflow,
	clearManualTaskData,
} from "modules/workflow/redux/workflow";
import { Select } from "UIComponents/Select/Select";
import ScheduleApprovalAction from "../ScheduleApprovalAction/ScheduleApprovalAction";
import { ManualTaskActionFieldRenderer } from "./ManualTaskActionFieldRenderer";
import { INPUT_TYPE } from "constants/ui";
import {
	getDefaultNodeManualTaskAssigneeSuggestionsAPI,
	getManualTaskAssigneeSuggestionsAPI,
	resolveActionDepTrigger,
} from "modules/workflow/service/api";
import { ACTION_TYPE } from "modules/workflow/constants/constant";
import {
	getAllManualTaskTemplatesPlaybook,
	getManualTaskTemplateDataPlaybook,
} from "modules/applications/components/automation/redux/appPlaybook";
import { TriggerIssue } from "utils/sentry";

const ManualTaskAction = ({
	applicationId,
	application,
	showCancel = true,
	showTaskTitleAndDescription = true,
	showActionableButton = true,
	showCardTitle = true,
	actionableButtonName = "Add Manual Task",
	reassignTaskForm,
	integration,
	isTemplate,
	action,
	onChangeToAuto,
	submitManualTask,
	entity,
}) => {
	const dispatch = useDispatch();

	const workflow = useSelector((state) =>
		entity === "appPlaybooks"
			? state.appPlaybooks.workflow
			: state.workflows.workflow
	);
	const AllManualTaskTemplates = useSelector((state) =>
		entity === "appPlaybooks"
			? state.appPlaybooks.allManualTaskTemplates
			: state.workflows.allManualTaskTemplates
	);
	const ManualTaskTemplateData = useSelector((state) =>
		entity === "appPlaybooks"
			? state.appPlaybooks.manualTaskTemplateData
			: state.workflows.manualTaskTemplateData
	);

	const [loading, setLoading] = useState(true);
	const [selectedAssignedVia, setSelectedAssignedVia] = useState("");
	const [templates, setTemplates] = useState([]);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [formData, setFormData] = useState([]);
	const [formInputValidation, setformInputValidation] = useState({});
	const [inputFieldLoading, setInputFieldLoading] = useState(false);
	const [depsTriggerResponse, setDepsTriggerResponse] = useState({});
	const [addingTaskLoader, setAddingTaskLoader] = useState(false);
	const [manualTaskAssigneeData, setManualTaskAssigneeData] = useState([]);

	const [scheduledData, setScheduledData] = useState(
		(action?.scheduledData &&
			action?.scheduledData?.duration &&
			action?.scheduledData) ||
			null
	);
	const [approvalData, setApprovalData] = useState(action?.approvers || []);
	const [dueIn, setDueIn] = useState(
		(action?.dueDateData && action?.dueDateData) || {
			time: "",
			unit: "",
			duration: "",
		}
	);

	useEffect(() => {
		if (
			!Array.isArray(AllManualTaskTemplates) ||
			AllManualTaskTemplates.length === 0
		) {
			setLoading(true);
			const onlyCustomTemplate =
				application?.name === "Zluri Actions" ? true : false;
			dispatch(
				entity === "appPlaybooks"
					? getAllManualTaskTemplatesPlaybook()
					: getAllManualTaskTemplates(onlyCustomTemplate)
			);
		}
		return () => {
			dispatch(clearManualTaskData());
			setLoading(true);
			setTemplates([]);
			setSelectedTemplate(null);
			setFormData([]);
			setformInputValidation({});
			setInputFieldLoading(false);
			setDepsTriggerResponse({});
		};
	}, []);

	const getSelectedTemplate = () => {
		let templateObj = null;
		if (action && action?.manual_action_template_id) {
			templateObj = AllManualTaskTemplates.find(
				(item) => item.template_id === action?.manual_action_template_id
			);
		}
		return templateObj;
	};

	useEffect(() => {
		if (
			Array.isArray(AllManualTaskTemplates) &&
			AllManualTaskTemplates.length > 0
		) {
			const templateObj = getSelectedTemplate();
			if (templateObj) {
				setSelectedTemplate(templateObj);
				setInputFieldLoading(true);
				initializeFormData(templateObj?.inputFields);
				setInputFieldLoading(false);
			}
			setTemplates(AllManualTaskTemplates);
			setLoading(false);
		}
	}, [AllManualTaskTemplates]);

	const initializeFormData = (fields, frmData = {}) => {
		const data = [];
		workflow?.users?.forEach((user) => {
			const obj = {
				k: user.user_id,
				v: fields
					.map((field) => field.key)
					.reduce(
						(previous, current) =>
							Object.assign(previous, { [current]: null }),
						{}
					),
			};
			if (frmData && Object.keys(frmData).length > 0) {
				Object.assign(obj, {
					v: frmData,
				});
			} else if (action.data.length) {
				const index = action.data.findIndex(
					(d) => d.k === user.user_id
				);
				if (
					index > -1 &&
					action?.manual_action_template_id ===
						selectedTemplate?.template_id
				) {
					Object.assign(obj, {
						v: action?.data?.[index]?.v,
					});
				}
			}
			data.push(obj);
		});

		if (isTemplate) {
			if (frmData && Object.keys(frmData).length > 0) {
				data.push({
					k: null,
					v: frmData || {},
				});
			} else {
				data.push({
					k: null,
					v:
						action &&
						action?.manual_action_template_id ===
							selectedTemplate?.template_id
							? action?.data?.[0]?.v || {}
							: {},
				});
			}
		}
		setFormData(data);
	};

	const configureFormValidation = (fields = [], formData) => {
		let obj = { ...formInputValidation };

		Array.isArray(fields) &&
			fields?.map((field) => {
				let isConditionValid = !field.hasOwnProperty("renderCondition");
				if (formData?.length) {
					if (Array.isArray(field)) {
						field.map((inputField) => {
							isConditionValid = checkRenderConditions(
								inputField,
								formData
							);
							const newErrObj = {
								required:
									!inputField.isOptional &&
									inputField.isRendered &&
									isConditionValid &&
									inputField?.inputType !==
										INPUT_TYPE.CHECKBOX,

								error: false,
								errorAtUsersID: [],
							};
							if (
								Array.isArray(inputField.validations) &&
								inputField.validations &&
								inputField.validations.length
							) {
								Object.assign(newErrObj, {
									error_message:
										inputField.validations[0].message,
									regex: inputField.validations[0].regex_type,
								});
							} else {
								Object.assign(newErrObj, {
									error_message: `Please enter valid ${inputField.name}`,
								});
							}
							Object.assign(obj, {
								[inputField.key]: newErrObj,
							});
							if (
								inputField.hasOwnProperty("dependencies") &&
								inputField.dependencies.length > 0 &&
								!inputField.hasOwnProperty("renderCondition") &&
								!depsTriggerResponse?.hasOwnProperty([
									inputField.dependencies[0].depTriggerId,
								])
							) {
								resolveDependency(inputField, "");
							}
						});
					} else {
						isConditionValid = checkRenderConditions(
							field,
							formData
						);
						const newErrObj = {
							required:
								!field.isOptional &&
								field.isRendered &&
								isConditionValid &&
								field?.inputType !== INPUT_TYPE.CHECKBOX,

							error: false,
							errorAtUsersID: [],
						};
						if (field.validations && field.validations.length) {
							Object.assign(newErrObj, {
								error_message: field.validations[0].message,
								regex: field.validations[0].regex_type,
							});
						} else {
							Object.assign(newErrObj, {
								error_message: `Please enter valid ${field.name}`,
							});
						}
						Object.assign(obj, {
							[field.key]: newErrObj,
						});
						if (
							field.hasOwnProperty("dependencies") &&
							field.dependencies.length > 0 &&
							!field.hasOwnProperty("renderCondition") &&
							!depsTriggerResponse?.hasOwnProperty([
								field.dependencies[0].depTriggerId,
							])
						) {
							resolveDependency(field, "");
						}
					}
				}
			});
		setformInputValidation(obj);
	};

	const validationDynamic = (frmData, field = {}) => {
		const obj = {};
		let isError = false;
		if (field && field.key) {
			Object.assign(obj, {
				[field.key]: Object.assign({}, formInputValidation[field.key], {
					errorAtUsersID: [],
				}),
			});
		} else {
			Object.assign(obj, formInputValidation);
		}
		for (let key in obj) {
			let isValidated = true;
			if (obj[key].required || obj[key].regex) {
				frmData.forEach((user) => {
					if (key === "due_date") {
						if (dueIn?.time && parseInt(dueIn?.time) > 99) {
							isValidated = false;
							isError = true;
							Object.assign(obj, {
								[key]: {
									...obj[key],
									error: true,
									error_message: "Time should be below 99",
									errorAtUsersID: [
										...new Set([
											isTemplate ? "template" : user.k,
											...obj[key].errorAtUsersID,
										]),
									],
								},
							});
						}
						if (!dueIn?.time || !dueIn?.unit) {
							isValidated = false;
							isError = true;
							Object.assign(obj, {
								[key]: {
									...obj[key],
									error: true,
									errorAtUsersID: [
										...new Set([
											isTemplate ? "template" : user.k,
											...obj[key].errorAtUsersID,
										]),
									],
								},
							});
						}
					} else if (key === "assignee") {
						if (
							(!user.v[key] ||
								!Array.isArray(user.v[key]) ||
								!user.v[key]?.[0] ||
								!(
									user.v[key]?.[0]?.title ||
									user.v[key]?.[0]?.user_id
								)) &&
							obj[key].required
						) {
							isValidated = false;
							isError = true;
							Object.assign(obj, {
								[key]: {
									...obj[key],
									error: true,
									errorAtUsersID: [
										...new Set([
											isTemplate ? "template" : user.k,
											...obj[key].errorAtUsersID,
										]),
									],
								},
							});
						}
					} else if (
						(typeof user?.v[key] !== "boolean" &&
							!user.v[key] &&
							obj[key].required) ||
						(obj?.[key]?.regex &&
							!new RegExp(
								obj?.[key]?.regex.replaceAll("/", "")
							).test(user?.v?.[key]) &&
							obj?.[key]?.required) ||
						(user.v[key] &&
							typeof user?.v[key] === "object" &&
							Object.keys(user.v[key]).length === 0)
					) {
						isValidated = false;
						isError = true;
						Object.assign(obj, {
							[key]: {
								...obj[key],
								error: true,
								errorAtUsersID: [
									...new Set([
										isTemplate ? "template" : user.k,
										...obj[key].errorAtUsersID,
									]),
								],
							},
						});
					}
				});
			}
			if (isValidated) {
				Object.assign(obj, {
					[key]: {
						...obj[key],
						error: false,
						errorAtUsersID: [],
					},
				});
			}
		}
		if (field && field.key) {
			Object.assign(obj, formInputValidation);
		}
		setformInputValidation(obj);
		return !isError;
	};

	const generateRequestDataModel = (field, query, formDataObj = null) => {
		const obj = formDataObj ? formDataObj : formData;
		const data = {};
		Object.keys(field.dependencies[0].depRequestDataModel).forEach(
			(key) => {
				let ID = null;
				if (
					field.dependencies[0].depRequestDataModel[key].startsWith(
						"{{"
					)
				) {
					ID = field.dependencies[0].depRequestDataModel[key]
						.replaceAll("{", "")
						.replaceAll("}", "");
					if (ID === field.dependencies[0].depSearchModel) {
						data[key] = query;
					} else if (ID === "$CURRENT_NODE.app_id") {
						data[key] = applicationId || "";
					} else {
						data[key] = obj[0].v[ID] || "";
					}
				} else {
					data[key] =
						field.dependencies[0].depRequestDataModel[key] || "";
				}
			}
		);

		if (query || query === "") {
			data[field.dependencies[0].depSearchModel] = query;
		}
		return data;
	};

	const checkRenderConditions = (field, frmData = formData) => {
		let render = true;
		if (field.renderCondition && field.renderCondition.length) {
			field.renderCondition.forEach((condition) => {
				for (let o in condition) {
					const operand =
						o !== "id" &&
						condition[o].operand
							.replaceAll("{", "")
							.replaceAll("}", "");
					switch (o) {
						case "eq":
							if (frmData[0].v[operand] !== condition[o].value) {
								render = false;
							}
							break;
						case "isExists":
							if (
								Boolean(frmData[0].v[operand]) !==
								condition[o].value
							) {
								render = false;
							}
							break;
						default:
							break;
					}
				}
			});
		}
		return render;
	};

	const resolveDependency = (field, query = null, formDataObj = null) => {
		let obj = formDataObj ? formDataObj : formData;
		const options = { ...depsTriggerResponse };
		delete options[
			field.dependencies.length && field.dependencies[0].depTriggerId
		];
		setDepsTriggerResponse(options);
		const data = {};
		if (!checkRenderConditions(field, obj)) {
			return;
		}
		if (
			checkRenderConditions(field, obj) &&
			field.dependencies[0].hasOwnProperty("depRequestDataModel")
		) {
			Object.assign(data, generateRequestDataModel(field, query, obj));
			if (!Object.keys(data).length) {
				return;
			}
		}
		resolveActionDepTrigger(
			workflow.id,
			action.workflowActionID,
			field.key,
			field.dependencies[0].depTriggerId,
			data,
			null,
			isTemplate
		).then((response) => {
			let isEmpty = false;
			if (response.data && Array.isArray(response.data)) {
				if (
					response.data[0] === null ||
					(typeof response.data[0] === "object" &&
						!Object.keys(response.data[0]).length)
				) {
					isEmpty = true;
				}
			} else {
				isEmpty = true;
			}

			setDepsTriggerResponse(
				Object.assign(
					{ ...options },
					{
						[field.dependencies[0].depTriggerId]: {
							name:
								field.renderOptions &&
								field.renderOptions[0]?.renderPrimaryKey,
							description:
								field.renderOptions &&
								field.renderOptions[0]?.renderSecondaryKey,
							logo:
								field.renderOptions &&
								field.renderOptions[0]?.renderLogoKey,
							value: isEmpty
								? []
								: field.isRendered
								? response.data
								: response.data[0].data,
						},
					}
				)
			);
			setInputFieldLoading(false);
		});
	};

	useEffect(() => {
		if (formData.length && selectedTemplate?.inputFields?.length) {
			configureFormValidation(selectedTemplate.inputFields, formData);
		}
	}, [formData]);

	useEffect(() => {
		if (selectedTemplate && Object.keys(selectedTemplate).length > 0) {
			const { inputFields, template_id } = selectedTemplate;
			initializeFormData(inputFields);
			configureFormValidation(inputFields, formData);
			if (formData.length === 0 || action?.data?.length === 0) {
				setInputFieldLoading(true);
				dispatch(
					entity === "appPlaybooks"
						? getManualTaskTemplateDataPlaybook(
								workflow?.users,
								applicationId,
								template_id
						  )
						: getManualTaskTemplateData(
								workflow?.users,
								applicationId,
								template_id
						  )
				);
			}
		}
	}, [selectedTemplate]);

	const handleChangeTemplate = (obj) => {
		setInputFieldLoading(true);
		setFormData([]);
		setformInputValidation({});
		setSelectedTemplate(obj);
	};

	const addDefaultValuesToFields = (inputFields) => {
		const localArr = ["title", "description"];
		let defaultValues = [];
		inputFields.map((field) => {
			if (Array.isArray(field)) {
				field.map((inputField) => {
					if (ManualTaskTemplateData[inputField?.key]) {
						defaultValues.push({
							target: {
								name: inputField.key,
								value:
									ManualTaskTemplateData?.template_id ===
										"custom" &&
									localArr.includes(inputField?.key)
										? inputField?.key === "title"
											? action?.name
											: action?.description
										: ManualTaskTemplateData[
												inputField?.key
										  ],
								option: ManualTaskTemplateData[inputField?.key],
							},
						});
					}
					if (inputField.hasOwnProperty("defaultValue")) {
						defaultValues.push({
							target: {
								name: inputField.key,
								value: inputField["defaultValue"].value,
								option: inputField["defaultValue"],
							},
						});
					}
				});
			} else {
				if (ManualTaskTemplateData[field?.key]) {
					defaultValues.push({
						target: {
							name: field.key,
							value:
								ManualTaskTemplateData?.template_id ===
									"custom" && localArr.includes(field?.key)
									? field?.key === "title"
										? action?.name
										: action?.description
									: ManualTaskTemplateData[field?.key],
							option: ManualTaskTemplateData[field?.key],
						},
					});
				}
				if (field.hasOwnProperty("defaultValue")) {
					defaultValues.push({
						target: {
							name: field.key,
							value: field["defaultValue"].value,
							option: field["defaultValue"],
						},
					});
				}
			}
		});
		if (defaultValues.length) {
			handleOnChangeSetupForm(defaultValues, workflow.users, true);
		}
	};

	useEffect(() => {
		if (ManualTaskTemplateData) {
			const { inputFields } = ManualTaskTemplateData;
			initializeFormData(inputFields, ManualTaskTemplateData);
			addDefaultValuesToFields(inputFields);
			setInputFieldLoading(false);
		}
	}, [ManualTaskTemplateData]);

	const loader = (
		<>
			<div className="text-center mt-2">
				<Spinner className="mr-2 blue-spinner" animation="border" />
			</div>
		</>
	);

	const manualTaskHeader = (
		<>
			<header className="flex-1 d-flex justify-content-between mb-2">
				<div className="flex-1 d-flex flex-column justify-content-start">
					<div className="flex-1 d-flex flex-row justify-content-start">
						<h3 className="font-12 grey-1 bold-700 m-0">
							CREATE MANUAL TASK
						</h3>
					</div>
					<div className="flex-1 d-flex flex-row justify-content-start">
						<h3
							style={{ color: "#5ABAFF" }}
							className="font-12 bold-400 mt-1"
						>
							Assigned via{" "}
						</h3>
						<AssignedDropdown
							selectedAssignedVia={selectedAssignedVia}
							setSelectedAssignedVia={setSelectedAssignedVia}
						/>
					</div>
				</div>
				{/* {action?.id && (
					<Button
						type="link"
						onClick={() => {
							if (integration) {
								onChangeToAuto();
							}
						}}
						className={`text-uppercase font-12 ${
							!integration ? "o-5" : ""
						}`}
					>
						CONVERT TO Auto TASK
					</Button>
				)} */}
			</header>
		</>
	);

	const selectTemplateUI = !loading && (
		<>
			<p className="bold-600 font-16 mb-2 grey">Choose a template</p>
			<Select
				isOptionsLoading={templates.length ? false : true}
				options={templates}
				value={selectedTemplate ? selectedTemplate : null}
				fieldNames={{
					label: "name",
					description: "description",
					logo: "logo",
				}}
				placeholder="Select a manual action template"
				onChange={(template) => {
					handleChangeTemplate(template);
				}}
			></Select>
		</>
	);

	const handleScheduleApprovalChange = (obj, key) => {
		if (key === "ScheduleAction") {
			setScheduledData(obj);
		} else if (key === "ApprovalAction") {
			setApprovalData(obj);
		}
	};

	const deleteScheduleApprovalData = (obj, key) => {
		if (key === "ScheduleAction") {
			setScheduledData(obj);
		} else if (key === "ApprovalAction") {
			setApprovalData(obj);
		}
	};

	const scheduleApprovalSection = (
		<>
			{!loading &&
				selectedTemplate &&
				Object.keys(selectedTemplate).length > 0 && (
					<div className="d-flex flex-1 pb-1">
						<ScheduleApprovalAction
							scheduledData={scheduledData}
							approvalData={approvalData}
							action={action}
							handleScheduleApprovalChange={
								handleScheduleApprovalChange
							}
							deleteScheduleApprovalData={
								deleteScheduleApprovalData
							}
						/>
					</div>
				)}
		</>
	);

	const handleOnChangeSetupForm = (e, users, skipValidation = true) => {
		const fieldsDepToBeResolved = new Set();
		const data = [...formData];
		const selectedData = { ...data?.[0]?.v };
		let selectedDataTemplate = Object.assign({}, data?.[0]?.v) || {};
		let value = {};
		Object.keys(selectedDataTemplate).forEach((k) => {
			value = { ...value, [k]: selectedDataTemplate?.[k] };
		});
		if (Array.isArray(e)) {
			e.forEach((event) => {
				if (event.target.name === "license") {
					value = {
						...value,
						[event.target.name]: event.target.option,
					};
				} else if (event.target.name === "assignee") {
					value = {
						...value,
						[event.target.name]: event.target.value,
					};
				} else {
					value = {
						...value,
						[event.target.name]: event.target.value,
					};
				}
			});
		} else {
			if (e.target.name === "license") {
				value = {
					...value,
					[e.target.name]: e.target.option,
				};
			} else if (e.target.name === "assignee") {
				value = {
					...value,
					[e.target.name]: e.target.value,
				};
			} else {
				value = { ...value, [e.target.name]: e.target.value };
			}
		}
		if (isTemplate) {
			data[0] = {
				k: null,
				v: value,
			};
			selectedTemplate?.inputFields?.forEach((field) => {
				if (Array.isArray(field)) {
					field.forEach((inputField) => {
						if (
							inputField.hasOwnProperty("renderCondition") &&
							checkRenderConditions(inputField, data) &&
							inputField.hasOwnProperty("dependencies")
						) {
							fieldsDepToBeResolved.add(inputField);
						}
					});
				} else {
					if (
						field.hasOwnProperty("renderCondition") &&
						checkRenderConditions(field, data) &&
						field.hasOwnProperty("dependencies")
					) {
						fieldsDepToBeResolved.add(field);
					}
				}
			});

			const assignToSelectedData = (event) => {
				if (event.target.name === "license") {
					Object.assign(value, {
						...value["template"],
						[event.target.name]: event.target.option,
					});
				} else {
					Object.assign(value, {
						...value["template"],
						[event.target.name]: event.target.value,
					});
				}
			};

			if (Array.isArray(e)) {
				e.forEach((event) => {
					assignToSelectedData(event);
				});
			} else {
				assignToSelectedData(e);
			}
		}
		users?.forEach((user) => {
			if (Array.isArray(e)) {
				e.forEach((event) => {
					if (event.target.name === "license") {
						value = {
							...value,
							[event.target.name]: event.target.option,
						};
					} else if (event.target.name === "assignee") {
						if (
							Array.isArray(event?.target?.value) &&
							event?.target?.value?.length > 0
						) {
							const key = event?.target?.value?.[0]?.key;
							let assignee = null;
							if (key && key !== "custom") {
								assignee =
									manualTaskAssigneeData?.[key]?.assignee;
							}
							value = {
								...value,
								[event.target.name]:
									assignee?.[user.user_id] ||
									event.target.value?.[user.user_id] ||
									event.target.value,
							};
						} else if (
							Object.keys(event?.target?.value).length > 0
						) {
							value = {
								...value,
								[event.target.name]:
									event.target.value?.[user.user_id],
							};
						} else {
							value = {
								...value,
								[event.target.name]: event.target.value,
							};
						}
					} else {
						value = {
							...value,
							[event.target.name]: event.target.value,
						};
					}
				});
			} else {
				if (e.target.name === "license") {
					value = {
						...value,
						[e.target.name]: e.target.option,
					};
				} else if (e.target.name === "assignee") {
					if (
						Array.isArray(e?.target?.value) &&
						e?.target?.value?.length > 0
					) {
						const key = e?.target?.value?.[0]?.key;
						let assignee = null;
						if (key && key !== "custom") {
							assignee = manualTaskAssigneeData?.[key]?.assignee;
						}
						value = {
							...value,
							[e.target.name]:
								assignee?.[user.user_id] ||
								e.target.value?.[user.user_id] ||
								e.target.value,
						};
					} else if (Object.keys(e?.target?.value).length > 0) {
						value = {
							...value,
							[e.target.name]: e.target.value?.[user.user_id],
						};
					} else {
						value = {
							...value,
							[e.target.name]: e.target.value,
						};
					}
				} else {
					value = { ...value, [e.target.name]: e.target.value };
				}
			}
			const index = data.findIndex((obj) => obj.k === user.user_id);
			if (index >= 0) {
				const userData = Object.assign(
					{ k: user.user_id },
					{
						v: Object.assign({}, data[index].v, value),
					}
				);
				data.splice(index, 1, userData);
			} else {
				data.push({
					k: user.user_id,
					v: value,
				});
			}
			selectedTemplate?.inputFields?.forEach((field) => {
				if (Array.isArray(field)) {
					field.forEach((inputField) => {
						if (
							inputField.hasOwnProperty("renderCondition") &&
							checkRenderConditions(inputField, data) &&
							inputField.hasOwnProperty("dependencies")
						) {
							fieldsDepToBeResolved.add(inputField);
						}
					});
				} else {
					if (
						field.hasOwnProperty("renderCondition") &&
						checkRenderConditions(field, data) &&
						field.hasOwnProperty("dependencies")
					) {
						fieldsDepToBeResolved.add(field);
					}
				}
			});

			// const assignToSelectedData = (event) => {
			// 	if (event.target.name === "license") {
			// 		Object.assign(value, {
			// 			...value[user.user_id],
			// 			[event.target.name]: event.target.option,
			// 		});
			// 	} else {
			// 		Object.assign(value, {
			// 			...value[user.user_id],
			// 			[event.target.name]: event.target.value,
			// 		});
			// 	}
			// };

			// if (Array.isArray(e)) {
			// 	e.forEach((event) => {
			// 		assignToSelectedData(event);
			// 	});
			// } else {
			// 	assignToSelectedData(e);
			// }
		});
		// setSelectedDynamicOptions(selectedData);
		setFormData(data);
		fieldsDepToBeResolved.forEach((field) => {
			resolveDependency(field, null, data);
		});
		if (!skipValidation) {
			validationDynamic(data);
		}
	};

	const renderInputFields = !loading &&
		!inputFieldLoading &&
		selectedTemplate &&
		Object.keys(selectedTemplate).length > 0 &&
		selectedTemplate?.inputFields &&
		Array.isArray(selectedTemplate?.inputFields) &&
		selectedTemplate?.inputFields.length && (
			<div className="mt-2">
				{selectedTemplate?.inputFields
					?.filter((field) => {
						if (Array.isArray(field)) {
							return field.filter(
								(inputField) => inputField.isRendered
							);
						}
						return field.isRendered;
					})
					?.map((field, index) => {
						if (Array.isArray(field)) {
							return (
								<div
									key={index}
									className="d-flex flex-1 flex-wrap"
								>
									{field
										.filter(
											(inputField) =>
												inputField.isRendered
										)
										.map((inputField, idx) => {
											return (
												<ManualTaskActionFieldRenderer
													renderSingleRow={true}
													depsTriggerResponse={
														depsTriggerResponse
													}
													key={idx}
													action={action}
													formInputValidation={
														formInputValidation
													}
													handleOnChangeSetupForm={
														handleOnChangeSetupForm
													}
													defaultValue={
														formData.length > 0
															? formData[0].v[
																	inputField
																		.key
															  ]
															: null
													}
													workflow={workflow}
													userSpecificField={false}
													users={workflow.users}
													formData={formData}
													field={inputField}
													isTemplate={isTemplate}
													applicationId={
														applicationId
													}
													dueIn={dueIn}
													setDueIn={setDueIn}
													manualTaskAssigneeData={
														manualTaskAssigneeData
													}
													resolveDependency={
														resolveDependency
													}
												/>
											);
										})}
								</div>
							);
						} else {
							return (
								<ManualTaskActionFieldRenderer
									depsTriggerResponse={depsTriggerResponse}
									key={index}
									action={action}
									formInputValidation={formInputValidation}
									handleOnChangeSetupForm={
										handleOnChangeSetupForm
									}
									defaultValue={
										formData.length > 0
											? formData[0].v[field.key]
											: null
									}
									workflow={workflow}
									userSpecificField={false}
									users={workflow.users}
									formData={formData}
									field={field}
									isTemplate={isTemplate}
									applicationId={applicationId}
									dueIn={dueIn}
									setDueIn={setDueIn}
									manualTaskAssigneeData={
										manualTaskAssigneeData
									}
									resolveDependency={resolveDependency}
								/>
							);
						}
					})}
				<div className="d-flex">
					<Button
						className="mt-2 flex-fill  mr-3"
						disabled={addingTaskLoader}
						onClick={() => {
							addTask();
						}}
					>
						Save Task
						{addingTaskLoader && (
							<Spinner
								className=" ml-2 mr-2 blue-spinner action-edit-spinner"
								animation="border"
								style={{ top: "1px" }}
							/>
						)}
					</Button>
					<Button
						className="mt-2 pr-4 pl-4"
						type="reverse"
						onClick={() => {
							dispatch(setEditActionWorkflow(null));
						}}
					>
						Cancel
					</Button>
				</div>
			</div>
		);

	const inputFieldLoader = !loading && inputFieldLoading && loader;

	const getScheduleApprovalData = () => {
		const obj = {};
		if (scheduledData && Object.keys(scheduledData).length > 0) {
			obj.isScheduledAction = true;
			obj.scheduledData = scheduledData;
		} else {
			obj.isScheduledAction = false;
			obj.scheduledData = scheduledData || null;
		}
		if (approvalData && approvalData.length > 0) {
			obj.approvers = approvalData;
			obj.isSetForApproval = true;
		} else {
			obj.approvers = [];
			obj.isSetForApproval = false;
		}
		return obj;
	};

	const getAssigneeRelation = () => {
		let assignee_relation = "custom";
		const { key } = formData?.[0]?.v?.assignee?.[0];
		if (key) {
			assignee_relation = key;
		}
		return assignee_relation;
	};

	const addTask = (obj = {}) => {
		if (validationDynamic(formData)) {
			setAddingTaskLoader(true);
			const scheduleApprovalData = getScheduleApprovalData();
			const task = Object.assign(
				{},
				action,
				{
					data: formData,
					isValidated: true,
					manual_action_template_id: selectedTemplate?.template_id,
					assignee_relation: getAssigneeRelation(),
					dueDateData: dueIn,
					type: ACTION_TYPE.MANUAL,
					name: formData?.[0]?.v?.title,
					description: formData?.[0]?.v?.description,
				},
				{ ...scheduleApprovalData },
				obj
			);
			submitManualTask(task);
		}
	};

	useEffect(() => {
		if (applicationId) {
			getManualTaskAssigneeSuggestionsAPI(
				applicationId,
				workflow.id,
				isTemplate
			)
				.then((res) => setManualTaskAssigneeData(res))
				.catch((err) =>
					TriggerIssue(
						"Error in get Manual Task Assignee Suggestions API",
						err
					)
				);
		} else {
			getDefaultNodeManualTaskAssigneeSuggestionsAPI(
				workflow?.id,
				isTemplate
			)
				.then((res) => setManualTaskAssigneeData(res))
				.catch((err) =>
					TriggerIssue(
						"Error in get Default Node Manual Task Assignee Suggestions API",
						err
					)
				);
		}
	}, []);

	return (
		<>
			{manualTaskHeader}
			{loading && loader}
			{selectTemplateUI}
			{scheduleApprovalSection}
			{inputFieldLoader}
			{renderInputFields}
		</>
	);
};

export default ManualTaskAction;

ManualTaskAction.propTypes = {
	action: PropTypes.object,
};

ManualTaskAction.defaultProps = {
	action: {},
};
