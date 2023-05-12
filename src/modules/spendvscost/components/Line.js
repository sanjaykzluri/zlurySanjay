import React from "react";

export const Line = ({ left, color, month_name }) => {
	return (
		<div
			className="line__text__stackedbar__cont"
			style={{ left: `${left}px` }}
		>
			<div className="line__stackedbar" />
			<div
				className="line__text__horbarstack__cont__text bold-600"
				style={{ color: color }}
			>
				{month_name}
			</div>
		</div>
	);
};
