import React, { useState, useRef, useEffect } from "react";
import useOutsideClick from "../../../common/OutsideClick/OutsideClick";
import search from "../../../assets/search.svg";
import CSV from "../../../assets/CSV.svg";
import master from "../../../assets/transactions/mastercard.svg";
import visa from "../../../assets/transactions/visa.svg";
import bank from "../../../assets/transactions/bank.svg";
import card from "../../../assets/transactions/card.svg";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import arrowdropdown from "../Unrecognised/arrowdropdown.svg";
import refresh_icon from "../../../assets/icons/refresh.svg";
import { useDispatch, useSelector } from "react-redux";
import {
	exportArchivedTransactionCSV,
	getPaymentMethods,
	getArchivedTransactionsPropertiesList,
	setPMTransBulk,
	setTransUnarchiveBulk,
	getTransactionsPropertiesList,
} from "../../../services/api/transactions";
import { Loader } from "../../../common/Loader/Loader";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Col, Form, Row } from "react-bootstrap";
import { capitalizeFirstLetter } from "../../../utils/common";
import { SideModal } from "../../Applications/AllApps/SideModal";
import NoResultsFoundSVG from "../../../assets/search__outer2.svg";
import {
	transactionConstants,
	v2EntitiesTransactions,
} from "../../../constants";
import { getImageForPaymentMethodDropdown } from "../Recognised/Dropdown";
import FilterIcons from "../../../common/filterIcons";
import { preventScroll } from "../../../actions/ui-action";
import { ColumnRenderingModal } from "../../Users/Applications/Modals/ColumnRenderingModal";
import { FilterRenderingModal } from "../../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import Chips from "../../Users/Applications/Modals/FiltersRenderer/Chip";
import BulkChangePaymentMethod from "../../../modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import ExportModal from "../../../common/Export/ExportModal";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";
import { checkSpecialCharacters } from "services/api/search";

export function ArchivedTransactionsFilters(props) {
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
		setSearchQuery,
	} = props;

	const cancelToken = useRef();
	const [showHideFilter, setshowHideFilter] = useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	let addHideFilterClose = () => setshowHideFilter(false);
	const [searchTerm, setSearchTerm] = useState(searchQuery || "");
	const [showBulkAction, setShowBulkAction] = useState(false);
	const [dd1active, setdd1active] = useState(false);
	const [bulkArchiveLoading, setBulkArchiveLoading] = useState(false);
	const [paymentName, setPaymentName] = useState("");
	const [dd1insideactive, setdd1insideactive] = useState(false);
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [paymentsearchresult, setpaymentsearchresult] = useState([]);
	const [changePaymentQuery, setChangePaymentQuery] = useState("");
	const refPayment = useRef();
	const refBulkAction = useRef();
	const [paymentMethods, setPaymentMethods] = useState([]);
	const dispatch = useDispatch();
	const [inputInvalid, setInputInvalid] = useState(false);
	const [invalidCharacter, setInvalidCharater] = useState("");

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

	useEffect(() => {
		setSearchTerm(searchQuery ? searchQuery : "");
	}, [searchQuery]);

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

	useOutsideClick(refBulkAction, () => {
		if (showBulkAction) setShowBulkAction(false);
	});

	useOutsideClick(refPayment, () => {
		if (dd1active) setdd1active(false);
	});

	useEffect(() => {
		if (props.selectedIds.length > 0) {
			setdd1active(false);
			setShowBulkAction(false);
		}
	}, [props.selectedIds]);

	var paymentmethods = !dd1insideactive
		? paymentMethods
		: paymentsearchresult;
	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Transactions",
			currentPageName: "Archived-Transactions",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const clickedOnChangeBulkActionsDropdown = () => {
		setShowBulkAction(!showBulkAction);
		commonSegmentTrack("Bulk Actions Button Clicked");
	};
	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Archived Transactions");
	};

	const [showExportModal, setShowExportModal] = useState(false);
	const [showInProgressModal, setShowInProgressModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [propertyList, setPropertyList] = useState([]);
	const [searchPropertyList, setSearchPropertyList] = useState("");
	const [hasRecogFlag, setHasRecogFlag] = useState(false);
	const [hasUnrecogFlag, setHasUnrecogFlag] = useState(false);

	const [showHide, setshowHide] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [listOfColumns, setListOfColumns] = useState([]);

	let addHideAppClose = () => {
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setshowHide(false);
	};

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
		setSearchQuery();
	}

	const refreshReduxState = () => {
		!isLoadingData && handleRefresh();
	};

	useEffect(() => {
		if (
			selectedTransactions?.some(
				(el) =>
					typeof el?.transaction_app === "object" &&
					el?.transaction_app?.app_id
			)
		) {
			setHasRecogFlag(true);
		} else {
			setHasRecogFlag(false);
		}
		if (
			selectedTransactions?.some(
				(el) =>
					typeof el?.transaction_app !== "object" ||
					!el?.transaction_app?.app_id
			)
		) {
			setHasUnrecogFlag(true);
		} else {
			setHasUnrecogFlag(false);
		}
	}, [selectedTransactions]);

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

	const exportSelectedArchivedTransactions = () => {
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
								{showBulkAction ? (
									<div className="autho__dd__cont8__options">
										<div
											onClick={() => {
												setBulkArchiveLoading(true);
												setTransUnarchiveBulk(
													props.selectedIds
												)
													.then(() => {
														setdd1active(false);
													})
													.finally(() => {
														props.setSelectedIds(
															[]
														);
														hasRecogFlag &&
															(props.isUploads
																? dispatch({
																		type: transactionConstants.DELETE_ALL_UPLOADS_RECOG_CACHE,
																		payload:
																			{
																				id: props.id,
																			},
																  })
																: dispatch({
																		type: transactionConstants.DELETE_ALL_RECOGNISED_TRANSACTIONS_CACHE,
																  }));
														hasUnrecogFlag &&
															(props.isUploads
																? dispatch({
																		type: transactionConstants.DELETE_ALL_UPLOADS_UNRECOG_CACHE,
																		payload:
																			{
																				id: props.id,
																			},
																  })
																: dispatch({
																		type: transactionConstants.DELETE_ALL_UNRECOGNISED_TRANSACTIONS_CACHE,
																  }));
														setHasRecogFlag(false);
														setHasUnrecogFlag(
															false
														);
														dispatch(
															clearAllV2DataCache(
																v2EntitiesTransactions.recognized
															)
														);
														dispatch(
															clearAllV2DataCache(
																v2EntitiesTransactions.unrecognized
															)
														);
														props.refreshAllPages();
													});
											}}
											role="button"
											className="autho__dd__cont8__option"
										>
											Unarchive
										</div>
									</div>
								) : null}
							</button>
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
					{!hideExportButton && (
						<ExportModal
							title="Export Archived Transactions Data"
							show={showExportModal}
							onHide={() => setShowExportModal(false)}
							propertyList={propertyList}
							hiddenPropertiesArray={[
								"_id",
								"source_id",
								"payment_method_id",
							]}
							exportEntity="Transactions"
							selectedDataFieldId="transaction_id"
							selectedData={props.selectedIds}
							exportCSV={exportArchivedTransactionCSV}
							exportScheduleName="Archived Transactions Export"
							scheduleEntity="archived_transactions"
						/>
					)}
					<div>
						<button
							ref={cancelToken}
							className="appsad"
							onClick={() => props.refreshReduxState()}
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

					{/* <div>
								<button className="appsac">
									<img src={CSV} />
									<span id="te">CSV</span>
								</button>
							</div> */}
				</div>
			</div>
			<Chips
				searchQuery={searchQuery}
				text={"Transactions"}
				metaData={metaData}
				isInfiniteTable={true}
				setSearchQuery={setSearchQuery}
			/>
		</>
	);
}
