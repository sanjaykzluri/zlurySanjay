import React, { useEffect, useState } from "react";
import button1 from "../../../assets/button1.svg";
import search from "../../../assets/search.svg";
import CSV from "../../../assets/CSV.svg";
import filterbutton from "../../Users/filterbutton.svg";
import FilterUsers from "../../Users/FilterUsers";
import columnbutton from "../../../assets/columnbutton.svg";
import { transactionConstants } from "../../../constants/transactions";
import refresh_icon from "../../../assets/icons/refresh.svg";
import { useDispatch } from "react-redux";

export function Filters(props) {
	let addHideFilterClose = () => props.setshowHideFilter(false);
	const [CSVModalVisible, setCSVModalVisible] = useState(false);
	const dispatch = useDispatch();
	function handleSearch(event) {
		props.setSearchQuery(event.target.value);
	}

	const refreshReduxState = () => {
		dispatch({
			type: transactionConstants.DELETE_UPLOADS_UNRECOG_CACHE
		});
		props.setPage(0);
	}

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
					{props.showHideFilter ? (
						<FilterUsers
							show={props.showHideFilter}
							onHide={addHideFilterClose}
						></FilterUsers>
					) : null}
					<button
						className="columnbutton"
						style={{ marginLeft: 40 }}
					>
						<img src={columnbutton}></img>
					</button>
				</div>
				<div className="Uploads__right">
					<div className="inputWithIconApps">
						<input type="text" placeholder="Search" onChange={(e) => handleSearch(e)}/>
						<img src={search} aria-hidden="true" />
					</div>
					<div>
						<button
							className="appsad"
							onClick={() => refreshReduxState()}
							style = {
								{
									width: "50px",
								}
							}
						>
							<img
								className = "w-100 h-100 m-auto"
								src={refresh_icon} />
						</button>
					</div>
					{/* <div>
						<button className="appsac">
							<img src={CSV}></img>
							<span id="te">CSV</span>
						</button>
					</div> */}
				</div>
			</div>
		</>
	);
}
