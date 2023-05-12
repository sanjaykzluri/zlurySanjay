import React from "react";
import ContentLoader from "react-content-loader";
import { useHistory } from "react-router-dom";
import offboarding from "../../../../assets/users/offboarding.svg";
import UserInfoTableComponent from "../../../../common/UserInfoTableComponent";
import { capitalizeFirstLetter } from "../../../../utils/common";
import { WORFKFLOW_TYPE } from "../../../workflow/constants/constant";
import bluerightarrow from "assets/applications/bluerightarrow.svg";
import "./components.css";
import { UTCDateFormatter } from "utils/DateUtility";

export function OnboardOffboardContainer({ user, type = "OFFBOARDING" }) {
	const history = useHistory();
	const toWorkflow = (user, type) => {
		history.push({
			pathname: "/creating/workflow",
			state: { users: [user], type },
		});
	};
	return (
		<>
			{" "}
			{user && !user.loading ? (
				<div
					className="map-licenses-dialog-div"
					style={{
						height: "130px",
						paddingTop: "20px",
						paddingBottom: "20px",
					}}
				>
					<div
						className="map-licenses-dialog-div-left h-100"
						style={{ padding: "0px 0px 0px 25px" }}
					>
						<div className="d-flex align-items-center">
							<img src={offboarding}></img>
							<div className="font-16 bold-600 ml-2">
								{`USER MARKED FOR ${type.toUpperCase()}`}
							</div>
						</div>

						<div className="d-flex align-items-center">
							<div className="d-flex flex-column">
								<div className="font-11 grey mb-1">
									Marked by
								</div>
								<div>
									<UserInfoTableComponent
										user_id={
											user?.user_onboard_offboard_details
												?.marked_by?._id
										}
										user_name={
											user?.user_onboard_offboard_details
												?.marked_by?.name
										}
										user_profile={
											user?.user_onboard_offboard_details
												?.marked_by?.profile_img
										}
									/>
								</div>
							</div>
							<div
								className="d-flex flex-column "
								style={{ marginLeft: "20px" }}
							>
								<div className="font-11 grey m-1">
									Assigned to
								</div>
								<div>
									<UserInfoTableComponent
										user_id={
											user?.user_onboard_offboard_details
												?.assigned_to?._id
										}
										user_name={
											user?.user_onboard_offboard_details
												?.assigned_to?.name
										}
										user_profile={
											user?.user_onboard_offboard_details
												?.assigned_to?.profile_img
										}
									/>
								</div>
							</div>
							<div
								className="d-flex flex-column"
								style={{ marginLeft: "20px" }}
							>
								<div className="font-11 grey mb-1">
									{`${capitalizeFirstLetter(
										type.toLowerCase()
									).slice(0, -3)} date`}
								</div>
								<div>
									{user?.user_onboard_offboard_details?.date
										? UTCDateFormatter(
												user
													?.user_onboard_offboard_details
													?.date
										  )
										: "-"}
								</div>
							</div>
						</div>
					</div>
					<div
						className=" position-relative"
						style={{ width: "200px" }}
						onClick={() =>
							toWorkflow(
								user,
								type === "onboarding"
									? WORFKFLOW_TYPE.ONBOARDING
									: WORFKFLOW_TYPE.OFFBOARDING
							)
						}
					>
						<div className=" onboard__user__ov__button primary-color bold-600 font-13 cursor-pointer">
							{`${capitalizeFirstLetter(type.toLowerCase()).slice(
								0,
								-3
							)} Now`}
							<img src={bluerightarrow} className="ml-2"></img>
						</div>
					</div>
				</div>
			) : (
				<div
					className="map-licenses-dialog-div"
					style={{ height: "130px" }}
				>
					<div className="map-licenses-dialog-div-left h-100">
						<ContentLoader width={200} height={80}>
							<rect
								y="17"
								width={193}
								height={14}
								fill="#EBEBEB"
								rx="2"
								ry="2"
							/>
							<rect
								y="38"
								width={134}
								height={14}
								fill="#EBEBEB"
								rx="2"
								ry="2"
							/>
						</ContentLoader>
					</div>
					<div className="map-licenses-dialog-div-right">
						<ContentLoader width={200} height={80}>
							<rect
								y="20"
								width={193}
								height={25}
								fill="#EBEBEB"
								rx="2"
								ry="2"
							/>
						</ContentLoader>
					</div>
				</div>
			)}
		</>
	);
}
