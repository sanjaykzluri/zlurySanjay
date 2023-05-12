import React, { useEffect, useState } from "react";
import zluri from "../components/Onboarding/zluri.svg";
import email from "../components/Onboarding/email.svg";
import "./verify.css";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory, Redirect } from "react-router-dom";
import Axios from "axios";
import OnboardingRightScreen from "../components/OnboardingRightScreen.js";
import { Loader } from "./Loader/Loader";
import { identifyUser } from "../utils/analytics";
import { Button } from "../UIComponents/Button/Button";

export function Verify() {
	let history = useHistory();
	const [message, setMessage] = useState(null);
	const { user, getAccessTokenSilently, logout } = useAuth0();
	const [loading, setLoading] = useState(null);
	const [waiting, setWaiting] = useState(false);

	useEffect(() => {
		if (user?.email_verified) {
			localStorage.clear();
		}
		if (user) {
			const { email, email_verified } = user;
			identifyUser({ email, email_verified });
		} else {
			history.push("/");
		}
	}, []);

	const onLogout = () => {
		history.push("/logout");
	};

	const handleResendinEmail = () => {
		setWaiting(true);
		setLoading(true);
		setTimeout(() => {
			setWaiting(false);
		}, 30000);

		getAccessTokenSilently()
			.then((token) => {
				let config = {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				};
				Axios.get(
					`${process.env.REACT_APP_API_URL}/organization/resend-verification-mail`,
					config
				)
					.then((response) => {
						setLoading(false);
						if (response.data.status) {
							setMessage("Email sent!");
						} else {
							setMessage(response.data.error.message);
						}
					})
					.catch((err) => {
						setLoading(false);
						setMessage(err);
					});
			})
			.catch((err) => {
				setLoading(false);
				setMessage(err);
			});
	};

	return user?.email_verified ? (
		<Redirect to="/checkAuth" />
	) : (
		<div className="d-flex vh-100 m-0">
			<div className="p-0 d-flex flex-column" style={{ width: "40%" }}>
				<ul
					className="list-style-none d-flex justify-content-between"
					style={{ marginTop: "40px", marginRight: "40px" }}
				>
					<li>
						<img src={zluri} style={{ width: "68px" }} />
					</li>
					<li>
						<Button
							type="link"
							onClick={() => {
								onLogout();
							}}
						>
							Logout
						</Button>
					</li>
				</ul>
				<div
					className="d-flex flex-column align-items-center"
					style={{ width: "80%", margin: "18% auto auto" }}
				>
					<img
						src={email}
						style={{ width: "40%", marginBottom: "40px" }}
					></img>
					<h4
						className="headingText text-center"
						style={{ marginBottom: "5px", fontSize: "20px" }}
					>
						Confirm you email
					</h4>
					<p
						className="descriptionText"
						style={{ marginBottom: "25px" }}
					>
						We’ve sent an confirmation email to{" "}
						<a href="">{history?.location?.state?.user?.email}</a>.
						Please click the link on the email to continue.
					</p>
					<Button
						disabled={waiting}
						className="btn btn-outline-primary"
						onClick={handleResendinEmail}
					>
						Resend Email
					</Button>
					{loading ? (
						<Loader height={50} width={50}></Loader>
					) : !loading && message ? (
						<div
							style={{
								backgroundColor: "#EFFAEF",
								padding: "2%",
								width: "140px",
							}}
							className="rounded d-flex mt-3"
						>
							<span
								style={{ color: "#5FCF64" }}
								className="m-auto"
							>
								{message}
							</span>
						</div>
					) : null}
				</div>
			</div>
			<OnboardingRightScreen />
		</div>
	);
}
