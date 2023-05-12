import React, { useState } from "react";
import IntegrationConnectForm from "modules/integrations/containers/IntegrationConnectFormModal/IntegrationConnectForm";
import { useHistory } from "react-router-dom";

export function ConnectionSettings({
	onConnect,
	buttonName = "Connect",
	setShowConnectModal,
	setShowHowToSidebar,
	sendToCoworkerView,
	integration,
	orgIntegrationId,
	adminData,
	adminView,
	...props
}) {
	let history = useHistory();

	return (
		<div
			className="mb-3 d-flex flex-column ml-auto mr-auto"
			style={{ width: "80%" }}
		>
			<>
				{props.showNewIntegrationForm && (
					<IntegrationConnectForm
						scopes={props.scopes}
						integration={integration}
						onConnectionSuccessfull={() =>
							props.onConnectionSuccessfull &&
							props.onConnectionSuccessfull()
						}
						onError={(e) => props.onError(e)}
						onConnecting={(e) => props.onConnecting(e)}
						onSuccess={(e) => props.onSuccess(e)}
						setShowConnectModal={setShowConnectModal}
						onClose={() => {
							if (
								![
									"/steps",
									"/integrations/connectInvite",
								].includes(window.location.pathname) &&
								props.isSimilarIntegration &&
								!window.location.pathname.includes("workflow")
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
						setShowHowToSidebar={setShowHowToSidebar}
						onCancel={(e) => props.onCancel(e)}
						orgIntegrationId={orgIntegrationId}
						adminData={adminData}
						adminView={adminView}
					/>
				)}
				<div className="privilige-warning d-flex justify-content-center font-10 min-width-409 align-items-center mt-3">
					<span className="color-gray-2">
						You need{" "}
						<span className="font-weight-bold">Admin access</span>{" "}
						to connect with {integration?.name}.
					</span>
				</div>
				<div className="d-flex justify-content-center privacy-policy font-10 min-width-409 color-gray-2 mt-2">
					<a
						target="_blank"
						rel="noreferrer"
						href="https://www.zluri.com/privacy-policy/"
					>
						Privacy policy{" "}
					</a>
					|{" "}
					<a
						target="_blank"
						rel="noreferrer"
						href="https://www.zluri.com/zluri-app-terms-of-service"
					>
						Terms of service
					</a>
				</div>
			</>
		</div>
	);
}
