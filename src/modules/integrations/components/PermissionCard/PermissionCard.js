import React from "react";

import green_tick from "assets/green_tick.svg";
import defaultScopeIcon from "assets/integrations/default-scope.svg";
import "./permission-card.css";
import { capitalizeFirstLetter, truncateText } from "utils/common";

export function PermissionCard({
	permissionIcon,
	title,
	iconButton,
	toggelButton,
	children,
	permission,
	onRemove,
	isEditable,
}) {
	return (
		<div className="permission permission-single-item py-2">
			<div style={{ justifyContent: "space-between" }} className="d-flex">
				<div>
					{iconButton ? (
						iconButton
					) : (
						<img
							src={green_tick}
							alt="a"
							style={{ width: "18px", height: "18px" }}
						/>
					)}
					<span className="title font-14 bold-500 ml-2">
						{truncateText(title, 40)}
						{permission.is_default && (
							<img className="ml-2" src={defaultScopeIcon} />
						)}
					</span>
				</div>
				<div>
					{!permission.is_default &&
						isEditable &&
						!permission.is_not_editable && (
							<span
								style={{ color: "rgba(34, 102, 226, 1)" }}
								className="mr-2 show-on-hover-content font-11"
								onClick={() => onRemove && onRemove(permission)}
							>
								Remove
							</span>
						)}
					<span>{toggelButton ? toggelButton : null}</span>
				</div>
			</div>
			<div className="ml-4 flex">
				<img alt="icon" src={permissionIcon} />
				<div className="flex px-2">
					{Array.isArray(permission.feature) ? (
						permission.feature?.map((feature) => (
							<div
								style={{
									backgroundColor: "rgba(113, 90, 255, 0.1)",
									width: "auto",
									height: "18px",
									borderRadius: "5px",
									textAlign: "center",
									lineHeight: "1.6",
									color: "rgba(113, 90, 255, 1)",
								}}
								className=" px-2 mr-2 font-11"
							>
								{capitalizeFirstLetter(feature)}
							</div>
						))
					) : (
						<div
							style={{
								backgroundColor: "rgba(113, 90, 255, 0.1)",
								width: "auto",
								height: "18px",
								borderRadius: "5px",
								textAlign: "center",
								lineHeight: "1.6",
								color: "rgba(113, 90, 255, 1)",
							}}
							className="px-2 mr-2 font-11 font-500"
						>
							{capitalizeFirstLetter(permission.feature)}
						</div>
					)}
				</div>
			</div>

			{children ? children : null}
		</div>
	);
}
