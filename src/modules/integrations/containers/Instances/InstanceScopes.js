import React, { useContext, useEffect, useState, Fragment } from "react";
import ContentLoader from "react-content-loader";
import _ from "underscore";
import refershBlue from "../../../../components/Uploads/refreshBlue.svg";
import warning from "../../../../components/Onboarding/warning.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import connectAllIcon from "assets/connect-all.svg";
import infoGreyIcon from "assets/integrations/info-grey.svg";
import { TriggerIssue } from "../../../../utils/sentry";
import { useLocation } from "react-router-dom";
import ScopeDetailCard from "modules/integrations/components/scopeDetailCard";
import { INTEGRATION_STATUS } from "modules/integrations/constants/constant";
import {
	getIntegrationInstanceScopes,
	getIntegrationInstanceScopesFilters,
} from "modules/integrations/service/api";
import RoleContext from "services/roleContext/roleContext";
import {
	disabledBetaFeature,
	enabledBetaFeature,
} from "modules/integrations/utils/IntegrationUtil";
import { useSelector } from "react-redux";

function InstanceScopes(props) {
	const userInfo = useSelector((state) => state.userInfo);
	const { beta_features_scopes } = userInfo;

	let { instance, integration, handleReconnect } = { ...props };
	const [usageActivityRisk, setUsageActivityRisk] = useState();
	const [overviewData, setOverviewData] = useState();
	const [scopesFilters, setScopesFilters] = useState([]);
	const [selectedFilter, setSelectedFilter] = useState("All");
	const [scopes, setScopes] = useState();
	const [connectedScopes, setConnectedScopes] = useState();
	const [showConnectedScopes, setShowConnectedScopes] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();
	const location = useLocation();
	const integrationId = location.pathname.split("/")[2];
	const { partner } = useContext(RoleContext);

	const requestEndPoint = (filter) => {
		setLoading(true);
		try {
			getIntegrationInstanceScopes(integrationId, props.id, filter).then(
				(res) => {
					if (res?.error) {
						setError(res);
						setLoading(true);
					} else {
						if (res) {
							res?.connected_scopes?.map((val) => {
								val.integration_scope_reason =
									val.integration_scope_reason.replaceAll(
										"Zluri",
										partner?.name
									);
								val.scope_description =
									val.scope_description.replaceAll(
										"Zluri",
										partner?.name
									);

								val.scope_name = val.scope_name.replaceAll(
									"Zluri",
									partner?.name
								);
							});

							res?.yet_to_connect_scopes?.map((val) => {
								val.integration_scope_reason =
									val.integration_scope_reason.replaceAll(
										"Zluri",
										partner?.name
									);

								val.scope_description =
									val.scope_description.replaceAll(
										"Zluri",
										partner?.name
									);

								val.scope_name = val.scope_name.replaceAll(
									"Zluri",
									partner?.name
								);
							});
							setOverviewData(res);
							setScopes(res);
							if (!filter) {
								setConnectedScopes(res.connected_scopes);
							}
							// props.setScopeData(res?.data);
							setLoading(false);
							setError();
						}
					}
				}
			);
		} catch (error) {
			setError(error);
			TriggerIssue("error in getting instace scopes", error);
			setLoading(false);
		}
	};

	async function loadScopesFilters() {
		let data = await getIntegrationInstanceScopesFilters(
			integrationId,
			props.id
		);
		data.features?.unshift("All");
		setScopesFilters(data);
	}

	useEffect(() => {
		if (props.currentSection === props.sections.scopes) {
			loadScopesFilters();
			requestEndPoint();
		} else {
			setUsageActivityRisk();
			setError();
			setLoading(false);
		}
	}, [props.currentSection]);

	function handleFilter(feature) {
		setSelectedFilter(feature);
		requestEndPoint(feature);
	}

	const privateBetaLabel = (feature) => {
		return (
			enabledBetaFeature(beta_features_scopes, integration?.id)?.includes(
				feature
			) && (
				<p
					style={{ padding: "1px" }}
					className="bg-red white bold-600 font-8 d-inline-block ml-1 my-auto border-radius-4"
				>
					BETA
				</p>
			)
		);
	};

	return (
		<div
			className="position-relative"
			style={{ height: "calc(100vh - 112px)", overflowY: "auto" }}
		>
			{error ? (
				<div
					className="d-flex flex-column justify-content-center"
					style={{ height: "100%" }}
				>
					<img
						src={warning}
						style={{ width: "45px" }}
						className="ml-auto mr-auto"
					/>
					<div className="grey-1 font-18 bold-normal w-75 text-center ml-auto mr-auto mt-2">
						An error occured. Please try again
					</div>

					<div className="ml-auto mr-auto mt-2">
						<Button
							className="primary-color-border d-flex"
							type="link"
							onClick={() => requestEndPoint()}
						>
							<img
								src={refershBlue}
								className="mr-2"
								style={{ width: "15px" }}
							/>
							Retry
						</Button>
					</div>
				</div>
			) : (
				<>
					{loading && scopesFilters.length === 0 ? (
						<>
							{_.times(2, (n) => (
								<div key={n}>
									<div className="d-flex border-bottom pt-3 mr-3 mt-3 ml-3">
										<ContentLoader height={50} width={200}>
											<circle
												r="15"
												cx="22"
												cy="20"
												fill="#EBEBEB"
											/>
											<rect
												width="100"
												x="50"
												y="15"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										style={{
											borderBottom: "0.5px solid #EBEBEB",
										}}
										className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3"
									>
										<ContentLoader width={500} height={50}>
											<rect
												width="160"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
											<rect
												width="91"
												height="10"
												rx="2"
												y={20}
												fill="#EBEBEB"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="120"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="145"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="170"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="195"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="220"
											/>
										</ContentLoader>
									</div>
									<div
										style={{
											borderBottom: "0.5px solid #EBEBEB",
										}}
										className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3"
									>
										<ContentLoader width={500} height={50}>
											<rect
												width="280"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
											<rect
												width="130"
												height="10"
												rx="2"
												y={20}
												fill="#EBEBEB"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="150"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="175"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="200"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="225"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="250"
											/>
										</ContentLoader>
									</div>
									<div
										style={{
											borderBottom: "0.5px solid #EBEBEB",
										}}
										className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3"
									>
										<ContentLoader width={500} height={50}>
											<rect
												width="160"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
											<rect
												width="91"
												height="10"
												rx="2"
												y={20}
												fill="#EBEBEB"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="120"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="145"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="170"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="195"
											/>
											<rect
												width="20"
												y="20"
												rx="5"
												height="10"
												x="220"
											/>
										</ContentLoader>
									</div>
								</div>
							))}
						</>
					) : overviewData ? (
						<div>
							<div
								style={{
									height: "calc(100% - 160px)",
									overflowY: "auto",
								}}
							>
								<div
									style={{
										backgroundColor:
											"rgba(245, 246, 249, 1)",
									}}
									className="__feature_container px-3 py-1"
								>
									<div className="font-12 color-gray-2 feature-label">
										Filter scopes by Feature:
									</div>
									<div className="__features gray-2 pb-1">
										<ul className="list-unstyled d-flex z_i_app_info_feature flex-wrap text-capitalize">
											{scopesFilters?.features?.length >
												0 &&
												scopesFilters.features
													?.filter(
														(feature) =>
															!disabledBetaFeature(
																beta_features_scopes,
																integration?.id
															)?.includes(feature)
													)
													?.map((feature, index) => (
														<li
															key={index}
															className="font-12 px-3 py-1 cursor-pointer"
															style={{
																color:
																	feature ===
																		selectedFilter &&
																	"rgba(90, 186, 255, 1)",
																border:
																	feature ===
																		selectedFilter &&
																	"1px solid #5ABAFF",
																borderRadius:
																	"12px",
																height: "25px",
															}}
															onClick={() =>
																handleFilter(
																	feature
																)
															}
														>
															{feature}
															{privateBetaLabel(
																feature
															)}
														</li>
													))}
										</ul>
									</div>
									{/* <div className="__feature_filters text-glow">
											Show more filters
										</div> */}
								</div>
								<div className="flex align-items-center justify-content-center py-4">
									<div
										style={{
											border: "1px solid #DDDDDD",
											borderColor: !showConnectedScopes
												? "rgba(34, 102, 226, 1)"
												: "#DDDDDD",
											borderRadius: "4px",
											color:
												!showConnectedScopes &&
												"rgba(34, 102, 226, 1)",
											backgroundColor:
												!showConnectedScopes &&
												"rgba(233, 240, 252, 1)",
										}}
										className="px-4 py-1 cursor-pointer"
										onClick={() =>
											setShowConnectedScopes(false)
										}
									>
										Yet to be connected
									</div>
									<div
										style={{
											border: "1px solid #DDDDDD",
											borderColor: showConnectedScopes
												? "rgba(34, 102, 226, 1)"
												: "#DDDDDD",
											borderRadius: "4px",
											color:
												showConnectedScopes &&
												"rgba(34, 102, 226, 1)",
											backgroundColor:
												showConnectedScopes &&
												"rgba(233, 240, 252, 1)",
										}}
										onClick={() =>
											setShowConnectedScopes(true)
										}
										className="px-4 py-1 cursor-pointer"
									>
										Connected
									</div>
								</div>
								{instance?.status ===
									INTEGRATION_STATUS.NOT_CONNECTED && (
									<div
										className="py-2"
										style={{
											fontSize: "12px",
											backgroundColor:
												"rgba(245, 246, 249, 1)",
											textAlign: "center",
										}}
									>
										<img
											className="mr-2"
											src={infoGreyIcon}
										/>
										No scopes are being utilised since
										instance was disconnected.
									</div>
								)}
								{loading ? (
									<>
										{_.times(2, (n) => (
											<div className="p-3">
												<ContentLoader
													speed={2}
													width={"100%"}
													height={94}
													viewBox="0 0 500 94"
													backgroundColor="#f3f3f3"
													foregroundColor="#ecebeb"
													className="mr-1"
													{...props}
												>
													<rect
														x="0"
														y="0"
														rx="4"
														ry="4"
														width="500"
														height="94"
													/>
												</ContentLoader>
											</div>
										))}
									</>
								) : (
									<>
										<div className="d-flex justify-content-between align-items-center my-3 z__show_all_label px-4">
											<div className="d-flex justify-content-center align-items-center __show_all font-12 color-gray-2">
												Showing{" "}
												{(scopes &&
													(showConnectedScopes
														? scopes.connected_scopes
														: scopes.yet_to_connect_scopes
													).length) ||
													0}{" "}
												scopes
											</div>
											{scopes &&
												!showConnectedScopes &&
												scopes.yet_to_connect_scopes
													.length > 0 && (
													<div
														onClick={() => {
															props.setShowConnectModal(
																true
															);
															handleReconnect(
																scopes.yet_to_connect_scopes,
																instance.id,
																true,
																connectedScopes
															);
														}}
														className="font-13 primary-color cursor-pointer"
													>
														Connect All
														<img
															src={connectAllIcon}
															width="12px"
															className="ml-1"
														/>
													</div>
												)}
										</div>
										<div
											style={{
												flexWrap: "wrap",
												fontSize: "14px",
											}}
											className="flex px-2"
										>
											{scopes &&
												(showConnectedScopes
													? scopes.connected_scopes
													: scopes.yet_to_connect_scopes
												).map((scope, index) => (
													<ScopeDetailCard
														scope={scope}
														index={index}
														showScopeState={true}
														width="100%"
														showConnectedScopes={
															showConnectedScopes
														}
													/>
												))}
										</div>
										<div>
											{scopes &&
												(showConnectedScopes
													? scopes.connected_scopes
													: scopes.yet_to_connect_scopes
												).length === 0 && (
													<div
														align="center"
														className="font-14"
													>
														No scopes Available
													</div>
												)}
										</div>
									</>
								)}
							</div>
						</div>
					) : (
						<div align="center" className="mt-8 font-14">
							No Scopes Available
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default InstanceScopes;
