import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import moment from "moment";
import { LoaderPage } from "common/Loader/LoaderPage";
import { Button } from "UIComponents/Button/Button";
import close from "assets/close.svg";
import "../../appPlaybooks/appPlaybooks.css";
import add from "assets/icons/plus-circle-blue.svg";
import WorkflowName from "modules/workflow/components/WorkflowName/WorkflowName";
import { folder_type } from "modules/applications/components/automation/appPlaybooks/appPlaybooks-constants";
import {
	addToScopeValidations,
	editApplicationOfPlaybook,
	getIntegrationAccountsPlaybook,
	removeInegrationAccount,
	runScopeValidations,
	setEditActionPlaybook,
	editWorkFlowDetails,
	setEditApplication,
	clearWorkflow,
} from "../../redux/appPlaybook";

import "../actions/actions.css";
import { useDispatch, useSelector } from "react-redux";
import {
	WorkFlowActionModel,
	WorkFlowApplicationRequestModel,
} from "modules/workflow/model/model";
import {
	addActiontoPlaybook,
	getAppPlaybook,
	updateActiontoPlaybook,
	addApptoNodes,
	deleteActionfromPlaybook,
} from "../../redux/appPlaybook";
import {
	createTemplate,
	saveWorkFlowTemplate,
} from "../../service/automation-api";
import { Action } from "modules/workflow/components/Action/Action";
import { Select } from "UIComponents/Select/Select";
import DepartmentTags from "./departmentTagsSelect";
import Tags from "../tags";
import ActionLoader from "modules/workflow/components/ActionLoader/ActionLoader";
export function CreatePlaybook({ isOpen, handleClose, modalProps }) {
	const { onCloseModal, folderType, template, handleRefreshTable } =
		modalProps;
	const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
	const [integration, setIntegration] = useState(null);
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [loadingTemplate, setLoadingTemplate] = useState(false);
	const [isAddingIntegration, setIsAddingIntegration] = useState(false);
	const [integrationsDetails, setIntegrationsDetails] = useState(null);
	const workflow = useSelector((state) => state.appPlaybooks?.workflow);
	const [tags, setTags] = useState([]);
	const [description, setDescription] = useState("");
	const [department_tags, setDepartmentTags] = useState([]);
	const [leftBarChanged, setLeftbarChanged] = useState(false);
	const [isValidated, setIsValidated] = useState(false);
	const [isPublishPlaybook, setIsPublishPlaybook] = useState(false);
	const application = useSelector((state) =>
		state.appPlaybooks?.workflow?.nodes?.length > 0
			? state.appPlaybooks?.workflow?.nodes[0]
			: {}
	);
	const scopeValidations = useSelector(
		(state) => state.appPlaybooks?.scopeValidations
	);
	const integrationAccounts = useSelector(
		(state) => state.appPlaybooks?.integrationAccounts
	);

	const [currentApp, setCurrentApp] = useState({});
	useEffect(() => {
		if (application) {
			setCurrentApp(application);
			if (template) {
				dispatch(setEditApplication(application));
			}
		}
	}, [application?.workflowApplicationID, application?.actions?.length]);

	useEffect(() => {
		if (
			!scopeValidations[application.orgIntegrationID] &&
			application.orgIntegrationID
		) {
			const actionsIDs = application.actions
				.map((action) => action.id)
				.filter((id) => id);
			if (actionsIDs.length >= 1) {
				dispatch(addToScopeValidations(application.orgIntegrationID));
				dispatch(
					runScopeValidations(
						workflow.id,
						{
							org_integration_id: application.orgIntegrationID,
							actionIds: actionsIDs,
						},
						true
					)
				);
			}
		}
	}, [scopeValidations]);

	useEffect(() => {
		setIsPublishPlaybook(false);
		setLoadingTemplate(true);
		async function createandFetchTemplate() {
			let res = {};
			if (!template) {
				res = await createTemplate(folderType);
				res.id = res._id;
			} else {
				res = template;
				res.id = template.workflow_id || template._id;
			}
			res.isTemplate = true;
			dispatch(getAppPlaybook(res));
			if (!template) {
				dispatch(
					addApptoNodes(
						res.id,
						res.mini_playbook_data.app_id,
						folderType
					)
				);
			}
		}
		createandFetchTemplate();
	}, []);

	useEffect(() => {
		if (
			!integrationAccounts.hasOwnProperty(application?.id) &&
			application?.id
		) {
			getIntegrationAccountsList();
		}
		if (
			!integrationsDetails?.hasOwnProperty("available") &&
			application.id &&
			!isAddingIntegration &&
			integrationAccounts[application?.id]
		) {
			getIntegration();
		}
	}, [integrationAccounts, application?.id]);

	useEffect(() => {
		setIsAddingIntegration(false);
	}, [application]);
	useEffect(() => {
		if (workflow?.id) {
			setLoadingTemplate(false);
			setDepartmentTags(
				department_tags.length > 0
					? department_tags
					: workflow?.mini_playbook_data?.org_department_tags
			);
			setTags(
				tags.length > 0 ? tags : workflow?.mini_playbook_data?.tags
			);
			setDescription(
				description || workflow?.mini_playbook_data?.description
			);
		}
	}, [workflow?.id]);
	useEffect(() => {
		if (workflow) {
			setLoading(false);
			setIsValidated(
				!workflow.nodes?.filter(
					(app) =>
						app.actions.filter(
							(act) =>
								!act.isValidated ||
								(act.type === "integration" &&
									!act.orgIntegrationID)
						).length
				).length &&
					workflow.nodes?.filter((app) => app.actions.length).length
			);
		}
	}, [workflow]);
	const getIntegrationAccountsList = (orgIntegrationId) => {
		setIsLoadingIntegrations(true);
		dispatch(getIntegrationAccountsPlaybook(application.id));
		if (orgIntegrationId) {
			var app = application;
			app.orgIntegrationID = orgIntegrationId;
			var actions = application.actions.map((action, index) => {
				action.orgIntegrationID = orgIntegrationId;
				return action;
			});
			dispatch(
				runScopeValidations(
					workflow.id,
					{
						org_integration_id: orgIntegrationId,
						actionIds: application.actions.map(
							(action) => action.id
						),
					},
					true
				)
			);
			dispatch(
				editApplicationOfPlaybook(
					workflow.id,
					application.workflowApplicationID,
					new WorkFlowApplicationRequestModel(
						Object.assign({}, app, {
							actions: actions,
						})
					),
					true
				)
			);
		}
	};

	const getIntegration = () => {
		setIntegrationsDetails(integrationAccounts[application?.id]);
		if (
			integrationAccounts[application?.id].hasOwnProperty("integration")
		) {
			setIntegration(integrationAccounts[application?.id].integration);
		}
		setIsLoadingIntegrations(false);
		const accounts = integrationAccounts[application?.id]?.accounts || [];
		if (accounts.length === 1) {
			onOrgIngChange(accounts[0]);
		}
	};

	const addAction = () => {
		const app = Object.assign({}, currentApp);
		app?.actions?.push(new WorkFlowActionModel());
		setCurrentApp(app);
	};
	const onSelectApp = (e) => {
		if (!workflow.isExecuted) {
			dispatch(setEditApplication(currentApp));
		}
	};
	const addActionToApp = async (action) => {
		const body = {
			tags: tags ? tags : undefined,
			department_tags:
				department_tags.length > 0
					? department_tags.map((dept) => dept.department_id)
					: undefined,
			description: description ? description : undefined,
		};
		//await saveWorkFlowTemplate(workflow.id, body);
		// dispatch(getAppPlaybook({ ...workflow, isTemplate: true }));
		if (action.workflowActionID) {
			dispatch(
				updateActiontoPlaybook(
					workflow.id,
					application.workflowApplicationID,
					action.workflowActionID,
					{
						action,
					},
					true
				)
			);
		} else {
			dispatch(
				addActiontoPlaybook(
					workflow.id,
					application.workflowApplicationID,
					{ action },
					true
				)
			);
		}
	};
	const deleteAction = (action) => {
		dispatch(
			deleteActionfromPlaybook(
				workflow.id,
				application.workflowApplicationID,
				action.workflowActionID,
				true
			)
		);
	};
	const getActionValidationStatus = (
		workflow,
		action,
		orgIntegrationID,
		isTemplate
	) => {
		dispatch(
			runScopeValidations(
				workflow.id,
				{
					org_integration_id:
						action.orgIntegrationID || orgIntegrationID,
					actionIds: [action.id],
				},
				isTemplate
			)
		);
	};

	const onOrgIngChange = (v) => {
		if (
			v.org_integration_id != application.orgIntegrationID &&
			!isAddingIntegration
		) {
			setIsAddingIntegration(true);
			var app = application;
			app.orgIntegrationID = v.org_integration_id;
			var actions = application.actions.map((action, index) => {
				action.orgIntegrationID = v.org_integration_id;
				return action;
			});
			dispatch(
				editApplicationOfPlaybook(
					workflow.id,
					application.workflowApplicationID,
					new WorkFlowApplicationRequestModel(
						Object.assign({}, app, {
							orgIntegrationID: v.org_integration_id,
							orgIntegrationName: v.name,
							actions,
						})
					),
					true
				)
			);
		}
	};

	const handleChange = (e, target) => {
		setDescription(e.target.value);
		setLeftbarChanged(true);
	};
	const onClose = () => {
		setIntegrationsDetails(null);
		setIsAddingIntegration(false);
		dispatch(clearWorkflow());
		setDepartmentTags([]);
		setDescription("");
		setTags([]);
		onCloseModal();
		handleClose();
		handleRefreshTable();
	};
	const savePlaybook = async (val) => {
		if (!val) {
			setIsPublishPlaybook(true);
		}
		const body = {
			tags: tags ? tags : undefined,
			department_tags:
				department_tags.length > 0
					? department_tags.map((dept) => dept.department_id)
					: undefined,
			description: description ? description : undefined,
			is_published: val ? false : !workflow?.is_published,
		};
		await saveWorkFlowTemplate(workflow.id, body);
		if (!val) {
			setIsPublishPlaybook(false);
		}
		onClose();
		handleRefreshTable();
	};
	return (
		<Modal
			show={isOpen}
			backdrop="static"
			dialogClassName="createplaybook"
			onHide={() => {
				onClose();
				handleClose();
			}}
		>
			<Modal.Body>
				{loadingTemplate ? (
					<LoaderPage />
				) : (
					<div
						className="d-flex flex-row"
						onClick={(e) => {
							e.stopPropagation();
							onSelectApp(e);
						}}
					>
						<div
							className="d-flex flex-column"
							style={{
								padding: "15px",
								width: "25%",
							}}
						>
							<Form.Group>
								<WorkflowName
									entity="appPlaybooks"
									editWorkFlowDetails={editWorkFlowDetails}
									isTemplate={true}
								/>
								<hr />
								<Form.Label htmlFor="folderType">
									AppPlaybook Type
								</Form.Label>
								<Form.Control
									as="input"
									value={folder_type[folderType]}
									disabled
								/>
							</Form.Group>
							{integrationsDetails && !application.isGrouped ? (
								<div className="d-inline-block mb-3">
									{integrationsDetails.accounts.length ? (
										<>
											<Form.Label htmlFor="folderType">
												Select Instance
											</Form.Label>
											<Select
												isOptionsLoading={
													isLoadingIntegrations
												}
												value={
													integrationsDetails.accounts.filter(
														(acc) =>
															acc.org_integration_id ===
															application.orgIntegrationID
													)[0] || null
												}
												placeholder="Select integration"
												className="m-0 primary-color"
												options={
													integrationsDetails.accounts
												}
												onChange={(v) => {
													onOrgIngChange(v);
												}}
												fieldNames={{
													label: "name",
												}}
												onRefresh={() => {
													dispatch(
														removeInegrationAccount(
															application.id
														)
													);
												}}
												isLoading={isAddingIntegration}
											/>
										</>
									) : integrationsDetails?.available ? (
										<span className="font-12 primary-color  mr-2">
											Integration Available
										</span>
									) : (
										<span className="font-12 grey-1 mr-2">
											No Integration Available
										</span>
									)}
								</div>
							) : workflow.isExecuted ? (
								<span className="font-12 primary-color  mr-2">
									{application?.orgIntegrationName}
								</span>
							) : (
								isLoadingIntegrations && (
									<Spinner
										className="mr-2 blue-spinner action-edit-spinner"
										animation="border"
									/>
								)
							)}
							<Form.Group className="mb-3">
								<Form.Label htmlFor="Departmenttags">
									Department
								</Form.Label>
								<DepartmentTags
									department_tags={department_tags}
									setDepartmentTags={setDepartmentTags}
									setLeftbarChanged={setLeftbarChanged}
								/>
							</Form.Group>
							<Form.Group className="mb-4">
								<Form.Label htmlFor="description">
									Tags
								</Form.Label>
								<Tags
									tags={tags}
									setTags={setTags}
									setLeftbarChanged={setLeftbarChanged}
								/>
								{/* <Form.Control
								type="text"
								id="tags"
								placeholder="Add tags"
								value={tags}
								onChange={(e) => handleChange(e, "tags")}
							/> */}
							</Form.Group>
							<Form.Group controlId="exampleForm.ControlTextarea1">
								<Form.Label htmlFor="description">
									Description
								</Form.Label>
								<Form.Control
									style={{ height: "100px" }}
									as="textarea"
									rows={3}
									placeholder="Add description"
									value={description}
									onChange={(e) =>
										handleChange(e, "description")
									}
								/>
							</Form.Group>
						</div>
						<div className="d-flex flex-column  actions_info_card">
							<div
								className="d-flex flex-row justify-content-end p-4"
								style={{ width: "100%" }}
							>
								<img
									className="cursor-pointer"
									alt="Close"
									onClick={onClose}
									src={close}
									width="16px"
									height="16px"
								/>
							</div>
							<div
								className="d-flex actions_container"
								style={{ height: "70vh", overflowY: "auto" }}
							>
								<div className="start_text">Start here</div>
								<div
									className={`d-flex flex-column ${
										currentApp?.actions?.length > 0
											? ""
											: ""
									}`}
									style={{
										width: "80%",
									}}
								>
									{currentApp?.actions?.map(
										(action, index) => {
											return (
												<div
													className="white-bg"
													onClick={(e) => {
														e.stopPropagation();
													}}
													key={
														action?.workflowActionID
															? action?.workflowActionID +
															  index
															: index ||
															  action._id + index
													}
												>
													{loading ? (
														<ActionLoader />
													) : (
														<Action
															folderType={
																folderType
															}
															entity="appPlaybooks"
															isTemplate={true}
															key={
																action?.workflowActionID
																	? action?.workflowActionID +
																	  index
																	: index ||
																	  action._id +
																			index
															}
															getActionValidationStatus={
																getActionValidationStatus
															}
															action={action}
															application={
																application
															}
															addAction={(
																action
															) => {
																addActionToApp(
																	action
																);
															}}
															deleteAction={(
																action
															) => {
																deleteAction(
																	action
																);
															}}
															setEditActionWorkflow={
																setEditActionPlaybook
															}
															orgIntegrationID={
																application.orgIntegrationID
															}
															onIntegrationConnection={(
																orgIntegrationId
															) => {
																if (
																	orgIntegrationId
																) {
																	getIntegrationAccountsList(
																		orgIntegrationId
																	);
																}
															}}
															loadIntegrations={() => {
																getIntegrationAccountsList();
															}}
															onIntegrationScopeChange={(
																org
															) => {
																dispatch(
																	runScopeValidations(
																		workflow.id,
																		{
																			org_integration_id:
																				application.orgIntegrationID,
																			actionIds:
																				application.actions.map(
																					(
																						action
																					) =>
																						action.id
																				),
																		},
																		true
																	)
																);
															}}
															integration={
																integration
															}
															setLoading={
																setLoading
															}
															loading={loading}
															scopeValidation={
																scopeValidations[
																	currentApp
																		.orgIntegrationID
																]
																	? scopeValidations[
																			currentApp
																				.orgIntegrationID
																	  ][
																			action
																				.uniqId
																	  ] ||
																	  scopeValidations[
																			currentApp
																				.orgIntegrationID
																	  ].error
																	: null
															}
														/>
													)}
												</div>
											);
										}
									)}
									<footer className="p-2 text-center">
										<Button
											onClick={() => {
												addAction();
											}}
											type="link"
											className="bold-600 "
										>
											<img className="mr-1" src={add} />{" "}
											Add an action
										</Button>
									</footer>
								</div>
							</div>

							<hr />
							<div className="d-flex justify-content-end align-items-end p-2 mr-2 mb-2">
								{leftBarChanged && (
									<Button
										type="link"
										onClick={() => savePlaybook("save")}
									>
										Save Changes
									</Button>
								)}
								{!workflow?.is_published && (
									<Button
										variant="outline-primary"
										onClick={() => savePlaybook("")}
										disabled={
											!isValidated || isPublishPlaybook
										}
									>
										{isPublishPlaybook && (
											<Spinner
												style={{ top: "0px" }}
												className="ml-2 mr-2 blue-spinner action-edit-spinner"
												animation="border"
											/>
										)}
										Publish appPlaybook
									</Button>
								)}
							</div>
						</div>
					</div>
				)}
			</Modal.Body>
		</Modal>
	);
}
