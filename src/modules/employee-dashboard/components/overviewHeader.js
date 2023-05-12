import React, { useEffect, useState } from "react";
import "./overview.css";
import heart from "assets/employee/heart.svg";
import { Button } from "UIComponents/Button/Button";
import { useSelector } from "react-redux";
import { addAppToFavourites } from "services/api/employeeDashboard";
import pinkheart from "assets/employee/pinkheart.svg";
import { employeeDashoboardFeatureSelector } from "reducers/userinfo.reducer";
import overview6 from "assets/departments/overview6.svg";

export function OverviewHeader({
	app,
	loading,
	setRequestLicenseModalOpen,
	handleAppChange,
}) {
	const isEmployeeDashboardEnabled = useSelector(
		employeeDashoboardFeatureSelector
	);

	const callAddAppToFavourites = () => {
		addAppToFavourites(app.app_id, !app.is_favourite)
			.then((res) => {
				handleAppChange();
			})
			.catch((err) =>
				TriggerIssue("Error in adding app to favourites", err)
			);
	};

	return (
		<>
			<div
				className="d-flex align-items-center"
				style={{ padding: "30px 40px" }}
			>
				<div
					className="d-flex align-items-center justify-content-center"
					style={{
						height: "100px",
						width: "100px",
						background: "#F6F7FC",
						borderRadius: "8px",
					}}
				>
					<img src={app?.app_logo} width={60}></img>
				</div>
				<div
					className="d-flex flex-column justify-content-between"
					style={{ height: "58px", marginLeft: "22px" }}
				>
					<div className="d-flex align-items-center">
						<div className="bold-600 font-22 black-1">
							{app?.app_name}
						</div>
						{!loading && (
							<div
								style={{
									backgroundColor: "rgba(90, 186, 255, 0.1)",
									borderRadius: "50px",
									alignItems: "center",
								}}
								className="row m-0 py-1 px-3 ml-2"
							>
								<img
									src={overview6}
									width={12}
									height={12}
									className="mr-2"
								/>
								<p className="font-10 text-capitalize primary-color mb-0">
									{app?.app_in_org
										? "Available in Org"
										: "Not Available in Org"}
								</p>
							</div>
						)}
					</div>

					{app?.app_category && (
						<div className="employee-app-overview-category-tag font-13 glow_blue">
							{app.app_category}
						</div>
					)}
				</div>

				{!loading && (
					<div className="ml-auto d-flex">
						<img
							src={app.is_favourite ? pinkheart : heart}
							className="mr-2 cursor-pointer"
							onClick={() => callAddAppToFavourites()}
						/>
						{app.current_user_app_count !== 1 &&
							isEmployeeDashboardEnabled && (
								<Button
									size="sm"
									onClick={() => {
										setRequestLicenseModalOpen(true);
									}}
								>
									Request Access
								</Button>
							)}
					</div>
				)}
			</div>
		</>
	);
}
