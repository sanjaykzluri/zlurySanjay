import React, { useState, useRef, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import "./Applications.css";
import search from "../../../assets/search.svg";
import Add from "../../../assets/add.svg";
import {
	markAsNotActive,
	updateManualUsage,
	addManualUsage,
	markAsActive,
	getUserApplicationPropertiesList,
	exportUserApplicationCSV,
	getUserApplicationsV2,
	getUserApplicationSpendTrend,
	getUserApplicationCostTrend,
	bulkArchiveUserApps,
	bulkUnarchiveUserApps,
} from "../../../services/api/users";
import { DottedProgress } from "../../../common/DottedProgress/DottedProgress";
import {
	checkSpecialCharacters,
	searchDepAppSource,
	searchUserApplicationsV2,
} from "../../../services/api/search";
import { client } from "../../../utils/client";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { debounce, unescape, isEmpty } from "../../../utils/common";
import { kFormatter } from "../../../constants/currency";
import { EmptySearch } from "../../../common/EmptySearch";
import { Empty } from "../../Applications/AllApps/Empty.js";
import { AddApplicationModal } from "./Modals/AddApplicationModal";
import { SourcesFormatter } from "../../../modules/shared/components/ManualUsage/TableFormatter/SourcesFormatter";
import { OptionsFormatter } from "../../../modules/shared/components/ManualUsage/TableFormatter/OptionsFormatter";
import refresh_icon from "../../../assets/icons/refresh.svg";
import check from "../../../assets/applications/check.svg";
import UserLogHistory from "../ActionLogHistory/ActionLogHistory";
import { fetchUserApplicationsActionHistory } from "../redux";
import { ErrorModal } from "../../../modules/shared/components/ManualUsage/ErrorModal/ErrorModal";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { format, timeSince } from "../../../utils/DateUtility";
import CSV from "../../Uploads/CSV.svg";
import { getAllCustomFieldService } from "../../../modules/custom-fields/service/api";
import RoleContext from "../../../services/roleContext/roleContext";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../../common/restrictions";
import moment from "moment";
import ActivityGraph from "../../../UIComponents/ActivityGraph/ActivityGraph";
import UsageActivityTabs from "../../../modules/shared/components/UsageActivity/UsageActivityTabs";
import UserAppMetaInfoCard from "../../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import InlineLicenceAssg from "../../LicenceAssignment/InlineLicenceAssg";
import RoleAssignment from "../../RoleAssignment/RoleAssignment";
import _ from "underscore";
import {
	ARCHIVE_FIELD_CONSTANTS,
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../common/infiniteTableUtil";
import { TriggerIssue } from "../../../utils/sentry";
import FilterIcons from "../../../common/filterIcons";
import { preventScroll } from "../../../actions/ui-action";
import { ColumnRenderingModal } from "./Modals/ColumnRenderingModal";
import { FilterRenderingModal } from "./Modals/FiltersRenderer/FilterRenderingModal";
import OldInfiniteTable from "../../../common/oldInfiniteTable";
import AppTableComponent from "../../../common/AppTableComponent";
import Chips from "./Modals/FiltersRenderer/Chip";
import { ACTION_TYPE } from "./Modals/FiltersRenderer/redux";
import { push } from "connected-react-router";
import { ErrorComponent } from "../../../common/ErrorComponnet";
import dayjs from "dayjs";
import { ChangeOwner } from "../../Applications/Overview/ChangeOwner";
import { updateAppOwner } from "../../../services/api/applications";
import { SCREEN_TAG_MAP } from "../../../constants/views";
import { SearchInputArea } from "../../searchInputArea";
import SpendCostTrend, {
	HeaderFormatter,
	spendCostTrendType,
} from "../../../modules/spendvscost/components/SpendCostTrend";
import Rating from "../../Applications/SecurityCompliance/Rating";
import { SecurityThreatFormatter } from "../../../modules/security/components/CriticalUsers/CriticalUsers";
import activeStatusWithoutSource from "../../../assets/activeStatusWithoutSource.svg";
import inactiveStatusWithoutSource from "../../../assets/inactiveStatusWithoutSource.svg";
import { defaults, ENTITIES } from "../../../constants";
import { CategoryFormatter } from "../../../modules/applications/components/table/AppCategoryFormatter";
import ExportModal from "../../../common/Export/ExportModal";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import { Dropdown } from "react-bootstrap";
import rightarrow from "assets/users/rightarrow.svg";
import BulkUpdateModal from "common/BulkEditModal";
import { showNotificationCard } from "modules/licenses/utils/LicensesUtils";

const bulk_edit_menu = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer autho__dd__cont mt-auto mb-auto text-decoration-none"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
		style={{ width: "100px" }}
	>
		{children}
	</a>
));

const inner_bulk_edit_dropdown = React.forwardRef(
	({ children, onClick }, ref) => (
		<a
			className="cursor-pointer insidedropdown__allapps__table"
			ref={ref}
			onClick={(e) => onClick(e)}
		>
			{children}
		</a>
	)
);
export function AppsUsers(props) {
	const [showHideFilter, setshowHideFilter] = useState(false);
	const location = useLocation();
	const [searchQuery, setSearchQuery] = useState();
	const [refreshTableDueToUsage, setRefreshTableDueToUsage] = useState(false);
	const [apiDataKey, setApiDataKey] = useState("apps");
	const [submitting, setSubmitting] = useState(false);
	const userId = window.location.pathname.split("/")[2];
	const cancelToken = useRef();
	let addHideFilterClose = () => setshowHideFilter(false);
	const dispatch = useDispatch();
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [showActionHistory, setShowActionHistory] = useState(false);
	const actionHistory = useSelector(
		(state) => state.userApplicationsActionHistory
	);
	const { isViewer } = useContext(RoleContext);
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);

	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [manualRefresh, setManualRefresh] = useState(false);
	const [data, setData] = useState([]);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [refreshTable, setRefreshTable] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);
	const [metaData, setMetaData] = useState();
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [shouldConcat, setShouldConcat] = useState(false);
	const [checked, setChecked] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [showHide, setshowHide] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [formErrors, setFormErrors] = useState([]);
	const [rowDetails, setRowDetails] = useState();
	const [showUsageActivity, setShowUsageActivity] = useState(false);
	const [appSourceList, setAppSourceList] = useState();
	const [selectedData, setSelectedData] = useState([]);
	const [showBulkUpdateArchiveModal, setShowBulkUpdateArchiveModal] =
		useState(false);
	const [isLoadingSources, setIsLoadingSources] = useState(true);

	const [archiveType, setArchiveType] = useState("");
	const handleRowClick = (
		row,
		interColumnsStateObject,
		setInterColumnsStateObject
	) => {
		setShowUsageActivity(true);
		setRowDetails({
			row,
			interColumnsStateObject,
			setInterColumnsStateObject,
		});
	};
	const query = useSelector((state) => state.router.location.query);
	const router = useSelector((state) => state.router);
	const { hash, pathname } = router.location;
	const [showErrorModal, setShowErrorModal] = useState(false);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(
					query,
					reqBody,
					ARCHIVE_FIELD_CONSTANTS.APPLICATION,
					"Application Archive"
				);
			} catch {
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
			}
			setReqBody({ ...reqObj });
		} else if (!query.metaData) {
			dispatch({ type: ACTION_TYPE.RESET_FILTERS });
			setReqBody({ ...defaultReqBody });
		}
		handleRefresh();
	}, [query]);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(
					query,
					reqBody,
					ARCHIVE_FIELD_CONSTANTS.APPLICATION,
					"Application Archive"
				);
			} catch {
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
			}
		}
		!isLoadingData && loadData(reqObj);
	}, [pageNo, refreshTable]);

	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
			setIsLoadingData(false);
		}
		if (searchQuery) {
			fetchDataFn();
			reqBody.filter_by = [];
			query.metaData &&
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
		} else if (searchQuery === "") {
			reqBody.filter_by = [];
			handleRefresh();
			setReqBody(reqBody);
			reqBody.filter_by = [];
			query.metaData &&
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
		}
	}, [searchQuery]);

	function handleLoadMore() {
		setShouldConcat(true);
		if (isLoadingData) return;
		setShouldConcat(true);
		setPageNo((pageNo) => {
			return pageNo + 1;
		});
	}

	function handleRefresh() {
		setData([]);
		setPageNo(0);
		setMetaData();
		setRefreshTable(!refreshTable);
		setHasMoreData(true);
		setShowErrorModal(false);
	}

	async function loadData(reqBody) {
		if (isEmpty(reqBody.filter_by) && searchQuery) {
			const searchObj = getSearchReqObj(
				searchQuery,
				"app_name",
				"Application Name"
			);
			reqBody.filter_by = [searchObj];
		}
		reqBody.screen_tag = SCREEN_TAG_MAP.user_app;
		setIsLoadingData(true);
		try {
			const response = await getUserApplicationsV2(
				userId,
				reqBody,
				pageNo,
				defaults.ALL_APPLICATIONS_ROW
			);
			const totalLoadedRecords = data.length + response.data.length;
			if (totalLoadedRecords === response.meta.total) {
				setHasMoreData(false);
			} else {
				!hasMoreData && setHasMoreData(true);
			}
			let newData = shouldConcat
				? [...data, ...response.data]
				: response.data;
			setIsLoadingData(false);
			setData(newData);
			setMetaData(response.meta);
		} catch (error) {
			setIsLoadingData(false);
			setHasMoreData(false);
			setMetaData(reqBody);
			setShowErrorModal(true);
		}
	}

	const fetchDataFn = () => {
		setData([]);
		setMetaData();
		if (checkSpecialCharacters(searchQuery, true)) {
			setHasMoreData(false);
		} else {
			setIsLoadingData(true);
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"app_name",
				"Applications Name"
			);
			reqBody.filter_by = [searchObj];
			searchUserApplicationsV2(userId, reqBody, cancelToken.current)
				.then((response) => {
					if (response.data.length < defaults.MINIMUM_ROW) {
						setHasMoreData(false);
					}
					setReqBody(reqBody);
					setData(response.data);
					setMetaData(response.meta);
					setIsLoadingData(false);
					window.analytics.track(
						"Search Application-Users Results Displayed",
						{
							searchQuery: searchQuery,
							currentCategory: "Applications",
							currentPageName: "Applications-Users",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue(
							"Error in searching users of applications",
							error
						);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

	useEffect(() => {
		async function getAppSourceList() {
			const appSources = await searchDepAppSource(
				userId,
				undefined,
				"user"
			);
			setAppSourceList(appSources);
			setIsLoadingSources(false);
		}
		getAppSourceList();
	}, []);

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
	}

	const addHideAppClose = () => {
		setshowHide(false);
		setShowColumnsModal(false);
		setShowFilterModal(false);
	};

	const columnsMapper = {
		application: {
			dataField: "app_name",
			text: "Application",
			sortKey: "app_name",
			formatter: (row, data) => (
				<div
					className={`d-flex flex-row align-items-center ${
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}`}
				>
					<AppTableComponent
						app_name={data?.app_name}
						app_logo={data?.app_logo}
						app_auth_status={data?.app_state}
						app_id={data?.app_id}
						app_status={data?.app_status}
						logo_height="auto"
						logo_width={28}
						tooltipClassName="appMetaInfoCard MetaInfoCard"
						customTooltip={
							<UserAppMetaInfoCard
								title={data?.app_name}
								description={data?.app_short_description}
								isActive={data?.app_status === "active"}
								app_status={data?.app_status}
								isUser={false}
								row={data}
							/>
						}
					/>
				</div>
			),
		},
		app_status: {
			dataField: "user_app_status",
			sortKey: "user_app_status",
			text: "User Application Status",
			formatter: (data, row) => (
				<div
					className={
						_.isString(data) &&
						data?.toLocaleLowerCase() &&
						(row.user_app_status || row.user_status) === "active"
							? "flex flex-row center"
							: "flex flex-row center o-6"
					}
				>
					{!row.source_status_available ? (
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
									We do not get user status from the direct
									integration. It needs to be identified
									manually.
								</Tooltip>
							}
						>
							<div>
								{typeof data === "string" &&
								data?.toLocaleLowerCase() === "active" ? (
									<img src={activeStatusWithoutSource}></img>
								) : (
									<img
										src={inactiveStatusWithoutSource}
										alt=""
									/>
								)}
							</div>
						</OverlayTrigger>
					) : (
						<>
							{typeof data === "string" &&
							data?.toLocaleLowerCase() === "active" ? (
								<img src={check}></img>
							) : (
								<img src={inactivecheck} alt="" />
							)}
						</>
					)}
					<div
						className="flex flex-row justify-content-center align-items-center text-nowrap"
						style={{ marginLeft: "8px" }}
					>
						{_.isString(data) &&
						!!data &&
						data?.toLowerCase() === "active"
							? "In Use"
							: data?.toLowerCase() === "suspended"
							? "Suspended"
							: "Not in use"}
					</div>
				</div>
			),
		},
		user_app_cost: {
			dataField: "user_app_cost",
			sortKey: "user_app_cost",
			text: "Cost [YTD]",
			headerFormatter: (row, data) => (
				<HeaderFormatter
					text={"Cost [YTD]"}
					type={spendCostTrendType.COST}
				></HeaderFormatter>
			),
			formatter: (row, data) => (
				<div
					className={`d-flex flex-row align-items-center ${
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}`}
				>
					<SpendCostTrend
						trendAPI={getUserApplicationCostTrend}
						type={spendCostTrendType.COST}
						id={data?.app_id}
						value={data?.user_app_cost}
						outerId={userId}
					/>
				</div>
			),
		},
		user_app_total_spend: {
			dataField: "user_app_total_spend",
			text: "Spend [YTD]",
			sortKey: "user_app_total_spend",
			headerFormatter: (row, data) => (
				<HeaderFormatter
					text={"Spend [YTD]"}
					type={spendCostTrendType.SPEND}
				></HeaderFormatter>
			),
			formatter: (row, data) => (
				<div
					className={`d-flex flex-row align-items-center ${
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}`}
				>
					<SpendCostTrend
						trendAPI={getUserApplicationSpendTrend}
						type={spendCostTrendType.SPEND}
						id={data?.app_id}
						value={data?.user_app_total_spend}
						outerId={userId}
					/>
				</div>
			),
		},

		user_app_avg_spend: {
			dataField: "user_app_avg_spend",
			text: "Spend/Month",
			sortKey: "user_app_avg_spend",
			formatter: (row, data) => (
				<div
					className={`d-flex flex-row align-items-center ${
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}`}
				>
					{kFormatter(data.user_app_avg_spend)}
				</div>
			),
		},
		license_details: {
			dataField: "license_name",
			text: "License",
			sortKey: "license_name",
			formatter: (row, data) => (
				<div className="d-flex flex-row align-items-center">
					<InlineLicenceAssg
						isNotActive={data.user_app_status !== "active"}
						licences={data.contracts}
						appId={data.app_id}
						appName={data.app_name}
						appLogo={data.app_logo}
						users={[
							{
								user_image: props.user_image,
								user_name: props.user_name,
								user_id: userId,
								user_app_role: data.user_app_role,
								user_licenses: data?.contracts,
							},
						]}
						refresh={handleRefresh}
						isTableCell={true}
					/>
				</div>
			),
		},
		user_app_role: {
			dataField: "user_app_role",
			text: "Role",
			sortKey: "user_app_role",
			formatter: (row, data) => (
				<div className="d-flex flex-row align-items-center">
					<RoleAssignment
						isNotActive={data.user_app_status !== "active"}
						currentRoles={[data.user_app_role]}
						userIds={[userId]}
						appId={data.app_id}
						refresh={handleRefresh}
					/>
				</div>
			),
		},
		app_risk_level: {
			dataField: "app_risk_level",
			text: "Risk Level",
			sortKey: "app_risk_level",
			formatter: (row, data) => (
				<div
					className={
						"flex flex-row align-items-center" &&
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}
				>
					<Rating
						rating={Math.ceil(data.app_risk_level)}
						iconType="risk"
						singleIcon={true}
						width={12}
						height={12}
					/>
					<div className="font-13 pl-1" style={{ paddingTop: "1px" }}>
						{`Level ${data.app_risk_level || 0}`}
					</div>
				</div>
			),
		},
		user_app_risk: {
			dataField: "user_app_risk",
			text: "Threat",
			sortKey: "user_app_risk",
			formatter: (data, row) => (
				<div
					className={
						(data?.user_app_status || data?.user_status) ===
						"active"
							? ""
							: "o-6"
					}
				>
					<SecurityThreatFormatter threat={data?.user_app_risk} />
				</div>
			),
		},
		activity_trend: {
			dataField: "user_app_sources_data",
			text: "Activity",
			formatter: (data, row) => (
				<ActivityGraphCell row={row} data={data} />
			),
		},
		owner: {
			dataField: "app_owner_name",
			sortKey: "app_owner_name",
			text: "Owner",
			displayName: "b",
			formatter: (data, row) => (
				<ChangeOwner
					isNotActive={row.user_app_status !== "active"}
					fieldName="owner"
					updateFunc={(appId, patchObj) =>
						updateAppOwner(
							appId,
							Array.isArray(patchObj?.patches)
								? patchObj.patches[0].value
								: ""
						)
					}
					userId={row.app_owner_id}
					userName={row.app_owner_name}
					userImage={row.app_owner_profile}
					userAccountType={row.app_owner_account_type}
					idFromTable={row.app_id}
					isAppTable={true}
					ownerNameStyle="truncate_10vw"
					refreshReduxState={() => {
						handleRefresh();
					}}
				/>
			),
		},
		user_app_last_used: {
			dataField: "user_app_last_used",
			text: "Last Used",
			sortKey: "user_app_last_used",
			formatter: (row, data) => (
				<div
					className={`d-flex flex-row align-items-center ${
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}`}
				>
					{data.user_app_last_used
						? `${timeSince(data.user_app_last_used)} ago`
						: "-"}
				</div>
			),
		},
		user_app_discovered: {
			dataField: "user_app_discovered",
			sortKey: "user_app_discovered",
			text: "Discovered On",
			formatter: (row, data) => {
				if (data) {
					return (
						<>
							<div
								className={`d-flex flex-row align-items-center ${
									(data.user_app_status ||
										data.user_status) === "active"
										? ""
										: "o-6"
								}`}
							>
								{data.user_app_discovered
									? dayjs(data.user_app_discovered).format(
											"D MMM YYYY"
									  )
									: "-"}
							</div>
						</>
					);
				}
			},
		},
		user_app_avg_usage: {
			dataField: "user_app_avg_usage",
			sortKey: "user_app_avg_usage",
			text: "Usage",
			formatter: (row, data) => (
				<DottedProgress
					isNotActive={data.user_app_status !== "active"}
					value={data.user_app_avg_usage || 0}
				></DottedProgress>
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
						isUserAppActive={
							(row.user_app_status || row.app_user_status) ===
							"active"
						}
						user_name={props.user_name}
						user_image={props.user_image}
						app_name={row.app_name}
						app_logo={row.app_logo}
						user_app_id={row.user_app_id}
						app_id={row.app_id}
						completeRow={row}
						user_id={location.pathname.split("/")[2]}
						is_manual_source_present={row.is_manual_source_present}
						interColumnsStateObject={interColumnsStateObject}
						setInterColumnsStateObject={setInterColumnsStateObject}
						org_user_app_source_types="user_app_source_types"
						org_user_app_sources="user_app_sources"
						isUser={false}
						updateManualUsage={updateManualUsage}
						refresh={refreshReduxState}
					/>
				</div>
			),
		},
		app_type: {
			dataField: "app_type",
			sortKey: "app_type",
			text: "Type",
			formatter: (row, data) => (
				<span
					className={`d-flex flex-row align-items-center text-capitalize ${
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}`}
				>
					{data.app_type}
				</span>
			),
		},
		category: {
			dataField: "app_sub_categories",
			sortKey: "app_sub_categories",
			text: "Category",
			formatter: (row, data) => (
				<>
					<CategoryFormatter
						isNotActive={data.user_app_status !== "active"}
						data={data}
						handleRefresh={handleRefresh}
					/>
				</>
			),
		},
		ellipsis: {
			formatter: (
				cell,
				row,
				interColumnsStateObject,
				setInterColumnsStateObject
			) => (
				<OptionsFormatter
					row={row}
					isActive={row.user_app_status === "active"}
					interColumnsStateObject={interColumnsStateObject}
					setInterColumnsStateObject={setInterColumnsStateObject}
					org_user_app_id="user_app_id"
					org_user_app_status="user_app_status"
					isUser={false}
					markAsNotActive={markAsNotActive}
					markAsActive={markAsActive}
					refresh={refreshReduxState}
					style={{ left: "-190px", transform: "translateX(0px)" }}
				/>
			),
		},
	};

	function clickedOnApplication(id, name) {
		//Segment Implementation
		window.analytics.track("Clicked on Single Application", {
			currentCategory: "Users",
			currentPageName: "User-Applications",
			clickedApplicationId: id,
			clickedApplicationName: name,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}

	useDidUpdateEffect(() => {
		if (refreshTable || refreshTableDueToUsage) {
			handleRefresh();
			setRefreshTableDueToUsage(false);
		}
	}, [searchQuery, refreshTableDueToUsage]);

	const resetKey = () => {
		if (searchQuery.length === 0) {
			if (cancelToken.current)
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			setTimeout(() => {
				setApiDataKey("apps");
			}, 500);
		}
	};

	const [showError, setShowError] = useState(false);
	const [error, setError] = useState(null);

	const handleSearchQueryChange = debounce(setSearchQuery, 200);

	const handleAddApplicationToUser = async ({
		app_id,
		frequency,
		interval,
	}) => {
		try {
			const userId = location.pathname.split("/")[2];
			setSubmitting(true);
			const res = await addManualUsage(
				userId,
				app_id,
				frequency,
				interval
			);
			// console.log(res);
			if (res.status === "success") {
				setSubmitting(false);
				setRefreshTableDueToUsage(true);
				refreshReduxState();
			}
		} catch (err) {
			setSubmitting(false);
			setAddModalOpen(false);
			if (err.response.data.errors?.includes("user is inactive")) {
				setError("You cannot set manual usage for inactive user");
			} else if (
				err.response.data.errors?.includes("application is inactive")
			) {
				setError(
					"You cannot set manual usage for inactive application"
				);
			} else {
				setError(err.message);
			}
			setShowError(true);
		}
	};

	function getActionHistory(appId) {
		const id = location.pathname.split("/")[2];
		dispatch(fetchUserApplicationsActionHistory(id, appId));
		setShowActionHistory(true);
	}

	useEffect(() => {
		//Segment Implementation
		if (props.user_name) {
			window.analytics.page("Users", "User-Applications", {
				user_name: props.user_name,
				user_id: location.pathname.split("/")[2],
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, []);

	const refreshReduxState = () => {
		!isLoadingData && handleRefresh();
	};

	const id = location.pathname.split("/")[2];
	const [showExportModal, setShowExportModal] = useState(false);
	const [showInProgressModal, setShowInProgressModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [propertyList, setPropertyList] = useState([]);
	const [customFields, setCustomFields] = useState([]);
	const [searchPropertyList, setSearchPropertyList] = useState("");

	useEffect(() => {
		if (loading) {
			getUserApplicationPropertiesList().then((res) => {
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
	const customFieldsNames = customFields.map((field) => field?.field_name);
	const defaultExportObj = {
		filter_by: [],
		file_type: "csv",
		columns_required: ["app_name"],
	};

	const [exportRequestObj, setExportRequestObj] = useState({
		...defaultExportObj,
	});

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
					{showColumnsModal && (
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
									usedColumns={metaData?.columns}
									metaData={metaData}
									keyField={"_id"}
								/>
							</div>
						</>
					)}
					{showFilterModal && (
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
									validationErrors={formErrors}
									clearValidationErrors={() =>
										setFormErrors([])
									}
									style={{ zIndex: "1" }}
									appSourceList={appSourceList}
									isLoadingSources={isLoadingSources}
								/>
							</div>
						</>
					)}
				</div>
				<div className="Uploads__right">
					{checked.length > 0 && (
						<Dropdown>
							<Dropdown.Toggle as={bulk_edit_menu}>
								<div className="grey">Bulk Edit</div>
								<img
									src={arrowdropdown}
									style={{ marginLeft: "8px" }}
								/>
							</Dropdown.Toggle>
							<Dropdown.Menu className="p-0">
								<Dropdown>
									<Dropdown.Toggle
										as={inner_bulk_edit_dropdown}
									>
										<div className="grey">
											Archive/Unarchive
										</div>
										<img
											src={rightarrow}
											style={{ marginLeft: "8px" }}
										/>
									</Dropdown.Toggle>
									<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
										<Dropdown.Item
											onClick={() => {
												setShowBulkUpdateArchiveModal(
													true
												);
												setArchiveType("archive");
											}}
										>
											<div className="d-flex flex-row align-items-center">
												Archive
											</div>
										</Dropdown.Item>
										<Dropdown.Item
											onClick={() => {
												setShowBulkUpdateArchiveModal(
													true
												);
												setArchiveType("unarchive");
											}}
										>
											<div className="d-flex flex-row align-items-center">
												Unarchive
											</div>
										</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</Dropdown.Menu>
						</Dropdown>
					)}
					<div className="inputWithIconApps">
						<SearchInputArea
							placeholder="Search Applications"
							setSearchQuery={setSearchQuery}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					<div className="d-flex flex-row">
						<ExportModal
							title="Export User App Data"
							show={showExportModal}
							onHide={() => setShowExportModal(false)}
							propertyList={propertyList}
							mandatoryFieldId="app_name"
							mandatoryFieldName="Application Name"
							hiddenPropertiesArray={[
								"app_id",
								"app_name",
								"app_owner_id",
								"app_sub_categories.sub_category_id",
							]}
							customFieldPropertyId="app_custom_fields"
							customFieldEntity="applications"
							exportEntity="Applications"
							selectedDataFieldId="app_id"
							selectedData={checked}
							metaData={metaData}
							id={id}
							exportCSV={exportUserApplicationCSV}
							exportScheduleName="User-Applications Export"
							scheduleEntity="users_applications"
						/>
						{!isViewer && (
							<button
								className="appsad mr-3"
								onClick={() => setAddModalOpen(true)}
							>
								<img src={Add} />
								<span id="te">Add</span>
							</button>
						)}
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
					</div>
				</div>
			</div>
			<Chips
				searchQuery={searchQuery}
				text={"Applications"}
				metaData={metaData}
				isInfiniteTable={true}
			/>
			<AddApplicationModal
				handleClose={() => setAddModalOpen(false)}
				isOpen={addModalOpen}
				handleSubmit={handleAddApplicationToUser}
				submitting={submitting}
			/>
			{showActionHistory && actionHistory && (
				<UserLogHistory
					historyType="user_app"
					actionHistory={actionHistory}
					onHide={() => setShowActionHistory(false)}
				/>
			)}
			<OldInfiniteTable
				checked={checked}
				setChecked={setChecked}
				data={data}
				metaData={metaData}
				handleLoadMore={handleLoadMore}
				columnsMapper={columnsMapper}
				keyField="app_id"
				emptyState={
					searchQuery ? (
						<EmptySearch searchQuery={searchQuery} />
					) : showErrorModal ? (
						<ErrorComponent />
					) : (
						<Empty isUserApplication />
					)
				}
				searchQuery={searchQuery}
				isLoadingData={isLoadingData}
				hasMoreData={hasMoreData}
				handleRowClick={handleRowClick}
				propsInterColumnsStateObject={{
					setRefreshTableDueToUsage: setRefreshTableDueToUsage,
					getActionHistory,
				}}
				allowFewSpecialCharacters={true}
				selectedData={selectedData}
				setSelectedData={setSelectedData}
			/>
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
			{showUsageActivity && (
				<UsageActivityTabs
					closeUsageAcivity={() => setShowUsageActivity(false)}
					isUser={false}
					user_id={location.pathname.split("/")[2]}
					user_name={props.user_name}
					user_image={props.user_image}
					app_name={rowDetails.row.app_name}
					app_image={rowDetails.row.app_logo}
					rowDetails={{
						...rowDetails,
						...{
							row: {
								...rowDetails.row,
								...{
									user_id: location.pathname.split("/")[2],
									user_name: props.user_name,
									user_profile: props.user_image,
								},
							},
						},
					}}
					refresh={() => {
						refreshReduxState();
						setShowUsageActivity(false);
					}}
					updateManualUsage={updateManualUsage}
				/>
			)}
			{showBulkUpdateArchiveModal && (
				<BulkUpdateModal
					isOpen={showBulkUpdateArchiveModal}
					// ArchiveFunc={archiveUsers}
					updateFunc={
						archiveType === "archive"
							? bulkArchiveUserApps
							: bulkUnarchiveUserApps
					}
					successResponse={() => {
						setChecked([]);
						showNotificationCard();
						handleRefresh();
					}}
					closeModal={() => {
						setShowBulkUpdateArchiveModal(false);
					}}
					selectedData={selectedData}
					name={props.user_name}
					parentId={location.pathname.split("/")[2]}
					modalType={"archive"}
					type={"app"}
					tooltipInfo={"app_name"}
					additionalCheckPresent={true}
					archiveType={archiveType}
					api_entity={"user_app_ids"}
					secondary_key={"app_ids"}
				></BulkUpdateModal>
			)}
		</>
	);
}

export function ActivityGraphCell({ row, data }) {
	return (
		<div
			className={
				(row.user_app_status || row.user_status) === "active"
					? ""
					: "o-6"
			}
		>
			{(row.user_app_sources_data &&
				Array.isArray(row.user_app_sources_data) &&
				row.user_app_sources_data?.length > 0) ||
			row.user_app_last_sync ? (
				<>
					{row.user_app_sources_data &&
						Array.isArray(row.user_app_sources_data) &&
						row.user_app_sources_data?.length > 0 && (
							<ActivityGraph
								data={row.user_app_sources_data}
								dataKey="timestamp"
							/>
						)}

					{row.user_app_last_sync ? (
						<div className="font-10 grey-1">
							Last updated on{" "}
							{moment(row.user_app_last_sync).fromNow()}
						</div>
					) : null}
				</>
			) : (
				<div className="font-10 grey-1 bold-normal">
					No Recent Data Available
				</div>
			)}
		</div>
	);
}
