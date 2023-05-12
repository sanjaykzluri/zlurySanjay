import React from "react";
import moment from "moment";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useEffect } from "react";
import { dateResetTimeZone } from "utils/DateUtility";

export default function CreatedAt(props) {
	const {
		text,
		user_name,
		source,
		rule_name,
		showTime = false,
		showAmPm = false,
		showName = true,
		showUTC = false,
		showAbbr = false,
		showScheduledTime = false,
		scheduledData,
	} = props;

	const localTimeZone = moment.tz.guess();
	const abbr = moment().tz(localTimeZone).zoneAbbr();

	return (
		<div className="flex flex-row align-items-center created-at-component">
			<div className="d-flex flex-column created-at-container">
				<div className="truncate_20vw created-at-date">
					{showUTC ? (
						<>
							{moment(text).format("DD MMM 'YY") ===
							"Invalid date"
								? "N/A"
								: showTime
								? showAmPm
									? moment
											.utc(text)
											.format("DD MMM 'YY, hh:mm A")
									: moment(text)
											.utc(text)
											.format("DD MMM 'YY, HH:mm")
								: moment(text)
										.utc(text)
										.format("DD MMM 'YY")}{" "}
							{showAbbr && abbr ? `${"( " + abbr + " )"}` : ""}
						</>
					) : showScheduledTime && scheduledData ? (
						<>
							{moment(scheduledData?.label_date).format(
								"DD MMM 'YY"
							) === "Invalid date"
								? "N/A"
								: moment
										.utc(scheduledData?.label_date)
										.format("DD MMM 'YY, ")}
							{scheduledData?.time}{" "}
							{showAbbr &&
							scheduledData &&
							scheduledData?.timezone
								? `${
										"( " +
										scheduledData?.timezone?.abbr +
										" )"
								  }`
								: ""}
						</>
					) : (
						<>
							{moment(text).format("DD MMM 'YY") ===
							"Invalid date"
								? "N/A"
								: showTime
								? showAmPm
									? moment(text).format("DD MMM 'YY, hh:mm A")
									: moment(text).format("DD MMM 'YY, HH:mm")
								: moment(text).format("DD MMM 'YY")}{" "}
							{showAbbr && abbr ? `${"( " + abbr + " )"}` : ""}
						</>
					)}
				</div>

				{showName &&
					(source && rule_name ? (
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{rule_name}</Tooltip>}
						>
							<div className="truncate_10vw created-at-user">
								triggered by {rule_name || ""}
							</div>
						</OverlayTrigger>
					) : (
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{user_name}</Tooltip>}
						>
							<div className="truncate_10vw created-at-user">
								by {user_name || "N/A"}
							</div>
						</OverlayTrigger>
					))}
			</div>
		</div>
	);
}
