import HeaderTitleBC from "components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { AppCard } from "../components/appCard";
import right from "assets/icons/circle-arrow-right.svg";
import noAppsFound from "assets/employee/noAppsFound.png";
import { Button } from "UIComponents/Button/Button";
import { CategoryWithApps } from "../components/categoryViewer";
import { ListOfCategories } from "../components/listOfCategories";
import {
	getAppLauncherData,
	getDeptMostUsedApps,
	getOrgMostUsedApps,
} from "services/api/employeeDashboard";
import ContentLoader from "react-content-loader";
import { useSelector } from "react-redux";
import { ListOfApplications } from "../components/ListOfApplications";
import { TriggerIssue } from "utils/sentry";
import { trackPageSegment } from "modules/shared/utils/segment";
import left from "assets/icons/arrow-button-circle-left.svg";

export function EmployeeApplications() {
	const [selectedCategory, setSelectedCategory] = useState();
	const [searchQuery, setSearchQuery] = useState("");
	const [mostUsedApps, setMostUsedApps] = useState();
	const [loadingMostUsedApps, setLoadingMostUsedApps] = useState(false);
	const [activeCategory, setActiveCategory] = useState();
	const [defaultCategory, setDefaultCategory] = useState();
	const [categoryView, setCategoryView] = useState(false);
	const { userInfo } = useSelector((state) => state);

	useEffect(() => {
		if (loadingMostUsedApps) {
			if (selectedCategory === "Org") {
				callOrgMostUsedApps();
			}
			if (selectedCategory === "Dept") {
				callDeptMostUsedApps();
			}
		}
	}, [selectedCategory]);

	useEffect(() => {
		trackPageSegment("Employee View", `Applications `, {
			notes: `App store applications viewed`,
		});
	}, []);

	const callDeptMostUsedApps = () => {
		setLoadingMostUsedApps(true);
		getDeptMostUsedApps()
			.then((res) => {
				if (res) {
					setMostUsedApps(res?.data);
					setLoadingMostUsedApps(false);
				}
			})
			.catch((err) => {
				TriggerIssue(
					"Error in fetching department most used apps",
					err
				);
				setMostUsedApps([]);
				setLoadingMostUsedApps(false);
			});
	};

	const callOrgMostUsedApps = () => {
		setLoadingMostUsedApps(true);
		getOrgMostUsedApps()
			.then((res) => {
				if (res) {
					setMostUsedApps(res?.data);
					setLoadingMostUsedApps(false);
				}
			})
			.catch((err) => {
				TriggerIssue(
					"Error in fetching organization most used apps",
					err
				);
				setMostUsedApps([]);
				setLoadingMostUsedApps(false);
			});
	};

	useEffect(() => {
		if (userInfo.apps_permissions) {
			setSelectedCategory(
				userInfo.apps_permissions.show_org_apps
					? "Org"
					: userInfo.apps_permissions.show_dept_apps
					? "Dept"
					: "Employee"
			);
			if (
				userInfo.apps_permissions.show_org_apps ||
				userInfo.apps_permissions.show_dept_apps
			) {
				setLoadingMostUsedApps(true);
			} else {
				setLoadingMostUsedApps(false);
			}
		}
	}, [userInfo]);
	const onCategoryChange = (category) => {
		if (category !== selectedCategory) {
			setLoadingMostUsedApps(true);
			returnFromCategory();
			setSelectedCategory(category);
		}
	};

	const [nav, setNav] = useState(null);
	let slider = [];
	const slideNext = () => {
		slider.slickNext();
	};
	const slidePrev = () => {
		slider.slickPrev();
	};

	const returnFromCategory = () => {
		setActiveCategory(defaultCategory);
		setCategoryView(false);
	};

	return (
		<>
			<HeaderTitleBC
				title={"Applications"}
				inner_screen={categoryView}
				on_breadcrumb_click={returnFromCategory}
				entity_name={categoryView && activeCategory.category_name}
			/>
			<hr style={{ margin: "0px 40px" }}></hr>
			<div
				className="z_i_body d-flex align-content-stretch align-items-stretch"
				style={{ height: "calc(100% - 140px" }} // change to 75px after removing beta tag
			>
				<div className="z_i_sidebar p-3 pl-4 pr-4 h-100">
					<div className="z_i_categories">
						<h4 className="font-12 o-7 grey-1 mt-4">For you</h4>
						<ul
							style={{
								listStyleType: "none",
								padding: 0,
							}}
						>
							<li
								hidden={
									!userInfo.apps_permissions.show_org_apps
								}
								className={`pointer font-14 black-1 mt-1 p-2 pl-3 ${
									selectedCategory === "Org" ? "active" : ""
								}`}
								onClick={() => onCategoryChange("Org")}
							>
								{`Apps in ${userInfo.org_name}`}
							</li>
							<li
								hidden={
									!userInfo.apps_permissions.show_dept_apps
								}
								className={`pointer font-14 black-1 mt-1 p-2 pl-3 ${
									selectedCategory === "Dept" ? "active" : ""
								}`}
								onClick={() => onCategoryChange("Dept")}
							>
								Apps in Dept
							</li>
							<li
								hidden={
									!userInfo.apps_permissions.show_emp_apps
								}
								className={`pointer font-14 black-1 mt-1 p-2 pl-3 ${
									selectedCategory === "Employee"
										? "active"
										: ""
								}`}
								onClick={() => onCategoryChange("Employee")}
							>
								Your Apps
							</li>
						</ul>
					</div>
				</div>
				<div className="z_i_main  p-3 pl-4">
					{categoryView && (
						<div
							className="font-14 primary-color cursor-pointer mb-3"
							onClick={returnFromCategory}
						>
							Back
						</div>
					)}
					<div className="z_i_main_header position-relative">
						<h3 className="font-18 black-1 text-capitalize">
							{categoryView
								? activeCategory.category_name
								: selectedCategory === "Org"
								? "Applications in your Organization"
								: selectedCategory === "Dept"
								? "Applications in your Department"
								: "Your Applications"}
						</h3>
					</div>
					<hr className="mx-0" style={{ marginTop: "25px" }}></hr>
					{(selectedCategory === "Org" ||
						selectedCategory === "Dept") && (
						<>
							<div className="font-16 mt-4 black-1">
								{categoryView
									? "Most used in your Organization"
									: " Most Used"}
							</div>
							<div className="mt-4 position-relative">
								{loadingMostUsedApps ? (
									<div className="d-flex align-items-center">
										{[1, 2, 3, 4].map((el, index) => (
											<div
												className="d-flex flex-column"
												style={{
													marginLeft:
														index > 0
															? "30px"
															: "0px",
												}}
											>
												<div className="d-flex employee-app-card-box-1">
													<ContentLoader
														width={70}
														height={70}
													>
														<rect
															width={70}
															height={70}
															fill="#EBEBEB"
														/>
													</ContentLoader>
												</div>
												<div className="font-14 bold-600 mt-2">
													<ContentLoader
														width={150}
														height={18}
													>
														<rect
															width={150}
															height={18}
															fill="#EBEBEB"
														/>
													</ContentLoader>
												</div>
												<div className="grey o-7 mt-1 font-10">
													<ContentLoader
														width={71}
														height={13}
													>
														<rect
															y={0}
															width={71}
															height={13}
															fill="#EBEBEB"
														/>
													</ContentLoader>
												</div>
											</div>
										))}
									</div>
								) : (
									<>
										{!mostUsedApps?.length ? (
											<>
												<div className="d-flex flex-column align-items-center">
													<img
														src={noAppsFound}
														width={200}
														height={133}
													/>
													<div className="font-16 bold-500">
														No Apps Found
													</div>
												</div>
											</>
										) : (
											<Slider
												arrows={false}
												asNavFor={nav}
												infinite={false}
												autoplay={false}
												variableWidth={true}
												ref={(c) => (slider = c)}
											>
												{categoryView
													? mostUsedApps
															.filter(
																(el) =>
																	el.app_category_name ===
																	activeCategory.category_name
															)
															.map(
																(
																	app,
																	index
																) => (
																	<AppCard
																		inSlider={
																			true
																		}
																		key={
																			index
																		}
																		app={
																			app
																		}
																		innerClassname={
																			"employee-app-card-box-1 cursor-pointer"
																		}
																		height={
																			"auto"
																		}
																		onAddToFav={
																			selectedCategory ===
																			"Org"
																				? callOrgMostUsedApps
																				: callDeptMostUsedApps
																		}
																	/>
																)
															)
													: mostUsedApps?.map(
															(app, index) => (
																<AppCard
																	inSlider={
																		true
																	}
																	key={index}
																	app={app}
																	innerClassname={
																		"employee-app-card-box-1 cursor-pointer"
																	}
																	height={
																		"auto"
																	}
																	onAddToFav={
																		selectedCategory ===
																		"Org"
																			? callOrgMostUsedApps
																			: callDeptMostUsedApps
																	}
																/>
															)
													  )}
											</Slider>
										)}
									</>
								)}
								{categoryView
									? activeCategory?.applications?.length >
											5 && (
											<Button
												type="normal"
												className="employee-app-card--slide-prev"
												onClick={(e) => {
													slidePrev();
												}}
												style={{
													top: "40% !important",
												}}
											>
												<img src={left} />
											</Button>
									  )
									: mostUsedApps?.length > 5 && (
											<Button
												type="normal"
												className="employee-app-card--slide-prev"
												onClick={(e) => {
													slidePrev();
												}}
												style={{
													top: "40% !important",
												}}
											>
												<img src={left} />
											</Button>
									  )}

								{categoryView
									? activeCategory?.applications?.length >
											5 && (
											<Button
												type="normal"
												className="employee-app-card--slide-next"
												onClick={(e) => {
													slideNext();
												}}
												style={{
													top: "40% !important",
												}}
											>
												<img src={right} />
											</Button>
									  )
									: mostUsedApps?.length > 5 && (
											<Button
												type="normal"
												className="employee-app-card--slide-next"
												onClick={(e) => {
													slideNext();
												}}
												style={{
													top: "40% !important",
												}}
											>
												<img src={right} />
											</Button>
									  )}
							</div>
						</>
					)}

					{selectedCategory === "Org" && (
						<>
							<CategoryWithApps
								key={categoryView}
								showSidebar={!categoryView}
								category={activeCategory}
								setDefaultCategory={setDefaultCategory}
							></CategoryWithApps>
						</>
					)}
					{(selectedCategory === "Org" ||
						selectedCategory === "Dept") && (
						<>
							<ListOfCategories
								setDefaultCategory={setDefaultCategory}
								setActiveCategory={setActiveCategory}
								setCategoryView={setCategoryView}
								show={!categoryView}
								selectedCategory={selectedCategory}
							></ListOfCategories>
						</>
					)}
					{selectedCategory === "Employee" && (
						<ListOfApplications></ListOfApplications>
					)}
				</div>
			</div>
		</>
	);
}
