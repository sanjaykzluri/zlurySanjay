import React, { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/browser";
import trim from "read-more-react/dist/utils/trimText";
import { IntegrationsFilter } from "./IntegrationsFilter";
import "./Integrations.css";
import { Link } from "react-router-dom";
import adobe from "./adobe.svg";
import ContentLoader from "react-content-loader";
import checked from "../Onboarding/checked.svg";
import { Helmet } from "react-helmet";
import { IntegrationConsentModal } from "./IntegrationConsentModal";
import NoIntegrationsSVG from "../../assets/empty/NoIntegrations.svg";
import { getConnectedIntegrations } from "../../services/api/onboarding";
import { TriggerIssue } from "utils/sentry";
import { getIntegrations } from "modules/integrations/service/api";
import { useAuth0 } from "@auth0/auth0-react";
import { getValueFromLocalStorage } from "utils/localStorage";

function IntegrationCard(props) {
	const profile = props.profile;
	const { user } = useAuth0();
	const [hovered, setHovered] = useState(false);
	const [shortDescription, setShortDescription] = useState("");
	const [showConsentModal, setShowConsentModal] = useState(false);

	const [showErrorInSendingInvite, setShowErrorInSendingInvite] =
		useState(false);
	const [loadingInviteToCoworker, setLoadingInviteToCoworker] =
		useState(false);

	const cardRef = useRef();
	const formRef = useRef();
	const isConnected = profile.integration_status === "connected";
	const connectDisconnectUrl = isConnected
		? profile.integration_disconnect_url
		: profile.integration_connect_url;
	const getShortDesc = (text, length = 100) => {
		if (text.length > length) {
			return `${text.slice(0, length)}...`;
		} else {
			return text;
		}
	};
	const setHoverState = (state) => {
		setHovered(state);
	};
	useEffect(() => {
		window.addEventListener("message", (e) => {
			if (e.data.status === "success") {
				setShowConsentModal(false);
				props.fetchIntegrations();
			}
		});
	}, []);

	const handleIntegrationRequested = (coWorker) => {
		setLoadingInviteToCoworker(true);
		const userInfo = getValueFromLocalStorage("userInfo");
		getConnectedIntegrations(userInfo, user, coWorker, profile)
			.then((res) => {
				if (res?.statusCode == 202) {
					setLoadingInviteToCoworker(false);
					setShowConsentModal(false);
				} else {
					TriggerIssue(
						"Invalid response status code for getConnectedIntegrations API"
					);
				}
			})
			.catch((err) => {
				setShowErrorInSendingInvite(true);
				setLoadingInviteToCoworker(false);
				TriggerIssue(
					"Error in requesting for co-worker integration form",
					err
				);
			});
	};

	const handleConnectDisconnectClick = () => {
		const userInfo = getValueFromLocalStorage("userInfo");
		const orgId = userInfo.org_id;
		const userId = userInfo.user_id;

		const tokenData = getValueFromLocalStorage("token");
		const token = `Bearer ${tokenData}`;

		const f = formRef.current;

		f.orgId.value = orgId;
		f.integrationId.value = profile.integration_id;
		f.Authorization.value = token;
		f.userId.value = userId;
		const popup = window.open("", "popupWindow");
		f.submit();
	};

	useEffect(() => {
		if (profile?.integration_description) {
			setShortDescription(getShortDesc(profile?.integration_description));
		}
	}, [profile?.integration_description]);

	return (
		<>
			<Helmet>
				<title>
					{"Integrations - " +
						getValueFromLocalStorage("userInfo")?.org_name +
						` - ${getValueFromLocalStorage("partner")?.name}`}
				</title>
			</Helmet>
			{hovered ? (
				<div
					className="INT__card"
					onMouseEnter={() => setHoverState(true)}
					onMouseLeave={() => setHoverState(false)}
				>
					<div
						className="INT__card2__insd"
						style={{ paddingTop: 20 }}
					>
						<div
							className="INT__card2__d1"
							style={{ marginBottom: 8 }}
						>
							{profile.integration_name}
						</div>
						<div
							className="INT__card2__d2"
							style={{ marginBottom: 24 }}
						>
							{shortDescription}
						</div>
						<div className="INT__card2__d3">
							<Link
								to={`integrations/${profile.integration_id}#appinfo`}
								className="m-auto"
							>
								<button className="INT__card__button1">
									More Info
								</button>
							</Link>

							{!isConnected ? (
								<button
									key={profile.integration_id}
									className="INT__card__button2 m-auto"
									style={{ marginRight: "2%" }}
									onClick={() => setShowConsentModal(true)}
								>
									Connect App
								</button>
							) : (
								<button
									key={profile.integration_id}
									className="INT__card__button2 m-auto"
									style={{ marginRight: "2%" }}
									onClick={handleConnectDisconnectClick}
								>
									Disconnect App
								</button>
							)}
						</div>
					</div>
				</div>
			) : (
				<div
					ref={cardRef}
					className="INT__card"
					onMouseEnter={() => setHoverState(true)}
					onMouseLeave={() => setHoverState(false)}
				>
					<div className="INT__card__d1">
						<div className="INT__card__d1__d1">
							<img
								src={profile.integration_logo_url}
								style={{ height: "60px", width: "60px" }}
								alt={profile.app}
							/>
						</div>
						<div className="INT__card__d1__d2">
							<div
								className="INT__card2__d1"
								style={{ marginBottom: 8 }}
							>
								{profile.integration_name}
							</div>
							<div className="INT__card__d1__d2__d2">
								{profile.integration_category}
							</div>
						</div>
					</div>
					<div className="INT__card__d2">{shortDescription}</div>
				</div>
			)}
			<form
				method="post"
				action={connectDisconnectUrl}
				target="popupWindow"
				ref={formRef}
			>
				<input type="hidden" name="integrationId" />
				<input type="hidden" name="orgId" />
				<input type="hidden" name="Authorization" />
				<input type="hidden" name="namespace" />
				<input type="hidden" name="userId" />
			</form>
			{showConsentModal && (
				<IntegrationConsentModal
					show={showConsentModal}
					integration={profile}
					onHide={() => setShowConsentModal(false)}
					onSubmit={handleConnectDisconnectClick}
					showErrorInSendingInvite={showErrorInSendingInvite}
					loadingInviteToCoworker={loadingInviteToCoworker}
					handleIntegrationRequested={handleIntegrationRequested}
				/>
			)}
		</>
	);
}

export function Integrationsins() {
	const [integrations, setIntegrations] = useState([]);
	const [loading, setloading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredIntegrations, setFilteredIntegrations] = useState([]);

	useEffect(() => {
		function isIntegrationMatch(integration) {
			if (typeof integration?.integration_name === "string") {
				return integration?.integration_name
					?.toLowerCase()
					?.includes(searchQuery.toLowerCase());
			} else {
				return;
			}
		}

		if (searchQuery.length > 0) {
			setFilteredIntegrations(integrations.filter(isIntegrationMatch));
		} else {
			setFilteredIntegrations(integrations);
		}
	}, [searchQuery]);

	const fetchIntegrations = () => {
		getIntegrations().then((res) => {
			setIntegrations(res);
			setFilteredIntegrations(res);
			setloading(false);
		});
	};

	useEffect(() => {
		fetchIntegrations();
	}, []);

	return (
		<>
			<hr style={{ margin: "0px 40px" }} />
			{!loading && integrations.length > 0 && (
				<IntegrationsFilter
					setSearchQuery={setSearchQuery}
					searchQuery={searchQuery}
				/>
			)}
			<div className="INT__cont">
				<div className="INT__d1">
					{loading ? (
						<>
							<div className="INT__d1__d1 mt-5">
								<ContentLoader height={16} width={138}>
									<rect
										width="138"
										height="16"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<hr style={{ margin: "9px 0px 20px" }} />
							<div className="INT__d1__d2">
								<div className="INT__cardlist">
									<div className="apps__card__loading__INT">
										<ContentLoader>
											<circle
												cx="48"
												cy="48"
												r="30"
												fill="#EBEBEB"
											/>
											<rect
												width="108"
												height="14"
												rx="2"
												x="96"
												y="33"
												fill="#EBEBEB"
											/>
											<rect
												width="76"
												height="9"
												rx="2"
												x="96"
												y="56"
												fill="#EBEBEB"
											/>
											<rect
												width="63"
												height="9"
												rx="2"
												x="17"
												y="115"
												fill="#EBEBEB"
											/>
										</ContentLoader>
										<div className="apps__card__bottom"></div>
									</div>
									<div className="apps__card__loading__INT">
										<ContentLoader>
											<circle
												cx="48"
												cy="48"
												r="30"
												fill="#EBEBEB"
											/>
											<rect
												width="108"
												height="14"
												rx="2"
												x="96"
												y="33"
												fill="#EBEBEB"
											/>
											<rect
												width="76"
												height="9"
												rx="2"
												x="96"
												y="56"
												fill="#EBEBEB"
											/>
											<rect
												width="63"
												height="9"
												rx="2"
												x="17"
												y="115"
												fill="#EBEBEB"
											/>
										</ContentLoader>
										<div className="apps__card__bottom"></div>
									</div>
									<div className="apps__card__loading__INT">
										<ContentLoader>
											<circle
												cx="48"
												cy="48"
												r="30"
												fill="#EBEBEB"
											/>
											<rect
												width="108"
												height="14"
												rx="2"
												x="96"
												y="33"
												fill="#EBEBEB"
											/>
											<rect
												width="76"
												height="9"
												rx="2"
												x="96"
												y="56"
												fill="#EBEBEB"
											/>
											<rect
												width="63"
												height="9"
												rx="2"
												x="17"
												y="115"
												fill="#EBEBEB"
											/>
										</ContentLoader>
										<div className="apps__card__bottom"></div>
									</div>
									<div className="apps__card__loading__INT">
										<ContentLoader>
											<circle
												cx="48"
												cy="48"
												r="30"
												fill="#EBEBEB"
											/>
											<rect
												width="108"
												height="14"
												rx="2"
												x="96"
												y="33"
												fill="#EBEBEB"
											/>
											<rect
												width="76"
												height="9"
												rx="2"
												x="96"
												y="56"
												fill="#EBEBEB"
											/>
											<rect
												width="63"
												height="9"
												rx="2"
												x="17"
												y="115"
												fill="#EBEBEB"
											/>
										</ContentLoader>
										<div className="apps__card__bottom"></div>
									</div>
								</div>
							</div>
						</>
					) : (
						<>
							{filteredIntegrations.length > 0 ? (
								<>
									<div className="INT__d1__d1">
										Recommended
									</div>
									<hr style={{ margin: "9px 0px 20px" }} />
									<div className="INT__d1__d2">
										<div className="INT__cardlist">
											{filteredIntegrations?.map(
												(profile, index) => (
													<IntegrationCard
														key={index}
														profile={profile}
														fetchIntegrations={
															fetchIntegrations
														}
													/>
												)
											)}
										</div>
									</div>
								</>
							) : (
								<div
									className="flex-center flex-column"
									style={{ marginTop: 100 }}
								>
									<img src={NoIntegrationsSVG} width={250} />
									<div style={{ fontSize: 18 }}>
										No integrations here!
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
}
