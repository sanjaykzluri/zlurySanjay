import React from "react";
import search from "../../assets/search.svg";
import "./Integrations.css";
import filterbutton from "../../assets/filterbutton.svg";

export function IntegrationsFilter(props) {
	return (
		<>
			<div className="top__Uploads">
				<div className="Uploads__left">
					<div
						className="d-flex flex-row align-items-center "
						style={{ marginLeft: "40px" }}
					></div>
					{/* <button className="filterbutton">
						<img src={filterbutton}></img>
					</button> */}
				</div>
				<div className="Uploads__right">
					<div className="inputWithIconINT">
						<input
							type="text"
							placeholder="Search"
							value={props.searchQuery}
							onChange={(e) =>
								props.setSearchQuery(e.target.value.trimStart())
							}
						/>
						<img src={search} aria-hidden="true" />
					</div>
				</div>
			</div>
		</>
	);
}
