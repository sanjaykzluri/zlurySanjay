import React from "react";
import { EmptySearch } from "../../../../common/EmptySearch";
import { Empty } from "../../components/Empty/Empty";

export const OffboardingDashboardEmptyScreen = (searchQuery, invalidUrl) => {
	return searchQuery ? (
		<EmptySearch searchQuery={searchQuery} />
	) : invalidUrl ? (
		<Empty>
			<div
				className="d-flex flex-column justify-content-center align-items-center ml-3"
				style={{
					marginTop: "-5px",
				}}
			>
				<span className="font-18">Invalid Url</span>
			</div>
		</Empty>
	) : (
		<Empty>
			<div
				className="d-flex flex-column justify-content-center align-items-center ml-3"
				style={{
					marginTop: "-5px",
				}}
			>
				<span className="font-18">Nothing found here</span>
			</div>
		</Empty>
	);
};
