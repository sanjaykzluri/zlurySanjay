import React from "react";
import { useHistory } from "react-router-dom";
import inactive from "assets/agents/inactive.svg";
import zluri from "../../assets/zluri-integration-logo.svg";
import { useSelector } from "react-redux";
import { Button } from "UIComponents/Button/Button";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
import { PARTNER } from "modules/shared/constants/app.constants";

export default function LoginFailed() {
	const { partner } = useContext(RoleContext);
	const history = useHistory();
	const { userInfo } = useSelector((state) => state);

	return (
		<div
			className="d-flex align-items-center justify-content-center"
			style={{
				background: "#F9FAFE",
				height: "100vh",
				borderTop: "4px solid #2266E2",
			}}
		>
			<div className="login_failed_box p-5 d-flex flex-column">
				{partner?.name === PARTNER.ZLURI.name && (
					<img src={zluri} width={46} />
				)}
				<img src={inactive} width={65} className="mt-5 mb-3" />
				<div className="bold-700 font-18 text-center  black-1  mb-2">
					{userInfo?.user_role === "employee"
						? "You are not authorized to view this page!"
						: "There seems to be an issue while logging you in."}
				</div>
				{userInfo?.user_role !== "employee" && (
					<div className="bold-400 font-13 text-center black-1  o-8">
						Please try again by logging out and relogging in.
					</div>
				)}
				<div
					className="bold-400 font-13  text-center black-1  o-8"
					style={{
						marginTop:
							userInfo?.user_role === "employee" ? "22px" : "0px",
					}}
				>
					{userInfo?.user_role === "employee"
						? "Reach out to your admin to request access to the employee app store."
						: `If the issue persists, reach out to your administrator or ${partner?.name} support team!`}
				</div>

				<div className="d-flex flex-column text-center pl-6 pr-6 mt-3">
					{history?.location?.state?.error && (
						<div
							className="red red-bg border-radius-4  mb-4 p-2"
							style={{
								overflowWrap: "anywhere",
								maxHeight: "100px",
								overflowY: "scroll",
							}}
						>
							<p className="font-12 mb-0">
								{history?.location?.state?.error}
							</p>
						</div>
					)}
					<Button
						onClick={() => {
							history.push("/");
						}}
						className="mb-2"
					>
						Retry
					</Button>

					<Button
						type="link"
						onClick={() => {
							history.push("/logout");
						}}
					>
						Logout
					</Button>
				</div>
			</div>
		</div>
	);
}
