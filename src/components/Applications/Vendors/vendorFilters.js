import React, { useState, useEffect, useContext } from "react";
import search from "../../../assets/search.svg";
import Add from "../../../assets/add.svg";
import { AddVendor } from "./AddVendor";
import { useSelector, useDispatch } from "react-redux";
import refresh_icon from "../../../assets/icons/refresh.svg";
import { getVendorPropertiesList } from "../../../services/api/applications";
import FilterIcons from "../../../common/filterIcons";
import { FilterRenderingModal } from "../../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import { ColumnRenderingModal } from "../../Users/Applications/Modals/ColumnRenderingModal";
import { allowScroll, preventScroll } from "../../../actions/ui-action";
import Chips from "../../Users/Applications/Modals/FiltersRenderer/Chip";
import RoleContext from "../../../services/roleContext/roleContext";
import { SearchInputArea } from "../../searchInputArea";
import VendorBulkEdit from "../../../modules/vendors/components/VendorBulkEdit";

export function VendorFilters(props) {
	const {
		metaData,
		searchQuery,
		columnsMapper,
		usedColumns,
		handleRefresh,
		isLoadingData,
		checked,
		setChecked,
	} = props;

	const dispatch = useDispatch();
	const [showHide, setshowHide] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [propertyList, setPropertyList] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [addVendorOpen, setAddVendorOpen] = useState(false);
	const closeAddVendor = () => {
		setAddVendorOpen(false);
	};
	const { isViewer } = useContext(RoleContext);
	const onAddVendorSuccess = () => {
		setAddVendorOpen(false);
		refreshReduxState();
	};

	let addHideAppClose = () => {
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setshowHide(false);
	};

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
	}

	const refreshReduxState = () => {
		!isLoadingData && handleRefresh();
	};

	useEffect(() => {
		if (loading) {
			getVendorPropertiesList().then((res) => {
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
					{Array.isArray(checked) && checked.length > 0 && (
						<VendorBulkEdit
							checked={checked}
							setChecked={setChecked}
							handleRefresh={refreshReduxState}
						/>
					)}
					<div className="inputWithIconApps ml-3 mr-3 ml-0 mt-auto mb-auto">
						<SearchInputArea
							placeholder="Search Vendors"
							setSearchQuery={props.setSearchQuery}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					{!isViewer && (
						<div className="d-flex flex-row ">
							<button
								className="appsad mr-3"
								onClick={() => setAddVendorOpen(true)}
							>
								<img src={Add} />
								<span id="te">Add</span>
							</button>
						</div>
					)}
					<div className="d-flex flex-row">
						<button
							className="appsad"
							style={{
								width: "50px",
							}}
							onClick={refreshReduxState}
						>
							<img
								className="w-100 h-100 m-auto"
								src={refresh_icon}
							/>
						</button>
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
							v2Entity="vendors"
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
			{addVendorOpen && (
				<>
					<div className="modal-backdrop show"></div>
					<div style={{ display: "block" }} className="modal"></div>
					<AddVendor
						show={addVendorOpen}
						onHide={closeAddVendor}
						onSuccess={onAddVendorSuccess}
					/>
				</>
			)}
			<Chips
				searchQuery={searchQuery}
				text={"Vendors"}
				metaData={metaData}
				isInfiniteTable={true}
			/>
		</>
	);
}
