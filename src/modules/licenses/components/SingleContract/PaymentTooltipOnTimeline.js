import React from "react";
import { UTCDateFormatter } from "utils/DateUtility";

export const PaymentTooltipOnTimeline = ({ data, date }) => {
	return (
		<div
			className="spendcost__tooltip__content"
			style={{
				width: "135px",
				height: new Date(date) < new Date() ? "43px" : "43px",
			}}
		>
			<div className="font-10 o-5">
				{new Date(date) < new Date()
					? "Past Payment"
					: "Upcoming Payment"}
			</div>
			<div className="font-10">{UTCDateFormatter(date)}</div>
		</div>
	);
};
