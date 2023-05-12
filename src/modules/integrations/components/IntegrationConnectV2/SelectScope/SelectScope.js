import React, { useEffect, useState } from "react";
import { Accordion, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setReqData, updateStep } from "../../../../../common/Stepper/redux";
import { Button } from "../../../../../UIComponents/Button/Button";
import { ScopesContainer } from "../ScopeContainer/ScopesContainer";
import { PermissionCard } from "../../PermissionCard/PermissionCard";
import { ContextAwareToggle } from "../ContextAwareToggle";
import read_icon from "../../../../../assets/read.svg";
import write_icon from "../../../../../assets/write.svg";
import delete_icon from "../../../../../assets/deleteIcon.svg";
import { OtherScope } from "../OtherScope/OtherScope";
import ContentLoader from "react-content-loader";
import _ from "underscore";
import { getValueFromLocalStorage } from "utils/localStorage";
import { TriggerIssue } from "utils/sentry";
import { Integration } from "modules/integrations/model/model";
import { fetchIntegrationService } from "modules/integrations/service/api";
import { PopupWindowPostRequest } from "utils/PopupWindowPostRequest";
import noScopesIcon from "assets/integrations/no-scopes-icon.svg";
import { capitalizeFirstLetter } from "utils/common";
import { getAppKey } from "utils/getAppKey";
import SelectScopeCard from "./SelectScopeCard";
import { disabledBetaFeature } from "modules/integrations/utils/IntegrationUtil";

export function SelectScope({
	onViewAll,
	isFormBased,
	integration,
	setSendToCoworkerView,
	selectedScopes,
	setSelectedScopes,
	setShowHowToSidebar,
	hideCoworker = false,
	isEditable,
	orgIntegrationId,
	isLoading,
	setShowConnectedScopesSidebar,
	showConnectedScopes,
	...props
}) {
	const userInfo = useSelector((state) => state.userInfo);
	const beta_features_scopes = userInfo?.beta_features_scopes || {};

	const dispatch = useDispatch();
	let client = null;
	const userDetails = getValueFromLocalStorage("userInfo");
	const { data, screen } = useSelector((state) => state.stepper);

	useEffect(() => {
		let scopes = [];

		if (data.defaultPermissions?.length) {
			data.defaultPermissions.map((scope) => {
				// if (!scope.is_default)
				scopes.push(scope.integration_scope_value);
			});
		}
		setSelectedScopes(scopes);
	}, [data]);

	const shouldRenderDefaultPermission = data?.defaultPermissions?.length > 0;
	const noScopesFound = !data?.defaultPermissions?.length;
	const controller = new AbortController();
	const [fetchingIntegration, setFetchingIntegration] = useState(false);

	const removeScopes = (scope) => {
		const { defaultPermissions, otherScopes, allScopes } = data;

		const newSelectedScopes = defaultPermissions.filter(
			(scp) => scp._id !== scope._id
		);

		let newAllScopes = allScopes.filter((val) => {
			return val._id !== scope._id;
		});
		newAllScopes.push(scope);

		dispatch(
			setReqData({
				...data,
				defaultPermissions: newSelectedScopes,
				otherScopes: otherScopes,
				allScopes: newAllScopes,
			})
		);
	};

	const integrateApplication = (e) => {
		setFetchingIntegration(true);
		var isIntegrationConnectionTypeForm = false;
		let data = {};
		try {
			if (props.adminView) {
				data = {
					orgId: props.adminData.org_id,
					userId: props.adminData.user_id,
					integrationId: integration.id,
					inviteCode: props.adminData.code,
				};
				if (
					integration?.form &&
					Array.isArray(integration?.form) &&
					integration?.form?.length > 0
				) {
					isIntegrationConnectionTypeForm = true;
					props.adminSettings && props.adminSettings();
					props.showNewIntegrationFormCallback &&
						props.showNewIntegrationFormCallback(integration);
					dispatch(updateStep(2));
					setFetchingIntegration(false);
				} else {
					initiateIntegrations(integration, data);
				}
			} else {
				data = {
					orgId: userDetails.org_id,
					userId: userDetails.user_id,
					integrationId: integration.id,
					Authorization: `Bearer ${getValueFromLocalStorage(
						"token"
					)}`,
				};

				fetchIntegrationService(integration.id).then((res) => {
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
							dispatch(updateStep(2));
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

	const initiateIntegrations = (integration, data) => {
		if (selectedScopes) {
			Object.assign(data, {
				skipSync: false,
				newScopes: selectedScopes,
			});
		}

		if (orgIntegrationId) {
			Object.assign(data, {
				skipSync: true,
				newScopes: selectedScopes,
				orgIntegrationId: orgIntegrationId,
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
			if (client?.closed) {
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

	return (
		<div>
			<div style={{ justifyContent: "space-between" }} className="flex">
				<div className="font-11 grey ml-3">Required Scopes</div>
				{showConnectedScopes && (
					<div
						style={{ color: "rgba(34, 102, 226, 1)" }}
						className="font-11 cursor-pointer ml-3"
						onClick={() =>
							setShowConnectedScopesSidebar &&
							setShowConnectedScopesSidebar(true)
						}
					>
						Connected Scopes
					</div>
				)}
			</div>
			{shouldRenderDefaultPermission ? (
				<ScopesContainer>
					{Array.isArray(data?.defaultPermissions) &&
						data?.defaultPermissions.map((scope, index) => (
							<React.Fragment key={index}>
								{scope.scope_name ? (
									<SelectScopeCard
										permission={scope}
										index={index}
										onRemove={removeScopes}
										isEditable={isEditable}
									/>
								) : (
									<Accordion key={index + 1}>
										<div className="scope-card">
											<PermissionCard
												key={index}
												permissionIcon={
													scope.scope === "Read only"
														? read_icon
														: write_icon
												}
												title={scope.title}
												toggelButton={
													scope.description ? (
														<ContextAwareToggle
															eventKey={index + 1}
														/>
													) : null
												}
											/>
										</div>
										{data?.defaultPermissions?.length -
											index !==
										1 ? (
											<hr className="m-1" />
										) : null}
										{scope.description ? (
											<Accordion.Collapse
												eventKey={index + 1}
											>
												<p className="font-12 p-2">
													{scope.description}
												</p>
											</Accordion.Collapse>
										) : null}
									</Accordion>
								)}
							</React.Fragment>
						))}
				</ScopesContainer>
			) : null}
			{(data?.features?.length > 0 && data?.other_scopes?.length > 0) ||
			data?.allScopes?.length > 0 ? (
				<div className="container ml-1 mt-3 other-scopes">
					<div className="font-10" style={{ color: "#717171" }}>
						Other Scopes
					</div>
					{data?.features.map((scope) => (
						<OtherScope
							scopeName={`Scopes for ${capitalizeFirstLetter(
								scope
							)}`}
							scopeId={scope}
							requiredScopes={data?.allScopes?.filter(
								(element) => {
									if (
										element.feature.includes(scope) &&
										!disabledBetaFeature(
											beta_features_scopes,
											integration?.id
										)?.includes(scope)
									) {
										return element;
									}
								}
							)}
							onAddScope={(scopesToBeAdded) => {
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

								const newScopes = [
									...defaultPermissions,
									...addScopes,
								];

								let newAllScopes = [...allScopes];
								scopesToBeAdded.forEach((val) => {
									newAllScopes = newAllScopes.filter(
										(scope) => {
											return scope._id !== val._id;
										}
									);
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
							onViewAll={(scopeId) => onViewAll(scopeId)}
						/>
					))}
					{data?.allScopes && (
						<OtherScope
							scopeName={`All scopes`}
							scopeId={"all"}
							requiredScopes={data?.allScopes}
							isAllScopes={true}
							onAddScope={(scope_id) => {
								const {
									defaultPermissions,
									otherScopes,
									allScopes,
								} = data;
								let scopes = allScopes;
								const newScopes = [
									...defaultPermissions,
									...scopes,
								];

								const newAllScopes = [];

								dispatch(
									setReqData({
										...data,
										defaultPermissions: newScopes,
										otherScopes: newAllScopes,
										allScopes: newAllScopes,
									})
								);
							}}
							onViewAll={(scopeId) => onViewAll(scopeId)}
						/>
					)}
				</div>
			) : null}
			{Array.isArray(data?.defaultPermissions) &&
				!isLoading &&
				!data?.defaultPermissions.length && (
					<div style={{ height: "215px" }} align="center">
						<div className="pt-6">
							<img src={noScopesIcon} />
							<div>No scopes available</div>
						</div>
					</div>
				)}
			{shouldRenderDefaultPermission && (
				<>
					<div
						className="z_admin_privilages font-12"
						style={{ color: "color: #717171" }}
						align="center"
					>
						You need Admin access to connect with
						{` ${integration?.name}`}.
					</div>
					<div
						className="z_admin_privilages font-12 pt-1 cursor-pointer"
						style={{ color: "#2266E2" }}
						align="center"
						onClick={() =>
							setShowHowToSidebar && setShowHowToSidebar(true)
						}
					>
						Need help connecting this integrations?
					</div>
				</>
			)}
			{!isLoading ? (
				<div className="d-flex justify-content-center align-items-center">
					<Button
						className="integration-button  mt-4 mr-2"
						onClick={() => {
							integrateApplication();
							setSendToCoworkerView &&
								setSendToCoworkerView(false);
						}}
						disabled={fetchingIntegration}
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
						{`${!isFormBased ? "Connect" : "Continue"}`}
					</Button>
					{!hideCoworker && (
						<Button
							className="integration-button  mt-4 ml-2"
							onClick={() => {
								dispatch(updateStep(2));
								setSendToCoworkerView &&
									setSendToCoworkerView(true);
							}}
							disabled={fetchingIntegration}
							type="reverse"
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
							{`Send to a Co-worker`}
						</Button>
					)}
				</div>
			) : (
				isLoading &&
				_.times(3, (index) => (
					<div
						className="workflowStatusCard border mt-2 ml-2 pl-4"
						key={index}
						style={{ backgroundColor: "white" }}
					>
						<div className="d-flex flex-row">
							<ContentLoader height="21">
								<rect
									width="150"
									height="18"
									rx="1"
									x="30"
									y="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
							<ContentLoader
								className="ml-auto"
								height="21"
								width="125"
							>
								<rect
									width="80"
									height="18"
									rx="2"
									x="25"
									y="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
						<ContentLoader className="mt-2" height={"100%"}>
							<rect
								width="360"
								height="14"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
						<ContentLoader className="mt-2" height={"100%"}>
							<rect
								width="100"
								height="14"
								rx="2"
								fill="#EBEBEB"
							/>
							<rect
								width="100"
								height="14"
								x="110"
								rx="2"
								fill="#EBEBEB"
							/>
							<rect
								width="100"
								height="14"
								x="220"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
					</div>
				))
			)}
		</div>
	);
}
