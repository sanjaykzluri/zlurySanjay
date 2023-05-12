import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../UIComponents/Button/Button";
import { store } from "../../utils/store";
import { hideGettingStartedModal } from "./redux";
import AddOrgIcon from "../../assets/getting_started/add_org.svg";
import AddAppIcon from "../../assets/getting_started/add_application.svg";
import AddTransactionIcon from "../../assets/getting_started/add_transaction.svg";
import AddUserIcon from "../../assets/getting_started/add_users.svg";
import AddDepartmentIcon from "../../assets/getting_started/add_dept.svg";
import AddAdmin from "../../assets/getting_started/add_admin.svg";
import AddRenewalIcon from "../../assets/getting_started/add_org.svg";
import AddContractIcon from "../../assets/getting_started/add_contract.svg";
import AddCustomIcon from "../../assets/getting_started/add_custom.svg";
import AuthorizationIcon from "../../assets/getting_started/authorization.svg";
import AddOwnerIcon from "../../assets/getting_started/add_owner.svg";
import AddNotesIcon from "../../assets/getting_started/add_note.svg";
import AddPaymentIcon from "../../assets/getting_started/add_payment.svg";
import AddIntegrationIcon from "../../assets/getting_started/add_payment.svg";
import EditDepartmentBudgetIcon from "../../assets/getting_started/edit_dept.svg";
import AssignAppIcon from "../../assets/getting_started/assign_app.svg";
import HelpIcon from "../../assets/getting_started/question-help.svg";

import { getValueFromLocalStorage } from "utils/localStorage";

const hideModal = () => store.dispatch(hideGettingStartedModal());
const partner = getValueFromLocalStorage("partner");

const config = {
	workspace: {
		title: "Setup your Workplace",
		items: [
			{
				title: "Add Organization details",
				icon: AddOrgIcon,
				key: "add_org_status",
				rightText: "2 mins to read",
				description:
					"Please follow the below steps to add/edit your organization details.",
				steps: [
					"Navigate to the 'Settings->General' tab",
					"Change your organization name & click 'Save'",
				],
				timeToComplete: "1 min to complete",
				button: (
					<Link to="/settings/general">
						<Button className="mt-3" onClick={hideModal}>
							Add Organization details
						</Button>
					</Link>
				),
			},
			{
				title: "Add Applications",
				icon: AddAppIcon,
				key: "add_applications_status",
				rightText: "2 mins to read",
				description:
					"You may add applications to workspace through any of the below methods.",
				steps: [
					// eslint-disable-next-line react/jsx-key
					<span>
						Add an application manually in &lsquo;All
						Applications&lsquo; screen.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/collections/2823422-applications"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</span>,
					"Change your organization name & click 'Save'",
				],
				timeToComplete: "2 mins to complete",
				button: (
					<Link to="/applications#allapps">
						<Button className="mt-3" onClick={hideModal}>
							Add Application
						</Button>
					</Link>
				),
			},
			{
				title: "Add Transactions",
				icon: AddTransactionIcon,
				key: "add_transactions_status",
				rightText: "3 mins to read",
				description: `You may add transactions into your ${partner?.name} workspace by any of the below methods.`,
				steps: [
					// eslint-disable-next-line react/jsx-key
					<div>
						Add an transaction manually for any App from
						'Applications-{">"}Transactions' screen{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/articles/5016094-applications"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</div>,
					// eslint-disable-next-line react/jsx-key
					<div>
						Integration with your finanicial system.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/collections/2823482-integrations"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</div>,
					// eslint-disable-next-line react/jsx-key
					<div>
						Upload a csv file containing the transactions in the
						specified format from 'Applications->Uploads' screen.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/articles/5016174-uploads"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</div>,
				],
				timeToComplete: "3 mins to complete",
				button: (
					<Link to="/transactions#uploads">
						<Button className="mt-3" onClick={hideModal}>
							Upload Transaction
						</Button>
					</Link>
				),
			},
			{
				title: "Add Users",
				icon: AddUserIcon,
				key: "add_users_status",
				rightText: "2 mins to read",
				description: `You may add users into your ${partner?.name} workspace through any of the below methods.  3: Add users using any particular app through a direct integration with the application through Integration screen: https://help.zluri.com/en/collections/2823482-integrations`,
				steps: [
					// eslint-disable-next-line react/jsx-key
					<div>
						Add an user manually by clicking the '+Add' button in
						'All Users' screen.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/articles/5016109-users"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</div>,
					// eslint-disable-next-line react/jsx-key
					<div>
						Add all users in your organization through your Single
						Sign On Solution integration.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/collections/2823482-integrations"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</div>,
					// eslint-disable-next-line react/jsx-key
					<div>
						Add users using any particular app through a direct
						integration with the application through Integration
						screen.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/collections/2823482-integrations"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</div>,
				],
				timeToComplete: "3 mins to complete",
				button: (
					<Link to="/users">
						<Button className="mt-3" onClick={hideModal}>
							Add Users
						</Button>
					</Link>
				),
			},
			{
				title: "Add Departments",
				icon: AddDepartmentIcon,
				key: "add_departments_status",
				rightText: "1 min to read",
				description: `You may add departments to your ${partner?.name} workspace in any of below methods.`,
				steps: [
					// eslint-disable-next-line react/jsx-key
					<div>
						Add a department manually by clicking '+ Add' button in
						'Departments' Screen.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/articles/5016115-departments"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</div>,
					// eslint-disable-next-line react/jsx-key
					<div>
						Add all departments at once through your single sign on
						system integration.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/collections/2823482-integrations"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</div>,
				],
				timeToComplete: "2 mins to complete",
				button: (
					<Link to="/departments">
						<Button className="mt-3" onClick={hideModal}>
							Add a department
						</Button>
					</Link>
				),
			},
			{
				title: "Add Admin",
				icon: AddAdmin,
				key: "add_admin_status",
				rightText: "1 min to read",
				description: `You may add/invite other admins to your ${partner?.name} workspace by following the below steps.`,
				steps: [
					// eslint-disable-next-line react/jsx-key
					"Please navigate to 'Settings->Administration' tab.",
					// eslint-disable-next-line react/jsx-key
					"Click the '+Add' button.",
					<div>
						Type in the name, Select permission level & click 'Send
						Invite'.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/articles/5016179-settings"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</div>,
				],
				timeToComplete: "2 mins to complete",
				button: (
					<Link to="/settings/administration">
						<Button className="mt-3" onClick={hideModal}>
							Add Admin
						</Button>
					</Link>
				),
			},
		],
	},
	add_more_details: {
		title: "Adding more details",
		items: [
			{
				title: "Add renewal (add reminder)",
				icon: AddRenewalIcon,
				key: "add_renewal_status",
				rightText: "2 mins to read",
				description:
					"You may follow the below steps to add an renewal to any application.",
				steps: [
					"Please navigate to the application overview screen.",
					"Click 'Add Renewal', Select the date, Renewal frequency, Upcoming renewal date & Click 'Save'",
					"You may click the 'Set Reminder' option below the renewal date to set the reminder .",
				],
				timeToComplete: "1 min to complete",
				button: (
					<Link to="/applications">
						<Button className="mt-3" onClick={hideModal}>
							Add Renewals
						</Button>
					</Link>
				),
			},
			{
				title: "Add Contract licenses",
				icon: AddContractIcon,
				key: "add_contract_licenses_status",
				rightText: "2 mins to read",
				description:
					"You may follow the below steps to add a contract license.",
				steps: [
					"Please navigate to 'Applications->Contracts' tab.",
					"Click '+Add' button",
					"Fill in all mandatory fields like contract name, application name etc.",
					"Click save.",
				],
				timeToComplete: "1 min to complete",
				button: (
					<Link to="/licenses#allContracts">
						<Button className="mt-3" onClick={hideModal}>
							Add Contracts
						</Button>
					</Link>
				),
			},
			{
				title: "Add a custom field",
				icon: AddCustomIcon,
				key: "add_custom_field_status",
				rightText: "2 mins to read",
				description:
					"You may follow the below steps to add a custom field.",
				steps: [
					"Please navigate to the 'Settings->Custom Field' section",
					"Click 'Add new field' under the entitity you wish to add a custom field to. ",
					"Select the field type, name & provide option values (if needed) .",
					// eslint-disable-next-line react/jsx-key
					<span>
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/articles/5291386-custom-fields"
						>
							Add Field
						</a>
					</span>,
				],
				timeToComplete: "1 min to complete",
				button: (
					<Link to="/settings/customfields">
						<Button className="mt-3" onClick={hideModal}>
							Add Custom Fields
						</Button>
					</Link>
				),
			},
			{
				title: "Set app authorization",
				icon: AuthorizationIcon,
				key: "set_app_authorization_status",
				rightText: "2 mins to read",
				description:
					"You may set the authorisation status for any app by following the below steps.",
				steps: [
					"Select the application in all application screen to move to application overview screen.",
					"Click on the authorisation status.",
					"Select the new authorisation status",
				],
				timeToComplete: "1 min to complete",
				button: (
					<Link to="/applications">
						<Button className="mt-3" onClick={hideModal}>
							Set app authorization
						</Button>
					</Link>
				),
			},
			{
				title: "Add Department owner",
				icon: AddOwnerIcon,
				key: "add_dept_owner_status",
				rightText: "2 mins to read",
				description:
					"You may update the department owner/head by the below methods.",
				steps: [
					"Click 'Add Owner' besides the department name in all department screen.",
					// eslint-disable-next-line react/jsx-key
					<span>
						Type in & select the user to be assigned as owner.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/articles/5016115-departments"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</span>,
				],
				timeToComplete: "1 min to complete",
				button: (
					<Link to="/departments">
						<Button className="mt-3" onClick={hideModal}>
							{" "}
							Add Department owner
						</Button>
					</Link>
				),
			},
			{
				title: "Add a note",
				icon: AddNotesIcon,
				key: "add_note_status",
				rightText: "2 mins to read",
				description:
					"You may add notes to applications, users & departments. Please follow the below steps to add a note.",
				steps: [
					"Navigate to application/user/department where you wish to add the Note.",
					"Click 'Add Note' under the section 'Notes'.",
					"Type in the text in the side panel & click 'Save' .",
				],
				timeToComplete: "1 min to complete",
				button: (
					<Link to="/applications">
						<Button className="mt-3" onClick={hideModal}>
							Add a note
						</Button>
					</Link>
				),
			},
			{
				title: "Integrate an application",
				icon: AddIntegrationIcon,
				key: "add_integration_status",
				rightText: "2 mins to read",
				description:
					"Please follow the below steps to connect directly with any application.",
				steps: [
					"Navigate to the 'Integration' page.",
					"Hover on the application you wish to connect & Click on 'Connect App'.",
					"Provide the admin credentials if you have them. Or you can invite your coworker who has the credentials.",
					// eslint-disable-next-line react/jsx-key
					<span>
						Once you or your coworker provides the credentials{" "}
						{partner?.name}
						will connect with the app as per the scopes approved by
						you & sync the data. Please follow our help{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/collections/2823482-integrations "
						>
							articles
						</a>{" "}
						for application specific guides
					</span>,
				],
				timeToComplete: "3 min to complete",
				button: (
					<Link to="/integrations">
						<Button className="mt-3" onClick={hideModal}>
							Add an integration
						</Button>
					</Link>
				),
			},
		],
	},
	track_spends: {
		title: "Track Spends",
		items: [
			{
				title: "Add payment method",
				icon: AddPaymentIcon,
				key: "add_payment_method_status",
				rightText: "2 mins to read",
				description:
					"You may add a payment method by following the below steps.",
				steps: [
					"Navigate to 'Transactions->Payment Methods'",
					"Click '+Add' & Select the the type of payment method.",
					// eslint-disable-next-line react/jsx-key
					<span>
						Fill in the details & click Add.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/articles/5016173-payment-methods"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</span>,
				],
				timeToComplete: "2 min to complete",
				button: (
					<Link to="/transactions#payment-methods">
						<Button className="mt-3" onClick={hideModal}>
							Add a payment method
						</Button>
					</Link>
				),
			},
			{
				title: "Edit department budget",
				icon: EditDepartmentBudgetIcon,
				key: "edit_department_budget_status",
				rightText: "2 mins to read",
				description:
					"You may edit the department budget by following the below steps.",
				steps: [
					"Please navigate to the department overview screen.",
					"Click the quickedit button on the budget.",
					"Enter the new budget.",
					// eslint-disable-next-line react/jsx-key
					<span>
						Save the updated budget.{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/articles/5016115-departments"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</span>,
				],
				timeToComplete: "1 min to complete",
				button: (
					<Link to="/departments">
						<Button className="mt-3" onClick={hideModal}>
							Add budget for departments
						</Button>
					</Link>
				),
			},
			{
				title: "Assign transaction to application",
				icon: AssignAppIcon,
				key: "assign_app_status",
				rightText: "2 mins to read",

				description:
					"You may assign any transaction to an application by following the below steps.",
				steps: [
					"Please navigate to the unrecognized transaction tab.",
					"Select the transaction & click 'Assign App'.",
					"Type in & select the application to which you wish to assign the transaction.",
					"Select the similar transactions if any.",
					// eslint-disable-next-line react/jsx-key
					<span>
						Click Assign App.
						<a
							target="_blank"
							rel="noreferrer"
							href="https://help.zluri.com/en/articles/5016149-unrecognized-transactions"
						>
							<img className="ml-1 mt-1" src={HelpIcon} />
						</a>
					</span>,
				],
				timeToComplete: "1 min to complete",
				button: (
					<Link to="/transactions#unrecognised">
						<Button className="mt-3" onClick={hideModal}>
							Map transactions to applications
						</Button>
					</Link>
				),
			},
		],
	},
};

export default config;
