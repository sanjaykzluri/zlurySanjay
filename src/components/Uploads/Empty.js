import React from "react";

import empty from "./Archived/empty.svg";

export function Empty({ title = "No Uploads", image = empty }) {
	return (
		<div
			className="d-flex flex-column justify-content-center align-items-center"
			style={{ margin: "auto" }}
		>
			<img src={image} width={200} />
			<div className="empty-lower">{title}</div>
		</div>
	);
}
