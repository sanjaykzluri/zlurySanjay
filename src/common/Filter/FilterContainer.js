import React from "react";
import "./FilterContainer.scss";
import { FilterInfoButton } from "./FilterInfoButton";

export function FilterContainer() {
	return (
		<div className="filter-container">
			<span style={{ marginRight: "8px" }}>Showing 1239 users</span>
			<FilterInfoButton firstText="Status" activeText="Active" />
		</div>
	);
}
