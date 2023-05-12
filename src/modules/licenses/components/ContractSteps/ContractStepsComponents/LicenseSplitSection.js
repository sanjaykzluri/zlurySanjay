import React, { useState } from "react";
import { Form } from "react-bootstrap";
import close from "assets/close.svg";
import DateRangePicker from "UIComponents/DateRangePicker/DateRangePicker";
import {
	LicenseGroupsHeaderCSS,
	screenEntity,
} from "modules/licenses/constants/LicenseConstants";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";
import {
	getDefaultLicenseGroup,
	getMaxGroupStartDateForSubscription,
} from "modules/licenses/utils/LicensesUtils";

export default function LicenseSplitSection({
	license,
	setLicense,
	data,
	entity,
}) {
	const [groups, setGroups] = useState([...license?.groups] || []);

	const removeGroup = (index) => {
		let temp = [...groups];
		temp.splice(index, 1);
		setGroups([...temp]);
		setLicense({ ...license, groups: [...temp] });
	};

	const addGroup = () => {
		let temp = [...groups];
		temp.push(getDefaultLicenseGroup(data, entity));
		setGroups([...temp]);
		setLicense({ ...license, groups: [...temp] });
	};

	const handleGroupEdit = (key, value, index) => {
		let temp = [...groups];

		if (typeof value === "string") {
			value = value?.trimStart();
		}

		if (typeof value === "number" && key !== "quantity") {
			if (value < 0) {
				value = 0;
			}
		}

		if (key === "term") {
			if (value === "license_term") {
				temp[index].complete_term = true;
				temp[index].period = "license_term";
				temp[index].frequency = 1;
			} else if (value === "term") {
				temp[index].complete_term = false;
				temp[index].period = "term";
				temp[index].frequency = 1;
			} else {
				temp[index].complete_term = false;
				temp[index].period = value;
				temp[index].frequency = 1;
			}
		} else {
			temp[index][key] = value;
		}

		setGroups([...temp]);
		setLicense({ ...license, groups: [...temp] });
	};

	function LicenseGroupFormFieldMap(field, index) {
		switch (field) {
			case "Description":
				return (
					<Form.Control
						required
						value={groups[index].description}
						placeholder="Description"
						onChange={(e) => {
							handleGroupEdit(
								"description",
								e.target.value,
								index
							);
						}}
					/>
				);
			case "License Term":
				return (
					<DateRangePicker
						start={
							groups[index].start_date ||
							license?.start_date ||
							data?.start_date
						}
						end={
							groups[index].end_date ||
							license?.end_date ||
							data?.end_date
						}
						minDate={data?.start_date}
						maxDate={data?.end_date}
						onStartChange={(date) =>
							handleGroupEdit("start_date", date, index)
						}
						onEndChange={(date) =>
							handleGroupEdit("end_date", date, index)
						}
						defaultCalendarView="month"
						calendarContainerClassName="app-vendor-overview-date-range-calendar"
						calendarClassName="rangefilter-calendar"
						style={{ height: "36px" }}
					/>
				);
			case "Start Date":
				return (
					<NewDatePicker
						key={`${
							groups[index]?.start_date ||
							license?.start_date ||
							data?.start_date
						}`}
						value={
							groups[index]?.start_date ||
							license?.start_date ||
							data?.start_date
						}
						minDate={data?.start_date}
						maxDate={
							entity === screenEntity.SUBSCRIPTION
								? getMaxGroupStartDateForSubscription(
										data
								  ).toISOString()
								: null
						}
						onChange={(date) =>
							handleGroupEdit("start_date", date, index)
						}
						placeholder="Start Date"
						defaultCalendarView="month"
						calendarContainerClassName="schedule-date-calendar"
					/>
				);
			case "Cost/License":
				return (
					<div className="d-flex">
						<Form.Control
							required
							value={groups[index]?.amount}
							placeholder="Cost"
							type="number"
							onChange={(e) => {
								handleGroupEdit(
									"amount",
									Number.parseFloat(e.target.value),
									index
								);
							}}
							bsPrefix="form-control groups_license_cost_field"
						/>
						<Form.Control
							as="select"
							value={groups[index]?.period}
							onChange={(e) => {
								handleGroupEdit("term", e.target.value, index);
							}}
							disabled={entity === screenEntity.PERPETUAL}
						>
							<option value="term">per term</option>
							{entity === screenEntity.CONTRACT && (
								<option value="license_term">
									per lic. term
								</option>
							)}
							<option value="months">per month</option>
							<option value="quarter">per quarter</option>
							<option value="years">per year</option>
						</Form.Control>
					</div>
				);
			case "Quantity":
				return (
					<Form.Control
						required
						value={groups[index]?.quantity}
						placeholder="Quantity"
						onChange={(e) => {
							handleGroupEdit(
								"quantity",
								Number.parseInt(e.target.value),
								index
							);
						}}
						type="number"
					/>
				);
			case "Discount":
				return (
					<div className="d-flex">
						<Form.Control
							key={license?.groups[index]?.discount_type}
							value={license.groups[index]?.discount}
							placeholder="Disc."
							type="number"
							onChange={(e) => {
								handleGroupEdit(
									"discount",
									Number.parseFloat(e.target.value),
									index
								);
							}}
							bsPrefix="form-control qty_split_form_discount_value"
						/>
						<Form.Control
							as="select"
							onChange={(e) => {
								handleGroupEdit(
									"discount_type",
									e.target.value,
									index
								);
							}}
							name="contract_currency_select"
							value={license.groups[index]?.discount_type}
							bsPrefix="form-control qty_split_form_discount_type"
						>
							<option value="percentage">%</option>
							<option value="value">{data?.base_currency}</option>
						</Form.Control>
					</div>
				);
			case "Remove":
				return (
					<div
						className="d-flex align-items-center justify-content-center"
						style={{ height: "36px" }}
					>
						{license.groups?.length > 1 && (
							<img
								className="cursor-pointer"
								alt="Remove"
								onClick={() => removeGroup(index)}
								src={close}
							/>
						)}
					</div>
				);
			default:
				return <></>;
		}
	}

	return (
		<div className="split_section_container">
			<div className="split_section_headers">
				{[
					"Description",
					entity === screenEntity.CONTRACT
						? "License Term"
						: "Start Date",
					"Cost/License",
					"Discount",
					"Quantity",
					"Remove",
				].map((header, index) => (
					<div
						className="bold-500 font-10 o-5"
						key={index}
						style={LicenseGroupsHeaderCSS[header]}
					>
						{header !== "Remove" ? header : ""}
					</div>
				))}
			</div>
			<div className="split_section_form">
				{groups.map(
					(group, groupIndex) =>
						group.group_type !== "surplus" && (
							<div
								className="split_section_headers"
								key={groupIndex}
							>
								{[
									"Description",
									entity === screenEntity.CONTRACT
										? "License Term"
										: "Start Date",
									"Cost/License",
									"Discount",
									"Quantity",
									"Remove",
								].map((header, index) => (
									<div
										className="mt-2"
										key={index}
										style={LicenseGroupsHeaderCSS[header]}
									>
										{LicenseGroupFormFieldMap(
											header,
											groupIndex
										)}
									</div>
								))}
							</div>
						)
				)}
				<div
					className="glow_blue font-12 cursor-pointer mt-1"
					onClick={() => addGroup()}
				>
					+ Add Another Split
				</div>
			</div>
		</div>
	);
}
