import React from "react";
import search__outer from "../../assets/search__outer.svg";

export default function BeginSearch() {
	return (
		<div className="search__outermain__cont">
			<img
				src={search__outer}
				alt="Search for apps, users, departments and integrations"
			/>
			<div className="search__outermain__cont__d1">
				Begin typing to search
			</div>
			<div className="search__outermain__cont__d2">
				Search for apps, users, departments and integrations
			</div>
		</div>
	);
}
