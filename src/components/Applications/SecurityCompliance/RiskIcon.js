import React, { useEffect, useState } from "react";
import lowRisk from "../../../assets/low_risk.svg";
import mediumRisk from "../../../assets/medium_risk.svg";
import highRisk from "../../../assets/high_risk.svg";
import _ from "underscore";

function RiskIcon(props) {
	const [icon, setIcon] = useState("");
	const [label, setLabel] = useState("");

	const getRiskImageAndLabel = (value) => {
		let tempIcon = "";
		let tempLabel = "";
		if (value <= 2) {
			tempIcon = lowRisk;
			tempLabel = "Low";
		} else if (value === 3) {
			tempIcon = mediumRisk;
			tempLabel = "Medium";
		} else if (value >= 4) {
			tempIcon = highRisk;
			tempLabel = "High";
		}
		setIcon(tempIcon);
		setLabel(tempLabel);
	};

	useEffect(() => {
		if (!isNaN(props.riskValue)) {
			getRiskImageAndLabel(props.riskValue);
		}
	}, [props.riskValue]);

	return (
		<>
			{!isNaN(props.riskValue) ? (
				<div key={label} className="d-flex align-items-center">
					<img
						className="mt-auto mb-auto mr-1"
						src={icon}
						width={props.width || 12}
						height={props.height || 12}
					/>
					{props.showLable && label && (
						<div className="text-capitalize font-13">{label}</div>
					)}
				</div>
			) : (
				<div
					className={`grey-1 o-6 ${props.className || "font-13"}`}
					style={props.dataUnavailableStyle}
				>
					data unavailable
				</div>
			)}
		</>
	);
}

export default RiskIcon;
