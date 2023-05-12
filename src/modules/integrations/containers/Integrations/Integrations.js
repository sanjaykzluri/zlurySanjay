import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import search from "../../../../assets/search.svg";
import refresh_icon from "../../../../assets/icons/refresh.svg";
import noInt from "../../../../assets/icons/no-int.svg";
import noIntConnected from "../../../../assets/icons/no-screen.svg";
import ZluriLogo from "../../../../assets/zluri-integration-logo.svg";
import catalogBackground from "../../../../assets/catalog-background.png";
import catalogIcon from "../../../../assets/catalog-icon.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import { convertObjToBindSelect } from "../../../../utils/convertDataToBindSelect";
import { PageHeader } from "../../../shared/components/PageHeader/PageHeader";
import { CategoryLoader } from "../../components/CategoryLoader/CategoryLoader";
import { IntegrationCard } from "../../components/IntegrationCard/IntegrationCard";
import { PendingRequest } from "../PendingRequest/PendingRequest";
import { IntegrationCardLoader } from "../../components/IntegrationCardLoader/IntegrationCardLoader";
import {
	CONNECTED_INTEGRATION_SORT_BY,
	INTEGRATION_SORT_BY,
	RECOMMENDED_INTEGRATION_SORT_BY,
} from "../../constants/constant";
import { EmptySearch } from "../../../../common/EmptySearch";
import {
	fetchCategories,
	fetchIntegrations,
	fetchPendingRequestIntegrations,
	fetchRecommendedIntegrations,
	setSelectedCategory,
	showCategoryByStatus,
	showPendingRequestPage,
	showRecommendedCategory,
} from "../../redux/integrations";
import "./Integrations.css";
import RoleContext from "../../../../services/roleContext/roleContext";
import UnauthorizedToView from "../../../../common/restrictions/UnauthorizedToView";
import { userRoles } from "../../../../constants/userRole";
import { client } from "../../../../utils/client";
import HeaderTitleBC from "../../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { useHistory } from "react-router-dom";
import browseIcon from "assets/browse-icon.svg";
import { BrowseBanner } from "./BrowseBanner";
import { IntegrationError } from "modules/integrations/components/IntegrationConnectV2/IntegrationErrorState";
import { IntegrationErrorInfo } from "modules/integrations/components/IntegrationErrorInfo";
import {
	filterMap,
	filterOptions,
	integrationStatusMap,
	statusMap,
} from "modules/integrations/utils/IntegrationUtil";

export function Integrations(props) {
	const { userRole } = useContext(RoleContext);
	const integrations = useSelector(
		(state) => state.integrations.integrations
	);
	const recommendedIntegrations = useSelector(
		(state) => state.integrations.recommendedIntegrations
	);
	const history = useHistory();
	const categories = useSelector((state) => state.integrations.categories);
	const [categoriesToShow, setCategoriesToShow] = useState([]);
	const [integrationsToShow, setIntegrationsToShow] = useState([]);
	const [integrationSearchQuery, setintegrationSearchQuery] = useState("");
	const [showPendingReq, setShowPendingReq] = useState(false);
	const selectedCategory = useSelector(
		(state) => state.integrations.selectedCategory
	);
	const showRecommended = useSelector(
		(state) => state.integrations.showRecommended
	);
	const showPendingRequest = useSelector(
		(state) => state.integrations.showPendingRequest
	);
	const [isLoading, setIsLoading] = useState(false);
	const status = useSelector(
		(state) => state.integrations.showCategoryByStatus
	);
	const [sortBy, setSortBy] = useState();
	const [filterBy, setFilterBy] = useState();
	const dispatch = useDispatch();
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const cancelToken = useRef();
	const pathname = window.location.pathname.split("/")[2];
	const query = useSelector((state) => state.router.location.query);
	const [statusName, setStatusName] = useState("");

	useEffect(() => {
		!status && showIntegrationsByStatus("connected");
		setSortBy();
		setFilterBy(filterMap[query?.status || 0]);

		loadIntData(true);
	}, [query]);

	function loadIntData(refetch) {
		if (refetch) {
			showIntegrationsByStatus(
				"connected",
				undefined,
				filterMap[query?.status || 0]
			);
			return;
		}
		if (integrations) {
			let data;
			if (query?.status === "all" || !query?.status) {
				data = integrations;
			} else {
				data = integrations
					? integrations?.filter((integration) =>
							query?.status === "connected"
								? integration?.[statusMap[query?.status]] > 0 &&
								  !integration?.[statusMap["disconnected"]] &&
								  !integration?.[statusMap["error"]]
								: query?.status === "disconnected"
								? integration?.[statusMap[query?.status]] > 0 &&
								  !integration?.[statusMap["error"]]
								: integration?.[statusMap[query?.status]] > 0
					  )
					: [];
			}
			let connectedIntegrations = integrations?.filter(
				(integration) =>
					integration?.connected_accounts > 0 &&
					!integration?.disconnected_accounts &&
					!integration?.error_accounts
			);
			let disconnectedIntegrations = integrations?.filter(
				(integration) =>
					integration?.disconnected_accounts > 0 &&
					!integration?.error_accounts
			);
			let errorIntegrations = integrations?.filter(
				(integration) => integration?.error_accounts > 0
			);
			let connectedCount, disconnectedCount, erroredCount;

			connectedCount = connectedIntegrations.length;
			disconnectedCount = disconnectedIntegrations.length;
			erroredCount = errorIntegrations.length;
			setIntegrationsToShow(data);

			setStatusName(
				query?.status === "all" || !query?.status
					? disconnectedCount > 0 || erroredCount > 0
						? `${connectedCount} Connected, ${disconnectedCount} Disconnected and ${erroredCount} Errored `
						: `${connectedCount} Connected`
					: query?.status === "connected"
					? `${connectedCount} Connected`
					: query?.status === "disconnected"
					? `${disconnectedCount} Disconnected`
					: ` ${erroredCount} Errored`
			);
		}
	}

	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Integrations", selectedCategory?.name, {
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}, [selectedCategory]);

	useEffect(() => {
		if (categories?.length === 1) dispatch(fetchCategories());
		else setCategoriesToShow(categories);
	}, [categories]);

	useEffect(() => {
		setintegrationSearchQuery("");
		if (!isLoading && !integrations) {
			if (
				!sortBy?.value &&
				!selectedCategory?.id &&
				!status &&
				!showRecommended
			) {
				setIsLoading(true);
				dispatch(
					fetchIntegrations(
						null,
						null,
						null,
						cancelToken?.current?.token
					)
				);
			}
			if (!integrations && showRecommended && !recommendedIntegrations) {
				setIsLoading(true);
				dispatch(
					fetchRecommendedIntegrations(cancelToken?.current?.token)
				);
			}
			if (!integrations && status) {
				showIntegrationsByStatus(status, sortBy?.value);
			}
		}
		if (integrations?.length) {
			setIsLoading(false);
			loadIntData();
		} else if (recommendedIntegrations?.length) {
			setIsLoading(false);
			setIntegrationsToShow(recommendedIntegrations);
		}
	}, [integrations, recommendedIntegrations]);

	const onSearchCategory = (query) => {
		if (query && categories?.length)
			setCategoriesToShow(
				categories?.filter((category) =>
					category?.name
						?.toLowerCase()
						?.includes(query?.toLowerCase())
				)
			);
		else setCategoriesToShow(categories);
	};

	function searchIntegrations(list = [], query) {
		return list?.filter((integration) =>
			integration?.name?.toLowerCase()?.includes(query?.toLowerCase())
		);
	}
	const onSearchIntegrations = (query) => {
		setintegrationSearchQuery(query);
		if (
			query &&
			(integrations?.length || recommendedIntegrations?.length)
		) {
			if (showRecommended) {
				setIntegrationsToShow(
					searchIntegrations(recommendedIntegrations, query)
				);
			} else {
				setIntegrationsToShow(searchIntegrations(integrations, query));
			}
		} else
			setIntegrationsToShow(
				showRecommended ? recommendedIntegrations : integrations
			);
	};

	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Integrations",
			currentPageName: "Integrations",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const onCategoryChange = (category) => {
		if (cancelToken.current) {
			cancelToken.current.cancel("canceled on change of category");
		}
		cancelToken.current = client.CancelToken.source();
		setIsLoading(true);
		dispatch(setSelectedCategory(category));
		dispatch(
			fetchIntegrations(
				category.id,
				sortBy?.value,
				null,
				cancelToken.current.token
			)
		);
		commonSegmentTrack(`clicked on ${category.name} category`);
	};

	function onFilterBy(status) {
		history.push(`?status=${status.value}`);
	}

	const onSortBy = (v) => {
		if (cancelToken.current) {
			cancelToken.current.cancel("Request canceled on sort");
		}
		cancelToken.current = client.CancelToken.source();
		setIsLoading(true);
		commonSegmentTrack(`Clicked on Sort Integrations by ${v.label}`);
		setSortBy(v);
		if (selectedCategory?.id)
			dispatch(
				fetchIntegrations(
					selectedCategory.id,
					v.value,
					null,
					cancelToken.current.token
				)
			);
		else if (status)
			dispatch(
				fetchIntegrations(
					null,
					v?.value,
					integrationStatusMap[filterBy?.value] || status,
					cancelToken.current.token
				)
			);
		else if (showRecommended) {
			showRecommendedIntegartion(v?.value);
		} else
			dispatch(
				fetchIntegrations(
					null,
					v.value,
					null,
					cancelToken.current.token
				)
			);
	};

	const showIntegrationsByStatus = (v, sort_by, filter) => {
		if (cancelToken?.current) {
			cancelToken.current.cancel("Request canceled on change of status");
		}
		cancelToken.current = client.CancelToken.source();
		setIsLoading(true);
		dispatch(showCategoryByStatus(v));
		dispatch(
			fetchIntegrations(
				null,
				sort_by,
				integrationStatusMap[filter?.value || "all"],
				cancelToken.current.token
			)
		);
	};

	const showRecommendedIntegartion = (sort_by) => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Request canceled for fetching recommended integrations"
			);
		}
		cancelToken.current = client.CancelToken.source();
		setIsLoading(true);
		dispatch(showRecommendedCategory());
		dispatch(
			fetchRecommendedIntegrations(cancelToken.current.token, sort_by)
		);
	};

	const showPendingRequestIntegartions = () => {
		setShowPendingReq(true);
		dispatch(showPendingRequestPage());
	};

	const refreshReduxState = () => {
		if (cancelToken.current) {
			cancelToken.current.cancel("request canceled on refersh");
		}
		cancelToken.current = client.CancelToken.source();
		setIsLoading(true);
		if (showRecommended) {
			showRecommendedIntegartion(sortBy?.value);
		} else if (selectedCategory?.id) {
			dispatch(
				fetchIntegrations(
					selectedCategory.id,
					sortBy?.value,
					null,
					cancelToken.current.token
				)
			);
		} else {
			dispatch(
				fetchIntegrations(
					null,
					sortBy?.value,
					status,
					cancelToken.current.token
				)
			);
		}
		commonSegmentTrack("Refresh Button Clicked");
	};
	function isReadyToShow(reduxLlist, localList) {
		return (
			reduxLlist && localList && localList.length && reduxLlist?.length
		);
	}
	let integrationLists = [];
	if (showRecommended) {
		integrationLists = isReadyToShow(
			recommendedIntegrations,
			integrationsToShow
		)
			? integrationsToShow.map((integration, index) => {
					return (
						<IntegrationCard
							onSuccess={() => {
								refreshReduxState();
							}}
							onRequestSent={() => {}}
							key={index}
							integration={integration}
						/>
					);
			  })
			: null;
	} else
		integrationLists = isReadyToShow(integrations, integrationsToShow)
			? integrationsToShow.map((integration, index) => (
					<IntegrationCard
						onSuccess={() => {
							refreshReduxState();
						}}
						onRequestSent={() => {}}
						key={index}
						integration={integration}
					/>
			  ))
			: null;

	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Integrations");
	};

	const showSearchSort = ["/integrations/catalog"].includes(
		window.location.pathname
	)
		? false
		: true;

	return (
		<>
			{userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<div className="z__page z__integrations">
					<HeaderTitleBC title="Integrations" />
					<div className="container-fluid">
						<hr className="m-0" />
						<div className="row">
							<div
								style={{
									backgroundColor: "rgba(245, 246, 249, 1)",
									minHeight: "100vh",
								}}
								className="col-md-2 col-lg-2 p-2 pl-3"
							>
								<div className="z_i_categories">
									<div className="font-16 o-7 pb-1">
										For you
									</div>
									<ul
										style={{
											listStyleType: "none",
											padding: 0,
										}}
									>
										<li
											className={`pointer font-14 black-1 mt-1 p-2 ${
												!selectedCategory &&
												!status &&
												showRecommended
													? "active"
													: ""
											}`}
											onClick={() => {
												setSortBy();
												showRecommendedIntegartion();
												setShowPendingReq(false);
											}}
										>
											Recommended
										</li>
										<li
											className={`pointer font-14 black-1 mt-1 p-2 ${
												!selectedCategory &&
												status === "connected"
													? "active"
													: ""
											}`}
											onClick={() => {
												setSortBy();
												showIntegrationsByStatus(
													"connected"
												);
												setShowPendingReq(false);
											}}
										>
											Connected
										</li>
										<li
											className={`pointer font-14 black-1 mt-1 p-2 ${
												!selectedCategory &&
												showPendingRequest
													? "active"
													: ""
											}`}
											onClick={() =>
												showPendingRequestIntegartions()
											}
										>
											Connection Requests
										</li>
									</ul>
									<hr />
									<div
										onClick={() =>
											history.push(
												"/integrations/catalog"
											)
										}
										className="cursor-pointer"
									>
										<img
											className="ml-1"
											width={"172px"}
											height="74px"
											src={catalogIcon}
										/>
									</div>
								</div>
							</div>
							<div className="col-md-10 col-lg-10">
								{!showPendingRequest ? (
									<div className="p-3 pl-4">
										<div
											style={{
												justifyContent: "space-between",
												alignItems: "center",
											}}
											className="flex"
										>
											<div>
												<div className="font-18 black-1 text-capitalize">
													{" "}
													{showRecommended
														? "Recommended"
														: status
														? status
														: selectedCategory?.name}{" "}
													Integrations
												</div>
											</div>

											{showSearchSort && (
												<div className="d-flex">
													<div className="z_i_searchbar_integrations position-relative mr-3">
														<img src={search} />
														<input
															placeholder="Search"
															value={
																integrationSearchQuery
															}
															type="text"
															className="w-100 black-1"
															onChange={(e) => {
																onSearchIntegrations(
																	e.target
																		.value
																);
															}}
															onClick={
																clickedOnSearch
															}
														/>
													</div>
													<>
														{!showRecommended &&
															!showPendingRequest && (
																<SelectOld
																	className="m-0 mr-2"
																	value={
																		filterBy
																	}
																	placeholder="Show all"
																	options={
																		filterOptions
																	}
																	onSelect={(
																		v
																	) => {
																		onFilterBy(
																			v
																		);
																	}}
																	key={
																		showRecommended
																			? showRecommended
																			: selectedCategory
																	}
																/>
															)}
													</>
													<SelectOld
														className="m-0 mr-2"
														value={sortBy}
														placeholder="Sort by"
														options={
															showRecommended
																? convertObjToBindSelect(
																		RECOMMENDED_INTEGRATION_SORT_BY
																  )
																: !showRecommended &&
																  !showPendingRequest
																? convertObjToBindSelect(
																		CONNECTED_INTEGRATION_SORT_BY
																  )
																: convertObjToBindSelect(
																		INTEGRATION_SORT_BY
																  )
														}
														onSelect={(v) => {
															onSortBy(v);
														}}
														key={
															showRecommended
																? showRecommended
																: selectedCategory
														}
													/>
													{/* <Button
															type="normal"
															className="border-1 border-radius-4  pt-1 pb-1"
															onClick={() =>
																refreshReduxState()
															}
														>
															<img
																className=""
																src={
																	refresh_icon
																}
															/>
														</Button> */}
												</div>
											)}
										</div>
										{!showRecommended &&
											!showPendingRequest &&
											integrationLists?.length > 0 && (
												<div className="font-13">{`${statusName}`}</div>
											)}
										<>
											{!showPendingRequest && (
												<BrowseBanner
													imageBanner={
														showRecommended
															? true
															: false
													}
												/>
											)}
										</>
										<>
											{!showRecommended &&
												!showPendingRequest &&
												(query?.status === "all" ||
													!query?.status) && (
													<IntegrationErrorInfo
														classProp="mx-auto"
														type="connected"
														integrations={
															integrationsToShow
														}
													/>
												)}
										</>
										<div className="d-flex mt-5 flex-wrap">
											{integrationLists?.length ? (
												integrationLists
											) : (
													showRecommended
														? recommendedIntegrations
														: integrations
											  ) ? (
												integrationSearchQuery ? (
													<div className="mt-6 mx-auto">
														<EmptySearch
															searchQuery={
																integrationSearchQuery
															}
														/>
													</div>
												) : (
													<div className="mx-auto mt-6">
														{(showRecommended ||
															selectedCategory?.name) && (
															<div className="text-center grey-1">
																<img
																	src={noInt}
																/>
																<p className="font-18">
																	No{" "}
																	{showRecommended
																		? "Recommended"
																		: status
																		? status
																		: selectedCategory?.name}{" "}
																	Integrations
																	for you
																</p>
															</div>
														)}
														{status ===
															"connected" && (
															<div className="text-center grey-1">
																<img
																	src={
																		noIntConnected
																	}
																/>
																<p className="font-18 grey-1">
																	No
																	Integrations
																	found
																</p>
																<p className="font-14 grey-1">
																	Browse
																	catalog to
																	connect
																	integrations
																</p>
																<Button
																	className="d-flex"
																	onClick={() => {
																		history.push(
																			"/integrations/catalog"
																		);
																	}}
																	style={{
																		margin: "0 auto",
																	}}
																>
																	Browse
																	Catalog
																</Button>
															</div>
														)}
													</div>
												)
											) : (
												<IntegrationCardLoader />
											)}
										</div>
									</div>
								) : (
									<PendingRequest
										showPendingReq={showPendingReq}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

function shIntegrationType(isRecommended, status, selectedCategoryNm) {
	let type = `${status ? status : selectedCategoryNm} Integrations`;
	if (isRecommended) {
		type = "Recommended";
	}
	return type;
}

function isTruthy(flag) {
	return flag ? true : false;
}
