import React, {
	useEffect,
	useState,
	useRef,
	useCallback,
	useContext,
} from "react";
import { Table } from "../../common";
import "../../App.css";
import "./Uploads.css";
import {
	fetchUploads,
	checkAndFetchUploads,
} from "../../actions/transactions-action";
import search from "./search.svg";
import rightarrow from "../Transactions/Recognised/rightarrow.svg";
import leftarrow from "../Transactions/Recognised/leftarrow.svg";
import CSV from "./CSV.svg";
import { useDispatch, useSelector } from "react-redux";
import ContentLoader from "react-content-loader";
import Add from "./add.svg";
import { UploadModal } from "./UploadModal";
import { Link } from "react-router-dom";
import { Empty } from "./Empty";
import filterbutton from "../Users/filterbutton.svg";
import FilterUsers from "../Users/FilterUsers";
import columnbutton from "../../assets/columnbutton.svg";
import { DeactivateModal } from "./DeactivateModal";
import { ActivateModal } from "./ActivateModal";
import Deactivated from "./Deactivated.svg";
import cloudUpload from "./cloudUpload.svg";
import {
	getUploads,
	deactivateUpload,
	activateUpload,
} from "../../services/api/transactions";
import { capitalizeFirstLetter, debounce } from "../../utils/common";
import { useDidUpdateEffect } from "../../utils/componentUpdateHook";
import {
	checkSpecialCharacters,
	searchAllUploadedTransactions,
} from "../../services/api/search";
import { client } from "../../utils/client";
import { transactionConstants } from "../../constants/transactions";
import { defaults, ENTITIES } from "../../constants";
import { EmptySearch } from "../../common/EmptySearch";
import { InfiniteTable } from "../Departments/InfiniteTable";
import { Spinner } from "react-bootstrap";
import refresh_icon from "../../assets/icons/refresh.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import refreshBlue from "./refreshBlue.svg";
import { upload } from "../../UIComponents/Upload/Upload.js";
import warning from "../Onboarding/warning.svg";
import RoleContext from "../../services/roleContext/roleContext";
import Strips from "../../common/restrictions/Strips";
import UploadTransactionsSidePanel from "./UploadTransactionsSidePanel";
import close from "../../assets/close.svg";
import { TriggerIssue } from "../../utils/sentry";
import { getValueFromLocalStorage } from "utils/localStorage";

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

const showTooltipLength = 20;

const UPLOAD_FILE_PROCESS_STATUS = {
	PENDING: "pending",
	VALIDATED: "validated",
	PROCESSING: "processing",
	COMPLETED: "completed",
	DEACTIVATED: "deactivated",
	ACTIVATED: "acitvated",
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
const columns = [
	{
		dataField: "upload_file_name",
		text: "File Name",
		// eslint-disable-next-line react/display-name
		formatter: (row, data, rowindex) => (
			<Link
				to={{
					pathname: `/transactions/uploads/${data.upload_id}`,
					hash: "#recognised",
					state: { name: row },
				}}
				className="custom__app__name__css"
				style={{ textDecoration: "none" }}
				onClick={() =>
					clickedOnUpload(data.upload_id, data.upload_file_name)
				}
			>
				<div className="flex flex-row center">
					<div
						className="flex flex-row justify-content-center align-items-center"
						style={{ paddingRight: 6 }}
					>
						{data.upload_file_process_status === "deactivated" ? (
							<img
								src={Deactivated}
								style={{ marginRight: "10px" }}
							/>
						) : data.upload_file_process_status === "activated" ? (
							<img
								src={cloudUpload}
								style={{ marginRight: "10px" }}
							/>
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
					{data.upload_file_status &&
					data.upload_file_process_status ===
						UPLOAD_FILE_PROCESS_STATUS.PROCESSING ? (
						<Spinner
							animation="border"
							variant="primary"
							className="mt-auto mb-auto"
							size="sm"
						/>
					) : !data.upload_file_status &&
					  data.upload_file_process_status ==
							UPLOAD_FILE_PROCESS_STATUS.COMPLETED ? (
						<div className="d-flex">
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
														.substring(0, 40)
														.trimEnd()}...`
												: data?.upload_error
											: "Please make sure the uploaded file is in right format."}
									</Tooltip>
								}
							>
								<img src={warning} alt="failed" />
							</OverlayTrigger>
							{/* <div className="customaBadge ml-2 cursor-pointer">
									<img className="m-auto" src={refreshBlue}></img>
									<span className="pl-1 m-auto pr-1">Retry</span>
								</div> */}
						</div>
					) : null}
				</div>
			</Link>
		),
	},
	{
		dataField: "upload_date_time",
		text: "Date of Upload",
		formatter: dateFormatter,
	},
	{
		dataField: "upload_entries_count",
		text: "Entries",
	},
	{
		dataField: "upload_transactions_recognized_count",
		text: "Recognised",
	},
	{
		dataField: "upload_transactions_unrecognized_count",
		text: "Unrecognised",
	},
];

export function Uploads() {
	const dispatch = useDispatch();
	const initialPage = 0;
	const [page, setPage] = useState(initialPage);
	const initialState = {
		addCardShow: false,
		checkBoxTicked: false,
		selectedIds: {},
		loading: true,
		deactivated: [],
		setshowHideFilter: false,
		showDeactivateModal: false,
		deactivatedIds: [],
		file: [],
		fileuploaded: false,
		data: [],
		count: 0,
		rows: 20,
		obj: {},
		status: [],
		refresh: false,
	};
	const [globalState, setGlobalState] = useState(initialState);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const { uploads } = useSelector((state) => state.transactions);
	const cancelToken = useRef();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const { isViewer } = useContext(RoleContext);
	const [tableRows, setTableRows] = useState(20);
	var pagination = "page_" + page.toString() + "_" + tableRows.toString();
	const [totalPages, setTotalPages] = useState();
	const [totalTransactions, setTotalTransactions] = useState();
	const [searchResultCount, setSearchResultCount] = useState(0);
	const [deactivating, setDeactivating] = useState(false);
	const [deactivateComplete, setDeactivateComplete] = useState(false);
	const [deactivateFailed, setDeactivateFailed] = useState(false);
	const [activating, setActivating] = useState(false);
	const [activateComplete, setActivateComplete] = useState(false);
	const [activateFailed, setActivateFailed] = useState(false);

	useEffect(() => {
		cancelToken.current = client.CancelToken.source();
	}, []);

	useEffect(() => {
		//Segment Implementation
		if (globalState.addCardShow) {
			window.analytics.page(
				"Transactions",
				"Uploads; Upload-Transaction-File",
				{
					page: page,
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [globalState.addCardShow]);

	const handleSearchQuery = (event) => {
		setSearchTerm(event.target.value?.trimStart());
		setPage(initialPage);
		let searchQuery = event.target.value.trim();
		if (searchQuery.length == 1) {
			event.persist();
		} else {
			setSearchQuery(searchQuery);
		}
	};

	// function searchInProgress() {
	// 	return (dispatch) =>
	// 		dispatch({
	// 			type: transactionConstants.UPLOADS_REQUESTED,
	// 		});
	// }

	// function searchSuccessful(searchData) {
	// 	return (dispatch) =>
	// 		dispatch({
	// 			type: transactionConstants.SEARCH_UPLOADS,
	// 			payload: {
	// 				data: searchData.uploads,
	// 				count: searchData.total_count,
	// 			},
	// 		});
	// }

	const handleSearchRequests = useCallback(
		debounce((searchQuery, page, rows) => {
			if (cancelToken.current?.token) {
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			}
			// dispatch(searchInProgress());
			if (checkSpecialCharacters(searchQuery)) {
				setGlobalState({
					...globalState,
					data: [],
					loading: false,
					count: 0,
					selectedIds: [],
				});
				return;
			}
			cancelToken.current = client.CancelToken.source();
			searchAllUploadedTransactions(
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
						setGlobalState({
							...globalState,
							data: res.data.results.uploads,
							loading: false,
							count: res.data.results.total_count,
							selectedIds: [],
						});
						setSearchResultCount(res.data.results.total_count);
					} else {
						setGlobalState({
							...globalState,
							loading: false,
						});
						console.error(
							"server did not respond with key as result in response, found",
							res
						);
					}
				})
				.catch((err) =>
					console.error("Error fetching uploads list", err)
				);
		}, 300),
		[]
	);

	useDidUpdateEffect(() => {
		cancelToken.current = client.CancelToken.source();
		if (cancelToken.current?.token) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery && searchQuery.length > 0) {
			if (checkSpecialCharacters(searchQuery)) {
				dispatch({
					type: transactionConstants.SEARCH_UPLOADS,
					payload: {
						data: [],
					},
				});
			} else {
				setGlobalState({
					...globalState,
					loading: true,
				});
				handleSearchRequests(
					searchQuery,
					page,
					Number.parseInt(tableRows)
				);
			}
		} else {
			setGlobalState({
				...globalState,
				loading: true,
				selectedIds: {},
			});
			dispatch(
				checkAndFetchUploads(
					page,
					Number.parseInt(tableRows),
					true,
					cancelToken
				)
			).then((res) => {
				setGlobalState({
					...globalState,
					data: uploads.data,
					loading: false,
					count: uploads.count,
					rows: uploads.rows,
				});
				setPage(initialPage);
			});
		}
	}, [searchQuery]);

	useEffect(() => {
		setGlobalState({
			...globalState,
			data: uploads.data,
			loading: uploads.loading,
			count: uploads.count,
			rows: uploads.rows,
			selectedIds: {},
		});
	}, [uploads]);

	useEffect(() => {
		if (cancelToken.current?.token) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		cancelToken.current = client.CancelToken.source();
		if (searchQuery && searchQuery.length > 0) {
			setGlobalState({
				...globalState,
				loading: true,
			});
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			if (!globalState?.data[pagination]?.length > 0) {
				setGlobalState({
					...globalState,
					loading: true,
				});
				dispatch(
					checkAndFetchUploads(
						page,
						Number.parseInt(tableRows),
						false,
						cancelToken
					)
				).then((res) => {
					setGlobalState({
						...globalState,
						data: uploads.data,
						loading: false,
						count: uploads.count,
					});
				});
			}
			//Segment Implementation
			window.analytics.page("Transactions", "Uploads", {
				page: page,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [page]);

	const onTableChange = (type, { page }) => {
		setPage(page);
		setGlobalState({
			...globalState,
			selectedIds: [],
		});
	};
	const pageButtonRenderer = ({ page, active, onPageChange }) => {
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
		totalSize: globalState.count,
		pageStartIndex: 0,
		sizePerPage: Number.parseInt(tableRows),
	};
	let addCardClose = () =>
		setGlobalState({ ...globalState, addCardShow: false });

	function findStatus(row) {
		if (row.upload_file_status) {
			switch (row.upload_file_process_status) {
				case UPLOAD_FILE_PROCESS_STATUS.COMPLETED:
					return UPLOAD_FILE_PROCESS_STATUS.COMPLETED;
				case UPLOAD_FILE_PROCESS_STATUS.DEACTIVATED:
					return UPLOAD_FILE_PROCESS_STATUS.DEACTIVATED;
				default:
					return null;
			}
		} else {
			return null;
		}
	}

	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
		onSelect: (row, isSelect, rowIndex, e) => {
			if (isSelect) {
				if (!globalState.selectedIds[row.upload_id]) {
					globalState.selectedIds[row.upload_id] = findStatus(row);
					setGlobalState({
						...globalState,
					});
				}
			} else {
				delete globalState.selectedIds[row.upload_id];
				setGlobalState({
					...globalState,
				});
			}
		},
		onSelectAll: (isSelect, rows, e) => {
			if (isSelect) {
				setGlobalState({
					...globalState,
					selectedIds: rows.map((row) => ({
						[row.upload_id]: findStatus(row),
					})),
				});
			} else {
				setGlobalState({
					...globalState,
					selectedIds: {},
				});
			}
		},
	};
	const rowStyle = {
		height: "48px",
	};
	let addHideFilterClose = () =>
		setGlobalState({ ...globalState, setshowHideFilter: false });

	const emptyState = !globalState.loading && globalState.data.length == 0;
	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Transactions",
			currentPageName: "Uploads",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const commonSegmentTrack2 = (message, arr) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Transactions",
			currentPageName: "Uploads",
			selectedIds: arr,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const refreshReduxState = () => {
		dispatch({
			type: transactionConstants.DELETE_UPLOADS_CACHE,
			payload: {
				page: pagination,
			},
		});
		setGlobalState({
			...globalState,
			selectedIds: {},
			loading: true,
			data: [],
		});
		if (searchQuery.length > 0) {
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			dispatch(
				fetchUploads(
					page,
					Number.parseInt(tableRows),
					false,
					cancelToken
				)
			);
		}
		commonSegmentTrack("Refresh Button Clicked");
	};

	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Uploads");
	};
	const clickedOnDeactivateUpload = () => {
		setGlobalState({
			...globalState,
			showDeactivateModal: true,
		});
		commonSegmentTrack2(
			"Clicked on Deactivate Upload Button",
			Object.keys(globalState.selectedIds)
		);
	};
	const clickedOnActivateUpload = () => {
		setGlobalState({
			...globalState,
			showDeactivateModal: true,
		});
		commonSegmentTrack2(
			"Clicked on Activate Upload Button",
			Object.keys(globalState.selectedIds)
		);
	};
	const clickedOnAddUpload = () => {
		setGlobalState({
			...globalState,
			addCardShow: true,
		});
		commonSegmentTrack("Clicked on Add Upload Button");
	};

	useEffect(() => {
		var x = uploads?.count / Number.parseInt(tableRows);
		setTotalPages(Number.parseInt(Math.ceil(x)));
		if (totalPages > 1 && page >= Number.parseInt(Math.ceil(x))) {
			setPage(Number.parseInt(Math.ceil(x)) - 1);
		}
	}, [tableRows]);

	useDidUpdateEffect(() => {
		if (searchQuery && searchQuery.length !== 1) {
			handleSearchRequests(searchQuery, page, Number.parseInt(tableRows));
		} else {
			if (!globalState?.data[pagination]?.length > 0) {
				dispatch(
					checkAndFetchUploads(
						page,
						Number.parseInt(tableRows),
						true,
						cancelToken
					)
				);
			}
			setSearchResultCount(0);
		}
	}, [tableRows, searchQuery]);

	useEffect(() => {
		if (uploads?.count && !totalPages) {
			setTotalPages(
				Math.ceil(uploads?.count / Number.parseInt(tableRows))
			);
		}
	}, [uploads]);

	useEffect(() => {
		if (uploads?.count && !totalTransactions) {
			setTotalTransactions(uploads?.count);
		}
	}, [uploads]);

	return (
		<>
			<div className="top__Uploads">
				<div className="Uploads__left">
					<button
						hidden // Hiding this for now as filtering is not yet supported
						className="filterbutton"
						onClick={() =>
							setGlobalState({
								...globalState,
								setshowHideFilter: true,
							})
						}
						style={{ marginLeft: "40px" }}
					>
						<img src={filterbutton}></img>
					</button>
					{globalState.setshowHideFilter ? (
						<FilterUsers
							show={globalState.setshowHideFilter}
							onHide={addHideFilterClose}
						/>
					) : null}
					<button className="columnbutton" style={{ marginLeft: 40 }}>
						<img src={columnbutton}></img>
					</button>
				</div>
				<div className="Uploads__right">
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
					<div>
						{Object.keys(globalState.selectedIds).length === 1 ? (
							Object.values(globalState.selectedIds)[0] ===
							UPLOAD_FILE_PROCESS_STATUS.COMPLETED ? (
								<button
									id="checkbutton"
									onClick={clickedOnDeactivateUpload}
								>
									Deactivate
								</button>
							) : Object.values(globalState.selectedIds)[0] ===
							  UPLOAD_FILE_PROCESS_STATUS.DEACTIVATED ? (
								<button
									id="checkbutton"
									onClick={clickedOnActivateUpload}
								>
									Activate
								</button>
							) : null
						) : null}
						{Object.keys(globalState.selectedIds).length === 1 &&
						Object.values(globalState.selectedIds)[0] ===
							UPLOAD_FILE_PROCESS_STATUS.COMPLETED ? (
							<DeactivateModal
								show={globalState.showDeactivateModal}
								handleClose={() => {
									setGlobalState({
										...globalState,
										showDeactivateModal: false,
									});
									setDeactivating(false);
									setDeactivateComplete(false);
									setDeactivateFailed(false);
								}}
								deactivating={deactivating}
								deactivateComplete={deactivateComplete}
								deactivateFailed={deactivateFailed}
								onDeactivateClick={() => {
									setDeactivating(true);
									deactivateUpload(
										Object.keys(globalState.selectedIds)[0]
									)
										.then((res) => {
											if (res.status === "deactivated") {
												setDeactivating(false);
												setDeactivateComplete(true);
											} else {
												setDeactivating(false);
												setDeactivateFailed(true);
											}
										})
										.catch((err) => {
											TriggerIssue(
												"Error in deactivating the csv file",
												err
											);
											setDeactivating(false);
											setDeactivateFailed(true);
										});
								}}
								onSuccess={() => {
									refreshReduxState();
								}}
							/>
						) : (
							<ActivateModal
								show={globalState.showDeactivateModal}
								handleClose={() => {
									setGlobalState({
										...globalState,
										showDeactivateModal: false,
									});
									setActivating(false);
									setActivateComplete(false);
									setActivateFailed(false);
								}}
								activating={activating}
								activateComplete={activateComplete}
								activateFailed={activateFailed}
								onActivateClick={() => {
									setActivating(true);
									activateUpload(
										Object.keys(globalState.selectedIds)[0]
									)
										.then((res) => {
											if (res.status === "completed") {
												setActivating(false);
												setActivateComplete(true);
											} else {
												setActivating(false);
												setActivateFailed(true);
											}
										})
										.catch((err) => {
											TriggerIssue(
												"Error in activating the csv file",
												err
											);
											setActivating(false);
											setActivateFailed(true);
										});
								}}
								onSuccess={() => {
									refreshReduxState();
								}}
							/>
						)}
					</div>
					{Object.keys(globalState.selectedIds).length > 0 ? (
						<button
							className="autho__dd__cont7"
							style={{ marginRight: "16px" }}
						>
							<img src={CSV} style={{ marginRight: "12px" }} />
							Download
						</button>
					) : null}
					{/* <div  className="mr-3">
						<button className="appsac">
							<img src={CSV}></img>
							<span id="te">CSV</span>
						</button>
					</div> */}

					<div className="d-flex flex-row">
						{!isViewer && (
							<button
								className="appsad mr-3"
								onClick={clickedOnAddUpload}
							>
								<img src={Add}></img>
								<span id="te">Add</span>
							</button>
						)}

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
						{globalState.addCardShow && (
							<UploadTransactionsSidePanel
								refreshUploads={refreshReduxState}
								closeUploadTransactions={addCardClose}
							/>
						)}
					</div>
				</div>
			</div>
			<Strips entity={ENTITIES.UPLOADS} />
			<div className="transaction__table__details">
				<div className="table__info__text__left">
					<div>Showing</div>
					<div className="bold-600 mr-1 ml-1">
						{searchQuery.length > 0
							? searchResultCount || 0
							: uploads?.count || 0}
					</div>
					<div>uploads</div>
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
								setGlobalState({
									...globalState,
									selectedIds: [],
								});
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
									setGlobalState({
										...globalState,
										selectedIds: [],
									});
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
									setGlobalState({
										...globalState,
										selectedIds: [],
									});
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
						? { padding: "0px 40px", height: "48vh" }
						: { padding: "0px 40px" }
				}
			>
				{globalState.loading && (
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
				{!globalState.loading && (
					<div key={pagination}>
						{(searchQuery
							? globalState?.data
							: globalState?.data[pagination]
						)?.length > 0 ? (
							<Table
								columns={columns}
								data={
									(searchQuery
										? globalState?.data
										: globalState?.data[pagination]) || []
								}
								hover
								remote={true}
								options={options}
								onTableChange={
									onTableChange ? onTableChange : () => {}
								}
								keyField="upload_id"
								selectRow={selectRow}
								rowStyle={rowStyle}
							/>
						) : (
							<InfiniteTable
								keyField="upload_id"
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
					</div>
				)}
			</div>
		</>
	);
}
