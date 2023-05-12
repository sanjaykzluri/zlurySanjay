import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import "./tangoe.css"; // remove when dynamic loading is implemented as expected

import {
	Switch,
	Route,
	Redirect,
	useHistory,
	useLocation,
} from "react-router-dom";
import { Transactions } from "./containers/Transactions";
import { ChargeBacks } from "./modules/chargebacks";
import { HeaderNav, Sidebar } from "./components";
import { UploadTransactions } from "./containers/UploadTransactions";
import { Applications } from "./containers/Applications";
import { AllAppsApplications } from "./containers/AllAppsApplications";
import { Departments } from "./containers/Departments";
import { Overview } from "./containers/Overview";
import { AllDepartments } from "./containers/AllDepartments";
import { LoginSteps } from "./containers/LoginSteps";
import { NewUserOverview } from "./containers/NewUserOverview";
import { Users } from "./containers/Users";
import { Settings } from "./containers/Settings";
import { UsersInfo } from "./containers/UsersInfo";
import { Security } from "./modules/security/container/Security/Security";
import Search from "./containers/Search";
import { Reports } from "./modules/reports/containers/Reports/Reports";
import { useOnlineStatus } from "./utils/offlineHook";
import ProtectedRoute from "./common/ProtectedRoute";
import { Login } from "./common/Login";
import { Logout } from "./common/Logout";
import { Verify } from "./common/Verify";
import { AccountDeactivated } from "./common/AccountDeactivated.js";
import { LoaderPage } from "./common/Loader/LoaderPage";
import { GlobalError } from "./common/GlobalError";
import { Offline } from "./common/Offline";
import { useDispatch, useSelector } from "react-redux";
import { closeSearch, openSearch, saveUserDetails } from "./actions/ui-action";
import { CheckAuth } from "./containers/CheckAuth";
import { debounce, getUrlVars } from "./utils/common";
import { ENTITIES, RESTRICTION_CONSTANTS, searchConstants } from "./constants";
import { client } from "./utils/client";
import { checkSpecialCharacters, getSearch } from "./services/api/search";
import ExternalLink from "./assets/external-link.svg";
import { getAllUsers } from "./services/api/users";
import { OrgBlocked } from "./components/Onboarding/OrgBlocked.js";
import * as Sentry from "@sentry/react";
import { RoleProvider } from "./services/roleContext/roleContext.js";
import { Integrations } from "./modules/integrations/containers/Integrations/Integrations";
import { SingleIntegration } from "./modules/integrations/containers/SingleIntegration/SingleIntegration";
import UpgradeModal from "./common/restrictions/UpgradeModal";
import RestrictedContent from "./common/restrictions/RestrictedContent";
import { AdminIntegrationInvite } from "./modules/integrations/containers/AdminIntegrationInvite/AdminIntegrationInvite";
import {
	clearAndFetchNotifications,
	decreaseToastCounter,
	fetchAllNotifications,
	increaseToastCounter,
} from "./common/Notification/notification-action";
import Pusher from "pusher-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DefaultNotificationCard from "./common/Notification/PusherNotificationCards/DefaultNotificationCard";
import { PUSHER_IN_APP_NOTIFICATION } from "./constants/app.key";
import { SidebarLogin } from "./components/Sidebarlogin/SidebarLogin";
import { SingleVendor } from "./components/Applications/Vendors/SingleVendor/SingleVendor";
import { PageNotFound } from "./common/PageNotFound";
import { NewAgents } from "./modules/Agents/container/NewAgents";
import { SingleAgent } from "./modules/Agents/components/SingleAgent/SingleAgent";
import { MFA } from "./modules/mfa/containers/MFA/MFA";
import { MFA_VIEW } from "./modules/mfa/constants/constant";
import { getAppKey } from "./utils/getAppKey";
import Workflow from "./modules/workflow/containers/Workflow/Workflow";
import Workflows from "./modules/workflow/containers/Workflows/Workflows";
import WorkflowLoader from "./modules/workflow/components/WorkflowLoader/WorkflowLoader";
import OffboardingDashboard from "./modules/workflow/containers/OffboardingDashboard/OffboardingDashboard";
import { AuditLogs } from "./modules/AuditLogs/container/AuditlogsContainer";
import { Licenses } from "./modules/licenses/container/Licenses";
import LicenseMapping from "./modules/licenses/components/LicenseMapper/LicenseMapper";
// import WorkflowLoader from "./modules/workflow/components/WorkflowLoader/WorkflowLoader";
import AutomationRuleLoader from "./modules/workflow/components/AutomationRuleLoader/AutomationRuleLoader";
import EntityContainer from "./modules/licenses/container/EntityContainer";
import { screenEntity } from "./modules/licenses/constants/LicenseConstants";
import CreateStepper from "./modules/licenses/components/FormStepper/CreateStepper";
import EditStepper from "./modules/licenses/components/FormStepper/EditStepper";
import { Renewals } from "./modules/renewals/containers/Renewals/Renewals";
import Vendors from "./components/Applications/Vendors";
import UnauthorizedToView from "./common/restrictions/UnauthorizedToView";
import { userRoles } from "./constants/userRole";
import HeaderGlobalSearch from "./components/HeaderTitleAndGlobalSearch/HeaderGlobalSearch";
import { ModalContainer } from "UIComponents/ModalContainer";
import LoginFailed from "components/Onboarding/LoginFailed";
import { Instances } from "./modules/integrations/containers/Instances/Instances";
import { IntegrationsCatalog } from "modules/integrations/containers/Integrations/IntegrationsCatalog";
import WorkflowTemplateLoader from "modules/workflow/components/WorkflowTemplateLoader/WorkflowTemplateLoader";
import { USER_ONBOARDING_VIEW_STATUS } from "constants/users";
import { AppRequisition } from "modules/employee-dashboard/containers/appRequisition";
import EmployeeAutomationRuleLoader from "modules/employee-dashboard/components/AutomationRules/AutomationRulesLoader";
import AutomationRule from "modules/workflow/containers/AutomationRule/AutomationRule";
import { RequestOverview } from "modules/employee-dashboard/containers/RequestOverview";
import { savePartner } from "modules/shared/redux/app.redux";
import NotificationContainer from "modules/Notifications/NotificationContainer";
import OptimizationSummary from "modules/Optimization/OptimizationSummary/OptimizationSummary";
import GroupsContainer from "modules/Groups/components/GroupsContainer";
import {
	getValueFromLocalStorage,
	setValueToLocalStorage,
} from "utils/localStorage";
import { PARTNER } from "modules/shared/constants/app.constants";
import { useAuth0 } from "@auth0/auth0-react";

const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
	cluster: process.env.REACT_APP_CLUSTER,
});

function App({ isLoading }) {
	const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();
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
	const [enableBetaFeatures, setEnableBetaFeatures] = useState([]);
	const [partner, setPartner] = useState(null);
	const [connectionName, setConnectionName] = useState(null);

	useEffect(() => {
		if (partner) {
			dispatch(savePartner(partner));
			setValueToLocalStorage("partner", JSON.stringify(partner));
			if (window.location !== window.parent.location) {
				// MODAL OPEN & CLOSE EVENT IF IN IFRAME
				let modalFlag = false;
				try {
					window.addEventListener("click", () => {
						if (
							document.getElementsByClassName("modal").length &&
							!modalFlag
						) {
							modalFlag = true;
							partner.domains.forEach((part) => {
								window.parent.window.postMessage(
									{
										type: "event",
										listener: "modal_open",
										id: "",
									},
									part
								);
							});
						} else {
							if (
								modalFlag &&
								!document.getElementsByClassName("modal").length
							) {
								partner.domains.forEach((part) => {
									window.parent.window.postMessage(
										{
											type: "event",
											listener: "modal_close",
											id: "",
										},
										part
									);
								});

								modalFlag = false;
							}
						}
					});
				} catch (err) { }
				//

				// ADD LISTENER EVENT IF IN IFRAME
				window.addEventListener(
					"message",
					(event) => {
						if (!partner.domains.includes(event.origin)) return;
						if (event.data.type === "navigate") {
							console.log("Received navigate to", event.data.to);
							history.push(event.data.to);
						}
					},
					false
				);
				//
			}
		}
	}, [partner]);

	useEffect(() => {
		const param = getUrlVars(window.location.search);
		if (
			window.location !== window.parent.location ||
			(param.partner && param.iframe)
		) {
			if (param.connection) {
				setValueToLocalStorage("connection", param.connection);
			}
			if (param.partner) {
				setValueToLocalStorage("partnerName", param.partner);
			}

			if (param.connection || getValueFromLocalStorage("connection")) {
				setConnectionName(
					param.connection || getValueFromLocalStorage("connection")
				);
			}
			if (param.partner || getValueFromLocalStorage("partnerName")) {
				const partnerName =
					param.partner || getValueFromLocalStorage("partnerName");
				document.body.classList.add(`${partnerName.toLowerCase()}-app`);
				const part =
					PARTNER[
					Object.keys(PARTNER).find(
						(partner) =>
							PARTNER[partner].name.toLowerCase() ===
							partnerName.toLowerCase()
					)
					];

				part?.getStyle();
				setPartner(part);
			} else {
				setPartner(PARTNER.TANGOE); // Default partner tangoe
			}
		} else {
			setPartner(PARTNER.ZLURI);
		}
	}, []);

	useEffect(() => {
		if (user) {
			setValueToLocalStorage("user", JSON.stringify(user));
			dispatch(saveUserDetails(user));
		}
	}, [getAccessTokenSilently, user]);

	useEffect(() => {
		if (userInfo && isAuthenticated) {
			const {
				org_id,
				user_id,
				org_beta_features,
				user_status,
				org_status,
			} = userInfo;
			const betaFeatures = org_beta_features ? org_beta_features : [];
			if (getAppKey("REACT_APP_ENV") === "production") {
				setEnableBetaFeatures(betaFeatures);
			} else {
				setEnableBetaFeatures([...betaFeatures, "workflows"]);
			}
			if (
				org_id &&
				user_id &&
				![
					USER_ONBOARDING_VIEW_STATUS.INACTIVE,
					USER_ONBOARDING_VIEW_STATUS.BLOCKED,
				].includes(user_status) &&
				![
					USER_ONBOARDING_VIEW_STATUS.INACTIVE,
					USER_ONBOARDING_VIEW_STATUS.BLOCKED,
				].includes(org_status)
			) {
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
							/>,
							{
								onOpen: () => dispatch(increaseToastCounter()),
								onClose: () => dispatch(decreaseToastCounter()),
							}
						);
					}
				);
			}
		}
	}, [userInfo]);

	useEffect(() => {
		if (window.location.search) {
			const param = getUrlVars(window.location.search);
			if (param?.error_description && param?.state) {
				// window.location.href = `${getAppKey("REACT_APP_SIGN_UP")}/${
				// 	window.location.search
				// }`;
				history.push("/loginFailed", {
					error: param?.error_description,
				});
			}
		}
		if (partner) {
			console.log("Sent navigate to", location.pathname);
			partner.domains.forEach((part) => {
				window.parent.window.postMessage(
					{
						type: "navigate",
						to: location.pathname,
					},
					part
				);
			});
		}
		history.listen((location, action) => {
			if (location.pathname === "/search") {
				dispatch(openSearch());
			} else {
				dispatch(closeSearch());
			}
		});
		if (window.location.pathname === "/search") {
			dispatch(openSearch());
		}
	}, [window.location]);

	const sidebarPathsAndComps = [
		{
			path: "/transactions",
			comp: <Transactions />,
		},
		{
			path: "/chargebacks",
			comp: <ChargeBacks />,
		},
		{
			path: "/auditlogs",
			comp: <AuditLogs />,
		},
		{
			path: "/transactions#recognised",
			comp: <Transactions />,
		},
		{
			path: "/transactions/uploads/:id",
			comp: <UploadTransactions />,
		},
		{
			path: "/applications",
			comp: <Applications />,
		},
		{
			path: "/applications/:id",
			comp: <AllAppsApplications />,
		},
		{
			path: "/licenses/vendors/:id",
			comp: <SingleVendor />,
		},
		{
			path: "/departments",
			comp: <Departments />,
		},
		{
			path: "/departments/:id",
			comp: <AllDepartments />,
		},
		{
			path: "/overview",
			comp: <Overview />,
		},
		{
			path: "/users",
			comp: <Users />,
		},
		{
			path: "/users/:id",
			comp: <UsersInfo />,
		},
		{
			path: "/integrations",
			comp: <Integrations />,
			restrictedContentEntity: ENTITIES.INTEGRATIONS,
		},
		{
			path: "/integrations/:id",
			comp: <SingleIntegration />,
		},
		{
			path: "/integrations/:id/instance",
			comp: <Instances />,
		},
		{
			path: "/settings/:path",
			comp: <Settings />,
		},
		{
			path: "/settings",
			comp: <Settings />,
		},
		{
			path: "/security",
			comp: <Security />,
		},
		{
			path: "/security#criticalapps",
			comp: <Security />,
		},
		{
			path: "/reports",
			comp: <Reports />,
		},
		{
			path: "/agents",
			comp: <NewAgents />,
		},
		{
			path: "/agents#overview",
			comp: <NewAgents />,
		},
		{
			path: "/agents/:id",
			comp: <SingleAgent />,
		},
		{
			path: "/licenses",
			comp: <Licenses />,
		},
		{
			path: "/licenses/contracts/:id",
			comp: <EntityContainer entity={screenEntity.CONTRACT} />,
		},
		{
			path: "/licenses/subscriptions/:id",
			comp: <EntityContainer entity={screenEntity.SUBSCRIPTION} />,
		},
		{
			path: "/licenses/perpetuals/:id",
			comp: <EntityContainer entity={screenEntity.PERPETUAL} />,
		},
		{
			path: "/licenses/renewals",
			comp: <Renewals />,
		},
		{
			path: "/licenses/vendors",
			comp: <Vendors />,
		},
		{
			path: "/optimization/summary",
			comp: <OptimizationSummary />,
			betaFeatureKey: "optimization_summary",
		},
		{
			path: "/groups",
			comp: <GroupsContainer />,
			betaFeatureKey: "org_groups",
		},
		// Add features above workflow comps
		{
			path: "/workflows/onboarding",
			comp: <Workflows onboarding />,
			restrictToRoles: [
				userRoles.ADMIN,
				userRoles.OWNER,
				userRoles.IT_ADMIN,
				userRoles.INTEGRATION_ADMIN,
			],
		},
		{
			path: "/workflows/offboarding",
			comp: <Workflows offboarding />,
			restrictToRoles: [
				userRoles.ADMIN,
				userRoles.OWNER,
				userRoles.IT_ADMIN,
				userRoles.INTEGRATION_ADMIN,
			],
		},
		{
			path: "/workflows/apprequisition",
			comp: <AppRequisition isAdmin />,
			restrictToRoles: [
				userRoles.ADMIN,
				userRoles.OWNER,
				userRoles.IT_ADMIN,
				userRoles.INTEGRATION_ADMIN,
			],
		},
	];

	return (
		<div>
			<NotificationContainer />
			<ModalContainer />
			{!onlineStatus ? (
				<Offline />
			) : isLoading ||
				!partner ||
				(partner?.name !== PARTNER.ZLURI.name && !connectionName) ? (
				<LoaderPage />
			) : [
				"/page-not-found",
				"/steps",
				"/orgblocked",
				"/newuseroverview",
				"/deactivated",
				"/verify",
				"/createplan",
				"/licenses/contracts",
				"/integrations/connectInvite",
				"/onboarding/signinoptions/two-step-verification",
				"/contract/new",
				"/perpetual/new",
				"/subscription/new",
			].includes(window.location.pathname) ||
				[
					"/loginFailed",
					"/onboarding/integrations",
					"/contract/edit",
					"/perpetual/edit",
					"/licenses/mapping",
					"/subscription/edit",
					"/offboarding/declaration/workflows",
					"/license/request/overview",
				].find((path) => window.location.pathname.startsWith(path)) ? (
				<RoleProvider value={{ partner }}>
					<Switch>
						<Route
							exact
							path="/offboarding/declaration/workflows/:workflowId/user/:userId"
						>
							<OffboardingDashboard />
						</Route>
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
						<Route exact path="/deactivated">
							<AccountDeactivated />
						</Route>
						<Route exact path="/orgblocked">
							<OrgBlocked />
						</Route>
						<ProtectedRoute exact path="/newuseroverview">
							<NewUserOverview />
						</ProtectedRoute>
						<Route exact path="/integrations/connectInvite">
							<AdminIntegrationInvite />
						</Route>
						<Route exact path="/page-not-found">
							<PageNotFound />
						</Route>
						<Route exact path="/loginFailed">
							<LoginFailed />
						</Route>
						{userRole === userRoles.VIEWER ||
							userRole === userRoles.EMPLOYEE ||
							userRole === userRoles.INTEGRATION_ADMIN ||
							userRole === userRoles.SECURITY_ADMIN ? (
							<UnauthorizedToView />
						) : (
							<>
								<ProtectedRoute exact path="/contract/new">
									<CreateStepper
										entity={screenEntity.CONTRACT}
									/>
								</ProtectedRoute>
								<ProtectedRoute exact path="/subscription/new">
									<CreateStepper
										entity={screenEntity.SUBSCRIPTION}
									/>
								</ProtectedRoute>
								<ProtectedRoute exact path="/perpetual/new">
									<CreateStepper
										entity={screenEntity.PERPETUAL}
									/>
								</ProtectedRoute>
								<ProtectedRoute
									exact
									path="/contract/edit/:contractId"
								>
									<EditStepper
										entity={screenEntity.CONTRACT}
									/>
								</ProtectedRoute>
								<ProtectedRoute
									exact
									path="/perpetual/edit/:perpetualId"
								>
									<EditStepper
										entity={screenEntity.PERPETUAL}
									/>
								</ProtectedRoute>
								<ProtectedRoute
									exact
									path="/subscription/edit/:subscriptionId"
								>
									<EditStepper
										entity={screenEntity.SUBSCRIPTION}
									/>
								</ProtectedRoute>
								<ProtectedRoute
									exact
									path="/licenses/mapping/:Id"
								>
									<LicenseMapping />
								</ProtectedRoute>
								<ProtectedRoute
									exact
									path="/license/request/overview/:id"
								>
									<RequestOverview isAdmin={true} />
								</ProtectedRoute>
							</>
						)}
					</Switch>
				</RoleProvider>
			) : (location.pathname.includes("/workflow") ||
				location.pathname.includes("/playbook")) &&
				!location.pathname.includes("/workflows") &&
				!location.pathname.includes("/workflow/rule") ? (
				<Sentry.ErrorBoundary fallback={GlobalError}>
					<RoleProvider value={{ partner }}>
						<ProtectedRoute exact path="/creating/workflow">
							<WorkflowLoader />
						</ProtectedRoute>
						<ProtectedRoute
							exact
							path="/creating/workflow/playbook"
						>
							<WorkflowTemplateLoader />
						</ProtectedRoute>
						<ProtectedRoute path="/playbook/:id">
							<Workflow />
						</ProtectedRoute>
						<ProtectedRoute path="/workflow/:id">
							<Workflow />
						</ProtectedRoute>
					</RoleProvider>
				</Sentry.ErrorBoundary>
			) : location.pathname.includes("/integrations/catalog") &&
				!location.pathname.includes("/integrations/catalog/detail") ? (
				<Sentry.ErrorBoundary fallback={GlobalError}>
					<RoleProvider value={{ partner }}>
						<ProtectedRoute path="/integrations/catalog/:id">
							<IntegrationsCatalog />
						</ProtectedRoute>
						<ProtectedRoute exact path="/integrations/catalog">
							<IntegrationsCatalog />
						</ProtectedRoute>
					</RoleProvider>
				</Sentry.ErrorBoundary>
			) : location.pathname.includes("/integrations/catalog/detail") ? (
				<Sentry.ErrorBoundary fallback={GlobalError}>
					<RoleProvider value={{ partner }}>
						<ProtectedRoute path="/integrations/catalog/detail/:id">
							<SingleIntegration />
						</ProtectedRoute>
					</RoleProvider>
				</Sentry.ErrorBoundary>
			) : location.pathname.includes("/workflow/rule") ? (
				<Sentry.ErrorBoundary fallback={GlobalError}>
					<RoleProvider value={{ partner }}>
						<ProtectedRoute path="/workflow/rule/:id">
							<AutomationRule />
						</ProtectedRoute>
						<ProtectedRoute exact path="/creating/workflow/rule">
							<AutomationRuleLoader />
						</ProtectedRoute>
					</RoleProvider>
				</Sentry.ErrorBoundary>
			) : location.pathname.includes("/apprequisition/rule") ? (
				<>
					<Sentry.ErrorBoundary fallback={GlobalError}>
						<RoleProvider value={{ partner }}>
							<ProtectedRoute
								exact
								path="/creating/apprequisition/rule"
							>
								<EmployeeAutomationRuleLoader />
							</ProtectedRoute>
							<ProtectedRoute
								exact
								path="/apprequisition/rule/:id"
							>
								<AutomationRule type="apprequisition" />
							</ProtectedRoute>
						</RoleProvider>
					</Sentry.ErrorBoundary>
				</>
			) : (
				<RoleProvider
					value={{
						isViewer,
						userRole,
						enableBetaFeatures,
						partner,
					}}
				>
					{isAuthenticated ? (
						<Sidebar>
							<>
								{searchActive ? (
									<HeaderGlobalSearch />
								) : (
									<Sentry.ErrorBoundary
										fallback={GlobalError}
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
														connectionName={
															connectionName
														}
														partner={partner}
														setIsViewer={
															setIsViewer
														}
														isViewer={isViewer}
														setUserRole={
															setUserRole
														}
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

												{sidebarPathsAndComps.map(
													(protectedRoute, index) => {
														if (
															protectedRoute.betaFeatureKey &&
															!userInfo?.org_beta_features?.includes(
																protectedRoute.betaFeatureKey
															)
														) {
															return;
														}
														if (
															Array.isArray(
																protectedRoute.restrictToRoles
															) &&
															protectedRoute
																.restrictToRoles
																.length > 0
														) {
															if (
																!protectedRoute.restrictToRoles.includes(
																	userRole
																)
															) {
																return (
																	<UnauthorizedToView
																		height={
																			"700px"
																		}
																	/>
																);
															}
														}
														return (
															<ProtectedRoute
																key={index}
																exact
																path={
																	protectedRoute.path
																}
															>
																{protectedRoute.restrictedContentEntity ? (
																	<RestrictedContent
																		entity={
																			protectedRoute.restrictedContentEntity
																		}
																	>
																		{
																			protectedRoute.comp
																		}
																	</RestrictedContent>
																) : (
																	protectedRoute.comp
																)}
															</ProtectedRoute>
														);
													}
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
														setIsViewer={
															setIsViewer
														}
														isViewer={isViewer}
														setUserRole={
															setUserRole
														}
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
					) : (
						<Switch>
							<Route exact path="/login">
								<Login />
							</Route>
							<Route exact path="/logout">
								<Logout />
							</Route>
							<Route exact path="*">
								<CheckAuth
									connectionName={connectionName}
									partner={partner}
									setIsViewer={setIsViewer}
									isViewer={isViewer}
									setUserRole={setUserRole}
									setUserBlocked={setUserBlocked}
								/>
							</Route>
						</Switch>
					)}
				</RoleProvider>
			)}
		</div>
	);
}

export default App;
