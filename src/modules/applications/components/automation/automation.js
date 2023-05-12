import React, { useState, useRef, useEffect } from "react";
import "./automation.css";
import { push } from "connected-react-router";
import InfiniteTableContainer from "../../../v2InfiniteTable/InfiniteTableContainer";
import UserInfoTableComponent from "common/UserInfoTableComponent";
import WorkflowTableCTA from "../../../workflow/components/WorkflowTableCTA/WorkflowTableCTA";
import CreatedAt from "../../../workflow/components/CreatedAt";
import Status from "../../../workflow/components/Status";
import WorkflowsName from "../../../workflow/components/WorkflowName";
import {
	getAllCompletedMiniplaybooks,
	getAppPlaybookData,
	getAppPlaybookRules,
	getAppRunsFilters,
	getAppRulesFilters,
	searchAppPlaybookRules,
	searchPlaybookData,
	getAllAppPlaybooksV2,
	getAllAppRulesV2,
} from "./service/automation-api";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import AppPlayBooks from "./appPlaybooks/appPlaybooks";
import AppPlaybookRules from "./appPlaybookRules/appPlaybookRules";
import { RunLogs } from "./view_log/RunLogs";
import { Button } from "UIComponents/Button/Button";
import { useDispatch } from "react-redux";
import {
	checkAndFetchAllV2Data,
	clearAllV2DataCache,
} from "modules/v2InfiniteTable/redux/v2infinite-action";

import arrowdown from "../../../../assets/arrowdown.svg";
import arrowup from "../../../../assets/arrowup.svg";
import linkArrow from "assets/linkArrow.svg";
import infoCircle from "assets/licenses/infocircle.svg";
import info from "../../../../assets/icons/info-orange.svg";
import edit from "assets/icons/edit.svg";
import optionsButton from "../../../../assets/optionsButton.svg";
import playbookPlay from "assets/users/playbookPlay.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import WorkflowNameCondition from "modules/workflow/components/WorkflowNameCondition";
import MoreInfo from "modules/workflow/containers/MoreInfo";
import {
	appPlaybooksMoreInfoCol,
	automationRulesMoreInfoCol,
	automationTableTabs,
	automationv2TableEntityConstants,
} from "./automationTablesConstants";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import DeleteWorkflowModal from "modules/workflow/components/DeleteWorkflowModal/DeleteWorkflowModal";
import { CreatePlaybook } from "./appPlaybooks/playbooks/createPlaybook";
import UnpublishPlaybookModal from "modules/workflow/components/UnpublishPlaybookModal/UnpublishPlaybookModal";
import { getAppRule, resetAppRule } from "./redux/action";
import { CreateRule } from "./appPlaybookRules/createRule";
import {
	getAutomationsPlaybookIdFilterMetaData,
	getAutomationsRuleIdFilterMetaData,
} from "./utils/automation.util";
import ViewPlaybookModal from "modules/workflow/components/ViewPlaybookModal/ViewPlaybookModal";
import { clearWorkflow } from "./redux/appPlaybook";
import DeleteAutomationCell from "./DeleteAutomationCell";
import TotalActions from "./TotalActions";
import ViewRun from "./ViewRun";
import EditPlaybookCell from "./EditPlaybookCell";
import EditRuleCell from "./EditRuleCell";
import NotifyOnTrigger from "modules/workflow/containers/NotifyOnTrigger";
import blueplay from "assets/workflow/blueplay.svg";
import rightarrow from "assets/auditlogs/rightarrow.svg";
import downarrow from "assets/auditlogs/downarrow.svg";
import RuleStatus from "./RuleStatus";
import { getAllPlaybookWorkflowsPropertiesListV2 } from "modules/workflow/service/api";
import CompileWorkflow from "modules/workflow/components/CompileWorkflow/CompileWorkflow";
import { clearWorkflowLogs } from "modules/workflow/redux/workflow";
import { defaultReqBody } from "common/infiniteTableUtil";
import { clearAllV2DataCache as clearPaginatedTableData } from "modules/v2PaginatedTable/redux/v2paginated-action";
import { filtersRequestBodyGenerator } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { openModal } from "reducers/modal.reducer";

export function Automation({ app }) {
	const [selectedTab, setSelectedTab] = useState(
		automationTableTabs.appPlaybooksProvision
	);
	const [type, setType] = useState("#app_playbooks");
	const [folderType, setFolderType] = useState("provision");
	const [showdescription, setshowdescription] = useState([]);
	const [clickedOnAppPlaybookDropdown, setClickedOnAppPlaybookDropdown] =
		useState(true);
	const [clickedViewRun, setClickedViewRun] = useState(false);
	const [clickedOnAutomationRules, setClickedOnAutomationRules] =
		useState(true);
	const [row, setRow] = useState("");
	const [selectedWorkflow, setSelectedWorkflow] = useState("");
	const [showViewLogModal, setShowViewLogModal] = useState(false);

	const [showUnpublishPlaybookModal, setShowUnpublishPlaybookModal] =
		useState(false);
	const [showDeleteWorkflowModal, setShowDeleteWorkflowModal] =
		useState(false);
	const [showCreatePlaybook, setShowCreatePlaybook] = useState(false);
	const [showRuleEdit, setShowRuleEdit] = useState(false);
	const [showCreateRulePlaybook, setShowCreateRulePlaybook] = useState(false);
	const [openActionModal, setActionOpenModal] = useState(false);
	const [saveRule, setSaveRule] = useState(false);
	const [showCreateRule, setShowCreateRule] = useState(false);
	const [showCompileWorkflowModal, setshowCompileWorkflowModal] =
		useState(false);
	const [v2Type, setV2Type] = useState("");

	const dispatch = useDispatch();
	const history = useHistory();
	const query = useSelector((state) => state.router.location.query);
	let currentappId = window.location.pathname.split("/")[2];

	useEffect(() => {
		if (query.selectedTab === "runs") setSelectedTab("runs");
	}, [query]);

	useEffect(() => {
		return function cleanup() {
			dispatch(
				clearAllV2DataCache(automationTableTabs.appPlaybooksProvision)
			);
			dispatch(
				clearAllV2DataCache(automationTableTabs.appPlaybooksDeprovision)
			);
			dispatch(
				clearAllV2DataCache(
					automationTableTabs.appPlaybooksAppManagement
				)
			);
			dispatch(
				clearAllV2DataCache(
					automationTableTabs.automationRulesProvision
				)
			);
			dispatch(
				clearAllV2DataCache(
					automationTableTabs.automationRulesDeprovision
				)
			);
			dispatch(
				clearAllV2DataCache(
					automationTableTabs.automationRulesAppManagement
				)
			);
			dispatch(clearAllV2DataCache("miniplaybooks"));
		};
	}, []);

	useEffect(() => {
		if (
			selectedTab === automationTableTabs.appPlaybooksProvision ||
			selectedTab === automationTableTabs.appPlaybooksDeprovision ||
			selectedTab === automationTableTabs.appPlaybooksAppManagement
		)
			setType("#app_playbooks");
		else setType("#app_rules");
	}, [selectedTab]);

	useEffect(() => {
		if (selectedTab !== "runs") setClickedViewRun(false);
	}, [selectedTab]);

	useEffect(() => {
		const params = new URLSearchParams({ selectedTab: selectedTab });
		history.push({
			hash: "#automation",
			search: params.toString(),
		});
	}, [selectedTab]);

	const viewLogModal = (row) => {
		setSelectedWorkflow(row);
		setShowViewLogModal(true);
	};

	const showcreatePlaybookModal = (handleRefresh) => {
		setRow("");
		setShowCreatePlaybook(true);
	};

	const clickedOnPlaybookRow = (el) => {
		dispatch(clearWorkflow());
		setRow(el);
		setActionOpenModal(true);
	};

	const loadMoreInfo = (dataRow) => {
		return (
			<MoreInfo
				id={dataRow?._id || dataRow?.workflow_id}
				showdescription={showdescription}
				columns={
					type && type === "#app_playbooks"
						? appPlaybooksMoreInfoCol
						: type === "#app_rules"
						? automationRulesMoreInfoCol
						: null
				}
				columnsMapper={
					type && type === "#app_playbooks"
						? appPlaybooksMoreInfoColMap
						: type === "#app_rules"
						? automationRulesMoreInfoColMap
						: null
				}
				dataRow={dataRow}
				parentHeader={selectedTab === "#playbooks" ? "10" : "9"}
			/>
		);
	};

	const showeventdescription = (row) => {
		let items = [...showdescription];
		let index = items.indexOf(row?._id || row?.workflow_id);
		if (index > -1) {
			items.splice(index, 1);
		} else {
			items.push(row?._id || row?.workflow_id);
		}
		setshowdescription(items);
	};

	const showcreateRuleModal = (folderType) => {
		setRow("");
		setShowCreateRulePlaybook(true);
	};

	const showEditRuleModel = (key, rule_id) => {
		setShowRuleEdit(true);
		setRow("");
		setShowCreateRulePlaybook(true);
		dispatch(getAppRule(rule_id));
	};

	const closeModal = () => {
		setShowCreateRulePlaybook(false);
		dispatch(resetAppRule());
		setShowRuleEdit(false);
	};

	const getColumnsMapperRun = (handleRefresh) => {
		return {
			user: {
				dataField: "user_name",
				text: "User",
				formatter: (data, row) => {
					return (
						<div className="workflows-user-info" key={row._id}>
							<UserInfoTableComponent
								profile_img={row?.user_profile}
								user_name={row?.user_name}
								user_id={row?.user_id}
							/>
						</div>
					);
				},
			},
			workflow: {
				dataField: "name",
				text: "Workflow Name",
				formatter: (data, row) => {
					return (
						<div className="workflows-workflow-name">
							<WorkflowsName
								title={row?.name}
								allApps={
									row?.apps && row.apps.length ? row.apps : []
								}
								totalActionsCount={
									row?.workflow_action_count
										? row.workflow_action_count
										: 0
								}
								total_apps={row?.app_count}
								total_actions={row?.completed_actions_count}
							/>
						</div>
					);
				},
			},
			run_details: {
				dataField: "run_details",
				text: "Run details",
				formatter: (data, row) => (
					<div className="workflows-workflow-run-details">
						<CreatedAt
							text={row?.run_on}
							user_name={row?.run_by_user_name}
							source={row?.source}
							rule_name={row?.rule_name}
						/>
					</div>
				),
			},
			status: {
				dataField: "status",
				text: "Status",
				formatter: (data, row) => (
					<div className="workflows-workflow-status">
						<Status
							completed={row?.completed_actions_count}
							failed={row?.failed_actions_count}
							pending={row?.pending_actions_count}
							text={row?.status}
						/>
					</div>
				),
			},
			created_by: {
				dataField: "created_by",
				text: "Created By",
				formatter: (data, row) => (
					<div className="workflows-workflow-created-by">
						<Status
							text={row?.created_by_user_name}
							source={row?.source}
						/>
					</div>
				),
			},
			view_log: {
				formatter: (data, row) => {
					return (
						<Button
							type="link"
							className="text-decoration-none font-13"
							onClick={() => viewLogModal(row)}
						>
							View log
						</Button>
					);
				},
			},
		};
	};
	const getColumnsMapperAppPlaybooks = (handleRefresh) => {
		return {
			arrow: {
				dataField: "",
				text: "",
				formatter: (data, row) => (
					<div
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							showeventdescription(row);
						}}
						className="cursor-pointer d-flex justify-content-center"
					>
						<img
							className="cursor-pointer"
							src={
								showdescription.includes(
									row?.workflow_id || row?._id
								)
									? downarrow
									: rightarrow
							}
							alt=""
						/>
					</div>
				),
			},
			workflow: {
				dataField: "workflow",
				text: `${
					selectedTab === automationTableTabs.appPlaybooksProvision
						? "Provisioning Playbooks"
						: selectedTab ===
						  automationTableTabs.appPlaybooksDeprovision
						? "Deprovisioning Playbooks"
						: "App Management Playbooks"
				}`,
				formatter: (data, row) => (
					<OverlayTrigger
						placement="top"
						overlay={
							<Tooltip>
								{row?.workflow_name || row?.name || ""}
							</Tooltip>
						}
					>
						<h3 className="black-1 font-14 mb-0 mt-2 text-capitalize truncate_15vw pl-3">
							{row?.workflow_name
								? row?.workflow_name?.charAt(0)?.toUpperCase() +
								  row?.workflow_name?.slice(1)
								: row?.name?.charAt(0)?.toUpperCase() +
								  row?.name?.slice(1)}
						</h3>
					</OverlayTrigger>
				),
			},
			status: {
				dataField: "status",
				text: "Status",
				formatter: (data, row) => (
					<div className="d-flex flex-1 ml-2">
						{row.is_published ? (
							<p className="font-10 grey-1 mb-0">
								<span
									style={{
										color: "#5FCF64",
										fontSize: "10px",
										fontWeight: "600",
									}}
								>
									PUBLISHED
								</span>
							</p>
						) : (
							<OverlayTrigger
								placement="top"
								overlay={
									<Tooltip>
										{
											"Playbook is not published or have incomplete setup"
										}
									</Tooltip>
								}
							>
								<p
									style={{
										backgroundColor:
											"rgba(255, 177, 105, 0.1)",
										borderRadius: "4px",
									}}
									className="font-10 grey-1 mb-0"
								>
									<img
										height={"16px"}
										width={"16px"}
										className="mr-1"
										alt=""
										src={info}
									/>
									<span
										style={{
											color: "#ffb169",
											fontSize: "10px",
											fontWeight: "600",
										}}
									>
										Setup Required
									</span>
								</p>
							</OverlayTrigger>
						)}
					</div>
				),
			},
			total_actions: {
				dataField: "total_actions",
				text: "Total Actions",
				formatter: (data, row) => <TotalActions playbook={row} />,
			},
			last_used: {
				dataField: "last_used",
				text: "Last Used",
				formatter: (data, row) => (
					<div className="d-flex flex-column justify-content-center ml-2">
						<CreatedAt text={row?.last_used} showName={false} />
					</div>
				),
			},
			runs: {
				dataField: "runs",
				text: "Runs",
				formatter: (data, row) => {
					return (
						<ViewRun
							onClicked={() => {
								setClickedViewRun(true);
								history.push(
									`/applications/${
										app?.app_id
									}?metaData=${getAutomationsPlaybookIdFilterMetaData(
										row?.workflow_id || row?._id
									)}&selectedTab=runs#automation`
								);
							}}
						/>
					);
				},
			},
			run_playbook: {
				dataField: "",
				text: "",
				formatter: (data, row) => {
					return (
						row.is_published && (
							<OverlayTrigger
								placement="bottom"
								overlay={<Tooltip>{"Run"}</Tooltip>}
							>
								<img
									className="cursor-pointer"
									src={blueplay}
									alt=""
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										clickedOnPlaybookRow(row);
									}}
								/>
							</OverlayTrigger>
						)
					);
				},
			},
			edit: {
				dataField: "",
				text: "",
				formatter: (data, row) => (
					<EditPlaybookCell
						handleRefresh={handleRefresh}
						playbook={row}
						folderType={folderType}
					/>
				),
			},
			options: {
				dataField: "",
				text: "",
				formatter: (data, row) => (
					<DeleteAutomationCell
						workflow={row}
						handleRefresh={handleRefresh}
						type={type}
						id={row?.workflow_id || row?._id}
						name={row?.workflow_name || row?.name}
						text={"Delete Playbook"}
					/>
				),
			},
		};
	};
	const getColumnsMapperAutomationRules = (handleRefresh) => {
		return {
			rule: {
				dataField: "rule",
				text: `${
					selectedTab === automationTableTabs.automationRulesProvision
						? "Provisioning Rules"
						: selectedTab ===
						  automationTableTabs.automationRulesDeprovision
						? "Deprovisioning Rules"
						: "App Management Rules"
				}`,
				formatter: (data, row) => {
					return (
						<WorkflowNameCondition
							workflow={row}
							app={app}
							type={type}
						/>
					);
				},
			},
			status: {
				dataField: "status",
				text: "Status",
				formatter: (data, row) => (
					<RuleStatus rule={row} handleRefresh={handleRefresh} />
				),
			},
			runs: {
				dataField: "runs",
				text: "Runs",
				formatter: (data, row) => {
					return (
						<ViewRun
							onClicked={() => {
								setClickedViewRun(true);
								history.push(
									`/applications/${
										app?.app_id
									}?metaData=${getAutomationsRuleIdFilterMetaData(
										row?.workflow_id || row?._id
									)}&selectedTab=runs#automation`
								);
							}}
						/>
					);
				},
			},
			last_run: {
				dataField: "last_run",
				text: "Last Run",
				formatter: (data, row) => (
					<div className="d-flex flex-column justify-content-center ml-2">
						<CreatedAt text={row?.last_used} showName={false} />
					</div>
				),
			},
			created_by: {
				dataField: "created_by",
				text: "Created On",
				formatter: (data, row) => (
					<div className="d-flex flex-column justify-content-center ml-2">
						<CreatedAt text={row?.created_at} showName={false} />
					</div>
				),
			},
			arrow: {
				dataField: "",
				text: "",
				formatter: (data, row) => (
					<div
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							showeventdescription(row);
						}}
						className="cursor-pointer d-flex justify-content-center"
					>
						<img
							className="cursor-pointer"
							src={
								showdescription.includes(row._id)
									? downarrow
									: rightarrow
							}
							alt=""
						/>
					</div>
				),
			},
			options: {
				dataField: "",
				text: "",
				formatter: (data, row) => (
					<DeleteAutomationCell
						workflow={row}
						handleRefresh={handleRefresh}
						type={type}
						id={row?._id}
						name={row?.name}
						text={"Delete Rule"}
					/>
				),
			},

			edit: {
				dataField: "",
				text: "",
				formatter: (data, row) => {
					return row?.audit_log_event &&
						row?.audit_log_event ===
							"user_application_role_changed" ? null : (
						<EditRuleCell
							handleRefresh={handleRefresh}
							rule={row}
							app={app}
							folderType={folderType}
						/>
					);
				},
			},
		};
	};
	const appPlaybooksMoreInfoColMap = {
		created_on_date: {
			dataField: "created_at",
			text: "Created On",
			formatter: (data, row) => (
				<div className="d-flex flex-column justify-content-center more-info-table-value-text">
					<CreatedAt text={row?.created_at} showName={false} />
				</div>
			),
		},
		created_by_name: {
			dataField: "created_by_user_name",
			text: "Created By",
			formatter: (data, row) => (
				<div className="more-info-table-value-text">
					{row?.created_by_user_name || "N/A"}
				</div>
			),
		},
		last_published_by_name: {
			dataField: "last_published_by_name",
			text: "Last Published By",
			formatter: (data, row) => (
				<div className="more-info-table-value-text">
					{row?.published_by_user_name || "N/A"}
				</div>
			),
		},
	};
	const automationRulesMoreInfoColMap = {
		created_by_name: {
			dataField: "created_by_name",
			text: "Created By",
			formatter: (data, row) => (
				<div className="more-info-table-value-text">
					{row?.created_by?.name || "N/A"}
				</div>
			),
		},
		department_names: {
			dataField: "department_names",
			text: "Department",
			formatter: (data, row) => (
				<div className="more-info-table-value-text">
					{row?.published_by_user_name || "N/A"}
				</div>
			),
		},
		tags: {
			dataField: "tags",
			text: "Tags",
			formatter: (data, row) => (
				<div className="more-info-table-value-text">
					{row?.published_by_user_name || "N/A"}
				</div>
			),
		},
		notify_on_trigger: {
			dataField: "notify_on_trigger",
			text: "Notify On Trigger",
			formatter: (data, row) => (
				<div className="more-info-table-value-text">
					<NotifyOnTrigger rule={row} />
				</div>
			),
		},
		approver: {
			dataField: "approver_name",
			text: "Approver",
			formatter: (data, row) => (
				<div className="more-info-table-value-text">N/A </div>
			),
		},
	};

	const handleModel = {
		sayOpenToActionModal: (e, handleRefresh, row) => {
			!openActionModal && setActionOpenModal(true);
		},
		sayCloseToActionModal: (e, handleRefresh, row) => {
			openActionModal && setActionOpenModal(false);
		},
		sayOpenToViewModal: (e, handleRefresh, row) => {
			!openViewModal && setOpenViewModal(true);
		},
		sayCloseToViewModal: (e, handleRefresh, row) => {
			openViewModal && setOpenViewModal(false);
		},

		sayOpenToUseTemplateModal: (e, handleRefresh, row) => {
			!openUseTemplateModal && setUseTemplateOpenModal(true);
			setSelectedWorkflow(row);
		},
		sayCloseToUseTemplateModal: (e, handleRefresh, row) => {
			openUseTemplateModal && setUseTemplateOpenModal(false);
		},
		sayOpenToDeleteRuleModal: (e, handleRefresh, row) => {
			!showDeleteRuleModal && setShowDeleteRuleModal(true);
		},
		sayOpenToDuplicatePlaybookModal: (e, handleRefresh, row) => {
			setShowDuplicatePlaybookModal(true);
		},
		sayCloseToDuplicatePlaybookModal: (e, handleRefresh, row) => {
			setShowDuplicatePlaybookModal(false);
		},
		sayOpenToEditPublishedPlaybook: (e, handleRefresh, row) => {
			setRow(row);
			!showUnpublishPlaybookModal && setShowUnpublishPlaybookModal(true);
		},
		sayCloseToEditPublishedPlaybook: (e, handleRefresh, row) => {
			showUnpublishPlaybookModal && setShowUnpublishPlaybookModal(false);
			handleRefresh();
		},
	};

	return (
		<>
			<div className="z__page z__integrations">
				<div className="container-fluid">
					<hr className="m-0" />
					<div className="row">
						<div
							style={{
								backgroundColor: "rgba(245, 246, 249, 1)",
								minHeight: "100vh",
							}}
							className="col-md-2 col-lg-2 p-2 pl-2"
						>
							<div className="z_i_categories">
								<div className="pb-1" />
								<ul
									style={{
										listStyleType: "none",
										padding: 0,
									}}
								>
									<li
										className={`pointer font-14 black-1 mt-1 p-2`}
										onClick={() => {
											setClickedOnAppPlaybookDropdown(
												!clickedOnAppPlaybookDropdown
											);
											if (clickedOnAppPlaybookDropdown) {
												setSelectedTab(
													automationTableTabs.appPlaybooksProvision
												);
												setFolderType("provision");
											}
										}}
									>
										<div
											className={`d-flex justify-content-between ${
												clickedOnAppPlaybookDropdown
													? "font-weight-bold"
													: "font-weight-normal"
											}`}
										>
											appPlaybooks
											<img
												src={
													clickedOnAppPlaybookDropdown
														? arrowup
														: arrowdown
												}
												alt=""
											/>
										</div>
									</li>
									{clickedOnAppPlaybookDropdown && (
										<>
											<li
												className={`pointer font-14 black-1 ml-2 mt-1 p-2 ${
													selectedTab ===
													automationTableTabs.appPlaybooksProvision
														? "active"
														: ""
												}`}
												onClick={() => {
													setSelectedTab(
														automationTableTabs.appPlaybooksProvision
													);
													setFolderType("provision");
												}}
											>
												Provisioning
											</li>
											<li
												className={`pointer font-14 black-1 ml-2 mt-1 p-2 ${
													selectedTab ===
													automationTableTabs.appPlaybooksDeprovision
														? "active"
														: ""
												}`}
												onClick={() => {
													setSelectedTab(
														automationTableTabs.appPlaybooksDeprovision
													);
													setFolderType(
														"deprovision"
													);
												}}
											>
												Deprovisioning
											</li>
											<li
												className={`pointer font-14 black-1 ml-2 mt-1 p-2 ${
													selectedTab ===
													automationTableTabs.appPlaybooksAppManagement
														? "active"
														: ""
												}`}
												onClick={() => {
													setSelectedTab(
														automationTableTabs.appPlaybooksAppManagement
													);
													setFolderType(
														"app_management"
													);
												}}
											>
												App Management
											</li>
										</>
									)}

									<li
										className={`pointer font-14 black-1 mt-1 p-2`}
										onClick={() => {
											setClickedOnAutomationRules(
												!clickedOnAutomationRules
											);
											if (clickedOnAutomationRules) {
												setSelectedTab(
													automationTableTabs.automationRulesProvision
												);
												setFolderType("provision");
											}
										}}
									>
										<div
											className={`d-flex justify-content-between ${
												clickedOnAutomationRules
													? "font-weight-bold"
													: "font-weight-normal"
											}`}
										>
											Automation Rules
											<img
												src={
													clickedOnAutomationRules
														? arrowup
														: arrowdown
												}
												alt=""
											/>
										</div>
									</li>
									{clickedOnAutomationRules && (
										<>
											<li
												className={`pointer font-14 black-1 ml-2 mt-1 p-2 ${
													selectedTab ===
													automationTableTabs.automationRulesProvision
														? "active"
														: ""
												}`}
												onClick={() => {
													setSelectedTab(
														automationTableTabs.automationRulesProvision
													);
													setFolderType("provision");
												}}
											>
												Provisioning
											</li>
											<li
												className={`pointer font-14 black-1 ml-2 mt-1 p-2 ${
													selectedTab ===
													automationTableTabs.automationRulesDeprovision
														? "active"
														: ""
												}`}
												onClick={() => {
													setSelectedTab(
														automationTableTabs.automationRulesDeprovision
													);
													setFolderType(
														"deprovision"
													);
												}}
											>
												Deprovisioning
											</li>
											<li
												className={`pointer font-14 black-1 ml-2 mt-1 p-2 ${
													selectedTab ===
													automationTableTabs.automationRulesAppManagement
														? "active"
														: ""
												}`}
												onClick={() => {
													setSelectedTab(
														automationTableTabs.automationRulesAppManagement
													);
													setFolderType(
														"app_management"
													);
												}}
											>
												App Management
											</li>
										</>
									)}
									<li
										className={`pointer font-14 black-1 mt-1 p-2 font-weight-bold ${
											selectedTab ===
											automationTableTabs.runs
												? "active"
												: ""
										}`}
										onClick={() => {
											setSelectedTab(
												automationTableTabs.runs
											);
										}}
									>
										Runs
									</li>
								</ul>
								<hr />
							</div>
						</div>
						<div className="col-md-10 col-lg-10">
							{/* //TODO: */}
							{selectedTab ===
								automationTableTabs.appPlaybooksProvision && (
								<>
									<InfiniteTableContainer
										columnsMapper={
											getColumnsMapperAppPlaybooks
										}
										v2TableEntity={
											automationTableTabs.appPlaybooksProvision
										}
										v2SearchFieldId="name"
										v2SearchFieldName="Workflow Name"
										getAPI={(
											reqBody,
											pageNo,
											row,
											v2Entity,
											getAPI,
											searchReqParams
										) =>
											getAllAppPlaybooksV2(
												folderType,
												pageNo,
												row,
												reqBody,
												currentappId
											)
										}
										searchAPI={getAllAppPlaybooksV2}
										propertyListAPI={
											getAllPlaybookWorkflowsPropertiesListV2
										}
										keyField="_id"
										onAddClick={(handleRefresh) => {
											dispatch(
												openModal("createPlaybook", {
													handleRefreshTable:
														handleRefresh,
													onCloseModal: () =>
														setShowCreatePlaybook(
															false
														),
													folderType: folderType,
													template: row,
												})
											);
										}}
										hasBulkEdit={false}
										hideColumnsButton={true}
										hasExpandedRow={true}
										loadexpandedRowComponent={loadMoreInfo}
										chipText="Provisioning appPlaybooks"
										resetFilter={true}
									/>
								</>
							)}
							{selectedTab ===
								automationTableTabs.appPlaybooksDeprovision && (
								<>
									<InfiniteTableContainer
										columnsMapper={
											getColumnsMapperAppPlaybooks
										}
										v2TableEntity={
											automationTableTabs.appPlaybooksDeprovision
										}
										v2SearchFieldId="name"
										v2SearchFieldName="Workflow Name"
										getAPI={(
											reqBody,
											pageNo,
											row,
											v2Entity,
											getAPI,
											searchReqParams
										) =>
											getAllAppPlaybooksV2(
												folderType,
												pageNo,
												row,
												reqBody,
												currentappId
											)
										}
										searchAPI={getAllAppPlaybooksV2}
										propertyListAPI={
											getAllPlaybookWorkflowsPropertiesListV2
										}
										keyField="_id"
										onAddClick={(handleRefresh) => {
											dispatch(
												openModal("createPlaybook", {
													handleRefreshTable:
														handleRefresh,
													onCloseModal: () =>
														setShowCreatePlaybook(
															false
														),
													folderType: folderType,
													template: row,
												})
											);
										}}
										hasBulkEdit={false}
										hideColumnsButton={true}
										hasExpandedRow={true}
										loadexpandedRowComponent={loadMoreInfo}
										chipText="Deprovisioning appPlaybooks"
										resetFilter={true}
									/>
								</>
							)}
							{selectedTab ===
								automationTableTabs.appPlaybooksAppManagement && (
								<>
									<InfiniteTableContainer
										columnsMapper={
											getColumnsMapperAppPlaybooks
										}
										v2TableEntity={
											automationTableTabs.appPlaybooksAppManagement
										}
										v2SearchFieldId="name"
										v2SearchFieldName="Workflow Name"
										getAPI={(
											reqBody,
											pageNo,
											row,
											v2Entity,
											getAPI,
											searchReqParams
										) =>
											getAllAppPlaybooksV2(
												folderType,
												pageNo,
												row,
												reqBody,
												currentappId
											)
										}
										searchAPI={getAllAppPlaybooksV2}
										propertyListAPI={
											getAllPlaybookWorkflowsPropertiesListV2
										}
										keyField="_id"
										onAddClick={(handleRefresh) => {
											dispatch(
												openModal("createPlaybook", {
													handleRefreshTable:
														handleRefresh,
													onCloseModal: () =>
														setShowCreatePlaybook(
															false
														),
													folderType: folderType,
													template: row,
												})
											);
										}}
										hasBulkEdit={false}
										hideColumnsButton={true}
										hasExpandedRow={true}
										loadexpandedRowComponent={loadMoreInfo}
										chipText="App Management appPlaybooks"
										resetFilter={true}
									/>
								</>
							)}

							{/* TODO: */}
							{selectedTab ===
								automationTableTabs.automationRulesProvision && (
								<>
									<InfiniteTableContainer
										columnsMapper={
											getColumnsMapperAutomationRules
										}
										v2TableEntity={
											automationTableTabs.automationRulesProvision
										}
										v2SearchFieldId="name"
										v2SearchFieldName="Workflow Name"
										getAPI={(
											reqBody,
											pageNo,
											row,
											v2Entity,
											getAPI,
											searchReqParams
										) =>
											getAllAppRulesV2(
												folderType,
												pageNo,
												row,
												reqBody,
												currentappId
											)
										}
										searchAPI={getAllAppRulesV2}
										propertyListAPI={getAppRulesFilters}
										keyField="_id"
										onAddClick={(handleRefresh) => {
											dispatch(
												openModal("createRule", {
													handleRefreshTable:
														handleRefresh,
													onCloseModal: closeModal,
													folderType: folderType,
													entity: "application",
													showEdit: showRuleEdit,
													setShowEdit:
														setShowRuleEdit,
													setSaveRule: setSaveRule,
													application: app,
												})
											);
										}}
										hasBulkEdit={false}
										hideColumnsButton={true}
										hasExpandedRow={true}
										loadexpandedRowComponent={loadMoreInfo}
										chipText="Provisioning Automation Rules"
										resetFilter={true}
									/>
								</>
							)}
							{selectedTab ===
								automationTableTabs.automationRulesDeprovision && (
								<>
									<InfiniteTableContainer
										columnsMapper={
											getColumnsMapperAutomationRules
										}
										v2TableEntity={
											automationTableTabs.automationRulesDeprovision
										}
										v2SearchFieldId="name"
										v2SearchFieldName="Workflow Name"
										getAPI={(
											reqBody,
											pageNo,
											row,
											v2Entity,
											getAPI,
											searchReqParams
										) =>
											getAllAppRulesV2(
												folderType,
												pageNo,
												row,
												reqBody,
												currentappId
											)
										}
										searchAPI={getAllAppRulesV2}
										propertyListAPI={getAppRulesFilters}
										keyField="_id"
										onAddClick={(handleRefresh) => {
											dispatch(
												openModal("createRule", {
													handleRefreshTable:
														handleRefresh,
													onCloseModal: closeModal,
													folderType: folderType,
													entity: "application",
													showEdit: showRuleEdit,
													setShowEdit:
														setShowRuleEdit,
													setSaveRule: setSaveRule,
													application: app,
												})
											);
										}}
										hasBulkEdit={false}
										hideColumnsButton={true}
										hasExpandedRow={true}
										loadexpandedRowComponent={loadMoreInfo}
										chipText="Deprovisioning Automation Rules"
										resetFilter={true}
									/>
								</>
							)}
							{selectedTab ===
								automationTableTabs.automationRulesAppManagement && (
								<>
									<InfiniteTableContainer
										columnsMapper={
											getColumnsMapperAutomationRules
										}
										v2TableEntity={
											automationTableTabs.automationRulesAppManagement
										}
										v2SearchFieldId="name"
										v2SearchFieldName="Workflow Name"
										getAPI={(
											reqBody,
											pageNo,
											row,
											v2Entity,
											getAPI,
											searchReqParams
										) =>
											getAllAppRulesV2(
												folderType,
												pageNo,
												row,
												reqBody,
												currentappId
											)
										}
										searchAPI={getAllAppRulesV2}
										propertyListAPI={getAppRulesFilters}
										keyField="_id"
										onAddClick={(handleRefresh) => {
											dispatch(
												openModal("createRule", {
													handleRefreshTable:
														handleRefresh,
													onCloseModal: closeModal,
													folderType: folderType,
													entity: "application",
													showEdit: showRuleEdit,
													setShowEdit:
														setShowRuleEdit,
													setSaveRule: setSaveRule,
													application: app,
												})
											);
										}}
										hasBulkEdit={false}
										hideColumnsButton={true}
										hasExpandedRow={true}
										loadexpandedRowComponent={loadMoreInfo}
										chipText="App Management Automation Rules"
										resetFilter={true}
									/>
								</>
							)}
							{selectedTab === automationTableTabs.runs && (
								<>
									<InfiniteTableContainer
										columnsMapper={getColumnsMapperRun}
										v2TableEntity="miniplaybooks"
										v2SearchFieldId="name"
										v2SearchFieldName="Workflow Name"
										getAPI={(
											reqBody,
											pageNo,
											row,
											v2Entity,
											getAPI,
											searchReqParams
										) =>
											getAllCompletedMiniplaybooks(
												reqBody,
												pageNo,
												row
											)
										}
										searchAPI={getAllCompletedMiniplaybooks}
										propertyListAPI={getAppRunsFilters}
										keyField="_id"
										hasBulkEdit={false}
										hideColumnsButton={true}
										hasExpandedRow={false}
										chipText="Runs"
										resetFilter={!clickedViewRun}
									/>
								</>
							)}

							{openActionModal && (
								<ViewPlaybookModal
									modalClass="workflows-modal"
									onCloseModal={() => {
										handleModel.sayCloseToActionModal();
										dispatch(clearWorkflow());
										dispatch(clearWorkflowLogs());
									}}
									openModal={openActionModal}
									workflowId={row?.workflow_id || row?._id}
									onUseTemplate={() => {
										handleModel.sayCloseToActionModal();
										handleModel.sayOpenToUseTemplateModal();
									}}
									buttonTitle="Use Playbook"
									title={row?.workflow_name || row?.name}
									data={row}
									entity="appPlaybooks"
									onEditPublishedPlaybook={() => {
										handleModel.sayCloseToActionModal();
										handleModel.sayOpenToEditPublishedPlaybook();
									}}
									editPlaybook={(e) => {
										handleModel.sayCloseToActionModal();
										setShowCreatePlaybook(true);
									}}
									onshowCompileScreen={() => {
										handleModel.sayCloseToActionModal();
										setshowCompileWorkflowModal(true);
									}}
								/>
							)}
							{showCreatePlaybook && (
								<CreatePlaybook
									folderType={folderType}
									onCloseModal={() => {
										setShowCreatePlaybook(false);
									}}
									openModal={showCreatePlaybook}
									template={row}
								/>
							)}
							{showCompileWorkflowModal && (
								<CompileWorkflow
									openModal={showCompileWorkflowModal}
									modalClass="workflows-modal"
									entity="appPlaybooks"
									onCloseModal={() =>
										setshowCompileWorkflowModal(false)
									}
								/>
							)}
							{showViewLogModal && (
								<RunLogs
									workflowId={selectedWorkflow.workflow_id}
									runId={selectedWorkflow._id}
									openModal={showViewLogModal}
									onClose={(e) => setShowViewLogModal(false)}
								/>
							)}

							{showCreateRulePlaybook && (
								<CreateRule
									onCloseModal={closeModal}
									openModal={showCreateRulePlaybook}
									folderType={folderType}
									entity={"application"}
									showEdit={showRuleEdit}
									setShowEdit={setShowRuleEdit}
									setSaveRule={setSaveRule}
									application={app}
								/>
							)}
							{showUnpublishPlaybookModal && (
								<UnpublishPlaybookModal
									show={showUnpublishPlaybookModal}
									entity="appPlaybooks"
									onClose={() => {
										handleModel.sayCloseToEditPublishedPlaybook();
										setShowCreatePlaybook(true);
									}}
									onHide={() => {
										handleModel.sayCloseToEditPublishedPlaybook();
									}}
									data={row}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
