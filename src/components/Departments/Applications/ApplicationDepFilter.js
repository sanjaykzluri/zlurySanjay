import React, { useState, useRef, useContext, useEffect } from "react";
import search from "../../../assets/search.svg";
import Add from "../../../assets/add.svg";
import "./ApplicationDep.css";
import { AddUsersApplicationsToDepartments } from "./Modals/AddUsersApplicationsToDepartments";
import { useHistory, useLocation } from "react-router-dom";
import {
	addManualUsageToDepartmentUsersAppliction,
	exportDepartmentApplicationsCSV,
	getDepartmentApplicationsPropertiesList,
	getDeptApplicationCostTrend,
	getDeptApplicationSpendTrend,
} from "../../../services/api/departments";
import { EmptySearch } from "../../../common/EmptySearch";
import { Empty } from "../../Applications/AllApps/Empty";
import refresh_icon from "../../../assets/icons/refresh.svg";
import { useSelector, useDispatch } from "react-redux";
import { departmentConstants } from "../../../constants/transactions";
import { ErrorModal } from "../../../modules/shared/components/ManualUsage/ErrorModal/ErrorModal";
import { getAllCustomFieldService } from "../../../modules/custom-fields/service/api";
import RoleContext from "../../../services/roleContext/roleContext";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../../common/restrictions";
import { ENTITIES } from "../../../constants";
import { SourceIconCell } from "../../sourceIconCell";
import OldInfiniteTable from "../../../common/oldInfiniteTable";
import { ColumnRenderingModal } from "../../Users/Applications/Modals/ColumnRenderingModal";
import { FilterRenderingModal } from "../../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import { preventScroll } from "../../../actions/ui-action";
import Chips from "../../Users/Applications/Modals/FiltersRenderer/Chip";
import { ChangeStatus } from "../../Applications/Overview/ChangeStatus";
import FilterIcons from "../../../common/filterIcons";
import AppTableComponent from "../../../common/AppTableComponent";
import { ErrorComponent } from "../../../common/ErrorComponnet";
import { SearchInputArea } from "../../searchInputArea";
import SpendCostTrend, {
	HeaderFormatter,
	spendCostTrendType,
} from "../../../modules/spendvscost/components/SpendCostTrend";
import ExportModal from "../../../common/Export/ExportModal";
import { getValueFromLocalStorage } from "utils/localStorage";
import { SourcesFormatter } from "modules/shared/components/ManualUsage/TableFormatter/SourcesFormatter";

function clickedOnApp(id, name) {
	//Segment Implementation
	window.analytics.track("Clicked on Single Application", {
		currentCategory: "Departments",
		currentPageName: "Department-Applications",
		clickedAppId: id,
		clickedAppName: name,
		orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
		orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
	});
}
const showTooltipLength = 20;
const deptId = window.location.pathname.split("/")[2];

function statusFormatter(cell, row) {
	const appStatus =
		row.app_archive || row.archive ? "archived" : row.app_status;
	return <ChangeStatus disableEdit={true} status={appStatus} />;
}

export function ApplicationDepFilter(props) {
	const {
		searchQuery,
		handleLoadMore,
		data,
		metaData,
		checked,
		setChecked,
		isLoadingData,
		hasMoreData,
		usedColumns,
		handleRefresh,
		setSearchQuery,
		appSourceList,
		showErrorModal,
		department_id,
	} = props;
	const history = useHistory();
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [tablemode, settablemode] = useState(true);
	const [boxmode, setboxmode] = useState(false);
	const [showHide, setshowHide] = useState(false);
	const [apps, setApps] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [refreshTableDueToUsage, setRefreshTableDueToUsage] = useState(false);
	const { refreshTable } = useSelector((state) => state.ui);
	// const [searchQuery, setSearchQuery] = useState("");
	const [apiDataKey, setApiDataKey] = useState("applications");
	const id = window.location.pathname.split("/")[2];

	let addHideAppClose = () => {
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setshowHide(false);
	};
	const dispatch = useDispatch();
	const department = props.department;
	const location = useLocation();
	const cancelToken = useRef();
	const [showError, setShowError] = useState(false);
	const [error, setError] = useState(null);
	const { isViewer } = useContext(RoleContext);
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);

	const addApplicationToDepartments = async (appId, users_obj) => {
		try {
			setSubmitting(true);
			const deptId = location.pathname.split("/")[2];
			const result = await addManualUsageToDepartmentUsersAppliction(
				deptId,
				appId,
				users_obj
			);
			if (result.status === "success") {
				setSubmitting(false);
				setshowHide(false);
				setRefreshTableDueToUsage(true);
				refreshReduxState();
				//Segment Implementation
				window.analytics.track("Added a new Application", {
					newAppId: appId,
					users: users_obj,
					currentCategory: "Departments",
					currentPageName: "Department-Application",
					orgId: orgId || "",
					orgName: orgName || "",
				});
			}
		} catch (err) {
			setSubmitting(false);
			setshowHide(false);
			if (err?.response?.data?.errors?.includes("user is inactive")) {
				setError("You cannot set manual usage for inactive user");
			} else if (
				err?.response?.data?.errors?.includes("application is inactive")
			) {
				setError(
					"You cannot set manual usage for inactive application"
				);
			} else {
				setError(err?.message);
			}
			setShowError(true);
		}
	};

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
	}

	function singleDepartmentAppsSelector(state) {
		return state.departments.singleDepartmentApps[id];
	}

	const refreshReduxState = () => {
		dispatch({
			type: departmentConstants.DELETE_DEPARTMENTS_APPS_CACHE,
			payload: {
				id: id,
			},
		});
		!isLoadingData && handleRefresh();
		//Segment Implementation
		window.analytics.track("Refresh Button Clicked", {
			currentCategory: "Departments",
			currentPageName: "Department-Applications",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};

	const [showExportModal, setShowExportModal] = useState(false);
	const [showInProgressModal, setShowInProgressModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [propertyList, setPropertyList] = useState([]);
	const [customFields, setCustomFields] = useState([]);
	const [searchPropertyList, setSearchPropertyList] = useState("");
	const [listOfColumns, setListOfColumns] = useState([]);
	const [submitInProgress, setSubmitInProgress] = useState(false);

	useEffect(() => {
		//Segment Implementation
		if (showExportModal) {
			window.analytics.page("Applications", "All-Apps; Export App Data", {
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [showExportModal]);

	useEffect(() => {
		//Segment Implementation
		if (showExportModal) {
			window.analytics.page("Applications", "All-Apps; Export App Data", {
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [showExportModal]);

	useEffect(() => {
		if (loading) {
			getDepartmentApplicationsPropertiesList().then((res) => {
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
				setLoading(false);
			});
		}
	}, []);
	useEffect(() => {
		if (loading) {
			getAllCustomFieldService().then((res) => {
				if (res != null && res.custom_fields != null) {
					if (res.custom_fields.applications != null) {
						setCustomFields(res.custom_fields.applications);
					} else {
						setCustomFields([]);
					}
				} else {
					setCustomFields([]);
				}
				setLoading(false);
			});
		}
	}, []);

	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Departments",
			currentPageName: "Department-Applications; Export",
			checked: props.checked,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};

	useEffect(() => {
		//Segment Implementation
		if (showInProgressModal) {
			window.analytics.track("Exporting Data in Progress", {
				currentCategory: "Departments",
				currentPageName: "Department-Applications; Export",
				checked: props.checked,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [showInProgressModal]);

	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Applications");
	};

	const clickedOnExport = () => {
		if (isBasicSubscription) {
			showrestrictedPopup(ENTITIES.EXPORT_CSV);
		} else {
			setShowExportModal(true);
		}
		commonSegmentTrack("Clicked on Export");
	};

	const clickedOnUserCountCell = (data) => {
		const url = `/applications/${data?.app_id}?metaData={"sort_by":[],"filter_by":[{"field_id":"user_app_status","field_name":"User%20Application%20Status","field_values":["active"],"filter_type":"string","negative":false,"is_custom":false},{"field_id":"user_app_archive","field_name":"User%20Application%20Archive","field_values":false,"filter_type":"boolean","negative":false,"is_custom":false},{"field_id":"dept_id","field_name":"Department%20Id","field_values":["${department_id}"],"filter_type":"objectId","negative":false,"is_custom":false}],"columns":[],"reset_filter":false,"group_filter_by":{"entity_group":[],"entity_type":""}}#users`;
		history.push(url);
	};

	const columnsMapper = {
		application: {
			dataField: "app_name",
			text: "Application",
			sortKey: "app_name",
			displayName: "a",
			formatter: (row, data, rowindex) => (
				<AppTableComponent
					app_name={data?.app_name}
					app_logo={data?.app_logo}
					app_auth_status={data?.app_state}
					app_id={data?.app_id}
					logo_height="auto"
					logo_width={28}
				/>
			),
		},
		app_type: {
			dataField: "type",
			text: "Type",
			formatter: (row, data) => (
				<span style={{ textTransform: "capitalize" }}>
					{data.app_type}
				</span>
			),
		},
		app_spend: {
			dataField: "app_spend",
			text: "Spend [YTD]",
			sortKey: "app_spend",
			headerFormatter: (row, data) => (
				<HeaderFormatter
					text={"Spend [YTD]"}
					type={spendCostTrendType.SPEND}
				></HeaderFormatter>
			),
			formatter: (row, data) => (
				<SpendCostTrend
					trendAPI={getDeptApplicationSpendTrend}
					type={spendCostTrendType.SPEND}
					id={data?.app_id}
					value={data?.app_spend}
					outerId={id}
				/>
			),
		},
		app_user_count: {
			dataField: "app_user_count",
			text: "Users",
			sortKey: "app_user_count",
			formatter: (row, data) => (
				<div
					className="cursor-pointer"
					onClick={() => clickedOnUserCountCell(data)}
				>
					{row}
				</div>
			),
		},
		app_source: {
			dataField: "source_array",
			text: "Source",
			formatter: (
				cell,
				row,
				interColumnsStateObject,
				setInterColumnsStateObject
			) => (
				<div>
					<SourcesFormatter
						cell={cell}
						isUserAppActive={"active"}
						completeRow={row}
						is_manual_source_present={row.is_manual_source_present}
						interColumnsStateObject={interColumnsStateObject}
						setInterColumnsStateObject={setInterColumnsStateObject}
						isApp={true}
					/>
				</div>
			),
		},
		app_status: {
			dataField: "app_status",
			text: "Status",
			sortKey: "app_status",
			displayName: "c",
			formatter: statusFormatter,
		},
		department_app_cost: {
			dataField: "app_cost",
			sortKey: "app_cost",
			text: "Cost [YTD]",
			headerFormatter: (row, data) => (
				<HeaderFormatter
					text={"Cost [YTD]"}
					type={spendCostTrendType.COST}
				></HeaderFormatter>
			),
			formatter: (row, data) => (
				<SpendCostTrend
					trendAPI={getDeptApplicationCostTrend}
					type={spendCostTrendType.COST}
					id={data?.app_id}
					value={data?.app_cost}
					outerId={id}
				/>
			),
		},
	};

	return (
		<>
			<div className="top__Uploads">
				<div className="Uploads__left">
					<FilterIcons
						preventScroll={preventScroll}
						isLoadingData={isLoadingData}
						setShowFilterModal={setShowFilterModal}
						setShowColumnsModal={setShowColumnsModal}
						metaData={metaData}
					/>
				</div>
				<div className="Uploads__right">
					<div className="inputWithIconApps">
						<SearchInputArea
							placeholder="Search Applications"
							setSearchQuery={setSearchQuery}
							onClick={clickedOnSearch}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					<div className="d-flex flex-row">
						{!isViewer && (
							<button
								className="appsad mr-3"
								onClick={() => setshowHide(true)}
							>
								<img src={Add} />
								<span id="te">Add</span>
							</button>
						)}
						<ExportModal
							title="Export Department App Data"
							show={showExportModal}
							onHide={() => setShowExportModal(false)}
							propertyList={propertyList}
							mandatoryFieldId="app_name"
							mandatoryFieldName="Application Name"
							hiddenPropertiesArray={["app_id", "app_name"]}
							customFieldPropertyId="app_custom_fields"
							customFieldEntity="applications"
							exportEntity="Applications"
							selectedDataFieldId="app_id"
							selectedData={checked}
							id={id}
							metaData={metaData}
							exportCSV={exportDepartmentApplicationsCSV}
							exportScheduleName="Department-Applications Export"
							scheduleEntity="departments_applications"
						/>
						<button
							className="appsad"
							onClick={() => refreshReduxState()}
							style={{
								width: "50px",
							}}
						>
							<img
								className="w-100 h-100 m-auto"
								src={refresh_icon}
							/>
						</button>
						{showHide ? (
							<AddUsersApplicationsToDepartments
								isOpen={showHide}
								handleClose={addHideAppClose}
								handleSubmit={addApplicationToDepartments}
								submitting={submitting}
								department={props.department_name}
								id={id}
							/>
						) : null}
						{showColumnsModal ? (
							<>
								<div className="modal-backdrop show"></div>
								<div className="modal d-block">
									<ColumnRenderingModal
										handleSubmit={handleSubmit}
										show={showHide}
										onHide={addHideAppClose}
										submitting={submitInProgress}
										listOfColumns={listOfColumns}
										setListOfColumns={setListOfColumns}
										columnsMapper={columnsMapper}
										style={{ zIndex: "1" }}
										usedColumns={usedColumns}
										metaData={metaData}
										keyField={"_id"}
									/>
								</div>
							</>
						) : null}
						{showFilterModal ? (
							<>
								<div className="modal-backdrop show"></div>
								<div className="modal d-block">
									<FilterRenderingModal
										handleSubmit={handleSubmit}
										show={showHide}
										onHide={addHideAppClose}
										filterPropertyList={propertyList}
										appliedFilters={metaData?.filter_by}
										metaData={metaData}
										submitting={submitInProgress}
										style={{ zIndex: "1" }}
										appSourceList={appSourceList}
									/>
								</div>
							</>
						) : null}
					</div>
				</div>
			</div>
			{
				<Chips
					searchQuery={searchQuery}
					text={"Apps"}
					metaData={metaData}
					isInfiniteTable={true}
				/>
			}
			{tablemode && (
				<OldInfiniteTable
					checked={checked}
					setChecked={setChecked}
					data={data}
					metaData={metaData}
					handleLoadMore={handleLoadMore}
					columnsMapper={columnsMapper}
					apiDataKey={apiDataKey}
					keyField="app_id"
					emptyState={
						searchQuery ? (
							<EmptySearch searchQuery={searchQuery} />
						) : showErrorModal ? (
							<ErrorComponent />
						) : (
							<Empty isDepartmentApplication={true} />
						)
					}
					searchQuery={searchQuery}
					isLoadingData={isLoadingData}
					hasMoreData={hasMoreData}
					type={ENTITIES.DEPARTMENT}
					allowFewSpecialCharacters={true}
				/>
			)}
			{showError && (
				<ErrorModal
					isOpen={showError}
					handleClose={() => {
						setShowError(false);
						setError(null);
					}}
					errorMessage={error}
				/>
			)}
		</>
	);
}
