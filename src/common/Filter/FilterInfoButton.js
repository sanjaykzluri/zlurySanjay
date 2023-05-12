import React from "react";
import PropTypes from "prop-types";
import "./FilterInfoButton.scss";
import cross from "../../assets/common/cross.svg";

export function FilterInfoButton(props) {
	return (
		<span className="filter-div-outer">
			{props.firstText} :{" "}
			<span className="filter-div-active-text">{props.activeText}</span>
			<img
				role="button"
				onClick={props.handleClose}
				src={cross}
				alt="Remove filter"
			/>
		</span>
	);
}

FilterInfoButton.propTypes = {
	firstText: PropTypes.string,
	activeText: PropTypes.string,
	handleClose: PropTypes.func.isRequired,
};

FilterInfoButton.defaultProps = {
	firstText: "Loading...",
	activeText: "Loading...",
	handleClose: () => {},
};
