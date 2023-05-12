import React, { useEffect, useState, useRef } from "react";
import { CriticalAppsFilters } from "../Filters/CriticalAppsFilters/CriticalAppsFilters";
import { debounce, isEmpty } from "../../../../utils/common";
import OldInfiniteTable from "../../../../common/oldInfiniteTable";
import { useDispatch, useSelector } from "react-redux";
import {
	getAllCritcialApps,
	searchAllCriticalAppsV2,
} from "../../../../services/api/security";
import { TriggerIssue } from "../../../../utils/sentry";
import {
	addArchiveFilter,
	ARCHIVE_FIELD_CONSTANTS,
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../../common/infiniteTableUtil";
import { checkSpecialCharacters } from "../../../../services/api/search";
import { client } from "../../../../utils/client";
import { Empty } from "../Empty/Empty";
import { EmptySearch } from "../../../../common/EmptySearch";
import { defaults } from "../../../../constants/defaults";
import { ChangeStatus } from "../../../../components/Applications/Overview/ChangeStatus";
import { push } from "connected-react-router";
import _ from "underscore";
import RiskModal from "../Modal/RiskModal";
import AppTableComponent from "../../../../common/AppTableComponent";
import { ACTION_TYPE } from "../../../../components/Users/Applications/Modals/FiltersRenderer/redux";
import { ErrorComponent } from "../../../../common/ErrorComponnet";
import Rating from "../../../../components/Applications/SecurityCompliance/Rating";
import { SecurityThreatFormatter } from "../CriticalUsers/CriticalUsers";
import UserAppMetaInfoCard from "../../../shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import RiskIcon from "../../../../components/Applications/SecurityCompliance/RiskIcon";

export function CriticalApps() {
	const [manualRefresh, setManualRefresh] = useState(false);
	const cancelToken = useRef();
	const [searchQuery, setSearchQuery] = useState();
	const [checked, setChecked] = useState([]);
	const [data, setData] = useState([]);
	const [metaData, setMetaData] = useState();
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [shouldConcat, setShouldConcat] = useState(false);
	const [pageNo, setPageNo] = useState(0);
	const [refreshTable, setRefreshTable] = useState(false);
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [hasMoreData, setHasMoreData] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [rowDetails, setRowDetails] = useState();
	const dispatch = useDispatch();
	const query = useSelector((state) => state.router.location.query);
	const router = useSelector((state) => state.router);
	const { hash } = router.location;
	const [showErrorModal, setShowErrorModal] = useState(false);

	const [dataFieldVariableUC, setDataFieldVariableUC] = useState(
		"user_count_risk_gt3"
	);
	const [dataFieldVariableSC, setDataFieldVariableSC] = useState(
		"scope_count_risk_gt3"
	);
	const [riskValue, setRiskValue] = useState(3);
	useEffect(() => {
		let reqObj = {};
		if (reqBody && reqBody.filter_by) {
			const requiredObject = reqBody.filter_by.find(
				(element) => element.field_id === "app_max_risk"
			);
			if (requiredObject) {
				setDataFieldVariableUC(
					`user_count_risk_gt${requiredObject.field_values[0]}`
				);
				setDataFieldVariableSC(
					`scope_count_risk_gt${requiredObject.field_values[0]}`
				);
				setRiskValue(requiredObject.field_values[0]);
			}
		}
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(
					query,
					reqBody,
					ARCHIVE_FIELD_CONSTANTS.APPLICATION
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
		let urlMetaData;
		let urlReqBody = reqBody;
		if (reqBody && reqBody.filter_by) {
			const requiredObject = reqBody.filter_by.find(
				(element) => element.field_id === "app_max_risk"
			);
			if (requiredObject) {
				setDataFieldVariableUC(
					`user_count_risk_gt${requiredObject.field_values[0]}`
				);
				setDataFieldVariableSC(
					`scope_count_risk_gt${requiredObject.field_values[0]}`
				);
				setRiskValue(requiredObject.field_values[0]);
			}
		}
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(
					query,
					reqBody,
					ARCHIVE_FIELD_CONSTANTS.APPLICATION
				);
			} catch {
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
			}
		}
		!isLoadingData && loadData(reqObj);
	}, [pageNo, refreshTable]);

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
		setIsLoadingData(true);
		try {
			const response = await getAllCritcialApps(pageNo, 30, reqBody);
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
				"Application Name"
			);
			reqBody.filter_by = [searchObj];

			searchAllCriticalAppsV2(pageNo, 30, reqBody, cancelToken.current)
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
							currentCategory: "Applications",
							currentPageName: "All-Applications",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue("Error in searching applications", error);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

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
	const handleRowClick = (row) => {
		setShowModal(true);
		setRowDetails({
			row: row,
		});
	};
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const columnsMapper = {
		application: {
			dataField: "app_name",
			text: "Name",
			sortKey: "app_name",
			formatter: (row, data, rowindex) => (
				<AppTableComponent
					app_name={data?.app_name}
					app_logo={data?.app_logo}
					app_auth_status={data?.app_state}
					app_id={data?._id}
					logo_height="auto"
					logo_width={28}
					tooltipClassName="appMetaInfoCard MetaInfoCard"
					customTooltip={
						<UserAppMetaInfoCard
							title={data?.app_name}
							isActive={data?.app_status === "active"}
							isUser={false}
							row={data}
						/>
					}
					redirect_link={`/applications/${data?._id}#security`}
				/>
			),
		},
		app_status: {
			dataField: "app_status",
			text: "Status",
			sortKey: "app_status",
			formatter: (cell, row) => (
				<ChangeStatus
					disableEdit={true}
					status={row.app_archive || row.archive ? "archived" : cell}
				/>
			),
		},
		app_critical_user_count: {
			dataField: dataFieldVariableUC,
			text: "Users",
			sortKey: dataFieldVariableUC,
			formatter: (row, data, rowindex) => (
				<div className="flex flex-row align-items-center">
					{row} Users
				</div>
			),
		},
		app_scope_count: {
			dataField: dataFieldVariableSC,
			text: "Scopes",
			sortKey: dataFieldVariableSC,
			formatter: (row, data, rowindex) => (
				<div className="flex flex-row align-items-center">
					{row} Scopes
				</div>
			),
		},
		app_risk_score: {
			dataField: "app_risk_score",
			text: "Risk",
			sortKey: "app_risk_score",
			formatter: (data, row) => (
				<RiskIcon
					showLable={true}
					riskValue={Math.ceil(Math.round(5 * (data || 0)) / 100)}
				/>
			),
		},
		app_risk_level: {
			dataField: "app_risk_level",
			text: "Risk Level",
			sortKey: "app_risk_level",
			formatter: (data, row) => (
				<div className="flex flex-row align-items-center">
					<Rating
						rating={Math.ceil(data)}
						iconType="risk"
						singleIcon={true}
						width={12}
						height={12}
					/>
					<div className="font-13 pl-1" style={{ paddingTop: "1px" }}>
						{`Level ${data || 0}`}
					</div>
				</div>
			),
		},
		app_max_risk: {
			dataField: "app_max_risk",
			text: "Threat",
			sortKey: "app_max_risk",
			formatter: (data, row) => <SecurityThreatFormatter threat={data} />,
		},
	};
	return (
		<>
			<CriticalAppsFilters
				metaData={metaData}
				setChecked={setChecked}
				checked={checked}
				searchQuery={searchQuery}
				setSearchQuery={debounce(setSearchQuery, 300)}
				manualRefresh={manualRefresh}
				setManualRefresh={setManualRefresh}
				columnsMapper={columnsMapper}
				usedColumns={metaData?.columns}
				handleRefresh={handleRefresh}
				isLoadingData={isLoadingData}
				setDataFieldVariableUC={setDataFieldVariableUC}
				setDataFieldVariableSC={setDataFieldVariableSC}
			></CriticalAppsFilters>
			<OldInfiniteTable
				checked={checked}
				setChecked={setChecked}
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
				searchQuery={searchQuery}
				isLoadingData={isLoadingData}
				hasMoreData={hasMoreData}
				handleRowClick={handleRowClick}
				allowFewSpecialCharacters={true}
			/>
			{showModal && rowDetails && (
				<RiskModal
					closeModal={() => setShowModal(false)}
					isUser={true}
					rowDetails={rowDetails}
				/>
			)}
		</>
	);
}
