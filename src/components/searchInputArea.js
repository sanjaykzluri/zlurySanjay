import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { checkSpecialCharacters } from "services/api/search";

export const SearchInputArea = ({
	placeholder,
	onClick,
	setSearchQuery,
	className,
	style,
	searchQuery,
}) => {
	const query = useSelector((state) => state.router.location.query);
	const [searchTerm, setSearchTerm] = useState(
		searchQuery || query?.searchQuery || ""
	);
	const [inputInvalid, setInputInvalid] = useState(false);
	const [invalidCharacter, setInvalidCharater] = useState("");

	useEffect(() => {
		if (searchQuery == "") {
			setSearchTerm(searchQuery);
		}
	}, [searchQuery]);

	useEffect(() => {
		if (query?.searchQuery) {
			setSearchTerm(query?.searchQuery);
		} else if (query.viewId != undefined) {
			setSearchTerm("");
		}
	}, [query]);

	const handleSearchQuery = (event) => {
		let invalidKey = checkSpecialCharacters(
			event.target.value?.trim(),
			true,
			true
		);
		if (invalidKey) {
			setInputInvalid(true);
			setInvalidCharater(invalidKey);
		} else {
			setInputInvalid(false);
			setSearchQuery && setSearchQuery(event.target.value?.trim());
			setSearchTerm(event.target.value?.trimStart());
		}
	};

	useEffect(() => {
		let timer;
		if (invalidCharacter && inputInvalid) {
			timer = setInterval(() => setInvalidCharater(), 2000);
		}
		return () => clearInterval(timer);
	}, [inputInvalid]);

	return (
		<>
			<input
				type="text"
				value={searchTerm}
				placeholder={placeholder}
				onChange={handleSearchQuery}
				onClick={onClick}
				className={className}
				style={style}
			/>
			{inputInvalid && invalidCharacter && (
				<div
					className="font-11 mt-2"
					style={{
						color: "rgb(255, 103, 103)",
						position: "absolute",
						left: 0,
						top: "32px",
					}}
				>
					{invalidCharacter} is Invalid.
				</div>
			)}
		</>
	);
};
