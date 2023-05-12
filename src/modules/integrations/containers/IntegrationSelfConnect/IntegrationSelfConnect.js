import React, { useEffect, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { PopupWindowPostRequest } from "../../../../utils/PopupWindowPostRequest";
import { getValueFromLocalStorage } from "../../../../utils/localStorage";
import { IntegrationPermisionCard } from "../../components/IntegrationPermisionCard/IntegrationPermisionCard";
import { useHistory, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { integrationConnected } from "../../redux/integrations";
import { TriggerIssue } from "../../../../utils/sentry";
import { getAppKey } from "../../../../utils/getAppKey";
import { INTEGRATION_TYPE } from "../../constants/constant";
import { fetchIntegrationService } from "../../service/api";
import { Integration } from "../../model/model";
import { Spinner } from "react-bootstrap";

export function IntegrationSelfConnect(props) {
	const userDetails = getValueFromLocalStorage("userInfo");
	let client = null;
	const history = useHistory();
	const location = useLocation();
	const dispatch = useDispatch();
	const controller = new AbortController();
	const [fetchingIntegration, setFetchingIntegration] = useState(false);

	const initiateIntegrations = (integration, data) => {
		if (props.scopes) {
			Object.assign(data, { skipSync: true, newScopes: props.scopes });
		}
		if (props.addScopesToOrgID) {
			Object.assign(data, {
				skipSync: true,
				newScopes: props.scopes,
				orgIntegrationId: props.addScopesToOrgID,
			});
		}
		let isFailed = false;
		let isConnected = false;

		client = PopupWindowPostRequest(
			integration.connectURL,
			"IntegrationsApplication",
			data
		);

		const popupTick = setInterval(function () {
			if (client && client.closed) {
				clearInterval(popupTick);
				controller.abort();
				if (!isFailed && !isConnected) {
					props.onCancel && props.onCancel();
				}
			}
		}, 500);

		window.addEventListener(
			"message",
			(e) => {
				try {
					if (e?.origin === getAppKey("REACT_APP_INTEGRATION_URL")) {
						controller.abort();
						if (e?.data?.status === "error") {
							props.onError(e?.data?.message);
							TriggerIssue(
								`On Connecting Integration ${integration.name}`,
								e
							);
							isFailed = true;
						}
						if (
							e?.data?.status === "success" &&
							e?.data?.message === "connected"
						) {
							isConnected = true;
							props.onConnectionSuccessfull &&
								props.onConnectionSuccessfull();
							props.onSuccess &&
								props.onSuccess({
									orgIntegrationId: e.data.orgIntegrationId,
									orgIntegrationName: e.data.name,
								});
						}
					}
				} catch (e) {
					isFailed = true;
					TriggerIssue(
						`On Connecting Integration ${integration.name}`,
						e
					);
				}
			},
			{ signal: controller.signal }
		);
		props.onConnecting();
	};

	const integrateApplication = (e) => {
		setFetchingIntegration(true);
		let integration = props.integration;
		var isIntegrationConnectionTypeForm = false;
		let data = {};
		try {
			if (props.adminView) {
				data = {
					orgId: props.adminData.org_id,
					userId: props.adminData.user_id,
					integrationId: props.integration.id,
					inviteCode: props.adminData.code,
				};
				if (
					integration?.form &&
					Array.isArray(integration?.form) &&
					integration?.form?.length > 0
				) {
					isIntegrationConnectionTypeForm = true;
					props.adminSettings && props.adminSettings();
				} else {
					initiateIntegrations(integration, data);
				}
			} else {
				data = {
					orgId: userDetails.org_id,
					userId: userDetails.user_id,
					integrationId: props.integration.id,
					Authorization: `Bearer ${getValueFromLocalStorage(
						"token"
					)}`,
				};
				fetchIntegrationService(props.integration.id).then((res) => {
					if (!res?.error && res?.integration_id) {
						integration = new Integration(res);
						if (
							res?.integration_form_fields &&
							Array.isArray(res?.integration_form_fields) &&
							res?.integration_form_fields?.length > 0
						) {
							isIntegrationConnectionTypeForm = true;
							props.showNewIntegrationFormCallback &&
								props.showNewIntegrationFormCallback(
									new Integration(res)
								);
						} else if (!res?.error && res?.integration_id) {
							initiateIntegrations(integration, data);
						}
					}
					setFetchingIntegration(false);
				});
			}
		} catch (error) {
			setFetchingIntegration(false);
			TriggerIssue("Error when fetching integration details", error);
		}
	};

	return (
		<div className="pl-6 pr-6">
			<p
				className={`${
					props.adminView
						? "font-12 bold-400 grey mt-5"
						: "font-12 bold-400 grey"
				}`}
			>
				You need Admin access to connect with
				{" " + props.integration.name}.{" "}
				{!props.adminView && (
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							props.onClick();
						}}
					>
						Don’t have admin privilages?
					</a>
				)}
			</p>
			{props.integration?.permissions &&
				props.integration?.permissions?.length && (
					<IntegrationPermisionCard
						className="mt-4"
						permissions={props.integration?.permissions}
						scopeDetails={props.scopeDetails}
					/>
				)}
			<div className="mt-4 text-center mb-4">
				{!props.adminView && (
					<p className="font-11 grey-1">
						Read our{" "}
						<a
							className="grey-1 text-underline"
							target="_blank"
							rel="noreferrer"
							href="https://www.zluri.com/privacy-policy/"
						>
							privacy policy{" "}
						</a>
						&{" "}
						<a
							className="grey-1 text-underline"
							target="_blank"
							rel="noreferrer"
							href="https://www.zluri.com/zluri-app-terms-of-service"
						>
							terms of service{" "}
						</a>
						for more information
					</p>
				)}
				<Button
					style={{ width: "227px" }}
					className="text-center"
					disabled={fetchingIntegration}
					onClick={() => integrateApplication()}
				>
					{fetchingIntegration && (
						<Spinner
							animation="border"
							role="status"
							variant="light"
							size="sm"
							className="mr-1"
							style={{
								borderWidth: 2,
								width: "13px",
								height: "13px",
							}}
						>
							<span className="sr-only">Loading...</span>
						</Spinner>
					)}
					Connect
				</Button>
			</div>
		</div>
	);
}
