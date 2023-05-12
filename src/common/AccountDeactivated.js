import React from "react";
import { useHistory } from "react-router-dom";
import zluri from "../components/Onboarding/zluri.svg";
import warning from "../components/Onboarding/warning.svg";
import OnboardingRightScreen from "../components/OnboardingRightScreen.js";
import { useAuth0 } from "@auth0/auth0-react";

export function AccountDeactivated() {
	const history = useHistory();
	const { user } = useAuth0();

	const profileContainer = {
		background: "#F9F9F9",
		width: "60%",
		padding: "5%",
		borderRadius: "8px",
		border: "1px solid #71717142",
		textAlign: "center",
	};
	const profileImage = {
		backgroundImage: "url(" + user?.picture + ")",
		width: "100px",
		height: "100px",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		position: "relative",
		margin: "auto",
		borderRadius: "50%",
	};

	const nameAndMessage = {
		fontSize: "14px",
		color: "#222222",
		overflowWrap: "break-word",
	};

	const warningIcon = {
		position: "absolute",
		right: "5px",
		top: "5px",
	};
	return (
		<div className="d-flex vh-100 m-0">
			<div className="p-0 d-flex flex-column" style={{ width: "40%" }}>
				<img
					src={zluri}
					style={{
						width: "68px",
						marginLeft: "40px",
						marginTop: "32px",
					}}
				/>
				<div
					className="d-flex flex-column align-items-center"
					style={{ width: "90%", margin: "18% auto auto" }}
				>
					<div style={profileContainer}>
						<div style={profileImage}>
							<img style={warningIcon} src={warning}></img>
						</div>
						<div style={nameAndMessage} className="mt-3">
							{user?.name}
						</div>
						<div
							style={{
								fontSize: "12px",
								color: "#6B6B6B",
								overflowWrap: "break-word",
							}}
							className="mt-2"
						>
							{user?.email}
						</div>
						<a style={{ fontSize: "12px" }} href="/logout">
							Logout
						</a>
					</div>
					<h5 className="mt-4" style={{ fontWeight: "bold" }}>
						Your account has been deactivated
					</h5>
					<span
						style={{ ...nameAndMessage, width: "55%" }}
						className="text-center"
					>
						Contact your administrator if you think this is an error
					</span>
				</div>
			</div>
			<OnboardingRightScreen></OnboardingRightScreen>
		</div>
	);
}
