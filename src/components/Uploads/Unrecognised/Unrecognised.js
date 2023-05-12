import React, {
	useEffect,
	useState,
	useCallback,
	useRef,
	useContext,
} from "react";
import { Table } from "../../../common";
import { Filters } from "./Filters";
import {
	fetchUploadsUnrecognized,
	checkAndFetchUploadsUnrecognized,
	refreshAllUploadsUnRecognisedTransPages,
} from "../../../actions/transactions-action";
import { defaults, ENTITIES } from "../../../constants";
import { useDispatch, useSelector } from "react-redux";
import master from "../../../assets/transactions/mastercard.svg";
import ContentLoader from "react-content-loader";
import WorkflowModal from "../../Transactions/Unrecognised/WorkflowModal";
import Dropdown from "../../Transactions/Recognised/Dropdown";
import rightarrow from "../../Transactions/Recognised/rightarrow.svg";
import leftarrow from "../../Transactions/Recognised/leftarrow.svg";
import { Empty } from "./Empty";
import visa from "../../../assets/transactions/visa.svg";
import hyperlink from "../../../assets/transactions/hyperlink.svg";
import "./Unrecognised.css";
import { transactionConstants } from "../../../constants/transactions";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import {
	searchUploadedUnrecognisedTransactions,
	checkSpecialCharacters,
} from "../../../services/api/search.js";
import { debounce } from "../../../utils/common";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { client } from "../../../utils/client";
import card from "../../../assets/transactions/card.svg";
import bank from "../../../assets/transactions/bank.svg";
import { InfiniteTable } from "../../Departments/InfiniteTable";
import { EmptySearch } from "../../../common/EmptySearch";
import { kFormatter } from "../../../constants/currency";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import RoleContext from "../../../services/roleContext/roleContext";
import _ from "underscore";
import close from "../../../assets/close.svg";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../../common/restrictions";
import { PaymentFormatter } from "../../Transactions/Recognised/Recognised";
import {
	UnrecognisedFilters,
	UnrecognisedTransactionsFilters,
} from "../../Transactions/Unrecognised/UnrecognisedTransactionsFilters";

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

export function Unrecognised() {
	const pathname = window.location.pathname;
	const id = pathname.split("/")[3];
	const [activeId, setactiveId] = useState();
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState("");
	const { uploadsunrecognized } = useSelector((state) => state.transactions);
	const cancelToken = useRef();
	const [showHideFilter, setshowHideFilter] = useState(false);
	const [selectedIds, setSelectedIds] = useState([]);
	const [selectedTransactions, setSelectedTransactions] = useState([]);
	const initialsPage = 0;
	const [page, setPage] = useState(initialsPage);
	const { isViewer } = useContext(RoleContext);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [tableRows, setTableRows] = useState(20);
	var pagination = "page_" + page.toString() + "_" + tableRows?.toString();
	const [totalPages, setTotalPages] = useState();
	const [totalTransactions, setTotalTransactions] = useState();
	const [searchResultCount, setSearchResultCount] = useState(0);
	const [clearSearchQuery, setClearSearchQuery] = useState(false);
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);
	const [obj, setobj] = useState([]);
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
			if (checkSpecialCharacters(searchQuery, true)) {
				dispatch({
					type: transactionConstants.SEARCH_UPLOADS_UNRECOG_FETCHED,
					payload: {
						data: [],
					},
				});
			} else {
				searchInProgress();
				cancelToken.current = client.CancelToken.source();
				searchUploadedUnrecognisedTransactions(
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
						console.log(
							"Error when searching unrecognised transaction in uploads",
							err
						)
					);
			}
		}, 300),
		[]
	);

	const refreshAllPages = () => {
		var pages = [];
		if (typeof uploadsunrecognized[id]?.data === "object") {
			Object.keys(uploadsunrecognized[id].data).forEach((key) => {
				var key_split_array = key.split("_");
				var page_row_obj = {
					page: key_split_array[1] || 0,
					row: key_split_array[2] || 20,
				};
				pages.push(page_row_obj);
			});
			dispatch({
				type: transactionConstants.DELETE_ALL_UPLOADS_UNRECOG_CACHE,
				payload: {
					id: id,
				},
			});
			dispatch(refreshAllUploadsUnRecognisedTransPages(pages, id));
		}
	};

	const refreshReduxState = () => {
		setSelectedIds([]);
		if (searchQuery?.length > 0) {
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			dispatch({
				type: transactionConstants.DELETE_UPLOADS_UNRECOG_CACHE,
				payload: {
					id: id,
					page: pagination,
				},
			});

			dispatch(
				fetchUploadsUnrecognized(
					page,
					Number.parseInt(tableRows),
					id,
					cancelToken
				)
			);
		}
	};

	const fetchTransactions = (page, row) => {
		return fetchUploadsUnrecognized(page, row, id, cancelToken);
	};

	const clearAllPagesCache = () => {
		refreshAllPages();
		if (searchQuery && searchQuery.length > 1) {
			setPage(0);
			setTableRows(20);
		}
		dispatch({
			type: transactionConstants.DELETE_ALL_UPLOADS_RECOG_CACHE,
			payload: {
				id: id,
			},
		});
	};

	let columns = [
		{
			dataField: "transaction_description",
			text: "Transaction Description",
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(
						row.transaction_upload_id || row.transaction_id
					);
				},
			},
		},
		{
			dataField: "transaction_date",
			text: "Transaction Date",
			formatter: dateFormatter,
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(
						row.transaction_upload_id || row.transaction_id
					);
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
					setactiveId(
						row.transaction_upload_id || row.transaction_id
					);
				},
			},
		},
		{
			dataField: "transaction_source",
			text: "Source",
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(
						row.transaction_upload_id || row.transaction_id
					);
				},
			},
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
			},
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(
						row.transaction_upload_id || row.transaction_id
					);
				},
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
				fetchTransactions: fetchTransactions,
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
					setactiveId(
						row.transaction_upload_id || row.transaction_id
					);
				},
			},
		});
	}

	useEffect(() => {
		if (searchQuery && searchQuery.length > 0) {
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			dispatch(
				checkAndFetchUploadsUnrecognized(
					page,
					Number.parseInt(tableRows),
					id,
					cancelToken
				)
			);
			//Segment Implementation
			window.analytics.page("Transactions", "Uploads-Unrecognised", {
				upload_id: id,
				page: page,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [page]);

	useEffect(() => {
		let dataSource =
			searchQuery && searchQuery.length > 0
				? uploadsunrecognized.searchData?.data
				: uploadsunrecognized[id]?.data
				? uploadsunrecognized[id]?.data[pagination]
				: [];
		if (dataSource) {
			dataSource.forEach((data) => {
				if (
					(data.transaction_id || data.transaction_upload_id) ===
					activeId
				) {
					data.isActive = true;
				} else {
					data.isActive = false;
				}
			});
			let newdata = dataSource?.find(
				(x) =>
					(x.transaction_id || x.transaction_upload_id) === activeId
			);
			setobj(newdata);
		}
	}, [activeId]);

	function searchInProgress() {
		dispatch({
			type: transactionConstants.SEARCH_UPLOADS_UNRECOG_REQUESTED,
		});
	}

	function searchSuccessful(searchResults) {
		setSearchResultCount(searchResults.total_count);
		return (dispatch) =>
			dispatch({
				type: transactionConstants.SEARCH_UPLOADS_UNRECOG_FETCHED,
				payload: {
					data: searchResults.results,
					count: searchResults.total_count,
				},
			});
	}

	useEffect(() => {}, [columns]);

	useDidUpdateEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery && searchQuery.length > 0) {
			if (checkSpecialCharacters(searchQuery, true)) {
				dispatch({
					type: transactionConstants.SEARCH_UPLOADS_UNRECOG_FETCHED,
					payload: {
						data: [],
					},
				});
				setSelectedIds([]);
			} else {
				setSelectedIds([]);
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
					checkAndFetchUploadsUnrecognized(
						page,
						Number.parseInt(tableRows),
						id,
						cancelToken
					)
				);
			} else {
				setPage(initialsPage);
			}
		}
	}, [searchQuery]);

	function onTableChange(type, { page }) {
		setPage(page);
		setSelectedIds([]);
	}
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
					setSelectedTransactions([...selectedTransactions, row]);
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
						selectedTransactions.filter(
							(el) =>
								el.transaction_upload_id !==
								(row.transaction_upload_id ||
									row.transaction_id)
						)
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
				setSelectedTransactions([...rows]);
			} else {
				setSelectedIds([]);
				setSelectedTransactions([]);
			}
		},
	};

	useEffect(() => {
		setshowHideFilter(selectedIds.length > 0);
	}, [selectedIds]);

	const options = {
		pageButtonRenderer,
		page: page,
		withFirstAndLast: false,
		hideSizePerPage: true,
		totalSize: searchQuery
			? uploadsunrecognized.searchData?.count
			: uploadsunrecognized?.data?.total_count ||
			  uploadsunrecognized[id]?.count,
		pageStartIndex: 0,
		sizePerPage: Number.parseInt(tableRows),
	};
	const rowStyle = {
		height: "48px",
	};

	const emptyState =
		(searchQuery
			? uploadsunrecognized?.searchData?.data
			: uploadsunrecognized[id]?.data
			? uploadsunrecognized[id]?.data[pagination]
			: []
		)?.length == 0 &&
		(searchQuery
			? !uploadsunrecognized?.searchData?.loading
			: !uploadsunrecognized[id]?.loading);

	useEffect(() => {
		var x = uploadsunrecognized[id]?.count / Number.parseInt(tableRows);
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
		if (searchQuery && searchQuery.length > 0) {
			searchInProgress();
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			dispatch(
				checkAndFetchUploadsUnrecognized(
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
		if (uploadsunrecognized[id]?.count) {
			var x = Math.ceil(
				uploadsunrecognized[id]?.count / Number.parseInt(tableRows)
			);
			setTotalPages(x);
			if (totalPages > 1 && page >= Number.parseInt(x)) {
				setPage(Number.parseInt(x - 1));
			}
		}
	}, [uploadsunrecognized[id]]);

	useEffect(() => {
		if (uploadsunrecognized[id]?.count && !totalTransactions) {
			setTotalTransactions(uploadsunrecognized[id]?.count);
		}
	}, [uploadsunrecognized[id]]);

	useEffect(() => {
		if (clearSearchQuery) {
			setClearSearchQuery(false);
		}
	}, [clearSearchQuery]);

	return (
		<>
			<UnrecognisedTransactionsFilters
				selectedIds={selectedIds}
				setSearchQuery={setSearchQuery}
				selectedTransactions={selectedTransactions}
				page={page}
				setSelectedIds={setSelectedIds}
				fetchTransactions={fetchTransactions}
				TABLE_ROW={defaults.UPLOADS_TABLE_ROW}
				refreshReduxState={refreshReduxState}
				TABLE_ROW={defaults.UNRECOGNISED_TABLE_ROW}
				searchQuery={searchQuery}
				handleSearchRequests={handleSearchRequests}
				cancelToken={cancelToken}
				refreshAllPages={refreshAllPages}
				clearSearchQuery={clearSearchQuery}
				isUploads={true}
				id={id}
				clearAllPagesCache={clearAllPagesCache}
				tableRows={tableRows}
			/>
			<div className="transaction__table__details">
				<div className="table__info__text__left">
					<div>Showing</div>
					<div className="bold-600 mr-1 ml-1">
						{searchQuery.length > 0
							? searchResultCount || 0
							: uploadsunrecognized[id]?.count}
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
						: { padding: "0px 40px" }
				}
				key={pagination}
			>
				{(
					searchQuery
						? uploadsunrecognized.searchData?.loading
						: uploadsunrecognized[id]?.loading
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
				) : emptyState ? (
					<Table
						columns={columns}
						data={[]}
						options={options}
						onTableChange={onTableChange ? onTableChange : () => {}}
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
				) : (
					<Table
						columns={columns}
						remote={true}
						options={options}
						data={
							searchQuery
								? uploadsunrecognized.searchData?.data
								: uploadsunrecognized[id]?.data[pagination]
						}
						hover
						keyField={
							searchQuery
								? "transaction_id"
								: "transaction_upload_id"
						}
						onTableChange={onTableChange}
						selectRow={selectRow}
						rowStyle={rowStyle}
					/>
				)}
			</div>
		</>
	);
}
