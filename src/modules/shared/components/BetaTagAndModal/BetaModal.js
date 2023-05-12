import React, { useState } from "react";
import { Button } from "UIComponents/Button/Button";
import { Modal } from "UIComponents/Modal/Modal";
import { betaTypes } from "./BetaConstants";
import beta from "assets/icons/beta.svg";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

export default function BetaModal({
	betaType = betaTypes.PUBLIC,
	feature = "Optimization",
}) {
	const [show, setShow] = useState(true);
	const { partner } = useContext(RoleContext);
	return (
		<Modal show={show} onClose={() => setShow(false)} size="md">
			<div className="p-6 text-center">
				<img alt="" src={beta} width="57" className="mb-3 mx-auto" />
				<h3 className="bold-600 font-22 black mb-0">
					{feature} by {partner?.name}
				</h3>
				<p className="bg-red white bold-600 font-8 d-inline-block mx-auto mb-5 p-1 border-radius-4">
					{betaType.toUpperCase()} BETA
				</p>
				<p className="grey font-16 mb-6">
					You’re accessing a beta version of this feature, more
					updates are coming shortly. We welcome feedback and
					suggestions, if you have any please reach out to us at
					support@zluri.com.
				</p>

				<Button className="text-center" onClick={() => setShow(false)}>
					Agree & Continue
				</Button>
			</div>
		</Modal>
	);
}
