import React from "react";

import empty from "./empty.svg";

export function Empty() {
	return (
		<div
			className="d-flex flex-column justify-content-center align-items-center"
			style={{ margin: "auto" }}
		>
			<img src={empty} width={200} />
			<div className="departments-empty-header">
				No Archived Transactions
			</div>
		</div>
	);
}
