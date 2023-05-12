import React from "react";

export default function NumberPill({
	number = 1,
	fontColor = "#2266E2",
	fontSize = "12px",
	fontWeight = "600",
	pillBackGround = "rgba(90, 186, 255, 0.1)",
	pillSize = "24px",
	borderRadius = "50%",
	pillHeight,
	pillWidth,
	style,
	onClick,
	className,
}) {
	return (
		<div
			style={{
				background: pillBackGround,
				color: fontColor,
				fontSize: fontSize,
				fontWeight: fontWeight,
				height: pillHeight || pillSize,
				borderRadius: borderRadius,
				minWidth: pillWidth || pillSize,
				...style,
			}}
			onClick={() => onClick && onClick()}
			className={
				className
					? className
					: "d-flex align-items-center justify-content-center"
			}
		>
			{number}
		</div>
	);
}
