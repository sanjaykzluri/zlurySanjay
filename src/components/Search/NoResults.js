import React from "react";
import search__outer2 from "../../assets/search__outer2.svg";

export default function NoResults({ searchkey }) {
	return (
		<>
			<hr style={{ margin: "0px 40px" }}></hr>
			<div className="search__om__cont1__d2">
				<img src={search__outer2}></img>
				<div className="search__om__cont1__d2__d1">
					No results found
				</div>
				<div className="search__om__cont1__d2__d2">
					We couldn&apos;t find anything for &apos;
					{searchkey}
					&apos;
				</div>
			</div>
		</>
	);
}
