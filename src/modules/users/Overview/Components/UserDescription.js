import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";
import group from "../../../../assets/users/group.svg";
import service from "../../../../assets/users/service.svg";
import ExternalUser from "../../../../assets/users/external_user.svg";
import {
	usersConstants,
	userStatus,
	userType,
} from "../../../../constants/users";
import RoleContext from "../../../../services/roleContext/roleContext";
import EllipsisSVG from "../../../../assets/icons/ellipsis-v.svg";
import { Link, useHistory, useLocation } from "react-router-dom";
import rightarrow from "../../../../assets/users/rightarrow.svg";

import {
	Dropdown,
	OverlayTrigger,
	Tooltip as BootstrapTooltip,
	Tooltip,
} from "react-bootstrap";
import { capitalizeFirstLetter } from "../../../../utils/common";
import {
	fetchUserActionHistory,
	fetchUserDetails,
} from "../../../../components/Users/redux";
import {
	archiveUsers,
	patchUser,
	unArchiveUsers,
	updateUser,
} from "../../../../services/api/users";
import { WORFKFLOW_TYPE } from "../../../workflow/constants/constant";
import { MergeUsers } from "../../../../components/Applications/Overview/MergeUsers";
import ArchiveModal from "../../../../common/ArchiveModal/ArchiveModal";
import UserTypeModal from "../../../../common/UserTypeModal/UserTypeModal";
import { EmailAliasModal } from "../../../../components/Users/Applications/Modals/EmailAliasModal";
import { ChangeStatus } from "../../../../components/Users/ChangeStatus";
import ActionLogHistory from "../../../../components/Users/ActionLogHistory/ActionLogHistory";
import editcolumns from "../../../../assets/applications/editcolumns.svg";
import { OverviewFieldLoaderCard } from "../../../licenses/components/SingleContract/ContractDescription";
import OverviewField from "../../../../components/Applications/SecurityCompliance/OverviewField";
import { ChangeDesignation } from "../../../../components/Users/Overview/ChangeDesignation";
import UserInfoTableComponent from "../../../../common/UserInfoTableComponent";
import { CUSTOM_FIELD_ENTITY } from "../../../custom-fields/constants/constant";
import UserSourceIconAndCard from "../../components/UserSourceIconAndCard";
import { UserSourceList } from "../../components/UserSourceList";
import { StatusDropdown } from "./StatusDropdown";
import { Dots } from "../../../../common/DottedProgress/DottedProgress";
import { trackPageSegment } from "modules/shared/utils/segment";
import { CustomFieldSectionInOverview } from "modules/shared/containers/CustomFieldSectionInOverview/CustomFieldSectionInOverview";
import { openModal } from "reducers/modal.reducer";
import { dateResetTimeZone } from "utils/DateUtility";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		<img src={EllipsisSVG} width="20" />
	</a>
));
const insideDropdown = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer insidedropdown__overviewusers"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		Change User Type
		<img src={rightarrow} style={{ marginLeft: "10px" }}></img>
	</a>
));

const UserDepartment = ({ user }) => {
	return (
		<div>
			<Link
				to={`/departments/${encodeURI(
					user?.user_department?.department_id
				)}#overviewdep`}
				className="custom__app__name__css text-decoration-none"
			>
				<LongTextTooltip
					text={user?.user_department?.department_name_path}
					maxWidth={200}
					style={{
						color: "#222222",
					}}
				/>
			</Link>
		</div>
	);
};

export function UserDescription({
	refreshUsers,
	onUserChange,
	userAccountTypeChangedFromOverview,
	user,
}) {
	const history = useHistory();
	const location = useLocation();
	const dispatch = useDispatch();
	const id = location.pathname.split("/")[2];
	const { userInfo } = useSelector((state) => state);
	const defaultTab =
		userInfo?.user_tabs?.find((option) => option.isDefault)?.name ||
		"employees";

	const [showHide, setShowHide] = useState(false);
	const [showChangeStatusPopup, setShowChangeStatusPopup] = useState(false);
	const [statusToUpdate, setStatusToUpdate] = useState("");
	let [showMergeUserModal, setShowMergeUserModal] = useState(false);
	const [showUserHistory, setShowUserHistory] = useState(false);
	const [showChangeUserTypeModal, setShowChangeUserTypeModal] =
		useState(false);
	const [userTypeForModal, setUserTypeForModal] = useState("");
	const [isUserArchived, setIsUserArchived] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	let [mergeTargetUser, setMergeTargetUser] = useState(null);
	const [userSubmitInProgress, setUserSubmitState] = useState(false);
	const [userFormErrors, setUserFormErrors] = useState([]);
	let [showEmailAliasModal, setShowEmailAliasModal] = useState(false);
	const [showLogsMenu, setShowLogsMenu] = useState(false);
	const [openUserSourceList, setOpenUserSourceList] = useState(false);
	const userTabs = useSelector((state) => state.userInfo.user_tabs);

	const actionHistory = useSelector((state) => state.userActionHistory);

	const { isViewer } = useContext(RoleContext);

	const clickedOnEdit = () => {
		if (user) {
			dispatch(
				openModal("user", {
					user: {
						user_id: user.user_id,
						user_name: user.user_name,
						user_email: user.user_email,
						user_designation: user.user_designation,
						user_department: user.user_department.department_name_path,
						user_department_id: user.user_department.department_id,
						user_status: user.user_status,
						user_custom_fields: user.user_custom_fields || [],
						user_profile: user.user_profile_img,
						account_type: user.user_account_type,
						user_personal_email: user.user_personal_email,
						reporting_manager_id:
							user.user_reporting_manager
								.user_reporting_manager_id,
						reporting_manager_name:
							user.user_reporting_manager
								.user_reporting_manager_name,
						reporting_manager_profile:
							user.user_reporting_manager
								.user_reporting_manager_profile_img,
						owner_id: user.user_owner.user_owner_id,
						owner_name: user.user_owner.user_owner_name,
						owner_profile: user.user_owner.user_owner_profile_img,
						is_integration_department: user.user_department?.is_integration_department
					},
					onUserChange,
					deptFieldDisabled: user.user_department?.is_integration_department
				})
			);
		}
	};

	const openUserSourceListModal = () => {
		setOpenUserSourceList(true);
	};

	const clickedOnAddApp = () => {
		history.push("#applications");
	};

	const changeStatus = (status) => {
		setStatusToUpdate(status);
		setShowChangeStatusPopup(true);
	};

	const fetchActionHistory = () => {
		dispatch(fetchUserActionHistory(id));
	};

	function handleChangeUserType(value) {
		setUserTypeForModal(value);
		setShowChangeUserTypeModal(!showChangeUserTypeModal);
	}

	function handleArchivingUsers() {
		setShowArchiveModal(!showArchiveModal);
		trackPageSegment("Users", "Single User - Archive Users", {
			userId: user?.uses_id,
			userName: user?.user_name,
		});
	}

	useEffect(() => {
		fetchActionHistory();
	}, []);
	function handleUnArchivingUsers() {
		trackPageSegment("Users", "Single User - Unarchive Users", {
			userId: user?.uses_id,
			userName: user?.user_name,
		});
		try {
			unArchiveUsers([user?.user_id]).then((res) => {
				if (res.status === "success") {
					setIsUserArchived(false);
					dispatch(fetchUserDetails(id));
					dispatch({
						type: usersConstants.DELETE_USERS_CACHE,
					});
				} else {
					console.log(
						"Response is not as expectedwhen unArchiving user",
						res
					);
				}
			});
		} catch (error) {
			console.log(error, "Error when unArchiving the user");
		}
	}

	const toWorkflow = (type) => {
		history.push({
			pathname: "/creating/workflow",
			state: { users: [user], type },
		});
	};

	function handleMergeComplete() {
		setShowMergeUserModal(false);
		setMergeTargetUser(null);
		history.push(`/users#${defaultTab}`);
	}

	const handleUserChange = (user) => {
		setUserSubmitState(true);
		setUserFormErrors([]);

		updateUser(user.user_id, user)
			.then((res) => {
				setUserSubmitState(false);
				onUserChange();
				setShowHide(false);
			})
			.catch((err) => {
				console.error("Error updating user:", err);

				setUserSubmitState(false);
				if (err.response && err.response.data) {
					setUserFormErrors(err.response.data.errors);
				}
			});
	};

	const getProfileImage = () => {
		return (
			<GetImageOrNameBadge
				url={user.user_profile_img}
				name={user.user_name}
				height={40}
				width={40}
				borderRadius="50%"
			/>
		);
	};

	const longTimeFormat = new Intl.DateTimeFormat("en", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

	function handleEmailAlias() {
		setShowEmailAliasModal(true);
	}

	return (
		<>
			<div className="d-flex flex-column">
				<div className="d-flex align-items-center justify-content-between">
					<div className="d-flex align-items-center">
						{getProfileImage()}
						<div
							className="overview__logodata"
							style={{ marginLeft: "16px" }}
						>
							<div className="overview__logodata1">
								<OverlayTrigger
									placement="top"
									overlay={
										<BootstrapTooltip>
											{user && user.user_name
												? user.user_name
												: ""}
										</BootstrapTooltip>
									}
								>
									<div
										className="truncate_10vw"
										style={{ maxWidth: "180px " }}
									>
										{user && user.user_name
											? user.user_name
											: ""}
									</div>
								</OverlayTrigger>
								<OverlayTrigger
									placement="top"
									overlay={
										<BootstrapTooltip>
											<span className="text-capitalize">
												{user.user_is_external
													? "External User"
													: user.user_account_type}
											</span>
										</BootstrapTooltip>
									}
								>
									<div>
										{user.user_is_external ? (
											<img
												src={ExternalUser}
												width={22}
												style={{
													marginLeft: "6px",
												}}
											></img>
										) : user.user_account_type ===
										  userType.SERVICE ? (
											<img
												src={service}
												width={22}
												style={{
													marginLeft: "6px",
												}}
											></img>
										) : user.user_account_type ===
										  userType.GROUP ? (
											<img
												src={group}
												width={22}
												style={{
													marginLeft: "6px",
												}}
											></img>
										) : null}
									</div>
								</OverlayTrigger>
							</div>
							<div className="overview__logodata2">
								{user ? user.user_email : ""}
							</div>
						</div>
					</div>

					<div
						style={{
							display: "flex",
							alignItems: "center",
						}}
					>
						{/* {!isViewer && (
								<button
									type="submit"
									className="overview__editbutton"
									onClick={clickedOnEdit}
								>
									<span id="overview__text1">Edit</span>
								</button>
							)} */}
						<Dropdown className="ml-2">
							<Dropdown.Toggle as={ellipsis} />
							<Dropdown.Menu>
								{!isViewer && (
									<>
										<Dropdown.Item
											onClick={clickedOnAddApp}
										>
											Add App
										</Dropdown.Item>
										{Object.keys(userStatus).map(
											(status) => {
												if (
													typeof user.user_status ===
														"string" &&
													typeof userStatus[
														status
													] === "string" &&
													userStatus[
														status
													]?.toLocaleLowerCase() ===
														user.user_status?.toLocaleLowerCase()
												)
													return null;
												return (
													<Dropdown.Item
														onClick={() => {
															changeStatus(
																userStatus[
																	status
																]
															);
														}}
													>
														Mark as{" "}
														{capitalizeFirstLetter(
															userStatus[status]
														)}
													</Dropdown.Item>
												);
											}
										)}
										<Dropdown.Divider className="mx-3 my-1" />
									</>
								)}

								<Dropdown.Item
									onClick={() => {
										setShowMergeUserModal(true);
										trackPageSegment(
											"Users",
											"Single User - Merge Users Modal",
											{
												userId: user?.uses_id,
												userName: user?.user_name,
											}
										);
									}}
								>
									Merge with another user
								</Dropdown.Item>
								<Dropdown.Item
									onClick={() => {
										setShowUserHistory(true);
										fetchActionHistory();
										trackPageSegment(
											"Users",
											"Single User - Action History Modal",
											{
												userId: user?.uses_id,
												userName: user?.user_name,
											}
										);
									}}
								>
									View Action History
								</Dropdown.Item>
								{!isViewer && (
									<Dropdown drop="start">
										<Dropdown.Toggle
											as={insideDropdown}
										></Dropdown.Toggle>
										<Dropdown.Menu className="innerdropdownmenu__overviewusers">
											{Object.keys(userType).map(
												(type) => {
													if (
														typeof user.user_account_type ===
															"string" &&
														typeof userType[
															type
														] === "string" &&
														userType[
															type
														]?.toLocaleLowerCase() ===
															user.user_account_type?.toLocaleLowerCase()
													)
														return null;
													return (
														<Dropdown.Item
															onClick={() => {
																handleChangeUserType(
																	userType[
																		type
																	]
																);
															}}
														>
															Mark as{" "}
															{capitalizeFirstLetter(
																userType[type]
															)}
														</Dropdown.Item>
													);
												}
											)}
										</Dropdown.Menu>
									</Dropdown>
								)}
								{!isViewer && (
									<>
										<Dropdown.Divider className="mx-3 my-1" />
										{!(
											isUserArchived || user?.user_archive
										) ? (
											<Dropdown.Item
												onClick={handleArchivingUsers}
											>
												Archive User
											</Dropdown.Item>
										) : (
											<Dropdown.Item
												onClick={handleUnArchivingUsers}
											>
												Un-archive User
											</Dropdown.Item>
										)}
									</>
								)}
								<Dropdown.Divider className="mx-3 my-1" />
								<Dropdown.Item
									onClick={() =>
										toWorkflow(WORFKFLOW_TYPE.ONBOARDING)
									}
								>
									Onboard User
								</Dropdown.Item>
								<Dropdown.Item
									onClick={() =>
										toWorkflow(WORFKFLOW_TYPE.OFFBOARDING)
									}
								>
									Offboard User
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
						{showMergeUserModal && (
							<MergeUsers
								show={showMergeUserModal}
								user={user}
								targetUser={mergeTargetUser}
								onMergeComplete={() => handleMergeComplete()}
								onHide={() => {
									setShowMergeUserModal(false);
									setMergeTargetUser(null);
								}}
							/>
						)}
						{showArchiveModal && (
							<ArchiveModal
								isOpen={showArchiveModal}
								ArchiveFunc={archiveUsers}
								successResponse={() => {
									setIsUserArchived(true);
									const id = location.pathname.split("/")[2];
									dispatch(fetchUserDetails(id));
									dispatch({
										type: usersConstants.DELETE_USERS_CACHE,
									});
								}}
								closeModal={() => {
									setShowArchiveModal(false);
								}}
								name={user.user_name}
								id={user.user_id}
								type="user"
							/>
						)}
						{showChangeUserTypeModal && (
							<UserTypeModal
								isOpen={showChangeUserTypeModal}
								closeModal={() =>
									setShowChangeUserTypeModal(false)
								}
								successResponse={() => {
									const id = location.pathname.split("/")[2];
									dispatch(fetchUserDetails(id));
									dispatch({
										type: usersConstants.DELETE_USERS_CACHE,
									});
									userAccountTypeChangedFromOverview(
										userTypeForModal
									);
								}}
								UserTypeFunc={patchUser}
								id={user.user_id}
								type={userTypeForModal}
							></UserTypeModal>
						)}
					</div>
				</div>
				<div
					className="d-flex align-items-center justify-content-between"
					style={{ marginTop: "20px" }}
				>
					<div style={{ width: "270px" }}>
						{user?.user_archive ? (
							<>
								<div className="autho__dd__cont w-100">
									<Dots color={"#717171"}></Dots>
									<div className="ml-2">Archived</div>
								</div>
							</>
						) : (
							<StatusDropdown
								user={user}
								changeStatus={changeStatus}
							></StatusDropdown>
						)}
					</div>

					{!isViewer && (
						<img
							style={{ position: "relative", top: "3px" }}
							type="submit"
							src={editcolumns}
							onClick={clickedOnEdit}
						></img>
					)}
				</div>
				<hr
					style={{
						margin: "15px 0px 20px ",
					}}
				/>
				{user && !user.loading ? (
					<>
						<div className="d-flex flex-column">
							<OverviewField
								label="TYPE"
								value={
									<div className="ml-1">
										{capitalizeFirstLetter(
											user?.user_account_type
										)}
									</div>
								}
								dataUnavailable={!user?.user_account_type}
								className="d-flex justify-content-between align-items-center mb-3"
							/>
							<OverviewField
								label="DESIGNATION"
								value={
									<ChangeDesignation
										user={user}
										marginRquired={true}
										refreshReduxState={() => {
											refreshUsers();
										}}
									/>
								}
								dataUnavailable={!user?.user_designation}
								className="d-flex justify-content-between align-items-center mb-3"
							/>
							<OverviewField
								label="DEPARTMENT"
								value={<UserDepartment user={user} />}
								dataUnavailable={
									!user?.user_department?.department_name_path
								}
								className="d-flex justify-content-between align-items-center mb-3"
							/>
							{user?.user_owner?.user_owner_id &&
								(user.user_account_type === userType.SERVICE ||
									user.user_account_type ===
										userType.GROUP) && (
									<OverviewField
										label="OWNER"
										value={
											<UserInfoTableComponent
												user_id={
													user?.user_owner
														?.user_owner_id
												}
												user_name={
													user?.user_owner
														?.user_owner_name
												}
												user_profile={
													user?.user_owner
														?.user_owner_profile_img
												}
											/>
										}
										dataUnavailable={
											!user?.user_owner?.user_owner_id
										}
										className="d-flex justify-content-between align-items-center mb-3"
									/>
								)}
							{user?.user_reporting_manager
								?.user_reporting_manager_id && (
								<OverviewField
									label="REPORTING MANAGER"
									value={
										<UserInfoTableComponent
											user_id={
												user?.user_reporting_manager
													?.user_reporting_manager_id
											}
											user_name={
												user?.user_reporting_manager
													?.user_reporting_manager_name
											}
											user_profile={
												user?.user_reporting_manager
													?.user_reporting_manager_profile_img
											}
										/>
									}
									dataUnavailable={
										!user?.user_reporting_manager
											?.user_reporting_manager_id
									}
									className="d-flex justify-content-between align-items-center mb-3"
								/>
							)}
							<OverviewField
								label="ADDED ON"
								value={
									user.user_added_on
										? longTimeFormat.format(
												new Date(user.user_added_on)
										  )
										: ""
								}
								dataUnavailable={!user?.user_added_on}
								className="d-flex justify-content-between align-items-center mb-3"
							/>
							<OverviewField
								label="ONBOARDING DATE"
								value={
									user?.user_onboard_offboard_details?.date
										? longTimeFormat.format(
												new Date(
													user?.user_onboard_offboard_details?.date
												)
										  )
										: ""
								}
								dataUnavailable={
									!user?.user_onboard_offboard_details?.date
								}
								className="d-flex justify-content-between align-items-center mb-3"
							/>
							{user?.user_cost_center_id && (
								<>
									<OverviewField
										label="COST CENTER NAME"
										value={user?.user_cost_center_name}
										dataUnavailable={
											!user?.user_cost_center_name
										}
										className="d-flex justify-content-between align-items-center mb-3"
									/>
									<OverviewField
										label="COST CENTER CODE"
										value={user?.user_cost_center_code}
										dataUnavailable={
											!user?.user_cost_center_code
										}
										className="d-flex justify-content-between align-items-center mb-3"
									/>
								</>
							)}
						</div>
					</>
				) : (
					<OverviewFieldLoaderCard />
				)}
				{user && !user.loading ? (
					<>
						<CustomFieldSectionInOverview
							customFieldData={user?.user_custom_fields || []}
							entityId={user?.user_id}
							cfEntitiy={CUSTOM_FIELD_ENTITY.USERS}
							patchAPI={patchUser}
							refresh={refreshUsers}
						/>
					</>
				) : (
					<OverviewFieldLoaderCard />
				)}
				<hr
					style={{
						margin: "15px 0px 20px ",
					}}
				/>
				{user && !user.loading ? (
					<div
						className="overview__middle__topcont"
						style={{
							marginRight: "20px",
						}}
					>
						<div className="d-flex align-items-center justify-content-between">
							<div className="securityoverview__item-name">
								EMAIL ALIASES
							</div>

							<span
								onClick={() => handleEmailAlias()}
								className="font-12 cursor-pointer primary-color cursor-pointer"
							>
								{" "}
								View All
							</span>
						</div>
						<div
							style={{
								marginTop: "12px",
								marginRight: "10px",
							}}
							className="overview__middle__topconttext2"
						>
							<span>{user?.user_email}</span>
							{user.user_email_aliases_count > 1 && (
								<span className="glow_blue font-14 ml-2">{`  + ${
									user.user_email_aliases_count - 1
								} more`}</span>
							)}
						</div>
					</div>
				) : (
					<OverviewFieldLoaderCard></OverviewFieldLoaderCard>
				)}
				<hr
					style={{
						margin: "15px 0px 20px ",
					}}
				/>
				{user && !user.loading ? (
					<div
						className="overview__middle__topcont"
						style={{
							marginRight: "20px",
						}}
					>
						<div className="d-flex align-items-center justify-content-between">
							<div className="securityoverview__item-name">
								SOURCES
							</div>

							<span
								onClick={openUserSourceListModal}
								className="font-12 cursor-pointer primary-color cursor-pointer"
							>
								{" "}
								View All
							</span>
						</div>
						<div
							style={{
								marginTop: "12px",
								marginRight: "10px",
							}}
							className="overview__middle__topconttext2"
						>
							{user?.user_source_array?.map((source, index) => (
								<>
									{index < 3 && (
										<UserSourceIconAndCard
											source={source}
											index={index}
											userId={id}
											refresh={refreshUsers}
											user={user}
											sources={
												user?.user_source_array || []
											}
											style={{ left: "120px" }}
										/>
									)}
								</>
							))}
							{Array.isArray(user?.user_source_array) &&
								user?.user_source_array.length > 3 && (
									<div
										className="font-12 primary-color cursor-pointer"
										onClick={openUserSourceListModal}
									>
										+ {user?.user_source_array?.length - 3}
									</div>
								)}
						</div>

						{openUserSourceList && (
							<UserSourceList
								sources={user?.user_source_array}
								user={user}
								userId={id}
								refresh={refreshUsers}
								setOpenUserSourceList={setOpenUserSourceList}
							/>
						)}
					</div>
				) : (
					<OverviewFieldLoaderCard></OverviewFieldLoaderCard>
				)}
			</div>
			{showChangeStatusPopup && (
				<ChangeStatus
					newStatus={statusToUpdate}
					user={user}
					isOpen={showChangeStatusPopup}
					handleClose={() => setShowChangeStatusPopup(false)}
				/>
			)}
			{showUserHistory && (
				<ActionLogHistory
					historyType="user"
					actionHistory={actionHistory}
					show={showUserHistory}
					onHide={() => setShowUserHistory(false)}
				/>
			)}
			{showEmailAliasModal && (
				<EmailAliasModal
					user={user}
					isOpen={showHide}
					submitInProgress={userSubmitInProgress}
					validationErrors={userFormErrors}
					handleSubmit={handleUserChange}
					handleClose={() => {
						setShowHide(false);
						setUserFormErrors([]);
					}}
					setShowEmailAliasModal={setShowEmailAliasModal}
					getProfileImage={getProfileImage}
				/>
			)}
		</>
	);
}
