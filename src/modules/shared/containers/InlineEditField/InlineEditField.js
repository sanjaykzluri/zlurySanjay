import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import { OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import {
	CUSTOM_FIELD_REFERENCE_KEYS,
	FIELD_TYPE,
} from "../../../custom-fields/constants/constant";
import { DatePicker } from "../../../../UIComponents/DatePicker/DatePicker";
import { useOutsideClickListener } from "../../../../utils/clickListenerHook";
import completed from "../../../../assets/icons/completeicon.svg";
import acceptbutton from "../../../../assets/icons/acceptbutton.svg";
import cancel from "../../../../assets/icons/cancel.svg";
import add from "../../../../assets/icons/plus-blue.svg";
import "./InlineEditField.css";
import { format } from "../../../../utils/DateUtility";
import { useDispatch, useSelector } from "react-redux";
import { debounce, withHttp } from "utils/common";
import {
	checkSpecialCharacters,
	searchAllApps,
	searchUsers,
} from "services/api/search";
import { client } from "utils/client";
import { Loader } from "common/Loader/Loader";
import { NameBadge } from "common/NameBadge";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";
const STATUS = {
	DEFAULT: "DEFAULT",
	LOADING: "LOADING",
	UPDATED: "UPDATED",
};

export const inlineUpdateType = {
	PUT: "put",
	PATCH: "patch",
};

export function InlineEditField(props) {
	const [loading, setloading] = useState(true);
	const [selectedId, setSelectedId] = useState(props.selectedId);

	const handleSelect = (option) => {
		setValue(option.app_name || option.user_name);
		setSelectedId(option.app_id || option.user_id);
	};

	const [showSuggestions, setShowSuggestions] = useState(false);
	const cancelToken = useRef();
	const [suggestions, setSuggestions] = useState([]);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const isDatePicker = FIELD_TYPE.DATE_PICKER.VALUE === props.type;
	const [isEditing, setIsEditing] = useState(false);
	const [status, setStatus] = useState(STATUS.DEFAULT);
	const ref = useRef(null);
	const defaultValue =
		props.patch && props.patch.value
			? isDatePicker
				? props.patch.value
					? new Date(props.patch.value)
					: null
				: props.reference && (isEditing || props.isColumnField)
				? props.referenceDisplayValue
				: props.patch.value
			: isDatePicker
			? props.putValue
				? new Date(props.putValue)
				: null
			: props.putValue;
	const [value, setValue] = useState(defaultValue);

	const onValueChange = (v) => {
		setValue(v);
	};

	useEffect(() => {
		setValue(defaultValue);
	}, [
		props.updateType === inlineUpdateType.PUT
			? props.putValue
			: props.patch.value,
	]);

	const generateSuggestions = useCallback(
		debounce((query, cancelToken, fetchFunction) => {
			fetchFunction(query, cancelToken, true).then((res) => {
				setSuggestions(res.results);
				setloading(false);
			});
		}, 200),
		[]
	);

	const handleCustomFieldEdit = (value, referenceType) => {
		if (props.type === "reference" && props.reference) {
			setSelectedId();
		}
		setValue(value);

		if (cancelToken.current) cancelToken.current.cancel();
		if (value.length === 0) {
			setShowSuggestions(false);
			setSuggestions([]);
		}

		if (value.length > 1) {
			if (checkSpecialCharacters(value, true)) {
				setSuggestions([]);
				setShowSuggestions(true);
				setloading(false);
			} else {
				setShowSuggestions(true);
				setloading(true);
				cancelToken.current = client.CancelToken.source();
				generateSuggestions(
					value,
					cancelToken.current,
					referenceType === CUSTOM_FIELD_REFERENCE_KEYS.APPLICATIONS
						? searchAllApps
						: searchUsers
				);
			}
		}
	};

	const updateValue = () => {
		setStatus(STATUS.LOADING);
		props.updateType === inlineUpdateType.PUT
			? props
					.updatePutData({
						...props.putObject,
						[props.putChangeKey]: value,
					})
					.then((res) => {
						props.onUpdateValue && props.onUpdateValue(value);
						setStatus(STATUS.UPDATED);
						props.refreshPage && props.refreshPage();
						setTimeout(() => {
							reset();
						}, 1000);
					})
			: props
					.updateService(
						{
							patches: [
								Object.assign(props.patch, {
									value: selectedId || value,
								}),
							],
						},
						props.id ? props.id : ""
					)
					.then((res) => {
						props.onUpdateValue && props.onUpdateValue(value);
						setStatus(STATUS.UPDATED);
						props.refreshPage && props.refreshPage();
						setTimeout(() => {
							reset();
						}, 1000);
					});
	};

	useOutsideClickListener(
		ref,
		() => {
			setValue(defaultValue);
			reset();
		},
		[
			props.updateType === inlineUpdateType.PUT
				? props.putValue
				: props.patch.value,
		]
	);

	const reset = () => {
		setIsEditing(false);
		setStatus(STATUS.DEFAULT);
	};
	const handleEditButton = () => {
		setIsEditing(true);
		//Segment Implementation
		window.analytics.track(`clicked on update/edit ${props.title} button`, {
			currentCategory: `${props.segmentCategory}s`,
			currentPageName: `${props.segmentCategory}-Overview`,
			app_name: props.application?.app_name,
			app_id: props.application?.app_id,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};

	function SuggestionBar(props) {
		return (
			<>
				<div className="quick-edit-menu shadow d-block">
					{props.loading ? (
						<>
							<div className="quick-edit-menu-item">
								<Loader height={60} width={60}></Loader>
							</div>
						</>
					) : (
						<>
							{props.options.length > 0 ? (
								props.options.map((option) => (
									<>
										<div
											className="quick-edit-menu-item border-bottom"
											onClick={() => {
												props.handleSelect(option);
												props.onHide();
											}}
										>
											{option[props.dataKeys?.image] ? (
												<img
													src={unescape(
														option[
															props.dataKeys
																?.image
														]
													)}
													width="24"
													className="mr-2"
												/>
											) : (
												<NameBadge
													name={
														option[
															props.dataKeys
																?.value
														]
													}
													width={24}
													className="mr-2"
												/>
											)}
											<div className="col">
												<div className="row">
													<OverlayTrigger
														placement="top"
														overlay={
															<Tooltip>
																{
																	option[
																		props
																			.dataKeys
																			?.value
																	]
																}
															</Tooltip>
														}
													>
														<div
															className={
																"truncate_10vw"
															}
														>
															{
																option[
																	props
																		.dataKeys
																		?.value
																]
															}
														</div>
													</OverlayTrigger>
												</div>
												{option[
													props.dataKeys?.email
												] && (
													<OverlayTrigger
														placement="top"
														overlay={
															<Tooltip>
																{
																	option[
																		props
																			.dataKeys
																			?.email
																	]
																}
															</Tooltip>
														}
													>
														<div className="row user_email_suggestion">
															{option[
																props.dataKeys
																	?.email
															]?.slice(0, 20) +
																"..."}
														</div>
													</OverlayTrigger>
												)}
											</div>
										</div>
									</>
								))
							) : (
								<div
									className="quick-edit-menu-item justify-content-center text-secondary"
									style={{ fontSize: 12 }}
								>
									<i>No results found</i>
								</div>
							)}
						</>
					)}
				</div>
			</>
		);
	}

	return (
		<div
			className={`z__inline_field ${props.className}`}
			style={props.style}
			ref={ref}
		>
			{props.title && !props.hideTitle && (
				<div className="z__if__header">
					<h3 className="font-11 grey bold-400 text-capitalize">
						{props.title}
					</h3>
				</div>
			)}
			<div className="z__if__body">
				{!isEditing && (
					<div className="z__if__before">
						{value && (
							<Button
								type="edit"
								onClick={handleEditButton}
								className="pb-1 text-left"
							>
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{isDatePicker
												? format(new Date(value))
												: value}
										</Tooltip>
									}
								>
									<div
										className={`${props.inlineValueClassName}`}
									>
										{isDatePicker ? (
											format(new Date(value))
										) : props.isLink ? (
											<div
												className="glow_blue"
												onClick={(e) => {
													e.stopPropagation();
													window.open(
														`${withHttp(value)}`,
														"_blank"
													);
												}}
											>
												{value}
											</div>
										) : (
											value
										)}
									</div>
								</OverlayTrigger>
							</Button>
						)}
						{!value && (
							<Button
								type="link"
								onClick={handleEditButton}
								className="p-0 pb-1 text-left"
							>
								{" "}
								<img
									width="11"
									src={add}
									className="mr-1"
								/>{" "}
								Add {props.title}{" "}
							</Button>
						)}
					</div>
				)}
				{isEditing && (
					<div
						className="z__if__edit d-flex  align-items-center"
						style={props.editStyle ? props.editStyle : {}}
					>
						{[
							FIELD_TYPE.DROPDOWN.VALUE,
							FIELD_TYPE.BOOLEAN.VALUE,
						].includes(props.type) && (
							<SelectOld
								value={value}
								className="m-0"
								options={props.options}
								placeholder={props.placeholder}
								onSelect={(v) => {
									onValueChange(v.value);
								}}
							/>
						)}
						{FIELD_TYPE.TEXT.VALUE === props.type && (
							<input
								value={value}
								placeholder={props.placeholder}
								type="text"
								className={`w-100 pl-2 pr-1 ${
									props.inlineInputClassName
										? props.inlineInputClassName
										: ""
								}`}
								onChange={(e) => {
									onValueChange(e.target.value);
								}}
							/>
						)}
						{props.type === "reference" && (
							<input
								value={value}
								placeholder={props.placeholder}
								type="text"
								className={`w-100 pl-2 pr-1 ${
									props.inlineInputClassName
										? props.inlineInputClassName
										: ""
								}`}
								onChange={(e) => {
									handleCustomFieldEdit(
										e.target.value,
										props.reference
									);
								}}
							/>
						)}
						{isDatePicker && (
							<NewDatePicker
								key={`${value}`}
								value={value}
								onChange={(v) => {
									onValueChange(v);
								}}
								placeholder={props.placeholder}
							/>
						)}
						{showSuggestions && (
							<SuggestionBar
								options={suggestions}
								loading={loading}
								onHide={() => setShowSuggestions(false)}
								handleSelect={handleSelect}
								dataKeys={props.keyFields}
							/>
						)}
						<div
							className={`z__if__edit_actions  d-flex ${
								props.isTable &&
								"flex-row align-items-center h-100"
							}`}
							style={{
								top: status === STATUS.LOADING ? "-1px" : "0",
							}}
						>
							{status === STATUS.DEFAULT && (
								<>
									<Button
										className="p-0 pl-1 pr-1"
										onClick={() => {
											setIsEditing(false);
											setValue(defaultValue);
										}}
									>
										<img width={8} src={cancel} />
									</Button>
									<Button
										className="p-0 pl-1 pr-1"
										onClick={() => {
											updateValue();
										}}
										disabled={props.isMandatory && !value}
									>
										<img width={14} src={acceptbutton} />
									</Button>
								</>
							)}
							{status === STATUS.LOADING && (
								<Spinner
									animation="border"
									variant="light"
									bsPrefix="my-custom-spinner"
									className="my-custom-spinner mr-2"
								/>
							)}
							{status === STATUS.UPDATED && (
								<img
									src={completed}
									className="mt-1 mr-2"
									width="16"
								/>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
