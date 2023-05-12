import { kFormatter } from "constants/currency";
import React, { useState } from "react";
import {
	LicenseDetailsCSS,
	screenEntity,
} from "modules/licenses/constants/LicenseConstants";
import { Form } from "react-bootstrap";
import deleteIcon from "assets/deleteIcon.svg";
import { getGroupCostPerTerm } from "modules/licenses/utils/LicensesUtils";
import edit from "assets/icons/edit.svg";
import LicenseForm from "./LicenseForm";
import { UTCDateFormatter } from "utils/DateUtility";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

export default function LicenseDetailsInfoSection({
	data,
	licenses,
	onDeleteLicense,
	reviewStep = false,
	overview = false,
	entity,
	setLicenseArray,
	updateData,
}) {
	const [showForm, setShowForm] = useState(false);
	const [activeIndex, setActiveIndex] = useState();

	function editLicense(license) {
		licenses[activeIndex] = license;
		setActiveIndex();
		setShowForm(false);
		setLicenseArray(licenses);
		updateData({ licenses: licenses });
	}

	function LicenseDetailsInfoMap({
		field,
		licenseIndex,
		groupIndex,
		isLicenseRow = false,
	}) {
		let license = licenses[licenseIndex];
		let groups = license?.groups;
		let group = groups?.[groupIndex];

		switch (field) {
			case "Description":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						{isLicenseRow ? (
							""
						) : (
							<LongTextTooltip
								text={group.description}
								maxWidth={250}
							/>
						)}
					</div>
				);
			case "License Type":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						{license.type === "user" ? "Seat " : "Qty "}Based
					</div>
				);
			case "License Name":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						<LongTextTooltip text={license.name} maxWidth={135} />
					</div>
				);
			case "License Term":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						{isLicenseRow
							? ``
							: `${UTCDateFormatter(
									group?.start_date
							  )} - ${UTCDateFormatter(group?.end_date)}`}
					</div>
				);
			case "Start Date":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						{isLicenseRow
							? ``
							: `${UTCDateFormatter(group?.start_date)}`}
					</div>
				);
			case "Cost/License":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						{isLicenseRow
							? ``
							: overview
							? `${kFormatter(group?.amount_org_currency)}${
									group?.complete_term
										? " per lic. term"
										: group?.period
										? ` per ${
												group?.period !== "quarter" &&
												group.period !== "term"
													? group?.period?.slice(
															0,
															-1
													  )
													: group?.period
										  }`
										: " per term"
							  }`
							: `${kFormatter(group?.amount, data?.base_currency)}
                            ${
								group?.complete_term
									? " per lic. term"
									: group?.period
									? ` per ${
											group?.period !== "quarter" &&
											group.period !== "term"
												? group?.period?.slice(0, -1)
												: group?.period
									  }`
									: " per term"
							}`}
					</div>
				);
			case "Discount":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						{isLicenseRow
							? ``
							: group?.discount_type === "value"
							? overview
								? kFormatter(group?.discount_org_currency)
								: kFormatter(
										group?.discount,
										data?.base_currency
								  )
							: `${group?.discount || 0}%`}
					</div>
				);
			case "Quantity":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						{isLicenseRow ? `` : group?.quantity}
					</div>
				);
			case "Auto Increment":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						<Form.Check
							type="switch"
							checked={license.auto_increment}
						/>
					</div>
				);
			case "Auto Adjust":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						<Form.Check
							type="switch"
							checked={license.auto_increment}
						/>
					</div>
				);
			case "Group Auto Increment":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					/>
				);
			case "Cost/Term":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						{isLicenseRow
							? ``
							: overview
							? kFormatter(
									group.amount_per_term_org_currency_with_license_discount
							  )
							: getGroupCostPerTerm(
									group,
									entity,
									data,
									false,
									license.minimum_duration
							  )}
					</div>
				);
			case "Edit":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						{!reviewStep && !overview && isLicenseRow && (
							<img
								src={edit}
								className="cursor-pointer"
								onClick={() => {
									setShowForm(true);
									setActiveIndex(licenseIndex);
								}}
							/>
						)}
					</div>
				);
			case "Remove":
				return (
					<div
						className="d-flex align-items-center font-12"
						style={LicenseDetailsCSS[field]}
					>
						{!reviewStep && !overview && isLicenseRow && (
							<img
								src={deleteIcon}
								className="cursor-pointer"
								onClick={() => onDeleteLicense(licenseIndex)}
							/>
						)}
					</div>
				);
			default:
				return <></>;
		}
	}

	return (
		<div className="split_section_form" key={`${licenses}`}>
			{Array.isArray(licenses) &&
				licenses.map((license, licenseIndex) => (
					<div
						className="license_and_group_row_container"
						key={licenseIndex}
					>
						<div className="license_row">
							{[
								"License Type",
								"License Name",
								entity === screenEntity.CONTRACT
									? "License Term"
									: "Start Date",
								"Cost/License",
								"Discount",
								"Quantity",
								entity === screenEntity.SUBSCRIPTION
									? "Auto Adjust"
									: "Auto Increment",
								"Cost/Term",
								!reviewStep && !overview && "Edit",
								!reviewStep && !overview && "Remove",
							].map((field, index) => (
								<div
									className="d-flex align-items-center"
									key={index}
									style={LicenseDetailsCSS[field]}
								>
									{LicenseDetailsInfoMap({
										field,
										licenseIndex,
										isLicenseRow: true,
									})}
								</div>
							))}
						</div>
						{Array.isArray(license.groups) &&
							license.groups.map(
								(group, groupIndex) =>
									group.group_type !== "surplus" && (
										<div className="group_row">
											{[
												"Description",
												entity === screenEntity.CONTRACT
													? "License Term"
													: "Start Date",
												"Cost/License",
												"Discount",
												"Quantity",
												"Group Auto Increment",
												"Cost/Term",
												!reviewStep &&
													!overview &&
													"Edit",
												!reviewStep &&
													!overview &&
													"Remove",
											].map((field, index) => (
												<div
													className="d-flex align-items-center"
													key={index}
													style={
														LicenseDetailsCSS[field]
													}
												>
													{LicenseDetailsInfoMap({
														field,
														licenseIndex,
														groupIndex,
													})}
												</div>
											))}
										</div>
									)
							)}
					</div>
				))}

			{showForm && (
				<LicenseForm
					show={showForm}
					handleClose={() => setShowForm(false)}
					data={data}
					entity={entity}
					updateData={updateData}
					onSave={(license) => {
						editLicense(license);
					}}
					licenseFromProps={licenses[activeIndex]}
				/>
			)}
		</div>
	);
}
