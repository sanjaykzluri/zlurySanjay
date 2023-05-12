import React from "react";
import "./AppsList.css";
import { NameBadge } from "../../../../../../../common/NameBadge";
import ContentLoader from "react-content-loader";
import { unescape } from "../../../../../../../utils/common";
import { useHistory } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export function AppsList(props) {
	const vendorAppIds = [];
	const vendor = props.vendor;
	const history = useHistory();
  
	const getAppsLogo = (el) => {
		if (!el) return;
		const logo = el.app_logo;
		if (logo && logo !== "") {
			return (
				<img
					style={{
						height: "48px",
						width: "48px",
						borderRadius: "50%",
					}}
					alt={el.app_name}
					src={unescape(el.app_logo)}
				/>
			);
		} else {
			return (
				<NameBadge
					fontSize={18}
					name={el.app_name}
					borderRadius={50}
					width={48}
				/>
			);
		}
	};

	return (
		<>
			{props.loading ? (
				<div className="vendoroverview__appslist__cont">
					<div className="vendoroverview__appslist__cont__d1">
						<ContentLoader width={100} height={14}>
							<rect width={100} height={14} fill="#EBEBEB" />
						</ContentLoader>
					</div>
					<div className="vendoroverview__appslist__cont__d2">
						<ContentLoader
							style={{ marginRight: 8 }}
							width={48}
							height={48}
							viewBox="0 0 48 48"
						>
							<circle cx="24" cy="24" r="24" fill="#EBEBEB" />
						</ContentLoader>
						<ContentLoader
							style={{ marginRight: 8 }}
							width={48}
							height={48}
							viewBox="0 0 48 48"
						>
							<circle cx="24" cy="24" r="24" fill="#EBEBEB" />
						</ContentLoader>
						<ContentLoader
							style={{ marginRight: 8 }}
							width={48}
							height={48}
							viewBox="0 0 48 48"
						>
							<circle cx="24" cy="24" r="24" fill="#EBEBEB" />
						</ContentLoader>
						<ContentLoader
							style={{ marginRight: 8 }}
							width={48}
							height={48}
							viewBox="0 0 48 48"
						>
							<circle cx="24" cy="24" r="24" fill="#EBEBEB" />
						</ContentLoader>
					</div>
				</div>
			) : (
				<div className="vendoroverview__appslist__cont">
					<div className="vendoroverview__appslist__cont__d1">
						Apps ({vendor?.apps?.length})
					</div>
					<div className="vendoroverview__appslist__cont__d2">
						{vendor &&
							vendor.apps &&
							vendor.apps.map((el) => {
								if (!vendorAppIds.includes(el.app_id)) {
									vendorAppIds.push(el.app_id);
									return (
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>{el.app_name}</Tooltip>
											}
										>
											<div
												className="mr-3 cursor-pointer"
												onClick={() =>
													history.push(
														`/applications/${el.app_id}#overview`
													)
												}
											>
												{getAppsLogo(el)}
											</div>
										</OverlayTrigger>
									);
								}
							})}
					</div>
				</div>
			)}
		</>
	);
}
