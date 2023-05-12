import { kFormatter } from "constants/currency";
import { getLicenseTermText } from "modules/licenses/utils/LicensesUtils";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import React, { useRef, useState } from "react";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { UTCDateFormatter } from "utils/DateUtility";
import UserLicensePopover from "./UserLicensePopover";
import { useOutsideClickListener } from "utils/clickListenerHook";

export default function UserLicensesCell({
	userLicenses = [],
	licenseList = [],
	onAssignLicense,
	onUnassignLicense,
	user,
}) {
	const userLicenseRef = useRef();
	const [selectedForEditing, setSelectedForEditing] = useState();

	const isLicenseAssigned = (license) => {
		const userLicenseIdsArr = [...userLicenses].map(
			(license) => license.license_id
		);
		return userLicenseIdsArr.includes(license.license_id);
	};

	useOutsideClickListener(userLicenseRef, () => {
		setSelectedForEditing();
	});

	const stopBubblingEvent = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	return (
		<div className="d-flex align-items-center position-relative">
			<div
				className="d-flex"
				style={{ maxWidth: "300px", overflowX: "auto" }}
			>
				{userLicenses.map((license, index) => (
					<div
						key={index}
						className="d-flex bg-white flex-column justify-content-between cursor-pointer"
						style={{
							width: "150px",
							height: "44px",
							marginRight: "5px",
							padding: "5px 2.5px",
						}}
						onClick={() => setSelectedForEditing(license)}
						ref={userLicenseRef}
					>
						{!!selectedForEditing && (
							<UserLicensePopover
								show={!!selectedForEditing}
								handleClose={(e) => {
									stopBubblingEvent(e);
									setSelectedForEditing();
								}}
								userLicenseRef={userLicenseRef}
								license={selectedForEditing}
								user={user}
								licenseIndex={index}
							/>
						)}
						<LongTextTooltip
							text={license.license_name}
							maxWidth="145px"
							style={{ fontSize: "12px" }}
						/>
						<div className="d-flex justify-content-between font-9">
							<div>
								{UTCDateFormatter(license.license_assigned_on)}
							</div>
							<div>{license.role}</div>
						</div>
					</div>
				))}
			</div>
			<Dropdown
				toggler={
					<div className="glow_blue bold-600 font-13 ml-2 cursor-pointer">
						+ Add License
					</div>
				}
				options={licenseList}
				optionFormatter={(license) => (
					<DropdownLicenseCard
						license={license}
						isAssigned={isLicenseAssigned(license)}
					/>
				)}
				onOptionSelect={(license) =>
					isLicenseAssigned(license)
						? onUnassignLicense(license)
						: onAssignLicense(license)
				}
				menuStyle={{ padding: "0px" }}
				optionStyle={{ padding: "0px" }}
			/>
		</div>
	);
}

export function DropdownLicenseCard({ license, isAssigned }) {
	const cardStyle = {
		width: "300px",
		height: "44px",
		padding: "5px 2.5px",
		margin: "2.5px",
	};
	return (
		<div
			className="d-flex flex-column justify-content-between"
			style={
				isAssigned
					? { ...cardStyle, background: "rgba(90, 186, 255, 0.1)" }
					: cardStyle
			}
		>
			<div className="d-flex justify-content-between font-12">
				<LongTextTooltip text={license.license_name} maxWidth="155px" />
				<div>
					{kFormatter(
						license.cost_per_item?.amount_org_currency ||
							license.cost_per_license?.amount_org_currency ||
							0
					)}{" "}
					{`${getLicenseTermText(
						license,
						license.cost_per_license || license.cost_per_item,
						false,
						true,
						true
					)}`}
				</div>
			</div>
			<div className="d-flex justify-content-between font-9">
				<div>{`Auto Increment: ${
					license.auto_increment ? "ON" : "OFF"
				}`}</div>
				<div>{`${license.mapped_license_count}/${license.total_license_available} Licenses Used`}</div>
			</div>
		</div>
	);
}
