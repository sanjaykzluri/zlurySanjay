import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
	getDateDiff,
	getNthDayBeforeDate,
	UTCDateFormatter,
} from "utils/DateUtility";
import { CancelByTooltipOnTimeline } from "./CancelByTooltipOnTimeline";
import { CustomReminderTooltipOnTimeline } from "./CustomReminderTooltipOnTimeline";
import { PaymentTooltipOnTimeline } from "./PaymentTooltipOnTimeline";
import whiteTick from "assets/licenses/whiteTick.svg";
import NumberPill from "UIComponents/NumberPill/NumberPill";

export function ContractProgressBar({
	height,
	width,
	progress,
	start,
	end,
	cancel_by,
	payment_date_array = [],
	isTooltipRequired,
	data,
}) {
	const [showOnTooltip, setShowOnTooltip] = useState(null);

	const dateTypesOnTimeline = [
		"Payments",
		"Auto Reminders",
		"Cancel Date",
		"Custom Payment Reminders",
		"Custom End Date Reminder",
		"Custom Cancellation Reminders",
	];

	const dateTypeColors = [
		"#2266E2",
		"#FFB26B",
		"#FF6767",
		"#40E395",
		"#6967E0",
		"#FF9AE4",
	];

	const auto_reminders = [
		...[30, 15, 1].map((el) =>
			cancel_by
				? {
						date: getNthDayBeforeDate(el, new Date(cancel_by)),
						type: "cancel_date",
				  }
				: {
						date: getNthDayBeforeDate(el, new Date(end)),
						type: "end_date",
				  }
		),
		{ date: getNthDayBeforeDate(7, new Date(end)), type: "end_date" },
		...[7, 1].map((el) => ({
			date: getNthDayBeforeDate(
				el,
				new Date(payment_date_array[payment_date_array.length - 1])
			),
			type: "next_payment",
		})),
	];

	const contract_time = new Date(end) - new Date(start);

	const xAxis_dates = [0, 1, 2, 3, 4, 5, 6, 7].map((el) =>
		new Date(start).setMilliseconds(
			new Date(start).getMilliseconds() + (contract_time / 7) * el
		)
	);

	let passed_contract_time;

	if (new Date(end) > new Date() && new Date() > new Date(start)) {
		passed_contract_time = new Date() - new Date(start);
	}

	let percentage = (passed_contract_time / contract_time) * 100;

	if (new Date() > new Date(end)) {
		percentage = 100;
	}

	if (new Date() < new Date(start)) {
		percentage = 0;
	}

	const get_date_percentage = (date) => {
		let date_percentage = 0;
		let date_time;
		if (date) {
			date_time = new Date(date) - new Date(start);
			date_percentage = (date_time / contract_time) * 100;
		}
		return date_percentage;
	};

	const payment_date_style = {
		top: "0px",
		width: "3px",
		height: "38px",
		background: "#2266E2",
	};

	const payment_reminder_date_style = {
		top: "0px",
		width: "3px",
		height: "38px",
		background: "#40E395",
	};

	const end_reminder_date_style = {
		top: "0px",
		width: "3px",
		height: "38px",
		background: "#6967E0",
	};

	const cancellation_reminder_date_style = {
		top: "0px",
		width: "3px",
		height: "38px",
		background: "#FF9AE4",
	};

	const xAxis_date_style = {
		top: "0px",
		width: "1px",
		height: "38px",
		background: "#E9EBF2",
	};

	const auto_reminder_date_style = {
		top: "0px",
		width: "3px",
		height: "38px",
		background: "#FFB26B",
	};

	const cancel_by_style = {
		top: "0px",
		width: "3px",
		height: "38px",
		background: "#FF6767",
	};

	const containerStyles = {
		height: height || "6px",
		width: width || "90px",
		backgroundColor: "#e0e0de",
	};

	const fillerStyles = {
		height: "100%",
		width: `${progress || percentage}%`,
		backgroundColor: "#5ABAFF",
	};

	return (
		<>
			{isTooltipRequired ? (
				<OverlayTrigger
					placement="top"
					className="flex flex-row"
					overlay={
						<Tooltip>
							{getDateDiff(end, new Date()) === ""
								? "Time elapsed"
								: `${getDateDiff(end, new Date())} left`}
						</Tooltip>
					}
				>
					<div className="mt-1" style={containerStyles}>
						<div style={fillerStyles}></div>
					</div>
				</OverlayTrigger>
			) : (
				<div className="mt-2 position-relative" style={containerStyles}>
					<div style={fillerStyles} />
					{Array.isArray(xAxis_dates) &&
						xAxis_dates.map((date, index) => (
							<div
								className="position-absolute position-relative"
								style={
									get_date_percentage(date) > 50
										? {
												...xAxis_date_style,
												right: `${
													100 -
													get_date_percentage(date)
												}%`,
										  }
										: {
												...xAxis_date_style,
												left: `${get_date_percentage(
													date
												)}%`,
										  }
								}
							>
								<div
									className="position-absolute timeline-axis-dates"
									style={
										index === xAxis_dates.length - 1
											? { left: "-25px" }
											: index === 0
											? {}
											: { left: "-10px" }
									}
								>
									{UTCDateFormatter(date, "MMM YY")}
								</div>
							</div>
						))}
					{Array.isArray(data?.custom_reminders) &&
						data?.custom_reminders?.map(
							(reminder, index) =>
								reminder.type === "upcoming_payment" &&
								(!showOnTooltip ||
									showOnTooltip === dateTypesOnTimeline[3]) &&
								new Date(reminder?.date) > new Date() &&
								new Date(reminder?.date) < new Date(end) && (
									<OverlayTrigger
										placement="bottom"
										overlay={
											<Tooltip bsPrefix="spendcost__tooltip">
												<CustomReminderTooltipOnTimeline
													reminder={reminder}
												/>
											</Tooltip>
										}
										key={index}
									>
										<div
											className="position-absolute"
											style={
												get_date_percentage(
													reminder.date
												) > 50
													? {
															...payment_reminder_date_style,
															right: `${
																100 -
																get_date_percentage(
																	reminder.date
																)
															}%`,
													  }
													: {
															...payment_reminder_date_style,
															left: `${get_date_percentage(
																reminder.date
															)}%`,
													  }
											}
										/>
									</OverlayTrigger>
								)
						)}

					{Array.isArray(data?.custom_reminders) &&
						data?.custom_reminders?.map(
							(reminder, index) =>
								reminder.type === "end_date" &&
								(!showOnTooltip ||
									showOnTooltip === dateTypesOnTimeline[4]) &&
								new Date(reminder?.date) > new Date() &&
								new Date(reminder?.date) < new Date(end) && (
									<OverlayTrigger
										placement="bottom"
										overlay={
											<Tooltip bsPrefix="spendcost__tooltip">
												<CustomReminderTooltipOnTimeline
													reminder={reminder}
												/>
											</Tooltip>
										}
										key={index}
									>
										<div
											className="position-absolute"
											style={
												get_date_percentage(
													reminder.date
												) > 50
													? {
															...end_reminder_date_style,
															right: `${
																100 -
																get_date_percentage(
																	reminder.date
																)
															}%`,
													  }
													: {
															...end_reminder_date_style,
															left: `${get_date_percentage(
																reminder.date
															)}%`,
													  }
											}
										/>
									</OverlayTrigger>
								)
						)}

					{Array.isArray(data?.custom_reminders) &&
						data?.custom_reminders?.map(
							(reminder, index) =>
								reminder.type === "cancel_by" &&
								(!showOnTooltip ||
									showOnTooltip === dateTypesOnTimeline[5]) &&
								new Date(reminder?.date) > new Date() &&
								new Date(reminder?.date) < new Date(end) && (
									<OverlayTrigger
										placement="bottom"
										overlay={
											<Tooltip bsPrefix="spendcost__tooltip">
												<CustomReminderTooltipOnTimeline
													reminder={reminder}
												/>
											</Tooltip>
										}
										key={index}
									>
										<div
											className="position-absolute"
											style={
												get_date_percentage(
													reminder.date
												) > 50
													? {
															...cancellation_reminder_date_style,
															right: `${
																100 -
																get_date_percentage(
																	reminder.date
																)
															}%`,
													  }
													: {
															...cancellation_reminder_date_style,
															left: `${get_date_percentage(
																reminder.date
															)}%`,
													  }
											}
										/>
									</OverlayTrigger>
								)
						)}
					{Array.isArray(auto_reminders) &&
						(!showOnTooltip ||
							showOnTooltip === dateTypesOnTimeline[1]) &&
						auto_reminders?.map(
							(reminder, index) =>
								new Date(reminder.date) > new Date() &&
								new Date(reminder.date) < new Date(end) && (
									<OverlayTrigger
										key={index}
										placement="bottom"
										overlay={
											<Tooltip bsPrefix="spendcost__tooltip">
												<CustomReminderTooltipOnTimeline
													isAuto={true}
													reminder={reminder}
												/>
											</Tooltip>
										}
									>
										<div
											className="position-absolute"
											style={
												get_date_percentage(
													reminder.date
												) > 50
													? {
															...auto_reminder_date_style,
															right: `${
																100 -
																get_date_percentage(
																	reminder.date
																)
															}%`,
													  }
													: {
															...auto_reminder_date_style,
															left: `${get_date_percentage(
																reminder.date
															)}%`,
													  }
											}
										/>
									</OverlayTrigger>
								)
						)}
					{Array.isArray(payment_date_array) &&
						(!showOnTooltip ||
							showOnTooltip === dateTypesOnTimeline[0]) &&
						payment_date_array.map((date, index) => (
							<OverlayTrigger
								placement="bottom"
								overlay={
									<Tooltip bsPrefix="spendcost__tooltip">
										<PaymentTooltipOnTimeline
											data={data}
											date={date}
										/>
									</Tooltip>
								}
							>
								<div
									className="position-absolute"
									style={
										get_date_percentage(date) > 50
											? {
													...payment_date_style,
													right: `${
														100 -
														get_date_percentage(
															date
														)
													}%`,
											  }
											: {
													...payment_date_style,
													left: `${get_date_percentage(
														date
													)}%`,
											  }
									}
								/>
							</OverlayTrigger>
						))}
					{cancel_by &&
						(!showOnTooltip ||
							showOnTooltip === dateTypesOnTimeline[2]) && (
							<OverlayTrigger
								placement={"bottom-start"}
								overlay={
									<Tooltip bsPrefix="spendcost__tooltip">
										<CancelByTooltipOnTimeline
											data={data}
										/>
									</Tooltip>
								}
							>
								<div
									className="position-absolute"
									style={
										get_date_percentage(cancel_by) > 50
											? {
													...cancel_by_style,
													right: `${
														100 -
														get_date_percentage(
															cancel_by
														)
													}%`,
											  }
											: {
													...cancel_by_style,
													left: `${get_date_percentage(
														cancel_by
													)}%`,
											  }
									}
								/>
							</OverlayTrigger>
						)}
				</div>
			)}
			<div
				className="mt-4"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
				}}
			>
				{dateTypesOnTimeline.map((dateType, index) => (
					<div
						className={`d-flex mb-2 mr-3 align-items-center cursor-pointer ${
							showOnTooltip === dateType
								? "highlight-timeline-legend"
								: ""
						}`}
						onClick={() =>
							setShowOnTooltip(
								showOnTooltip === dateType ? null : dateType
							)
						}
						style={{
							height: "20px",
							padding: "4px",
							borderRadius: "8px",
						}}
					>
						<NumberPill
							number={
								<img src={whiteTick} height={10} width={10} />
							}
							pillBackGround={dateTypeColors[index]}
							pillSize={16}
						/>
						<div className="font-12 ml-1">{dateType}</div>
					</div>
				))}
			</div>
		</>
	);
}
