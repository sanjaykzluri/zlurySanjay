import React, { useContext, useState } from "react";
import add from "../../../../assets/icons/plus-blue.svg";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import reminder from "../../../../assets/icons/reminder.svg";
import { AddEditReminder } from "../../components/AddEditReminder/AddEditReminder";
import { Button } from "../../../../UIComponents/Button/Button";
import { getDateAndMonthName } from "../../../../utils/DateUtility";
import { useDispatch, useSelector } from "react-redux";
import {
	addReminderFromCalender,
	deleteReminderFromCalender,
	editReminderFromCalender,
} from "../../redux/renewal";
import RoleContext from "../../../../services/roleContext/roleContext";
import { trackActionSegment } from "modules/shared/utils/segment";

export function Reminder(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const renewal = props.renewal;
	const [showSetReminder, setShowSetReminder] = useState(false);
	const dispatch = useDispatch();
	const { isViewer } = useContext(RoleContext);
	const clickOnReminderButton = () => {
		if (!isViewer) {
			//Segment Implementation
			window.analytics.track(
				renewal?.reminderDate
					? `clicked on Reminds on ${getDateAndMonthName(
							renewal.reminderDate
					  )}`
					: "clicked on set reminder",
				{
					currentCategory: "Applications",
					currentPageName: `Renewals-${props.typeofview}-View`,
				},
				true
			);
			setShowSetReminder(true);
		}
	};

	return (
		<>
			<Button
				className={`p-0 font-13 ${isViewer && "cursor-text"}`}
				type="link"
				onClick={clickOnReminderButton}
			>
				{renewal?.reminderDate ? (
					<>
						<img
							className="mr-1"
							width={12}
							style={{ marginTop: "-2px" }}
							src={reminder}
						/>
						Reminds on {getDateAndMonthName(renewal?.reminderDate)}
					</>
				) : (
					<>
						{!isViewer ? (
							<>
								<img
									className="mr-1"
									width={12}
									style={{ marginTop: "-2px" }}
									src={add}
								/>{" "}
								Set Reminder
							</>
						) : (
							<div className="font-14 grey-1">
								Reminder not set
							</div>
						)}
					</>
				)}
			</Button>
			<Popover
				align="center"
				show={showSetReminder}
				onClose={() => setShowSetReminder(false)}
				style={{ width: "320px" }}
			>
				<AddEditReminder
					renewal={renewal}
					addReminder={(data) => {
						dispatch(addReminderFromCalender(renewal, data));
						setShowSetReminder(false);
						trackActionSegment("Added Reminder in Renewals Page", {
							renewalObject: renewal,
						});
					}}
					editReminder={(data) => {
						dispatch(editReminderFromCalender(renewal, data));
						setShowSetReminder(false);
						trackActionSegment("Edited Reminder in Renewals Page", {
							renewalObject: renewal,
						});
					}}
					deleteReminder={() => {
						dispatch(deleteReminderFromCalender(renewal));
						setShowSetReminder(false);
						trackActionSegment(
							"Deleted Reminder in Renewals Page",
							{ renewalObject: renewal }
						);
					}}
					onCancel={() => setShowSetReminder(false)}
				/>
			</Popover>
		</>
	);
}
