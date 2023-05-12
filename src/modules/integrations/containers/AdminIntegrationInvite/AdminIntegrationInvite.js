import React, { useEffect, useState } from "react";
import zluri from "../../../../assets/zluri-logo.svg";
import { IntegrationConnect } from "../../components/IntegrationConnect/IntegrationConnect";
import "./AdminIntegrationInvite.css";
import check from "../../../../assets/icons/check-circle.svg";
import error from "../../../../assets/icons/exclamation.svg";
import exchange from "../../../../assets/icons/exchangeArrow.svg";
import otp from "../../../../assets/icons/otp-lock.svg";
import {
	fetchIntegrationService,
	validateAdminInviteCode,
} from "../../service/api";
import { useLocation } from "react-router";
import { Integration } from "../../model/model";
import { TriggerIssue } from "../../../../utils/sentry";
import ContentLoader from "react-content-loader";
import { Settings } from "../Settings/Settings";
import Axios from "axios";
import { getAppKey } from "../../../../utils/getAppKey";
import { INTEGRATION_STATUS } from "../../constants/constant";
import { Loader } from "../../../../common/Loader/Loader";
import { ConnectionSucces } from "../../components/ConnectionSucces/ConnectionSucces";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { unescape, urlifyImage } from "../../../../utils/common";
import { Button } from "../../../../UIComponents/Button/Button";
import { IntegrationConnectV2 } from "modules/integrations/components/IntegrationConnectV2/IntegrationConnectV2";
import ZluriLogo from "assets/zluri-integration-logo.svg";
import _ from "underscore";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
import { Spinner } from "react-bootstrap";
import OtpInput from "react-otp-input";
import { LoaderPage } from "common/Loader/LoaderPage";

export function AdminIntegrationInvite(props) {
	const [integrationSuccess, setIntegrationSuccess] = useState(false);
	const [expired, setExpired] = useState(false);
	const [settingsView, setSettingsView] = useState(false);
	const [integration, setIntegration] = useState({});
	const [senderEmail, setSenderEmail] = useState(null);
	const location = useLocation();
	const [adminData, setAdminData] = useState(false);
	const [showConnectSucessModal, setShowConnectSucessModal] = useState(false);
	const [integrationDetailsAPIFailed, setIntegrationDetailsAPIFailed] =
		useState(false);
	const [showConnectModal, setShowConnectModal] = useState(true);

	const { partner } = useContext(RoleContext);
	const [isVerified, setIsVerified] = useState(false);
	const [OTP, setOTP] = useState("");
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const validateTokenAndOTP = () => {
		setIsLoading(true);
		validateAdminInviteCode(code, OTP)
			.then((res) => {
				setAdminData(res);
				getIntegrationDetails(res.code);
				setSenderEmail(res.sender_email);
				setIsVerified(true);
			})
			.catch((err) => {
				setSenderEmail(err?.response?.data?.sender_email);
				setExpired(true);
				setSenderEmail(err?.sender_email);
				setIsLoading(false);
			});
	};

	const getIntegrationDetails = (code) => {
		Axios.get(
			`${getAppKey("REACT_APP_API_URL")}/integration-invite?token=${code}`
		)
			.then((res) => {
				setIntegration(new Integration(res.data));
				if (
					res.data.integration_invite_status ===
					INTEGRATION_STATUS.CONNECTED
				) {
					setIntegrationSuccess(true);
				}
			})
			.catch((err) => {
				TriggerIssue(
					"Error on getting Integration details in admin view with no JWT",
					err
				);
				setIntegrationDetailsAPIFailed(true);
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	useEffect(() => {
		//validateToken(new URLSearchParams(location.search).get("invitecode"));
		const code = new URLSearchParams(location.search).get("invitecode");
		if (code) {
			setCode(code);
		}
	}, []);

	return (
		<>
			<div
				style={{
					background: "#f5f6f9",
					height: "100%",
					minHeight: "100vh",
				}}
				className="z__page admin-integrations-connect position-relative"
			>
				<header>
					<div
						style={{ justifyContent: "space-around" }}
						className="d-flex pt-3 align-items-center p-0"
					>
						<div>
							<img width={"71px"} src={ZluriLogo} />
						</div>
						<div>
							<a
								className="font-14 primary-color"
								href="https://www.zluri.com/"
								target="_blank"
								rel="noreferrer"
							>
								What is {partner?.name}?
							</a>
						</div>
					</div>
					<hr
						style={{
							width: "60%",
							position: "absolute",
							left: "20%",
						}}
						className="mt-3"
					/>
				</header>

				<div className="z_page_container mt-4">
					{/* below this */}
					{!isVerified && !expired && !isLoading && (
						<div>
							<div className="d-flex justify-content-center connect_new_integration_modal flex-column">
								<div className="z_connect_new_integration_header text-center mt-4">
									<div className="ml-4 mr-4 mb-2 d-flex justify-content-center">
										<img
											width={40}
											height={40}
											src={zluri}
										></img>
									</div>
									<h3 className="font-18 bold-600 black-1">
										Connect your app with {partner?.name}
									</h3>
								</div>
							</div>
							<div className="mfa-verification-content-integration m-auto">
								<div className="p-2 text-center  p-6">
									<img
										src={otp}
										className="mt-4"
										width={94}
									/>

									<h4 className="font-14 bold-700 black-1 o-8  mb-3 mt-3 ">
										Enter the verification code to continue
									</h4>
									<p className="font-14 o-8 ">
										Please enter the verification code
										provided in the connection request email
									</p>

									<OtpInput
										containerStyle="otp-input-container-invite"
										value={OTP}
										onChange={(e) => {
											setOTP(e);
										}}
										isInputNum
										numInputs={6}
										placeholder="------"
									/>

									<Button
										disabled={!OTP}
										onClick={() => {
											validateTokenAndOTP();
										}}
										className="mb-5 mt-5"
									>
										<span
											style={{
												display: "inline-block",
												top: isLoading ? "-3px" : "",
												position: "relative",
											}}
										>
											Continue
										</span>
										{isLoading && (
											<Spinner
												className="ml-2 "
												animation="border"
												style={{
													width: 20,
													height: 20,
												}}
											/>
										)}
									</Button>
								</div>
							</div>
						</div>
					)}

					{/*  */}
					{!Object.keys(integration).length && !expired && isLoading && (
						<div className="admin-integration-loading">
							<p className="position-center font-12 grey-1">
								<Loader height={100} width={100} />
							</p>
						</div>
					)}

					{integration && integration.id && !integrationSuccess && (
						<IntegrationConnectV2
							integration={integration}
							onHide={() => {
								setShowConnectModal(false);
								props.setDropdownOpen &&
									props.setDropdownOpen(false);
								props.setShowConnectedAccounts &&
									props.setShowConnectedAccounts(false);
							}}
							showModal={false}
							adminView={true}
							adminData={adminData}
							toBeConnectedScopes={
								integration?.toBeConnectedScopes
							}
							connectedScopes={integration?.connectedScopes}
							hideCoworker={true}
							hideCloseButton={true}
							renderModal={false}
							setIntegrationSuccess={setIntegrationSuccess}
							isEditable={false}
						/>
					)}

					{integrationSuccess && integration && (
						<div className="text-center mt-6">
							<img src={check} width={131} />
							<h3 className="font-22 bold-700 black-1 mt-3">
								Thank you for connecting {partner?.name} with{" "}
								{integration.name}
							</h3>
							<p className="font-14 black-1 mt-3">
								We’ll notify {senderEmail} that you’ve completed
								this step.
							</p>
							<a
								className="font-14 primary-color"
								href="https://www.zluri.com/"
								target="_blank"
								rel="noreferrer"
							>
								Learn how {partner?.name} can help your
								organization
							</a>
						</div>
					)}

					{expired && (
						<div className="text-center mt-6">
							<img src={error} width={131} />
							<h3 className="font-22 bold-700 black-1 mt-3">
								The verification code entered was incorrect or
								the invite has expired.
							</h3>
							<p className="font-14 black-1 mt-3">
								Contact{" "}
								{senderEmail
									? senderEmail
									: "the administrator "}{" "}
								to receive another invite or try again with the
								correct verification code.
							</p>
						</div>
					)}

					{integrationDetailsAPIFailed && (
						<div className="text-center mt-6">
							<img src={error} width={131} />
							<h3 className="font-22 bold-700 black-1 mt-3">
								Server Error! We couldn't complete your request.
							</h3>
							<Button
								type="submit"
								onClick={() => {
									setExpired(false);
									setIntegrationDetailsAPIFailed(false);
									validateToken(
										new URLSearchParams(
											location.search
										).get("invitecode")
									);
								}}
							>
								Retry
							</Button>
						</div>
					)}
				</div>

				<footer className="text-center mt-10">
					<ul className="d-inline-flex list-style-none o-6">
						<li className="mr-3">
							<a
								className="font-12 grey-1"
								target="_blank"
								rel="noreferrer"
								href="https://www.zluri.com/zluri-app-terms-of-service"
							>
								Terms and Conditions
							</a>
						</li>
						<li>
							<a
								className="font-12 grey-1"
								target="_blank"
								rel="noreferrer"
								href="https://www.zluri.com/privacy-policy/"
							>
								Privacy Policy
							</a>
						</li>
					</ul>
				</footer>
			</div>
		</>
	);
}
