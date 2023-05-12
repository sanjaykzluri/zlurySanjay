import React, { useEffect, useState } from "react";
import "./overview.css";
import stats_man from "assets/employee/stats_man.svg";
import multiple_users from "assets/employee/multiple_users.svg";
import desktop_agent from "assets/employee/desktop_agent.svg";
import browser_agent from "assets/employee/browser_agent.svg";
import building from "assets/employee/building.svg";
import send_email from "assets/employee/send_email.svg";
import ContentLoader from "react-content-loader";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { useSelector } from "react-redux";
import { employeeDashoboardFeatureSelector } from "reducers/userinfo.reducer";
export function StatsContainer({ loading, data, setRequestLicenseModalOpen }) {
	const isEmployeeDashboardEnabled = useSelector(
		employeeDashoboardFeatureSelector
	);
	return (
		<>
			{loading ? (
				<>
					<div
						className="d-flex align-items-center w-100 justify-content-between"
						style={{ padding: "0px 40px" }}
					>
						<div
							className="d-flex flex-column "
							style={{ width: "64%" }}
						>
							<div className="d-flex align-items-center justify-content-between">
								<div
									className=" employee-stats-box-loader"
									style={{
										width: "32%",
									}}
								>
									<div className="d-flex align-items-center">
										<ContentLoader
											style={{ marginRight: 8 }}
											width={26}
											height={26}
											backgroundColor={`#DDDDDD`}
										>
											<circle
												cx="13"
												cy="13"
												r="13"
												fill="#EBEBEB"
											/>
										</ContentLoader>
										<div className="ml-2 font-22 employee-stats-box-text">
											<ContentLoader
												width={65}
												height={18}
												backgroundColor={`#DDDDDD`}
											>
												<rect
													width="65"
													height="18"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									</div>
									<div
										className="mt-auto grey font-14"
										style={{ marginBottom: "12px" }}
									>
										<ContentLoader
											width={76}
											height={9}
											backgroundColor={`#DDDDDD`}
										>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
								<div
									className=" employee-stats-box-loader"
									style={{ width: "32%" }}
								>
									<div className="d-flex align-items-center">
										<ContentLoader
											style={{ marginRight: 8 }}
											width={26}
											height={26}
											backgroundColor={`#DDDDDD`}
										>
											<circle
												cx="13"
												cy="13"
												r="13"
												fill="#EBEBEB"
											/>
										</ContentLoader>
										<div className="ml-2 font-22 employee-stats-box-text">
											<ContentLoader
												width={65}
												height={18}
												backgroundColor={`#DDDDDD`}
											>
												<rect
													width="65"
													height="18"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									</div>
									<div
										className="mt-auto grey font-14"
										style={{ marginBottom: "12px" }}
									>
										<ContentLoader
											width={76}
											height={9}
											backgroundColor={`#DDDDDD`}
										>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
								<div
									className=" employee-stats-box-loader"
									style={{ width: "32%" }}
								>
									<div className="d-flex align-items-center">
										<ContentLoader
											style={{ marginRight: 8 }}
											width={26}
											height={26}
											backgroundColor={`#DDDDDD`}
										>
											<circle
												cx="13"
												cy="13"
												r="13"
												fill="#EBEBEB"
											/>
										</ContentLoader>
										<div className="ml-2 font-22 employee-stats-box-text">
											<ContentLoader
												width={65}
												height={18}
												backgroundColor={`#DDDDDD`}
											>
												<rect
													width="65"
													height="18"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									</div>
									<div
										className="mt-auto grey font-14"
										style={{ marginBottom: "12px" }}
									>
										<ContentLoader
											width={76}
											height={9}
											backgroundColor={`#DDDDDD`}
										>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
							<div
								className="d-flex align-items-center justify-content-between"
								style={{ marginTop: "10px" }}
							>
								<div
									className=" employee-stats-box-loader"
									style={{ width: "49%" }}
								>
									<div className="d-flex align-items-center">
										<ContentLoader
											style={{ marginRight: 8 }}
											width={26}
											height={26}
											backgroundColor={`#DDDDDD`}
										>
											<circle
												cx="13"
												cy="13"
												r="13"
												fill="#EBEBEB"
											/>
										</ContentLoader>
										<div className="ml-2 font-22 employee-stats-box-text text-capitalize">
											<ContentLoader
												width={65}
												height={18}
												backgroundColor={`#DDDDDD`}
											>
												<rect
													width="65"
													height="18"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									</div>
									<div
										className="mt-auto grey font-14"
										style={{ marginBottom: "12px" }}
									>
										<ContentLoader
											width={76}
											height={9}
											backgroundColor={`#DDDDDD`}
										>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
								<div
									className="employee-stats-box-loader"
									style={{ width: "49%" }}
								>
									<div className="d-flex align-items-center">
										<ContentLoader
											style={{ marginRight: 8 }}
											width={26}
											height={26}
											backgroundColor={`#DDDDDD`}
										>
											<circle
												cx="13"
												cy="13"
												r="13"
												fill="#EBEBEB"
											/>
										</ContentLoader>
										<div className="ml-2 font-22 employee-stats-box-text text-capitalize">
											<ContentLoader
												width={65}
												height={18}
												backgroundColor={`#DDDDDD`}
											>
												<rect
													width="65"
													height="18"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									</div>
									<div
										className="mt-auto grey font-14"
										style={{ marginBottom: "12px" }}
									>
										<ContentLoader
											width={76}
											height={9}
											backgroundColor={`#DDDDDD`}
										>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
						</div>
						<div
							className="employee-stats-box-loader"
							style={{
								width: "35%",
								height: "170px",
								padding: "30px 25px",
								position: "relative",
							}}
						>
							<div className="grey-1 font-600 font-9">
								<ContentLoader
									width={76}
									height={9}
									backgroundColor={`#DDDDDD`}
								>
									<rect
										width="76"
										height="9"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>

							<div
								className="font-22 employee-stats-box-text text-capitalize"
								style={{ marginTop: "15px" }}
							>
								<ContentLoader
									style={{ marginRight: 8 }}
									width={26}
									height={26}
									backgroundColor={`#DDDDDD`}
								>
									<circle
										cx="13"
										cy="13"
										r="13"
										fill="#EBEBEB"
									/>
								</ContentLoader>
								<ContentLoader
									width={65}
									height={18}
									backgroundColor={`#DDDDDD`}
								>
									<rect
										width="65"
										height="18"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="mt-auto employee-request-license-box font-12 primary-color border-0">
								<ContentLoader
									width={184}
									height={35}
									backgroundColor={`#DDDDDD`}
								>
									<rect
										width="184"
										height="35"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						</div>
					</div>
				</>
			) : (
				<>
					<div
						className="d-flex align-items-center w-100 justify-content-between"
						style={{ padding: "0px 40px" }}
					>
						<div
							className="d-flex flex-column "
							style={{ width: "64%" }}
						>
							<div className="d-flex align-items-center justify-content-between">
								<div
									className=" employee-stats-box"
									style={{ width: "32%" }}
								>
									<div className="d-flex align-items-center">
										<img className="" src={stats_man}></img>
										<div className="ml-2 font-22 employee-stats-box-text">
											{data?.apps || 0}
										</div>
									</div>
									<div
										className="mt-auto grey font-14"
										style={{ marginBottom: "12px" }}
									>
										Your Apps
									</div>
								</div>
								<div
									className=" employee-stats-box"
									style={{ width: "32%" }}
								>
									<div className="d-flex align-items-center">
										<img
											className=""
											src={multiple_users}
										></img>
										<div className="ml-2 font-22 employee-stats-box-text">
											{data?.apps_in_department || 0}
										</div>
									</div>
									<div
										className="mt-auto grey font-14"
										style={{ marginBottom: "12px" }}
									>
										In your Department
									</div>
								</div>
								<div
									className=" employee-stats-box"
									style={{ width: "32%" }}
								>
									<div className="d-flex align-items-center">
										<img className="" src={building}></img>
										<div className="ml-2 font-22 employee-stats-box-text">
											{data?.apps_in_organization || 0}
										</div>
									</div>
									<div
										className="mt-auto grey font-14"
										style={{ marginBottom: "12px" }}
									>
										In your Organization
									</div>
								</div>
							</div>
							<div
								className="d-flex align-items-center justify-content-between"
								style={{ marginTop: "10px" }}
							>
								<div
									className=" employee-stats-box"
									style={{ width: "49%" }}
								>
									<div className="d-flex align-items-center">
										<img
											className=""
											src={desktop_agent}
										></img>
										<div className="ml-2 font-22 employee-stats-box-text text-capitalize">
											{data?.desktop_agent}
										</div>
									</div>
									<div
										className="mt-auto grey font-14"
										style={{ marginBottom: "12px" }}
									>
										Desktop Agent
									</div>
								</div>
								<div
									className=" employee-stats-box"
									style={{ width: "49%" }}
								>
									<div className="d-flex align-items-center">
										<img
											className=""
											src={browser_agent}
										></img>
										<div className="ml-2 font-22 employee-stats-box-text text-capitalize">
											{data?.browser_agent}
										</div>
									</div>
									<div
										className="mt-auto grey font-14"
										style={{ marginBottom: "12px" }}
									>
										Browser Agent
									</div>
								</div>
							</div>
						</div>
						{isEmployeeDashboardEnabled ? (
							<>
								<div
									className="employee-stats-box"
									style={{
										width: "35%",
										height: "170px",
										padding: "30px 25px",
										position: "relative",
									}}
								>
									<div className="grey-1 font-9 bold-600">
										App Requests
									</div>
									<div className="mt-2 d-flex align-items-center">
										<div className="bold-700 font-22 employee-stats-box-text mr-2">
											{data?.total_requests_count}{" "}
											Requests
										</div>
									</div>
									<div className=" mt-auto d-flex align-items-center  w-100">
										<div
											className=" employee-request-license-box font-12 primary-color cursor-pointer"
											onClick={() => {
												setRequestLicenseModalOpen(
													true
												);
											}}
										>
											Request Access to an Application
										</div>
									</div>

									<img
										src={send_email}
										className="position-absolute"
										style={{ right: "0px", bottom: "0px" }}
									></img>
								</div>
							</>
						) : (
							<>
								<div
									className="employee-stats-box"
									style={{
										width: "35%",
										height: "170px",
										padding: "30px 25px",
										position: "relative",
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<div className="font-22 employee-stats-box-text text-capitalize">
										APP REQUISITION
									</div>
									<div className="font-12 employee-stats-box-text text-capitalize mt-2">
										New feature coming soon!
									</div>
								</div>
							</>
						)}
					</div>
				</>
			)}
		</>
	);
}
