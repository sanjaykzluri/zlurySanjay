import React, { Component, Fragment } from "react";
import search from "../../../assets/search.svg";
import Add from "../../../assets/add.svg";
import "./Users.css";
import refresh_icon from "../../../assets/icons/refresh.svg";
import { connect } from "react-redux";
import { applicationConstants } from "../../../constants";
import { AddUserApplication } from "./Modals/AddUserApplication";
import { addManualUsage } from "../../../services/api/users";
import { ErrorModal } from "../../../modules/shared/components/ManualUsage/ErrorModal/ErrorModal";
import RoleContext from "../../../services/roleContext/roleContext";
import { isBasicSubscriptionSelector } from "../../../common/restrictions";
import InlineLicenceAssg from "../../LicenceAssignment/InlineLicenceAssg";
import RoleAssignment from "../../RoleAssignment/RoleAssignment";
import _ from "underscore";
import FilterIcons from "../../../common/filterIcons";
import { preventScroll } from "../../../actions/ui-action";
import { ColumnRenderingModal } from "../../Users/Applications/Modals/ColumnRenderingModal";
import { FilterRenderingModal } from "../../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import Chips from "../../Users/Applications/Modals/FiltersRenderer/Chip";
import BulkUnassignLicense from "../../LicenceAssignment/BulkUnassignLicense";
import { SearchInputArea } from "../../searchInputArea";
import { exportApplicationUserCSV } from "services/api/applications";
import ExportModal from "common/Export/ExportModal";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import { Dropdown } from "react-bootstrap";
import rightarrow from "assets/users/rightarrow.svg";
import BulkUpdateModal from "common/BulkEditModal";
import {
	bulkArchiveAppUsers,
	bulkUnarchiveAppUsers,
} from "services/api/applications";
import { showNotificationCard } from "modules/licenses/utils/LicensesUtils";
import BulkRunAPlaybook from "modules/workflow/components/BulkRunAPlaybook/BulkRunAPlaybook";
import { getValueFromLocalStorage } from "utils/localStorage";
import AppUsersAddComp from "modules/applications/components/Users/AppUsersAddComp";

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
			className="cursor-pointer insidedropdown__allapps__table"
			ref={ref}
			onClick={(e) => onClick(e)}
		>
			{children}
		</a>
	)
);
const data = [];
class UsersFilterComp extends Component {
	static contextType = RoleContext;

	constructor(props) {
		super(props);

		this.state = {
			addUsersShow: false,
			manualRefresh: false,
			submitting: false,
			refreshTableDueToUsage: false,
			showError: false,
			error: false,
			isViewer: false,
			selectedRows: [],
			selectedUsers: [],
			selectedUsersLicences: [],
			selectedUserIds: [],
			selectedUserRoles: [],
			showHide: false,
			submitInProgress: false,
			showBulkUpdateArchiveModal: false,
			archiveType: "",
			bulkPrimarySourceChoice: null,
			bulkUpdateModalType: "",
		};
		this.handleRefreshState = this.handleRefreshState.bind(this);
		this.handleAddManualUsage = this.handleAddManualUsage.bind(this);
		this.setRefreshTableDueToUsage =
			this.setRefreshTableDueToUsage.bind(this);
		this.refreshReduxState = this.refreshReduxState.bind(this);
		this.clickedOnSearch = this.clickedOnSearch.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.addHideAppClose = this.addHideAppClose.bind(this);
	}

	componentDidMount() {
		this.setState({
			isViewer: this.context?.isViewer,
		});
	}

	handleAddManualUsage = async ({ userId, frequency, interval }) => {
		try {
			const appId = window.location.pathname.split("/")[2];
			this.setState({
				...this.state,
				submitting: true,
			});
			const res = await addManualUsage(
				userId,
				appId,
				frequency,
				interval
			);
			if (res.status === "success") {
				this.setState({
					...this.state,
					submitting: false,
					addUsersShow: false,
					refreshTableDueToUsage: true,
				});
				this.refreshReduxState();
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
			this.setState({
				...this.state,
				submitting: false,
				addUsersShow: false,
				error: errMessage,
				showError: true,
			});
		}
	};

	setRefreshTableDueToUsage(value) {
		this.setState({
			...this.state,
			refreshTableDueToUsage: value,
		});
	}

	refreshReduxState() {
		!this.props.isLoadingData && this.props.handleRefresh();
		this.props.setChecked([]);
		//Segment Implementation
		window.analytics.track("Refresh Button Clicked", {
			currentCategory: "Applications",
			currentPageName: "Application-Users",
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
		});
	}

	handleRefreshState() {
		this.setState({ manualRefresh: false });
	}

	clickedOnSearch() {
		//Segment Implementation
		window.analytics.track("Clicked on Search Users", {
			currentCategory: "Applications",
			currentPageName: "Application-Users",
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
		});
	}

	addHideAppClose() {
		this.props.setShowColumnsModal(false);
		this.props.setShowFilterModal(false);
		this.setState({ showHide: false });
	}

	handleSubmit(reqObj, isColumnSorting) {
		this.addHideAppClose();
	}

	render() {
		let addUsersClose = () => this.setState({ addUsersShow: false });
		return (
			<>
				<div className="top__Uploads">
					<div className="Uploads__left">
						<FilterIcons
							preventScroll={preventScroll}
							isLoadingData={this.props.isLoadingData}
							setShowFilterModal={this.props.setShowFilterModal}
							setShowColumnsModal={this.props.setShowColumnsModal}
							metaData={this.props.metaData}
						/>
					</div>
					{this.props.showColumnsModal && (
						<>
							<div className="modal-backdrop show"></div>
							<div className="modal d-block">
								<ColumnRenderingModal
									handleSubmit={this.handleSubmit}
									show={this.state.showHide}
									onHide={this.addHideAppClose}
									submitting={this.state.submitInProgress}
									listOfColumns={this.props.listOfColumns}
									setListOfColumns={
										this.props.setListOfColumns
									}
									columnsMapper={this.props.columnsMapper}
									style={{ zIndex: "1" }}
									usedColumns={this.props.usedColumns}
									metaData={this.props.metaData}
									keyField={"_id"}
								/>
							</div>
						</>
					)}
					{this.props.showFilterModal && (
						<>
							<div className="modal-backdrop show"></div>
							<div className="modal d-block">
								<FilterRenderingModal
									handleSubmit={this.handleSubmit}
									show={this.state.showHide}
									onHide={this.addHideAppClose}
									filterPropertyList={this.props.propertyList}
									appliedFilters={
										this.props.searchQuery &&
										this.props.searchQuery?.length
											? []
											: this.props.metaData?.filter_by
									}
									metaData={this.props.metaData}
									submitting={this.state.submitInProgress}
									style={{ zIndex: "1" }}
									appSourceList={this.props.appSourceList}
									appLicenseList={this.props.appLicenseList}
								/>
							</div>
						</>
					)}
					<div className="Uploads__right">
						{this.props.checked.length > 0 ? (
							<Fragment>
								<BulkRunAPlaybook
									userIds={this.props.checked}
									className="mr-3 z-index-60"
									appIdforMiniPlaybook={
										window.location.pathname.split("/")[2]
									}
									pageLocation={"Application-Users"}
								/>
								<Dropdown>
									<Dropdown.Toggle as={bulk_edit_menu}>
										<div className="grey">Bulk Edit</div>
										<img
											src={arrowdropdown}
											style={{ marginLeft: "8px" }}
										/>
									</Dropdown.Toggle>
									<Dropdown.Menu className="p-0">
										<Dropdown>
											<Dropdown.Toggle
												as={inner_bulk_edit_dropdown}
											>
												<div className="grey">
													Archive/Unarchive
												</div>
												<img
													src={rightarrow}
													style={{
														marginLeft: "8px",
													}}
												/>
											</Dropdown.Toggle>
											<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
												<Dropdown.Item
													onClick={() => {
														this.setState({
															bulkUpdateModalType:
																"archive",
															showBulkUpdateArchiveModal: true,
															archiveType:
																"archive",
														});
													}}
												>
													<div className="d-flex flex-row align-items-center">
														Archive
													</div>
												</Dropdown.Item>
												<Dropdown.Item
													onClick={() => {
														this.setState({
															bulkUpdateModalType:
																"archive",
															showBulkUpdateArchiveModal: true,
															archiveType:
																"unarchive",
														});
													}}
												>
													<div className="d-flex flex-row align-items-center">
														Unarchive
													</div>
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
										{/* <Dropdown>
											<Dropdown.Toggle
												as={inner_bulk_edit_dropdown}
											>
												<div className="grey">
													Set Primary Source
												</div>
												<img
													src={rightarrow}
													style={{
														marginLeft: "8px",
													}}
												/>
											</Dropdown.Toggle>
											<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
												<div className="background-white-on-hover dropdown-item p-0">
													<SearchSelect
														show={true}
														onSelect={(choice) =>
															this.setState({
																bulkUpdateModalType:
																	"source",
																bulkPrimarySourceChoice:
																	choice,
																showBulkUpdateArchiveModal: true,
															})
														}
														keyFields={{
															name: "name",
															image: "logo",
														}}
														allowFewSpecialCharacters={
															true
														}
														optionsPresent={true}
														options={
															this.props
																.bulkEditSourceList
														}
													/>
												</div>
											</Dropdown.Menu>
										</Dropdown> */}
										<div className=" cursor-pointer insidedropdown__allapps__table">
											<BulkUnassignLicense
												licenses={
													this.props
														.selectedUsersLicences
												}
												users={this.props.selectedUsers}
												appId={
													window.location.pathname.split(
														"/"
													)[2]
												}
												appName={this.props.app_name}
												appLogo={this.props.app_logo}
												refresh={this.refreshReduxState}
											/>
										</div>
										<div className=" cursor-pointer insidedropdown__allapps__table">
											<InlineLicenceAssg
												isBulkAssign={true}
												licences={
													this.props
														.selectedUsersLicences
												}
												appId={
													window.location.pathname.split(
														"/"
													)[2]
												}
												appName={this.props.app_name}
												appLogo={this.props.app_logo}
												users={this.props.selectedUsers}
												refresh={this.refreshReduxState}
											/>
										</div>
										<div className=" cursor-pointer insidedropdown__allapps__table">
											<RoleAssignment
												isBulkAssign={true}
												userIds={this.props.checked}
												appId={
													window.location.pathname.split(
														"/"
													)[2]
												}
												refresh={this.refreshReduxState}
												currentRoles={_.uniq(
													this.props.selectedUserRoles
												)}
											/>
										</div>
									</Dropdown.Menu>
								</Dropdown>
							</Fragment>
						) : null}
						<div className="inputWithIconApps">
							<SearchInputArea
								placeholder="Search Users"
								setSearchQuery={this.props.setSearchQuery}
							/>
							<img src={search} aria-hidden="true" />
						</div>
						<div className="d-flex flex-row">
							<ExportModal
								title="Export Application User Data"
								propertyList={this.props.propertyList}
								mandatoryFieldId="user_name"
								mandatoryFieldName="User Name"
								hiddenPropertiesArray={["user_id", "user_name"]}
								customFieldPropertyId="user_custom_fields"
								customFieldEntity="users"
								exportEntity="users"
								selectedDataFieldId="user_id"
								selectedData={this.props.checked}
								metaData={this.props.metaData}
								id={this.props.appId}
								exportCSV={exportApplicationUserCSV}
								exportScheduleName="Application-Users Export"
								scheduleEntity="applications_users"
							/>
							{!this.state.isViewer && (
								<AppUsersAddComp
									openForm={() =>
										this.setState({ addUsersShow: true })
									}
									appId={this.props.appId}
									onSuccess={() => this.props.handleRefresh()}
								/>
							)}
							<button
								className="appsad"
								onClick={() => this.props.handleRefresh()}
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
						{this.state.addUsersShow && (
							<AddUserApplication
								handleClose={() =>
									this.setState({ addUsersShow: false })
								}
								isOpen={this.state.addUsersShow}
								handleSubmit={this.handleAddManualUsage}
								submitting={this.state.submitting}
							/>
						)}
					</div>
				</div>
				<Chips
					searchQuery={this.props.searchQuery}
					text={"Users"}
					metaData={this.props.metaData}
					isInfiniteTable={true}
				/>
				{this.state.showError && (
					<ErrorModal
						isOpen={this.state.showError}
						handleClose={() => {
							this.setState({
								...this.state,
								showError: false,
								error: null,
							});
						}}
						errorMessage={this.state.error}
					/>
				)}
				{this.state.showBulkUpdateArchiveModal && (
					<BulkUpdateModal
						isOpen={this.state.showBulkUpdateArchiveModal}
						updateFunc={
							this.state.archiveType === "archive"
								? bulkArchiveAppUsers
								: bulkUnarchiveAppUsers
						}
						successResponse={() => {
							showNotificationCard();
							this.refreshReduxState();
						}}
						closeModal={() => {
							this.setState({
								showBulkUpdateArchiveModal: false,
							});
						}}
						selectedData={this.props.selectedUsers}
						name={
							this.state.bulkUpdateModalType === "archive"
								? this.props.app_name
								: this.state.bulkPrimarySourceChoice.name
						}
						parentId={window.location.pathname.split("/")[2]}
						modalType={
							this.state.bulkUpdateModalType === "archive"
								? "archive"
								: "source"
						}
						checked={this.props.checked}
						type={"user"}
						tooltipInfo={"user_name"}
						additionalCheckPresent={false}
						archiveType={this.state.archiveType}
						appName={this.props.app_name}
						api_entity={"user_app_ids"}
					></BulkUpdateModal>
				)}
			</>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		isBasicSubscription: isBasicSubscriptionSelector(state),
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		callRefresh: () => {
			dispatch({
				type: applicationConstants.DELETE_SINGLE_APPLICATION_USERS_CACHE,
			});
		},
	};
};

export const UsersFilter = connect(
	mapStateToProps,
	mapDispatchToProps
)(UsersFilterComp);
