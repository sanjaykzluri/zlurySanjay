import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { Navbar } from "react-bootstrap";
import userAvatar from "../../assets/users/user-avatar.svg";
import search from "../../assets/search.svg";
import GettingStartedButton from "../GettingStarted/GettingStartedButton";
import Notification from "../../common/Notification/Notification";
import { openSearch } from "../../actions/ui-action";
import useOutsideClick from "../../common/OutsideClick/OutsideClick";
import updates from "assets/updates.svg";
import { SAVE_USER_INFO_OBJECT } from "constants/user";
import AdminView from "modules/shared/containers/ViewSelector/AdminView";
import EmployeeView from "modules/employee-dashboard/components/EmployeeView";
import { getValueFromLocalStorage } from "utils/localStorage";
import { PARTNER } from "modules/shared/constants/app.constants";
import TaskManagement from "modules/TaskManagement/components/TaskManagement";

export default function HeaderNavButtons() {
	const ref = useRef();
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();
	const user = useSelector((state) => state.userDetails);
	const { userInfo } = useSelector((state) => state);
	const [showLogsMenu, setShowLogsMenu] = useState(false);
	const userInfoPic = user?.picture || userAvatar;
	const partner = getValueFromLocalStorage("partner");
	const { org_beta_features } = useSelector((state) => state.userInfo);

	const handleSearchBarClick = () => {
		if (location.pathname !== "/search") {
			dispatch(openSearch());
			history.push("/search");
		}
	};

	const handleEmployeeSearchBarClick = () => {
		if (location.pathname !== "/search") {
			dispatch(openSearch());
			history.push("/user/search");
		}
	};

	useOutsideClick(ref, () => {
		if (showLogsMenu) setShowLogsMenu(false);
	});

	useEffect(() => {
		if (window.Headway) {
			window.Headway.init(window.HW_config);
		}
	}, [window.Headway]);

	const switchView = () => {
		if (location.pathname.includes("/user/")) {
			history.push("/overview");
		} else {
			history.push("/user/overview");
		}
	};

	return (
		<>
			<AdminView>
				{partner?.name === PARTNER.ZLURI.name && (
					<Navbar.Brand>
						<GettingStartedButton />
					</Navbar.Brand>
				)}
				{location.pathname !== "/search" && (
					<Navbar.Brand>
						<img
							src={search}
							height={20}
							width={20}
							className="cursor-pointer"
							onClick={handleSearchBarClick}
							style={{ marginBottom: "4px" }}
						/>
					</Navbar.Brand>
				)}

				{Array.isArray(org_beta_features) &&
					org_beta_features.includes("task_management") && (
						<Navbar.Brand>
							<TaskManagement />
						</Navbar.Brand>
					)}

				{partner?.name === PARTNER.ZLURI.name && (
					<Navbar.Brand>
						<button
							onClick={() => {
								window.Headway.show();
							}}
							id="headway_updates"
						>
							<img src={updates}></img>
						</button>
					</Navbar.Brand>
				)}

				<Navbar.Brand>
					<Notification />
				</Navbar.Brand>
			</AdminView>
			<EmployeeView>
				{Array.isArray(org_beta_features) &&
					org_beta_features.includes("task_management") && (
						<Navbar.Brand>
							<TaskManagement />
						</Navbar.Brand>
					)}
				{location.pathname !== "/search" && (
					<Navbar.Brand>
						<img
							src={search}
							height={20}
							width={20}
							className="cursor-pointer"
							onClick={handleEmployeeSearchBarClick}
							style={{ marginBottom: "4px" }}
						/>
					</Navbar.Brand>
				)}
			</EmployeeView>
			{partner?.name === PARTNER.ZLURI.name && (
				<div style={{ position: "relative" }} ref={ref}>
					<Navbar.Brand>
						<img
							role="button"
							alt=""
							src={userInfoPic}
							width="30"
							height="30"
							className="d-inline-block align-top"
							id="profileimage"
							onClick={() => {
								setShowLogsMenu(true);
							}}
						/>
					</Navbar.Brand>
					{showLogsMenu ? (
						<div
							className="overview__logsbutton__menu menu"
							style={{
								height: "fit-content",
								width: "fit-content",
							}}
						>
							<AdminView>
								<>
									<button
										onClick={() => {
											history.push("/settings/account");
										}}
										style={{ whiteSpace: "nowrap" }}
									>
										Account Settings
									</button>
									<hr style={{ margin: "0px 18px" }}></hr>
								</>
							</AdminView>
							{userInfo.employee_dashboard_enabled &&
								userInfo?.user_role !== "employee" && (
									<>
										<button
											onClick={switchView}
											style={{ whiteSpace: "nowrap" }}
										>
											<AdminView>
												Switch to Employee View
											</AdminView>
											<EmployeeView>
												Switch To Admin View
											</EmployeeView>
										</button>
										<hr style={{ margin: "0px 18px" }}></hr>
									</>
								)}
							<button
								onClick={() => {
									history.push("/logout");
								}}
								style={{ whiteSpace: "nowrap" }}
							>
								Logout
							</button>
						</div>
					) : null}
				</div>
			)}
		</>
	);
}
