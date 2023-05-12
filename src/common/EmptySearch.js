import React from "react";
import PropTypes from "prop-types";
import NoResultsFoundSVG from "../assets/search__outer2.svg";
import usersImage from "assets/no_users_found.svg";
import workflowsImage from "assets/no_workflows_found.svg";
import licensesImage from "assets/no_licenses_found.svg";
import transactionsImage from "assets/no_transactions_found.svg";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import { capitalizeFirstLetter, escapeURL } from "utils/common";
import { stateFilterMap } from "modules/v2InfiniteTable/InfiniteTableContainer";
import { getSearchReqObj } from "./infiniteTableUtil";
import { useHistory } from "react-router-dom";

export function EmptySearch({
	metaData,
	onReset,
	isWorkflow = false,
	searchFilter = {},
	app_search = false,
	user_search = false,
	noLocalisedSearch = false,
	...props
}) {
	const dispatch = useDispatch();
	const router = useSelector((state) => state.router);
	const { hash, pathname } = router.location;
	const history = useHistory();
	let tabName = hash.split("#");
	let [, route] = pathname.split("/");

	function getStateFilterObj(fieldId) {
		let obj = app_search
			? {
					field_id: "app_state",
					field_name: "Authorisation Status",
					field_values: stateFilterMap[routeMap[fieldId]],
					filter_type: "string",
					field_order: "contains",
					negative: false,
					is_custom: false,
			  }
			: user_search
			? fieldId === "external"
				? {
						field_id: "user_is_external",
						field_name: "External",
						field_values: true,
						filter_type: "boolean",
						negative: false,
						is_custom: false,
				  }
				: {
						field_id: "user_account_type",
						field_name: "User Account Type",
						field_values: stateFilterMap[routeMap[fieldId]],
						filter_type: "string",
						field_order: "contains",
						negative: false,
						is_custom: false,
				  }
			: {};
		return [searchFilter, obj];
	}

	const totalCount = metaData?.other_tabs_count?.reduce(
		(sum, item) => sum + item.count,
		0
	);

	const routeMap = {
		"needs review": "needs_review",
		managed: "managed",
		unmanaged: "unmanaged",
		restricted: "restricted",
		employee: "employees",
		group: "group",
		onboarding: "marked_for_onboarding",
		offboarding: "marked_for_offboarding",
		external: "external",
		service: "service",
		license: "allLicenses",
		contract: "allContracts",
		subscription: "allSubscriptions",
		perpetual: "allPerpetualContracts",
		recognised: "recognised",
		unrecognised: "unrecognised",
		archived: "archived",
		uploads: "uploads",
		drafts: "drafts",
		playbooks: "playbooks",
		"recent runs": "completed",
		security: "security",
	};

	const TabNameMap = {
		needs_review: "Needs Review Apps",
		managed: "Managed Apps",
		unmanaged: "Unmanged Apps",
		restricted: "Restricted Apps",
		employees: "Employees",
		group: "Groups",
		marked_for_onboarding: "Marked for Onboarding",
		marked_for_offboarding: "Marked for Offboarding",
		external: "External",
		service: "Service",
		allLicenses: "Licenses",
		allContracts: "Contracts",
		allSubscriptions: "Subscriptions",
		allPerpetualContracts: "Perpetuals",
		recognised: "Recognised Transactions",
		unrecognised: "Unrecognised Transactions",
		archived: "Archived Transactions",
		uploads: "Uploaded Transactions",
		drafts: "Drafts",
		playbooks: "Playbooks",
		completed: "Completed",
		criticalapps: "Critical Apps",
		criticalusers: "Critical Users",
		runs: "Scheduled Runs",
		rules: "Automation Rules",
	};

	const NoResultsFoundSVGMap = {
		applications: NoResultsFoundSVG,
		users: usersImage,
		licenses: licensesImage,
		transactions: transactionsImage,
		workflows: workflowsImage,
	};

	return (
		<div
			style={{
				height: "75%",
				margin: "auto",
				minHeight: props.minHeight,
			}}
			className="d-flex flex-column justify-content-center align-items-center"
		>
			<img
				className="pl-3 mb-2"
				src={NoResultsFoundSVGMap[route] || NoResultsFoundSVG}
				width={200}
			/>
			<div className="empty-header">{`No results found ${
				!noLocalisedSearch &&
				tabName &&
				tabName[1] &&
				tabName[1] !== "automation"
					? "in " + TabNameMap[tabName[1]]
					: ""
			}`}</div>
			{props.searchQuery && (
				<div className="empty-lower">
					We couldn't find anything for '
					<span>{props.searchQuery}</span>'
				</div>
			)}
			{Array.isArray(metaData?.other_tabs_count) && totalCount > 0 && (
				<>
					<div align="center" className="my-3">
						<div
							style={{
								backgroundColor: "rgba(90, 186, 255, 0.1)",
								color: "rgb(90, 186, 255)",
								minWidth: "40%",
							}}
							className="px-2 py-2 my-2 font-13 mb-4 cursor-pointer"
							onClick={() => {
								dispatch(
									push(hash || router.location.pathname)
								);
								onReset && onReset();
							}}
						>
							Reset Filters for {totalCount} results
						</div>
						<div
							style={{
								flexWrap: "wrap",
								justifyContent: "center",
							}}
							className="flex mt-2"
						>
							{metaData?.other_tabs_count.map((item, index) => (
								<>
									{item?.count > 0 && (
										<div
											onClick={() => {
												let obj = {};
												obj.filter_by =
													app_search || user_search
														? getStateFilterObj(
																item?._id
														  )
														: item?._id ===
														  "uploads"
														? [
																getSearchReqObj(
																	props.searchQuery,
																	"name",
																	"Transaction name"
																),
														  ]
														: item?._id ===
														  "archived"
														? [
																getSearchReqObj(
																	props.searchQuery,
																	"transaction_description",
																	"Transaction Description"
																),
														  ]
														: metaData?.filter_by;
												let url = isWorkflow
													? `?searchQuery=${
															props.searchQuery
													  }#${routeMap[item?._id]}`
													: `?metaData=${encodeURIComponent(
															JSON.stringify(obj)
													  )}&searchQuery=${encodeURIComponent(
															metaData?.search_query ||
																props.searchQuery
													  )}#${
															routeMap[item?._id]
													  }`;

												history.push(url);
											}}
											className="search-result-tab-info mx-3 py-1 p-2 px-3 my-2 cursor-pointer"
										>
											{item?.count || 0} Result found in{" "}
											{capitalizeFirstLetter(item?._id)}{" "}
										</div>
									)}
								</>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
}

EmptySearch.propTypes = {
	searchQuery: PropTypes.string.isRequired,
};
