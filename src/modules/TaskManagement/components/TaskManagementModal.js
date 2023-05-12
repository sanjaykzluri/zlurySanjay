import React from "react";
import close from "assets/close.svg";
import TaskManagementList from "./TaskManagementList";
import TaskActionEditModal from "./TaskActionEditModal";
import TaskManagementHeader from "./TaskManagementHeader";

export default function TaskManagementModal({ handleClose }) {
	return (
		<>
			<div className="modal-backdrop show" />
			<div className="task_management_container">
				<div
					className="task_management_container_closer"
					onClick={handleClose}
				>
					<img src={close} alt="" width={12} height={12} />
				</div>
				<div className="task_management_filter_and_list">
					<TaskManagementHeader />
					<TaskManagementList />
				</div>
				<TaskActionEditModal />
			</div>
		</>
	);
}
