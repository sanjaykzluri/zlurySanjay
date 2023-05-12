import HeaderTitleBC from "components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { trackPageSegment } from "modules/shared/utils/segment";
import React, { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { getAppInsights } from "services/api/employeeDashboard";
import { AppFeatures } from "../components/appFeatures";
import { AppInsights } from "../components/appInsights";
import { Compliances } from "../components/compliances";
import { OverviewDetails } from "../components/overviewDetails";
import { OverviewHeader } from "../components/overviewHeader";
import { RequestLicenseModal } from "../components/requestLicenseModal";
import { SecurityEvents } from "../components/securityEvents";
import { SimilarAppsSection } from "../components/similarAppsSection";

export function SingleApplication() {
	const location = useLocation();
	const history = useHistory();
	const [appId, setAppId] = useState(location.pathname.split("/")[3]);
	const [app, setApp] = useState();
	const [loadingApp, setLoadingApp] = useState(true);
	const [activeTab, setActiveTab] = useState("insights");

	const [insightsData, setInsightaData] = useState();
	const [loadingInsights, setLoadingInsights] = useState(true);

	const { userInfo } = useSelector((state) => state);
	const [requestLicenseModalOpen, setRequestLicenseModalOpen] =
		useState(false);
	useEffect(() => {
		handleAppChange();
	}, [appId]);
	useEffect(() => {
		setAppId(location.pathname.split("/")[3]);
	}, [location, appId]);

	const handleAppChange = () => {
		trackPageSegment("Employee View", `Single Application `, {
			notes: `Individual application viewed`,
		});
		setLoadingInsights(true);
		getAppInsights(appId)
			.then((res) => {
				if (res) {
					setInsightaData({ ...res.data, app_id: appId });
					setLoadingInsights(false);
				}
			})
			.catch((err) => {
				setLoadingInsights(false);
			});
	};

	useEffect(() => {
		if (location?.state?.app) {
			setApp(location?.state?.app);
			setLoadingApp(false);
		}
	}, []);
	const TabNabItem = (hash, text, id) => {
		return (
			<div className="nav-item">
				<a
					href={`#${id}`}
					className={`nav-link cursor-pointer ${
						activeTab === hash ? "active" : ""
					}`}
					onClick={() => {
						setActiveTab(hash);
					}}
				>
					{text}{" "}
				</a>
			</div>
		);
	};

	return (
		<>
			<HeaderTitleBC
				title={"Applications"}
				inner_screen={true}
				entity_name={insightsData && insightsData.app_name}
				entity_logo={insightsData && insightsData.app_logo}
				go_back_url={"/user/applications"}
			/>
			<hr style={{ margin: "0px 40px" }}></hr>
			<OverviewHeader
				app={{
					app_id: appId,
					app_name: insightsData?.app_name,
					app_logo: insightsData?.app_logo,
					app_in_org: insightsData?.app_in_org,
					app_category:
						insightsData?.app_categories?.[0]?.category_name,
					...insightsData,
				}}
				loading={loadingInsights}
				setRequestLicenseModalOpen={setRequestLicenseModalOpen}
				handleAppChange={handleAppChange}
			></OverviewHeader>
			<div style={{ padding: "0px 40px" }}>
				<ul className="nav nav-tabs">
					{userInfo?.apps_permissions?.application_settings
						?.show_insights &&
						TabNabItem("insights", "Insights", "insights__a")}
					{TabNabItem("overview", "Overview", "insights__b")}
					{userInfo?.apps_permissions?.application_settings
						?.show_features &&
						TabNabItem("features", "Features", "insights__c")}
					{(userInfo?.apps_permissions?.application_settings
						?.show_security_information ||
						userInfo?.apps_permissions?.application_settings
							?.show_compliances) &&
						TabNabItem(
							"security",
							"Security & Compliance",
							"insights__d"
						)}
				</ul>
			</div>
			<div className="d-flex w-100">
				<div
					style={{
						width: "calc(100% - 300px)",
						backgroundColor: "#FAFBFC",
						padding: "25px 40px 40px",
					}}
				>
					{!loadingInsights && (
						<div
							className="font-16 black-1 bold-600"
							id="insights__a"
						>
							{insightsData?.app_in_org
								? "In your Org"
								: "Application Details"}
						</div>
					)}

					{userInfo?.apps_permissions?.application_settings
						?.show_insights &&
						insightsData?.app_in_org && (
							<AppInsights
								data={insightsData}
								loading={loadingInsights}
								setActiveTab={setActiveTab}
							/>
						)}
					<div
						className="font-16 black-1 bold-600"
						style={{ marginTop: "50px" }}
						id="insights__b"
					>
						{loadingInsights ? (
							<>
								<ContentLoader
									style={{ marginRight: 8 }}
									width={207}
									height={18}
									backgroundColor={`#DDDDDD`}
								>
									<rect
										width="207"
										height="18"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</>
						) : (
							"Overview"
						)}
					</div>
					<OverviewDetails
						data={insightsData}
						loading={loadingInsights}
					/>
					{userInfo?.apps_permissions?.application_settings
						?.show_features && (
						<>
							<AppFeatures
								data={insightsData?.features}
								loading={loadingInsights}
							/>
						</>
					)}
					{loadingInsights ||
					insightsData?.events?.length ||
					(insightsData?.compliances?.length &&
						(userInfo?.apps_permissions?.application_settings
							?.show_security_information ||
							userInfo?.apps_permissions?.application_settings
								?.show_compliances)) ? (
						<div
							className="font-16 black-1 bold-600"
							style={{ marginTop: "50px" }}
							id="insights__d"
						>
							Security & Compliance
						</div>
					) : null}
					{userInfo?.apps_permissions?.application_settings
						?.show_security_information && (
						<SecurityEvents
							data={insightsData?.events}
							loading={loadingInsights}
						/>
					)}
					{userInfo?.apps_permissions?.application_settings
						?.show_compliances && (
						<Compliances
							data={insightsData?.compliances}
							loading={loadingInsights}
						/>
					)}
				</div>
				<div style={{ width: "300px", padding: "0px 40px" }}>
					{userInfo?.apps_permissions?.application_settings
						?.show_similar_apps && (
						<>
							<div
								className="font-16 black-1 bold-600"
								style={{ marginTop: "25px" }}
							>
								Similar Apps in your Org
							</div>
							<SimilarAppsSection
								handleOnClick={(app) =>
									history.push(
										`/user/applications/${app._id}`
									)
								}
								app_in_org={location?.state?.app_in_org}
							/>
						</>
					)}
				</div>
			</div>
			{requestLicenseModalOpen && (
				<RequestLicenseModal
					isOpen={requestLicenseModalOpen}
					handleClose={() => setRequestLicenseModalOpen(false)}
					app={{ ...insightsData, app_in_org: true }}
				/>
			)}
		</>
	);
}
