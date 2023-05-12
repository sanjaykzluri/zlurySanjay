import React, { useRef, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import close from "assets/close.svg";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import { searchApplicationLicenseSuggestions } from "services/api/licenses";
import {
	licenseApplyCostOptions,
	screenEntity,
	tooltipTexts,
} from "modules/licenses/constants/LicenseConstants";
import DateRangePicker from "UIComponents/DateRangePicker/DateRangePicker";
import LicenseSplitSection from "./LicenseSplitSection";
import ToggleSwitch from "react-switch";
import { capitalizeFirstLetter } from "utils/common";
import { Button } from "UIComponents/Button/Button";
import {
	fillNullLicenseValues,
	getDefaultLicenseGroup,
	getMaxGroupStartDateForSubscription,
	HeaderFormatter,
	validateLicenseForm,
} from "modules/licenses/utils/LicensesUtils";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";

export default function LicenseForm({
	show,
	handleClose,
	data,
	licenseFromProps,
	entity,
	onSave,
}) {
	const warningRef = useRef();
	const [license, setLicense] = useState(
		licenseFromProps
			? { ...licenseFromProps }
			: {
					name: "",
					type: "user",
					groups: [getDefaultLicenseGroup(data, entity)],
					minimum_duration: "pro-rata",
					auto_increment: false,
					license_included_in_base_price: null,
			  }
	);
	const [showSplitSection, setShowSplitSection] = useState(
		license.groups.length > 1
	);
	const [warning, setWarning] = useState(false);

	function showHideSplitSection() {
		if (showSplitSection) {
			let temp = { ...license };
			temp.groups = [license.groups[0]];
			setLicense({ ...temp });
			setShowSplitSection(false);
		} else {
			setShowSplitSection(true);
		}
	}

	function handleLicenseEdit(key, value, index) {
		if (key === "groups" && !isNaN(index)) {
			let temp = { ...license };
			temp.groups[index] = value;
			setLicense(temp);
		} else {
			let temp = { ...license, [key]: value };
			setLicense(temp);
		}
	}

	const handleLicenseGroupEdit = (key, value, index) => {
		let tempLicense = { ...license };
		let tempZeroGroup = { ...tempLicense.groups[0] };
		if (typeof value === "string") {
			value = value?.trimStart();
		}
		if (key === "discount_type") {
			tempZeroGroup[key] = value;
			tempZeroGroup.discount = null;
		}
		if (key === "discount") {
			if (tempZeroGroup.discount_type === "percentage") {
				if (value > 100) {
					value = 100;
				}
			} else {
				if (value > tempZeroGroup.amount) {
					value = tempZeroGroup.amount;
				}
			}
		}
		if (typeof value === "number" && key !== "quantity") {
			if (value < 0) {
				value = 0;
			}
		}
		if (key === "term") {
			if (value === "license_term") {
				tempZeroGroup.complete_term = true;
				tempZeroGroup.period = "license_term";
				tempZeroGroup.frequency = 1;
			} else if (value === "term") {
				tempZeroGroup.complete_term = false;
				tempZeroGroup.period = "term";
				tempZeroGroup.frequency = 1;
			} else {
				tempZeroGroup.complete_term = false;
				tempZeroGroup.period = value;
				tempZeroGroup.frequency = 1;
			}
		} else {
			tempZeroGroup[key] = value;
		}
		handleLicenseEdit("groups", tempZeroGroup, index);
	};

	return (
		<Modal
			show={show}
			onHide={handleClose}
			centered
			size="xl"
			contentClassName={
				entity === screenEntity.CONTRACT
					? "license_form_modal_contract"
					: "license_form_modal"
			}
			dialogClassName="modal-dialog modal-xl modal-dialog-centered justify-content-center"
		>
			<div className="d-flex flex-column position-relative">
				<div className="d-flex align-items-center justify-content-center p-3 font-18 bold-600">
					{licenseFromProps ? "Edit License" : "Add License"}
				</div>
				<img
					className="position-absolute cursor-pointer"
					alt="Close"
					onClick={handleClose}
					src={close}
					style={{ top: "30%", left: "97%" }}
				/>
				<hr className="w-100 m-0" />
			</div>
			<div className="license_form_fields_div">
				<div className="d-flex">
					<div
						className="d-flex flex-column"
						style={{ width: "280px" }}
					>
						<div className="font-14 bold-600 mb-2">
							License Type
						</div>
						<div className="d-flex">
							<div
								className={
									license.type === "user"
										? "selected_license_type"
										: "deselected_license_type"
								}
								onClick={() =>
									handleLicenseEdit("type", "user")
								}
							>
								Seat Based
							</div>
							<div
								className={
									license.type === "quantity"
										? "selected_license_type"
										: "deselected_license_type"
								}
								onClick={() =>
									handleLicenseEdit("type", "quantity")
								}
							>
								Quantity Based
							</div>
						</div>
					</div>
					<div className="d-flex flex-column ml-4 w-100">
						<div className="font-14 bold-600 mb-2">
							License Name
						</div>
						{data?.app_id ? (
							<AsyncTypeahead
								fetchFn={(query) =>
									searchApplicationLicenseSuggestions(
										data?.app_id,
										query
									)
								}
								keyFields={{ value: "value", title: "title" }}
								requiredValidation={true}
								allowFewSpecialCharacters={true}
								defaultValue={license.name}
								onSelect={(selection) =>
									handleLicenseEdit("name", selection.value)
								}
								onChange={(value) => {
									handleLicenseEdit("name", value);
								}}
								hideNoResultsText={true}
								placeholder="Enter Name"
								style={{ width: "100% !important" }}
							/>
						) : (
							<Form.Control
								required
								value={license.name}
								placeholder="Enter Name"
								onChange={(e) => {
									handleLicenseEdit("name", e.target.value);
								}}
								style={{ width: "100% !important" }}
							/>
						)}
					</div>
				</div>
				{!showSplitSection && (
					<>
						<div className="d-flex mt-4">
							<div
								className="d-flex flex-column"
								style={{ width: "280px" }}
							>
								<div className="font-14 bold-600 mb-2">
									Cost/License
								</div>
								<div className="d-flex">
									<Form.Control
										required
										value={license.groups[0]?.amount}
										placeholder="Cost"
										type="number"
										onChange={(e) => {
											handleLicenseGroupEdit(
												"amount",
												Number.parseFloat(
													e.target.value
												),
												0
											);
										}}
									/>
									<Form.Control
										as="select"
										value={
											license.groups[0]?.period || "term"
										}
										onChange={(e) => {
											handleLicenseGroupEdit(
												"term",
												e.target.value,
												0
											);
										}}
										disabled={
											entity === screenEntity.PERPETUAL
										}
									>
										<option value="term">per term</option>
										{entity === screenEntity.CONTRACT && (
											<option value="license_term">
												per lic. term
											</option>
										)}
										<option value="months">
											per month
										</option>
										<option value="quarter">
											per quarter
										</option>
										<option value="years">per year</option>
									</Form.Control>
								</div>
							</div>
							<div className="d-flex flex-column ml-4">
								<div className="font-14 bold-600 mb-2">
									License Discount
								</div>
								<div className="d-flex">
									<Form.Control
										key={license?.groups[0]?.discount_type}
										value={license.groups[0]?.discount}
										placeholder="Discount"
										type="number"
										onChange={(e) => {
											handleLicenseGroupEdit(
												"discount",
												Number.parseFloat(
													e.target.value
												),
												0
											);
										}}
										disabled={isNaN(
											license?.groups[0]?.amount
										)}
										bsPrefix="form-control license_form_discount_value"
									/>
									<Form.Control
										as="select"
										onChange={(e) => {
											handleLicenseGroupEdit(
												"discount_type",
												e.target.value,
												0
											);
										}}
										name="contract_currency_select"
										value={license.groups[0]?.discount_type}
										bsPrefix="form-control license_form_discount_type"
									>
										<option value="percentage">%</option>
										<option value="value">
											{data?.base_currency}
										</option>
									</Form.Control>
								</div>
							</div>
						</div>
						<div className="d-flex mt-4">
							<div style={{ width: "280px" }}>
								{entity === screenEntity.CONTRACT ? (
									<div
										className="d-flex flex-column"
										style={{ width: "280px" }}
									>
										<div className="font-14 bold-600 mb-2">
											License Term
										</div>
										<DateRangePicker
											start={
												license?.groups[0]
													?.start_date ||
												data?.start_date
											}
											end={
												license?.groups[0]?.end_date ||
												data?.end_date
											}
											minDate={data?.start_date}
											maxDate={data?.end_date}
											onStartChange={(date) =>
												handleLicenseGroupEdit(
													"start_date",
													date,
													0
												)
											}
											onEndChange={(date) =>
												handleLicenseGroupEdit(
													"end_date",
													date,
													0
												)
											}
											defaultCalendarView="month"
											calendarContainerClassName="app-vendor-overview-date-range-calendar"
											calendarClassName="rangefilter-calendar"
											style={{ height: "36px" }}
										/>
									</div>
								) : (
									<div
										className="d-flex flex-column"
										style={{ width: "280px" }}
									>
										<div className="font-14 bold-600 mb-2">
											Start Date
										</div>
										<NewDatePicker
											key={`${
												license?.groups[0]
													?.start_date ||
												data?.start_date
											}`}
											value={
												license?.groups[0]
													?.start_date ||
												data?.start_date
											}
											minDate={data?.start_date}
											maxDate={
												entity ===
												screenEntity.SUBSCRIPTION
													? getMaxGroupStartDateForSubscription(
															data
													  ).toISOString()
													: null
											}
											onChange={(date) =>
												handleLicenseGroupEdit(
													"start_date",
													date,
													0
												)
											}
											placeholder="Start Date"
											calendarContainerClassName="schedule-date-calendar"
										/>
									</div>
								)}
							</div>
							<div className="d-flex flex-column ml-4 w-100">
								<div className="font-14 bold-600 mb-2">
									Description
								</div>
								<Form.Control
									required
									value={license?.groups[0].description}
									placeholder="Enter Description"
									onChange={(e) => {
										handleLicenseGroupEdit(
											"description",
											e.target.value,
											0
										);
									}}
									style={{ width: "100% !important" }}
								/>
							</div>
						</div>
					</>
				)}
				<div
					className="d-flex mt-4"
					style={{ width: showSplitSection ? "100%" : "280px" }}
				>
					<div className="d-flex flex-column width-fit-content">
						<div className="d-flex justify-content-between">
							<div className="font-14 bold-600 mb-2">
								Quantity
							</div>
							<div
								className="font-12 bold-600 primary-color cursor-pointer"
								onClick={showHideSplitSection}
							>
								{showSplitSection
									? "Remove Splits"
									: "Split Quantity"}
							</div>
						</div>
						{showSplitSection ? (
							<LicenseSplitSection
								license={license}
								setLicense={setLicense}
								data={data}
								entity={entity}
							/>
						) : (
							<Form.Control
								required
								value={license.groups[0].quantity}
								placeholder="Enter Quantity"
								onChange={(e) => {
									handleLicenseGroupEdit(
										"quantity",
										Number.parseInt(e.target.value),
										0
									);
								}}
								style={{ width: "100% !important" }}
								type="number"
							/>
						)}
					</div>
				</div>
				<div className="d-flex">
					<div
						className="d-flex flex-column mt-4"
						style={{ width: "280px" }}
					>
						<div className="mb-2 bold-600 font-14">
							{entity === screenEntity.SUBSCRIPTION
								? "Auto Adjust"
								: "Auto Increment"}
						</div>
						<div className="d-flex align-items-center">
							<ToggleSwitch
								height={20}
								width={36}
								checked={license.auto_increment}
								onChange={() =>
									handleLicenseEdit(
										"auto_increment",
										!license.auto_increment
									)
								}
								checkedIcon={false}
								uncheckedIcon={false}
								onColor={"#2266E2"}
							/>
							<div className="font-10 grey-1 ml-3">
								The number of license can increase to match the
								number of users
							</div>
						</div>
					</div>
					{entity !== screenEntity.PERPETUAL && (
						<div className="d-flex flex-column mt-4 ml-4">
							<div className="d-flex mb-2 bold-600 font-14">
								<HeaderFormatter
									text="Apply Cost"
									tooltipContent={tooltipTexts.APPLY_COST}
								/>
							</div>
							<div className="d-flex align-items-center">
								{licenseApplyCostOptions.map(
									(option, index) => (
										<Form.Check
											inline
											key={index}
											type="radio"
											label={capitalizeFirstLetter(
												option
											)}
											name="minimum_duration"
											id={`minimum_duration_${option}`}
											checked={
												license.minimum_duration ===
												option
											}
											onClick={() =>
												handleLicenseEdit(
													"minimum_duration",
													option
												)
											}
										/>
									)
								)}
							</div>
						</div>
					)}
				</div>
				{!!warning && (
					<div
						ref={warningRef}
						className="warningMessage w-100 mt-2 p-1 d-flex justify-content-center"
					>
						{warning}
					</div>
				)}
			</div>

			<hr className="w-100 m-0" />
			<div className="license_form_footer">
				<Button
					type="primary"
					onClick={() => {
						if (validateLicenseForm(license)) {
							setWarning(validateLicenseForm(license));
							warningRef?.current?.scrollIntoView();
							setTimeout(() => setWarning(false), 10000);
							return;
						}
						onSave(fillNullLicenseValues(license));
					}}
					className="mr-4"
				>
					Save
				</Button>
				<Button type="link" onClick={handleClose} className="mr-4">
					Cancel
				</Button>
			</div>
		</Modal>
	);
}
