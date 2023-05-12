import moment from "moment";
import React from "react";
import { timeSince } from "../../../utils/DateUtility";
import { DayProgressBar } from "../AllApps/Contracts/ContractsTable";

export function LicenseEndDateTooltip(props) {
	const { start, end } = props;
	let timeLeft = "Time elapsed";
	if (new Date() < new Date(end)) {
		timeLeft = timeSince(end);
	}
	return (
		<div className="p-3 license-end-date-tooltip-content">
			<div
				className="d-flex flex-row align-items-center p-0"
				style={{ height: "30px" }}
			>
				<div className="d-flex flex-column">
					<div className="font-10 grey-1 o-6">Start Date</div>
					<div className="font-13">
						{moment(start).format("DD MMM YYYY")}
					</div>
				</div>
				<div className="d-flex flex-column ml-2 mr-2 pt-3">
					<hr style={{ width: "24px" }} />
				</div>
				<div className="d-flex flex-column">
					<div className="font-10 grey-1 o-6 pt-3">
						{timeLeft === "Time elapsed"
							? "Time Elapsed"
							: timeLeft + " left"}
					</div>
				</div>
				<div className="d-flex flex-column ml-2 mr-2 pt-3">
					<hr style={{ width: "24px" }} />
				</div>
				<div className="d-flex flex-column">
					<div className="font-10 grey-1 o-6">End Date</div>
					<div className="font-13">
						{moment(end).format("DD MMM YYYY")}
					</div>
				</div>
			</div>
			<DayProgressBar width={"100%"} start={start} end={end} />
		</div>
	);
}
