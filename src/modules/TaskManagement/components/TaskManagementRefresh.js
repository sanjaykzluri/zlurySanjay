import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearTaskCache } from "../redux/TaskManagement.actions";
import refreshIcon from "modules/TaskManagement/assets/refreshIcon.svg";

export default function TaskManagementRefresh() {
	const dispatch = useDispatch();
	const { taskListRequestPayload } = useSelector((state) => state.tasks);
	return (
		<>
			<div
				className="task_management_refresh_box"
				onClick={() => dispatch(clearTaskCache(taskListRequestPayload))}
			>
				<img
					src={refreshIcon}
					height={12}
					width={12}
					alt=""
					className="task_management_refresh_icon"
				/>
			</div>
		</>
	);
}
