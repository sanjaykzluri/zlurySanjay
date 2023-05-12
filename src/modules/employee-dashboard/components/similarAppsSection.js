import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import React, { useEffect, useState } from "react";
import { getSimilarAppsEmployeeDashboard } from "services/api/employeeDashboard";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import noSimilarApps from "assets/employee/noSimilarApps.svg";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import "./overview.css";
import ContentLoader from "react-content-loader";
import { useSelector } from "react-redux";
import { AppCard } from "./appCard";
import { PillsRenderer } from "./appInsights";

export function SimilarAppsSection({
	needSlicing = false,
	sliceCount = 2,
	className,
	handleOnClick,
	app_id,
	showAlternativeApps = true,
	app_in_org = true,
}) {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [alternativeApps, setAlternativeApps] = useState();
	const [id, setId] = useState();
	const { userInfo } = useSelector((state) => state);
	useEffect(() => {
		if (app_id) {
			setId(app_id);
		} else {
			setId(window.location.pathname.split("/")[3]);
		}
	}, [app_id, window.location.pathname]);

	useEffect(() => {
		if (id) {
			setLoading(true);
			getSimilarAppsEmployeeDashboard(id, !app_in_org).then((res) => {
				if (res) {
					setLoading(false);
					setAlternativeApps(res.alternate_apps);
					if (needSlicing) {
						setData(res.similar_apps.slice(0, sliceCount));
					} else {
						setData(res.similar_apps);
					}
				}
			});
		}
	}, [id]);

	return (
		<>
			{loading ? (
				<>
					<div
						className={`d-flex  ${
							className ? className : "flex-column"
						} `}
					>
						{[1, 2].map((el) => (
							<ContentLoader
								width={220}
								height={95}
								className="d-flex employee-similar-app-card-box mr-1"
							>
								<rect
									y={0}
									width={220}
									height={95}
									fill="#EBEBEB"
								/>
							</ContentLoader>
						))}
					</div>
				</>
			) : (
				<>
					<div
						className={`d-flex  ${
							className ? className : "flex-column"
						} `}
					>
						{Array.isArray(data) && data?.length ? (
							<>
								{data?.map((el) => (
									<div
										className="d-flex employee-similar-app-card-box cursor-pointer mr-1"
										onClick={() =>
											handleOnClick && handleOnClick(el)
										}
									>
										<div
											className="d-flex align-items-center"
											style={{
												padding: "8px",
												minHeight: "49px",
											}}
										>
											<GetImageOrNameBadge
												name={el.name}
												url={el.image}
												width={33}
												height={"auto"}
											/>
											<div
												className="d-flex flex-column justify-content-between"
												style={{
													height: "27px",
													marginLeft: "8px",
												}}
											>
												<div className="bold-600 font-12 black-1">
													{el?.name}
												</div>
												<div className="font-8 grey-1">
													{el?.app_category_name}
												</div>
											</div>
										</div>
										<div
											className="border-top border-bottom glow_blue text-align-center font-9 bold-600"
											style={{ padding: "4px" }}
										>
											Used by {el?.dept_user_count || 0}{" "}
											users in your department
										</div>
										<div
											className="d-flex "
											style={{
												padding: "8px 14px",
											}}
										>
											<div className="d-flex flex-column">
												<div className="font-8 grey-1 o-5">
													DEPARTMENTS
												</div>
												<div
													className="d-flex flex-wrap"
													style={{
														maxWidth: "100px",
														marginTop: "2px",
													}}
												>
													<PillsRenderer
														data={
															el?.department_names
														}
													/>
												</div>
											</div>
											<div className="d-flex flex-column ml-auto">
												<div className="font-8 grey-1 o-5">
													USERS
												</div>
												<div
													className="black-1 font-12 bold-500"
													style={{ marginTop: "7px" }}
												>
													{el.app_user_count}
												</div>
											</div>
										</div>
									</div>
								))}
							</>
						) : (
							<div className="d-flex flex-column justify-content-center align-items-center mt-3 mb-3">
								<img
									src={noSimilarApps}
									height={40}
									width={40}
								/>
								<div className="font-12 bold-500 grey-1 mt-1">
									Similar apps not found
								</div>
							</div>
						)}
					</div>
				</>
			)}

			{userInfo?.apps_permissions?.application_settings
				?.show_alternative_apps &&
				showAlternativeApps && (
					<>
						<div
							className="font-16 black-1 bold-600"
							style={{ marginTop: "25px" }}
						>
							Alternative Apps
						</div>
						{loading ? (
							<>
								<div className="d-flex ">
									{[1, 2].map((el, index) => (
										<ContentLoader
											width={105}
											height={105}
											className={`d-flex employee-similar-app-card-box  ${
												index % 2 === 1 ? "ml-1" : ""
											}`}
										>
											<rect
												y={0}
												width={105}
												height={105}
												fill="#EBEBEB"
											/>
										</ContentLoader>
									))}
								</div>
							</>
						) : (
							<div className="d-flex">
								{Array.isArray(alternativeApps) &&
								alternativeApps.length > 0 ? (
									<>
										<div className="d-flex flex-wrap">
											{alternativeApps.map(
												(app, index) => (
													<AppCard
														inSlider={false}
														key={index}
														app={app}
														innerClassname={
															"employee-app-card-box-2"
														}
														height={"auto"}
														width={49}
														className={` mt-1 ${
															index % 2 === 1
																? "ml-1"
																: ""
														}`}
														hideDropdown={true}
													/>
												)
											)}
										</div>
									</>
								) : (
									<div className="d-flex flex-column justify-content-center align-items-center mt-3 mb-3 w-100">
										<img
											src={noSimilarApps}
											height={40}
											width={40}
										/>
										<div className="font-12 bold-500 grey-1 mt-1">
											Alternate apps not found
										</div>
									</div>
								)}
							</div>
						)}
					</>
				)}
		</>
	);
}
