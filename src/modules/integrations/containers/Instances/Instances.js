import React, { useContext, useEffect, useState } from "react";
import { NavTabs } from "../../../../UIComponents/NavTabs/NavTabs";
import { Button } from "../../../../UIComponents/Button/Button";
import HeaderTitleBC from "../../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import InstanceCard from "../../components/InstanceCard/InstanceCard";
import { InstanceCardLoader } from "../../components/InstanceCard/InstanceCardLoader";
import { InstancesHeaderLoader } from "../../components/InstancesHeaderLoader/InstancesHeaderLoader";
import "./instances.css";
import { useHistory } from "react-router-dom";
import IntegrationHowTo from "modules/integrations/components/IntegrationHowTo";
import { IntegrationConnectV2 } from "modules/integrations/components/IntegrationConnectV2/IntegrationConnectV2";
import { UserMapping } from "components/Integrations/UserMapping/UserMapping";
import _ from "underscore";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchIntegrationInstances,
	resetInstances,
	resetIntegration,
} from "modules/integrations/redux/integrations";
import IntegrationConfirmationModal from "../SingleIntegration/IntegrationConfirmationModal";
import RoleContext from "services/roleContext/roleContext";
import { PARTNER } from "modules/shared/constants/app.constants";

export function Instances(props) {
	const integration = useSelector(
		(state) => state.integrations.integrationInstances
	);
	const [integrationName, setIntegrationName] = useState("");
	const [integrationLogo, setIntegrationLogo] = useState("");
	const integrationId = window.location.pathname.split("/")[2]; // remove post to component integration
	const history = useHistory();
	let [isLoading, setIsLoading] = useState(true);
	const [showConnectModal, setShowConnectModal] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const { partner } = useContext(RoleContext);

	const hasConnectedOrgIntegrations = integration
		? _.where(integration?.instances, {
				status: "connected",
		  })?.length > 0
		: false;
	const showUserMappingTab = integration?.isUserMappingEnabled;
	const [connectedScopes, setConnectedScopes] = useState([]);
	const [toBeConnectedScopes, setToBeConnectedScopes] = useState([]);
	const [isAllScopes, setIsAllScopes] = useState(false);
	const [selectedInstanceId, setSelectedInstanceId] = useState();
	const orgAvailableForPoc = useSelector(
		(state) => state.userInfo.org_available_for_poc
	);
	let dispatch = useDispatch();

	useEffect(() => {
		integration != undefined && setIsLoading(false);
		integration === null && setIsLoading(true);

		if (
			integration != undefined &&
			integration &&
			!integration?.instances.length &&
			isLoading
		) {
			dispatch(resetIntegration());
			dispatch(resetInstances());
			history.push("/integrations");
		}
		integration === null &&
			dispatch(fetchIntegrationInstances(integrationId));
		if (integration) {
			setIntegrationName(integration.name);
			setIntegrationLogo(integration.logo);
		}
		// setShowConnectModal(false);
	}, [integration]);

	useEffect(() => {
		setIsLoading(true);
		dispatch(resetInstances());
		setIntegrationName();
		setIntegrationLogo();
	}, [integrationId]);

	function handleReconnect(
		scopes,
		instanceId,
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
		setShowConnectModal(true);
	}
	let PAGES = [
		{
			name: "Instances",
			url: "#instances",
			component: (
				<div className="d-flex flex-fill flex-wrap">
					{!isLoading
						? integration?.instances?.map((instance, index) => (
								<InstanceCard
									key={index}
									instance={instance}
									handlerMapUser={(e) => {
										history.push(
											`/integrations/${integration.id}/instance#usermapping`
										);
									}}
									handleReconnect={handleReconnect}
									handleRefresh={(e) => {
										dispatch(resetInstances());
										setIsLoading(true);
									}}
									handlerScope={(e) => {}}
									handlerSettings={(e) => {}}
									handlerTestConnection={(e) => {}}
									integration={integration}
									setShowConnectModal={setShowConnectModal}
								/>
						  ))
						: instaceLoader.map((el, index) => (
								<InstanceCardLoader key={index} />
						  ))}
				</div>
			),
		},
		{
			name: "Help",
			url: "#help",
			component: <IntegrationHowTo intId={integrationId} />,
		},
		showUserMappingTab
			? {
					name: "User Mapping",
					url: "#usermapping",
					component:
						hasConnectedOrgIntegrations && showUserMappingTab ? (
							<UserMapping integrationId={integrationId} />
						) : null,
			  }
			: null,
	];

	if (partner?.name !== PARTNER.ZLURI.name) {
		PAGES = PAGES.filter((p) => p && p.url !== "#help");
	}
	return (
		<div className="z__page z__instances">
			<HeaderTitleBC
				title="Integrations"
				go_back_url="/integrations"
				inner_screen={true}
				entity_name={integrationName}
				entity_logo={integrationLogo}
			/>
			<div className="z_page_container">
				<div
					className="d-flex justify-content-between mx-5 my-31"
					style={{ height: "60px" }}
				>
					{!isLoading ? (
						<div
							style={{ width: "70%" }}
							className="d-flex align-items-center"
						>
							<img
								src={integration?.logo}
								alt={integration?.name}
								style={{ height: "60px", width: "60px" }}
							/>
							<div className="d-flex flex-column ml-14 common-font-style">
								<div className="instance-title font-color-black">
									{integration?.name}
								</div>
								<div
									style={{
										overflowY: "auto",
										height: "60px",
									}}
									className="common-font-style instance__font14 font-color-gray-2"
								>
									{integration?.shortDescription}
								</div>
							</div>
						</div>
					) : (
						<InstancesHeaderLoader />
					)}
					<div
						className="d-flex align-items-center"
						style={{ maxHeight: "34px" }}
					>
						<Button
							type="link"
							className="btn btn-link btn-sm text-decoration-none"
							onClick={() => {
								integration?.id &&
									history.push(
										`/integrations/catalog/detail/${integration?.id}`
									);
							}}
						>
							View in Catalog
						</Button>
						{(orgAvailableForPoc &&
							integration?.available_to_connect &&
							integration?.available_for_poc) ||
							(!orgAvailableForPoc && (
								<Button
									className="ml-3 d-flex"
									onClick={() => {
										if (hasConnectedOrgIntegrations) {
											setShowConfirmationModal(true);
										} else {
											setShowConnectModal(true);
											setConnectedScopes([]);
											setToBeConnectedScopes([]);
											setSelectedInstanceId();
										}
									}}
								>
									Add Instance
								</Button>
							))}
					</div>
				</div>
				<div className="pb-4 pt-1 px-5">
					<NavTabs updateTitle={true} tabs={PAGES} />
				</div>
				{showConnectModal && integration ? (
					<IntegrationConnectV2
						integration={integration}
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
					/>
				) : null}
				{showConfirmationModal ? (
					<IntegrationConfirmationModal
						showConfirmationModal={showConfirmationModal}
						onHide={() => {
							setShowConfirmationModal(false);
						}}
						instancesCount={
							_.where(integration?.instances, {
								status: "connected",
							})?.length
						}
						integrationName={integrationName}
						setShowConnectModal={() => {
							setShowConnectModal(true);
							setShowConfirmationModal(false);
							setToBeConnectedScopes([]);
						}}
					/>
				) : null}
			</div>
		</div>
	);
}

let instaceLoader = [1, 2, 3, 4];
