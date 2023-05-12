import dayjs from "dayjs";
import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import close from "../../../../assets/close.svg";
import { ManualTask } from "../../components/ManualTask/ManualTask";
import "../../components/ManualTask/ManualTask.css";

export const ReassignTaskModal = (props) => {
	const { handleActionTask, runActionData } = props;
	let { action_data = {} } = { ...runActionData };

	const [reassignTaskForm, setReassignTaskForm] = useState({
		assignee: {
			value: (action_data?.assignee && action_data?.assignee[0]) || {
				name: "",
			},
			required: true,
			error_message: "Please select assignee for the task",
			error: false,
		},
		due_date: {
			value: props.action?.data?.due_date
				? new Date(props.action?.data?.due_date)
				: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
			required: true,
			error_message: "Please enter due date for the task",
			error: false,
		},
		message: {
			value: action_data.message || "",
			required: false,
		},
	});

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
							Reassign Task
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
						<ManualTask
							submitManualTask={(task) => {
								handleActionTask("reassign", task);
							}}
							showCancel={false}
							showTaskTitleAndDescription={false}
							actionableButtonName={"Reassign Task"}
							showCardTitle={false}
							reassignTaskForm={reassignTaskForm}
							action={runActionData}
							entity={props.entity}
						/>
					</div>
				</Modal.Body>
				<hr></hr>
			</Modal>
		</>
	);
};
