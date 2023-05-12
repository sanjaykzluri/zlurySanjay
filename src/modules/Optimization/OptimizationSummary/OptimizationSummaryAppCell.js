import React from "react";
import {
	authStatusObj,
	AppAuthStatusIconAndTooltip,
} from "common/AppAuthStatus";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { trackActionSegment } from "modules/shared/utils/segment";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import { useHistory } from "react-router-dom";

export default function OptimizationSummaryAppCell({
	app_name,
	app_logo,
	app_auth_status,
	app_id,
}) {
	const history = useHistory();
	return (
		<div className="optimization_summary_app_cell">
			<GetImageOrNameBadge
				url={app_logo}
				name={app_name}
				height={20}
				width={20}
			/>
			<LongTextTooltip
				text={app_name}
				maxWidth={147}
				style={{
					color: "#2266E2",
					cursor: "pointer",
					height: "20px",
					marginTop: "2.5px",
				}}
				onClick={() => {
					trackActionSegment("Clicked on Single App", {
						currentCategory: `Optimization Summary`,
						currentComponent: "Optimization Summary App Cell",
					});
					history.push(`/applications/${app_id}#overview`);
				}}
			/>
			{app_name &&
				app_id &&
				Object.keys(authStatusObj).includes(
					app_auth_status?.replace(/ /g, "_")
				) && (
					<AppAuthStatusIconAndTooltip
						authStatus={app_auth_status || "needs review"}
						height={13}
						width={13}
						style={{ height: "20px" }}
						className="d-flex align-items-center"
					/>
				)}
		</div>
	);
}
