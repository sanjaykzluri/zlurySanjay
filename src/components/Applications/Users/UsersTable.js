import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import check from "../../../assets/applications/check.svg";
import { Link } from "react-router-dom";
import { DottedProgress } from "../../../common/DottedProgress/DottedProgress";
import ContentLoader from "react-content-loader";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import group from "../../../assets/users/group.svg";
import service from "../../../assets/users/service.svg";
import {
	checkSpecialCharacters,
	searchApplicationUsers,
} from "../../../services/api/search";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { client } from "../../../utils/client";
import { EmptySearch } from "../../../common/EmptySearch";
import { getSingleApplicationUsersInfo } from "../../../services/api/applications";
import { InfiniteTable } from "../../Departments/InfiniteTable";
import { fetchSingleAppUsersInfo } from "../../../actions/applications-action";
import { fetchUserApplicationsActionHistory } from "../../Users/redux";
import ActionLogHistory from "../../Users/ActionLogHistory/ActionLogHistory";
import {
	markAsNotActive,
	updateManualUsage,
	addManualUsage,
	markAsActive,
} from "../../../services/api/users";
import { EmptyUsers } from "./EmptyUsers";
import { SourcesFormatter } from "../../../modules/shared/components/ManualUsage/TableFormatter/SourcesFormatter";
import { OptionsFormatter } from "../../../modules/shared/components/ManualUsage/TableFormatter/OptionsFormatter";
import { applicationConstants } from "../../../constants";
import { kFormatter } from "../../../constants/currency";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { timeSince } from "../../../utils/DateUtility";
import { DottedRisk } from "../../../common/DottedRisk/DottedRisk";
import moment from "moment";
import ActivityGraph from "../../../UIComponents/ActivityGraph/ActivityGraph";
import UsageActivityTabs from "../../../modules/shared/components/UsageActivity/UsageActivityTabs";
import InlineLicenceAssg from "../../LicenceAssignment/InlineLicenceAssg";
import RoleAssignment from "../../RoleAssignment/RoleAssignment";
import { useLocation } from "react-router-dom";
import UserAppMetaInfoCard from "../../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import _ from "underscore";
import { userType } from "../../../constants/users";
import { getValueFromLocalStorage } from "utils/localStorage";

function currencyFormatter(cell, row) {
	let cost = new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: "USD",
		maximumSignificantDigits: 3,
	}).format(cell || 0);
	return <>{cost}</>;
}

function dateFormatter(cell, row) {
	if (cell) {
		if (
			Math.ceil(Math.abs(new Date() - new Date(cell)) / 1000) <=
			6 * 24 * 60 * 60
		) {
			return timeSince(cell) + " ago";
		}
		let date = new Date(cell)
			.toLocaleDateString("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
			})
			.split(" ")
			.join(" ");

		return <>{date}</>;
	}
	return <>-</>;
}

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
		if (!logo) {
			return (
				<img
					src={
						logo ||
						`https://ui-avatars.com/api/?name=${row?.user_name}`
					}
					alt={row?.user_name}
					style={{
						height: "26px",
						width: "26px",
						borderRadius: "50%",
					}}
				/>
			);
		}
		if (logo && logo !== "") {
			return (
				<img
					style={{
						height: "26px",
						width: "26px",
						borderRadius: "50%",
					}}
					alt={row?.user_name}
					src={logo}
				/>
			);
		} else {
			return (
				<img
					src={
						logo ||
						`https://ui-avatars.com/api/?name=${row?.user_name}`
					}
					alt={row?.user_name}
					style={{
						height: "26px",
						width: "26px",
						borderRadius: "50%",
					}}
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
								to={{
									hash: "#overview",
									pathname: `/users/${encodeURI(
										row.user_id
									)}`,
									state: {
										user_account_type:
											row.user_account_type,
									},
								}}
								style={{ textDecoration: "unset" }}
								onClick={() =>
									clickedOnUser(row.user_id, row.user_name)
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

const loadingData = [
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
];
const loaderColumns = [
	{
		dataField: "name",
		text: "Department",
		formatter: () => (
			<div className="d-flex flex-row align-items-center">
				<ContentLoader
					style={{ marginRight: 8 }}
					width={26}
					height={26}
				>
					<circle cx="13" cy="13" r="13" fill="#EBEBEB" />
				</ContentLoader>
				<ContentLoader width={91} height={10}>
					<rect width="91" height="10" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "head",
		text: "Head",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "head",
		text: "Head",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "usersCount",
		text: "Users",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "appsCount",
		text: "Apps Used",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
];

export function UsersTable(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const cancelToken = useRef();
	const filterResponseKey = "results";
	const initialResponseKey = "users";
	const { refreshTable } = useSelector((state) => state.ui);
	const [apiDataKey, setApiDataKey] = useState(initialResponseKey);
	const [showActionHistory, setShowActionHistory] = useState(false);
	const actionHistory = useSelector(
		(state) => state.userApplicationsActionHistory
	);
	const location = useLocation();
	const id = location.pathname.split("/")[2];
	const dispatch = useDispatch();
	const { searchQuery, refreshTableDueToUsage, setRefreshTableDueToUsage } =
		props;
	const [showUsageActivity, setShowUsageActivity] = useState(false);
	const [rowDetails, setRowDetails] = useState();

	function clickedOnUser(id, name) {
		//Segment Implementation
		window.analytics.track("Clicked on Single Application", {
			currentCategory: "Applications",
			currentPageName: "All-Applications",
			clickedAppId: id,
			clickedAppName: name,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}
	const columns = [
		{
			dataField: "user_name",
			text: "User",
			formatter: userformatter,
		},
		{
			dataField: "user_app_status",
			text: "Usage",
			formatter: (data, row) => (
				<div
					className={
						_.isString(data) &&
						(data || "").toLowerCase() === "active"
							? "flex flex-row center"
							: "flex flex-row center o-6"
					}
				>
					{_.isString(data) &&
					(data || "").toLowerCase() === "active" ? (
						<img src={check}></img>
					) : (
						<img src={inactivecheck} alt="" />
					)}
					<div
						className="flex flex-row justify-content-center align-items-center"
						style={{ marginLeft: "8px" }}
					>
						{_.isString(data) &&
						(data || "").toLowerCase() === "active"
							? "In Use"
							: "Not in use"}
					</div>
				</div>
			),
		},
		{
			dataField: "user_app_total_spend",
			text: "Spend",
			formatter: (data, row, rowindex) => {
				return (
					<div
						className={
							(row.user_app_status || row.user_status) ===
							"active"
								? "flex flex-row center"
								: "flex flex-row center o-6"
						}
					>
						<div className="ml-3 flex flex-row justify-content-center align-items-center">
							{isNaN(data) ? 0 : kFormatter(data)}
						</div>
					</div>
				);
			},
		},
		{
			dataField: "license_name",
			text: "License",
			formatter: (data, row) => (
				<div className={"flex flex-row center"}>
					<InlineLicenceAssg
						isNotActive={row.user_app_status !== "active"}
						licences={[
							{
								license_id: row.license_id,
								license_name: row.license_name,
								plan_name: row.plan_name,
								contract_name: row.contract_name,
								license_used: row.license_used,
								license_count: row.license_count,
								metric_price: row.metric_price,
								license_cycle_period: row.license_cycle_period,
								license_cycle_cost: row.license_cycle_cost,
							},
						]}
						appId={id}
						appName={props.app_name}
						appLogo={props.app_logo}
						users={[
							{
								user_image: row.user_profile,
								user_name: row.user_name,
								user_id: row.user_id,
								user_app_role: row.user_app_role,
							},
						]}
						refresh={props.refreshReduxState}
					/>
				</div>
			),
		},
		{
			dataField: "user_app_role",
			text: "Role",
			formatter: (data, row) => (
				<div className={"flex flex-row center"}>
					<RoleAssignment
						isNotActive={row.user_app_status !== "active"}
						currentRoles={[row.user_app_role]}
						userIds={[row.user_id]}
						appId={id}
						refresh={props.refreshReduxState}
					/>
				</div>
			),
		},
		{
			dataField: "risk",
			text: "Risk",
			formatter: (data, row) => (
				<div
					className={
						(row.user_app_status || row.user_status) === "active"
							? ""
							: "o-6"
					}
				>
					<DottedRisk size="sm" value={data || 0} />
				</div>
			),
		},
		{
			dataField: "activity_trend",
			text: "Activity",
			formatter: (data, row) => (
				<div
					className={
						(row.user_app_status || row.user_status) === "active"
							? ""
							: "o-6"
					}
				>
					{data && Array.isArray(data) && data?.length > 0 ? (
						<>
							<ActivityGraph data={data} dataKey="timestamp" />
							{row.user_app_last_activity ? (
								<div className="font-10 grey-1">
									Last updated on{" "}
									{moment(
										row.user_app_last_activity
									).fromNow()}
								</div>
							) : null}
						</>
					) : (
						<div className="font-10 grey-1 bold-normal">
							No Recent Data Available
						</div>
					)}
				</div>
			),
		},
		{
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
						app_name={props.app_name}
						app_image={props.app_logo}
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
						refresh={props.refreshReduxState}
					/>
				</div>
			),
		},
		{
			dataField: "options",
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
					refresh={props.refreshReduxState}
				/>
			),
		},
	];

	useDidUpdateEffect(() => {
		//only when there is change to element not when creation of element.
		if (refreshTable || refreshTableDueToUsage) {
			refreshTable();
			setRefreshTableDueToUsage(false);
		}
		resetKey();
	}, [searchQuery, refreshTableDueToUsage]);

	const resetKey = () => {
		if (searchQuery.length === 0) {
			if (cancelToken.current && cancelToken.current.cancel)
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			setTimeout(() => {
				setApiDataKey(initialResponseKey);
			}, 500);
		}
	};

	const fetchDataFn = () => {
		if (cancelToken.current && cancelToken.current.cancel)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);

		if (searchQuery && searchQuery.length > 0) {
			if (checkSpecialCharacters(searchQuery)) {
				dispatch({
					type: applicationConstants.SINGLE_APPLICATION_USERS_INFO_FETCHED,
					payload: {
						data: [],
					},
				});
			} else {
				setApiDataKey(filterResponseKey);
				cancelToken.current = client.CancelToken.source();
				return searchApplicationUsers(
					searchQuery,
					id,
					cancelToken.current
				);
			}
		}
	};
	function getActionHistory(_appId, userId) {
		dispatch(fetchUserApplicationsActionHistory(userId, id));
		setShowActionHistory(true);
	}
	useEffect(() => {
		if (props.manualRefresh) {
			props.handleRefreshState();
			refreshTable();
		}
	}, [props.manualRefresh]);

	function singleappusersinfoSelector(state) {
		return state.applications.singleappusersinfo[id];
	}

	const handleRowClick = (
		row,
		interColumnsStateObject,
		setInterColumnsStateObject
	) => {
		setShowUsageActivity(true);
		setRowDetails({
			row: row,
			interColumnsStateObject: interColumnsStateObject,
			setInterColumnsStateObject: setInterColumnsStateObject,
		});
	};

	return (
		<>
			{showActionHistory && actionHistory && (
				<ActionLogHistory
					historyType="user_app"
					actionHistory={actionHistory}
					onHide={() => setShowActionHistory(false)}
				/>
			)}

			<InfiniteTable
				columns={columns}
				apiDataKey={apiDataKey}
				loadingData={loadingData}
				loadingColumns={loaderColumns}
				keyField="user_id"
				emptyState={
					searchQuery ? (
						<EmptySearch searchQuery={searchQuery} />
					) : (
						<EmptyUsers></EmptyUsers>
					)
				}
				fetchDatafunctionViaRedux={fetchSingleAppUsersInfo}
				dataFunctionInStore={singleappusersinfoSelector}
				fetchData={fetchDataFn}
				searchQuery={searchQuery}
				interColumnsStateObject={{
					setRefreshTableDueToUsage: setRefreshTableDueToUsage,
					getActionHistory,
				}}
				resetKey={resetKey}
				handleRowClick={handleRowClick}
				handleCheckedRows={(row) => props.onRowSelect(row)}
			/>
			{showUsageActivity && rowDetails && (
				<UsageActivityTabs
					closeUsageAcivity={() => setShowUsageActivity(false)}
					isUser={true}
					rowDetails={rowDetails}
					refresh={() => {
						props.refreshReduxState();
						setShowUsageActivity(false);
					}}
					updateManualUsage={updateManualUsage}
					user_id={rowDetails?.row?.user_id}
					user_name={rowDetails?.row.user_name}
					user_image={rowDetails?.row.user_profile}
					app_name={props.app_name}
					app_image={props.app_logo}
				/>
			)}
		</>
	);
}
