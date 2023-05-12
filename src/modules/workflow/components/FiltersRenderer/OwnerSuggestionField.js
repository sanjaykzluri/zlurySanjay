import React, { useCallback, useRef, useState } from "react";
import { debounce } from "../../../../utils/common";
import {
	checkSpecialCharacters,
	searchUsers,
} from "../../../../services/api/search";
import { Form } from "react-bootstrap";
import { SuggestionMenu } from "../../../../common/SuggestionMenu/SuggestionMenu";
import { client } from "../../../../utils/client";
import Chip from "./Chip";

export default function OwnerSuggestionField(props) {
	const cancelToken = useRef();
	const [userSuggestions, setUserSuggestions] = useState([]);
	const [value, setValue] = useState([]);
	const [selectedValues, setSelectedValues] = useState([]);
	const [userSuggestionsLoading, setUserSuggestionsLoading] = useState(true);

	const [appSuggestions, setAppSuggestions] = useState([]);
	const [appSuggestionsLoading, setAppSuggestionsLoading] = useState(true);

	const [showUserSuggestions, setShowUserSuggestions] = useState(false);
	const [
		appCategorySuggestionsLoading,
		setAppCategorySuggestionsLoading,
	] = useState(true);

	const generateUserSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				searchUsers(query, reqCancelToken, true)
					.then((res) => {
						if (res.results) {
							setUserSuggestions(res.results);
						}

						setUserSuggestionsLoading(false);
					})
					.catch((err) =>
						console.error(
							"Error while searching through org users",
							err
						)
					);
			}
		}, 300)
	);
	const handleAppOwnerSelect = (user) => {
		const { user_id, user_name } = user;
		setSelectedValues([
			...selectedValues,
			{
				app_owner: user_name,
				app_owner_id: user_id,
			},
		]);
		setValue("");
		props.onChangeFilter({ value: [user_name] });
		setShowUserSuggestions(false);
	};

	const handleAppOwnerChange = (query) => {
		query = query?.trimStart();
		setValue(query);

		if (cancelToken.current)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);

		if (query.length == 0) {
			setShowUserSuggestions(false);
			setUserSuggestionsLoading(false);
			return;
		}

		if (checkSpecialCharacters(query, true)) {
			setShowUserSuggestions(true);
			setUserSuggestionsLoading(false);
			return;
		}

		setUserSuggestionsLoading(true);
		setShowUserSuggestions(true);
		cancelToken.current = client.CancelToken.source();
		generateUserSuggestions(query, cancelToken.current);
	};

	return (
		<div className="autosuggest__container">
			<Form.Label>Owner</Form.Label>
			<div className="chip__container">
				<div>
					<Chip values={selectedValues.map((i) => i.app_owner)} />
				</div>
				<div className="chip__input__wrapper">
					<Form.Control
						type="textarea"
						className="chip__input"
						placeholder="Add Owner"
						value={value}
						// isInvalid={isInvalid("app_owner_id")}
						onChange={(e) => handleAppOwnerChange(e.target.value)}
					/>
				</div>
			</div>
			<Form.Control.Feedback type="invalid">
				Please select a valid owner.{" "}
			</Form.Control.Feedback>
			<div className="position-relative w-100">
				<SuggestionMenu
					className="position-static"
					show={showUserSuggestions}
					loading={userSuggestionsLoading}
					options={userSuggestions}
					onSelect={handleAppOwnerSelect}
					dataKeys={{
						image: "profile_img",
						text: "user_name",
						email: "user_email",
					}}
				/>
			</div>
		</div>
	);
}
