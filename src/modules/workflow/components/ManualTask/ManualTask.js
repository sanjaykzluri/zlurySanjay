import React, { useEffect, useState } from "react";
import { DatePicker } from "../../../../UIComponents/DatePicker/DatePicker";
import { Button } from "../../../../UIComponents/Button/Button";
import plus from "../../../../assets/icons/plus-blue-bold.svg";
import {
	getAllManualTaskTemplates,
	getManualTaskTemplateData,
} from "../../redux/workflow";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import { getManualTaskAssigneeSuggestionsAPI } from "../../service/api";
import { AsyncTypeahead } from "../../../../common/Typeahead/AsyncTypeahead";
import { searchUsers } from "../../../../services/api/search";
import "./ManualTask.css";
import { Loader } from "../../../../common/Loader/Loader";
import dayjs from "dayjs";
import {
	ACTION_TYPE,
	NO_ASSIGNEE_DATA,
	ASSIGNEE_SUGGESTION_TITLE,
	MANUAL_TASK_TIME_UNIT,
} from "../../constants/constant";
import AssignedDropdown from "./AssignedDropdown";

import { Select } from "../../../../UIComponents/Select/Select";
import ScheduleApprovalAction from "../ScheduleApprovalAction/ScheduleApprovalAction";
import {
	getAllManualTaskTemplatesPlaybook,
	getManualTaskTemplateDataPlaybook,
} from "modules/applications/components/automation/redux/appPlaybook";

export function ManualTask(props) {
	let {
		applicationId,
		showCancel = true,
		showTaskTitleAndDescription = true,
		showActionableButton = true,
		showCardTitle = true,
		actionableButtonName = "Add Manual Task",
		reassignTaskForm,
		integration,
		isTemplate,
		setEditActionWorkflow,
		onCancel,
		entity,
	} = props;

	const InitialState = {
		name: {
			value:
				props.action?.data?.length && props.action?.data[0].v?.name
					? props.action?.data[0].v?.name
					: "",
			required: false,
			error_message: "Please select Template Name for the task",
			error: false,
		},
		template_id: {
			value:
				props.action?.data?.length &&
				props.action?.data[0].v?.template_id
					? props.action?.data[0].v?.template_id
					: "",
			required: false,
			error_message: "Please enter title for the task",
			error: false,
		},
		title: {
			value:
				props.action?.data?.length && props.action?.data[0].v?.title
					? props.action?.data[0].v?.title
					: "",
			required: true,
			error_message: "Please enter title for the task",
			error: false,
		},
		description: {
			value:
				props.action?.data?.length &&
				props.action?.data[0].v?.description
					? props.action?.data[0].v?.description
					: "",
			required: true,
			error_message: "Please enter description for the task",
			error: false,
		},
		assignee: {
			value:
				(props.action?.data?.length &&
					props.action?.data[0].v?.assignee?.length &&
					props.action?.data[0].v?.assignee[0] &&
					props.action?.data[0].v?.assignee[0]?.user_id &&
					props.action?.data[0].v?.assignee) ||
				[],
			required: true,
			error_message: "Please select assignee for the task",
			error: false,
		},
		due_date: {
			value:
				props.action?.data?.length && props.action?.data[0].v?.due_date
					? props.action?.data?.length &&
					  props.action?.data[0].v?.due_date
					: null,
			required: true,
			error_message: "Please enter due date for the task",
			error: false,
		},
		message: {
			value:
				(props.action?.data?.length &&
					props.action?.data[0].v?.message) ||
				"",
			required: false,
		},
	};
	const [manualTaskFormError, setManualTaskFormError] = useState(false);
	const workflow = useSelector((state) =>
		entity ? state.appPlaybooks.workflow : state.workflows.workflow
	);
	const AllManualTaskTemplates = useSelector((state) =>
		entity
			? state.appPlaybooks.allManualTaskTemplates
			: state.workflows.allManualTaskTemplates
	);
	const ManualTaskTemplateData = useSelector((state) =>
		entity
			? state.appPlaybooks.manualTaskTemplateData
			: state.workflows.manualTaskTemplateData
	);
	const dispatch = useDispatch();
	const [addingTaskLoader, setAddingTaskLoader] = useState(false);
	const [selectedAssignedVia, setSelectedAssignedVia] = useState("");
	const [allManualTaskTemplates, setAllManualTaskTemplates] = useState([]);
	const [selectedManualTaskTemplate, setSelectedManualTaskTemplate] =
		useState();
	const [manualTaskForm, setManualTaskForm] = useState(
		reassignTaskForm || InitialState
	);
	const [showOptionalMessageInput, setShowOptionalMessageInput] =
		useState(false);
	const [loading, setLoading] = useState(true);
	const [manualTaskAssigneeData, setManualTaskAssigneeData] = useState([]);
	const [selectedManualTaskAssignee, setSelectedManualTaskAssignee] =
		useState();
	const [initialLoad, setInitialLoad] = useState(true);
	const [scheduledData, setScheduledData] = useState(
		(props?.action?.scheduledData &&
			props?.action?.scheduledData?.duration &&
			props?.action?.scheduledData) ||
			null
	);
	const [approvalData, setApprovalData] = useState(
		props?.action?.approvers || []
	);
	const [dueIn, setDueIn] = useState(
		(props.action?.dueDateData && props.action?.dueDateData) || {
			time: "",
			unit: "",
			duration: "",
		}
	);

	const isManualTask = () => {
		return props.action?.type === ACTION_TYPE.MANUAL && isCustomTask();
	};

	const isCustomTask = () => {
		return props.action?.isCustom || !props.action?.id;
	};

	const getSuggestion = async () => {
		try {
			const response = await getManualTaskAssigneeSuggestionsAPI(
				applicationId,
				workflow.id,
				isTemplate
			);
			if (response) {
				return response;
			}
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		if (applicationId) {
			getSuggestion()
				.then((response) => {
					setManualTaskAssigneeData(response);
					setLoading(false);
				})
				.catch((e) => {
					console.log(e);
				});
		} else {
			setLoading(false);
		}
		if (
			AllManualTaskTemplates.length === 0 &&
			showTaskTitleAndDescription
		) {
			dispatch(
				entity
					? getAllManualTaskTemplatesPlaybook()
					: getAllManualTaskTemplates()
			);
		}
		if (
			(props.action?.data?.length &&
				!props.action.data[0]?.v?.template_id) ||
			(props.action?.data && !props.action.data[0])
		) {
			setInitialLoad(false);
		}
		return () => {
			setSelectedManualTaskAssignee(null);
		};
	}, []);

	useEffect(() => {
		if (!props.action?.data?.length && isCustomTask()) {
			Object.keys(manualTaskForm).forEach((key) => {
				if (key === "title" || key === "description") {
					setManualTaskForm((prevState) => ({
						...prevState,
						[key]: {
							...manualTaskForm[key],
							value:
								key === "title"
									? props.action?.name
									: props.action?.description,
							error: false,
						},
					}));
				}
			});
		}
		if (props.action?.assignee_relation) {
			const assigneeArr = manualTaskForm.assignee?.value;
			if (assigneeArr && assigneeArr.length > 0) {
				assigneeArr[0].title =
					ASSIGNEE_SUGGESTION_TITLE[props.action?.assignee_relation];
			}
			setManualTaskForm((prevState) => ({
				...prevState,
				assignee: {
					...manualTaskForm["assignee"],
					value: assigneeArr,
				},
			}));
		}
	}, []);

	useEffect(() => {
		if (ManualTaskTemplateData && selectedManualTaskTemplate) {
			const MTData = { ...ManualTaskTemplateData };
			Object.keys(MTData).forEach((key) => {
				if (key === "assignee") {
					setManualTaskForm((prevState) => ({
						...prevState,
						[key]: {
							...manualTaskForm[key],
							value: MTData[key],
							error: false,
						},
					}));
				} else {
					setManualTaskForm((prevState) => ({
						...prevState,
						[key]: {
							...manualTaskForm[key],
							value:
								key === "due_date"
									? new Date(new Date(MTData[key]).getTime())
									: MTData[key],
							error: false,
						},
					}));
				}
			});
			setLoading(false);
		} else {
			setLoading(false);
		}
	}, [ManualTaskTemplateData]);

	useEffect(() => {
		if (AllManualTaskTemplates) {
			setAllManualTaskTemplates(AllManualTaskTemplates);
		}
	}, [AllManualTaskTemplates]);

	useEffect(() => {
		if (selectedManualTaskTemplate && applicationId) {
			setLoading(true);
			setManualTaskForm(InitialState);
			const { templateId } = selectedManualTaskTemplate;
			dispatch(
				entity
					? getManualTaskTemplateDataPlaybook(
							[],
							applicationId,
							templateId
					  )
					: getManualTaskTemplateData([], applicationId, templateId)
			);
		}
		if (selectedManualTaskTemplate && !applicationId) {
			setLoading(true);
			Object.keys(selectedManualTaskTemplate).forEach((key) => {
				if (key === "templateId") {
					setManualTaskForm((prevState) => ({
						...prevState,
						template_id: {
							...manualTaskForm["template_id"],
							value: selectedManualTaskTemplate[key],
							error: false,
						},
					}));
				} else {
					setManualTaskForm((prevState) => ({
						...prevState,
						[key]: {
							...manualTaskForm[key],
							value: selectedManualTaskTemplate[key],
							error: false,
						},
					}));
				}
			});
			setLoading(false);
		}
	}, [selectedManualTaskTemplate]);

	const handleOnChange = (e) => {
		if (e.target.name === "assignee") {
			setManualTaskForm(
				Object.assign({}, manualTaskForm, {
					[e.target.name]: {
						...manualTaskForm[e.target.name],
						value: e.target.value?.user_id ? [e.target.value] : [],
						error: false,
					},
				})
			);
		} else {
			setManualTaskForm(
				Object.assign({}, manualTaskForm, {
					[e.target.name]: {
						...manualTaskForm[e.target.name],
						value: e.target.value,
						error: false,
					},
				})
			);
		}
	};

	const handleAssigneeChange = (val) => {
		if (val) {
			setSelectedManualTaskAssignee(val);
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
			setManualTaskForm((prevState) => ({
				...prevState,
				assignee: {
					...manualTaskForm["assignee"],
					value: assignee,
					error: false,
				},
			}));
		}
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

	const submitManualTask = () => {
		setManualTaskFormError(false);
		if (validation()) {
			setAddingTaskLoader(true);
			const scheduleApprovalData = getScheduleApprovalData();
			let data = workflow.users?.map((user) => {
				return {
					k: user.user_id,
					v: {},
				};
			});
			if (isTemplate) {
				data = [
					{
						k: "",
						v: {},
					},
				];
			}
			Object.keys(manualTaskForm).forEach((item) => {
				data.forEach((obj) => {
					if (item === "due_date") {
						obj.v[item] =
							dayjs(manualTaskForm[item]["value"]).toJSON() || "";
					} else if (
						item === "assignee" &&
						selectedManualTaskAssignee
					) {
						const assignee =
							selectedManualTaskAssignee.assignee[obj.k] ||
							manualTaskForm[item]["value"];
						if (assignee) {
							obj.v[item] = assignee;
						} else {
							obj.v[item] =
								selectedManualTaskAssignee.assignee[
									Object.keys(
										selectedManualTaskAssignee.assignee
									)
								];
						}
					} else {
						obj.v[item] = manualTaskForm[item]["value"];
					}
				});
			});

			const task = Object.assign(
				{},
				props.action,
				{
					data: data,
					type: "manual",
					isValidated: true,
				},
				{ ...scheduleApprovalData }
			);
			if (selectedManualTaskAssignee) {
				task.assignee_relation =
					selectedManualTaskAssignee?.key || null;
				task.data_reusable = true;
			} else {
				const assignee =
					manualTaskForm["assignee"]["value"][0]?.key || null;
				task.assignee_relation = assignee || "custom";
			}
			if (selectedManualTaskTemplate) {
				task.manual_action_template_id =
					selectedManualTaskTemplate?.templateId ||
					manualTaskForm.template_id.value;
			} else {
				task.manual_action_template_id =
					props?.action?.manual_action_template_id || null;
			}
			if (Object.keys(dueIn).length > 0 && dueIn?.time && dueIn?.unit) {
				task.dueDateData = dueIn;
			}
			task.name = data[0]?.v?.title;
			task.description = data[0]?.v?.description;
			props.submitManualTask(task);
		}
	};

	const handleTemplateChange = (val) => {
		if (!initialLoad) {
			setSelectedManualTaskTemplate(val);
		} else {
			setInitialLoad(false);
		}
	};

	const validation = () => {
		const obj = Object.assign({}, manualTaskForm);
		let isError = false;
		for (let key in obj) {
			if (
				(!obj[key].value && obj[key].required) ||
				(key === "assignee" &&
					!(
						obj[key].value[0]?.user_name || obj[key].value[0]?.title
					) &&
					obj[key].required) ||
				(key === "due_date" && (!dueIn?.time || !dueIn?.unit))
			) {
				Object.assign(obj, {
					[key]: {
						...obj[key],
						error: true,
					},
				});
				isError = true;
			}
		}
		setManualTaskForm(obj);
		return !isError;
	};

	const getDefaultValue = (form) => {
		return form.assignee.value[0]?.title
			? form.assignee.value[0].title
			: form.assignee.value[0];
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
				if (value.assignee[k].length === 0) {
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

	const handleChange = (e) => {
		const { name, value, selectedUnit } = e.target;
		const data = { ...dueIn };
		if (name === "time") {
			data.time = value;
			data.duration = `${value} ${data?.unit ? data?.unit : ""}`;
		} else if (name === "unit") {
			data.unit = value;
			data.selectedUnit = selectedUnit;
			data.duration = `${data?.time ? data?.time : ""} ${data?.unit}`;
		}
		setManualTaskForm(
			Object.assign({}, manualTaskForm, {
				due_date: {
					...manualTaskForm["due_date"],
					value: data.duration,
					error: false,
				},
			})
		);
		setDueIn(data);
	};

	return (
		<>
			<div className="z-w-manual-task">
				{showCardTitle && (
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
									setSelectedAssignedVia={
										setSelectedAssignedVia
									}
								/>
							</div>
						</div>
						{props.action?.id && (
							<Button
								type="link"
								onClick={() => {
									if (integration) {
										props.onChangeToAuto();
									}
								}}
								className={`text-uppercase font-12 ${
									!integration ? "o-5" : ""
								}`}
							>
								CONVERT TO Auto TASK
							</Button>
						)}
					</header>
				)}
				{showCardTitle && (
					<ScheduleApprovalAction
						scheduledData={scheduledData}
						approvalData={approvalData}
						action={props.action}
						handleScheduleApprovalChange={
							handleScheduleApprovalChange
						}
						deleteScheduleApprovalData={deleteScheduleApprovalData}
					/>
				)}
				<section>
					{showTaskTitleAndDescription && (
						<>
							<div className="mb-4">
								<div className="flex-1 d-flex flex-row justify-content-start">
									{!loading && (
										<div className="flex-1 d-flex flex-column justify-content-end align-items-start">
											<label className="font-12 grey">
												Task Title
											</label>
										</div>
									)}
									{
										<div className="flex-1 d-flex flex-column justify-content-center align-items-end">
											<div className="flex-1 d-flex flex-row justify-content-start align-items-end mb-1">
												<Select
													value={
														props.action?.data[0]?.v
															?.name
															? props.action
																	?.data[0]?.v
															: null
													}
													className="z-select-new z-select-placeholder-new"
													isOptionsLoading={
														allManualTaskTemplates.length
															? false
															: true
													}
													options={
														allManualTaskTemplates
													}
													fieldNames={{
														label: "name",
													}}
													placeholder="Select Template"
													onChange={(action) => {
														handleTemplateChange(
															action
														);
													}}
												/>
											</div>
										</div>
									}
								</div>
								{!loading && (
									<>
										<input
											className="p-2"
											name="title"
											type="text"
											value={manualTaskForm.title.value}
											onChange={(e) => handleOnChange(e)}
											placeholder={`${
												props.action?.name || "Title"
											}`}
										/>
										{manualTaskForm.title.error && (
											<p className="font-12 mt-1 red">
												{
													manualTaskForm.title
														.error_message
												}
											</p>
										)}
									</>
								)}
							</div>
							{!loading && (
								<div className="mb-4">
									<label className="font-12 grey">
										Task Description
									</label>
									<input
										className="p-2"
										name="description"
										type="text"
										value={manualTaskForm.description.value}
										onChange={(e) => handleOnChange(e)}
										placeholder={`${
											props.action?.description ||
											"Description"
										}`}
									/>
									{manualTaskForm.description.error && (
										<p className="font-12 mt-1 red">
											{
												manualTaskForm.description
													.error_message
											}
										</p>
									)}
								</div>
							)}
						</>
					)}
					{loading ? (
						<div className="mb-2 d-flex  justify-content-center">
							<Loader height={50} width={50} />
						</div>
					) : (
						<>
							<div className="mb-2 d-flex  justify-content-between">
								<div className="flex-fill mr-2">
									<label className="font-12 grey">
										Assignee Email
									</label>

									<AsyncTypeahead
										defaultValue={
											manualTaskForm.assignee.value[0]
												? manualTaskForm.assignee
														.value[0]
												: null
										}
										className="m-0 select-user-mt"
										placeholder="Select an assignee for this task"
										fetchFn={searchUsers}
										defaultList={getDefaultAssigneeList()}
										onSelect={(user) => {
											if (user.isSuggestion) {
												handleAssigneeChange(user);
											} else {
												handleOnChange({
													target: {
														name: "assignee",
														value: {
															user_id: user._id,
															user_name:
																user.user_name,
															user_email:
																user.user_email,
															user_logo:
																user.profile_img,
														},
													},
												});
											}
										}}
										keyFields={{
											id: "user_id",
											image: "profile_img",
											title: manualTaskForm.assignee
												.value[0]?.title
												? "title"
												: null,
											value: "user_name",
											email: "user_email",
											count: manualTaskForm.assignee
												.value[0]?.count
												? "count"
												: null,
											appAuthStatus: true,
										}}
										allowFewSpecialCharacters={true}
									/>
									{manualTaskForm.assignee.error && (
										<p className="font-12 mt-1 red">
											{
												manualTaskForm.assignee
													.error_message
											}
										</p>
									)}
								</div>

								<div className="flex-fill">
									<label className="font-12 grey">
										Due in
									</label>
									<div className="flex-1 d-flex flex-row">
										<input
											className="p-2 mr-2 w-auto"
											type="text"
											name="time"
											id="time"
											placeholder="Delay"
											onPaste={(e) => {
												e.preventDefault();
												return false;
											}}
											onCopy={(e) => {
												e.preventDefault();
												return false;
											}}
											autoComplete="new-password"
											value={dueIn?.time || ""}
											onKeyPress={(event) => {
												if (!/[0-9]/.test(event.key)) {
													event.preventDefault();
												}
											}}
											onChange={(e) => {
												handleChange(e);
											}}
										/>
										<Select
											className="flex-fill black-1 w-auto mr-3 grey-bg attribute-operators-select"
											options={MANUAL_TASK_TIME_UNIT}
											fieldNames={{
												label: "unit",
											}}
											placeholder="Select"
											value={
												dueIn?.selectedUnit &&
												Object.keys(dueIn?.selectedUnit)
													.length > 0
													? dueIn?.selectedUnit
													: null
											}
											onChange={(obj) => {
												handleChange({
													target: {
														name: "unit",
														value: obj.unit,
														selectedUnit: obj,
													},
												});
											}}
										/>
									</div>
									{/* <DatePicker
										minDate={new Date()}
										onChange={(value) => {
											handleOnChange({
												target: {
													name: "due_date",
													value: value,
												},
											});
										}}
										value={manualTaskForm.due_date.value}
									/> */}
									{manualTaskForm.due_date.error && (
										<p className="font-12 mt-1 red">
											{
												manualTaskForm.due_date
													.error_message
											}
										</p>
									)}
								</div>
							</div>

							<div className="mb-4">
								<Button
									className="bold-600"
									type="link"
									onClick={() => {
										setShowOptionalMessageInput(true);
									}}
								>
									{" "}
									<img src={plus} /> Add a message (optional)
								</Button>
								{showOptionalMessageInput && (
									<textarea
										name="message"
										className="w-100 mt-2 p-2 font-14"
										placeholder="Add a message"
										value={manualTaskForm.message.value}
										onChange={(e) => handleOnChange(e)}
									/>
								)}
							</div>
							{showActionableButton && (
								<>
									<div className="d-flex">
										<Button
											disabled={addingTaskLoader}
											className="mt-2 flex-fill  mr-3  bold-600"
											onClick={() => submitManualTask()}
										>
											{actionableButtonName}
											{addingTaskLoader && (
												<Spinner
													className=" ml-2 mr-2 blue-spinner action-edit-spinner"
													animation="border"
													style={{ top: "1px" }}
												/>
											)}
										</Button>

										{showCancel && (
											<Button
												className="mt-2 pr-4 pl-4"
												type="reverse"
												onClick={() => {
													onCancel();
													dispatch(
														setEditActionWorkflow(
															null
														)
													);
												}}
											>
												Cancel
											</Button>
										)}
									</div>
								</>
							)}
						</>
					)}
				</section>
			</div>
		</>
	);
}
