import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	debounce,
	recursive_decode_request_data,
} from "../../../../../utils/common";
import {
	checkSpecialCharacters,
	searchAllApps,
	searchAllRecognisedTransactionsAuditlogs,
	searchAllDepartments,
	searchAllPaymentMethodsAuditlogs,
	searchUsers,
	searchIntegrationsAuditlogs,
	searchLicenses,
	searchVendors,
	searchContractsAuditlogs,
} from "../../../../../services/api/search";
import { Form } from "react-bootstrap";
import { SuggestionMenu } from "../../../../../common/SuggestionMenu/SuggestionMenu";
import { client } from "../../../../../utils/client";
import Chip from "./Chip";
import { TriggerIssue } from "../../../../../utils/sentry";
import { ACTION_TYPE } from "./groupsReducer";
import { useDispatch, useSelector } from "react-redux";

const fieldMap = {
	app_id: {
		api: searchAllApps,
		displayKey: "app_name",
		apiKey: "app_id",
		label: "Application",
		imageKey: "app_logo",
		allowFewSpecialCharacters: true,
	},
	user_id: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "User",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
	},
	vendor_id: {
		api: searchVendors,
		displayKey: "vendor_name",
		apiKey: "vendor_id",
		label: "Vendor",
		imageKey: "vendor_logo",
		allowFewSpecialCharacters: false,
	},
	payment_method_id: {
		api: searchAllPaymentMethodsAuditlogs,
		displayKey: "payment_method_name",
		apiKey: "payment_method_id",
		label: "Payment Method",
		imageKey: "payment_logo",
		allowFewSpecialCharacters: false,
	},
	department_id: {
		api: searchAllDepartments,
		displayKey: "department_name",
		apiKey: "department_id",
		label: "Department",
		imageKey: "department_logo",
		allowFewSpecialCharacters: false,
	},
	transaction_id: {
		api: searchAllRecognisedTransactionsAuditlogs,
		displayKey: "transaction_name",
		apiKey: "transaction_id",
		label: "Transaction",
		imageKey: "transaction_logo",
		allowFewSpecialCharacters: false,
	},
	integration_id: {
		api: searchIntegrationsAuditlogs,
		displayKey: "name",
		apiKey: "integration_id",
		label: "Integration",
		imageKey: "integration_logo",
		allowFewSpecialCharacters: false,
	},
	license_id: {
		api: searchLicenses,
		displayKey: "name",
		apiKey: "license_id",
		label: "License",
		imageKey: "license_logo",
		allowFewSpecialCharacters: false,
	},
	contract_id: {
		api: searchContractsAuditlogs,
		displayKey: "name",
		apiKey: "contract_id",
		label: "Contract",
		imageKey: "contract_logo",
		allowFewSpecialCharacters: false,
	},
};

export default function EntityAutosuggestion(props) {
	const cancelToken = useRef();
	const [userSuggestions, setUserSuggestions] = useState([]);
	const [metadata, setMetadata] = useState({});
	const [userSuggestionsLoading, setUserSuggestionsLoading] = useState(true);

	const values = useSelector((state) => {
		return (
			state.groups_filters?.[props.group_key]?.filter(
				(value) => value.field_id === props.field_id
			)[0] || null
		);
	});
	const [value, setValue] = useState([]);
	const router = useSelector((state) => state.router);

	const { pathname } = router.location;

	const dispatch = useDispatch();

	const [showUserSuggestions, setShowUserSuggestions] = useState(false);
	const path = pathname.split("/");
	let pathName = path[1];
	useEffect(() => {
		if (props) {
			setMetadata(fieldMap[props.field_id]);
		}
	}, [props]);

	const generateUserSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				if (
					checkSpecialCharacters(
						query,
						fieldMap[props.field_id].allowFewSpecialCharacters
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
							props.field_id,
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
		const updatedValues = previousValue.filter((_item, idx) => {
			return idx !== index;
		});

		dispatch({
			type: ACTION_TYPE.UPDATE_ENTITY_ARRAY,
			payload: {
				key: props.group_key,
				value: { ...props, field_values: updatedValues },
			},
		});
	};

	const handleAppOwnerSelect = (respObj) => {
		const { displayKey, apiKey } = metadata;
		const value = { id: respObj[apiKey], name: respObj[displayKey] };
		//const filter_value = respObj[apiKey];
		const values_names = values?.field_values?.map((val) => val.name);
		if (values_names?.indexOf(respObj[displayKey]) > -1) {
			setShowUserSuggestions(false);
			setValue("");
			return;
		}
		const previousValue = values?.field_values || [];
		const updatedSelectedValues = [...previousValue, value];
		setValue("");
		dispatch({
			type: ACTION_TYPE.UPDATE_ENTITY_ARRAY,
			payload: {
				key: props.group_key,
				value: {
					...props,
					field_order: "contains",
					field_values: updatedSelectedValues,
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
	return (
		<div className="autosuggest__container">
			<div style={{ marginTop: "10px" }} className="chip__container">
				<div>
					<Chip
						inputArea={
							<div className="chip__input__wrapper">
								<Form.Control
									type="textarea"
									className="chip__input"
									placeholder={`Search ${metadata?.label}`}
									value={value}
									// isInvalid={isInvalid("app_owner_id")}
									onChange={(e) =>
										handleAppOwnerChange(e.target.value)
									}
								/>
							</div>
						}
						onClose={handleClose}
						values={recursive_decode_request_data(
							values?.field_values?.map((value) => value.name)
						)}
						showResetAll={false}
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
