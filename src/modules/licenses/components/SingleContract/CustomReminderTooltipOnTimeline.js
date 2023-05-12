import React from "react";
import { UTCDateFormatter } from "utils/DateUtility";

export const CustomReminderTooltipOnTimeline = ({ reminder, isAuto }) => {
	return (
		<div
			className="spendcost__tooltip__content"
			style={{
				width: "160px",
				height: `${isAuto ? "60px" : "53px"}`,
			}}
		>
			<div className="font-10 o-5">
				{isAuto
					? `Auto reminder set for ${reminder.type?.replaceAll(
							"_",
							" "
					  )}`
					: `Reminder set for ${reminder.type?.replaceAll("_", " ")}`}
			</div>
			<div className="font-10">{UTCDateFormatter(reminder.date)}</div>
		</div>
	);
};
