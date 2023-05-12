import React, { useRef, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import search from "../../../../assets/search.svg";
import "react-circular-progressbar/dist/styles.css";
import "../../../../App.css";
import { allowScroll, preventScroll } from "../../../../actions/ui-action";
import { useDispatch } from "react-redux";
import refresh_icon from "../../../../assets/icons/refresh.svg";
import FilterIcons from "../../../../common/filterIcons";
import Chips from "../../../../components/Users/Applications/Modals/FiltersRenderer/Chip";
import { SearchInputArea } from "../../../../components/searchInputArea";
import { ColumnRenderingModal } from "../../../../components/Users/Applications/Modals/ColumnRenderingModal";
import { FilterRenderingModal } from "../../../../components/Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import { getMappedIntergrationAccounts } from "../../../../services/api/licenses";
import connectedintegration from "../../../../assets/licenses/connectedintegration.svg";
import greendropdown from "../../../../assets/licenses/greendropdown.svg";
import { fetchIntegrationService } from "../../../integrations/service/api";
import { IntegrationStatus } from "../../../integrations/containers/IntegrationStatus/IntegrationStatus";
import { Integration } from "../../../integrations/model/model";
import { CircularProgressbar } from "react-circular-progressbar";
import { useHistory, useLocation } from "react-router";
import { useOutsideClickListener } from "../../../../utils/clickListenerHook";
import { getAppUserPropertiesList } from "../../../../services/api/applications";
import { Dropdown } from "react-bootstrap";
import Add from "../../../../assets/add.svg";
import { AddUserApplication } from "../../../../components/Applications/Users/Modals/AddUserApplication";
import { addManualUsage } from "../../../../services/api/users";
import AppUsersAddComp from "modules/applications/components/Users/AppUsersAddComp";

export function CommonUsersTableFilter(props) {
	const {
		userSourceList,
		metaData,
		searchQuery,
		columnsMapper,
		usedColumns,
		handleRefresh,
		setSearchQuery,
		isLoadingData,
		contract_id,
		unmappedLicenseData,
		loadingUnmappedLicenseData,
		contract_data,
		appLicenseList,
		app_id,
	} = props;
	const integrationAccountsRef = useRef();
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [showHide, setshowHide] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [formErrors, setFormErrors] = useState([]);
	const [showAddUsersModal, setShowAddUsersModal] = useState(false);
	const [submittingAddUser, setSubmittingAddUser] = useState(false);
	const history = useHistory();
	const dispatch = useDispatch();

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
	const refreshReduxState = () => {
		if (!isLoadingData) {
			handleRefresh();
			props.setChecked([]);
		}
	};
	const [loading, setLoading] = useState(true);
	const [propertyList, setPropertyList] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);

	useEffect(() => {
		if (loading) {
			getAppUserPropertiesList().then((res) => {
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

	const handleTableRefreshAndNotification = () => {
		props.setChecked([]);
		handleRefresh();
		refreshReduxState();
	};

	const [integrationAccounts, setIntegrationAccounts] = useState([]);
	const [loadingIntegrationAccounts, setLoadingIntegrationAccounts] =
		useState(true);
	const [showConnectedAccounts, setShowConnectedAccounts] = useState(false);
	const [integration, setIntergation] = useState();
	const [loadingIntegration, setLoadingIntegration] = useState(true);
	useEffect(() => {
		if (contract_id && loadingIntegrationAccounts)
			getMappedIntergrationAccounts(contract_id).then((res) => {
				setLoadingIntegrationAccounts(false);
				setIntegrationAccounts(res);
			});
	}, [contract_id]);

	useEffect(() => {
		if (loadingIntegration && props.integration_id) {
			fetchIntegrationService(props.integration_id).then((res) => {
				setIntergation(new Integration(res));
				setLoadingIntegration(false);
			});
		}
	}, [props.integration_id]);

	const [totalLicensesCount, setTotalLicenseCount] = useState();
	const [unmappedLicenseCount, setUnmappedLicenseCount] = useState();
	const [dropdownOpen, setDropdownOpen] = useState(false);

	useEffect(() => {
		if (unmappedLicenseData) {
			let totalCount = 0;
			let unmappedTotalCount = 0;
			unmappedLicenseData.forEach((el) => {
				totalCount += el.total_license_available;
				if (el.difference) {
					unmappedTotalCount +=
						el.unmapped_license_count + el.difference;
				} else {
					unmappedTotalCount += el.unmapped_license_count;
				}
			});
			setTotalLicenseCount(totalCount);
			setUnmappedLicenseCount(unmappedTotalCount);
		}
	}, [unmappedLicenseData]);

	useOutsideClickListener(
		integrationAccountsRef,
		() => {
			setShowConnectedAccounts(false);
			setDropdownOpen(false);
		},
		[],
		["z_i_connect_modal_dialog"]
	);

	const handleAddManualUsage = async ({ userId, frequency, interval }) => {
		try {
			setSubmittingAddUser(true);
			const res = await addManualUsage(
				userId,
				props.app_id,
				frequency,
				interval
			);
			if (res.status === "success") {
				setSubmittingAddUser(false);
				setShowAddUsersModal(false);
				handleTableRefreshAndNotification();
			}
		} catch (err) {
			let errMessage = err.message;
			if (err.response.data.errors?.includes("user is inactive")) {
				errMessage = "You cannot set manual usage for inactive user";
			} else if (
				err.response.data.errors?.includes("application is inactive")
			) {
				errMessage =
					"You cannot set manual usage for inactive application";
			}
			setSubmittingAddUser(false);
			setShowAddUsersModal(false);
		}
	};

	const showMapLicenseDialog = () => {
		let flag = false;
		if (Array.isArray(unmappedLicenseData)) {
			if (
				unmappedLicenseData.some(
					(license) =>
						!isNaN(license.unmapped_license_count) &&
						license.unmapped_license_count > 0
				)
			) {
				flag = true;
			}
		}
		return flag;
	};

	return (
		<>
			<div className="top__Uploads">
				<div className="Uploads__left flex-grow-0">
					<FilterIcons
						preventScroll={preventScroll}
						isLoadingData={isLoadingData}
						setShowFilterModal={setShowFilterModal}
						setShowColumnsModal={setShowColumnsModal}
						metaData={metaData}
					/>
					<div
						className="d-flex flex-row align-items-center position-relative"
						style={{ marginLeft: "20px" }}
					>
						{!loadingIntegrationAccounts &&
							Array.isArray(integrationAccounts) &&
							integrationAccounts.length > 0 &&
							!loadingIntegration && (
								<>
									<div
										className="common_users_table_connected_integration_button cursor-pointer"
										onClick={() => {
											setShowConnectedAccounts(
												!showConnectedAccounts
											);
										}}
									>
										<img src={connectedintegration}></img>
										<div
											className="font-13 ml-2 mr-2"
											style={{ color: " #5FCF64" }}
										>
											Connected
										</div>
										<img src={greendropdown}></img>
									</div>
								</>
							)}
						{showConnectedAccounts && (
							<div
								className="common_users_table_connected_integration_dropdown flex-column justify-content-between border p-1"
								ref={integrationAccountsRef}
								style={{
									display: dropdownOpen ? "none" : "flex",
								}}
							>
								{integrationAccounts.length > 0 &&
									integrationAccounts.map(
										(account, uniqueKey) => (
											<>
												<Dropdown.Item>
													<div className="d-flex flex-row align-items-center">
														{account.name}
													</div>
												</Dropdown.Item>
											</>
										)
									)}
								{integration && (
									<>
										<IntegrationStatus
											integration={integration}
											hasMoreAccount={
												integrationAccounts.length > 0
											}
											dropdownOpen={dropdownOpen}
											setDropdownOpen={setDropdownOpen}
											setShowConnectedAccounts={
												setShowConnectedAccounts
											}
											hideButton
										/>
									</>
								)}
							</div>
						)}
					</div>
				</div>
				<div className="Uploads__right">
					<div className="inputWithIconApps ml-0 mr-3">
						<SearchInputArea
							placeholder="Search Users"
							setSearchQuery={setSearchQuery}
						/>
						<img alt="Search" src={search} aria-hidden="true" />
					</div>
					<AppUsersAddComp
						openForm={() => setShowAddUsersModal(true)}
						onClick={() => refreshReduxState()}
						appId={app_id}
					/>
					<div className="d-flex flex-row">
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
						{showAddUsersModal && (
							<AddUserApplication
								handleClose={() => setShowAddUsersModal(false)}
								isOpen={showAddUsersModal}
								handleSubmit={handleAddManualUsage}
								submitting={submittingAddUser}
							/>
						)}
					</div>
				</div>
			</div>
			{loadingUnmappedLicenseData ? (
				<>
					<div className="unmapped_license_data_bar "></div>
				</>
			) : (
				Array.isArray(unmappedLicenseData) &&
				unmappedLicenseData.length > 0 &&
				showMapLicenseDialog() && (
					<>
						<div className="unmapped_license_data_bar ">
							<div
								style={{
									height: "42px",
									width: "42px",
								}}
							>
								<CircularProgressbar
									value={
										totalLicensesCount -
										unmappedLicenseCount
									}
									maxValue={totalLicensesCount}
									text={`${
										(
											((totalLicensesCount -
												unmappedLicenseCount) /
												totalLicensesCount) *
											100
										).toFixed(1) || 0
									}%`}
									styles={{
										root: {},
										path: {
											stroke: "#FFB169",
										},
										text: {
											fill: "#222222",
											fontSize: "22px",
											lineHeight: "26px",
										},
									}}
									strokeWidth={15}
								/>
							</div>
							<div className="font-14 grey ml-2">
								{`${unmappedLicenseCount} Unmapped Licenses`}{" "}
							</div>
							<div className="unmapped_license_bar_licenses">
								{unmappedLicenseData.map((el) => (
									<div
										className="d-flex flex-column "
										style={{ marginRight: "15px" }}
									>
										<div className="font-10 grey-1 o-8">
											{el.license_name}
										</div>
										<div className="d-flex  mt-2 align-items-center">
											<div className="bold-600 font-14">
												{el.unmapped_license_count}
											</div>
											<div
												className="bold-600 font-12 ml-1"
												style={{ marginTop: "2px" }}
											>
												Unmapped
											</div>
										</div>
									</div>
								))}
							</div>
							<div
								className="ml-auto font-12 primary-color cursor-pointer"
								onClick={() =>
									history.push({
										pathname: `/licenses/mapping/${contract_id}`,
										state: {
											data: contract_data,
											id: contract_id,
											unmappedLicenseData:
												unmappedLicenseData,
										},
									})
								}
							>
								MAP USERS
							</div>
						</div>
					</>
				)
			)}

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
							appliedFilters={metaData?.filter_by}
							metaData={metaData}
							submitting={submitInProgress}
							validationErrors={formErrors}
							clearValidationErrors={() => setFormErrors([])}
							style={{ zIndex: "1" }}
							appSourceList={userSourceList}
							appLicenseList={appLicenseList}
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

CommonUsersTableFilter.propTypes = {
	setSearchQuery: PropTypes.func.isRequired,
};
