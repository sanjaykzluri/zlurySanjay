import React from "react";
import { capitalizeFirstLetter } from "utils/common";
import "./scopes-container.css";
export function ScopesContainer({
	scopeId,
	heading,
	subHeading,
	list,
	children,
	icon,
	onDelClick,
}) {
	return (
		<div className="d-flex flex-column permissions-container  ml-3 mt-2">
			<div className="d-flex flex-column  mt-13 ml-22">
				<div
					className={`d-flex justify-content-between ${
						icon && "align-items-center"
					}`}
				>
					{heading && (
						<p className="font-12 __heading m-0">
							{capitalizeFirstLetter(heading)}
						</p>
					)}
					{icon && (
						<img
							onClick={() => {
								scopeId && onDelClick && onDelClick(scopeId);
							}}
							src={icon}
							alt="delete"
							style={{ paddingRight: "20px" }}
						/>
					)}
				</div>
				{subHeading ? (
					<p className="__sub-heading font-10 truncate_10vw">
						{subHeading}
					</p>
				) : null}
			</div>
			<div className="permissions px-3">{children}</div>
		</div>
	);
}
