import React, { useCallback, useContext, useEffect, useState } from "react";
import { applicationConstants, ENTITIES } from "../constants";
import { useLocation } from "react-router-dom";
import { Transactions } from "../components/Applications/AllApps/Transactions/transactions";
import { AddTransactionModal } from "../components/Transactions/Modals/AddTransactionModal";
import { TabsAllApps } from "../components/Applications/TabsAllApps";
import { Recommendations } from "../components/Applications/Recommendations/Recommendations";
import { Users } from "../components/Applications/Users/Users";
import {
	addLicenseContract,
	getApplicationInfo,
	getApplicationRecommendations,
	getApplicationSecurityOverview,
} from "../services/api/applications";
import { GlobalError } from "../common/GlobalError";
import { useHistory } from "react-router-dom";
import { AddUserApplication } from "../components/Applications/Users/Modals/AddUserApplication";
import { addManualUsage } from "../services/api/users";
import { addTransaction } from "../services/api/transactions";
import { useDispatch, useSelector } from "react-redux";
import RestrictedContent from "../common/restrictions/RestrictedContent";
import { fetchSingleAppContractInfo } from "../actions/applications-action";
import SecurityCompliance from "../components/Applications/SecurityCompliance";
import RoleContext from "../services/roleContext/roleContext";
import UnauthorizedToView from "../common/restrictions/UnauthorizedToView";
import { userRoles } from "../constants/userRole";
import { TriggerIssue } from "../utils/sentry";
import ApplicationLicenses from "../components/Applications/Licenses/ApplicationLicenses";
import HeaderTitleBC from "../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { goBack } from "connected-react-router";
import Overview from "../modules/applications/components/overview/Overview";
import HealthInsights from "components/Applications/HealthInsights";
import { trackPageSegment } from "modules/shared/utils/segment";
import OptimizationContainer from "modules/Optimization/OptimizationContainer";
import { generateApplicationOptimization } from "services/api/optimization";
import { optimizationEntityType } from "modules/Optimization/constants/OptimizationConstants";
import { showAppOptimizationGetStarted } from "modules/Optimization/utils/OptimizationUtils";

import { Automation } from "../modules/applications/components/automation/automation";
export function AllAppsApplications(props) {
	const { userRole } = useContext(RoleContext);
	const [app, setApp] = useState();
	const [appSecurityData, setAppSecurityData] = useState();
	const location = useLocation();
	const [appId, setAppId] = useState(location.pathname.split("/")[2]);
	const [isFetching, setIsFetching] = useState(true);
	const [isFetchingSecurity, setIsFetchingSecurity] = useState(true);
	const [userSubmitting, setSubmittingTransaction] = useState(false);
	const [submittingTransaction, setUserSubmitting] = useState(false);
	const [recommendations, setRecommendations] = useState([]);
	const [loadingRecommendations, setLoadingRecommendations] = useState(true);
	const history = useHistory();
	const dispatch = useDispatch();

	const { application_tabs, org_beta_features } = useSelector(
		(state) => state.userInfo
	);
	const defaultTab = application_tabs.find((tab) => tab.isDefault);

	const { showAddTransaction, showAddUser } = useSelector((state) => {
		const { showAddTransaction, showAddUser } = state.applications;
		return { showAddTransaction, showAddUser };
	});

	useEffect(() => {
		// Manually refresh app data when navigated back to overview page
		setAppId(location.pathname.split("/")[2]);
		if ((appId && !app) || location.hash === "#overview") {
			handleAppChange();
		}

		trackPageSegment(
			"Applications",
			`Applications ${location.hash.substring(1)}`,
			{
				appId: appId,
				appName: app?.app_name || "",
			}
		);
		const hash = location.hash.slice(1);
		if (!hash) history.push("#overview");
	}, [location, appId]);

	const fetchAppDetails = (shouldReload = true) => {
		shouldReload && setIsFetching(true);
		getApplicationInfo(location.pathname.split("/")[2])
			.then((res) => {
				setIsFetching(false);
				if (!res.error) setApp(res);
				else {
					throw new Error(res.error);
				}
			})
			.catch((err) => {
				setIsFetching(false);
				console.error("Error fetching user details:", err);
			});
	};

	const fetchAppSecurityDetails = () => {
		setIsFetchingSecurity(true);
		getApplicationSecurityOverview(location.pathname.split("/")[2])
			.then((res) => {
				setIsFetchingSecurity(false);
				if (!res.error) setAppSecurityData(res);
				else {
					throw new Error(res.error);
				}
			})
			.catch((err) => {
				setIsFetchingSecurity(false);
				console.error("Error fetching app security details:", err);
			});
	};

	const handleAddManualUsage = async ({ userId, frequency, interval }) => {
		try {
			const appId = window.location.pathname.split("/")[2];
			setUserSubmitting(true);
			const res = await addManualUsage(
				userId,
				appId,
				frequency,
				interval
			);
			if (res.status === "success") {
				setUserSubmitting(false);
				dispatch({
					type: applicationConstants.TOGGLE_ADD_USER,
					payload: false,
				});
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

	const handleTransactionAdd = (transaction) => {
		setSubmittingTransaction(true);
		const transactionObj = {
			...transaction,
			org_application_id: app?.app_id,
		};
		addTransaction(transactionObj)
			.then((res) => {
				if (res.error) {
					console.error("Error while adding a new transaction");
					setSubmittingTransaction(false);
					return;
				}
				setSubmittingTransaction(false);
				dispatch({
					type: applicationConstants.TOGGLE_ADD_TRANSACTION,
					payload: false,
				});
			})
			.catch((err) => {
				TriggerIssue("Error while adding a new transaction:", err);
				setSubmittingTransaction(false);

				if (err && err.response && err.response.data) {
				}
			});
	};

	const handleAppChange = () => {
		setApp();
		fetchAppDetails();
		fetchAppSecurityDetails();
		fetchAppRecommendations();
	};

	const fetchAppRecommendations = () => {
		getApplicationRecommendations(appId)
			.then((res) => {
				setLoadingRecommendations(false);
				if (!res.error)
					setRecommendations(
						res.filter(
							(recommendation) =>
								!isNaN(
									recommendation?.[
										Object.keys(recommendation)?.[0]
									]?.user_count
								) &&
								recommendation?.[
									Object.keys(recommendation)?.[0]
								]?.user_count > 0
						)
					);
				else {
					throw new Error(res.error);
				}
			})
			.catch((err) => {
				setLoadingRecommendations(false);
				console.error("Error fetching app recommendations:", err);
			});
	};

	return (
		<>
			{userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<div
					style={
						location.hash === "#transactions"
							? {
									backgroundColor: "#FAFBFC",
							  }
							: {}
					}
				>
					<HeaderTitleBC
						title="Applications"
						inner_screen={true}
						entity_name={app?.app_name}
						entity_logo={app?.app_logo}
						go_back_url={`/applications#${defaultTab.name}`}
					/>
					<div
						style={{
							padding: "0px 40px",
							backgroundColor: "white",
						}}
					>
						<TabsAllApps org_beta_features={org_beta_features} />
					</div>
					{location.hash === "#overview" || "" ? (
						app || isFetching ? (
							<Overview
								app={app}
								loading={isFetching}
								appSecurityData={appSecurityData}
								onAppChange={handleAppChange}
								fetchAppDetails={fetchAppDetails}
							/>
						) : (
							<GlobalError />
						)
					) : null}
					{location.hash === "#users" ? (
						<RestrictedContent entity={ENTITIES.APPLICATION_USERS}>
							<Users application={app} />
						</RestrictedContent>
					) : null}
					{location.hash === "#licenses" ? (
						<RestrictedContent
							entity={ENTITIES.APPLICATION_LICENSES}
						>
							<ApplicationLicenses application={app} />
						</RestrictedContent>
					) : null}
					{location.hash === "#transactions" ? (
						<RestrictedContent
							entity={ENTITIES.APPLICATION_TRANSACTIONS}
						>
							<Transactions application={app} />
						</RestrictedContent>
					) : null}
					{org_beta_features?.includes("optimization") &&
					location.hash === "#optimization" ? (
						<RestrictedContent
							entity={ENTITIES.APPLICATION_OPTIMIZATION}
						>
							<OptimizationContainer
								app={app}
								entityId={appId}
								api={generateApplicationOptimization}
								entityType={optimizationEntityType.application}
								showGetStarted={showAppOptimizationGetStarted(
									app
								)}
								contractCount={app?.app_active_contracts}
								userAppLicenseCount={
									app?.app_user_with_license_count
								}
								licenseCount={app?.app_active_licenses}
							/>
						</RestrictedContent>
					) : null}
					{location.hash === "#appInsights" ? (
						<HealthInsights
							app={app}
							appRecommendations={recommendations}
							loadingRecommendations={loadingRecommendations}
							fetchAppDetails={fetchAppDetails}
							recommendationsCmp={
								<Recommendations
									application={app}
									appRecommendations={recommendations}
									loadingRecommendations={
										loadingRecommendations
									}
								/>
							}
						/>
					) : null}
					{location.hash === "#automation" ? (
						<Automation app={app} />
					) : null}
					{location.hash === "#security" ? (
						<RestrictedContent
							entity={ENTITIES.APPLICATION_RECOMMANDATIONS}
						>
							<SecurityCompliance application={app} />
						</RestrictedContent>
					) : null}
					{showAddUser && (
						<AddUserApplication
							handleClose={() =>
								dispatch({
									type: applicationConstants.TOGGLE_ADD_USER,
									payload: false,
								})
							}
							isOpen={showAddUser}
							handleSubmit={handleAddManualUsage}
							submitting={userSubmitting}
						/>
					)}
					{showAddTransaction && (
						<AddTransactionModal
							isOpen={showAddTransaction}
							application={app}
							submitting={submittingTransaction}
							handleClose={() =>
								dispatch({
									type: applicationConstants.TOGGLE_ADD_TRANSACTION,
									payload: false,
								})
							}
							handleSubmit={handleTransactionAdd}
						/>
					)}
				</div>
			)}
		</>
	);
}
