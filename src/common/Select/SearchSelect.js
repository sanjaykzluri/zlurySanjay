import React, {
	useCallback,
	useRef,
	useState,
	useEffect,
	Fragment,
} from "react";
import PropTypes from "prop-types";
import search from "../../assets/search.svg";
import { NameBadge } from "../NameBadge";
import { debounce, unescape } from "../../utils/common";
import { Loader } from "../Loader/Loader";
import { client } from "../../utils/client";

import "./Select.scss";
import { checkSpecialCharacters } from "../../services/api/search";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export function SearchSelect(props) {
	const {
		keyFields,
		allowFewSpecialCharacters = false,
		optionsPresent = false,
	} = props;
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);

	const cancelToken = useRef();

	useEffect(() => {
		if (
			props.optionsPresent &&
			Array.isArray(props.options) &&
			props.options.length > 0
		) {
			setSearchResults(props.options);
		} else {
			setSearchResults([]);
		}
	}, [props]);
	const generateSearchResults = useCallback(
		debounce((query, reqCancelToken) => {
			props.fetchFn(query, reqCancelToken, true).then((res) => {
				if (res.results || res.data) {
					setSearchResults(res.results || res.data);
				}

				setIsSearching(false);
			});
		}, 300),
		[]
	);

	const handleSearchQueryChange = (query) => {
		setSearchQuery(query);
		if (cancelToken.current) {
			cancelToken.current.cancel();
		}

		if (
			query.length == 0 ||
			checkSpecialCharacters(query, allowFewSpecialCharacters)
		) {
			setIsSearching(false);
			if (optionsPresent) {
				setSearchResults(props.options);
				return;
			}
			setSearchResults([]);
			return;
		}

		if (query.length >= 2) {
			if (optionsPresent) {
				let tempArray = [];
				props.options.forEach((el) => {
					if (el.name.toLowerCase().includes(query.toLowerCase())) {
						tempArray.push(el);
					}
				});
				setSearchResults(tempArray);
			} else {
				setIsSearching(true);
				cancelToken.current = client.CancelToken.source();
				generateSearchResults(query, cancelToken.current);
			}
		}
	};

	const handleSelect = (choice) => {
		props.onSelect(choice);
		props.onHide && props.onHide();
	};

	if (!props.show) return <></>;

	return (
		<Fragment>
			<div className="search-bar m-2">
				<input
					type="text"
					placeholder="Search"
					value={searchQuery}
					onChange={(e) => handleSearchQueryChange(e.target.value)}
				/>
				<img src={search} aria-hidden="true" />
			</div>
			{isSearching && (
				<>
					<div className="option__card__WFM">
						<Loader height={40} width={40} />
					</div>
				</>
			)}
			{!isSearching && searchResults.length > 0 && (
				<div
					className="border-top py-1 cursor-pointer"
					style={{ overflowY: "scroll", ...props.resultBoxStyle }}
				>
					{searchResults.map((result) => (
						<li
							key={result[keyFields.id]}
							className="select-menu-item"
							onClick={(e) => {
								e.stopPropagation();
								handleSelect(result);
							}}
						>
							{result[keyFields.image] ? (
								<img
									src={unescape(result[keyFields.image])}
									className="mr-2"
									width={26}
								/>
							) : (
								<NameBadge
									name={result[keyFields.name]}
									width={26}
									className="mr-2"
								/>
							)}

							<div className="col">
								<div className="row">
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>
												{result[keyFields.name]}
											</Tooltip>
										}
									>
										<div className={"truncate_10vw"}>
											{result[keyFields.name]}
										</div>
									</OverlayTrigger>
								</div>
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{result[keyFields.email]}
										</Tooltip>
									}
								>
									<div className="row user_email_suggestion truncate_10vw">
										{result[keyFields.email]}
									</div>
								</OverlayTrigger>
							</div>
						</li>
					))}
				</div>
			)}
		</Fragment>
	);
}

SearchSelect.propTypes = {
	show: PropTypes.bool.isRequired,
	onHide: PropTypes.func.isRequired,
	fetchFn: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	keyFields: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.any.isRequired,
			name: PropTypes.string.isRequired,
			image: PropTypes.string.isRequired,
		})
	).isRequired,
};
