import React, { useState, useContext, useEffect, useRef } from "react";
import { preventScroll } from "../../actions/ui-action";
import FilterIcons from "../../common/filterIcons";
import search from "../../assets/search.svg";
import refresh_icon from "../../assets/icons/refresh.svg";
import { useDispatch, useSelector } from "react-redux";
import Strips from "../../common/restrictions/Strips";
import { ENTITIES } from "../../constants";
import useOutsideClick from "../../common/OutsideClick/OutsideClick";
import UploadTransactionsSidePanel from "./UploadTransactionsSidePanel";
import RoleContext from "../../services/roleContext/roleContext";
import FilterUsers from "../Users/FilterUsers";
import { DeactivateModal } from "./DeactivateModal";
import {
	activateUpload,
	deactivateUpload,
	getTransactionsPropertiesList,
} from "../../services/api/transactions";
import { TriggerIssue } from "../../utils/sentry";
import { ActivateModal } from "./ActivateModal";
import CSV from "./CSV.svg";
import Add from "./add.svg";
import { ColumnRenderingModal } from "../Users/Applications/Modals/ColumnRenderingModal";
import { FilterRenderingModal } from "../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import Chips from "../Users/Applications/Modals/FiltersRenderer/Chip";
import { checkSpecialCharacters } from "services/api/search";

export function UploadFilters(props) {
	const {
		metaData,
		searchQuery,
		columnsMapper,
		usedColumns,
		handleRefresh,
		isLoadingData,
		checked,
		setChecked,
		selectedTransactions,
		transactionType,
		setSearchQuery,
	} = props;

	const id = window.location.pathname.split("/")[2];
	const [showHide, setshowHide] = useState(false);
	const [searchTerm, setSearchTerm] = useState(searchQuery);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [propertyList, setPropertyList] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch();
	const cancelToken = useRef();

	const initialPage = 0;
	const [page, setPage] = useState(initialPage);
	const initialState = {
		addCardShow: false,
		checkBoxTicked: false,
		selectedIds: [...selectedTransactions],
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

	useEffect(() => {
		setGlobalState({
			...globalState,
			selectedIds: [...selectedTransactions],
		});
	}, [selectedTransactions]);

	const [globalState, setGlobalState] = useState(initialState);
	const { uploads } = useSelector((state) => state.transactions);
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
	const [inputInvalid, setInputInvalid] = useState(false);
	const [invalidCharacter, setInvalidCharater] = useState("");

	let addHideAppClose = () => {
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setshowHide(false);
	};

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
	}

	useEffect(() => {
		setSearchTerm(searchQuery ? searchQuery : "");
	}, [searchQuery]);

	const handleSearchQuery = (event) => {
		let invalidKey = checkSpecialCharacters(
			event.target.value?.trim(),
			true,
			true
		);
		if (invalidKey) {
			setInputInvalid(true);
			setInvalidCharater(invalidKey);
		} else {
			setInputInvalid(false);
			setSearchQuery && setSearchQuery(event.target.value?.trim());
			setSearchTerm(event.target.value?.trimStart());
		}
	};

	useEffect(() => {
		let timer;
		if (invalidCharacter && inputInvalid) {
			timer = setInterval(() => setInvalidCharater(), 2000);
		}
		return () => clearInterval(timer);
	}, [inputInvalid]);

	const refreshReduxState = () => {
		!isLoadingData && handleRefresh();
	};

	useEffect(() => {
		if (loading) {
			getTransactionsPropertiesList(transactionType).then((res) => {
				if (res != null) {
					if (
						res.data != null &&
						res.data.properties != null &&
						Array.isArray(res.data.columns) &&
						Array.isArray(res.data.properties)
					) {
						setPropertyList(res.data.properties);
						setListOfColumns(res.data.columns);
					} else {
						setPropertyList([]);
						setListOfColumns([]);
					}
				} else {
					setPropertyList([]);
					setListOfColumns([]);
				}
				setLoading(false);
			});
		}
	}, []);

	const refPaymentMethod = useRef();
	const refBulkAction = useRef();
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [dd1active, setdd1active] = useState(false);
	const [dd2active, setdd2active] = useState(false);
	const [dd1insideactive, setdd1insideactive] = useState(false);
	const [paymentName, setPaymentName] = useState("");
	const [paymentMethods, setPaymentMethods] = useState([]);
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [paymentsearchresult, setpaymentsearchresult] = useState([]);
	const [unassignModalOpen, setUnassignModalOpen] = useState(false);
	const [archiveModalOpen, setArchiveModalOpen] = useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [showExportModal, setShowExportModal] = useState(false);

	var paymentmethods = !dd1insideactive
		? paymentMethods
		: paymentsearchresult;

	useEffect(() => {
		if (checked.length > 0) {
			setdd1active(false);
			setdd2active(false);
		}
	}, [checked]);

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

	const defaultExportObj = {
		filter_by: [],
		sort_by: [],
		file_type: "csv",
		columns_required: ["app_name"],
	};

	const [exportRequestObj, setExportRequestObj] = useState({
		...defaultExportObj,
	});

	useOutsideClick(refPaymentMethod, () => {
		if (dd1active) setdd1active(false);
	});

	useOutsideClick(refBulkAction, () => {
		if (dd2active) setdd2active(false);
	});

	let addHideFilterClose = () =>
		setGlobalState({ ...globalState, setshowHideFilter: false });

	const UPLOAD_FILE_PROCESS_STATUS = {
		PENDING: "pending",
		VALIDATED: "validated",
		PROCESSING: "processing",
		COMPLETED: "completed",
		DEACTIVATED: "deactivated",
		ACTIVATED: "acitvated",
	};

	let addCardClose = () =>
		setGlobalState({ ...globalState, addCardShow: false });

	return (
		<>
			<div className="top__Uploads">
				<div className="Uploads__left">
					<FilterIcons
						preventScroll={preventScroll}
						isLoadingData={isLoadingData}
						setShowFilterModal={setShowFilterModal}
						setShowColumnsModal={setShowColumnsModal}
						metaData={metaData}
					/>
					{globalState.setshowHideFilter ? (
						<FilterUsers
							show={globalState.setshowHideFilter}
							onHide={addHideFilterClose}
						/>
					) : null}
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
						{inputInvalid && invalidCharacter && (
							<div
								className="font-11 mt-2"
								style={{
									color: "rgb(255, 103, 103)",
									position: "absolute",
									left: 0,
									top: "32px",
								}}
							>
								{invalidCharacter} is Invalid.
							</div>
						)}
						<img src={search} aria-hidden="true" />
					</div>
					<div>
						{selectedTransactions.length === 1 ? (
							selectedTransactions[0]
								?.upload_file_process_status ===
							UPLOAD_FILE_PROCESS_STATUS.COMPLETED ? (
								<button
									id="checkbutton"
									onClick={clickedOnDeactivateUpload}
								>
									Deactivate
								</button>
							) : selectedTransactions[0]
									?.upload_file_process_status ===
							  UPLOAD_FILE_PROCESS_STATUS.DEACTIVATED ? (
								<button
									id="checkbutton"
									onClick={clickedOnActivateUpload}
								>
									Activate
								</button>
							) : null
						) : null}
						{selectedTransactions.length === 1 &&
						selectedTransactions[0]?.upload_file_process_status ===
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
										selectedTransactions[0]?._id
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
									activateUpload(selectedTransactions[0]?._id)
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
					{/* TODO: TO request download  */}
					{/* {selectedTransactions.length > 0 ? (
						<button
							className="autho__dd__cont7"
							style={{ marginRight: "16px" }}
						>
							<img src={CSV} style={{ marginRight: "12px" }} />
							Download
						</button>
					) : null} */}
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
			{showColumnsModal && (
				<>
					<div className="modal-backdrop show"></div>
					<div className="modal d-block">
						<ColumnRenderingModal
							handleSubmit={handleSubmit}
							show={showHide}
							onHide={addHideAppClose}
							submitting={submitInProgress}
							listOfColumns={listOfColumns}
							setListOfColumns={setListOfColumns}
							columnsMapper={columnsMapper}
							style={{ zIndex: "1" }}
							usedColumns={usedColumns}
							metaData={metaData}
							keyField={"_id"}
						/>
					</div>
				</>
			)}
			{showFilterModal && (
				<>
					<div className="modal-backdrop show"></div>
					<div className="modal d-block">
						<FilterRenderingModal
							handleSubmit={handleSubmit}
							show={showHide}
							onHide={addHideAppClose}
							filterPropertyList={propertyList}
							appliedFilters={metaData?.filter_by}
							metaData={metaData}
							submitting={submitInProgress}
							style={{ zIndex: "1" }}
						/>
					</div>
				</>
			)}
			<Strips entity={ENTITIES.TRANSACTIONS} />

			<Chips
				searchQuery={searchQuery}
				text={"Transactions"}
				metaData={metaData}
				isInfiniteTable={true}
				setSearchQuery={props.setSearchQuery}
			/>
		</>
	);
}
