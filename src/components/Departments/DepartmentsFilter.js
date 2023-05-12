import React, { useState, useEffect, useRef, useContext } from "react";
import search from "../../assets/search.svg";
import Add from "../../assets/add.svg";
import AngleDown from "../../assets/icons/angle-down.svg";
import "./Departments.css";
import { AddDepartment } from "./AddDepartment";
import useOutsideClick from "../../common/OutsideClick/OutsideClick";
import {
	addDepartment,
	bulkEditDeptArchive,
	bulkUpdateDepartmentHead,
	exportDepartmentCSV,
	getDepartmentPropertiesList,
} from "../../services/api/departments";
import { useSelector, useDispatch } from "react-redux";
import { SearchSelect } from "../../common/Select/SearchSelect";
import "../../common/Select/Select.scss";
import { searchUsers } from "../../services/api/search";
import refresh_icon from "../../assets/icons/refresh.svg";
import { departmentConstants } from "../../constants/transactions";
import { fetchAllDepartments } from "../../actions/departments-action";
import CSV from "../../assets/CSV.svg";
import { getAllCustomFieldService } from "../../modules/custom-fields/service/api";
import { Col, Form, Row, Button, Dropdown } from "react-bootstrap";
import { capitalizeFirstLetter, debounce } from "../../utils/common";
import { SideModal } from "../Applications/AllApps/SideModal";
import NoResultsFoundSVG from "../../assets/search__outer2.svg";
import greenTick from "../../assets/green_tick.svg";
import RoleContext from "../../services/roleContext/roleContext";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../common/restrictions";
import { ENTITIES } from "../../constants";
import { allowScroll, preventScroll } from "../../actions/ui-action";
import { FilterRenderingModal } from "../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import { ColumnRenderingModal } from "../Users/Applications/Modals/ColumnRenderingModal";
import { useDebounce } from "../../utils/hooks";
import Chips from "../Users/Applications/Modals/FiltersRenderer/Chip";
import FilterIcons from "../../common/filterIcons";
import ExportModal from "../../common/Export/ExportModal";
import arrowdropdown from "../Transactions/Unrecognised/arrowdropdown.svg";
import rightarrow from "../../assets/users/rightarrow.svg";
import { toast } from "react-toastify";
import DefaultNotificationCard from "../../common/Notification/PusherNotificationCards/DefaultNotificationCard";
import { getValueFromLocalStorage } from "utils/localStorage";

const bulk_edit_menu = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer autho__dd__cont mt-auto mb-auto text-decoration-none"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
		style={{ width: "100px" }}
	>
		{children}
	</a>
));

const inner_bulk_edit_dropdown = React.forwardRef(
	({ children, onClick }, ref) => (
		<a
			className="cursor-pointer insidedropdown__dept__table"
			ref={ref}
			onClick={(e) => {
				e.preventDefault();
				onClick(e);
			}}
			style={{ padding: "0px !important" }}
		>
			{children}
		</a>
	)
);

export function DepartmentsFilter(props) {
	const {
		searchQuery,
		metaData,
		columnsMapper,
		usedColumns,
		handleRefresh,
		setSearchQuery,
		isLoadingData,
		v2Entity,
		disableAdd
	} = props;
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [showHide, setshowHide] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const dispatch = useDispatch();
	const [submitting, setSubmitting] = useState(false);
	const [formErrors, setFormErrors] = useState([]);
	const [showOwnerSelectDropdown, setShowOwnerSelectDropdown] =
		useState(false);
	const headRef = useRef();
	const [searchTerm, setSearchTerm] = useState("");
	const { refreshTable } = useSelector((state) => state.ui);
	const { isViewer } = useContext(RoleContext);
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);
	const [deptNameExists, setDeptNameExists] = useState(false);

	const handleDepartmentAdd = (department) => {
		setSubmitting(true);
		setFormErrors([]);
		addDepartment(department)
			.then(() => {
				setshowHide(false);
				setSubmitting(false);
				handleRefresh();
				setDeptNameExists(false);
			})
			.catch((err) => {
				setDeptNameExists(false);
				setSubmitting(false);
				if (err.response && err.response.data) {
					setFormErrors(err.response.data.errors);
				}
				if (
					err.response.data.errors.includes("duplicate") &&
					err.response.data.errors.includes("name")
				) {
					setDeptNameExists(true);
				}
			});
	};

	const addHideAppClose = () => {
		dispatch(allowScroll());
		setshowHide(false);
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setFormErrors([]);
		setSubmitInProgress(false);
	};

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
	}

	const handleSearchQuery = (event) => {
		setSearchTerm(event.target.value?.trimStart());
		if (event.target.value.trim().length == 1) {
			event.preventDefault();
		} else {
			setSearchQuery(event.target.value?.trim());
		}
	};

	const updateDepartmentHead = (head) => {
		setShowOwnerSelectDropdown(false);
		bulkUpdateDepartmentHead(head.user_id, props.checked)
			.then((res) => {
				if (res.status === "success") {
					handleTableRefreshAndNotification();
				}
			})
			.catch((err) => {
				console.error("Error updating department head:", err);
			});
	};

	useEffect(() => {
		if (props.checked.length > 0) {
			setShowOwnerSelectDropdown(false);
		}
	}, [props.checked]);

	useOutsideClick(headRef, () => {
		setShowOwnerSelectDropdown(false);
	});

	const refreshReduxState = () => {
		!isLoadingData && handleRefresh();
	};

	const [showExportModal, setShowExportModal] = useState(false);
	const [showInProgressModal, setShowInProgressModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [propertyList, setPropertyList] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [customFields, setCustomFields] = useState([]);
	const [searchPropertyList, setSearchPropertyList] = useState("");

	useEffect(() => {
		if (loading) {
			getDepartmentPropertiesList().then((res) => {
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
					if (res.custom_fields.departments != null) {
						setCustomFields(res.custom_fields.departments);
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
		columns_required: ["dept_name"],
	};

	const [exportRequestObj, setExportRequestObj] = useState({
		...defaultExportObj,
	});

	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Departments",
			currentPageName: "All-Departments",
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
		});
	};
	const clickOnAddDept = () => {
		setshowHide(true);
		commonSegmentTrack("Clicked on Add New Department");
	};
	const clickedOnChangeHead = () => {
		setShowOwnerSelectDropdown(true);
		commonSegmentTrack("Change Auth Button Clicked");
	};

	const getFilterText = (filter) => {
		if (!filter || filter.filter_type === "range") return;
		let condition = "is any of ";
		if (filter.field_type === "string") {
			if (filter.negative) {
				condition = "does not contain ";
			} else {
				condition = "contains ";
			}
		}
		const appliedFilters = Array.isArray(filter?.field_values)
			? filter?.field_values?.join(",")
			: filter?.field_values;
		return (
			<>
				<span style={{ color: "#484848" }}>
					{filter?.field_name?.charAt(0).toUpperCase() +
						filter?.field_name?.slice(1)}
				</span>{" "}
				<span style={{ color: "#717171" }}>{condition}</span>
				<span style={{ color: "#484848" }}>
					{appliedFilters ? appliedFilters : "false"}
				</span>
			</>
		);
	};

	const filterChipValues = metaData?.filter_by
		? Object.keys(metaData?.filter_by).map((key) =>
				getFilterText(metaData?.filter_by[key])
		  )
		: [];
	const totalApps = metaData?.total;

	const exportFilteredDepartments = () => {
		let tempExportRequestObj = {
			...exportRequestObj,
			["filter_by"]: [...props.metaData?.filter_by],
		};
		setExportRequestObj(tempExportRequestObj);
	};

	const exportSelectedDepartments = () => {
		let tempExportRequestObj = { ...exportRequestObj, ["filter_by"]: [] };
		tempExportRequestObj.filter_by.push({
			field_values: props.checked,
			field_id: "dept_id",
			filter_type: "objectId",
			negative: false,
			is_custom: false,
		});
		setExportRequestObj(tempExportRequestObj);
	};

	const totalRecordsCount = metaData?.total || (metaData?.filter_by?.length && 0);
	const handleTableRefreshAndNotification = () => {
		props.setChecked([]);
		refreshReduxState();
		toast(
			<DefaultNotificationCard
				notification={{
					title: "Departments Bulk Edited",
					description:
						"All records have been updated successfully. The changes will reflect in some time.",
				}}
			/>
		);
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
					<div
						className="d-flex flex-row align-items-center "
						style={{ marginLeft: "40px" }}
					/>
				</div>
				<div className="Uploads__right">
					{props.checked.length > 0 && (
						<>
							<Dropdown>
								<Dropdown.Toggle as={bulk_edit_menu}>
									<div className="grey">Bulk Edit</div>
									<img
										src={arrowdropdown}
										style={{ marginLeft: "8px" }}
									></img>
								</Dropdown.Toggle>
								<Dropdown.Menu className="p-0">
									<Dropdown>
										<Dropdown.Toggle
											as={inner_bulk_edit_dropdown}
										>
											<div className="grey">
												Change Head
											</div>
											<img
												src={rightarrow}
												style={{ marginLeft: "8px" }}
											></img>
										</Dropdown.Toggle>
										<Dropdown.Menu className="managed_auth_status_dropdown_menu dept-head-dropdown-menu-position p-0">
											<div className="background-white-on-hover dropdown-item p-0">
												<SearchSelect
													show={true}
													fetchFn={searchUsers}
													onSelect={
														updateDepartmentHead
													}
													keyFields={{
														id: "user_id",
														name: "user_name",
														image: "profile_img",
														email: "user_email",
													}}
													allowFewSpecialCharacters={
														true
													}
												/>
											</div>
										</Dropdown.Menu>
									</Dropdown>
									<Dropdown>
										<Dropdown.Toggle
											as={inner_bulk_edit_dropdown}
										>
											<div className="grey">
												Archive/Unarchive
											</div>
											<img
												src={rightarrow}
												style={{ marginLeft: "8px" }}
											></img>
										</Dropdown.Toggle>
										<Dropdown.Menu className="managed_auth_status_dropdown_menu dept-archive-dropdown-menu-position p-0">
											<Dropdown.Item
												onClick={() => {
													bulkEditDeptArchive(
														props.checked,
														true
													).then((res) => {
														if (
															res.status ===
															"success"
														) {
															handleTableRefreshAndNotification();
														}
													});
												}}
											>
												<div className="d-flex flex-row align-items-center">
													Archive
												</div>
											</Dropdown.Item>
											<Dropdown.Item
												onClick={() => {
													bulkEditDeptArchive(
														props.checked,
														false
													).then((res) => {
														if (
															res.status ===
															"success"
														) {
															handleTableRefreshAndNotification();
														}
													});
												}}
											>
												<div className="d-flex flex-row align-items-center">
													Unarchive
												</div>
											</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
								</Dropdown.Menu>
							</Dropdown>
						</>
					)}
					<div className="inputWithIconApps">
						<input
							type="text"
							placeholder="Search Departments"
							value={searchTerm}
							onChange={handleSearchQuery}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					<ExportModal
						title="Export Department Data"
						show={showExportModal}
						onHide={() => setShowExportModal(false)}
						propertyList={propertyList}
						mandatoryFieldId="dept_name"
						mandatoryFieldName="Department Name"
						hiddenPropertiesArray={["dept_id", "dept_name"]}
						customFieldPropertyId="dept_custom_fields"
						customFieldEntity="departments"
						exportEntity="Departments"
						selectedDataFieldId="dept_id"
						selectedData={props.checked}
						metaData={metaData}
						exportCSV={exportDepartmentCSV}
						exportScheduleName="Departments Export"
						scheduleEntity="departments"
					/>
					<div className="d-flex flex-row">
						{!isViewer && (
							<button
								className="appsad mr-3"
								onClick={clickOnAddDept}
								disabled={disableAdd}
							>
								<img src={Add} />
								<span id="te">Add</span>
							</button>
						)}
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
						{showHide ? (
							<AddDepartment
								handleClose={() => {
									setshowHide(false);
									setFormErrors([]);
									setDeptNameExists(false);
								}}
								handleSubmit={handleDepartmentAdd}
								isOpen={showHide}
								submitInProgress={submitting}
								validationErrors={formErrors}
								deptNameExists={deptNameExists}
								setDeptNameExists={setDeptNameExists}
							/>
						) : null}
						{showColumnsModal ? (
							<>
								<div className="modal-backdrop show"></div>
								<div className="modal d-block">
									<ColumnRenderingModal
										handleSubmit={handleSubmit}
										onHide={addHideAppClose}
										submitting={submitInProgress}
										listOfColumns={listOfColumns}
										setListOfColumns={setListOfColumns}
										columnsMapper={columnsMapper}
										style={{ zIndex: "1" }}
										usedColumns={usedColumns}
										metaData={metaData}
										keyField={"_id"}
										v2Entity={"departments"}
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
										onHide={addHideAppClose}
										filterPropertyList={propertyList}
										appliedFilters={metaData?.filter_by}
										metaData={metaData}
										submitting={submitInProgress}
										validationErrors={formErrors}
										clearValidationErrors={() =>
											setFormErrors([])
										}
										style={{ zIndex: "1" }}
									/>
								</div>
							</>
						) : null}
					</div>
				</div>
			</div>
			{
				<Chips
					searchQuery={searchQuery}
					text={`Top Level Department${totalRecordsCount > 1 ? 's': ''}`}
					metaData={metaData}
					isInfiniteTable={true}
				/>
			}
		</>
	);
}
