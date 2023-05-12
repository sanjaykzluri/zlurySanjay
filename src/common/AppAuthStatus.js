import React from "react";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";
import authorised from "../assets/applications/authorised.svg";
import needsreview from "../assets/applications/needsreview.svg";
import restricted from "../assets/applications/restricted.svg";
import unmanaged from "../assets/applications/unmanaged.svg";
import teammanaged from "../assets/applications/teammanaged.svg";
import individuallymanaged from "../assets/applications/individuallymanaged.svg";

export const authStatusObj = {
	centrally_managed: {
		image: authorised,
		tooltip: "Centrally  Managed",
		overviewTooltip:
			"App approved and deployed centrally across the org by IT.",
	},
	team_managed: {
		image: teammanaged,
		tooltip: "Team Managed",
		overviewTooltip: "App used by specific teams but approved by IT.",
	},
	individually_managed: {
		image: individuallymanaged,
		tooltip: "Individually Managed",
		overviewTooltip: "App approved by IT but used by specific employees.",
	},
	unmanaged: {
		image: unmanaged,
		tooltip: "Unmanaged",
		overviewTooltip:
			"App used by employees but not approved or managed by IT.",
	},
	restricted: {
		image: restricted,
		tooltip: "Restricted",
		overviewTooltip: "This application is not authorised by the IT admin.",
	},
	needs_review: {
		image: needsreview,
		tooltip: "Needs Review",
		overviewTooltip:
			"This application is in review for its security & compliance policies.",
	},
};

export function AppAuthStatusIconAndTooltip(props) {
	const { authStatus, className, height, width, showTooltip, style } = props;

	return (
		<div className={className} style={style}>
			<OverlayTrigger
				placement="top"
				show={showTooltip}
				overlay={
					<BootstrapTooltip>
						{authStatus &&
							authStatusObj?.[authStatus?.replace(/ /g, "_")]
								?.tooltip}
					</BootstrapTooltip>
				}
			>
				<img
					src={
						authStatus &&
						authStatusObj?.[authStatus?.replace(/ /g, "_")]?.image
					}
					height={height || 12}
					width={width || 12}
				/>
			</OverlayTrigger>
		</div>
	);
}
