import React from "react";
import beta from "assets/icons/beta.svg";
import { betaTypes } from "./BetaConstants";

export default function BetaTag({
	betaType = betaTypes.PUBLIC,
	style = {},
	message = null,
}) {
	return (
		<div style={{ ...style }}>
			<div
				style={{
					background: "#FFF7F0",
					border: "1px solid #FFB169",
				}}
				className="d-flex border-radius-4 mt-3 mb-2 p-2 w-100 justify-content-center"
			>
				<img className="mr-2" src={beta} width={26} />
				<p className="font-16 grey mb-0">
					{message ||
						`You’re accessing a beta version of this feature, more updates are coming shortly. We welcome feedback and suggestions, if you have any please reach out to us at support@zluri.com.`}
				</p>
			</div>
		</div>
	);
}
