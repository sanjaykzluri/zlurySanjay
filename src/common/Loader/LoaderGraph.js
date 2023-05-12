import React from "react";
import PropTypes from "prop-types";
import Lottie from "react-lottie";
import animationData from "../../assets/loadergraph.json";

export function LoaderGraph(props) {
	const defaultOptions = {
		loop: true,
		autoplay: true,
		animationData: animationData,
		rendererSettings: {
			preserveAspectRatio: "xMidYMid slice",
		},
	};
	return (
		<Lottie
			isClickToPauseDisabled
			options={defaultOptions}
			height={props.height || 600}
			width={props.width || 400}
		/>
	);
}

LoaderGraph.propTypes = {
	width: PropTypes.number,
	height: PropTypes.number,
};
