import React, { useEffect, useState, useRef } from "react";
import { UsersTable } from "./UsersTable";
import { UsersFilter } from "./UsersFilter";
import { debounce, isEmpty } from "../../../utils/common";
import {
	getDepartmentUsersV2,
	getDeptUserCostTrend,
	getDeptUserSpendTrend,
} from "../../../services/api/departments";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { defaults } from "../../../constants";
import { useLocation } from "react-router-dom";

import {
	checkSpecialCharacters,
	searchUsersDepartmentV2,
} from "../../../services/api/search";
import { client } from "../../../utils/client";
import { useDispatch, useSelector } from "react-redux";
import check from "../../../assets/applications/check.svg";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import { TriggerIssue } from "../../../utils/sentry";
import {
	ARCHIVE_FIELD_CONSTANTS,
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../common/infiniteTableUtil";
import UserAppMetaInfoCard from "../../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";

import { push } from "connected-react-router";
import _ from "underscore";
import { ACTION_TYPE } from "../../Users/Applications/Modals/FiltersRenderer/redux";
import UserInfoTableComponent from "../../../common/UserInfoTableComponent";
import SpendCostTrend, {
	spendCostTrendType,
	HeaderFormatter,
} from "../../../modules/spendvscost/components/SpendCostTrend";
import { getUserSpendTrend } from "services/api/users";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

const showTooltipLength = 20;

export function UsersDep(props) {
	const [searchQuery, setSearchQuery] = useState();
	const [data, setData] = useState([]);
	const location = useLocation();
	const departmentId = location.pathname.split("/")[2];

	const [hasMoreData, setHasMoreData] = useState(true);
	const [refreshTable, setRefreshTable] = useState(false);
	const cancelToken = useRef();
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);

	const [metaData, setMetaData] = useState();
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [shouldConcat, setShouldConcat] = useState(false);
	const [checked, setChecked] = useState([]);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);

	const dispatch = useDispatch();
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
					ARCHIVE_FIELD_CONSTANTS.USER
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
					ARCHIVE_FIELD_CONSTANTS.USER
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
		setIsLoadingData(true);
		setReqBody(reqBody);
		try {
			const response = await getDepartmentUsersV2(
				pageNo,
				defaults.ALL_APPLICATIONS_ROW,
				reqBody,
				departmentId
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
			searchUsersDepartmentV2(departmentId, reqBody, cancelToken.current)
				.then((response) => {
					if (response.data.length < defaults.MINIMUM_ROW) {
						setHasMoreData(false);
					}
					setReqBody(reqBody);
					setData(response.data);
					setMetaData(response.meta);
					setIsLoadingData(false);
					window.analytics.track(
						"Search Applications Results Displayed",
						{
							searchQuery: searchQuery,
							currentCategory: "Departments",
							currentPageName: "Department-Users",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue(
							"Error in searching users of department",
							error
						);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

	const columnsMapper = {
		user: {
			dataField: "user_name",
			text: "User",
			sortKey: "user_name",
			formatter: (data, row, rowindex) => {
				return (
					<UserInfoTableComponent
						user_account_type={row.user_account_type}
						profile_img={row.profile_img}
						user_profile={row.user_profile}
						user_email={row.user_email}
						user_status={row.user_status}
						row={row}
						user_id={row.user_id}
						user_name={row.user_name}
						tooltipClassName={"userMetaInfoCard"}
						customTooltip={
							<UserAppMetaInfoCard
								title={row?.user_name}
								description={row?.user_email}
								isActive={row.user_status === "active"}
								isUser={true}
								row={row}
								user_status={row.user_status}
							/>
						}
					></UserInfoTableComponent>
				);
			},
		},
		user_email: {
			dataField: "user_email",
			text: "Email",
			formatter: (dataField) => (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>{dataField}</Tooltip>}
				>
					<div className="truncate_name">{dataField}</div>
				</OverlayTrigger>
			),
		},
		user_dept_path: {
			dataField: "user_department_name_path",
			text: "Department Path",
			sortKey: "user_dept_path",
			formatter: (dataField) => (
				<>
					{dataField ? (
						<LongTextTooltip
							text={dataField}
							maxWidth={200}
							style={{
								color: "#222222",
							}}
						/>
					) : (
						"-"
					)}
				</>
			),
		},
		user_designation: {
			dataField: "user_designation",
			text: "Designation",
			formatter: (dataField) =>
				dataField?.length > showTooltipLength ? (
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{dataField}</Tooltip>}
					>
						<div className="truncate_10vw">{dataField || "-"}</div>
					</OverlayTrigger>
				) : (
					<div className="truncate_10vw">{dataField || "-"}</div>
				),
		},
		user_app_count: {
			dataField: "user_app_count",
			text: "Apps Used",
			sortKey: "user_app_count",
		},
		user_avg_spend: {
			dataField: "user_avg_spend",
			text: "Avg. Monthly Spend",
			sortKey: "user_avg_spend",
			headerFormatter: (row, data) => (
				<HeaderFormatter
					text={"Avg. Monthly Spend"}
					type={spendCostTrendType.SPEND}
				></HeaderFormatter>
			),
			formatter: (row, data) => (
				<SpendCostTrend
					trendAPI={getDeptUserSpendTrend}
					type={spendCostTrendType.SPEND}
					id={data?.user_id}
					value={data?.user_avg_spend}
					outerId={departmentId}
				/>
			),
		},
		department_user_cost: {
			dataField: "user_cost",
			text: "Cost [YTD]",
			sortKey: "user_cost",
			HeaderFormatter: (row, data) => (
				<HeaderFormatter
					text={"Cost [YTD]"}
					type={spendCostTrendType.COST}
				></HeaderFormatter>
			),
			formatter: (row, data) => (
				<SpendCostTrend
					trendAPI={getDeptUserCostTrend}
					type={spendCostTrendType.COST}
					id={data?.user_id}
					value={data?.user_cost}
					outerId={departmentId}
				/>
			),
		},
		user_status: {
			dataField: "user_status",
			text: "Status",
			sortKey: "user_status",
			formatter: (row) => (
				<div className="flex flex-row center">
					{typeof row === "string" &&
					row?.toLowerCase() === "active" ? (
						<img src={check} alt="" />
					) : (
						<img src={inactivecheck}></img>
					)}
					<div
						className="flex flex-row justify-content-center align-items-center text-capitalize"
						style={{ marginLeft: "8px" }}
					>
						{row}
					</div>
				</div>
			),
		},
		user_total_spend: {
			dataField: "user_total_spend",
			sortKey: "user_total_spend",
			text: "Spend [YTD]",
			headerFormatter: (row, data) => (
				<HeaderFormatter
					text={"Spend [YTD]"}
					type={spendCostTrendType.SPEND}
				></HeaderFormatter>
			),
			formatter: (row, data) => (
				<SpendCostTrend
					trendAPI={getUserSpendTrend}
					type={spendCostTrendType.SPEND}
					id={data?.user_id}
					value={data?.user_total_spend}
				/>
			),
		},
	};

	return (
		<>
			<UsersFilter
				checked={checked}
				setChecked={setChecked}
				searchQuery={searchQuery}
				setSearchQuery={debounce(setSearchQuery, 200)}
				metaData={metaData}
				columnsMapper={columnsMapper}
				usedColumns={metaData?.columns}
				handleRefresh={handleRefresh}
				isLoadingData={isLoadingData}
				deptName={props.department}
			/>
			<UsersTable
				searchQuery={searchQuery}
				department={props.department}
				columnsMapper={columnsMapper}
				data={data}
				metaData={metaData}
				isLoadingData={isLoadingData}
				hasMoreData={hasMoreData}
				checked={checked}
				handleRefresh={handleRefresh}
				setChecked={(ch) => setChecked(ch)}
				handleLoadMore={handleLoadMore}
				showErrorModal={showErrorModal}
			/>
		</>
	);
}
