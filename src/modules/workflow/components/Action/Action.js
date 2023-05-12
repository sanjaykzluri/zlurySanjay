import React, { useEffect, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { Select } from "../../../../UIComponents/Select/Select";
import { sortableHandle } from "react-sortable-hoc";
import {
	actionValidation,
	getActionSetUpForm,
	getActionSetUpFormStaticNode,
	getApplicationsActions,
	getStaticApplicationsActions,
	resolveActionDepTrigger,
	getManualTaskAssigneeSuggestionsAPI,
} from "../../service/api";
import { WorkFlowActionModel } from "../../model/model";
import { useDispatch, useSelector } from "react-redux";
import {
	ACTION_EDIT_OPTIONS,
	ACTION_SCOPE_VALIDATION_ERROR,
	ACTION_TYPE,
	excludeActionFromManualTask,
	MANUAL_TASK_INPUT_FIELD,
} from "../../constants/constant";
import "./Action.css";
import ToggleSwitch from "react-switch";

import { Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import window from "../../../../assets/icons/window-select.svg";
import info from "../../../../assets/icons/info-orange.svg";
import error from "../../../../assets/icons/error.svg";
import drag from "../../../../assets/workflow/actions-drag.svg";
import { ManualTask } from "../ManualTask/ManualTask";
import HttpRequestWebhook from "../HttpRequestWebhook/HttpRequestWebhook";
import { IntegrationStatus } from "../../../integrations/containers/IntegrationStatus/IntegrationStatus";
import MulitInputModal from "../MulitInputModal/MulitInputModal";
import { ActionFieldRenderer } from "../ActionFieldRenderer/ActionFieldRenderer";
import { INPUT_TYPE } from "../../../../constants/ui";
import { TriggerIssue } from "../../../../utils/sentry";
import ScheduleApprovalAction from "../ScheduleApprovalAction/ScheduleApprovalAction";
import {
	renderApprovalDataUI,
	renderScheduledDataUI,
} from "../ScheduleApprovalAction/RenderScheduleApprovalUI";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";
import ManualTaskAction from "../ManualTaskAction/ManualTaskAction";
import ViewPlaybookActionRenderData from "../ViewPlaybook/ViewPlaybookActionRenderData";

import { LicenseOptimizationAction } from "modules/applications/components/automation/LicenseOptimizationAction/licenseOptimization";
import { LicenseOptimizationContainer } from "modules/applications/components/automation/LicenseOptimizationAction/licenseOptimizationContainer";
import ActionPrerequisites from "../ActionPrerequisites/ActionPrerequisites";

export function Action(props) {
	const [actionsList, setActionsList] = useState([]);
	const { partner } = useContext(RoleContext);
	const [convertToManualTask, setConvertToManualTask] = useState(false);
	const [httpRequestAction, setHttpRequestAction] = useState(false);
	const [licenseOptimizationAction, setLicenseOptimizationAction] =
		useState(false);
	const [actionEditing, setActionEditing] = useState(false);
	const workflow = useSelector((state) => state[props.entity].workflow);
	const editActionWorkflow = useSelector(
		(state) => state[props.entity].editActionWorkflow
	);
	const [formDetails, setFormDetails] = useState(null);
	const [formData, setFormData] = useState([]);
	const [depsTriggerResponse, setDepsTriggerResponse] = useState({});
	const [isFetchingForm, setIsFetchingForm] = useState(false);
	const [isActionSelectedLoader, setIsActionSelectedLoader] = useState(false);
	const [isEditActionLoading, setIsEditActionLoading] = useState(false);
	const [addingTaskLoader, setAddingTaskLoader] = useState(false);
	const [formInputValidation, setformInputValidation] = useState({});
	const [showMultiInputModal, setShowMultiInputModal] = useState(false);
	const [hidePermission, setHidePermission] = useState(false);
	const [editMultiInputField, setEditMultiInputField] = useState(null);
	const [checkIfFormValidated, setCheckIfFormValidated] = useState(false);
	const [showIntegrationRequired, setShowIntegrationRequired] =
		useState(false);
	const dispatch = useDispatch();
	const [selectedDynamicOptions, setSelectedDynamicOptions] = useState(
		props.action.selectedDynamicOptions || {}
	);
	const editApplication = useSelector(
		(state) => state[props.entity].editApplication
	);
	const [scheduledData, setScheduledData] = useState(
		(props?.action?.scheduledData &&
			props?.action?.scheduledData?.duration &&
			props?.action?.scheduledData) ||
			null
	);
	const [approvalData, setApprovalData] = useState(
		props?.action?.approvers || []
	);
	const [manualTaskAssigneeData, setManualTaskAssigneeData] = useState(null);

	const integrationAccounts = useSelector(
		(state) => state.workflows.integrationAccounts
	);

	useEffect(() => {
		if (!props.action.workflowActionID) {
			setActionEditing(true);
			setIsEditActionLoading(false);
			if (
				props.application.id &&
				props?.folderType !== "license_management"
			) {
				const integrationsArray =
					integrationAccounts[props.application.id];
				const selectedIntegrationAccount = integrationsArray
					?.flatMap(
						(item) =>
							item?.accounts &&
							Array.isArray(item?.accounts) &&
							item?.accounts?.length &&
							item?.accounts?.filter(
								(account) =>
									account?.org_integration_id ===
									props.application?.orgIntegrationID
							)
					)
					?.filter((id) => id);
				getApplicationsActions(
					props.application.id,
					selectedIntegrationAccount?.[0]?.parent_integration_id,
					"all"
				)
					.then((res) => {
						setActionsList(
							res.actions
								.map((action) => {
									if (action.inputFields?.length === 0) {
										action.data_reusable = true;
									}
									action.action_id = action._id;
									return action;
								})
								.map((action) => {
									if (action.inputFields?.length === 0) {
										action.data_reusable = true;
									}

									if (action.group) {
										action.group = action.group.replaceAll(
											"ZLURI",
											partner?.name
										);
									}

									action.name = action.name.replaceAll(
										"Zluri",
										partner?.name
									);
									action.description =
										action.description.replaceAll(
											"Zluri",
											partner?.name
										);

									return new WorkFlowActionModel(action);
								})
						);
					})
					.catch((err) => {
						TriggerIssue(
							"Error on getting application actions",
							err
						);
					});
			} else {
				if (props?.folderType === "license_management") {
					setActionsList([
						{
							...new WorkFlowActionModel(),
							uniqId: "ZLURI.LICENSE_OPTIMIZATIOIN",
							type: "license_optimization",
							name: "Request to Forgo License",
							description:
								"Request your employees to forego a license incase of scenarios like low usage. Automate based on your employee’s responses.",
						},
						{
							...new WorkFlowActionModel(),
							uniqId: "ZLURI.LICENSE_OPTIMIZATIOIN",
							type: "license_optimization",
							name: "Remove License",
							description:
								"Automate series of action to remove licenses for an employee on a given date.",
						},
						{
							...new WorkFlowActionModel(),
							uniqId: "ZLURI.LICENSE_OPTIMIZATIOIN",
							type: "license_optimization",
							name: "Downgrade License",
							description:
								"Downgrade license when required using a playbook.",
						},
					]);
					setLicenseOptimizationAction(true);
				} else {
					getStaticApplicationsActions("zluri")
						.then((res) => {
							const httpRequestIndex = res.actions.findIndex(
								(action) =>
									action.uniqId ===
									"ZLURI_STATIC.MAKE_HTTP_REQUEST"
							);
							if (httpRequestIndex === -1) {
								res.actions.push({
									...new WorkFlowActionModel(),
									uniqId: "ZLURI_STATIC.MAKE_HTTP_REQUEST",
									type: "static",
									name: "Make an HTTP Request",
									description:
										"Make HTTP request from the workflow",
								});
							}
							setActionsList(
								res.actions
									.map((action) => {
										action.action_id = action._id;
										return action;
									})
									.map((action) => {
										if (action.group) {
											action.group = action.group.replace(
												"ZLURI",
												partner?.name.toUpperCase()
											);
										}

										return new WorkFlowActionModel(action);
									})
							);
						})
						.catch((err) => {
							TriggerIssue(
								"Error on getting static actions",
								err
							);
						});
				}
			}
		}
	}, []);

	const onCancel = () => {
		setActionEditing(false);
	};
	useEffect(() => {
		if (
			editActionWorkflow &&
			editActionWorkflow.workflowActionID ===
				props.action.workflowActionID
		) {
			setActionEditing(true);
			setAddingTaskLoader(false);
			typeBaseAction();
		} else {
			setActionEditing(false);
		}
		setIsEditActionLoading(false);
	}, [editActionWorkflow]);

	useEffect(() => {
		if (formDetails) {
			initializeFormData(formDetails.inputFields);
			if (!props.action.data?.length) {
				addDefaultValuesToFields();
			}
		}
	}, [formDetails]);

	useEffect(() => {
		if (formData.length && formDetails?.inputFields?.length) {
			configureFormValidation(formDetails.inputFields, formData);
		}
		if (
			formData.length &&
			checkIfFormValidated &&
			!props.action.data.length
		) {
			addTask();
		}
	}, [formData]);

	useEffect(() => {
		if (props.scopeValidation && actionEditing) {
			initAutoTask();
		}
	}, [props.scopeValidation]);

	const typeBaseAction = () => {
		switch (props.action.type) {
			case ACTION_TYPE.MANUAL:
				if (
					props.application.isStatic &&
					props.action.type !== ACTION_TYPE.MANUAL
				) {
					setHttpRequestAction(false);
					setConvertToManualTask(false);
					setShowIntegrationRequired(false);
					setIsFetchingForm(true);
					fetchDynamicForm(true);
				} else {
					setHttpRequestAction(false);
					setConvertToManualTask(true);
					setIsFetchingForm(false);
					setShowIntegrationRequired(false);
				}
				break;
			case ACTION_TYPE.INTERNAL:
				setHttpRequestAction(false);
				setConvertToManualTask(false);
				setShowIntegrationRequired(false);
				setIsFetchingForm(true);
				fetchDynamicForm(false);
				break;
			case ACTION_TYPE.STATIC:
				setConvertToManualTask(false);
				setHttpRequestAction(true);
				setIsFetchingForm(false);
				setShowIntegrationRequired(false);
				break;
			case ACTION_TYPE.LICENSE_OPTIMIZATION:
				setConvertToManualTask(false);
				setHttpRequestAction(false);
				setIsFetchingForm(false);
				setLicenseOptimizationAction(true);
				setShowIntegrationRequired(false);
				break;
			default:
				initAutoTask();
				break;
		}
	};

	const initAutoTask = () => {
		setHttpRequestAction(false);
		setConvertToManualTask(false);
		if (props.action.orgIntegrationID && props.orgIntegrationID) {
			if (
				props.scopeValidation &&
				Object.keys(props.scopeValidation).length
			) {
				if (props.scopeValidation.success) {
					fetchDynamicForm();
				} else if (
					props.scopeValidation.error ===
					ACTION_SCOPE_VALIDATION_ERROR.DISCONNECTED
				) {
					setShowIntegrationRequired(true);
					setIsFetchingForm(false);
				}
			} else {
				getActionValidationStatus();
			}
		} else {
			setShowIntegrationRequired(true);
		}
	};

	const getActionValidationStatus = () => {
		props.getActionValidationStatus(
			workflow,
			props.action,
			props.orgIntegrationID,
			props.isTemplate
		);
	};

	const initializeFormData = (fields) => {
		const data = [];
		workflow.users.forEach((user) => {
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
			if (props.action.data.length) {
				const index = props.action.data.findIndex(
					(d) => d.k === user.user_id
				);
				if (index > -1) {
					Object.assign(obj, {
						v: props.action.data[index].v,
					});
				}
			}
			data.push(obj);
		});

		if (props.isTemplate) {
			data.push({
				k: null,
				v: props.action.data.length ? props.action.data[0].v || {} : {},
			});
		}

		setFormData(data);
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
						data[key] = props?.application?.id || "";
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

	const addDefaultValuesToFields = () => {
		let defaultValues = [];
		formDetails.inputFields.map((field) => {
			if (Array.isArray(field)) {
				field.map((inputField) => {
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
			// setCheckIfFormValidated(true);
		}
	};

	const configureFormValidation = (fields, formData) => {
		let obj = { ...formInputValidation };

		fields.map((field) => {
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
								inputField?.inputType !== INPUT_TYPE.CHECKBOX,

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
							(inputField?.hasOwnProperty("dependencies") &&
								inputField?.dependencies?.length > 0 &&
								!inputField?.hasOwnProperty(
									"renderCondition"
								) &&
								!depsTriggerResponse?.hasOwnProperty([
									inputField?.dependencies?.[0]?.depTriggerId,
								])) ||
							inputField?.inputType ===
								MANUAL_TASK_INPUT_FIELD.ASSIGNEE
						) {
							resolveDependency(inputField, "");
						}
					});
				} else {
					isConditionValid = checkRenderConditions(field, formData);
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
						(field?.hasOwnProperty("dependencies") &&
							field?.dependencies?.length > 0 &&
							!field?.hasOwnProperty("renderCondition") &&
							!depsTriggerResponse?.hasOwnProperty([
								field?.dependencies?.[0]?.depTriggerId,
							])) ||
						field?.inputType === MANUAL_TASK_INPUT_FIELD.ASSIGNEE
					) {
						resolveDependency(field, "");
					}
				}
			}
		});
		setformInputValidation(obj);
	};

	const fetchDynamicForm = (isStatic) => {
		setIsFetchingForm(true);
		if (isStatic) {
			getActionSetUpFormStaticNode("zluri", props.action.uniqId).then(
				(res) => {
					// Commented below code to not setup action if InputFields don't have any field to render on UI.
					// const shouldRender = res.inputFields.filter((field) => field.isRendered).length;
					// if (!shouldRender) addTask();
					setFormDetails(res);
					setIsFetchingForm(false);
				}
			);
		} else {
			getActionSetUpForm(props.action.id).then((res) => {
				setFormDetails(res);
				setIsFetchingForm(false);
			});
		}
	};

	const resolveDependency = (field, query = null, formDataObj = null) => {
		if (field?.inputType === MANUAL_TASK_INPUT_FIELD.ASSIGNEE) {
			getManualTaskAssigneeSuggestionsAPI(
				props.application.id,
				workflow.id,
				props.isTemplate
			)
				.then((res) => setManualTaskAssigneeData(res))
				.catch((err) =>
					TriggerIssue(
						"Error in get Manual Task Assignee Suggestions API",
						err
					)
				);
		} else {
			let obj = formDataObj ? formDataObj : formData;
			const options = { ...depsTriggerResponse };
			delete options[
				field.dependencies?.length &&
					field?.dependencies?.[0]?.depTriggerId
			];
			setDepsTriggerResponse(options);
			const data = {};
			if (!checkRenderConditions(field, obj)) {
				return;
			}
			if (
				checkRenderConditions(field, obj) &&
				field?.dependencies?.[0]?.hasOwnProperty("depRequestDataModel")
			) {
				Object.assign(
					data,
					generateRequestDataModel(field, query, obj)
				);
				if (!Object.keys(data).length) {
					return;
				}
			}

			resolveActionDepTrigger(
				workflow.id,
				props.action.workflowActionID,
				field.key,
				field.dependencies[0].depTriggerId,
				data,
				null,
				props.isTemplate
			)
				.then((response) => {
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
										field.renderOptions[0]
											?.renderPrimaryKey,
									description:
										field.renderOptions &&
										field.renderOptions[0]
											?.renderSecondaryKey,
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
					setIsFetchingForm(false);
				})
				.catch((err) =>
					TriggerIssue("Error in resolve Action Dep Trigger API", err)
				);
		}
	};

	const onRefresh = (field) => {
		const data = Object.assign({}, depsTriggerResponse);
		delete data[field.dependencies[0].depTriggerId];
		setDepsTriggerResponse(data);
		resolveActionDepTrigger(
			workflow.id,
			props.action.workflowActionID,
			field.key,
			field.dependencies[0].depTriggerId,
			{},
			null,
			props.isTemplate
		).then((response) => {
			setDepsTriggerResponse(
				Object.assign(
					{},
					{
						[field.dependencies[0].depTriggerId]: {
							name: field.renderOptions[0]?.renderPrimaryKey,
							value: response.data,
							description:
								field.renderOptions &&
								field.renderOptions[0]?.renderSecondaryKey,
							logo:
								field.renderOptions &&
								field.renderOptions[0]?.renderLogoKey,
						},
					}
				)
			);
		});
	};

	const scopeValidationErrorMessage = () => {
		switch (props.scopeValidation?.error) {
			case ACTION_SCOPE_VALIDATION_ERROR.DISCONNECTED:
				return `The selected instance is disconnected. Please select another instance of ${props.application.name} or connect a new instance`;
			default:
				return `This action requires ${props.application.name} integration for Zluri`;
		}
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
					if (
						(typeof user?.v[key] !== "boolean" &&
							!user.v[key] &&
							obj[key].required) ||
						(obj[key].regex &&
							!new RegExp(
								obj[key].regex.replaceAll("/", "")
							).test(user.v[key]) &&
							obj[key].required) ||
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
										props.isTemplate ? "template" : user.k,
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

	const handleOnChangeSetupForm = (e, users, skipValidation = false) => {
		const fieldsDepToBeResolved = new Set();
		const data = [...formData];
		const selectedData = { ...selectedDynamicOptions };
		let selectedDataTemplate =
			Object.assign({}, selectedDynamicOptions).template || {};
		var value = {};
		Object.keys(selectedDataTemplate).forEach((k) => {
			value = { ...value, [k]: selectedDataTemplate[k].value };
		});
		if (Array.isArray(e)) {
			e.forEach((event) => {
				value = { ...value, [event.target.name]: event.target.value };
			});
		} else {
			value = { ...value, [e.target.name]: e.target.value };
		}
		if (props.isTemplate) {
			data[0] = {
				k: null,
				v: value,
			};
			formDetails.inputFields.forEach((field) => {
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
				Object.assign(selectedData, {
					template: {
						...selectedData["template"],
						[event.target.name]: {
							option: Array.isArray(event.target.option)
								? event.target.option
								: event.target.option
								? [event.target.option]
								: [],
							label: event.target.label,
							value: event.target.value,
							logo: event.target.logo,
							description: event.target.description,
						},
					},
				});
			};

			if (Array.isArray(e)) {
				e.forEach((event) => {
					assignToSelectedData(event);
				});
			} else {
				assignToSelectedData(e);
			}
		}
		users.forEach((user) => {
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
			formDetails.inputFields.forEach((field) => {
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
				Object.assign(selectedData, {
					[user.user_id]: {
						...selectedData[user.user_id],
						[event.target.name]: {
							option: Array.isArray(event.target.option)
								? event.target.option
								: event.target.option
								? [event.target.option]
								: [],
							label: event.target.label,
							value: event.target.value,
							logo: event.target.logo,
							description: event.target.description,
						},
					},
				});
			};

			if (Array.isArray(e)) {
				e.forEach((event) => {
					assignToSelectedData(event);
				});
			} else {
				assignToSelectedData(e);
			}
		});
		setSelectedDynamicOptions(selectedData);
		setFormData(data);
		fieldsDepToBeResolved.forEach((field) => {
			resolveDependency(field, null, data);
		});
		if (!skipValidation) {
			validationDynamic(data);
		}
	};

	const openMulitInputDrawer = (field) => {
		setShowMultiInputModal(true);
		setEditMultiInputField(field);
	};

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

	const getAssigneeRelationData = () => {
		const fieldIndex = formDetails?.inputFields?.findIndex(
			(field) => field?.inputType === MANUAL_TASK_INPUT_FIELD.ASSIGNEE
		);
		if (fieldIndex > -1) {
			const fieldKey = formDetails?.inputFields?.[fieldIndex]?.key;
			const selectedDynamicOptionsData = { ...selectedDynamicOptions };
			const keys = Object.keys(selectedDynamicOptionsData);
			if (
				keys.length &&
				selectedDynamicOptionsData?.[keys?.[0]]?.[fieldKey]
			) {
				const { option = [] } =
					selectedDynamicOptionsData?.[keys?.[0]]?.[fieldKey];
				return { zluri_user_relation: option?.[0]?.key || null };
			}
		}
		return { zluri_user_relation: null };
	};

	const addTask = (obj = {}) => {
		if (validationDynamic(formData)) {
			setAddingTaskLoader(true);
			setIsActionSelectedLoader(true);
			const scheduleApprovalData = getScheduleApprovalData();
			const assigneeRelationData = getAssigneeRelationData();
			const task = Object.assign(
				{},
				props.action,
				{
					data: formData,
					selectedDynamicOptions: selectedDynamicOptions,
					isValidated: true,
					isScopeValidated: props.scopeValidation?.success
						? true
						: false,
				},
				{ ...scheduleApprovalData },
				{ ...assigneeRelationData },
				obj
			);
			props.addAction(task);
		}
	};

	const onEditAction = (obj) => {
		if (!editApplication?.workflowApplicationID) {
			return;
		}
		setIsEditActionLoading(true);
		switch (obj.type) {
			case "edit":
				dispatch(props.setEditActionWorkflow(props.action));
				break;
			case "delete":
				props.deleteAction(props.action);
				break;
			default:
				break;
		}
	};

	const onConvertToManualtask = () => {
		setConvertToManualTask(true);
	};

	const showErrorInfo = (messageNode) => {
		return (
			<OverlayTrigger
				placement="right"
				delay={{
					show: 250,
					hide: 400,
				}}
				overlay={(props) => (
					<Tooltip {...props} id="button-tooltip">
						{messageNode}
					</Tooltip>
				)}
			>
				<img
					src={
						!props.action.isValidated ||
						(props.action.type === "integration" &&
							!props.action.orgIntegrationID)
							? error
							: info
					}
					className="ml-2 mr-3"
				/>
			</OverlayTrigger>
		);
	};

	const addPermissionUI = (
		<>
			{props.integration &&
				props.scopeValidation &&
				!props.scopeValidation.success &&
				props.scopeValidation.error ===
					ACTION_SCOPE_VALIDATION_ERROR.SCOPE_MISSING && (
					<div className="mt-3 action-scope-validation p-2 d-flex">
						<div className="position-relative mr-4">
							<img src={window} width={69} />
							<img
								className="img-circle"
								width={26}
								src={props.application.logo}
							/>
						</div>
						<div className="m-0 font-13">
							<p className="mb-0">
								{partner?.name} doesn’t have the required
								permissions to perform this task
							</p>
							<div className="d-flex justify-content-between">
								<div className="d-flex">
									<IntegrationStatus
										scopes={
											props.scopeValidation.missingScopes
										}
										scopeDetails={props.scopeValidation}
										addText="Add Permission"
										addScopesToOrgID={
											props.action.orgIntegrationID
										}
										orgIntegrationId={
											props.action.orgIntegrationID
										}
										blockNavigation={true}
										onboarding={false}
										triggerWorkflowRefresh={true}
										inSlider={false}
										onSuccess={(org) => {
											props.onIntegrationScopeChange(org);
										}}
										onRequestSent={(data) => {}}
										integration={props.integration}
										isSimilarIntegration={false}
									/>

									<Button
										className="text-captalize  font-12"
										type="link"
										onClick={() => {
											onIgnoreScopeValidation();
										}}
									>
										Ignore
									</Button>
								</div>
								<Button
									className="text-captalize  font-12"
									type="link"
									onClick={() => {
										setConvertToManualTask(true);
									}}
								>
									Convert to manual task
								</Button>
							</div>
						</div>
					</div>
				)}
		</>
	);

	const handleScheduleApprovalChange = (obj, key) => {
		if (key === "ScheduleAction") {
			setScheduledData(obj);
		} else if (key === "ApprovalAction") {
			setApprovalData(obj);
		}
	};

	const deleteScheduleApprovalData = (obj, key, updateAction = false) => {
		if (key === "ScheduleAction") {
			setScheduledData(obj);
			if (updateAction) {
				props.setLoading(true);
				addTask({
					isScheduledAction: false,
					scheduledData: null,
					data: props.action.data,
				});
			}
		} else if (key === "ApprovalAction") {
			setApprovalData(obj);
			if (updateAction) {
				props.setLoading(true);
				addTask({
					isSetForApproval: false,
					approvers: [],
					data: props.action.data,
				});
			}
		}
	};

	const scheduleApprovalSection = (
		<>
			{!showIntegrationRequired && (
				<div className="d-flex flex-1">
					<ScheduleApprovalAction
						scheduledData={scheduledData}
						approvalData={approvalData}
						action={props.action}
						handleScheduleApprovalChange={
							handleScheduleApprovalChange
						}
						deleteScheduleApprovalData={deleteScheduleApprovalData}
					/>
				</div>
			)}
		</>
	);

	const connectIntegrationUI = (
		<>
			{showIntegrationRequired && (
				<div className="mt-3 action-scope-validation p-2 d-flex">
					<div className="position-relative mr-4">
						<img src={window} width={69} />
						<img
							className="img-circle"
							width={26}
							src={props.application.logo}
						/>
					</div>
					<div className="m-0 font-13 w-100">
						<p className="mb-0">{scopeValidationErrorMessage()}</p>
						<div className="d-flex justify-content-between">
							<div className="d-flex">
								{props.integration && (
									<IntegrationStatus // Connect a new Scope
										blockNavigation={true}
										onboarding={false}
										triggerWorkflowRefresh={true}
										inSlider={false}
										onSuccess={(orgIntegrationId) => {
											props.onIntegrationConnection(
												orgIntegrationId
											);
										}}
										onRequestSent={(data) => {}}
										integration={props.integration}
										isSimilarIntegration={false}
									/>
								)}
								{/* <Button
									className="text-captalize  font-12"
									type="link"
									onClick={() => {
										onIgnoreScopeValidation();
									}}
								>
									Ignore
								</Button> */}
							</div>
							<Button
								className="text-captalize  font-12"
								type="link"
								onClick={() => {
									setConvertToManualTask(true);
								}}
							>
								Convert to manual task
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);

	const actionValidationUI = () => {
		if (
			props.action.type === ACTION_TYPE.INTEGRATION &&
			props.action.type !== ACTION_TYPE.MANUAL &&
			!props.action.orgIntegrationID
		) {
			return showErrorInfo(
				<p className="m-0 font-12 grey-1 mb-2">
					To perform this action, you need to have an integration with{" "}
					{props.application.name || "Application"} else you can try
					converting it to a manual task.
				</p>
			);
		}
		if (!props.action.isValidated) {
			return showErrorInfo(
				<p className="m-0 font-12 grey-1 mb-2">
					There are a few parameters need to be added with this
					action. Please setup the action completely
				</p>
			);
		}
		if (
			props.scopeValidation?.error &&
			props.action.type !== ACTION_TYPE.MANUAL
		) {
			return showErrorInfo(
				<p className="m-0 font-12 grey-1 mb-2">
					{partner?.name} doesn't have the required permissions to
					perform this task
				</p>
			);
		}
		return null;
	};

	const DragHandle = sortableHandle(({ el }) => el);

	const scheduleApprovalUI = (
		<>
			<div className="flex-1 d-flex flex-direction-row flex-wrap">
				{props?.action?.isScheduledAction &&
					props?.action?.scheduledData &&
					Object.keys(props?.action?.scheduledData).length > 0 && (
						<div
							style={{
								backgroundColor: "rgba(232, 236, 248, 0.4)",
								borderRadius: "4px",
								padding: "2px",
								alignItems: "center",
								minWidth: "fit-content",
								width: "fit-content",
							}}
							className="d-flex mt-1 mr-1"
						>
							{renderScheduledDataUI(
								props?.action?.scheduledData,
								deleteScheduleApprovalData
							)}
						</div>
					)}
				{props?.action?.approvers &&
					props?.action?.approvers.length > 0 && (
						<div
							style={{
								backgroundColor: "rgba(232, 236, 248, 0.4)",
								borderRadius: "4px",
								padding: "2px",
								alignItems: "center",
								minWidth: "fit-content",
								width: "fit-content",
							}}
							className="d-flex mt-1 mr-1"
						>
							{renderApprovalDataUI(
								props?.action?.approvers,
								deleteScheduleApprovalData
							)}
						</div>
					)}
				{props?.action?.breakOnError && (
					<div
						style={{
							backgroundColor: "rgba(232, 236, 248, 0.4)",
							borderRadius: "4px",
							padding: "2px",
							alignItems: "center",
							minWidth: "fit-content",
							width: "fit-content",
						}}
						className="d-flex mt-1"
					>
						<span
							style={{ color: "#5ABAFF" }}
							className={`font-12 p-1`}
						>
							Break On Error
						</span>
					</div>
				)}
			</div>
		</>
	);

	const renderPrerequisitesUI = props?.action?.prerequisites &&
		Array.isArray(props?.action?.prerequisites) &&
		props?.action?.prerequisites?.length > 0 && (
			<>
				<span
					style={{ color: "#2266E2" }}
					className="ml-2 font-12 bold-400 d-flex flex-1 justify-content-end"
				>
					<ActionPrerequisites
						prerequisites={props?.action?.prerequisites}
						application={props.application}
					>
						View Prerequisites
					</ActionPrerequisites>
				</span>
			</>
		);

	const defaultActionCardUI = (
		<div className="d-flex justify-content-between">
			<div className="align-self-center flex-1">
				<div className="d-flex">
					{editApplication &&
					editApplication?.workflowApplicationID ===
						props.application?.workflowApplicationID &&
					props.application.actions?.length > 1 &&
					!props.application?.isGrouped &&
					props.entity === "workflows" ? (
						<DragHandle
							el={
								<span className="position-relative font-10 mr-3 text-center p-2">
									<img alt="" src={drag} />
								</span>
							}
						/>
					) : (
						<span className="position-relative font-10 z-action-index mr-3 text-center p-2">
							<span className="position-center">
								{props.action.index}
							</span>
						</span>
					)}
					<div className="flex-1">
						<h3 className="d-flex flex-1 m-0 font-16 bold-600 grey flex-grow-1 flex-fill mb-1 align-items-center">
							<span
								style={{
									color:
										!props.action.isValidated ||
										(props.action.type === "integration" &&
											!props.action.orgIntegrationID)
											? "#5287E8"
											: "#484848",
								}}
							>
								{props.application.isGrouped
									? `${props.action.name} from ${
											props.application.apps?.length
									  } ${
											props.application.isGrouped ===
											"needs_review"
												? "uncategorized"
												: props.application.isGrouped
									  } apps `
									: props.action.name}
							</span>
							{actionValidationUI()}
							{props.action.type === ACTION_TYPE.MANUAL && (
								<OverlayTrigger
									placement="top"
									overlay={(props) => (
										<Tooltip {...props} id="button-tooltip">
											A manual task creates a task for
											assignee to be done before a due
											date
										</Tooltip>
									)}
								>
									<span
										style={{
											backgroundColor: "#5ABAFF",
											bottom: "2px",
										}}
										className="position-relative font-8 p-1 primary-color-bg white bold-700 m-2 border-radius-2 pl-2 pr-2"
									>
										MANUAL TASK
									</span>
								</OverlayTrigger>
							)}
							{renderPrerequisitesUI}
						</h3>
						<h4 className="grey-1 font-11 mb-1">
							{props.action.description}
						</h4>
						{props.action.type === ACTION_TYPE.MANUAL &&
							props.action?.data[0]?.v?.assignee?.length > 0 &&
							props.action?.data[0]?.v?.assignee[0]?.user_name &&
							props.action?.data[0]?.v?.assignee[0]?.title && (
								<p className="grey-1 font-11 mb-1">
									<span className="o-6 mr-2">Assignee:</span>
									<span className="bold-500">
										{props.action?.data[0]?.v?.assignee[0]
											?.user_name ||
											props.action?.data[0]?.v
												?.assignee[0]?.user_email ||
											props.action?.data[0]?.v
												?.assignee[0]?.title}
									</span>
								</p>
							)}
						{!workflow.isExecuted &&
							editApplication?.workflowApplicationID ===
								props.application?.workflowApplicationID &&
							scheduleApprovalUI}
						{!workflow.isExecuted &&
							editApplication?.workflowApplicationID ===
								props.application?.workflowApplicationID && (
								<ViewPlaybookActionRenderData
									action={props.action}
								/>
							)}
						{!workflow.isExecuted &&
							editApplication?.workflowApplicationID ===
								props.application?.workflowApplicationID &&
							(isEditActionLoading ? (
								<Spinner
									className="mr-2 blue-spinner action-edit-spinner"
									animation="border"
								/>
							) : (
								<div className="d-flex align-items-center">
									<Button
										onClick={(e) => {
											e.stopPropagation();
											onEditAction({
												type: "edit",
											});
										}}
										type="link"
										className="primary-color  pl-0"
									>
										Edit
										{props.action.type ===
										ACTION_TYPE.MANUAL
											? " Task"
											: " Action"}
									</Button>
									{!props.application.isGrouped && (
										<Button
											onClick={() => {
												onEditAction({
													type: "delete",
												});
											}}
											type="link"
											className="primary-color pl-0"
										>
											Delete
										</Button>
									)}
									{props.action.type !==
										ACTION_TYPE.LICENSE_OPTIMIZATION && (
										<div
											className="align-self-center ml-3 mt-1"
											style={{ minWidth: "126px" }}
										>
											<h4 className="grey-1 font-12 m-0">
												<ToggleSwitch
													height={18}
													width={31}
													checked={
														props.action
															.breakOnError
													}
													onChange={(v) => {
														props.setLoading(true);
														addTask({
															breakOnError: v,
															isValidated:
																props.action
																	.isValidated,
															data: props.action
																.data,
														});
													}}
													checkedIcon={false}
													uncheckedIcon={false}
													onColor={"#2266E2"}
													offColor={"#EBEBEB"}
												/>
												<span
													className="ml-2 position-relative"
													style={{ bottom: "5px" }}
												>
													Break on error{" "}
												</span>
											</h4>
										</div>
									)}
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);

	const errorActionCardUI = (
		<>
			{props.action.type === "integration" &&
			!props.action.orgIntegrationID ? (
				<div
					style={{
						backgroundColor: "rgba(82,135,232,0.1)",
						borderRadius: "4px",
						padding: "12px",
					}}
					className="d-flex"
				>
					<img src={error} className="ml-2 mr-3" />
					<h4 className="grey-1 font-11 m-0">
						To perform this action, you need to have an integration
						with {props.application.name || "Application"} else you
						can try converting it to a manual task.
					</h4>
				</div>
			) : (
				!props.action.isValidated && (
					<div
						style={{
							backgroundColor: "rgba(82,135,232,0.1)",
							borderRadius: "4px",
							padding: "12px",
						}}
						className="d-flex"
					>
						<img src={error} className="ml-2 mr-3" />
						<h4 className="grey-1 font-11 m-0">
							There are a few parameters need to be added with
							this action. Please setup the action completely.
						</h4>
					</div>
				)
			)}
		</>
	);

	const onMultiInputFieldSave = (field) => {
		if (validationDynamic(formData, field)) {
			setShowMultiInputModal(false);
		}
	};

	const onIgnoreScopeValidation = () => {
		setIsFetchingForm(true);
		setHidePermission(true);
		setShowIntegrationRequired(false);
		fetchDynamicForm();
	};

	const actionFormUI = formDetails?.inputFields?.length >= 0 &&
		!isFetchingForm && (
			<div className="mt-4">
				<div className="d-flex mb-2 align-items-center">
					<p className="bold-600 font-16 mb-2 grey flex-fill">
						{formDetails.name}
					</p>
					{renderPrerequisitesUI}
				</div>

				{formDetails.inputFields
					.filter((field) => {
						if (Array.isArray(field)) {
							return field.filter(
								(inputField) =>
									inputField.isRendered &&
									checkRenderConditions(inputField, formData)
							);
						}
						return (
							field.isRendered &&
							checkRenderConditions(field, formData)
						);
					})
					.map((field, index) => {
						if (Array.isArray(field)) {
							return (
								<div
									key={index}
									className="d-flex flex-1 flex-wrap"
								>
									{field
										.filter(
											(inputField) =>
												inputField.isRendered &&
												checkRenderConditions(
													inputField,
													formData
												)
										)
										.map((inputField, idx) => {
											return (
												<ActionFieldRenderer
													renderSingleRow={true}
													key={idx}
													resolveDependency={
														resolveDependency
													}
													action={props.action}
													formInputValidation={
														formInputValidation
													}
													depsTriggerResponse={
														depsTriggerResponse
													}
													handleOnChangeSetupForm={
														handleOnChangeSetupForm
													}
													openMulitInputDrawer={
														openMulitInputDrawer
													}
													onRefresh={onRefresh}
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
													selectedDynamicOptions={
														selectedDynamicOptions
													}
													isTemplate={
														props.isTemplate
													}
													manualTaskAssigneeData={
														manualTaskAssigneeData
													}
												/>
											);
										})}
								</div>
							);
						} else {
							return (
								<ActionFieldRenderer
									key={index}
									resolveDependency={resolveDependency}
									action={props.action}
									formInputValidation={formInputValidation}
									depsTriggerResponse={depsTriggerResponse}
									handleOnChangeSetupForm={
										handleOnChangeSetupForm
									}
									openMulitInputDrawer={openMulitInputDrawer}
									onRefresh={onRefresh}
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
									selectedDynamicOptions={
										selectedDynamicOptions
									}
									isTemplate={props.isTemplate}
									manualTaskAssigneeData={
										manualTaskAssigneeData
									}
								/>
							);
						}
					})}
				<div className="d-flex">
					<Button
						className="mt-2 flex-fill  mr-3"
						disabled={addingTaskLoader}
						onClick={() => {
							let type;
							if (props.action.type === "internal") {
								type = ACTION_TYPE.INTERNAL;
							} else if (
								convertToManualTask ||
								props.application.isStatic
							) {
								type = ACTION_TYPE.MANUAL;
							} else {
								type = ACTION_TYPE.INTEGRATION;
							}
							addTask({
								type,
							});
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
							dispatch(props.setEditActionWorkflow(null));
						}}
					>
						Cancel
					</Button>
				</div>
			</div>
		);

	const enableSingleField = (field) => {
		const data = [...formData];
		const select = { ...selectedDynamicOptions };
		data.map((obj) => {
			obj.v[field.key] = undefined;
		});
		for (let key in select) {
			delete select[key][field.key];
		}
		setFormData(data);
		setSelectedDynamicOptions(select);
	};

	return (
		<>
			<div className="p-4 z-w-add-action">
				{(actionEditing || !props.action?.workflowActionID) &&
				!convertToManualTask ? (
					<>
						<h3 className="font-12 grey-1 mb-3 text-uppercase bold-700">
							Add action to {props.application.name}
						</h3>
						<p className="bold-600 font-16 mb-2 grey">
							Choose action
						</p>
					</>
				) : null}
				<div>
					{!props.action?.id &&
					!props.action.workflowActionID &&
					props.action.type != ACTION_TYPE.MANUAL ? (
						<>
							<Select
								isOptionsLoading={
									actionsList.length ? false : true
								}
								options={actionsList}
								fieldNames={{
									label: "name",
									description: "description",
									manualTaskLabel: "manualTaskLabel",
								}}
								optionRender={(option, props) => {
									return (
										<div className="text-capitalize">
											<div className="d-flex object-contain img-circle">
												{option[
													props.fieldNames.logo
												] && (
													<img
														alt=""
														className="mr-2"
														width={26}
														height={26}
														src={
															option[
																props.fieldNames
																	.logo
															]
														}
													/>
												)}
												<div>
													<p className="font-14 grey mb-1">
														{
															option[
																props.fieldNames
																	.label
															]
														}
														{option.type ===
															"manual" && (
															<OverlayTrigger
																placement="top"
																overlay={(
																	props
																) => (
																	<Tooltip
																		{...props}
																		id="button-tooltip"
																	>
																		A manual
																		task
																		creates
																		a task
																		for
																		assignee
																		to be
																		done
																		before a
																		due date
																	</Tooltip>
																)}
															>
																<span
																	style={{
																		backgroundColor:
																			"#5ABAFF",
																		bottom: "2px",
																	}}
																	className="position-relative font-8 p-1 primary-color-bg white bold-700 m-2 border-radius-2 pl-2 pr-2"
																>
																	MANUAL TASK
																</span>
															</OverlayTrigger>
														)}
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
								groupBy="group"
								placeholder="Select an action"
								onChange={(action) => {
									addTask(action);
								}}
								search
								filter
							></Select>
							{isActionSelectedLoader && (
								<div className="text-center mt-2">
									<Spinner
										className="mr-2 blue-spinner"
										animation="border"
									/>
								</div>
							)}
						</>
					) : actionEditing ? (
						!convertToManualTask &&
						!httpRequestAction &&
						!licenseOptimizationAction ? (
							<div style={{ minHeight: "150px" }}>
								<div className="d-flex align-items-center border-1  p-1 pl-3 pr-2 border-radius-4">
									{props.scopeValidation &&
									!props.scopeValidation.success &&
									props.scopeValidation.error ? (
										<>
											<p
												style={{
													color: "#FFB169",
												}}
												className="m-0 font-14 p-2 grey flex-grow-1 flex-fill"
											>
												<img
													src={info}
													className="mr-2"
												/>

												{props.action.name}
											</p>
											<Button
												className="text-uppercase  font-12"
												type="link"
												onClick={() => {
													onConvertToManualtask();
												}}
											>
												Convert to manual task
											</Button>{" "}
										</>
									) : (
										<>
											<p className="m-0 font-14 grey flex-grow-1 flex-fill">
												{props.action.name}
											</p>
											<Button
												className="text-uppercase font-12"
												type="link"
												disabled={excludeActionFromManualTask.includes(
													props?.action?.uniqId
												)}
												onClick={() => {
													onConvertToManualtask();
												}}
											>
												Convert to manual task
											</Button>{" "}
										</>
									)}
								</div>
								{scheduleApprovalSection}
								{connectIntegrationUI}
								{!hidePermission && addPermissionUI}
								{isFetchingForm && (
									<div
										className="position-relative"
										style={{ minHeight: "150px" }}
									>
										<div className="text-center mt-2 position-center">
											<Spinner
												className="mr-2 blue-spinner"
												animation="border"
											/>
										</div>
									</div>
								)}
								{actionFormUI}
							</div>
						) : httpRequestAction ? (
							<>
								<div className="d-flex align-items-center border-1  p-1 pl-3 pr-2 border-radius-4 mb-4">
									<>
										<p className="m-0 font-14 grey flex-grow-1 flex-fill pt-2 pb-2 pr-2">
											{props.action.name}
										</p>
									</>
								</div>
								<HttpRequestWebhook
									isTemplate={props.isTemplate}
									action={props.action}
									submitTask={(task) => {
										props.addAction(task);
									}}
								/>
							</>
						) : licenseOptimizationAction ? (
							<LicenseOptimizationContainer
								addAction={props.addAction}
								action={props.action}
								onCancel={onCancel}
								setEditActionWorkflow={
									props.setEditActionWorkflow
								}
							/>
						) : (
							<ManualTaskAction
								isTemplate={props.isTemplate}
								applicationId={props.application.id}
								application={props.application}
								action={props.action}
								integration={props.integration}
								setEditActionWorkflow={
									props.setEditActionWorkflow
								}
								submitManualTask={(task) => {
									props.addAction(task);
								}}
								onChangeToAuto={() => {
									initAutoTask();
								}}
								onCancel={onCancel}
								entity={props.entity}
							/>
						)
					) : (
						<>
							{defaultActionCardUI}
							{errorActionCardUI}
						</>
					)}
				</div>
				{showMultiInputModal && (
					<MulitInputModal
						resolveDependency={resolveDependency}
						action={props.action}
						workflow={workflow}
						field={editMultiInputField}
						formInputValidation={formInputValidation}
						depsTriggerResponse={depsTriggerResponse}
						handleOnChangeSetupForm={handleOnChangeSetupForm}
						formData={formData}
						openMulitInputDrawer={openMulitInputDrawer}
						onRefresh={onRefresh}
						show={showMultiInputModal}
						close={() => {
							setShowMultiInputModal(false);
							setEditMultiInputField(null);
						}}
						onSave={(field) => {
							onMultiInputFieldSave(field);
						}}
						enableSingleField={(field) => {
							enableSingleField(field);
							setShowMultiInputModal(false);
						}}
						selectedDynamicOptions={selectedDynamicOptions}
					/>
				)}
			</div>
		</>
	);
}
