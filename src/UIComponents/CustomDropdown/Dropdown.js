import React, { useRef, useState } from "react";
import downArrow from "assets/down_arrow.svg";
import useOutsideClick from "common/OutsideClick/OutsideClick";
import { capitalizeFirstLetter } from "utils/common";
import "./Dropdown.css";
import search from "assets/search.svg";
import { TriggerIssue } from "utils/sentry";
import { Spinner } from "react-bootstrap";
import { client } from "utils/client";
import { checkSpecialCharacters } from "services/api/search";

export default function Dropdown({
	options = [],
	toggler = <img src={downArrow} />,
	onOptionSelect,
	top = "110px !important",
	right = "-30px !important",
	optionFormatter,
	menuHeaderText,
	menuHeaderFormatter = (text) => (
		<div
			className="lightGreyBg font-10 bold-600 d-flex align-items-center"
			style={{ paddingLeft: "16px", lineHeight: "26px" }}
		>
			{text}
		</div>
	),
	optionClassName = "dropdown_options cursor-pointer",
	menuClassName = "dropdown_options_menu",
	optionStyle = {},
	menuStyle = {},
	localSearch = false,
	localSearchKey,
	apiSearch = false,
	apiSearchCall,
	apiSearchDataKey = "",
	searchPlaceHolder = "Search",
	isParentDropdown = false,
	searchBoxStyle = {},
	togglerStyle = {},
	dropdownWidth = "fit-content",
	className = "",
	optionIsNotSelectable,
	disabledOptionClassName = "o-6 cursor-default",
	isEnabled = true,
	noResultsFoundComp = (
		<div className={`dropdown_options justify-content-center`}>
			<span>No Data found</span>
		</div>
	),
}) {
	const ref = useRef();
	const cancelToken = useRef();
	const [showDropdown, setShowDropdown] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [apiSearchOptions, setApiSearchOptions] = useState([]);
	const [searching, setSearching] = useState(false);

	useOutsideClick(ref, () => {
		if (showDropdown) setShowDropdown(false);
	});

	const handleOptionSelect = (option) => {
		if (optionIsNotSelectable && optionIsNotSelectable(option)) {
			return;
		}
		onOptionSelect && onOptionSelect(option);
		!isParentDropdown && setShowDropdown(false);
	};

	const handleSearchQueryChange = (e) => {
		const text = e.target.value?.trimStart();
		setSearchQuery(text);
		if (cancelToken.current?.token) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (apiSearch && apiSearchCall && text?.length > 1) {
			setSearching(true);
			cancelToken.current = client.CancelToken.source();
			if (checkSpecialCharacters(text)) {
				setApiSearchOptions([]);
				setSearching(false);
				return;
			}
			apiSearchCall(text, cancelToken.current)
				.then((res) => {
					if (apiSearchDataKey) {
						if (apiSearchDataKey.includes(".")) {
							const apiSearchDataKeyArray =
								apiSearchDataKey.split(".");
							for (const key of apiSearchDataKeyArray) {
								res = res[key];
							}
						} else {
							res = res[apiSearchDataKey];
						}
					}
					if (Array.isArray(res)) {
						setApiSearchOptions(res);
						setSearching(false);
					} else {
						TriggerIssue(
							"Unexpected response from api search call in dropdown",
							res
						);
						setApiSearchOptions([]);
						setSearching(false);
					}
				})
				.catch((err) => {
					if (
						err?.message !==
						"Operation cancelled in favor of a new request"
					) {
						TriggerIssue(
							"Error response from api search call in dropdown",
							err
						);
						setApiSearchOptions([]);
						setSearching(false);
					}
				});
		} else {
			setSearching(false);
		}
	};

	const checkLocalSearch = (option) => {
		if (localSearch) {
			if (localSearchKey) {
				return option[localSearchKey]
					?.toLowerCase()
					.includes(searchQuery?.toLowerCase());
			} else {
				return option
					?.toLowerCase()
					.includes(searchQuery?.toLowerCase());
			}
		} else return true;
	};

	const emptySearchResults = () => {
		if (localSearch) {
			return (
				options.filter((option) => checkLocalSearch(option)).length ===
				0
			);
		}
		if (apiSearch) {
			return (
				Array.isArray(apiSearchOptions) &&
				apiSearchOptions?.length === 0 &&
				!searching
			);
		}
	};

	return (
		<div
			className={`position-relative ${className}`}
			style={{ width: dropdownWidth }}
			ref={ref}
		>
			<div
				onClick={(e) => {
					isEnabled && setShowDropdown(!showDropdown);
					e.stopPropagation();
				}}
				className="cursor-pointer"
				style={{ ...togglerStyle }}
			>
				{toggler}
			</div>
			<div
				className={menuClassName}
				style={{ top: top, right: right, ...menuStyle }}
				hidden={!showDropdown}
			>
				{menuHeaderText && menuHeaderFormatter(menuHeaderText)}
				{(localSearch || apiSearch) && (
					<div className="dropdown_search_bar_container">
						<input
							type="text"
							value={searchQuery}
							placeholder={searchPlaceHolder}
							onChange={handleSearchQueryChange}
							style={{ ...searchBoxStyle }}
						/>
						<img src={search} aria-hidden="true" />
					</div>
				)}
				{searching ? (
					<div className="dropdown_spinner_container">
						<Spinner
							animation="border"
							role="status"
							variant="dark"
							size="sm"
							style={{ borderWidth: 2 }}
						/>
					</div>
				) : (
					<>
						{Array.isArray(
							apiSearch && searchQuery?.length > 1
								? apiSearchOptions
								: options
						) &&
							(apiSearch && searchQuery?.length > 1
								? apiSearchOptions
								: options
							).map(
								(option, index) =>
									checkLocalSearch(option) && (
										<div
											id={index}
											className={`${optionClassName} ${
												optionIsNotSelectable &&
												optionIsNotSelectable(option)
													? disabledOptionClassName
													: ""
											}`}
											key={index}
											onClick={(e) => {
												handleOptionSelect(option);
												e.stopPropagation();
											}}
											style={optionStyle}
										>
											{optionFormatter
												? optionFormatter(option)
												: capitalizeFirstLetter(option)}
										</div>
									)
							)}
						{searchQuery &&
							emptySearchResults() &&
							noResultsFoundComp}
					</>
				)}
			</div>
		</div>
	);
}
