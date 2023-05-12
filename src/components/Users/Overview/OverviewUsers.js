import React, { useContext, useEffect, useState } from "react";
import {
	Dropdown,
	OverlayTrigger,
	Tooltip as BootstrapTooltip,
} from "react-bootstrap";

import "./OverviewUsers.css";
import gravatar from "../../../assets/users/gravatar.svg";
import overview2 from "../../../assets/applications/overview2.svg";
import overview3 from "../../../assets/applications/overview3.svg";
import { Loader } from "../../../common/Loader/Loader";
import overview6 from "../../../assets/departments/overview6.svg";
import button2 from "../../Departments/Overview/button2.svg";
import deletebutton from "./delete.svg";
import { Link, useHistory } from "react-router-dom";
import uparrow from "../../Overview/uparrow.svg";
import emptySpendTrend from "../../Overview/spendEmpty.png";
import noData from "../../Overview/noData.svg";
import emptyUsage from "../../../assets/emptyUsage.png";
import downarrow from "../../../assets/downarrow.svg";
import rightarrow from "../../../assets/users/rightarrow.svg";
import commingSoon from "../../Applications/Recommendations/comingSoon.svg";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useLocation } from "react-router-dom";
import { TableNew2 } from "./TableNew2";
import { TableNew3 } from "./TableNew3";
import {
	archiveUsers,
	getUserInfo,
	getUserSpendGraphData,
	getUserUsageGraphData,
	patchUser,
	setUserBulkStatus,
	updateUser,
	unArchiveUsers,
} from "../../../services/api/users";
import ContentLoader from "react-content-loader";
import { ChangeStatus } from "../ChangeStatus";
import { ChangeStatus as ChangeStatusInline } from "../Overview/ChangeStatus";
import { ChangeDesignation } from "./ChangeDesignation";
import EllipsisSVG from "../../../assets/icons/ellipsis-v.svg";
import { userStatus, userType } from "../../../constants/users";
import dayjs from "dayjs";
import { NameBadge } from "../../../common/NameBadge";
import { NotesList } from "../../Notes/NotesList";
import { CustomFieldSectionInOverview } from "../../../modules/shared/containers/CustomFieldSectionInOverview/CustomFieldSectionInOverview";
import { CUSTOM_FIELD_ENTITY } from "../../../modules/custom-fields/constants/constant";
import { Popover } from "../../../UIComponents/Popover/Popover";
import ActionLogHistory from "../ActionLogHistory/ActionLogHistory";
import { fetchUserActionHistory, fetchUserDetails } from "../redux";
import { useDispatch, useSelector } from "react-redux";
import { capitalizeFirstLetter, unescape } from "../../../utils/common";
import { kFormatter } from "../../../constants/currency";
import ArchiveModal from "../../../common/ArchiveModal/ArchiveModal";
import UserTypeModal from "../../../common/UserTypeModal/UserTypeModal";
import { usersConstants } from "../../../constants/users";
import { format, MONTH } from "../../../utils/DateUtility";
import { CustomTooltip } from "../../Overview/NewGraph";
import RoleContext from "../../../services/roleContext/roleContext";
import { monthIdNameMap } from "../../Overview/util";
import { fetchAllUsers } from "../../../actions/users-action";
import overview_total_apps from "../../../assets/users/overview_total_apps.svg";
import group from "../../../assets/users/group.svg";
import service from "../../../assets/users/service.svg";
import ExternalUser from "../../../assets/users/external_user.svg";
import noRecommendations from "../../../assets/noRecommendations.svg";
import { createWorkflow } from "../../../modules/workflow/service/api";
import { WORFKFLOW_TYPE } from "../../../modules/workflow/constants/constant";
import { TriggerIssue } from "../../../utils/sentry";
import { EmailAliasModal } from "../Applications/Modals/EmailAliasModal";
import { MergeUsers } from "../../Applications/Overview/MergeUsers";
import SourceIcon from "../../../modules/shared/components/ManualUsage/TableComponents/SourceIcon";
import UserSourceIconAndCard from "../../../modules/users/components/UserSourceIconAndCard";
import { UserSourceList } from "../../../modules/users/components/UserSourceList";
import { getValueFromLocalStorage } from "utils/localStorage";

function clickedOnElipsis() {
	//Segment Implementation
	const pathname = window.location.pathname;
	const id = pathname.split("/")[2];

	window.analytics.track("Clicked on Elipsis", {
		currentCategory: "Users",
		currentPageName: "Overview",
		currentUserId: id,
		orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
		orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
	});
}
const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
			clickedOnElipsis();
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
class NoteList extends React.Component {
	render() {
		return (
			<>
				<div
					className="note__cont"
					style={{ marginRight: "16px", marginBottom: "10px" }}
				>
					<div className="notes__cont__d1">
						<div className="notes__cont__d1__l">
							{this.props.note.date}
						</div>
						<div className="notes__cont__d1__r">
							<button
								type="submit"
								className="notes__cont__button"
							>
								<img src={deletebutton} />
							</button>
						</div>
					</div>
					<hr style={{ margin: "7px 0px 0px 0px" }} />
					<div className="notes__cont__d2">
						{this.props.note.note}
					</div>
					<div className="notes__cont__d3">
						-{this.props.note.per}
					</div>
				</div>
			</>
		);
	}
}

function monthName(id) {
	return Intl.DateTimeFormat("en", { month: "long" }).format(id.toString());
}

export function OverviewUsers(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [showHide, setShowHide] = useState(false);
	const [showLogsMenu, setShowLogsMenu] = useState(false);
	const [spendData, setSpendData] = useState([]);
	const [spendDataKeys, setSpendDataKeys] = useState([]);
	const [spendTable, setspendTable] = useState([]);
	const [usageData, setUsageData] = useState([]);
	const [usageDataKeys, setUsageDataKeys] = useState([]);
	const [usageTable, setusageTable] = useState([]);
	const [spendloading, setspendloading] = useState(true);
	const [usageloading, setusageloading] = useState(true);
	const [userFormErrors, setUserFormErrors] = useState([]);
	const [showChangeStatus, setShowChangeStatus] = useState(true);
	const [userSubmitInProgress, setUserSubmitState] = useState(false);
	const [showChangeStatusPopup, setShowChangeStatusPopup] = useState(false);
	const [showUserHistory, setShowUserHistory] = useState(false);
	const { isViewer, partner } = useContext(RoleContext);
	const [statusToUpdate, setStatusToUpdate] = useState("");
	const [showAddTransactionModal, setShowAddTransactionModal] =
		useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [isUserArchived, setIsUserArchived] = useState(false);
	const [showChangeUserTypeModal, setShowChangeUserTypeModal] =
		useState(false);
	const [userTypeForModal, setUserTypeForModal] = useState("");
	//Need to update isUserArchived as per the app's data after mounting the dom
	const history = useHistory();
	const dispatch = useDispatch();
	const changeStatus = (status) => {
		setStatusToUpdate(status);
		setShowChangeStatusPopup(true);
	};
	const user = useSelector((state) => state.user);
	const actionHistory = useSelector((state) => state.userActionHistory);
	const userName = useSelector((state) => state.userInfo.userName);

	const longTimeFormat = new Intl.DateTimeFormat("en", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
	const location = useLocation();
	const id = location.pathname.split("/")[2];
	const fetchActionHistory = () => {
		const id = location.pathname.split("/")[2];
		dispatch(fetchUserActionHistory(id));
	};

	useEffect(() => {
		const id = location.pathname.split("/")[2];
		fetchActionHistory();
		let userInfo = JSON.parse(localStorage.getItem("userInfo"));

		const start_month = userInfo["org_fy_start_month"] || 4;
		const end_month = dayjs().month() + 1;
		const end_year = dayjs().year();
		const start_year = start_month > end_month ? end_year - 1 : end_year;

		//Segment Implementation
		if (props.user) {
			window.analytics.page("Users", "User-Overview", {
				user_name: props.user,
				user_id: id,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}

		getUserSpendGraphData(
			id,
			start_month,
			end_month,
			start_year,
			end_year
		).then((res) => {
			setspendloading(false);
			const color = [
				"#2266E2",
				"#FF6767",
				"#5CAF53",
				"#FFB169",
				"#6967E0",
				"#717171",
			];
			const data = res.spend_trend;
			let data2 = res.spend_table_data;

			if (data) {
				let datakeys = [];
				data.forEach((el) => {
					el.month_name = monthIdNameMap[el.month_id];
					el.applications.forEach((item) => {
						datakeys.push(item.application_name);
						el[item.application_name] = item.application_spend;
						el["Total"] = item.monthly_total;
					});
				});
				const uniq = [...new Set(datakeys)];

				uniq.sort((a, b) => (a > b ? 1 : -1));

				let obj = uniq.find((x) => x === "Total");
				let index = uniq.indexOf(obj);
				uniq.splice(index, 1);
				uniq.push(obj);
				let newuniq = new Array(uniq.length);
				for (var i = 0; i < uniq.length; i++) {
					newuniq[i] = [uniq[i], null];
				}
				for (var i = 0; i < newuniq.length; i++) {
					let obj3 = data2.find(
						(x) =>
							x.application_name?.toLowerCase() ===
							newuniq[i][0]?.toLowerCase()
					);
					newuniq[i][2] = obj3?.total_spend;
				}
				newuniq.sort(function (a, b) {
					return b[2] - a[2];
				});
				let obj4 = newuniq.find((x) => x[0]?.toLowerCase() === "total");
				let index4 = newuniq.indexOf(obj4);
				newuniq.splice(index4, 1);
				newuniq.unshift(obj4);
				if (newuniq.length > 6) {
					newuniq.length = 6;
				}
				if (newuniq.length > 0 && newuniq[0] != undefined) {
					color.length = newuniq.length;
					for (var j = 0; j < newuniq.length; j++) {
						newuniq[j] = [
							newuniq[j][0],
							color[Math.abs(color.length - newuniq.length - j)],
							newuniq[j][2],
						];
					}
				}
				data2.sort(function (a, b) {
					return b.total_spend - a.total_spend;
				});
				if (data2.length > 6) {
					data2.length = 6;
				}

				color.length = data2.length;
				var newArray = [];
				if (data2[0].application_name != "TOTAL") {
					for (var j = 0; j < data2.length; j++) {
						if (data2[j].application_name == "TOTAL") {
							newArray.unshift(data2[j]);
						} else {
							newArray.push(data2[j]);
						}
					}
					data2 = newArray;
				}
				for (var j = 0; j < data2.length; j++) {
					data2[j].color =
						color[Math.abs(color.length - data2.length - j)];
				}
				setSpendDataKeys(newuniq);
				data.sort(
					(a, b) => a.year_id - b.year_id || a.month_id - b.month_id
				);
				setSpendData(data);
				setspendTable(data2);
			}
		});

		getUserUsageGraphData(
			id,
			start_month,
			end_month,
			start_year,
			end_year
		).then((res) => {
			setusageloading(false);
			const color = [
				"#2266E2",
				"#FF6767",
				"#5CAF53",
				"#FFB169",
				"#6967E0",
				"#717171",
			];

			const data = res.usage_trend;
			let data2 = res.usage_table_data;
			if (data) {
				let datakeys = [];
				data.forEach((el) => {
					el.month_name = monthIdNameMap[el.month_id];

					el.applications.forEach((item) => {
						datakeys.push(item.application_name);
						el[item.application_name] = item.application_usage;
						el["Total"] = item.monthly_avg;
					});
				});
				const uniq = [...new Set(datakeys)];

				uniq.sort((a, b) => (a > b ? 1 : -1));

				let newuniq = new Array(uniq.length);
				for (var i = 0; i < uniq.length; i++) {
					newuniq[i] = [uniq[i], null];
				}

				for (var i = 0; i < newuniq.length; i++) {
					let obj3 = data2.find(
						(x) =>
							x.application_name.toLowerCase() ===
							newuniq[i][0].toLowerCase()
					);
					newuniq[i][2] = obj3?.total_usage || obj3?.average_usage;
				}
				newuniq.sort(function (a, b) {
					return b[2] - a[2];
				});
				let obj4 = newuniq.find((x) => x[0].toLowerCase() === "total");
				let index4 = newuniq.indexOf(obj4);
				newuniq.splice(index4, 1);
				newuniq.unshift(obj4);
				if (newuniq.length > 6) {
					newuniq.length = 6;
				}

				if (newuniq.length > 0 && newuniq[0] != undefined) {
					color.length = newuniq.length;
					for (var j = 0; j < newuniq.length; j++) {
						newuniq[j] = [
							newuniq[j][0],
							color[Math.abs(color.length - newuniq.length - j)],
							newuniq[j][2],
						];
					}
				}
				data2.sort((a, b) =>
					a.application_name > b.application_name ? 1 : -1
				);

				data2.sort(function (a, b) {
					return b.total_usage - a.total_usage;
				});
				let obj2 = data2.find(
					(x) => x.application_name.toLowerCase() === "total"
				);
				let index2 = data2.indexOf(obj2);
				data2.splice(index2, 1);
				data2.unshift(obj2);
				if (data2.length > 6) {
					data2.length = 6;
				}

				color.length = data2.length;
				var newArray = [];
				if (data2[0].application_name != "TOTAL") {
					for (var j = 0; j < data2.length; j++) {
						if (data2[j].application_name == "TOTAL") {
							newArray.unshift(data2[j]);
						} else {
							newArray.push(data2[j]);
						}
					}
					data2 = newArray;
				}
				for (var j = 0; j < data2.length; j++) {
					data2[j].color =
						color[Math.abs(color.length - data2.length - j)];
				}

				setUsageDataKeys(newuniq);
				data.sort(
					(a, b) => a.year_id - b.year_id || a.month_id - b.month_id
				);
				setUsageData(data);
				setusageTable(data2);
			}
		});

		setIsUserArchived(user.user_archive || false);
	}, []);

	const [notes, setNotes] = useState([
		{
			id: "1",
			note: "aaa",
			per: "AK",
			date: "11/11",
		},
		{
			id: "2",
			note: "aab",
			per: "AK",
			date: "11/11",
		},
	]);

	const addNote = () => {
		const tempNotes = [...notes];
		tempNotes.push({
			id: "1",
			note: "aaa",
			per: "AK",
			date: "11/11",
		});
		setNotes(tempNotes);
	};

	const getProfileImage = () => {
		const logo = user.user_profile_img;
		if (!logo) {
			return (
				<NameBadge
					name={user.user_name}
					width={40}
					borderRadius={50}
				></NameBadge>
			);
		}
		if (logo && logo !== "") {
			return (
				<img
					style={{
						height: "72px",
						width: "72px",
						borderRadius: "50%",
					}}
					alt={user.user_name}
					src={unescape(user.user_profile_img)}
				/>
			);
		} else {
			return (
				<NameBadge
					name={user.user_name}
					width={40}
					borderRadius={50}
				></NameBadge>
			);
		}
	};
	const m = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const color = [
		"#2266E2",
		"#FF6767",
		"#5CAF53",
		"#FFB169",
		"#6967E0",
		"#717171",
	];

	const handleUserChange = (user) => {
		setUserSubmitState(true);
		setUserFormErrors([]);

		updateUser(user.user_id, user)
			.then((res) => {
				setUserSubmitState(false);
				props.onUserChange();
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
	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Users",
			currentPageName: "User-Overview",
			user: user,
			user_id: id,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	function handleArchivingUsers() {
		setShowArchiveModal(!showArchiveModal);
		commonSegmentTrack("Clicked on Archive User");
	}

	function handleUnArchivingUsers() {
		commonSegmentTrack("Clicked on unArchive User");
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
	function handleChangeUserType(value) {
		setUserTypeForModal(value);
		setShowChangeUserTypeModal(!showChangeUserTypeModal);
	}
	function refreshUsers() {
		dispatch({
			type: usersConstants.DELETE_USERS_CACHE,
		});
		dispatch(fetchUserDetails(id));
		dispatch(fetchAllUsers(0));
	}

	const clickedOnEdit = () => {
		commonSegmentTrack("Clicked on Edit User");
		setShowHide(true);
	};
	const clickedOnAddApp = () => {
		history.push("#applications");
		commonSegmentTrack("Clicked on Add App");
	};

	const toWorkflow = (type) => {
		history.push({
			pathname: "/creating/workflow",
			state: { users: [user], type },
		});
	};

	let [showEmailAliasModal, setShowEmailAliasModal] = useState(false);

	function handleEmailAlias() {
		setShowEmailAliasModal(true);
	}

	let [showMergeUserModal, setShowMergeUserModal] = useState(false);
	let [mergeTargetUser, setMergeTargetUser] = useState(null);

	function handleMergeComplete() {
		setShowMergeUserModal(false);
		setMergeTargetUser(null);
		dispatch({
			type: usersConstants.DELETE_USERS_CACHE,
		});
		history.push(`/users`);
	}

	const [openUserSourceList, setOpenUserSourceList] = useState(false);

	const openUserSourceListModal = () => {
		setOpenUserSourceList(true);
	};

	return (
		<>
			{user && !user.loading ? (
				<>
					<div className="overview__container">
						<div className="overview__top">
							<div className="overview__topleft">
								<div className="overview__logo">
									{getProfileImage()}
								</div>
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
											<div className="truncate_overview_username">
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
											<div className="truncate_10vw">
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
							<div className="overview__topright">
								<div
									style={{
										display: "flex",
										alignItems: "center",
									}}
								>
									{!isViewer && (
										<button
											type="submit"
											className="overview__editbutton"
											onClick={clickedOnEdit}
										>
											<span id="overview__text1">
												Edit
											</span>
										</button>
									)}
									<Dropdown className="ml-2">
										<Dropdown.Toggle as={ellipsis} />
										<Dropdown.Menu>
											{!isViewer && (
												<>
													<Dropdown.Item
														onClick={
															clickedOnAddApp
														}
													>
														Add App
													</Dropdown.Item>
													{Object.keys(
														userStatus
													).map((status) => {
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
																	commonSegmentTrack(
																		`clicked on Mark as ${capitalizeFirstLetter(
																			userStatus[
																				status
																			]
																		)}`
																	);
																}}
															>
																Mark as{" "}
																{capitalizeFirstLetter(
																	userStatus[
																		status
																	]
																)}
															</Dropdown.Item>
														);
													})}
													<Dropdown.Divider className="mx-3 my-1" />
												</>
											)}

											<Dropdown.Item
												onClick={() => {
													setShowMergeUserModal(true);
													commonSegmentTrack(
														"Clicked on Merge with another user"
													);
												}}
											>
												Merge with another user
											</Dropdown.Item>
											<Dropdown.Item
												onClick={() => {
													setShowUserHistory(true);
													fetchActionHistory();
													commonSegmentTrack(
														"Clicked on View Action History"
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
														{Object.keys(
															userType
														).map((type) => {
															if (
																typeof user.user_account_type ===
																	"string" &&
																typeof userType[
																	type
																] ===
																	"string" &&
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
																		userType[
																			type
																		]
																	)}
																</Dropdown.Item>
															);
														})}
													</Dropdown.Menu>
												</Dropdown>
											)}
											{!isViewer && (
												<>
													<Dropdown.Divider className="mx-3 my-1" />
													{!(
														isUserArchived ||
														user?.user_archive
													) ? (
														<Dropdown.Item
															onClick={
																handleArchivingUsers
															}
														>
															Archive User
														</Dropdown.Item>
													) : (
														<Dropdown.Item
															onClick={
																handleUnArchivingUsers
															}
														>
															Un-archive User
														</Dropdown.Item>
													)}
												</>
											)}
											<Dropdown.Divider className="mx-3 my-1" />
											<Dropdown.Item
												onClick={() =>
													toWorkflow(
														WORFKFLOW_TYPE.ONBOARDING
													)
												}
											>
												Onboard User
											</Dropdown.Item>
											<Dropdown.Item
												onClick={() =>
													toWorkflow(
														WORFKFLOW_TYPE.OFFBOARDING
													)
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
											onMergeComplete={() =>
												handleMergeComplete()
											}
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
												const id =
													location.pathname.split(
														"/"
													)[2];
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
												setShowChangeUserTypeModal(
													false
												)
											}
											successResponse={() => {
												const id =
													location.pathname.split(
														"/"
													)[2];
												dispatch(fetchUserDetails(id));
												dispatch({
													type: usersConstants.DELETE_USERS_CACHE,
												});
												props.userAccountTypeChangedFromOverview(
													userTypeForModal
												);
											}}
											UserTypeFunc={patchUser}
											id={user.user_id}
											type={userTypeForModal}
										></UserTypeModal>
									)}
									{showEmailAliasModal && (
										<EmailAliasModal
											user={user}
											isOpen={showHide}
											submitInProgress={
												userSubmitInProgress
											}
											validationErrors={userFormErrors}
											handleSubmit={handleUserChange}
											handleClose={() => {
												setShowHide(false);
												setUserFormErrors([]);
											}}
											setShowEmailAliasModal={
												setShowEmailAliasModal
											}
											getProfileImage={getProfileImage}
										/>
									)}
								</div>
								<div
									className="overview__logsbutton__cont"
									hidden
								>
									<button
										type="sumbit"
										className="overview__logsbutton"
										onClick={() => setShowLogsMenu(true)}
									>
										<img src={button2} />
									</button>
									{showLogsMenu ? (
										<div
											style={{ height: 94 }}
											className="overview__logsbutton__menu menu p-2"
										>
											<button> Add Apps </button>
											<hr
												style={{ margin: "0px 18px" }}
											/>
											<button> Remove User </button>
										</div>
									) : null}
								</div>
							</div>
						</div>
						<hr
							style={{
								marginLeft: "40px",
								marginRight: "40px",
								marginTop: "0px",
								marginBottom: "0px",
							}}
						/>
						<div className="overview__top__next">
							<div className="overview__top__next__ins">
								<div className="overview__top__next__ins1">
									Actively used apps
								</div>
								<div className="overview__top__next__ins2">
									<div>
										<img src={overview6} />
									</div>
									<div className="overview__top__next__instext">
										{user.user_active_apps
											? user.user_active_apps.count
											: 0}
									</div>
									<img
										className="overviewins__top__next__insimage"
										src={
											user.user_active_apps &&
											user.user_active_apps
												.change_count >= 0
												? uparrow
												: downarrow
										}
										alt="Apps Used"
									/>
									<div className="overviewins__top__next__insvalue">
										{user.user_active_apps
											? Math.abs(
													user.user_active_apps
														.change_count
											  )
											: 0}
									</div>
									<div className="overview__top__next__instext2">
										in{" "}
										{
											m[
												user?.user_average_usage
													?.month_id - 1
											]
										}
									</div>
								</div>
							</div>
							<div className="overview__top__next__ins">
								<div className="overview__top__next__ins1">
									Avg. Monthly Spend
								</div>
								<div className="overview__top__next__ins2">
									<div>
										<img src={overview2} />
									</div>
									<div className="overview__top__next__instext">
										{user.user_monthly_spend
											? kFormatter(
													user.user_monthly_spend
														.monthly_spend
											  )
											: 0}
									</div>
									<img
										className="overviewins__top__next__insimage"
										src={
											user.user_monthly_spend &&
											user.user_monthly_spend.change >= 0
												? uparrow
												: downarrow
										}
									/>
									<div className="overviewins__top__next__insvalue">
										{user.user_monthly_spend
											? kFormatter(
													Math.abs(
														user.user_monthly_spend
															.change
													)
											  )
											: 0}
									</div>
									<div className="overview__top__next__instext2">
										in{" "}
										{
											m[
												user?.user_average_usage
													?.month_id - 1
											]
										}
									</div>
								</div>
							</div>
							<div className="overview__top__next__ins">
								<div className="overview__top__next__ins1">
									Monthly Cost
								</div>
								<div className="overview__top__next__ins2">
									<div>
										<img src={overview2} />
									</div>
									<div className="overview__top__next__instext">
										{user.user_monthly_spend
											? kFormatter(
													user.user_cost.cost_YTD
											  )
											: 0}
									</div>
									<img
										className="overviewins__top__next__insimage"
										src={
											user.user_cost &&
											user.user_cost.change >= 0
												? uparrow
												: downarrow
										}
									/>
									<div className="overviewins__top__next__insvalue">
										{user.user_cost
											? kFormatter(
													Math.abs(
														user.user_cost.change
													)
											  )
											: 0}
									</div>
									<div className="overview__top__next__instext2">
										in{" "}
										{
											m[
												user?.user_average_usage
													?.month_id - 1
											]
										}
									</div>
								</div>
							</div>
							<div className="overview__top__next__ins">
								<div className="overview__top__next__ins1">
									Total Apps
								</div>
								<div className="overview__top__next__ins2">
									<div>
										<img src={overview_total_apps} />
									</div>
									<div className="overview__top__next__instext">
										{user.user_apps_used
											? user.user_apps_used.apps_count
											: 0}
									</div>
									<img
										className="overviewins__top__next__insimage"
										src={
											user.user_apps_used &&
											user.user_apps_used.change >= 0
												? uparrow
												: downarrow
										}
										alt="Apps Used"
									/>
									<div className="overviewins__top__next__insvalue">
										{user.user_apps_used
											? Math.abs(
													user.user_apps_used.change
											  )
											: 0}
									</div>
									<div className="overview__top__next__instext2">
										in{" "}
										{
											m[
												user?.user_average_usage
													?.month_id - 1
											]
										}
									</div>
								</div>
							</div>
							<div className="overview__top__next__ins">
								<div className="overview__top__next__ins1">
									Average Usage
								</div>
								<div className="overview__top__next__ins2">
									<div style={{ marginTop: "4px" }}>
										<img src={overview3} />
									</div>
									<div className="overview__top__next__instext">
										{user.user_average_usage?.avg_usage?.toFixed(
											0
										) || 0}
										%
									</div>
									<img
										className="overviewins__top__next__insimage"
										src={
											user.user_average_usage &&
											user.user_average_usage.change >= 0
												? uparrow
												: downarrow
										}
									/>
									<div className="overviewins__top__next__insvalue">
										{user.user_average_usage
											? Math.abs(
													user.user_average_usage
														.change
											  )
											: 0}
										%
									</div>
									<div className="overview__top__next__instext2">
										in{" "}
										{
											m[
												user?.user_average_usage
													?.month_id - 1
											]
										}
									</div>
								</div>
							</div>
							<div className="overview__top__next__ins">
								<div className="overview__top__next__ins1">
									Status
								</div>
								<div className="overview__top__next__ins2">
									<OverlayTrigger
										placement="bottom"
										overlay={
											<BootstrapTooltip>
												{actionHistory?.user_status_change_log !==
													null &&
												actionHistory
													?.user_status_change_log
													?.length > 0
													? `Marked ${
															isUserArchived ||
															user?.user_archive
																? "archived"
																: user.user_status
													  } 
												by ${
													actionHistory
														?.user_status_change_log[
														actionHistory
															?.user_status_change_log
															?.length - 1
													]?.updated_by_user_id
														?.name ||
													actionHistory
														?.user_status_change_log[
														actionHistory
															?.user_status_change_log
															?.length - 1
													]?.integration_id?.name ||
													userName
												} on ${format(
															new Date(
																actionHistory
																	?.user_status_change_log[
																	actionHistory
																		?.user_status_change_log
																		?.length -
																		1
																]?.date ||
																	user.user_added_on
															)
													  )}`
													: `Marked ${
															isUserArchived ||
															user?.user_archive
																? "archived"
																: user.user_status
													  } 
												by ${userName} on ${format(new Date(user.user_added_on))}`}
											</BootstrapTooltip>
										}
									>
										<div className="overview__top__next__instext ml-0">
											<ChangeStatusInline
												isOverview
												disableEdit
												status={
													isUserArchived ||
													user?.user_archive
														? "archived"
														: user.user_status
												}
											/>
										</div>
									</OverlayTrigger>
								</div>
							</div>
						</div>
						<hr
							style={{
								marginLeft: "40px",
								marginRight: "40px",
								marginTop: "0px",
								marginBottom: "0px",
							}}
						/>
					</div>
					<div
						className="overview__middle__users"
						style={{ minHeight: 0 }}
					>
						<div
							className="overview__middle__left"
							style={{ marginTop: "28px" }}
						>
							<div className="overview__middle__left__top">
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "25%" }}
								>
									<div className="overview__middle__topconttext">
										Designation
									</div>
									<ChangeDesignation
										user={user}
										marginRquired={true}
										refreshReduxState={() => {
											refreshUsers();
										}}
									/>
								</div>
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "25%" }}
								>
									<div className="overview__middle__topconttext">
										Department
									</div>
									<div
										style={{ marginBottom: "25px" }}
										className="overview__middle__topconttext2__grey"
									>
										<span id="users__back1">
											<div
												className="truncate_name"
												style={{
													position: "relative",
													left: "-5px",
												}}
											>
												{user.user_department
													? user.user_department
															.department_name
													: ""}
											</div>
										</span>
									</div>
								</div>
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "25%" }}
								>
									<div className="overview__middle__topconttext">
										User Added on
									</div>
									<div
										style={{ marginTop: "12px" }}
										className="overview__middle__topconttext2"
									>
										{user.user_added_on
											? longTimeFormat.format(
													new Date(user.user_added_on)
											  )
											: ""}
									</div>
								</div>
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "15%" }}
								>
									<div className="overview__middle__topconttext">
										User Type
									</div>
									<div
										style={{
											marginTop: "12px",
											textTransform: "capitalize",
										}}
										className="overview__middle__topconttext2"
									>
										{user?.user_account_type}
									</div>
								</div>
								<div
									className="overview__middle__topcont"
									style={{
										marginRight: "20px",
									}}
								>
									<div className="overview__middle__topconttext">
										Other aliases
										<span
											onClick={() => handleEmailAlias()}
											style={{
												color: "#2266E2",
												marginLeft: "10px",
												cursor: "pointer",
											}}
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
											<span
												style={{
													color: "#717171",
													marginLeft: "5px",
												}}
											>{`  + ${
												user.user_email_aliases_count -
												1
											}`}</span>
										)}
									</div>
								</div>
								<div
									className="overview__middle__topcont"
									style={{
										marginRight: "20px",
									}}
								>
									<div className="overview__middle__topconttext">
										Sources
									</div>
									<div
										style={{
											marginTop: "12px",
											marginRight: "10px",
										}}
										className="overview__middle__topconttext2"
									>
										{user?.user_source_array?.map(
											(source, index) => (
												<>
													{index < 3 && (
														<UserSourceIconAndCard
															source={source}
															index={index}
															userId={id}
															refresh={
																refreshUsers
															}
															user={user}
															sources={
																user?.user_source_array ||
																[]
															}
														/>
													)}
												</>
											)
										)}
										{Array.isArray(
											user?.user_source_array
										) &&
											user?.user_source_array.length >
												3 && (
												<div
													className="font-12 primary-color cursor-pointer"
													onClick={
														openUserSourceListModal
													}
												>
													+{" "}
													{user?.user_source_array
														?.length - 3}
												</div>
											)}
									</div>

									{openUserSourceList && (
										<UserSourceList
											sources={user?.user_source_array}
											user={user}
											userId={id}
											refresh={refreshUsers}
											setOpenUserSourceList={
												setOpenUserSourceList
											}
										/>
									)}
								</div>
								<CustomFieldSectionInOverview
									className="overview__middle__topcont mb-4 mr-4"
									style={{ minWidth: 180 }}
									of={CUSTOM_FIELD_ENTITY.USERS}
									segmentCategory={"User"}
									customFieldData={
										user?.user_custom_fields || []
									}
									updateService={patchUser.bind(
										null,
										user.user_id
									)}
									refreshPage={refreshUsers}
								/>
							</div>
							<NotesList
								className="mt-4"
								notes={user.user_notes}
								entity={{
									id: user.user_id,
									name: user.user_name,
									image: user.user_profile_img,
									type: "user",
								}}
							/>
						</div>
						<div
							className="overview__middle__right"
							style={{ marginTop: "28px" }}
						>
							<div className="overview__middle__right__top">
								{partner?.name} Recommends
							</div>
							<div className="overview_no_recommendations">
								<img
									src={noRecommendations}
									width={125}
									height={70}
								/>
								<div className="text-align-center o-6">
									There are no recommendations for{" "}
									{user.user_name}
								</div>
								<div className="text-capitalize o-6"></div>
							</div>
							{/* <div className="overview__middle__right__bottom">
								<img
									src={emptyrecomm}
									style={{ marginTop: "40px" }}
								></img>
								<div
									className="empty__recomm__d1"
									style={{ marginLeft: "40px" }}
								>
									You're all caught up!
								</div>
								<div
									className="empty__recomm__d2"
									style={{ marginLeft: "40px" }}
								>
									There are no recommendations
								</div>
							</div> */}
						</div>
					</div>

					<div
						className={
							isUserArchived || user?.user_archive
								? "overview__bottom disabledState"
								: "overview__bottom"
						}
					>
						<div
							className="overview__bottom__up"
							style={{ margin: "12px 0px" }}
						>
							<div>App wise Spend</div>
							{spendloading ? (
								<div className="allapps__spendgraph">
									<div
										style={{
											height: "100%",
											width: "100%",
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Loader
											height={100}
											width={100}
										></Loader>
									</div>
								</div>
							) : spendData.length != 0 ? (
								<div
									style={{
										marginTop: "16px",
										padding: "20px 0px",
									}}
									className="allapps__spendgraph"
								>
									<div className="allapps__spendgraph__d1">
										<ResponsiveContainer width="95%">
											<AreaChart
												data={spendData}
												margin={{
													top: 22,
													right: 0,
													left: 0,
													bottom: 0,
												}}
											>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="month_name"
													tick={{
														fontSize: 10,
														color: "#717171",
													}}
													tickLine={false}
													axisLine={false}
												/>
												<YAxis
													tick={{
														fontSize: 10,
														color: "#717171",
														marginLeft: 1,
													}}
													tickFormatter={(tick) =>
														kFormatter(tick)
													}
													tickLine={false}
													axisLine={false}
													interval={0}
													domain={[0, "auto"]}
												/>
												<Tooltip
													content={
														<CustomTooltip
															formatter={(
																value
															) =>
																kFormatter(
																	value
																)
															}
														/>
													}
													wrapperStyle={{
														backgroundColor:
															"white",
													}}
												/>
												{spendDataKeys.map(
													(dataKey, index) => (
														<Area
															key={dataKey[0]}
															type="monotone"
															dataKey={dataKey[0]}
															stackId={dataKey[0]}
															stroke={dataKey[1]}
															connectNulls={false}
															strokeWidth={2}
															fill={`${dataKey[1]}4D`}
															dot={{
																stroke: dataKey[1],
																fill: "white",
																r: 4,
															}}
															activeDot={{
																fill: dataKey[1],
																stroke: dataKey[1],
																r: 6,
															}}
														/>
													)
												)}
											</AreaChart>
										</ResponsiveContainer>
										<div
											className="ov__d5__d2__d1__d1"
											style={{
												top: "45px",
												left: "64px",
											}}
										>
											<div className="ov__d5__d2__d1__d1__d1">
												<div className="ov__d5__d2__d1__d1__d1__d1">
													{user.user_monthly_spend
														? kFormatter(
																user
																	.user_monthly_spend
																	.monthly_spend
														  )
														: 0}
												</div>
												<img
													className="overviewins__top__next__insimage"
													src={
														user.user_monthly_spend &&
														user.user_monthly_spend
															.change >= 0
															? uparrow
															: downarrow
													}
												/>
												<div className="ov__d5__d2__d1__d1__d1__d2">
													{user.user_monthly_spend
														? kFormatter(
																Math.abs(
																	user
																		.user_monthly_spend
																		.change
																)
														  )
														: 0}
												</div>
												<div className="ov__d5__d2__d1__d1__d1__d3">
													in{" "}
													{
														m[
															user
																?.user_average_usage
																?.month_id - 1
														]
													}
												</div>
											</div>
											<div className="ov__d5__d2__d1__d1__d2">
												Avg. Monthly Spend
											</div>
										</div>
									</div>
									<div className="allapps__spendgraph__d2">
										<TableNew2
											data={spendTable}
										></TableNew2>
									</div>
								</div>
							) : (
								<div
									style={{
										backgroundImage: `url(${emptySpendTrend})`,
										height: "306px",
										marginTop: "16px",
									}}
									className="d-flex flex-column justify-content-center align-items-center allapps__spendgraph"
								>
									<div className="d-flex flex-column justify-content-center align-items-center m-auto">
										<img src={noData} className="m-auto" />
										<span className="empty-header">
											No Data Available
										</span>
										<span className="empty-lower">
											Add spend data for this app
										</span>
										<button
											type="button"
											className="btn btn-outline-primary emptyDocButton"
											style={{
												width: "max-content",
												marginTop: "5px",
											}}
											onClick={() =>
												history.push(
													"/transactions#recognised"
												)
											}
										>
											<img
												style={{ paddingRight: "5px" }}
											/>
											Add transactions
										</button>
									</div>
								</div>
							)}
						</div>
						<div
							className="overview__bottom__down"
							style={{ margin: "12px 0px" }}
						>
							<div>App wise Usage</div>
							{usageloading ? (
								<div className="allapps__spendgraph">
									<div
										style={{
											height: "100%",
											width: "100%",
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Loader
											height={100}
											width={100}
										></Loader>
									</div>
								</div>
							) : usageData.length != 0 ? (
								<div
									style={{
										marginTop: "16px",
										padding: "20px 0px",
									}}
									className="allapps__spendgraph"
								>
									<div className="allapps__spendgraph__d1">
										<ResponsiveContainer width="95%">
											<AreaChart
												data={usageData}
												margin={{
													top: 22,
													right: 0,
													left: 0,
													bottom: 0,
												}}
											>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="month_name"
													tick={{
														fontSize: 10,
														color: "#717171",
													}}
													tickLine={false}
													axisLine={false}
												/>
												<YAxis
													tick={{
														fontSize: 10,
														color: "#717171",
														marginLeft: 1,
													}}
													tickFormatter={(tick) =>
														Number(
															tick.toFixed(1)
														) + "%"
													}
													tickLine={false}
													axisLine={false}
													interval={0}
													width={50}
													domain={[
														0,
														(dataMax) => 100,
													]}
												/>
												<Tooltip
													content={
														<CustomTooltip
															formatter={(
																value
															) =>
																Number(
																	value.toFixed(
																		1
																	)
																) + "%"
															}
														/>
													}
													wrapperStyle={{
														backgroundColor:
															"white",
													}}
												/>
												{usageDataKeys.map(
													(dataKey, index) =>
														dataKey ? (
															<Area
																key={dataKey[0]}
																type="monotone"
																dataKey={
																	dataKey[0]
																}
																stackId={
																	dataKey[0]
																}
																stroke={
																	dataKey[1]
																}
																connectNulls={
																	false
																}
																strokeWidth={2}
																fill={`${dataKey[1]}4D`}
																dot={{
																	stroke: dataKey[1],
																	fill: "white",
																	r: 4,
																}}
																activeDot={{
																	fill: dataKey[1],
																	stroke: dataKey[1],
																	r: 6,
																}}
															/>
														) : null
												)}
											</AreaChart>
										</ResponsiveContainer>
										<div
											className="ov__d5__d2__d1__d1"
											style={{
												top: "45px",
												left: "64px",
											}}
										>
											<div className="ov__d5__d2__d1__d1__d1">
												<div className="ov__d5__d2__d1__d1__d1__d1">
													{user.user_average_usage &&
													user.user_average_usage
														.avg_usage
														? user.user_average_usage.avg_usage.toFixed(
																0
														  )
														: 0}
													%
												</div>
												<img
													className="overviewins__top__next__insimage"
													src={
														user.user_average_usage &&
														user.user_average_usage
															.change >= 0
															? uparrow
															: downarrow
													}
												/>
												<div className="ov__d5__d2__d1__d1__d1__d2">
													{user.user_average_usage
														? Math.abs(
																user
																	.user_average_usage
																	.change
														  ).toFixed(0)
														: 0}
													% in{" "}
													{
														m[
															user
																?.user_average_usage
																?.month_id - 1
														]
													}
												</div>
												<div className="ov__d5__d2__d1__d1__d1__d3"></div>
											</div>
											<div className="ov__d5__d2__d1__d1__d2">
												Avg. Usage
											</div>
										</div>
										{/* <div className="ov__d5__d2__selectdiv">
								<select>
									<option selected>
										{" "}
										Department{" "}
									</option>
									<option>Category</option>
								</select>
							</div> */}
									</div>
									<div className="allapps__spendgraph__d2">
										<TableNew3 data={usageTable} />
									</div>
								</div>
							) : (
								<div
									style={{
										backgroundImage: `url(${emptyUsage})`,
										height: "306px",
										marginTop: "16px",
									}}
									className="d-flex flex-column justify-content-center align-items-center allapps__spendgraph"
								>
									<div className="d-flex flex-column justify-content-center align-items-center m-auto">
										<img src={noData} className="m-auto" />
										<span className="empty-header">
											No Data Available
										</span>
										<span className="empty-lower">
											Add usage data for this app
										</span>
										<button
											type="button"
											className="btn btn-outline-primary emptyDocButton"
											style={{
												width: "max-content",
												marginTop: "5px",
											}}
											onClick={() =>
												history.push(
													"/transactions#recognised"
												)
											}
										>
											<img
												style={{ paddingRight: "5px" }}
											/>
											Add transactions
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
					<Popover></Popover>
				</>
			) : (
				<div>
					<div className="overview__container">
						<div className="overview__top">
							<div className="overview__topleft">
								<div className="overview__logo">
									<ContentLoader width={72} height={72}>
										<rect
											rx="36"
											width={72}
											height={72}
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div
									className="overview__logodata"
									style={{ marginLeft: "16px" }}
								>
									<ContentLoader
										width={215}
										height={21}
										className="overview__logodata1"
									>
										<rect
											width="215"
											height="21"
											rx="4"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
							</div>
						</div>
						<hr
							style={{
								marginLeft: "40px",
								marginRight: "40px",
								marginTop: "0px",
								marginBottom: "0px",
							}}
						/>
						<div className="overview__top__next">
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "24%" }}
							>
								<div className="overview__top__next__ins1">
									<ContentLoader width={76} height={9}>
										<rect
											width="76"
											height="9"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div className="overview__top__next__ins2">
									<ContentLoader
										style={{ marginRight: 8 }}
										width={28}
										height={28}
										viewBox="0 0 28 28"
									>
										<circle
											cx="14"
											cy="14"
											r="14"
											fill="#EBEBEB"
										/>
									</ContentLoader>
									<div className="overview__top__next__instext2">
										<ContentLoader
											width={65}
											height={18}
											viewBox="0 0 65 18"
										>
											<rect
												width="65"
												height="18"
												rx="4"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "27%" }}
							>
								<div className="overview__top__next__ins1">
									<ContentLoader width={76} height={9}>
										<rect
											width="76"
											height="9"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div className="overview__top__next__ins2">
									<ContentLoader
										style={{ marginRight: 8 }}
										width={28}
										height={28}
										viewBox="0 0 28 28"
									>
										<circle
											cx="14"
											cy="14"
											r="14"
											fill="#EBEBEB"
										/>
									</ContentLoader>
									<div className="overview__top__next__instext2">
										<ContentLoader
											width={65}
											height={18}
											viewBox="0 0 65 18"
										>
											<rect
												width="65"
												height="18"
												rx="4"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "24%" }}
							>
								<div className="overview__top__next__ins1">
									<ContentLoader width={76} height={9}>
										<rect
											width="76"
											height="9"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div className="overview__top__next__ins2">
									<ContentLoader
										style={{ marginRight: 8 }}
										width={28}
										height={28}
										viewBox="0 0 28 28"
									>
										<circle
											cx="14"
											cy="14"
											r="14"
											fill="#EBEBEB"
										/>
									</ContentLoader>
									<div className="overview__top__next__instext2">
										<ContentLoader
											width={65}
											height={18}
											viewBox="0 0 65 18"
										>
											<rect
												width="65"
												height="18"
												rx="4"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "20%" }}
							>
								<div className="overview__top__next__ins1">
									<ContentLoader width={76} height={9}>
										<rect
											width="76"
											height="9"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div className="overview__top__next__ins2">
									<ContentLoader
										style={{ marginRight: 8 }}
										width={28}
										height={28}
										viewBox="0 0 28 28"
									>
										<circle
											cx="14"
											cy="14"
											r="14"
											fill="#EBEBEB"
										/>
									</ContentLoader>
									<div className="overview__top__next__instext2">
										<ContentLoader
											width={65}
											height={18}
											viewBox="0 0 65 18"
										>
											<rect
												width="65"
												height="18"
												rx="4"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
						</div>
						<hr
							style={{
								marginLeft: "40px",
								marginRight: "40px",
								marginTop: "0px",
								marginBottom: "0px",
							}}
						/>
					</div>
					<div className="overview__middle">
						<div
							className="overview__middle__left"
							style={{ marginTop: "28px" }}
						>
							<div className="overview__middle__left__top">
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "20%" }}
								>
									<div className="overview__middle__topconttext">
										<ContentLoader width={76} height={9}>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										style={{ marginBottom: "25px" }}
										className="overview__middle__topconttext2"
									>
										<ContentLoader width={108} height={12}>
											<rect
												width="108"
												height="12"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "27%" }}
								>
									<div className="overview__middle__topconttext">
										<ContentLoader width={76} height={9}>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										style={{ marginBottom: "25px" }}
										className="overview__middle__topconttext2"
									>
										<ContentLoader width={108} height={12}>
											<rect
												width="108"
												height="12"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "25%" }}
								>
									<div className="overview__middle__topconttext">
										<ContentLoader width={76} height={9}>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										style={{ marginBottom: "25px" }}
										className="overview__middle__topconttext2"
									>
										<ContentLoader width={108} height={12}>
											<rect
												width="108"
												height="12"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
						</div>
						<div
							className="overview__middle__right"
							style={{ marginTop: "28px" }}
						>
							<div className="overview__middle__right__bottom">
								<div className="overview__middle__right__bottom_1">
									<div
										style={{
											paddingTop: 20,
											paddingLeft: 16,
										}}
										className="overview__middle__right__bottom_1left"
									>
										<ContentLoader width={40} height={40}>
											<circle
												cx="20"
												cy="20"
												r="20"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										className="overview__middle__right__bottom_1right"
										style={{ marginLeft: "12px" }}
									>
										<div>
											<ContentLoader
												width={209}
												height={16}
											>
												<rect
													width="209"
													height="16"
													rx="4"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
										<div>
											<ContentLoader
												width={134}
												height={10}
											>
												<rect
													width="134"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
										<div>
											<ContentLoader
												width={134}
												height={10}
											>
												<rect
													width="134"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									</div>
								</div>
								<div className="overview__middle__right__bottom_1">
									<div
										style={{
											paddingTop: 20,
											paddingLeft: 16,
										}}
										className="overview__middle__right__bottom_1left"
									>
										<ContentLoader width={40} height={40}>
											<circle
												cx="20"
												cy="20"
												r="20"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										className="overview__middle__right__bottom_1right"
										style={{ marginLeft: "12px" }}
									>
										<div>
											<ContentLoader
												width={209}
												height={16}
											>
												<rect
													width="209"
													height="16"
													rx="4"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
										<div>
											<ContentLoader
												width={134}
												height={10}
											>
												<rect
													width="134"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
										<div>
											<ContentLoader
												width={134}
												height={10}
											>
												<rect
													width="134"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
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
		</>
	);
}
