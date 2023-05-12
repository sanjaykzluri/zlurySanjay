import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import SendReminderIcon from "../../../../assets/send-reminder-icon.svg";

const ReminderModal = (props) => {
	const { handleActionTask, runActionData } = props;

	const [data, setData] = useState(
		(runActionData.action_meta &&
			runActionData.action_meta[0] &&
			runActionData.action_meta[0]?.v?.assignee[0]) ||
			(runActionData.action_data &&
				runActionData.action_data[0] &&
				runActionData.action_data[0]?.v?.assignee[0]) ||
			{}
	);

	useEffect(() => {
		if (props.show || runActionData) {
			setData(
				(runActionData?.action_meta && runActionData?.action_meta[0]
					? runActionData?.action_meta[0]?.v?.assignee[0]
					: runActionData?.action_meta?.assignee &&
					  runActionData?.action_meta.assignee[0]) ||
					(runActionData?.action_data && runActionData?.action_data[0]
						? runActionData?.action_data[0]?.v?.assignee[0]
						: runActionData?.action_data?.assignee &&
						  runActionData?.action_data.assignee[0]) ||
					{}
			);
		}
	}, [props.show, runActionData]);

	return (
		<>
			<Modal
				show={props.show}
				onHide={() => props.onHide}
				style={{ maxWidth: "50%!important" }}
				centered
				className="custom-map-modal"
			>
				<Modal.Header className="pb-1">
					<Modal.Title className=" mt-4 text-center">
						<img src={SendReminderIcon} />
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="bg-white rounded-top">
					<div className="px-5 py-4">
						<div className="d-flex mt-4 flex-column align-items-center">
							<p className="font-18 bold-600 text-align-center">
								You're about to send a reminder to{" "}
								{data?.user_email}({data?.user_name})
							</p>
							<p
								style={{
									textAlign: "center",
									color: "#717171",
									fontFamily: "Sora",
								}}
							>
								This will trigger a reminder email to{" "}
								{data?.user_email} to complete the assigned
								task. Sure you want to continue?
							</p>
						</div>
					</div>
				</Modal.Body>
				<hr></hr>
				<Modal.Footer className="border-top">
					<Button variant="link" onClick={props.onHide}>
						Cancel
					</Button>
					<Button
						className="z-button-primary px-4"
						size="lg"
						onClick={() => handleActionTask("reminder")}
					>
						Send Reminder
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default ReminderModal;
