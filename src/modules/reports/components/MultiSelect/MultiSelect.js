import React, { useState, useCallback, useRef, useEffect } from "react";
import { components } from "react-select";
import { default as ReactSelect } from "react-select";
import createClass from "create-react-class";
import "./MultiSelect.css";
const VALUE_LIMIT = 6;

const Option = createClass({
	render() {
		return (
			<div>
				<components.Option {...this.props}>
					<input
						type="checkbox"
						checked={this.props.isSelected}
						onChange={(e) => null}
					/>
					<label style={{ marginLeft: "7px" }}>
						{this.props.label}{" "}
					</label>
				</components.Option>
			</div>
		);
	},
});

const MultiValue = (props) => {
	const { index, getValue } = props;
	const hiddenLength = getValue().length - VALUE_LIMIT;
	if (index < VALUE_LIMIT) {
		return (
			<components.MultiValue {...props}>
				<span>{props.data.label}</span>
			</components.MultiValue>
		);
	}

	if (index === VALUE_LIMIT) {
		return (
			<div className="custom__moreitemstodisplay">{`+${hiddenLength}  item${
				hiddenLength != 1 ? "s" : ""
			}`}</div>
		);
	}
	return null;
};
export function MultiSelect(props) {
	const CustomStyle = {
		option: (base, state) => {
			let backgroundColor = "white";
			return {
				...base,
				backgroundColor,
			};
		},
	};
	const [showMenu, setShowMenu] = useState(false);
	const [warning, setWarning] = useState(false);
	const selectAllOption = {
		value: "All",
		label: "All",
	};

	const valueRef = useRef(props.value);
	valueRef.current = props.value;

	const isSelectAllSelected = () =>
		valueRef.current.length === props.options.length;

	const isOptionSelected = (option) =>
		valueRef.current.some(({ value }) => value === option.value) ||
		isSelectAllSelected();
	const getValue = () =>
		isSelectAllSelected() ? [selectAllOption] : props.value;

	const getOptions = () => [selectAllOption, ...props.options];

	const onChange = (newValue, actionMeta) => {
		const { action, option, removedValue } = actionMeta;

		if (
			action === "select-option" &&
			option.value === selectAllOption.value
		) {
			props.onChange(
				props.options,
				actionMeta,
				props.category,
				props.selectionKey
			);
		} else if (
			(action === "deselect-option" &&
				option.value === selectAllOption.value) ||
			(action === "remove-value" &&
				removedValue.value === selectAllOption.value)
		) {
			props.onChange([], actionMeta, props.category, props.selectionKey);
		} else if (
			actionMeta.action === "deselect-option" &&
			isSelectAllSelected()
		) {
			props.onChange(
				props.options.filter(({ value }) => value !== option.value),
				actionMeta,
				props.category,
				props.selectionKey
			);
		} else {
			props.onChange(
				newValue || [],
				actionMeta,
				props.category,
				props.selectionKey
			);
		}
	};
	return (
		<>
			<ReactSelect
				{...props}
				isOptionSelected={isOptionSelected}
				allowSelectAll={true}
				options={getOptions()}
				hideSelectedOptions={false}
				closeMenuOnSelect={showMenu}
				isMulti
				components={{
					IndicatorSeparator: () => null,
					DropdownIndicator: () => null,
					Option,
					MultiValue,
				}}
				onChange={onChange}
				defaultOptions={true}
				value={getValue()}
				styles={CustomStyle}
			></ReactSelect>
		</>
	);
}
