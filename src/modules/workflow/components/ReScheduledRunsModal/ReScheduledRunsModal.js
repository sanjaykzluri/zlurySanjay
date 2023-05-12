import React, { useEffect, useState } from "react";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import { reScheduleRuns } from "../../service/api";
import "./reScheduledRunsModal.css";
import SchedulePlaybook from "../SchedulePlaybook/SchedulePlaybook";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

function ReScheduledRunsModal({
	type,
	workflow_id,
	setShowReScheduleRunModal,
	showReScheduleRunModal,
	refreshTable,
	workflow,
}) {
	const [confirmationText, setConfirmationText] = useState("");
	const [isAPICalling, setIsAPICalling] = useState(false);
	const [schedulePlaybookData, setSchedulePlaybookData] = useState();

	useEffect(() => {
		if (workflow) {
			const { scheduledData } = workflow;
			setSchedulePlaybookData(scheduledData);
		}
	}, [workflow]);

	const onConfirmRun = () => {
		setIsAPICalling(true);
		const data = {
			scheduledData: schedulePlaybookData,
		};
		reScheduleRuns(workflow?._id, data)
			.then((res) => {
				setIsAPICalling(false);
				setShowReScheduleRunModal(false);
				refreshTable();
				ApiResponseNotification({
					title: "Successfully Re-Scheduled a playbook",
					responseType: apiResponseTypes.SUCCESS,
					description: "Successfully Re-Scheduled a playbook",
				});
			})
			.catch((err) => {
				setIsAPICalling(false);
				ApiResponseNotification({
					title: "Error in Scheduling a playbook",
					responseType: apiResponseTypes.ERROR,
					errorObj: err,
					retry: onConfirmRun,
				});
			});
	};

	return (
		<Modal
			show={showReScheduleRunModal}
			onClose={() => {
				setShowReScheduleRunModal(false);
			}}
			size="md"
			title="Reschedule Run"
			headerStyle="reschedule-title"
		>
			<div
				className="schedule-playbook-modal"
				style={{
					margin: "20px",
				}}
			>
				<SchedulePlaybook
					buttonText="Schedule"
					confirmationText={confirmationText}
					setConfirmationText={setConfirmationText}
					onConfirmRun={onConfirmRun}
					onCancelClick={() => {
						setShowReScheduleRunModal(false);
						refreshTable();
					}}
					selectedUsers={[{ selectedUsers: "selectedUsers" }]}
					isAPICalling={isAPICalling}
					schedulePlaybookData={schedulePlaybookData}
					setSchedulePlaybookData={setSchedulePlaybookData}
				/>
			</div>
		</Modal>
	);
}

export default ReScheduledRunsModal;
