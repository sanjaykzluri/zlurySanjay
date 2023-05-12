import React, {
	Component,
	useState,
	useEffect,
	useRef,
	useContext,
} from "react";
import rightarrow from "../../../Transactions/Recognised/rightarrow.svg";
import leftarrow from "../../../Transactions/Recognised/leftarrow.svg";
import search from "../../../../assets/search.svg";
import { Table } from "../../../../common";
import { useLocation } from "react-router-dom";
import CSV from "../../../../assets/CSV.svg";
import {
	fetchSingleAppTrans,
	checkStoreAndFetchSingleAppTrans,
	refreshAllSingleAppTransPages,
} from "../../../../actions/applications-action";
import Add from "../../../../assets/add.svg";
import ContentLoader from "react-content-loader";
import Drowdown, {
	getImageForPaymentMethodDropdown,
} from "../../../Transactions/Recognised/Dropdown";
import { Link } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import {
	getApplicationInfo,
	getApplicationSpendVSEstCostGraph,
	getSingleApplicationTransactions,
} from "../../../../services/api/applications";
import {
	applicationConstants,
	defaults,
	transactionConstants,
} from "../../../../constants";
import { Empty } from "./Empty";
import { useDidUpdateEffect } from "../../../../utils/componentUpdateHook";
import { client } from "../../../../utils/client";
import {
	checkSpecialCharacters,
	searchApplicationTransactions,
} from "../../../../services/api/search";
import { debounce } from "../../../../utils/common";
import { EmptySearch } from "../../../../common/EmptySearch";
import { AddTransactionModal } from "../../../Transactions/Modals/AddTransactionModal";
import {
	addTransaction,
	getPaymentMethods,
	setPMTransBulk,
	setTransArchiveBulk,
	unAssignTransBulk,
} from "../../../../services/api/transactions";
import { Loader } from "../../../../common/Loader/Loader";
import { useOutsideClickListener } from "../../../../utils/clickListenerHook";
import { ConsoleHelper } from "../../../../utils/consoleHelper";
import refresh_icon from "../../../../assets/icons/refresh.svg";
import AngleDown from "../../../../assets/icons/angle-down.svg";
import MasterCardSVG from "../../../../assets/transactions/mastercard.svg";
import VisaSVG from "../../../../assets/transactions/visa.svg";
import BankSVG from "../../../../assets/transactions/bank.svg";
import OtherPaymentSVG from "../../../../assets/transactions/otherpayment.svg";
import CardSVG from "../../../../assets/transactions/card.svg";
import { InfiniteTable } from "../../../Departments/InfiniteTable";
import { kFormatter } from "../../../../constants/currency";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import RoleContext from "../../../../services/roleContext/roleContext";
import _ from "underscore";
import close from "../../../../assets/close.svg";
import { AppAuthStatusIconAndTooltip } from "../../../../common/AppAuthStatus";
import AppTableComponent from "../../../../common/AppTableComponent";
import UnauthorizedToView from "../../../../common/restrictions/UnauthorizedToView";
import { userRoles } from "../../../../constants/userRole";
import { PaymentFormatter } from "../../../Transactions/Recognised/Recognised";
import SpendVSCostGraph from "../../../../modules/spendvscost/components/SpendVSCostGraph";
import { dateFormatter } from "components/Transactions/Recognised/RecognisedTransactionsTable";
import { getValueFromLocalStorage } from "utils/localStorage";
import SpendTrigger from "modules/transactions/spend-trigger/SpendTrigger";
import { TriggerIssue } from "utils/sentry";

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

export function TransFilter(props) {
	const { userRole } = useContext(RoleContext);
	const [selectedIds, setSelectedIds] = useState([]);
	const location = useLocation();
	const [page, setPage] = useState(0);
	const [tableRows, setTableRows] = useState(5);
	const dispatch = useDispatch();
	const { singleapptransinfo } = useSelector((state) => state.applications);
	const pathname = window.location.pathname;
	const id = pathname.split("/")[2];
	const [showAddTransactionModal, setShowAddTransactionModal] =
		useState(false);
	const [submittingTransaction, setSubmittingTransaction] = useState(false);
	const [appLoading, setAppLoading] = useState(false);
	const [application, setApplication] = useState({});
	const [searchTerm, setSearchTerm] = useState("");
	const [showPaymentMethodSuggestions, setShowPaymentMethodSuggestions] =
		useState(false);
	const [paymentMethods, setPaymentMethods] = useState([]);
	const [paymentMethodSuggestions, setPaymentMethodSuggestions] = useState(
		[]
	);
	const [showBulkActionsMenu, setShowBulkActionsMenu] = useState(false);
	const rowStyle = { height: "48px" };
	const [paymentMethodQuery, setPaymentMethodQuery] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const handleSearchQueryChange = debounce(setSearchQuery, 200);
	const cancelToken = useRef();
	const paymentSuggestionsRef = useRef();
	const bulkActionMenuRef = useRef();
	const [paymentLoading, setPaymentLoading] = useState(false);
	const { isViewer } = useContext(RoleContext);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	var pagination = "page_" + page.toString() + "_" + tableRows.toString();
	const [searchResultCount, setSearchResultCount] = useState(0);
	const [totalPages, setTotalPages] = useState();
	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
		onSelect: (row, isSelect, rowIndex, e) => {
			if (isSelect) {
				if (!selectedIds.includes(row.transaction_id)) {
					setSelectedIds(selectedIds.concat([row.transaction_id]));
				}
			} else {
				if (selectedIds.includes(row.transaction_id)) {
					setSelectedIds(
						selectedIds.filter((el) => el !== row.transaction_id)
					);
				}
			}
		},
		onSelectAll: (isSelect, rows, e) => {
			if (isSelect) {
				setSelectedIds(rows.map((row) => row.transaction_id));
			} else {
				setSelectedIds([]);
			}
		},
	};

	function getImageForPaymentMethodTable(paymentMethod) {
		var image;
		var type =
			paymentMethod.payment_method_details_type ||
			paymentMethod.payment_method_type;
		image =
			type === "credit_card"
				? CardSVG
				: type === "visa"
				? VisaSVG
				: type === "mastercard"
				? MasterCardSVG
				: type === "bank"
				? BankSVG
				: type === "other" &&
				  paymentMethod.payment_method_logo_url !== ""
				? paymentMethod.payment_method_logo_url
				: OtherPaymentSVG;
		return image;
	}

	function handleSearchQuery() {
		dispatch(searchInProgress(id));
		if (cancelToken.current?.token) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		cancelToken.current = client.CancelToken.source();
		if (checkSpecialCharacters(searchQuery, true)) {
			dispatch({
				type: applicationConstants.SEARCH_SINGLE_APPLICATION_TRANSACTIONS_FETCHED,
				payload: {
					data: [],
					id: id,
				},
			});
			return;
		}
		searchApplicationTransactions(
			searchQuery,
			page,
			tableRows,
			id,
			cancelToken.current
		)
			.then((res) => {
				if (res.results) {
					ConsoleHelper(res.results.transactions);
					dispatch(searchSuccessful(res.results, id));
				}
			})
			.catch((err) => console.error("Error fetching list data", err));
	}

	const refreshAllPages = () => {
		var pages = [];
		if (typeof singleapptransinfo?.[id]?.data === "object") {
			_.map(Object.keys(singleapptransinfo?.[id]?.data), function (key) {
				var key_split_array = key.split("_");
				var page_row_obj = {
					page: key_split_array[1] || 0,
					row: key_split_array[2] || 20,
				};
				pages.push(page_row_obj);
			});
			dispatch({
				type: applicationConstants.DELETE_ALL_SINGLE_APPLICATION_TRANS_CACHE,
				payload: {
					id: id,
				},
			});
			dispatch(refreshAllSingleAppTransPages(pages, id));
		}
	};

	const refreshReduxState = () => {
		dispatch({
			type: applicationConstants.DELETE_SINGLE_APPLICATION_TRANSACTION_CACHE,
			payload: {
				id: id,
				page: pagination,
			},
		});
		setSelectedIds([]);
		if (searchQuery.length > 0) {
			handleSearchQuery();
		} else {
			dispatch(
				fetchSingleAppTrans(
					id,
					page,
					Number.parseInt(tableRows),
					cancelToken
				)
			);
		}
		//Segment Implementation
		window.analytics.track("Refresh Button Clicked", {
			currentCategory: "Applications",
			currentPageName: "Application-Transactions",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	function searchSuccessful(searchData, id) {
		setSearchResultCount(searchData.total_count);
		return (dispatch) =>
			dispatch({
				type: applicationConstants.SEARCH_SINGLE_APPLICATION_TRANSACTIONS_FETCHED,
				payload: {
					data: searchData.transactions,
					id: id,
				},
			});
	}
	function clickedOnApp(id, name) {
		//Segment Implementation
		window.analytics.track("Clicked on Single Application", {
			currentCategory: "Applications",
			currentPageName: "Application-Transactions",
			clickedApplicationId: id,
			clickedApplicationName: name,
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
						overlay={<Tooltip>{dataField}</Tooltip>}
					>
						<div className="d-block truncate_name">{dataField}</div>
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
			formatter: (row) => {
				return (
					<div className="flex flex-row center">
						<div className="ml-3 flex flex-row justify-content-center align-items-center">
							{isNaN(row) ? 0 : kFormatter(row)}
						</div>
					</div>
				);
			},
		},
		{
			dataField: "transaction_source",
			text: "Source",
			formatter: (row, data) => {
				return (
					<>
						{row.source_type === "manually" ? (
							<span>Added Manually</span>
						) : row.source_name ? (
							<OverlayTrigger
								placement="top"
								overlay={<Tooltip>{row.source_name}</Tooltip>}
							>
								<div className="truncate_10vw">
									{row.source_name}
								</div>
							</OverlayTrigger>
						) : (
							<span>-</span>
						)}
					</>
				);
			},
		},
		{
			dataField: "transaction_payment_method",
			text: "Payment Method",
			formatter: PaymentFormatter,
			formatExtraData: {
				page: page,
				refreshReduxState: refreshReduxState,
				isViewer: isViewer,
			},
		},
	];

	const fetchAndSetApplication = () => {
		setAppLoading(true);
		getApplicationInfo(id)
			.then((res) => {
				setAppLoading(false);
				setApplication(res);
			})
			.catch((err) => {
				setAppLoading(false);
				TriggerIssue("Error fetching app info", err);
			});
	};

	useEffect(() => {
		fetchAndSetApplication();
	}, []);

	useEffect(() => {
		if (searchQuery && searchQuery.length > 0) {
			handleSearchQuery();
		} else {
			dispatch(
				checkStoreAndFetchSingleAppTrans(
					id,
					page,
					Number.parseInt(tableRows),
					cancelToken
				)
			);
		}

		if (props.application?.app_name) {
			window.analytics.page("Applications", "Application-Transactions", {
				app_name: props.application.app_name,
				app_id: props.application.app_id,
				page: page,
				orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
				orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
			});
		}
	}, [page]);

	const fetchData = () => {
		setPage(page + 1);
	};

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
					Next <img src={rightarrow} style={{ marginLeft: 8 }} />
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
			? searchResultCount
			: singleapptransinfo[id]?.count,
		pageStartIndex: 0,
		sizePerPage: Number.parseInt(tableRows),
	};

	useEffect(() => {
		setPaymentLoading(true);
		getPaymentMethods().then((res) => {
			setPaymentMethods([
				...res.data.payment_ccs,
				...res.data.payment_banks,
				...res.data.payment_others,
			]);
			setPaymentLoading(false);
		});
	}, []);

	useDidUpdateEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery && searchQuery.length > 0) {
			if (checkSpecialCharacters(searchQuery, true)) {
				dispatch({
					type: applicationConstants.SEARCH_SINGLE_APPLICATION_TRANSACTIONS_FETCHED,
					payload: {
						data: [],
						id: id,
					},
				});
			} else {
				searchInProgress(id);
				setSelectedIds([]);
				setPage(0);
				handleSearchQuery();
			}
		} else {
			if (page == 0) {
				dispatch(
					checkStoreAndFetchSingleAppTrans(
						id,
						page,
						Number.parseInt(tableRows),
						id,
						cancelToken
					)
				);
			} else {
				setSelectedIds([]);
				setPage(0);
			}
		}
	}, [searchQuery]);

	useEffect(() => {
		setPaymentMethodSuggestions(paymentMethods);
	}, [paymentMethods]);

	useOutsideClickListener(paymentSuggestionsRef, () => {
		setShowPaymentMethodSuggestions(false);
	});

	useOutsideClickListener(bulkActionMenuRef, () => {
		setShowBulkActionsMenu(false);
	});

	const handleTransactionAdd = (transaction) => {
		setSubmittingTransaction(true);
		const transactionObj = {
			...transaction,
			org_application_id: application?.app_id,
		};
		addTransaction(transactionObj)
			.then((res) => {
				if (res.error) {
					console.error("Error while adding a new transaction");
					setSubmittingTransaction(false);
					return;
				}
				setSubmittingTransaction(false);
				setShowAddTransactionModal(false);
				refreshAllPages();
				dispatch(
					checkStoreAndFetchSingleAppTrans(
						id,
						0,
						Number.parseInt(tableRows),
						cancelToken
					)
				);
				//Segment Implementation
				window.analytics.track("Added a new Transaction", {
					newTransaction: transactionObj,
					currentCategory: "Applications",
					currentPageName: "Application-Transactions",
					orgId: orgId || "",
					orgName: orgName || "",
				});
			})
			.catch((err) => {
				console.error("Error while adding a new transaction:", err);
				setSubmittingTransaction(false);

				if (err && err.response && err.response.data) {
				}
			});
	};

	let searchPaymentMethod = (value) => {
		setPaymentMethodQuery(value?.trimStart());
		const query = value.toLowerCase();
		if (query.length > 0) {
			let matchingPaymentArray = [];
			paymentMethods.forEach((el) => {
				if (
					el?.cc_card_name?.toLowerCase().includes(query) ||
					el?.bank_name?.toLowerCase().includes(query) ||
					el?.payment_method_name?.toLowerCase().includes(query)
				) {
					matchingPaymentArray.push(el);
				}
			});
			setPaymentMethodSuggestions(matchingPaymentArray);
		} else {
			setPaymentMethodSuggestions(paymentMethods);
		}
	};

	const handlePaymentMethodSelect = (method) => {
		setPMTransBulk(selectedIds, method.payment_method_id)
			.then(() => {
				setShowPaymentMethodSuggestions(false);
				refreshReduxState();
			})
			.finally(() => {
				setSelectedIds([]);
			});
	};

	const handleUnassignAppsClick = () => {
		unAssignTransBulk(selectedIds)
			.then(() => {
				setShowBulkActionsMenu(false);
				if (searchQuery) {
					handleSearchQuery();
				}
			})
			.finally(() => {
				setSelectedIds([]);
				dispatch({
					type: transactionConstants.DELETE_ALL_UNRECOGNISED_TRANSACTIONS_CACHE,
				});
				refreshAllPages();
			});
	};

	const handleArchiveClick = () => {
		setTransArchiveBulk(selectedIds)
			.then(() => {
				setShowBulkActionsMenu(false);
				if (searchQuery) {
					handleSearchQuery();
				}
			})
			.finally(() => {
				setSelectedIds([]);
				dispatch({
					type: transactionConstants.DELETE_ALL_ARCHIVED_TRANSACTIONS_CACHE,
				});
				refreshAllPages();
			});
	};

	const getPaymentMethodLogo = (method) => {
		var image;
		image = method.bank_name
			? BankSVG
			: method.cc_card_name
			? CardSVG
			: method.payment_method_name && method.payment_logo_url !== ""
			? method.payment_logo_url
			: OtherPaymentSVG;
		return image;
	};

	const handleKeyDown = (e) => {
		if (e.key === " " && e.target.value === "") {
			e.preventDefault();
		}
	};

	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Applications",
			currentPageName: "Application-Transactions",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const clickedOnChangePaymentDropdown = () => {
		setShowPaymentMethodSuggestions(true);
		commonSegmentTrack("Change Payment Method Button Clicked");
	};
	const clickedOnChangeBulkActionsDropdown = () => {
		setShowBulkActionsMenu(!showBulkActionsMenu);
		commonSegmentTrack("Bulk Actions Button Clicked");
	};
	const clickedOnAddTransaction = () => {
		setShowAddTransactionModal(true);
		//Segment Implementation
		window.analytics.page(
			"Applications",
			"Application-Transactions; Add-New-Transaction",
			{
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
		commonSegmentTrack("clicked on Add Transaction");
	};
	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Transactions");
	};

	useEffect(() => {
		var x = singleapptransinfo[id]?.count / Number.parseInt(tableRows);
		setTotalPages(Number.parseInt(Math.ceil(x)));
		if (totalPages > 1 && page >= Number.parseInt(Math.ceil(x))) {
			setPage(Number.parseInt(Math.ceil(x)) - 1);
		}
	}, [tableRows]);

	useDidUpdateEffect(() => {
		if (searchQuery && searchQuery.length > 0) {
			searchInProgress(id);
			handleSearchQuery();
		} else {
			if (!singleapptransinfo[id]?.data[pagination]?.length > 0) {
				dispatch(
					checkStoreAndFetchSingleAppTrans(
						id,
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
		if (singleapptransinfo[id]?.count) {
			var x = Math.ceil(
				singleapptransinfo[id]?.count / Number.parseInt(tableRows)
			);
			setTotalPages(x);
			if (totalPages > 1 && page >= Number.parseInt(x)) {
				setPage(Number.parseInt(x - 1));
			}
		}
	}, [singleapptransinfo[id]]);

	return (
		<>
			{userRole === userRoles.IT_ADMIN ||
			userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView height="700px" />
			) : (
				<>
					<div style={{ padding: "0px 40px", marginBottom: "30px" }}>
						<div className="spendvscost__exterior__cont">
							<SpendVSCostGraph
								title={"Actual Spend vs Est Cost"}
								graphHeight={"226px"}
								linkText={
									"Why is there a difference between cost and spend?"
								}
								linkURL="https://help.zluri.com/en/articles/5679374-why-is-there-a-difference-between-cost-and-spend"
								graphAPI={getApplicationSpendVSEstCostGraph}
								id={id}
							/>
						</div>
					</div>
					<div style={{ padding: "0px 40px", marginBottom: "15px" }}>
						Recent Transactions
					</div>
					<div className="top__Uploads background-color-white">
						<div
							className="Uploads__left"
							style={{ paddingLeft: "40px" }}
						></div>
						<div className="Uploads__right">
							{selectedIds.length > 0 ? (
								<>
									<button
										className="autho__dd__cont5"
										style={{ marginRight: "15px" }}
										ref={paymentSuggestionsRef}
										onClick={clickedOnChangePaymentDropdown}
									>
										Change Payment Method
										<img src={AngleDown} className="ml-2" />
										{showPaymentMethodSuggestions ? (
											<div className="custom__dropdown__payment__dropdown__new">
												<div className="inputWithIconAppsTxns m-2">
													<input
														type="text"
														placeholder="Search"
														value={
															paymentMethodQuery
														}
														onChange={(e) =>
															searchPaymentMethod(
																e.target.value
															)
														}
													/>
													<img
														src={search}
														aria-hidden="true"
													/>
												</div>
												{paymentMethodSuggestions.length ===
													0 && paymentLoading ? (
													<div className="d-flex justify-content-center align-items-center">
														<Loader
															height={60}
															width={60}
														/>
													</div>
												) : paymentMethodSuggestions.length ===
														0 && !paymentLoading ? (
													<div className="d-flex mt-2 mb-3 ml-auto mr-auto">
														No payment methods
													</div>
												) : (
													<>
														{paymentMethodSuggestions.map(
															(method) => (
																<div
																	className="custom__dropdown__payment__dropdown__option"
																	onClick={() =>
																		handlePaymentMethodSelect(
																			method
																		)
																	}
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
																			className="mr-2"
																		/>
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
																</div>
															)
														)}
													</>
												)}
											</div>
										) : null}
									</button>
									<button
										className="autho__dd__cont8"
										onClick={
											clickedOnChangeBulkActionsDropdown
										}
									>
										Bulk Actions
										<img
											src={AngleDown}
											style={{ marginLeft: "8px" }}
										></img>
										{showBulkActionsMenu && (
											<div
												ref={bulkActionMenuRef}
												className="autho__dd__cont8__options menu"
											>
												<div
													onClick={
														handleUnassignAppsClick
													}
													role="button"
													className="autho__dd__cont8__option"
												>
													Unassign Apps
												</div>
												<hr
													style={{
														margin: "0px 18px",
													}}
												></hr>
												<div
													onClick={handleArchiveClick}
													role="button"
													className="autho__dd__cont8__option"
												>
													Archive
												</div>
											</div>
										)}
									</button>
								</>
							) : (
								<>
									{/* <div className="mr-3">
										<button className="appsac">
											<img src={CSV} />
											<span id="te">CSV</span>
										</button>
									</div> */}
									<div className="d-flex flex-row">
										{!isViewer && (
											<button
												className="appsad mr-3"
												onClick={
													clickedOnAddTransaction
												}
											>
												<img src={Add} />
												<span id="te">Add</span>
											</button>
										)}
										{showAddTransactionModal && (
											<AddTransactionModal
												isOpen={showAddTransactionModal}
												application={application}
												submitting={
													submittingTransaction
												}
												handleClose={() =>
													setShowAddTransactionModal(
														false
													)
												}
												handleSubmit={
													handleTransactionAdd
												}
												modalProps={{
													handleRefresh:
														refreshAllPages,
												}}
											/>
										)}
									</div>
								</>
							)}
							<div className="inputWithIconApps mr-3">
								<input
									type="text"
									placeholder="Search Transactions"
									value={searchTerm}
									onChange={(e) => {
										setSearchTerm(e.target.value);
										handleSearchQueryChange(e.target.value);
									}}
									onClick={clickedOnSearch}
								/>
								<img src={search} aria-hidden="true" />
							</div>
							<button
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
							{application && (
								<SpendTrigger
									appId={id}
									loading={appLoading}
									appTriggerStatus={
										application?.app_spends_cal_status
									}
									orgTriggerStatus={
										application?.org?.spends_cal_status
									}
									onApiSuccess={fetchAndSetApplication}
								/>
							)}
						</div>
					</div>
					<div className="transaction__table__details background-color-white">
						<div className="table__info__text__left">
							<div>Showing</div>
							<div className="bold-600 mr-1 ml-1">
								{searchQuery.length > 0
									? searchResultCount || 0
									: singleapptransinfo[id]?.count || 0}
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
									<option value={10}>5</option>
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
														Number.parseInt(
															tableRows
														)
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
						className="background-color-white"
						style={{ padding: "0px 40px" }}
						key={page}
					>
						{(searchQuery
							? singleapptransinfo[id]?.searchData?.loading
							: singleapptransinfo[id]?.loading) && (
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
							? singleapptransinfo[id]?.searchData?.loaded
							: singleapptransinfo[id]?.loaded) && (
							<>
								{(searchQuery
									? singleapptransinfo[id].searchData.data
									: singleapptransinfo[id]?.data[pagination]
								)?.length > 0 ? (
									<Table
										columns={columns}
										data={
											searchQuery
												? singleapptransinfo[id]
														.searchData.data
												: singleapptransinfo[id].data[
														pagination
												  ] || []
										}
										hover
										remote={true}
										options={options}
										onTableChange={
											onTableChange
												? onTableChange
												: () => {}
										}
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
												<Empty />
											)
										}
									/>
								)}
							</>
						)}
					</div>
				</>
			)}
		</>
	);
}

function searchInProgress(id) {
	return (dispatch) =>
		dispatch({
			type: applicationConstants.SEARCH_SINGLE_APPLICATION_TRANSACTIONS_REQUESTED,
			payload: {
				id: id,
			},
		});
}
