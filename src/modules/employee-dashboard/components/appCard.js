import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { propTypes } from "qrcode.react";
import React, { useEffect, useState } from "react";
import nav from "assets/employee/navigation_button.svg";
import { useHistory } from "react-router-dom";
import "./overview.css";
import { Dropdown } from "react-bootstrap";
import heart from "assets/employee/pinkheart.svg";
import { addAppToFavourites } from "services/api/employeeDashboard";
import { useSelector } from "react-redux";
import { TriggerIssue } from "utils/sentry";
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
export function AppCard({
	app,
	width = 70,
	height = 70,
	className,
	innerClassname,
	hideDropdown = false,
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
			<div
				className={`d-flex flex-column ${
					className ? className : "mx-3"
				}`}
			>
				<div
					className={`d-flex  ${innerClassname && innerClassname}`}
					onClick={() =>
						app.app_id &&
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
					<GetImageOrNameBadge
						name={app.app_name || app.name}
						url={app.image || app.logo || app.app_logo}
						width={width}
						height={height}
					/>
				</div>
				<div className="font-14 bold-600 mt-2 d-flex">
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{app.app_name || app.name}</Tooltip>}
					>
						<div
							className="text-truncate"
							style={{ maxWidth: "90px", width: "fit-content" }}
						>
							{app.app_name || app.name}
						</div>
					</OverlayTrigger>
					{!hideDropdown && (
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
					)}
				</div>
				<div className="grey o-7 mt-1 font-10">
					{app.app_category ||
						app.category ||
						app.app_category_name ||
						""}
				</div>
			</div>
		</>
	);
}
