import React, { useState, useCallback, useRef, useEffect } from "react";
import { components } from "react-select";
import { default as ReactSelect } from "react-select";
import createClass from "create-react-class";
import "./PaymentFilter.css";
import { getImageForPaymentMethodDropdown } from "../../../../components/Transactions/Recognised/Dropdown";
const VALUE_LIMIT = 6;

function GetPaymentLogo(props) {
	return (
		<img
			src={getImageForPaymentMethodDropdown(props.data)}
			style={{
				marginRight: "8px",
				height: "14px",
				width: "22px",
			}}
		></img>
	);
}
const Option = createClass({
	render() {
		return (
			<div>
				<components.Option {...this.props}>
					{this.props.value === "All" ? (
						<div className="paymentfilter__custom__option">
							<input
								type="checkbox"
								checked={this.props.isSelected}
								onChange={(e) => null}
							/>{" "}
							<div className="paymentfilter__custom__option__d2__all">
								{this.props.value}
							</div>
						</div>
					) : (
						<div className="paymentfilter__custom__option">
							<input
								type="checkbox"
								checked={this.props.isSelected}
								onChange={(e) => null}
							/>{" "}
							<div className="paymentfilter__custom__option__d2">
								<div className="paymentfilter__custom__option__d2__d1">
									<GetPaymentLogo
										data={this.props.data}
									></GetPaymentLogo>
									<div className="paymentfilter__custom__option__d2__d1__d2">
										{this.props.data
											.bank_masked_account_digits ||
										this.props.data.cc_masked_digits
											? "•••• •••• " +
											  (this.props.data
													.bank_masked_account_digits ||
													this.props.data
														.cc_masked_digits)
											: null}
									</div>
								</div>
								<div className="paymentfilter__custom__option__d2__d2">
									{this.props.value}
								</div>
							</div>
						</div>
					)}
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
				{props.data.value === "All" ? (
					<span>{props.data.label}</span>
				) : (
					<div className="paymentfilter__customlabel">
						<div className="paymentfilter__custom__option__d2__d1">
							<GetPaymentLogo data={props.data}></GetPaymentLogo>
						</div>
						<span>{props.data.label}</span>
					</div>
				)}
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

export function PaymentFilterNew(props) {
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
	const selectAllOption = {
		value: "All",
		label: "All",
		id: "All",
	};
	const valueRef = useRef(props.value);
	valueRef.current = props.value;

	const isSelectAllSelected = () =>
		valueRef.current.length === props.options.length;

	const isOptionSelected = (option) =>
		valueRef.current.some(({ id }) => id === option.id) ||
		isSelectAllSelected();

	const getValue = () =>
		isSelectAllSelected() ? [selectAllOption] : props.value;

	const getOptions = () => [selectAllOption, ...props.options];

	const onChange = (newValue, actionMeta) => {
		const { action, option, removedValue } = actionMeta;
		if (action === "select-option" && option.id === selectAllOption.id) {
			props.onChange(
				props.options,
				actionMeta,
				props.category,
				props.selectionKey
			);
		} else if (
			(action === "deselect-option" &&
				option.id === selectAllOption.id) ||
			(action === "remove-value" &&
				removedValue.id === selectAllOption.id)
		) {
			props.onChange([], actionMeta, props.category, props.selectionKey);
		} else if (
			actionMeta.action === "deselect-option" &&
			isSelectAllSelected()
		) {
			props.onChange(
				props.options.filter(({ id }) => id !== option.id),
				actionMeta
			);
		} else if (actionMeta.action === "select-option") {
			props.onChange(
				newValue || [],
				actionMeta,
				props.category,
				props.selectionKey
			);
		} else if (actionMeta.action === "clear") {
			props.onChange([], actionMeta, props.category, props.selectionKey);
		} else {
			props.onChange(
				props.value && props.value.length > 0
					? props.value.filter(
							({ id }) => id !== (removedValue || option).id
					  )
					: [],
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
				isMulti={true}
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
