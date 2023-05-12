import React, { useContext, useEffect, useState } from "react";
import icon from "../../../../assets/applications/overview4.svg";
import addCircle from "../../../../assets/add.svg";
import add from "../../../../assets/icons/add.svg";
import reminder from "../../../../assets/icons/reminder.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { AddEditRenewal } from "../../components/AddEditRenewal/AddEditRenewal";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import { getDateAndMonthName } from "../../../../utils/DateUtility";
import { Renewal } from "../../model/model";
import { AddEditReminder } from "../../components/AddEditReminder/AddEditReminder";
import { RemoveRenewal } from "../../components/RemoveRenewal/RemoveRenewal";
import { useDispatch, useSelector } from "react-redux";
import {
	addRenewal,
	editRenewal,
	applicationRenewal,
	removeApplicationRenewal,
	deleteRenewal,
	editReminder,
	addReminder,
	deleteReminder,
} from "../../redux/renewal";
import RoleContext from "../../../../services/roleContext/roleContext";
import { useLocation } from "react-router-dom";
import { capitalizeFirstLetter } from "utils/common";

export function RenewalWidget(props) {
	const dispatch = useDispatch();
	const location = useLocation();

	const renewal = useSelector((state) => state.renewal.renewal);
	const showRenewal = new URLSearchParams(location.search).get("showRenewal");
	const [showAddRenewal, setShowAddRenewal] = useState(!!showRenewal);
	const [showSetReminder, setShowSetReminder] = useState(false);
	const [showRemoveRenewal, setShowRemoveRenewal] = useState(false);
	const { isViewer } = useContext(RoleContext);
	const userInfo = useSelector((state) => state.userInfo);

	useEffect(() => {
		if (props.application?.app_renewal_data) {
			dispatch(applicationRenewal(new Renewal(props.application)));
		}
		return () => {
			dispatch(removeApplicationRenewal());
		};
	}, []);

	return (
		<div className="position-relative">
			<h3 className="z__header-quaternary">
				{renewal
					? `Upcoming ${capitalizeFirstLetter(renewal.type)}`
					: "Renewal"}
			</h3>
			<div className="d-inline-block position-relative">
				{!renewal && !isViewer && (
					<div>
						<Button
							type="dashed"
							onClick={() => setShowAddRenewal(true)}
						>
							<img src={add} width={18} /> Add Renewal
						</Button>
					</div>
				)}
				{!renewal && isViewer && (
					<div className="grey-1 font-14">No Renewal Added</div>
				)}
				{renewal && (
					<>
						<div>
							<h4 className="z__header-primary m-0 font-18">
								<img src={icon} className="mr-2" />
								{getDateAndMonthName(renewal.date)}
							</h4>
						</div>
						{!renewal.reminderDate && !isViewer && (
							<div>
								<Button
									className="p-0 z__header-quaternary"
									onClick={() => setShowSetReminder(true)}
									type="normal"
								>
									<img
										className="mt-n1 mr-1"
										src={addCircle}
										width={8}
									/>
									Set Reminder
								</Button>
							</div>
						)}
						{renewal.reminderDate && (
							<div>
								<Button
									className="p-0"
									onClick={() => {
										if (!isViewer) {
											setShowSetReminder(true);
										}
									}}
									type="link"
								>
									<img
										className="mt-n1 mr-1"
										src={reminder}
										width={14}
									/>
									Reminds on{" "}
									{getDateAndMonthName(renewal.reminderDate)}
								</Button>
							</div>
						)}
					</>
				)}
				<Popover
					align="right"
					show={showAddRenewal}
					onClose={() => setShowAddRenewal(false)}
					style={{ width: "320px" }}
				>
					Please add a subscription or contract to add a renewal
				</Popover>
				<Popover
					align="right"
					show={showSetReminder}
					onClose={() => setShowSetReminder(false)}
					style={{ width: "320px" }}
				>
					<AddEditReminder
						renewal={renewal}
						addReminder={(data) => {
							dispatch(addReminder(renewal, data));
							setShowSetReminder(false);
						}}
						editReminder={(data) => {
							dispatch(editReminder(renewal, data));
							setShowSetReminder(false);
						}}
						deleteReminder={() => {
							dispatch(deleteReminder(renewal));
							setShowSetReminder(false);
						}}
						onCancel={() => setShowSetReminder(false)}
					/>
				</Popover>
				<Popover
					align="right"
					show={showRemoveRenewal}
					onClose={() => setShowRemoveRenewal(false)}
					style={{ width: "320px" }}
				>
					<RemoveRenewal
						renewal={renewal}
						onCancel={() => setShowRemoveRenewal(false)}
						onDelete={() => {
							dispatch(deleteRenewal(renewal, userInfo.org_id));
							setShowRemoveRenewal(false);
						}}
					/>
				</Popover>
			</div>
		</div>
	);
}
