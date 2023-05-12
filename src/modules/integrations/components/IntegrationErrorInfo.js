import React, { useEffect, useState } from "react";
import dangerIcon from "assets/icons/delete-warning.svg";
import reconnectIcon from "assets/integrations/reconnect-instance.svg";
import redirectIcon from "assets/integrations/redirect-instance.svg";
import { Button } from "UIComponents/Button/Button";
import { useHistory } from "react-router-dom";
import { IntegrationConnectV2 } from "modules/integrations/components/IntegrationConnectV2/IntegrationConnectV2";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchIntegrationErrorStatus,
	resetInstances,
} from "modules/integrations/redux/integrations";
import _ from "underscore";
import { fetchIntegrationServiceV2 } from "../service/api";
import { V2Integration } from "../model/model";
import { TriggerIssue } from "utils/sentry";
import { capitalizeFirstLetter } from "utils/common";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export function IntegrationErrorInfo({
	classProp = "",
	type,
	title,
	description,
	errorMessage,
	instance,
	integrations,
	isSourceError,
	intId,
	integrationData,
	errorCount,
	...props
}) {
	const history = useHistory();
	const dispatch = useDispatch();
	const [showConnectModal, setShowConnectModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorObj, setErrorObj] = useState({});
	const [connectedScopes, setConnectedScopes] = useState([]);
	const [errorIntegrationsCount, setErrorIntegrationsCount] = useState(
		errorCount || 0
	);
	const [toBeConnectedScopes, setToBeConnectedScopes] = useState([]);
	const [selectedInstanceId, setSelectedInstanceId] = useState();
	const [integrationId, setIntegrationId] = useState(intId);
	const [intData, setIntData] = useState();
	const [integration, setIntegration] = useState();
	const { partner } = useContext(RoleContext);

	const integrationErrorStatus = useSelector(
		(state) => state.integrations.integrationErrorStatus
	);

	useEffect(() => {
		setIntData(integrations);
	}, [integrations]);

	useEffect(() => {
		if (integrationErrorStatus === null) {
			setErrorObj();
			dispatch(fetchIntegrationErrorStatus());
		}
	}, [integrationErrorStatus]);

	useEffect(() => {
		if (!_.isEmpty(integrationErrorStatus)) {
			let obj = {};
			if (
				(type === "connected" && !integrationErrorStatus.title) ||
				type === "detail"
			) {
				obj.title = title;
				obj.description = description;
				obj.instance = instance;
				obj.error = errorMessage;
				setErrorObj({ ...obj });
			} else {
				setErrorObj({
					...integrationErrorStatus,
					isSourcePrimary: true,
				});
			}

			if (
				!isLoading &&
				!integration &&
				(type === "overview" || type === "connected")
			) {
				if (integrationErrorStatus?.instance?.integration_id) {
					async function loadIntData() {
						try {
							setIsLoading(true);
							let data = await fetchIntegrationServiceV2(
								integrationErrorStatus?.instance?.integration_id
							);
							setIsLoading(false);
							setIntegration({ ...new V2Integration(data) });
						} catch (error) {
							TriggerIssue(
								"Error in fetching integration",
								error
							);
							setIsLoading(false);
						}
					}
					!isLoading && loadIntData();
				}
			}
		} else if (type !== "overview") {
			let obj = {};
			if (type === "detail") {
				obj.title = title;
				obj.description = description;
				obj.instance = instance;
				obj.error = errorMessage;
				setErrorObj({ ...obj });
			} else if (intData?.length) {
				let disconnectedIntegrations = intData?.filter(
					(integration) =>
						integration?.disconnected_accounts > 0 &&
						!integration?.error_accounts
				);
				let errorIntegrations = intData?.filter(
					(integration) => integration?.error_accounts > 0
				);
				setErrorIntegrationsCount(errorIntegrations.length);
				let totalCount =
					disconnectedIntegrations?.length +
					errorIntegrations?.length;
				obj.title = `${errorIntegrations.length} ${
					errorIntegrations.length === 1
						? "integration has error. Reconnect it Immediately."
						: "integrations have errors. Reconnect them Immediately."
				}`;
				obj.description = `Data sync with ${partner?.name} has been affected. The data you see on ${partner?.name} could be outdated due to this.`;
				totalCount && setErrorObj({ ...obj });
			}
		}
	}, [integrationErrorStatus, intData]);

	function handleReconnect(
		scopes,
		instanceId,
		integrationId,
		isToBeConnected,
		connectedScopes = [],
		reconnecting = false
	) {
		if (reconnecting) {
			Array.isArray(scopes) &&
				scopes.map((scope) => {
					return (scope.is_not_editable = true);
				});
		}
		if (isToBeConnected) {
			setToBeConnectedScopes(scopes);
			setConnectedScopes([...connectedScopes]);
		} else {
			setConnectedScopes(scopes);
			setToBeConnectedScopes([]);
		}
		setSelectedInstanceId(instanceId);
		setIntegrationId(integrationId);
		setShowConnectModal(true);
	}

	const IntegrationCta = ({ customClass = "" }) => {
		return (
			<>
				{errorObj.instance?._id && (
					<div className="flex">
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip className="integration-tooltip">
									View Instance
								</Tooltip>
							}
						>
							<div
								onClick={() => {
									history.push(
										`/integrations/${
											integrationId ||
											errorObj.instance.integration_id
										}/instance?instanceId=${
											errorObj.instance.org_integration_id
										}#instances`
									);
								}}
								className="cursor-pointer"
							>
								<img alt="redirect icon" src={redirectIcon} />
							</div>
						</OverlayTrigger>
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip className="integration-tooltip">
									{"Reconnect now"}
								</Tooltip>
							}
						>
							<div
								onClick={() => {
									handleReconnect(
										errorObj.instance?.scopes_data,
										errorObj.instance?._id,
										errorObj.instance?.integration_id,
										true,
										undefined,
										true
									);
								}}
								className="ml-1 cursor-pointer"
							>
								<img
									alt="reconnect instance"
									src={reconnectIcon}
								/>
							</div>
						</OverlayTrigger>
					</div>
				)}
				{!isSourceError && !errorObj.instance?._id && (
					<div>
						<Button
							type="link"
							style={{
								backgroundColor: "#FF6767",
								color: "white",
							}}
							className={`btn btn-link btn-sm text-decoration-none ${customClass}`}
							onClick={() => {
								type === "overview" ||
								((type === "connected" || type === "detail") &&
									errorObj.instance?._id)
									? handleReconnect(
											errorObj.instance?.scopes_data,
											errorObj.instance?._id,
											errorObj.instance?.integration_id,
											true,
											undefined,
											true
									  )
									: type === "connected"
									? history.push(`/integrations?status=error`)
									: history.push(
											`/integrations/${
												integrationId ||
												errorObj.instance.integration_id
											}/instance#instances`
									  );
							}}
						>
							{type === "overview" ||
							((type === "connected" || type === "detail") &&
								errorObj.instance?._id) ? (
								<div></div>
							) : type === "connected" ? (
								"Show Errored" // Keeping this for now. Might Change later.
							) : (
								"Show Errored"
							)}
						</Button>
					</div>
				)}
			</>
		);
	};

	return (
		<>
			{integrationErrorStatus &&
				!_.isEmpty(errorObj) &&
				errorObj.title &&
				errorObj.title !== "" &&
				(errorObj.instance?._id ||
					(!isSourceError &&
						!errorObj.instance?._id &&
						errorIntegrationsCount > 0)) && (
					<>
						<div
							style={{
								backgroundColor: "rgba(255, 103, 103, 0.1)",
								border: " 1px solid #FF6767",
								borderRadius: "4px",
								marginLeft: "40px",
								marginRight: "40px",
							}}
							className={`${classProp} px-2 py-3 mt-3`}
						>
							<div className="flex justify-content-between px-2 py-1">
								<div
									style={{
										alignItems: "center",
									}}
									className="flex"
								>
									<div>
										<img width="30px" src={dangerIcon} />{" "}
									</div>
									<div>
										<div
											style={{ color: "#FF6767" }}
											className="ml-3 font-14 bold-700 "
										>
											{capitalizeFirstLetter(
												errorObj.title
											)}
										</div>
										<div className="font-13 grey-1 ml-3 mt-1">
											{errorObj.description !== ""
												? capitalizeFirstLetter(
														errorObj.description
												  )
												: `Data sync with ${partner?.name} has been affected. The data you see on ${partner?.name} could be outdated due to this. `}
										</div>
									</div>
								</div>
								{<IntegrationCta />}
							</div>
							{errorObj.error && errorObj.error !== "" && (
								<>
									<hr
										style={{
											borderTop:
												"1px solid rgb(255, 103, 103,0.2)",
										}}
										className="my-1 ml-3"
									/>
									<div
										style={{ color: "#FF6767" }}
										className="ml-3 font-12"
									>
										{capitalizeFirstLetter(errorObj.error)}
									</div>
								</>
							)}
							{/* {(isSourceError || errorObj.isSourcePrimary) && (
								<>
									<div
										style={{ color: "#FF6767" }}
										className="ml-3 font-12"
									>
										{capitalizeFirstLetter(errorObj.error)}
									</div>
									<hr
										style={{
											borderTop:
												"1px solid rgb(255, 103, 103,0.2)",
										}}
										className="my-1 ml-3"
									/>
									<div className="flex px-2 py-2">
										<IntegrationCta customClass="py-2 px-4" />
										<div className="ml-3">
											<Button
												type="link"
												style={{
													color: "#FF6767",
												}}
												className="btn btn-link btn-sm text-decoration-none px-3 py-2 font-15"
												onClick={() => {
													history.push(
														`/integrations/${
															integrationId ||
															errorObj.instance
																.integration_id
														}/instance?instanceId=${
															errorObj.instance
																.org_integration_id
														}#instances`
													);
												}}
											>
												View Instance
											</Button>
										</div>
									</div>
								</>
							)} */}
						</div>
						{showConnectModal ? (
							<IntegrationConnectV2
								integration={integration || integrationData}
								onHide={() => {
									setShowConnectModal(false);
									props.setDropdownOpen &&
										props.setDropdownOpen(false);
									props.setShowConnectedAccounts &&
										props.setShowConnectedAccounts(false);
								}}
								showModal={showConnectModal}
								connectedScopes={connectedScopes}
								toBeConnectedScopes={toBeConnectedScopes}
								orgIntegrationId={selectedInstanceId}
								handleRefresh={() => {
									dispatch(resetInstances());
								}}
								integrationId={integrationId}
							/>
						) : null}
					</>
				)}
		</>
	);
}
