import React from "react";
import { useDispatch } from "react-redux";
import {
	taskActionEllipsisDropdownOptions,
	taskActionEllipsisDropdownViewOption,
} from "../constants/TaskManagement.constants";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import taskActionDropdownEllipsis from "modules/TaskManagement/assets/taskActionDropdownEllipsis.svg";

export default function TaskActionEllipsisDropdown({
	action,
	isApprovalTask = true,
	taskIsCompleted,
}) {
	const dispatch = useDispatch();
	return (
		<>
			<Dropdown
				toggler={
					<div className="task_action_ellipsis_dropdown_toggler">
						<img
							src={taskActionDropdownEllipsis}
							height={16}
							width={16}
							alt=""
						/>
					</div>
				}
				options={
					taskIsCompleted
						? [taskActionEllipsisDropdownViewOption]
						: isApprovalTask
						? taskActionEllipsisDropdownOptions.approval
						: taskActionEllipsisDropdownOptions.workflow
				}
				optionFormatter={(option) => option.text}
				onOptionSelect={(option) =>
					option.onClick && option.onClick(dispatch, action)
				}
				menuClassName="task_action_ellipsis_dropdown_menu"
				optionClassName="task_action_ellipsis_dropdown_option"
			/>
		</>
	);
}
