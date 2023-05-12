export const downgradeorremoveLicenseOptions = [
	{
		label: "Immediately",
		value: "immediately",
	},
	{
		label: "On next payment date",
		value: "on_next_payment_date",
	},
	{
		label: "On contract cancel by date",
		value: "on_contract_cancel_date",
	},
	{
		label: "On renewal date",
		value: "on_renewal_date",
	},
];
export const licenseReturnoptions = [
	{
		value: "remove_license",
		label: "Remove License",
	},
	{
		value: "downgrade_license",
		label: " Downgrade License",
	},
	{ value: "donothing", label: "Do Nothing" },
];

export const onNoResponseOptions = [
	{
		value: "donothing",
		label: "Do nothing",
	},
	{
		value: "send_reminder_email",
		label: "Send reminder email every 24 hours",
	},
];
export const keepLicenseOptions = [
	...licenseReturnoptions,
	{ value: "manual_approval", label: "Require manual Approval" },
];

export const manualApprovalOptions = [
	{
		label: "App Owner",
		value: "app_owner",
	},
	{
		label: "IT owner",
		value: "IT_owner",
	},
	{
		label: "Finance Owner",
		value: "Finance_owner",
	},
	{
		label: "Department head",
		value: "Department_head",
	},
	{
		label: "Procurement admin",
		value: "Procurement_admin",
	},
	{
		label: "HR admin",
		value: "HR_admin",
	},
	{
		label: "Finance Admin",
		value: "Finance_admin",
	},
	{
		label: "Owner",
		value: "owner",
	},
];

export const onApprovalOptions = [
	{
		label: "Do nothing",
		value: "donothing",
	},
	{
		label: "Select Playbook",
		value: "select_playbook",
	},
];
