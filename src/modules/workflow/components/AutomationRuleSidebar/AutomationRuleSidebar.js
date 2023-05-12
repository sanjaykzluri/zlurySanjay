import React from "react";
import cross from "assets/reports/cross.svg";
import userRoleLogo from "assets/user_role.svg";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { useEffect, useRef, useState } from "react";
import { Form, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { checkSpecialCharacters, searchUsers } from "services/api/search";
import { Select } from "UIComponents/Select/Select";
import { client } from "utils/client";
import { capitalizeFirstLetter, debounce } from "utils/common";
import _ from "underscore";

import { setEditAutomationRule } from "modules/workflow/redux/workflow";
import { useDispatch, useSelector } from "react-redux";
import RulesConfiguration from "../RulesConfiguration/RulesConfiguration";
import RequestApprovers from "./Approvers";
import "./AutomationRuleSidebar.css";
import { getUserRolesSuggestion } from "modules/workflow/service/api";

import Dropdown from "UIComponents/CustomDropdown/Dropdown";

import AddAction from "./AddAction";
import "./styles.css";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import { WorkflowTemplateSearchModel } from "modules/workflow/model/model";
import {
	getAllPlaybookWorkflowsServiceV2,
	getMostUsedTemplatesService,
	searchTemplatesService,
} from "modules/workflow/service/api";
import { BulkRunAPlaybookOptionFormatter } from "../BulkRunAPlaybook/BulkRunAPlaybook";
import "./styles.css";
import WorkflowsNameInTable from "../WorkflowName";
import { trackActionSegment } from "modules/shared/utils/segment";

const ON_APPROVAL_OPTIONS = [
	{ name: "Assign a task to someone", key: "assign_task" },
	// { name: "Run Onboarding Playbook", key: "run_onboarding_playbook" },
];
const ON_APPROVAL_OFFBOARDING_OPTIONS = [
	{ name: "Assign a task to someone", key: "assign_task" },
	// { name: "Run Offboarding Playbook", key: "run_offboarding_playbook" },
];

const PLAYBOOKS = [
	{ name: "Playbook 1", key: "run_onboarding_playbook" },
	{ name: "Playbook 2", key: "assign_task" },
];

const userFields = {
	label: "user_name",
	description: "user_email",
	logo: "profile_img",
};
const userRoleFields = {
	label: "title",
	description: "description",
};

export default function AutomationRuleSidebar({ rule, type }) {
	const [showEmailPopup, setShowEmailPopup] = useState(false);
	const [hideCustomCOnfig, setHideCustomConfig] = useState(false);
	const [addActionStep, setAddActionStep] = useState(0);
	const [disableCheck, setDisableCheck] = useState(false);
	const [action, setAction] = useState("");
	const [offboardingAction, setOffboardingAction] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const cancelToken = useRef();
	const dispatch = useDispatch();
	const automationRule = useSelector(
		(state) => state.workflows.automationRule
	);

	const [users, setUsers] = useState([]);
	const [userRoles, setUserRoles] = useState([]);
	const [assigneeusers, setAssigneeUsers] = useState([]);

	const [onboardingworkflows, setOnboardingWorkflows] = useState([]);
	const [offboardingworkflows, setOffboardingWorkflows] = useState([]);
	const [playbookType, setPlaybookType] = useState("onboarding");

	useEffect(() => {
		getMostUsedTemplatesService("onboarding", 0, 10)
			.then((res) => {
				setOnboardingWorkflows(
					res.data.map(
						(item) => new WorkflowTemplateSearchModel(item)
					)
				);
			})
			.catch((err) => {
				console.log("err", err);
			});
		getMostUsedTemplatesService("offboarding", 0, 10)
			.then((res) => {
				setOffboardingWorkflows(
					res.data.map(
						(item) => new WorkflowTemplateSearchModel(item)
					)
				);
			})
			.catch((err) => {
				console.log("err", err);
			});
		getUserRolesSuggestion({})
			.then((data) => {
				const roles = Object.keys(data).map((key) => ({
					user_role: key,
					...data[key],
					type: "role",
					disabled:
						data[key].isFixed && !data[key]?.assignee?.length > 0,
				}));
				console.log({ roles });
				setUserRoles(roles);
			})
			.catch((err) => {
				console.error("roles fetch", err);
			});
	}, []);

	const updateApprovers = (approvers) =>
		dispatch(setEditAutomationRule({ approvers }));
	useEffect(() => {
		updateApprovers(rule?.approvers);
	}, [rule?.id]);
	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		// setUsersLoader(true);
		if (searchQuery) {
			cancelToken.current = client.CancelToken.source();
			if (checkSpecialCharacters(searchQuery, true)) {
				// setUsersLoader(false);
			} else {
				searchUsers(searchQuery, cancelToken.current, true).then(
					(res) => {
						if (res?.results) {
							if (searchQuery) {
								setUsers(res?.results);
							}
							// setUsersLoader(false);
						}
					}
				);
			}
		}
	}, [searchQuery]);
	useEffect(() => {
		if (rule?.events?.[0]?.type === "auto_rejection") {
			setHideCustomConfig(true);
		} else {
			setHideCustomConfig(false);
		}
		if (rule?.on_approval_date && rule?.on_approval_user) {
			setAction("assign_task");
			setAddActionStep(2);
		}
		// if (rule.has_onboarding_playbook) {
		// 	setAction("run_onboarding_playbook");
		// 	setAddActionStep(2);
		// } else 
		if (rule?.has_onboarding_user) {
			setOffboardingAction("assign_task");
		}
		// if (rule.has_offboarding_playbook) {
		// 	setOffboardingAction("run_offboarding_playbook");
		// 	setDisableCheck(true);
		// } else 
		if (!_.isEmpty(rule?.on_offboarding_user)) {
			setOffboardingAction("assign_task");
			setDisableCheck(true);
			setAddActionStep(2);
		}
	}, []);

	useEffect(() => {}, [action]);

	useEffect(() => {
		if (rule?.events?.[0]?.type === "auto_rejection") {
			setHideCustomConfig(true);
		} else {
			setHideCustomConfig(false);
		}
	}, [rule?.events?.[0]?.type]);
	return (
		<div style={{ borderRadius: "4px" }} className="sidebar_tabs pt-4 m-2">
			{!hideCustomCOnfig && (
				<div className="tab_content_body">
					<div className="rule-block mt-3 mb-3 border-radius-8 tab_content">
						{type === "apprequisition" && (
							<>
								<div className="tab_content_header">
									Add Approver
								</div>
								<div
									style={{
										borderTop: "1px solid #EBEBEB",
										marginTop: "8px",
									}}
								/>
								<div className="assign_task_description mb-4">
									Approvals gets processed in sequential
									order. If role is unavailable for a request,
									admins will be notified.
								</div>
							</>
						)}
						{type === "apprequisition" && (
							<>
								<RequestApprovers
									previousApprovers={rule?.approvers}
									updateApprovers={updateApprovers}
								/>

								<div className="tab_content_subheader my-2">
									ON APPROVAL
								</div>
								<div
									style={{
										borderTop: "1px solid #EBEBEB",
										marginTop: "8px",
									}}
								/>
								<AddAction
									onActionChange={(val) => {
										setAction(val.key);
										setAddActionStep(2);
										if (
											val.key ===
											"run_onboarding_playbook"
										) {
											dispatch(
												setEditAutomationRule({
													on_approval_user: null,
												})
											);
										}
									}}
									action={action}
									options={ON_APPROVAL_OPTIONS}
								/>
								{/* <Button
									className="d-block bold-600 mt-3 mb-2"
									onClick={() => {
										setAddActionStep(1);
									}}
									type="dashed"
								>
									<img alt="" src={add} height="14" />
									<span className="ml-2">
										{addActionStep === 0 ? "Add" : "Change"}{" "}
										Action
									</span>
								</Button>
								{addActionStep === 1 && (
									<>
										<Select
											filter
											search
											options={ON_APPROVAL_OPTIONS}
											placeholder="Search for attributes"
											fieldNames={{
												label: "name",
												value: "path",
											}}
											onChange={(val) => {
												setAction(val.key);
												setAddActionStep(2);
											}}
										/>
									</>
								)} */}
								{addActionStep === 2 && (
									<>
										{action ===
											"run_onboarding_playbook" && (
											<div className="d-flex  justify-content-between workflow-trigger-row run-playbook__wrapper">
												<div className="flex-fill border-radius-4 font-14 d-flex white-bg align-items-center justify-content-between mb-2  mt-2 pl-3 pr-3 pt-1 pb-1">
													<div className=" w-100 align-items-center">
														<div className=" d-flex align-items-between font-14 black-1">
															<div className="d-flex align-items-center run-playbook__title">
																Run{" "}
																{capitalizeFirstLetter(
																	playbookType
																)}{" "}
																Playbook
															</div>
														</div>
														<div className="w-100">
															<Dropdown
																dropdownWidth="100%"
																className="run-playbook__dropdown my-2"
																toggler={
																	<div
																		className="d-flex align-items-center justify-content-between border-1 border-radius-4"
																		style={{
																			height: "36px",
																			padding:
																				"4px",
																		}}
																	>
																		<div>
																			{rule
																				?.on_approval_playbook
																				?.workflowTemplateName ||
																				"Select a playbook"}
																		</div>
																		<img
																			src={
																				arrowdropdown
																			}
																			style={{
																				marginLeft:
																					"8px",
																			}}
																		/>
																	</div>
																}
																options={
																	onboardingworkflows
																}
																apiSearch={true}
																apiSearchCall={(
																	query,
																	cancelToken
																) =>
																	getAllPlaybookWorkflowsServiceV2(
																		rule.tag,
																		0,
																		query
																	)
																}
																apiSearchDataKey="data"
																optionFormatter={(
																	option
																) =>
																	BulkRunAPlaybookOptionFormatter(
																		{
																			playbook:
																				option,
																		}
																	)
																}
																onOptionSelect={(
																	option
																) => {
																	option =
																		new WorkflowTemplateSearchModel(
																			option
																		);
																	dispatch(
																		setEditAutomationRule(
																			{
																				on_approval_playbook:
																					option,
																				has_onboarding_playbook: true,
																			}
																		)
																	);
																}}
																optionStyle={{
																	padding:
																		"0px !important",
																	flexDirection:
																		"column",
																	width: "285px",
																	minHeight:
																		"60px",
																	alignItems:
																		"flex-start",
																	paddingTop:
																		"6px",
																	paddingBottom:
																		"6px",
																}}
																menuStyle={{
																	width: "295px",
																}}
																searchBoxStyle={{
																	width: "260px",
																}}
															/>
														</div>
													</div>
												</div>
											</div>
										)}
										{action === "assign_task" && (
											<AssignTask
												title="Assign task to procure
										license due within a few
										days of approval"
												value={
													!_.isEmpty(
														automationRule?.on_approval_user
													)
														? [
																automationRule?.on_approval_user,
														  ]
														: undefined
												}
												onDelete={() => {
													const data = {
														on_approval_user: null,
													};
													setTimeout(
														() =>
															dispatch(
																setEditAutomationRule(
																	data
																)
															),
														0
													);
												}}
												userRoles={userRoles}
												onUserChange={(value) => {
													const data = {
														on_approval_user: value
															?.assignee?.[0]
															? {
																	...value
																		.assignee[0],
																	type: "user",
																	user_role:
																		value.user_role,
																	status: "pending",
															  }
															: {
																	...value,
																	status: "pending",
															  },
														has_onboarding_playbook: false,
														on_approval_playbook:
															{},
													};
													dispatch(
														setEditAutomationRule(
															data
														)
													);
												}}
												date={
													automationRule?.on_approval_date
												}
												onDateChange={(e) => {
													const data = {
														on_approval_date:
															e.target.value,
														has_onboarding_playbook: false,
														offboarding_playbook:
															{},
													};
													dispatch(
														setEditAutomationRule(
															data
														)
													);
												}}
											/>
										)}
									</>
								)}

								<div className="tab_content_subheader my-2">
									OFFBOARDING ACTION
								</div>
								<div>
									<Form.Check
										className="pt-3"
										type="checkbox"
										label="Disable license access after subscription duration"
										onChange={(e) => {
											setDisableCheck((val) => {
												if (disableCheck) {
													dispatch(
														setEditAutomationRule({
															on_offboarding_user:
																null,
															offboarding_playbook:
																null,
															disable_access_on_offboarding: false
														})
													);
												} else {
													dispatch(
														setEditAutomationRule({
															disable_access_on_offboarding: true
														})
													);
													trackActionSegment(
														`Remove license action configured `,
														{
															currentCategory:
																"Admin View - Workflows",
															currentPageName:
																"Automation Rules",
														}
													);
												}
												return !val;
											});
										}}
										checked={disableCheck}
									/>
									<div className="assign_task_description mb-4">
										Select offboarding action to be run
										after approved license duration
									</div>

									<>
										{disableCheck && (
											<AddAction
												onActionChange={(val) => {
													setOffboardingAction(
														val.key
													);
													if (
														val.key ===
														"run_offboarding_playbook"
													) {
														dispatch(
															setEditAutomationRule(
																{
																	on_offboarding_user:
																		null,
																}
															)
														);
													}
													// setAddActionStep(2);
												}}
												action={offboardingAction}
												options={
													ON_APPROVAL_OFFBOARDING_OPTIONS
												}
											/>
										)}
										{disableCheck &&
											offboardingAction ===
												"run_offboarding_playbook" && (
												<div className="d-flex  justify-content-between workflow-trigger-row">
													<div className="flex-fill border-radius-4 font-14 d-flex white-bg align-items-center justify-content-between mb-2  mt-2 pl-3 pr-3 pt-1 pb-1">
														<div className=" w-100 align-items-center">
															<div className=" d-flex align-items-between font-14 black-1">
																<div className="d-flex align-items-center run-playbook__title">
																	Run
																	Offboarding
																	Playbook
																</div>
															</div>
															<Dropdown
																dropdownWidth="100%"
																className="run-playbook__dropdown my-2"
																toggler={
																	<div
																		className="d-flex align-items-center justify-content-between border-1 border-radius-4"
																		style={{
																			height: "36px",
																			padding:
																				"4px",
																		}}
																	>
																		<div>
																			{rule
																				?.offboarding_playbook
																				?.workflowTemplateName ||
																				"Select a playbook"}
																		</div>
																		<img
																			src={
																				arrowdropdown
																			}
																			style={{
																				marginLeft:
																					"8px",
																			}}
																		/>
																	</div>
																}
																options={
																	offboardingworkflows
																}
																apiSearch={true}
																apiSearchCall={(
																	query,
																	cancelToken
																) =>
																	getAllPlaybookWorkflowsServiceV2(
																		rule.tag,
																		0,
																		query
																	)
																}
																apiSearchDataKey="data"
																optionFormatter={(
																	option
																) =>
																	BulkRunAPlaybookOptionFormatter(
																		{
																			playbook:
																				option,
																		}
																	)
																}
																onOptionSelect={(
																	option
																) => {
																	option =
																		new WorkflowTemplateSearchModel(
																			option
																		);
																	dispatch(
																		setEditAutomationRule(
																			{
																				offboarding_playbook:
																					option,
																				has_offboarding_playbook: true,
																			}
																		)
																	);
																}}
																optionStyle={{
																	padding:
																		"0px !important",
																	flexDirection:
																		"column",
																	width: "285px",
																	minHeight:
																		"60px",
																	alignItems:
																		"flex-start",
																	paddingTop:
																		"6px",
																	paddingBottom:
																		"6px",
																}}
																menuStyle={{
																	width: "295px",
																}}
																searchBoxStyle={{
																	width: "260px",
																}}
															/>
														</div>
													</div>
												</div>
											)}
										{disableCheck &&
											offboardingAction ===
												"assign_task" && (
												<>
													{/* <AssignTask
												title="Assign task to procure
										license due within a few
										days of approval"
												value={
													automationRule?.on_approval_user
														? [
																automationRule?.on_approval_user,
														  ]
														: undefined
												}
												onDelete={() => {
													const data = {
														on_approval_user: null,
													};
													dispatch(
														setEditAutomationRule(
															data
														)
													);
												}}
												userRoles={userRoles}
												onUserChange={(value) => {
													const data = {
														on_approval_user: value
															?.assignee?.[0]
															? {
																	...value
																		.assignee[0],
																	type: "user",
																	user_role:
																		value.user_role,
																	status: "pending",
															  }
															: {
																	...value,
																	status: "pending",
															  },
														has_onboarding_playbook: false,
														on_approval_playbook:
															{},
													};
													console.log({ data });
													dispatch(
														setEditAutomationRule(
															data
														)
													);
												}}
												date={
													automationRule?.on_approval_date
												}
												onDateChange={(e) => {
													const data = {
														on_approval_date:
															e.target.value,
														has_onboarding_playbook: false,
														offboarding_playbook:
															{},
													};
													dispatch(
														setEditAutomationRule(
															data
														)
													);
												}}
											/> */}
													<div>
														{" "}
														<span className="assign_task_description">
															Assign task to
															procure license due
															within a few days of
															approval
														</span>{" "}
														<Select
															search
															mode="single"
															disableLocalValue
															value={
																!_.isEmpty(
																	automationRule?.on_offboarding_user
																)
																	? [
																			automationRule?.on_offboarding_user,
																	  ]
																	: undefined
															}
															onSearch={(
																query
															) => {
																setSearchQuery(
																	query
																);
																if (
																	query === ""
																) {
																	const data =
																		{
																			on_offboarding_user:
																				null,
																		};
																	dispatch(
																		setEditAutomationRule(
																			data
																		)
																	);
																}
															}}
															selectedOptionRender={(
																option,
																props
															) => {
																return (
																	<div className="font-14 text-capitalize flex-fill ">
																		{option?.user_name ||
																			option?.title}
																	</div>
																);
															}}
															// isOptionsLoading={usersLoader || false}
															options={
																searchQuery?.length >
																0
																	? users
																	: userRoles
															}
															// onBlur={() => updateRule()}
															fieldNames={
																searchQuery?.length >
																	0 ||
																(!_.isEmpty(
																	automationRule?.on_offboarding_user
																) &&
																	automationRule
																		?.on_offboarding_user
																		?.type !==
																		"role")
																	? userFields
																	: userRoleFields
															}
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
															onChange={(
																value
															) => {
																console.log({
																	value,
																});
																const data = {
																	on_offboarding_user:
																		value
																			?.assignee?.[0]
																			? {
																					...value
																						.assignee[0],
																					type: "user",
																					user_role:
																						value.user_role,
																					status: "pending",
																			  }
																			: {
																					...value,
																					status: "pending",
																			  },
																	has_offboarding_playbook: false,
																};
																dispatch(
																	setEditAutomationRule(
																		data
																	)
																);
															}}
															placeholder={
																"Select User"
															}
														/>
													</div>
													<div className="d-flex">
														<span className="due_within_text">
															Due Within
														</span>
														<div className="d-flex align-items-center">
															<div className="w-50">
																<Form.Control
																	className="w-50 m-2"
																	type="number"
																	value={
																		automationRule?.on_offboarding_date
																	}
																	onChange={(
																		e
																	) => {
																		const data =
																			{
																				on_offboarding_date:
																					e
																						.target
																						.value,
																				has_offboarding_playbook: false,
																			};
																		dispatch(
																			setEditAutomationRule(
																				data
																			)
																		);
																	}}
																/>
															</div>{" "}
															<span className="ml-3">
																{" "}
																days
															</span>
														</div>
													</div>
												</>
											)}
									</>
								</div>
								<div className="tab_content_subheader my-2">
									ON REJECTION
								</div>
								<div
									style={{
										borderTop: "1px solid #EBEBEB",
										marginTop: "8px",
									}}
								/>
								<div className="rejection_email__wrapper">
									<div className="rejection_email__button__label">
										{" "}
										Send email on rejection
									</div>
									{/* <div
									className="rejection_email__button__trigger cursor-pointer"
									onClick={() => setShowEmailPopup(true)}
								>
									EDIT MAIL
								</div> */}
								</div>
							</>
						)}

						{showEmailPopup && (
							<Modal
								show={showEmailPopup}
								onHide={() => setShowEmailPopup(false)}
								centered
								contentClassName="request__license__modal"
							>
								<div
									className="request__license__cont"
									style={{ height: "fit-content" }}
								>
									<div
										className="request-license-modal-heading d-flex justify-content-between"
										style={{
											backgroundColor:
												"rgba(235, 235, 235, 0.5)",
										}}
									>
										<div className="adduser__accessedby__cont__topmost__heading">
											Rejection email
										</div>
										<img
											src={cross}
											height={12}
											width={12}
											onClick={() => {
												() => setShowEmailPopup(false);
											}}
											className="request-license-modal-close-button"
										></img>
									</div>
									<textarea></textarea>
								</div>
							</Modal>
						)}
					</div>
				</div>
			)}
			<RulesConfiguration
				rule={rule}
				hideTrigger={type === "apprequisition"}
			/>
		</div>
	);
}
function AssignTask({
	title,
	value,
	onDelete,
	onUserChange,
	date,
	onDateChange,
	userRoles,
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [users, setUsers] = useState([]);
	const cancelToken = useRef();

	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		// setUsersLoader(true);
		if (searchQuery) {
			cancelToken.current = client.CancelToken.source();
			if (checkSpecialCharacters(searchQuery, true)) {
				// setUsersLoader(false);
			} else {
				searchUsers(searchQuery, cancelToken.current, true).then(
					(res) => {
						if (res?.results) {
							if (searchQuery) {
								setUsers(res?.results);
							}
							// setUsersLoader(false);
						}
					}
				);
			}
		}
	}, [searchQuery]);
	return (
		<>
			<div>
				{" "}
				<span className="assign_task_description">{title}</span>{" "}
				<Select
					search
					mode="single"
					disableLocalValue
					value={value}
					onSearch={(query) => {
						setSearchQuery(query);
						if (query === "") {
							onDelete();
						}
					}}
					selectedOptionRender={(option, props) => {
						return (
							<div className="font-14 text-capitalize flex-fill ">
								{option.user_name}
							</div>
						);
					}}
					// isOptionsLoading={usersLoader || false}
					options={searchQuery?.length > 0 ? users : userRoles}
					// onBlur={() => updateRule()}
					fieldNames={
						searchQuery?.length > 0 ||
						(!_.isEmpty(value?.[0]) && value?.[0]?.type !== "role")
							? userFields
							: userRoleFields
					}
					optionRender={(option, props) => {
						return (
							<div className="text-capitalize">
								<div className="d-flex object-contain img-circle align-items-center">
									{props.fieldNames.logo && (
										<GetImageOrNameBadge
											name={
												option[props.fieldNames.label]
											}
											url={option[props.fieldNames.logo]}
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
											{option[props.fieldNames.label]}
										</p>
										{option[
											props.fieldNames.description
										] && (
											<p className="font-9 grey-1 mb-0">
												{
													option[
														props.fieldNames
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
					onChange={onUserChange}
					placeholder={"Select User"}
				/>
			</div>
			<div className="d-flex">
				<span className="due_within_text">Due Within</span>
				<div className="d-flex align-items-center">
					<div className="w-50">
						<Form.Control
							className="w-50 m-2"
							type="number"
							value={date}
							onChange={onDateChange}
						/>
					</div>{" "}
					<span className="ml-3"> days</span>
				</div>
			</div>
		</>
	);
}
