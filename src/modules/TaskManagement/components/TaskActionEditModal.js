import React, { useState } from "react";
import close from "../../../assets/close.svg";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Spinner } from "react-bootstrap";
import { clearTaskCache } from "../redux/TaskManagement.actions";
import { taskActionEditTypes } from "../constants/TaskManagement.constants";
import { toggleShowTaskActionEditModal } from "../redux/TaskManagement.actions";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";
import { getSummarisedRunLogs } from "../service/TaskManagement.api";

export default function TaskActionEditModal() {
	const dispatch = useDispatch();
	const {
		showTaskActionEditModal,
		taskListRequestPayload,
		taskActionEditModalProps: { action, editType },
	} = useSelector((state) => state.tasks);
	const [apiCallInProgress, setApiCallInProgress] = useState(false);

	const handleClose = () => {
		setApiCallInProgress(false);
		dispatch(toggleShowTaskActionEditModal());
	};

	const callTaskActionEditAPI = () => {
		setApiCallInProgress(true);
		taskActionEditTypes[editType]
			.call({
				workflow_id: action.workflow_id,
				workflow_user_id: action.workflow_user_id,
				type: action.type,
				status: taskActionEditTypes[editType].type,
				workflow_action_id: action.action_id,
				id_array: [{ workflow_action_id: action.action_id }],
			})
			.then((res) => {
				if (res.success) {
					setApiCallInProgress(false);
					ApiResponseNotification({
						responseType: apiResponseTypes.SUCCESS,
						title: "Status of the action changed successfully!",
					});
					dispatch(clearTaskCache(taskListRequestPayload));
					getSummarisedRunLogs(
						action.workflow_id,
						action.workflow_exec_id,
						1,
						action.type
					);
					handleClose();
				} else {
					setApiCallInProgress(false);
					const title = res.err_code
						? "Action has already been taken on the task. Try refreshing the tasks dashboard."
						: "Error while changing status of the action";

					ApiResponseNotification({
						responseType: apiResponseTypes.ERROR,
						title: title,
						errorObj: { error: "Status change failed" },
					});
				}
			})
			.catch((err) => {
				setApiCallInProgress(false);
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					title: err.response?.data?.err_code
						? "Action has already been taken on the task. Try refreshing the tasks dashboard."
						: "Error while changing status of the action",
					errorObj: err,
				});
			});
	};

	return (
		<>
			{showTaskActionEditModal && (
				<>
					<div className="modal-backdrop show"></div>
					<div style={{ display: "block" }} className="modal"></div>
					<Modal
						centered
						backdrop={false}
						show={showTaskActionEditModal}
						dialogClassName="task_management_action_edit_modal"
						onHide={handleClose}
					>
						<Modal.Body
							style={{
								height: "fit-content",
							}}
						>
							<div
								className="d-flex flex-column align-items-center"
								style={{ gap: "8px", margin: "8px 16px" }}
							>
								<div className="d-flex justify-content-center align-items-center w-100">
									<img
										src={taskActionEditTypes[editType].img}
										alt=""
										height={16}
										width={16}
										className="ml-auto"
										style={{
											transform: "translateX(12px)",
										}}
									/>
									<img
										src={close}
										alt=""
										height={12}
										width={12}
										className="cursor-pointer ml-auto"
										onClick={handleClose}
									/>
								</div>
								<div className="font-12 bold-600 text-align-center">
									{taskActionEditTypes[editType].title(
										action
									)}
								</div>
								<div className="font-11 bold-500 grey text-align-center">
									{taskActionEditTypes[editType].desc}
								</div>
							</div>
							<div
								className="d-flex align-items-center justify-content-center"
								style={{ gap: "8px", margin: "8px" }}
							>
								<Button
									bsPrefix="task_action_edit_modal_ok_btn"
									onClick={callTaskActionEditAPI}
								>
									{apiCallInProgress ? (
										<Spinner
											animation="border"
											role="status"
											variant="dark"
											size="sm"
											style={{ borderWidth: 2 }}
										/>
									) : (
										taskActionEditTypes[editType].btnText
									)}
								</Button>
							</div>
						</Modal.Body>
					</Modal>
				</>
			)}
		</>
	);
}
