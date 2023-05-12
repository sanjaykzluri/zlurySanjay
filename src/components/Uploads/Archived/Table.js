import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useContext,
} from "react";
import PropTypes from "prop-types";
import { defaults, transactionConstants } from "../../../constants";
import { Table } from "../../../common";
import { Empty } from "./Empty";
import "./Archived.css";
import Dropdown from "../../Transactions/Recognised/Dropdown";
import master from "../../../assets/transactions/mastercard.svg";
import visa from "../../../assets/transactions/visa.svg";
import ContentLoader from "react-content-loader";
import {
	fetchUploadsArchived,
	checkAndFetchUploadsArchived,
	refreshAllUploadsArchivedTransPages,
} from "../../../actions/transactions-action";
import { useDispatch, useSelector } from "react-redux";
import rightarrow from "../../Transactions/Recognised/rightarrow.svg";
import leftarrow from "../../Transactions/Recognised/leftarrow.svg";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import { EmptySearch } from "../../../common/EmptySearch";
import { InfiniteTable } from "../../Departments/InfiniteTable";
import card from "../../../assets/transactions/card.svg";
import bank from "../../../assets/transactions/bank.svg";
import { ArchivedFilters } from "../../Transactions/Archived/Filters";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import {
	searchUploadedArchivedTransactions,
	checkSpecialCharacters,
} from "../../../services/api/search";
import { client } from "../../../utils/client";
import { debounce } from "../../../utils/common";
import { kFormatter } from "../../../constants/currency";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import RoleContext from "../../../services/roleContext/roleContext";
import _ from "underscore";
import close from "../../../assets/close.svg";
import { PaymentFormatter } from "../../Transactions/Recognised/Recognised";
import { ArchivedTransactionsFilters } from "../../Transactions/Archived/ArchivedTransactionsFilters";

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
function Dropdownformatter(cell, row, rowIndex, formatExtraData) {
	const pathname = window.location.pathname;
	const id = pathname.split("/")[3];
	return (
		<>
			{cell.payment_method_name === null && !formatExtraData.isViewer ? (
				<Dropdown
					fetch={formatExtraData.refreshReduxState}
					cell={cell}
					id={row.transaction_upload_id || row.transaction_id}
					page={formatExtraData?.page}
				></Dropdown>
			) : cell.payment_method_name === null &&
			  formatExtraData.isViewer ? (
				<div className="flex flex-row center">
					<div style={{ marginLeft: "8px" }} className="grey-1">
						No Payment Method
					</div>
				</div>
			) : (
				<div className="flex flex-row center">
					<img
						src={getImageForPaymentMethodTable(cell)}
						style={{
							maxHeight: 15,
							marginRight: "8px",
						}}
					></img>
					<div style={{ marginLeft: "8px" }}>
						{cell.payment_method_name}
					</div>
				</div>
			)}
		</>
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

const showTooltipLength = 20;

function sourceFormatter(cell, row) {
	return (
		<>
			<OverlayTrigger
				placement="top"
				overlay={<Tooltip>{cell?.source_name}</Tooltip>}
			>
				<div className="truncate_10vw">
					<>
						{cell?.source_name ? (
							cell?.source_name
						) : (
							<span>Added Manually</span>
						)}
					</>
				</div>
			</OverlayTrigger>
		</>
	);
}

export function ArchivedTable(props) {
	const initialsPage = 0;
	const [page, setPage] = useState(0);
	const [selectedIds, setSelectedIds] = useState([]);
	const [selectedTransactions, setSelectedTransactions] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const cancelToken = useRef();
	const pathname = window.location.pathname;
	const id = pathname.split("/")[3];
	const { uploadsarchived } = useSelector((state) => state.transactions);
	const dispatch = useDispatch();
	const rowStyle = { height: "48px" };
	const { isViewer } = useContext(RoleContext);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [tableRows, setTableRows] = useState(20);
	var pagination = "page_" + page.toString() + "_" + tableRows?.toString();
	const [totalPages, setTotalPages] = useState();
	const [totalTransactions, setTotalTransactions] = useState();
	const [searchResultCount, setSearchResultCount] = useState(0);
	const [clearSearchQuery, setClearSearchQuery] = useState(false);
	useEffect(() => {
		cancelToken.current = client.CancelToken.source();
	}, []);

	useEffect(() => {
		if (searchQuery && searchQuery.length > 0) {
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			dispatch(
				checkAndFetchUploadsArchived(
					page,
					Number.parseInt(tableRows),
					id,
					cancelToken
				)
			);
			//Segment Implementation
			window.analytics.page("Transactions", "Uploads-Archived", {
				upload_id: id,
				page: page,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [page]);

	const handleSearchRequests = useCallback(
		debounce((searchQuery, page, rows) => {
			if (cancelToken.current?.token) {
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			}
			if (checkSpecialCharacters(searchQuery, true)) {
				dispatch({
					type: transactionConstants.SEARCH_UPLOADS_ARCH_FETCHED,
					payload: {
						data: [],
					},
				});
			} else {
				searchInProgress();
				cancelToken.current = client.CancelToken.source();
				searchUploadedArchivedTransactions(
					searchQuery,
					page,
					rows,
					id,
					cancelToken.current
				)
					.then((res) => {
						if (res.results) {
							dispatch(searchSuccessful(res.results));
						}
					})
					.catch((err) =>
						console.error("Error fetching list data", err)
					);
			}
		}, 300),
		[]
	);

	const refreshAllPages = () => {
		var pages = [];
		if (typeof uploadsarchived[id]?.data === "object") {
			Object.keys(uploadsarchived[id].data).forEach((key) => {
				var key_split_array = key.split("_");
				var page_row_obj = {
					page: key_split_array[1] || 0,
					row: key_split_array[2] || 20,
				};
				pages.push(page_row_obj);
			});
			dispatch({
				type: transactionConstants.DELETE_ALL_UPLOADS_ARCHIVED_CACHE,
				payload: {
					id: id,
				},
			});
			dispatch(refreshAllUploadsArchivedTransPages(pages, id));
		}
	};

	const refreshReduxState = () => {
		setSelectedIds([]);
		setSelectedTransactions([]);
		if (searchQuery.length > 0) {
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			dispatch({
				type: transactionConstants.DELETE_UPLOADS_ARC_CACHE,
				payload: {
					id: id,
					page: pagination,
				},
			});
			dispatch(
				fetchUploadsArchived(
					page,
					Number.parseInt(tableRows),
					id,
					cancelToken
				)
			);
		}
	};

	const columns = [
		{
			dataField: "transaction_description",
			text: "Transaction Description",
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
			// eslint-disable-next-line react/display-name
			formatter: PaymentFormatter,
			formatExtraData: {
				refreshReduxState: refreshReduxState,
				isViewer: isViewer,
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
			? uploadsarchived?.searchData?.count
			: uploadsarchived[id]?.count,
		pageStartIndex: 0,
		sizePerPage: Number.parseInt(tableRows),
	};

	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
		onSelect: (row, isSelect, rowIndex, e) => {
			if (isSelect) {
				if (
					!selectedIds.includes(
						row.transaction_upload_id || row.transaction_id
					)
				) {
					setSelectedIds(
						selectedIds.concat([
							row.transaction_upload_id || row.transaction_id,
						])
					);
					setSelectedTransactions(selectedTransactions.concat([row]));
				}
			} else {
				if (
					selectedIds.includes(
						row.transaction_upload_id || row.transaction_id
					)
				) {
					setSelectedIds(
						selectedIds.filter(
							(el) =>
								el !==
								(row.transaction_upload_id ||
									row.transaction_id)
						)
					);
					setSelectedTransactions(
						selectedTransactions.filter((el) => el !== row)
					);
				}
			}
		},
		onSelectAll: (isSelect, rows, e) => {
			if (isSelect) {
				setSelectedIds(
					rows.map(
						(row) => row.transaction_upload_id || row.transaction_id
					)
				);
				setSelectedTransactions(rows);
			} else {
				setSelectedIds([]);
				setSelectedTransactions([]);
			}
		},
	};

	function onTableChange(type, { page }) {
		setPage(page);
		setSelectedIds([]);
		setSelectedTransactions([]);
	}

	function searchInProgress() {
		dispatch({
			type: transactionConstants.SEARCH_UPLOADS_ARCH_REQUESTED,
		});
	}

	function fetchTransactions(page, row) {
		return fetchUploadsArchived(page, row, id, cancelToken);
	}

	function searchSuccessful(searchData) {
		setSearchResultCount(searchData.total_count);
		return (dispatch) =>
			dispatch({
				type: transactionConstants.SEARCH_UPLOADS_ARCH_FETCHED,
				payload: {
					data: searchData.results,
					count: searchData.total_count,
				},
			});
	}

	useDidUpdateEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery && searchQuery.length > 0) {
			if (checkSpecialCharacters(searchQuery, true)) {
				dispatch({
					type: transactionConstants.SEARCH_UPLOADS_ARCH_FETCHED,
					payload: {
						data: [],
					},
				});
			} else {
				searchInProgress();
				setSelectedIds([]);
				setSelectedTransactions([]);
				setPage(initialsPage);
				handleSearchRequests(searchQuery, page);
			}
		} else {
			if (page == initialsPage) {
				dispatch(
					checkAndFetchUploadsArchived(
						page,
						Number.parseInt(tableRows),
						id,
						cancelToken
					)
				);
			} else {
				setSelectedIds([]);
				setSelectedTransactions([]);
				setPage(initialsPage);
			}
		}
	}, [searchQuery]);

	useEffect(() => {
		var x = uploadsarchived[id]?.count / Number.parseInt(tableRows);
		setTotalPages(Number.parseInt(Math.ceil(x)));
		if (totalPages > 1 && page >= Number.parseInt(Math.ceil(x))) {
			if (Number.parseInt(Math.ceil(x)) > 0) {
				setPage(Number.parseInt(Math.ceil(x)) - 1);
			} else {
				setPage(0);
			}
		}
	}, [tableRows]);

	useDidUpdateEffect(() => {
		if (searchQuery && searchQuery.length !== 1) {
			searchInProgress();
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			dispatch(
				checkAndFetchUploadsArchived(
					page,
					Number.parseInt(tableRows),
					id,
					cancelToken
				)
			);
			setSearchResultCount(0);
		}
	}, [tableRows, searchQuery]);

	useEffect(() => {
		if (uploadsarchived[id]?.count) {
			var x = Math.ceil(
				uploadsarchived[id]?.count / Number.parseInt(tableRows)
			);
			setTotalPages(x);
			if (totalPages > 1 && page >= Number.parseInt(x)) {
				setPage(Number.parseInt(x - 1));
			}
		}
	}, [uploadsarchived[id]]);

	useEffect(() => {
		if (uploadsarchived[id]?.count && !totalTransactions) {
			setTotalTransactions(uploadsarchived[id]?.count);
		}
	}, [uploadsarchived[id]]);

	useEffect(() => {
		if (clearSearchQuery) {
			setClearSearchQuery(false);
		}
	}, [clearSearchQuery]);

	return (
		<>
			<ArchivedTransactionsFilters
				fetchTransactions={fetchTransactions}
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
				isUploads={true}
				id={id}
			/>
			<div key={pagination}>
				<div className="transaction__table__details__archived">
					<div
						className="table__info__text__left"
						style={{ paddingLeft: "4px" }}
					>
						<div>Showing</div>
						<div className="bold-600 mr-1 ml-1">
							{searchQuery.length > 0
								? searchResultCount || 0
								: uploadsarchived[id]?.count}
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
				{(
					searchQuery
						? uploadsarchived?.searchData?.loading
						: uploadsarchived[id]?.loading
				) ? (
					<Table
						columns={loaderColumns}
						data={loadingData || []}
						hover
						remote={false}
						keyField="_id"
						selectRow={selectRow}
						rowStyle={rowStyle}
					/>
				) : (searchQuery
						? uploadsarchived?.searchData?.data
						: uploadsarchived[id]?.data[pagination]
				  )?.length == 0 ? (
					<InfiniteTable
						keyField="transaction_upload_id"
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
				) : (
					<Table
						columns={columns}
						data={
							searchQuery
								? uploadsarchived?.searchData?.data
								: uploadsarchived[id]?.data[pagination]
						}
						onTableChange={onTableChange}
						options={options}
						hover
						keyField={
							searchQuery
								? "transaction_id"
								: "transaction_upload_id"
						}
						selectRow={selectRow}
						rowStyle={rowStyle}
					/>
				)}
			</div>
		</>
	);
}

ArchivedTable.propTypes = {
	data: PropTypes.array,
	options: PropTypes.object,
	onTableChange: PropTypes.func,
};
