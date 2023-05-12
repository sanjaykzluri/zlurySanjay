import { push } from "connected-react-router";
import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	checkAndFetchAllV2Data,
	checkAndFetchV2SourceListForFilter,
	clearAllV2DataCache,
	fetchAllV2Data,
	searchAllV2Data,
	v2updateScrollPosition,
} from "./redux/v2infinite-action";
import {
	addArchiveFilter,
	defaultReqBody,
	getSearchReqObj,
} from "./utils/v2infiniteTableUtil";
import { debounce } from "../../utils/common";
import { v2InfiniteConstants } from "./constants/v2InfiniteTableConstants";
import { InfiniteTableFilter } from "./InfiniteTableFilter";
import { EmptySearch } from "../../common/EmptySearch";
import { ErrorComponent } from "../../common/ErrorComponnet";
import { Empty } from "../security/components/Empty/Empty";
import InfiniteTable from "./infiniteTable";
import { SCREEN_TAG_MAP } from "../../constants/views";
import { clearAllV2DataCache as clearPaginatedTableData } from "modules/v2PaginatedTable/redux/v2paginated-action";
import _ from "underscore";
import { trackActionSegment } from "modules/shared/utils/segment";
export default function InfiniteTableContainer({
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
	rowFormatRequired,
	rowFormatClassName,
	user_search,
	pageLayoutPresent,
	active_view,
	set_all_present,
	forceShowBulkEditComponents,
	hasExpandedRow,
	loadexpandedRowComponent,
	app_search,
	singleKeywordSearch = false,
	hideColumnsButton,
	tableFilterLeftSideComps,
	handleRowClick,
	resetFilter = false,
}) {
	const cancelToken = useRef();
	const [checked, setChecked] = useState([]);

	const [refreshTable, setRefreshTable] = useState(false);
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [v2Entity, setV2Entity] = useState(v2TableEntity);

	const {
		data,
		metaData,
		hasMoreData,
		isLoadingData,
		pageNo,
		error,
		scrollTop,
	} = useSelector(
		(state) => state.v2Data[v2Entity]?.[`${JSON.stringify(reqBody)}`] || {}
	);

	const { source_list_for_filter_loaded, source_list_for_filter } =
		useSelector((state) => state.v2Data[v2Entity]?.source_list || {});

	const dispatch = useDispatch();
	const query = useSelector((state) => state.router.location.query);
	const [searchQuery, setSearchQuery] = useState(
		query?.searchQuery
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
	const [selectedData, setSelectedData] = useState([]);
	const [searchFilter, setSearchFilter] = useState([]);

	useEffect(() => {
		if (!source_list_for_filter_loaded && sourceListAPI) {
			dispatch(
				checkAndFetchV2SourceListForFilter(v2Entity, sourceListAPI)
			);
		}
	}, []);
	useEffect(() => {
		if (query?.selectedTab === "runs") handleRefresh();
	}, [query]);

	useEffect(() => {
		if (v2TableEntity) {
			setV2Entity(v2TableEntity);
		}
	}, [v2TableEntity]);

	useEffect(() => {
		if (searchQuery && query?.metaData && query.searchQuery) {
			loadData();
		}
	}, [pageNo]);

	useEffect(() => {
		if (searchQuery?.length > 1 || (searchQuery && singleKeywordSearch)) {
			loadSearch();
			let searchFilterObj = getSearchReqObj(
				searchQuery,
				v2SearchFieldId,
				v2SearchFieldName
			);
			setSearchFilter(searchFilterObj);
		}
		if (searchQuery === "" || (!searchQuery && !query.searchQuery)) {
			loadData();
		}
	}, [searchQuery, query]);

	const loadSearch = () => {
		if (screenTagKey) {
			reqBody.screen_tag = SCREEN_TAG_MAP[screenTagKey];
		}
		if (screenType) {
			reqBody.type = screenType;
		}
		if (searchQuery && searchQuery.length > 0) {
			delete reqBody.reset_filter;
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
						{
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
		} else {
			reqBody.filter_by = [];
			delete reqBody.user_search;
		}
		let searchReqParams = {
			is_search: true,
			search_query: searchQuery,
		};
		setReqBody({ ...reqBody });

		dispatch(
			checkAndFetchAllV2Data(
				reqBody,
				0,
				30,
				v2Entity,
				getAPI,
				searchReqParams
			)
		);
	};

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
			if (
				archiveFilterId &&
				urlReqBody?.filter_by?.length &&
				!searchQuery
			) {
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
		if (resetFilter && !query.metaData) {
			reqBody.filter_by = [];
		}
		setReqBody({ ...reqBody });
		dispatch(checkAndFetchAllV2Data(reqBody, 0, 30, v2Entity, getAPI));
	};

	function handleLoadMore() {
		if (hasMoreData) {
			dispatch(fetchAllV2Data(reqBody, pageNo + 1, 30, v2Entity, getAPI));
		}
	}

	async function handleRefresh() {
		const clearData = await dispatch(clearAllV2DataCache(v2Entity));
		const clearPaginatedData = dispatch(clearPaginatedTableData(v2Entity));
		if (searchQuery?.length > 1) {
			loadSearch();
		} else {
			loadData();
		}
		setShowErrorModal(false);
	}

	function updateScrollPosition(scrollTop) {
		dispatch(v2updateScrollPosition(v2Entity, reqBody, scrollTop));
	}

	return (
		<>
			<InfiniteTableFilter
				checked={checked}
				setChecked={setChecked}
				searchQuery={searchQuery}
				setSearchQuery={debounce(setSearchQuery, 700)}
				metaData={metaData}
				columnsMapper={columnsMapper(
					handleRefresh,
					metaData,
					setChecked
				)}
				usedColumns={metaData?.columns}
				handleRefresh={handleRefresh}
				isLoadingData={isLoadingData}
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
				pageLayoutPresent={pageLayoutPresent}
				checkAll={checkAll}
				setCheckAll={setCheckAll}
				setCheckAllExceptionData={setCheckAllExceptionData}
				active_view={active_view}
				checkAllExceptionData={checkAllExceptionData}
				selectedData={selectedData}
				setSelectedData={setSelectedData}
				forceShowBulkEditComponents={forceShowBulkEditComponents}
				hideColumnsButton={hideColumnsButton}
				tableFilterLeftSideComps={tableFilterLeftSideComps}
			/>
			<InfiniteTable
				checked={checked}
				setChecked={setChecked}
				data={data}
				metaData={metaData}
				handleLoadMore={handleLoadMore}
				columnsMapper={columnsMapper(
					handleRefresh,
					metaData,
					setChecked
				)}
				keyField={keyField}
				hasExpandedRow={hasExpandedRow}
				v2TableEntity={v2TableEntity}
				emptyState={
					searchQuery ? (
						<EmptySearch
							searchQuery={searchQuery}
							metaData={metaData}
							searchFilter={searchFilter}
							app_search={app_search}
							user_search={user_search}
							onReset={() => {
								setSearchQuery("");
								setReqBody({ ...defaultReqBody });
							}}
						/>
					) : error ? (
						<ErrorComponent
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
					) : (
						<Empty />
					)
				}
				searchQuery={searchQuery}
				onSort={() => searchQuery && setSearchQuery("")}
				isLoadingData={isLoadingData}
				hasMoreData={hasMoreData}
				allowFewSpecialCharacters={true}
				disableCheckbox={!hasBulkEdit}
				key={JSON.stringify({ ...reqBody })}
				fullRowArray={fullRowArray}
				fullRowMapper={fullRowMapper}
				rowFormatRequired={rowFormatRequired}
				rowFormatClassName={rowFormatClassName}
				checkAll={checkAll}
				setCheckAll={setCheckAll}
				checkAllExceptionData={checkAllExceptionData}
				setCheckAllExceptionData={setCheckAllExceptionData}
				chipText={chipText}
				set_all_present={set_all_present}
				updateScrollPosition={updateScrollPosition}
				scrollTop={scrollTop}
				selectedData={selectedData}
				setSelectedData={setSelectedData}
				loadexpandedRowComponent={loadexpandedRowComponent}
				handleRefresh={handleRefresh}
				handleRowClick={handleRowClick}
			/>
		</>
	);
}

export const stateFilterMap = {
	managed: ["centrally managed", "team managed", "individually managed"],
	unmanaged: ["unmanaged"],
	needs_review: ["needs review"],
	restricted: ["restricted"],
	group: ["group"],
	employees: ["employee"],
	service: ["service"],
	marked_for_onboarding: ["onboarding"],
	marked_for_offboarding: ["offboarding"],
	external: ["external"],
};
