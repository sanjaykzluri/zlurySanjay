import React, { useState, useRef, useEffect } from "react";
import search from "../../../assets/search.svg";
import CSV from "../../../assets/CSV.svg";
import { Loader } from "../../../common/Loader/Loader";
import arrowdropdown from "./arrowdropdown.svg";
import { WorkFlowModalins } from "../Modals/WorkFlowModal";
import master from "../../../assets/transactions/mastercard.svg";
import {
	exportUnrecognisedTransactionCSV,
	getTransactionsPropertiesList,
	getUnrecognisedTransactionsPropertiesList,
} from "../../../services/api/transactions";
import useOutsideClick from "../../../common/OutsideClick/OutsideClick";
import refresh_icon from "../../../assets/icons/refresh.svg";
import {
	getPaymentMethods,
	setPMTransBulk,
	setTransArchiveBulk,
	setTransactionsArchiveBulk,
} from "../../../services/api/transactions";
import { useDispatch, useSelector } from "react-redux";
import visa from "../../../assets/transactions/visa.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Col, Form, Row } from "react-bootstrap";
import { capitalizeFirstLetter } from "../../../utils/common";
import { SideModal } from "../../Applications/AllApps/SideModal";
import NoResultsFoundSVG from "../../../assets/search__outer2.svg";
import { transactionConstants } from "../../../constants";
import { getImageForPaymentMethodDropdown } from "../Recognised/Dropdown";
import { UnassignArchiveModal } from "../Modals/UnassignArchiveModal";
import FilterIcons from "../../../common/filterIcons";
import Chips from "../../Users/Applications/Modals/FiltersRenderer/Chip";
import { FilterRenderingModal } from "../../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import { ColumnRenderingModal } from "../../Users/Applications/Modals/ColumnRenderingModal";
import { preventScroll } from "../../../actions/ui-action";
import BulkChangePaymentMethod from "../../../modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import ExportModal from "../../../common/Export/ExportModal";

export function UnrecognisedTransactionsFilters(props) {
	const refBulkAction = useRef();
	const refPayment = useRef();
	const [showHideFilter, setshowHideFilter] = useState(false);
	let addHideFilterClose = () => setshowHideFilter(false);
	const [CSVModalVisible, setCSVModalVisible] = useState(false);
	const [paymentMethods, setPaymentMethods] = useState([]);
	const [paymentsearchresult, setpaymentsearchresult] = useState([]);
	const [changePaymentQuery, setChangePaymentQuery] = useState("");
	const [paymentName, setPaymentName] = useState("");
	const [dd1insideactive, setdd1insideactive] = useState(false);
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [showTxnAssignModal, setShowTxnAssignModal] = useState(false);
	const [bulkArchiveLoading, setBulkArchiveLoading] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [dd1active, setdd1active] = useState(false);
	const [dd2active, setdd2active] = useState(false);
	const dispatch = useDispatch();
	const showTooltipLength = 20;
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const {
		metaData,
		searchQuery,
		columnsMapper,
		usedColumns,
		handleRefresh,
		isLoadingData,
		checked,
		setChecked,
		transactionType,
		selectedTransactions,
		setSelectedTransactions,
		hideExportButton = false,
	} = props;

	const id = window.location.pathname.split("/")[2];
	const [showHide, setshowHide] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [propertyList, setPropertyList] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [loading, setLoading] = useState(true);
	const cancelToken = useRef();

	let addHideAppClose = () => {
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setshowHide(false);
	};

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
	}

	const refreshReduxState = () => {
		!isLoadingData && handleRefresh();
	};

	useEffect(() => {
		if (loading) {
			getTransactionsPropertiesList(transactionType).then((res) => {
				if (res != null) {
					if (
						res.data != null &&
						res.data.properties != null &&
						Array.isArray(res.data.columns) &&
						Array.isArray(res.data.properties)
					) {
						setPropertyList(res.data.properties);
						setListOfColumns(res.data.columns);
					} else {
						setPropertyList([]);
						setListOfColumns([]);
					}
				} else {
					setPropertyList([]);
					setListOfColumns([]);
				}
				setLoading(false);
			});
		}
	}, []);

	useOutsideClick(refBulkAction, () => {
		if (dd2active) setdd2active(false);
	});

	useOutsideClick(refPayment, () => {
		if (dd1active) setdd1active(false);
	});

	const handleSearchQuery = (event) => {
		setSearchTerm(event.target.value.trimStart());
		let searchQuery = event.target.value.trim();
		if (searchQuery.length == 1) {
			event.persist();
		} else {
			props.setSearchQuery(searchQuery);
		}
	};

	let handleChangePayment = (value, paymentLoading) => {
		setChangePaymentQuery(value.trimStart());
		setPaymentName(value);
		const search = value.toLowerCase();
		var matchingPaymentArray = [];
		if (value.length > 0) {
			setdd1insideactive(true);
		} else {
			setdd1insideactive(false);
		}
		if (paymentLoading === false) {
			paymentMethods.map((el) => {
				if (
					el?.cc_card_name?.toLowerCase().includes(search) ||
					el?.bank_name?.toLowerCase().includes(search) ||
					el?.payment_method_name?.toLowerCase().includes(search)
				) {
					matchingPaymentArray.push(el);
				}
			});
		}
		setpaymentsearchresult(matchingPaymentArray);
	};

	var paymentmethods = !dd1insideactive
		? paymentMethods
		: paymentsearchresult;

	useEffect(() => {
		if (props.selectedIds.length > 0) {
			setdd1active(false);
			setdd2active(false);
		}
	}, [props.selectedIds]);
	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Transactions",
			currentPageName: "Unrecognised-Transactions",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const clickedOnChangeBulkActionsDropdown = () => {
		setdd2active(!dd2active);
		commonSegmentTrack("Bulk Actions Button Clicked");
	};
	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Unrecognised Transactions");
	};

	const [showExportModal, setShowExportModal] = useState(false);
	const [showInProgressModal, setShowInProgressModal] = useState(false);
	const [searchPropertyList, setSearchPropertyList] = useState("");

	const defaultExportObj = {
		filter_by: [],
		sort_by: [],
		file_type: "csv",
		columns_required: [],
	};

	const [exportRequestObj, setExportRequestObj] = useState({
		...defaultExportObj,
	});

	useEffect(() => {
		if (props.clearSearchQuery) {
			setSearchTerm("");
		}
	}, [props.clearSearchQuery]);

	const clearCache = () => {
		props.isUploads
			? dispatch({
					type: transactionConstants.DELETE_ALL_UPLOADS_RECOG_CACHE,
					payload: {
						id: props.id,
					},
			  })
			: dispatch({
					type: transactionConstants.DELETE_ALL_RECOGNISED_TRANSACTIONS_CACHE,
			  });
	};

	const exportSelectedUnrecognisedTransactions = () => {
		let tempExportRequestObj = { ...exportRequestObj, ["filter_by"]: [] };
		tempExportRequestObj.filter_by.push({
			field_values: props.selectedIds,
			field_id: "transaction_id",
			filter_type: "objectId",
			negative: false,
			is_custom: false,
		});
		setExportRequestObj(tempExportRequestObj);
	};

	return (
		<>
			<div className="top__Uploads">
				<div className="Uploads__left">
					<FilterIcons
						preventScroll={preventScroll}
						isLoadingData={isLoadingData}
						setShowFilterModal={setShowFilterModal}
						setShowColumnsModal={setShowColumnsModal}
						metaData={metaData}
					/>
				</div>
				<div className="Uploads__right">
					{props.selectedIds.length > 0 ? (
						<>
							<BulkChangePaymentMethod
								entity_ids={checked}
								api_call={setPMTransBulk}
								refresh={handleRefresh}
								is_success={(res) =>
									res && res.status === "success"
								}
							/>
							<button
								className="autho__dd__cont8 ml-2"
								onClick={clickedOnChangeBulkActionsDropdown}
								ref={refBulkAction}
							>
								Bulk Actions
								<img
									src={arrowdropdown}
									style={{ marginLeft: "8px" }}
								></img>
								{dd2active ? (
									<div className="autho__dd__cont8__options menu">
										<div
											onClick={() =>
												setShowTxnAssignModal(true)
											}
											role="button"
											className="autho__dd__cont8__option"
										>
											Assign Apps
										</div>
										<hr style={{ margin: "0px 18px" }}></hr>
										<div
											onClick={() => {
												setShowArchiveModal(true);
											}}
											role="button"
											className="autho__dd__cont8__option"
										>
											Archive
										</div>
									</div>
								) : null}
							</button>
							{showTxnAssignModal ? (
								<WorkFlowModalins
									data={props.selectedTransactions}
									id={props.selectedIds}
									setSelectedIds={(v) =>
										props.setSelectedIds(v)
									}
									isOpen={showTxnAssignModal}
									handleClose={() => {
										setShowTxnAssignModal(false);
									}}
									setSelectedIds={props.setSelectedIds}
									fetchTransactions={props.fetchTransactions}
									page={props.page}
									rows={props.TABLE_ROW}
									cancelToken={cancelToken}
									handleSearchRequests={
										props.handleSearchRequests
									}
									searchQuery={props.searchQuery}
									clearCache={handleRefresh}
									refreshReduxState={refreshReduxState}
								/>
							) : null}
							{showArchiveModal && (
								<UnassignArchiveModal
									data={props.selectedTransactions}
									id={props.selectedIds}
									setSelectedIds={(v) =>
										props.setSelectedIds(v)
									}
									setSelectedTransactions={
										props.setSelectedTransactions
									}
									isOpen={showArchiveModal}
									handleClose={() => {
										setShowArchiveModal(false);
									}}
									setSelectedIds={props.setSelectedIds}
									fetchTransactions={props.fetchTransactions}
									page={props.page}
									rows={props.TABLE_ROW}
									cancelToken={cancelToken}
									handleSearchRequests={
										props.handleSearchRequests
									}
									searchQuery={props.searchQuery}
									title={"Archive Transactions"}
									requestFunction={setTransactionsArchiveBulk}
									buttonText={"Archive"}
									isUnrecognisedPage={true}
									refreshAllPages={props.refreshAllPages}
									refreshReduxState={refreshReduxState}
								/>
							)}
						</>
					) : null}
					<div className="inputWithIconApps">
						<input
							type="text"
							placeholder="Search Transactions"
							value={searchTerm}
							onChange={(e) => {
								handleSearchQuery(e);
							}}
							onClick={clickedOnSearch}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					{!hideExportButton && (
						<ExportModal
							title="Export Unecognised Transactions Data"
							show={showExportModal}
							onHide={() => setShowExportModal(false)}
							propertyList={propertyList}
							hiddenPropertiesArray={[
								"_id",
								"source_id",
								"payment_method_id",
							]}
							exportEntity="Transactions"
							selectedDataFieldId="_id"
							selectedData={selectedTransactions}
							exportCSV={exportUnrecognisedTransactionCSV}
							exportScheduleName="Unrecognised Transactions Export"
							scheduleEntity="unrecognized_transactions"
						/>
					)}
					<div>
						<button
							ref={cancelToken}
							className="appsad"
							onClick={() => refreshReduxState()}
							style={{
								width: "50px",
							}}
						>
							<img
								className="w-100 h-100 m-auto"
								src={refresh_icon}
							/>
						</button>
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
									v2Entity={transactionType}
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
									appliedFilters={metaData?.filter_by}
									metaData={metaData}
									submitting={submitInProgress}
									style={{ zIndex: "1" }}
									v2Entity={transactionType}
								/>
							</div>
						</>
					)}
				</div>
			</div>
			<Chips
				searchQuery={searchQuery}
				text={"Transactions"}
				metaData={metaData}
				isInfiniteTable={true}
				setSearchQuery={props.setSearchQuery}
			/>
		</>
	);
}
