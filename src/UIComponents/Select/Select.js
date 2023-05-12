import React, { useEffect, useRef, useState, useMemo } from "react";
import "./Select.css";
import search from "../../assets/search.svg";
import close from "../../assets/close.svg";
import arrowdropdown from "assets/arrowdropdown.svg";
import noData from "../../assets/icons/no-data-db.svg";
import refresh from "../../assets/new-refresh-icon.svg";
import PropTypes from "prop-types";
import { useOutsideClickListener } from "../../utils/clickListenerHook";
import { ProgressBarLoader } from "../../common/Loader/ProgressBarLoader";

const MODE = {
	SINGLE: "single",
	MULTI: "multi",
	TAG: "tag",
};

export function Select(props) {
	const [showOptions, setShowOptions] = useState();
	const [localValue, setLocalValue] = useState(null);
	const [query, setQuery] = useState(
		props.search &&
			props.mode === MODE.SINGLE &&
			Array.isArray(props.value) &&
			props.value.length > 0
			? props.value[0]?.[props.fieldNames.label]
			: ""
	);
	const ref = useRef(null);
	useOutsideClickListener(ref, () => setShowOptions(false));

	const value = useMemo(() => {
		return ((localValue) => {
			return localValue ? localValue : props.value;
		})(localValue, props.value);
	}, [localValue, props.value]);

	const options = useMemo(() => {
		return ((query) => {
			return query && props.filter && props.options
				? props.options.filter((option) =>
						props.filterMethod(
							query,
							option[props.fieldNames.label]
						)
				  )
				: props.options;
		})(query, props.options, props.filter);
	}, [query, props.options]);

	useEffect(() => {
		if (localValue) {
			props.onChange(localValue);
			if (props.search && props.mode === MODE.SINGLE) {
				setQuery(localValue[props.fieldNames.label]);
			} else {
				setQuery("");
			}
		}
	}, [localValue]);

	useEffect(() => {
		if (props.search && props.mode === MODE.SINGLE) {
			if (props.disableLocalValue) {
				setQuery(props.value?.[0]?.[props.fieldNames?.label]);
			}
		}
	}, [JSON.stringify(props.fieldNames)]);

	useEffect(() => {
		if (props.search && !props.filter && (query || query === "")) {
			props.onSearch(query);
		}
	}, [query]);

	useEffect(() => {
		if (!showOptions && props.clearInput) {
			setQuery("");
		}
	}, [showOptions]);

	const optionContainer = Array.isArray(options)
		? props.groupBy
			? Object.keys(props.groupByOptions(options, props.groupBy)).map(
					(group, index) => {
						return (
							<div className="z-select-group" key={index}>
								{props.groupByUIRender(group)}
								{props
									.groupByOptions(options, props.groupBy)
									[group].map((option, index) => (
										<div
											onClick={(e) => {
												e.stopPropagation();
												updateValue(option);
											}}
											className="z-select-option"
											key={index}
										>
											{props.optionRender(option, props)}
										</div>
									))}
							</div>
						);
					}
			  )
			: options.map((option, index) => {
					return (
						<div
							onClick={(e) => {
								e.stopPropagation();
								if (!option.disabled) {
									updateValue(option);
								}
							}}
							className={`z-select-option ${
								option.disabled
									? "z-select-option-disabled"
									: ""
							}`}
							key={index}
						>
							{props.optionRender(option, props)}
						</div>
					);
			  })
		: null;

	const updateValue = (option) => {
		switch (props.mode) {
			case MODE.MULTI:
				if (Array.isArray(value)) {
					if (getOptionIndex(option) === -1) {
						setLocalValue([...value, option]);
					}
				} else {
					setLocalValue([option]);
				}
				break;
			default:
				setLocalValue({ ...option });
				break;
		}
		setShowOptions(false);
	};

	const removeSelectedOption = (option) => {
		const data = value;
		const index = data.findIndex(
			(item) =>
				item[props.fieldNames.label] === option[props.fieldNames.label]
		);
		if (index > -1) {
			data.splice(index, 1);
			setLocalValue([...data]);
		}
	};

	const getOptionIndex = (option) => {
		const data = value;
		const index = data.findIndex(
			(item) => JSON.stringify(item) === JSON.stringify(option)
		);
		return index;
	};

	const placeholder = (
		<div
			className={`z-select-placeholder font-14 ${
				props.placeholderClassName || ""
			}`}
		>
			{props.placeholder}
		</div>
	);

	const UI = () => {
		switch (props.mode) {
			case MODE.MULTI:
				if (props.search) {
					return (
						<>
							{props.renderSelectedValues(
								value,
								props,
								removeSelectedOption
							)}
							<input
								type="text"
								value={query}
								onChange={(e) => {
									e.stopPropagation();
									setQuery(e.target.value);
								}}
								placeholder={props.placeholder}
								className={`z-select-search flex-fill ${
									props.inputClassName || ""
								}`}
								disabled={props.disabled}
							/>
						</>
					);
				} else if (!props.search && value) {
					return (
						<>
							{props.renderSelectedValues(
								value,
								props,
								removeSelectedOption
							)}
							{placeholder}
						</>
					);
				} else {
					return <>{placeholder}</>;
				}
			case MODE.SINGLE:
			default:
				if (props.search) {
					return (
						<>
							<input
								type="text"
								value={query}
								onChange={(e) => {
									e.stopPropagation();
									setQuery(e.target.value);
								}}
								placeholder={props.placeholder}
								className={`z-select-search flex-fill ${
									props.inputClassName || ""
								}`}
								disabled={props.disabled}
							/>
						</>
					);
				} else {
					return value ? (
						<div className="z-select-selected-option z-selected-single d-flex m-2">
							{props.selectedOptionRender(value, props)}
						</div>
					) : (
						placeholder
					);
				}
		}
	};

	const loader = (
		<div className="z-select-options-loading">
			<div className="d-inline-block">
				<ProgressBarLoader height={25} width={25} />
			</div>
		</div>
	);

	return (
		<div
			className={`z-select ${props.className || ""} ${
				showOptions ? "active" : ""
			} ${props.search ? "z-search" : ""}`}
			ref={ref}
			key={props.key || "key"}
		>
			{/* UI TO RENDER THE SELECTOR FIELD */}
			<div
				className="z-select-selector flex-fill d-flex align-items-center flex-wrap"
				style={props.selectorClassStyle}
				onClick={(e) => {
					e.stopPropagation();
					!props.disabled && setShowOptions(true);
				}}
			>
				{props.isLoading ? loader : UI()}
			</div>

			{!props.disabled && (
				<span
					onClick={(e) => {
						e.stopPropagation();
						setShowOptions(true);
					}}
				>
					<img
						src={
							showOptions && props.search ? search : arrowdropdown
						}
					/>
				</span>
			)}

			{/* UI TO RENDER OPTIONS CONTAINER  */}
			{showOptions && (
				<div
					className={`z-select-optioner ${
						props.optionsContainerClassName || ""
					}`}
				>
					{!optionContainer?.length > 0 && (
						<div className="z-select-options-loading">
							<div className="d-flex justify-content-between align-items-center">
								{props.isOptionsLoading && (
									<div className="d-flex align-items-center">
										<span className="font-14 grey-1 ml-2 mr-2">
											{query
												? `Searching for ${query}`
												: ""}
										</span>
										<span>
											<ProgressBarLoader
												height={25}
												width={25}
											/>
										</span>
									</div>
								)}
								{props.onRefresh && (
									<div className="ml-auto">
										<span
											onClick={(e) => {
												e.stopPropagation();
												props.onRefresh(query);
											}}
											className="primary-color font-10 z-select-refresh"
										>
											<img
												src={refresh}
												width="10"
												className="mr-1"
											/>{" "}
											Refresh
										</span>
									</div>
								)}
							</div>
						</div>
					)}

					{optionContainer?.length > 0 && optionContainer}
					{!optionContainer?.length > 0 && !props.isOptionsLoading && (
						<div className="z-select-empty">
							<div className="position-center text-center">
								<img src={noData} />
								<p className="font-13 bold-400 grey-1 mt-2 mb-0">
									No data found
								</p>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

Select.propTypes = {
	placeholder: PropTypes.string,
	options: PropTypes.array,
	optionRender: PropTypes.func,
	fieldNames: PropTypes.object,
	mode: PropTypes.string, // "single | multi"
	search: PropTypes.bool,
	filter: PropTypes.bool,
	isOptionsLoading: PropTypes.bool,
	isLoading: PropTypes.bool,
};

Select.defaultProps = {
	placeholder: "Select",
	clearInput: false,
	fieldNames: {
		label: "name",
		value: "value",
		description: "description",
		logo: "logo",
	},
	optionRender: (option, props) => {
		return (
			<div className="text-capitalize">
				<div className="d-flex object-contain img-circle">
					{option[props.fieldNames.logo] && (
						<img
							className="mr-2"
							width={26}
							height={26}
							src={option[props.fieldNames.logo]}
						/>
					)}
					<div>
						<p
							className={`font-14 grey mb-1 ${
								props.optionsFieldClassName || ""
							}`}
						>
							{option[props.fieldNames.label]}
						</p>
						{option[props.fieldNames.description] && (
							<p className="font-9 grey-1 mb-0">
								{option[props.fieldNames.description]}
							</p>
						)}
					</div>
				</div>
			</div>
		);
	},
	mode: MODE.SINGLE,
	search: false,
	filter: false,
	filterMethod: (input, option) => {
		return option.toLowerCase().indexOf(input.toLowerCase()) >= 0;
	},
	isOptionsLoading: false,
	isLoading: false,
	selectedOptionRender: (option, props) => {
		return (
			<div className="font-14 text-capitalize flex-fill ">
				{option?.[props.fieldNames.label]}
			</div>
		);
	},
	groupByOptions: (options, groupBy) => {
		const group = {};
		options.forEach((option) => {
			let category = option[groupBy] || "Others";
			if (group.hasOwnProperty(category)) {
				group[category].push(option);
			} else {
				group[category] = [option];
			}
		});
		return group;
	},
	groupByUIRender: (text) => {
		return (
			<div className="p-2" style={{ background: "#fbfbfb" }}>
				<p className="grey-1 font-10 text-capitalize m-0">{text}</p>
			</div>
		);
	},
	renderSelectedValues: (value, props, removeSelectedOption) =>
		Array.isArray(value) &&
		value.map((val, index) => {
			return (
				<div
					className="z-select-selected-option d-flex align-items-center m-2"
					key={index}
				>
					{props.selectedOptionRender(val, props)}
					<span
						className="ml-2 remove-selected-option"
						onClick={(e) => {
							e.stopPropagation();
							removeSelectedOption(val);
						}}
					>
						<img width={8} src={close} />
					</span>
				</div>
			);
		}),
};
