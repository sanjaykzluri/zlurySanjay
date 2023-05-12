import React, { useState } from "react";
import Slider from "react-slick";
import right from "assets/icons/circle-arrow-right.svg";
import left from "assets/icons/arrow-button-circle-left.svg";
import { Button } from "UIComponents/Button/Button";
import "./Slider.css";

export default function CustomSlider({
	renderComp,
	data = [],
	style,
	arrows = false,
	infinite = false,
	autoplay = false,
	variableWidth = true,
	showNextButton = false,
	maxWidth,
	draggable = false,
	nextButton = <img src={right} />,
	prevButton = <img src={left} />,
	showPrevButton = true,
	slidesToScroll,
}) {
	const [nav, setNav] = useState(null);
	let slider = [];
	const slideNext = () => {
		slider.slickNext();
	};
	const slidePrev = () => {
		slider.slickPrev();
	};

	return (
		<div
			className="position-relative"
			style={{ maxWidth: maxWidth || "98%" }}
		>
			<Slider
				arrows={arrows}
				asNavFor={nav}
				infinite={infinite}
				autoplay={autoplay}
				variableWidth={variableWidth}
				ref={(c) => (slider = c)}
				draggable={draggable}
				nextArrow={showNextButton && nextButton}
				prevArrow={showPrevButton && prevButton}
				slidesToScroll={slidesToScroll}
			>
				{Array.isArray(data) &&
					data.map((el, index) => renderComp(el, index))}
			</Slider>
		</div>
	);
}
