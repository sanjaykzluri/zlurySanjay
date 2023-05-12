import React from "react";
import { useHistory } from "react-router";
import { Button } from "../../UIComponents/Button/Button";
import "./styles.css";

function UpgradeButton({ closeModal }) {
	const history = useHistory();
	return (
		<Button
			className="upgrade__modal__button"
			onClick={() => {
				closeModal && closeModal();
				history.push("/settings/billing");
			}}
		>
			UPGRADE
		</Button>
	);
}

export default UpgradeButton;
