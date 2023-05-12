import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import overview from "assets/sidebar/overview.svg";
import applications from "assets/sidebar/applications.svg";
import apprequests from "assets/sidebar/app_requests.svg";
import help from "assets/sidebar/help.svg";
import chatwithus from "assets/sidebar/chatwithus.svg";
import { useSelector } from "react-redux";
import { Button } from "UIComponents/Button/Button";
import { Logo } from "components/Logo/Logo";
import { employeeDashoboardFeatureSelector } from "reducers/userinfo.reducer";

export function EmployeeSidebarContent() {
	const history = useHistory();
	const location = useLocation();
	const { theme } = useSelector((state) => state.employee || {});
	const { url } = useSelector(
		(state) => state.employee?.icons?.organizationLogo || {}
	);
	const [hover, setHover] = useState();
	const isEmployeeDashboardEnabled = useSelector(employeeDashoboardFeatureSelector);

	const getStyleObject = (active, key) => {
		return active
			? {
					backgroundColor: theme?.[1]?.color || "#4E85E8",
					borderColor: theme?.[1]?.color || "#4E85E8",
					color: theme?.[4]?.color || "#FFFFFF",
			  }
			: {
					color: theme?.[2]?.color || "#FFFFFF",
					backgroundColor:
						key && hover === key
							? theme?.[3]?.color || "#2266e2"
							: theme?.[0]?.color || "#2266e2",
					borderColor: theme?.[0]?.color || "#2266e2",
			  };
	};

	return (
		<div
			className="sidebar__outer__employee sidebar__outer"
			style={{
				backgroundColor: theme?.[0]?.color || "#2266e2",
			}}
		>
			<div className="sidebar__logo">
				{url ? (
					<img
						src={url}
						className="logo"
						style={{ height: "auto", width: "72px" }}
					/>
				) : (
					<Logo light />
				)}
			</div>
			<div className="sidebar__line" />
			<div className="sidebar__list-upper app-flex-col center">
				<ul>
					<li>
						<Button
							onMouseEnter={() => setHover("overview")}
							onMouseLeave={() => setHover()}
							onClick={() => history.push("/user/overview")}
							className={
								location.pathname
									.toLowerCase()
									.includes("/user/overview") ||
								location.pathname.toLowerCase() === "/"
									? "sidebar__active"
									: "sidebar__item "
							}
							style={{
								...getStyleObject(
									location.pathname
										.toLowerCase()
										.includes("/user/overview") ||
										location.pathname.toLowerCase() === "/",
									"overview"
								),
							}}
						>
							<img src={overview} alt="Overview" />
							<span className="sidebar__label">Overview</span>
						</Button>
					</li>
					<li>
						<Button
							onMouseEnter={() => setHover("applications")}
							onMouseLeave={() => setHover()}
							onClick={() => history.push("/user/applications")}
							className={
								location.pathname
									.toLowerCase()
									.includes("/user/applications")
									? "sidebar__active"
									: "sidebar__item"
							}
							style={{
								...getStyleObject(
									location.pathname
										.toLowerCase()
										.includes("/user/applications"),
									"applications"
								),
							}}
						>
							<img src={applications} alt="Applications" />
							<span className="sidebar__label">Applications</span>
						</Button>
					</li>
					{isEmployeeDashboardEnabled && <li>
						<Button
							onMouseEnter={() => setHover("App Requisition")}
							onMouseLeave={() => setHover()}
							onClick={() =>
								history.push("/user/app/requests#requests")
							}
							className={
								location.pathname
									.toLowerCase()
									.includes("/user/app/requests")
									? "sidebar__active"
									: "sidebar__item"
							}
							style={{
								...getStyleObject(
									location.pathname
										.toLowerCase()
										.includes("/user/app/requests"),
									"applications"
								),
							}}
						>
							<img src={apprequests} alt="App Requisition" />
							<span className="sidebar__label">
								App Requisition
							</span>
						</Button>
					</li>}
				</ul>
			</div>
			<div className="sidebar__line" />
			<div className="sidebar__list-lower app-flex-col center">
				<ul style={{ marginTop: "11px" }}>
					<li>
						<Button
							onClick={() => {
								window.Intercom("showNewMessage");
							}}
							className={"sidebar__item"}
							style={{ ...getStyleObject() }}
						>
							<img
								src={chatwithus}
								alt="Settings"
								style={{ width: "24px" }}
								className="siderbar__chat__with__us__button"
							/>
							<span className="sidebar__label">Chat with us</span>
						</Button>
					</li>
					<li>
						<a
							target="blank"
							href="https://help.zluri.com"
							style={{ ...getStyleObject() }}
						>
							<img src={help} alt="Help" />
							<span className="sidebar__label">Help</span>
						</a>
					</li>
				</ul>
			</div>
		</div>
	);
}
