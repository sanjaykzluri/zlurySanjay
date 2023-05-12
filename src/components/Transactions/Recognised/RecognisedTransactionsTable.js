import { push } from "connected-react-router";
import React, { useRef, useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";
import {
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../common/infiniteTableUtil";
import { ACTION_TYPE } from "../../Users/Applications/Modals/FiltersRenderer/redux";
import { debounce, isEmpty } from "../../../utils/common";
import {
	getRecognisedTransactionsV2,
	searchRecognisedTransactionsV2,
	setPMTransBulk,
} from "../../../services/api/transactions";
import { defaults, v2EntitiesTransactions } from "../../../constants";
import { checkSpecialCharacters } from "../../../services/api/search";
import { client } from "../../../utils/client";
import { TriggerIssue } from "../../../utils/sentry";
import AppTableComponent from "../../../common/AppTableComponent";
import { kFormatter } from "../../../constants/currency";
import "./RecognisedTable.scss";
import master from "../../../assets/transactions/mastercard.svg";
import visa from "../../../assets/transactions/visa.svg";
import bank from "../../../assets/transactions/bank.svg";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import card from "../../../assets/transactions/card.svg";
import Drowdown, { getImageForPaymentMethodDropdown } from "./Dropdown";
import "../../../App.css";
import "./Recognised.css";
import { EmptySearch } from "../../../common/EmptySearch";
import { Empty } from "./Empty";
import Amex from "assets/transactions/Amex.svg";
import RoleContext from "../../../services/roleContext/roleContext";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../../common/restrictions";
import { ErrorComponent } from "../../../common/ErrorComponnet";
import OldInfiniteTable from "../../../common/oldInfiniteTable";
import { RecognisedFilter } from "./RecognisedTransactionsFilter";
import BulkChangePaymentMethod from "../../../modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";

export default function RecognisedTable(props) {
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
			const response = await getRecognisedTransactionsV2(
				reqBody,
				pageNo,
				defaults.RECOGNISED_TABLE_ROW
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
			searchRecognisedTransactionsV2(
				reqBody,
				defaults.RECOGNISED_TABLE_ROW,
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
							currentPageName: "Recognised",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue(
							"Error in searching recognised transactions",
							error
						);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

	const columnsMapper = {
		application: {
			dataField: "app_name",
			text: "Applications",
			sortKey: "app_name",
			// eslint-disable-next-line react/display-name
			formatter: (cell, dataField) => (
				<AppTableComponent
					app_name={dataField?.app_name}
					app_logo={dataField?.app_logo}
					app_auth_status={dataField?.app_state}
					app_id={dataField?.org_application_id}
					logo_height="auto"
					logo_width={28}
				/>
			),
		},
		transaction_description: {
			dataField: "transaction_description",
			text: "Transaction Description",
			sortKey: "transaction_description",
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
		transaction_date: {
			dataField: "transaction_date",
			text: "Transaction Date",
			sortKey: "transaction_date",
			formatter: dateFormatter,
		},
		actual_amount: {
			dataField: "actual_amount",
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
			<RecognisedFilter
				checked={checked}
				data={data}
				setChecked={setChecked}
				selectedTransactions={selectedData}
				setSelectedTransactions={setSelectedData}
				searchQuery={searchQuery}
				setSearchQuery={debounce(setSearchQuery, 200)}
				metaData={metaData}
				columnsMapper={columnsMapper}
				usedColumns={metaData?.columns}
				handleRefresh={handleRefresh}
				isLoadingData={isLoadingData}
				transactionType={v2EntitiesTransactions.recognized}
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
						<Empty refresh={handleRefresh} />
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

export function dateFormatter(row, cell) {
	if (cell) {
		let dateStringArr = new Date(cell.transaction_date || cell.date)
			.toUTCString()
			.split(" ");
		let date =
			dateStringArr[1] + " " + dateStringArr[2] + " " + dateStringArr[3];
		return <>{date}</>;
	}
	return <>-</>;
}
function getReturnTo() {
	return window.location.pathname.split("/")[1];
}
export function sourceFormatter(row, cell) {
	return (
		<>
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
						<div className="truncate_10vw">
							{cell.source_type === "uploads" ? (
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
							) : (
								cell.source_name
							)}
						</div>
					</OverlayTrigger>
				) : (
					<span>-</span>
				)}
			</>
		</>
	);
}

export function PaymentFormatter(row, cell, rowIndex, formatExtraData) {
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
			: type === "other" && paymentMethod.payment_method_logo_url !== ""
			? paymentMethod.payment_method_logo_url
			: otherpayment;
	return image;
}
