import React, { useEffect, useRef, useState } from "react";
import search from "../../../../assets/search.svg";

export function AddUserModalFilters(props) {
	return (
		<>
			<div className="inputWithIconApps ml-0 mt-auto mb-auto mr-0">
				{props && props.setSearchQuery && (
					<input
						style={{ width: "379px" }}
						placeholder="Search Users"
						type="text"
						onChange={(e) => {
							props.setSearchQuery(e.target.value);
						}}
					/>
				)}

				<img src={search} aria-hidden="true" />
			</div>
		</>
	);
}
