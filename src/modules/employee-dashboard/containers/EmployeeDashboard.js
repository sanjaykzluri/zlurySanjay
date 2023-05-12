import React, { useState, useEffect } from "react";
import {
	Switch,
	Route,
	Redirect,
	useHistory,
	useLocation,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LoginSteps } from "../../../containers/LoginSteps";
import { useOnlineStatus } from "../../../utils/offlineHook";
import ProtectedRoute from "../../../common/ProtectedRoute";
import { Login } from "../../../common/Login";
import { Logout } from "../../../common/Logout";
import { Verify } from "../../../common/Verify";
import { AccountDeactivated } from "../../../common/AccountDeactivated.js";
import { LoaderPage } from "../../../common/Loader/LoaderPage";
import { GlobalError } from "../../../common/GlobalError";
import { Offline } from "../../../common/Offline";
import { useDispatch, useSelector } from "react-redux";
import { closeSearch, openSearch } from "../../../actions/ui-action";
import { CheckAuth } from "../../../containers/CheckAuth";
import { getUrlVars } from "../../../utils/common";
import { RESTRICTION_CONSTANTS } from "../../../constants";
import { OrgBlocked } from "../../../components/Onboarding/OrgBlocked.js";
import * as Sentry from "@sentry/react";
import { RoleProvider } from "../../../services/roleContext/roleContext.js";
import { SingleIntegration } from "../../integrations/containers/SingleIntegration/SingleIntegration";
import UpgradeModal from "../../../common/restrictions/UpgradeModal";
import { clearAndFetchNotifications } from "../../../common/Notification/notification-action";
import Pusher from "pusher-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DefaultNotificationCard from "../../../common/Notification/PusherNotificationCards/DefaultNotificationCard";
import { PUSHER_IN_APP_NOTIFICATION } from "../../../constants/app.key";
import { SidebarLogin } from "../../../components/Sidebarlogin/SidebarLogin";
import { PageNotFound } from "../../../common/PageNotFound";
import { MFA } from "../../mfa/containers/MFA/MFA";
import { MFA_VIEW } from "../../mfa/constants/constant";
import { getAppKey } from "../../../utils/getAppKey";
import HeaderGlobalSearch from "../../../components/HeaderTitleAndGlobalSearch/HeaderGlobalSearch";
import { ModalContainer } from "UIComponents/ModalContainer";
import LoginFailed from "components/Onboarding/LoginFailed";
import { EmployeeOverview } from "modules/employee-dashboard/containers/EmployeeOverview";
import { EmployeeApplications } from "modules/employee-dashboard/containers/EmployeeApplications";
import { Sidebar } from "components";
import { SingleApplication } from "modules/employee-dashboard/containers/ApplicationOverview";
import { RequestLicense } from "modules/employee-dashboard/components/requestLicense";
import { RequestOverview } from "modules/employee-dashboard/containers/RequestOverview";
import { setIcons, setTheme } from "reducers/employee.reducer";
import "modules/integrations/containers/Integrations/Integrations.css";
import "components/Applications/SecurityCompliance/styles.css";
import { AppRequisition } from "./appRequisition";
import { employeeDashoboardFeatureSelector } from "reducers/userinfo.reducer";
import { getValueFromLocalStorage } from "utils/localStorage";
import EmployeeGlobalSearch from "../components/EmployeeGlobalSearch";
import { AdminIntegrationInvite } from "modules/integrations/containers/AdminIntegrationInvite/AdminIntegrationInvite";

const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
	cluster: process.env.REACT_APP_CLUSTER,
});

function EmployeeDashboard({ isLoading }) {
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();
	const onlineStatus = useOnlineStatus();
	const userInfo = useSelector((state) => state.userInfo);
	const { searchActive } = useSelector((state) => state.ui);
	const { showUpgradeModal, entity } = useSelector(
		(state) => state.restrictions
	);
	const [isViewer, setIsViewer] = useState(
		getValueFromLocalStorage("userInfo")?.isViewer || false
	);
	const [userRole, setUserRole] = useState(
		getValueFromLocalStorage("userInfo")?.user_role || ""
	);
	const [isUserBlocked, setUserBlocked] = useState(
		getValueFromLocalStorage("isUserBlocked") || false
	);
	const [enableBetaFeatures, setEnableBetaFeatures] = useState();

	useEffect(() => {
		if (location.search) {
			const param = getUrlVars(location.search);
			if (
				getAppKey("REACT_APP_SIGN_UP") &&
				param?.error_description &&
				param?.state
			) {
				window.location.href = `${getAppKey("REACT_APP_SIGN_UP")}/${
					location.search
				}`;
			}
		}
	}, [location]);

	useEffect(() => {
		if (userInfo) {
			const { org_id, user_id, org_beta_features } = userInfo;
			if (getAppKey("REACT_APP_ENV") === "production") {
				setEnableBetaFeatures(
					org_beta_features ? org_beta_features : []
				);
			} else {
				setEnableBetaFeatures(["workflows"]);
			}
			if (org_id && user_id) {
				dispatch(clearAndFetchNotifications());
				const channel = pusher.subscribe(`${org_id}-${user_id}`);
				channel.bind(
					PUSHER_IN_APP_NOTIFICATION,
					function (dataFromServer) {
						dispatch(clearAndFetchNotifications());
						toast(
							<DefaultNotificationCard
								notification={dataFromServer}
								jsxReqd={true}
							/>
						);
					}
				);
			}
			if (userInfo.icons) {
				dispatch(setIcons(userInfo.icons));

				if (userInfo.icons?.favIcon?.url) {
					const favicon = document.getElementById("favicon");
					favicon.href = userInfo.icons?.favIcon?.url;
				}
			}
			if (userInfo.theme) {
				dispatch(setTheme(userInfo.theme));
			}
		}
	}, [userInfo]);

	useEffect(() => {
		history.listen((location, action) => {
			if (location.pathname === "/user/search") {
				dispatch(openSearch());
			} else {
				dispatch(closeSearch());
			}
		});
		if (window.location.pathname === "/user/search") {
			dispatch(openSearch());
		}
	}, [window.location]);

	const isEmployeeDashboardEnabled = useSelector(
		employeeDashoboardFeatureSelector
	);

	return (
		<>
			<ToastContainer
				position={toast.POSITION.TOP_RIGHT}
				autoClose={5000}
				limit={3}
			/>
			<ModalContainer />
			{!onlineStatus ? (
				<Offline />
			) : isLoading ? (
				<LoaderPage />
			) : [
					"/page-not-found",
					"/steps",
					"/orgblocked",
					"/deactivated",
					"/verify",
					"/user/license/request",
			  ].includes(window.location.pathname) ||
			  [
					"/loginFailed",
					"/user/license/request/overview",
					"/user/license/request/edit",
			  ].find((path) => window.location.pathname.startsWith(path)) ? (
				<Switch>
					<ProtectedRoute exact path="/steps">
						<LoginSteps />
					</ProtectedRoute>
					<ProtectedRoute
						exact
						path="/onboarding/signinoptions/two-step-verification"
					>
						<MFA view={MFA_VIEW.ONBOARDING} />
					</ProtectedRoute>
					<Route exact path="/verify">
						<Verify />
					</Route>
					<ProtectedRoute
						exact
						path="/onboarding/integrations/:id/settings"
					>
						<SidebarLogin>
							<SingleIntegration onboarding={true} />
						</SidebarLogin>
					</ProtectedRoute>
					<ProtectedRoute exact path="/user/license/request">
						<RequestLicense />
					</ProtectedRoute>
					<ProtectedRoute exact path="/user/license/request/edit/:id">
						<RequestLicense />
					</ProtectedRoute>
					<ProtectedRoute
						exact
						path="/user/license/request/overview/:id"
					>
						<RequestOverview />
					</ProtectedRoute>
					<Route exact path="/deactivated">
						<AccountDeactivated />
					</Route>
					<Route exact path="/orgblocked">
						<OrgBlocked />
					</Route>
					<Route exact path="/page-not-found">
						<PageNotFound />
					</Route>
					<ProtectedRoute exact path="/loginFailed">
						<LoginFailed />
					</ProtectedRoute>
				</Switch>
			) : (
				<RoleProvider
					value={{ isViewer, userRole, enableBetaFeatures }}
				>
					<Sidebar>
						<>
							{searchActive ? (
								<EmployeeGlobalSearch />
							) : (
								<Sentry.ErrorBoundary
									FallbackComponent={GlobalError}
								>
									{!isUserBlocked ? (
										<Switch>
											<Redirect
												exact
												from="/"
												to="/checkAuth"
											/>
											<Route exact path="/checkAuth">
												<CheckAuth
													setIsViewer={setIsViewer}
													isViewer={isViewer}
													setUserRole={setUserRole}
													setUserBlocked={
														setUserBlocked
													}
												/>
											</Route>

											<Route exact path="/login">
												<Login />
											</Route>
											<Route exact path="/logout">
												<Logout />
											</Route>
											<Route
												exact
												path="/integrations/connectInvite"
											>
												<AdminIntegrationInvite />
											</Route>
											<ProtectedRoute
												exact
												path="/user/overview"
											>
												<EmployeeOverview />
											</ProtectedRoute>
											<ProtectedRoute
												exact
												path="/user/applications"
											>
												<EmployeeApplications />
											</ProtectedRoute>
											<ProtectedRoute
												exact
												path="/user/applications/:applicationId"
											>
												<SingleApplication />
											</ProtectedRoute>
											{isEmployeeDashboardEnabled && (
												<>
													<ProtectedRoute
														exact
														path="/user/app/requests"
													>
														<AppRequisition />
													</ProtectedRoute>
												</>
											)}

											<Redirect to="/page-not-found" />
										</Switch>
									) : (
										<Switch>
											<Redirect
												exact
												from="/"
												to="/checkAuth"
											/>
											<Route exact path="/checkAuth">
												<CheckAuth
													setIsViewer={setIsViewer}
													isViewer={isViewer}
													setUserRole={setUserRole}
													setUserBlocked={
														setUserBlocked
													}
												/>
											</Route>
											<Route exact path="/login">
												<Login />
											</Route>
											<Route exact path="/logout">
												<Logout />
											</Route>
										</Switch>
									)}
									{showUpgradeModal && (
										<UpgradeModal
											entity={entity}
											closeModal={() =>
												dispatch({
													type: RESTRICTION_CONSTANTS.HIDE_UPGRADE_MODAL,
												})
											}
										/>
									)}
								</Sentry.ErrorBoundary>
							)}
						</>
					</Sidebar>
				</RoleProvider>
			)}
		</>
	);
}

export default EmployeeDashboard;
