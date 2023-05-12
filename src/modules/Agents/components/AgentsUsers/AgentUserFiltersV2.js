import React, { useState, useContext, useEffect, useRef } from "react";
import { preventScroll } from "actions/ui-action";
import FilterIcons from "common/filterIcons";
import search from "assets/search.svg";
import refresh_icon from "assets/icons/refresh.svg";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "common/Loader/Loader";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Strips from "common/restrictions/Strips";
import { ENTITIES } from "constants";
import useOutsideClick from "common/OutsideClick/OutsideClick";
import CSV from "assets/CSV.svg";
import Add from "assets/add.svg";
import RoleContext from "services/roleContext/roleContext";
import BulkChangePaymentMethod from "modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import ExportModal from "common/Export/ExportModal";
import { getAgentUsersProperties } from "services/api/agents";
import Chips from "components/Users/Applications/Modals/FiltersRenderer/Chip";
import { ColumnRenderingModal } from "components/Users/Applications/Modals/ColumnRenderingModal";
import { FilterRenderingModal } from "components/Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import BulkSendPrompt from "./BulkSendPrompt";

export function AgentUserFiltersV2(props) {
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
		hideExportButton = false,
		hideAddRecognisedButton = false,
		sourceList,
		v2TableEntity,
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
		if (event.target.value.trim().length === 1) {
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
			getAgentUsersProperties().then((res) => {
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
						hideColumnsButton={true}
					/>
				</div>
				<div className="Uploads__right">
					{checked.length > 0 &&
						!isViewer &&
						Array.isArray(checked) &&
						checked.length > 0 && (
							<BulkSendPrompt
								selectedIds={checked}
								setPromptSentSuccessfully={
									props.setPromptSentSuccessfully
								}
							/>
						)}
					<div className="inputWithIconApps">
						<input
							type="text"
							placeholder="Search Users"
							value={searchTerm}
							onChange={handleSearchQuery}
						/>
						<img src={search} aria-hidden="true" />
					</div>
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
							appSourceList={sourceList}
							style={{ zIndex: "1" }}
						/>
					</div>
				</>
			)}
			<Strips entity={ENTITIES.USERS} />
			<Chips
				searchQuery={searchQuery}
				text={"Users"}
				metaData={metaData}
				isInfiniteTable={true}
				setSearchQuery={props.setSearchQuery}
			/>
		</>
	);
}
