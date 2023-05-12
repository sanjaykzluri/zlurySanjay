import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import search from "../../../../assets/search.svg";
import refresh_icon from "../../../../assets/icons/refresh.svg";
import noInt from "../../../../assets/icons/no-int.svg";
import noIntConnected from "../../../../assets/icons/no-screen.svg";
import ZluriLogo from "../../../../assets/zluri-integration-logo.svg";
import DownPointerIcon from "assets/integrations/down-pointer-primary.svg";
import catalogBackground from "../../../../assets/catalog-background.png";
import backIcon from "../../../../assets/back-icon.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import { convertObjToBindSelect } from "../../../../utils/convertDataToBindSelect";
import { PageHeader } from "../../../shared/components/PageHeader/PageHeader";
import { CategoryLoader } from "../../components/CategoryLoader/CategoryLoader";
import { IntegrationCard } from "../../components/IntegrationCard/IntegrationCard";
import { PendingRequest } from "../PendingRequest/PendingRequest";
import { IntegrationCardLoader } from "../../components/IntegrationCardLoader/IntegrationCardLoader";
import {
	INTEGRATION_SORT_BY,
	RECOMMENDED_INTEGRATION_SORT_BY,
} from "../../constants/constant";
import { EmptySearch } from "../../../../common/EmptySearch";
import {
	fetchCatalogBanners,
	fetchCatalogSidebar,
	fetchCategories,
	fetchEssentialIntegrations,
	fetchIntegrations,
	fetchPendingRequestIntegrations,
	fetchRecommendedIntegrations,
	fetchStaffPickIntegrations,
	resetIntegration,
	setSelectedCategory,
	setSelectedCollection,
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
import { Carousel } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import ContentLoader from "react-content-loader";
import { Integration } from "modules/integrations/model/model";
import { TriggerIssue } from "utils/sentry";
import _ from "underscore";
import CustomSlider from "UIComponents/Slider/Slider";
import { getGlobalSearchIntegrations } from "modules/integrations/service/api";
import browseIcon from "assets/browse-icon.svg";
import { PARTNER } from "modules/shared/constants/app.constants";

export function IntegrationsCatalog(props) {
	const { userRole, partner } = useContext(RoleContext);
	const history = useHistory();
	const integrations = useSelector(
		(state) => state.integrations.integrations
	);
	const essentialIntegrations = useSelector(
		(state) => state.integrations.essentialIntegrations
	);
	const recommendedIntegrations = useSelector(
		(state) => state.integrations.recommendedIntegrations
	);
	const staffPickIntegrations = useSelector(
		(state) => state.integrations.staffPickIntegrations
	);
	const categories = useSelector((state) => state.integrations.categories);
	const carousalImages = useSelector(
		(state) => state.integrations.catalogBanners
	);
	const catalogSiderbar = useSelector(
		(state) => state.integrations.catalogSidebar
	);
	const [categoriesToShow, setCategoriesToShow] = useState([]);

	const [entityName, setEntityName] = useState("");
	const [collectionsToShow, setCollectionsToShow] = useState([]);
	const [showAllCategories, setShowAllCategories] = useState(false);
	const [capabilitiesToShow, setCapabilitiesToShow] = useState([]);
	const [integrationsToShow, setIntegrationsToShow] = useState([]);
	const [integrationSearchQuery, setintegrationSearchQuery] = useState("");
	const [categorySearchQuery, setCategorySearchQuery] = useState("");
	const [searchQuery, setSearchQuery] = useState();
	const [isSearching, setIsSearching] = useState(false);

	const selectedCategory = useSelector(
		(state) => state.integrations.selectedCategory
	);
	const selectedCollection = useSelector(
		(state) => state.integrations.selectedCollection
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
	const dispatch = useDispatch();
	const router = useSelector((state) => state.router);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const cancelToken = useRef();
	const categoryId = window.location.pathname.split("/")[3];
	const { hash, pathname, query } = router.location;
	const [isLandingPage, setIsLandingPage] = useState(
		_.isEmpty(query) ? true : false
	);

	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Integrations", selectedCategory?.category_name, {
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}, [selectedCategory]);

	useEffect(() => {
		if (!_.isEmpty(query)) {
			setIsLandingPage(false);

			if (query.capability) {
				onCollectionChange(decodeURI(query.capability), false, true);
			} else if (query.collection) {
				onCollectionChange(decodeURI(query.collection), true);
				setIntegrationsToShow([]);
			} else if (query.categoryId) {
				let obj = {
					category_name: decodeURI(query.categoryName),
					category_id: query.categoryId,
				};
				onCategoryChange(obj);
			}
		}
	}, [query]);

	useEffect(() => {
		!catalogSiderbar && dispatch(fetchCatalogSidebar());
		if (catalogSiderbar?.collections)
			setCollectionsToShow(catalogSiderbar.collections);
		if (catalogSiderbar?.categories)
			setCategoriesToShow([
				{
					category_id: "all",
					category_name: "All",
					is_category_other: false,
				},
				...catalogSiderbar.categories,
			]);
		if (catalogSiderbar?.capabilities)
			setCapabilitiesToShow(catalogSiderbar.capabilities);
	}, [catalogSiderbar]);

	useEffect(() => {
		if (isLandingPage && !essentialIntegrations && !staffPickIntegrations) {
			dispatch(fetchEssentialIntegrations("Essentials"));
			dispatch(fetchStaffPickIntegrations("Staff Picks"));
		}
	}, [query, essentialIntegrations, staffPickIntegrations]);

	useEffect(() => {
		return () => {
			dispatch(resetIntegration());
			dispatch(showRecommendedCategory());
		};
	}, []);

	useEffect(() => {
		setintegrationSearchQuery("");
		if (integrations?.length) {
			setIsLoading(false);
			setIntegrationsToShow(integrations);
		}
	}, [integrations]);

	useEffect(() => {
		dispatch(fetchCatalogBanners());
	}, []);

	const onSearchCategory = (query) => {
		setCategorySearchQuery(query);
		if (query === "") {
			setShowAllCategories(false);
		} else {
			setShowAllCategories(true);
		}
		if (query && catalogSiderbar.categories?.length) {
			setCategoriesToShow(
				catalogSiderbar.categories.filter((category) =>
					category?.category_name
						?.toLowerCase()
						?.includes(query?.toLowerCase())
				)
			);
		} else {
			setCategoriesToShow([
				{
					category_id: "all",
					category_name: "All",
					is_category_other: false,
				},
				...catalogSiderbar.categories,
			]);
		}
	};

	function searchIntegrations(list, query) {
		return list.filter((integration) =>
			integration?.name?.toLowerCase()?.includes(query?.toLowerCase())
		);
	}

	async function globalSearchIntegrations(query) {
		setIsSearching(true);
		cancelToken.current = client.CancelToken.source();
		try {
			const response = await getGlobalSearchIntegrations(
				query,
				cancelToken.current
			);
			setIntegrationsToShow(response);
			setIsSearching(false);
		} catch (error) {
			if (!client.isCancel(error)) {
				TriggerIssue("error in searching global integrations", error);
			}
		}
	}

	useEffect(() => {
		if (searchQuery && cancelToken.current?.token) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery === "") setIsSearching(false);
		if (searchQuery && searchQuery != "") {
			globalSearchIntegrations(searchQuery);
			setIsSearching(true);
			setIntegrationsToShow([]);
		}
	}, [searchQuery]);

	const handleSearchQuery = (event) => {
		setSearchQuery && setSearchQuery(event.target.value);
	};

	const onSearchIntegrations = (query) => {
		setintegrationSearchQuery(query);
		if (query && integrations?.length) {
			if (showRecommended) {
				setIntegrationsToShow(searchIntegrations(integrations, query));
			} else {
				setIntegrationsToShow(searchIntegrations(integrations, query));
			}
		} else setIntegrationsToShow(integrations);
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
	const onCategoryChange = (category = {}) => {
		setSearchQuery();
		if (cancelToken.current) {
			cancelToken.current.cancel("canceled on change of category");
		}
		cancelToken.current = client.CancelToken.source();
		setIsLoading(true);
		dispatch(setSelectedCategory(category));
		setEntityName(category.category_name);
		dispatch(
			fetchIntegrations(
				category.category_id,
				sortBy?.value,
				undefined,
				cancelToken.current.token
			)
		);
		setIsLandingPage(false);
		commonSegmentTrack(`clicked on ${category.category_name} category`);
	};

	const onCollectionChange = (collection, isCollection, isCapability) => {
		setSearchQuery();
		if (cancelToken.current) {
			cancelToken.current.cancel("canceled on change of collection");
		}
		if (collection === "recommended") {
			showRecommendedIntegartion();
		} else {
			showIntegrationsByStatus(
				collection,
				sortBy?.value,
				isCollection,
				isCapability
			);
		}
		cancelToken.current = client.CancelToken.source();
		setIsLoading(true);
		setIsLandingPage(false);
		dispatch(setSelectedCollection(collection));
		setEntityName(collection);
		commonSegmentTrack(`clicked on ${collection} collection`);
	};

	const onSortBy = (v) => {
		if (cancelToken.current) {
			cancelToken.current.cancel("Request canceled on sort");
		}
		cancelToken.current = client.CancelToken.source();
		setIsLoading(true);
		commonSegmentTrack(`Clicked on Sort Integrations by ${v.label}`);
		setSortBy(v);
		if (selectedCategory?.category_id) {
			dispatch(
				fetchIntegrations(
					selectedCategory.category_id,
					v.value,
					null,
					cancelToken.current.token
				)
			);
		} else if (status || selectedCollection) {
			dispatch(
				fetchIntegrations(
					null,
					v?.value,
					status || selectedCollection,
					cancelToken.current.token,
					selectedCollection && !query?.capability ? true : false,
					query.capability ? true : false
				)
			);
		} else if (showRecommended) {
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

	const showIntegrationsByStatus = (
		v,
		sort_by,
		isCollection = false,
		isCapability = false
	) => {
		setSearchQuery();
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
				v,
				cancelToken.current.token,
				isCollection,
				isCapability
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

	useEffect(() => {
		isLandingPage && showRecommendedIntegartion();
	}, [showRecommended]);

	const showPendingRequestIntegartions = () => {
		dispatch(showPendingRequestPage());
	};

	const refreshReduxState = () => {
		if (cancelToken.current) {
			cancelToken.current.cancel("request canceled on refersh");
		}
		cancelToken.current = client.CancelToken.source();
		setIsLoading(true);
		if (showRecommended) {
			showRecommendedIntegartion();
		} else if (selectedCategory?.category_id) {
			dispatch(
				fetchIntegrations(
					selectedCategory.category_id,
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
		if (searchQuery?.length > 0 && localList?.length) return true;

		return (
			reduxLlist && localList && localList.length && reduxLlist?.length
		);
	}
	let integrationLists = [];
	integrationLists = isReadyToShow(integrations, integrationsToShow)
		? integrationsToShow.map((integration, index) => {
				return (
					<IntegrationCard
						onSuccess={() => {
							refreshReduxState();
						}}
						onRequestSent={() => {}}
						key={index}
						integration={
							searchQuery
								? new Integration(integration)
								: integration
						}
						showCatalogDetail={true}
					/>
				);
		  })
		: null;

	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Integrations");
	};

	const showSearchSort =
		["/integrations/catalog"].includes(window.location.pathname) &&
		isLandingPage
			? false
			: true;

	const SingleCategory = ({ category, entityName, index }) => {
		return (
			<li
				className={`pointer font-14 black-1 mt-1 p-2 ${
					category.category_name != "" &&
					category.category_name === entityName
						? "active"
						: ""
				}`}
				key={index}
				onClick={() => {
					history.push(
						`/integrations/catalog?categoryId=${category.category_id}&categoryName=${category.category_name}`
					);
				}}
			>
				<div
					style={{
						justifyContent: "space-between",
						alignItems: "center",
					}}
					className="flex"
				>
					<div className="font-13">{category.category_name}</div>
					<div className="grey-1 font-10 ml-2">{category.count}</div>
				</div>
			</li>
		);
	};

	return (
		<>
			{userRole === userRoles.FINANCE_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<div className="z__page z__integrations">
					<HeaderTitleBC
						showNavbarButtons={false}
						title="Integrations Catalog"
						mainLogo={
							partner?.name === PARTNER.ZLURI.name
								? ZluriLogo
								: null
						}
						inner_screen={!isLandingPage}
						entity_name={entityName}
						onMainLogoClick={() => {
							history.push("/overview");
						}}
						on_breadcrumb_click={() => {
							setIsLandingPage(true);
							setEntityName("");
						}}
						go_back_url="/integrations/catalog"
						mainUrl="/integrations"
						showCloseButton={true}
					/>
					{isLandingPage && (
						<div className="integration-catalog-header">
							<div
								style={{
									width: "400px",
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									textAlign: "center",
								}}
								className="z_i_searchbar_integrations position-relative mr-3"
							>
								<h4 className="font-20 bold-600 mb-3">
									Bring all your apps into {partner?.name}
								</h4>
								<img
									style={{ transform: "translateY(13px)" }}
									src={search}
								/>
								<input
									placeholder="Search"
									value={searchQuery}
									type="text"
									className="w-100 black-1"
									onChange={handleSearchQuery}
									// onClick={clickedOnSearch}
								/>
							</div>
						</div>
					)}
					<div className="container-fluid">
						<hr className="m-0" />
						<div className="row">
							<div
								style={{
									backgroundColor: "rgba(245, 246, 249, 1)",
									minHeight: "100vh",
									maxWidth: "20%",
								}}
								className="col-md-2 col-lg-2 p-3"
							>
								{/* {!isLandingPage && (
											<Button
												onClick={() => {
													setIsLandingPage(true);
													setEntityName("");
												}}
												className="my-2"
												type="link"
											>
												<img
													width={"6px"}
													className="mr-2"
													src={backIcon}
												/>
												Back to Catalog
											</Button>
										)} */}
								<div className="z_i_categories">
									<h4 className="font-16 bold-600 o-7 pb-1">
										Collections
									</h4>
									<hr />
									<ul
										style={{
											listStyleType: "none",
											padding: 0,
										}}
									>
										{collectionsToShow.length > 1 ? (
											collectionsToShow.map(
												(collection, index) => (
													<li
														className={`pointer font-14 black-1 mt-1 p-2 pl-3 ${
															collection.collection_name ===
															entityName
																? "active"
																: ""
														}`}
														key={index}
														onClick={() => {
															setSortBy();
															history.push(
																`/integrations/catalog?collection=${collection.collection_name}`
															);
														}}
													>
														{
															collection.collection_name
														}
													</li>
												)
											)
										) : (
											<CategoryLoader />
										)}
									</ul>
									<hr />
									<h4 className="font-16 bold-600 o-7 pb-1 mt-4">
										Capabilities
									</h4>
									<ul
										style={{
											listStyleType: "none",
											padding: 0,
										}}
									>
										{capabilitiesToShow.length > 0 ? (
											capabilitiesToShow.map(
												(category, index) =>
													category.capability_name !==
														"SAML" &&
													category.capability_name !==
														"Task Management" && (
														<li
															className={`pointer font-14 black-1 mt-1 p-2 pl-3 ${
																category.capability_name !=
																	"" &&
																category.capability_name ===
																	entityName
																	? "active"
																	: ""
															}`}
															key={index}
															onClick={() =>
																history.push(
																	`/integrations/catalog?capability=${category.capability_name}`
																)
															}
														>
															{
																category.capability_name
															}
														</li>
													)
											)
										) : (
											<CategoryLoader />
										)}
									</ul>
									<hr />
									<>
										<h4 className="font-16 bold-600 o-7 pb-1 mt-4">
											Categories
										</h4>
										<div className="z_i_searchbar position-relative mb-3">
											<img src={search} />
											<input
												placeholder="Search"
												type="text"
												className="w-100 black-1"
												onChange={(e) => {
													onSearchCategory(
														e.target.value
													);
												}}
											/>
										</div>
										<ul
											style={{
												listStyleType: "none",
												padding: 0,
											}}
										>
											{categoriesToShow.length > 0 ? (
												<>
													{categoriesToShow.map(
														(category, index) => {
															return showAllCategories ? (
																<SingleCategory
																	category={
																		category
																	}
																	entityName={
																		entityName
																	}
																	index={
																		index
																	}
																/>
															) : (
																!showAllCategories &&
																	category?.is_category_other ==
																		false && (
																		<SingleCategory
																			category={
																				category
																			}
																			entityName={
																				entityName
																			}
																			index={
																				index
																			}
																		/>
																	)
															);
														}
													)}
													{!showAllCategories && (
														<div
															onClick={() =>
																setShowAllCategories(
																	true
																)
															}
															className="mt-1 p-2 ml-1 font-14 text-primary cursor-pointer"
														>
															Other categories
															<img
																width={"8px"}
																src={
																	DownPointerIcon
																}
																className="ml-2"
															/>
														</div>
													)}
												</>
											) : categorySearchQuery.length &&
											  !categoriesToShow.length ? (
												<div className="mt-1 p-2 ml-1 font-13">
													No category found.
												</div>
											) : (
												<CategoryLoader />
											)}
										</ul>
									</>
								</div>
							</div>
							<div className="col-md-10 col-lg-10 my-2 p-4">
								{isLandingPage && !searchQuery && (
									<>
										{partner?.name ===
											PARTNER.ZLURI.name && (
											<div className="mt-1 mb-2">
												<Carousel
													indicators={false}
													controls={false}
													interval="3000"
												>
													{carousalImages?.length >
													0 ? (
														carousalImages.map(
															(image) => (
																<Carousel.Item>
																	<img
																		className="d-block w-100"
																		src={
																			image
																		}
																		alt="First slide"
																		height={
																			"auto"
																		}
																		style={{
																			objectFit:
																				"contain",
																		}}
																	/>
																</Carousel.Item>
															)
														)
													) : (
														<ContentLoader
															speed={2}
															width={1200}
															height={160}
															viewBox="0 0 1200 160"
															backgroundColor="#f3f3f3"
															foregroundColor="#ecebeb"
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
															<circle
																cx="20"
																cy="20"
																r="20"
															/>
															<rect
																x="0"
																y="-1"
																rx="0"
																ry="0"
																width="668"
																height="176"
															/>
														</ContentLoader>
													)}
												</Carousel>
											</div>
										)}
										{recommendedIntegrations &&
											recommendedIntegrations.length >
												0 && (
												<div
													style={{
														backgroundColor:
															"rgba(180, 179, 240, 0.5)",
													}}
													className="mb-1"
												>
													<div className="flex mt-2 align-items-center p-2">
														<div className="font-16 bold-600 mr-3 ml-3">
															Recommended For You
														</div>
														<div
															style={{
																overflowX:
																	"scroll",
															}}
															className="flex mt-2"
														>
															{recommendedIntegrations &&
															recommendedIntegrations?.length ? (
																recommendedIntegrations
																	.slice(0, 8)
																	.map(
																		(
																			integration,
																			index
																		) => (
																			<IntegrationCard
																				onSuccess={() => {
																					refreshReduxState();
																				}}
																				onRequestSent={() => {}}
																				key={
																					index
																				}
																				integration={
																					integration
																				}
																				style={{
																					backgroundColor:
																						"white",
																				}}
																				cardStyle="recommended"
																				showCatalogDetail={
																					true
																				}
																			/>
																		)
																	)
															) : (
																<IntegrationCardLoader height="150px" />
															)}
															{recommendedIntegrations?.length >
																4 && (
																<div
																	style={{
																		backgroundColor:
																			"rgba(255, 255, 255, 0.4)",
																		height: "165px",
																		width: "72px",
																	}}
																	className="font-11 py-6 mt-2 px-1 cursor-pointer"
																	onClick={() => {
																		history.push(
																			"/integrations"
																		);
																	}}
																>
																	{`+ ${
																		recommendedIntegrations?.length -
																		4
																	} more`}
																</div>
															)}
														</div>
													</div>
												</div>
											)}

										{essentialIntegrations ? (
											<div className="p-2 my-2">
												<div
													style={{
														justifyContent:
															"space-between",
													}}
													className="flex"
												>
													<div>Essentials</div>
													<div
														onClick={() => {
															setSortBy();
															history.push(
																`/integrations/catalog?collection=Essentials`
															);
														}}
														className="font-12 primary-color cursor-pointer"
													>
														View More
													</div>
												</div>
												<div className="flex mt-3">
													<CustomSlider
														className="z_i_similar_apps_slider"
														arrows={true}
														data={
															essentialIntegrations
														}
														slidesToShow={
															essentialIntegrations.length >
															3
																? 3.5
																: essentialIntegrations
														}
														slidesToScroll={
															essentialIntegrations.length >
															3
																? 3
																: essentialIntegrations
														}
														renderComp={(
															el,
															index
														) => (
															<IntegrationCard
																onSuccess={() => {
																	refreshReduxState();
																}}
																onRequestSent={() => {}}
																key={index}
																integration={el}
																style={{
																	backgroundColor:
																		"white",
																}}
																showCatalogDetail={
																	true
																}
															/>
														)}
														showNextButton={true}
														infinite={true}
													/>
												</div>
											</div>
										) : (
											<div className="mt-4">
												<IntegrationCardLoader className="mt-3" />
											</div>
										)}

										{staffPickIntegrations ? (
											<div className="p-2 my-2">
												<div
													style={{
														justifyContent:
															"space-between",
													}}
													className="flex"
												>
													<div>Staff picks</div>
													<div
														onClick={() => {
															setSortBy();
															history.push(
																`/integrations/catalog?collection=Staff Picks`
															);
														}}
														className="font-12 primary-color cursor-pointer"
													>
														View More
													</div>
												</div>
												<div className="flex mt-3">
													<CustomSlider
														className="z_i_similar_apps_slider"
														arrows={true}
														data={
															staffPickIntegrations
														}
														slidesToShow={
															staffPickIntegrations.length >
															3
																? 3.5
																: staffPickIntegrations
														}
														slidesToScroll={
															staffPickIntegrations.length >
															3
																? 3
																: staffPickIntegrations
														}
														renderComp={(
															el,
															index
														) => (
															<IntegrationCard
																onSuccess={() => {
																	refreshReduxState();
																}}
																onRequestSent={() => {}}
																key={index}
																integration={el}
																style={{
																	backgroundColor:
																		"white",
																}}
																showCatalogDetail={
																	true
																}
															/>
														)}
														showNextButton={true}
														infinite={true}
													/>
												</div>
											</div>
										) : (
											<IntegrationCardLoader className="mt-2" />
										)}
									</>
								)}

								<div
									style={{
										justifyContent: "space-between",
									}}
									className="flex"
								>
									<div>
										<h2 className="font-18 black-1 text-capitalize">
											{" "}
											{!isLandingPage && (
												<img
													onClick={() => {
														setIsLandingPage(true);
														setEntityName("");
													}}
													width={"6px"}
													className="mr-2 cursor-pointer"
													src={backIcon}
												/>
											)}
											{entityName}
										</h2>
									</div>
									<div>
										{showSearchSort && entityName && (
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
																e.target.value
															);
														}}
														onClick={
															clickedOnSearch
														}
													/>
												</div>
												<SelectOld
													className="m-0 mr-2"
													value={sortBy}
													placeholder="Sort by"
													options={
														showRecommended
															? convertObjToBindSelect(
																	RECOMMENDED_INTEGRATION_SORT_BY
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
								</div>

								{entityName &&
								integrationSearchQuery === "" &&
								!integrationsToShow?.length ? (
									<IntegrationCardLoader />
								) : (!isLandingPage || searchQuery) &&
								  integrationsToShow &&
								  integrationsToShow?.length > 0 ? (
									<div className="p-3 pl-4">
										{searchQuery && searchQuery.length > 0 && (
											<div>
												<h2 className="font-18 black-1 text-capitalize">
													{" "}
													{`${integrationsToShow?.length} results found for ${searchQuery}`}
												</h2>
											</div>
										)}

										<hr className="mt-2" />
										{decodeURI(query?.collection) ===
											"Available for POC" &&
											integrationsToShow?.length > 0 && (
												<div
													style={{
														backgroundColor:
															"rgba(90, 186, 255, 0.1)",
														border: "0.5px solid #5ABAFF",
														borderRadius: "4px",
													}}
													className="flex justify-content-between p-2 px-4"
												>
													<div>
														<span className="mr-1 font-14 bold-500">
															{integrationsToShow?.[0]
																?.available_to_connect
																? `Limited integrations are available for POC, upgrade ${partner?.name} to bring all your SaaS in one place.`
																: "You have connected the maximum number of integrations for POC"}
														</span>
													</div>
													<div>
														<Button
															type="link"
															className="btn btn-link btn-sm text-decoration-none"
															onClick={() => {
																history.push(
																	`/settings/billing`
																);
															}}
														>
															Upgrade Now
															<img
																width={"15px"}
																className="ml-2"
																src={browseIcon}
															/>
														</Button>
													</div>
												</div>
											)}
										<div className="d-flex mt-5 flex-wrap">
											<>
												{isSearching ? (
													<IntegrationCardLoader />
												) : integrationLists?.length ? (
													<>{integrationLists}</>
												) : integrations ? (
													integrationSearchQuery !=
													"" ? (
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
																selectedCategory?.category_name) && (
																<div className="text-center grey-1">
																	<img
																		src={
																			noInt
																		}
																	/>
																	<p className="font-18">
																		No{" "}
																		{showRecommended
																			? "Recommended"
																			: status
																			? status
																			: selectedCategory?.category_name}{" "}
																		Integrations
																		for you
																	</p>
																</div>
															)}
															{status ==
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
																		connected
																	</p>
																	<p className="font-14 grey-1">
																		Connect
																		a few
																		integrations
																		to
																		manage
																		them
																		here
																	</p>
																</div>
															)}
														</div>
													)
												) : (
													<IntegrationCardLoader />
												)}
											</>
										</div>
									</div>
								) : isSearching ? (
									<IntegrationCardLoader />
								) : integrationLists == undefined ? (
									((searchQuery && searchQuery != "") ||
										(integrationSearchQuery &&
											integrationSearchQuery != "")) && (
										<div className="mt-6 mx-auto">
											<EmptySearch
												searchQuery={
													integrationSearchQuery.length >
													1
														? integrationSearchQuery
														: searchQuery
												}
											/>
										</div>
									)
								) : (
									""
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
