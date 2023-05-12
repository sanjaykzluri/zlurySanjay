import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { DepartmentsFilter } from "./DepartmentsFilter";
import { useDispatch, useSelector } from "react-redux";
import { debounce, isEmpty } from "../../utils/common";
import { Helmet } from "react-helmet";
import Strips from "../../common/restrictions/Strips";
import { ENTITIES } from "../../constants";
import {
	getAllDepartmentsV2,
	getDeptCostTrend,
	getDeptSpendTrend,
	patchDepartments,
} from "../../services/api/departments";
import { defaults } from "../../constants";
import { Link } from "react-router-dom";

import {
	checkSpecialCharacters,
	searchAllDepartmentsV2,
} from "../../services/api/search";
import { CircularProgressbar } from "react-circular-progressbar";
import { client } from "../../utils/client";
import { NameBadge } from "../../common/NameBadge";
import { ChangeOwner } from "../Applications/Overview/ChangeOwner";

import { TriggerIssue } from "../../utils/sentry";
import { Empty } from "./Empty";
import { EmptySearch } from "../../common/EmptySearch";
import {
	ARCHIVE_FIELD_CONSTANTS,
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../common/infiniteTableUtil";
import { push } from "connected-react-router";
import _ from "underscore";
import { ACTION_TYPE } from "../Users/Applications/Modals/FiltersRenderer/redux";
import { ErrorComponent } from "../../common/ErrorComponnet";
import { kFormatter } from "../../constants/currency";
import SpendCostTrend, {
	HeaderFormatter,
	spendCostTrendType,
} from "../../modules/spendvscost/components/SpendCostTrend";
import { SourcesFormatter } from "modules/shared/components/ManualUsage/TableFormatter/SourcesFormatter";
import { getValueFromLocalStorage } from "utils/localStorage";
import DepartmentListTable from "./DepartmentListTable";
import { fetchPrimarySources } from "services/api/settings";
import { Dots } from "common/DottedProgress/DottedProgress";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

export function Departmentsins() {
	const [checked, setChecked] = useState([]);

	const [searchQuery, setSearchQuery] = useState("");
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Departments", "All-Departments", {
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}, []);

	const [data, setData] = useState([]);

	const [hasMoreData, setHasMoreData] = useState(true);
	const [refreshTable, setRefreshTable] = useState(false);
	const cancelToken = useRef();
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);

	const [metaData, setMetaData] = useState();
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [shouldConcat, setShouldConcat] = useState(false);
	const dispatch = useDispatch();
	const query = useSelector((state) => state.router.location.query);
	const router = useSelector((state) => state.router);
	const { hash } = router.location;
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [isChildRowsLoading, setIsChildRowsLoading] = useState(false);
	const [currentExpandedDeptId, setCurrentExpandedDeptId] = useState("");
	const [disableAddButton, setDisableAddButton] = useState(false);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(
					query,
					reqBody,
					ARCHIVE_FIELD_CONSTANTS.DEPARTMENT
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
					ARCHIVE_FIELD_CONSTANTS.DEPARTMENT
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

	useEffect(() => {
		async function getPrimarySources() {
			const response = await fetchPrimarySources();
			const deptObj = response.data.find(
				(item) => item.k === "departments"
			);
			let disableAdd = false;
			if (deptObj) {
				disableAdd = deptObj.v.sources_ids?.some(
					(source) => source.is_primary
				);
			}
			setDisableAddButton(disableAdd);
		}
		getPrimarySources();
	}, []);

	async function loadData(reqBody) {
		if (isEmpty(reqBody.filter_by) && searchQuery) {
			const searchObj = getSearchReqObj(
				searchQuery,
				"dept_name",
				"Department Name"
			);
			reqBody.filter_by = [searchObj];
		}
		setIsLoadingData(true);
		try {
			const response = await getAllDepartmentsV2(
				pageNo,
				defaults.ALL_APPLICATIONS_ROW,
				reqBody
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
		if (metaData) metaData.columns = [];
		setMetaData(metaData);
		if (checkSpecialCharacters(searchQuery, true)) {
			setHasMoreData(false);
		} else {
			setIsLoadingData(true);
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"dept_name",
				"Department Name"
			);
			reqBody.filter_by = [searchObj];
			searchAllDepartmentsV2(reqBody, cancelToken.current)
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
							currentPageName: "All-Departments",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue("Error in searching departments", error);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

	const getDeptById = (keyToFind, valToFind) => {
		let foundObj;
		JSON.stringify([...data], (_, nestedValue) => {
			if (nestedValue && nestedValue[keyToFind] === valToFind) {
				foundObj = nestedValue;
			}
			return nestedValue;
		});
		return foundObj;
	};

	const appendChildDepts = (parentDeptId, childDepts, deptObj) => {
		let updatedDate = [...data];
		updatedDate.forEach(function iter(a) {
			if (parentDeptId === a.dept_id) {
				a.children = childDepts;
			}
			a.children && Array.isArray(a.children) && a.children.forEach(iter);
		});
		return updatedDate;
	};

	const allDeptIds = useMemo(() => {
		return JSON.stringify(data)
			.match(/"dept_id":\"(.*?)"/g)
			?.map((m) => JSON.parse(m.match(/\".*?\"/g)[1]));
	}, [data]);

	const isFilterApplied = useMemo(() => {
		return searchQuery?.length > 0 || metaData?.filter_by?.length > 1;
	}, [searchQuery, metaData]);

	const fetchChildDepartments = async (deptId, rowIndex) => {
		setCurrentExpandedDeptId(deptId);
		const deptObj = getDeptById("dept_id", deptId);
		const isChildDeptExists = deptObj?.children?.length > 0;
		if (!isFilterApplied && !isChildDeptExists) {
			const response = await getAllDepartmentsV2(
				0,
				defaults.ALL_APPLICATIONS_ROW,
				reqBody,
				deptId
			);
			const appendedChildDepts = appendChildDepts(
				deptId,
				response.data,
				deptObj
			);
			setData(appendedChildDepts);
			setIsChildRowsLoading(false);
		} else {
			// setData(data);
			setIsChildRowsLoading(false);
		}
	};

	const updateDeptWithSelectedUser = useCallback((deptId, userObj) => {
		let updatedData = [...data];
		updatedData.forEach(function iter(a) {
			if (deptId === a.dept_id) {
				a.dept_head_id = userObj.user_id;
				a.dept_head_name = userObj.user_name;
				a.dept_head_profile_image = userObj.profile_img;
				a.dept_head_account_type = userObj.user_account_type;
				// return a;
			}
			a.children && Array.isArray(a.children) && a.children.forEach(iter);
		});
		setData(updatedData);
	}, [data]);

	const ownerFormatter = useCallback(
		(cell, row) => {
			return (
				<>
					{row.dept_id?.endsWith("_direct_users") ? (
						<span> - </span>
					) : (
						<ChangeOwner
							fieldName="head"
							updateFunc={patchDepartments}
							idFromTable={row._id}
							userId={row.dept_head_id}
							userName={row.dept_head_name}
							userImage={row.dept_head_profile_image}
							userAccountType={row.dept_head_account_type}
							getSelectionObject={(res) => {
								updateDeptWithSelectedUser(row._id, res);
							}}
						/>
					)}
				</>
			);
		},
		[updateDeptWithSelectedUser]
	);

	const columnsMapper = useMemo(() => {
		return {
			dept_tree: {
				dataField: "",
				text: "",
				formatter: () => {
					return <span />;
				},
			},
			department: {
				dataField: "dept_name",
				text: "Department",
				sortKey: "dept_name",
				formatter: (dataField, data) => (
					<>
						{data.dept_id?.endsWith("_direct_users") ? (
							<div className="d-flex align-items-center">
								<Dots color={"#5FCF64"} size={6} />
								<span className="pl-2">Direct User</span>
							</div>
						) : (
							<Link
								to={`/departments/${encodeURI(
									data._id
								)}#overviewdep`}
								onClick={() =>
									clickedOnDepartment(
										data._id,
										data.dept_name
									)
								}
							>
								<div className="flex flex-row align-items-center">
									{data.img ? (
										<img
											src={data.img}
											alt={dataField}
											style={{
												height: "26px",
												width: "26px",
												borderRadius: "50%",
											}}
										/>
									) : (
										<NameBadge
											name={dataField}
											fontSize={14}
											borderRadius={50}
											width={26}
										/>
									)}
									<LongTextTooltip
										text={data.dept_name}
										maxWidth={200}
										style={{
											marginLeft: "8px",
											color: "#222222",
										}}
									/>
								</div>
							</Link>
						)}
					</>
				),
			},
			dept_path: {
				dataField: "dept_path",
				text: "Path",
				formatter: (dataField, data) => (
					<div className="flex flex-row center">
						<LongTextTooltip
							text={data.dept_name_path}
							maxWidth={200}
							style={{
								marginLeft: "8px",
								color: "#222222",
							}}
						/>
					</div>
				),
			},
			// this column may be added in second phase of release
			/* dept_level: {
				dataField: "dept_active_user_count",
				text: "Level",
			}, */
			dept_head_name: {
				dataField: "dept_head_name",
				text: "Head",
				sortKey: "dept_head_name",
				displayName: "b",
				formatter: ownerFormatter,
			},
			dept_user_count: {
				dataField: "dept_active_user_count",
				sortKey: "dept_active_user_count",
				text: "Users",
			},
			dept_app_count: {
				dataField: "dept_app_count",
				sortKey: "dept_app_count",
				text: "Apps Used",
			},
			budget: {
				dataField: "",
				text: "Budget",
				sortKey: "dept_budget_spend",
				formatter: (row, data) => (
					<>
						<div className="flex flex-row center align-items-center">
							<div style={{ width: "20px" }}>
								<CircularProgressbar
									value={data.dept_budget_spend}
									maxValue={data.dept_budget_allocated}
								/>
							</div>
							<div style={{ marginLeft: "8px" }}>
								<SpendCostTrend
									trendAPI={getDeptSpendTrend}
									type={spendCostTrendType.SPEND}
									id={data?._id}
									value={data?.dept_budget_spend}
								/>
							</div>
							<div style={{ marginLeft: "5px" }}> of </div>
							<div style={{ marginLeft: "5px" }}>
								{" "}
								{kFormatter(
									data.dept_budget_allocated || 0
								)}{" "}
							</div>
							<div style={{ marginLeft: "5px" }}> used </div>
						</div>
					</>
				),
			},
			department_cost: {
				dataField: "dept_cost",
				sortKey: "dept_cost",
				text: "Cost [YTD]",
				headerFormatter: (row, data) => (
					<HeaderFormatter
						text={"Cost [YTD]"}
						type={spendCostTrendType.COST}
					></HeaderFormatter>
				),
				formatter: (row, data) => (
					<>
						<SpendCostTrend
							trendAPI={getDeptCostTrend}
							type={spendCostTrendType.COST}
							id={data?._id}
							value={data?.dept_cost}
						/>
					</>
				),
			},
			dept_source: {
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
							isUserAppActive={true}
							completeRow={row}
							is_manual_source_present={false}
							interColumnsStateObject={interColumnsStateObject}
							setInterColumnsStateObject={
								setInterColumnsStateObject
							}
							isUser={false}
							isDept={true}
						/>
					</div>
				),
			},
		};
	}, [ownerFormatter]);

	return (
		<>
			<Helmet>
				<title>{`Departments - ${
					getValueFromLocalStorage("userInfo")?.org_name || ""
				} - ${getValueFromLocalStorage("partner")?.name}`}</title>
			</Helmet>
			<DepartmentsFilter
				checked={checked}
				setChecked={setChecked}
				searchQuery={searchQuery}
				setSearchQuery={debounce(setSearchQuery, 200)}
				metaData={metaData}
				columnsMapper={columnsMapper}
				usedColumns={metaData?.columns}
				handleRefresh={handleRefresh}
				isLoadingData={isLoadingData}
				v2Entity={ENTITIES.DEPARTMENT}
				disableAdd={disableAddButton}
			/>
			<Strips entity={ENTITIES.DEPARTMENT} />

			<DepartmentListTable
				setChecked={(ch) => setChecked(ch)}
				checked={checked}
				data={data}
				metaData={metaData}
				handleLoadMore={handleLoadMore}
				columnsMapper={columnsMapper}
				keyField="_id"
				emptyState={
					searchQuery ? (
						<EmptySearch searchQuery={searchQuery} />
					) : showErrorModal ? (
						<ErrorComponent />
					) : (
						<Empty />
					)
				}
				v2TableEntity="departments"
				handleRefresh={handleRefresh}
				isLoadingData={isLoadingData}
				hasMoreData={hasMoreData}
				isFiltered={isFilterApplied}
				fetchChildDepartments={fetchChildDepartments}
				setIsChildRowsLoading={setIsChildRowsLoading}
				isChildRowsLoading={isChildRowsLoading}
				currentExpandedDeptId={currentExpandedDeptId}
				allDeptIds={allDeptIds}
			/>
		</>
	);
}

function clickedOnDepartment(id, name) {
	//Segment Implementation
	window.analytics.track("Clicked on Single Department", {
		currentCategory: "Departments",
		currentPageName: "All-Departments",
		clickedDeptId: id,
		clickedDeptName: name,
		orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
		orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
	});
}

const showTooltipLength = 20;
