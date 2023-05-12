import React, { useEffect, useState } from "react";
import {
	searchAppCategories,
	searchUsers,
} from "../../../../../services/api/search";
import { Form, Col } from "react-bootstrap";
import { SuggestionMenu } from "../../../../../common/SuggestionMenu/SuggestionMenu";
import Chip from "./Chip";
import { useDispatch, useSelector } from "react-redux";
import { ACTION_TYPE } from "./redux";
import _ from "underscore";
import { fieldNames } from "../../../../../constants/reports";
import MultiSources from "components/MultiSources";
import { Loader } from "common/Loader/Loader";

const fieldMap = {
	app_owner_name: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "Owner",
	},
	app_category_id: {
		api: searchAppCategories,
		displayKey: "name",
		apiKey: "_id",
		label: "Category",
	},
};

const multiOptions = [
	{
		label: "Is Any of",
		search_in_string: {
			field_order: "contains",
			negative: false,
			is_exact_array: false,
		},
	},
	{
		label: "Is only",
		search_in_string: {
			field_order: "contains",
			negative: false,
			is_exact_array: true,
			is_only: true,
		},
	},
	{
		label: "Is Not of",
		search_in_string: { field_order: "n_contains", negative: true },
	},
];

export default function SelectField(props) {
	const [suggestions, setSuggestions] = useState([]);
	const [activeOption, setActiveOption] = useState(
		props.field_id === "source_array"
			? props.isOnly
				? 1
				: props.isNotOf
				? 2
				: 0
			: 0
	);

	const [metadata, setMetadata] = useState({});
	const values = useSelector((state) => state.filters[props.field_id]);
	const [value, setValue] = useState("");
	const dispatch = useDispatch();
	const type = props.filter_type.toLocaleLowerCase();
	const [sourceFields, setSourceFields] = useState();

	const handleClose = (index) => {
		if (props.filter_type === "boolean") {
			return dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: {
					key: props.field_id,
				},
			});
		}
		const updatedValues = values?.field_values.filter((_item, idx) => {
			return idx !== index;
		});

		if (_.isEmpty(updatedValues)) {
			return dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: {
					key: props.field_id,
				},
			});
		}

		return dispatch({
			type: ACTION_TYPE.UPDATE_FILTER,
			payload: {
				key: props.field_id,
				value: {
					...props,
					field_values: updatedValues,
					field_order: "contains",
				},
			},
		});
	};
	const [showSuggestions, setShowSuggestions] = useState(false);
	useEffect(() => {
		if (props.field_id) {
			setMetadata(fieldMap[props.field_id]);
		}
	}, [props.field_id]);

	useEffect(() => {
		if (props.field_values) {
			setSuggestions(props.field_values);
			if (props.field_id !== "source_array") setShowSuggestions(true);
			return;
		}
	}, [props.field_values, props.isLoadingSources]);

	useEffect(() => {
		if (props.field_id === "source_array") return;
		let option = 0;
		if (type === "search_in_string") {
			let filter = values;

			option = multiOptions.findIndex((i) => {
				if (filter?.field_order === "contains") {
					if (filter.is_exact_array) {
						return i[type].is_exact_array === true;
					} else {
						return multiOptions[0];
					}
				} else {
					return i[type].field_order === values?.field_order;
				}
			});
		}

		if (option === -1) option = 0;
		setActiveOption(option);
	}, [values?.filter_type]);

	const handleSelect = (respObj, key = "name") => {
		const fields = multiOptions[activeOption][type] || {
			field_order: "contains",
		};
		if (typeof respObj === "object") {
			respObj = respObj[key];
		}
		if (props.filter_type === "boolean") {
			setShowSuggestions(false);
			return dispatch({
				type: ACTION_TYPE.UPDATE_FILTER,
				payload: {
					key: props.field_id,
					value: {
						...props,
						field_values: respObj,
					},
				},
			});
		}
		if (Array.isArray(props.value) && props.value?.indexOf(respObj) > -1)
			return;
		const previousValue = values?.field_values || [];
		const updatedSelectedValues = [...previousValue, respObj];
		dispatch({
			type: ACTION_TYPE.UPDATE_FILTER,
			payload: {
				key: props.field_id,
				value: {
					...props,
					field_values: updatedSelectedValues,
					...fields,
				},
			},
		});
		setActiveOption(activeOption);
		setValue("");

		setShowSuggestions(false);
	};

	const handleSourceSelect = (
		respObj,
		filter,
		key,
		isAll = false,
		integrationName
	) => {
		let fieldValueArray = values?.field_values || [];
		let fieldValues;
		let renderingValues;
		let updatedSelectedValues;
		let previousValue = values?.field_values.value || [];
		let previousRenderingValue = values?.field_values?.renderValue || [];

		const renderValueAllMap = {
			integration_id: "Integrations - All",
			global_agent_id: "Agents - All",
		};

		let allValues = Array.isArray(respObj)
			? respObj?.map((i) => (typeof i === "object" ? i[key] : i))
			: [];

		if (isAll && Array.isArray(respObj) && !integrationName) {
			renderingValues = [
				...previousRenderingValue,
				renderValueAllMap[key],
			];
			updatedSelectedValues = [...previousValue, ...allValues];
		} else if (isAll && Array.isArray(respObj) && integrationName) {
			renderingValues = [...previousRenderingValue, integrationName];
			updatedSelectedValues = [...previousValue, ...allValues];
		} else {
			renderingValues = [
				...previousRenderingValue,
				respObj["source_name"],
			];
			updatedSelectedValues = [...previousValue, respObj[key]];
		}

		const filterMap = {
			integration: {
				key: "integration_id",
				value: updatedSelectedValues,
				renderValue: renderingValues,
				value_type: "objectId",
			},
			instance: {
				key: "org_integration_id",
				value: updatedSelectedValues,
				renderValue: renderingValues,
				value_type: "objectId",
			},
			manual: {
				key: "keyword",
				value: ["manual"],
				renderValue: "Manual",
				value_type: "string",
			},
			selectedAgents: {
				key: "global_agent_id",
				value: updatedSelectedValues,
				renderValue: renderingValues,
				value_type: "objectId",
			},
			allAgents: {
				key: "keyword",
				value: ["agent"],
				renderValue: ["All Agents"],
				value_type: "string",
			},
		};

		fieldValues = filterMap[filter];

		fieldValueArray = [...fieldValueArray, fieldValues];
		const fieldsMap = [
			{
				field_order: "contains",
				is_only: false,
			},
			{
				field_order: "contains",
				is_only: true,
			},
			{
				negative: true,
			},
		];

		let fields = fieldsMap[activeOption];
		setSourceFields(fields);

		if (typeof respObj === "object") {
			respObj = respObj[key];
		}

		if (Array.isArray(props.value)) {
			let bool = false;
			props.value?.forEach((val) => {
				if (val.value.indexOf(respObj) > -1) {
					bool = true;
					return;
				}
			});
			if (bool) return;
		}
		dispatch({
			type: ACTION_TYPE.UPDATE_FILTER,
			payload: {
				key: props.field_id,
				value: {
					...props,
					field_values: fieldValueArray,
					...fields,
				},
			},
		});
		setActiveOption(activeOption);
	};

	const handleActiveOptionChange = (index) => {
		let fields;
		if (props.field_id === "source_array") {
			fields = sourceFields;
		} else {
			fields = multiOptions[index][type];
		}
		setActiveOption(index);
		values?.field_values &&
			dispatch({
				type: ACTION_TYPE.UPDATE_FILTER,
				payload: {
					key: props.field_id,
					value: { ...values, ...fields },
				},
			});
	};

	const handleChange = (query) => {
		if (
			props.filter_type === "boolean" ||
			props.field_id === "source_array"
		) {
			return;
		}
		setValue(query);
		const updatedSuggestions = props.field_values.filter((item) => {
			if (typeof item === "boolean") return;
			if (item.name && typeof item.name === "string") {
				return item.name.toLowerCase().includes(query);
			}
			return (
				(Array.isArray(item) || typeof item === "string") &&
				item.includes(query)
			);
		});
		setSuggestions(updatedSuggestions);
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
											placeholder={`${
												props.filter_type === "boolean"
													? "Select"
													: "Add"
											} ${props.field_name}`}
											value={value}
											// isInvalid={isInvalid("app_owner_id")}
											onChange={(e) =>
												handleChange(e.target.value)
											}
											autoFocus={
												props.field_id ===
													"source_array" &&
												value.length
													? true
													: false
											}
											onFocus={() =>
												setShowSuggestions(true)
											}
										/>
									</div>
								}
								onClose={handleClose}
								values={
									Array.isArray(values?.field_values)
										? values?.field_values?.map((i) =>
												typeof i === "object"
													? i.renderValue
													: i
										  )
										: [values?.field_values]
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
						{props.field_id === "source_array" ? (
							suggestions.length ? (
								<MultiSources
									sources={suggestions}
									onSelect={handleSourceSelect}
									dataKeys={{
										image: "logo",
										text:
											props.field_id === "source_array"
												? "source_name"
												: "name",
										email: "user_email",
									}}
									show={showSuggestions}
									isOnly={activeOption === 1 ? true : false}
								/>
							) : !props.isLoadingSources &&
							  suggestions.length === 0 ? (
								<div
									className="text-center px-2 py-3"
									style={{ fontSize: 13 }}
								>
									<span className="text-secondary">
										No results found.
									</span>
								</div>
							) : (
								<>
									<div className="option__card__WFM">
										<Loader height={60} width={60}></Loader>
									</div>
								</>
							)
						) : (
							<SuggestionMenu
								className="position-static"
								show={showSuggestions}
								loading={props.isLoadingSources}
								options={suggestions}
								onSelect={handleSelect}
								dataKeys={{
									image: "logo",
									text:
										props.field_id === "source_array"
											? "source_name"
											: "name",
									email: "user_email",
								}}
							/>
						)}
					</div>
				)}
			</div>
		);
	};

	return (
		<>
			{props.filter_type === "boolean" ? (
				<Col style={{ paddingLeft: "0px" }}>
					<Form.Check
						type="radio"
						label={fieldNames[props.field_name]?.[0] || "true"}
						id="formHorizontalRadios1"
						value={true}
						name={
							props.field_id
								? props.field_id
								: "formHorizontalRadios"
						}
						onClick={(e) => handleSelect(true)}
						checked={props.value && !!props.value}
					/>
					<Form.Check
						type="radio"
						label={fieldNames[props.field_name]?.[1] || "false"}
						id="formHorizontalRadios2"
						value={false}
						name={
							props.field_id
								? props.field_id
								: "formHorizontalRadios"
						}
						onClick={(e) => handleSelect(false)}
						checked={
							props.value === undefined ? false : !props.value
						}
					/>
				</Col>
			) : props.field_id === "source_array" ? (
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
			)}
		</>
	);
}
