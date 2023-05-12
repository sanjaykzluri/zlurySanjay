import React from "react";

import empty from "../../../components/Uploads/Unrecognised/empty1.svg";

export function Empty(props) {
	return (
		<div
			className="d-flex flex-column justify-content-center align-items-center"
			style={{ margin: "auto", minHeight: props.minHeight }}
		>
			<img src={empty} width={200} />
			<div className="empty-header">No unrecognised transactions</div>
		</div>
	);
}
