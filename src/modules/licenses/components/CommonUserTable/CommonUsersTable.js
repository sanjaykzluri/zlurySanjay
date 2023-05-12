import React, { useState, useEffect, useRef } from "react";

import { debounce, isEmpty } from "../../../../utils/common";
import {
	getApplicationUsersV2,
	getAppUserPropertiesList,
} from "../../../../services/api/applications";
import { useDispatch, useSelector } from "react-redux";
import {
	ARCHIVE_FIELD_CONSTANTS,
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../../common/infiniteTableUtil";
import { defaults } from "../../../../constants";
import {
	checkSpecialCharacters,
	searchDepAppSource,
} from "../../../../services/api/search";
import { client } from "../../../../utils/client";
import { TriggerIssue } from "../../../../utils/sentry";
import UserAppMetaInfoCard from "../../../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import OldInfiniteTable from "../../../../common/oldInfiniteTable";
import { EmptySearch } from "../../../../common/EmptySearch";
import { push } from "connected-react-router";
import { ErrorComponent } from "../../../../common/ErrorComponnet";
import { SCREEN_TAG_MAP } from "../../../../constants/views";
import { ActivityGraphCell } from "../../../../components/Users/Applications/Applications";
import { ACTION_TYPE } from "../../../../components/Users/Applications/Modals/FiltersRenderer/redux";
import { CommonUsersTableFilter } from "./CommonUsersTableFilter";
import { UsersEmpty } from "../../../../components/Users/UsersEmpty";
import UserInfoTableComponent from "../../../../common/UserInfoTableComponent";
import _ from "underscore";
import InlineLicenceAssg from "../../../../components/LicenceAssignment/InlineLicenceAssg";
import RoleAssignment from "../../../../components/RoleAssignment/RoleAssignment";
import { getLicenseListForAnApp } from "services/api/licenses";

export function CommonUsersTable(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const { app_id } = props;
	const [loading, setLoading] = useState(true);
	const [propertyList, setPropertyList] = useState([]);
	const [manualRefresh, setManualRefresh] = useState(false);
	const [searchQuery, setSearchQuery] = useState();
	const [data, setData] = useState([]);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [refreshTable, setRefreshTable] = useState(false);
	const cancelToken = useRef();
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);
	const [metaData, setMetaData] = useState();
	const [reqBody, setReqBody] = useState({
		...defaultReqBody,
	});
	const [shouldConcat, setShouldConcat] = useState(false);
	const [checked, setChecked] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const dispatch = useDispatch();
	const [appSourceList, setAppSourceList] = useState();
	const query = useSelector((state) => state.router.location.query);
	const router = useSelector((state) => state.router);
	const { hash } = router.location;
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [previousDiff, setPreviousDiff] = useState({});
	const [appLicenseList, setAppLicenseList] = useState();

	useEffect(() => {
		setPreviousDiff(props.licenses);
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
			setChecked([]);
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

	useEffect(() => {
		async function getAppLicenseList() {
			const licenseList = await getLicenseListForAnApp(app_id);
			setAppLicenseList(licenseList);
		}
		getAppLicenseList();
	}, [refreshTable]);

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
				"user_name",
				"User Name"
			);
			reqBody.filter_by = [searchObj];
		}
		setIsLoadingData(true);
		try {
			const response = await getApplicationUsersV2(
				app_id,
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
			setIsLoadingData(false);
			let newData = shouldConcat
				? [...data, ...response.data]
				: response.data;
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
		if (checkSpecialCharacters(searchQuery)) {
			setHasMoreData(false);
		} else {
			setIsLoadingData(true);
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"user_name",
				"User Name"
			);
			reqBody.filter_by = [searchObj];
			getApplicationUsersV2(
				app_id,
				reqBody,
				pageNo,
				defaults.ALL_APPLICATIONS_ROW,
				cancelToken.current
			)
				.then((response) => {
					if (response.data.length < defaults.MINIMUM_ROW) {
						setHasMoreData(false);
					}
					setReqBody(reqBody);
					setData(response.data);
					setMetaData(response.meta);
					setIsLoadingData(false);
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
			const appSources = await searchDepAppSource();
			setAppSourceList(appSources);
		}
		getAppSourceList();
	}, []);
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
						is_external_user={row.user_is_external}
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
		license_details: {
			dataField: "license_name",
			text: "License",
			sortKey: "license_name",
			formatter: (row, data, index) => (
				<div className="d-flex flex-row align-items-center">
					<InlineLicenceAssg
						isNotActive={data.user_app_status !== "active"}
						licences={data.contracts}
						appId={app_id}
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
						refresh={() => {
							handleRefresh();
							props.requestUnmappedLicenseData(props.contract_id);
						}}
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
						appId={app_id}
						refresh={handleRefresh}
					/>
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
	};

	return (
		<>
			<CommonUsersTableFilter
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
				setChecked={setChecked}
				appSourceList={appSourceList}
				contract_id={props.contract_id}
				integration_id={props.integration_id}
				unmappedLicenseData={props.unmappedLicenseData}
				loadingUnmappedLicenseData={props.loadingUnmappedLicenseData}
				contract_data={props.contract_data}
				app_id={app_id}
				appLicenseList={appLicenseList}
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
						<EmptySearch searchQuery={searchQuery} />
					) : showErrorModal ? (
						<ErrorComponent />
					) : (
						<UsersEmpty
							handleRefresh={handleRefresh}
							isApplicationUser
							appId={app_id}
						/>
					)
				}
				searchQuery={searchQuery}
				isLoadingData={isLoadingData}
			/>
		</>
	);
}
