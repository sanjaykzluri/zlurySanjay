import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import closeIcon from "../../../../../assets/close_icon.svg";
import { SuggestionMenu } from "../../../../../common/SuggestionMenu/SuggestionMenu";
import { useDispatch, useSelector } from "react-redux";
import { ACTION_TYPE } from "./groupsReducer";
export default function SingleSelectField(props) {
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [value, setValue] = useState("");
	const [onSelect, setonSelect] = useState(false);
	const dispatch = useDispatch();
	useEffect(() => {
		if (props.field_values) {
			setSuggestions(props.field_values);
			if (props.field_id !== "source_array.name")
				setShowSuggestions(true);
			return;
		}
	}, [props.field_values]);
	const entity_value = useSelector((state) => {
		return (
			state.groups_filters?.[props.group_key]?.filter(
				(value) => value.field_id === props.field_id
			)[0] || null
		);
	});
	useEffect(() => {
		if (entity_value) {
			setValue(entity_value?.field_values);
			setShowSuggestions(false);
			setonSelect(true);
		}
	}, [entity_value]);
	const handleChange = (query) => {
		if (props.filter_type === "boolean") {
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
	const onClose = () => {
		setValue("");
		setonSelect(false);
		dispatch({
			type: ACTION_TYPE.RESET_GROUP_FILTERS,
		});
		setSuggestions(props.field_values);
	};
	const handleSelect = (respObj) => {
		setValue(respObj);
		setShowSuggestions(false);
		setonSelect(true);
		dispatch({
			type: ACTION_TYPE.UPDATE_GROUP_FILTER,
			payload: {
				key: props.group_key,
				value: {
					...props,
					field_values: respObj,
				},
			},
		});
		dispatch({
			type: ACTION_TYPE.ENTITY_TYPE,
			payload: respObj,
		});
	};
	return (
		<>
			<div style={{ marginTop: "10px" }} className="chip__container mb-2">
				<div className="chip__input__wrapper">
					{onSelect && (
						<div
							style={{
								backgroundColor: "rgba(90, 186, 255, 0.1)",
								padding: "5px",
								marginTop: "5px",
								marginRight: "5px",
							}}
							className="md-chip"
							key={`${value}`}
						>
							<span style={{ color: "#5ABAFF" }} className="p-2">
								{typeof value === "boolean"
									? value?.toString()
									: value}
							</span>
							{onClose && (
								<img
									style={{
										cursor: "pointer",
										paddingRight: "5px",
									}}
									src={closeIcon}
									onClick={() => onClose()}
								/>
							)}
						</div>
					)}
					{!onSelect && (
						<Form.Control
							type="textarea"
							className="chip__input"
							placeholder={`${
								props.filter_type === "boolean"
									? "Select"
									: "Add"
							} ${props.field_name}`}
							value={value}
							onChange={(e) => handleChange(e.target.value)}
							autoFocus={
								props.field_id === "source_array.name" &&
								value.length
									? true
									: false
							}
							onFocus={() => setShowSuggestions(true)}
						/>
					)}
				</div>
			</div>
			<SuggestionMenu
				className="position-static"
				show={showSuggestions}
				loading={false}
				options={suggestions}
				onSelect={handleSelect}
				dataKeys={{
					image: "logo",
					text:
						props.field_id === "source_array.name"
							? "source_name"
							: "name",
					email: "user_email",
				}}
			/>
		</>
	);
}
