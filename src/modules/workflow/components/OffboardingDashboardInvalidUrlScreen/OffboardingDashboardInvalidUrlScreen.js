import React from "react";
import { Empty } from "../../components/Empty/Empty";

export const OffboardingDashboardInvalidUrlScreen = () => {
	return (
		<Empty minHeight={window.innerHeight - 200}>
			<div
				className="d-flex flex-column justify-content-center align-items-center ml-3"
				style={{
					marginTop: "-5px",
				}}
			>
				<span style={{ color: "#222222" }} className="font-20">
					Invalid URL
				</span>
				<span className="font-12">
					The url you're trying to reach is invalid
				</span>
			</div>
		</Empty>
	);
};
