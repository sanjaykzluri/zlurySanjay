import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropsType from "prop-types";
import { Modal, Card } from "react-bootstrap";
import { SelectScope } from "./SelectScope/SelectScope";
import {
	setReqData,
	updateScreen,
	updateStep,
} from "../../../../common/Stepper/redux";
import { unescape, urlifyImage } from "../../../../utils/common";
import { NameBadge } from "../../../../common/NameBadge";
import { CoworkerForm } from "./CoworkerForm";
import ReduxStepper from "../../../../common/Stepper/ReduxStepper";
import { Sidebar } from "./Sidebar/Sidebar";
import { ConnectionSettings } from "./ConnectionSettings/ConnectionSettings";

import zluri from "../../../../assets/zluri-logo.svg";
import closeIcon from "../../../../assets/close.svg";
import exchange from "../../../../assets/icons/exchangeArrow.svg";
import "./IntegrationConnectV2.css";
import { IntegrationComplete } from "./IntegrationCompleteState";
import { IntegrationError } from "./IntegrationErrorState";
import { IntegrationSuccesful } from "./IntegrationSuccessful";
import { getValueFromLocalStorage } from "utils/localStorage";
import { TriggerIssue } from "utils/sentry";
import { useHistory, useLocation } from "react-router-dom";
import { IntegrationConnecting } from "./IntegrationConnecting";
import IntegrationHowToModal from "./Sidebar/IntegrationHowToModal";
import {
	fetchIntegrationDetails,
	refreshPRState,
	resetIntegration,
} from "modules/integrations/redux/integrations";
import ConnectedScopesModal from "./Sidebar/ConnectedScopesModal";
import { getIntegrationScopesAndPermissions } from "modules/integrations/service/api";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
import { trackActionSegment } from "modules/shared/utils/segment";
export const STATUS = {
	DEFAULT: "DEFAULT",
	CONNECTING: "CONNECTING",
	RETRY: "RETRY",
	REQUEST_SENT: "REQUEST_SENT",
	CONNECTED: "CONNECTED",
};
export function IntegrationConnectV2({
	children,
	showModal = true,
	onHide,
	integration,
	IntergationId,
	hideCoworker,
	renderModal = true,
	hideCloseButton = false,
	orgIntegrationId: instanceId,
	isEditable = true,
	connectedScopes = [],
	toBeConnectedScopes = [],
	setIntegrationSuccess,
	editable,
	handleRefresh,
	adminData,
	adminView,
	integrationId,
	...props
}) {
	const [sendToCoworkerView, setSendToCoworkerView] = useState(false);
	const [selectedScopeId, setsSelectedScopeId] = useState("");
	let [selectedScopes, setSelectedScopes] = useState();
	const [scopes, setScopes] = useState([]);
	const [fixedScopes, setFixedScopes] = useState(toBeConnectedScopes);
	const [defaultScopes, setDefaultScopes] = useState([]);
	const [otherScopes, setOtherScopes] = useState([]);
	const [allScopes, setAllScopes] = useState([]);
	const [showComplete, setShowComplete] = useState(false);
	const [showError, setShowError] = useState(false);
	const [showSuccesfulScreen, setShowSuccesfulScreen] = useState(false);
	const [showIntergationSidebar, setShowIntergationSidebar] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState(STATUS.DEFAULT);
	const [requestSentData, setRequestSentData] = useState();
	const [isAccountSaving, setIsAccountSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(
		toBeConnectedScopes?.length > 0 ? false : true
	);
	const [failedToSaveAccountMsg, setFailedToSaveAccountMsg] = useState();
	const [showNewIntegrationForm, setShowNewIntegrationForm] = useState(false);
	const [showHowToSidebar, setShowHowToSidebar] = useState(false);
	const [showConnectedScopesSidebar, setShowConnectedScopesSidebar] =
		useState(false);
	const dispatch = useDispatch();

	const [orgIntegrationId, setOrgIntegrationId] = useState(instanceId);
	const [orgIntegrationName, setOrgIntegrationName] = useState();
	const [orgIntegrationDescription, setOrgIntegrationDescription] =
		useState();
	const location = useLocation();
	const history = useHistory();
	const [integrationData, setIntegration] = useState();
	// const [integration, setIntegration] = useState([]);
	const [errorMessage, setErrorMessage] = useState("");

	const integrationStore = useSelector(
		(state) => state.integrations.integration
	);

	const [integrationDetails, setIntegrationDetails] = useState();

	const showNewIntegrationFormCallback = (integration) => {
		setIntegration(integration);
		setShowNewIntegrationForm(true);
	};
	const { partner } = useContext(RoleContext);

	useEffect(() => {
		if (connectionStatus !== STATUS.CONNECTED)
			integration && setIntegrationDetails(integration);
	}, [integration]);

	useEffect(() => {
		async function loadScopesAndPermissions() {
			try {
				let data = await getIntegrationScopesAndPermissions(
					integration?.id
				);
				setIsLoading(false);
				let all = [...data?.all_scopes];
				connectedScopes &&
					connectedScopes.forEach((val) => {
						if (!val.is_default) {
							all = all.filter((scope) => {
								return scope._id !== val._id;
							});
						}
					});
				fixedScopes &&
					fixedScopes.forEach((val) => {
						if (!val.is_default) {
							all = all.filter((scope) => {
								return scope._id !== val._id;
							});
						}
					});
				setAllScopes(all);
				let defaultSco = [...data?.default_scopes];
				connectedScopes.forEach((val) => {
					defaultSco = defaultSco.filter((scope) => {
						return scope._id !== val._id;
					});
				});
				setScopes(data);
			} catch (error) {
				setIsLoading(false);
				TriggerIssue("Error in fetching scopes for integration", error);
			}
		}
		!sendToCoworkerView && isEditable && loadScopesAndPermissions();
	}, [sendToCoworkerView]);

	useEffect(() => {
		dispatch(
			setReqData({
				defaultPermissions:
					Array.isArray(fixedScopes) && fixedScopes.length > 0
						? fixedScopes
						: scopes?.default_scopes
						? [...scopes?.default_scopes]
						: [],
				selectedScopes: [],
				otherScopes: allScopes,
				allScopes: allScopes,
				features: scopes?.features_array
					? [...scopes?.features_array]
					: [],
			})
		);
	}, [scopes, connectionStatus]);

	const { data, screen } = useSelector((state) => state.stepper);
	const isFormBased =
		integration?.form &&
		Array.isArray(integration?.form) &&
		integration?.form?.length > 0;

	let steps = [
		{
			component: (
				<SelectScope
					isEditable={isEditable}
					onViewAll={(scopeId) => {
						setsSelectedScopeId(scopeId);
						setShowIntergationSidebar(true);
					}}
					integration={integration}
					onConnecting={(e) => {
						setConnectionStatus(STATUS.CONNECTING);
					}}
					onError={(e) => {
						setConnectionStatus(STATUS.RETRY);
						setErrorMessage(e);
						trackActionSegment(
							"Integration connection saved",
							{ integrationData: integration },
							true
						);
					}}
					onSuccess={(orgIntegration) => {
						setConnectionStatus(STATUS.CONNECTED);
						setOrgIntegrationId(orgIntegration.orgIntegrationId);
						setOrgIntegrationName(
							orgIntegration.orgIntegrationName
						);
						props.callbackOnboardingPageOnSuccess &&
							props.callbackOnboardingPageOnSuccess(
								orgIntegration.orgIntegrationId
							);
						// handleRefresh();
						trackActionSegment(
							"Integration connection saved",
							{ integrationData: orgIntegration },
							true
						);
					}}
					onCancel={(e) => {
						setConnectionStatus(STATUS.DEFAULT);
					}}
					showNewIntegrationFormCallback={
						showNewIntegrationFormCallback
					}
					isFormBased={isFormBased}
					setShowHowToSidebar={setShowHowToSidebar}
					setSendToCoworkerView={setSendToCoworkerView}
					selectedScopes={selectedScopes}
					setSelectedScopes={setSelectedScopes}
					hideCoworker={hideCoworker}
					orgIntegrationId={orgIntegrationId}
					isLoading={isLoading}
					setShowConnectedScopesSidebar={
						setShowConnectedScopesSidebar
					}
					showConnectedScopes={connectedScopes?.length > 0}
					adminData={adminData}
					adminView={adminView}
				/>
			),
			title: "Select Scopes",
		},
		{
			component: sendToCoworkerView ? (
				<CoworkerForm
					showOnlyForm={true}
					onRequestSent={(data) => {
						setRequestSentData(data);
						setConnectionStatus(STATUS.REQUEST_SENT);
						props.onRequestSent && props.onRequestSent(data);
					}}
					onConnectionSuccessfull={() => {
						setIntegrationSuccess && setIntegrationSuccess(true);
						setSendToCoworkerView(false);
						trackActionSegment(
							"Integration connection saved",
							{ integrationData: integration },
							true
						);
					}}
					integration={integration}
					selectedScopes={selectedScopes}
					setSelectedScopes={setSelectedScopes}
					fixedScopes={fixedScopes}
					orgIntegrationId={orgIntegrationId}
				/>
			) : (
				<ConnectionSettings
					onConnect={() => {
						// setShowIntergationSidebar(true);
					}}
					integration={integrationData}
					scopes={data?.defaultPermissions}
					onConnecting={(e) => {
						setConnectionStatus(STATUS.CONNECTING);
					}}
					onError={(e) => {
						setConnectionStatus(STATUS.RETRY);
						setErrorMessage(e);
						trackActionSegment(
							"Integration connection error",
							{ integrationData: integrationData },
							true
						);
					}}
					showNewIntegrationFormCallback={
						showNewIntegrationFormCallback
					}
					showNewIntegrationForm={showNewIntegrationForm}
					onSuccess={(orgIntegration) => {
						setConnectionStatus(STATUS.CONNECTED);
						setOrgIntegrationId(orgIntegration.orgIntegrationId);
						setOrgIntegrationName(
							orgIntegration.orgIntegrationName
						);
						setOrgIntegrationDescription(
							orgIntegration.orgIntegrationDescription
						);
						props.callbackOnboardingPageOnSuccess &&
							props.callbackOnboardingPageOnSuccess(
								orgIntegration.orgIntegrationId
							);
						trackActionSegment(
							"Integration connection saved",
							{ integrationData: orgIntegration },
							true
						);
						// if (props.adminView) {
						// 	props.onSuccess && props.onSuccess();
						// }
					}}
					onCancel={(e) => {
						setConnectionStatus(STATUS.DEFAULT);
					}}
					setShowHowToSidebar={setShowHowToSidebar}
					sendToCoworkerView={sendToCoworkerView}
					orgIntegrationId={orgIntegrationId}
					adminData={adminData}
					adminView={adminView}
				/>
			),
			title: sendToCoworkerView
				? "Send connection request to a co-worker"
				: "Connection Settings",
		},
	];
	const SCREENS = {
		STEPPER: <ReduxStepper steps={steps} />,
		OVERVIEW: <div></div>,
	};

	const mainComponent = (
		<>
			{showIntergationSidebar ? (
				<Sidebar
					showIntegrationSidebar={showIntergationSidebar}
					setShowIntegrationSidebar={setShowIntergationSidebar}
					activeScopeId={selectedScopeId}
					features={
						scopes?.features_array
							? [...scopes?.features_array]
							: []
					}
					integration={integration}
					onAddScope={(scopesToBeAdded) => {
						// remove it from list
						let {
							defaultPermissions,
							selectedScopes,
							otherScopes,
							allScopes,
						} = data;

						let addScopes = [...scopesToBeAdded];
						defaultPermissions.forEach((val) => {
							addScopes = addScopes.filter((scope) => {
								return scope._id !== val._id;
							});
						});

						const newScopes = [...defaultPermissions, ...addScopes];

						let newAllScopes = [...allScopes];
						scopesToBeAdded.forEach((val) => {
							newAllScopes = newAllScopes.filter((scope) => {
								return scope._id !== val._id;
							});
						});

						dispatch(
							setReqData({
								...data,
								defaultPermissions: newScopes,
								otherScopes: newAllScopes,
								allScopes: newAllScopes,
							})
						);
					}}
				/>
			) : null}

			{showHowToSidebar ? (
				<IntegrationHowToModal
					setShowHowToSidebar={setShowHowToSidebar}
					integration={integration}
				/>
			) : null}

			{showConnectedScopesSidebar ? (
				<ConnectedScopesModal
					setShowConnectedScopesSidebar={
						setShowConnectedScopesSidebar
					}
					integration={integration}
					scopesData={connectedScopes}
				/>
			) : null}

			<div className="d-flex justify-content-center connect_new_integration_modal flex-column">
				<div className="z_connect_new_integration_header text-center mt-4">
					<div className="ml-4 mr-4 mb-2 d-flex justify-content-center">
						<img width={40} height={40} src={zluri}></img>
						{!hideCloseButton &&
							connectionStatus !== STATUS.CONNECTED && (
								<button
									onClick={() => {
										onHide(false);
										if (
											connectionStatus ===
											STATUS.REQUEST_SENT
										) {
											dispatch(resetIntegration());
											dispatch(refreshPRState());
										}
									}}
									className="btn btn-link btn-sm d-flex justify-content-center align-items-center position-absolute"
									style={{
										right: "3.12%",
										top: "3.12%",
										bottom: "3.13%",
										height: "30px",
										width: "30px",
									}}
								>
									<img src={closeIcon} alt="close" />
								</button>
							)}
						<img className="ml-2 mr-2" src={exchange}></img>
						{integrationDetails?.logo ? (
							<div
								className="img-circle background-contain background-no-repeat background-position-center"
								style={{
									backgroundImage: `url(${urlifyImage(
										unescape(integrationDetails?.logo)
									)})`,
									width: "40px",
									height: "40px",
								}}
							></div>
						) : (
							<NameBadge
								name={integrationDetails?.name}
								width={40}
								height={40}
								className="img-circle"
							/>
						)}
					</div>
					<h3 className="font-18 bold-600 black-1">
						Connect {partner?.name} with {integrationDetails?.name}
					</h3>
					{connectionStatus === STATUS.DEFAULT && <></>}
				</div>
				{connectionStatus === STATUS.CONNECTED ? (
					<IntegrationSuccesful
						orgIntegrationName={orgIntegrationName}
						orgIntegrationId={orgIntegrationId}
						orgIntegrationDescription={orgIntegrationDescription}
						onHide={onHide}
						features={
							scopes?.features_array
								? [...scopes?.features_array]
								: []
						}
						defaultScopes={
							data?.defaultPermissions || scopes?.default_scopes
						}
						setIntegrationSuccess={setIntegrationSuccess}
						callbackOnboardingPageOnSuccess={() =>
							props.callbackOnboardingPageOnSuccess &&
							props.callbackOnboardingPageOnSuccess(
								orgIntegrationId
							)
						}
						adminData={adminData}
						adminView={adminView}
					/>
				) : connectionStatus === STATUS.RETRY ? (
					<IntegrationError
						errorMessage={errorMessage}
						onHide={onHide}
						onRetry={() => {
							setConnectionStatus(STATUS.DEFAULT);
						}}
					/>
				) : connectionStatus === STATUS.CONNECTING ? (
					<IntegrationConnecting />
				) : connectionStatus === STATUS.REQUEST_SENT ? (
					<IntegrationComplete
						onHide={(bool) => {
							onHide(bool);
							dispatch(resetIntegration());
							dispatch(refreshPRState());
						}}
						requestSentData={requestSentData}
					/>
				) : (
					<div className="screen_wrapper new-integration-connect-stepper">
						{SCREENS[screen]}
					</div>
				)}
			</div>
		</>
	);

	return (
		<React.Fragment>
			{renderModal ? (
				<Modal
					className="connect_new_integration_modal"
					show={showModal}
					onHide={() => {
						onHide(false);
					}}
					style={{
						maxWidth: "100% !importent",
						maxHeight: "100% !importent",
					}}
				>
					{mainComponent}
				</Modal>
			) : (
				<>{mainComponent}</>
			)}
		</React.Fragment>
	);
}

IntegrationConnectV2.propsType = {
	showModal: PropsType.bool,
	onHide: PropsType.func,
};
