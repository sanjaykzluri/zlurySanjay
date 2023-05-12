import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import UserAppMetaInfoCard from "../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import { unescape } from "../utils/common";
import { AppAuthStatusIconAndTooltip } from "./AppAuthStatus";
import { NameBadge } from "./NameBadge";
import { userType } from "../constants/users";
import group from "../assets/users/group.svg";
import service from "../assets/users/service.svg";
import ExternalUser from "../assets/users/external_user.svg";
import moment from "moment";
import { trackActionSegment } from "modules/shared/utils/segment";

export default function UserInfoTableComponent({
	user_account_type,
	user_id,
	user_email,
	user_name,
	user_profile,
	user_status,
	customTooltip,
	tooltipClassName,
	profile_img,
	row,
	is_external_user,
	user_discovered,
	tracking = false,
	pageInfo = {},
}) {
	return (
		<>
			<div className="flex flex-row center">
				<div className="d-flex flex-column justify-content-center">
					<div
						className="flex flex-row align-items-center justify-content-center"
						onClick={() => {
							if (tracking) {
								trackActionSegment(`Clicked on Single User"`, {
									currentCategory: pageInfo.category,
									currentPageName: pageInfo.page,
								});
							}
						}}
					>
						<Link
							to={{
								hash: "#overview",
								pathname: `/users/${user_id}`,
								state: {
									user_account_type: user_account_type,
								},
							}}
							className="custom__app__name__css text-decoration-none"
						>
							<div className="d-flex flex-row align-items-center">
								{profile_img || user_profile ? (
									<img
										src={
											unescape(profile_img) ||
											unescape(user_profile)
										}
										style={{
											height: "26px",
											width: "26px",
											borderRadius: "50%",
										}}
									/>
								) : (
									<NameBadge
										name={user_name}
										width={26}
										height={26}
										borderRadius={"50%"}
									/>
								)}
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip
											className={
												customTooltip &&
												tooltipClassName
											}
										>
											{customTooltip
												? customTooltip
												: user_name}
										</Tooltip>
									}
								>
									<div
										className=" d-flex flex-column align-items-start"
										style={{
											marginLeft: "8px",
											color: "#222222",
										}}
									>
										<div className="truncate_10vw text-capitalize">
											{user_name}
										</div>

										{user_discovered && (
											<div
												className="font-10 grey-1"
												style={{
													marginTop: "3px",
												}}
											>
												in use since{" "}
												{moment(user_discovered).format(
													"DD MMM 'YY"
												)}
											</div>
										)}
									</div>
								</OverlayTrigger>
							</div>
						</Link>
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
									<span className="text-capitalize">
										{is_external_user
											? "External User"
											: user_account_type}
									</span>
								</Tooltip>
							}
						>
							<div className="truncate_10vw">
								{is_external_user ? (
									<img
										src={ExternalUser}
										width={16}
										style={{ marginLeft: "6px" }}
									></img>
								) : user_account_type === userType.SERVICE ? (
									<img
										src={service}
										width={16}
										style={{ marginLeft: "6px" }}
									></img>
								) : user_account_type === userType.GROUP ? (
									<img
										src={group}
										width={16}
										style={{ marginLeft: "6px" }}
									></img>
								) : null}
							</div>
						</OverlayTrigger>
					</div>
				</div>
			</div>
		</>
	);
}
