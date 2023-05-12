import React from "react";
import PropTypes from "prop-types";
import NoResultsFoundSVG from "../../../../assets/icons/empty.svg";
import overview from "../../../../assets/workflow/empty-workflow.png";

export function Empty(props) {
	let renderChildren = props.children;
	if (props.showErrorModal) {
		renderChildren = "Oops! Something went wrong";
	}
	return (
		<div
			style={{
				height: "75%",
				margin: "auto",
				minHeight: props.minHeight,
			}}
			className="d-flex flex-column justify-content-center align-items-center"
		>
			<img
				className=" mb-2"
				src={props.empty ? NoResultsFoundSVG : overview}
				width={200}
			/>
			<div className="empty-header">{renderChildren}</div>
		</div>
	);
}

Empty.propTypes = {
	showErrorModal: PropTypes.bool,
};

Empty.defaultProps = {
	showErrorModal: false,
};
