import React from "react";
import WorkflowsName from "../components/WorkflowName";
import WorkflowTableCTA from "../components/WorkflowTableCTA/WorkflowTableCTA";
import CreatedAt from "../components/CreatedAt";
import Status from "../components/Status";
import DraftUsersDisplay from "common/DraftUsersDisplay";

const scheduledRunsColumns = [
	{
		column_name: "user",
		field_ids: ["run_for_user_name", "run_for_user_profile"],
	},
	{
		column_name: "workflow_name",
		field_ids: ["workflow_name"],
	},
	{
		column_name: "run_by",
		field_ids: ["run_by_user_name", "run_by_user_id", "run_on"],
	},
	{
		column_name: "scheduled_on_utc",
		field_ids: ["run_by_user_name", "run_by_user_id", "run_on"],
	},
	{
		column_name: "workflow_status",
		field_ids: ["workflow_status"],
	},
	{
		column_name: "created_by",
		field_ids: [
			"created_by_user_id",
			"created_by_user_name",
			"created_by_user_profile",
		],
	},
	{
		column_name: "view_log_action",
		field_ids: ["view_log_action"],
	},
];

const scheduledRunsColumnsMapper = {
	user: {
		dataField: "users",
		text: "Users",
		formatter: (data, row) => {
			return (
				<div className="workflows-user-info" key={row._id}>
					<DraftUsersDisplay usersList={row?.users} />
				</div>
			);
		},
	},
	workflow_name: {
		dataField: "workflow_name",
		text: "Workflow Name",
		formatter: (data, row) => {
			return (
				<div className="workflows-workflow-name">
					<WorkflowsName
						title={row?.workflow_name}
						allApps={row?.apps && row.apps.length ? row.apps : []}
						totalActionsCount={
							row?.action_count ? row.action_count : 0
						}
						total_apps={row?.app_count}
						total_actions={row?.action_count}
					/>
				</div>
			);
		},
	},
	run_by: {
		dataField: "run_details",
		text: "Scheduled Time",
		formatter: (data, row) => (
			<div className="workflows-workflow-run-details">
				<CreatedAt
					text={row?.scheduledData?.scheduled_date}
					user_name={row?.scheduled_by_user_name}
					source={row?.source}
					rule_name={row?.rule_name}
					showTime={true}
					showAmPm={true}
					showAbbr={true}
					showScheduledTime={true}
					scheduledData={row?.scheduledData}
				/>
			</div>
		),
	},
	scheduled_on_utc: {
		dataField: "scheduled_on_utc",
		text: "Scheduled Time ( UTC )",
		formatter: (data, row) => {
			return (
				<div className="workflows-workflow-run-details">
					<CreatedAt
						text={row?.scheduledData?.scheduled_date}
						user_name={row?.scheduled_by_user_name}
						source={row?.source}
						rule_name={row?.rule_name}
						showTime={true}
						showAmPm={true}
						showUTC={true}
					/>
				</div>
			);
		},
	},
	workflow_status: {
		dataField: "workflow_status",
		text: "Status",
		formatter: (data, row) => (
			<div className="workflows-workflow-status">
				<Status
					completed={row?.completed_actions_count}
					failed={row?.failed_actions_count}
					pending={row?.pending_actions_count}
					text={row?.status}
				/>
			</div>
		),
	},
	created_by: {
		dataField: "created_by",
		text: "Scheduled by",
		formatter: (data, row) => (
			<div className="workflows-workflow-created-by">
				<Status
					text={row?.scheduled_by_user_name}
					source={row?.source}
				/>
			</div>
		),
	},
	view_log_action: {
		dataField: "view_log_action",
		text: "",
		formatter: (row, data) => (
			<div className="workflows-workflow-action">
				<WorkflowTableCTA title="View Log" onClick={(e) => {}} />
			</div>
		),
	},
};

export { scheduledRunsColumnsMapper, scheduledRunsColumns };
