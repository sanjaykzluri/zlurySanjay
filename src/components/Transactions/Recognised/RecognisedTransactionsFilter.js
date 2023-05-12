import React, { useState, useContext, useEffect, useRef } from "react";
import { preventScroll } from "../../../actions/ui-action";
import FilterIcons from "../../../common/filterIcons";
import {
	addTransaction,
	exportRecognisedTransactionCSV,
	getPaymentMethods,
	getRecognisedTransactionsProperties,
	getTransactionsPropertiesList,
	setPMTransBulk,
	setTransactionsArchiveBulk,
	unAssignTransactionsBulk,
} from "../../../services/api/transactions";
import { ColumnRenderingModal } from "../../Users/Applications/Modals/ColumnRenderingModal";
import Chips from "../../Users/Applications/Modals/FiltersRenderer/Chip";
import { FilterRenderingModal } from "../../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import search from "../../../assets/search.svg";
import refresh_icon from "../../../assets/icons/refresh.svg";
import { getImageForPaymentMethodDropdown } from "./Dropdown";
import { AddTransactionModal } from "../Modals/AddTransactionModal";
import { UnassignArchiveModal } from "../Modals/UnassignArchiveModal";
import {
	checkAndFetchRecog,
	fetchRecognisedTransactions,
} from "../../../actions/transactions-action";
import { useDispatch, useSelector } from "react-redux";
import arrowdropdown from "../Unrecognised/arrowdropdown.svg";
import { Loader } from "../../../common/Loader/Loader";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Strips from "../../../common/restrictions/Strips";
import { ENTITIES } from "../../../constants";
import useOutsideClick from "../../../common/OutsideClick/OutsideClick";
import CSV from "../../../assets/CSV.svg";
import Add from "../../../assets/add.svg";
import RoleContext from "../../../services/roleContext/roleContext";
import BulkChangePaymentMethod from "../../../modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import ExportModal from "../../../common/Export/ExportModal";

export function RecognisedFilter(props) {
	const {
		data,
		metaData,
		searchQuery,
		columnsMapper,
		usedColumns,
		handleRefresh,
		isLoadingData,
		checked,
		setChecked,
		transactionType,
		selectedTransactions,
		setSelectedTransactions,
		hideExportButton = false,
		hideAddRecognisedButton = false,
	} = props;

	const id = window.location.pathname.split("/")[2];
	const [showHide, setshowHide] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [propertyList, setPropertyList] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch();
	const cancelToken = useRef();
	const { isViewer } = useContext(RoleContext);

	let addHideAppClose = () => {
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setshowHide(false);
	};

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
	}

	const handleSearchQuery = (event) => {
		setSearchTerm(event.target.value?.trimStart());
		if (event.target.value.trim().length == 1) {
			event.preventDefault();
		} else {
			props.setSearchQuery &&
				props.setSearchQuery(event.target.value?.trim());
		}
	};

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

	const handleAdd = (transaction) => {
		addTransaction(transaction).then(() => {
			refreshReduxState();
			setAddModalOpen(false);
			//Segment Implementation
			window.analytics.track("Added a new Transaction", {
				newTransaction: transaction,
				currentCategory: "Transactions",
				currentPageName: "Recognised-Transactions",
				orgId: orgId || "",
				orgName: orgName || "",
			});
		});
	};
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

	let handleChangePayment = (value, paymentLoading) => {
		setPaymentName(value);
		const search = value.toLowerCase();
		var matchingPaymentArray = [];
		if (value.length > 0) {
			setdd1insideactive(true);
		} else {
			setdd1insideactive(false);
		}
		if (paymentLoading === false) {
			paymentMethods.map((el) => {
				if (
					el?.cc_card_name?.toLowerCase().includes(search) ||
					el?.bank_name?.toLowerCase().includes(search) ||
					el?.payment_method_name?.toLowerCase().includes(search)
				) {
					matchingPaymentArray.push(el);
				}
			});
		}
		setpaymentsearchresult(matchingPaymentArray);
	};

	const clickedOnChangeBulkActionsDropdown = () => {
		setdd2active(!dd2active);
		commonSegmentTrack("Bulk Actions Button Clicked");
	};
	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Recognised Transactions");
	};

	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Transactions",
			currentPageName: "Recognised-Transactions",
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
				</div>
				<div className="Uploads__right">
					{checked.length > 0 && (
						<>
							<BulkChangePaymentMethod
								entity_ids={checked}
								api_call={setPMTransBulk}
								refresh={handleRefresh}
								is_success={(res) =>
									res && res.status === "success"
								}
							/>
							<button
								className="autho__dd__cont8 ml-2"
								onClick={clickedOnChangeBulkActionsDropdown}
							>
								Bulk Actions
								<img
									src={arrowdropdown}
									style={{ marginLeft: "8px" }}
								></img>
								{dd2active ? (
									<div
										ref={refBulkAction}
										className="autho__dd__cont8__options menu"
									>
										<div
											onClick={() => {
												setUnassignModalOpen(true);
											}}
											role="button"
											className="autho__dd__cont8__option"
										>
											Unassign Apps
										</div>
										<hr style={{ margin: "0px 18px" }}></hr>
										<div
											onClick={() => {
												setArchiveModalOpen(true);
											}}
											role="button"
											className="autho__dd__cont8__option"
										>
											Archive
										</div>
									</div>
								) : null}
							</button>
						</>
					)}
					<div className="inputWithIconApps">
						<input
							type="text"
							placeholder="Search Transactions"
							value={searchTerm}
							onChange={handleSearchQuery}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					{!hideExportButton && (
						<ExportModal
							title="Export Recognised Transactions Data"
							show={showExportModal}
							onHide={() => setShowExportModal(false)}
							propertyList={propertyList}
							mandatoryFieldId="app_name"
							mandatoryFieldName="Application Name"
							hiddenPropertiesArray={[
								"app_name",
								"transaction_id",
								"source_id",
								"payment_method_id",
							]}
							exportEntity="Transactions"
							selectedDataFieldId="_id"
							selectedData={checked}
							exportCSV={exportRecognisedTransactionCSV}
							exportScheduleName="Recognised Transactions Export"
							scheduleEntity="recognized_transactions"
						/>
					)}
					{!isViewer && !hideAddRecognisedButton && (
						<button
							className="appsad mr-3"
							onClick={() => {
								setAddModalOpen(true);
								commonSegmentTrack(
									"Add Transaction Button Clicked"
								);
							}}
						>
							<img src={Add} />
							<span id="te">Add</span>
						</button>
					)}
					<button
						className="appsad"
						onClick={() => refreshReduxState()}
						style={{ width: "50px" }}
					>
						<img
							className="w-100 h-100 m-auto"
							src={refresh_icon}
						/>
					</button>
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
							v2Entity={transactionType}
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
							v2Entity={transactionType}
						/>
					</div>
				</>
			)}
			<Strips entity={ENTITIES.TRANSACTIONS} />
			<AddTransactionModal
				handleClose={() => setAddModalOpen(false)}
				isOpen={addModalOpen}
				handleSubmit={handleAdd}
			/>
			{(unassignModalOpen || archiveModalOpen) && (
				<UnassignArchiveModal
					data={selectedTransactions}
					id={checked}
					selectedIds={checked}
					setSelectedTransactions={setSelectedTransactions}
					isOpen={unassignModalOpen || archiveModalOpen}
					handleClose={() => {
						if (archiveModalOpen) {
							setArchiveModalOpen(false);
						} else {
							setUnassignModalOpen(false);
						}
					}}
					setSelectedIds={setChecked}
					cancelToken={cancelToken}
					refreshReduxState={refreshReduxState}
					title={
						archiveModalOpen
							? "Archive Transactions"
							: "Unassign Transaction"
					}
					requestFunction={
						archiveModalOpen
							? setTransactionsArchiveBulk
							: unAssignTransactionsBulk
					}
					buttonText={archiveModalOpen ? "Archive" : "Unassign App"}
				/>
			)}
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
