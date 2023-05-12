import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function LongTextTooltip({
	text,
	maxWidth = "10vw",
	placement = "top",
	style = {},
	onClick,
}) {
	return (
		<OverlayTrigger
			placement={placement}
			overlay={<Tooltip>{text}</Tooltip>}
		>
			<div
				style={{
					maxWidth: maxWidth,
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
					...style,
				}}
				onClick={() => onClick && onClick()}
			>
				{text}
			</div>
		</OverlayTrigger>
	);
}
