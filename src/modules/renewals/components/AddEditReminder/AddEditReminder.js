import React, { useEffect, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { mapValueToKeyState } from "../../../../utils/mapValueToKeyState";
import { RENEWAL_REMINDER_BEFORE_DEFAULT } from "../../constants/constant";
import {
	getNumberOfDaysBtwnTwoDates,
	getNthDayBeforeDate,
	getDateAndMonthName,
} from "../../../../utils/DateUtility";
import reminder from "../../../../assets/icons/reminder-grey.svg";
import "./AddEditReminder.css";
import deleteIcon from "../../../../assets/deleteIcon.svg";
import inactive from "../../../../assets/agents/inactive.svg";
import moment from "moment";

export function AddEditReminder(props) {
	const [date, setDate] = useState(
		props.renewal.reminderDate
			? props.renewal.reminderDate
			: getNthDayBeforeDate(
					props.remindBeforeDays
						? props.remindBeforeDays
						: RENEWAL_REMINDER_BEFORE_DEFAULT,
					props.renewal?.date
			  )?.toISOString()
	);
	const [remindBefore, setRemindBefore] = useState(
		getNumberOfDaysBtwnTwoDates(props.renewal.date, new Date(date))
	);
	const isEdit = props.renewal.reminderDate ? true : false;
	const [showWarning, setShowWarning] = useState(true);
	const [error, setError] = useState(false);
	const [showDeletingReminder, setShowDeletingReminder] = useState(false);
	const maxReminder = getNumberOfDaysBtwnTwoDates(
		new Date(),
		props.renewal.date
	);

	const onCancel = (e) => {
		props.onCancel();
	};

	const onSave = (e) => {
		if (maxReminder < remindBefore) {
			setShowWarning(false);
			return;
		}
		setShowWarning(true);
		if (isEdit) props.editReminder({ date });
		else props.addReminder({ date });
	};

	const onDelete = () => {
		props.deleteReminder();
	};

	useEffect(() => {
		if (remindBefore && remindBefore < 1) {
			setError(true);
		} else {
			setError(false);
		}
	}, [remindBefore]);

	return (
		<div>
			<div className="d-flex">
				<img src={reminder} className="mr-2" />
				<h3 className="z__header-secondary flex-fill m-0">
					{" "}
					{props.renewal?.reminderDate ||
					props.renewal?.reminder?.date
						? `Reminder set for ${moment(
								props.renewal?.reminderDate ||
									props.renewal?.reminder?.date
						  ).format("DD MMM")}`
						: "Set a one-time Reminder"}
				</h3>
				{(props.renewal?.reminderDate ||
					props.renewal?.reminder?.date) &&
					!showDeletingReminder && (
						<img
							src={deleteIcon}
							className="cursor-pointer"
							onClick={() =>
								setShowDeletingReminder(!showDeletingReminder)
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
							You’re about to reset the reminder.
						</div>
						<div className="font-12 o-5">
							Would you like to continue?
						</div>
						<Button onClick={onDelete}>Reset Reminder</Button>
					</div>
				) : (
					<div className="row d-flex flex-column grow">
						<div className="col-md-12 md-4">
							<p className="z__block-header mb-2">
								Receive a reminder
							</p>
							<div className="d-flex flex-nowrap align-items-start ">
								<input
									className="flex-fill remind__input  pl-2 mr-1 "
									min="1"
									max="364"
									type="number"
									value={remindBefore}
									onChange={(e) => {
										setRemindBefore(e.target.value);
										mapValueToKeyState(
											setDate,
											getNthDayBeforeDate(
												e.target.value,
												props.renewal?.date
											)?.toISOString()
										);
									}}
								/>
								<p className="flex-fill z__header-ternary align-self-center">
									days before Renewal
								</p>
							</div>
						</div>
						<div className="col-md-12">
							<p className="z__description-secondary">
								A reminder would be sent to the application
								owner or the contract owner{" "}
								<span className="bold-600">
									{getDateAndMonthName(new Date(date))}
								</span>
							</p>
							<p
								className="z__header-ternary"
								hidden={showWarning}
							>
								Please enter a value less than {maxReminder}.
							</p>
						</div>
						<div className="col-md-12 mt-4 mr text-right">
							<Button
								onClick={onCancel}
								type="link"
								className="mr-4"
							>
								{" "}
								Cancel{" "}
							</Button>
							<Button onClick={onSave} disabled={error}>
								{" "}
								Set Reminder{" "}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
