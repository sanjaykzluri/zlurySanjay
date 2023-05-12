import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "../../utils/common";
import { EmptySearch } from "../../common/EmptySearch";
import { ErrorComponent } from "../../common/ErrorComponnet";
import { Empty } from "../security/components/Empty/Empty";
import { SCREEN_TAG_MAP } from "../../constants/views";
import {
	addArchiveFilter,
	defaultReqBody,
	getSearchReqObj,
} from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import {
	checkAndFetchAllV2Data,
	checkAndFetchV2SourceListForFilter,
	clearAllV2DataCache,
	fetchAllV2Data,
	setPagePaginatedTable,
	setScrollTopPaginatedTable,
} from "modules/v2PaginatedTable/redux/v2paginated-action";

import { V2PaginatedTableFilter } from "./v2PaginatedTableFilter";
import InfiniteTable from "modules/v2InfiniteTable/infiniteTable";
import _ from "underscore";

import {
	clearAllV2DataCache as clearInfiniteTableData,
	v2updateScrollPosition,
} from "modules/v2InfiniteTable/redux/v2infinite-action";
import { v2PaginatedConstants } from "./constants/v2PaginatedTableConstants";
import { stateFilterMap } from "modules/v2InfiniteTable/InfiniteTableContainer";
export default function V2PaginatedTableContainer({
	columnsMapper,
	screenTagKey,
	screenType,
	v2TableEntity,
	v2SearchFieldId,
	v2SearchFieldName,
	getAPI,
	searchAPI,
	propertyListAPI,
	keyField,
	chipText,
	hasBulkEdit = false,
	bulkEditComponents,
	onAddClick,
	fullRowArray,
	fullRowMapper,
	exportComponent,
	archiveFilterId,
	sourceListAPI,
	bulkUpdateViaCSVComponent,
	pageLayoutPresent,
	rowFormatRequired,
	rowFormatClassName,
	user_search,
	active_view,
	set_all_present,
	hasExpandedRow,
	loadexpandedRowComponent,
	app_search,
	singleKeywordSearch = false,
}) {
	const cancelToken = useRef();
	const [checked, setChecked] = useState([]);
	// const [searchQuery, setSearchQuery] = useState();
	const [refreshTable, setRefreshTable] = useState(false);
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [v2Entity, setV2Entity] = useState(v2TableEntity);
	const [totalPages, setTotalPages] = useState();

	const reduxData = useSelector(
		(state) =>
			state.v2PaginatedData[v2Entity]?.[`${JSON.stringify(reqBody)}`] ||
			state.v2PaginatedData[v2Entity]
	);

	const [pageConstant, setPageConstant] = useState(
		`page_${reduxData.pageNo}_row_${reduxData.row}`
	);

	const { source_list_for_filter_loaded, source_list_for_filter } =
		useSelector(
			(state) => state.v2PaginatedData[v2Entity]?.source_list || {}
		);

	const dispatch = useDispatch();
	const query = useSelector((state) => state.router.location.query);
	const [searchQuery, setSearchQuery] = useState(
		query && query?.searchQuery
			? decodeURIComponent(query && query?.searchQuery)
			: undefined
	);
	const router = useSelector((state) => state.router);
	let { hash } = router.location;
	hash = hash.split("#");
	hash = hash[hash.length - 1];
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [checkAll, setCheckAll] = useState(false);
	const [checkAllExceptionData, setCheckAllExceptionData] = useState([]);
	const [searchFilter, setSearchFilter] = useState([]);

	useEffect(() => {
		if (!source_list_for_filter_loaded && sourceListAPI) {
			dispatch(
				checkAndFetchV2SourceListForFilter(v2Entity, sourceListAPI)
			);
		}
	}, []);

	useEffect(() => {
		if (reduxData) {
			setPageConstant(`page_${reduxData.pageNo}_row_${reduxData.row}`);
			if (reduxData.metaData) {
				var pages = Math.ceil(
					reduxData.metaData.total / Number.parseInt(reduxData.row)
				);
				setTotalPages(pages);
			}
		}
	}, [reduxData, reduxData.row, reduxData.pageNo]);

	useEffect(() => {
		if (v2TableEntity) {
			setV2Entity(v2TableEntity);
		}
	}, [v2TableEntity]);

	useEffect(() => {
		if (!searchQuery) {
			loadData();
		}
	}, [reduxData.pageNo, query, reduxData.row]);

	function loadSearch() {
		if (
			searchQuery === "" ||
			searchQuery?.length > 1 ||
			(searchQuery && singleKeywordSearch)
		) {
			if (screenTagKey) {
				reqBody.screen_tag = SCREEN_TAG_MAP[screenTagKey];
			}
			if (screenType) {
				reqBody.type = screenType;
			}
			if (searchQuery && searchQuery.length > 0) {
				const searchObj = getSearchReqObj(
					searchQuery,
					v2SearchFieldId,
					v2SearchFieldName
				);
				const searchByEmailObj = getSearchReqObj(
					searchQuery,
					screenType === "onboarding" || screenType === "offboarding"
						? "onboardingoffboardingusers.email"
						: "user_email",
					"User Email"
				);
				reqBody.filter_by = user_search
					? [
							searchObj,
							screenType === "onboarding" ||
							screenType === "offboarding"
								? searchByEmailObj
								: {
										field_id: "user_account_type",
										field_name: "User Account Type",
										field_values: stateFilterMap[hash],
										filter_type: "string",
										field_order: "contains",
										negative: false,
										is_custom: false,
								  },
					  ]
					: app_search
					? [
							searchObj,
							{
								field_id: "app_state",
								field_name: "Authorisation Status",
								field_values: stateFilterMap[hash],
								filter_type: "string",
								field_order: "contains",
								negative: false,
								is_custom: false,
							},
					  ]
					: [searchObj];
				if (user_search) {
					reqBody.user_search = true;
				}
				let searchFilterObj = getSearchReqObj(
					searchQuery,
					v2SearchFieldId,
					v2SearchFieldName
				);
				setSearchFilter(searchFilterObj);
			} else {
				reqBody.filter_by = [];
				delete reqBody.user_search;
			}
			delete reqBody.reset_filter;
			setReqBody({ ...reqBody });
		}
	}

	useEffect(() => {
		loadSearch();
	}, [searchQuery, reduxData.pageNo, reduxData.row]);

	useEffect(() => {
		if (searchQuery?.length > 1) {
			let searchReqParams = {
				is_search: true,
				search_query: searchQuery,
			};
			!reduxData.isLoadingData &&
				dispatch(
					checkAndFetchAllV2Data(
						reqBody,
						reduxData.pageNo || 0,
						reduxData.row || 20,
						v2Entity,
						getAPI,
						searchReqParams
					)
				);
		}
	}, [reqBody]);

	const loadData = (isRefresh) => {
		if (searchQuery?.length > 1 && !isRefresh) return;
		let urlMetaData;
		let urlReqBody = reqBody;
		if (query.metaData) {
			urlMetaData = JSON.parse(JSON.stringify(query));
			urlReqBody = JSON.parse(decodeURIComponent(urlMetaData.metaData));
			reqBody.sort_by = urlReqBody.sort_by || [];
			reqBody.filter_by = urlReqBody.filter_by || [];
			reqBody.group_filter_by = urlReqBody.group_filter_by || [];
			reqBody.columns = urlReqBody.columns || [];
			if (urlReqBody.reset_filter) {
				reqBody.reset_filter = urlReqBody.reset_filter;
			} else {
				delete reqBody.reset_filter;
			}
			if (archiveFilterId && urlReqBody?.filter_by?.length) {
				reqBody.filter_by = addArchiveFilter(
					urlReqBody,
					reqBody,
					archiveFilterId
				);
			}
		}
		if (screenTagKey) {
			reqBody.screen_tag = SCREEN_TAG_MAP[screenTagKey];
		}
		if (screenType) {
			reqBody.type = screenType;
		}
		setReqBody({ ...reqBody });

		!reduxData.isLoadingData &&
			dispatch(
				checkAndFetchAllV2Data(
					reqBody,
					reduxData.pageNo || 0,
					reduxData.row || 20,
					v2Entity,
					getAPI,
					pageConstant
				)
			);
	};

	function updateScrollPosition(scrollTop) {
		dispatch(setScrollTopPaginatedTable(v2Entity, scrollTop, reqBody));
	}

	async function handleRefresh() {
		const clearData = await dispatch(
			clearAllV2DataCache(v2Entity, reduxData.row, reduxData.pageNo)
		);
		const clearInfiniteData = await dispatch(
			clearInfiniteTableData(v2Entity)
		);
		if (searchQuery?.length > 1) {
			loadSearch();
		} else {
			loadData();
		}
		setShowErrorModal(false);
	}

	return (
		<>
			<V2PaginatedTableFilter
				checked={checked}
				setChecked={setChecked}
				searchQuery={searchQuery}
				setSearchQuery={debounce(setSearchQuery, 700)}
				metaData={reduxData.metaData}
				columnsMapper={columnsMapper(handleRefresh)}
				usedColumns={reduxData.metaData?.columns}
				handleRefresh={handleRefresh}
				isLoadingData={reduxData.isLoadingData}
				reqBody={reqBody}
				setReqBody={setReqBody}
				v2Entity={v2Entity}
				getAPI={getAPI}
				propertyListAPI={propertyListAPI}
				chipText={chipText}
				hasBulkEdit={hasBulkEdit}
				bulkEditComponents={bulkEditComponents}
				onAddClick={onAddClick}
				exportComponent={exportComponent}
				screenTagKey={screenTagKey}
				sourceList={source_list_for_filter}
				bulkUpdateViaCSVComponent={bulkUpdateViaCSVComponent}
				totalPages={totalPages}
				pageLayoutPresent={pageLayoutPresent}
				checkAll={checkAll}
				reduxData={reduxData}
				active_view={active_view}
				setCheckAll={setCheckAll}
				setCheckAllExceptionData={setCheckAllExceptionData}
				checkAllExceptionData={checkAllExceptionData}
			/>
			<InfiniteTable
				checked={checked}
				setChecked={setChecked}
				data={reduxData[pageConstant]}
				metaData={reduxData.metaData}
				columnsMapper={columnsMapper(handleRefresh)}
				keyField={keyField}
				emptyState={
					searchQuery ? (
						<EmptySearch
							searchQuery={searchQuery}
							metaData={reduxData?.metaData}
							searchFilter={searchFilter}
							app_search={app_search}
							user_search={user_search}
							onReset={() => {
								setSearchQuery();
								setReqBody({ ...defaultReqBody });
								dispatch(
									fetchAllV2Data(
										reqBody,
										0,
										30,
										v2Entity,
										getAPI
									)
								);
							}}
						/>
					) : reduxData.error ? (
						<ErrorComponent
							onReset={() => {
								setSearchQuery();
								setReqBody({ ...defaultReqBody });
								dispatch(
									fetchAllV2Data(
										reqBody,
										0,
										20,
										v2Entity,
										getAPI
									)
								);
							}}
						/>
					) : (
						<Empty />
					)
				}
				searchQuery={searchQuery}
				isLoadingData={reduxData.isLoadingData}
				hasMoreData={reduxData.hasMoreData}
				allowFewSpecialCharacters={true}
				disableCheckbox={!hasBulkEdit}
				key={JSON.stringify(reqBody)}
				fullRowArray={fullRowArray}
				fullRowMapper={fullRowMapper}
				onSort={() => searchQuery && setSearchQuery("")}
				checkAll={checkAll}
				setCheckAll={setCheckAll}
				checkAllExceptionData={checkAllExceptionData}
				setCheckAllExceptionData={setCheckAllExceptionData}
				chipText={chipText}
				rowFormatRequired={rowFormatRequired}
				rowFormatClassName={rowFormatClassName}
				updateScrollPosition={updateScrollPosition}
				scrollTop={reduxData?.scrollTop}
				isPaginatedTable={true}
				set_all_present={true}
				v2TableEntity={v2TableEntity}
				hasExpandedRow={hasExpandedRow}
				loadexpandedRowComponent={loadexpandedRowComponent}
				handleRefresh={handleRefresh}
			/>
		</>
	);
}
