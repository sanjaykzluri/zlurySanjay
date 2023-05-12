import React from "react";
import PropTypes from "prop-types";

const BADGE_VARIANTS = {
	SQUARE: "square",
	ROUND: "round",
};

const getStyleForVariant = (variant) => {
	switch (variant) {
		case BADGE_VARIANTS.SQUARE:
			return {};

		case BADGE_VARIANTS.ROUND:
		default:
			return {
				borderRadius: "50%",
			};
	}
};

export function NameBadge(props) {
	if (!props.name) return <></>;

	let stringArr = props.name.trim().split(" ");
	let initials = "";
	let i = 0;
	const fontSize = props.fontSize || props.width ? props.width / 2 : null;

	while (i < 2 && !!stringArr[i]) {
		initials += stringArr[i][0];
		i++;
	}

	let style = {
		width: props.width,
		height: props.width,
		fontSize: fontSize,
		backgroundColor: "#DDD",
		color: "#323232",
		fontWeight: 400,
		flexShrink: 0,
		borderRadius: props.borderRadius,
		...getStyleForVariant(props.variant),
	};

	return (
		<div
			className={
				"d-flex align-items-center justify-content-center " +
				props.className
			}
			style={style}
		>
			{initials.toUpperCase()}
		</div>
	);
}
