import React, { useState } from "react";
import "./ViewPlaybook.css";
import { Button } from "UIComponents/Button/Button";
import ViewPlaybookRunUIContainer from "./ViewPlaybookRunUIContainer";
import { useDispatch } from "react-redux";
import { bulkRunAPlaybookForUsers } from "modules/workflow/service/api";
import { updateSelectedUsers } from "modules/workflow/redux/workflow";
import { TriggerIssue } from "utils/sentry";
import { useHistory } from "react-router";

const ViewPlaybookRunUI = ({ loading, playbookData, entity }) => {
	const dispatch = useDispatch();
	const [selectedUsers, setSelectedUsers] = useState([]);

	const handleSelectedUsers = (obj) => {
		const users = [...selectedUsers];
		users.push(obj);
		setSelectedUsers(users);
		dispatch(updateSelectedUsers(users));
	};

	const deleteSelectedUser = (obj) => {
		const users = [...selectedUsers];
		const findIndex = users.findIndex(
			(a) => a.org_user_id === obj.org_user_id
		);
		findIndex !== -1 && users.splice(findIndex, 1);
		setSelectedUsers(users);
		dispatch(updateSelectedUsers(users));
	};

	return (
		<>
			<div
				className="action-list d-flex flex-column justify-content-start flex-1"
				style={{ height: "100%" }}
			>
				<ViewPlaybookRunUIContainer
					loading={loading}
					playbookData={playbookData}
					selectedUsers={selectedUsers}
					setSelectedUsers={handleSelectedUsers}
					deleteSelectedUser={deleteSelectedUser}
					entity={entity}
				/>
			</div>
		</>
	);
};

export default ViewPlaybookRunUI;
