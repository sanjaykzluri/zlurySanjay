import { trackActionSegment } from "modules/shared/utils/segment";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import { unescape, urlifyImage } from "../utils/common";
import { AppAuthStatusIconAndTooltip, authStatusObj } from "./AppAuthStatus";
import { NameBadge } from "./NameBadge";

export default function AppTableComponent({
	app_name,
	app_logo,
	app_auth_status,
	app_id,
	app_status,
	logo_height,
	logo_width,
	customTooltip,
	tooltipClassName,
	screenTagKey,
	v2TableEntity,
	redirect_link,
}) {
	return (
		<div className="flex flex-row align-items-center">
			<div className="d-flex flex-row">
				<div className="position-relative mr-2">
					{app_logo && typeof app_logo === "string" ? (
						<div
							className="background-contain background-no-repeat background-position-center"
							style={{
								backgroundImage: `url(${urlifyImage(
									unescape(app_logo)
								)})`,
								height: logo_width || "28px",
								width: logo_width || "28px",
							}}
						></div>
					) : (
						<NameBadge width={logo_width} name={app_name} />
					)}
					{app_status && (
						<div
							className={
								app_status === "active"
									? "activeStatus position-absolute"
									: "inActiveStatus position-absolute"
							}
						></div>
					)}
				</div>
			</div>
			<Link
				to={
					redirect_link ||
					`/applications/${encodeURI(app_id)}#overview`
				}
				className="custom__app__name__css text-decoration-none"
			>
				<OverlayTrigger
					placement="top"
					overlay={
						<Tooltip className={customTooltip && tooltipClassName}>
							{customTooltip ? customTooltip : app_name}
						</Tooltip>
					}
				>
					<div
						className="truncate_10vw"
						style={{ marginLeft: "8px" }}
						onClick={() => {
							trackActionSegment("Clicked on Single App", {
								currentCategory: `${screenTagKey || ""} ${
									v2TableEntity || ""
								} `,
								currentComponent: "App Link Component",
							});
						}}
					>
						{app_name}
					</div>
				</OverlayTrigger>
			</Link>
			{app_name &&
				Object.keys(authStatusObj).includes(
					app_auth_status?.replace(/ /g, "_")
				) && (
					<div className="d-flex badge badge-pill badge-light align-items-center ml-1 p-1">
						<AppAuthStatusIconAndTooltip
							authStatus={app_auth_status || "needs review"}
						/>
					</div>
				)}
		</div>
	);
}
