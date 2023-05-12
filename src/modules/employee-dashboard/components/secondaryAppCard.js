import React, { useEffect, useState } from "react";
import "./overview.css";
import nav from "assets/employee/navigation_button.svg";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { Link, useHistory } from "react-router-dom";
import ContentLoader from "react-content-loader";
import { Dropdown } from "react-bootstrap";
import heart from "assets/employee/pinkheart.svg";
import { useSelector } from "react-redux";
import { addAppToFavourites } from "services/api/employeeDashboard";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		<img src={nav} width="20" />
	</a>
));
export function SmallAppCard({
	app,
	loading = false,
	category = "collaboration",
	onAddToFav,
}) {
	const history = useHistory();
	const { user_id } = useSelector((state) => state.userInfo);

	const callAddAppToFavourites = () => {
		addAppToFavourites(app.app_id, !app.is_favourite)
			.then((res) => {
				onAddToFav && onAddToFav();
			})
			.catch((err) =>
				TriggerIssue("Error in adding app to favourites", err)
			);
	};
	return (
		<>
			{loading ? (
				<div
					className="employee-category-app-card"
					style={{
						backgroundColor: "rgba(235, 235, 235, 0.35)",
					}}
				>
					<ContentLoader
						style={{ marginRight: 8 }}
						width={50}
						height={50}
						backgroundColor={"#DDDDDD"}
					>
						<rect width="50" height="50" rx="2" fill="#EBEBEB" />
					</ContentLoader>

					<div
						className="d-flex flex-column justify-content-between ml-2"
						style={{ height: "35px" }}
					>
						<div className="bold-600 font-14 cursor-pointer">
							<ContentLoader
								width={135}
								height={18}
								backgroundColor={"#DDDDDD"}
							>
								<rect
									width="135"
									height="18"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>

						<div className="grey-1 font-10 o-7">
							<ContentLoader
								width={106}
								height={13}
								backgroundColor={"#DDDDDD"}
							>
								<rect
									width="135"
									height="13"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
					</div>
				</div>
			) : (
				<>
					<div className="employee-category-app-card">
						<GetImageOrNameBadge
							name={app.app_name}
							url={app.app_logo}
							width={50}
							height={"auto"}
						/>
						<div
							className="d-flex flex-column justify-content-between ml-2"
							style={{ height: "35px" }}
						>
							<OverlayTrigger
								placement="top"
								overlay={<Tooltip>{app.app_name}</Tooltip>}
							>
								<div
									className="bold-600 font-14 cursor-pointer text-truncate"
									style={{
										maxWidth: "130px",
										width: "fit-content",
									}}
									onClick={() =>
										history.push({
											pathname: `/user/applications/${encodeURI(
												app.app_id
											)}`,
											state: {
												app: app,
											},
										})
									}
								>
									{app.app_name}
								</div>
							</OverlayTrigger>
							<OverlayTrigger
								placement="top"
								overlay={
									<Tooltip>
										{app.app_category_name || category}
									</Tooltip>
								}
							>
								<div
									className="grey-1 font-10 o-7 text-truncate"
									style={{
										maxWidth: "130px",
										width: "fit-content",
									}}
								>
									{app.app_category_name || category}
								</div>
							</OverlayTrigger>
						</div>

						<Dropdown className="ml-auto">
							<Dropdown.Toggle as={ellipsis} />
							<Dropdown.Menu className={`p-0`}>
								<Dropdown.Item
									onClick={() => callAddAppToFavourites()}
								>
									<div className="d-flex align-items-center">
										<img
											className="mr-2"
											src={heart}
											style={{ width: "14px" }}
										/>
										{app.is_favourite
											? "Remove from Favourites"
											: "Add to Favourites"}
									</div>
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</div>
				</>
			)}
		</>
	);
}
