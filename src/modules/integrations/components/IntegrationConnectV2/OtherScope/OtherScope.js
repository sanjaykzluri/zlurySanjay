import { enabledBetaFeature } from "modules/integrations/utils/IntegrationUtil";
import React from "react";
import { useSelector } from "react-redux";
import ADD_ICON from "../../../../../assets/solid_green_add_icon.svg";
import "./other-scope.css";

export function OtherScope({
	scopeId,
	scopeName,
	requiredScopes,
	onViewAll,
	onAddScope,
	isAllScopes,
}) {
	const userInfo = useSelector((state) => state.userInfo);
	const { beta_features_scopes } = userInfo;

	const privateBetaLabel = (scope) => {
		return (
			enabledBetaFeature(
				beta_features_scopes,
				requiredScopes?.[0]?.integration_id
			)?.includes(scope?.toLowerCase()) && (
				<p className="bg-red white bold-600 font-8 d-inline-block mr-auto my-auto p-1 border-radius-4 private-beta">
					BETA
				</p>
			)
		);
	};

	return (
		requiredScopes.length > 0 && (
			<>
				<div className="d-flex justify-content-between align-items-center my-2 other-scope">
					<div className="d-flex flex-column __left ml-3">
						<div className="__title truncate_15vw">{scopeName}</div>
						<div className="__subheading">
							{requiredScopes?.length}
							{isAllScopes ? " Scopes" : " Scopes required"}
						</div>
					</div>
					{privateBetaLabel(scopeId)}
					<div className="d-flex  __right mr-4">
						<button
							className="btn btn-link btn-sm text-decoration-none mr-2 no-focus"
							onClick={(e) => {
								onViewAll && onViewAll(scopeId);
							}}
						>
							View All
						</button>
						<button className="btn btn-link btn-sm text-decoration-none no-focus">
							<img
								src={ADD_ICON}
								alt="Add"
								onClick={(e) => {
									onAddScope && onAddScope(requiredScopes);
								}}
							/>
						</button>
					</div>
				</div>
			</>
		)
	);
}
