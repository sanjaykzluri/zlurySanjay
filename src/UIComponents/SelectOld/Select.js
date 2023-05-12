import React, { useEffect, useRef, useState } from "react";
import "./Select.css";
import search from "../../assets/search.svg";
import arrowdropdown from "../../assets/arrowdropdown.svg";
import viewGridIcon from "../../assets/icons/grid.svg";
import refresh from "../../assets/new-refresh-icon.svg";
import defaultViewIcon from "../../assets/default_view_icon.svg";
import deleteIcon from "../../assets/icons/delete_view.svg";
import { useOutsideClickListener } from "../../utils/clickListenerHook";
import { useSelector } from "react-redux";
import { Dropdown, Spinner } from "react-bootstrap";
import { Button } from "../Button/Button";
import { viewIconsMap } from "../../common/tableView";
import SaveCustomView from "../../common/saveCustomView";
import { CUSTOM_VIEW_NAME } from "../../constants/views";
import "../../components/Applications/AllApps/NewDropdowns.css";

const bulk_edit_menu = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer autho__dd__cont mt-auto mb-auto text-decoration-none"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			onClick(e);
		}}
		style={{ width: "100px", border: "none", height: "auto" }}
	>
		{children}
	</a>
));

export function SelectOld(props) {
	let {
		showIcons,
		isView,
		options: dropdownList,
		isPrimarySource,
		setOptionChanged,
		saving = false,
		setShowCustomViewModal,
		handleDefaultViewAction,
		handleDeleteView,
		isLoading,
		setCustomViewSaved,
		selectedItem,
		selectedItemName,
		handleSetAll,
		isMultiSelect,
		itemId,
	} = props;

	const [value, setValue] = useState(props.value ? props.value : null);
	const [query, setQuery] = useState("");
	const [loadingOptions, setLoadingOptions] = useState(
		props.loadingOptions || false
	);

	const [primarySourceIcon, setPrimarySourceIcon] = useState(
		Array.isArray(props?.value) && props?.value[0]?._id?.logo_url
	);
	const router = useSelector((state) => state.router);
	const { query: queryParam } = router.location;
	const [groupByOptions, setGroupByOptions] = useState({});

	useEffect(() => {
		setQuery(selectedItemName);
		setValue();
	}, [selectedItemName]);

	useEffect(() => {
		if (!queryParam.metaData) {
			setQuery(props?.defaultValue?.name);
			setValue();
		}
	}, [queryParam]);

	useEffect(() => {
		if (props.groupBy && props.options.length) {
			setGroupByOptions(groupOptions(props.options, groupByOptions));
		}
	}, [props.options]);

	const groupOptions = (data) => {
		let obj = {};
		let items = isView ? data.reverse() : data;
		items.forEach((item) => {
			let category;
			if (isView) {
				category = item[props.groupBy]
					? CUSTOM_VIEW_NAME
					: "Standard Views";
			} else {
				category = item[props.groupBy] ? item[props.groupBy] : "Others";
			}
			if (obj.hasOwnProperty(category)) {
				obj[category].push(item);
			} else {
				obj[category] = [item];
			}
		});
		return obj;
	};

	useEffect(() => {
		setLoadingOptions(props.loadingOptions);
	}, [props.loadingOptions]);

	const [showOptions, setShowOptions] = useState(false);
	const ref = useRef(null);

	const onChange = (e) => {
		setQuery(e.target.value);
	};

	const logicToSetValue = (value) => {
		if (typeof value === "string") {
			return props.options.find((option) => option.value === value);
		}
		return value;
	};

	const defaultOptionContainer = (options) => {
		return (
			Array.isArray(options) &&
			options?.map((option, index) => {
				return (
					<div
						className={
							isView
								? `px-2 py-2 z__select--options__container--option`
								: props.optionClassName
								? `z__select--options__container--option ${props.optionClassName}`
								: "z__select--options__container--option"
						}
						key={index}
						index={index}
						onClick={() => !saving && onOptionSelect(index)}
					>
						{showIcons && (
							<span className="pr-2">
								<img src={option.logo} />
							</span>
						)}
						<span>{option[props.label]}</span>
						{option?.description && (
							<div
								style={{
									fontSize: "10px",
									color: "#717171",
									textTransform: "initial",
								}}
								className="mt-2"
							>
								{option?.description}
							</div>
						)}
					</div>
				);
			})
		);
	};

	const DefaultUI = ({ onClick, option }) => {
		return (
			<>
				<div
					style={{
						fontSize: "10px",
						color: "#5ABAFF",
						height: "8px",
					}}
					className="show-on-hover-content cursor-pointer"
					onClick={(e) => onClick && onClick(e, option)}
				>
					Set as Default
				</div>
				{option?.is_custom && !isLoading && (
					<div
						style={{
							fontSize: "6px",
							height: "8px",
						}}
						className="show-on-hover-content cursor-pointer ml-1"
						onClick={(e) => handleDeleteView(e, option)}
					>
						<img src={deleteIcon} />
					</div>
				)}
			</>
		);
	};

	const defaultOptionGroupContainer = (groupOptions) => {
		return Object.keys(groupOptions).map((group, index) => {
			const options = groupByOptions[group].map((option, index) => {
				return (
					<>
						<div
							className={
								isView
									? `px-3 py-2 z__select--options__container--option`
									: props.optionClassName
									? `z__select--options__container--option ${props.optionClassName}`
									: "z__select--options__container--option"
							}
							key={index}
							index={index}
							onClick={() =>
								!saving && onOptionSelect(option, true)
							}
						>
							<div className="d-flex justify-content-between">
								<div className="d-flex">
									{showIcons && (
										<div className="pr-2">
											<img
												src={
													viewIconsMap[
														option?.name
													] || defaultViewIcon
												}
											/>
										</div>
									)}
									<div style={{ wordBreak: "break-word" }}>
										{option[props.label]}
									</div>
								</div>
								<div className="d-flex">
									{isView && (
										<>
											{option.is_custom &&
											option.is_default &&
											selectedItem === option._id &&
											isLoading ? (
												<Spinner
													className="mr-2 ml-2 blue-spinner action-edit-spinner"
													animation="border"
												/>
											) : option.is_default ? (
												<>
													<div
														style={{
															fontSize: "10px",
															color: "#DDDDDD",
														}}
													>
														Default
													</div>
													{option?.is_custom &&
														!isLoading && (
															<div
																style={{
																	fontSize:
																		"6px",
																	height: "8px",
																}}
																className="show-on-hover-content cursor-pointer ml-1"
																onClick={(e) =>
																	handleDeleteView(
																		e,
																		option
																	)
																}
															>
																<img
																	src={
																		deleteIcon
																	}
																/>
															</div>
														)}
												</>
											) : isLoading &&
											  selectedItem === option._id ? (
												<Spinner
													className="mr-2 ml-2 blue-spinner action-edit-spinner"
													animation="border"
												/>
											) : (
												<>
													{isMultiSelect ? (
														<Dropdown className="pt-1">
															<Dropdown.Toggle
																as={
																	bulk_edit_menu
																}
																className="mb-1"
															>
																<DefaultUI
																	option={
																		option
																	}
																/>
															</Dropdown.Toggle>
															<Dropdown.Menu className="pb-0">
																<Dropdown.Item
																	className="dropdown__menu__item"
																	onClick={(
																		e
																	) =>
																		handleDefaultViewAction(
																			e,
																			option,
																			itemId
																		)
																	}
																>
																	For this app
																</Dropdown.Item>
																<Dropdown.Item
																	className="dropdown__menu__item"
																	onClick={(
																		e
																	) => {
																		handleSetAll(
																			e,
																			option
																		);
																	}}
																>
																	For All
																	Applications
																</Dropdown.Item>
															</Dropdown.Menu>
														</Dropdown>
													) : (
														<>
															<DefaultUI
																onClick={
																	handleDefaultViewAction
																}
																option={option}
															/>
														</>
													)}
												</>
											)}
										</>
									)}
								</div>
							</div>
							{option?.description && (
								<div
									style={{
										fontSize: "10px",
										color: "#717171",
										textTransform: "initial",
									}}
									className="mt-2"
								>
									{option?.description}
								</div>
							)}
						</div>
					</>
				);
			});
			return (
				<div className="z-select-group-container" key={index}>
					<div className="z-select-group-info p-1 grey-1 pl-3">
						<h3 className="text-uppercase bold-600 font-10 m-0">
							{group}
						</h3>
					</div>
					{options}
					{isView && (
						<SaveCustomView
							group={group}
							groupByOptions={groupByOptions}
							setShowCustomViewModal={setShowCustomViewModal}
							setCustomViewSaved={setCustomViewSaved}
						/>
					)}
				</div>
			);
		});
	};

	const primarySourcesOptions = (options) => {
		return options?.map((option, index) => {
			let primarySource = option.org_integration_id
				? {
						...option.org_integration_id,
						logo_url: option.integration_id.logo_url,
				  }
				: option.integration_id;
			if (!(primarySource && primarySource.name)) {
				return;
			}
			return (
				<>
					{primarySource && (
						<div
							className={
								isView
									? `px-2 py-2 z__select--options__container--option`
									: props.optionClassName
									? `z__select--options__container--option ${props.optionClassName}`
									: "z__select--options__container--option"
							}
							key={index}
							index={index}
							onClick={() => onOptionSelect(index)}
						>
							{primarySource.logo_url && (
								<span className="pr-2">
									<img
										width="24px"
										src={primarySource.logo_url}
									/>
								</span>
							)}
							<span>{primarySource.name}</span>
						</div>
					)}
				</>
			);
		});
	};

	const onOptionSelect = (index, isObj = false) => {
		if (isObj) {
			setValue(index);
		} else {
			setValue(props.options[index]);
		}
		setOptionChanged && setOptionChanged(true);
	};

	const onValueChange = () => {
		if (isPrimarySource && value) {
			setQuery(value?.integration_id?.name);
			setPrimarySourceIcon(value?.integration_id?.logo_url);
		} else if (value) {
			setQuery(value[props.label]);
		}
		setValue(logicToSetValue(value));
		setShowOptions(false);
		props.onSelect(value);
	};

	const showOptionsConatiner = () => {
		setShowOptions(!showOptions);
	};

	useEffect(() => {
		if (value) {
			onValueChange();
		}
	}, [value]);

	useOutsideClickListener(ref, () => setShowOptions(false));

	return (
		<div
			className={
				props.className ? `z__select ${props.className}` : `z__select`
			}
			style={{
				...props.style,
				paddingLeft: props.icon && props.isSearchable ? "34px" : "",
			}}
			ref={ref}
		>
			{loadingOptions && (
				<Spinner className="select-spinner" animation="border" />
			)}

			{props.isSearchable && (
				<>
					{props.icon && (
						<img
							className="z__select--icon"
							src={search}
							aria-hidden="true"
						/>
					)}
					<input
						type="text"
						name="z__select"
						value={query}
						onChange={(e) => {
							onChange(e);
						}}
						placeholder={props.placeholder}
						onClick={!saving && showOptionsConatiner}
					/>
				</>
			)}

			{!props.isSearchable && (
				<div
					className={
						props.dropdownOnClick
							? "z__select--input dropdown-click"
							: "z__select--input"
					}
					style={{ ...props.inputTextStyle }}
					onClick={() => {
						if (!saving && !loadingOptions) {
							showOptionsConatiner();
						}
					}}
				>
					{query ? (
						<span
							className={
								props.inputPlaceholderClassName
									? `${props.inputPlaceholderClassName}`
									: ``
							}
							style={{ ...props.inputTextSpanStyle }}
						>
							{showIcons && (
								<img
									style={{
										filter:
											!isPrimarySource &&
											"brightness(0.1)",
									}}
									className="pr-2"
									src={
										isPrimarySource
											? primarySourceIcon
											: viewGridIcon
									}
									width="24"
								/>
							)}
							{query}
						</span>
					) : (
						<span
							className={
								props.inputPlaceholderClassName
									? `${props.inputPlaceholderClassName}`
									: ``
							}
						>
							{showIcons && (
								<img
									style={{
										filter:
											!isPrimarySource &&
											"brightness(0.1)",
									}}
									className="pr-2"
									src={
										props.placeholderImg
											? props.placeholderImg
											: isPrimarySource &&
											  Array.isArray(props.value)
											? props?.value[0]?.integration_id
													?.logo_url ||
											  primarySourceIcon
											: viewGridIcon
									}
									width="24"
								/>
							)}
							{isPrimarySource && Array.isArray(props.value)
								? props?.value[0]?.integration_id?.name ||
								  props.placeholder
								: null}

							{props.value
								? props.value[props.label]
								: props.placeholder}
						</span>
					)}
					<img
						className="z__select--input__icon bg-white"
						src={arrowdropdown}
						aria-hidden="true"
					/>
				</div>
			)}

			{showOptions && (
				<div
					className={
						props.optionListClass
							? `z__select--options__container ${props.optionListClass}`
							: "z__select--options__container"
					}
				>
					{props.actions && (
						<div className="z__select--options__container__actions">
							<div className="d-flex flex-row-reverse">
								<Button
									className="font-10"
									type="link"
									onClick={() => {
										props.refresh();
										setShowOptions(false);
									}}
								>
									<img src={refresh} width={9} className="" />{" "}
									Refresh
								</Button>
							</div>
						</div>
					)}
					{isPrimarySource
						? primarySourcesOptions(props.options)
						: props.groupBy
						? defaultOptionGroupContainer(groupByOptions)
						: defaultOptionContainer(props.options)}
					{props.loadingMoreOptions && (
						<div className="text-center mt-1 mb-1">
							<Spinner
								className="mr-2 blue-spinner action-edit-spinner"
								animation="border"
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

SelectOld.defaultProps = {
	placeholder: "Select",
	isSearchable: false,
	label: "label",
	style: {},
	dropdownOnClick: false,
	actions: false,
};
