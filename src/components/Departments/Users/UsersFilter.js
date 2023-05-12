import React, { useState, useEffect } from "react";
import button2 from "./button2Apps.svg";
import search from "../../../assets/search.svg";
import CSV from "../../../assets/CSV.svg";
import Add from "../../../assets/add.svg";
import button1 from "./button1Apps.svg";
import "./UsersDep.css";
import { UsersTable } from "./UsersTable";
import refresh_icon from "../../../assets/icons/refresh.svg";
import { grey, white } from "color-name";
import { departmentConstants } from "../../../constants/transactions";
import { useDispatch, useSelector } from "react-redux";
import { getAllCustomFieldService } from "../../../modules/custom-fields/service/api";
import {
	exportDepartmentUsersCSV,
	getDepartmentUsersPropertiesList,
} from "../../../services/api/departments";
import { Col, Form, Row, Button } from "react-bootstrap";
import { capitalizeFirstLetter } from "../../../utils/common";
import { SideModal } from "../../Applications/AllApps/SideModal";
import NoResultsFoundSVG from "../../../assets/search__outer2.svg";
import greenTick from "../../../assets/green_tick.svg";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../../common/restrictions";
import { ENTITIES } from "../../../constants";
import { preventScroll } from "../../../actions/ui-action";
import { FilterRenderingModal } from "../../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import { ColumnRenderingModal } from "../../Users/Applications/Modals/ColumnRenderingModal";
import Chips from "../../Users/Applications/Modals/FiltersRenderer/Chip";
import FilterIcons from "../../../common/filterIcons";
import { SearchInputArea } from "../../searchInputArea";
import ExportModal from "../../../common/Export/ExportModal";
import AddUserToDepartmentsDropdown from "modules/Departments/components/AddUserToDepartmentDropdown";

const data = [
	{
		id: "1",
		applications: "Adobe CC",
		spend: "$122",
		userswithindept: "100",
		source: "Google Suite",
		status: "Active",
	},
	{
		id: "2",
		applications: "Adobe CC",
		spend: "$122",
		userswithindept: "100",
		source: "Google Suite",
		status: "Active",
	},
	{
		id: "3",
		applications: "Adobe CC",
		spend: "$122",
		userswithindept: "100",
		source: "Google Suite",
		status: "Active",
	},
	{
		id: "4",
		applications: "Adobe CC",
		spend: "$122",
		userswithindept: "100",
		source: "Google Suite",
		status: "Active",
	},
	{
		id: "5",
		applications: "Adobe CC",
		spend: "$122",
		userswithindept: "100",
		source: "Google Suite",
		status: "Active",
	},
	{
		id: "6",
		applications: "Adobe CC",
		spend: "$122",
		userswithindept: "100",
		source: "Google Suite",
		status: "Active",
	},
];
export function UsersFilter(props) {
	const {
		metaData,
		searchQuery,
		columnsMapper,
		usedColumns,
		handleRefresh,
		isLoadingData,
		deptName,
	} = props;

	const [showHide, setshowHide] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	let addHideAppClose = () => {
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setshowHide(false);
	};

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
	}
	const dispatch = useDispatch();
	const id = window.location.pathname.split("/")[2];
	const { refreshTable } = useSelector((state) => state.ui);
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);

	const refreshReduxState = () => {
		dispatch({
			type: departmentConstants.DELETE_SINGLE_DEPARTMENT_USERS,
			payload: {
				id: id,
			},
		});
		!isLoadingData && handleRefresh();
		//Segment Implementation
		window.analytics.track("Refresh Button Clicked", {
			currentCategory: "Departments",
			currentPageName: "Department-Users",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};

	const [showExportModal, setShowExportModal] = useState(false);
	const [showInProgressModal, setShowInProgressModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [propertyList, setPropertyList] = useState([]);
	const [customFields, setCustomFields] = useState([]);
	const [searchPropertyList, setSearchPropertyList] = useState("");
	const [listOfColumns, setListOfColumns] = useState([]);

	useEffect(() => {
		//Segment Implementation
		if (showExportModal) {
			window.analytics.page(
				"Departments",
				"Department-Users; Export App Data",
				{
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [showExportModal]);

	useEffect(() => {
		//Segment Implementation
		if (showExportModal) {
			window.analytics.page(
				"Departments",
				"Department-Users; Export App Data",
				{
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [showExportModal]);

	useEffect(() => {
		if (loading) {
			getDepartmentUsersPropertiesList().then((res) => {
				if (res != null) {
					if (
						res.data != null &&
						res.data.properties != null &&
						Array.isArray(res.data.properties)
					) {
						setPropertyList(res.data.properties);
						setListOfColumns(res.data.columns);
					} else {
						setPropertyList([]);
					}
				} else {
					setPropertyList([]);
				}
				setLoading(false);
			});
		}
	}, []);
	useEffect(() => {
		if (loading) {
			getAllCustomFieldService().then((res) => {
				if (res != null && res.custom_fields != null) {
					if (res.custom_fields.users != null) {
						setCustomFields(res.custom_fields.users);
					} else {
						setCustomFields([]);
					}
				} else {
					setCustomFields([]);
				}
				setLoading(false);
			});
		}
	}, []);

	const customFieldsNames = customFields.map((field) => field?.field_name);
	const defaultExportObj = {
		filter_by: [],
		file_type: "csv",
		columns_required: ["user_name"],
		is_sample: false,
	};

	const [exportRequestObj, setExportRequestObj] = useState({
		...defaultExportObj,
	});

	useEffect(() => {
		//Segment Implementation
		if (showInProgressModal) {
			window.analytics.track("Exporting Data in Progress", {
				currentCategory: "Departments",
				currentPageName: "Department-User; Export",
				checked: props.checked,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [showInProgressModal]);
	const commonSegmentTrack = (message) => {
		window.analytics.track(message, {
			currentCategory: "Departments",
			currentPageName: "Department-Users",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Users");
	};

	const clickedOnExport = () => {
		if (isBasicSubscription) {
			showrestrictedPopup(ENTITIES.EXPORT_CSV);
		} else {
			setShowExportModal(true);
		}
		commonSegmentTrack("Clicked on Export");
	};

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
					<div className="inputWithIconApps">
						<SearchInputArea
							placeholder="Search Users"
							setSearchQuery={props.setSearchQuery}
							onClick={clickedOnSearch}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					<ExportModal
						title="Export Department User Data"
						show={showExportModal}
						onHide={() => setShowExportModal(false)}
						propertyList={propertyList}
						mandatoryFieldId="user_name"
						mandatoryFieldName="User Name"
						hiddenPropertiesArray={["user_id", "user_name"]}
						customFieldPropertyId="user_custom_fields"
						customFieldEntity="users"
						exportEntity="users"
						selectedDataFieldId="user_id"
						selectedData={props.checked}
						metaData={metaData}
						id={id}
						exportCSV={exportDepartmentUsersCSV}
						exportScheduleName="Department-Users Export"
						scheduleEntity="departments_users"
					/>
					<AddUserToDepartmentsDropdown
						deptId={id}
						deptName={deptName}
						handleRefresh={handleRefresh}
					/>
					<div>
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
				</div>
			</div>
			{showColumnsModal ? (
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
			) : null}
			{showFilterModal ? (
				<>
					<div className="modal-backdrop show"></div>
					<div className="modal d-block">
						<FilterRenderingModal
							handleSubmit={handleSubmit}
							show={showHide}
							onHide={addHideAppClose}
							filterPropertyList={propertyList}
							appliedFilters={
								searchQuery && searchQuery?.length
									? []
									: metaData?.filter_by
							}
							metaData={metaData}
							submitting={submitInProgress}
							style={{ zIndex: "1" }}
						/>
					</div>
				</>
			) : null}
			{
				<Chips
					searchQuery={searchQuery}
					text={"Users"}
					metaData={metaData}
					isInfiniteTable={true}
				/>
			}
		</>
	);
}
