import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import close from "../../../../assets/close.svg";
import { DatePicker } from "../../../../UIComponents/DatePicker/DatePicker";
import { ManualTask } from "../../components/ManualTask/ManualTask";
import { WorkFlowActionModel } from "../../model/model";
import ManualTaskAction from "modules/workflow/components/ManualTaskAction/ManualTaskAction";

export const ManualTaskModal = (props) => {
	const { handleActionTask, runActionData } = props;
	const action = new WorkFlowActionModel({
		action_data: runActionData?.action_data,
		type: "manual",
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
							Convert to Manual Task
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
					<div className="p-4">
						{/* <ManualTask
							action={action}
							submitManualTask={(task) =>
								handleActionTask("manual", task)
							}
							type={"manual"}
							showCancel={false}
							entity={props.entity}
						/> */}
						<ManualTaskAction
							action={action}
							submitManualTask={(task) =>
								handleActionTask("manual", task)
							}
							type={"manual"}
							showCancel={false}
							entity={props.entity}
						/>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
};
