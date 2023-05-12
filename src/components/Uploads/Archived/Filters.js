import React, { useState } from "react";

import search from "../../../assets/search.svg";
import CSV from "../../../assets/CSV.svg";

import filterbutton from "../../Users/filterbutton.svg";
import FilterUsers from "../../Users/FilterUsers";
import columnbutton from "../../../assets/columnbutton.svg";
export function Filters() {
	const [showHideFilter, setshowHideFilter] = useState(false);
	let addHideFilterClose = () => setshowHideFilter(false);
	return (
		<>
			<div className="top__Uploads">
				<div className="Uploads__left">
					{/* <button
						className="filterbutton"
						onClick={() => setshowHideFilter(true)}
						style={{ marginLeft: "40px" }}
					>
						<img src={filterbutton}></img>
					</button> */}
					{showHideFilter ? (
						<FilterUsers
							show={showHideFilter}
							onHide={addHideFilterClose}
						></FilterUsers>
					) : null}
					<button className="columnbutton" style={{ marginLeft: 40 }}>
						<img src={columnbutton}></img>
					</button>
				</div>
				<div className="Uploads__right">
					<div className="inputWithIconApps">
						<input type="text" placeholder="Search" />
						<img src={search} aria-hidden="true" />
					</div>
					{/* <div>
						<button className="appsac">
							<img src={CSV} />
							<span id="te">CSV</span>
						</button>
					</div> */}
				</div>
			</div>
		</>
	);
}
