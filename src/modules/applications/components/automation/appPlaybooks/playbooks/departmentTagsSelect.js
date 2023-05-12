import React, { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "../../../../../../utils/common";
import { Form } from "react-bootstrap";
import { client } from "../../../../../../utils/client";
import Chip from "../../../../../../components/Users/Applications/Modals/FiltersRenderer/Chip";
import { TriggerIssue } from "../../../../../../utils/sentry";
import {
	checkSpecialCharacters,
	searchAllDepartments,
} from "services/api/search";
import { SuggestionMenu } from "common/SuggestionMenu/SuggestionMenu";

export default function DepartmentTags({
	department_tags,
	setDepartmentTags,
	setLeftbarChanged,
}) {
	const cancelToken = useRef();
	const [userSuggestions, setUserSuggestions] = useState([]);
	const [userSuggestionsLoading, setUserSuggestionsLoading] = useState(true);
	const [value, setValue] = useState([]);

	const [showUserSuggestions, setShowUserSuggestions] = useState(false);

	const generateUserSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				searchAllDepartments(query, reqCancelToken)
					.then((res) => {
						if (res.results || res.data || res[0].custom_fields) {
							setUserSuggestions(
								res.results || res.data || res[0].custom_fields
							);
						} else if (res.error) {
							setUserSuggestions([]);
						}
						setUserSuggestionsLoading(false);
					})
					.catch((err) => {
						if (!client.isCancel(err)) {
							TriggerIssue(
								`Error while searching Departments`,
								err
							);

							setUserSuggestionsLoading(false);
							setUserSuggestions([]);
						}
					});
			}
		}, 300)
	);

	const handleClose = (index) => {
		const updatedValues = department_tags.filter((_item, idx) => {
			return idx !== index;
		});
		setDepartmentTags(updatedValues);
		setLeftbarChanged(true);
	};

	const handleAppOwnerSelect = (respObj) => {
		if (
			department_tags
				?.map((dept) => dept.department_name)
				.indexOf(respObj["department_name"]) > -1
		) {
			setShowUserSuggestions(false);
			setValue("");
			return;
		}

		const newDepartmentTags = [...department_tags];
		newDepartmentTags.push(respObj);
		setDepartmentTags(newDepartmentTags);
		setLeftbarChanged(true);
		setValue("");
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
			<div className="chip__container">
				<div>
					<Chip
						inputArea={
							<div className="chip__input__wrapper">
								<Form.Control
									type="textarea"
									className="chip__input"
									placeholder={`Add Department`}
									value={value}
									onChange={(e) =>
										handleAppOwnerChange(e.target.value)
									}
								/>
							</div>
						}
						onClose={handleClose}
						values={department_tags?.map(
							(dept) => dept.department_name
						)}
						showResetAll={false}
					/>
				</div>
			</div>
			<Form.Control.Feedback type="invalid">
				Please select a valid Department.{" "}
			</Form.Control.Feedback>
			<div className="position-relative w-100">
				<SuggestionMenu
					className="position-static"
					show={showUserSuggestions}
					loading={userSuggestionsLoading}
					options={userSuggestions}
					onSelect={handleAppOwnerSelect}
					dataKeys={{
						image: "department_logo" || "profile_img",
						text: "department_name",
						email: "user_email",
					}}
				/>
			</div>
		</div>
	);
}
