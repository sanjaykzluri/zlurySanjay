import React, { useState, useCallback, useRef, useEffect } from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { SuggestionMenu } from "../SuggestionMenu/SuggestionMenu";
import { NameBadge } from "../NameBadge";
import { debounce, unescape } from "../../utils/common";
import { client } from "../../utils/client";
import { checkSpecialCharacters } from "../../services/api/search";
import { useOutsideClickListener } from "../../utils/clickListenerHook";

export function AsyncTypeahead(props) {
	const typeaheadRef = useRef();
	const [value, setValue] = useState("");
	const [text, setText] = useState(props.text || null);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [loading, setLoading] = useState(true);
	const [suggestions, setSuggestions] = useState([]);
	const [showDefaultList, setShowDefaultList] = useState(false);
	const cancelToken = useRef();

	useEffect(() => {
		if (props.defaultValue) {
			setValue(props.defaultValue);
		}
	}, [props.defaultValue]);

	useEffect(() => {
		if (!value && props.defaultList?.length > 0) {
			setSuggestions(props.defaultList);
			setLoading(false);
		} else {
			setLoading(true);
			setSuggestions(null);
		}
	}, [props.defaultList?.length]);

	useEffect(() => {
		if (text !== null) {
			props.onTextChange && props.onTextChange(text);
			handleInputChange(text);
		}
	}, [text]);

	const handleInputChange = (value) => {
		if (props.defaultList) {
			setShowDefaultList(false);
		}
		value = value?.trimStart();
		setValue(value);
		if (props.setapp_name) {
			props.setapp_name(value);
		}
		if (props.onChange) {
			props.onChange(value);
		}
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (value.length == 0) {
			if (props.isReport) {
				setShowSuggestions(false);
				setLoading(false);
			} else if (props.defaultList) {
				setLoading(false);
				setSuggestions(props.defaultList);
				setShowDefaultList(true);
				setShowSuggestions(true);
				props.onSelect &&
					Object.keys(props.keyFields).length &&
					props.onSelect({
						[props.keyFields.id]: null,
						[props.keyFields.value]: null,
						[props.keyFields.image]: null,
					});
				return;
			} else {
				setShowSuggestions(false);
				setLoading(false);
				props.onSelect &&
					Object.keys(props.keyFields).length &&
					props.onSelect({
						[props.keyFields.id]: null,
						[props.keyFields.value]: null,
						[props.keyFields.image]: null,
					});
				return;
			}
		}

		if (value.length >= 1) {
			if (
				checkSpecialCharacters(value, props?.allowFewSpecialCharacters)
			) {
				setShowSuggestions(true);
				setLoading(false);
				setSuggestions([]);
			} else {
				setLoading(true);
				setShowSuggestions(true);
				cancelToken.current = client.CancelToken.source();
				generateSuggestions(value, cancelToken.current);
			}
		}
	};

	const generateSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			props
				.fetchFn(
					query,
					reqCancelToken,
					true,
					props.keyFields.appAuthStatus ? true : false
				)
				.then((res) => {
					if (res.results) {
						setSuggestions(res.results);
					}
					if (res.data) {
						setSuggestions(res.data);
					}
					if (res.admins) {
						setSuggestions(res.admins);
					}
					if (res.licenses) {
						setSuggestions(
							res.licenses.map((el) => {
								return {
									title: el,
									value: el,
								};
							})
						);
					}
					if (res && props.requestingLicensesWithPrice) {
						setSuggestions(
							res.map((el) => {
								return {
									value: el.tier_name,
									title: el.tier_name,
									id: el._id,
									tier_pricing_value: el.tier_pricing_value,
									period: el.period,
									tier_is_per_month: el.tier_is_per_month,
									tier_is_billed_annual:
										el.tier_is_billed_annual,
								};
							})
						);
					}
					setLoading(false);
				})
				.catch((err) => {
					console.log(err);
				});
		}, 300),
		[]
	);

	const handleSelect = (selection) => {
		setShowSuggestions(false);
		if (props.defaultList && showDefaultList) {
			let data = {};
			selection.isSuggestion = true;
			for (var k in selection.assignee) {
				if (selection.assignee[k][0]) {
					data = selection.assignee[k][0];
				}
			}
			if (
				selection.assignee &&
				Object.keys(selection.assignee).length > 1
			) {
				let arr = [];
				Object.keys(selection.assignee).map((k, index) => {
					arr.push(selection.assignee[k][0]);
				});
				let count = 1;
				arr.map((v) => v.user_id)
					.sort()
					.sort((a, b) => {
						if (a !== b) {
							count++;
						}
					});
				if (count > 1) {
					data.count = count;
					selection.count = count;
				}
			}
			data.title = selection.title;
			setValue(data);
		} else {
			setValue(selection);
		}

		props.onSelect && props.onSelect(selection);
	};

	const handleOnFocus = () => {
		if (!value && props.defaultList?.length > 0) {
			setSuggestions(props.defaultList);
			setLoading(false);
			setShowDefaultList(true);
			setShowSuggestions(true);
		}
	};

	useOutsideClickListener(typeaheadRef, () => {
		setShowSuggestions(false);
	});

	const getText = (option) =>
		props?.keyFields?.count === "" || !option[props.keyFields.count]
			? option?.toString()
			: option[props.keyFields.count]?.toString();

	return (
		<>
			<Form.Group style={props.style} className={props.className}>
				{props.label && (
					<Form.Label bsPrefix={props.labelClassName}>
						{props.label}
					</Form.Label>
				)}
				<div
					className={`d-flex bg-white rounded ${
						props.appLogo ? "border" : null
					}`}
					ref={typeaheadRef}
					onClick={() =>
						value &&
						value.length > 0 &&
						!props.disabled &&
						setShowSuggestions(true)
					}
				>
					{props.appLogo ? (
						<img
							src={unescape(props.appLogo)}
							height="25"
							width="25"
							className="mt-auto mb-auto ml-2 mr-2"
						/>
					) : (
						value &&
						value[props.keyFields.image] && (
							<img
								src={unescape(value[props.keyFields.image])}
								height="25"
								width="25"
								className="mt-auto mb-auto ml-2 mr-2"
							/>
						)
					)}
					<Form.Group
						style={{ flexDirection: "row", width: "100%" }}
						className="d-flex mb-0"
					>
						{value && value[props.keyFields.count] && (
							<NameBadge
								name={getText(value)}
								width={28}
								borderRadius={14}
								className="mr-1 mt-1 ml-2 position-absolute recharts-tooltip-wrapper"
							/>
						)}
						<Form.Control
							style={{
								width: "100%",
								paddingLeft:
									value && value[props.keyFields.count]
										? "40px"
										: "8px",
							}}
							type="text"
							className={`${props.typeaheadInputClass} ${
								props.appLogo ? "border-0" : null
							}`}
							placeholder={props.placeholder}
							value={
								(value &&
									value[props.keyFields.title] &&
									value[props.keyFields.title]) ||
								(value &&
									value[props.keyFields.value] &&
									value[props.keyFields.value]) ||
								value
							}
							onFocus={() => handleOnFocus()}
							disabled={props.disabled}
							required={props.requiredValidation}
							isInvalid={props.isInvalid}
							onChange={(e) => setText(e.target.value)}
							bsPrefix={props.typeaheadInputBsPrefix}
						/>
					</Form.Group>
				</div>
				<Form.Control.Feedback
					className={props.invalidMsgClassName || ""}
					type="invalid"
				>
					{props.invalidMessage || "Invalid Value"}
				</Form.Control.Feedback>
				<div className="position-relative w-100" ref={typeaheadRef}>
					<SuggestionMenu
						show={showSuggestions}
						loading={loading}
						options={suggestions}
						onSelect={handleSelect}
						dataKeys={{
							image: props.keyFields.image,
							text: showDefaultList
								? "title"
								: props.keyFields.value,
							email: showDefaultList
								? "description"
								: props.keyFields.email,
							additional_information:
								props.keyFields.additional_information,
							appAuthStatus: props.keyFields.appAuthStatus,
							onboardingActionCount:
								props.keyFields.onboardingActionCount,
							offboardingActionCount:
								props.keyFields.offboardingActionCount,
							appIntegrationId: props.keyFields.appIntegrationId,
							appOrgIntegrationId:
								props.keyFields.appOrgIntegrationId,
							appOrgIntegrationStatus:
								props.keyFields.appOrgIntegrationStatus,
							app_in_org: props.keyFields.app_in_org,
						}}
						isAddAdmin={props.isAddAdmin}
						hideNoResultsText={props.hideNoResultsText}
						showAdditionalRightInformation={
							props.showAdditionalRightInformation
						}
						additionalInformationFormatter={
							props.additionalInformationFormatter
						}
					>
						{(props.isWorkFlowModal || props.showAddNewText) && (
							<button
								className="ml-3 SuggestionBar__button"
								onClick={() => {
									if (props.addNewTextClick) {
										props.addNewTextClick();
									} else {
										props.setShowAddAppModal(true);
										setShowSuggestions(false);
									}
								}}
							>
								{props.addNewText || "+ Add New Application"}
							</button>
						)}
					</SuggestionMenu>
				</div>
			</Form.Group>
		</>
	);
}

AsyncTypeahead.propTypes = {
	style: PropTypes.object,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	fetchFn: PropTypes.func.isRequired,
	defaultValue: PropTypes.string,
	disabled: PropTypes.bool,
	isInvalid: PropTypes.bool,
	invalidMessage: PropTypes.string,
	onSelect: PropTypes.func.isRequired,
	keyFields: PropTypes.shape({
		id: PropTypes.string,
		image: PropTypes.string,
		value: PropTypes.string,
	}),
};
