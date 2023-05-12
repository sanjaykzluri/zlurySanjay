import React, { useState } from "react";
import { Modal } from "../../UIComponents/Modal/Modal";
import restricted from "../../assets/restricted.png";
import "./styles.css";
import { Button } from "../../UIComponents/Button/Button";
import { ENTITIES } from "../../constants";
import UpgradeButton from "./UpgradeButton";

const entityMetadata = {
	[ENTITIES.APPLICATIONS]: {
		title:
			"View & track all application's users, usage & spend at one place.",
	},
	[ENTITIES.USERS]: {
		title: "View & track all users application usage & spend at one place.",
	},
	[ENTITIES.DEPARTMENT]: {
		title: "View & track all department's budget at one place."
	},
	[ENTITIES.PAYMENT]: {
		title: "Assign payment methods to transactions to keep track of spends accurately."
	},
	[ENTITIES.CUSTOM_FIELDS]: {
		title: "Add custom fields to add & track additional attributes to your app metadata."
	},
	[ENTITIES.EXPORT_CSV]: {
		title: "Export all your app data into csv to analyse."
	},
	[ENTITIES.ASSIGN_PAYMENT]: {
		title: "Assign payment methods to transactions to keep track of spends accurately."
	},
	[ENTITIES.ASSIGN_APPLICATION]: {
		title: "Assign transactions to applications to get track spends accurately."
	},
	[ENTITIES.INTEGRATIONS]: {
		title: "Add direct integrations to your apps to get meaningful usage metrics."
	},
};

function UpgradeModal({ closeModal, entity }) {
	return (
		<Modal
			show
			style={{
				background:
					"linear-gradient(215.58deg, #2266E2 -16.01%, #5ABAFF 106.14%)",
				borderRadius: "6px",
				height: "57vh",
				width: "52vw",
			}}
			onClose={() => {
				closeModal();
			}}
			size="md"
		>
			<div className="upgrade__modal__wrapper">
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
				<UpgradeButton closeModal={closeModal} />
			</div>
		</Modal>
	);
}

export default UpgradeModal;
