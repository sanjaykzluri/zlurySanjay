import { push } from "connected-react-router";
import React, { useRef, useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../common/infiniteTableUtil";
import { ACTION_TYPE } from "../../Users/Applications/Modals/FiltersRenderer/redux";
import { debounce, isEmpty } from "../../../utils/common";
import {
	getArchivedUploadsV2,
	searchArchivedUploadsV2,
	setPMTransBulk,
} from "../../../services/api/transactions";
import { defaults } from "../../../constants";
import { checkSpecialCharacters } from "../../../services/api/search";
import { client } from "../../../utils/client";
import { TriggerIssue } from "../../../utils/sentry";
import { kFormatter } from "../../../constants/currency";
import "../../../App.css";
import { EmptySearch } from "../../../common/EmptySearch";
import { Empty } from "./Empty";
import RoleContext from "../../../services/roleContext/roleContext";
import { isBasicSubscriptionSelector } from "../../../common/restrictions";
import { ErrorComponent } from "../../../common/ErrorComponnet";
import OldInfiniteTable from "../../../common/oldInfiniteTable";
import {
	dateFormatter,
	sourceFormatter,
} from "../../Transactions/Recognised/RecognisedTransactionsTable";
import { ArchivedTransactionsFilters } from "../../Transactions/Archived/ArchivedTransactionsFilters";
import BulkChangePaymentMethod from "../../../modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";

export default function ArchivedUploadsTable(props) {
	const { isViewer } = useContext(RoleContext);
	const { application } = { props };
	const history = useHistory();
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);

	const transactionUploadId = window.location.pathname.split("/")[3];
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
			const response = await getArchivedUploadsV2(
				reqBody,
				pageNo,
				defaults.ARCHIVED_TABLE_ROW,
				transactionUploadId
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
			// let searchReqParams = {
			// 	is_search: true,
			// 	search_query: searchQuery,
			// };
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"transaction_description",
				"Transaction Description"
			);
			reqBody.filter_by = [searchObj];
			searchArchivedUploadsV2(
				reqBody,
				defaults.ARCHIVED_TABLE_ROW,
				transactionUploadId,
				cancelToken.current
				// searchReqParams
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
						"Search Archived Uploads Results Displayed",
						{
							searchQuery: searchQuery,
							currentCategory: "Transactions",
							currentPageName: "Archived Uploads",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue(
							"Error in Archived uploads transactions",
							error
						);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

	const columnsMapper = {
		transaction_description: {
			dataField: "transaction_description",
			text: "Transaction Description",
			sortKey: "transaction_description",
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
		transaction_date: {
			dataField: "transaction_date",
			text: "Transaction Date",
			sortKey: "transaction_date",
			formatter: dateFormatter,
		},
		actual_amount: {
			dataField: "transaction_amount",
			text: "Amount",
			sortKey: "actual_amount",
			formatter: (cell, dataField) => {
				return kFormatter(dataField.actual_amount);
			},
		},
		source: {
			dataField: "transaction_source",
			text: "Source",
			formatter: sourceFormatter,
		},
		payment_method: {
			dataField: "transaction_payment_method",
			text: "Payment Method",
			// eslint-disable-next-line react/display-name
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

	return (
		<div className="d-flex flex-column">
			<ArchivedTransactionsFilters
				isTransactionPage={true}
				setSearchQuery={setSearchQuery}
				selectedIds={checked}
				// selectedTransactions={selectedTransactions}
				setSelectedIds={setChecked}
				// handleSearchRequests={handleSearchRequests}
				searchQuery={searchQuery}
				refreshReduxState={handleRefresh}
				refreshAllPages={handleRefresh}
				checked={checked}
				setChecked={setChecked}
				searchQuery={searchQuery}
				setSearchQuery={debounce(setSearchQuery, 200)}
				metaData={metaData}
				columnsMapper={columnsMapper}
				usedColumns={metaData?.columns}
				handleRefresh={handleRefresh}
				isLoadingData={isLoadingData}
				transactionType="uploads_archived"
				hideExportButton={true}
			/>
			<OldInfiniteTable
				checked={checked}
				setChecked={setChecked}
				data={data}
				metaData={metaData}
				handleLoadMore={handleLoadMore}
				columnsMapper={columnsMapper}
				keyField="_id"
				emptyState={
					searchQuery ? (
						<EmptySearch
							searchQuery={searchQuery}
							metaData={metaData}
							onReset={() => {
								setSearchQuery();
								setReqBody({ ...defaultReqBody });
								handleRefresh();
							}}
						/>
					) : showErrorModal ? (
						<ErrorComponent />
					) : (
						<Empty />
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
