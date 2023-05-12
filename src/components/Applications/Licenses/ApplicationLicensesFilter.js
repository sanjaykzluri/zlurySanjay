import React, { useState, useContext, useEffect } from "react";
import { preventScroll } from "../../../actions/ui-action";
import FilterIcons from "../../../common/filterIcons";
import { getApplicationLicensesPropertiesList } from "../../../services/api/applications";
import RoleContext from "../../../services/roleContext/roleContext";
import search from "../../../assets/search.svg";
import refresh_icon from "../../../assets/icons/refresh.svg";
import { FilterRenderingModal } from "../../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import { ColumnRenderingModal } from "../../Users/Applications/Modals/ColumnRenderingModal";
import Chips from "../../Users/Applications/Modals/FiltersRenderer/Chip";

export function ApplicationLicensesFilter(props) {
	const {
		metaData,
		searchQuery,
		columnsMapper,
		usedColumns,
		handleRefresh,
		isLoadingData,
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
	const [contractSubmitting, setContractSubmitting] = useState(false);
	const [contractFormErrors, setContractFormErrors] = useState([]);
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
			getApplicationLicensesPropertiesList(id).then((res) => {
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
						showViews={false}
						metaData={metaData}
					/>
				</div>
				<div className="Uploads__right">
					<div className="inputWithIconApps">
						<input
							type="text"
							placeholder="Search Licenses"
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
							style={{ zIndex: "1" }}
						/>
					</div>
				</>
			)}
			<Chips
				searchQuery={searchQuery}
				text={"Licenses"}
				metaData={metaData}
				isInfiniteTable={true}
			/>
		</>
	);
}
