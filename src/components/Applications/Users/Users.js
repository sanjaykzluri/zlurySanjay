import React, { useState, useEffect, useRef, useContext } from "react";
import { UsersFilter } from "./UsersFilter";
import { Col, Form, Row, Button } from "react-bootstrap";
import {
	capitalizeFirstLetter,
	debounce,
	isEmpty,
	unescape,
	urlifyImage,
} from "../../../utils/common";
import {
	exportApplicationUserCSV,
	getApplicationUsersCostTrend,
	getApplicationUsersSpendTrend,
	getApplicationUsersV2,
	getAppUserPropertiesList,
} from "../../../services/api/applications";
import { getAllCustomFieldService } from "../../../modules/custom-fields/service/api";
import { useDispatch, useSelector } from "react-redux";
import {
	ARCHIVE_FIELD_CONSTANTS,
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../common/infiniteTableUtil";
import { defaults } from "../../../constants";
import {
	checkSpecialCharacters,
	searchApplicationUsersV2,
	searchDepAppSource,
} from "../../../services/api/search";
import { client } from "../../../utils/client";
import group from "../../../assets/users/group.svg";
import service from "../../../assets/users/service.svg";
import { userType } from "../../../constants/users";
import { TriggerIssue } from "../../../utils/sentry";
import { Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import UserAppMetaInfoCard from "../../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import check from "../../../assets/applications/check.svg";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import OldInfiniteTable from "../../../common/oldInfiniteTable";
import { EmptySearch } from "../../../common/EmptySearch";
import { UsersEmpty } from "../../Users/UsersEmpty";
import { kFormatter } from "../../../constants/currency";
import InlineLicenceAssg from "../../LicenceAssignment/InlineLicenceAssg";
import RoleAssignment from "../../RoleAssignment/RoleAssignment";
import { getDateDiff, timeSince } from "../../../utils/DateUtility";
import UsageActivityTabs from "../../../modules/shared/components/UsageActivity/UsageActivityTabs";
import {
	markAsActive,
	markAsNotActive,
	updateManualUsage,
} from "../../../services/api/users";
import { SourcesFormatter } from "../../../modules/shared/components/ManualUsage/TableFormatter/SourcesFormatter";
import { OptionsFormatter } from "../../../modules/shared/components/ManualUsage/TableFormatter/OptionsFormatter";
import ActionLogHistory from "../../Users/ActionLogHistory/ActionLogHistory";
import { fetchUserApplicationsActionHistory } from "../../Users/redux";
import { ActivityGraphCell } from "../../Users/Applications/Applications";
import { ACTION_TYPE } from "../../Users/Applications/Modals/FiltersRenderer/redux";
import { push } from "connected-react-router";
import { ErrorComponent } from "../../../common/ErrorComponnet";
import { NameBadge } from "../../../common/NameBadge";
import {
	Dots,
	DottedProgress,
} from "../../../common/DottedProgress/DottedProgress";
import { SCREEN_TAG_MAP } from "../../../constants/views";
import dayjs from "dayjs";
import SpendCostTrend, {
	HeaderFormatter,
	spendCostTrendType,
} from "../../../modules/spendvscost/components/SpendCostTrend";
import { SecurityThreatFormatter } from "../../../modules/security/components/CriticalUsers/CriticalUsers";
import Rating from "../SecurityCompliance/Rating";
import { getLicenseListForAnApp } from "../../../services/api/licenses";
import RoleContext from "services/roleContext/roleContext";
import { userRoles } from "constants/userRole";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";
import { getValueFromLocalStorage } from "utils/localStorage";
import { getOptimizationTableColumnGroups } from "modules/Optimization/utils/OptimizationUtils";

export function Users(props) {
	const { userRole } = useContext(RoleContext);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const { org_beta_features } = useSelector((state) => state.userInfo);
	useEffect(() => {
		//Segment Implementation
		if (props.application?.app_name) {
			window.analytics.page("Applications", "Application-Users", {
				app_name: props.application.app_name,
				app_id: props.application.app_id,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, []);

	const appId = window.location.pathname.split("/")[2];
	const [showExportModal, setShowExportModal] = useState(false);
	const [showInProgressModal, setShowInProgressModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [propertyList, setPropertyList] = useState([]);
	const [customFields, setCustomFields] = useState([]);
	const [searchPropertyList, setSearchPropertyList] = useState("");

	const [manualRefresh, setManualRefresh] = useState(false);
	const [searchQuery, setSearchQuery] = useState();
	const [data, setData] = useState([]);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [refreshTable, setRefreshTable] = useState(false);
	const cancelToken = useRef();
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);
	const [metaData, setMetaData] = useState();
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [shouldConcat, setShouldConcat] = useState(false);
	const [checked, setChecked] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);

	const [refreshTableDueToUsage, setRefreshTableDueToUsage] = useState(false);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [rowDetails, setRowDetails] = useState();
	const [showUsageActivity, setShowUsageActivity] = useState(false);
	const [showActionHistory, setShowActionHistory] = useState(false);
	const dispatch = useDispatch();
	const actionHistory = useSelector(
		(state) => state.userApplicationsActionHistory
	);

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

	const [selectedRows, setSelectedRows] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [selectedUsersLicences, setSelectedUsersLicenses] = useState([]);
	const [selectedUserIds, setSelectedUserIds] = useState([]);
	const [selectedUserRoles, setSelectedUserRoles] = useState([]);
	const [appSourceList, setAppSourceList] = useState();
	const [appLicenseList, setAppLicenseList] = useState();
	const [bulkEditSourceList, setBulkEditSourceList] = useState([]);

	useEffect(() => {
		setSelectedRows(checked);
		var licensesTempObj = [];
		var usersTempObj = [];
		var userIds = [];
		var user_app_roles = [];
		var user_sources = [];
		data.map((row) => {
			if (checked.includes(row.user_id)) {
				if (row.contracts && Array.isArray(row.contracts)) {
					licensesTempObj = [
						...new Set(licensesTempObj.concat(row.contracts)),
					];
					licensesTempObj = licensesTempObj.filter(
						(v, i, a) =>
							a.findIndex(
								(t) => t.license_id === v.license_id
							) === i
					);
				}
				if (row.source_array && Array.isArray(row.source_array)) {
					user_sources = [
						...new Set(user_sources.concat(row.source_array)),
					];
					user_sources = user_sources.filter(
						(v, i, a) =>
							a.findIndex((t) => t.keyword === v.keyword) === i
					);
				}
				usersTempObj.push({
					user_image: row.user_profile,
					user_name: row.user_name,
					user_id: row.user_id,
					user_app_role: row?.user_app_role,
					user_licenses: row?.contracts,
					user_sources: row?.source_array || [],
					_id: row?._id,
				});
				userIds.push(row.user_id);
				if (row?.user_app_role) {
					user_app_roles.push(row?.user_app_role);
				}
			}
		});
		let tempSources = [...user_sources];
		user_sources.forEach((el, i) => {
			let length = 0;
			usersTempObj.forEach((row) => {
				if (
					row.user_sources.some((obj) => obj.keyword === el.keyword)
				) {
					length = length + 1;
				}
			});

			if (length === usersTempObj.length) {
			} else {
				let index = tempSources.findIndex(
					(elem) => elem.keyword === el.keyword
				);
				tempSources.splice(index, 1);
			}
		});
		setSelectedUsers(usersTempObj);
		setSelectedUsersLicenses(licensesTempObj);
		setSelectedUserIds(userIds);
		setSelectedUserRoles(user_app_roles);
		setBulkEditSourceList(tempSources);
	}, [checked]);
	// console.log(bulkEditSourceList);
	const query = useSelector((state) => state.router.location.query);
	const router = useSelector((state) => state.router);
	const { hash } = router.location;
	const [showErrorModal, setShowErrorModal] = useState(false);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(
					query,
					reqBody,
					ARCHIVE_FIELD_CONSTANTS.USER,
					"User Archive"
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
					ARCHIVE_FIELD_CONSTANTS.USER,
					"User Archive"
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
		delete reqBody.user_search;
		if (isEmpty(reqBody.filter_by) && searchQuery) {
			const searchObj = getSearchReqObj(
				searchQuery,
				"user_name",
				"User Name"
			);
			const searchByEmailObj = getSearchReqObj(
				searchQuery,
				"user_email",
				"User Email"
			);
			reqBody.filter_by = [searchObj, searchByEmailObj];
		}
		if (searchQuery) {
			reqBody.user_search = true;
		}
		reqBody.screen_tag = SCREEN_TAG_MAP.app_user;
		setIsLoadingData(true);
		try {
			const response = await getApplicationUsersV2(
				appId,
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
				"user_name",
				"User Name"
			);
			const searchByEmailObj = getSearchReqObj(
				searchQuery,
				"user_email",
				"User Email"
			);
			reqBody.filter_by = [searchObj, searchByEmailObj];
			reqBody.user_search = true;
			reqBody.screen_tag = SCREEN_TAG_MAP.app_user;
			searchApplicationUsersV2(appId, reqBody, cancelToken.current)
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
			const appSources = await searchDepAppSource(appId);
			setAppSourceList(appSources);
		}
		getAppSourceList();
	}, []);

	useEffect(() => {
		async function getAppLicenseList() {
			const licenseList = await getLicenseListForAnApp(appId);
			setAppLicenseList(licenseList);
		}
		getAppLicenseList();
	}, [refreshTable]);

	function getActionHistory(_appId, userId) {
		dispatch(fetchUserApplicationsActionHistory(userId, appId));
		setShowActionHistory(true);
	}

	useEffect(() => {
		if (loading) {
			getAppUserPropertiesList().then((res) => {
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
					if (res.custom_fields.users != null) {
						setCustomFields(res.custom_fields.users);
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
		columns_required: ["user_name"],
		is_sample: false,
	};

	const [exportRequestObj, setExportRequestObj] = useState({
		...defaultExportObj,
	});

	const allCustomFieldsChecked = () => {
		let flag = true;
		customFieldsNames.forEach((cfName) => {
			if (!exportRequestObj.columns_required.includes(cfName)) {
				flag = false;
			}
		});
		return flag;
	};

	const handleExportCheck = (value) => {
		if (value === "user_custom_fields") {
			let temp1 = [];
			customFieldsNames.forEach((cfName) => {
				if (!exportRequestObj.columns_required.includes(cfName)) {
					temp1.push(cfName);
				}
			});
			if (temp1.length > 0) {
				let col = [...exportRequestObj.columns_required, ...temp1];
				let tempExportRequestObj = {
					...exportRequestObj,
					["columns_required"]: col,
				};
				setExportRequestObj(tempExportRequestObj);
			} else {
				let col = exportRequestObj.columns_required.filter(
					(el) => !customFieldsNames.includes(el)
				);
				let tempExportRequestObj = {
					...exportRequestObj,
					["columns_required"]: col,
				};
				setExportRequestObj(tempExportRequestObj);
			}
		} else {
			if (!exportRequestObj.columns_required.includes(value)) {
				let temp = [...exportRequestObj.columns_required];
				temp.push(value);
				let tempExportRequestObj = {
					...exportRequestObj,
					["columns_required"]: temp,
				};
				setExportRequestObj(tempExportRequestObj);
			} else {
				let temp = [...exportRequestObj.columns_required];
				temp = temp.filter((col) => col !== value);
				let tempExportRequestObj = {
					...exportRequestObj,
					["columns_required"]: temp,
				};
				setExportRequestObj(tempExportRequestObj);
			}
		}
	};

	let exportDataFields = Array.isArray(propertyList)
		? propertyList.map(
				(field) =>
					field.field_id !== "user_id" &&
					field.field_id !== "user_name" &&
					field.field_name
						.toLowerCase()
						.includes(searchPropertyList.toLowerCase()) && (
						<Form.Check
							className="pt-3"
							type="checkbox"
							label={`${capitalizeFirstLetter(field.field_name)}`}
							value={field.field_id}
							checked={exportRequestObj.columns_required.includes(
								field.field_id
							)}
							onClick={(e) => handleExportCheck(e.target.value)}
						/>
					)
		  )
		: [];

	exportDataFields.push(
		"Application User Custom Fields"
			.toLowerCase()
			.includes(searchPropertyList.toLowerCase()) && (
			<div hidden={customFieldsNames.length === 0}>
				<Form.Check
					className="pt-3"
					type="checkbox"
					label={`Application User Custom Fields`}
					value={"user_custom_fields"}
					checked={allCustomFieldsChecked()}
					onClick={(e) => handleExportCheck(e.target.value)}
				/>
			</div>
		)
	);

	let exportCustomFields = Array.isArray(customFields)
		? customFields.map(
				(field) =>
					field.field_name
						.toLowerCase()
						.includes(searchPropertyList) && (
						<Form.Check
							className="pt-3 ml-3"
							type="checkbox"
							label={`${capitalizeFirstLetter(field.field_name)}`}
							value={field.field_name}
							checked={exportRequestObj.columns_required.includes(
								field.field_name
							)}
							onClick={(e) => handleExportCheck(e.target.value)}
						/>
					)
		  )
		: [];

	useEffect(() => {
		//Segment Implementation
		if (showInProgressModal) {
			window.analytics.track("Exporting Data in Progress", {
				currentCategory: "Applications",
				currentPageName: "Application-Users; Export",
				checked: props.checked,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [showInProgressModal]);

	useEffect(() => {
		//Segment Implementation
		if (showExportModal) {
			window.analytics.page(
				"Applications",
				"Application-Users; Export App Data",
				{
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [showExportModal]);

	const exportSelectedUsers = () => {
		let tempExportRequestObj = { ...exportRequestObj, ["filter_by"]: [] };
		tempExportRequestObj.filter_by.push({
			field_values: checked,
			field_id: "user_id",
			filter_type: "objectId",
			negative: false,
			is_custom: false,
		});
		setExportRequestObj(tempExportRequestObj);
	};

	const exportFilteredUsers = () => {
		let tempExportRequestObj = {
			...exportRequestObj,
			["filter_by"]: [...metaData?.filter_by],
		};
		setExportRequestObj(tempExportRequestObj);
	};

	function userformatter(cell, row) {
		function clickedOnUser(id, name) {
			//Segment Implementation
			window.analytics.track("Clicked on Single User", {
				currentCategory: "Applications",
				currentPageName: "Application-Users",
				clickedUserId: id,
				clickedUserName: name,
				orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
				orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
			});
		}
		const getUserLogo = () => {
			const logo = row?.user_profile;
			if (logo) {
				return (
					<img
						src={urlifyImage(unescape(logo))}
						width={26}
						height={26}
						className="rounded-circle"
					/>
				);
			} else {
				return (
					<NameBadge
						name={row?.user_name}
						width={26}
						height={26}
						className="rounded-circle"
					/>
				);
			}
		};
		return (
			<div className={row.user_app_status === "active" ? "" : "o-6"}>
				<div className="d-flex flex-row">
					<div className="position-relative mr-2">
						{getUserLogo()}
						<div
							className={
								row?.user_status === "active"
									? "activeStatus position-absolute"
									: "inActiveStatus position-absolute"
							}
						></div>
					</div>
					<OverlayTrigger
						placement="top"
						overlay={
							<Tooltip className="userMetaInfoCard">
								<UserAppMetaInfoCard
									title={row?.user_name}
									description={row?.user_email}
									isActive={row.user_status === "active"}
									isUser={true}
									row={row}
									user_status={row.user_status}
								/>
							</Tooltip>
						}
					>
						<div className="d-inline-flex">
							<div className="truncate_10vw m-auto">
								<Link
									className="custom__app__name__css"
									to={`/users/${encodeURI(
										row.user_id
									)}#overview`}
									style={{ textDecoration: "unset" }}
									onClick={() =>
										clickedOnUser(
											row.user_id,
											row.user_name
										)
									}
								>
									{row.user_name}
								</Link>
							</div>
							{row.user_account_type === userType.SERVICE ? (
								<img
									src={service}
									width={16}
									style={{ marginLeft: "6px" }}
								></img>
							) : row.user_account_type === userType.GROUP ? (
								<img
									src={group}
									width={16}
									style={{ marginLeft: "6px" }}
								></img>
							) : null}
						</div>
					</OverlayTrigger>
				</div>
			</div>
		);
	}

	const columnsMapper = {
		user: {
			dataField: "user_name",
			text: "User",
			sortKey: "user_name",
			formatter: userformatter,
		},
		user_email: {
			dataField: "user_email",
			text: "Email",
			sortKey: "user_email",
			formatter: (row, data) => (
				<div
					className={`d-flex flex-row align-items-center ${
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}`}
				>
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{data.user_email}</Tooltip>}
					>
						<div className="truncate_10vw">{data.user_email}</div>
					</OverlayTrigger>
				</div>
			),
		},
		top_level_department: {
			dataField: "dept_name_path",
			text: "Top Level Department",
			sortKey: "dept_name_path",
			formatter: (dataField, data) => {
				const dept_name = data.dept_name_path?.split("/")?.[0] || "";
				const dept_id = data.dept_id_path?.split(",")?.[0] || "";
				return (
					<div className="d-flex">
						{dept_name ? (
							<OverlayTrigger
								placement="top"
								overlay={<Tooltip>{dept_name}</Tooltip>}
							>
								{dept_id ? (
									<Link
										to={`/departments/${dept_id}#overviewdep`}
										className="table-link"
									>
										<div className="truncate_name">
											{dept_name}
										</div>
									</Link>
								) : (
									<span>{dept_name}</span>
								)}
							</OverlayTrigger>
						) : (
							"-"
						)}
					</div>
				);
			},
		},
		department_path: {
			dataField: "dept_name_path",
			text: "Department Path",
			sortKey: "dept_name_path",
			formatter: (dataField, row) => {
				const dept_id = row.dept_id;
				return (
					<div className="flex flex-row center">
						{dataField ? (
							<div className="flex flex-row center">
								<OverlayTrigger
									placement="top"
									overlay={<Tooltip>{dataField}</Tooltip>}
								>
									<div className="flex flex-row align-items-center justify-content-center">
										{dept_id ? (
											<Link
												to={`/departments/${encodeURI(
													dept_id
												)}#overviewdep`}
											>
												<div
													className="truncate_name"
													style={{ color: "#222222" }}
												>
													{dataField || "-"}
												</div>
											</Link>
										) : (
											<div
												className="truncate_name"
												style={{ color: "#222222" }}
											>
												{dataField || "-"}
											</div>
										)}
									</div>
								</OverlayTrigger>
							</div>
						) : (
							"-"
						)}
					</div>
				);
			},
		},
		user_designation: {
			dataField: "user_designation",
			text: "Designation",
			sortKey: "user_designation",
			formatter: (row, data) => (
				<div
					className={`d-flex flex-row align-items-center text-capitalize ${
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}`}
				>
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{data.user_designation}</Tooltip>}
					>
						<div className="truncate_10vw">
							{data.user_designation}
						</div>
					</OverlayTrigger>
				</div>
			),
		},
		user_status: {
			dataField: "user_status",
			text: "User Status",
			sortKey: "user_status",
			formatter: (data, row) => (
				<div className="flex flex-row center">
					{data === "active" ? (
						<div className="d-flex align-items-center">
							<Dots color="#40E395" />
							<div className="ml-1">Active</div>
						</div>
					) : (
						<div className="d-flex align-items-center">
							<Dots color="#717171" />
							<div className="ml-1">Inactive</div>
						</div>
					)}
				</div>
			),
		},
		user_app_status: {
			dataField: "user_app_status",
			text: "User Application Status",
			sortKey: "user_app_status",
			formatter: (row, data) => (
				<div
					className={`d-flex flex-row align-items-center ${
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}`}
				>
					{data.user_app_status === "active" ? (
						<div>
							<img className="mr-1" src={check}></img>
							In Use
						</div>
					) : data.user_app_status === "suspended" ? (
						<div>
							<img className="mr-1" src={inactivecheck}></img>
							Suspended
						</div>
					) : (
						<div>
							<img className="mr-1" src={inactivecheck}></img>
							Not in Use
						</div>
					)}
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
						trendAPI={getApplicationUsersSpendTrend}
						type={spendCostTrendType.SPEND}
						id={data?.user_id}
						value={data?.user_app_total_spend}
						outerId={appId}
					/>
				</div>
			),
		},
		dept: {
			dataField: "dept_name",
			text: "Department",
			sortKey: "dept_name",
			formatter: (dataField, data) => (
				<Link
					to={`/departments/${encodeURI(data.dept_id)}#overviewdep`}
				>
					<div className="flex flex-row center">
						<NameBadge
							name={dataField}
							fontSize={14}
							borderRadius={50}
							width={26}
						/>
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{dataField}</Tooltip>}
						>
							<div className="flex flex-row align-items-center justify-content-center">
								<div
									className="truncate_name"
									style={{
										marginLeft: "8px",
										color: "#222222",
									}}
								>
									{dataField}
								</div>
							</div>
						</OverlayTrigger>
					</div>
				</Link>
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
						appId={appId}
						appName={props.application?.app_name}
						appLogo={props.application?.app_logo}
						users={[
							{
								user_image: data.user_profile,
								user_name: data.user_name,
								user_id: data.user_id,
								user_app_role: data.user_app_role,
								user_licenses: data?.contracts,
							},
						]}
						userId={data.user_id}
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
						userIds={[data.user_id]}
						appId={appId}
						refresh={handleRefresh}
					/>
				</div>
			),
		},
		user_app_risk: {
			dataField: "user_app_risk",
			text: "Threat",
			sortKey: "user_app_risk",
			formatter: (row, data) => (
				<div
					className={
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}
				>
					<SecurityThreatFormatter threat={data.user_app_risk} />
				</div>
			),
		},
		app_risk_level: {
			dataField: "app_risk_level",
			text: "Risk Level",
			sortKey: "app_risk_level",
			formatter: (row, data) => (
				<div
					className={`d-flex align-items-center
						${(data.user_app_status || data.user_status) === "active" ? "" : "o-6"}`}
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
		activity_trend: {
			dataField: "user_app_sources_data",
			text: "Activity",
			formatter: (data, row) => (
				<ActivityGraphCell row={row} data={data} />
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
						? `${getDateDiff(
								new Date(),
								new Date(data.user_app_last_used)
						  )} ago`
						: "-"}
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
						isUserAppActive={
							(row.user_app_status || row.user_status) ===
							"active"
						}
						user_app_id={row.user_app_id}
						user_name={row.user_name}
						user_profile={row.user_profile}
						app_name={props.application?.app_name}
						app_image={props.application?.app_logo}
						user_id={row.user_id}
						completeRow={row}
						is_manual_source_present={row.is_manual_source_present}
						interColumnsStateObject={interColumnsStateObject}
						setInterColumnsStateObject={setInterColumnsStateObject}
						org_user_app_id="org_user_app_id"
						org_user_app_source_types="user_source_types"
						org_user_app_sources="user_sources"
						isUser={true}
						updateManualUsage={updateManualUsage}
						refresh={handleRefresh}
					/>
				</div>
			),
		},
		user_app_avg_usage: {
			dataField: "user_app_avg_usage",
			sortKey: "user_app_avg_usage",
			text: "Usage (Average)",
			formatter: (row, data) => (
				<DottedProgress
					value={data.user_app_avg_usage || 0}
					isNotActive={data.user_app_status !== "active"}
				></DottedProgress>
			),
		},
		user_app_current_month_usage: {
			dataField: "user_app_current_month_usage",
			sortKey: "user_app_current_month_usage",
			text: "Usage (Current Month)",
			formatter: (row, data) => (
				<DottedProgress
					value={data.user_app_current_month_usage || 0}
					isNotActive={data.user_app_status !== "active"}
				/>
			),
		},
		user_account_type: {
			dataField: "user_account_type",
			sortKey: "user_account_type",
			text: "User Account Type",
			formatter: (row, data) => capitalizeFirstLetter(row),
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
						trendAPI={getApplicationUsersCostTrend}
						type={spendCostTrendType.COST}
						id={data?.user_id}
						value={data?.user_app_cost}
						outerId={appId}
					/>
				</div>
			),
		},
		user_app_avg_spend: {
			dataField: "user_app_avg_spend",
			text: "Spend/month",
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
					user_id="user_id"
					isUser={true}
					markAsNotActive={markAsNotActive}
					markAsActive={markAsActive}
					refresh={handleRefresh}
					style={{ left: "-180px", transform: "translateX(0px)" }}
				/>
			),
		},
		...(org_beta_features?.includes("optimization")
			? getOptimizationTableColumnGroups("application_users")
			: {}),
	};

	return (
		<>
			{userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView height="700px" />
			) : (
				<>
					<UsersFilter
						appId={appId}
						checked={checked}
						searchQuery={searchQuery}
						setSearchQuery={debounce(setSearchQuery, 200)}
						manualRefresh={manualRefresh}
						setManualRefresh={setManualRefresh}
						metaData={metaData}
						columnsMapper={columnsMapper}
						usedColumns={metaData?.columns}
						handleRefresh={handleRefresh}
						isLoadingData={isLoadingData}
						app_name={props.application?.app_name}
						app_logo={props.application?.app_logo}
						setShowExportModal={setShowExportModal}
						setChecked={setChecked}
						propertyList={propertyList}
						listOfColumns={listOfColumns}
						setListOfColumns={setListOfColumns}
						showFilterModal={showFilterModal}
						setShowFilterModal={setShowFilterModal}
						showColumnsModal={showColumnsModal}
						setShowColumnsModal={setShowColumnsModal}
						selectedUsers={selectedUsers}
						selectedUserIds={selectedUserIds}
						selectedUserRoles={selectedUserRoles}
						selectedUsersLicences={selectedUsersLicences}
						appSourceList={appSourceList}
						appLicenseList={appLicenseList}
						bulkEditSourceList={bulkEditSourceList}
					/>
					<OldInfiniteTable
						setChecked={setChecked}
						checked={checked}
						data={data}
						metaData={metaData}
						hasMoreData={hasMoreData}
						handleLoadMore={handleLoadMore}
						columnsMapper={columnsMapper}
						keyField="user_id"
						emptyState={
							searchQuery ? (
								<EmptySearch
									searchQuery={searchQuery}
									noLocalisedSearch={true}
								/>
							) : showErrorModal ? (
								<ErrorComponent />
							) : (
								<UsersEmpty
									handleRefresh={handleRefresh}
									isApplicationUser
								/>
							)
						}
						searchQuery={searchQuery}
						isLoadingData={isLoadingData}
						handleRowClick={handleRowClick}
						propsInterColumnsStateObject={{
							setRefreshTableDueToUsage:
								setRefreshTableDueToUsage,
							getActionHistory,
						}}
						allowFewSpecialCharacters={true}
					/>
					{showActionHistory && actionHistory && (
						<ActionLogHistory
							historyType="user_app"
							actionHistory={actionHistory}
							onHide={() => setShowActionHistory(false)}
						/>
					)}
					{showUsageActivity && rowDetails && (
						<UsageActivityTabs
							closeUsageAcivity={() =>
								setShowUsageActivity(false)
							}
							isUser={true}
							rowDetails={rowDetails}
							refresh={() => {
								handleRefresh();
								setShowUsageActivity(false);
							}}
							updateManualUsage={updateManualUsage}
							user_id={rowDetails?.row?.user_id}
							user_name={rowDetails?.row.user_name}
							user_image={rowDetails?.row.user_profile}
							app_name={props.application?.app_name}
							app_image={props.application?.app_logo}
						/>
					)}
				</>
			)}
		</>
	);
}
