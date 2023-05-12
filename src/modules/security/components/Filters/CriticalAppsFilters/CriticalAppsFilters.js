import React, { useEffect, useRef, useState } from "react";
import search from "../../../../../assets/search.svg";
import Add from "../../../../../assets/add.svg";
import { allowScroll, preventScroll } from "../../../../../actions/ui-action";
import refresh_icon from "../../../../../assets/icons/refresh.svg";
import { useDispatch, useSelector } from "react-redux";
import { getCriticalAppsPropertiesList } from "../../../../../services/api/security";
import FilterIcons from "../../../../../common/filterIcons";
import { ColumnRenderingModal } from "../../../../../components/Users/Applications/Modals/ColumnRenderingModal";
import { FilterRenderingModal } from "../../../../../components/Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import Chips from "../../../../../components/Users/Applications/Modals/FiltersRenderer/Chip";
import { SearchInputArea } from "../../../../../components/searchInputArea";
export function CriticalAppsFilters(props) {
	const {
		metaData,
		searchQuery,
		columnsMapper,
		usedColumns,
		handleFilterData,
		handleRefresh,
		setSearchQuery,
		isLoadingData,
	} = props;
	const [showHide, setshowHide] = useState(false);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [propertyList, setPropertyList] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [loading, setLoading] = useState(true);
	let addHideAppClose = () => {
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setshowHide(false);
	};

	useEffect(() => {
		if (loading) {
			getCriticalAppsPropertiesList().then((res) => {
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

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
	}

	const refreshReduxState = () => {
		!isLoadingData && handleRefresh();
	};
	return (
		<>
			<div className="top__Uploads justify-content-between">
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
					<div className="inputWithIconApps mr-3 ml-0 mt-auto mb-auto">
						{props && props.setSearchQuery && (
							<SearchInputArea
								placeholder="Search Critical Apps"
								setSearchQuery={setSearchQuery}
							/>
						)}
						<img src={search} aria-hidden="true" />
					</div>
					<button
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
								show={showHide}
								onHide={addHideAppClose}
								filterPropertyList={propertyList}
								appliedFilters={metaData?.filter_by}
								metaData={metaData}
								submitting={submitInProgress}
								style={{ zIndex: "1" }}
								isRangeFilterRequired={true}
							/>
						</div>
					</>
				)}
			</div>
			<Chips
				searchQuery={searchQuery}
				text={"Critical Apps"}
				metaData={metaData}
				isInfiniteTable={true}
			/>
		</>
	);
}
