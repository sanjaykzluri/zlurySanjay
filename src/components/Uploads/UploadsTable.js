import { push } from "connected-react-router";
import React, { useRef, useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import moment from "moment";
import {
	OverlayTrigger,
	Tooltip as BootstrapTooltip,
	Tooltip,
} from "react-bootstrap";
import {
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../common/infiniteTableUtil";

import { debounce, isEmpty } from "../../utils/common";
import { defaults } from "../../constants";
import { checkSpecialCharacters } from "../../services/api/search";
import { client } from "../../utils/client";
import { TriggerIssue } from "../../utils/sentry";
import "../../App.css";
import "./Uploads.css";
import { EmptySearch } from "../../common/EmptySearch";
import RoleContext from "../../services/roleContext/roleContext";
import { isBasicSubscriptionSelector } from "../../common/restrictions";
import { ErrorComponent } from "../../common/ErrorComponnet";
import OldInfiniteTable from "../../common/oldInfiniteTable";
import {
	getUploadsV2,
	retryTransactionUploadCSV,
	searchUploadsV2,
} from "../../services/api/transactions";
import Deactivated from "./Deactivated.svg";
import cloudUpload from "./cloudUpload.svg";
import { Spinner } from "react-bootstrap";
import warning from "../Onboarding/warning.svg";
import { ACTION_TYPE } from "../Users/Applications/Modals/FiltersRenderer/redux";
import { Empty } from "./Empty";
import { UploadFilters } from "./UploadsFilters";
import { dateFormatter } from "../Transactions/Recognised/RecognisedTransactionsTable";
import OverlayTooltip from "UIComponents/OverlayToolTip";
import dayjs from "dayjs";
import { dateResetTimeZone } from "utils/DateUtility";
import { getValueFromLocalStorage } from "utils/localStorage";

export const UPLOAD_FILE_PROCESS_STATUS = {
	PENDING: "pending",
	VALIDATED: "validated",
	PROCESSING: "processing",
	COMPLETED: "completed",
	DEACTIVATED: "deactivated",
	ACTIVATED: "activated",
};

export default function UploadsTable(props) {
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
	const [hasMoreData, setHasMoreData] = useState(true);
	const [refreshTable, setRefreshTable] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [shouldConcat, setShouldConcat] = useState(false);

	const dispatch = useDispatch();
	const query = useSelector((state) => state.router.location.query);
	const [searchQuery, setSearchQuery] = useState(query?.searchQuery);
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
		!searchQuery && handleRefresh();
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
		setSelectedData([]);
		setChecked([]);
	}

	async function loadData(reqBody) {
		if (searchQuery?.length > 0) return fetchDataFn();
		if (isEmpty(reqBody.filter_by) && searchQuery) {
			const searchObj = getSearchReqObj(
				searchQuery,
				"name",
				"Transaction Name"
			);
			reqBody.filter_by = [searchObj];
		}

		setIsLoadingData(true);
		try {
			const response = await getUploadsV2(
				reqBody,
				pageNo,
				defaults.UPLOADS_TABLE_ROW
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
			let searchReqParams = {
				is_search: true,
				search_query: searchQuery,
			};
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"name",
				"Transaction Name"
			);
			reqBody.filter_by = [searchObj];
			searchUploadsV2(
				reqBody,
				defaults.UPLOADS_TABLE_ROW,
				cancelToken.current,
				searchReqParams
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
						"Search Contracts Results Displayed",
						{
							searchQuery: searchQuery,
							currentCategory: "Contracts",
							currentPageName: "Contracts",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue(
							"Error in searching license contracts",
							error
						);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

	function clickedOnUpload(id, name) {
		//Segment Implementation
		window.analytics.track("Clicked on Single Upload", {
			currentCategory: "Transactions",
			currentPageName: "Uploads",
			clickedUploadId: id,
			clickedUploadName: name,
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
		});
	}

	const columnsMapper = {
		name: {
			dataField: "name",
			text: "File Name",
			sortKey: "name",
			// eslint-disable-next-line react/display-name
			formatter: (row, data, rowindex) => (
				<Link
					to={{
						pathname: `/transactions/uploads/${data._id}`,
						hash: "#recognised",
						state: { name: row },
					}}
					className="custom__app__name__css"
					style={{ textDecoration: "none" }}
					onClick={() => clickedOnUpload(data._id, data.name)}
				>
					<div className="flex flex-row center">
						<div
							className="flex flex-row justify-content-center align-items-center"
							style={{ paddingRight: 6 }}
						>
							{data.upload_file_process_status ===
							"deactivated" ? (
								<img
									src={Deactivated}
									style={{ marginRight: "10px" }}
								/>
							) : data.upload_file_process_status ===
							  "activated" ? (
								<img
									src={cloudUpload}
									style={{ marginRight: "10px" }}
								/>
							) : !data.upload_file_status &&
							  data.upload_file_process_status ==
									UPLOAD_FILE_PROCESS_STATUS.COMPLETED ? (
								<div className="d-flex mr-1">
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>
												{typeof data?.upload_error ==
													"string" ||
												data?.upload_error?.length === 0
													? data?.upload_error.trimEnd()
															.length > 40
														? `${data?.upload_error
																.trimEnd()
																.substring(
																	0,
																	40
																)
																.trimEnd()}...`
														: data?.upload_error
													: "Please make sure the uploaded file is in right format."}
											</Tooltip>
										}
									>
										<img src={warning} alt="failed" />
									</OverlayTrigger>
								</div>
							) : null}

							<OverlayTrigger
								placement="top"
								overlay={<Tooltip>{row}</Tooltip>}
							>
								<div
									className="truncate_name"
									style={{
										color:
											data.upload_file_process_status !==
											"deactivated"
												? "#717171"
												: "#222222",
									}}
								>
									{row}
								</div>
							</OverlayTrigger>
						</div>
						{data.upload_file_process_status ===
						UPLOAD_FILE_PROCESS_STATUS.PROCESSING ? (
							<Spinner
								animation="border"
								variant="primary"
								className="mt-auto mb-auto"
								size="sm"
							/>
						) : null}
					</div>
				</Link>
			),
		},
		transaction_date: {
			dataField: "transaction_date",
			text: "Date of Upload",
			sortKey: "transaction_date",
			formatter: (row, data) => (
				<DateFormatter
					row={row}
					cell={data}
					handleRefresh={handleRefresh}
				></DateFormatter>
			),
		},
		entryCount: {
			dataField: "entryCount",
			text: "Entries",
			sortKey: "entryCount",
		},
		recognized_transaction_count: {
			dataField: "recognized_transaction_count",
			sortKey: "recognized_transaction_count",
			text: "Recognised",
		},
		unrecognized_transaction_count: {
			dataField: "unrecognized_transaction_count",
			sortKey: "unrecognized_transaction_count",
			text: "Unrecognised",
		},
	};

	return (
		<div className="d-flex flex-column">
			<UploadFilters
				checked={checked}
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
				transactionType="uploads"
			/>
			<OldInfiniteTable
				checked={checked}
				setChecked={setChecked}
				data={data}
				selectedData={selectedData}
				setSelectedData={setSelectedData}
				metaData={metaData}
				onSort={() => setSearchQuery()}
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

function DateFormatter({ row, cell, handleRefresh }) {
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);
	let dateStringArr = new Date(cell.transaction_date || cell.date)
		.toUTCString()
		.split(" ");
	let date =
		dateStringArr[1] + " " + dateStringArr[2] + " " + dateStringArr[3];
	if (cell) {
		if (success) {
			return <>{date}</>;
		} else if (
			Object.keys(cell).includes("isSuccessful") &&
			!cell.isSuccessful &&
			!cell.is_retriable
		) {
			return (
				<>
					<div className="d-flex ">
						{cell.error ? (
							<OverlayTooltip
								placement="bottom"
								isStickyTooltip
								overlay={
									<BootstrapTooltip bsPrefix="uploads-CSV-error-tooltip">
										<div className="uploads-CSV-error-tooltip-content font-12 ">
											<img
												src={warning}
												alt="failed"
												className="mr-2 d-flex mb-auto"
											/>
											{cell.error}
										</div>
									</BootstrapTooltip>
								}
							>
								<div className="red font-13">Invalid data</div>
							</OverlayTooltip>
						) : (
							<div className="red font-13 text-capitalize">
								{cell.upload_file_process_status}
							</div>
						)}
					</div>
				</>
			);
		} else if (
			!cell.isSuccessful &&
			cell.is_retriable &&
			cell.upload_file_process_status ==
				UPLOAD_FILE_PROCESS_STATUS.COMPLETED
		) {
			return (
				<>
					<div className="d-flex align-items-center">
						{cell.error ? (
							<OverlayTooltip
								placement="bottom"
								isStickyTooltip
								overlay={
									<BootstrapTooltip bsPrefix="uploads-CSV-error-tooltip">
										<div className="uploads-CSV-error-tooltip-content font-12">
											<img
												src={warning}
												alt="failed"
												className="mr-2 d-flex mb-auto"
											/>
											{cell.error}
										</div>
									</BootstrapTooltip>
								}
							>
								<div className="red font-13">
									Processing Failed
								</div>
							</OverlayTooltip>
						) : (
							<div className="red font-13">Processing Failed</div>
						)}

						{submitting ? (
							<Spinner
								animation="border"
								role="status"
								variant="primary"
								size="sm"
								className="ml-2"
								style={{ borderWidth: 2 }}
							>
								<span className="sr-only">Loading...</span>
							</Spinner>
						) : (
							<div
								className="primary-color font-13 cursor-pointer ml-2"
								onClick={() => {
									setSubmitting(true);
									retryTransactionUploadCSV(cell._id)
										.then((res) => {
											setSubmitting(false);
											handleRefresh();
										})
										.catch((error) => {
											setSubmitting(false);
											TriggerIssue(
												"Error in re-uploading CSV",
												error
											);
										});
								}}
							>
								{" "}
								Retry
							</div>
						)}
					</div>
				</>
			);
		} else {
			return <>{date}</>;
		}
	}
	return <>-</>;
}
