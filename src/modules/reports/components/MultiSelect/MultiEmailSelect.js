import React, { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "../../../../utils/common";
import {
	checkSpecialCharacters,
	searchUsers,
} from "../../../../services/api/search";
import { Form } from "react-bootstrap";
import { SuggestionMenu } from "../../../../common/SuggestionMenu/SuggestionMenu";
import { client } from "../../../../utils/client";
import { TriggerIssue } from "../../../../utils/sentry";
import Chip from "../../../../components/Users/Applications/Modals/FiltersRenderer/Chip.js";
const fieldMap = {
	user_email: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "Email",
		imageKey: "profile_img",
	},
};

export default function MultiEmailSelect(props) {
	const cancelToken = useRef();
	const [userSuggestions, setUserSuggestions] = useState([]);
	const [value, setValue] = useState([]);
	const [metadata, setMetadata] = useState({});
	const [userSuggestionsLoading, setUserSuggestionsLoading] = useState(true);
	const [showUserSuggestions, setShowUserSuggestions] = useState(false);
	const [selectedValues, setSelectedValues] = useState([]);

	useEffect(() => {
		if (props.field_id) {
			setMetadata(fieldMap[props.field_id]);
		}
	}, [props.field_id]);

	const generateUserSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				if (checkSpecialCharacters(query, true)) {
					setUserSuggestions([]);
					setUserSuggestionsLoading(false);
				} else if (metadata.api) {
					metadata
						.api(query, reqCancelToken, true)
						.then((res) => {
							if (res.results || res.data) {
								setUserSuggestions(res.results || res.data);
							} else if (res.error) {
								setUserSuggestions([]);
							}
							setUserSuggestionsLoading(false);
						})
						.catch((err) => {
							if (!client.isCancel(err)) {
								if (metadata.label) {
									TriggerIssue(
										`Error while searching ${metadata.label}`,
										err
									);
								} else {
									TriggerIssue(`Error while searching`, err);
								}
							}
						});
				}
			}
		}, 300)
	);

	const handleClose = (index) => {
		const updatedValues = appliedValues.filter((_item, idx) => {
			return idx !== index;
		});
		setAppliedValues(updatedValues);
		const updatedSelectedValues = selectedValues.filter((_item, idx) => {
			return idx !== index;
		});
		setSelectedValues(updatedSelectedValues);
		props.onChangeFilter(updatedSelectedValues);
	};

	const [appliedValues, setAppliedValues] = useState(props?.value || []);

	const handleAppOwnerSelect = (respObj) => {
		const { displayKey, apiKey } = metadata;
		const name = respObj[displayKey];
		const value = respObj.user_email;
		const id = respObj[apiKey];
		if (props.selectedIds.includes(id)) {
			return;
		}
		if (appliedValues.indexOf(respObj[displayKey]) > -1) return;
		const previousValue =
			(props.selectedIds ? props.selectedIds : appliedValues) || [];

		let updatedSelectedValues = [];
		if (metadata.label === "Email") {
			updatedSelectedValues = [...previousValue, id];
		}

		setAppliedValues([...appliedValues, value]);
		setValue("");
		props.onChangeFilter(updatedSelectedValues);
		setSelectedValues(updatedSelectedValues);
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

		if (checkSpecialCharacters(query)) {
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
			<div style={{ marginTop: "10px" }} className="chip__container">
				<div>
					<Chip
						inputArea={
							<div className="chip__input__wrapper">
								<Form.Control
									bsPrefix={props.className}
									placeholder={`Additional Emails`}
									as="textarea"
									value={value}
									onChange={(e) =>
										handleAppOwnerChange(e.target.value)
									}
								/>
							</div>
						}
						showResetAll={false}
						onClose={handleClose}
						values={appliedValues}
					/>
				</div>
			</div>
			<Form.Control.Feedback type="invalid">
				Please select a valid {metadata?.label}.{" "}
			</Form.Control.Feedback>
			<div className="position-relative w-100">
				<SuggestionMenu
					className="position-static"
					show={showUserSuggestions}
					loading={userSuggestionsLoading}
					options={userSuggestions}
					onSelect={handleAppOwnerSelect}
					dataKeys={{
						image: metadata?.imageKey || "profile_img",
						text: metadata?.displayKey,
						email: "user_email",
					}}
				/>
			</div>
		</div>
	);
}
