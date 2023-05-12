import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { Table } from "../../../common";
import rightarrow from "../Recognised/rightarrow.svg";
import leftarrow from "../Recognised/leftarrow.svg";
import { UnrecognisedFilters } from "./Filters";
import {
	fetchUnrecognisedTransactions,
	checkAndFetchUnRecog,
	refreshAllUnrecognisedTransPages,
} from "../../../actions/transactions-action";
import { defaults, ENTITIES } from "../../../constants";
import { useDispatch, useSelector } from "react-redux";
import master from "../../../assets/transactions/mastercard.svg";
import visa from "../../../assets/transactions/visa.svg";
import bank from "../../../assets/transactions/bank.svg";
import card from "../../../assets/transactions/card.svg";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import "./Unrecognised.css";
import { InfiniteTable } from "../../Departments/InfiniteTable";
import Drowdown from "../Recognised/Dropdown";
import ContentLoader from "react-content-loader";
import { transactionConstants } from "../../../constants/transactions";
import WorkflowModal from "./WorkflowModal";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { searchAllUnrecognisedTransactions } from "../../../services/api/search";
import { client } from "../../../utils/client";
import { Empty } from "./Empty";
import "../../../App.css";
import { EmptySearch } from "../../../common/EmptySearch";
import { kFormatter } from "../../../constants/currency";
import { checkSpecialCharacters } from "../../../services/api/search";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Strips from "../../../common/restrictions/Strips";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../../common/restrictions";
import _ from "underscore";
import close from "../../../assets/close.svg";
import RoleContext from "../../../services/roleContext/roleContext";
import { debounce } from "../../../utils/common";
import { PaymentFormatter } from "../Recognised/Recognised";

const loadingData = [
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
];
const showTooltipLength = 10;
function getImageForPaymentMethodTable(paymentMethod) {
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
			: type === "bank"
			? bank
			: type === "other" && paymentMethod.payment_method_logo_url !== ""
			? paymentMethod.payment_method_logo_url
			: otherpayment;
	return image;
}
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
function Dropdownformatter(cell, row, rowIndex, formatExtraData) {
	const selectedData = formatExtraData.selectedData;
	const selectedId = formatExtraData.selectedId;
	const setSelectedIds = formatExtraData.setSelectedIds;
	const fetchTransactions = formatExtraData.fetchTransactions;
	const page = formatExtraData.page;
	const rows = formatExtraData.rows;
	const cancelToken = formatExtraData.ref;
	const clearAllPagesCache = formatExtraData.clearAllPagesCache;
	const searchQuery = formatExtraData.searchQuery;
	const handleSearchRequests = formatExtraData.handleSearchRequests;

	return (
		<div
			onClickCapture={(e) => {
				if (formatExtraData.isBasicSubscription) {
					e.stopPropagation();
					e.preventDefault();
					showrestrictedPopup(ENTITIES.ASSIGN_APPLICATION);
				}
			}}
		>
			{cell ? (
				<WorkflowModal
					id={selectedId}
					data={[selectedData]}
					setSelectedIds={setSelectedIds}
					fetchTransactions={fetchTransactions}
					page={page}
					rows={rows}
					cancelToken={cancelToken}
					clearCache={clearAllPagesCache}
					searchQuery={searchQuery}
					handleSearchRequests={handleSearchRequests}
				></WorkflowModal>
			) : null}
		</div>
	);
}
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
			{cell.source_type === "manually" ? (
				<span>Added Manually</span>
			) : cell.source_name ? (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>{cell?.source_name}</Tooltip>}
				>
					<div className="truncate_10vw">{cell?.source_name}</div>
				</OverlayTrigger>
			) : (
				<span>-</span>
			)}
		</>
	);
}
export function Unrecognised() {
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

	const { unrecognisedTransactions } = useSelector(
		(state) => state.transactions
	);

	const initialsPage = 0;
	const [page, setPage] = useState(0);
	const [obj, setobj] = useState([]);
	const [activeId, setactiveId] = useState();
	const [selectedIds, setSelectedIds] = useState([]);
	const [selectedTransactions, setSelectedTransactions] = useState([]);
	const [showTxnAssignModal, setShowTxnAssignModal] = useState(false);
	const cancelToken = useRef();
	const [searchQuery, setSearchQuery] = useState("");
	const dispatch = useDispatch();
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [tableRows, setTableRows] = useState(20);
	var pagination = "page_" + page.toString() + "_" + tableRows.toString();
	const [totalPages, setTotalPages] = useState();
	const [totalTransactions, setTotalTransactions] = useState();
	const [searchResultCount, setSearchResultCount] = useState(0);
	const [clearSearchQuery, setClearSearchQuery] = useState(false);
	const { isViewer } = useContext(RoleContext);

	useEffect(() => {
		cancelToken.current = client.CancelToken.source();
	}, []);

	const handleSearchRequests = useCallback(
		debounce((searchQuery, page, rows) => {
			if (cancelToken.current?.token) {
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			}

			cancelToken.current = client.CancelToken.source();
			if (checkSpecialCharacters(searchQuery, true)) {
				dispatch({
					type: transactionConstants.SEARCH_UNRECOGNISED_TRANSACTIONS_FETCHED,
					payload: {
						data: [],
					},
				});
			} else {
				searchInProgress();
				searchAllUnrecognisedTransactions(
					searchQuery,
					page,
					rows,
					cancelToken.current
				)
					.then((res) => {
						if (
							res.data.results &&
							searchQuery &&
							res.searchQuery === searchQuery
						) {
							searchSuccessful(res.data.results);
						}
					})
					.catch((err) =>
						console.error("Error fetching list data", err)
					);
			}
		}, 300),
		[]
	);

	const clearAllPagesCache = () => {
		refreshAllPages();
		if (searchQuery && searchQuery.length > 1) {
			setPage(0);
			setTableRows(20);
		}
		dispatch({
			type: transactionConstants.DELETE_ALL_RECOGNISED_TRANSACTIONS_CACHE,
		});
	};

	const refreshAllPages = () => {
		var pages = [];
		if (typeof unrecognisedTransactions?.data === "object") {
			Object.keys(unrecognisedTransactions.data).forEach((key) => {
				var key_split_array = key.split("_");
				var page_row_obj = {
					page: key_split_array[1] || 0,
					row: key_split_array[2] || 20,
				};
				pages.push(page_row_obj);
			});
			dispatch({
				type: transactionConstants.DELETE_ALL_UNRECOGNISED_TRANSACTIONS_CACHE,
			});
			dispatch(refreshAllUnrecognisedTransPages(pages));
		}
	};

	const refreshReduxState = () => {
		setSelectedIds([]);
		if (searchQuery.length > 0) {
			searchInProgress();
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			dispatch({
				type: transactionConstants.DELETE_UNRECOGNISED_TRANSACTIONS_CACHE,
				payload: {
					page: pagination,
				},
			});
			dispatch(
				fetchUnrecognisedTransactions(
					page,
					Number.parseInt(tableRows),
					cancelToken
				)
			);
		}
		//Segment Implementation
		window.analytics.track("Refresh Button Clicked", {
			currentCategory: "Transactions",
			currentPageName: "Unrecognised-Transactions",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};

	let columns = [
		{
			dataField: "transaction_description",
			text: "Transaction Description",
			formatter: (transaction_description) => (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>{transaction_description}</Tooltip>}
				>
					<div className="truncate_name">
						{transaction_description}
					</div>
				</OverlayTrigger>
			),
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(row.transaction_id);
				},
			},
		},
		{
			dataField: "transaction_date",
			text: "Transaction Date",
			formatter: dateFormatter,
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(row.transaction_id);
				},
			},
		},
		{
			dataField: "transaction_amount",
			text: "Amount",
			formatter: (dataField) => {
				return kFormatter(dataField);
			},
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(row.transaction_id);
				},
			},
		},
		{
			dataField: "transaction_source",
			text: "Source",
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(row.transaction_id);
				},
			},
			formatter: sourceFormatter,
		},
		{
			dataField: "transaction_payment_method",
			text: "Payment Method",
			formatter: PaymentFormatter,
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(row.transaction_id);
				},
			},
			formatExtraData: {
				page: page,
				refreshReduxState: refreshReduxState,
				isBasicSubscription,
				type: ENTITIES.ASSIGN_PAYMENT,
			},
		},
	];

	if (!isViewer) {
		columns.push({
			dataField: "isActive",
			text: "",
			headerStyle: () => {
				return { width: "16%" };
			},
			formatter: Dropdownformatter,
			formatExtraData: {
				selectedId: activeId,
				selectedData: obj,
				setSelectedIds: setSelectedIds,
				fetchTransactions: fetchUnrecognisedTransactions,
				page: page,
				rows: defaults.UNRECOGNISED_TABLE_ROW,
				ref: cancelToken,
				clearAllPagesCache: clearAllPagesCache,
				isBasicSubscription,
				entity: ENTITIES.ASSIGN_APPLICATION,
				searchQuery: searchQuery,
				handleSearchRequests: handleSearchRequests,
			},
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(row.transaction_id);
				},
			},
		});
	}

	useEffect(() => {
		let dataSource =
			searchQuery && searchQuery.length > 0
				? unrecognisedTransactions?.searchData?.data
				: unrecognisedTransactions.data[pagination];
		if (dataSource) {
			dataSource.forEach((data) => {
				if (data.transaction_id === activeId) {
					data.isActive = true;
				} else {
					data.isActive = false;
				}
			});
			let newdata = dataSource?.find(
				(x) => x.transaction_id === activeId
			);
			setobj(newdata);
		}
	}, [activeId]);

	useEffect(() => {}, [columns]);

	useEffect(() => {
		if (searchQuery && searchQuery.length > 0) {
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			if (!unrecognisedTransactions.data[pagination]?.length > 0) {
				dispatch(
					checkAndFetchUnRecog(
						page,
						Number.parseInt(tableRows),
						cancelToken
					)
				);
			}
			//Segment Implement
			window.analytics.page("Transactions", "Unrecognised-Transactions", {
				page: page,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [page]);

	function onTableChange(type, { page }) {
		setPage(page);
		setSelectedIds([]);
	}
	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
		onSelect: (row, isSelect, rowIndex, e) => {
			if (isSelect) {
				if (!selectedIds.includes(row.transaction_id)) {
					setSelectedIds([...selectedIds, row.transaction_id]);
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
	const options = {
		pageButtonRenderer,
		page: page,
		withFirstAndLast: false,
		hideSizePerPage: true,
		totalSize: searchQuery
			? unrecognisedTransactions?.searchData?.count
			: unrecognisedTransactions?.count,
		pageStartIndex: 0,
		sizePerPage: Number.parseInt(tableRows),
	};
	const rowStyle = {
		height: "48px",
	};

	function searchSuccessful(searchData) {
		setSearchResultCount(searchData.total_count);
		dispatch({
			type: transactionConstants.SEARCH_UNRECOGNISED_TRANSACTIONS_FETCHED,
			payload: {
				data: searchData.results,
				count: searchData.total_count,
			},
		});
	}

	function searchInProgress() {
		dispatch({
			type: transactionConstants.SEARCH_UNRECOGNISED_TRANSACTIONS_REQUESTED,
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
			searchInProgress();
			setSelectedIds([]);
			setPage(initialsPage);
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			if (page == initialsPage) {
				dispatch(
					checkAndFetchUnRecog(
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
		(unrecognisedTransactions?.data?.length ||
			unrecognisedTransactions?.data[pagination]?.length ||
			0) === 0 && !unrecognisedTransactions.loading;

	function getDefaultImage(paymentMethod) {
		var image;
		image = paymentMethod.bank_name
			? bank
			: paymentMethod.cc_card_name
			? card
			: paymentMethod.payment_method_name &&
			  paymentMethod.payment_logo_url !== ""
			? paymentMethod.payment_logo_url
			: otherpayment;
		return image;
	}

	useEffect(() => {
		var x = unrecognisedTransactions?.count / Number.parseInt(tableRows);
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
			if (!unrecognisedTransactions.data[pagination]?.length > 0) {
				dispatch(
					fetchUnrecognisedTransactions(
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
		if (unrecognisedTransactions?.count && !totalPages) {
			setTotalPages(
				Math.ceil(
					unrecognisedTransactions?.count / Number.parseInt(tableRows)
				)
			);
		}
	}, [unrecognisedTransactions]);

	useEffect(() => {
		if (unrecognisedTransactions?.count) {
			var x = Math.ceil(
				unrecognisedTransactions?.count / Number.parseInt(tableRows)
			);
			setTotalPages(x);
			if (totalPages > 1 && page >= Number.parseInt(x)) {
				setPage(Number.parseInt(x - 1));
			}
		}
	}, [unrecognisedTransactions]);

	useEffect(() => {
		if (clearSearchQuery) {
			setClearSearchQuery(false);
		}
	}, [clearSearchQuery]);

	return (
		<>
			<UnrecognisedFilters
				isTransactionPage={true}
				selectedIds={selectedIds}
				setSearchQuery={setSearchQuery}
				selectedTransactions={selectedTransactions}
				setSelectedTransactions={setSelectedTransactions}
				page={page}
				getDefaultImage={getDefaultImage}
				setSelectedIds={setSelectedIds}
				fetchTransactions={fetchUnrecognisedTransactions}
				TABLE_ROW={defaults.UNRECOGNISED_TABLE_ROW}
				searchQuery={searchQuery}
				handleSearchRequests={handleSearchRequests}
				refreshReduxState={refreshReduxState}
				refreshAllPages={refreshAllPages}
				cancelToken={cancelToken}
				clearSearchQuery={clearSearchQuery}
				clearAllPagesCache={clearAllPagesCache}
				tableRows={tableRows}
			/>
			<Strips entity={ENTITIES.TRANSACTIONS} />
			<div className="transaction__table__details">
				<div className="table__info__text__left">
					<div>Showing</div>
					<div className="bold-600 mr-1 ml-1">
						{searchQuery.length > 0
							? searchResultCount || 0
							: unrecognisedTransactions?.count || 0}
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
								setClearSearchQuery(true);
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
							value={Number.parseInt(tableRows)}
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
					? unrecognisedTransactions?.searchData?.loading
					: unrecognisedTransactions.loading) && (
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
					? unrecognisedTransactions?.searchData?.loaded
					: !unrecognisedTransactions.loading) && (
					<>
						{(searchQuery
							? unrecognisedTransactions?.searchData?.data
							: unrecognisedTransactions.data[pagination]
						)?.length ? (
							<Table
								columns={columns}
								data={
									searchQuery
										? unrecognisedTransactions?.searchData
												?.data
										: unrecognisedTransactions?.data[
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
							<Table
								columns={columns}
								data={[]}
								options={options}
								onTableChange={
									onTableChange ? onTableChange : () => {}
								}
								hover={false}
								remote={false}
								selectRow={selectRow}
								keyField="transaction_id"
								emptyState={
									searchQuery ? (
										<EmptySearch
											searchQuery={searchQuery}
											minHeight={"50vh"}
										/>
									) : (
										<Empty minHeight={"50vh"} />
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
