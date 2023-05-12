import React from "react";
import empty from "../../Applications/AllApps/Transactions/empty.svg";

export function Empty({ title, subtitle }) {
	return (
		<div
			className="d-flex flex-column justify-content-center align-items-center"
			style={{ margin: "auto" }}
		>
			<img src={empty} width={200} />
			<div className="empty-header">{title}</div>
			<div className="empty-lower">{subtitle}</div>
		</div>
	);
}
