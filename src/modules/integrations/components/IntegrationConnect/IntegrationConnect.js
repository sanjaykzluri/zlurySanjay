import React, { useState } from "react";
import exchange from "../../../../assets/icons/exchangeArrow.svg";
import zluri from "../../../../assets/zluri-logo.svg";
import exclamation from "../../../../assets/icons/exclamation.svg";
import check from "../../../../assets/icons/check-circle.svg";
import { IntegrationRequestCoworker } from "../../containers/IntegrationRequestCoworker/IntegrationRequestCoworker";
import { IntegrationSelfConnect } from "../../containers/IntegrationSelfConnect/IntegrationSelfConnect";
import { Button } from "../../../../UIComponents/Button/Button";
import AccountForm from "../AccountForm/AccountForm";
import { editInviteAccountDetails } from "../../service/api";
import { useDispatch } from "react-redux";
import {
	refreshPRState,
	resetIntegration,
	updateRequestForIntegrations,
} from "../../redux/integrations";
import IntegrationConnectForm from "../../containers/IntegrationConnectFormModal/IntegrationConnectForm";
import { ConnectionSucces } from "../ConnectionSucces/ConnectionSucces";
import { useHistory, useLocation } from "react-router-dom";
import { TriggerIssue } from "../../../../utils/sentry";
import { unescape, urlifyImage } from "../../../../utils/common";
import { NameBadge } from "../../../../common/NameBadge";
import _ from "underscore";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";

export const STATUS = {
	DEFAULT: "DEFAULT",
	CONNECTING: "CONNECTING",
	RETRY: "RETRY",
	REQUEST_SENT: "REQUEST_SENT",
	CONNECTED: "CONNECTED",
};

export function IntegrationConnect(props) {
	const [sendToCoworkerView, setSendToCoworkerView] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState(STATUS.DEFAULT);
	const [requestSentData, setRequestSentData] = useState();
	const dispatch = useDispatch();
	const [isAccountSaving, setIsAccountSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState(false);
	const [failedToSaveAccountMsg, setFailedToSaveAccountMsg] = useState();
	const [showNewIntegrationForm, setShowNewIntegrationForm] = useState(false);
	const [orgIntegrationId, setOrgIntegrationId] = useState();
	const [orgIntegrationName, setOrgIntegrationName] = useState();
	const location = useLocation();
	const history = useHistory();
	const [integration, setIntegration] = useState([]);
	const { partner } = useContext(RoleContext);

	const saveAccount = (accountObject) => {
		setIsAccountSaving(true);
		try {
			editInviteAccountDetails(
				requestSentData?.orgInviteId,
				accountObject
			).then((res) => {
				if (res?.success) {
					setFailedToSaveAccountMsg();
					dispatch(
						updateRequestForIntegrations(props.integration.id)
					);
					dispatch(refreshPRState(props.integration.id));
					dispatch(resetIntegration());
					props.onClose && props.onClose();
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
			TriggerIssue("Error when editing the invite", error);
		}
	};

	const showNewIntegrationFormCallback = (integration) => {
		setIntegration(integration);
		setShowNewIntegrationForm(true);
	};

	return (
		<div className="z_i_connect_modal">
			{showNewIntegrationForm ? (
				<IntegrationConnectForm
					scopes={props.scopes}
					integration={integration}
					onConnectionSuccessfull={() =>
						props.onConnectionSuccessfull &&
						props.onConnectionSuccessfull()
					}
					addScopesToOrgID={props.addScopesToOrgID}
					onClose={() => {
						if (
							!["/steps", "/integrations/connectInvite"].includes(
								location.pathname
							) &&
							props.isSimilarIntegration &&
							!location.pathname.includes("workflow")
						) {
							history.push(
								`/integrations/${props.integration.id}`
							);
							dispatch(
								updateRequestForIntegrations(
									props.integration.id
								)
							);
							dispatch(refreshPRState(props.integration.id));
							dispatch(resetIntegration());
						} else {
							props.onClose && props.onClose();
							props.callbackOnboardingPageOnSuccess &&
								props.callbackOnboardingPageOnSuccess();
						}
					}}
				/>
			) : (
				<>
					{connectionStatus != STATUS.CONNECTED &&
						connectionStatus != STATUS.REQUEST_SENT && (
							<div className="z_i_connect_modal_header text-center pt-5 pb-3">
								<div className="ml-4 mr-4 mb-2 d-flex justify-content-center">
									<img
										width={40}
										height={40}
										src={zluri}
									></img>
									<img
										className="ml-2 mr-2"
										src={exchange}
									></img>
									{props.integration.logo ? (
										<div
											className="img-circle background-contain background-no-repeat background-position-center"
											style={{
												backgroundImage: `url(${urlifyImage(
													unescape(
														props.integration.logo
													)
												)})`,
												width: "40px",
												height: "40px",
											}}
										></div>
									) : (
										<NameBadge
											name={props.integration.name}
											width={40}
											height={40}
											className="img-circle"
										/>
									)}
								</div>
								<h3 className="font-18 bold-600 black-1 mt-3">
									Connect {partner?.name} with{" "}
									{props.integration.name}
								</h3>
							</div>
						)}
					{connectionStatus === STATUS.REQUEST_SENT && (
						<div className="z_i_connect_modal_header text-center pt-5 pb-3">
							<div className="ml-4 mr-4 mb-2 d-flex justify-content-center">
								<img width={40} height={40} src={check}></img>
							</div>
							<h3 className="font-18 bold-600 black-1 mt-3">
								Connect Request Sent
							</h3>
						</div>
					)}
					<div className="z_i_connect_modal_body">
						{connectionStatus === STATUS.DEFAULT && (
							<>
								{!props.adminView && (
									<div className="d-flex z_i_connect_switch justify-content-between p-1 mt-2 mb-4">
										<div
											onClick={() =>
												setSendToCoworkerView(false)
											}
											className={
												"cursor-pointer bold-400 font-13 grey-1 p-2 pl-4 pr-4 " +
												(!sendToCoworkerView &&
													"is-active")
											}
										>
											Connect it myself
										</div>
										<div
											onClick={() =>
												setSendToCoworkerView(true)
											}
											className={
												"cursor-pointer bold-400 font-13 grey-1 p-2 pl-4 pr-4 " +
												(sendToCoworkerView &&
													"is-active")
											}
										>
											Send to a Co-worker
										</div>
									</div>
								)}
								{sendToCoworkerView ? (
									<IntegrationRequestCoworker
										scopes={props.scopes}
										addScopesToOrgID={
											props.addScopesToOrgID
										}
										onRequestSent={(data) => {
											setRequestSentData(data);
											setConnectionStatus(
												STATUS.REQUEST_SENT
											);
											props.onRequestSent &&
												props.onRequestSent(data);
										}}
										onConnectionSuccessfull={
											props.onConnectionSuccessfull
										}
										integration={props.integration}
									/>
								) : (
									<IntegrationSelfConnect
										scopeDetails={props.scopeDetails}
										addScopesToOrgID={
											props.addScopesToOrgID
										}
										scopes={props.scopes}
										onboarding={props.onboarding}
										blockNavigation={props.blockNavigation}
										adminSettings={() => {
											if (props.adminSettings)
												props.adminSettings();
										}}
										adminView={props.adminView}
										adminData={props.adminData}
										onCancel={(e) => {
											setConnectionStatus(STATUS.DEFAULT);
										}}
										onConnecting={(e) => {
											setConnectionStatus(
												STATUS.CONNECTING
											);
										}}
										onError={(e) => {
											setConnectionStatus(STATUS.RETRY);
											setErrorMessage(e);
										}}
										onSuccess={(orgIntegration) => {
											setConnectionStatus(
												STATUS.CONNECTED
											);
											setOrgIntegrationId(
												orgIntegration.orgIntegrationId
											);
											setOrgIntegrationName(
												orgIntegration.orgIntegrationName
											);
											if (props.adminView) {
												props.onSuccess &&
													props.onSuccess();
											}
										}}
										integration={props.integration}
										onClick={() => {
											setSendToCoworkerView(true);
										}}
										onConnectionSuccessfull={
											props.onConnectionSuccessfull
										}
										showNewIntegrationFormCallback={
											showNewIntegrationFormCallback
										}
									/>
								)}
							</>
						)}
						{connectionStatus === STATUS.CONNECTING && (
							<>
								<div
									className="text-center mx-auto mt-6 mb-6"
									style={{ maxWidth: "300px" }}
								>
									<h3 className="bold-600 font-18 black-1">
										Connecting..
									</h3>
									<p className="font-14 bold-400 black-1">
										A new window has been opened for you to
										authorise this connection
									</p>
								</div>
							</>
						)}
						{connectionStatus === STATUS.RETRY && (
							<>
								<div
									className="text-center mx-auto mt-6 mb-6"
									style={{ maxWidth: "450px" }}
								>
									<img
										src={exclamation}
										width={46}
										height={46}
										className="mb-3"
									/>
									<h3 className="bold-600 font-18 black-1 mb-3">
										An error occured while trying to connect
									</h3>
									<p
										className="font-14 bold-400 red red-bg border-radius-4 p-2 o-8 mx-auto"
										style={{ maxWidth: "300px" }}
									>
										{!_.isEmpty(errorMessage) ? (
											errorMessage
										) : (
											<>
												The connection failed. Please
												try again
											</>
										)}
									</p>
									<Button
										className="pl-6 pr-6 mb-4 mb-5"
										onClick={(e) => {
											setConnectionStatus(STATUS.DEFAULT);
										}}
									>
										Retry
									</Button>
								</div>
							</>
						)}
						{connectionStatus === STATUS.REQUEST_SENT && (
							<>
								<div
									className="text-center mx-auto mt-4 mb-5"
									style={{ maxWidth: "450px" }}
								>
									<p
										className="font-14 bold-400 mx-auto mb-4"
										style={{ maxWidth: "375px" }}
									>
										A mail has been sent to{" "}
										{requestSentData?.to_email} with the
										instructions complete this connection
									</p>
									{props.addScopesToOrgID ? (
										<div>
											<Button
												onClick={() => {
													props.onClose();
												}}
											>
												Close
											</Button>
										</div>
									) : (
										<div
											className="p-4 rounded light-blue"
											style={{
												border: "1px solid #2266e247",
											}}
										>
											<div className="pb-3 px-3 pt-0">
												Set a name for this account
											</div>
											<AccountForm
												isFailedMsg={
													failedToSaveAccountMsg
												}
												accountName={
													requestSentData.orgInviteName
												}
												isLoading={isAccountSaving}
												onSave={saveAccount}
											/>
										</div>
									)}
								</div>
							</>
						)}
					</div>
					{connectionStatus === STATUS.CONNECTED && (
						<ConnectionSucces
							integrationName={props.integration.name}
							orgIntegrationId={orgIntegrationId}
							accountName={orgIntegrationName}
							onClose={() => {
								if (
									![
										"/steps",
										"/integrations/connectInvite",
									].includes(location.pathname) &&
									props.isSimilarIntegration &&
									!location.pathname.includes("workflow")
								) {
									history.push(
										`/integrations/${props.integration.id}`
									);
									dispatch(
										updateRequestForIntegrations(
											props.integration.id
										)
									);
									dispatch(
										refreshPRState(props.integration.id)
									);
									dispatch(resetIntegration());
								} else {
									props.onSuccess(
										orgIntegrationId,
										orgIntegrationName
									);
								}
							}}
						/>
					)}
				</>
			)}
		</div>
	);
}
