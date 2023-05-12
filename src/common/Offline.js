import React from "react";
import offline from "../assets/offline.svg";

export function Offline() {
	return (
		<div className="d-flex justify-content-center align-items-center flex-column">
			<img src={offline} width={264} style={{ marginBottom: 14 }} />
			<div
				style={{
					fontSize: 26,
					fontWeight: 700,
					lineHeight: "32.76px",
					marginBottom: 48,
				}}
			>
				You seem to be offline
			</div>
			<button className="ov__button2" style={{ width: 230 }}>
				Try again
			</button>
		</div>
	);
}
