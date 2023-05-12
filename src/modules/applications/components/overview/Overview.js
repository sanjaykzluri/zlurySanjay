import React from "react";
import ApplicationDepartmentWiseSpend from "./ApplicationDepartmentWiseSpend";
import ApplicationDepartmentWiseUsage from "./ApplicationDepartmentWiseUsage";
import ApplicationDescription from "./ApplicationDescription";
import ApplicationDetails from "./ApplicationDetails";
import { ApplicationNotes } from "./ApplicationNotes";
import ApplicationSpendVSCost from "./ApplicationSpendVSCost";
import ApplicationSplitUsage from "./ApplicationSplitUsage";
import ApplicationNeedsReview from "./ApplicationNeedsReview";
import "./Overview.css";
import HealthCardsSlider from "../HealthMetrics/HealthMetrics";
import HealthCard from "../HealthMetrics/HealthCard";
import HealthScore from "./HealthScore";
import { useSelector } from "react-redux";

import { Button } from "UIComponents/Button/Button";
import { LicenseReview } from "./LicenseReviewContainer";

export default function Overview({
	app,
	loading,
	appSecurityData,
	onAppChange,
	fetchAppDetails,
}) {
	const { SHOW_HEALTH_POINTS } = useSelector((state) => state.featureFlags);

	return (
		<>
			<div className="securityoverview__wrapper">
				<div
					className="securityoverview__left"
					style={{ maxWidth: "400px", marginRight: "10px" }}
				>
					<ApplicationDescription
						app={app}
						loading={loading}
						appSecurityData={appSecurityData}
						onAppChange={onAppChange}
					/>
				</div>
				<div
					className="securityoverview__right"
					style={{ padding: "10px 20px 0px" }}
				>
					<ApplicationDetails
						app={app}
						onAppChange={onAppChange}
						loading={loading}
					/>
					{/* For next release */}
					{/* <LicenseReview app={app} /> */}
					{app?.app_auth_status === "needs review" && (
						<ApplicationNeedsReview
							app={app}
							onAppChange={onAppChange}
						/>
					)}
					{SHOW_HEALTH_POINTS && (
						<div className="health__score mt-5">
							<div className="health__score__label">
								<HealthScore
									style={{ width: 72, height: 72 }}
									color="#EE8F6E"
									fontSize={18}
									stroke={8}
								/>
								<div className="mx-4">Low App Health!</div>
							</div>
							<div className="health__score__right__text">
								Complete App Review to revive health
							</div>
						</div>
					)}
					<HealthCardsSlider
						app={app}
						fetchAppDetails={fetchAppDetails}
						tab="overview"
					/>
					{!loading && (
						<ApplicationSplitUsage
							app={app}
							onAppChange={onAppChange}
						/>
					)}
					<ApplicationNotes app={app} loading={loading} />
					<ApplicationSpendVSCost />
					<ApplicationDepartmentWiseSpend
						app={app}
						loading={loading}
					/>
					<ApplicationDepartmentWiseUsage
						app={app}
						loading={loading}
					/>
				</div>
			</div>
		</>
	);
}
