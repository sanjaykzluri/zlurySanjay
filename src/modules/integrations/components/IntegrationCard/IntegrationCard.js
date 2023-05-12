import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "../../../../UIComponents/Button/Button";
import { IntegrationStatus } from "../../containers/IntegrationStatus/IntegrationStatus";
import "./IntegrationCard.css";
import { useDispatch, useSelector } from "react-redux";
import email from "../../../../assets/icons/email-blue.svg";
import { REQUEST_STATUS, INTEGRATION_STATUS } from "../../constants/constant";
import warningIcon from "../../../../assets/warning.svg";
import verifiedIcon from "../../../../assets/verified-int.svg";
import check from "../../../../assets/icons/check-circle.svg";
import _ from "underscore";
import {
	capitalizeFirstLetter,
	truncateText,
	unescape,
	urlifyImage,
} from "../../../../utils/common";
import { NameBadge } from "../../../../common/NameBadge";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export function IntegrationCard(props) {
	const { cardStyle, showCatalogDetail } = props;
	const history = useHistory();
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const clickedOnSingleIntegration = () => {
		if (!props.blockNavigation && props.integration.isPublished) {
			//Segment Implementation
			window.analytics.track("Clicked on Single Integration", {
				currentCategory: "Integrations",
				currentPageName: "Integrations",
				clickedIntegrationId: props.integration.id,
				clickedIntegrationName: props.integration.name,
				orgId: orgId || "",
				orgName: orgName || "",
			});
			if (showCatalogDetail) {
				history.push(
					`/integrations/catalog/detail/${props.integration.id}`
				);
			} else if (
				props.integration?.connected_accounts > 0 ||
				props.integration?.status === INTEGRATION_STATUS.CONNECTED
			) {
				history.push(
					`/integrations/${props.integration.id}/instance#instances`
				);
			} else {
				history.push(
					`/integrations/catalog/detail/${props.integration.id}`
				);
			}
		}
	};

	const statusBottom = {
		position: "absolute",
		left: "50%",
		transform: "translateX(-50%)",
		bottom: "10px",
	};

	return (
		<>
			{props.integration.name && (
				<div
					onClick={clickedOnSingleIntegration}
					className={`${
						props.className
							? `${props.className} z_i_card text-capitalize text-center border-1 border-radius-4 p-2 pointer mr-3 mb-3`
							: "z_i_card text-capitalize text-center border-1 border-radius-4 p-2 pointer mr-3 mb-3 ml-2"
					}`}
					style={{
						backgroundColor: "white",
						minHeight:
							cardStyle === "recommended" ? "150px" : "270px",
						minWidth:
							cardStyle === "recommended" ? "200px" : "175px",
						maxHeight:
							cardStyle === "recommended" ? "200px" : "270px",
					}}
				>
					{cardStyle === "recommended" ? (
						<div style={{ alignItems: "center" }} className="flex">
							<div className="m-2 p-2">
								{props.integration.logo ||
								props.integration.logo_url ? (
									<div
										className="ml-auto mr-auto mt-1 background-contain background-no-repeat background-position-center"
										style={{
											backgroundImage: `url('${urlifyImage(
												unescape(
													props.integration.logo ||
														props.integration
															.logo_url
												)
											)}')`,
											width: "30px",
											height: "30px",
										}}
									></div>
								) : (
									<NameBadge
										name={props.integration.name}
										width={30}
										height={30}
										className="mt-1 img-circle ml-auto mr-auto"
									/>
								)}
							</div>
							<div>
								<div
									style={{
										flexDirection: "column",
										alignItems: "flex-start",
										textAlign: "left",
									}}
									className="flex"
								>
									<div className="font-14 bold-400 black-1">
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>
													{props.integration.name}
												</Tooltip>
											}
										>
											<span
												style={{
													wordBreak: "break-word",
												}}
												className="pb-1"
											>
												{capitalizeFirstLetter(
													truncateText(
														props.integration.name,
														20
													)
												)}{" "}
											</span>
										</OverlayTrigger>
									</div>
									{/* {props.integration.is_trusted && (
										<div className="ml-1 mb-1">
											<img
												width={"12px"}
												height="12px"
												src={verifiedIcon}
											/>
										</div>
									)} */}
									<h4 className="font-10 grey-1 mt-1">
										{props.integration.categoryName || (
											<span>&nbsp;</span>
										)}
									</h4>
								</div>
							</div>
						</div>
					) : props.integration.logo || props.integration.logo_url ? (
						<div
							className="ml-auto mr-auto mt-1 background-contain background-no-repeat background-position-center"
							style={{
								backgroundImage: `url('${urlifyImage(
									unescape(
										props.integration.logo ||
											props.integration.logo_url
									)
								)}')`,
								width: "60px",
								height: "60px",
							}}
						></div>
					) : (
						<NameBadge
							name={props.integration.name}
							width={60}
							height={60}
							className="mt-1 img-circle ml-auto mr-auto"
						/>
					)}
					{cardStyle !== "recommended" && (
						<div>
							<div
								align="center"
								style={{ justifyContent: "center" }}
								className="flex mt-3"
							>
								<div className="font-16 bold-400 black-1 mt-1">
									{props.integration.name}
								</div>
							</div>
							<h4 className="font-10 grey-1 mt-1">
								{props.integration.categoryName || (
									<span>&nbsp;</span>
								)}
							</h4>
						</div>
					)}
					{props.integration.usersCount > 0 ? (
						<h6
							style={{ backgroundColor: "#e9f0fc" }}
							className="d-inline-flex font-10 primary-color p-1  pl-2 pr-2 border-radius-4"
						>
							Used by {props.integration.usersCount} users
						</h6>
					) : props.integration.isFeatured ? (
						<h6
							style={{
								backgroundColor: "rgba(178, 178, 239, 0.35)",
								color: "rgba(105, 103, 224, 1)",
							}}
							className="d-inline-flex font-10 primary-color p-1  pl-2 pr-2 border-radius-4"
						>
							Featured
						</h6>
					) : props.integration.isTrending ? (
						<h6
							style={{
								backgroundColor: "rgba(90, 186, 255, 0.35)",
								color: "rgba(90, 186, 255, 1)",
							}}
							className="d-inline-flex font-10 primary-color p-1  pl-2 pr-2 border-radius-4"
						>
							Trending
						</h6>
					) : props.integration.isPopular ? (
						<h6
							style={{
								backgroundColor: "rgba(255, 178, 107, 0.35)",
								color: "rgba(255, 162, 77, 1)",
							}}
							className="d-inline-flex font-10 primary-color p-1  pl-2 pr-2 border-radius-4"
						>
							Popular
						</h6>
					) : null}
					{cardStyle !== "recommended" && (
						<p className="font-10 grey mb-1">
							{truncateText(
								props.integration.shortDescription,
								50
							) || <span>&nbsp;</span>}
						</p>
					)}
					{cardStyle === "recommended" && <hr className="py-3" />}
					{!showCatalogDetail &&
						cardStyle !== "recommended" &&
						((props.integration.requestStatus &&
							props.integration.requestStatus ===
								REQUEST_STATUS.PENDING) ||
							(_.isNumber(
								props.integration.num_pending_accounts
							) &&
								props.integration.num_pending_accounts >
									0)) && (
							<h5
								style={{
									backgroundColor: "rgb(90 186 255 / 10%)",
									color: "#5ABAFF",
									border: "1px solid #5ABAFF",
								}}
								className="d-inline-flex font-10 primary-color p-1  pl-2 pr-2  border-radius-4"
							>
								<img src={email} className="mr-2" />
								Connect request sent
							</h5>
						)}
					{props.integration.isPublished ? (
						props.integration.error_accounts > 0 ? (
							<div
								className="warningMessage m-auto rounded pt-1 pb-1 pl-2 pr-2 d-flex"
								style={{
									...statusBottom,
									...{ width: "fit-content" },
								}}
								onClick={() => {
									history.push(
										`/integrations/${props.integration.id}/instance#instances`
									);
								}}
							>
								<img
									src={warningIcon}
									width={14}
									className="mr-1"
								/>
								<div className="text-nowrap font-13">
									Resolve Error
								</div>
							</div>
						) : props.integration.connected_accounts > 0 &&
						  !props.integration.disconnected_accounts &&
						  !props.integration.error_accounts ? (
							<div
								className="green-bg m-auto rounded pt-1 pb-1 pl-2 pr-2 d-flex"
								style={statusBottom}
							>
								<img src={check} width={14} className="mr-1" />
								<div className="green text-nowrap font-13">
									{props.integration.connected_accounts}{" "}
									Connected
								</div>
							</div>
						) : props.integration.disconnected_accounts > 0 ? (
							<div
								className="warningMessage m-auto rounded pt-1 pb-1 pl-2 pr-2 d-flex"
								style={{
									...statusBottom,
									...{ width: "fit-content" },
								}}
								onClick={() => {
									history.push(
										`/integrations/${props.integration.id}/instance#instances`
									);
								}}
							>
								<img
									src={warningIcon}
									width={14}
									className="mr-1"
								/>
								<div className="text-nowrap font-13">
									{props.integration.disconnected_accounts}{" "}
									Disconnected
								</div>
							</div>
						) : (
							<IntegrationStatus
								blockNavigation={props.blockNavigation}
								onboarding={props.onboarding}
								inSlider={props.inSlider}
								onSuccess={() => {
									props.onSuccess && props.onSuccess();
								}}
								onRequestSent={(data) => {
									if (props?.onRequestSent)
										props.onRequestSent(data);
								}}
								integration={props.integration}
								isSimilarIntegration={
									props.isSimilarIntegration
								}
							/>
						)
					) : (
						<Button
							style={{ width: "80%", bottom: "8px" }}
							type="normal"
							className="font-13 grey-1 prim"
							onClick={(e) => {}}
						>
							{" "}
							Coming Soon
						</Button>
					)}
				</div>
			)}
		</>
	);
}
