import React, { useCallback, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { SuggestionMenu } from "../../../../common/SuggestionMenu/SuggestionMenu";
import { checkSpecialCharacters, searchAppCategories } from "../../../../services/api/search";
import { client } from "../../../../utils/client";
import { debounce } from "../../../../utils/common";

export default function CategoryAutoSuggestion(props) {
    const cancelToken = useRef();
    const [value, setValue] = useState({});
    const [showAppCategorySuggestions, setShowAppCategorySuggestions] = useState(false);
	const [appCategorySuggestionsLoading, setAppCategorySuggestionsLoading] = useState(true);
	const [appCategories, setAppCategories] = useState([]);

    const handleCategorySelect = (category) => {
		const { _id, name } = category;
		setValue({
			app_category_name: name,
			app_category_id: _id
		});
        props.onChangeFilter({value: [_id]})
		setShowAppCategorySuggestions(false);
	}

    const generateCategorySuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				searchAppCategories(query, reqCancelToken).then((res) => {
					if (res.results) {
						setAppCategories(res.results);
					}

					setAppCategorySuggestionsLoading(false);
				})
					.catch(err => console.error("Error while searching through app categories", err));
			}
		}, 300)
	)

    const handleCategoryChange = (query) => {
		query = query?.trimStart();
		// validateField("app_category_id",query)
		setValue({
			app_category_name: query
		});

		if (cancelToken.current) cancelToken.current.cancel("Operation cancelled in favor of a new request");

		if (query.length == 0) {
			setShowAppCategorySuggestions(false);
			setAppCategorySuggestionsLoading(false);
			return;
		}

		if(checkSpecialCharacters(query)){
			setShowAppCategorySuggestions(true);
			setAppCategorySuggestionsLoading(false);
			return;
		}

		setAppCategorySuggestionsLoading(true);
		setShowAppCategorySuggestions(true);
		cancelToken.current = client.CancelToken.source();
		generateCategorySuggestions(query, cancelToken.current);
	}

	return (
		<Form.Group
			style={{
				fontSize: "12px",
			}}
		>
			<Form.Label>Category</Form.Label>
			<Form.Control
				style={{ width: "100%" }}
				type="text"
				placeholder="Add Category"
				value={value.app_category_name}
				// isInvalid={isInvalid("app_category_id")}
				onChange={(e) => handleCategoryChange(e.target.value)}
			/>
			<Form.Control.Feedback type="invalid">
				Please select the category.
			</Form.Control.Feedback>
			<div className="position-relative w-100">
				<SuggestionMenu
					show={showAppCategorySuggestions}
					loading={appCategorySuggestionsLoading}
					options={appCategories}
					onSelect={handleCategorySelect}
					dataKeys={{
						image: "profile_img",
						text: "name",
					}}
				/>
			</div>
		</Form.Group>
	);
}
