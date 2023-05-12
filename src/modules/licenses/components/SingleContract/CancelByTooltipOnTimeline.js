import React from "react";
import { UTCDateFormatter } from "utils/DateUtility";

export const CancelByTooltipOnTimeline = ({ data }) => {
	return (
		<div
			className="spendcost__tooltip__content"
			style={{ width: "160px", height: "43px" }}
		>
			<div className="font-10 o-5">Renew/Cancel Contract by</div>
			<div className="font-10">{UTCDateFormatter(data?.cancel_by)}</div>
		</div>
	);
};
