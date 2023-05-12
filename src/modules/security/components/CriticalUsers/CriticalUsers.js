import React, { useEffect, useState, useRef } from "react";
import { CriticalUsersFilters } from "../Filters/CriticalUsersFilters/CriticalUsersFilters";
import { debounce, isEmpty } from "../../../../utils/common";
import OldInfiniteTable from "../../../../common/oldInfiniteTable";
import { useDispatch, useSelector } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
	getAllCritcialUsers,
	searchAllCriticalUsersV2,
} from "../../../../services/api/security";
import { TriggerIssue } from "../../../../utils/sentry";
import {
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

import RiskModal2 from "../Modal/RiskModal2";
import { push } from "connected-react-router";
import _ from "underscore";
import { ACTION_TYPE } from "../../../../components/Users/Applications/Modals/FiltersRenderer/redux";
import { ErrorComponent } from "../../../../common/ErrorComponnet";
import UserInfoTableComponent from "../../../../common/UserInfoTableComponent";
import UserAppMetaInfoCard from "../../../shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import Rating from "../../../../components/Applications/SecurityCompliance/Rating";
import RiskIcon from "../../../../components/Applications/SecurityCompliance/RiskIcon";

export function CriticalUsers() {
	const cancelToken = useRef();
	const [searchQuery, setSearchQuery] = useState();
	const [manualRefresh, setManualRefresh] = useState(false);
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
	const [dataFieldVariableAL, setDataFieldVariableAL] =
		useState("apps_risk_gt3");
	const [riskValue, setRiskValue] = useState(3);
	const [showErrorModal, setShowErrorModal] = useState(false);

	useEffect(() => {
		if (reqBody && reqBody.filter_by) {
			const requiredObject = reqBody.filter_by.find(
				(element) => element.field_id === "user_max_risk"
			);
			if (requiredObject) {
				setDataFieldVariableAL(
					`apps_risk_gt${requiredObject.field_values[0]}`
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
		if (reqBody && reqBody.filter_by) {
			const requiredObject = reqBody.filter_by.find(
				(element) => element.field_id === "user_max_risk"
			);
			if (requiredObject) {
				setDataFieldVariableAL(
					`apps_risk_gt${requiredObject.field_values[0]}`
				);
				setRiskValue(requiredObject.field_values[0]);
			}
		}
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

	function handleLoadMore() {
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
		try {
			const response = await getAllCritcialUsers(pageNo, 30, reqBody);
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

			searchAllCriticalUsersV2(reqBody, cancelToken.current)
				.then((response) => {
					if (response.data.length < defaults.MINIMUM_ROW) {
						setHasMoreData(false);
					}
					setReqBody(reqBody);
					if (response.data && response.meta) {
						setData(response.data);
						setMetaData(response.meta);
					}
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
		user: {
			dataField: "user_name",
			text: "Name",
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
		user_status: {
			dataField: "user_status",
			text: "Status",
			sortKey: "user_status",
			formatter: (cell, row) => (
				<ChangeStatus
					disableEdit={true}
					status={row.app_archive || row.archive ? "archived" : cell}
				/>
			),
		},
		user_risk: {
			dataField: "user_max_risk",
			text: "Threat",
			sortKey: "user_max_risk",
			formatter: (data, row) => <SecurityThreatFormatter threat={data} />,
		},
		max_app_risk_level: {
			dataField: "max_app_risk_level",
			text: "Risk",
			sortKey: "max_app_risk_level",
			formatter: (data, row) => (
				<RiskIcon showLable={true} riskValue={data} />
			),
		},
		apps_list: {
			dataField: dataFieldVariableAL,
			text: "Critical Apps",
			sortKey: dataFieldVariableAL,
			formatter: (row, data, rowindex) => (
				<div className="flex flex-row align-items-center">
					{row?.slice(0, 6).map((el) => (
						<>
							<OverlayTrigger
								placement="top"
								overlay={<Tooltip>{el.app_name}</Tooltip>}
							>
								<img
									src={el.app_logo}
									style={{
										marginRight: "10px",
										height: "auto",
										width: "22px",
									}}
								></img>
							</OverlayTrigger>
						</>
					))}
					{row?.length > 6 && (
						<>
							<div className="criticalusertable__applistformatter">
								{row.length - 6} more
							</div>
						</>
					)}
				</div>
			),
		},
	};
	return (
		<>
			<CriticalUsersFilters
				metaData={metaData}
				setChecked={setChecked}
				checked={checked}
				searchQuery={searchQuery}
				manualRefresh={manualRefresh}
				setSearchQuery={debounce(setSearchQuery, 300)}
				columnsMapper={columnsMapper}
				usedColumns={metaData?.columns}
				handleRefresh={handleRefresh}
				isLoadingData={isLoadingData}
				setDataFieldVariableAL={setDataFieldVariableAL}
			></CriticalUsersFilters>
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
				<RiskModal2
					closeModal={() => setShowModal(false)}
					isUser={true}
					rowDetails={rowDetails}
				/>
			)}
		</>
	);
}

export function SecurityThreatFormatter({ threat }) {
	return (
		<div className="d-flex flex-row align-items-center">
			<Rating
				rating={threat || 0}
				iconType="scope"
				width={12}
				height={15}
				showValueInsideIcon={true}
				valueTopPosition={"1.5px"}
				valueLeftPosition={"2.5px"}
			/>
			<div className="font-13 pl-3" style={{ paddingTop: "1px" }}>
				{`Level ${threat || 0}`}
			</div>
		</div>
	);
}
