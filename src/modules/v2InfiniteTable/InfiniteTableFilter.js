import React, { useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { preventScroll } from "../../actions/ui-action";
import FilterIcons from "../../common/filterIcons";
import {
	checkAndFetchAllV2Data,
	checkAndFetchV2PropertyFile,
} from "./redux/v2infinite-action";
import { defaultReqBody } from "./utils/v2infiniteTableUtil";
import search from "../../assets/search.svg";
import refresh_icon from "../../assets/icons/refresh.svg";
import { ColumnRenderingModal } from "../../components/Users/Applications/Modals/ColumnRenderingModal";
import { FilterRenderingModal } from "../../components/Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import Chips from "../../components/Users/Applications/Modals/FiltersRenderer/Chip";
import Add from "../../assets/add.svg";
import RoleContext from "../../services/roleContext/roleContext";
import { PageButtonRenderer } from "modules/v2PaginatedTable/pageButtonRenderer";
import { trackActionSegment } from "modules/shared/utils/segment";
import { push } from "connected-react-router";
import { checkSpecialCharacters } from "services/api/search";
import { IntegrationErrorInfo } from "modules/integrations/components/IntegrationErrorInfo";

export function InfiniteTableFilter({
	checked,
	setChecked,
	searchQuery,
	setSearchQuery,
	metaData,
	columnsMapper,
	usedColumns,
	handleRefresh,
	isLoadingData,
	reqBody,
	setReqBody,
	v2Entity,
	getAPI,
	propertyListAPI,
	chipText,
	hasBulkEdit,
	bulkEditComponents,
	onAddClick,
	exportComponent,
	screenTagKey,
	sourceList,
	bulkUpdateViaCSVComponent,
	totalPages,
	pageLayoutPresent,
	checkAll,
	active_view,
	setCheckAll,
	setCheckAllExceptionData,
	checkAllExceptionData,
	selectedData,
	setSelectedData,
	forceShowBulkEditComponents,
	hideColumnsButton,
	tableFilterLeftSideComps,
}) {
	const dispatch = useDispatch();
	const [showHide, setshowHide] = useState(false);
	// const [searchTerm, setSearchTerm] = useState("");
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [inputInvalid, setInputInvalid] = useState(false);
	const [invalidCharacter, setInvalidCharater] = useState("");
	const [listOfColumns, setListOfColumns] = useState([]);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const { isViewer } = useContext(RoleContext);

	const router = useSelector((state) => state.router);
	const { hash, pathname, query } = router.location;
	const path = pathname.split("/");
	let route = path[1];

	const { loaded, propertyList, columnList, group_properties } = useSelector(
		(state) => state.v2Data[v2Entity]?.property_file || {}
	);

	const [searchTerm, setSearchTerm] = useState(
		query && query?.searchQuery
			? decodeURIComponent(query?.searchQuery)
			: ""
	);

	// console.log("searchQuery: inside filter", searchQuery);
	// useEffect(() => {
	// 	if (searchQuery === "") {
	// 		query.metaData && dispatch(push(hash || router.location.pathname));
	// 	}
	// 	setSearchTerm(searchQuery ? searchQuery : "");
	// }, [searchQuery]);

	useEffect(() => {
		if (searchQuery === "") {
			reqBody.filter_by = [];
			query.metaData &&
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
			setSearchTerm("");
		} else if (!searchQuery && !query.searchQuery) {
			setSearchTerm("");
		}
	}, [searchQuery]);

	useEffect(() => {
		if (!loaded || !propertyList.length || !columnList.length) {
			dispatch(checkAndFetchV2PropertyFile(v2Entity, propertyListAPI));
		}
	}, []);

	useEffect(() => {
		setListOfColumns(columnList);
	}, [columnList]);

	let addHideAppClose = () => {
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setshowHide(false);
	};

	function handleSubmit() {
		setSearchQuery();
		setSearchTerm("");
		dispatch(checkAndFetchAllV2Data(reqBody, 0, 30, v2Entity, getAPI));
		addHideAppClose();
		setChecked([]);
	}

	function onClearAll() {
		setSearchQuery();
		setSearchTerm("");
	}

	function onResetFilters() {
		setSearchQuery();
		setSearchTerm("");
		setReqBody({ ...defaultReqBody });
		dispatch(checkAndFetchAllV2Data(reqBody, 0, 30, v2Entity, getAPI));
		setChecked([]);
	}

	const handleSearchQuery = (event) => {
		let invalidKey = checkSpecialCharacters(
			event.target.value?.trim(),
			true,
			true
		);
		if (invalidKey) {
			setInputInvalid(true);
			setInvalidCharater(invalidKey);
		} else {
			setInputInvalid(false);
			setSearchQuery && setSearchQuery(event.target.value?.trim());
			setSearchTerm(event.target.value?.trimStart());
		}
	};

	useEffect(() => {
		let timer;
		if (invalidCharacter && inputInvalid) {
			timer = setInterval(() => setInvalidCharater(), 2000);
		}
		return () => clearInterval(timer);
	}, [inputInvalid]);

	const refreshReduxState = () => {
		!isLoadingData && handleRefresh();
	};

	return (
		<>
			{((route === "applications" && !hash.includes("automation")) ||
				route === "users") && <IntegrationErrorInfo type="overview" />}
			<div className="top__Uploads">
				<div className="Uploads__left">
					<FilterIcons
						preventScroll={preventScroll}
						isLoadingData={isLoadingData}
						setShowFilterModal={setShowFilterModal}
						setShowColumnsModal={setShowColumnsModal}
						screenTagKey={screenTagKey}
						setSearchQuery={setSearchQuery}
						searchQuery={searchTerm || searchQuery}
						text={chipText}
						metaData={
							metaData && Object.keys(metaData).length
								? metaData
								: reqBody
						}
						onResetFilters={onResetFilters}
						v2Entity={v2Entity}
						hideColumnsButton={hideColumnsButton}
					/>
					{tableFilterLeftSideComps ? tableFilterLeftSideComps : null}
				</div>
				<div className="Uploads__right">
					{(!isViewer &&
						hasBulkEdit &&
						bulkEditComponents &&
						checkAll) ||
					(checked && checked.length > 0) ||
					forceShowBulkEditComponents
						? bulkEditComponents(
								checked,
								setChecked,
								dispatch,
								handleRefresh,
								checkAll,
								setCheckAll,
								checkAllExceptionData,
								setCheckAllExceptionData,
								metaData,
								selectedData,
								setSelectedData
						  )
						: null}
					<div className="inputWithIconApps">
						<input
							type="text"
							placeholder="Search"
							value={searchTerm}
							onChange={handleSearchQuery}
							onClick={() => {
								trackActionSegment(
									`Clicked on Search Bar in ${v2Entity}`,
									{ currentPageName: v2Entity }
								);
							}}
						/>
						{inputInvalid && invalidCharacter && (
							<div
								className="font-11 mt-2"
								style={{
									color: "rgb(255, 103, 103)",
									position: "absolute",
									left: 0,
									top: "32px",
								}}
							>
								{invalidCharacter} is Invalid.
							</div>
						)}
						<img src={search} aria-hidden="true" />
					</div>
					{exportComponent &&
						propertyList &&
						exportComponent(
							checked,
							metaData,
							propertyList,
							checkAll
						)}
					{!isViewer && onAddClick && (
						<button
							className="appsad mr-3"
							onClick={() => onAddClick(refreshReduxState)}
						>
							<img src={Add} />
							<span id="te">Add</span>
						</button>
					)}
					<button
						className="appsad"
						onClick={() => {
							refreshReduxState();
							trackActionSegment(
								`Clicked on Refresh Button in ${v2Entity}`,
								{
									currentPageName: v2Entity,
								}
							);
						}}
						style={{ width: "50px" }}
					>
						<img
							className="w-100 h-100 m-auto"
							src={refresh_icon}
						/>
					</button>
					{!isViewer &&
						bulkUpdateViaCSVComponent &&
						propertyList &&
						bulkUpdateViaCSVComponent(
							checked,
							metaData,
							propertyList
						)}
				</div>
			</div>
			{showColumnsModal && (
				<>
					<div className="modal-backdrop show"></div>
					<div className="modal d-block">
						<ColumnRenderingModal
							handleSubmit={handleSubmit}
							show={showHide}
							onHide={addHideAppClose}
							submitting={submitInProgress}
							listOfColumns={listOfColumns}
							setListOfColumns={setListOfColumns}
							columnsMapper={columnsMapper}
							style={{ zIndex: "1" }}
							usedColumns={usedColumns}
							metaData={metaData}
							keyField={"_id"}
							pageLayoutPresent={pageLayoutPresent}
							active_view={active_view}
							v2Entity={v2Entity}
							screenTagKey={screenTagKey}
						/>
					</div>
				</>
			)}
			{showFilterModal && (
				<>
					<div className="modal-backdrop show"></div>
					<div className="modal d-block">
						<FilterRenderingModal
							handleSubmit={handleSubmit}
							show={showHide}
							onHide={addHideAppClose}
							filterPropertyList={propertyList}
							groups={group_properties}
							appliedFilters={
								metaData?.filter_by || reqBody?.filter_by
							}
							appliedGroupFilters={
								metaData?.group_filter_by ||
								reqBody?.group_filter_by
							}
							metaData={metaData}
							submitting={submitInProgress}
							style={{ zIndex: "1" }}
							appSourceList={sourceList}
							onClearAll={onClearAll}
							v2Entity={v2Entity}
						/>
					</div>
				</>
			)}
			{chipText && (
				<div className="d-flex align-items-center">
					<Chips
						searchQuery={searchTerm || searchQuery}
						text={chipText}
						metaData={
							metaData && Object.keys(metaData).length
								? metaData
								: reqBody
						}
						onResetFilters={onResetFilters}
						isInfiniteTable={true}
						isLoadingData={isLoadingData}
						setSearchQuery={setSearchQuery}
					/>
				</div>
			)}
		</>
	);
}
