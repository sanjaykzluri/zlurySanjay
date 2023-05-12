import React, { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { ContextAwareToggle } from "../ContextAwareToggle";
import { PermissionCard } from "../../../components/PermissionCard/PermissionCard";
import { Button } from "../../../../../UIComponents/Button/Button";
import unchecked_icon from "../../../../../assets/unchecked_circle.svg";
import closeIcon from "../../../../../assets/close.svg";
import read_icon from "../../../../../assets/read.svg";
import checked_icon from "../../../../../assets/sky_completed-icon.svg";
import light_write_icon from "../../../../../assets/light_write_icon.svg";
import "./sidebar.css";
import { useDispatch, useSelector } from "react-redux";
import ScopeDetailCard from "../../scopeDetailCard";
import { setReqData } from "common/Stepper/redux";
import { capitalizeFirstLetter } from "utils/common";
import {
	disabledBetaFeature,
	enabledBetaFeature,
} from "modules/integrations/utils/IntegrationUtil";

function hasItems(param) {
	return param && Array.isArray(param) && param?.length > 0;
}

function ToggleIconButton({ item, selectedList, onSelect, onRemove }) {
	const isSelected = selectedList.find((el) => el._id === item._id);
	return (
		<button
			onClick={() => {
				isSelected ? onRemove(item) : onSelect(item);
			}}
			className="btn btn-link btn-sm text-decoration-none no-focus m-0 p-0 mr-2"
		>
			<img src={isSelected ? checked_icon : unchecked_icon} />
		</button>
	);
}
export function Sidebar({
	setShowIntegrationSidebar,
	activeScopeId,
	integration,
	onAddScope,
	features,
}) {
	const userInfo = useSelector((state) => state.userInfo);
	const { beta_features_scopes } = userInfo;

	const { data, screen } = useSelector((state) => state.stepper);
	let [scopesData, setScopesData] = useState([]);
	let [selectedFilter, setSelectedFilter] = useState(activeScopeId);
	const dispatch = useDispatch();
	const [selectedScopes, setSelectedScopes] = useState([]);

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

	useEffect(() => {
		let scopes = data?.allScopes?.filter((element) => {
			if (element.feature.includes(selectedFilter)) {
				return element;
			}
		});
		setScopesData(scopes);
		setSelectedScopes([]);
	}, [data.allScopes]);

	useEffect(() => {
		if (activeScopeId === "all") {
			let scopes = data?.allScopes;
			setScopesData(scopes);
		}
	}, [activeScopeId]);

	function handleFilter(feature) {
		setSelectedFilter(feature.toLowerCase());
		let scopes;
		if (feature === "All") {
			scopes = data?.allScopes;
		} else {
			scopes = data?.allScopes?.filter((element) => {
				if (element.feature.includes(feature)) {
					return element;
				}
			});
		}
		setScopesData(scopes);
	}
	// const { permissions } = activeScope || {};

	// Can be improved much better
	const isAllBetaScopesSelected = () => {
		let allBetaScopes = [];
		let selectedBetaScopes = [];
		const betaFeatureScope = enabledBetaFeature(
			beta_features_scopes,
			integration?.id
		);
		if (!betaFeatureScope) return true;
		if (Array.isArray(betaFeatureScope)) {
			betaFeatureScope?.map((scope) => {
				allBetaScopes = data?.allScopes?.filter((element) => {
					if (element.feature.includes(scope)) return element;
				});
				selectedBetaScopes = selectedScopes?.filter((element) => {
					if (element.feature.includes(scope)) return element;
				});
			});
		}
		if (!selectedBetaScopes?.length) return true;
		if (selectedBetaScopes?.length !== allBetaScopes?.length) {
			return false;
		} else if (selectedBetaScopes?.length === allBetaScopes?.length) {
			return true;
		}
	};

	return (
		<>
			<div
				style={{ overflowY: "scroll" }}
				className="addContractModal__TOP h-100 z__i_sidebar"
			>
				<div
					style={{
						justifyContent: "space-between",
						alignItems: "center",
					}}
					className="flex"
				>
					<div
						style={{ alignItems: "center" }}
						className="flex flex-row py-4 flex-fill"
					>
						<div className="contracts__heading ml-1 pl-4 text-truncate">
							Scopes for
							{integration?.logo ? (
								<img
									src={integration?.logo}
									style={{ width: "26px", height: "26px" }}
									className="mx-1"
								/>
							) : null}{" "}
							{integration?.name}
						</div>
					</div>
					<div style={{ float: "right" }}>
						<img
							alt="Close"
							onClick={() => setShowIntegrationSidebar(false)}
							src={closeIcon}
							className="cursor-pointer mr-4"
						/>
					</div>
				</div>
				<hr className="mb-0 mt-0 ml-3 mr-3" />

				<div
					style={{
						height: "calc(100% - 160px)",
						overflowY: "auto",
					}}
				>
					<div className="__feature_container px-3">
						<div className="font-12 color-gray-2 feature-label">
							Filter scopes by Feature:
						</div>
						<div className="__features gray-2">
							<ul className="list-unstyled d-flex z_i_app_info_feature flex-wrap text-capitalize">
								{["All", ...features]
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
											className="font-12 cursor-pointer"
											style={{
												color:
													feature?.toLowerCase() ===
														selectedFilter &&
													"rgba(90, 186, 255, 1)",
												border:
													feature?.toLowerCase() ===
													selectedFilter
														? "1px solid #5ABAFF"
														: "1px solid #DDDDDD",
											}}
											onClick={() =>
												handleFilter(feature)
											}
										>
											{capitalizeFirstLetter(feature)}
											{privateBetaLabel(feature)}
										</li>
									))}
							</ul>
						</div>
						{/* <div className="__feature_filters text-glow">
							Show more filters
						</div> */}
					</div>
					<div className="d-flex justify-content-between align-items-center my-3 z__show_all_label px-4">
						<div className="d-flex justify-content-center align-items-center __show_all font-12 color-gray-2">
							Showing{" "}
							{(scopesData?.scopes?.length > 0
								? scopesData?.scopes
								: scopesData
							)?.length || 0}{" "}
							scopes
						</div>
						{(scopesData?.scopes?.length > 0
							? scopesData?.scopes
							: scopesData
						)?.length > 0 && (
							<div className="d-flex justify-content-center align-items-center __show_all font-12 color-gray-2">
								<button
									className="btn btn-link btn-sm text-decoration-none d-flex justify-content-center align-items-center"
									onClick={() => {
										setSelectedScopes(
											scopesData.scopes || scopesData
										);
									}}
									style={{ color: "rgba(34, 102, 226, 1)" }}
								>
									Select All
								</button>
							</div>
						)}
					</div>
					<div className="z__scope_container px-3">
						{scopesData?.scopes?.length > 0 ||
						(Array.isArray(scopesData) &&
							scopesData?.[0]?.scope_name) ? (
							(scopesData?.scopes?.length > 0
								? scopesData?.scopes
								: scopesData
							)?.map((singlePermission, index) => (
								<ScopeDetailCard
									iconButton={
										<ToggleIconButton
											item={singlePermission}
											selectedList={selectedScopes}
											onSelect={(item) => {
												setSelectedScopes([
													...selectedScopes,
													item,
												]);
											}}
											onRemove={(item) => {
												setSelectedScopes(
													selectedScopes.filter(
														(el) =>
															el._id !== item._id
													)
												);
											}}
											className="mr-2"
										/>
									}
									scope={singlePermission}
									index={index}
									showScopeState={true}
									width="100%"
									showDescription={true}
									showFeatures={true}
									numberOfItems={3}
								/>
							))
						) : (
							<div align="center" className="my-2">
								No scopes here{" "}
							</div>
						)}
					</div>
				</div>
				<div className="d-flex justify-content-center align-items-center z__add_scope_button">
					{selectedScopes && selectedScopes.length > 0 && (
						<Button
							className="integration-button  mt-4"
							disabled={!isAllBetaScopesSelected()}
							onClick={() => {
								onAddScope(selectedScopes);
							}}
						>
							Add{" "}
							{hasItems(selectedScopes) && selectedScopes.length}{" "}
							Scope
						</Button>
					)}
				</div>
			</div>
		</>
	);
}
