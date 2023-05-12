import React, { useContext, useEffect } from "react";
import "./Settings.css";
import { Account } from "./Account/Account";
import { General } from "./General/General";
import { Administration } from "./Administration/Administration";
import { CustomApps } from "./CustomApps/CustomApps";
import { Billing } from "./Billing/BillingNew";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	NavLink,
	useParams,
	useLocation,
	useHistory,
} from "react-router-dom";
import { CustomFields } from "../../modules/custom-fields/containers/CustomFields/CustomFields";
import RoleContext from "../../services/roleContext/roleContext";
import { Notifications } from "./Notifications/Notifications";
import ScheduledExports from "./ScheduledExports/ScheduledExports";
import { userRoles } from "../../constants/userRole";
import { SSO } from "modules/sso/containers/SSO/SSO";
import { EmployeeDashboardSettings } from "../../modules/Settings/components/EmployeeDashboard/EmployeeDashboard";
import { PARTNER } from "modules/shared/constants/app.constants";

export function Settingsins() {
	const { path } = useParams();
	const { isViewer, userRole, enableBetaFeatures, partner } =
		useContext(RoleContext);
	const location = useLocation();
	const history = useHistory();

	useEffect(() => {
		if (location.pathname.split("/").length < 3)
			history.push("/settings/account");
	}, []);

	const IS_ADMIN =
		isViewer ||
		userRole === userRoles.FINANCE_ADMIN ||
		userRole === userRoles.IT_ADMIN ||
		userRole === userRoles.PROCUREMENT_ADMIN ||
		userRole === userRoles.INTEGRATION_ADMIN ||
		userRole === userRoles.SECURITY_ADMIN
			? false
			: true;

	const routes = [
		{
			path: "/settings/account",
			exact: true,
			main: () => <Account />,
			enabled: true,
			name: "Account",
		},
		{
			path: "/settings/general",
			main: () => <General />,
			enabled: IS_ADMIN ? true : false,
			name: "Your Organization",
		},
		{
			path: "/settings/employeeDashboard",
			main: () => <EmployeeDashboardSettings />,
			enabled: IS_ADMIN ? true : false,
			name: "Employee App Store",
		},
		{
			path: "/settings/administration",
			main: () => <Administration />,
			enabled: IS_ADMIN ? true : false,
			name: "Administration",
		},
		{
			path: "/settings/sso",
			main: () => <SSO />,
			enabled:
				IS_ADMIN && partner?.name === PARTNER.ZLURI.name ? true : false,
			name: "SSO",
		},
		{
			path: "/settings/customfields",
			main: () => <CustomFields />,
			enabled: IS_ADMIN ? true : false,
			name: "Custom Fields",
		},
		{
			path: "/settings/scheduledExports",
			main: () => <ScheduledExports />,
			enabled: IS_ADMIN ? true : false,
			name: "Scheduled Exports",
		},
		{
			path: "/settings/customapps",
			main: () => <CustomApps />,
			enabled: IS_ADMIN ? true : false,
			name: "Custom Apps",
		},
		{
			path: "/settings/billing",
			main: () => <Billing />,
			enabled:
				IS_ADMIN && partner?.name === PARTNER.ZLURI.name ? true : false,
			name: "Billing",
		},
		{
			path: "/settings/notifications",
			main: () => <Notifications />,
			enabled: IS_ADMIN ? true : false,
			name: "Notifications",
		},
	];

	return (
		<>
			<div style={{ display: "flex" }}>
				<div
					onTouchEnd={(e) => e.preventDefault()}
					className="settings__sidebar"
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						padding: "17px 12px 0px",
						width: "210px",
						background: "#f0f0f0",
						height: "calc(100vh - 75px)",
					}}
				>
					<ul style={{ listStyleType: "none", padding: 0 }}>
						{routes
							.filter((route) => route.enabled)
							.map((route) => (
								<li key={route.path}>
									<NavLink
										className="settings__navlink"
										to={route.path}
										isActive={route === path}
										activeStyle={{
											background:
												"rgba(90, 186, 255, 0.1)",
											borderRadius: "30px",
											width: "185px",
											height: "34px",
										}}
									>
										<span>{route.name}</span>
									</NavLink>
								</li>
							))}
					</ul>
				</div>

				<div style={{ flex: 1, overflow: "auto" }}>
					<Switch>
						{routes
							.filter((route) => route.enabled)
							.map((route, index) => (
								<Route
									key={index}
									path={route.path}
									exact={route.exact}
								>
									<div
										style={{ height: "calc(100vh - 75px)" }}
									>
										{route.main()}
									</div>
								</Route>
							))}
					</Switch>
				</div>
			</div>
		</>
	);
}
