import React, { useContext, useEffect, useState } from "react";
import { NavTabs } from "../../../../UIComponents/NavTabs/NavTabs";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchIntegrationDetails,
	removeIntegrationDetails,
} from "../../redux/integrations";
import { useHistory, useLocation, useParams } from "react-router";
import { SingleIntegrationLoader } from "../../components/SingleIntegrationLoader/SingleIntegrationLoader";
import { UserMapping } from "../../../../components/Integrations/UserMapping/UserMapping";
import "./SingleIntegration.css";
import { AppIntegrationInformation } from "../../components/AppIntegrationInformation/AppIntegrationInformation";
import { Settings } from "../Settings/Settings";
import RoleContext from "../../../../services/roleContext/roleContext";
import _ from "underscore";
import UnauthorizedToView from "../../../../common/restrictions/UnauthorizedToView";
import { userRoles } from "../../../../constants/userRole";
import HeaderTitleBC from "../../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import ZluriLogo from "../../../../assets/zluri-integration-logo.svg";
import IntegrationOverview from "modules/integrations/components/IntegrationOverview";
import IntegrationCapabilities from "modules/integrations/components/IntegrationCapabilities";
import IntegrationHowTo from "modules/integrations/components/IntegrationHowTo";
import { Button } from "UIComponents/Button/Button";
import backIcon from "assets/back-icon.svg";
import UpgradeBannerModal from "./UpgradeBannerModal";
import { PARTNER } from "modules/shared/constants/app.constants";

export function SingleIntegration(props) {
	const { isViewer, userRole } = useContext(RoleContext);
	const [showUpgradeModal, setshowUpgradeModal] = useState(false);
	const location = useLocation();
	const history = useHistory();
	const { id } = useParams();
	const integration = useSelector((state) => state.integrations.integration);
	const { partner } = useContext(RoleContext);
	const dispatch = useDispatch();
	const hasConnectedOrgIntegrations =
		_.where(integration?.accounts, { integration_status: "connected" })
			?.length > 0;
	let PAGES = !props.onboarding
		? [
				{
					name: "App Info",
					url: "#information",
					component: integration ? (
						<AppIntegrationInformation integration={integration} />
					) : (
						<SingleIntegrationLoader />
					),
				},
				{
					name: "User Mapping",
					url: "#usermapping",
					component: hasConnectedOrgIntegrations ? (
						<UserMapping integrationId={integration.id} />
					) : null,
				},
		  ]
		: [];

	let PAGES_NEW = [
		{
			name: "Overview",
			url: "#overview",
			component: <IntegrationOverview integration={integration} />,
		},
		{
			name: "Capabilities",
			url: "#capabilities",
			component: <IntegrationCapabilities />,
		},
		{
			name: "How-to",
			url: "#how-to",
			component: <IntegrationHowTo />,
		},
	];

	useEffect(() => {
		if (!location.hash) {
			history.push(`${location.pathname}#overview`);
		}
		dispatch(fetchIntegrationDetails(id));
		return () => {
			dispatch(removeIntegrationDetails());
		};
	}, [id]);

	useEffect(() => {
		if (!location.hash) {
			if (props.onboarding) {
				history.push(`${location.pathname}#settings`);
			} else {
				history.push(`${location.pathname}#overview`);
			}
		}
		if (!integration && id) {
			dispatch(fetchIntegrationDetails(id));
		}
	}, [integration]);

	PAGES =
		integration?.form &&
		Array.isArray(integration?.form) &&
		integration?.form?.length > 0 &&
		!isViewer &&
		Array.isArray(integration?.accounts) &&
		integration?.accounts?.length > 0
			? [
					...PAGES,
					...[
						{
							name: "Settings",
							url: "#settings",
							component: (
								<Settings
									integration={integration}
									onboarding={props.onboarding}
								/>
							),
						},
					],
			  ]
			: PAGES;

	let TABS =
		!integration?.isUserMappingEnabled || !hasConnectedOrgIntegrations
			? PAGES_NEW.filter((p) => p.url != "#usermapping")
			: PAGES_NEW;

	if (partner?.name !== PARTNER.ZLURI.name)
		TABS = TABS.filter((p) => p.url !== "#how-to");

	return (
		<>
			{userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<div className="z__page z__integrations">
					<HeaderTitleBC
						title="Integrations Catalog"
						go_back_url="/integrations/catalog"
						inner_screen={true}
						entity_name={integration?.name}
						entity_logo={integration?.logo}
						showNavbarButtons={false}
						mainLogo={
							partner?.name === PARTNER.ZLURI.name
								? ZluriLogo
								: null
						}
						onMainLogoClick={() => {
							history.push("/overview");
						}}
					/>
					<div className="col-md-12">
						<div className="row">
							{integration ? (
								<>
									<div
										style={{ maxWidth: "21%" }}
										className="col-md-3 px-4 py-3 ml-3"
									>
										<AppIntegrationInformation
											integration={integration}
											setshowUpgradeModal={
												setshowUpgradeModal
											}
										/>
									</div>
									<div
										style={{
											borderLeft: "1px solid #EBEBEB",
										}}
										className="col-md-9 py-4 px-5"
									>
										<h4 className="font-20 bold-600 mb-1">
											<img
												onClick={() => {
													history.push(
														`/integrations/catalog`
													);
												}}
												width={"6px"}
												className="mr-3 cursor-pointer"
												src={backIcon}
											/>
											{integration?.name}
										</h4>
										<div>
											<NavTabs
												updateTitle={true}
												tabs={TABS}
											/>
										</div>
									</div>
									{showUpgradeModal && (
										<UpgradeBannerModal
											onHide={() =>
												setshowUpgradeModal(false)
											}
											showUpgradeModal={showUpgradeModal}
										/>
									)}
								</>
							) : (
								<SingleIntegrationLoader />
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
