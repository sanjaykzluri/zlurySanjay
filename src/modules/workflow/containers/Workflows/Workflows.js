import React, { useEffect, useState, useRef, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useHistory, Link } from "react-router-dom";
import { push } from "connected-react-router";
import "./Workflows.css";
import { client } from "../../../../utils/client";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
	getAllTemplates,
	getAllCompletedWorkflows,
	getAllDrafts,
	getAutomationRules,
	getTopFiveDrafts,
	searchDrafts,
	searchCompleted,
	searchTemplates,
	updateWorkflow,
	searchAutomationRules,
	emptyTemplates,
	updateOrderOfAutomationRules,
	getAllTemplatesV2,
	searchScheduleRuns,
	getAllScheduledRuns,
	getWorkFlow,
	clearWorkflow,
	clearWorkflowLogs,
} from "../../redux/workflow";
import ToggleSwitch from "react-switch";
import beta from "../../../../assets/icons/beta.svg";
import linkArrow from "assets/linkArrow.svg";
import infoCircle from "assets/licenses/infocircle.svg";
import arrowdown from "../../../../assets/arrowdown.svg";
import arrowup from "../../../../assets/arrowup.svg";
import dragDrop from "../../../../assets/drag-drop.svg";
import rightarrow from "assets/auditlogs/rightarrow.svg";
import downarrow from "assets/auditlogs/downarrow.svg";
import blueplay from "assets/workflow/blueplay.svg";
import borderdedit from "assets/workflow/bordered-edit.svg";

import {
	searchDraftsService,
	searchCompletedService,
	searchTemplatesService,
	searchAutomationRulesService,
	createWorkflowFromTemplate,
	createWorkflowTemplate,
	getAllCompletedWorkflowsPropertiesListV2,
	updateOrderOfRule,
	getAllCompletedWorkflowsServiceV2,
	getAllPlaybookWorkflowsServiceV2,
	getAllPlaybookWorkflowsPropertiesListV2,
	getAllScheduledRunServiceV2,
	getAllScheduledRunsPropertiesListV2,
} from "../../service/api";
import { checkSpecialCharacters } from "../../../../services/api/search";
import { defaults } from "../../../../constants/defaults";
import info from "../../../../assets/icons/info-orange.svg";
import edit from "assets/icons/edit.svg";
import playbookPlay from "assets/users/playbookPlay.svg";

import {
	templatesColumnsMapper,
	draftColumnsMapper,
	completedColumnsMapper,
	completedColumns,
	automationRulesColumnsMapper,
	TAB_TYPES,
} from "../../constants";
import {
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../constants/constant";
import {
	TransformCompleted,
	TransformCompletedV2,
	updateAutomationRules,
} from "../../redux/workflow";
import {
	applyFilters,
	ACTION_TYPE,
} from "../../components/FiltersRenderer/redux";

import { WORFKFLOW_TYPE, defaultReqBody } from "../../constants/constant";
import { TriggerIssue } from "../../../../utils/sentry";
import Tabbar from "../../components/TabBar/Tabbar";
import TableHeader from "../../components/TabHeader/TableHeader";
import WorkflowsTable from "../../components/WorkflowsTable/WorkflowsTable";
import NewWorkflowsTable from "../../components/WorkflowsTable/NewWorkflowsTable";

import { Button } from "../../../../UIComponents/Button/Button";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import add from "../../../../assets/icons/plus-white.svg";
import {
	debounce,
	capitalizeFirstLetter,
	isEmpty,
	unescape,
} from "../../../../utils/common";
import SelectUserModal from "../../components/SelectUserModal/SelectUserModal";
import {
	WorkflowModel,
	WorkflowPlaybookResponseModel,
} from "../../model/model";
import { MONTH, UTCDateFormatter } from "../../../../utils/DateUtility";
import WorkflowTableCTA from "../../components/WorkflowTableCTA/WorkflowTableCTA";
import { getValueFromLocalStorage } from "../../../../utils/localStorage";
import WorkflowOverview from "../WorkflowOverview/WorkflowOverview";
import { clearListOfWorkflows } from "../../redux/workflow";
import DeleteWorkflowModal from "../../components/DeleteWorkflowModal/DeleteWorkflowModal";
import optionsButton from "../../../../assets/optionsButton.svg";
import ruleConditionLineIcon from "assets/appPlaybooks/rule_condition.svg";
import HeaderTitleBC from "../../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { automationRulesColumns } from "modules/workflow/constants/rules";
import Templates from "modules/workflow/components/Templates/Templates";
import ActionModal from "modules/workflow/components/ActionModal/ActionModal";
import { FilterRenderingModal } from "../../components/FilterRenderingModal/FilterRenderingModal";
import { Loader } from "../../../../common/Loader/Loader";
import RoleContext from "../../../../services/roleContext/roleContext";
import ChangeRuleStatusModal from "modules/workflow/components/ChangeRuleStatusModal/ChangeRuleStatusModal";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { scheduledRunsColumnsMapper } from "modules/workflow/constants/scheduledRuns";
import CancelScheduledRunsModal from "modules/workflow/components/CancelScheduledRunsModal/CancelScheduledRunsModal";
import ArchiveRunsModal from "modules/workflow/components/ArchiveRunsModal/ArchiveRunsModal";
import { setValueToLocalStorage } from "utils/localStorage";
import MoreInfo from "../MoreInfo";
import { templatesMoreInfoColMap } from "modules/workflow/constants/templates";
import DuplicatePlaybookModal from "modules/workflow/components/DuplicatePlaybookModal/DuplicatePlaybookModal";
import ViewPlaybookModal from "modules/workflow/components/ViewPlaybookModal/ViewPlaybookModal";
import UnpublishPlaybookModal from "modules/workflow/components/UnpublishPlaybookModal/UnpublishPlaybookModal";
import AppPlaybookRules from "modules/applications/components/automation/appPlaybookRules/appPlaybookRules";
import { updateTriggerTitle } from "modules/applications/utils/applicationutils";
import WorkflowNameCondition from "modules/workflow/components/WorkflowNameCondition";
import PlaybookSourceType from "modules/workflow/components/PlaybookSourceType";
import SaveTemplateModal from "modules/workflow/components/SaveTemplate/SaveTemplateModal";
import { NameBadge } from "common/NameBadge";
import NotifyOnTrigger from "../NotifyOnTrigger";
import {
	getWorkflowsPlaybookIdFilterMetaData,
	getWorkflowsRuleIdFilterMetaData,
} from "./utils/workflows.utils";
import BulkUploadUsersModal from "modules/workflow/components/BulkUploadUsersModal/BulkUploadUsersModal";
import RunPlaybookBulkUserModal from "modules/workflow/components/RunPlaybookBulkUserModal/RunPlaybookBulkUserModal";
import TotalActions from "modules/applications/components/automation/TotalActions";
import ViewRun from "modules/applications/components/automation/ViewRun";
import ReScheduledRunsModal from "modules/workflow/components/ReScheduledRunsModal/ReScheduledRunsModal";
import CreatedAt from "modules/workflow/components/CreatedAt";
import CompileWorkflow from "modules/workflow/components/CompileWorkflow/CompileWorkflow";

function Workflows() {
	const location = useLocation();
	const history = useHistory();
	const isMounted = useRef(false);
	const selectedTab = useSelector((state) => state.router.location.hash);
	const templatesDataset = useSelector((state) => state.workflows.templates);
	const completedDataset = useSelector((state) => state.workflows.completed);
	const draftsDataset = useSelector((state) => state.workflows.drafts);
	const [showCompileWorkflowModal, setshowCompileWorkflowModal] =
		useState(false);
	const automationRulesDataset = useSelector(
		(state) => state.workflows.automationRules
	);
	const overviewDraftsDataset = useSelector(
		(state) => state.workflows.overviewDrafts
	);
	const scheduledRunsDataset = useSelector(
		(state) => state.workflows.scheduledRuns
	);
	const filtersRedux = useSelector((state) => state.filters);
	const cancelToken = useRef();
	const router = useSelector((state) => state.router);
	const { enableBetaFeatures, partner } = useContext(RoleContext);
	const { hash, pathname, query } = router.location;
	const isTemplate =
		location.hash === "#playbooks" || location.hash === "#overview"
			? true
			: false;
	//----------------------------------------------------
	const [data, setData] = useState([]);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [pageNo, setPageNo] = useState(0);
	const [searchQuery, setSearchQuery] = useState();
	const [searchQueryFromUrl, setSearchQueryFromUrl] = useState(
		query?.searchQuery
	);
	const [refreshTable, setRefreshTable] = useState(false);
	const [metaData, setMetaData] = useState();
	const [shouldConcat, setShouldConcat] = useState(false);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [openActionModal, setActionOpenModal] = useState(false);
	const [showDuplicatePlaybookModal, setShowDuplicatePlaybookModal] =
		useState(false);
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
	const [showRuleStatusModal, setShowRuleStatusModal] = useState(false);
	const [showRunPlaybookModal, setShowRunPlaybookModal] = useState(false);

	const [reqBody, setReqBody] = useState();
	const [propertyList, setPropertyList] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [showCancelScheduledRunsModal, setShowCancelScheduledRunsModal] =
		useState(false);
	const [showArchiveRunsModal, setShowArchiveRunsModal] = useState(false);
	const [showReScheduleRunModal, setShowReScheduleRunModal] = useState(false);
	const [showdescription, setshowdescription] = useState([]);
	const [openViewModal, setOpenViewModal] = useState(false);
	const [row1, setRow1] = useState();
	const [showUnpublishPlaybookModal, setShowUnpublishPlaybookModal] =
		useState(false);
	const [showBulkUserUploadModal, setShowBulkUserUploadModal] =
		useState(false);
	const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

	useEffect(() => {
		if (!location.hash.slice(1)) history.push("#overview");
	}, [location, history]);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query?.playbookId) {
			handleModel.sayOpenToViewModal();
		}
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(query, reqBody);
			} catch {
				dispatch(
					push(`?metaData=${JSON.stringify(reqBody)}${selectedTab}`)
				);
			}
			setSearchQuery();
			setReqBody({ ...reqObj });
		} else if (!query.metaData && !query.searchQuery) {
			dispatch({ type: ACTION_TYPE.RESET_FILTERS });
			setReqBody({ ...defaultReqBody });
		}
		handleRefresh();
	}, [query]);

	useEffect(() => {}, [searchQueryFromUrl]);

	useEffect(() => {
		if (pathname) {
			setWorkflowType(pathname.split("/")[2]);
		}
		dispatch(clearListOfWorkflows()).then(() => {
			handleRefresh();
		});
		if (searchQuery) {
			setAllowSearchQuery2RefreshTable(false);
		}
		setSearchQuery("");
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
		if (searchQuery && !query?.searchQuery) {
			setAllowSearchQuery2RefreshTable(false);
			setSearchQuery("");
		}
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
		} else if (selectedTab === "#runs") {
			dataResponse = scheduledRunsDataset;
		}
		((dataResponse) => {
			if (dataResponse?.data?.length < 1) {
				setIsLoadingData(false);
			}
			if (dataResponse) {
				if (dataResponse?.data?.length < defaults.MINIMUM_ROW) {
					setHasMoreData(false);
				} else {
					!hasMoreData && setHasMoreData(true);
				}
				let newData = shouldConcat
					? [...data, ...dataResponse?.data]
					: dataResponse?.data;
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
		scheduledRunsDataset,
	]);

	useEffect(() => {
		if (isMounted.current) {
			if (cancelToken.current) {
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
				setIsLoadingData(false);
			}
			if (searchQuery) {
				if (checkSpecialCharacters(searchQuery)) {
					setData([]);
					setMetaData({});
					setIsLoadingData(false);
					setHasMoreData(false);
				} else {
					reqBody.filter_by = [];
					// query.metaData &&
					// 	dispatch(
					// 		push(
					// 			`?metaData=${JSON.stringify(
					// 				reqBody
					// 			)}${selectedTab}`
					// 		)
					// 	);
					fetchData(selectedTab);
				}
			} else if (searchQuery === "" && query === "") {
				reqBody.filter_by = [];
				handleRefresh();
				setReqBody(reqBody);

				reqBody.filter_by = [];
				// query.metaData &&
				// 	dispatch(
				// 		push(
				// 			`?metaData=${JSON.stringify(reqBody)}${selectedTab}`
				// 		)
				// 	);
				query.searchQuery && dispatch(push(selectedTab));
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

	const fetchData = (selectedTab) => {
		if (!searchQuery && isLoadingData) return;
		setData([]);
		!searchQuery && setMetaData();
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
				if (isEmpty(reqBody.filter_by) && searchQuery) {
					const searchObj = getSearchReqObj(
						searchQuery,
						"name",
						"Workflow Name"
					);
					reqBody.filter_by = [searchObj];
					delete reqBody.reset_filter;
				}

				promise = getAllPlaybookWorkflowsServiceV2(
					type,
					pageNo,
					reqBody
				);
			} else if (selectedTab === "#completed") {
				if (isEmpty(reqBody.filter_by) && searchQuery) {
					const searchObj = getSearchReqObj(
						searchQuery,
						"name",
						"Workflow Name"
					);
					reqBody.filter_by = [searchObj];
					delete reqBody.reset_filter;
				}
				let searchReqParams = {
					is_search: true,
					search_query: searchQuery,
				};

				promise = getAllCompletedWorkflowsServiceV2(
					type,
					pageNo,
					reqBody,
					searchReqParams
				);
			} else if (selectedTab === "#rules") {
				promise = searchAutomationRulesService(
					type,
					searchQuery,
					cancelToken.current
				);
			} else if (selectedTab === "#runs") {
				if (isEmpty(reqBody.filter_by) && searchQuery) {
					const searchObj = getSearchReqObj(
						searchQuery,
						"workflow_template_name",
						"Playbook Name"
					);
					reqBody.filter_by = [searchObj];
					delete reqBody.reset_filter;
				}
				let searchReqParams = {
					is_search: true,
					search_query: searchQuery,
				};

				promise = getAllScheduledRunServiceV2(
					type,
					pageNo,
					reqBody,
					searchReqParams
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
					} else if (selectedTab === "#runs") {
						dispatch(
							searchScheduleRuns({
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
		setShouldConcat(true);
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
				newOrder: newIndex + 1,
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
		if (searchQuery?.length > 0) return;
		setIsLoadingData(true);
		let type = handlePathname(pathname);
		// load data from redux
		if (selectedTab === "#playbooks") {
			// dispatch(getAllTemplates(type, pageNo, onApiError));
			let data = { ...reqBody };
			if (reqObj) {
				data = reqObj;
			}
			dispatch(getAllTemplatesV2(type, pageNo, data, onApiError));
			getAllPlaybookWorkflowsPropertiesListV2()
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
		} else if (selectedTab === "#completed") {
			let data = { ...reqBody };
			if (reqObj) {
				data = reqObj;
			}
			dispatch(getAllCompletedWorkflows(type, pageNo, data, onApiError));
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
		} else if (selectedTab === "#runs") {
			let data = { ...reqBody };
			if (reqObj) {
				data = reqObj;
			}

			dispatch(getAllScheduledRuns(type, pageNo, data, onApiError));
			getAllScheduledRunsPropertiesListV2()
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
		sayOpenToBulkUserUploadModal: (e) => {
			handleModel.sayCloseToUseTemplateModal();
			!showBulkUserUploadModal && setShowBulkUserUploadModal(true);
		},
		sayCloseToBulkUserUploadModal: (e) => {
			showBulkUserUploadModal && setShowBulkUserUploadModal(false);
		},
		sayOpenToViewModal: (e, row) => {
			!openViewModal && setOpenViewModal(true);
		},
		sayCloseToViewModal: (e, row) => {
			if (!query.metaData) {
				history.push(`/workflows/${workflowType}${selectedTab}`);
			}
			openViewModal && setOpenViewModal(false);
		},

		sayOpenToUseTemplateModal: (e, row) => {
			!openUseTemplateModal && setUseTemplateOpenModal(true);
			setSelectedWorkflow(row);
		},
		sayCloseToUseTemplateModal: (e) => {
			openUseTemplateModal && setUseTemplateOpenModal(false);
		},
		sayOpenToRunPlaybook: () => {
			handleModel.sayCloseToBulkUserUploadModal();
			!showRunPlaybookModal && setShowRunPlaybookModal(true);
		},
		sayCloseToRunPlaybook: () => {
			showRunPlaybookModal && setShowRunPlaybookModal(false);
		},
		sayOpenToDeleteRuleModal: (e) => {
			!showDeleteRuleModal && setShowDeleteRuleModal(true);
		},
		sayOpenToCancelScheduledRunsModal: (e) => {
			setShowCancelScheduledRunsModal(true);
		},
		sayCloseToCancelScheduledRunsModal: (e) => {
			setShowCancelScheduledRunsModal(false);
		},
		sayOpenToReScheduledRunsModal: (e) => {
			setShowReScheduleRunModal(true);
		},
		sayOpenToArchiveRunsModal: (e) => {
			setShowArchiveRunsModal(true);
		},
		sayCloseToArchiveRunsModal: (e) => {
			setShowArchiveRunsModal(false);
		},
		sayOpenToDuplicatePlaybookModal: () => {
			setShowDuplicatePlaybookModal(true);
		},
		sayCloseToDuplicatePlaybookModal: () => {
			setShowDuplicatePlaybookModal(false);
		},
		sayOpenToEditPublishedPlaybook: () => {
			!showUnpublishPlaybookModal && setShowUnpublishPlaybookModal(true);
		},
		sayCloseToEditPublishedPlaybook: () => {
			showUnpublishPlaybookModal && setShowUnpublishPlaybookModal(false);
		},
	};

	const rowClickFunctions = {
		"#completed": (workflow) => {
			setSelectedWorkflow(workflow);
			history.push(
				`/workflow/${workflow.workflow_id}/runs/${workflow.workflow_runId}`
			);
		},
		"#playbooks": (workflow) => {
			setRow1(workflow);
			history.push(
				`/workflows/${workflow?.type}?playbookId=${workflow?._id}#playbooks`
			);
			handleModel.sayOpenToViewModal();
		},
	};

	const handleStatusChange = (status, row) => {
		const data = { ...row, status: status ? "active" : "inactive" };
		setSelectedRuleData(row);
		setShowRuleStatusModal(true);
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

	const overriddenColumnsMappers = {
		templatesTable: {
			...templatesColumnsMapper,

			edit_playbook: {
				dataField: "edit_playbook",
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
									pathname: `/playbook/${row._id}`,
								});
							}}
						/>
					</OverlayTrigger>
				),
			},
			run_playbook: {
				dataField: "run_playbook",
				text: "",
				formatter: (data, row) => {
					return (
						row.is_published && (
							<OverlayTrigger
								placement="bottom"
								overlay={<Tooltip>{"Run"}</Tooltip>}
							>
								<img
									// className="cursor-pointer"
									src={blueplay}
									alt=""
								/>
							</OverlayTrigger>
						)
					);
				},
			},
			status: {
				dataField: "",
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
							className="p-2"
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

			total_runs: {
				dataField: "total_runs",
				text: "Runs",
				formatter: (data, row) => (
					<ViewRun
						onClicked={() =>
							history.push(
								`/workflows/${
									row?.type
								}/?metaData=${getWorkflowsPlaybookIdFilterMetaData(
									row?._id
								)}#completed`
							)
						}
					/>
				),
			},

			used_by_rules: {
				dataField: "used_by_rules",
				text: "Used By Rules",
				formatter: (data, row) => (
					<div className="d-flex flex-row ml-4 cursor-pointer">
						<div className="mr-1"> 9 </div>
						<img
							src={linkArrow}
							alt=""
							onClick={(e) => {
								alert("hi");
							}}
						/>
					</div>
				),
			},

			total_actions_count: {
				dataField: "total_actions_count",
				text: "Total Actions",
				formatter: (data, row) => <TotalActions playbook={row} />,
			},

			last_used_date: {
				dataField: "last_used",
				text: "Last Used",
				formatter: (data, row) => {
					return (
						<div className="d-flex flex-column justify-content-center ml-2">
							<CreatedAt text={row?.last_used} showName={false} />
						</div>
					);
				},
			},

			options: {
				dataField: "",
				text: "",
				formatter: (data, row) => (
					<Dropdown
						toggler={<img src={optionsButton} />}
						options={[
							{
								label: (
									<div style={{ color: "#FF6767" }}>
										Delete Playbook
									</div>
								),
								onClick: () => {
									setSelectedWorkflow(row);
									handleModel.sayOpenToDeleteWorkflowModal();
								},
							},
							{
								label: "Duplicate Playbook",
								onClick: (e) => {
									handleModel.sayOpenToDuplicatePlaybookModal();
									setRow1(row);
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

		draftsTable: {
			...draftColumnsMapper,
			run_action: {
				dataField: "app_status",
				text: "",
				formatter: (data, row) => (
					<div className="workflows-workflow-action">
						<Link
							to={{
								hash: "#recommended",
								pathname: `/workflow/${row?.workflow_id}`,
							}}
							className="text-decoration-none font-13"
						>
							Edit
						</Link>
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
								label: (
									<div style={{ color: "#FF6767" }}>
										Delete Draft
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
				),
			},
		},

		completedTable: {
			...completedColumnsMapper,

			source_type: {
				dataField: "",
				text: "Source",
				formatter: (data, row) => (
					<div className="workflows-workflow-created-by">
						<PlaybookSourceType
							source={row?.source}
							userName={row?.run_by_user_name}
							workflowName={row?.workflow_name}
						/>
					</div>
				),
			},
			view_log_action: {
				dataField: "view_log_action",
				text: "",
				formatter: (data, row) => {
					return (
						<div className="workflows-workflow-action">
							<Link
								to={{
									pathname: `/workflow/${
										row.workflow_id
									}/runs/${row?._id || row?.workflow_runId}`,
								}}
								className="text-decoration-none font-13"
							>
								View Log
							</Link>
						</div>
					);
				},
			},

			option: {
				dataField: "option",
				text: "",
				formatter: (data, row) => (
					<Dropdown
						toggler={<img alt="" src={optionsButton} />}
						options={[
							{
								label: `${
									row?.archive ? "Unarchive" : "Archive"
								} Run`,
								onClick: (e) => {
									setSelectedWorkflow(row);
									handleModel.sayOpenToArchiveRunsModal();
								},
							},
							{
								label: `Save as Playbook`,
								onClick: (e) => {
									dispatch(
										getWorkFlow({
											id: row?.workflow_id,
											isTemplate: false,
										})
									);
									setShowSaveTemplateModal(true);
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

		scheduledRunsTable: {
			...scheduledRunsColumnsMapper,
			view_log_action: {
				dataField: "view_log_action",
				text: "",
				formatter: (data, row) => (
					<Dropdown
						toggler={<img alt="" src={optionsButton} />}
						options={[
							{
								label: "Re-Schedule Run",
								onClick: () => {
									setSelectedWorkflow(row);
									handleModel.sayOpenToReScheduledRunsModal();
								},
							},
							{
								label: "Cancel Run",
								onClick: () => {
									setSelectedWorkflow(row);
									handleModel.sayOpenToCancelScheduledRunsModal();
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

		automationRulesTable: {
			...automationRulesColumnsMapper,
			name: {
				dataField: "name",
				text: "Rule",
				formatter: (data, row) => {
					return <WorkflowNameCondition workflow={row} />;
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
																	!showStatusLoader
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
															onColor={"#2266E2"}
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
				formatter: (data, row) => (
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
				),
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
									pathname: `/workflow/rule/${row._id}`,
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

	const loadMoreInfo = (dataRow, selectedTab) => {
		return (
			<MoreInfo
				id={dataRow._id}
				showdescription={showdescription}
				columns={TAB_TYPES[selectedTab]?.moreInfoCol}
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
			pathname: "/creating/workflow/rule",
			state: { type: workflowType, hash: selectedTab },
		});
	};

	const onCreateNewTemplate = () => {
		history.push({
			pathname: "/creating/workflow/playbook",
			state: { type: workflowType, hash: selectedTab },
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
		if (!createNewWorflow) {
			setCreatingNewWorflowFromTemplate(true);
			const data = {
				user_ids: selUsers.map((user) => user.user_id),
				template_id: row1?.workflow_id || row1?._id,
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
					setshowCompileWorkflowModal(true);
					//history.push(`/workflow/${res._id}#recommended`);
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

	function handleResetFilters() {
		setSearchQuery();
		dispatch(clearListOfWorkflows()).then(() => {
			handleRefresh();
		});
	}

	return (
		<div>
			{showRuleStatusModal && (
				<ChangeRuleStatusModal
					rule={selectedRuleData}
					type={selectedTab}
					rule_id={selectedRuleData?.rule_id || selectedRuleData?._id}
					rule_name={
						selectedRuleData?.rule_name || selectedRuleData?.name
					}
					setShowRuleStatusModal={setShowRuleStatusModal}
					showRuleStatusModal={showRuleStatusModal}
					refreshTable={handleRefresh}
				/>
			)}
			{openViewModal && (
				<ViewPlaybookModal
					modalClass="workflows-modal"
					onCloseModal={() => {
						handleModel.sayCloseToViewModal();
						dispatch(clearWorkflow());
						dispatch(clearWorkflowLogs());
					}}
					openModal={openViewModal}
					workflowId={row1?._id}
					onUseTemplate={() => {
						handleModel.sayCloseToViewModal();
						handleModel.sayOpenToUseTemplateModal();
					}}
					buttonTitle="Use Playbook"
					title={row1?.name}
					data={row1}
					onshowCompileScreen={() => {
						handleModel.sayCloseToViewModal();
						setshowCompileWorkflowModal(true);
					}}
					onEditPublishedPlaybook={(row) => {
						setRow1(row);
						dispatch(clearWorkflow());
						dispatch(clearWorkflowLogs());
						handleModel.sayCloseToViewModal();
						handleModel.sayOpenToEditPublishedPlaybook();
					}}
				/>
			)}
			{showUnpublishPlaybookModal && (
				<UnpublishPlaybookModal
					show={showUnpublishPlaybookModal}
					onHide={() => {
						handleModel.sayCloseToEditPublishedPlaybook();
					}}
					data={row1}
				/>
			)}
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
					title={selectedWorkflow?.name}
					data={selectedWorkflow}
				/>
			)}
			{openUseTemplateModal && (
				<SelectUserModal
					workflowType={workflowType}
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
					data={row1}
					showBulkUser={true}
					onSelectBulkUser={handleModel.sayOpenToBulkUserUploadModal}
				/>
			)}
			{showCompileWorkflowModal && (
				<CompileWorkflow
					openModal={showCompileWorkflowModal}
					modalClass="workflows-modal"
					onCloseModal={() => setshowCompileWorkflowModal(false)}
					isTemplate={isTemplate}
				/>
			)}
			{showBulkUserUploadModal && (
				<BulkUploadUsersModal
					workflowType={workflowType}
					data={row1}
					onCloseModal={handleModel.sayCloseToBulkUserUploadModal}
					onRunPlaybook={handleModel.sayOpenToRunPlaybook}
				/>
			)}
			{showRunPlaybookModal && (
				<RunPlaybookBulkUserModal
					workflowType={workflowType}
					modalClass="workflows-template-modal"
					onCloseModal={handleModel.sayCloseToRunPlaybook}
					openModal={showRunPlaybookModal}
					onContinue={() => {
						history.push(`/workflows/${workflowType}#completed`);
					}}
					buttonTitle="See Recent Runs"
					title={`Running ${row1?.workflow_name}`}
					showButton={true}
				/>
			)}
			{showSaveTemplateModal && (
				<SaveTemplateModal
					showSaveTemplateModal={showSaveTemplateModal}
					setShowSaveTemplateModal={setShowSaveTemplateModal}
				/>
			)}
			<HeaderTitleBC
				inner_screen={true}
				title="Workflows"
				entity_name={capitalizeFirstLetter(workflowType)}
			/>
			<Tabbar enableBetaFeatures={enableBetaFeatures} />
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
					<div
						style={{
							padding: "0px 40px",
							marginTop: "7px",
							minHeight: "100vh",
							overflowX: "auto"
						}}
					>
						{selectedTab === "#playbooks" ||
						selectedTab === "#rules" ? (
							<NewWorkflowsTable
								onSort={onSort}
								data={data}
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
										: selectedTab === "#runs"
										? overriddenColumnsMappers.scheduledRunsTable
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
								selectedTab={selectedTab}
							/>
						)}
					</div>
				</>
			)}
			{showCancelScheduledRunsModal && (
				<CancelScheduledRunsModal
					workflow={selectedWorkflow}
					type={selectedTab}
					workflow_id={selectedWorkflow?._id}
					workflow_name={
						selectedWorkflow?.workflow_name ||
						selectedWorkflow?.name
					}
					setShowCancelScheduledRunsModal={
						setShowCancelScheduledRunsModal
					}
					showCancelScheduledRunsModal={showCancelScheduledRunsModal}
					refreshTable={handleRefresh}
				/>
			)}
			{showReScheduleRunModal && (
				<ReScheduledRunsModal
					workflow={selectedWorkflow}
					type={selectedTab}
					workflow_id={selectedWorkflow?._id}
					workflow_name={
						selectedWorkflow?.workflow_name ||
						selectedWorkflow?.name
					}
					setShowReScheduleRunModal={setShowReScheduleRunModal}
					showReScheduleRunModal={showReScheduleRunModal}
					refreshTable={handleRefresh}
				/>
			)}
			{showArchiveRunsModal && (
				<ArchiveRunsModal
					workflow={selectedWorkflow}
					type={selectedTab}
					workflow_id={
						selectedWorkflow?.workflow_id || selectedWorkflow?._id
					}
					workflow_name={
						selectedWorkflow?.workflow_name ||
						selectedWorkflow?.name
					}
					setShowArchiveRunsModal={setShowArchiveRunsModal}
					showArchiveRunsModal={showArchiveRunsModal}
					refreshTable={handleRefresh}
				/>
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
							style={{ zIndex: "1" }}
						/>
					</div>
				</>
			)}
			{showDuplicatePlaybookModal && (
				<DuplicatePlaybookModal
					modalClass="workflows-template-modal"
					show={showDuplicatePlaybookModal}
					onHide={() => {
						handleModel.sayCloseToDuplicatePlaybookModal();
					}}
					data={row1}
				/>
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
						Workflows by ${partner?.name}
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

export default Workflows;

function handlePathname(pathname) {
	if (pathname.includes(WORFKFLOW_TYPE.ONBOARDING)) {
		return WORFKFLOW_TYPE.ONBOARDING;
	} else if (pathname.includes(WORFKFLOW_TYPE.OFFBOARDING)) {
		return WORFKFLOW_TYPE.OFFBOARDING;
	} else if (pathname.includes(WORFKFLOW_TYPE.APPREQUISITION)) {
		return WORFKFLOW_TYPE.APPREQUISITION;
	}
}
