import moment from "moment";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import {
	fixDateTimezone,
	getNumberOfDaysBtwnTwoDates,
} from "../../../../utils/DateUtility";
import { AddEditReminder } from "../../../renewals/components/AddEditReminder/AddEditReminder";
import {
	addReminder,
	deleteReminder,
	editReminder,
} from "../../../renewals/redux/renewal";
import reminderBell from "../../../../assets/licenses/reminderbell.svg";

export default function ContractRenewal({ renewal, requestData, contractId }) {
	const dispatch = useDispatch();
	const [showSetReminder, setShowSetReminder] = useState(false);
	return (
		<div className="position-relative">
			<div
				className={`contract-renewal-pill ${
					!renewal?.reminder ? "justify-content-center" : ""
				}`}
				onClick={() => setShowSetReminder(true)}
			>
				{renewal?.reminder ? (
					<div className="d-flex">
						<img src={reminderBell} className="mr-1" />
						<div className="font-10">
							Auto Reminds on{" "}
							{moment(renewal?.reminder?.date).format("DD MMM")}
						</div>
					</div>
				) : (
					<div className="font-10">Add a reminder</div>
				)}
			</div>
			<Popover
				align="right"
				show={showSetReminder}
				onClose={() => setShowSetReminder(false)}
				style={{ width: "320px" }}
				className="add-edit-contract-renewal-popup"
			>
				<AddEditReminder
					remindBeforeDays={
						renewal && renewal?.reminder && renewal?.reminder?.date
							? getNumberOfDaysBtwnTwoDates(
									new Date(renewal?.reminder?.date),
									new Date(fixDateTimezone(renewal.date))
							  )
							: 30
					}
					renewal={{
						...renewal,
						reminderData: null,
						date: fixDateTimezone(renewal.date),
						renewalID: renewal._id,
					}}
					addReminder={(data) => {
						dispatch(
							addReminder(
								{
									...renewal,
									reminderData: null,
									date: fixDateTimezone(renewal.date),
									renewalID: renewal._id,
								},
								data
							)
						);
						requestData(contractId);
						setShowSetReminder(false);
					}}
					editReminder={(data) => {
						dispatch(
							editReminder(
								{
									...renewal,
									reminderData: null,
									date: fixDateTimezone(renewal.date),
									renewalID: renewal._id,
								},
								data
							)
						);
						requestData(contractId);
						setShowSetReminder(false);
					}}
					deleteReminder={() => {
						dispatch(
							deleteReminder({
								...renewal,
								reminderData: null,
								date: fixDateTimezone(renewal.date),
								renewalID: renewal._id,
							})
						);
						requestData(contractId);
						setShowSetReminder(false);
					}}
					onCancel={() => setShowSetReminder(false)}
				/>
			</Popover>
		</div>
	);
}
