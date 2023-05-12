import React, {
	useEffect,
	useState,
	useRef,
	useCallback,
	useContext,
} from "react";
import useOutsideClick from "../../../common/OutsideClick/OutsideClick";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "../../../common";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./RecognisedTable.scss";
import rightarrow from "./rightarrow.svg";
import leftarrow from "./leftarrow.svg";
import master from "../../../assets/transactions/mastercard.svg";
import visa from "../../../assets/transactions/visa.svg";
import bank from "../../../assets/transactions/bank.svg";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import card from "../../../assets/transactions/card.svg";
import ContentLoader from "react-content-loader";
import Drowdown, { getImageForPaymentMethodDropdown } from "./Dropdown";
import {
	fetchRecognisedTransactions,
	checkAndFetchRecog,
	refreshAllRecognisedTransPages,
} from "../../../actions/transactions-action";
import { ENTITIES } from "../../../constants";
import search from "../../../assets/search.svg";
import CSV from "../../../assets/CSV.svg";
import Add from "../../../assets/add.svg";
import { AddTransactionModal } from "../Modals/AddTransactionModal";
import {
	addTransaction,
	getRecognisedTransactionsPropertiesList,
	exportRecognisedTransactionCSV,
} from "../../../services/api/transactions";
import arrowdropdown from "../Unrecognised/arrowdropdown.svg";
import "./Recognised.css";
import { Loader } from "../../../common/Loader/Loader";
import {
	getPaymentMethods,
	setPMTransBulk,
	setTransactionsArchiveBulk,
	unAssignTransactionsBulk,
} from "../../../services/api/transactions";
import { Tooltip } from "recharts";
import { client } from "../../../utils/client";
import { debounce } from "../../../utils/common";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import {
	checkSpecialCharacters,
	searchAllRecognisedTransactions,
} from "../../../services/api/search";
import { transactionConstants } from "../../../constants/transactions";
import { Empty } from "../Recognised/Empty";
import { NameBadge } from "../../../common/NameBadge";
import "../../../App.css";
import { EmptySearch } from "../../../common/EmptySearch";
import { InfiniteTable } from "../../Departments/InfiniteTable";
import refresh_icon from "../../../assets/icons/refresh.svg";
import { kFormatter } from "../../../constants/currency";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";
import RoleContext from "../../../services/roleContext/roleContext";
import Strips from "../../../common/restrictions/Strips";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../../common/restrictions";
import _ from "underscore";
import { Col, Form, Row } from "react-bootstrap";
import { capitalizeFirstLetter } from "../../../utils/common";
import { SideModal } from "../../Applications/AllApps/SideModal";
import NoResultsFoundSVG from "../../../assets/search__outer2.svg";
import close from "../../../assets/close.svg";
import { AppAuthStatusIconAndTooltip } from "../../../common/AppAuthStatus";
import AppTableComponent from "../../../common/AppTableComponent";
import Amex from "assets/transactions/Amex.svg";
import { UnassignArchiveModal } from "../Modals/UnassignArchiveModal";
import { WorkFlowModalins } from "../Modals/WorkFlowModal";

const loadingData = [
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
];

const loaderColumns = [
	{
		dataField: "name",
		text: "Department",
		formatter: () => (
			<div className="d-flex flex-row align-items-center">
				<ContentLoader
					style={{ marginRight: 8 }}
					width={26}
					height={26}
				>
					<circle cx="13" cy="13" r="13" fill="#EBEBEB" />
				</ContentLoader>
				<ContentLoader width={91} height={10}>
					<rect width="91" height="10" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "head",
		text: "Head",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "usersCount",
		text: "Users",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "appsCount",
		text: "Apps Used",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "",
		text: "Budget",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
];

function dateFormatter(cell, row) {
	if (cell) {
		let date = new Date(cell)
			.toLocaleDateString("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
			})
			.split(" ")
			.join(" ");

		return <>{date}</>;
	}
	return <>-</>;
}
function currencyFormatter(cell, row) {
	let cost = new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: row.transaction_currency,
		maximumSignificantDigits: 3,
	}).format(cell || 0);
	return <>{cost}</>;
}
function sourceFormatter(cell, row) {
	return (
		<>
			<div className="truncate_10vw">
				<>
					{cell.source_type === "manually" ? (
						<span>Added Manually</span>
					) : cell.source_name ? (
						<OverlayTrigger
							placement="top"
							overlay={
								<BootstrapTooltip>
									{cell.source_name}
								</BootstrapTooltip>
							}
						>
							<Link
								className="custom__app__name__css"
								style={{ textDecoration: "none" }}
								to={{
									pathname: `/transactions/uploads/${
										cell.source_id
									}?returnTo=${getReturnTo()}`,
									hash: "#recognised",
									state: { name: row },
								}}
							>
								{cell.source_name}
							</Link>
						</OverlayTrigger>
					) : (
						<span>-</span>
					)}
				</>
			</div>
		</>
	);
}
function getReturnTo() {
	return window.location.pathname.split("/")[1];
}
export function Recognised() {
	const refPaymentMethod = useRef();
	const refBulkAction = useRef();
	const initialsPage = 0;
	const [page, setPage] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const cancelToken = useRef();
	const dispatch = useDispatch();
	const { recognisedTransactions } = useSelector(
		(state) => state.transactions
	);
	const [showHideFilter, setshowHideFilter] = useState(false);
	let addHideFilterClose = () => setshowHideFilter(false);
	const [bulkUnassignIds, setBulkUnassignIds] = useState([]);

	const [bulkArchiveLoading, setBulkArchiveLoading] = useState(false);
	const [CSVModalVisible, setCSVModalVisible] = useState(false);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [dd1active, setdd1active] = useState(false);
	const [dd2active, setdd2active] = useState(false);
	const [selectedIds, setSelectedIds] = useState([]);
	const [selectedTransactions, setSelectedTransactions] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const { isViewer } = useContext(RoleContext);
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [tableRows, setTableRows] = useState(20);
	var pagination = "page_" + page.toString() + "_" + tableRows.toString();
	const [totalPages, setTotalPages] = useState();
	const [totalTransactions, setTotalTransactions] = useState();
	const [searchResultCount, setSearchResultCount] = useState(0);
	const [unassignModalOpen, setUnassignModalOpen] = useState(false);
	const [archiveModalOpen, setArchiveModalOpen] = useState(false);
	function searchInProgress() {
		dispatch({
			type: transactionConstants.SEARCH_RECOGNISED_TRANSACTIONS_REQUESTED,
		});
	}

	useEffect(() => {
		cancelToken.current = client.CancelToken.source();
	}, []);

	useEffect(() => {
		if (addModalOpen) {
			//Segment Implementation
			window.analytics.page(
				"Transactions",
				"Recognised-Transactions; Add-New-Transaction",
				{
					page: page,
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [addModalOpen]);

	const handleSearchRequests = useCallback(
		debounce((searchQuery, page, rows) => {
			if (cancelToken.current?.token) {
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			}
			cancelToken.current = client.CancelToken.source();
			if (searchQuery.length !== 1) {
				if (checkSpecialCharacters(searchQuery, true)) {
					dispatch({
						type: transactionConstants.SEARCH_RECOGNISED_TRANSACTIONS_FETCHED,
						payload: {
							data: [],
						},
					});
				} else {
					searchInProgress();
					searchAllRecognisedTransactions(
						searchQuery,
						page,
						rows,
						cancelToken.current
					)
						.then((res) => {
							if (res.results) {
								searchSuccessful(res.results);
							}
						})
						.catch((err) =>
							console.error(
								"Error fetching recognised list data",
								err
							)
						);
				}
			}
		}, 300),
		[]
	);

	const refreshAllPages = () => {
		var pages = [];
		if (typeof recognisedTransactions?.data === "object") {
			_.map(Object.keys(recognisedTransactions.data), function (key) {
				var key_split_array = key.split("_");
				var page_row_obj = {
					page: key_split_array[1] || 0,
					row: key_split_array[2] || 20,
				};
				pages.push(page_row_obj);
			});
			dispatch({
				type: transactionConstants.DELETE_ALL_RECOGNISED_TRANSACTIONS_CACHE,
			});
			dispatch(refreshAllRecognisedTransPages(pages));
		}
	};
	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Transactions",
			currentPageName: "Recognised-Transactions",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const refreshReduxState = () => {
		setSelectedIds([]);
		if (searchQuery.length > 0) {
			searchInProgress();
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			dispatch({
				type: transactionConstants.DELETE_RECOGNISED_TRANSACTIONS_CACHE,
				payload: {
					page: pagination,
				},
			});
			dispatch(
				fetchRecognisedTransactions(
					page,
					Number.parseInt(tableRows),
					cancelToken
				)
			);
		}
		commonSegmentTrack("Refresh Button Clicked");
	};
	function clickedOnApp(id, name) {
		//Segment Implementation
		window.analytics.track("Clicked on Single Application", {
			currentCategory: "Transactions",
			currentPageName: "Recognised-Transactions",
			clickedAppId: id,
			clickedAppName: name,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}

	const columns = [
		{
			dataField: "transaction_app",
			text: "Applications",
			// eslint-disable-next-line react/display-name
			formatter: (dataField) => (
				<AppTableComponent
					app_name={dataField?.app_name}
					app_logo={dataField?.app_logo_url}
					app_auth_status={dataField?.app_state}
					app_id={dataField?.app_id}
					logo_height="auto"
					logo_width={28}
				/>
			),
		},
		{
			dataField: "transaction_description",
			text: "Transaction Description",
			formatter: (dataField) => (
				<div className="d-flex">
					<OverlayTrigger
						placement="top"
						overlay={
							<BootstrapTooltip>{dataField}</BootstrapTooltip>
						}
					>
						<div className="truncate_10vw">{dataField}</div>
					</OverlayTrigger>
				</div>
			),
		},
		{
			dataField: "transaction_date",
			text: "Transaction Date",
			formatter: dateFormatter,
		},
		{
			dataField: "transaction_amount",
			text: "Amount",
			formatter: (dataField) => {
				return kFormatter(dataField);
			},
		},
		{
			dataField: "transaction_source",
			text: "Source",
			formatter: sourceFormatter,
		},
		{
			dataField: "transaction_payment_method",
			text: "Payment Method",
			formatter: PaymentFormatter,
			formatExtraData: {
				page: page,
				refreshReduxState: refreshReduxState,
				isViewer: isViewer,
				isBasicSubscription,
				entity: ENTITIES.ASSIGN_PAYMENT,
			},
		},
	];

	useEffect(() => {
		if (searchQuery && searchQuery.length > 0) {
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			if (!recognisedTransactions.data[pagination]?.length > 0) {
				dispatch(
					checkAndFetchRecog(
						page,
						Number.parseInt(tableRows),
						cancelToken
					)
				);
			}
			//Segment Implementation
			window.analytics.page("Transactions", "Recognised-Transactions", {
				page: page,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [page]);

	function onTableChange(type, { page, sortField, sortOrder }) {
		setPage(page);
		setSelectedIds([]);
	}
	const pageButtonRenderer = ({
		page,
		active,
		disable,
		title,
		onPageChange,
	}) => {
		const handleClick = (e) => {
			e.preventDefault();
			onPageChange(page);
		};
		if (page === ">") {
			return (
				<li
					key={page}
					role="button"
					onClick={handleClick}
					className="page-item-prev-next"
				>
					Next
					<img src={rightarrow} style={{ marginLeft: 8 }} />
				</li>
			);
		}
		if (page === "<") {
			return (
				<li
					key={page}
					role="button"
					onClick={handleClick}
					className="page-item-prev-next"
				>
					<img src={leftarrow} style={{ marginRight: 8 }} />
					Prev
				</li>
			);
		}

		return (
			<li
				role="button"
				onClick={handleClick}
				className={active ? "page-item-active" : "page-item"}
				key={page}
			>
				{page + 1}
			</li>
		);
	};

	const options = {
		pageButtonRenderer,
		page: page,
		withFirstAndLast: false,
		hideSizePerPage: true,
		totalSize: searchQuery
			? recognisedTransactions?.searchData?.count
			: recognisedTransactions?.count,
		pageStartIndex: 0,
		sizePerPage: Number.parseInt(tableRows),
	};
	const rowStyle = {
		height: "48px",
	};
	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
		onSelect: (row, isSelect, rowIndex, e) => {
			if (isSelect) {
				if (!selectedIds.includes(row.transaction_id)) {
					setSelectedIds(selectedIds.concat([row.transaction_id]));
					setSelectedTransactions([...selectedTransactions, row]);
				}
			} else {
				if (selectedIds.includes(row.transaction_id)) {
					setSelectedIds(
						selectedIds.filter((el) => el !== row.transaction_id)
					);
					setSelectedTransactions(
						selectedTransactions.filter(
							(el) => el.transaction_id !== row.transaction_id
						)
					);
				}
			}
		},
		onSelectAll: (isSelect, rows, e) => {
			if (isSelect) {
				setSelectedIds(rows.map((row) => row.transaction_id));
				setSelectedTransactions([...rows]);
			} else {
				setSelectedIds([]);
				setSelectedTransactions([]);
			}
		},
	};
	const handleAdd = (transaction) => {
		addTransaction(transaction).then(() => {
			refreshAllPages();
			dispatch(
				checkAndFetchRecog(0, Number.parseInt(tableRows), cancelToken)
			);
			setAddModalOpen(false);
			//Segment Implementation
			window.analytics.track("Added a new Transaction", {
				newTransaction: transaction,
				currentCategory: "Transactions",
				currentPageName: "Recognised-Transactions",
				orgId: orgId || "",
				orgName: orgName || "",
			});
		});
	};
	const [dd1insideactive, setdd1insideactive] = useState(false);
	const [paymentName, setPaymentName] = useState("");
	const [paymentMethods, setPaymentMethods] = useState([]);
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [paymentsearchresult, setpaymentsearchresult] = useState([]);
	let handleChangePayment = (value, paymentLoading) => {
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
	useOutsideClick(refPaymentMethod, () => {
		if (dd1active) setdd1active(false);
	});

	useOutsideClick(refBulkAction, () => {
		if (dd2active) setdd2active(false);
	});

	const handleSearchQuery = (event) => {
		setSearchTerm(event.target.value?.trimStart());
		let searchQuery = event.target.value.trim();
		setSearchQuery(searchQuery);
	};

	function searchSuccessful(searchData) {
		setSearchResultCount(searchData.total_count);
		dispatch({
			type: transactionConstants.SEARCH_RECOGNISED_TRANSACTIONS_FETCHED,
			payload: {
				data: searchData.results,
				count: searchData.total_count,
			},
		});
	}

	useDidUpdateEffect(() => {
		cancelToken.current = client.CancelToken.source();
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery && searchQuery.length > 0) {
			if (checkSpecialCharacters(searchQuery, true)) {
				dispatch({
					type: transactionConstants.SEARCH_RECOGNISED_TRANSACTIONS_FETCHED,
					payload: {
						data: [],
					},
				});
				setSelectedIds([]);
			} else {
				searchInProgress();
				setPage(initialsPage);
				setSelectedIds([]);
				handleSearchRequests(
					searchQuery,
					page,
					Number.parseInt(tableRows)
				);
			}
		} else {
			if (page == initialsPage) {
				dispatch(
					checkAndFetchRecog(
						page,
						Number.parseInt(tableRows),
						cancelToken
					)
				);
			} else {
				setPage(initialsPage);
				setSelectedIds([]);
			}
		}
	}, [searchQuery]);

	const emptyState =
		!recognisedTransactions.loading &&
		recognisedTransactions.data.length == 0;

	var paymentmethods = !dd1insideactive
		? paymentMethods
		: paymentsearchresult;

	useEffect(() => {
		if (selectedIds.length > 0) {
			setdd1active(false);
			setdd2active(false);
		}
	}, [selectedIds, recognisedTransactions]);

	const clickedOnChangeBulkActionsDropdown = () => {
		setdd2active(!dd2active);
		commonSegmentTrack("Bulk Actions Button Clicked");
	};
	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Recognised Transactions");
	};
	const [showExportModal, setShowExportModal] = useState(false);
	const [showInProgressModal, setShowInProgressModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [propertyList, setPropertyList] = useState([]);
	const [searchPropertyList, setSearchPropertyList] = useState("");

	useEffect(() => {
		if (loading) {
			getRecognisedTransactionsPropertiesList().then((res) => {
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
		columns_required: ["app_name"],
	};

	const [exportRequestObj, setExportRequestObj] = useState({
		...defaultExportObj,
	});

	useEffect(() => {
		var x = recognisedTransactions?.count / Number.parseInt(tableRows);
		setTotalPages(Number.parseInt(Math.ceil(x)));
		if (totalPages > 1 && page >= Number.parseInt(Math.ceil(x))) {
			setPage(Number.parseInt(Math.ceil(x)) - 1);
		}
	}, [tableRows]);

	useDidUpdateEffect(() => {
		if (searchQuery && searchQuery.length > 0) {
			searchInProgress();
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			if (!recognisedTransactions.data[pagination]?.length > 0) {
				dispatch(
					checkAndFetchRecog(
						page,
						Number.parseInt(tableRows),
						cancelToken
					)
				);
			}
			setSearchResultCount(0);
		}
	}, [tableRows, searchQuery]);

	useEffect(() => {
		if (recognisedTransactions?.count) {
			var x = Math.ceil(
				recognisedTransactions?.count / Number.parseInt(tableRows)
			);
			setTotalPages(x);
			if (totalPages > 1 && page >= Number.parseInt(x)) {
				setPage(Number.parseInt(x - 1));
			}
		}
	}, [recognisedTransactions]);

	useEffect(() => {
		if (recognisedTransactions?.count && !totalTransactions) {
			setTotalTransactions(recognisedTransactions?.count);
		}
	}, [recognisedTransactions]);

	const exportSelectedRecognisedTransactions = () => {
		let tempExportRequestObj = { ...exportRequestObj, filter_by: [] };
		tempExportRequestObj.filter_by.push({
			field_values: selectedIds,
			field_id: "transaction_id",
			filter_type: "objectId",
			negative: false,
			is_custom: false,
		});
		setExportRequestObj(tempExportRequestObj);
	};
	const clearAllPagesCache = () => {
		if (searchQuery && searchQuery.length > 1) {
			setPage(0);
			setTableRows(20);
		}
		dispatch({
			type: transactionConstants.DELETE_ALL_UNRECOGNISED_TRANSACTIONS_CACHE,
		});
		refreshAllPages();
	};
	return (
		<>
			<div className="top__Uploads">
				<div className="Uploads__left"></div>
				<div className="Uploads__right">
					{selectedIds.length > 0 && (
						<>
							<button
								className="autho__dd__cont5"
								style={{ marginRight: "15px" }}
								ref={refPaymentMethod}
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
												value={paymentName}
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
										) : ((paymentName !== "" &&
												paymentsearchresult.length ===
													0) ||
												paymentMethods.length === 0) &&
										  !paymentLoading ? (
											<div className="d-flex mt-2 mb-3 ml-auto mr-auto">
												No payment methods
											</div>
										) : (
											<>
												{paymentmethods.map(
													(method) => (
														<button
															className="custom__dropdown__payment__dropdown__option"
															onClick={() => {
																setPMTransBulk(
																	selectedIds,
																	method.payment_method_id
																)
																	.then(
																		() => {
																			if (
																				searchQuery
																			) {
																				handleSearchRequests(
																					searchQuery,
																					page,
																					Number.parseInt(
																						tableRows
																					)
																				);
																			}
																			setdd1active(
																				false
																			);
																		}
																	)
																	.finally(
																		() => {
																			setSelectedIds(
																				[]
																			);
																			refreshAllPages();
																		}
																	);
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
												)}
											</>
										)}
									</div>
								) : null}
							</button>
							<button
								className="autho__dd__cont8"
								onClick={clickedOnChangeBulkActionsDropdown}
							>
								Bulk Actions
								<img
									src={arrowdropdown}
									style={{ marginLeft: "8px" }}
								></img>
								{dd2active ? (
									<div
										ref={refBulkAction}
										className="autho__dd__cont8__options menu"
									>
										<div
											onClick={() => {
												setUnassignModalOpen(true);
											}}
											role="button"
											className="autho__dd__cont8__option"
										>
											Unassign Apps
										</div>
										<hr style={{ margin: "0px 18px" }}></hr>
										<div
											onClick={() => {
												setArchiveModalOpen(true);
											}}
											role="button"
											className="autho__dd__cont8__option"
										>
											Archive
										</div>
									</div>
								) : null}
							</button>
						</>
					)}
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
						className="export mt-auto mb-auto mr-3"
						onClick={() => {
							setShowExportModal(true);
						}}
					>
						<img src={CSV} alt="" />
						<span id="te">Export</span>
					</button>
					{/* <div className="mr-3">
								<button className="appsac">
									<img src={CSV} />
									<span id="te">CSV</span>
								</button>
							</div> */}
					{!isViewer && (
						<button
							className="appsad mr-3"
							onClick={() => {
								setAddModalOpen(true);
								commonSegmentTrack(
									"Add Transaction Button Clicked"
								);
							}}
						>
							<img src={Add} />
							<span id="te">Add</span>
						</button>
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
				</div>
			</div>
			<Strips entity={ENTITIES.TRANSACTIONS} />
			<AddTransactionModal
				handleClose={() => setAddModalOpen(false)}
				isOpen={addModalOpen}
				handleSubmit={handleAdd}
			/>
			{(unassignModalOpen || archiveModalOpen) && (
				<UnassignArchiveModal
					data={selectedTransactions}
					id={selectedIds}
					setSelectedIds={(v) => setSelectedIds(v)}
					setSelectedTransactions={setSelectedTransactions}
					isOpen={unassignModalOpen || archiveModalOpen}
					handleClose={() => {
						if (archiveModalOpen) {
							setArchiveModalOpen(false);
						} else {
							setUnassignModalOpen(false);
						}
					}}
					setSelectedIds={setSelectedIds}
					fetchTransactions={fetchRecognisedTransactions}
					page={page}
					rows={tableRows}
					cancelToken={cancelToken}
					handleSearchRequests={handleSearchRequests}
					searchQuery={searchQuery}
					clearCache={clearAllPagesCache}
					title={
						archiveModalOpen
							? "Archive Transactions"
							: "Unassign Transaction"
					}
					requestFunction={
						archiveModalOpen
							? setTransactionsArchiveBulk
							: unAssignTransactionsBulk
					}
					buttonText={archiveModalOpen ? "Archive" : "Unassign App"}
				/>
			)}
			<div className="transaction__table__details">
				<div className="table__info__text__left">
					<div>Showing</div>
					<div className="bold-600 mr-1 ml-1">
						{searchQuery.length > 0
							? searchResultCount || 0
							: recognisedTransactions?.count || 0}
					</div>
					<div>transactions</div>
					<div
						className="ml-1 mr-1"
						hidden={!(searchQuery.length > 0)}
					>
						searched by :
					</div>
					<div
						hidden={!(searchQuery.length > 0)}
						className="filter-capsule"
					>
						<div className="mr-1 ml-1 filter-capsule-text">
							{searchQuery}
						</div>
					</div>
					<div
						hidden={!(searchQuery.length > 0)}
						className="ml-1 mr-1 filter-capsule"
					>
						<img
							src={close}
							height={8}
							width={8}
							className="mr-1 ml-1 cursor-pointer"
							onClick={() => {
								setSearchQuery("");
								setSearchTerm("");
							}}
						/>
					</div>
				</div>
				<div className="transaction__table__selectors">
					<div className="table__info__text__right1">
						Items per page:
					</div>
					<div className="table__info__text__right1">
						<select
							className="table__row__select"
							onChange={(e) => {
								setTableRows(e.target.value);
								setSelectedIds([]);
							}}
							name="table__rows"
							defaultValue={Number.parseInt(tableRows)}
						>
							<option value={10}>10</option>
							<option value={20}>20</option>
							<option value={50}>50</option>
							<option value={100}>100</option>
						</select>
					</div>
					<div className="transaction__table__page__selector">
						<div
							hidden={page === 0}
							onClick={() => {
								if (page !== 0) {
									setPage(page - 1);
									setSelectedIds([]);
								}
							}}
							className="table__info__text__right2 cursor-pointer"
						>
							<img src={leftarrow} />
						</div>
						<div className="table__info__text__right2">
							Page {page + 1} of{" "}
							{searchQuery.length > 0
								? searchResultCount > 0
									? Math.ceil(
											searchResultCount /
												Number.parseInt(tableRows)
									  )
									: 1
								: totalPages > 0
								? totalPages
								: 1}
						</div>
						<div
							hidden={
								(searchQuery.length > 0 &&
									Math.ceil(
										searchResultCount /
											Number.parseInt(tableRows)
									) <= 1) ||
								totalPages === 0 ||
								page === totalPages - 1
							}
							onClick={() => {
								if (page < totalPages - 1) {
									setPage(page + 1);
									setSelectedIds([]);
								}
							}}
							className="table__info__text__right2 cursor-pointer"
						>
							<img src={rightarrow} />
						</div>
					</div>
				</div>
			</div>
			<div
				style={
					emptyState
						? { height: "48vh", padding: "0 40px" }
						: { margin: "0px 40px" }
				}
				key={pagination}
			>
				{(searchQuery
					? recognisedTransactions?.searchData?.loading
					: recognisedTransactions.loading) && (
					<Table
						columns={loaderColumns}
						data={loadingData || []}
						hover
						remote={false}
						keyField="_id"
						selectRow={selectRow}
						rowStyle={rowStyle}
					/>
				)}
				{(searchQuery
					? recognisedTransactions?.searchData?.loaded
					: !recognisedTransactions?.loading) && (
					<>
						{(searchQuery
							? recognisedTransactions?.searchData?.data
							: recognisedTransactions.data[pagination]
						)?.length > 0 ? (
							<Table
								columns={columns}
								data={
									searchQuery
										? recognisedTransactions?.searchData
												?.data
										: recognisedTransactions?.data[
												pagination
										  ]
								}
								options={options}
								onTableChange={
									onTableChange ? onTableChange : () => {}
								}
								hover
								remote={true}
								keyField="transaction_id"
								selectRow={selectRow}
								rowStyle={rowStyle}
							/>
						) : (
							<InfiniteTable
								keyField="transaction_id"
								loadingColumns={loaderColumns}
								loadingData={loadingData}
								columns={columns}
								showEmptyScreen={true}
								emptyState={
									searchQuery ? (
										<EmptySearch
											searchQuery={searchQuery}
										/>
									) : (
										<Empty refresh={refreshReduxState} />
									)
								}
							/>
						)}
					</>
				)}
			</div>
		</>
	);
}

export function PaymentFormatter(cell, row, rowIndex, formatExtraData) {
	return (
		<div
			onClickCapture={(e) => {
				if (formatExtraData.isBasicSubscription) {
					e.preventDefault();
					e.stopPropagation();
					showrestrictedPopup(formatExtraData.entity);
				}
			}}
		>
			{cell.payment_method_id === null && !formatExtraData.isViewer ? (
				<>
					<Drowdown
						fetch={formatExtraData.refreshReduxState}
						cell={cell}
						id={row.transaction_upload_id || row.transaction_id}
						page={formatExtraData.page}
						segmentCategory="Recognised"
					></Drowdown>
				</>
			) : cell.payment_method_id === null && formatExtraData.isViewer ? (
				<div className="flex flex-row center">
					<div style={{ marginLeft: "8px" }} className="grey-1">
						<span>No Payment Method</span>
					</div>
				</div>
			) : (
				<div className="flex flex-row center">
					<img
						src={getImageForPaymentMethodTable(cell)}
						style={{
							maxHeight: "15px",
							marginRight: "8px",
							minWidth: "20.63px",
						}}
					></img>
					<div style={{ marginLeft: "8px" }}>
						{cell?.payment_method_name}
					</div>
				</div>
			)}
		</div>
	);
}

export function getImageForPaymentMethodTable(paymentMethod) {
	var image;
	var type =
		paymentMethod.payment_method_details_type ||
		paymentMethod.payment_method_type;
	image =
		type === "credit_card"
			? card
			: type === "visa"
			? visa
			: type === "mastercard"
			? master
			: type === "american_express"
			? Amex
			: type === "bank"
			? bank
			: type === "other" &&
			  paymentMethod.payment_method_logo_url &&
			  paymentMethod.payment_method_logo_url !== ""
			? paymentMethod.payment_method_logo_url
			: otherpayment;
	return image;
}
