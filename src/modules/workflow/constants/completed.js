import React from "react";
import WorkflowsName from "../components/WorkflowName";
import UserInfoTableComponent from "../../../common/UserInfoTableComponent";
import WorkflowTableCTA from "../components/WorkflowTableCTA/WorkflowTableCTA";
import CreatedAt from "../components/CreatedAt";
import Status from "../components/Status";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ruleBlueIcon from "../../../assets/rule-blue-icon.svg";
import draftBlueIcon from "../../../assets/draft-blue-icon.svg";
import playbookBlueIcon from "../../../assets/playbook-blue-icon.svg";

const completedColumns = [
	{
		column_name: "user",
		field_ids: ["run_for_user_name", "run_for_user_profile"],
	},
	{
		column_name: "source_name",
		field_ids: ["source_name"],
	},
	{
		column_name: "source_type",
		field_ids: ["source_type"],
	},
	{
		column_name: "run_by",
		field_ids: ["run_by_user_name", "run_by_user_id", "run_on"],
	},
	{
		column_name: "run_on_utc",
		field_ids: ["run_by_user_name", "run_by_user_id", "run_on"],
	},
	{
		column_name: "workflow_status",
		field_ids: ["workflow_status"],
	},
	{
		column_name: "view_log_action",
		field_ids: ["view_log_action"],
	},
	{
		column_name: "option",
		field_ids: ["option"],
	},
];

const completedColumnsMapper = {
	user: {
		dataField: "name",
		text: "User",
		formatter: (data, row) => {
			return (
				<div className="workflows-user-info" key={row._id}>
					<UserInfoTableComponent
						profile_img={row?.run_for_user_profile}
						user_name={row?.run_for_user_name}
						user_id={row?.run_for_user_id}
					/>
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
	source_name: {
		dataField: "",
		text: "Workflow",
		formatter: (data, row) => {
			return (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>{row?.workflow_name}</Tooltip>}
				>
					<div className="truncate_10vw">
						{row?.workflow_name?.charAt(0).toUpperCase() +
							row?.workflow_name?.slice(1)}
					</div>
				</OverlayTrigger>
			);
		},
	},
	run_by: {
		dataField: "run_details",
		text: `Run On`,
		formatter: (data, row) => (
			<div className="workflows-workflow-run-details">
				<CreatedAt
					text={row?.run_on}
					user_name={row?.run_by_user_name}
					source={row?.source}
					rule_name={row?.rule_name}
					showTime={true}
					showAmPm={true}
				/>
			</div>
		),
	},
	run_on_utc: {
		dataField: "run_details",
		text: `Run On ( UTC )`,
		formatter: (data, row) => (
			<div className="workflows-workflow-run-details">
				<CreatedAt
					text={row?.run_on}
					user_name={row?.run_by_user_name}
					source={row?.source}
					rule_name={row?.rule_name}
					showTime={true}
					showUTC={true}
					showAmPm={true}
				/>
			</div>
		),
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
					text={row?.workflow_status}
				/>
			</div>
		),
	},
	created_by: {
		dataField: "created_by",
		text: "Created By",
		formatter: (data, row) => (
			<div className="workflows-workflow-created-by">
				<Status text={row?.created_by_user_name} source={row?.source} />
			</div>
		),
	},
	view_log_action: {
		dataField: "view_log_action",
		text: "",
		formatter: (row, data) => (
			<div className="workflows-workflow-action">
				<WorkflowTableCTA
					title="View Log"
					onClick={(e) => {
						alert("hi");
					}}
				/>
			</div>
		),
	},
	option: {
		dataField: "option",
		text: "",
		formatter: (row, data) => (
			<div className="workflows-workflow-action">
				<WorkflowTableCTA title="View Log" onClick={(e) => {}} />
			</div>
		),
	},
};

export const sourceInfo = (userName) => ({
	rule: {
		title: "Rule",
		subscript: `Trigerred by ${userName}`,
		image: ruleBlueIcon,
	},
	playbook: {
		title: "Playbook",
		subscript: `Manually by ${userName}`,
		image: playbookBlueIcon,
	},
	draft: {
		title: "Draft",
		subscript: `Manually by ${userName}`,
		image: draftBlueIcon,
	},
	scheduled_playbook: {
		title: "Scheduled By",
		subscript: `Scheduled by ${userName}`,
		image: playbookBlueIcon,
	},
	scheduled_draft: {
		title: "Scheduled By",
		subscript: `Scheduled by ${userName}`,
		image: draftBlueIcon,
	},
	zapier: {
		title: "Zapier",
		subscript: `Triggered by Zapier`,
		image: playbookBlueIcon,
	},
});

export { completedColumnsMapper, completedColumns };
