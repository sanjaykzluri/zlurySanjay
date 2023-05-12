import React from "react";
import Add from "assets/add.svg";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import AddAppUsersViaCSV from "modules/licenses/components/LicenseMapper/AddAppUsersViaCSV/AddAppUsersViaCSV";

export default function AppUsersAddComp({ openForm, appId, onSuccess }) {
	const options = [
		{
			comp: (
				<div
					onClick={openForm}
					className="w-100 h-100 horizontal_padding_16"
					style={{ padding: "0 16px !important" }}
				>
					Add a single user
				</div>
			),
		},
		{
			comp: (
				<AddAppUsersViaCSV
					appId={appId}
					onSuccess={onSuccess}
					className="w-100 h-100 horizontal_padding_16"
					style={{ padding: "0 16px !important" }}
				>
					Bulk Upload
				</AddAppUsersViaCSV>
			),
		},
	];

	return (
		<Dropdown
			toggler={
				<div className="appsad mr-3">
					<img src={Add} />
					<span id="te">Add</span>
				</div>
			}
			options={options}
			optionFormatter={(option) => option.comp}
			dropdownWidth="auto"
			menuStyle={{ width: "max-content" }}
			right={15}
			optionClassName="dropdown_options cursor-pointer p-0"
		/>
	);
}
