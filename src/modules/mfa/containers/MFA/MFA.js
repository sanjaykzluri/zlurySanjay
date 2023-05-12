import React, { useEffect, useRef, useState } from "react";
import "./MFA.css";
import { useHistory } from "react-router-dom";
import logo from "../../../../assets/logo.svg";
import sms from "../../../../assets/icons/sms.svg";
import check from "../../../../assets/icons/check-circle.svg";
import recoverycode from "../../../../assets/icons/recoverycode.svg";
import edit from "../../../../assets/icons/edit.svg";
import copy from "../../../../assets/icons/copy.svg";
import arrowdown from "../../../../assets/icons/angle-down.svg";
import arrowup from "../../../../assets/icons/angle-up-1.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import {
	getEnrolledMFA,
	enrollMFA,
	confirmMFAEnrollment,
	deleteMFAEnrollment,
	generateRecoverCode,
} from "../../service/api";
import { useSelector, useStore } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { getAppKey } from "../../../../utils/getAppKey";
import { LoaderPage } from "../../../../common/Loader/LoaderPage";
import {
	AUTH0_ERROR,
	AUTHENTICATOR_TYPE,
	MFA_TYPE,
	MFA_VIEW,
} from "../../constants/constant";
import QRCode from "qrcode.react";
import PropTypes from "prop-types";
import { Loader } from "../../../../common/Loader/Loader";
import { jsPDF } from "jspdf";
const doc = new jsPDF();
export function MFA(props) {
	const history = useHistory();
	const [loading, setLoading] = useState(true);
	const [enrollFor, setEnrollFor] = useState();
	const [MFAList, setMFAList] = useState(
		JSON.parse(JSON.stringify(Object.values(MFA_TYPE)))
	);
	const user = useSelector((state) => state.userInfo);
	const { getAccessTokenSilently, loginWithPopup } = useAuth0();
	const [MFAToken, setMFAToken] = useState(null);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [OTP, setOTP] = useState("");
	const [showOTPValidationModal, setShowOTPValidationModal] = useState(false);
	const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
	const [showAuthScannerModal, setShowAuthScannerModal] = useState(false);
	const [showMFAList, setShowMFAList] = useState(false);
	const [enrollementAssociateData, setEnrollementAssociateData] = useState();
	const [isMFAEnabled, setIsMFAEnabled] = useState();
	const [recoveryCode, setRecoveryCode] = useState();
	const [showRecoveryModal, setShowRecoveryModal] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);
	const [buttonActionLoading, setButtonActionLoading] = useState(false);
	const [errorDescription, setErrorDescription] = useState(null);
	const [retrySendingOTP, setRetrySendingOTP] = useState(false);
	const [sendingOTPInNSeconds, setSendingOTPInNSeconds] = useState(30);
	let timer = null;

	useEffect(() => {
		if (!enrollFor?.active) showModal();
	}, [enrollFor]);

	useEffect(() => {
		if (showOTPValidationModal && !retrySendingOTP) {
			startTicker();
		} else {
		}
	}, [sendingOTPInNSeconds]);

	const startTicker = (reset) => {
		if (reset) {
			clearInterval(timer);
			setRetrySendingOTP(false);
			setSendingOTPInNSeconds(30);
			return;
		}
		if (sendingOTPInNSeconds <= 0) {
			setRetrySendingOTP(true);
			setSendingOTPInNSeconds(30);
		} else {
			setRetrySendingOTP(false);
			timer = setTimeout(
				() => setSendingOTPInNSeconds(sendingOTPInNSeconds - 1),
				1000
			);
		}
	};

	useEffect(() => {
		if (user.user_id) {
			if (props.view === MFA_VIEW.SETTINGS) {
				if (showMFAList) {
					getMFAToken();
				}
			} else {
				getMFAToken();
			}
		}
	}, [user, showMFAList]);

	useEffect(() => {
		if (MFAToken) {
			getMFAList();
		}
	}, [MFAToken]);

	const toggleEnrollement = (mfa) => {
		resetState();
		if (mfa.ui_id === AUTHENTICATOR_TYPE.EMAIL) return;
		setEnrollFor(mfa);
		setModalLoading(true);
		if (!mfa.active) {
			if (enrollFor?.ui_id === mfa.ui_id) {
				showModal();
			}
			setEnrollFor(mfa);
		} else {
			if (props.view === MFA_VIEW.ONBOARDING) {
				return;
			} else {
				deleteMFAEnrollment(user.user_id, mfa.id, {
					mfa_token: MFAToken,
				}).then((res) => {
					setModalLoading(false);
					getMFAList();
				});
			}
		}
	};

	const showModal = () => {
		if (enrollFor && enrollFor.ui_id === AUTHENTICATOR_TYPE.PHONE) {
			setShowEnrollmentModal(true);
			setModalLoading(false);
		}
		if (
			enrollFor &&
			enrollFor.authenticator_type === AUTHENTICATOR_TYPE.OTP
		) {
			enrollSeletedMFAType();
		}
	};

	const getMFAList = () => {
		setLoading(true);
		getEnrolledMFA(user.user_id, { mfa_token: MFAToken }).then((res) => {
			mergeMFAListResponseWithLocalMFAList(res);
			setLoading(false);
		});
	};

	const mergeMFAListResponseWithLocalMFAList = (data) => {
		const _MFAList = JSON.parse(JSON.stringify(Object.values(MFA_TYPE)));
		const mfaList = _MFAList.map((mfa) => {
			const isPhone =
				mfa.ui_id === AUTHENTICATOR_TYPE.PHONE ? true : false;
			const found =
				Array.isArray(data) &&
				data.findIndex((item) => {
					if (
						isPhone &&
						item.oob_channel &&
						item.oob_channel !=
							(AUTHENTICATOR_TYPE.VOICE || AUTHENTICATOR_TYPE.SMS)
					) {
						return false;
					} else if (
						item.authenticator_type === mfa.authenticator_type
					) {
						return true;
					}
					return false;
				});
			return found > -1 ? Object.assign({}, mfa, data[found]) : mfa;
		});
		setIsMFAEnabled(
			mfaList.filter((mfa) => mfa.active && mfa.isPrimary).length
				? true
				: false
		);
		setMFAList(mfaList);
	};

	const getMFAToken = () => {
		getAccessTokenSilently({
			audience: `${getAppKey("REACT_APP_AUTH0_TENANT")}/mfa/`,
			scope: "enroll read:authenticators remove:authenticators",
			prompt: "none",
		})
			.then((token) => {
				setMFAToken(token);
			})
			.catch((err) => {
				loginWithPopup({
					prompt: "consent",
					scope: "enroll read:authenticators remove:authenticators",
					audience: `${getAppKey("REACT_APP_AUTH0_TENANT")}/mfa/`,
				});
			});
	};

	const enrollSeletedMFAType = () => {
		if (enrollFor.ui_id === AUTHENTICATOR_TYPE.PHONE && !phoneNumber) {
			return;
		} else {
			setButtonActionLoading(true);
			const type =
				enrollFor.authenticator_type === AUTHENTICATOR_TYPE.OOB
					? enrollFor.ui_id === AUTHENTICATOR_TYPE.PHONE
						? AUTHENTICATOR_TYPE.SMS
						: AUTHENTICATOR_TYPE.EMAIL
					: AUTHENTICATOR_TYPE.OTP;
			enrollMFA(user.user_id, {
				type: type,
				phone_number: phoneNumber,
				mfa_token: MFAToken,
			}).then((res) => {
				if (!res.error) {
					startTicker();
					setErrorDescription(null);
					setButtonActionLoading(false);
					setModalLoading(false);
					setShowEnrollmentModal(false);
					setEnrollementAssociateData(res);
					if (
						enrollFor.authenticator_type != AUTHENTICATOR_TYPE.OTP
					) {
						setShowOTPValidationModal(true);
					} else {
						setShowAuthScannerModal(true);
						setShowOTPValidationModal(false);
					}

					if (res["recovery_codes"])
						setRecoveryCode(res["recovery_codes"][0]);
				} else {
					setErrorDescription(res.error_description);
					setButtonActionLoading(false);
				}
			});
		}
	};

	const editPhoneNumber = () => {
		startTicker(true);
		setShowEnrollmentModal(true);
		setShowOTPValidationModal(false);
	};

	const resetState = () => {
		setShowEnrollmentModal(false);
		setShowOTPValidationModal(false);
		setEnrollementAssociateData(null);
		setOTP("");
		setPhoneNumber("");
		setErrorDescription(null);
		setButtonActionLoading(false);
	};

	const confirmEnrollment = () => {
		setButtonActionLoading(true);
		var data = {
			type: enrollFor.authenticator_type,
			otp: OTP,
			mfa_token: MFAToken,
		};
		if (enrollFor.authenticator_type != AUTHENTICATOR_TYPE.OTP) {
			data = Object.assign(
				{
					oob_code: enrollementAssociateData.oob_code,
				},
				data
			);
		}
		confirmMFAEnrollment(user.user_id, data).then((res) => {
			if (!res.error) {
				if (recoveryCode) {
					setShowRecoveryModal(true);
				}
				resetState();
				if (props.view === MFA_VIEW.SETTINGS) {
					getMFAList();
				} else {
					setMFAList(
						MFAList.map((res) => {
							if (res.ui_id === enrollFor.ui_id) {
								res.active = true;
							}
							return res;
						})
					);
				}
			} else {
				switch (res.error_description) {
					case AUTH0_ERROR.INVALID_MFA_TOKEN.response:
						setErrorDescription(
							AUTH0_ERROR.INVALID_MFA_TOKEN.display
						);
						break;
					case AUTH0_ERROR.INVALID_PNUM.response:
						setErrorDescription(AUTH0_ERROR.INVALID_PNUM.display);
						break;
					default:
						setErrorDescription(res.error_description);
				}
				setButtonActionLoading(false);
			}
		});
	};

	const generateRecoveryCode = (mfa) => {
		setEnrollFor(mfa);
		setModalLoading(true);
		generateRecoverCode(user.user_id)
			.then((res) => {
				setEnrollFor();
				setModalLoading(false);
				setRecoveryCode(res.recovery_code);
				setShowRecoveryModal(true);
			})
			.catch((err) => {});
	};

	const downloadRecoveryCode = () => {
		doc.text(recoveryCode, 10, 10);
		doc.save("zluri-recovery-code.pdf");
	};

	const mfa_options_onboarding_ui = MFAList.filter(
		(mfa) =>
			mfa.isPrimary ||
			(mfa.authenticator_type === AUTHENTICATOR_TYPE.RECOVERY_CODE &&
				mfa.active)
	).map((mfa, index) => {
		return (
			<li
				key={index}
				onClick={() => toggleEnrollement(mfa)}
				className={`mfa-type-card mr-3 justify-content-arround pointer ${
					mfa.active ? "mfa-active" : ""
				}`}
			>
				<div className="p-2 text-center border-1 p-4">
					<div className="mfa-icon-container mx-auto mb-3">
						{mfa.active && (
							<img src={check} className="mfa-card-check" />
						)}
						<img width={mfa.iconWidth} src={mfa.icon} />
					</div>
					<h4 className="font-18 bold-600">{mfa.display_name}</h4>
				</div>
			</li>
		);
	});

	const mfa_options_settings_ui = MFAList.map((mfa, index) => {
		return (
			<li key={index} className={`${mfa.active ? "mfa-active" : ""}`}>
				<div className="d-flex ">
					<div className="mfa-icon-container mr-3">
						{mfa.active && (
							<img
								width={15}
								src={check}
								className="mfa-card-check"
							/>
						)}
						<img width={15} src={mfa.icon} />
					</div>
					<div className="flex-fill mr-4">
						<h4 className="font-14 bold-600 black-1">
							{mfa.display_name}
						</h4>
						<p className="grey-1 font-11">{mfa.help_text}</p>
					</div>
					<div>
						{mfa.ui_id === enrollFor?.ui_id && modalLoading ? (
							<Loader width={60} height={60} />
						) : mfa.authenticator_type !=
						  AUTHENTICATOR_TYPE.RECOVERY_CODE ? (
							<Button
								disabled={
									mfa.ui_id === AUTHENTICATOR_TYPE.EMAIL
								}
								className={`${
									mfa.active &&
									mfa.ui_id != AUTHENTICATOR_TYPE.EMAIL
										? " bg-red"
										: " primary-color-border"
								}`}
								type={mfa.active ? "" : "link"}
								onClick={() => toggleEnrollement(mfa)}
							>
								{" "}
								{mfa.active
									? mfa.ui_id != AUTHENTICATOR_TYPE.EMAIL
										? "Disable"
										: "Enabled"
									: "Setup"}{" "}
							</Button>
						) : (
							<Button
								style={{ minWidth: "130px" }}
								className="primary-color-border"
								type="link"
								onClick={() => generateRecoveryCode(mfa)}
							>
								Generate New
							</Button>
						)}
					</div>
				</div>
				<hr />
			</li>
		);
	});

	return (
		<div>
			{props.view === MFA_VIEW.ONBOARDING && (
				<div className="onboarding-layout">
					{loading ? (
						<LoaderPage />
					) : (
						<>
							<header className="text-center p-3 pr-4 pl-4">
								<img src={logo} />
								<hr className="mb-0 mt-4" />
							</header>
							<section className="text-center black-1 mt-3">
								<h3 className="bold-700 font-24">
									Setup 2FA to secure your account
								</h3>
								<p className="mt-2 font-14 ">
									Two factor authentication secures your
									account
								</p>
								<ul className="mt-5 d-flex justify-content-center align-items-stretch list-style-none">
									{mfa_options_onboarding_ui}
								</ul>
							</section>
							<footer className="mfa-onboarding-footer">
								<hr className="m-0" />
								<ul className="list-style-none d-flex justify-content-between p-4">
									<li></li>
									<li>
										<Button
											className="pl-3 pr-3"
											onClick={() =>
												history.push("/newuseroverview")
											}
										>
											Next Step
										</Button>
									</li>
								</ul>
							</footer>
						</>
					)}
				</div>
			)}
			{props.view === MFA_VIEW.SETTINGS && (
				<div className="mfa-settings">
					<>
						<div className="d-flex">
							<div className="flex-fill">
								<h3
									className="font-14 black-1 mb-2 pointer"
									onClick={() => {
										setShowMFAList(!showMFAList);
									}}
								>
									Two-factor authentication{" "}
									<span>
										{!showMFAList ? (
											<img src={arrowdown} />
										) : (
											<img src={arrowup} />
										)}
									</span>
								</h3>
								<p className="grey-1 font-11 mb-4">
									Please use any of the below method to secure
									your account with 2 factor authentication.
								</p>
								{showMFAList && (
									<>
										{loading ? (
											<Loader width={60} height={60} />
										) : (
											<ul
												style={{
													maxWidth: "560px",
												}}
												className="mt-5 list-style-none p-0"
											>
												{mfa_options_settings_ui}
											</ul>
										)}
									</>
								)}
							</div>
							{!showMFAList && !loading && (
								<div>
									{!isMFAEnabled ? (
										<Button
											onClick={() => {
												setShowMFAList(true);
											}}
											type="link primary-color-border"
										>
											Setup Now
										</Button>
									) : (
										<Button
											className="font-14 green bold-600"
											onClick={() => {
												setShowMFAList(true);
											}}
											type="link"
										>
											Enabled
										</Button>
									)}
								</div>
							)}
						</div>
					</>
				</div>
			)}
			{enrollFor?.authenticator_type === AUTHENTICATOR_TYPE.OOB && (
				<Modal
					onClose={() => {
						setShowEnrollmentModal(false);
					}}
					show={showEnrollmentModal}
					contentClassName="mfa-modal"
					title={"Setup 2FA using Phone Number"}
				>
					<div className="mfa-verification-content">
						<div className="p-2 text-center  p-4">
							<div className="mfa-icon-container mx-auto mb-3">
								<img
									width={enrollFor.iconWidth}
									src={enrollFor.icon}
								/>
							</div>
							<h4 className="font-14 bold-400 black-1 mb-2">
								Please enter your mobile number to receive a
								verification code
							</h4>
							<input
								placeholder="Enter your phone number with country code"
								style={{
									border: "1px solid #5ABAFF",
									height: "48px",
								}}
								className="w-100 p-2 font-18 pl-3"
								type="text"
								value={phoneNumber}
								onChange={(e) => {
									setPhoneNumber(e.target.value);
								}}
							/>
							{errorDescription && (
								<p className="red mb-3 font-12 text-left  text-capitalize mt-2">
									{errorDescription}
								</p>
							)}
							{buttonActionLoading && (
								<Loader width={60} height={60} />
							)}
							<Button
								disabled={!phoneNumber || buttonActionLoading}
								onClick={() => {
									enrollSeletedMFAType();
								}}
								className="mb-5 mt-5"
							>
								Send Verification Code
							</Button>
						</div>
					</div>
				</Modal>
			)}
			{showOTPValidationModal && (
				<Modal
					onClose={() => {
						setShowOTPValidationModal(false);
					}}
					show={showOTPValidationModal}
					contentClassName="mfa-modal"
					title={
						enrollFor.ui_id === AUTHENTICATOR_TYPE.OTP
							? "Setup 2FA using Authenticator"
							: "Setup 2FA using SMS"
					}
				>
					<div className="mfa-verification-content">
						<div className="p-2 text-center  p-4">
							{enrollFor.ui_id != AUTHENTICATOR_TYPE.OTP ? (
								<>
									<div className="mfa-icon-container mx-auto mb-3">
										<img width={57} src={sms} />
									</div>
									<h4 className="font-14 bold-400 black-1 mb-2">
										Verification code sent to{" "}
										<span
											className="pointer black ml-2 bold-600"
											onClick={() => {
												editPhoneNumber();
											}}
										>
											{phoneNumber}{" "}
											<img width={13} src={edit} />
										</span>
									</h4>
								</>
							) : (
								<>
									<h4 className="font-14 bold-400 black-1 mb-2 mt-4">
										Enter 6 digit code
									</h4>
									<p className="font-12 grey-1 mb-5">
										Enter the security code generated by
										your application
									</p>
								</>
							)}
							<input
								placeholder="Enter Verification code"
								style={{
									border: "1px solid #5ABAFF",
									height: "48px",
								}}
								className="w-100 p-2 font-18 pl-3"
								type="text"
								value={OTP}
								onChange={(e) => {
									setOTP(e.target.value);
								}}
							/>
							{errorDescription && (
								<p className="red mb-3 font-12 text-capitalize mt-2">
									{errorDescription}
								</p>
							)}
							{buttonActionLoading && (
								<Loader width={60} height={60} />
							)}
							<ul className="list-style-none d-flex justify-content-between p-0 mt-3">
								<li>
									{enrollFor.ui_id !=
										AUTHENTICATOR_TYPE.OTP &&
										(retrySendingOTP ? (
											<Button
												type="link"
												onClick={() => {
													enrollSeletedMFAType();
												}}
												className="mb-5"
											>
												Resend
											</Button>
										) : (
											<p className="font-13 grey-1 m-0 mt-2">
												Resend code in{" "}
												<span className="bold-600">
													{sendingOTPInNSeconds}s{" "}
												</span>
											</p>
										))}
								</li>
								<li>
									<Button
										disabled={buttonActionLoading || !OTP}
										onClick={() => {
											confirmEnrollment();
										}}
										className="mb-5"
									>
										Verify & Proceed
									</Button>
								</li>
							</ul>
						</div>
					</div>
				</Modal>
			)}
			{enrollementAssociateData &&
				enrollementAssociateData.barcode_uri &&
				showAuthScannerModal && (
					<Modal
						onClose={() => {
							setShowAuthScannerModal(false);
						}}
						show={showAuthScannerModal}
						contentClassName="mfa-modal"
						title={"Setup 2FA using Authenticator"}
					>
						<div className="mfa-verification-content">
							<div className="p-2 text-center  p-4">
								<div className=" mx-auto mb-3">
									<QRCode
										value={
											enrollementAssociateData.barcode_uri
										}
									/>
								</div>
								<h4 className="font-16 bold-400 black-1 mb-2">
									Open your authenticator app and scan this QR
									code
								</h4>
								<p className="font-12 grey-1">
									Use Google Authenticator, Microsoft
									authenticator, Authy or any other
									authenticator app to scan this code.{" "}
									<a
										href="https://help.zluri.com/en/articles/5661345-zluri-2-factor-authentication"
										target="_blank"
										rel="noreferrer"
									>
										Learn more
									</a>
								</p>
								<div className="mt-3">
									<p className="bold-400 mb-2 font-12 mb-0">
										Or enter the following code manually:
									</p>
									<p
										style={{ letterSpacing: "1px" }}
										className="bold-600 font-14"
									>
										{enrollementAssociateData.secret}
									</p>
								</div>
								<Button
									onClick={() => {
										setShowAuthScannerModal(false);
										setShowOTPValidationModal(true);
									}}
									className="mb-5"
								>
									Verify the Code
								</Button>
							</div>
						</div>
					</Modal>
				)}
			{recoveryCode && (
				<Modal
					onClose={() => {
						setShowRecoveryModal(false);
					}}
					show={showRecoveryModal}
					contentClassName="mfa-modal"
					title={"Backup codes"}
				>
					<div className="mfa-verification-content">
						<div className="p-2 text-center  p-4">
							<div className="mfa-icon-container mx-auto mb-3">
								<img width={55} src={recoverycode} />
							</div>
							<h4 className="font-16 bold-400 black-1 mb-2">
								Your backup verification code
							</h4>
							<p className="font-11 grey-1">
								With 2FA enabled, you’ll need the backup code if
								you ever lose your device. We recommend that you
								print and keep it in a safe place.
							</p>

							<div className="d-flex mt-4 mb-5">
								<p
									style={{
										background: "#EDF2F5",
										borderRadius: "3px",
									}}
									className="flex-fill bold-500 font-16 black m-0 mr-2 p-2"
								>
									{recoveryCode}
								</p>
								<img
									className="pointer"
									src={copy}
									onClick={() =>
										navigator.clipboard.writeText(
											recoveryCode
										)
									}
								/>
							</div>
							<Button
								onClick={() => {
									downloadRecoveryCode();
								}}
								className="mb-5"
							>
								Download PDF
							</Button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
}

MFA.propTypes = {
	view: PropTypes.string.isRequired,
};

MFA.defaultProps = {
	view: MFA_VIEW.SETTINGS,
};
