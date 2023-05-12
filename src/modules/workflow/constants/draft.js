import React from "react";
import WorkflowsName from "../components/WorkflowName";
import UserInfoTableComponent from "../../../common/UserInfoTableComponent";
import WorkflowTableCTA from "../components/WorkflowTableCTA/WorkflowTableCTA";
import CreatedAt from "../components/CreatedAt";
import Status from "../components/Status";
import DraftUsersDisplay from "../../../common/DraftUsersDisplay";
const draftColumns = [
	{
		column_name: "workflow_name",
		field_ids: ["workflow_name"],
	},
	{
		column_name: "users",
		field_ids: ["name"],
	},
	{
		column_name: "last_edited",
		field_ids: ["last_edited"],
	},
	{
		column_name: "created_by",
		field_ids: ["created_by"],
	},
	{
		column_name: "run_action",
		field_ids: ["run_action"],
	},
	{
		column_name: "options",
		field_id: ["options"],
	},
];

const draftColumnsMapper = {
	workflow_name: {
		dataField: "workflow_name",
		text: "Workflow Name",
		formatter: (data, row) => {
			return (
				<div className="workflows-workflow-name">
					<WorkflowsName
						title={row?.workflow_name}
						allApps={
							row?.workflow_apps && row.workflow_apps.length
								? row.workflow_apps
								: []
						}
						totalActionsCount={
							row?.workflow_action_count
								? row.workflow_action_count
								: 0
						}
						total_apps={row?.workflow_app_count}
						total_actions={row?.workflow_action_count}
					/>
				</div>
			);
		},
	},
	users: {
		dataField: "created_by_user_name",
		text: "Users",
		formatter: (data, row) => (
			<div className="workflows-user-info">
				<DraftUsersDisplay usersList={row?.users} />
			</div>
		),
	},
	last_edited: {
		dataField: "last_edited",
		text: "Last edited",
		formatter: (data, row) => (
			<div className="workflows-workflow-run-details">
				<CreatedAt
					text={row?.last_edited || "N/A"}
					user_name={
						row?.last_edited_by_user_name ||
						row?.created_by_user_name ||
						"N/A"
					}
				/>
			</div>
		),
	},
	created_by: {
		dataField: "created_by_user_name",
		text: "Created By",
		formatter: (data, row) => (
			<div className="workflows-workflow-created-by">
				<Status text={row?.created_by_user_name || "N/A"} />
			</div>
		),
	},
	run_action: {
		dataField: "app_status",
		text: "",
		formatter: (data, row) => (
			<div className="workflows-workflow-action">
				<WorkflowTableCTA
					title="Run"
					onClick={(e) => {
						alert("hi");
					}}
				/>
			</div>
		),
	},
};

export { draftColumnsMapper, draftColumns };
