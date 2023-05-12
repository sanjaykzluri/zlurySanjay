import React, { useContext, useEffect, useRef, useState } from "react";
import tickmark from "../../../assets/tick-mark.svg";
import search from "../../../assets/search.svg";
import onboarding from "../../../assets/onboarding.svg";
import triggerBasedIcon from "assets/integrations/trigger-based.svg";
import otherActionIcon from "assets/integrations/other-actions.svg";
import { useSelector } from "react-redux";
import { capitalizeFirstLetter } from "utils/common";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import downArrow from "assets/down_arrow.svg";
import ContentLoader from "react-content-loader";
import ScopeDetailCard, { entityImageMapper } from "./scopeDetailCard";
import { client } from "utils/client";
import { TriggerIssue } from "utils/sentry";
import { SCOPES_FILTERS } from "../constants/constant";
import {
	getIntegrationsCapabilities,
	getIntegrationFeatures,
	getIntegrationWorkflowActions,
	getIntegrationScopes,
} from "../service/api";
import RoleContext from "services/roleContext/roleContext";

const IntegrationCapabilities = (props) => {
	const [integrationCapabilities, setIntegrationCapabilites] = useState();
	const [integrationScopes, setIntegrationScopes] = useState();
	const [workflowActions, setWorkflowActions] = useState();
	const [workflowActionsSearch, setWorkflowActionsSearch] = useState();
	const [isScopesLoading, setIsScopesLoading] = useState(true);
	const [isActionsLoading, setIsActionsLoading] = useState(true);
	const [scopesFilters, setScopesFilters] = useState();
	const [selectedWorkflowActionFilter, setSelectedWorkflowActionFilter] =
		useState("All");
	const [selectedFilter, setSelectedFilter] = useState(SCOPES_FILTERS);
	const cancelToken = useRef();
	const integration = useSelector((state) => state.integrations.integration);
	const integrationId = window.location.pathname.split("/")[4];
	const [searchQuery, setSearchQuery] = useState();
	const [actionSearchQuery, setActionSearchQuery] = useState();
	const { partner } = useContext(RoleContext);

	async function loadScopes(filter, isSearchQuery) {
		try {
			let data = await getIntegrationScopes(
				integrationId,
				filter,
				cancelToken.current,
				searchQuery
			);
			data.map((val) => {
				val.integration_scope_reason =
					val.integration_scope_reason.replaceAll(
						"Zluri",
						partner?.name
					);

				val.scope_optimal_explanation =
					val.scope_optimal_explanation.replaceAll(
						"Zluri",
						partner?.name
					);
			});
			setIsScopesLoading(false);
			setIntegrationScopes(data);
		} catch (error) {
			setIsScopesLoading(false);
			TriggerIssue("Error in Loading scopes", error);
		}
	}

	async function loadWorkflowActions(filter) {
		try {
			let data = await getIntegrationWorkflowActions(
				integrationId,
				filter
			);
			setIsActionsLoading(false);
			setWorkflowActions(data);
			setWorkflowActionsSearch(data);
		} catch (error) {
			setIsActionsLoading(false);
			TriggerIssue("Error in Loading scopes", error);
		}
	}

	useEffect(() => {
		async function loadData() {
			try {
				let data = await getIntegrationsCapabilities(integrationId);
				setIntegrationCapabilites(data);
			} catch (error) {
				TriggerIssue("Error in integration capabilities", error);
			}
		}
		async function loadScopesFilters() {
			try {
				let data = await getIntegrationFeatures(integrationId);
				setScopesFilters({
					features: data.features,
					plans: data.plans,
					entities: data.entities,
				});
			} catch (error) {
				TriggerIssue("Error in scopes filters", error);
			}
		}
		loadData();
		loadScopes();
		loadWorkflowActions();
		loadScopesFilters();
	}, []);

	useEffect(() => {
		if (cancelToken.current?.token) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery || searchQuery === "") {
			cancelToken.current = client.CancelToken.source();
			loadScopes(selectedFilter, searchQuery, true);
		}
	}, [searchQuery]);

	async function handleScopeFilter(option, filterType) {
		setIsScopesLoading(true);
		let obj = { ...selectedFilter };
		obj[filterType] = option;
		setSelectedFilter(obj);
		loadScopes(obj, searchQuery);
	}

	async function handleWorkflowActionFilter(option) {
		setIsActionsLoading(true);
		setActionSearchQuery("");
		let selectedType = option?.toLowerCase();
		setSelectedWorkflowActionFilter(selectedType);
		loadWorkflowActions(selectedType);
	}

	function searchScopes(query, isSearchQuery) {
		setIsScopesLoading(true);
		setSearchQuery && setSearchQuery(query || "");
	}

	function searchWorkflowActions(query) {
		let results = { ...workflowActions };
		setActionSearchQuery(query);
		if (query === "") {
			setWorkflowActions(workflowActionsSearch);
		} else {
			let searchResults = workflowActions?.actions?.filter((action) =>
				action?.name?.toLowerCase()?.includes(query?.toLowerCase())
			);
			results.actions = searchResults;
			setWorkflowActions(results);
		}
	}

	return (
		<div className="p-2 mb-8">
			{integrationCapabilities?.integration_details &&
				Array.isArray(integrationCapabilities?.integration_details) && (
					<>
						<h4 className="font-16 bold-600 my-4">
							Integration Details
						</h4>
						<hr />
						<div
							style={{ flexWrap: "wrap", fontSize: "14px" }}
							className="flex mb-4"
						>
							{Array.isArray(
								integrationCapabilities?.integration_details
							) && integrationCapabilities?.integration_details
								? integrationCapabilities?.integration_details.map(
										(capability) =>
											capability.label && (
												<div
													className="py-1"
													style={{ width: "25%" }}
												>
													<img
														width={"10px"}
														className="mx-2"
														src={tickmark}
													/>
													{capability.label}
												</div>
											)
								  )
								: ""}
						</div>
					</>
				)}

			{
				<>
					<div
						className="flex my-3 mt-5"
						style={{
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<div>
							{" "}
							<h4 className="font-16 bold-600">Scopes</h4>
						</div>
						<div style={{ color: "rgba(34, 102, 226, 1)" }}>
							<div className="z_i_searchbar_integrations position-relative mr-3">
								<img src={search} />
								<input
									placeholder="Search"
									value={searchQuery}
									type="text"
									className="w-100 black-1"
									style={{
										backgroundColor:
											"rgba(245, 246, 249, 1)",
									}}
									onChange={(e) => {
										searchScopes(e.target.value);
									}}
								/>
							</div>
						</div>
					</div>
					<hr />
					<div className="d-flex justify-content-between align-items-center my-3 z__show_all_label px-4">
						<div className="d-flex justify-content-center align-items-center __show_all font-12 grey-1">
							Showing{" "}
							<span className="bold-600 grey-1 mx-2">
								{integrationScopes?.length}
							</span>{" "}
							scopes
						</div>
						<div className="flex font-12 color-gray-2">
							<div className="flex">
								<div className="mr-1 grey-1">Feature</div>
								<div>
									<Dropdown
										onOptionSelect={(feature) =>
											handleScopeFilter(
												feature,
												"feature"
											)
										}
										options={[
											"All",
											...(scopesFilters?.features || []),
										]}
										toggler={
											<div
												className="d-flex align-items-center mr-1"
												style={{
													minWidth: "30px",
												}}
											>
												<div className="font-12 o-5 grey-1">
													{capitalizeFirstLetter(
														selectedFilter.feature
													)}
												</div>
												<img
													src={downArrow}
													style={{
														marginLeft: "4px",
													}}
												/>
											</div>
										}
									/>
								</div>
							</div>
							<div className="flex">
								<div className="mr-1 grey-1">Type</div>
								<div>
									<Dropdown
										onOptionSelect={(type) =>
											handleScopeFilter(type, "type")
										}
										options={["All", "Read", "Write"]}
										toggler={
											<div
												className="d-flex align-items-center mr-1"
												style={{
													minWidth: "50px",
												}}
											>
												<div className="font-12 o-5 grey-1">
													{capitalizeFirstLetter(
														selectedFilter.type
													)}
												</div>
												<img
													src={downArrow}
													style={{
														marginLeft: "4px",
													}}
												/>
											</div>
										}
									/>
								</div>
							</div>
							<div className="flex">
								<div className="mr-1 grey-1">Entities</div>
								<div>
									<Dropdown
										onOptionSelect={(entity) =>
											handleScopeFilter(entity, "entity")
										}
										options={[
											"All",
											...(scopesFilters?.entities || []),
										]}
										toggler={
											<div
												className="d-flex align-items-center mr-1"
												style={{
													minWidth: "30px",
												}}
											>
												<div className="font-12 o-5 grey-1">
													{capitalizeFirstLetter(
														selectedFilter.entity
													)}
												</div>
												<img
													src={downArrow}
													style={{
														marginLeft: "4px",
													}}
												/>
											</div>
										}
									/>
								</div>
							</div>
							<div className="flex">
								<div className="mr-1 grey-1">Plan</div>
								<div>
									<Dropdown
										onOptionSelect={(plan) =>
											handleScopeFilter(plan, "plan")
										}
										options={[
											"All",
											...(scopesFilters?.plans || []),
										]}
										toggler={
											<div
												className="d-flex align-items-center mr-1"
												style={{
													minWidth: "50px",
												}}
											>
												<div className="font-12 o-5 grey-1">
													{capitalizeFirstLetter(
														selectedFilter.plan
													)}
												</div>
												<img
													src={downArrow}
													style={{
														marginLeft: "4px",
													}}
												/>
											</div>
										}
									/>
								</div>
							</div>
						</div>
					</div>
					<div
						style={{
							flexWrap: "wrap",
							fontSize: "14px",
							maxHeight: "400px",
							overflowY: "scroll",
						}}
						className="flex"
					>
						{isScopesLoading ? (
							<div className="flex">
								<ContentLoader
									speed={2}
									width={428}
									height={94}
									viewBox="0 0 428 94"
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
										width="428"
										height="94"
									/>
								</ContentLoader>
								<ContentLoader
									speed={2}
									width={428}
									height={94}
									viewBox="0 0 428 94"
									backgroundColor="#f3f3f3"
									foregroundColor="#ecebeb"
									{...props}
								>
									<rect
										x="0"
										y="0"
										rx="4"
										ry="4"
										width="428"
										height="94"
									/>
								</ContentLoader>
							</div>
						) : integrationScopes &&
						  Array.isArray(integrationScopes) &&
						  integrationScopes.length > 0 ? (
							integrationScopes?.map((scope, index) => (
								<ScopeDetailCard scope={scope} index={index} />
							))
						) : (
							<div
								style={{ margin: "0 auto" }}
								className="mt-4 font-16"
							>
								No Scopes Available
							</div>
						)}
					</div>
				</>
			}

			{Array.isArray(workflowActions?.actions) &&
				(actionSearchQuery?.length ||
					workflowActions?.actions?.length > 0) && (
					<>
						<div
							className="flex mt-5"
							style={{
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<div>
								{" "}
								<h4 className="font-16 bold-600 my-4">
									Workflow Actions
								</h4>
							</div>
							<div style={{ color: "rgba(34, 102, 226, 1)" }}>
								<div className="z_i_searchbar_integrations position-relative mr-3">
									<img src={search} />
									<input
										placeholder="Search"
										value={actionSearchQuery}
										type="text"
										className="w-100 black-1"
										style={{
											backgroundColor:
												"rgba(245, 246, 249, 1)",
										}}
										onChange={(e) => {
											searchWorkflowActions(
												e.target.value
											);
										}}
									/>
								</div>
							</div>
						</div>
						<hr />
						<div className="d-flex justify-content-between align-items-center mb-3 z__show_all_label px-4">
							<div className="d-flex justify-content-center align-items-center __show_all font-12 grey-1">
								Showing{" "}
								<span className="bold-600 grey-1 mx-2">
									{workflowActions?.actions?.length}
								</span>{" "}
								Actions
							</div>
							<div className="d-flex justify-content-center align-items-center __show_all font-12 color-gray-2">
								<div className="flex">
									<div className="mr-1 grey-1">Type</div>
									<div>
										<Dropdown
											onOptionSelect={(type) =>
												handleWorkflowActionFilter(type)
											}
											options={[
												"All",
												"Onboarding",
												"Offboarding",
											]}
											toggler={
												<div
													className="d-flex align-items-center"
													style={{
														width: "90px",
													}}
												>
													<div className="font-12 o-5 grey">
														{capitalizeFirstLetter(
															selectedWorkflowActionFilter
														)}
													</div>
													<img
														src={downArrow}
														style={{
															marginLeft: "4px",
														}}
													/>
												</div>
											}
										/>
									</div>
								</div>
							</div>
						</div>
						<div
							style={{
								flexWrap: "wrap",
								fontSize: "14px",
								maxHeight: "400px",
								overflowY: "scroll",
							}}
							className="flex"
						>
							{isActionsLoading ? (
								<div className="flex">
									<ContentLoader
										speed={2}
										width={476}
										height={124}
										viewBox="0 0 476 124"
										backgroundColor="#f3f3f3"
										foregroundColor="#ecebeb"
										className="mr-2"
										{...props}
									>
										<rect
											x="48"
											y="8"
											rx="3"
											ry="3"
											width="88"
											height="6"
										/>
										<rect
											x="48"
											y="26"
											rx="3"
											ry="3"
											width="52"
											height="6"
										/>
										<rect
											x="0"
											y="56"
											rx="3"
											ry="3"
											width="410"
											height="6"
										/>
										<rect
											x="0"
											y="72"
											rx="3"
											ry="3"
											width="380"
											height="6"
										/>
										<rect
											x="0"
											y="88"
											rx="3"
											ry="3"
											width="178"
											height="6"
										/>
										<circle cx="20" cy="20" r="20" />
									</ContentLoader>
									<ContentLoader
										speed={2}
										width={476}
										height={124}
										viewBox="0 0 476 124"
										backgroundColor="#f3f3f3"
										foregroundColor="#ecebeb"
										className="mr-2"
										{...props}
									>
										<rect
											x="48"
											y="8"
											rx="3"
											ry="3"
											width="88"
											height="6"
										/>
										<rect
											x="48"
											y="26"
											rx="3"
											ry="3"
											width="52"
											height="6"
										/>
										<rect
											x="0"
											y="56"
											rx="3"
											ry="3"
											width="410"
											height="6"
										/>
										<rect
											x="0"
											y="72"
											rx="3"
											ry="3"
											width="380"
											height="6"
										/>
										<rect
											x="0"
											y="88"
											rx="3"
											ry="3"
											width="178"
											height="6"
										/>
										<circle cx="20" cy="20" r="20" />
									</ContentLoader>
								</div>
							) : workflowActions?.actions?.length > 0 ? (
								workflowActions?.actions?.map(
									(action, index) => (
										<div
											style={{
												width: "31%",
												backgroundColor:
													"rgba(252, 252, 253, 1)",
												border: "1px solid #EBEBEB",
											}}
											className="p-4 mr-3 my-3"
										>
											<div
												className="flex"
												style={{
													justifyContent:
														"space-between",
												}}
											>
												<div>
													{" "}
													<img
														width={"24px"}
														className="pt-2"
														src={
															workflowActions?.logo_url
														}
													/>
												</div>
												{action?.actionType ===
												"trigger" ? (
													<div
														style={{
															backgroundColor:
																"rgba(118, 164, 246, 0.1)",
															textAlign: "center",
															borderRadius: "2px",
															height: "20px",
														}}
														className=""
													>
														<span
															style={{
																color: "rgba(118, 164, 246, 1)",
															}}
															className="px-1 py-1 font-11 flex align-items-center"
														>
															<img
																className="mr-1"
																src={
																	triggerBasedIcon
																}
															/>
															Trigger Based
														</span>
													</div>
												) : action?.type ===
												  "manual" ? (
													<div
														style={{
															backgroundColor:
																"rgba(90, 186, 255, 0.1)",
															textAlign: "center",
															color: "#5ABAFF",
															borderRadius: "2px",
															height: "20px",
														}}
														className=""
													>
														<span
															style={{
																color: "#5ABAFF",
															}}
															className="px-1 py-1 font-11 flex align-items-center"
														>
															<img
																className="mr-1"
																src={
																	otherActionIcon
																}
															/>
															Manual Task
														</span>
													</div>
												) : action?.metaData?.types?.[0]
														?.name &&
												  action?.metaData?.types?.[0]
														?.name !== "" ? (
													<div
														style={{
															backgroundColor:
																"rgba(113, 90, 255, 0.1)",
															textAlign: "center",
															borderRadius: "2px",
															height: "20px",
														}}
														className=""
													>
														<span className="px-1 py-1 font-11">
															<img
																className="pt-1"
																src={onboarding}
															/>
															{capitalizeFirstLetter(
																action?.metaData
																	?.types?.[0]
																	?.name
															)}
														</span>
													</div>
												) : (
													<div
														style={{
															backgroundColor:
																"rgba(90, 186, 255, 0.1)",
															textAlign: "center",
															color: "#5ABAFF",
															borderRadius: "2px",
															height: "20px",
														}}
														className=""
													>
														<span className="px-1 py-1 font-11 flex align-items-center">
															<img
																className="mr-1"
																src={
																	otherActionIcon
																}
															/>
															{action?.type ===
															"manual"
																? "Manual"
																: "Others"}
														</span>
													</div>
												)}
											</div>
											<div className="bold-500 font-13 py-2">
												{action.name}
											</div>
											<div className="py-2 font-12">
												{action.description}
											</div>
										</div>
									)
								)
							) : (
								<div
									style={{ margin: "0 auto" }}
									className="mt-4 font-16"
								>
									No workflow actions
								</div>
							)}
						</div>
					</>
				)}
			{integrationCapabilities?.pii_data_available &&
				Array.isArray(integrationCapabilities?.pii_data_available) && (
					<>
						<h4 className="font-16 bold-600 pt-4 mt-4">
							Personally Identifiable Information
						</h4>
						<div className="font-12 grey-1">
							The following data may be collected and linked to
							your identity
						</div>
						<hr />
						<div style={{ flexWrap: "wrap" }} className="flex">
							{integrationCapabilities?.pii_data_available &&
								integrationCapabilities.pii_data_available.map(
									(information) => (
										<div
											className="py-1 font-14"
											style={{ width: "25%" }}
										>
											{information.icon && (
												<img
													width={"20px"}
													height={"20px"}
													className="mx-1"
													src={information.icon}
												/>
											)}
											{information.pii_data_attribute}
										</div>
									)
								)}
						</div>
					</>
				)}
		</div>
	);
};

export default IntegrationCapabilities;
