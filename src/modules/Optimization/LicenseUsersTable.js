import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { NameBadge } from "common/NameBadge";
import UserInfoTableComponent from "common/UserInfoTableComponent";
import check from "assets/applications/check.svg";
import inactivecheck from "assets/applications/inactivecheck.svg";
import { ActivityGraphCell } from "components/Users/Applications/Applications";
import { SourcesFormatter } from "modules/shared/components/ManualUsage/TableFormatter/SourcesFormatter";
import { updateManualUsage } from "services/api/users";
import close from "assets/close.svg";
import { getLicenseUsers } from "services/api/optimization";
import { TriggerIssue } from "utils/sentry";
import OldInfiniteTable from "common/oldInfiniteTable";
import { DatePicker } from "UIComponents/DatePicker/DatePicker";
import { dateResetTimeZone, UTCDateFormatter } from "utils/DateUtility";
import { SearchInputArea } from "components/searchInputArea";
import refresh_icon from "assets/icons/refresh.svg";
import search from "assets/search.svg";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import {
	filterStringArrIndex,
	licenseUsersStatuses,
	licenseUsersTableMetaData,
} from "./constants/OptimizationConstants";
import bluearrowdropdown from "assets/licenses/bluearrowsdropdown.svg";
import { capitalizeFirstLetter } from "utils/common";
import { EmptySearch } from "common/EmptySearch";
import { Empty } from "modules/security/components/Empty/Empty";
import { checkSpecialCharacters } from "services/api/search";
import ExportModal from "common/Export/ExportModal";
import { exportApplicationUserCSV } from "services/api/applications";
import { useDispatch, useSelector } from "react-redux";
import { checkAndFetchLicenseUserProperties } from "./redux/Optimization-action";
import BulkRunAPlaybook from "modules/workflow/components/BulkRunAPlaybook/BulkRunAPlaybook";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";

export function LicenseUsersTable({
	keyField,
	show,
	handleClose,
	application,
	licenseData,
	month,
	year,
	licenseList,
}) {
	const dispatch = useDispatch();
	const { properties, loaded } = useSelector(
		(state) => state.optimization.license_user_properties
	);
	const { selected_filter } = useSelector((state) => state.optimization);
	const [body, setBody] = useState({
		license_name: licenseData?.license_name,
		license_id: licenseData?.license_id,
		contract_id: licenseData?.contract_id,
		user_status: keyField,
		month,
		year,
		shifted_months: Number(
			selected_filter.split("_")[filterStringArrIndex.month]
		),
		usage: Number(selected_filter.split("_")[filterStringArrIndex.usage]),
	});
	const [date, setDate] = useState(
		dateResetTimeZone(new Date(`${year}-${month}-01`))
	);
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [checked, setChecked] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");

	const columnsMapper = {
		user: {
			dataField: "user_name",
			text: "User",
			sortKey: "user_name",
			formatter: (data, row) => {
				return (
					<UserInfoTableComponent
						user_account_type={row.user_account_type}
						user_profile={row.user_profile}
						row={row}
						user_id={row.user_id}
						user_name={row.user_name}
					/>
				);
			},
		},
		usage: {
			dataField: "user_app_status",
			text: "Usage",
			sortKey: "user_app_status",
			formatter: (row, data) => (
				<div
					className={`d-flex flex-row align-items-center ${
						(data.user_app_status || data.user_status) === "active"
							? ""
							: "o-6"
					}`}
				>
					{data.user_app_status === "active" ? (
						<div>
							<img className="mr-1" src={check}></img>
							In Use
						</div>
					) : (
						<div>
							<img className="mr-1" src={inactivecheck}></img>
							Not in Use
						</div>
					)}
				</div>
			),
		},
		role: {
			dataField: "user_app_role",
			text: "Role",
			sortKey: "user_app_role",
			formatter: (data, row) => (
				<div className="d-flex flex-row align-items-center text-capitalize">
					{data}
				</div>
			),
		},
		activity: {
			dataField: "user_app_sources_data",
			text: "Activity",
			formatter: (data, row) => (
				<ActivityGraphCell row={row} data={data} />
			),
		},
		source: {
			dataField: "source_array",
			text: "Source",
			formatter: (
				cell,
				row,
				interColumnsStateObject,
				setInterColumnsStateObject
			) => (
				<div>
					<SourcesFormatter
						cell={cell}
						isUserAppActive={
							(row.user_app_status || row.user_status) ===
							"active"
						}
						user_app_id={row.user_app_id}
						user_name={row.user_name}
						user_profile={row.user_profile}
						app_name={application?.app_name}
						app_image={application?.app_logo}
						user_id={row.user_id}
						completeRow={row}
						is_manual_source_present={row.is_manual_source_present}
						interColumnsStateObject={interColumnsStateObject}
						setInterColumnsStateObject={setInterColumnsStateObject}
						org_user_app_id="org_user_app_id"
						org_user_app_source_types="user_source_types"
						org_user_app_sources="user_sources"
						isUser={true}
						updateManualUsage={updateManualUsage}
					/>
				</div>
			),
		},
	};

	useEffect(() => {
		if (!loaded) dispatch(checkAndFetchLicenseUserProperties());
	}, [loaded]);

	useEffect(() => {
		if (loading) {
			fetchLicenseUsers();
		}
	}, [loading]);

	const fetchLicenseUsers = () => {
		setLoading(true);
		if (searchQuery && searchQuery.length > 0) {
			if (checkSpecialCharacters(searchQuery)) {
				setUsers([]);
				setLoading(false);
				return;
			}
		}
		getLicenseUsers(application.app_id, body)
			.then((res) => {
				if (res.user_app_data && Array.isArray(res.user_app_data)) {
					setUsers(res.user_app_data);
					setLoading(false);
				} else {
					TriggerIssue(
						"Unexpected response from license users api",
						res
					);
					setUsers([]);
					setLoading(false);
				}
			})
			.catch((error) => {
				TriggerIssue("Error in fetching license users", error);
				setUsers([]);
				setLoading(false);
			});
	};

	const refreshTable = () => {
		setUsers([]);
		setLoading(true);
	};

	const handleMonthChange = (d) => {
		const d_body = { ...body };
		d_body.month = dateResetTimeZone(d).getMonth() + 1;
		d_body.year = dateResetTimeZone(d).getFullYear();
		setDate(dateResetTimeZone(d));
		setBody(d_body);
		refreshTable();
	};

	const handleLicenseUserStatusChange = (status) => {
		const temp = { ...body };
		temp.user_status = status;
		setBody(temp);
		refreshTable();
	};

	const handleLicenseChange = (license) => {
		const temp = { ...body };
		temp.license_id = license.license_id;
		temp.contract_id = license.contract_id;
		temp.license_name = license.license_name;
		setBody(temp);
		refreshTable();
	};

	const getMetaDataForExport = () => {
		return {
			filter_by: [
				{
					field_id: "user_id",
					field_name: "User Id",
					field_values: users?.map((user) => user.user_id),
					filter_type: "objectId",
					negative: false,
					is_custom: false,
				},
			],
		};
	};

	return (
		<Modal
			show={show}
			onHide={handleClose}
			centered
			size="xl"
			contentClassName="opti-license-users-table-modal"
		>
			<div className="d-flex flex-column">
				<div
					className="d-flex flex-row align-items-center justify-content-between"
					style={{
						height: "75px",
						background: "#EBEBEB",
						padding: "28px",
					}}
				>
					<div className="d-flex flex-row align-items-center">
						<div>
							{application && application.app_logo ? (
								<img src={application.app_logo} height={26} />
							) : (
								<NameBadge
									name={application.app_name}
									width={26}
									height={26}
								/>
							)}
						</div>
						<div className="bold-600 ml-1 mr-3 font-18">
							{application.app_name}
						</div>
						<Dropdown
							options={licenseUsersStatuses}
							toggler={
								<div className="d-flex">
									<div className="primary-color font-16 mr-1 text-capitalize">
										{body.user_status?.replaceAll("_", " ")}
									</div>
									<img src={bluearrowdropdown} />
								</div>
							}
							optionFormatter={(option) =>
								capitalizeFirstLetter(
									option?.replaceAll("_", " ")
								)
							}
							onOptionSelect={(option) =>
								handleLicenseUserStatusChange(option)
							}
							menuStyle={{
								width: "max-content",
							}}
							zIndex={70}
						/>
					</div>
					<img
						src={close}
						className="cursor-pointer"
						onClick={handleClose}
					/>
				</div>
				<div
					className="d-flex flex-row justify-content-between"
					style={{ padding: "26px 40px" }}
				>
					<div className="d-flex flex-row align-items-center">
						<Dropdown
							options={licenseList}
							toggler={
								<div className="license_users_table_license_toggler mr-3 border-1 border-radius-4">
									<div className="primary-color font-13 mr-1 text-capitalize">
										{body.license_name}
									</div>
									<img
										src={bluearrowdropdown}
										width={8}
										height={20}
									/>
								</div>
							}
							optionFormatter={(option) => (
								<div
									className="license_users_table_license_toggler"
									style={{ maxWidth: "220px" }}
								>
									<div className="text-capitalize">
										{option.license_name}
									</div>
								</div>
							)}
							onOptionSelect={(option) =>
								handleLicenseChange(option)
							}
							menuStyle={{
								width: "max-content",
								maxWidth: "250px",
								zIndex: "60",
							}}
						/>
						<NewDatePicker
							key={`${date}`}
							value={date}
							placeholder={`Date`}
							calendarClassName="rangefilter-calendar"
							calendarContainerClassName="schedule-date-calendar"
							style={{
								height: "34px",
								borderColor: "#ebebeb",
								zIndex: "60",
							}}
							calendarView="year"
							onClickMonth={true}
							maxDate={
								new Date(
									new Date().getFullYear(),
									new Date().getMonth(),
									1
								)
							}
							dateFormatter={(date) =>
								UTCDateFormatter(date, "MMM YYYY")
							}
							onChange={(d) => handleMonthChange(d)}
						/>
					</div>
					<div className="d-flex flex-row">
						{checked?.length > 0 && (
							<BulkRunAPlaybook
								userIds={checked}
								pageLocation={"License-Users"}
							/>
						)}
						<div className="inputWithIconApps">
							<SearchInputArea
								placeholder="Search Users"
								setSearchQuery={setSearchQuery}
							/>
							<img src={search} aria-hidden="true" />
						</div>
						{properties?.length > 0 && (
							<ExportModal
								title="Export License User Data"
								propertyList={properties}
								mandatoryFieldId="user_name"
								mandatoryFieldName="User Name"
								hiddenPropertiesArray={["user_id", "user_name"]}
								customFieldPropertyId="user_custom_fields"
								customFieldEntity="users"
								exportEntity="users"
								selectedDataFieldId="user_id"
								selectedData={[]}
								metaData={getMetaDataForExport()}
								id={application.app_id}
								exportCSV={exportApplicationUserCSV}
								exportScheduleName="License-Users Export"
								scheduleEntity="applications_users"
								disableIncludeRadio={true}
							/>
						)}
						<button
							className="appsad"
							onClick={refreshTable}
							style={{ width: "50px" }}
						>
							<img
								className="w-100 h-100 m-auto"
								src={refresh_icon}
							/>
						</button>
					</div>
				</div>
				<div
					className="bold-600 grey-1 font-13"
					style={{
						padding: "0px 40px",
					}}
				>
					Showing {users?.length || 0} users
				</div>
				<OldInfiniteTable
					key={`${JSON.stringify(loading)}_${JSON.stringify(
						body
					)}_${JSON.stringify(checked)}`}
					checked={checked}
					setChecked={setChecked}
					isLoadingData={loading}
					data={
						searchQuery
							? users?.filter((user) =>
									user.user_name
										?.toLowerCase()
										.includes(searchQuery?.toLowerCase())
							  )
							: users
					}
					metaData={licenseUsersTableMetaData}
					columnsMapper={columnsMapper}
					loadingRowsCount={5}
					emptyState={
						searchQuery ? (
							<EmptySearch searchQuery={searchQuery} />
						) : (
							<Empty />
						)
					}
					heightFromProps="400px"
					keyField="user_id"
				/>
			</div>
		</Modal>
	);
}
