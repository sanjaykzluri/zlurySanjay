import { push } from "connected-react-router";
import React, { useRef, useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import {
	OverlayTrigger,
	Tooltip as BootstrapTooltip,
	Tooltip,
} from "react-bootstrap";
import {
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../common/infiniteTableUtil";
import { ACTION_TYPE } from "../../Users/Applications/Modals/FiltersRenderer/redux";
import { debounce, isEmpty } from "../../../utils/common";
import {
	getUnRecognisedTransactionsV2,
	searchUnrecognisedTransactionsV2,
	setPMTransBulk,
} from "../../../services/api/transactions";
import { defaults, v2EntitiesTransactions } from "../../../constants";
import { checkSpecialCharacters } from "../../../services/api/search";
import { client } from "../../../utils/client";
import { TriggerIssue } from "../../../utils/sentry";
import { kFormatter } from "../../../constants/currency";
import "../../../App.css";
import { EmptySearch } from "../../../common/EmptySearch";
import { ENTITIES } from "../../../constants";
import RoleContext from "../../../services/roleContext/roleContext";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../../common/restrictions";
import { ErrorComponent } from "../../../common/ErrorComponnet";
import OldInfiniteTable from "../../../common/oldInfiniteTable";
import {
	dateFormatter,
	getImageForPaymentMethodTable,
} from "../Recognised/RecognisedTransactionsTable";
import { fetchUnrecognisedTransactions } from "../../../actions/transactions-action";
import { UnrecognisedTransactionsFilters } from "./UnrecognisedTransactionsFilters";
import WorkFlowModal from "./WorkflowModal";
import BulkChangePaymentMethod from "../../../modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import { Empty } from "./Empty";

export default function UnRecognisedTable(props) {
	const { isViewer } = useContext(RoleContext);
	const { application } = { props };
	const history = useHistory();
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);

	const id = window.location.pathname.split("/")[2];
	const cancelToken = useRef();
	const [checked, setChecked] = useState([]);
	const [data, setData] = useState([]);
	const [metaData, setMetaData] = useState();
	const [searchQuery, setSearchQuery] = useState();
	const [hasMoreData, setHasMoreData] = useState(true);
	const [refreshTable, setRefreshTable] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [shouldConcat, setShouldConcat] = useState(false);

	const dispatch = useDispatch();
	const query = useSelector((state) => state.router.location.query);
	const router = useSelector((state) => state.router);
	const { hash } = router.location;
	const [showErrorModal, setShowErrorModal] = useState(false);
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);
	const [activeId, setactiveId] = useState();
	const [clearSearchQuery, setClearSearchQuery] = useState(false);
	const [selectedData, setSelectedData] = useState([]);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(query, reqBody);
			} catch {
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
			}
			setReqBody({ ...reqObj });
		} else if (!query.metaData) {
			dispatch({ type: ACTION_TYPE.RESET_FILTERS });
			setReqBody({ ...defaultReqBody });
		}
		handleRefresh();
	}, [query]);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(query, reqBody);
			} catch {
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
			}
		}
		!isLoadingData && loadData(reqObj);
	}, [pageNo, refreshTable]);

	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel &&
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			setIsLoadingData(false);
		}
		if (searchQuery) {
			fetchDataFn();
			reqBody.filter_by = [];
			query.metaData &&
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
		} else if (searchQuery === "") {
			reqBody.filter_by = [];
			handleRefresh();
			setReqBody(reqBody);
			reqBody.filter_by = [];
			query.metaData &&
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
		}
	}, [searchQuery]);

	function handleLoadMore() {
		setShouldConcat(true);
		if (isLoadingData) return;
		setShouldConcat(true);
		setPageNo((pageNo) => {
			return pageNo + 1;
		});
	}

	function handleRefresh() {
		setData([]);
		setPageNo(0);
		setMetaData();
		setRefreshTable(!refreshTable);
		setHasMoreData(true);
		setShowErrorModal(false);
	}

	async function loadData(reqBody) {
		if (isEmpty(reqBody.filter_by) && searchQuery) {
			const searchObj = getSearchReqObj(
				searchQuery,
				"transaction_description",
				"Transaction Description"
			);
			reqBody.filter_by = [searchObj];
		}

		setIsLoadingData(true);
		try {
			const response = await getUnRecognisedTransactionsV2(
				reqBody,
				pageNo,
				defaults.UNRECOGNISED_TABLE_ROW
			);
			const totalLoadedRecords = data.length + response.data.length;
			if (totalLoadedRecords === response.meta.total) {
				setHasMoreData(false);
			} else {
				!hasMoreData && setHasMoreData(true);
			}
			let newData = shouldConcat
				? [...data, ...response.data]
				: response.data;
			setIsLoadingData(false);
			setData(newData);
			setMetaData(response.meta);
		} catch (error) {
			setIsLoadingData(false);
			setHasMoreData(false);
			setMetaData(reqBody);
			setShowErrorModal(true);
		}
	}
	const fetchDataFn = () => {
		setData([]);
		setMetaData();
		if (checkSpecialCharacters(searchQuery, true)) {
			setHasMoreData(false);
		} else {
			setIsLoadingData(true);
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"transaction_description",
				"Transaction Description"
			);
			reqBody.filter_by = [searchObj];
			searchUnrecognisedTransactionsV2(
				reqBody,
				defaults.UNRECOGNISED_TABLE_ROW,
				cancelToken.current
			)
				.then((response) => {
					if (response.data.length < defaults.MINIMUM_ROW) {
						setHasMoreData(false);
					}
					setReqBody(reqBody);
					setData(response.data);
					setMetaData(response.meta);
					setIsLoadingData(false);
					window.analytics.track(
						"Search Transactions Results Displayed",
						{
							searchQuery: searchQuery,
							currentCategory: "Transactions",
							currentPageName: "Unrecognised",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue(
							"Error in searching Unrecognised Transactions",
							error
						);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

	let columnsMapper = {
		transaction_description: {
			dataField: "transaction_description",
			sortKey: "transaction_description",
			text: "Transaction Description",
			formatter: (cell, row) => (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>{row.transaction_description}</Tooltip>}
				>
					<div className="truncate_name">
						{row.transaction_description}
					</div>
				</OverlayTrigger>
			),
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(row.transaction_id);
				},
			},
		},
		transaction_date: {
			dataField: "transaction_date",
			sortKey: "transaction_date",
			text: "Transaction Date",
			formatter: dateFormatter,
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(row.transaction_id);
				},
			},
		},
		actual_amount: {
			dataField: "transaction_amount",
			sortKey: "actual_amount",
			text: "Amount",
			formatter: (cell, dataField) => {
				return kFormatter(dataField.actual_amount);
			},
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(row.transaction_id);
				},
			},
		},
		source: {
			dataField: "transaction_source",
			text: "Source",
			events: {
				onMouseEnter: (e, column, columnIndex, row, rowIndex) => {
					setactiveId(row.transaction_id);
				},
			},
			formatter: sourceFormatter,
		},
		payment_method: {
			dataField: "transaction_payment_method",
			text: "Payment Method",
			formatter: (row, data) => (
				<div className="flex flex-row center">
					<BulkChangePaymentMethod
						entity_ids={[data?._id]}
						api_call={setPMTransBulk}
						refresh={handleRefresh}
						is_success={(res) => res && res.status === "success"}
						is_table_cell={true}
						popover_class="table-cell-change-payment-method"
						payment_method={{
							payment_method_id: data?.payment_method_id,
							payment_method_name: data?.payment_method_name,
							payment_method_type: data?.payment_method_type,
							payment_method_details_type:
								data?.payment_method_details_type,
							payment_method_logo_url:
								data?.payment_method_logo_url,
						}}
					/>
				</div>
			),
		},
		payment_method_details_number: {
			dataField: "payment_method_details_number",
			text: "Last Digits",
			sortKey: "payment_method_details_number",
			formatter: (cell, dataField) =>
				dataField.payment_method_details_number || "-",
		},
	};

	function Dropdownformatter(row, cell, rowIndex, formatExtraData) {
		const selectedData = formatExtraData.selectedData;
		const selectedId = formatExtraData.selectedId;
		const setSelectedIds = formatExtraData.setSelectedIds;
		const page = formatExtraData.page;
		const rows = formatExtraData.rows;
		const cancelToken = formatExtraData.ref;

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
					<WorkFlowModal
						id={cell._id}
						data={[cell]}
						cell={cell}
						setSelectedIds={setChecked}
						page={page}
						rows={rows}
						cancelToken={cancelToken}
						clearCache={handleRefresh}
					/>
				) : null}
			</div>
		);
	}

	if (!isViewer) {
		columnsMapper.assign_app = {
			dataField: "isActive",
			text: "",
			headerStyle: () => {
				return { width: "16%" };
			},
			formatter: Dropdownformatter,
			formatExtraData: {
				selectedId: activeId,
				selectedData: selectedData,
				setSelectedIds: setChecked,
				page: 1,
				rows: defaults.UNRECOGNISED_TABLE_ROW,
				ref: cancelToken,
				isBasicSubscription,
				entity: ENTITIES.ASSIGN_APPLICATION,
				handleRefresh: handleRefresh,
			},
		};
	}

	return (
		<div className="d-flex flex-column">
			<UnrecognisedTransactionsFilters
				checked={checked}
				setChecked={setChecked}
				searchQuery={searchQuery}
				setSearchQuery={debounce(setSearchQuery, 200)}
				metaData={metaData}
				columnsMapper={columnsMapper}
				usedColumns={metaData?.columns}
				handleRefresh={handleRefresh}
				isLoadingData={isLoadingData}
				isTransactionPage={true}
				selectedIds={checked}
				selectedTransactions={selectedData}
				setSelectedTransactions={setSelectedData}
				getDefaultImage={getImageForPaymentMethodTable}
				setSelectedIds={setChecked}
				fetchTransactions={fetchUnrecognisedTransactions}
				TABLE_ROW={defaults.UNRECOGNISED_TABLE_ROW}
				refreshAllPages={handleRefresh}
				clearSearchQuery={clearSearchQuery}
				transactionType={v2EntitiesTransactions.unrecognized}
			/>
			<OldInfiniteTable
				checked={checked}
				setChecked={setChecked}
				selectedData={selectedData}
				setSelectedData={setSelectedData}
				data={data}
				metaData={metaData}
				handleLoadMore={handleLoadMore}
				columnsMapper={columnsMapper}
				keyField="_id"
				emptyState={
					searchQuery ? (
						<EmptySearch searchQuery={searchQuery} />
					) : showErrorModal ? (
						<ErrorComponent />
					) : (
						<Empty minHeight={"50vh"} />
					)
				}
				searchQuery={searchQuery}
				isLoadingData={isLoadingData}
				hasMoreData={hasMoreData}
				allowFewSpecialCharacters={true}
			/>
		</div>
	);
}

function getReturnTo() {
	return window.location.pathname.split("/")[1];
}
function sourceFormatter(row, cell) {
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
