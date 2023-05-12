import React, { useEffect, useState, useRef } from "react";

import { ApplicationDepFilter } from "./ApplicationDepFilter";
import { debounce, isEmpty, kFormatter } from "../../../utils/common";
import { getDepartmentApplicationsV2 } from "../../../services/api/departments";
import { defaults } from "../../../constants";
import { useLocation } from "react-router-dom";

import {
	checkSpecialCharacters,
	searchApplicationsDepartmentV2,
	searchDepAppSource,
} from "../../../services/api/search";
import { client } from "../../../utils/client";
import { useDispatch, useSelector } from "react-redux";
import { TriggerIssue } from "../../../utils/sentry";

import {
	ARCHIVE_FIELD_CONSTANTS,
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../common/infiniteTableUtil";
import { push } from "connected-react-router";
import _ from "underscore";
import { ACTION_TYPE } from "../../Users/Applications/Modals/FiltersRenderer/redux";

export function ApplicationDepartment(props) {
	const location = useLocation();
	const departmentId = location.pathname.split("/")[2];
	const [searchQuery, setSearchQuery] = useState();
	const [checked, setChecked] = useState([]);

	const [data, setData] = useState([]);

	const [hasMoreData, setHasMoreData] = useState(true);
	const [refreshTable, setRefreshTable] = useState(false);
	const cancelToken = useRef();
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);

	const [metaData, setMetaData] = useState();
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [shouldConcat, setShouldConcat] = useState(false);
	const [appSourceList, setAppSourceList] = useState();

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
		setIsLoadingData(true);
		try {
			const response = await getDepartmentApplicationsV2(
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
				"app_name",
				"Application Name"
			);
			reqBody.filter_by = [searchObj];
			searchApplicationsDepartmentV2(
				reqBody,
				cancelToken.current,
				departmentId
			)
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
							currentPageName: "Department-Applications",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue(
							"Error in searching applications of department",
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

	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		//Segment Implementation
		if (props.department) {
			window.analytics.page("Departments", "Department-Applications", {
				department_name: props.department,
				department_id: props.id,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, []);

	return (
		<ApplicationDepFilter
			department_name={props.department}
			department_id={departmentId}
			data={data}
			metaData={metaData}
			usedColumns={metaData?.columns}
			isLoadingData={isLoadingData}
			hasMoreData={hasMoreData}
			searchQuery={searchQuery}
			checked={checked}
			setChecked={setChecked}
			handleLoadMore={handleLoadMore}
			handleRefresh={handleRefresh}
			setSearchQuery={debounce(setSearchQuery, 200)}
			appSourceList={appSourceList}
			showErrorModal={showErrorModal}
		/>
	);
}
