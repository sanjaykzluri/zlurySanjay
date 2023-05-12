import React, { Fragment } from "react";
import check from "../../../../assets/applications/check.svg";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import authorizedGreen from "../../../../assets/authorizedGreen.svg";
import { AppAuthStatusIconAndTooltip } from "../../../../common/AppAuthStatus";
import { NameBadge } from "../../../../common/NameBadge";
import { userType } from "../../../../constants/users";
import {
	urlifyImage,
	unescape,
	capitalizeFirstLetter,
} from "../../../../utils/common";
import group from "../../../../assets/users/group.svg";
import service from "../../../../assets/users/service.svg";
function UserAppMetaInfoCard(props) {
	return (
		<div className="d-flex flex-column">
			<div className="border-bottom pt-2 pb-2 row m-0">
				<div className="col-md-2 p-0 d-flex">
					{props?.row?.app_logo || props?.row?.user_profile ? (
						<div
							className="m-auto rounded-circle"
							style={{
								backgroundImage: `url(${urlifyImage(
									unescape(
										props?.row?.app_logo ||
											props?.row?.user_profile
									)
								)})`,
								height: "26px",
								width: "26px",
								backgroundRepeat: "no-repeat",
								backgroundSize: "cover",
							}}
						></div>
					) : (
						<NameBadge
							width={26}
							name={props.title}
							className="m-auto rounded-circle"
						/>
					)}
				</div>
				<div className="d-flex flex-column col-md-10 p-0">
					<div
						className={`text-left text-truncate font-13 d-flex flex-row ${
							props.description
								? ""
								: "mr-auto mt-auto mb-auto w-100"
						}`}
					>
						{props.title}
						<div className="truncate_10vw">
							{props.row.user_account_type ===
							userType.SERVICE ? (
								<img
									src={service}
									width={16}
									style={{
										marginLeft: "6px",
									}}
								></img>
							) : props.row.user_account_type ===
							  userType.GROUP ? (
								<img
									src={group}
									width={16}
									style={{
										marginLeft: "6px",
									}}
								></img>
							) : null}
						</div>
					</div>
					{props.description && (
						<div className="text-left font-9 grey-1 text-truncate">
							{props.description}
						</div>
					)}
				</div>
			</div>
			<div className="d-flex flex-row row m-0 pt-2 pb-2">
				<div
					className={`${
						props.isUser ? "col-md-6" : "col-md-4"
					} d-flex flex-column`}
				>
					<div className="font-10 grey-1 text-left">Status</div>
					<div className="font-12 grey text-left mt-1">
						{props.isActive ? (
							<>
								<img src={check} className="mr-1" />
								Active
							</>
						) : (
							<>
								<img src={inactivecheck} className="mr-1" />
								{capitalizeFirstLetter(
									props.user_status || props.app_status
								) || "Unavailable"}
							</>
						)}
					</div>
				</div>
				{!props.isUser ? (
					<div className="d-flex flex-column col-md-8">
						<div className="font-10 grey-1 text-left">
							Authorization
						</div>
						<div className="font-12 grey text-left mt-1 d-flex">
							<AppAuthStatusIconAndTooltip
								authStatus={props.row?.app_state}
								showTooltip={false}
								className="mr-1"
							/>
							{props.row?.app_state ? (
								<div className="text-capitalize">
									{props.row?.app_state}
								</div>
							) : (
								<div className="font-10 grey-1 bold-normal mt-auto mb-auto">
									Unavailable
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="d-flex flex-column col-md-6">
						<div className="font-10 grey-1 text-left">
							User type
						</div>
						<div className="font-12 grey text-left mt-1 d-flex text-capitalize">
							{props.row?.user_account_type ||
							props.row?.account_type ? (
								props.row?.user_account_type ||
								props.row?.account_type
							) : (
								<div className="font-10 grey-1 bold-normal mt-auto mb-auto">
									Unavailable
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default UserAppMetaInfoCard;
