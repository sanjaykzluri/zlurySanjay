import React from "react";

import empty1 from "../../Uploads/Archived/empty.svg";

export function Empty() {
	return (
		<div 
			className="d-flex flex-column justify-content-center align-items-center"
			style={{ margin: "auto" }}
		>
			<img src={empty1} width={200} />
			<div className="empty-header">
				No archived transactions
			</div>
		</div>
	);
}