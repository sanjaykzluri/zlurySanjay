import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { SuggestionMenu } from "../../../../common/SuggestionMenu/SuggestionMenu";
import Chip from "./Chip";
import { useDispatch, useSelector } from "react-redux";
import { ACTION_TYPE } from "./redux";
import _ from "underscore";
import { RangeFilter } from "../../../../modules/reports/components/RangeFilter/RangeFilter";
import { DateRangeFilter } from "../../../../modules/reports/components/RangeFilter/DateRangeFilter";

export default function RangeField(props) {
	const [suggestions, setSuggestions] = useState([]);
	const [metadata, setMetadata] = useState({});
	const values = useSelector((state) => state.filters[props.field_id]);
	const [value, setValue] = useState("");
	const [appliedValue, setAppliedValue] = useState(props.value);
	const [appliedOrder, setAppliedOrder] = useState(props.appliedOrder);
	const dispatch = useDispatch();
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
				value: { ...props, field_values: updatedValues },
			},
		});
	};
	const [showSuggestions, setShowSuggestions] = useState(false);

	useEffect(() => {
		if (props.field_values) {
			setSuggestions(props.field_values);
			setShowSuggestions(true);
			return;
		}
	}, [props.field_values]);

	const handleSelect = (respObj) => {
		if (typeof respObj === "object") {
			respObj = respObj.name;
		}
		if (props.filter_type === "boolean") {
			setShowSuggestions(false);
			return dispatch({
				type: ACTION_TYPE.UPDATE_FILTER,
				payload: {
					key: props.field_id,
					value: { ...props, field_values: respObj },
				},
			});
		}
		if (Array.isArray(props.value) && props.value?.indexOf(respObj) > -1)
			return;
		const previousValue = values?.field_values || [];
		const updatedSelectedValues = [respObj];
		dispatch({
			type: ACTION_TYPE.UPDATE_FILTER,
			payload: {
				key: props.field_id,
				value: { ...props, field_values: updatedSelectedValues },
			},
		});

		setShowSuggestions(false);
	};

	const handleRange = (respObj) => {
		if (respObj.fieldValues.length > 0) {
			dispatch({
				type: ACTION_TYPE.UPDATE_FILTER,
				payload: {
					key: props.field_id,
					value: {
						...props,
						field_values: respObj.fieldValues,
						field_order: respObj.fieldOrder,
					},
				},
			});
		} else {
			dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: {
					key: props.field_id,
					value: {
						...props,
					},
				},
			});
		}
	};
	const handleDateRange = (respObj) => {
		if (respObj.fieldValues.length > 0) {
			dispatch({
				type: ACTION_TYPE.UPDATE_FILTER,
				payload: {
					key: props.field_id,
					value: {
						...props,
						field_values: respObj.fieldValues,
						field_order: respObj.fieldOrder,
						timestamp_type: respObj.timestamp_type,
					},
				},
			});
		} else {
			dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: {
					key: props.field_id,
					value: {
						...props,
					},
				},
			});
		}
	};

	return (
		<>
			{props.field_order?.length === 1 &&
			JSON.stringify(props.field_order) === JSON.stringify(["gt"]) ? (
				<div className="autosuggest__container">
					<Form.Check
						checked={true}
						type="radio"
						label={
							props.filter_type === "boolean"
								? "Is of"
								: "Is Greater Than"
						}
					/>
					<div
						style={{ marginTop: "10px" }}
						className="chip__container"
					>
						<div>
							<Chip
								inputArea={
									<div className="chip__input__wrapper">
										<Form.Control
											type="textarea"
											className="chip__input"
											placeholder={`Select ${props.field_name}
									 `}
											value={value}
											onFocus={() =>
												setShowSuggestions(true)
											}
										/>
									</div>
								}
								onClose={handleClose}
								values={
									Array.isArray(values?.field_values)
										? values?.field_values?.map((i) => i)
										: [values?.field_values]
								}
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
							show={showSuggestions}
							loading={false}
							options={suggestions}
							onSelect={handleSelect}
							dataKeys={{
								image: "logo",
								text: "name",
								email: "user_email",
							}}
						/>
					</div>
				</div>
			) : props.field_type === "date_range" ? (
				<DateRangeFilter
					isFilterModal={true}
					handleDateRange={handleDateRange}
					name={props.field_name}
					field_id={props.field_id}
					appliedOrder={values?.field_order}
					appliedValue={values?.field_values}
					timestamp_type={values?.timestamp_type}
				></DateRangeFilter>
			) : (
				<RangeFilter
					isFilterModal={true}
					handleRange={handleRange}
					name={props.field_name}
					field_id={props.field_id}
					appliedOrder={values?.field_order}
					appliedValue={values?.field_values}
					field_name={props.field_name}
				></RangeFilter>
			)}
		</>
	);
}
