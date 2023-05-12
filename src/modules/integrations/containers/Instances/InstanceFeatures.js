import React, { useEffect, useState } from "react";
import rightarrow from "assets/users/rightarrow.svg";
import ContentLoader from "react-content-loader";
import { capitalizeFirstLetter } from "utils/common";
import { Accordion, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ContextAwareToggle } from "modules/integrations/components/IntegrationConnectV2/ContextAwareToggle";
import { DottedRisk } from "common/DottedRisk/DottedRisk";
import read_icon from "assets/read.svg";
import write_icon from "assets/write.svg";
import inactive_feature from "assets/inactive-feature.svg";
import active_feature from "assets/active-feature.svg";
import { entityImageMapper } from "modules/integrations/components/IntegrationCapabilities";
import browserIcon from "assets/browser.svg";
import referenceIcon from "assets/reference-icon.svg";
import { PermissionCard } from "modules/integrations/components/PermissionCard/PermissionCard";
import ScopeDetailCard from "modules/integrations/components/scopeDetailCard";
import { Button } from "UIComponents/Button/Button";

export function InstanceFeatures({
	showSidebar,
	features,
	show,
	handleReconnect,
	instance,
}) {
	const [loading, setLoading] = useState(false);
	const [selectedFeature, setSelectedFeature] = useState(features[0]);
	const [selectedScopes, setSelectedScopes] = useState(features?.[0]?.scopes);
	const [toBeConnectedScopes, setToBeConnectedScopes] = useState();

	const [selectedCategory, setSelectedCategory] = useState();
	const [listOfApps, setListOfApps] = useState([]);

	const onFeatureChange = (feature) => {
		setSelectedFeature(feature);
		let tempObj = features.find((el) => el.feature === feature.feature);
		getToBeConnectedScopes(tempObj?.scopes);
		setSelectedScopes(tempObj?.scopes);
	};

	function getToBeConnectedScopes(scopes) {
		let toBeConnected = scopes.filter((scope) => {
			return !scope.connected;
		});
		setToBeConnectedScopes(toBeConnected);
	}

	useEffect(() => {
		getToBeConnectedScopes(features?.[0]?.scopes);
	}, []);

	return (
		<>
			{loading ? (
				<div className="d-flex" style={{}}>
					{showSidebar && (
						<div
							className="d-flex flex-column"
							style={{ width: "fit-content" }}
						>
							{Array(5)
								.fill({ dummy: "Hello" })
								.map((el) => (
									<div
										className={`d-flex align-items-center employee-category-card font-12 `}
										style={{
											backgroundColor:
												"rgba(235, 235, 235, 0.35)",
										}}
									>
										<ContentLoader
											width={91}
											height={10}
											backgroundColor={"#DDDDDD"}
										>
											<rect
												width="91"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								))}
						</div>
					)}
				</div>
			) : (
				<>
					<div
						className="d-flex"
						style={{
							border: "1px solid #EBEBEB",
						}}
					>
						<div style={{ width: "30%" }}>
							{features.map((feature) => (
								<div
									style={{
										backgroundColor:
											selectedFeature.feature ===
												feature.feature &&
											"rgba(90, 186, 255, 0.1)",
									}}
									className="py-3 px-2 mr-1 cursor-pointer"
									onClick={() => onFeatureChange(feature)}
								>
									<div className="font-13 font-500">
										<>
											<img
												src={
													feature.connected
														? active_feature
														: inactive_feature
												}
												width="12px"
												className="mr-1"
											/>
											{capitalizeFirstLetter(
												feature.feature
											)}
										</>
									</div>
									<div className="font-10 grey-1 ml-3">{`${
										feature.connected
											? "Active"
											: "Inactive"
									} | ${feature.scopes_count} ${
										feature.scopes_count === 1
											? "scope"
											: "scopes"
									} needed`}</div>
								</div>
							))}
						</div>
						{selectedScopes?.length > 0 && (
							<div
								style={{
									width: "70%",
									backgroundColor: "#FCFCFD",
								}}
								className="p-2"
							>
								<div className="grey-1 ml-2 font-11">
									{`${selectedScopes?.length} ${
										selectedScopes?.length === 1
											? "scope"
											: "scopes"
									} needed for ${capitalizeFirstLetter(
										selectedFeature?.feature
									)}`}
								</div>
								{selectedScopes &&
									Array.isArray(selectedScopes) &&
									selectedScopes.map((permission, index) => (
										<ScopeDetailCard
											scope={permission}
											index={index}
											showScopeState={true}
											width="100%"
											showDescription={false}
											showFeatures={false}
											numberOfItems={2}
											fontSize="12px"
											fontWeight="400"
											truncateTextSize="25"
											showDashedBorder={false}
										/>
									))}
								{Array.isArray(selectedScopes) &&
									selectedScopes?.length > 0 &&
									toBeConnectedScopes?.length > 0 && (
										<div
											style={{
												background:
													"#rgb(245, 246, 249, 0.25)",
												border: "1px dashed rgba(113, 113, 113, 0.25)",
												borderRadius: "6px",
												textAlign: "center",
											}}
											className="p-2"
										>
											<div className="grey-1">
												{toBeConnectedScopes?.length}{" "}
												additional scope required for
												workflows
											</div>
											<Button
												onClick={() =>
													handleReconnect(
														toBeConnectedScopes,
														instance.id,
														true
													)
												}
												type="link"
											>
												{`Connect ${toBeConnectedScopes?.length}  Scope`}
											</Button>
										</div>
									)}
							</div>
						)}
					</div>
				</>
			)}
		</>
	);
}
