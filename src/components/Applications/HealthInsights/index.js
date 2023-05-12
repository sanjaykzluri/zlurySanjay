import React, { useContext, useEffect, useState } from "react";
import HealthCardsSlider from "modules/applications/components/HealthMetrics/HealthMetrics";
import HealthScore from "modules/applications/components/overview/HealthScore";
import activitymanager from "components/Applications/Recommendations/activitymanager.svg";
import arrow from "components/Applications/Recommendations/arrow.svg";
import healthPoints from "assets/applications/card_health_points.svg";

import "./styles.css";
import { Dropdown } from "react-bootstrap";

import EllipsisSVG from "assets/card_ellipsis.svg";
import { useSelector } from "react-redux";
import { getAppHealthChangeLogs } from "services/api/applications";
import moment from "moment";
import { getStringFromTemplate } from "utils/common";
import RoleContext from "services/roleContext/roleContext";
import { userRoles } from "constants/userRole";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";

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
export default function HealthInsights({
	app,
	recommendations,
	recommendationsCmp,
	loadingRecommendations,
	fetchAppDetails,
}) {
	const { userRole } = useContext(RoleContext);
	const [logs, setLogs] = useState([]);

	useEffect(() => {
		if (app?.app_id) {
			getAppHealthChangeLogs(app?.app_id).then((res) => {
				setLogs(res);
			});
		}
	}, [app?.app_id]);
	const { SHOW_HEALTH_POINTS } = useSelector((state) => state.featureFlags);

	return (
		<>
			{userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView height="700px" />
			) : (
				<>
					<div>
						<div className="securityoverview__wrapper">
							<div
								className="securityoverview__left"
								style={{
									maxWidth: "400px",
									marginRight: "10px",
								}}
							>
								{SHOW_HEALTH_POINTS && (
									<>
										<HealthScore
											fontSize={60}
											stroke={20}
											width={300}
											color="#71CFAC"
										/>
										<div className="healthinsights-healthscore__label">
											App Health for {app?.app_name}
										</div>
									</>
								)}
								<div className="healthinsights-logs__label">
									RECENT CHANGES
								</div>
								<div className="healthinsights-logs__container">
									{logs.map((log) => (
										<div className="mt-2">
											<div className="date" style={{}}>
												{moment(log.createdAt).format(
													"D MMM YYYY"
												)}
											</div>
											<div>
												<span className="addon-text">
													{getStringFromTemplate(
														log.description,
														app
													) || ""}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
							<div
								className="securityoverview__right"
								style={{
									padding: "10px 20px 0px",
									overflowX: "auto",
								}}
							>
								<HealthCardsSlider
									app={app}
									fetchAppDetails={fetchAppDetails}
									tab="health-insights"
								/>
								<div>{recommendationsCmp}</div>
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}
