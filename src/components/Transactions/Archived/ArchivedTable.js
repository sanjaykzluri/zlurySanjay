import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useContext,
} from "react";
import PropTypes from "prop-types";
import { Table } from "../../../common";
import "./Archived.css";
import { InfiniteTable } from "../../Departments/InfiniteTable";
import Drowdown from "../Recognised/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import ContentLoader from "react-content-loader";
import {
	fetchArchivedTransactions,
	checkAndFetchArchived,
	refreshAllArchivedTransPages,
} from "../../../actions/transactions-action";
import rightarrow from "../Recognised/rightarrow.svg";
import leftarrow from "../Recognised/leftarrow.svg";
import master from "../../../assets/transactions/mastercard.svg";
import { defaults, ENTITIES } from "../../../constants";
import visa from "../../../assets/transactions/visa.svg";
import bank from "../../../assets/transactions/bank.svg";
import card from "../../../assets/transactions/card.svg";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import { client } from "../../../utils/client";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { transactionConstants } from "../../../constants/transactions";
import {
	checkSpecialCharacters,
	searchAllArchivedTransactions,
} from "../../../services/api/search";
import { Empty } from "../Archived/Empty";
import { EmptySearch } from "../../../common/EmptySearch";
import { ArchivedFilters } from "./Filters";
import { kFormatter } from "../../../constants/currency";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import RoleContext from "../../../services/roleContext/roleContext";
import Strips from "../../../common/restrictions/Strips";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../../common/restrictions";
import _ from "underscore";
import { Link } from "react-router-dom";
import { Tooltip as BootstrapTooltip } from "react-bootstrap";
import close from "../../../assets/close.svg";
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
function getReturnTo() {
	return window.location.pathname.split("/")[1];
}
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
export function ArchivedTable(props) {
	const [selectedIds, setSelectedIds] = useState([]);
	const [selectedTransactions, setSelectedTransactions] = useState([]);
	const initialsPage = 0;
	const [page, setPage] = useState(initialsPage);
	const [searchQuery, setSearchQuery] = useState("");
	const dispatch = useDispatch();
	const { archivedTransactions } = useSelector((state) => state.transactions);
	const cancelToken = useRef();
	const { isViewer } = useContext(RoleContext);
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [tableRows, setTableRows] = useState(20);
	var pagination = "page_" + page.toString() + "_" + tableRows.toString();
	const [totalPages, setTotalPages] = useState();
	const [totalTransactions, setTotalTransactions] = useState();
	const [searchResultCount, setSearchResultCount] = useState(0);
	const [clearSearchQuery, setClearSearchQuery] = useState(false);

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
					type: transactionConstants.SEARCH_ARCHIVED_TRANSACTIONS_FETCHED,
					payload: {
						data: [],
					},
				});
			} else {
				searchInProgress();
				searchAllArchivedTransactions(
					searchQuery,
					page,
					rows,
					cancelToken.current
				)
					.then((res) => {
						if (res.data && res.data.results) {
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

	useEffect(() => {
		cancelToken.current = client.CancelToken.source();
	}, []);

	useEffect(() => {
		if (searchQuery && searchQuery.length > 0) {
			handleSearchRequests(searchQuery, page);
		} else {
			if (!archivedTransactions.data[pagination]?.length > 0) {
				dispatch(
					checkAndFetchArchived(
						page,
						Number.parseInt(tableRows),
						cancelToken
					)
				);
			}
			//Segment Implementation
			window.analytics.page("Transactions", "Archived-Transactions", {
				page: page,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [page]);

	const refreshAllPages = () => {
		var pages = [];
		if (typeof archivedTransactions?.data === "object") {
			_.map(Object.keys(archivedTransactions.data), function (key) {
				var key_split_array = key.split("_");
				var page_row_obj = {
					page: key_split_array[1] || 0,
					row: key_split_array[2] || 20,
				};
				pages.push(page_row_obj);
			});
			dispatch({
				type: transactionConstants.DELETE_ALL_ARCHIVED_TRANSACTIONS_CACHE,
			});
			dispatch(refreshAllArchivedTransPages(pages));
		}
	};

	const refreshReduxState = () => {
		setSelectedIds([]);
		setSelectedTransactions([]);
		if (searchQuery.length > 0) {
			searchInProgress();
			handleSearchRequests(searchQuery, page);
		} else {
			dispatch({
				type: transactionConstants.DELETE_ARCHIVED_CACHE,
				payload: {
					page: pagination,
				},
			});
			dispatch(
				fetchArchivedTransactions(
					page,
					Number.parseInt(tableRows),
					cancelToken
				)
			);
		}
		//Segment Implementation
		window.analytics.track("Refresh Button Clicked", {
			currentCategory: "Transactions",
			currentPageName: "Recognised-Transactions",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};

	const columns = [
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
		},
		{
			dataField: "transaction_date",
			text: "Transaction Date",
			formatter: dateFormatter,
		},
		{
			dataField: "transaction_amount",
			text: "Amount",
			formatter: (cell, dataField) => {
				return kFormatter(dataField.actual_amount);
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
			// eslint-disable-next-line react/display-name
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
			? archivedTransactions?.searchData?.count
			: archivedTransactions?.count,
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
					setSelectedTransactions(selectedTransactions.concat([row]));
				}
			} else {
				if (selectedIds.includes(row.transaction_id)) {
					setSelectedIds(
						selectedIds.filter((el) => el !== row.transaction_id)
					);
					setSelectedTransactions(
						selectedTransactions.filter((el) => el !== row)
					);
				}
			}
		},
		onSelectAll: (isSelect, rows, e) => {
			if (isSelect) {
				setSelectedIds(rows.map((row) => row.transaction_id));
				setSelectedTransactions(rows);
			} else {
				setSelectedIds([]);
				setSelectedTransactions([]);
			}
		},
	};

	function searchInProgress() {
		dispatch({
			type: transactionConstants.SEARCH_ARCHIVED_TRANSACTIONS_REQUESTED,
		});
	}

	function onTableChange(type, { page }) {
		setPage(page);
		setSelectedIds([]);
		setSelectedTransactions([]);
	}

	function searchSuccessful(searchData) {
		setSearchResultCount(searchData.total_count);
		dispatch({
			type: transactionConstants.SEARCH_ARCHIVED_TRANSACTIONS_FETCHED,
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
					type: transactionConstants.SEARCH_ARCHIVED_TRANSACTIONS_FETCHED,
					payload: {
						data: [],
					},
				});
				setSelectedIds([]);
				setSelectedTransactions([]);
			} else {
				searchInProgress();
				setSelectedIds([]);
				setSelectedTransactions([]);
				setPage(initialsPage);
				handleSearchRequests(
					searchQuery,
					page,
					Number.parseInt(tableRows)
				);
			}
		} else {
			if (page == initialsPage) {
				dispatch(
					checkAndFetchArchived(
						page,
						Number.parseInt(tableRows),
						cancelToken
					)
				);
			} else {
				setPage(initialsPage);
				setSelectedIds([]);
				setSelectedTransactions([]);
			}
		}
	}, [searchQuery]);

	useEffect(() => {
		var x = archivedTransactions?.count / Number.parseInt(tableRows);
		setTotalPages(Number.parseInt(Math.ceil(x)));
		if (totalPages > 1 && page >= Number.parseInt(Math.ceil(x))) {
			setPage(Number.parseInt(Math.ceil(x)) - 1);
		}
	}, [tableRows]);

	useDidUpdateEffect(() => {
		if (searchQuery && searchQuery.length !== 1) {
			searchInProgress();
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			if (!archivedTransactions.data[pagination]?.length > 0) {
				dispatch(
					checkAndFetchArchived(
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
		if (archivedTransactions?.count && !totalPages) {
			setTotalPages(
				Math.ceil(
					archivedTransactions?.count / Number.parseInt(tableRows)
				)
			);
		}
	}, [archivedTransactions]);

	useEffect(() => {
		if (archivedTransactions?.count) {
			var x = Math.ceil(
				archivedTransactions?.count / Number.parseInt(tableRows)
			);
			setTotalPages(x);
			if (totalPages > 1 && page >= Number.parseInt(x)) {
				setPage(Number.parseInt(x - 1));
			}
		}
	}, [archivedTransactions]);

	useEffect(() => {
		if (clearSearchQuery) {
			setClearSearchQuery(false);
		}
	}, [clearSearchQuery]);

	return (
		<>
			<ArchivedFilters
				isTransactionPage={true}
				fetchTransactions={fetchArchivedTransactions}
				setSearchQuery={setSearchQuery}
				page={page}
				selectedIds={selectedIds}
				selectedTransactions={selectedTransactions}
				setSelectedIds={setSelectedIds}
				TABLE_ROW={defaults.ARCHIVED_TABLE_ROW}
				handleSearchRequests={handleSearchRequests}
				searchQuery={searchQuery}
				refreshReduxState={refreshReduxState}
				cancelToken={cancelToken}
				refreshAllPages={refreshAllPages}
				clearSearchQuery={clearSearchQuery}
			/>
			<Strips entity={ENTITIES.TRANSACTIONS} className="ml-0 mr-0" />
			<div className="transaction__table__details__archived">
				<div
					className="table__info__text__left"
					style={{ paddingLeft: "4px" }}
				>
					<div>Showing</div>
					<div className="bold-600 mr-1 ml-1">
						{searchQuery.length > 0
							? searchResultCount || 0
							: archivedTransactions?.count || 0}
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
								setSelectedTransactions([]);
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
									setSelectedTransactions([]);
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
									setSelectedTransactions([]);
								}
							}}
							className="table__info__text__right2 cursor-pointer"
						>
							<img src={rightarrow} />
						</div>
					</div>
				</div>
			</div>
			{(searchQuery
				? archivedTransactions?.searchData?.loading
				: archivedTransactions.loading) && (
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
				? archivedTransactions?.searchData?.loaded
				: !archivedTransactions.loading) && (
				<div key={pagination}>
					{(searchQuery
						? archivedTransactions?.searchData?.data
						: archivedTransactions.data[pagination]
					)?.length > 0 ? (
						<Table
							columns={columns}
							data={
								searchQuery
									? archivedTransactions?.searchData?.data
									: archivedTransactions?.data[pagination]
							}
							onTableChange={onTableChange}
							options={options}
							hover
							keyField="transaction_id"
							selectRow={selectRow}
							rowStyle={rowStyle}
							remote={true}
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
									<EmptySearch searchQuery={searchQuery} />
								) : (
									<Empty />
								)
							}
						/>
					)}
				</div>
			)}
		</>
	);
}

ArchivedTable.propTypes = {
	data: PropTypes.array,
	options: PropTypes.object,
	onTableChange: PropTypes.func,
};
