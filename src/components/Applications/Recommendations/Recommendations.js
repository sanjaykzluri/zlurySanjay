import React, { useEffect } from "react";
import { RecommendationFilter } from "./RecommendationFilter";
import { useDispatch, useSelector } from "react-redux";
export function Recommendations({
	application,
	appRecommendations,
	loadingRecommendations,
}) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		//Segment Implementation
		if (application?.app_name) {
			window.analytics.page(
				"Applications",
				"Application-Recommendations",
				{
					app_name: application.app_name,
					app_id: application.app_id,
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, []);
	return (
		<>
			<RecommendationFilter
				application={application}
				appRecommendations={appRecommendations}
				loadingRecommendations={loadingRecommendations}
			></RecommendationFilter>
		</>
	);
}
