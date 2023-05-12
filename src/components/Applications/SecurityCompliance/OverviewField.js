import React from "react";
import "./styles.css";
export default function OverviewField({
	label,
	value,
	className,
	dataUnavailable,
	valueClassName,
	keyClassName,
	hidden = false,
}) {
	return !hidden ? (
		<div className={`securityoverview__item ${className}`}>
			<div className={`securityoverview__item-name ${keyClassName}`}>
				{label}
			</div>

			<div className={`securityoverview__item-rate ${valueClassName}`}>
				{dataUnavailable ? (
					<div className="grey-1 font-12 value o-5">
						Data Unavailable
					</div>
				) : (
					value
				)}
			</div>
		</div>
	) : null;
}
