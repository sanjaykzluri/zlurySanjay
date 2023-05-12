import React, { Fragment, useEffect, useState } from "react";
import {
	INTEGRATION_STATUS,
	INTEGRATION_TYPE,
	REQUEST_STATUS,
} from "../../constants/constant";
import upDownArrow from "../../../../assets/upDownArrow.svg";
import connectedIcon from "../../../../assets/icons/check-circle.svg";
import disconnectedAccount from "../../../../components/Onboarding/warning.svg";
import edit from "../../../../assets/icons/edit.svg";
import {
	Accordion,
	Card,
	OverlayTrigger,
	Spinner,
	Tooltip,
} from "react-bootstrap";
import moment from "moment";
import { Button } from "../../../../UIComponents/Button/Button";
import disconnectIcon from "../../../../assets/cross-solid.svg";
import addWhiteIcon from "../../../../assets/icons/plus-white.svg";
import AccountForm from "../AccountForm/AccountForm";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import exchange from "../../../../assets/icons/exchangeArrow.svg";
import zluri from "../../../../assets/zluri-logo.svg";
import { editAccountDetails, removeAccount } from "../../service/api";
import { useDispatch } from "react-redux";
import {
	refreshIntegrations,
	resetIntegration,
} from "../../redux/integrations";
import { PopupWindowPostRequest } from "../../../../utils/PopupWindowPostRequest";
import { getValueFromLocalStorage } from "../../../../utils/localStorage";
import { TriggerIssue } from "../../../../utils/sentry";
import { getAppKey } from "../../../../utils/getAppKey";
import { Link, useHistory, useLocation } from "react-router-dom";
import greenTicket from "../../../../components/Integrations/greenTick.svg";
import { NameBadge } from "../../../../common/NameBadge";
import { unescape, urlifyImage } from "../../../../utils/common";
import i_letter from "../../../../assets/i_letter.svg";

export default function onHoverShowChildAccount({
	account,
	uniqueKey,
	integration,
}) {
	const [showAccountModal, setShowAccountModal] = useState(false);
	const [isAccountSaving, setIsAccountSaving] = useState(false);
	const [failedToSaveAccountMsg, setFailedToSaveAccountMsg] = useState();
	const imageSize = {
		width: "30px",
	};
	let client = null;
	const dispatch = useDispatch();
	const user = getValueFromLocalStorage("userInfo");
	const controller = new AbortController();
	const [isRemovingAccount, setIsRemovingAccount] = useState(false);
	const [failedToRemoveAccount, setFailedToRemoveAccount] = useState(false);
	const [successfullyRemovedAccount, setSuccessfullyRemovedAccount] =
		useState(false);

	const handleReconnectForOauth = () => {
		client = PopupWindowPostRequest(
			integration?.connectURL,
			"ReconnectIntegrationApplication",
			{
				Authorization: `Bearer ${getValueFromLocalStorage("token")}`,
				orgIntegrationId: account.org_integration_id,
				orgId: user.org_id,
				userId: user.user_id,
				integrationId: integration.id,
			}
		);
		const popupTick = setInterval(function () {
			if (client && client.closed) {
				clearInterval(popupTick);
				controller.abort();
			}
		}, 500);
		window.addEventListener(
			"message",
			(e) => {
				try {
					if (e?.origin === getAppKey("REACT_APP_INTEGRATION_URL")) {
						controller.abort();
						if (
							e?.data?.status === "success" &&
							e?.data?.message === "connected"
						) {
							dispatch(refreshIntegrations());
							setTimeout(() => {
								dispatch(resetIntegration());
							}, [1000]);
						}
					}
				} catch (e) {
					TriggerIssue(
						`On Reconnecting Integration ${integration.name}`,
						e
					);
				}
			},
			{ signal: controller.signal }
		);
	};

	const handleDisconnect = () => {
		client = PopupWindowPostRequest(
			integration?.disconnectURL,
			"DisconnectIntegrationApplication",
			{
				Authorization: `Bearer ${getValueFromLocalStorage("token")}`,
				orgIntegrationId: account.org_integration_id,
			}
		);
		const popupTick = setInterval(function () {
			if (client && client.closed) {
				clearInterval(popupTick);
				controller.abort();
			}
		}, 500);
		window.addEventListener(
			"message",
			(e) => {
				try {
					if (e?.origin === getAppKey("REACT_APP_INTEGRATION_URL")) {
						controller.abort();
						if (
							e?.data?.status === "success" &&
							e?.data?.message === "disconnected"
						) {
							dispatch(refreshIntegrations());
							setTimeout(() => {
								dispatch(resetIntegration());
							}, [1000]);
						}
					}
				} catch (e) {
					TriggerIssue(
						`On Disconnecting Integration ${integration.name}`,
						e
					);
				}
			},
			{ signal: controller.signal }
		);
	};

	const editAccount = (inviteObject) => {
		if (
			inviteObject.accountName != account?.name ||
			inviteObject.accountDescription != account?.description
		) {
			setIsAccountSaving(true);
			try {
				editAccountDetails(account._id, inviteObject).then((res) => {
					if (res?.success) {
						setFailedToSaveAccountMsg();
						dispatch(resetIntegration());
					} else {
						setFailedToSaveAccountMsg(
							res?.error?.response?.data?.error || "some issue"
						);
					}
					setIsAccountSaving(false);
				});
			} catch (error) {
				setIsAccountSaving(false);
				setFailedToSaveAccountMsg("some issue");
				TriggerIssue("Error editing orgIntegration details", error);
			}
		} else {
			setShowAccountModal(false);
		}
	};

	const handleRemoveAccount = () => {
		try {
			setIsRemovingAccount(true);
			removeAccount(account.org_integration_id).then((res) => {
				if (res.success) {
					setFailedToRemoveAccount(false);
					setSuccessfullyRemovedAccount(true);
					dispatch(refreshIntegrations());
					setTimeout(() => {
						dispatch(resetIntegration());
						setSuccessfullyRemovedAccount(false);
					}, [1000]);
				} else {
					setFailedToRemoveAccount(true);
				}
				setIsRemovingAccount(false);
			});
		} catch (error) {
			setFailedToRemoveAccount(true);
			setIsRemovingAccount(false);
			TriggerIssue("Error when removing orgItegration", error);
		}
	};

	useEffect(() => {
		if (!showAccountModal) {
			setFailedToSaveAccountMsg();
			setIsAccountSaving(false);
		}
	}, [showAccountModal]);

	return (
		<Fragment>
			<Accordion>
				<Card
					className="border-left-0 border-top-0 border-right-0"
					key={uniqueKey}
				>
					<Card.Header
						style={{ padding: "0" }}
						className="bg-white border-0"
					>
						<div className="row w-100 m-0 pt-2 pb-2">
							<div className="col-md-1 p-0 justify-content-center d-flex">
								<img
									src={
										account?.integration_status ===
										INTEGRATION_STATUS.CONNECTED
											? connectedIcon
											: disconnectedAccount
									}
									className="mb-auto ml-auto mr-auto"
								/>
							</div>
							<div className="d-flex flex-column col p-0 ">
								<div className="d-flex flex-row p-0 onHoverShowChild">
									{account.description ||
									account.integration_connected_by ||
									account.integration_updated_at ? (
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>
													<div className="d-flex flex-column">
														{account.description && (
															<div className="font-11 grey-1 text-left mt-1 mb-1">
																{
																	account.description
																}
															</div>
														)}
														{account.description &&
															(account.integration_connected_by ||
																account.integration_updated_at) && (
																<hr className="m-0"></hr>
															)}
														{(account.integration_connected_by ||
															account.integration_updated_at) && (
															<div className="d-flex flex-row mb-1 mt-1">
																<img
																	src={
																		i_letter
																	}
																	className="mt-auto mb-auto mr-1"
																/>
																<div className="font-9 grey-1 o-8">
																	Updated
																	{account.integration_connected_by &&
																		` by ${account.integration_connected_by}`}
																	{account.integration_updated_at &&
																		` on ${
																			account.integration_updated_at &&
																			moment(
																				account.integration_updated_at
																			).format(
																				"DD MMM YY"
																			)
																		}`}
																</div>
															</div>
														)}
													</div>
												</Tooltip>
											}
										>
											<div
												className={`font-14 mr-1 mt-auto mb-auto text-truncate ${
													account.name
														? "bold-normal"
														: "grey-1 o-6 dashedBorder border-right-0 border-left-0 border-top-0"
												}`}
												style={{ minWidth: "100px" }}
											>
												{account.name || "NA"}
											</div>
										</OverlayTrigger>
									) : (
										<div
											className={`font-14 mr-1 mt-auto mb-auto text-truncate ${
												account.name
													? "bold-normal"
													: "grey-1 o-6 dashedBorder border-right-0 border-left-0 border-top-0"
											}`}
											style={{ minWidth: "100px" }}
										>
											{account.name || "NA"}
										</div>
									)}
									<Accordion.Toggle
										as={Card.Header}
										className="bg-white d-flex cursor-pointer border-0 p-0"
										variant="link"
										eventKey={uniqueKey + "account"}
									>
										<img
											src={upDownArrow}
											className="mr-auto mt-auto mb-auto"
										/>
									</Accordion.Toggle>
									<img
										src={edit}
										className="ml-auto childElement cursor-pointer"
										onClick={() =>
											setShowAccountModal(true)
										}
										style={{ width: "12.8px" }}
									/>
								</div>
								{account?.integration_status ===
									INTEGRATION_STATUS.CONNECTED &&
								account?.last_sync_date ? (
									<div className="font-11 grey-1 mt-1">
										{`Last synced ${moment(
											account?.last_sync_date
										).fromNow()}`}
									</div>
								) : account?.integration_status ===
								  INTEGRATION_STATUS.NOT_CONNECTED ? (
									<div className="font-11 grey-1 mt-1">
										{`Disconnected since ${moment(
											account?.integration_updated_at
										).fromNow(true)}`}
									</div>
								) : null}
							</div>
						</div>
					</Card.Header>
					<Accordion.Collapse eventKey={uniqueKey + "account"}>
						<Card.Body className="d-flex flex-column pt-2">
							{account.integration_error_message &&
								account?.integration_status ===
									INTEGRATION_STATUS.ERROR && (
									<Button className="warningMessage red-bg font-11 bold-normal w-100">
										{account.integration_error_message}
									</Button>
								)}
							<div className="d-flex flex-row mt-2">
								{account?.integration_status ===
								INTEGRATION_STATUS.CONNECTED ? (
									<Button
										className="warningMessage d-flex border-0 bg-light w-auto"
										style={{
											backgroundColor:
												"rgba(235, 235, 235, 0.5)",
										}}
										onClick={() => handleDisconnect()}
									>
										<img
											src={disconnectIcon}
											className="mr-1"
											style={{ width: "14px" }}
										/>
										<div className="font-12 bold-normal">
											Disconnect
										</div>
									</Button>
								) : (
									<div className="d-flex flex-row">
										{integration.form &&
										Array.isArray(integration.form) &&
										integration.form?.length > 0 ? (
											<Link
												to={{
													pathname: `/integrations/${integration.id}`,
													hash: "#settings",
													state: {
														selectedAccount:
															account,
													},
												}}
												className="mr-2 btn btn-primary font-11 d-flex align-items-center"
											>
												<img
													src={addWhiteIcon}
													width={7.7}
													className="mr-2"
												/>
												Reconnect
											</Link>
										) : (
											<Button
												onClick={() =>
													handleReconnectForOauth()
												}
												className="mr-2 btn btn-primary font-11 d-flex align-items-center"
											>
												<img
													src={addWhiteIcon}
													width={7.7}
													className="mr-2"
												/>
												Reconnect
											</Button>
										)}
										<Button
											className="bg-light grey"
											onClick={() =>
												handleRemoveAccount()
											}
										>
											{isRemovingAccount ? (
												<Spinner
													animation="border"
													role="status"
													variant="primary"
													size="sm"
													className="mr-1"
													style={{
														borderWidth: 2,
														width: "13px",
														height: "13px",
													}}
												>
													<span className="sr-only">
														Loading...
													</span>
												</Spinner>
											) : failedToRemoveAccount ? (
												<OverlayTrigger
													overlay={
														<Tooltip>
															Failed to remove
															account
														</Tooltip>
													}
												>
													<img
														style={{
															width: "13px",
														}}
														className="mt-0 mr-1"
														src={
															disconnectedAccount
														}
													/>
												</OverlayTrigger>
											) : successfullyRemovedAccount ? (
												<OverlayTrigger
													overlay={
														<Tooltip>
															Successfuly removed
															account
														</Tooltip>
													}
												>
													<img
														style={{
															width: "13px",
														}}
														className="mt-0 mr-1"
														src={greenTicket}
													/>
												</OverlayTrigger>
											) : null}
											Remove
										</Button>
									</div>
								)}
							</div>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
			{showAccountModal && (
				<Modal
					dialogClassName="z_i_connect_modal_dialog"
					show={showAccountModal}
					onClose={() => setShowAccountModal(false)}
				>
					<div
						className="mt-5 mb-5 d-flex flex-column ml-auto mr-auto"
						style={{ width: "410px" }}
					>
						<div className="m-auto d-flex">
							<img
								className="ml-auto"
								style={imageSize}
								src={zluri}
							></img>
							<img className="ml-2 mr-2" src={exchange}></img>
							{integration.logo ? (
								<div
									className="mt-auto mb-auto mr-auto background-contain background-no-repeat background-position-center"
									style={{
										backgroundImage: `url(${urlifyImage(
											unescape(integration.logo)
										)})`,
										width: "30px",
										height: "30px",
									}}
								></div>
							) : (
								<NameBadge
									name={integration.name}
									className="rounded-circle mt-auto mb-auto mr-auto"
									width={"30px"}
								/>
							)}
						</div>
						<div className="font-18 text-center mb-4 mt-2">
							Edit Connection
						</div>
						<AccountForm
							accountName={account.name}
							accountDescription={account.description}
							isFailedMsg={failedToSaveAccountMsg}
							isLoading={isAccountSaving}
							onSave={editAccount}
						/>
					</div>
				</Modal>
			)}
		</Fragment>
	);
}
