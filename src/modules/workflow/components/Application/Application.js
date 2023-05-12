import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import deleteIcon from "../../../../assets/icons/delete.svg";
import add from "../../../../assets/icons/plus-circle-blue.svg";
import users from "../../../../assets/icons/multi-users.svg";
import bdown from "../../../../assets/bluearrowdown.svg";
import approval from "../../../../assets/workflow/approval.svg";
import approved from "../../../../assets/workflow/approved.svg";
import "./Application.css";
import { useDispatch, useSelector } from "react-redux";
import {
	setEditApplication,
	addActionToWorkflow,
	deleteAppFromWorkflow,
	deleteActFromWorkflow,
	updateActionToWorkflow,
	setOrgIdApplication,
	editApplicationOfWorkflow,
	getAppDescription,
	getInegrationAccounts,
	removeInegrationAccount,
	runScopeValidations,
	seperateAppFromMultiNode,
	deleteAppFromMultiNode,
	addToScopeValidations,
	setEditActionWorkflow,
	getIntegrationAccountsV2,
	changeIntegrationAccount,
} from "../../redux/workflow";
import { Action } from "../Action/Action";
import {
	WorkFlowActionModel,
	WorkFlowActionRequestModel,
	WorkFlowApplicationRequestModel,
} from "../../model/model";
import { Spinner, Tooltip } from "react-bootstrap";
import { useOutsideClickListener } from "../../../../utils/clickListenerHook";
import AppDescription from "../AppDescription/AppDescription.js";
import { AppAuthStatusIconAndTooltip } from "../../../../common/AppAuthStatus";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";
import { Select } from "UIComponents/Select/Select";
import OverlayTooltip from "UIComponents/OverlayToolTip";
import { WORFKFLOW_TYPE } from "../../constants/constant";
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from "react-sortable-hoc";
import arrayMove from "array-move";
import ApplicationApproval from "../ApplicationApproval/ApplicationApproval";
import ActionLoader from "../ActionLoader/ActionLoader";
import IntegrationAccounts from "../IntegrationAccounts/IntegrationAccounts";
import ActionDiscardModal from "../ActionDiscardModal/ActionDiscardModal";

const SortableContainer = sortableContainer(({ children }) => {
	return children;
});

export default function Application(props) {
	const workflow = useSelector((state) => state.workflows.workflow);
	const scopeValidations = useSelector(
		(state) => state.workflows.scopeValidations
	);
	const [application, setApplication] = useState(props.application);
	const [integrationsDetails, setIntegrationsDetails] = useState(null);
	const dispatch = useDispatch();
	const [integration, setIntegration] = useState(null);
	const [showAddActionBlock, setShowAddActionBlock] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
	const [isLoadingSeperateAppID, setIsLoadingSeperateAppID] = useState(null);
	const [isLoadingDeleteAppID, setIsLoadingDeleteAppID] = useState(null);
	const [showMultiApps, setShowMultiApps] = useState(false);
	const [isAddingIntegration, setIsAddingIntegration] = useState(false);
	const editApplication = useSelector(
		(state) => state.workflows.editApplication
	);
	const integrationAccounts = useSelector(
		(state) => state.workflows.integrationAccounts
	);

	const [showActionDiscardModal, setShowActionDiscardModal] = useState(false);
	const [selectedIntegrationToChange, setSelectedIntegrationToChange] =
		useState();
	const [showAppApproval, setShowAppApproval] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const ref = useRef(null);

	const scrollRef = useRef(null);

	const scrollToBottom = () => {
		if (scrollRef && scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	useEffect(() => {
		if (
			!integrationAccounts.hasOwnProperty(application?.id) &&
			application?.id &&
			isEditing
		) {
			getIntegrationAccountsList();
		}
		if (
			isEditing &&
			!integrationsDetails?.hasOwnProperty("available") &&
			!isDeleting &&
			props.application.id &&
			!isAddingIntegration &&
			integrationAccounts[props.application?.id]
		) {
			getIntegration();
		}
	}, [integrationAccounts, isEditing]);

	useEffect(() => {
		if (application && application.isAppAdded) {
			scrollToBottom();
			setApplication(Object.assign(application, { isAppAdded: false }));
		}
		setIsLoadingSeperateAppID(null);
		setIsLoadingDeleteAppID(null);
	}, [application && application.isAppAdded]);

	useEffect(() => {
		if (!editApplication) {
			const app = Object.assign({}, application);
			app.actions = app.actions.filter(
				(action) => action.workflowActionID
			);
			setApplication(app);
			setIsEditing(false);
			setShowMultiApps(false);
		} else {
			setIsEditing(
				editApplication?.workflowApplicationID ===
					props.application.workflowApplicationID
			);
		}
	}, [editApplication]);

	useOutsideClickListener(
		ref,
		() => {
			if (isEditing) {
				dispatch(setEditApplication(null));
			}
		},
		[isEditing],
		["modal-body", "recommendedItem", "modal"]
	);

	useEffect(() => {
		if (
			!scopeValidations[props.application.orgIntegrationID] &&
			props.application.orgIntegrationID
		) {
			const actionsIDs = props.application.actions
				.map((action) => action.id)
				.filter((id) => id);
			if (actionsIDs.length >= 1) {
				dispatch(
					addToScopeValidations(props.application.orgIntegrationID)
				);
				dispatch(
					runScopeValidations(
						workflow.id,
						{
							org_integration_id:
								props.application.orgIntegrationID,
							actionIds: actionsIDs,
						},
						props.isTemplate
					)
				);
			}
		}
	}, [scopeValidations]);

	useEffect(() => {
		setIsAddingIntegration(false);
		if (Object.keys(props.application).length) {
			setApplication(
				Object.assign(props.application, { isAppAdded: false })
			);
			if (props.application.orgIntegrationID) {
				setIntegrationsDetails({
					accounts: [
						{
							name: props.application.orgIntegrationName,
							org_integration_id:
								props.application.orgIntegrationID,
							_id: props.application.orgIntegrationID,
						},
					],
				});
			}
		}
	}, [props.application]);

	const getIntegrationAccountsList = (orgIntegrationId) => {
		setIsLoadingIntegrations(true);
		// dispatch(getInegrationAccounts(application.id));
		dispatch(getIntegrationAccountsV2(application.id));
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
						actionIds: props.application.actions.map(
							(action) => action.id
						),
					},
					props.isTemplate
				)
			);
			dispatch(
				editApplicationOfWorkflow(
					workflow.id,
					application.workflowApplicationID,
					new WorkFlowApplicationRequestModel(
						Object.assign({}, app, {
							actions: actions,
						})
					),
					props.isTemplate
				)
			);
		}
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
	const onDelete = () => {
		setIsDeleting(true);
		setIsLoadingIntegrations(false);
		dispatch(
			deleteAppFromWorkflow(
				workflow.id,
				application.workflowApplicationID,
				props.isTemplate
			)
		);
	};

	// const getIntegration = () => {
	// 	setIntegrationsDetails(integrationAccounts[props.application?.id]);
	// 	if (
	// 		integrationAccounts[props.application?.id].hasOwnProperty(
	// 			"integration"
	// 		)
	// 	) {
	// 		setIntegration(
	// 			integrationAccounts[props.application?.id].integration
	// 		);
	// 	}
	// 	setIsLoadingIntegrations(false);
	// 	const accounts =
	// 		integrationAccounts[props.application?.id]?.accounts || [];
	// 	if (accounts.length === 1) {
	// 		onOrgIngChange(accounts[0]);
	// 	}
	// };

	const getIntegration = () => {
		if (integrationAccounts[props.application?.id]) {
			const integrationsArray =
				integrationAccounts[props.application?.id];

			const selectedIntegrationAccount = integrationsArray
				?.flatMap(
					(item) =>
						item?.accounts &&
						Array.isArray(item?.accounts) &&
						item?.accounts?.length &&
						item?.accounts?.filter(
							(account) =>
								account?.org_integration_id ===
								application?.orgIntegrationID
						)
				)
				?.filter((id) => id);

			const selectedIntegration = integrationsArray?.filter(
				(item) =>
					item?.integration?.integration_id ===
					selectedIntegrationAccount?.[0]?.parent_integration_id
			);

			if (selectedIntegration?.[0]?.hasOwnProperty("integration")) {
				setIntegration(selectedIntegration?.[0]?.integration);
			}
			let defaultIntegration =
				integrationsArray?.filter(function (o) {
					return o.accounts.length > 0;
				}) || [];
			if (
				(selectedIntegrationAccount?.length === 0 ||
					selectedIntegration?.length === 0) &&
				defaultIntegration?.length > 0
			) {
				setIntegration(defaultIntegration?.[0]?.integration);
				setIntegrationsDetails(defaultIntegration?.[0]);
			}
			setIsLoadingIntegrations(false);
			const accounts =
				selectedIntegration?.[0]?.accounts ||
				defaultIntegration?.[0]?.accounts ||
				[];
			if (accounts.length === 1) {
				onOrgIngChange(accounts[0]);
			}
		}
	};

	const addAction = () => {
		if (
			props.application.orgIntegrationID ||
			integrationsDetails ||
			props.application
		) {
			const app = Object.assign({}, application);
			app.actions.push(new WorkFlowActionModel());
			setApplication(app);
			setShowAddActionBlock(true);
		}
	};

	const addActionToApp = (action) => {
		const isStaticNode =
			application.id || application.apps?.length > 0 ? false : true;
		if (action.workflowActionID) {
			dispatch(
				updateActionToWorkflow(
					workflow.id,
					application.workflowApplicationID,
					action.workflowActionID,
					{
						action,
					},
					isStaticNode,
					props.isTemplate
				)
			);
		} else {
			dispatch(
				addActionToWorkflow(
					workflow.id,
					application.workflowApplicationID,
					{ action },
					isStaticNode,
					props.isTemplate
				)
			);
		}
	};

	const deleteAction = (action) => {
		dispatch(
			deleteActFromWorkflow(
				workflow.id,
				application.workflowApplicationID,
				action.workflowActionID,
				props.isTemplate
			)
		);
	};

	const onSortEnd = ({ oldIndex, newIndex }) => {
		setLoading(true);
		const newList = arrayMove(application?.actions, oldIndex, newIndex);
		dispatch(
			editApplicationOfWorkflow(
				workflow.id,
				application.workflowApplicationID,
				new WorkFlowApplicationRequestModel(
					Object.assign({}, application, {
						actions: newList,
					})
				),
				props.isTemplate
			)
		);
	};

	const SortableItem = sortableElement(
		({ action, scopeValidation, index, key }) => {
			return (
				<Action
					entity="workflows"
					isTemplate={props.isTemplate}
					orgIntegrationID={props.application.orgIntegrationID}
					setEditActionWorkflow={setEditActionWorkflow}
					onIntegrationConnection={(orgIntegrationId) => {
						if (orgIntegrationId) {
							getIntegrationAccountsList(orgIntegrationId);
						}
					}}
					loadIntegrations={() => {
						getIntegrationAccountsList();
					}}
					getActionValidationStatus={getActionValidationStatus}
					onIntegrationScopeChange={(org) => {
						dispatch(
							runScopeValidations(
								workflow.id,
								{
									org_integration_id:
										props.application.orgIntegrationID,
									actionIds: props.application.actions.map(
										(action) => action.id
									),
								},
								props.isTemplate
							)
						);
					}}
					integration={integration}
					action={action}
					scopeValidation={scopeValidation}
					key={index}
					application={application}
					addAction={(action) => {
						addActionToApp(action);
					}}
					deleteAction={(action) => {
						deleteAction(action);
					}}
					setLoading={setLoading}
					loading={loading}
				/>
			);
		}
	);

	const actions = application.actions.map((action, index) => {
		const scopeValidation = scopeValidations[
			props.application.orgIntegrationID
		]
			? scopeValidations[props.application.orgIntegrationID][
					action.uniqId
			  ] || scopeValidations[props.application.orgIntegrationID].error
			: null;

		return (
			<>
				{loading ? (
					<ActionLoader />
				) : (
					<SortableItem
						action={action}
						scopeValidation={scopeValidation}
						index={index}
						key={`action-${index}`}
					/>
				)}
			</>
		);
	});

	const onSelectApp = (e) => {
		if (!workflow.isExecuted && !isEditing) {
			dispatch(setEditApplication(application));
		}
	};

	const handleIntegrationChange = (option) => {
		const allLocalIntegrations = integrationAccounts[application?.id];
		const integration = allLocalIntegrations?.filter(
			(acc) =>
				acc?.integration?.integration_id ===
				option?.parent_integration_id
		)?.[0];
		const account = integration?.accounts?.filter(
			(acc) => acc?.org_integration_id === application?.orgIntegrationID
		);
		setSelectedIntegrationToChange(option);
		if (Array.isArray(account) && account?.length === 0) {
			setShowActionDiscardModal(true);
		} else {
			onOrgIngChange(option);
		}
	};

	const onIntegrationAccountChange = (v) => {
		dispatch(
			changeIntegrationAccount(
				workflow.id,
				application.workflowApplicationID,
				{ org_integration_id: v.org_integration_id },
				props.isTemplate,
				workflow.type
			)
		);
		setSelectedIntegrationToChange();
		setShowActionDiscardModal(false);
	};

	const onOrgIngChange = (v) => {
		if (
			v.org_integration_id != props.application.orgIntegrationID &&
			!isDeleting &&
			isEditing &&
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
				editApplicationOfWorkflow(
					workflow.id,
					application.workflowApplicationID,
					new WorkFlowApplicationRequestModel(
						Object.assign({}, app, {
							orgIntegrationID: v.org_integration_id,
							orgIntegrationName: v.name,
							actions,
						})
					),
					props.isTemplate
				)
			);
		}
	};

	const handleAppDescription = (obj) => {
		dispatch(getAppDescription(obj));
	};

	const seperateApp = (apps, index) => {
		let appIds = apps.map((app) => app.id);
		if (index >= 0) {
			setIsLoadingSeperateAppID(index);
		} else {
			setIsLoadingSeperateAppID("all");
		}
		dispatch(
			seperateAppFromMultiNode(
				workflow.id,
				application.workflowApplicationID,
				appIds
			)
		);
	};

	const deleteApp = (app, index) => {
		setIsLoadingDeleteAppID(index);
		dispatch(
			deleteAppFromMultiNode(
				workflow.id,
				application.workflowApplicationID,
				app.id
			)
		);
	};

	const applicableUsersUI = (app) => {
		return (
			app.notApplicableUsers &&
			app.notApplicableUsers.length > 0 && (
				<div className="d-flex justify-content-start ">
					<OverlayTooltip
						placement="bottom"
						isStickyTooltip
						overlay={
							<>
								<Tooltip bsPrefix="applicable-users">
									<div className="app-description-tooltip-content applicable-users-workflow p-0">
										{app.applicableUsers.length > 0 ? (
											<ul className="list-style-none p-0 hide-scrollbar m-0">
												{app.applicableUsers.map(
													(user) => (
														<li className="d-flex p-3">
															<GetImageOrNameBadge
																name={
																	user.user_name
																}
																url={
																	user.user_logo
																}
																width={16}
																height={16}
																imageClassName={
																	"border-radius-4 mr-2 object-contain"
																}
																nameClassName={
																	"mr-2 img-circle d-inline-block"
																}
															/>
															<p className="m-0 font-14 black-1">
																{user.user_name}
															</p>
														</li>
													)
												)}
											</ul>
										) : (
											<p className="font-10 p-3 m-0 grey-1">
												Not applicable to any selected
												users
											</p>
										)}
									</div>
								</Tooltip>
							</>
						}
					>
						<div
							className="cursor-default d-flex justify-content-center"
							style={{ position: "relative" }}
						>
							<p className="bg-blue font-9 glow_blue p-1 border-radius-2 pointer m-0">
								<img src={users} className="mr-1" />
								Applies only to few users
							</p>
						</div>
					</OverlayTooltip>
				</div>
			)
		);
	};
	return (
		<>
			<div
				className={`${
					editApplication?.workflowApplicationID
						? !isEditing
							? "o-5"
							: "is-active "
						: workflow.isExecuted
						? "o-5"
						: ""
				} z-workflow-application white-bg mb-2 border-1 pointer`}
				onClick={(e) => {
					e.stopPropagation();
					onSelectApp(e);
				}}
				ref={ref}
			>
				<header>
					<div className="d-flex flex-1 px-4 pt-3">
						{workflow.type === WORFKFLOW_TYPE.OFFBOARDING &&
							applicableUsersUI(props.application)}
						{/* {isEditing && (
						<div className="d-flex flex-1 justify-content-end">
							<img
								onClick={(e) => {
									e.stopPropagation();
									setShowAppApproval(!showAppApproval);
								}}
								src={approval}
								alt=""
							/>
							{showAppApproval && (
								<ApplicationApproval
									setShowAppApproval={(val) =>
										setShowAppApproval(val)
									}
									showAppApproval={showAppApproval}
								/>
							)}
						</div>
					)} */}
					</div>
					<div className="pl-4 p-3 pt-4 d-flex justify-content-between">
						<div className="d-flex d-inline-flex align-items-center position-relative">
							{!props.application.isGrouped ? (
								<AppDescription
									appDetailsAPI={handleAppDescription}
									application={application}
								>
									<div className="position-relative">
										<GetImageOrNameBadge
											name={application.name}
											url={application.logo}
											width={24}
											height={24}
											imageClassName={
												"border-radius-4 mr-3 object-contain"
											}
											nameClassName={"mr-2 img-circle"}
										/>
										{application.state && (
											<AppAuthStatusIconAndTooltip
												authStatus={application.state}
												width={10}
												className="position-absolute d-flex"
												style={{
													bottom: "-4px",
													left: "20px",
													background: "#fff",
													borderRadius: "30px",
												}}
											/>
										)}
									</div>
									<p className="m-0 bold-600 font-16 grey text-capitalize">
										{application.name}
									</p>
								</AppDescription>
							) : (
								<>
									<div className="position-relative d-flex mr-3">
										{props.application.apps
											.map((app, index) => (
												<GetImageOrNameBadge
													key={index}
													name={app.name}
													url={app.logo}
													width={20}
													height={20}
													imageClassName={
														index === 0
															? " mr-n2 z-index-1  img-circle white-bg"
															: null +
															  "border-radius-4 object-contain avatar"
													}
													nameClassName={
														index === 0
															? " mr-n2 z-index-1  img-circle white-bg"
															: null +
															  "img-circle avatar  mr-n2 z-index-1"
													}
												/>
											))
											.slice(0, 2)}
									</div>
									<p className="m-0 bold-600 font-16 grey text-capitalize">
										{props.application.apps
											.map((res) => res.name)
											.slice(0, 2)
											.join(", ")}
										<span className="text-lowercase">
											{props.application.apps.length >
												2 &&
												` ,+ ${
													props.application.apps
														.length - 2
												} more apps`}
										</span>
									</p>
								</>
							)}
						</div>
						<div>
							{props.application.orgIntegrationID &&
								!scopeValidations[
									props.application.orgIntegrationID
								] &&
								!integrationAccounts[props.application?.id] &&
								isEditing &&
								!isDeleting && (
									<Spinner
										className="mr-2 blue-spinner action-edit-spinner"
										animation="border"
									/>
								)}
							{/* {integrationsDetails && !props.application.isGrouped ? (
							<div
								style={{ maxWidth: "300px" }}
								className="d-inline-block mr-2"
							>
								{integrationsDetails.accounts.length ? (
									<Select
										isOptionsLoading={isLoadingIntegrations}
										value={
											integrationsDetails.accounts.filter(
												(acc) =>
													acc.org_integration_id ===
													props.application
														.orgIntegrationID
											)[0] || null
										}
										placeholder="Select integration"
										className="m-0  mr-2 account-select-ui primary-color"
										options={integrationsDetails.accounts}
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
								{props.application?.orgIntegrationName}
							</span>
						) : (
							isEditing &&
							isLoadingIntegrations &&
							!isDeleting && (
								<Spinner
									className="mr-2 blue-spinner action-edit-spinner"
									animation="border"
								/>
							)
						)} */}
							<IntegrationAccounts
								workflow={workflow}
								integrationsDetails={integrationsDetails}
								application={props.application}
								onOrgIngChange={onOrgIngChange}
								isLoadingIntegrations={isLoadingIntegrations}
								isAddingIntegration={isAddingIntegration}
								isEditing={isEditing}
								isDeleting={isDeleting}
								applicationId={props.application?.id}
								handleIntegrationChange={
									handleIntegrationChange
								}
							/>
							{props.application.isGrouped === "needs_review" &&
								isLoadingSeperateAppID !== "all" && (
									<Button
										type="link"
										onClick={() => {
											seperateApp(props.application.apps);
										}}
									>
										Separate apps
									</Button>
								)}
							{props.application.isGrouped === "needs_review" &&
								isLoadingSeperateAppID === "all" &&
								!isDeleting && (
									<Spinner
										className="mr-2 blue-spinner action-edit-spinner ml-2"
										animation="border"
									/>
								)}
							{!workflow.isExecuted && !isDeleting && (
								<img
									className="pointer"
									onClick={() => {
										onDelete();
									}}
									src={deleteIcon}
									width={14}
									height={14}
								/>
							)}
							{isDeleting && (
								<Spinner
									className="mr-2 blue-spinner action-edit-spinner ml-2"
									animation="border"
								/>
							)}
						</div>
					</div>
				</header>
				<SortableContainer
					onSortEnd={onSortEnd}
					useDragHandle
					helperClass="drag-action"
				>
					<section>{actions}</section>
				</SortableContainer>
				{showAddActionBlock &&
					!workflow.isExecuted &&
					!props.application.isGrouped && (
						<footer className="p-4 text-center  white-bg">
							<Button
								onClick={() => {
									addAction();
								}}
								type="link"
								className="bold-600 "
							>
								<img className="mr-1" src={add} /> Add an action
							</Button>
						</footer>
					)}
				{props.application.isGrouped && (
					<footer
						className={`text-center show-multi-app ${
							showMultiApps ? "m-4" : ""
						}`}
					>
						{showMultiApps && (
							<ul className="text-left p-4">
								{props.application.apps.map((app, index) => (
									<li
										className="d-flex  align-items-center mb-3"
										key={index}
									>
										<div className="flex-fill d-flex align-items-center">
											<div>
												<GetImageOrNameBadge
													name={app.name}
													url={app.logo}
													width={17}
													height={17}
													imageClassName={
														"border-radius-4 mr-3 object-contain"
													}
													nameClassName={
														"mr-2 img-circle d-inline-block"
													}
												/>
											</div>
											<div>
												<div className="text-capitalize font-16 bold-600">
													{app.name}
												</div>
												<div className="mt-1">
													{workflow.type ===
														WORFKFLOW_TYPE.OFFBOARDING &&
														applicableUsersUI(app)}
												</div>
											</div>
										</div>

										{isLoadingSeperateAppID === index ? (
											<Spinner
												className="mr-2 blue-spinner action-edit-spinner ml-2"
												animation="border"
											/>
										) : (
											<Button
												className="font-12"
												onClick={() => {
													seperateApp([app], index);
												}}
												type="link"
											>
												Separate action
											</Button>
										)}
										{isLoadingDeleteAppID === index ? (
											<Spinner
												className="mr-2 blue-spinner action-edit-spinner ml-2"
												animation="border"
											/>
										) : (
											<Button
												onClick={() => {
													deleteApp(app, index);
												}}
												type="link"
											>
												<img
													width={12}
													src={deleteIcon}
												/>
											</Button>
										)}
									</li>
								))}
							</ul>
						)}

						{!showMultiApps && (
							<Button
								onClick={() => {
									setShowMultiApps(!showMultiApps);
								}}
								type="link"
							>
								Expand <img className="ml-2" src={bdown} />
							</Button>
						)}
					</footer>
				)}
				{application && application.isAppAdded && (
					<div ref={scrollRef} />
				)}
			</div>
			{showActionDiscardModal && (
				<ActionDiscardModal
					application={application}
					modalClass="workflows-template-modal"
					show={showActionDiscardModal}
					onHide={() => {
						setShowActionDiscardModal(false);
					}}
					onClick={() => {
						onIntegrationAccountChange(selectedIntegrationToChange);
					}}
				/>
			)}
		</>
	);
}
