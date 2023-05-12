import React, { useState } from "react";
import { OverlayTrigger } from "react-bootstrap";

export default function OverlayTooltip({ isStickyTooltip, ...props }) {
	const [show, setShow] = useState(false);
	const handleMouseEnter = () => {
		isStickyTooltip && setShow(true);
		isStickyTooltip &&
			props.setTooltipArrowShow &&
			props.setTooltipArrowShow(true);
	};
	const handleMouseLeave = () => {
		isStickyTooltip && setShow(false);
		isStickyTooltip &&
			props.setTooltipArrowShow &&
			props.setTooltipArrowShow(false);
	};
	return (
		<OverlayTrigger
			{...props}
			overlay={
				<div
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					{props.overlay}
				</div>
			}
			delay={500}
			show={isStickyTooltip ? show : undefined}
		>
			<div
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{props.children}
			</div>
		</OverlayTrigger>
	);
}
