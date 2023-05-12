import React, { useEffect, useRef, useState } from "react";
import { Form, Col } from "react-bootstrap";
import { reportsConstants } from "../../../../constants/reports";
import { useDispatch, useSelector } from "react-redux";
import "./RangeFilter.css";
import { ACTION_TYPE } from "../../../../components/Users/Applications/Modals/FiltersRenderer/redux";

export function RangeFilter(props) {
	const dispatch = useDispatch();
	const [filterObj, setFilterObj] = useState({
		fieldValues: [],
		fieldOrder: [],
	});
	const [value1, setValue1] = useState();
	const [value2, setValue2] = useState();
	const [rangeValue1, setRangeValue1] = useState();
	const [rangeValue2, setRangeValue2] = useState();
	const [dd1active, setdd1active] = useState(false);
	const [dd2active, setdd2active] = useState(false);
	const [warning, setWarning] = useState(false);
	useEffect(() => {
		if (
			Array.isArray(props.appliedValue) &&
			props.appliedValue.length === 1 &&
			props.appliedOrder[0] !== "lte" &&
			props.appliedOrder[0] !== "gte"
		) {
			setValue1(props.appliedValue[0]);
			setRangeValue1(props.appliedOrder[0]);
		} else if (
			Array.isArray(props.appliedValue) &&
			props.appliedValue.length > 1
		) {
			setValue1(props.appliedValue[0]);
			setRangeValue1(props.appliedOrder[0]);
			setValue2(props.appliedValue[1]);
			setRangeValue2(props.appliedOrder[1]);
		} else if (
			Array.isArray(props.appliedValue) &&
			props.appliedValue.length === 1 &&
			props.appliedOrder[0] === "lte"
		) {
			setValue2(props.appliedValue[0]);
			setRangeValue2(props.appliedOrder[0]);
			setValue1(null);
			setRangeValue1("gte");
		} else if (
			Array.isArray(props.appliedValue) &&
			props.appliedValue.length === 1 &&
			props.appliedOrder[0] === "gte"
		) {
			setValue1(props.appliedValue[0]);
			setRangeValue1(props.appliedOrder[0]);
			setValue2(null);
			setRangeValue2("lte");
		}
		if (props.appliedValue === undefined) {
			setValue1("");
			setValue2("");
		}
	}, [props.appliedValue]);
	const handleInputChange1 = (value) => {
		if (value === "") {
			if (!value2) {
				dispatch({
					type: ACTION_TYPE.RESET_FILTER,
					payload: {
						key: props.field_id,
						value: {
							...props,
						},
					},
				});
			} else {
				dispatch({
					type: ACTION_TYPE.UPDATE_FILTER,
					payload: {
						key: props.field_id,
						value: {
							...props,
							field_name: props.field_name,
							field_values: [value2],
							field_order: [rangeValue2],
							field_type: "range",
							filter_type: "range",
							is_custom: false,
							negative: false,
						},
					},
				});
			}
		}
		setValue1(value);
		if (value < 0) {
			setWarning(true);
		}
		if (value2 && value2 > 0 && value > value2) {
			setWarning(true);
			setValue1(value1);
		}
		if (value2 && value2 > 0) {
			if (value < value2) {
				setWarning(false);
			} else {
				setValue1(value);
				setValue2(value);
			}
		}
		if (
			(!value2 && value > 0) ||
			value === 0 ||
			value === null ||
			value === ""
		) {
			setWarning(false);
		}
	};
	useEffect(() => {
		let tempFilterObj = { ...filterObj };
		if (!value1 && value1 !== 0) {
			return;
		}
		if (rangeValue1 && value1 !== null) {
			tempFilterObj.fieldValues[0] = value1;
			tempFilterObj.fieldOrder[0] = rangeValue1;
		}
		if (rangeValue1 && (value1 === "" || value1 === null)) {
			tempFilterObj.fieldOrder.splice(0, 1);
			tempFilterObj.fieldValues.splice(0, 1);
		}
		if (
			rangeValue1 &&
			(value1 === "" || value1 === null) &&
			rangeValue2 &&
			value2
		) {
			let finaltemp = {
				fieldValues: [],
				fieldOrder: [],
			};
			finaltemp.fieldOrder[0] = rangeValue2;
			finaltemp.fieldValues[0] = value2;
			tempFilterObj = finaltemp;
		}
		if (rangeValue1 && value1 && rangeValue2 && value2) {
			let finaltemp = {
				fieldValues: [],
				fieldOrder: [],
			};
			finaltemp.fieldOrder[0] = rangeValue1;
			finaltemp.fieldValues[0] = value1;
			finaltemp.fieldOrder[1] = rangeValue2;
			finaltemp.fieldValues[1] = value2;
			tempFilterObj = finaltemp;
		}
		if (rangeValue1 && value1 && rangeValue2 && value1 > value2) {
			tempFilterObj.fieldOrder.splice(1, 1);
			tempFilterObj.fieldValues.splice(1, 1);
		}
		if (
			!rangeValue1 &&
			!rangeValue2 &&
			(value1 === "" || value1 === null) &&
			(value2 === "" || value2 === null)
		) {
			let finaltemp = {
				fieldValues: [],
				fieldOrder: [],
			};
			tempFilterObj = finaltemp;
		}
		tempFilterObj.fieldValues = tempFilterObj.fieldValues.map(function (
			item
		) {
			return parseInt(item, 10);
		});
		setFilterObj(tempFilterObj);
		props.handleRange && props.handleRange(tempFilterObj, warning);
	}, [value1]);
	const handleInputChange2 = (value) => {
		if (value === "") {
			if (!value1) {
				dispatch({
					type: ACTION_TYPE.RESET_FILTER,
					payload: {
						key: props.field_id,
						value: {
							...props,
						},
					},
				});
			} else {
				dispatch({
					type: ACTION_TYPE.UPDATE_FILTER,
					payload: {
						key: props.field_id,
						value: {
							...props,
							field_name: props.field_name,
							field_values: [value1],
							field_order: [rangeValue1],
							field_type: "range",
							filter_type: "range",
							is_custom: false,
							negative: false,
						},
					},
				});
			}
		}
		setValue2(value);
		if (
			value !== (0 || null || "") &&
			(value < value1 || value < 0 || value1 < 0)
		) {
			setWarning(true);
		} else {
			setWarning(false);
		}
		if (value2 && value2 > 0 && value < value1) {
			setWarning(true);
		}
	};
	useEffect(() => {
		let tempFilterObj = { ...filterObj };
		if (!value2 && value2 !== 0) return;
		if (rangeValue2 && value2 !== null) {
			tempFilterObj.fieldValues[1] = value2;
			tempFilterObj.fieldOrder[1] = rangeValue2;
		}
		if ((rangeValue2 && value2 === "") || value2 === null) {
			tempFilterObj.fieldOrder.splice(1, 1);
			tempFilterObj.fieldValues.splice(1, 1);
		}
		if (
			rangeValue1 &&
			(value1 === "" || value1 === null) &&
			rangeValue2 &&
			(value2 === "" || value2 === null)
		) {
			let finaltemp = {
				fieldValues: [],
				fieldOrder: [],
			};
			tempFilterObj = finaltemp;
		}
		if (
			rangeValue1 &&
			(value1 === "" || value1 === null) &&
			rangeValue2 &&
			value2
		) {
			let finaltemp = {
				fieldValues: [],
				fieldOrder: [],
			};
			finaltemp.fieldOrder[0] = rangeValue2;
			finaltemp.fieldValues[0] = value2;
			tempFilterObj = finaltemp;
		}
		if (rangeValue1 && value1 && rangeValue2 && value1 > value2) {
			tempFilterObj.fieldOrder.splice(1, 1);
			tempFilterObj.fieldValues.splice(1, 1);
		}
		if (
			!rangeValue1 &&
			!rangeValue2 &&
			(value1 === "" || value1 === null) &&
			(value2 === "" || value2 === null)
		) {
			let finaltemp = {
				fieldValues: [],
				fieldOrder: [],
			};
			tempFilterObj = finaltemp;
		}
		tempFilterObj.fieldValues = tempFilterObj.fieldValues.map(function (
			item
		) {
			return parseInt(item, 10);
		});
		props.handleRange && props.handleRange(tempFilterObj, warning);
		setFilterObj(tempFilterObj);
	}, [value2]);
	const handleFilterClick1 = (value) => {
		props.isFilterModal &&
			dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: {
					key: props.field_id,
					value: {
						...props,
					},
				},
			});
		setWarning(false);
		setRangeValue1(value);
		setRangeValue2();
		setValue1(null);
		setValue2(null);
		setdd1active(false);
		setFilterObj({
			fieldValues: [],
			fieldOrder: [],
		});
	};
	const handleFilterClick2 = (value) => {
		props.isFilterModal &&
			dispatch({
				type: ACTION_TYPE.RESET_FILTER,
				payload: {
					key: props.field_id,
					value: {},
				},
			});
		setWarning(false);
		setRangeValue1(reportsConstants.GREATER_THAN_EQUAL);
		setRangeValue2(reportsConstants.LESS_THAN_EQUAL);
		setValue1(null);
		setValue2(null);
		setFilterObj({
			fieldValues: [],
			fieldOrder: [],
		});
	};

	const radioId = props.field_id ? props.field_id : "formHorizontalRadios";

	return (
		<>
			<Col style={props.isFilterModal ? { paddingLeft: "0px" } : null}>
				<Form.Check
					type="radio"
					label="Greater than"
					name={props.name ? props.name : "formHorizontalRadios"}
					id={radioId + "5"}
					value={reportsConstants.GREATER_THAN}
					onClick={(e) => handleFilterClick1(e.target.value)}
					checked={rangeValue1 === "gt"}
				/>
				{rangeValue1 === reportsConstants.GREATER_THAN && (
					<>
						<input
							type="number"
							style={{
								width: "140px",
								height: "34px",
								border: "1px solid #dddddd",
							}}
							onChange={(e) => handleInputChange1(e.target.value)}
							value={value1}
						></input>
					</>
				)}
				<Form.Check
					type="radio"
					label="Smaller than"
					name={props.name ? props.name : "formHorizontalRadios"}
					id={radioId + "2"}
					value={reportsConstants.LESS_THAN}
					onClick={(e) => handleFilterClick1(e.target.value)}
					checked={rangeValue1 === "lt"}
				/>
				{rangeValue1 === reportsConstants.LESS_THAN && (
					<>
						<input
							type="number"
							style={{
								width: "140px",
								height: "34px",
								border: "1px solid #dddddd",
							}}
							onChange={(e) => handleInputChange1(e.target.value)}
							value={value1}
						></input>
					</>
				)}
				<Form.Check
					type="radio"
					label="Range"
					name={props.name ? props.name : "formHorizontalRadios"}
					id={radioId + "3"}
					value="range"
					onClick={(e) => handleFilterClick2(e.target.value)}
					checked={rangeValue1 === "gte" || rangeValue2 === "lte"}
				/>
				{rangeValue1 === reportsConstants.GREATER_THAN_EQUAL && (
					<>
						<div className="rangeFilter__rangediv">
							<input
								type="number"
								style={{
									width: "140px",
									height: "34px",
									marginRight: "10px",
									border: "1px solid #dddddd",
								}}
								onChange={(e) =>
									handleInputChange1(e.target.value)
								}
								value={value1}
							></input>
							<span style={{ marginRight: "10px" }}>-</span>
							<input
								type="number"
								style={{
									width: "140px",
									height: "34px",
									border: "1px solid #dddddd",
								}}
								onChange={(e) =>
									handleInputChange2(e.target.value)
								}
								value={value2}
							></input>
						</div>
					</>
				)}
				<Form.Check
					type="radio"
					label="Equal to"
					name={props.name ? props.name : "formHorizontalRadios"}
					id={radioId + "6"}
					value={reportsConstants.EQUAL_TO}
					onClick={(e) => handleFilterClick1(e.target.value)}
					checked={rangeValue1 === "eq"}
				/>
				{rangeValue1 === reportsConstants.EQUAL_TO && (
					<>
						<input
							type="number"
							style={{
								width: "140px",
								height: "34px",
								border: "1px solid #dddddd",
							}}
							onChange={(e) => handleInputChange1(e.target.value)}
							value={value1}
						></input>
					</>
				)}
			</Col>
		</>
	);
}
