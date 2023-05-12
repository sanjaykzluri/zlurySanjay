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
} from "../../../services/api/transactions";
import { Loader } from "../../../common/Loader/Loader";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Col, Form, Row } from "react-bootstrap";
import { capitalizeFirstLetter } from "../../../utils/common";
import { SideModal } from "../../Applications/AllApps/SideModal";
import NoResultsFoundSVG from "../../../assets/search__outer2.svg";
import { transactionConstants } from "../../../constants";
import { getImageForPaymentMethodDropdown } from "../Recognised/Dropdown";

export function ArchivedFilters(props) {
	const [showHideFilter, setshowHideFilter] = useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	let addHideFilterClose = () => setshowHideFilter(false);
	const [searchTerm, setSearchTerm] = useState("");
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
	const { selectedTransactions } = props;
	const [hasRecogFlag, setHasRecogFlag] = useState(false);
	const [hasUnrecogFlag, setHasUnrecogFlag] = useState(false);

	useEffect(() => {
		if (
			selectedTransactions.some(
				(el) =>
					typeof el.transaction_app === "object" &&
					el.transaction_app?.app_id
			)
		) {
			setHasRecogFlag(true);
		} else {
			setHasRecogFlag(false);
		}
		if (
			selectedTransactions.some(
				(el) =>
					typeof el.transaction_app !== "object" ||
					!el.transaction_app?.app_id
			)
		) {
			setHasUnrecogFlag(true);
		} else {
			setHasUnrecogFlag(false);
		}
	}, [selectedTransactions]);

	useEffect(() => {
		if (loading) {
			getArchivedTransactionsPropertiesList().then((res) => {
				if (res != null) {
					if (res.data != null) {
						setPropertyList(res.data);
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
				<div className="Uploads__left"></div>
				<div className="Uploads__right__Arc">
					{props.selectedIds.length > 0 ? (
						<>
							<button
								className="autho__dd__cont5"
								style={{ marginRight: "15px" }}
								ref={refPayment}
								onClick={() => {
									setPaymentLoading(true);
									getPaymentMethods().then((res) => {
										setPaymentMethods([
											...res.data.payment_ccs,
											...res.data.payment_banks,
											...res.data.payment_others,
										]);
										setPaymentLoading(false);
									});
									setdd1active(true);
									commonSegmentTrack(
										"Change Payment Method Button Clicked"
									);
								}}
							>
								Change Payment Method
								<img
									src={arrowdropdown}
									style={{ marginLeft: "8px" }}
								></img>
								{dd1active ? (
									<div className="custom__dropdown__payment__dropdown__new">
										<div className="inputWithIconAppsTxns">
											<input
												type="text"
												placeholder="Search"
												value={changePaymentQuery}
												onChange={(event) =>
													handleChangePayment(
														event.target.value,
														paymentLoading
													)
												}
											/>
											<img
												src={search}
												aria-hidden="true"
											/>
										</div>
										{paymentMethods.length === 0 &&
										paymentLoading ? (
											<div className="d-flex justify-content-center align-items-center">
												<Loader
													height={60}
													width={60}
												/>
											</div>
										) : ((changePaymentQuery !== "" &&
												paymentsearchresult.length ===
													0) ||
												paymentMethods.length === 0) &&
										  !paymentLoading ? (
											<div className="d-flex mt-2 mb-3 ml-auto mr-auto">
												No payment methods
											</div>
										) : (
											paymentmethods.map(
												(method, index) => (
													<button
														key={index}
														className="custom__dropdown__payment__dropdown__option"
														onClick={() => {
															setPMTransBulk(
																props.selectedIds,
																method.payment_method_id
															)
																.then(() => {
																	if (
																		props.searchQuery
																	) {
																		props.handleSearchRequests(
																			props.searchQuery,
																			0
																		);
																	}
																	setdd1active(
																		false
																	);
																})
																.finally(() => {
																	props.setSelectedIds(
																		[]
																	);
																	props.refreshAllPages();
																});
														}}
													>
														<div className="custom__dropdown__payment__dropdown__option__d1">
															<img
																src={getImageForPaymentMethodDropdown(
																	method
																)}
																style={{
																	maxHeight: 15,
																	marginRight:
																		"8px",
																}}
															></img>
															<OverlayTrigger
																placement="top"
																overlay={
																	<Tooltip>
																		{method.cc_card_name ||
																			method.bank_name ||
																			method.payment_method_name}
																	</Tooltip>
																}
															>
																<div className="truncate_10vw">
																	{method.cc_card_name ||
																		method.bank_name ||
																		method.payment_method_name}
																</div>
															</OverlayTrigger>
														</div>
														<div className="custom__dropdown__payment__dropdown__option__d2">
															{method.bank_masked_account_digits ||
															method.cc_masked_digits
																? "•••• •••• " +
																  (method.bank_masked_account_digits ||
																		method.cc_masked_digits)
																: null}
														</div>
													</button>
												)
											)
										)}
									</div>
								) : null}
							</button>
							<button
								className="autho__dd__cont8"
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
														if (props.searchQuery) {
															props.handleSearchRequests(
																props.searchQuery,
																0
															);
														}
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
						<img src={search} aria-hidden="true" />
					</div>
					<button
						hidden={!props.isTransactionPage}
						className="export mt-auto mb-auto mr-3"
						onClick={() => {
							setShowExportModal(true);
						}}
					>
						<img src={CSV} alt="" />
						<span id="te">Export</span>
					</button>
					<div>
						<button
							ref={props?.cancelToken}
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
					{showExportModal && (
						<ExportModal
							title="Export Archived Transactions Data"
							show={showExportModal}
							onHide={() => setShowExportModal(false)}
							propertyList={propertyList}
							hiddenPropertiesArray={[
								"transaction_id",
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

					{/* <div>
								<button className="appsac">
									<img src={CSV} />
									<span id="te">CSV</span>
								</button>
							</div> */}
				</div>
			</div>
		</>
	);
}
