import React, { useEffect, useState } from "react";
import "./TableNew.css";
import { Loader } from "../../common/Loader/Loader";
import { connect, useDispatch, useSelector } from "react-redux";
import { fetchApplications } from "../../actions/overview-action";
import { Link } from "react-router-dom";
import { kFormatter } from "../../constants/currency";
import { getApplications } from "../../services/api/overview";
import AppTableComponent from "../../common/AppTableComponent";
import downArrowActive from "../../assets/down_arrow_Active.svg";
import downArrow from "../../assets/down_arrow.svg";
import { capitalizeFirstLetter } from "../../utils/common";
import { TriggerIssue } from "../../utils/sentry";
import { getValueFromLocalStorage } from "utils/localStorage";

const ProductTable = (props) => {
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [items, setItems] = useState(props.products);
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();
	const orgId = getValueFromLocalStorage("userInfo")?.org_id;
	const [sortByEntity, setSortByEntity] = useState(sortTopAppsBy.USERS);

	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Overview",
			currentPageName: "Overview-HomeScreen",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};

	function clickedOnSortButtonInTopAppsByUsers(sortBy) {
		setSortByEntity(sortBy);
		commonSegmentTrack(
			`Sorted Table by ${capitalizeFirstLetter(
				sortBy
			)} in TopAppsByUsers/Spend`
		);
	}

	function clickedOnAppInTopAppsByUsers(id, name) {
		//Segment Implementation
		window.analytics.track("Clicked on App in TopAppsByUsers/Spend", {
			currentCategory: "Overview",
			currentPageName: "Overview-HomeScreen",
			clickedOnAppName: name,
			clickedOnAppId: id,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}

	return loading ? (
		<Loader height={100} width={100}></Loader>
	) : (
		<table className="ov__table1">
			<thead className="ov__table1__thead">
				<tr>
					<th>Apps</th>
					<th>
						<button
							type="button"
							onClick={() => {
								dispatch(
									fetchApplications(
										orgId,
										sortTopAppsBy.USERS
									)
								);
								clickedOnSortButtonInTopAppsByUsers(
									sortTopAppsBy.USERS
								);
							}}
						>
							<img
								src={
									sortByEntity === sortTopAppsBy.USERS
										? downArrowActive
										: downArrow
								}
								width={9}
								className="mr-1"
							/>
							Users
						</button>
					</th>
					<th>
						<button
							type="button"
							onClick={() => {
								setLoading(true);
								getApplications(orgId, sortTopAppsBy.SPEND)
									.then((res) => {
										setItems(res.applications);
										setLoading(false);
									})
									.catch((err) => {
										TriggerIssue(
											"Error while fetching top apps by spend",
											err
										);
									});
								clickedOnSortButtonInTopAppsByUsers(
									sortTopAppsBy.SPEND
								);
							}}
						>
							<img
								src={
									sortByEntity === sortTopAppsBy.SPEND
										? downArrowActive
										: downArrow
								}
								width={9}
								className="mr-1"
							/>
							Spend(YTD)
						</button>
					</th>
				</tr>
			</thead>
			<tbody className="ov__table1__tbody">
				{items?.length > 0 ? (
					items.map((item, index) =>
						index < 8 ? (
							<tr
								key={item._id}
								className="ov__table1__datarender__new"
							>
								<td className="d-flex flex-row align-items-center">
									<AppTableComponent
										app_name={item?.app_name}
										app_logo={item?.image}
										app_auth_status={item?.app_state}
										app_id={item?.app_id}
										logo_height="auto"
										logo_width={28}
									/>
								</td>
								<td>
									{typeof item.users_count === "object"
										? item.users_count?.count
										: item.users_count}
								</td>
								<td>{kFormatter(item.total_spend)}</td>
							</tr>
						) : null
					)
				) : (
					<tr>
						<td>No Records</td>
					</tr>
				)}
			</tbody>
		</table>
	);
};

export function TableNew(props) {
	let data = props.data;

	return (
		<div className="App" style={{ paddingBottom: "10px" }}>
			<ProductTable products={data ? data : []} />
		</div>
	);
}

const sortTopAppsBy = {
	USERS: "users",
	SPEND: "spend",
};
