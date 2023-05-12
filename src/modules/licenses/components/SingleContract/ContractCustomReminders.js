import React, { useEffect, useState } from "react";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import reminder from "../../../../assets/icons/reminder-grey.svg";
import deleteIcon from "../../../../assets/deleteIcon.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import reminderBell from "../../../../assets/licenses/reminderbell.svg";
import {
	getDateAndMonthName,
	getNthDayBeforeDate,
	getNumberOfDaysBtwnTwoDates,
	UTCDateFormatter,
} from "utils/DateUtility";
import {
	addCustomReminder,
	deleteCustomReminder,
	editCustomReminder,
} from "services/api/licenses";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import inactive from "../../../../assets/agents/inactive.svg";
import { trackActionSegment } from "modules/shared/utils/segment";
import { Spinner } from "react-bootstrap";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

export default function ContractCustomReminders({
	reminders,
	contractId,
	type,
	displayDate,
	typeDisplayText = "end date",
	refresh,
}) {
	const [showSetReminder, setShowSetReminder] = useState(false);
	const [selectedReminder, setSelectedReminder] = useState();
	const [showDeletingReminder, setShowDeletingReminder] = useState(false);
	const [error, setError] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const maxReminder = getNumberOfDaysBtwnTwoDates(
		new Date(),
		new Date(displayDate)
	);
	const [remindBefore, setRemindBefore] = useState(
		30 > maxReminder ? maxReminder : 30
	);
	const type_reminders = reminders.filter(
		(reminder) => reminder.type === type
	);

	useEffect(() => {
		if (remindBefore && (remindBefore < 1 || remindBefore > maxReminder)) {
			setError(true);
		} else {
			setError(false);
		}
	}, [remindBefore]);

	const onCancel = () => {
		setSelectedReminder();
		setShowSetReminder(false);
		setShowDeletingReminder(false);
	};

	const onSave = () => {
		setSubmitting(true);
		if (selectedReminder) {
			editCustomReminder(
				contractId,
				selectedReminder._id,
				type,
				getNthDayBeforeDate(remindBefore, new Date(displayDate))
			)
				.then((res) => {
					trackActionSegment("Edited Custom Reminder", {
						type: type,
					});
					refresh(contractId);
					onCancel();
					setSubmitting(false);
				})
				.catch((err) => {
					onCancel();
					setSubmitting(false);
					ApiResponseNotification({
						responseType: apiResponseTypes.ERROR,
						errorObj: err,
						title: "Error in editing custom reminder",
						retry: onSave,
					});
				});
		} else {
			addCustomReminder(
				contractId,
				type,
				getNthDayBeforeDate(remindBefore, new Date(displayDate))
			)
				.then((res) => {
					trackActionSegment("Added New Custom Reminder", {
						type: type,
					});
					refresh(contractId);
					onCancel();
					setSubmitting(false);
				})
				.catch((err) => {
					onCancel();
					setSubmitting(false);
					ApiResponseNotification({
						responseType: apiResponseTypes.ERROR,
						errorObj: err,
						title: "Error in adding custom reminder",
						retry: onSave,
					});
				});
		}
	};

	const openEditReminder = (reminder) => {
		setSelectedReminder(reminder);
		setRemindBefore(
			getNumberOfDaysBtwnTwoDates(
				new Date(displayDate),
				new Date(reminder.date)
			)
		);
		setShowSetReminder(true);
	};

	const onDelete = () => {
		setSubmitting(true);
		deleteCustomReminder(contractId, selectedReminder._id)
			.then((res) => {
				refresh(contractId);
				onCancel();
				setSubmitting(false);
			})
			.catch((err) => {
				onCancel();
				setSubmitting(false);
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					errorObj: err,
					title: "Error in deleting custom reminder",
					retry: onDelete,
				});
			});
	};

	const showReminder = new Date() < new Date(displayDate);

	return (
		<div className="position-relative">
			<div>{UTCDateFormatter(displayDate)}</div>
			{type_reminders.length > 0 ? (
				<div>
					{type_reminders.map(
						(reminder, index) =>
							new Date(reminder?.date) > new Date() && (
								<div className="d-flex" key={index}>
									<div
										className="contract-renewal-pill mb-1"
										onClick={() =>
											openEditReminder(reminder)
										}
									>
										<div className="d-flex">
											<img
												src={reminderBell}
												className="mr-1"
											/>
											<div className="font-10">
												Auto Reminds on{" "}
												{UTCDateFormatter(
													reminder?.date,
													"DD MMM"
												)}
											</div>
										</div>
									</div>
									{index === type_reminders.length - 1 && (
										<NumberPill
											number="+"
											style={{
												cursor: "pointer",
												marginLeft: "4px",
											}}
											onClick={() =>
												setShowSetReminder(true)
											}
											pillSize={21}
										/>
									)}
								</div>
							)
					)}
				</div>
			) : (
				showReminder && (
					<div className="">
						<div
							className="contract-renewal-pill justify-content-center"
							onClick={() => setShowSetReminder(true)}
						>
							<div className="font-10">Add a reminder</div>
						</div>
					</div>
				)
			)}
			<Popover
				align="right"
				show={showSetReminder}
				onClose={onCancel}
				style={{ width: "320px" }}
				className="contract-custom-reminder-popup"
			>
				<div key={selectedReminder}>
					<div className="d-flex">
						<img src={reminder} className="mr-2" />
						<h3 className="z__header-secondary flex-fill m-0">
							{selectedReminder
								? `Reminder set for ${UTCDateFormatter(
										selectedReminder.date
								  )}`
								: "Set a one-time Reminder"}
						</h3>
						{selectedReminder && (
							<img
								src={deleteIcon}
								className="cursor-pointer"
								onClick={() =>
									setShowDeletingReminder(
										!showDeletingReminder
									)
								}
							/>
						)}
					</div>
					<hr />
					<div>
						{showDeletingReminder ? (
							<div
								className="d-flex flex-column align-items-center justify-content-evenly"
								style={{ height: "202px" }}
							>
								<img src={inactive} height={39} width={39} />
								<div className="font-14">
									You’re about to delete the reminder.
								</div>
								<div className="font-12 o-5">
									Would you like to continue?
								</div>
								<Button onClick={onDelete}>
									Delete Reminder
									{submitting && (
										<Spinner
											animation="border"
											role="status"
											variant="light"
											size="sm"
											className="ml-2"
											style={{ borderWidth: 2 }}
										></Spinner>
									)}
								</Button>
							</div>
						) : (
							<div className="row d-flex flex-column grow">
								<div className="col-md-12 md-4">
									<p className="z__block-header mb-2">
										Receive a reminder
									</p>
									<div className="d-flex flex-nowrap align-items-start align-items-center">
										<input
											className="flex-fill remind__input  pl-2 mr-1 "
											min="1"
											max="364"
											type="number"
											value={remindBefore}
											onChange={(e) => {
												setRemindBefore(e.target.value);
											}}
										/>
										<div className="d-flex align-items-center">
											days before {typeDisplayText}
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<p className="z__description-secondary">
										A reminder would be sent to you on your
										registered email and mobile on{" "}
										<span className="bold-600">
											{getDateAndMonthName(
												getNthDayBeforeDate(
													remindBefore,
													new Date(displayDate)
												)
											)}
										</span>
									</p>
									<p
										className="z__header-ternary"
										hidden={!error}
									>
										Please enter a value less than{" "}
										{maxReminder}.
									</p>
								</div>
								<div className="col-md-12 mt-4 mr text-right">
									<Button
										onClick={onCancel}
										type="link"
										className="mr-4"
									>
										Cancel
									</Button>
									<Button onClick={onSave} disabled={error}>
										Set Reminder
										{submitting && (
											<Spinner
												animation="border"
												role="status"
												variant="light"
												size="sm"
												className="ml-2"
												style={{ borderWidth: 2 }}
											></Spinner>
										)}
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</Popover>
		</div>
	);
}
