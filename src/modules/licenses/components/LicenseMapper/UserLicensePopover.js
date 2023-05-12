import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import React from "react";
import { Form } from "react-bootstrap";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";
import { Popover } from "UIComponents/Popover/Popover";
import close from "assets/close.svg";
import { useDispatch } from "react-redux";
import { updateFewLicenseMapperUsers } from "./LicenseMapper-action";

export default function UserLicensePopover({
	show,
	handleClose,
	userLicenseRef,
	license,
	licenseIndex,
	user,
}) {
	const dispatch = useDispatch();

	const handleUserAppLicenseEdit = (key, value) => {
		if (typeof value === "string") {
			value = value?.trimStart();
		}
		user.contracts[licenseIndex][key] = value;

		dispatch(updateFewLicenseMapperUsers({ data: [{ ...user }] }));
	};

	return (
		<Popover
			refs={[userLicenseRef]}
			show={show}
			align="center"
			className="user_license_popover"
		>
			<div className="d-flex align-items-center justify-content-between">
				<div className="d-flex flex-column">
					<div className="d-flex">
						<div className="mr-1">Edit</div>
						<LongTextTooltip
							maxWidth="240px"
							text={license.license_name}
						/>
					</div>
					<div className="d-flex mt-1 mb-1">
						<div className="mr-1">details for</div>
						<LongTextTooltip
							maxWidth="230px"
							text={user.user_name}
						/>
					</div>
				</div>
				<img
					className="cursor-pointer"
					alt="Close"
					onClick={(e) => handleClose(e)}
					src={close}
				/>
			</div>

			<hr className="m-0" />
			<div className="d-flex align-items-center justify-content-between mt-1">
				<div>Start Date</div>
				<NewDatePicker
					key={`${license.license_assigned_on}`}
					placeholder="Assigned on"
					onChange={(date) =>
						handleUserAppLicenseEdit("license_assigned_on", date)
					}
					calendarClassName="rangefilter-calendar"
					calendarContainerClassName="schedule-date-calendar"
					style={{ width: "170px" }}
					value={license.license_assigned_on}
				/>
			</div>
			<div className="d-flex align-items-center justify-content-between mt-1">
				<div>End Date</div>
				<NewDatePicker
					key={`${license.license_unassigned_on}`}
					placeholder="Unassign on"
					onChange={(date) =>
						handleUserAppLicenseEdit("license_unassigned_on", date)
					}
					calendarClassName="rangefilter-calendar"
					calendarContainerClassName="schedule-date-calendar"
					style={{ width: "170px" }}
					value={license.license_unassigned_on}
				/>
			</div>
			<div className="d-flex align-items-center justify-content-between mt-1">
				<div>Role</div>
				<Form.Control
					value={license.role}
					onChange={(e) =>
						handleUserAppLicenseEdit("role", e.target.value)
					}
					placeholder="Role"
					bsPrefix="user_license_popover_role form-control"
				/>
			</div>
		</Popover>
	);
}
