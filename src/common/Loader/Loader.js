import React from "react";
import PropTypes from "prop-types";
import Lottie from "react-lottie";
import animationData from "../../assets/loader.json";

export function Loader(props) {
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

Loader.propTypes = {
	width: PropTypes.number,
	height: PropTypes.number,
};
