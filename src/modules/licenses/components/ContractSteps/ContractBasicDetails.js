import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
	setReqData,
	updateStepperData,
} from "../../../../common/Stepper/redux";
import { AsyncTypeahead } from "../../../../common/Typeahead/AsyncTypeahead";
import SuggestionChips from "../../../../common/SuggestionChips/SuggestionChips";
import {
	searchAllApps,
	searchContractsV2,
	searchUsers,
	searchVendors,
} from "../../../../services/api/search";
import { Button } from "../../../../UIComponents/Button/Button";
import {
	arrayOfFirstGivenNumbers,
	capitalizeFirstLetter,
	isFormValid,
} from "../../../../utils/common";
import {
	booleanFieldArray,
	contractAgreementTypes,
	contractPaymentDateSuggestions,
	screenEntity,
} from "../../constants/LicenseConstants";
import _ from "underscore";
import { CUSTOM_FIELD_ENTITY } from "../../../custom-fields/constants/constant";
import { CustomFieldSectionInForm } from "../../../shared/components/CustomFieldSectionInForm/CustomFieldSectionInForm";
import { ENTITIES } from "../../../../constants";
import { getSearchReqObj } from "../../../../common/infiniteTableUtil";
import {
	addSubtractMonth,
	dateResetTimeZone,
	getNthDayBeforeDate,
} from "../../../../utils/DateUtility";
import {
	fetchOwnerSuggestions,
	fetchVendorSuggestions,
	getContractOverviewDetails,
} from "../../../../services/api/licenses";
import { TriggerIssue } from "../../../../utils/sentry";
import AddAppModal from "./AddAppModal";
import { AddVendor } from "../../../../components/Applications/Vendors/AddVendor";
import { allowScroll, preventScroll } from "../../../../actions/ui-action";
import SelectPaymentMethod from "./ContractStepsComponents/SelectPaymentMethod";
import ContractCostAmortization from "./ContractStepsComponents/ContractCostAmortization";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";
import ContractLicenseGroupPrecedence from "./ContractStepsComponents/ContractLicenseGroupPrecedence";
import {
	addToDate,
	getEndDateBySuggestion,
} from "modules/licenses/utils/LicensesUtils";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";

export default function ContractBasicDetails({ updateStep, entity }) {
	const dispatch = useDispatch();
	const { data } = useSelector((state) => state.stepper);
	const [showFinanceOwnerField, setShowFinanceOwnerField] = useState(
		!!data?.financial_owner_id
	);
	const [showITOwnerField, setShowITOwnerField] = useState(
		!!data?.it_owner_id
	);
	const [showAllFields, setShowAllFields] = useState(false);
	const [isValidated, setIsValidated] = useState(false);
	const [customFields, setCustomFields] = useState(data?.custom_fields || []);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [addAppShow, setShowAddApp] = useState(false);
	const [ownersuggestions, setOwnersuggestions] = useState([]);
	const [vendorsuggestions, setVendorsuggestions] = useState([]);
	const [appName, setAppName] = useState(data?.app_name || "");
	const [showAddVendor, setShowAddVendor] = useState(false);

	const [requiredFields, setRequireFields] = useState([
		"start_date",
		"end_date",
		data?.payment_term === "recurring"
			? "payment_repeat_on"
			: "payment_date",
	]);

	const updateData = (data) => {
		dispatch(updateStepperData(data));
	};

	useEffect(() => {
		if (data.app_id) {
			fetchOwnerSuggestions(data.app_id).then((res) => {
				const suggestions =
					Array.isArray(res) && res.map((i) => i.created_by);
				setOwnersuggestions(suggestions);
			});
			fetchVendorSuggestions(data.app_id).then((res) => {
				if (Array.isArray(res)) {
					setVendorsuggestions(res);
				}
			});
		}
	}, [data?.app_id]);

	useEffect(() => {
		if (entity === ENTITIES.SUBSCRIPTION) {
			setRequireFields(["start_date", "next_renewal_date"]);
		} else if (entity === ENTITIES.PERPETUAL) {
			setRequireFields(["start_date", "payment_date"]);
		} else {
			const updatedRequiredFields = requiredFields.filter(
				(i) => i !== "next_renewal_date"
			);
			setRequireFields(updatedRequiredFields);
		}
	}, [entity]);

	useEffect(() => {
		if (data.app_id || !data.is_app || data.contract_id) {
			setShowAllFields(true);
		} else {
			setShowAllFields(false);
		}
	}, [data.app_id, data.is_app, data.contract_id]);

	useEffect(() => {
		if (!!data?.financial_owner_id) {
			setShowFinanceOwnerField(true);
		}
	}, [data?.financial_owner_id]);

	useEffect(() => {
		if (!!data?.it_owner_id) {
			setShowFinanceOwnerField(true);
		}
	}, [data?.it_owner_id]);

	useEffect(() => {
		if (entity === screenEntity.SUBSCRIPTION && data?.start_date) {
			updateData({
				next_renewal_date: addToDate(
					data?.start_date,
					data?.renewal_repeat_frequency,
					data?.renewal_repeat_interval
				),
			});
		}
	}, [
		data?.renewal_repeat_frequency,
		data?.renewal_repeat_interval,
		data?.start_date,
	]);

	const isInvalid = (field) =>
		isValidated && requiredFields.find((i) => i === field) && !data[field];

	const onValueChangeFromCustomFields = (id, val) => {
		if (typeof val === "string") {
			val = val?.trimStart();
		}
		let custom_fields = [...customFields];
		const index = custom_fields?.findIndex((cf) => cf.field_id === id);
		custom_fields.splice(index, index > -1 ? 1 : 0, {
			field_id: id,
			field_value: val,
		});
		setCustomFields(custom_fields);
	};

	const requestContractData = (contract_id, contract_name) => {
		setLoading(true);
		try {
			getContractOverviewDetails(contract_id).then((res) => {
				if (res?.error) {
					setError(res);
					setLoading(false);
				} else {
					if (
						!res.results.checklist ||
						!Array.isArray(res.results.checklist) ||
						res.results.checklist.length === 0
					) {
						res.results.checklist = [...booleanFieldArray];
					}
					dispatch(setReqData(res.results));
					setLoading(false);
					let tempLicenseArray = [...res.results.licenses];
					for (let license of tempLicenseArray) {
						license.renewed_license_id = license._id;
						delete license._id;
					}
					updateData({
						renewed_contract_id: contract_id,
						renewed_contract_name: contract_name,
						renewing_contract: true,
						licenses: [...res.results.licenses],
					});
					if (res.results?.payment_term === "one_time") {
						const updatedRequiredFields = _.without(
							requiredFields,
							"payment_repeat_on"
						);
						setRequireFields([
							...updatedRequiredFields,
							"payment_date",
						]);
					} else {
						const updatedRequiredFields = _.without(
							requiredFields,
							"payment_date"
						);
						setRequireFields([
							...updatedRequiredFields,
							"payment_repeat_on",
						]);
					}
					setAppName(res.results?.app_name);
				}
			});
		} catch (error) {
			setError(error);
			setLoading(false);
			TriggerIssue(
				"Error when fetching contract overview details",
				error
			);
		}
	};

	const checkDateSanity = () => {
		if (entity === screenEntity.CONTRACT) {
			if (new Date(data?.start_date) >= new Date(data?.end_date)) {
				return "Contract end date should be after the start date.";
			}
			if (new Date(data?.payment_date) > new Date(data?.end_date)) {
				return "Contract payment date should be before the end date.";
			}
			if (data?.cancel_by) {
				if (new Date(data?.start_date) > new Date(data?.cancel_by)) {
					return "Contract cancel/renew by date should be after the start date.";
				}
				if (new Date(data?.cancel_by) > new Date(data?.end_date)) {
					return "Contract cancel/renew by date should be before the end date.";
				}
			}
			return false;
		} else {
			return false;
		}
	};

	const handleVendorAdd = () => {
		dispatch(preventScroll());
		setShowAddVendor(true);
	};

	const paymentMethodField = (className) => (
		<SelectPaymentMethod
			onPaymentSelect={(id) => updateData({ payment_method_id: id })}
			className={className}
			value={data?.payment_method_id}
		/>
	);

	return (
		<div className="d-flex flex-column">
			<div className="d-flex justify-content-between">
				<div className="grey bold-600 font-14">
					What is this {capitalizeFirstLetter(entity)} for?
				</div>
				<div className="d-flex">
					<div>
						<Form.Check
							type="checkbox"
							label="Not an App?"
							onClick={() => {
								updateData({
									is_app: !data.is_app,
									app_id: null,
									app_name: null,
									app_logo: null,
								});
								setAppName("");
							}}
							checked={!data?.is_app}
							disabled={data?.licenses?.some(
								(license) => license.in_use > 0
							)}
						/>
					</div>
				</div>
			</div>
			<AsyncTypeahead
				key={data?.is_app}
				placeholder="Enter App Name"
				fetchFn={searchAllApps}
				isInvalid={false}
				invalidMessage="Please select the application."
				onSelect={(selection) => {
					updateData({
						app_id: selection.app_id,
						app_name: selection.app_name,
						app_logo: selection.app_logo,
					});
				}}
				requiredValidation={false}
				keyFields={{
					id: "app_id",
					image: "app_logo",
					value: "app_name",
				}}
				allowFewSpecialCharacters={true}
				disabled={
					!data.is_app ||
					data?.licenses?.some((license) => license.in_use > 0)
				}
				defaultValue={appName}
				appLogo={data?.app_logo}
				onChange={(val) => setAppName(val)}
				showAddNewText={true}
				addNewText="+ Add a new application"
				addNewTextClick={() => setShowAddApp(true)}
			/>
			{addAppShow && (
				<AddAppModal
					show={addAppShow}
					onHide={() => setShowAddApp(false)}
					appName={appName}
					onAddApp={(app_id, app_name, app_logo) => {
						updateData({
							app_id,
							app_name,
							app_logo,
						});
						setAppName(app_name);
					}}
				/>
			)}
			{showAddVendor && (
				<>
					<div className="modal-backdrop show"></div>
					<AddVendor
						show={showAddVendor}
						onHide={() => setShowAddVendor(false)}
						onSuccess={(id, name, logo) => {
							dispatch(allowScroll());
							updateData({
								vendor_id: id,
								vendor_name: name,
								vendor_logo: logo,
							});
							setShowAddVendor(false);
						}}
					/>
				</>
			)}
			{entity === screenEntity.CONTRACT && (
				<>
					<Form.Check
						type="checkbox"
						label="Renewing an existing contract?"
						onClick={() => {
							if (data?.renewing_contract) {
								updateData({
									renewed_contract_id: null,
									renewed_contract_name: null,
								});
							}
							updateData({
								renewing_contract: !data.renewing_contract,
							});
						}}
						checked={
							data?.renewing_contract ||
							!!data?.renewed_contract_id
						}
					/>
					{data.renewing_contract && (
						<AsyncTypeahead
							placeholder="Enter Old Contract Name"
							fetchFn={(query, reqCancelToken) =>
								searchContractsV2(
									{
										sort_by: [],
										columns: [],
										filter_by: [
											getSearchReqObj(
												query,
												"contract_name",
												"Contract Name"
											),
										],
									},
									reqCancelToken
								)
							}
							isInvalid={false}
							onSelect={(selection) => {
								selection.contract_id &&
									requestContractData(
										selection.contract_id,
										selection.contract_name
									);
							}}
							requiredValidation={false}
							keyFields={{
								id: "contract_id",
								value: "contract_name",
							}}
							allowFewSpecialCharacters={true}
							labelClassName="font-14 bold-600"
							defaultValue={data?.renewed_contract_name}
						/>
					)}
				</>
			)}

			{showAllFields && (
				<>
					<Form.Label bsPrefix="font-14 bold-600 mt-3">
						Description
					</Form.Label>
					<Form.Control
						as="textarea"
						rows="4"
						value={data?.description}
						placeholder="Description..."
						style={{
							color: "#717171",
							fontSize: "14px",
						}}
						onChange={(e) =>
							updateData({ description: e.target.value })
						}
					/>
					<AsyncTypeahead
						label="Vendor"
						placeholder="Enter Vendor Name"
						fetchFn={searchVendors}
						isInvalid={false}
						invalidMessage="Please select the vendor."
						onSelect={(selection) => {
							updateData({
								vendor_id: selection.vendor_id,
								vendor_name: selection.vendor_name,
								vendor_logo: selection.vendor_logo,
							});
						}}
						requiredValidation={false}
						keyFields={{
							id: "vendor_id",
							image: "vendor_logo",
							value: "vendor_name",
						}}
						allowFewSpecialCharacters={true}
						labelClassName="font-14 bold-600 mt-3"
						defaultValue={data?.vendor_name}
						appLogo={data?.vendor_logo}
						addNewText={"+ Add New Vendor"}
						showAddNewText
						addNewTextClick={(e) => handleVendorAdd()}
						style={{ marginBottom: "7px" }}
					/>
					<SuggestionChips
						suggestions={vendorsuggestions}
						nameKey="name"
						imgKey="logo"
						onClick={(suggestion) =>
							updateData({
								vendor_id: suggestion._id,
								vendor_name: suggestion.name,
								vendor_logo: suggestion.logo,
							})
						}
					/>
					<div
						className="d-flex w-100 mt-3"
						style={{ flexWrap: "wrap" }}
					>
						<div className="d-flex flex-column w-50 pr-1">
							<AsyncTypeahead
								label="Primary Owner"
								placeholder="Add Primary Owner"
								fetchFn={searchUsers}
								isInvalid={isInvalid("primary_owner_id")}
								invalidMessage="Please select the primary owner."
								onSelect={(selection) => {
									updateData({
										primary_owner_id: selection.user_id,
										primary_owner_name: selection.user_name,
										primary_owner_profile:
											selection.profile_img,
									});
								}}
								requiredValidation={false}
								keyFields={{
									id: "user_id",
									image: "profile_img",
									value: "user_name",
									email: "user_email",
								}}
								allowFewSpecialCharacters={true}
								labelClassName="font-14 bold-600"
								defaultValue={data?.primary_owner_name}
								appLogo={data?.primary_owner_profile}
								style={{ marginBottom: "7px" }}
								invalidMsgClassName={
									isInvalid("primary_owner_id")
										? "d-block"
										: ""
								}
							/>

							<SuggestionChips
								suggestions={ownersuggestions}
								nameKey="name"
								imgKey="profile_image"
								onClick={(suggestion) =>
									updateData({
										primary_owner_id: suggestion._id,
										primary_owner_name: suggestion.name,
										primary_owner_profile:
											suggestion.profile_image,
									})
								}
							/>
						</div>
						<div
							hidden={showFinanceOwnerField}
							className="add-owner-field-btns mr-2"
							onClick={() => setShowFinanceOwnerField(true)}
							style={{
								marginTop: showFinanceOwnerField
									? "7px"
									: "29px",
							}}
						>
							+ Add Finance Owner
						</div>
						{showFinanceOwnerField && (
							<div className="w-50 pl-1">
								<AsyncTypeahead
									label="Finance Owner"
									placeholder="Add Finance Owner"
									fetchFn={searchUsers}
									isInvalid={false}
									invalidMessage="Please select the finance owner."
									onSelect={(selection) => {
										updateData({
											financial_owner_id:
												selection.user_id,
											financial_owner_name:
												selection.user_name,
											financial_owner_profile:
												selection.profile_img,
										});
									}}
									requiredValidation={false}
									keyFields={{
										id: "user_id",
										image: "profile_img",
										value: "user_name",
										email: "user_email",
									}}
									allowFewSpecialCharacters={true}
									labelClassName="font-14 bold-600"
									defaultValue={data?.financial_owner_name}
									appLogo={data?.financial_owner_profile}
									style={{ marginBottom: "7px" }}
								/>
								<SuggestionChips
									suggestions={ownersuggestions}
									nameKey="name"
									imgKey="profile_image"
									onClick={(suggestion) =>
										updateData({
											financial_owner_id: suggestion._id,
											financial_owner_name:
												suggestion.name,
											financial_owner_profile:
												suggestion.profile_image,
										})
									}
								/>
							</div>
						)}
						<div
							hidden={showITOwnerField}
							className="add-owner-field-btns"
							onClick={() => setShowITOwnerField(true)}
							style={{
								marginTop: showITOwnerField ? "7px" : "29px",
							}}
						>
							+ Add IT Owner
						</div>
						{showITOwnerField && (
							<div className="w-50 pr-1 mt-4">
								<AsyncTypeahead
									label="IT Owner"
									placeholder="Add IT Owner"
									fetchFn={searchUsers}
									isInvalid={false}
									invalidMessage="Please select the IT owner."
									onSelect={(selection) => {
										updateData({
											it_owner_id: selection.user_id,
											it_owner_name: selection.user_name,
											it_owner_profile:
												selection.profile_img,
										});
									}}
									requiredValidation={false}
									keyFields={{
										id: "user_id",
										image: "profile_img",
										value: "user_name",
										email: "user_email",
									}}
									allowFewSpecialCharacters={true}
									labelClassName="font-14 bold-600"
									defaultValue={data?.it_owner_name}
									appLogo={data?.it_owner_profile}
									style={{ marginBottom: "7px" }}
								/>
								<SuggestionChips
									suggestions={ownersuggestions}
									nameKey="name"
									imgKey="profile_image"
									onClick={(suggestion) =>
										updateData({
											it_owner_id: suggestion._id,
											it_owner_name: suggestion.name,
											it_owner_profile:
												suggestion.profile_image,
										})
									}
								/>
							</div>
						)}
					</div>

					{entity !== screenEntity.SUBSCRIPTION && (
						<>
							<div className="grey font-14 mb-2 mt-4">
								PAYMENT DETAILS
							</div>
							<hr className="w-100 m-0" />
						</>
					)}
					<div className="d-flex mt-4">
						<div className="w-50 d-flex flex-column pr-1">
							<div className="font-14 bold-600 mb-1">
								Start Date
							</div>
							<NewDatePicker
								key={`${data?.start_date}`}
								placeholder="Start Date"
								onChange={(date) =>
									updateData({
										start_date: date?.toISOString(),
									})
								}
								calendarClassName="rangefilter-calendar"
								calendarContainerClassName="schedule-date-calendar"
								value={data?.start_date}
							/>
							<Form.Control.Feedback
								type="invalid"
								className={
									isInvalid("start_date")
										? "d-block"
										: "d-none"
								}
							>
								Please select a valid start date.{" "}
							</Form.Control.Feedback>
						</div>
						<div className="w-50 d-flex flex-column pl-1 mb-1">
							{entity === screenEntity.CONTRACT && (
								<>
									<div className="font-14 bold-600 mb-1">
										End Date
									</div>
									<NewDatePicker
										key={`${data?.end_date}`}
										placeholder="End Date"
										onChange={(date) =>
											updateData({
												end_date: date?.toISOString(),
											})
										}
										calendarClassName="rangefilter-calendar"
										calendarContainerClassName="schedule-date-calendar"
										value={data?.end_date}
										isInvalid={!data?.end_date}
										minDate={getNthDayBeforeDate(
											-1,
											data?.cancel_by
												? data?.cancel_by
												: data?.start_date
										)}
									/>
									<Form.Control.Feedback
										type="invalid"
										className={
											isInvalid("end_date")
												? "d-block"
												: "d-none"
										}
									>
										Please select a valid end date.{" "}
									</Form.Control.Feedback>
									{data?.start_date && (
										<div className="mt-1 d-flex">
											<SuggestionChips
												suggestions={[
													{ years: "1 year" },
													{ years: "2 years" },
													{ years: "3 years" },
												]}
												nameKey="years"
												showImg={false}
												onClick={(item, index) => {
													updateData({
														end_date:
															getEndDateBySuggestion(
																index + 1,
																data?.start_date
															),
													});
												}}
											/>
										</div>
									)}
								</>
							)}
							{entity === screenEntity.SUBSCRIPTION && (
								<>
									<div className="font-14 bold-600 mb-1">
										Renewal Term
									</div>
									<div className="d-flex flex-row align-items-center">
										<div className="font-14 mr-2">
											Every
										</div>
										<Form.Control
											bsPrefix="recurring_frequency_input form-control"
											as="select"
											onChange={(e) =>
												updateData({
													renewal_repeat_frequency:
														Number(e.target.value),
												})
											}
											defaultValue={
												data?.renewal_repeat_frequency
											}
										>
											{arrayOfFirstGivenNumbers(12).map(
												(number) => (
													<option
														key={number}
														value={number}
													>
														{number}
													</option>
												)
											)}
										</Form.Control>
										<Form.Control
											bsPrefix="recurring_interval_dropdown form-control text-capitalize"
											as="select"
											onChange={(e) =>
												updateData({
													renewal_repeat_interval:
														e.target.value,
												})
											}
											defaultValue={
												data?.renewal_repeat_interval
											}
										>
											{/* <option value="weeks">Weeks</option> */}
											<option value="months">
												Months
											</option>
											<option value="years">Years</option>
										</Form.Control>
									</div>
								</>
							)}
							{entity === screenEntity.PERPETUAL &&
								paymentMethodField()}
						</div>
					</div>
					{entity === screenEntity.CONTRACT && (
						<div className="w-50 pr-1">
							<div className="font-14 bold-600 mt-2 mb-1">
								Renew/Cancel by Date
							</div>
							<NewDatePicker
								key={`${data?.cancel_by}`}
								placeholder="Renew/ Cancel by Date"
								onChange={(date) =>
									updateData({ cancel_by: date })
								}
								calendarClassName="rangefilter-calendar"
								calendarContainerClassName="schedule-date-calendar"
								value={data?.cancel_by}
								isInvalid={!data?.end_date}
							/>
							<Form.Check
								label="Contract auto renews after this date"
								checked={data.contract_auto_renews}
								onClick={() =>
									updateData({
										contract_auto_renews:
											!data.contract_auto_renews,
									})
								}
							/>
						</div>
					)}
					{entity !== screenEntity.SUBSCRIPTION && (
						<>
							<div className="d-flex">
								<div className="d-flex flex-column w-50">
									<div className="font-14 bold-600 mt-4 mb-1">
										Select Payment Term
									</div>
									<div className="d-flex">
										{entity === screenEntity.CONTRACT && (
											<Form.Check
												inline
												type="radio"
												label="Recurring"
												name="paymentType"
												id="recurring"
												checked={
													data.payment_term ===
													"recurring"
												}
												onClick={() => {
													updateData({
														payment_term:
															"recurring",
														payment_date: null,
													});
													const updatedRequiredFields =
														_.without(
															requiredFields,
															"payment_date"
														);
													setRequireFields([
														...updatedRequiredFields,
														"payment_repeat_on",
													]);
												}}
											/>
										)}
										<Form.Check
											inline
											type="radio"
											label="One Time"
											name="paymentType"
											id="one_time"
											checked={
												data.payment_term === "one_time"
											}
											onClick={() => {
												updateData({
													payment_term: "one_time",
													payment_repeat_on: null,
												});
												const updatedRequiredFields =
													_.without(
														requiredFields,
														"payment_repeat_on"
													);
												setRequireFields([
													...updatedRequiredFields,
													"payment_date",
												]);
											}}
										/>
									</div>
								</div>
								{entity === screenEntity.CONTRACT && (
									<div className="mt-4 w-50">
										{paymentMethodField()}
									</div>
								)}
							</div>
							<div className="d-flex">
								{data.payment_term === "recurring" ? (
									<div className="d-flex flex-column w-50 mt-2">
										<div className="d-flex">
											<div className="d-flex flex-column pr-2">
												<div className="font-14 bold-600 mt-4 mb-1">
													Repeat Every
												</div>
												<div className="d-flex flex-row ">
													<Form.Control
														bsPrefix="recurring_frequency_input form-control"
														as="select"
														onChange={(e) =>
															updateData({
																payment_repeat_frequency:
																	Number(
																		e.target
																			.value
																	),
															})
														}
														defaultValue={
															data?.payment_repeat_frequency
														}
													>
														{arrayOfFirstGivenNumbers(
															12
														).map((number) => (
															<option
																key={number}
																value={number}
															>
																{number}
															</option>
														))}
													</Form.Control>
													<Form.Control
														bsPrefix="recurring_interval_dropdown form-control text-capitalize"
														as="select"
														onChange={(e) =>
															updateData({
																payment_repeat_interval:
																	e.target
																		.value,
															})
														}
														defaultValue={
															data?.payment_repeat_interval
														}
													>
														{/* <option value="weeks">
													Weeks
												</option> */}
														<option value="months">
															Months
														</option>
														<option value="years">
															Years
														</option>
													</Form.Control>
												</div>
											</div>
											<div className="d-flex flex-column pl-2 w-100">
												<div className="font-14 bold-600 mt-4 mb-1">
													First Payment Date
												</div>
												<NewDatePicker
													key={`${data?.payment_repeat_on}`}
													placeholder="First Payment Date"
													onChange={(date) =>
														updateData({
															payment_repeat_on:
																date,
														})
													}
													calendarClassName="rangefilter-calendar"
													calendarContainerClassName="schedule-date-calendar"
													style={{ width: "170px" }}
													value={
														data?.payment_repeat_on
													}
												/>
												<Form.Control.Feedback
													type="invalid"
													className={
														isInvalid(
															"payment_repeat_on"
														)
															? "d-block"
															: "d-none"
													}
												>
													Please select a valid repeat
													on date.
												</Form.Control.Feedback>
											</div>
										</div>
										{data?.start_date && (
											<div className="d-flex mt-1">
												<SuggestionChips
													suggestions={
														contractPaymentDateSuggestions
													}
													nameKey="display"
													showImg={false}
													onClick={(d) => {
														updateData({
															payment_repeat_on:
																addToDate(
																	data?.start_date,
																	d.daysToBeAddedToStartDate >
																		0
																		? d.daysToBeAddedToStartDate -
																				1
																		: d.daysToBeAddedToStartDate,
																	"days"
																),
														});
													}}
												/>
											</div>
										)}
									</div>
								) : (
									<div className="d-flex flex-column w-50 mt-2">
										<div className="font-14 bold-600 mt-4 mb-1">
											Payment Date
										</div>
										<NewDatePicker
											key={`${data?.payment_date}`}
											placeholder="Payment Date"
											onChange={(date) =>
												updateData({
													payment_date: date,
												})
											}
											calendarClassName="rangefilter-calendar"
											calendarContainerClassName="schedule-date-calendar"
											style={{ width: "170px" }}
											value={data?.payment_date}
										/>
										<Form.Control.Feedback
											type="invalid"
											className={
												isInvalid("payment_date")
													? "d-block"
													: "d-none"
											}
										>
											Please select a valid payment date.
										</Form.Control.Feedback>
										{data?.start_date && (
											<div className="d-flex mt-1">
												<SuggestionChips
													suggestions={
														contractPaymentDateSuggestions
													}
													nameKey="display"
													showImg={false}
													onClick={(d) => {
														updateData({
															payment_date:
																addToDate(
																	data?.start_date,
																	d.daysToBeAddedToStartDate >
																		0
																		? d.daysToBeAddedToStartDate -
																				1
																		: d.daysToBeAddedToStartDate,
																	"days"
																),
														});
													}}
												/>
											</div>
										)}
									</div>
								)}
								{entity === screenEntity.CONTRACT && (
									<div className="mt-2 w-50">
										<div className="d-flex flex-column">
											<div className="font-14 bold-600 mt-4 mb-1">
												Agreement Type
											</div>
											<Dropdown
												toggler={
													<>
														<div
															className="border-1 w-100 d-flex align-items-center justify-content-between border-radius-4"
															style={{
																height: "36px",
																padding:
																	"0 12px",
															}}
														>
															<div className="font-12">
																{data?.agreement_type
																	? contractAgreementTypes[
																			data
																				?.agreement_type
																	  ]?.label
																	: "Select Agreement Type"}
															</div>
															<img
																src={
																	arrowdropdown
																}
																alt=""
																height={12}
																width={12}
															/>
														</div>
													</>
												}
												options={Object.values(
													contractAgreementTypes
												)}
												optionFormatter={(option) =>
													option.label
												}
												onOptionSelect={(option) =>
													updateData({
														agreement_type:
															option.value,
													})
												}
												dropdownWidth="100%"
												menuStyle={{ width: "100%" }}
											/>
										</div>
									</div>
								)}
							</div>
							{isValidated &&
								checkDateSanity() &&
								isFormValid(data, requiredFields) && (
									<div className="warningMessage w-100 mt-1 d-flex justify-content-center p-1">
										{checkDateSanity()}
									</div>
								)}
						</>
					)}
					{entity === screenEntity.SUBSCRIPTION && (
						<div className="d-flex mt-3">
							<div className="w-50 d-flex flex-column pr-1">
								<div className="font-14 bold-600 mb-1">
									First Renewal
								</div>
								<NewDatePicker
									key={`${data?.next_renewal_date}`}
									minDate={data?.start_date}
									placeholder="First Renewal Date"
									onChange={(date) =>
										updateData({ next_renewal_date: date })
									}
									value={data?.next_renewal_date}
									calendarClassName="rangefilter-calendar"
									calendarContainerClassName="schedule-date-calendar"
									disabled={true}
								/>
								<Form.Control.Feedback
									type="invalid"
									className={
										isInvalid("next_renewal_date")
											? "d-block"
											: "d-none"
									}
								>
									Please select a valid renewal date.{" "}
								</Form.Control.Feedback>
								<Form.Check
									label="Auto Renews"
									checked={data.auto_renews}
									onClick={() =>
										updateData({
											auto_renews: !data.auto_renews,
										})
									}
								/>
							</div>
							{paymentMethodField("w-50")}
						</div>
					)}
					{entity !== screenEntity.PERPETUAL && (
						<div className="d-flex">
							<ContractCostAmortization
								updateData={updateData}
								data={data}
							/>
							<ContractLicenseGroupPrecedence
								updateData={updateData}
								data={data}
							/>
						</div>
					)}
					<div className="mt-2">
						<CustomFieldSectionInForm
							customFieldData={customFields}
							of={CUSTOM_FIELD_ENTITY.CONTRACTS}
							onValueChange={(id, val) =>
								onValueChangeFromCustomFields(id, val)
							}
						/>
					</div>
					<Button
						onClick={() => {
							setIsValidated(true);
							if (isFormValid(data, requiredFields)) {
								if (!checkDateSanity()) {
									updateData({ custom_fields: customFields });
									updateStep();
								}
							}
						}}
						style={{ width: "132px", height: "38px" }}
						className="mt-4"
					>
						Next
					</Button>
				</>
			)}
		</div>
	);
}
