import React from "react";
import { truncateText } from "utils/common";

export function PermissionCard({
	permissionIcon,
	title,
	iconButton,
	toggelButton,
	children,
}) {
	return (
		<div className="permission py-2">
			<div className="d-flex head  align-items-center">
				<div className="d-flex justify-content-center align-items-center">
					{iconButton ? (
						iconButton
					) : (
						<img
							src={green_tick}
							alt="a"
							style={{ width: "13px", height: "9px" }}
						/>
					)}
					<div className="title font-14 ">
						{truncateText(title)}
						{toggelButton ? toggelButton : null}
					</div>
				</div>
				<div className="d-flex justify-content-between p-action ">
					<img alt="icon" src={permissionIcon} />
				</div>
			</div>
			{children ? children : null}
		</div>
	);
}
