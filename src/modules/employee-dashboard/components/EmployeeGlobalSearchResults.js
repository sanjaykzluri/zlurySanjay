import React, { useCallback } from "react";

import { checkSpecialCharacters } from "services/api/search";
import { useHistory } from "react-router-dom";
import NoResults from "components/Search/NoResults";
import SearchResults from "components/Search/SearchResults";
import EmployeeSearchItem from "./EmployeeSearchItem";

export default function EmployeeGlobalSearchResults({ results, searchkey }) {
	const history = useHistory();

	const totalresults = checkSpecialCharacters(searchkey) ? 0 : results.length;

	const renderSearchItem = useCallback((item, _idx) => {
		let options = {
			secondaryTextKey: "category_name",
			urlTemplate: "/user/applications/{_id}",
			statusKey: "status",
			imageKey: "app_image_url",
		};
		const name = options?.nameKey ? item[options?.nameKey] : item.name;
		const image = options?.imageKey ? item[options?.imageKey] : item.image;
		const field = options.urlTemplate.match(/{(.*)}/)[1];
		const url = options.urlTemplate.replace(/{(.*)}/, item[field]);
		let secondaryText = options?.secondaryTextKey
			? item[options?.secondaryTextKey]
			: item.secondaryText;
		if (options.secondaryTextSuffix)
			secondaryText = `${secondaryText} ${options.secondaryTextSuffix}`;

		return (
			<EmployeeSearchItem
				name={name}
				url={url}
				image={image}
				categoryName={secondaryText}
				status={item[options?.statusKey]}
				key={item._id}
				item={item}
			/>
		);
	});
	return (
		<div className="search__outermain">
			<div className="totalResults font-18">
				{totalresults} Results for {searchkey}
			</div>

			<div className="search__wrapper">
				{results.map(renderSearchItem)}
			</div>

			{searchkey === "" && (
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
			)}
			{totalresults === 0 && <NoResults searchkey={searchkey} />}
		</div>
	);
}
