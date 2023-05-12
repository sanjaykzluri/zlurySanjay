import dragDrop from "assets/drag-drop.svg";
import beta from "assets/icons/beta.svg";
import { push } from "connected-react-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import ToggleSwitch from "react-switch";
import _ from "underscore";
import { defaults } from "../../../constants/defaults";
import { checkSpecialCharacters } from "../../../services/api/search";
import { client } from "../../../utils/client";
import { ACTION_TYPE } from "../../workflow/components/FiltersRenderer/redux";
import {
	automationRulesColumnsMapper,
	completedColumnsMapper,
	draftColumnsMapper,
	TAB_TYPES,
	templatesColumnsMapper,
} from "../../workflow/constants";
import {
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../workflow/constants/constant";
import "../../workflow/containers/Workflow/Workflow.css";
import {
	emptyTemplates,
	getAllCompletedWorkflows,
	getAllDrafts,
	getAllTemplates,
	getAutomationRules,
	getTopFiveDrafts,
	patchAutomationRuleStatus,
	searchAutomationRules,
	searchCompleted,
	searchDrafts,
	searchTemplates,
	TransformCompletedV2,
	updateAutomationRules,
	updateOrderOfAutomationRules,
	updateWorkflow,
} from "../../workflow/redux/workflow";
import {
	createWorkflowFromTemplate,
	getAllCompletedWorkflowsPropertiesListV2,
	getAllCompletedWorkflowsServiceV2,
	searchAutomationRulesService,
	searchDraftsService,
	searchTemplatesService,
} from "../../workflow/service/api";
import { TriggerIssue } from "../../../utils/sentry";
import TableHeader from "../../workflow/components/TabHeader/TableHeader";
import WorkflowsTable from "../../workflow/components/WorkflowsTable/WorkflowsTable";
import {
	defaultReqBody,
	WORFKFLOW_TYPE,
} from "../../workflow/constants/constant";

import add from "assets/icons/plus-white.svg";
import optionsButton from "assets/optionsButton.svg";
import ActionModal from "modules/workflow/components/ActionModal/ActionModal";
import Templates from "modules/workflow/components/Templates/Templates";
import { Loader } from "../../../common/Loader/Loader";
import RoleContext from "../../../services/roleContext/roleContext";
import { Button } from "../../../UIComponents/Button/Button";
import { Modal } from "../../../UIComponents/Modal/Modal";
import { debounce, isEmpty } from "../../../utils/common";
import { MONTH, UTCDateFormatter } from "../../../utils/DateUtility";
import DeleteWorkflowModal from "../../workflow/components/DeleteWorkflowModal/DeleteWorkflowModal";
import { FilterRenderingModal } from "../../workflow/components/FilterRenderingModal/FilterRenderingModal";
import SelectUserModal from "../../workflow/components/SelectUserModal/SelectUserModal";
import WorkflowTableCTA from "../../workflow/components/WorkflowTableCTA/WorkflowTableCTA";
import WorkflowOverview from "../../workflow/containers/WorkflowOverview/WorkflowOverview";
import { WorkflowModel } from "../../workflow/model/model";
import { clearListOfWorkflows } from "../../workflow/redux/workflow";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { setValueToLocalStorage } from "utils/localStorage";
import NewWorkflowsTable from "../../workflow/components/WorkflowsTable/NewWorkflowsTable.js";
import MoreInfo from "modules/workflow/containers/MoreInfo";
import NotifyOnTrigger from "modules/workflow/containers/NotifyOnTrigger";
import WorkflowNameCondition from "modules/workflow/components/WorkflowNameCondition";
import ViewRun from "modules/applications/components/automation/ViewRun";
import linkArrow from "assets/linkArrow.svg";
import rightarrow from "assets/auditlogs/rightarrow.svg";
import downarrow from "assets/auditlogs/downarrow.svg";
import blueplay from "assets/workflow/blueplay.svg";
import borderdedit from "assets/workflow/bordered-edit.svg";

function AutomationRulesTableNew() {
	const location = useLocation();
	const history = useHistory();
	const isMounted = useRef(false);
	const selectedTab = useSelector((state) => state.router.location.hash);
	const templatesDataset = useSelector((state) => state.workflows.templates);
	const completedDataset = useSelector((state) => state.workflows.completed);
	const draftsDataset = useSelector((state) => state.workflows.drafts);
	const automationRulesDataset = useSelector(
		(state) => state.workflows.automationRules
	);
	const overviewDraftsDataset = useSelector(
		(state) => state.workflows.overviewDrafts
	);
	const pathname = useSelector((state) => state.router.location.pathname);
	const query = useSelector((state) => state.router.location.query);
	const filtersRedux = useSelector((state) => state.filters);
	const cancelToken = useRef();
	const { enableBetaFeatures, partner } = useContext(RoleContext);
	//----------------------------------------------------
	const [data, setData] = useState([]);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [pageNo, setPageNo] = useState(0);
	const [searchQuery, setSearchQuery] = useState();
	const [refreshTable, setRefreshTable] = useState(false);
	const [metaData, setMetaData] = useState();
	const [shouldConcat, setShouldConcat] = useState(false);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [openActionModal, setActionOpenModal] = useState(false);
	const [openUseTemplateModal, setUseTemplateOpenModal] = useState(false);
	const [createNewWorflow, setCreateNewWorflow] = useState(false);
	const [creatingNewWorflowFromTemplate, setCreatingNewWorflowFromTemplate] =
		useState(false);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [selectedWorkflow, setSelectedWorkflow] = useState(null);
	const [workflow_details, setWorkflow_details] = useState([]);
	const workflow = useSelector((state) => state.workflows.workflow);
	const [workflowType, setWorkflowType] = useState(null);
	const dispatch = useDispatch();
	const [allowSearchQuery2RefreshTable, setAllowSearchQuery2RefreshTable] =
		useState(true);
	const [showPrivateBetaModal, setShowPrivateBetaModal] = useState(false);
	const [showDeleteWorkflowModal, setShowDeleteWorkflowModal] =
		useState(false);
	const [showStatusLoader, setShowStatusLoader] = useState(false);
	const [selectedRuleData, setSelectedRuleData] = useState(null);
	const [showDeleteRuleModal, setShowDeleteRuleModal] = useState(false);

	const [reqBody, setReqBody] = useState();
	const [propertyList, setPropertyList] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [showdescription, setshowdescription] = useState([]);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(query, reqBody);
			} catch {
				dispatch(
					push(`?metaData=${JSON.stringify(reqBody)}${selectedTab}`)
				);
			}
			setReqBody({ ...reqObj });
		} else if (!query.metaData) {
			dispatch({ type: ACTION_TYPE.RESET_FILTERS });
			setReqBody({ ...defaultReqBody });
		}
		handleRefresh();
	}, [query]);

	useEffect(() => {
		if (pathname) {
			setWorkflowType(pathname.split("/")[2]);
		}
		dispatch(clearListOfWorkflows()).then(() => {
			handleRefresh();
		});
		if (searchQuery) {
			setAllowSearchQuery2RefreshTable(false);
			setSearchQuery("");
		}
		// history.push(`${selectedTab}`);
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(query, reqBody);
			} catch {
				dispatch(
					push(`?metaData=${JSON.stringify(reqBody)}${selectedTab}`)
				);
			}
			setReqBody({ ...reqObj });
		} else if (!query.metaData) {
			dispatch({ type: ACTION_TYPE.RESET_FILTERS });
			setReqBody({ ...defaultReqBody });
		}
	}, [pathname]);

	useEffect(() => {
		if (pathname) {
			setWorkflowType(pathname.split("/")[2]);
		}
		handleRefresh();
		if (searchQuery) {
			setAllowSearchQuery2RefreshTable(false);
			setSearchQuery("");
		}
		// history.push(`${selectedTab}`);
	}, [selectedTab]);

	useEffect(() => {
		if (isMounted.current) {
			if (searchQuery) {
				setIsLoadingData(true);
				fetchData(selectedTab);
			} else {
				loadData(pageNo);
			}
		}
	}, [refreshTable]);

	useEffect(() => {
		if (isMounted.current) {
			if (searchQuery) {
				setIsLoadingData(true);
				fetchData(selectedTab);
			} else {
				if (pageNo > 0) {
					loadData(pageNo);
				}
			}
		}
	}, [pageNo]);

	useEffect(() => {
		let dataResponse = "";
		if (selectedTab === "#playbooks") {
			dataResponse = templatesDataset;
		} else if (selectedTab === "#completed") {
			dataResponse = completedDataset;
		} else if (selectedTab === "#drafts") {
			dataResponse = draftsDataset;
		} else if (selectedTab === "#rules") {
			dataResponse = automationRulesDataset;
		} else if (selectedTab === "#overview") {
			dataResponse = overviewDraftsDataset;
		}
		((dataResponse) => {
			if (dataResponse?.data.length < 1) {
				setIsLoadingData(false);
			}
			if (dataResponse) {
				if (dataResponse.data.length < defaults.MINIMUM_ROW) {
					setHasMoreData(false);
				} else {
					!hasMoreData && setHasMoreData(true);
				}
				let newData = shouldConcat
					? [...data, ...dataResponse.data]
					: dataResponse.data;
				setShouldConcat(false);

				setData(newData);
				setMetaData(dataResponse.meta);
				setIsLoadingData(false);
			}
			if (selectedTab === "#rules") {
				setShowStatusLoader(false);
				setSelectedRuleData(null);
			}
		})(dataResponse);
	}, [
		templatesDataset,
		completedDataset,
		draftsDataset,
		automationRulesDataset,
		overviewDraftsDataset,
	]);

	useEffect(() => {
		if (isMounted.current) {
			if (cancelToken.current) {
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			}
			if (searchQuery) {
				if (checkSpecialCharacters(searchQuery)) {
					setData([]);
					setMetaData({});
					setIsLoadingData(false);
					setHasMoreData(false);
				} else {
					reqBody.filter_by = [];
					query.metaData &&
						dispatch(
							push(
								`?metaData=${JSON.stringify(
									reqBody
								)}${selectedTab}`
							)
						);
					fetchData(selectedTab);
				}
			} else if (searchQuery === "") {
				reqBody.filter_by = [];
				handleRefresh();
				setReqBody(reqBody);
				reqBody.filter_by = [];
				query.metaData &&
					dispatch(
						push(
							`?metaData=${JSON.stringify(reqBody)}${selectedTab}`
						)
					);
			}
			// if (searchQuery) {
			// 	if (checkSpecialCharacters(searchQuery)) {
			// 		setData([]);
			// 		setMetaData({});
			// 		setIsLoadingData(false);
			// 		setHasMoreData(false);
			// 	} else {
			// 		fetchData(selectedTab);
			// 	}
			// } else {
			// 	if (allowSearchQuery2RefreshTable) {
			// 		handleRefresh();
			// 	}
			// }
		}
		setAllowSearchQuery2RefreshTable(true);
	}, [searchQuery]);

	useEffect(() => {
		isMounted.current = true;
		// if (!getValueFromLocalStorage("workflowBetaAgreed")) {
		// 	setShowPrivateBetaModal(true);
		// }
	}, []);

	const closePrivateBetaModal = () => {
		setShowPrivateBetaModal(false);
		setValueToLocalStorage("workflowBetaAgreed", true);
	};

	function handleResetFilters() {
		setSearchQuery();
		dispatch(clearListOfWorkflows()).then(() => {
			handleRefresh();
		});
	}
	const loadMoreInfo = (dataRow, selectedTab) => {
		return (
			<MoreInfo
				id={dataRow._id}
				showdescription={showdescription}
				columns={
					selectedTab === "#rules"
						? TAB_TYPES["apprequisition_rules"]?.moreInfoCol
						: TAB_TYPES[selectedTab]?.moreInfoCol
				}
				columnsMapper={
					selectedTab && selectedTab === "#drafts"
						? MoreInfoColMap.draftsMoreInfoColMap
						: selectedTab === "#playbooks"
						? MoreInfoColMap.templatesMoreInfoColMap
						: selectedTab === "#completed"
						? MoreInfoColMap.completedMoreInfoColMap
						: selectedTab === "#rules"
						? MoreInfoColMap.rulesMoreInfoColMap
						: null
				}
				dataRow={dataRow}
				parentHeader={selectedTab === "#playbooks" ? "10" : "9"}
			/>
		);
	};
	const showeventdescription = (row) => {
		let items = [...showdescription];
		let index = items.indexOf(row._id);
		if (index > -1) {
			items.splice(index, 1);
		} else {
			items.push(row._id);
		}
		setshowdescription(items);
	};
	const fetchData = (selectedTab) => {
		setData([]);
		setMetaData();
		cancelToken.current = client.CancelToken.source();
		if (checkSpecialCharacters(searchQuery, true)) {
			setHasMoreData(false);
		} else {
			setIsLoadingData(true);
			let promise = {};
			let type = handlePathname(pathname);
			if (selectedTab === "#drafts") {
				promise = searchDraftsService(
					type,
					searchQuery,
					cancelToken.current
				);
			} else if (selectedTab === "#playbooks") {
				dispatch(emptyTemplates());
				promise = searchTemplatesService(
					type,
					searchQuery,
					cancelToken.current
				);
			} else if (selectedTab === "#completed") {
				// promise = searchCompletedService(
				// 	type,
				// 	searchQuery,
				// 	cancelToken.current
				// );
				if (isEmpty(reqBody.filter_by) && searchQuery) {
					const searchObj = getSearchReqObj(
						searchQuery,
						"name",
						"Workflow Name"
					);
					reqBody.filter_by = [searchObj];
				}

				promise = getAllCompletedWorkflowsServiceV2(
					type,
					pageNo,
					reqBody
				);
			} else if (selectedTab === "#rules") {
				promise = searchAutomationRulesService(
					type,
					searchQuery,
					cancelToken.current
				);
			}
			promise
				.then((response) => {
					if (selectedTab === "#drafts") {
						dispatch(searchDrafts(response));
					} else if (selectedTab === "#playbooks") {
						dispatch(searchTemplates(response));
					} else if (selectedTab === "#completed") {
						let data = TransformCompletedV2(response);
						dispatch(
							searchCompleted({ meta: response?.meta, data })
						);
					} else if (selectedTab === "#rules") {
						dispatch(
							searchAutomationRules({
								meta: response?.meta,
								data: response?.data,
							})
						);
					}
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue(
							`Error when searching ${type} workflows within fetchData function`,
							error
						);

						onApiError();
					}
				});
		}
	};

	function handleRefresh(cleanMeta = true) {
		setData([]);
		setPageNo(0);
		setMetaData();
		setRefreshTable(!refreshTable);
		setHasMoreData(true);
		setShowErrorModal(false);
	}

	function handleLoadMore() {
		setShouldConcat(true);
		// if (isLoadingData) return;
		setPageNo((pageNo) => {
			return pageNo + 1;
		});
	}

	function onSort({ oldIndex, newIndex }) {
		setIsLoadingData(true);
		setData([]);
		dispatch(
			updateOrderOfAutomationRules({
				id: data[oldIndex]._id,
				currentOrder: data[oldIndex].priority_order,
				newOrder: data[newIndex].priority_order,
				type: data[oldIndex].tag,
			})
		);
	}

	async function onApiError() {
		setShowErrorModal(true);
		setData([]);
		setMetaData({});
		setIsLoadingData(false);
		setHasMoreData(false);
	}

	async function loadData(pageNo, reqObj) {
		setIsLoadingData(true);
		let type = handlePathname(pathname);
		// load data from redux
		if (selectedTab === "#playbooks") {
			dispatch(getAllTemplates(type, pageNo, onApiError));
		} else if (selectedTab === "#completed") {
			let data = { ...reqBody };
			if (reqObj) {
				data = reqObj;
			}
			dispatch(getAllCompletedWorkflows(type, pageNo, data, onApiError));
			if (propertyList.length === 0 || listOfColumns.length === 0) {
				getAllCompletedWorkflowsPropertiesListV2()
					.then((res) => {
						if (res != null) {
							if (
								res.data != null &&
								res.data.properties != null &&
								Array.isArray(res.data.properties)
							) {
								setPropertyList(res.data.properties);
								setListOfColumns(res.data.columns);
							} else {
								setPropertyList([]);
							}
						} else {
							setPropertyList([]);
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
		} else if (selectedTab === "#drafts") {
			dispatch(getAllDrafts(type, pageNo, onApiError));
		} else if (selectedTab === "#rules") {
			dispatch(getAutomationRules(type, pageNo, onApiError));
		} else if (selectedTab === "#overview") {
			dispatch(getTopFiveDrafts(type, onApiError));
		}
	}

	const handleModel = {
		sayOpenToDeleteWorkflowModal: (e) => {
			!showDeleteWorkflowModal && setShowDeleteWorkflowModal(true);
		},
		sayOpenToActionModal: (e, row) => {
			!openActionModal && setActionOpenModal(true);
		},
		sayCloseToActionModal: (e) => {
			openActionModal && setActionOpenModal(false);
		},
		sayOpenToUseTemplateModal: (e, row) => {
			!openUseTemplateModal && setUseTemplateOpenModal(true);
			setWorkflow_details(row);
		},
		sayCloseToUseTemplateModal: (e) => {
			openUseTemplateModal && setUseTemplateOpenModal(false);
		},
		sayOpenToDeleteRuleModal: (e) => {
			!showDeleteRuleModal && setShowDeleteRuleModal(true);
		},
	};

	const rowClickFunctions = {
		"#completed": (workflow) => {
			setSelectedWorkflow(workflow);
			history.push(
				`/workflow/${workflow.workflow_id}/runs/${workflow.workflow_runId}`
			);
		},
	};

	const handleStatusChange = (status, row) => {
		const data = { ...row, status: status ? "active" : "inactive" };
		setSelectedRuleData(row);
		setShowStatusLoader(true);
		dispatch(
			patchAutomationRuleStatus(data, status ? "active" : "inactive")
		);
	};

	const overriddenColumnsMappers = {
		templatesTable: {
			...templatesColumnsMapper,
			view_action: {
				dataField: "",
				text: "",
				formatter: (data, row) => (
					<div className="workflows-workflow-action">
						<WorkflowTableCTA
							title="View"
							onClick={(e) => {
								setSelectedWorkflow(row);
								handleModel.sayOpenToActionModal(row);
							}}
						/>
					</div>
				),
			},
			use_template_action: {
				dataField: "use_template_action",
				text: "",
				formatter: (data, row) => (
					<div className="workflows-workflow-action">
						<WorkflowTableCTA
							title="Use Playbook"
							onClick={(e) => {
								setSelectedWorkflow(row);
								handleModel.sayOpenToUseTemplateModal(e, row);
							}}
						/>
					</div>
				),
			},
			options: {
				dataField: "app_status",
				text: "",
				formatter: (data, row) => (
					<OverlayTrigger
						trigger="click"
						rootClose
						placement="bottom"
						overlay={
							<div className="options">
								<div
									className="template-option"
									onClick={() => {
										setSelectedWorkflow(row);
										handleModel.sayOpenToDeleteWorkflowModal();
									}}
								>
									Delete Playbook
								</div>
							</div>
						}
					>
						<div style={{ cursor: "pointer" }}>
							<img src={optionsButton} />
						</div>
					</OverlayTrigger>
				),
			},
		},

		draftsTable: {
			...draftColumnsMapper,
			run_action: {
				dataField: "app_status",
				text: "",
				formatter: (data, row) => (
					<div className="workflows-workflow-action">
						<WorkflowTableCTA
							title="Edit"
							onClick={(e) => {
								history.push(
									`/apprequisition/${row.workflow_id}#recommended`
								);
							}}
						/>
					</div>
				),
			},
			options: {
				dataField: "app_status",
				text: "",
				formatter: (data, row) => (
					<Dropdown
						toggler={<img src={optionsButton} />}
						options={[
							{
								label: "Delete Draft",
								onClick: () => {
									setSelectedWorkflow(row);
									handleModel.sayOpenToDeleteWorkflowModal();
								},
							},
						]}
						optionFormatter={(option) => option.label}
						onOptionSelect={(option) => option.onClick()}
						right={0}
					/>
				),
			},
		},

		completedTable: {
			...completedColumnsMapper,
			view_log_action: {
				dataField: "view_log_action",
				text: "",
				formatter: (data, row) => {
					return (
						<div className="workflows-workflow-action">
							<WorkflowTableCTA
								title="View Log"
								onClick={(e) => {
									history.push(
										`/workflow/${row.workflow_id}/runs/${row._id}`
									);
								}}
							/>
						</div>
					);
				},
			},
		},

		automationRulesTable: {
			...automationRulesColumnsMapper,
			name: {
				dataField: "name",
				text: "Rule",
				formatter: (data, row) => {
					return (
						<WorkflowNameCondition
							workflow={row}
							type={"apprequisition_rules"}
							showPriorityOrder={!row?.is_default}
						/>
					);
				},
			},

			order: {
				dataField: "order",
				text: "ORDER",
				formatter: (data, row) => {
					return (
						<div className="flex-1 d-flex flex-row align-items-center">
							<div
								style={{
									backgroundColor: "#F6F7FA",
									padding: "12px",
									display: "flex",
									justifyContent: "center",
									borderRadius: "4px",
								}}
								className="custom-badge"
							>
								{row?.priority_order || ""}
							</div>
							<div className="ml-2">
								<div style={{ cursor: "pointer" }}>
									<img
										alt="dragDrop"
										height={15}
										width={15}
										onClick={() => {}}
										src={dragDrop}
									/>
								</div>
							</div>
						</div>
					);
				},
			},

			status: {
				dataField: "status",
				text: "Status",
				formatter: (data, row) => {
					let status = row?.status === "active" ? true : false;
					return (
						<div className="workflows-workflow-status">
							<div className="flex flex-row align-items-center workflow-status-component">
								<div className="d-flex flex-column workflow-status-container">
									<div
										className="truncate_10vw workflow-status-user"
										style={{ margin: "auto" }}
									>
										<div
											style={{
												display: "flex",
												width: "auto",
											}}
										>
											{showStatusLoader &&
											selectedRuleData._id ===
												row?._id ? (
												<Loader
													height={30}
													width={30}
												/>
											) : (
												<div
													className="align-self-centermt-1"
													style={{
														minWidth: "126px",
													}}
												>
													<h4 className="grey-1 font-12 m-0">
														<ToggleSwitch
															height={18}
															width={31}
															checked={status}
															onChange={(v) => {
																if (
																	!showStatusLoader &&
																	!row?.is_default
																) {
																	handleStatusChange(
																		v,
																		row
																	);
																}
															}}
															checkedIcon={false}
															uncheckedIcon={
																false
															}
															onColor={
																row?.is_default
																	? "#EBEBEB"
																	: "#2266E2"
															}
															offColor={"#EBEBEB"}
														/>
														<span
															className="ml-2 position-relative"
															style={{
																bottom: "5px",
															}}
														>
															{row?.status
																?.charAt(0)
																.toUpperCase() +
																row?.status?.slice(
																	1
																)}
														</span>
													</h4>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				},
			},
			options: {
				dataField: "options",
				text: "",
				formatter: (data, row) => {
					if (row?.is_default) return null;
					else
						return (
							<Dropdown
								toggler={<img src={optionsButton} />}
								options={[
									{
										label: (
											<div style={{ color: "#FF6767" }}>
												Delete Rule
											</div>
										),
										onClick: () => {
											setSelectedWorkflow(row);
											handleModel.sayOpenToDeleteWorkflowModal();
										},
									},
								]}
								optionFormatter={(option) => option.label}
								onOptionSelect={(option) => option.onClick()}
								right={0}
							/>
						);
				},
			},
			last_run: {
				dataField: "last_run",
				text: "Runs",
				formatter: (data, row) => (
					<ViewRun
						onClicked={() =>
							history.push(
								`/workflows/${
									row?.tag
								}/?metaData=${getWorkflowsRuleIdFilterMetaData(
									row?._id
								)}#completed`
							)
						}
					/>
				),
			},
			edit: {
				dataField: "edit",
				text: "",
				formatter: (data, row) => (
					<OverlayTrigger
						placement="bottom"
						overlay={<Tooltip>{"Edit"}</Tooltip>}
					>
						<img
							className="cursor-pointer"
							src={borderdedit}
							alt=""
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								history.push({
									pathname: `/apprequisition/rule/${row._id}`,
									state: {
										type: workflowType,
									},
								});
							}}
						/>
					</OverlayTrigger>
				),
			},
			arrow: {
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
							className="cursor-pointer p-2 py-5"
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
		},
	};
	const MoreInfoColMap = {
		templatesMoreInfoColMap: {
			created_on_date: {
				dataField: "created_at",
				text: "Created On",
				formatter: (data, row) => (
					<div className="more-info-table-value-text">
						{UTCDateFormatter(row?.created_at) || "N/A"}
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
				dataField: "published_by_user_name",
				text: "Last Published By",
				formatter: (data, row) => (
					<div className="more-info-table-value-text">
						{row?.published_by_user_name || "N/A"}
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
		},
		draftsMoreInfoColMap: {},
		completedMoreInfoColMap: {},
		rulesMoreInfoColMap: {
			created_by: {
				dataField: "created_by",
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
			approver_name: {
				dataField: "approver_name",
				text: "Approver",
				formatter: (data, row) => (
					<div className="more-info-table-value-text">
						{row?.published_by_user_name || "N/A"}
					</div>
				),
			},
		},
	};

	let addNewTemplateButton = (
		<Button
			className="mt-2 d-flex"
			onClick={() => {
				setCreateNewWorflow(true);
				setUseTemplateOpenModal(true);
			}}
		>
			<img alt="" src={add} width={12} className="mt-auto mb-auto mr-1" />
			New Workflow
		</Button>
	);

	const onCreateNewWorkflow = () => {
		setUseTemplateOpenModal(true);
		setCreateNewWorflow(true);
	};

	const onCreateNewRule = () => {
		history.push({
			pathname: "/creating/apprequisition/rule",
			state: { type: workflowType },
		});
	};

	const onCreateNewTemplate = () => {
		history.push({
			pathname: "/creating/workflow/playbook",
			state: { type: workflowType },
		});
	};

	let addNewRuleButton = (
		<Button
			className="mt-2 d-flex"
			onClick={() => {
				onCreateNewRule();
			}}
		>
			<img alt="" src={add} width={12} className="mt-auto mb-auto mr-1" />
			New Rule
		</Button>
	);

	const onUserSelected = (selUsers) => {
		setSelectedUsers(selUsers);
		if (!createNewWorflow) {
			setCreatingNewWorflowFromTemplate(true);
			const data = {
				user_ids: selUsers.map((user) => user.user_id),
				template_id: selectedWorkflow?.workflow_id,
				name: `${workflowType} ${selUsers[0].user_name?.trim()}${
					selUsers.length > 1
						? ` and ${selUsers.length - 1} others `
						: " "
				}on ${new Date().getDate()} ${MONTH[new Date().getMonth()]}`,
			};
			createWorkflowFromTemplate({ workflow: data })
				.then((res) => {
					dispatch(updateWorkflow(new WorkflowModel(res)));

					handleModel.sayCloseToUseTemplateModal();
					history.push(`/workflow/${res._id}#recommended`);
				})
				.catch((err) => {
					TriggerIssue(
						"Error on using playbook to create workflow",
						err
					);
				})
				.finally((res) => {
					setCreatingNewWorflowFromTemplate(false);
				});
		} else {
			history.push({
				pathname: "/creating/workflow",
				state: { users: selUsers, type: workflowType },
			});
		}
	};

	const addHideAppClose = () => {
		setShowFilterModal(false);
	};

	function handleSubmit() {
		addHideAppClose();
	}

	return (
		<div>
			{showDeleteWorkflowModal && (
				<DeleteWorkflowModal
					workflow={selectedWorkflow}
					type={selectedTab}
					workflow_id={
						selectedWorkflow?.workflow_id || selectedWorkflow?._id
					}
					workflow_name={
						selectedWorkflow?.workflow_name ||
						selectedWorkflow?.name
					}
					setShowDeleteWorkflowModal={setShowDeleteWorkflowModal}
					showDeleteWorkflowModal={showDeleteWorkflowModal}
					refreshTable={handleRefresh}
				/>
			)}
			{openActionModal && (
				<ActionModal
					modalClass="workflows-modal"
					onCloseModal={handleModel.sayCloseToActionModal}
					openModal={openActionModal}
					workflowId={selectedWorkflow?._id}
					onUseTemplate={() => {
						handleModel.sayCloseToActionModal();
						handleModel.sayOpenToUseTemplateModal();
					}}
					buttonTitle="Use Playbook"
					title={selectedWorkflow?.template_name}
					data={selectedWorkflow}
				/>
			)}
			{openUseTemplateModal && (
				<SelectUserModal
					selectedUsers={[]}
					modalClass="workflows-template-modal"
					onCloseModal={handleModel.sayCloseToUseTemplateModal}
					openModal={openUseTemplateModal}
					onLoading={creatingNewWorflowFromTemplate}
					onContinue={(selectedUsers) => {
						onUserSelected(selectedUsers);
					}}
					buttonTitle="Continue"
					title={`Select users for ${workflowType}`}
					data={selectedWorkflow}
				/>
			)}

			{selectedTab === "#overview" ? (
				<div className="workflows-infinite-table mt-4">
					<WorkflowOverview
						metaData={metaData}
						isLoadingData={isLoadingData}
						data={data?.slice(0, 5)}
						workflowType={workflowType}
						setSelectedWorkflow={setSelectedWorkflow}
						onDeleteWorkflow={
							handleModel.sayOpenToDeleteWorkflowModal
						}
						onCreateNewWorkflow={onCreateNewWorkflow}
					/>
				</div>
			) : (
				<>
					<TableHeader
						setSearchQuery={debounce(setSearchQuery, 300)}
						onClickNewWorkflow={() => {
							onCreateNewWorkflow();
						}}
						onClickNewRule={() => {
							onCreateNewRule();
						}}
						onClickNewTemplate={() => {
							onCreateNewTemplate();
						}}
						placeholder={
							selectedTab.substring(1).charAt(0).toUpperCase() +
							selectedTab.slice(2)
						}
						hash={selectedTab}
						refreshTable={handleRefresh}
						searchQuery={searchQuery}
						isLoadingData={isLoadingData}
						setShowFilterModal={setShowFilterModal}
						metaData={metaData}
					/>
					<div className="workflows-infinite-table mt-0">
						{selectedTab === "#playbooks" ? (
							<Templates
								data={data}
								handleLoadMore={handleLoadMore}
								hasMoreData={hasMoreData}
								searchQuery={searchQuery}
								isLoadingData={isLoadingData}
								emptyState={TAB_TYPES[
									selectedTab
								]?.emptyScreen.call(
									TAB_TYPES[selectedTab]?.emptyScreen,
									searchQuery,
									showErrorModal,
									addNewTemplateButton
								)}
							/>
						) : selectedTab === "#rules" ? (
							<NewWorkflowsTable
								onSort={onSort}
								data={data}
								columns={
									selectedTab === "#rules"
										? TAB_TYPES["apprequisition_rules"]
												?.columns
										: TAB_TYPES[selectedTab]?.columns
								}
								metaData={metaData}
								handleLoadMore={handleLoadMore}
								columnsMapper={
									selectedTab && selectedTab === "#drafts"
										? overriddenColumnsMappers.draftsTable
										: selectedTab === "#playbooks"
										? overriddenColumnsMappers.templatesTable
										: selectedTab === "#completed"
										? overriddenColumnsMappers.completedTable
										: selectedTab === "#rules"
										? overriddenColumnsMappers.automationRulesTable
										: null
								}
								handleRowClick={
									selectedTab === "#playbooks"
										? rowClickFunctions[selectedTab]
										: null
								}
								searchQuery={searchQuery}
								isLoadingData={isLoadingData}
								hasMoreData={hasMoreData}
								allowFewSpecialCharacters={true}
								emptyState={TAB_TYPES[
									selectedTab
								]?.emptyScreen.call(
									TAB_TYPES[selectedTab]?.emptyScreen,
									searchQuery,
									showErrorModal,
									selectedTab === "#rules"
										? addNewRuleButton
										: addNewTemplateButton,
									metaData,
									handleResetFilters
								)}
								hasExpandedRow={true}
								loadexpandedRowComponent={loadMoreInfo}
								selectedTab={selectedTab}
							/>
						) : (
							<WorkflowsTable
								onSort={onSort}
								data={data}
								type={TAB_TYPES[selectedTab]?.type}
								columns={TAB_TYPES[selectedTab]?.columns}
								metaData={metaData}
								handleLoadMore={handleLoadMore}
								columnsMapper={
									selectedTab && selectedTab === "#drafts"
										? overriddenColumnsMappers.draftsTable
										: selectedTab === "#playbooks"
										? overriddenColumnsMappers.templatesTable
										: selectedTab === "#completed"
										? overriddenColumnsMappers.completedTable
										: selectedTab === "#rules"
										? overriddenColumnsMappers.automationRulesTable
										: null
								}
								handleRowClick={
									selectedTab === "#completed"
										? rowClickFunctions[selectedTab]
										: null
								}
								searchQuery={searchQuery}
								isLoadingData={isLoadingData}
								hasMoreData={hasMoreData}
								allowFewSpecialCharacters={true}
								emptyState={TAB_TYPES[
									selectedTab
								]?.emptyScreen.call(
									TAB_TYPES[selectedTab]?.emptyScreen,
									searchQuery,
									showErrorModal,
									selectedTab === "#rules"
										? addNewRuleButton
										: addNewTemplateButton
								)}
							/>
						)}
					</div>
				</>
			)}
			{showFilterModal && (
				<>
					<div className="modal-backdrop show"></div>
					<div className="modal d-block">
						<FilterRenderingModal
							handleSubmit={handleSubmit}
							onHide={addHideAppClose}
							filterPropertyList={propertyList}
							appliedFilters={metaData?.filter_by}
							metaData={metaData}
							// submitting={submitInProgress}
							// validationErrors={formErrors}
							// clearValidationErrors={() => setFormErrors([])}
							style={{ zIndex: "1" }}
						/>
					</div>
				</>
			)}
			<Modal
				show={showPrivateBetaModal}
				onClose={() => {
					setShowPrivateBetaModal(false);
				}}
				size="md"
			>
				<div className="p-6 text-center">
					<img
						alt=""
						src={beta}
						width="57"
						className="mb-3 mx-auto"
					/>
					<h3 className="bold-600 font-22 black mb-0">
						Workflows by {partner?.name}
					</h3>
					<p className="bg-red white bold-600 font-8 d-inline-block mx-auto mb-5 p-1 border-radius-4">
						PUBLIC BETA
					</p>
					<p className="grey font-16 mb-6">
						You’re accessing a beta version of this feature, more
						updates are coming shortly. We welcome feedback and
						suggestions, if you have any please reach out to us at
						support@zluri.com.
					</p>

					<Button
						className="text-center"
						onClick={() => {
							closePrivateBetaModal();
						}}
					>
						Agree & Continue
					</Button>
				</div>
			</Modal>
		</div>
	);
}

export default AutomationRulesTableNew;

function handlePathname(pathname) {
	if (pathname.includes(WORFKFLOW_TYPE.ONBOARDING)) {
		return WORFKFLOW_TYPE.ONBOARDING;
	} else if (pathname.includes(WORFKFLOW_TYPE.OFFBOARDING)) {
		return WORFKFLOW_TYPE.OFFBOARDING;
	} else if (pathname.includes(WORFKFLOW_TYPE.APPREQUISITION)) {
		return WORFKFLOW_TYPE.APPREQUISITION;
	}
}
