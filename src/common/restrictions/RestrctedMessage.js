import React from "react";
import restricted from "../../assets/restricted.png";
import "./styles.css";
import { Button } from "../../UIComponents/Button/Button";
import { ENTITIES } from "../../constants";
import UpgradeButton from "./UpgradeButton";

const entityMetadata = {
	[ENTITIES.INTEGRATIONS] : {
		title: "Add direct integrations to your apps to get meaningful usage metrics."
	},
	[ENTITIES.CONTRACTS] : {
		title: "Manage all your contracts at one place."
	},
	[ENTITIES.RENEWALS] : {
		title: "Manage all your app renewals at one place."
	},
	[ENTITIES.ADMINISTRATION] : {
		title: "Invite & add other admins to your workspace."
	},
	[ENTITIES.CUSTOM_FIELDS] : {
		title: "Add custom fields to add & track additional attributes to your app metadata."
	},
	[ENTITIES.USER_APPS] : {
		title: "View detailed usage statistics on all the applications used by the user."
	},
	[ENTITIES.APPLICATION_USERS] : {
		title: "View the list of users using the application."
	},
	[ENTITIES.APPLICATION_CONTRACTS] : {
		title: "View & manage all contracts of the application at one place."
	},
	[ENTITIES.APPLICATION_TRANSACTIONS] : {
		title: "View & Add transactions to the application."
	},
	[ENTITIES.APPLICATION_RECOMMANDATIONS] : {
		title: "Get timely insights & recommendations to optimize usage."
	},
	[ENTITIES.DEPARTMENT_APPLICATIONS] : {
		title: "Manage all the applications used by the users in the department at one place."
	},
	[ENTITIES.DEPARTMENT_USERS] : {
		title: "View & manage all the users of the departments at one place."
	},

	
}

function RestrictedMessage({ entity }) {
	return (
		<div className="restricted__message">
			<div>
				<img src={restricted} />
			</div>
			<div className="upgrade__modal__title">
				{entityMetadata[entity]?.title}
			</div>
			<div className="upgrade__modal__description">
				All the premium features are locked. Upgrade now to continue
				using your favourite features
			</div>
			<UpgradeButton />
		</div>
	);
}

export default RestrictedMessage;
