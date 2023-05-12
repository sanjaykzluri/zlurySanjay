import React, { useEffect, useState, useRef } from "react";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import reminder from "../../../../assets/icons/reminder.svg";
import greyReminder from "../../../../assets/icons/greyReminder.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import {
	fixDateTimezone,
	getDateAndMonthName,
} from "../../../../utils/DateUtility";
import { useOutsideClickListener } from "../../../../utils/clickListenerHook";
import { AddEditReminder } from "../../components/AddEditReminder";
import { useDispatch } from "react-redux";
import {
	add_edit_ReminderDispatcher,
	deleteReminderDispatcher,
} from "../../redux/reminder.js";
import DeleteReminder from "../../components/DeleteReminder";
import "../../../../components/Notes/notes.scss";
import moment from "moment";
import { getValueFromLocalStorage } from "utils/localStorage";

export function Reminder(props) {
	const [showSetReminder, setShowSetReminder] = useState(false);
	const [shouldAnimateOnHover, setShouldAnimateOnHover] = useState(false);
	const [showDeleteReminder, setShowDeleteReminder] = useState(false);
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();
	const userInfo = getValueFromLocalStorage("userInfo");
	const ref = useRef(null);
	const [showError, setShowError] = useState(false);
	const [tooManyRequests, setTooManyRequests] = useState(false);

	function hideReminder() {
		setShowSetReminder(false);
		setShowDeleteReminder(false);
	}

	useOutsideClickListener(ref, () => {
		hideReminder();
	});

	const handleAddEditReminder = (date) => {
		setLoading(true);
		const payloadObj = {
			entity_type: props.entity.type,
			note_belongs_to: props.entity.id,
			reminder_date: date,
			created_by: userInfo.user_id,
		};
		dispatch(
			add_edit_ReminderDispatcher(
				props.note,
				payloadObj,
				props.entity,
				(res) => {
					if (!res.error && res.note) {
						props.update(res.note);
						setLoading(false);
						setShowSetReminder(false);
					} else {
						setShowError(true);
						setLoading(false);
						if (
							res.error ===
							"Too many requests, please try again later."
						) {
							setTooManyRequests(true);
						}
					}
				}
			)
		);
	};

	const handleDeleteReminder = () => {
		const payloadObj = {
			entity_type: props.entity.type,
			note_belongs_to: props.entity.id,
		};
		dispatch(
			deleteReminderDispatcher(
				props.note,
				payloadObj,
				props.entity,
				(res) => {
					props.update(res.note);
				}
			)
		);
		hideReminder();
	};

	const handleShowDelete = () => {
		setShowSetReminder(false);
		setShowDeleteReminder(true);
	};

	const handleCancelDelete = () => {
		setShowSetReminder(true);
		setShowDeleteReminder(false);
	};

	useEffect(() => {
		setShouldAnimateOnHover(!props.isInSidePanel);
	}, []);

	useEffect(() => {
		if (!props.isInSidePanel) {
			setShouldAnimateOnHover(!showSetReminder);
		}
		showSetReminder && setShowError(false);
	}, [showSetReminder]);

	return (
		<>
			<Button
				className="pt-0 pb-0 pl-1 pr-1 font-13"
				style={{ background: props?.note?.color }}
				type="link"
				key={showSetReminder}
				onClick={() => {
					setShowSetReminder(true);
				}}
			>
				{props.note?.reminder?.reminder_date ? (
					<>
						<div
							className={
								shouldAnimateOnHover
									? "showOnHover d-flex"
									: "d-flex"
							}
						>
							<img
								className="mt-auto mb-auto"
								width={12}
								style={{ marginRight: "2px" }}
								src={reminder}
							/>
							<div>
								Reminds on{" "}
								{moment(
									props.note?.reminder?.reminder_date
								).format("DD MMM")}
							</div>
						</div>
					</>
				) : (
					<>
						<img
							width={12}
							style={{ marginTop: "-2px" }}
							src={greyReminder}
							className="cursor-pointer"
						/>
					</>
				)}
			</Button>
			<Popover
				align="default"
				show={showSetReminder}
				onClose={() => setShowSetReminder(false)}
				style={
					props.isInSidePanel
						? { right: "0px", width: "320px" }
						: { right: "-70px", width: "320px" }
				}
			>
				<AddEditReminder
					note={props.note}
					addEditReminder={handleAddEditReminder}
					onCancel={() => setShowSetReminder(false)}
					onDelete={handleShowDelete}
					loading={loading}
					showError={showError}
					tooManyRequests={tooManyRequests}
				/>
			</Popover>
			<Popover
				align="default"
				show={showDeleteReminder}
				onClose={() => setShowSetReminder(false)}
				style={
					props.isInSidePanel
						? { right: "0px", width: "320px" }
						: { right: "-70px", width: "320px" }
				}
			>
				<DeleteReminder
					note={props.note}
					onConfirmDelete={handleDeleteReminder}
					onCancelDelete={handleCancelDelete}
					refrence={ref}
				/>
			</Popover>
		</>
	);
}
