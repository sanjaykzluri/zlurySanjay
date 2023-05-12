import React, { Fragment } from "react";
import ContentLoader from "react-content-loader";
import "./DottedRisk.css";
import { riskStatuses } from "./RiskConstants";

export const getRiskStatus = (riskNumber) => {
	if (riskNumber <= 2) {
		return "low";
	} else if (riskNumber === 3) {
		return "medium";
	} else if (riskNumber >= 4) {
		return "high";
	}
};

const Dots = (props) => (
	<div
		className="dotRisk__dot"
		style={{ background: props.color, ...props.style }}
	></div>
);

const getRiskColor = (riskNumber) => {
	if (riskNumber <= 2) {
		return riskStatuses.LOW;
	} else if (riskNumber === 3) {
		return riskStatuses.MEDIUM;
	} else if (riskNumber >= 4) {
		return riskStatuses.HIGH;
	}
};

export function DottedRisk(props) {
	const dotColor = props.normal
		? riskStatuses.NORMAL
		: getRiskColor(props.value || 0);
	const defaultColor = "#DDDDDD";
	const small = {
		height: "14.8px",
		width: "9px",
	};
	const large = {
		height: "12px",
		width: "21px",
	};

	const isSmall = props.size === "sm";

	return (
		<>
			<div
				className="dotRisk__cont"
				style={isSmall ? { width: "60px" } : { width: "116" }}
			>
				{props.loading ? (
					<ContentLoader height={30} y={5}>
						<rect width="20" rx="5" height="10" x="0" />
						<rect width="20" rx="5" height="10" x="25" />
						<rect width="20" rx="5" height="10" x="50" />
						<rect width="20" rx="5" height="10" x="75" />
						<rect width="20" rx="5" height="10" x="100" />
					</ContentLoader>
				) : (
					<Fragment>
						<Dots
							color={props.value > 0 ? dotColor : defaultColor}
							style={isSmall ? small : large}
						></Dots>
						<Dots
							color={props.value > 1 ? dotColor : defaultColor}
							style={isSmall ? small : large}
						></Dots>
						<Dots
							color={props.value > 2 ? dotColor : defaultColor}
							style={isSmall ? small : large}
						></Dots>
						<Dots
							color={props.value > 3 ? dotColor : defaultColor}
							style={isSmall ? small : large}
						></Dots>
						<Dots
							color={props.value > 4 ? dotColor : defaultColor}
							style={isSmall ? small : large}
						></Dots>
					</Fragment>
				)}
			</div>
		</>
	);
}
