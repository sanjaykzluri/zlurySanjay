import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import Chip from "./Chip";
import { ACTION_TYPE } from "./redux";
import { useDispatch, useSelector } from "react-redux";
import { checkSpecialCharacters } from "../../../../services/api/search";
const allowFewSpecialChars = true;

const options = [
	{
		label: "Text contains",
		search_in_string: { field_order: "contains", negative: false },
		objectid: { negative: false },
	},
	{
		label: "Text does not contain",
		search_in_string: { field_order: "n_contains", negative: false },
		objectid: { negative: true },
	},
];

export default function StringField(props) {
	const type = props.filter_type.toLocaleLowerCase();
	const [activeOption, setActiveOption] = useState(0);
	const values = useSelector((state) => state.filters[props.field_id]);
	const [fieldOrder, setFieldOrder] = useState();
	const [inputVal, setInputVal] = useState("");
	const dispatch = useDispatch();

	useEffect(() => {
		let option = 0;
		if (type === "search_in_string") {
			option = options.findIndex(
				(i) => i[type].field_order === values?.field_order
			);
		}
		if (type === "objectid") {
			option = options.findIndex(
				(i) => i[type].negative === values?.negative
			);
		}

		if (option === -1) option = 0;
		setActiveOption(option);
	}, [values?.filter_type]);
	const handleChange = (value) => {
		const fields = options[activeOption][type];

		if (value === "") {
			dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: { key: props.field_id },
			});
		} else if (value != null) {
			const fieldValues = [value];
			dispatch({
				type: ACTION_TYPE.UPDATE_FILTER,
				payload: {
					key: props.field_id,
					value: {
						...props,
						field_values: fieldValues,
						...fields,
					},
				},
			});
		}
	};

	const handleChipInputChange = (e, onBlur) => {
		const fields = options[activeOption][type];
		const val = e.target.value;
		if (
			val?.charAt(val.length - 1) !== "," &&
			checkSpecialCharacters(val, allowFewSpecialChars)
		) {
			return;
		}
		setInputVal(val);
		if (val?.charAt(val.length - 1) === "," || onBlur) {
			if (!val) {
				return;
			}
			const updatedValues = val.split(",").filter((i) => !!i);
			if (values?.field_values?.indexOf(updatedValues[0]) > -1) return;
			const previousValues = values?.field_values || [];
			handleChange([...previousValues, ...updatedValues]);
			dispatch({
				type: ACTION_TYPE.UPDATE_FILTER,
				payload: {
					key: props.field_id,
					value: {
						...props,
						field_values: [...previousValues, ...updatedValues],
						...fields,
					},
				},
			});
			setInputVal("");
		}
	};

	const handleClose = (index) => {
		const fields = options[activeOption][type];
		const updatedValues = values?.field_values?.filter((_item, idx) => {
			return idx !== index;
		});
		if (updatedValues.length > 0) {
			dispatch({
				type: ACTION_TYPE.UPDATE_FILTER,
				payload: {
					key: props.field_id,
					value: {
						...props,
						...fields,
						field_values: updatedValues,
					},
				},
			});
		} else {
			dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: {
					key: props.field_id,
				},
			});
		}
	};

	const handleActiveOptionChange = (index) => {
		const fields = options[index][type];
		setFieldOrder(options[index][type].field_order);
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

	return (
		<Form>
			<Form.Group controlId="formBasicCheckbox">
				{options.map((option, index) => {
					if (
						props.field_id === "contracts.license_name" ||
						props.field_id === "contracts.license_id"
					) {
						if (index === 0) {
							return (
								<div key={index} className="mb-3">
									<Form.Check
										checked={activeOption === index}
										onChange={() =>
											handleActiveOptionChange(index)
										}
										type="radio"
										id={index}
										label={option.label}
									/>
									{activeOption === index &&
										props.filter_type ===
											"search_in_string" && (
											<Form.Control
												type="text"
												placeholder="Enter value"
												className="mt-2"
												value={
													values?.field_values || ""
												}
												onChange={(e) => {
													if (
														!checkSpecialCharacters(
															e.target.value,
															allowFewSpecialChars
														)
													) {
														handleChange(
															e.target.value
														);
													}
												}}
											/>
										)}
									{props.filter_type.toLocaleLowerCase() ===
										"objectid" &&
										activeOption === index && (
											<div
												style={{ marginTop: "10px" }}
												className="chip__container"
											>
												<Chip
													inputArea={
														<div className="chip__input__wrapper">
															<Form.Control
																type="text"
																className="chip__input"
																placeholder={`Enter value`}
																value={inputVal}
																// isInvalid={isInvalid("app_owner_id")}
																onChange={
																	handleChipInputChange
																}
																onBlur={(e) => {
																	handleChipInputChange(
																		e,
																		true
																	);
																}}
															/>
														</div>
													}
													onClose={handleClose}
													values={
														values?.field_values ||
														[]
													}
													showResetAll={false}
												/>
											</div>
										)}
								</div>
							);
						}
					} else {
						return (
							<div key={index} className="mb-3">
								<Form.Check
									checked={activeOption === index}
									onChange={() =>
										handleActiveOptionChange(index)
									}
									type="radio"
									id={index}
									label={option.label}
								/>
								{activeOption === index &&
									props.field_type !== "multi_string" &&
									props.filter_type ===
										"search_in_string" && (
										<Form.Control
											type="text"
											placeholder="Enter value"
											className="mt-2"
											value={values?.field_values || ""}
											onChange={(e) => {
												if (
													!checkSpecialCharacters(
														e.target.value,
														allowFewSpecialChars
													)
												) {
													handleChange(
														e.target.value
													);
												}
											}}
										/>
									)}
								{(props.filter_type.toLocaleLowerCase() ===
									"objectid" ||
									(props.field_type === "multi_string" &&
										props.filter_type.toLocaleLowerCase() ===
											"search_in_string")) &&
									activeOption === index && (
										<div
											style={{ marginTop: "10px" }}
											className="chip__container"
										>
											<Chip
												inputArea={
													<div className="chip__input__wrapper">
														<Form.Control
															type="text"
															className="chip__input"
															placeholder={`Enter value`}
															value={inputVal}
															// isInvalid={isInvalid("app_owner_id")}
															onChange={
																handleChipInputChange
															}
															onBlur={(e) => {
																handleChipInputChange(
																	e,
																	true
																);
															}}
														/>
													</div>
												}
												onClose={handleClose}
												values={
													values?.field_values || []
												}
												showResetAll={false}
											/>
										</div>
									)}
							</div>
						);
					}
				})}
			</Form.Group>
		</Form>
	);
}
