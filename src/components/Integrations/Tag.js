import React from "react";
import PropTypes from "prop-types";
import dot from "../../assets/integrations/tagdot.svg";

export function IntegrationTag(props) {
	return (
		<span
			className="d-flex flex-row align-items-center"
			style={{
				height: 24,
				backgroundColor: "rgba(90,186,255,0.1)",
				padding: "4px 0px 4px 10px",
				marginRight: 12,
				marginBottom: 8,
				borderRadius: "4px",
			}}
		>
			<img src={dot} style={{ margin: "9.5px 0 9.5px 0" }} />
			<span
				style={{
					margin: "4px 10px 4px 9px",
					fontSize: "13px",
					color: "rgba(90,186,255,1)",
				}}
			>
				{props.text}
			</span>
		</span>
	);
}

IntegrationTag.propTypes = {
	text: PropTypes.string,
};
