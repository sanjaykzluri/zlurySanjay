import { openModal } from "reducers/modal.reducer";

export const AddUserToDepartmentOptions = [
	{
		label: "Add a new user",
		onClick: ({ dispatch, deptId, deptName, handleRefresh }) =>
			dispatch(
				openModal("user", {
					handleRefresh,
					deptFieldDisabled: true,
					department_id: deptId,
					department_name: deptName,
				})
			),
	},
	{
		label: "Add an existing user",
		onClick: ({ dispatch, deptId, handleRefresh }) =>
			dispatch(
				openModal("addExistingUserToDepartment", {
					handleRefresh,
					deptId,
				})
			),
	},
];
