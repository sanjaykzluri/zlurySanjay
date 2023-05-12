import React, { useCallback, useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import backNav from "assets/back-nav.svg";
import { Navbar, Nav, FormControl } from "react-bootstrap";
import search from "assets/search.svg";
import { useOutsideClickListener } from "utils/clickListenerHook";
import "components/HeaderTitleAndGlobalSearch/HeaderTitleBC.css";
import { client } from "utils/client";
import { checkSpecialCharacters } from "services/api/search";
import { debounce } from "utils/common";
import { LoaderPage } from "common/Loader/LoaderPage";
import search__outer from "assets/search__outer.svg";

import { TriggerIssue } from "utils/sentry";
import { searchGlobalAppsForEmployees } from "services/api/employeeDashboard";
import EmployeeGlobalSearchResults from "./EmployeeGlobalSearchResults";

export default function EmployeeGlobalSearch() {
	const ref = useRef();
	const history = useHistory();
	const location = useLocation();
	const searchCancelToken = useRef();
	const [showDropdown, setShowDropdown] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchData, setSearchData] = useState();
	const [loading, setLoading] = useState(false);

	useOutsideClickListener(ref, () => {
		setShowDropdown(false);
	});

	let updateSearchKey = (value) => {
		value = value?.trimStart();
		setSearchQuery(value);
		if (!value || value.length == 0) return;

		if (searchCancelToken.current) {
			searchCancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}

		searchCancelToken.current = client.CancelToken.source();
		setLoading(true);
		if (!checkSpecialCharacters(value)) {
			getSearchResults(value, searchCancelToken.current);
		} else {
			setLoading(false);
			setSearchData([]);
		}
	};

	const getSearchResults = useCallback(
		debounce((query, cancelToken) => {
			searchGlobalAppsForEmployees(query, cancelToken)
				.then((res) => {
					setSearchData(res.data);
					setLoading(false);
				})
				.catch((err) => {
					if (
						err.message !==
						"Operation cancelled in favor of a new request"
					) {
						setSearchData([]);
						TriggerIssue(
							"Error fetching global search results",
							err
						);
					}
				});
		}, 300),
		[]
	);

	return (
		<>
			<Navbar bg="white" variant="light" className="Nav">
				{location.pathname == "/user/search" && (
					<Nav className="mr-4">
						<a className="cursor-pointer" onClick={history.goBack}>
							<img src={backNav} alt="Navigate back" />
						</a>
					</Nav>
				)}
				<Nav className="mr-auto d-flex align-items-center">
					<div className="search" style={{ marginLeft: "5px" }}>
						<img src={search} height={20} width={20} />
						<FormControl
							bsPrefix="header__custom__search"
							style={{ border: "none" }}
							type="text"
							placeholder={`Search Apps`}
							value={searchQuery}
							onChange={(e) => updateSearchKey(e.target.value)}
						/>
					</div>
				</Nav>
				{/* <HeaderNavButtons /> */}
			</Navbar>
			<hr style={{ margin: "0px 12px" }} />
			{searchQuery === "" ? (
				<div className="search__outermain__cont">
					<img
						src={search__outer}
						alt="Search for apps, users, departments and integrations"
					/>
					<div className="search__outermain__cont__d1">
						Begin typing to search
					</div>
					<div className="search__outermain__cont__d2">
						Search for apps
					</div>
				</div>
			) : loading ? (
				<LoaderPage />
			) : (
				searchData && (
					<EmployeeGlobalSearchResults
						results={searchData}
						searchkey={searchQuery}
					/>
				)
			)}
		</>
	);
}
