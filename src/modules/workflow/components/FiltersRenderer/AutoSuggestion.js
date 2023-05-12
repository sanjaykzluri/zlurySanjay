import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	debounce,
	recursive_decode_request_data,
} from "../../../../utils/common";
import {
	checkSpecialCharacters,
	searchAllApps,
	searchAppCategories,
	searchAppCategoriesInFilters,
	searchAppTags,
	searchEntityCustomValues,
	searchUsers,
	searchVendors,
} from "../../../../services/api/search";
import { Form } from "react-bootstrap";
import { SuggestionMenu } from "../../../../common/SuggestionMenu/SuggestionMenu";
import { client } from "../../../../utils/client";
import Chip from "./Chip";
import { TriggerIssue } from "../../../../utils/sentry";
import { ACTION_TYPE } from "./redux";
import { useDispatch, useSelector } from "react-redux";

const multiOptions = [
	{
		label: "Is Any of",
		search_in_string: {
			field_order: "contains",
			negative: false,
		},
	},
	{
		label: "Is Not of",
		search_in_string: { field_order: "contains", negative: true },
	},
];

const fieldMap = {
	app_name: {
		api: searchAllApps,
		displayKey: "app_name",
		apiKey: "app_id",
		label: "Application",
		imageKey: "app_logo",
		allowFewSpecialCharacters: true,
	},
	kbkey: {
		api: searchAllApps,
		displayKey: "app_name",
		apiKey: "app_id",
		label: "Application",
		imageKey: "app_logo",
		allowFewSpecialCharacters: true,
	},
	owner_name: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "Owner",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
	user_name: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "User",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
	created_by_user_name: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "Created by User",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
	published_by_user_name: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "Published by User",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
	vendor_name: {
		api: searchVendors,
		displayKey: "vendor_name",
		apiKey: "vendor_id",
		label: "Vendor",
		imageKey: "vendor_logo",
		allowFewSpecialCharacters: false,
	},
	app_owner_name: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "Owner",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
	app_technical_owner_name: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "IT Owner",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
	app_financial_owner_name: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "Finance Owner",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
	app_category_id: {
		api: searchAppCategories,
		displayKey: "name",
		apiKey: "_id",
		label: "Category",
		allowFewSpecialCharacters: false,
	},
	dept_head_name: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "Owner",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
	custom_fields: {
		api: searchEntityCustomValues,
		displayKey: "custom_field_name",
		selectedId: "custom_field_id",
		apiKey: "field_id",
		label: "entity",
		imageKey: "custom_field_image",
		allowFewSpecialCharacters: true,
	},
	app_tags: {
		api: searchAppTags,
		displayKey: "app_tag",
		label: "Tag",
		allowFewSpecialCharacters: true,
	},
	"app_sub_categories.category_name": {
		api: searchAppCategoriesInFilters,
		displayKey: "category",
		label: "Category",
		allowFewSpecialCharacters: true,
	},
	"app_sub_categories.sub_category_name": {
		api: searchAppCategories,
		displayKey: "name",
		label: "Sub-Category",
		allowFewSpecialCharacters: true,
	},
	"users.user_name": {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "User",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
	scheduled_by_user_name: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "Scheduled By",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
};

export default function Autosuggestions(props) {
	const cancelToken = useRef();
	const [userSuggestions, setUserSuggestions] = useState([]);
	const [metadata, setMetadata] = useState({});
	const [userSuggestionsLoading, setUserSuggestionsLoading] = useState(true);

	const [fieldId, setFieldId] = useState("");

	useEffect(() => {
		if (typeof props.field_id === "string") setFieldId(props.field_id);
		else if (
			props.filter_type === "objectId" &&
			Array.isArray(props.field_id) &&
			props.field_id.length > 0
		) {
			setFieldId("kbkey");
		}
	}, [props.field_id]);

	const values = useSelector((state) => state.filters[fieldId]);
	const [value, setValue] = useState([]);
	const router = useSelector((state) => state.router);
	const [suggestions, setSuggestions] = useState([]);
	const [activeOption, setActiveOption] = useState(
		fieldId === "app_tags" ? (props.isNotOf ? 1 : 0) : 0
	);
	const type = props.filter_type.toLocaleLowerCase();

	const { pathname } = router.location;

	const dispatch = useDispatch();
	const [appSuggestions, setAppSuggestions] = useState([]);
	const [appSuggestionsLoading, setAppSuggestionsLoading] = useState(true);

	const [showUserSuggestions, setShowUserSuggestions] = useState(false);
	const [appCategorySuggestionsLoading, setAppCategorySuggestionsLoading] =
		useState(true);
	const path = pathname.split("/");
	let pathName = path[1];

	useEffect(() => {
		if (fieldId) {
			setMetadata(
				fieldMap[props.searchable ? props.original_field_id : fieldId]
			);
		}
	}, [fieldId]);

	const generateUserSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				if (
					checkSpecialCharacters(
						query,
						fieldMap[
							props.searchable ? props.original_field_id : fieldId
						]?.allowFewSpecialCharacters
					)
				) {
					setUserSuggestions([]);
					setUserSuggestionsLoading(false);
				} else if (metadata.api) {
					metadata
						.api(
							query,
							reqCancelToken,
							true,
							fieldId,
							pathName === "users" ? "users" : "applications"
						)
						.then((res) => {
							if (
								res.results ||
								res.data ||
								res[0].custom_fields
							) {
								setUserSuggestions(
									res.results ||
										res.data ||
										res[0].custom_fields
								);
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
								setUserSuggestionsLoading(false);
								setUserSuggestions([]);
							}
						});
				}
			}
		}, 300)
	);

	const handleClose = (index) => {
		const previousValue = values?.field_values || [];
		const previousCustomFieldValues = values?.custom_field_values || [];
		const updatedValues = (
			previousCustomFieldValues.length
				? previousCustomFieldValues
				: previousValue
		).filter((_item, idx) => {
			return idx !== index;
		});
		if (updatedValues.length === 0) {
			dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: {
					key: fieldId,
					value: { ...props, field_values: updatedValues },
				},
			});
		} else {
			dispatch({
				type: ACTION_TYPE.UPDATE_FILTER,
				payload: {
					key: fieldId,
					value: { ...props, field_values: updatedValues },
				},
			});
		}
	};

	const handleActiveOptionChange = (index) => {
		setActiveOption(index);
		setValue("");
		dispatch({
			type: ACTION_TYPE.UPDATE_FILTER,
			payload: {
				key: fieldId,
				value: {
					...props,
					field_order: "contains",
					negative:
						fieldId === "app_tags"
							? multiOptions[activeOption][type].negative
							: false,
					field_values: [],
					custom_field_values: [],
				},
			},
		});
	};

	const handleAppOwnerSelect = (respObj) => {
		const { displayKey, apiKey, selectedId } = metadata;
		const name = respObj[displayKey];
		const value = respObj[displayKey];
		const idValue = respObj[apiKey];
		const customFieldId = respObj[selectedId];
		if (values?.field_values?.indexOf(respObj[displayKey]) > -1) {
			setShowUserSuggestions(false);
			setValue("");
			return;
		}
		const previousValue = values?.field_values || [];
		const updatedSelectedValues = [
			...previousValue,
			encodeURIComponent(value),
		];
		const updatedSelectedIdValues = [
			...previousValue,
			encodeURIComponent(idValue),
		];

		const previousNameValue = values?.field_name_values || [];
		const updatedSelectedNameValue = [
			...previousNameValue,
			encodeURI(name),
		];

		const previousCustomFieldValues = values?.custom_field_values || [];
		const customUpdatedSelectedValues = [
			...previousCustomFieldValues,
			encodeURIComponent(
				respObj.org_custom_field_type === "reference"
					? customFieldId
					: value
			),
		];

		setValue("");
		dispatch({
			type: ACTION_TYPE.UPDATE_FILTER,
			payload: {
				key: fieldId,
				value: {
					...props,
					field_order: "contains",
					negative:
						fieldId === "app_tags"
							? multiOptions[activeOption][type].negative
							: false,
					field_values:
						props.filter_type === "objectId"
							? updatedSelectedIdValues
							: updatedSelectedValues,
					field_name_values: updatedSelectedNameValue,
					custom_field_values: customUpdatedSelectedValues,
				},
			},
		});
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

	const AutoSuggestContainer = ({ multiOption, option, index = 0 }) => {
		let labelName = option?.label
			? option.label
			: props.filter_type === "boolean"
			? "Is of"
			: "Is Any of";
		return (
			<div className="autosuggest__container">
				<Form.Check
					onChange={() =>
						multiOption && handleActiveOptionChange(index)
					}
					className="my-1"
					id={`suggestionBox${props?.field_name}`}
					checked={activeOption === index}
					type="radio"
					label={labelName}
				/>
				{activeOption === index && (
					<div
						style={{ marginTop: "10px" }}
						className="chip__container mb-2"
					>
						<div>
							<Chip
								inputArea={
									<div className="chip__input__wrapper">
										<Form.Control
											type="textarea"
											className="chip__input"
											placeholder={`Add ${metadata?.label}`}
											value={value}
											// isInvalid={isInvalid("app_owner_id")}
											onChange={(e) =>
												handleAppOwnerChange(
													e.target.value,
													option
												)
											}
											autoFocus={true}
										/>
									</div>
								}
								onClose={handleClose}
								values={
									props.filter_type === "objectId"
										? recursive_decode_request_data(
												values?.field_name_values
										  )
										: recursive_decode_request_data(
												values?.field_values
										  )
								}
								showResetAll={false}
							/>
						</div>
					</div>
				)}
				<Form.Control.Feedback type="invalid">
					Please select a valid {metadata?.label}.{" "}
				</Form.Control.Feedback>
				{activeOption === index && (
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
				)}
			</div>
		);
	};

	return fieldId === "app_tags" ? (
		<>
			{multiOptions.map((option, index) => (
				<AutoSuggestContainer
					multiOption={true}
					option={option}
					index={index}
					key={`suggestionBox${props?.field_name}${index}`}
				/>
			))}
		</>
	) : (
		<AutoSuggestContainer />
	);
}
