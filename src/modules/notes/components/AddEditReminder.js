import React, { useEffect, useState } from "react";
import { Button } from "../../../UIComponents/Button/Button";
import reminder from "../../../assets/icons/reminder-grey.svg";
import deleteImage from "../../../assets/icons/delete.svg";
import "../../renewals/components/AddEditReminder/AddEditReminder.css";
import { DatePicker } from "../../../UIComponents/DatePicker/DatePicker";
import { Spinner } from "react-bootstrap";
import warning from "../../../assets/warning.svg";
import "../../../components/Applications/Overview/Overview.css";

export function AddEditReminder(props) {
	const [date, setDate] = useState(
		props.note?.reminder?.reminder_date
			? props.note?.reminder?.reminder_date
			: null
	);

	const onCancel = () => {
		props.onCancel();
	};

	const onSave = () => {
		props.addEditReminder(date);
	};

	return (
		<div>
			<div className="d-flex">
				<img src={reminder} className="mr-2" />
				<h3 className="z__header-secondary flex-fill m-0">
					{!props.note?.reminder?.reminder_date
						? "Set Reminder"
						: "Edit Reminder"}
				</h3>
				{!props.note?.reminder?.reminder_date ? null : (
					<img
						src={deleteImage}
						className="cursor-pointer"
						onClick={() => props.onDelete()}
						alt="delete"
					></img>
				)}
			</div>
			<hr />
			<div>
				<div className="row d-flex flex-column grow">
					<div className="col-md-12 md-4">
						<p className="z__block-header mb-2">Reminder Date</p>
						{
							<DatePicker
								minDate={new Date()}
								value={
									props.note?.reminder?.reminder_date
										? new Date(date)
										: null
								}
								onChange={(v) => setDate(v)}
							/>
						}
					</div>
					{props.showError && (
						<div className="col-md-12 md-4">
							<label
								className="d-flex text-center alert mb-0 mt-2 p-2 alert-message border border-danger"
								role="alert"
							>
								<img src={warning} className="pr-1"></img>
								<div className="text-left">
									{props.tooManyRequests
										? "Too many requests, please try again later."
										: "Something went wrong. Please try again."}
								</div>
							</label>
						</div>
					)}
					<div className="col-md-12 mt-4 mr text-right">
						<Button onClick={onCancel} type="link" className="mr-4">
							{" "}
							Cancel{" "}
						</Button>
						<Button onClick={onSave}>
							{props.loading && (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									className="mr-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							)}
							Set Reminder{" "}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
