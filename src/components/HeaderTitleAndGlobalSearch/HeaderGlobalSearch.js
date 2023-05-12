import React, { useCallback, useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import backNav from "../../assets/back-nav.svg";
import { Navbar, Nav, FormControl } from "react-bootstrap";
import HeaderNavButtons from "./HeaderNavButtons";
import search from "../../assets/search.svg";
import { globalSearchEntityAndAPI } from "./HeaderGlobalSearchConstants";
import { useOutsideClickListener } from "../../utils/clickListenerHook";
import downArrow from "../../assets/down_arrow.svg";
import "./HeaderTitleBC.css";
import { useDispatch, useSelector } from "react-redux";
import { client } from "../../utils/client";
import { searchConstants } from "../../constants";
import { checkSpecialCharacters, getSearch } from "../../services/api/search";
import { debounce } from "../../utils/common";
import { LoaderPage } from "../../common/Loader/LoaderPage";
import Search from "../Search/Search";
import BeginSearch from "../Search/BeginSearch";
import { TriggerIssue } from "../../utils/sentry";

export default function HeaderGlobalSearch() {
	const ref = useRef();
	const history = useHistory();
	const location = useLocation();
	const dispatch = useDispatch();
	const searchCancelToken = useRef();
	const [searchEntity, setSearchEntity] = useState(
		globalSearchEntityAndAPI[0]
	);
	const [showDropdown, setShowDropdown] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const searchdata = useSelector((state) => state.search.searchdata);

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

		dispatch({ type: searchConstants.SEARCH_REQUESTED });
		if (!checkSpecialCharacters(value)) {
			getSearchResults(value, searchCancelToken.current);
		} else {
			dispatch({
				type: searchConstants.SEARCH_FETCHED,
				payload: {
					data: {
						results: {
							applications: [],
							users: [],
							department: [],
							integrations: [],
						},
					},
				},
			});
		}
	};

	const getSearchResults = useCallback(
		debounce((query, cancelToken) => {
			getSearch(query, cancelToken)
				.then((res) => {
					dispatch({
						type: searchConstants.SEARCH_FETCHED,
						payload: {
							data: res,
						},
					});
				})
				.catch((err) => {
					if (
						err.message !==
						"Operation cancelled in favor of a new request"
					) {
						dispatch({
							type: searchConstants.SEARCH_FETCHED,
							payload: {
								data: [],
							},
						});
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
				{location.pathname == "/search" && (
					<Nav className="mr-4">
						<a className="cursor-pointer" onClick={history.goBack}>
							<img src={backNav} alt="Navigate back" />
						</a>
					</Nav>
				)}
				<Nav className="mr-auto d-flex align-items-center">
					<div className="dropdown-container">
						<div
							onClick={() => setShowDropdown(!showDropdown)}
							className="dropdown-value-display-class"
						>
							<div className="font-12">{searchEntity.text}</div>
							<img src={downArrow} width={8} />
						</div>
						<div
							className="dropdown-options-container"
							hidden={!showDropdown}
							ref={(el) => {
								if (el) {
									ref.current = el;
								}
							}}
							style={{ transform: "scale(1.1)" }}
						>
							{globalSearchEntityAndAPI.map((el, key) => (
								<div
									className="dropdown-option"
									key={key}
									onClick={() => {
										setSearchEntity(el);
										setShowDropdown(!showDropdown);
									}}
								>
									{el.text}
								</div>
							))}
						</div>
					</div>
					<div className="search" style={{ marginLeft: "5px" }}>
						<img src={search} height={20} width={20} />
						<FormControl
							bsPrefix="header__custom__search"
							style={{ border: "none" }}
							type="text"
							placeholder={`Search ${searchEntity.text}`}
							value={searchQuery}
							onChange={(e) => updateSearchKey(e.target.value)}
						/>
					</div>
				</Nav>
				<HeaderNavButtons />
			</Navbar>
			<hr style={{ margin: "0px 12px" }} />
			{searchQuery === "" ? (
				<BeginSearch />
			) : searchdata.loading ? (
				<LoaderPage />
			) : (
				searchdata.data.results && (
					<Search
						results={searchdata.data.results}
						searchkey={searchQuery}
						entity={searchEntity.text}
					/>
				)
			)}
		</>
	);
}
