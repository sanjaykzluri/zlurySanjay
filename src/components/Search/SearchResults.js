import React, { useCallback } from "react";
import greentick from "../../assets/green_tick.svg";
import SearchItem from "./SearchItem";
import "./Search.css";

export default function SearchResults({ data, label, options }) {
	const renderSearchItem = useCallback((item, _idx) => {
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
			<SearchItem
				name={name}
				url={url}
				image={image}
				categoryName={secondaryText}
				status={item[options?.statusKey]}
				key={item._id}
			/>
		);
	});

	return <div className="search__wrapper">{data.map(renderSearchItem)}</div>;
}
