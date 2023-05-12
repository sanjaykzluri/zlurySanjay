import React, { useContext, useEffect, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { ConnectionFail } from "../../components/ConnectionFail/ConnectionFail";
import { ConnectionSucces } from "../../components/ConnectionSucces/ConnectionSucces";
import add from "../../../../assets/icons/plus-blue.svg";
import plus from "../../../../assets/icons/plus-white.svg";
import success from "../../../../assets/icons/check-circle.svg";
import error from "../../../../assets/icons/exclamation.svg";
import cancel from "../../../../assets/icons/cancel-grey.svg";
import lockedIcon from "../../../../assets/locked-icon.svg";

import "./IntegrationStatus.css";
import { INTEGRATION_STATUS, INTEGRATION_TYPE } from "../../constants/constant";
import { IntegrationConnect } from "../../components/IntegrationConnect/IntegrationConnect";
import { getValueFromLocalStorage } from "../../../../utils/localStorage";
import { useHistory, useLocation } from "react-router";
import { PopupWindowPostRequest } from "../../../../utils/PopupWindowPostRequest";
import { useDispatch, useSelector } from "react-redux";
import {
	disconnectIntegration,
	integrationConnected,
} from "../../redux/integrations";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "../../../../common/restrictions";
import { ENTITIES } from "../../../../constants";
import { TriggerIssue } from "../../../../utils/sentry";
import { getAppKey } from "../../../../utils/getAppKey";
import RoleContext from "../../../../services/roleContext/roleContext";
import AccountForm from "../../components/AccountForm/AccountForm";
import { IntegrationConnectV2 } from "../../components/IntegrationConnectV2/IntegrationConnectV2";
import whiteLockedIcon from "assets/integrations/lock-white.svg";
import IntegrationConfirmationModal from "../SingleIntegration/IntegrationConfirmationModal";
import _ from "underscore";

export function IntegrationStatus(props) {
	const { isViewer } = useContext(RoleContext);
	const [showConnectModal, setShowConnectModal] = useState(false);
	const [showConnectFailModal, setShowConnectFailModal] = useState(false);
	const [showDisconnectButton, setShowDisconnectButton] = useState(false);
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const orgAvailableForPoc = useSelector(
		(state) => state.userInfo.org_available_for_poc
	);

	const [inviteSentSuccessful, setInviteSentSuccessful] = useState(false);
	const [connectedOrgIntegrationId, setConnectedOrgIntegrationId] =
		useState();
	const [connectedOrgIntegrationName, setConnectedOrgIntegrationName] =
		useState();
	const [preventClosingModal, setPreventClosingModal] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);

	const userDetails = getValueFromLocalStorage("userInfo");

	let client = null;
	const history = useHistory();
	const location = useLocation();
	const dispatch = useDispatch();
	const controller = new AbortController();

	const hasConnectedOrgIntegrations = props.integration
		? _.where(props.integration?.accounts, {
				integration_status: "connected",
		  })?.length > 0
		: false;

	const disconnectApplication = (e) => {
		client = PopupWindowPostRequest(
			props.integration.disconnectURL,
			"DisconnectIntegrationApplication",
			{
				orgId: userDetails.org_id,
				userId: userDetails.user_id,
				Authorization: `Bearer ${getValueFromLocalStorage("token")}`,
				integrationId: props.integration.id,
			}
		);
		window.addEventListener(
			"message",
			(e) => {
				try {
					if (e?.origin === getAppKey("REACT_APP_INTEGRATION_URL")) {
						controller.abort();
						if (e.data.status === "error") {
							props.onError();
						}
						if (e?.data?.status === "success") {
							if (e?.data?.message === "disconnected") {
								dispatch(disconnectIntegration());
							}
						}
					}
				} catch (e) {
					TriggerIssue(
						`On Disconnecting Integration ${props.integration.name}`,
						e
					);
				}
			},
			{ signal: controller.signal }
		);
	};

	const connect = (e) => {
		//Segment Implementation
		window.analytics.track(
			"Clicked on Connect Integration",
			{
				currentCategory: "Integrations",
				currentPageName: "Integrations",
				integrationId: props.integration.id,
				integrationName: props.integration.name,
				orgId: orgId || "",
				orgName: orgName || "",
			},
			true
		);
		if (isBasicSubscription) {
			e.preventDefault();
			e.stopPropagation();
			showrestrictedPopup(ENTITIES.INTEGRATIONS);
		} else {
			if (hasConnectedOrgIntegrations) {
				setShowConfirmationModal(true);
			} else {
				setShowConnectModal(true);
			}
			//Segment Implementation
			window.analytics.page("Integrations", "Integration Connect Modal", {
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	};

	const clickHandler = (e) => {
		if (
			[
				INTEGRATION_STATUS.NOT_CONNECTED,
				INTEGRATION_STATUS.ERROR,
			].includes(props.integration.status)
		)
			e.stopPropagation();
	};

	const singleIntegrationPage =
		[
			"/integrations/catalog",
			"/integrations/",
			"/integrations",
			"/steps",
			"/search",
		].includes(location.pathname) ||
		props.inSlider ||
		location.pathname.includes("/workflow")
			? false
			: true;

	return (
		<>
			{!isViewer &&
			!["tangoe client admin", "tangoe integration admin"].includes(
				userDetails?.user_role
			) ? (
				!props?.asOptions ? (
					<div onClick={(e) => clickHandler(e)}>
						{(!showConnectModal || !props.hideButton) && (
							<>
								{singleIntegrationPage ? (
									props.integration.status ===
										INTEGRATION_STATUS.NOT_CONNECTED &&
									((orgAvailableForPoc &&
										props.integration
											.available_to_connect &&
										props.integration.available_for_poc) ||
									!orgAvailableForPoc ? (
										<Button
											className="w-100"
											onClick={(e) => {
												connect();
												props.setDropdownOpen &&
													props.setDropdownOpen(true);
											}}
											type={"primary"}
										>
											<img
												src={plus}
												width={11}
												className="mx-2"
											/>{" "}
											{props.hasMoreAccount
												? "Connect another instance"
												: "Connect integration"}
										</Button>
									) : (
										<Button
											className="w-100"
											style={{
												background: "#2266E2;",
												color: "#FFFFFF",
												opacity: "0.3",
												cursor: "pointer",
											}}
											type="primary"
											onClick={() => {
												props.setshowUpgradeModal &&
													props.setshowUpgradeModal(
														true
													);
											}}
										>
											<img
												src={whiteLockedIcon}
												width={11}
												className="mr-2"
											/>{" "}
											{props.addText
												? props.addText
												: "Connect Integration"}
										</Button>
									))
								) : (
									<>
										{props.integration.status ===
											INTEGRATION_STATUS.NOT_CONNECTED &&
											((orgAvailableForPoc &&
												props.integration
													.available_to_connect &&
												props.integration
													.available_for_poc) ||
											!orgAvailableForPoc ? (
												<Button
													className="w-100 flex"
													onClick={(e) => {
														connect();
														props.setDropdownOpen &&
															props.setDropdownOpen(
																true
															);
													}}
													type="link"
													style={{
														justifyContent:
															"center",
													}}
												>
													<img
														src={add}
														width={11}
														className="mx-2"
													/>{" "}
													{props.addText
														? props.addText
														: "Connect"}
												</Button>
											) : (
												<Button
													onClick={(e) => {
														// connect();
														props.setDropdownOpen &&
															props.setDropdownOpen(
																true
															);
														props.setshowUpgradeModal &&
															props.setshowUpgradeModal(
																true
															);
													}}
													style={{
														width: "auto",
														background:
															"rgba(242, 245, 255, 1)",
														color: "rgba(34, 102, 226, 1)",
														opacity: "0.5",
														cursor: "pointer",
													}}
													type="primary"
													className="flex"
												>
													<img
														src={lockedIcon}
														width={11}
														className="mr-2"
													/>{" "}
													{props.addText
														? props.addText
														: "Connect"}
												</Button>
											))}
										{props.integration.status ===
											INTEGRATION_STATUS.CONNECTED && (
											<Button
												onClick={(e) => {}}
												className="z_i_btn_success green d-flex"
											>
												<img
													src={success}
													width={20}
													className="mr-2"
												/>
												Connected
											</Button>
										)}
										{props.integration.status ===
											INTEGRATION_STATUS.ERROR && (
											<>
												{props.enableReconnect ? (
													<Button
														onClick={(e) => {
															setShowConnectModal(
																true
															);
															props.setDropdownOpen &&
																props.setDropdownOpen(
																	true
																);
														}}
														className="z_i_btn_error"
													>
														<img
															src={error}
															width={20}
															className="mr-2"
														/>{" "}
														Reconnect
													</Button>
												) : (
													<Button
														onClick={(e) => {
															connect();
															props.setDropdownOpen &&
																props.setDropdownOpen(
																	true
																);
														}}
														className="z_i_btn_error red"
													>
														<img
															src={error}
															width={20}
															className="mr-2"
														/>{" "}
														Resolve Error
													</Button>
												)}
											</>
										)}
									</>
								)}
							</>
						)}
						{showConnectModal && props?.integration ? (
							<IntegrationConnectV2
								integration={props.integration}
								onHide={() => {
									setShowConnectModal(false);
									props.setDropdownOpen &&
										props.setDropdownOpen(false);
									props.setShowConnectedAccounts &&
										props.setShowConnectedAccounts(false);
								}}
								showModal={showConnectModal}
								toBeConnectedScopes={
									props.scopeDetails?.missingScopeObjects
								}
								callbackOnboardingPageOnSuccess={(
									orgIntegrationId
								) => {
									(props.onboarding ||
										props.triggerWorkflowRefresh) &&
										props.onSuccess &&
										props.onSuccess(orgIntegrationId);
									setInviteSentSuccessful(false);
								}}
								onSuccess={(orgIntegration) => {
									setConnectedOrgIntegrationId(
										orgIntegration.orgIntegrationId
									);
									setConnectedOrgIntegrationName(
										orgIntegration.orgIntegrationName
									);
									props.onSuccess &&
										props.onSuccess(orgIntegration);
								}}
								onRequestSent={(data) => {
									setInviteSentSuccessful(true);
									props.onRequestSent &&
										props.onRequestSent(data);
								}}
								connectedScopes={
									props.scopeDetails?.currentScopes
								}
								orgIntegrationId={props.orgIntegrationId}
							/>
						) : null}
						{showConfirmationModal ? (
							<IntegrationConfirmationModal
								showConfirmationModal={showConfirmationModal}
								onHide={() => {
									setShowConfirmationModal(false);
								}}
								instancesCount={
									_.where(props.integration?.accounts, {
										integration_status: "connected",
									})?.length
								}
								integrationName={props.integration.name}
								setShowConnectModal={() => {
									setShowConnectModal(true);
									setShowConfirmationModal(false);
								}}
							/>
						) : null}
						<Modal
							dialogClassName="z_i_connect_modal_dialog"
							show={showConnectFailModal}
							onClose={() => setShowConnectFailModal(false)}
						>
							<ConnectionFail className="p-5" />
						</Modal>
					</div>
				) : (
					<div>
						<Button
							onClick={(e) => {
								disconnectApplication();
							}}
							type="normal"
							className="grey"
						>
							Disconnect
						</Button>
					</div>
				)
			) : null}
		</>
	);
}
