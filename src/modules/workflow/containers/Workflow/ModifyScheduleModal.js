import dayjs from "dayjs";
import ScheduleAction from "modules/workflow/components/ScheduleAction/ScheduleAction";
import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import close from "../../../../assets/close.svg";

const ModifyScheduleModal = (props) => {
	const { handleActionTask, runActionData } = props;
	let { scheduledData = {} } = { ...runActionData };

	return (
		<>
			<Modal
				show={props.show}
				onHide={() => props.onHide}
				style={{ maxWidth: "50%!important" }}
				centered
				className="custom-map-modal"
			>
				<div
					style={{ backgroundColor: "rgba(235, 235, 235, 0.5)" }}
					className="d-flex flex-row align-items-center py-4"
				>
					<div className="m-auto">
						<span className="contracts__heading d-flex flex-row">
							Modify Schedule
						</span>
					</div>
					<img
						className="pr-4 cursor-pointer"
						alt="Close"
						onClick={props.onHide}
						src={close}
					/>
				</div>
				<Modal.Body className="bg-white rounded-top">
					<div className="px-5 py-4">
						<ScheduleAction
							scheduledData={scheduledData}
							handleScheduleApprovalChange={(obj, key) => {
								handleActionTask(key, obj);
							}}
						/>
					</div>
				</Modal.Body>
				<hr></hr>
			</Modal>
		</>
	);
};

export default ModifyScheduleModal;
