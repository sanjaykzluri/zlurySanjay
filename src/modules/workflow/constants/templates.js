import React from "react";
import WorkflowsName from "../components/WorkflowName";
import CreatedAt from "../components/CreatedAt";
import WorkflowTableCTA from "../components/WorkflowTableCTA/WorkflowTableCTA";
import WorkflowsNameInTable from "../components/WorkflowName";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export const templatesColumns = [
	{
		column_name: "arrow",
		field_ids: ["arrow"],
	},
	{
		column_name: "playbook_name",
		field_ids: ["playbook_name"],
	},
	{
		column_name: "applications",
		field_ids: ["applications"],
	},
	{
		column_name: "status",
		field_ids: ["status"],
	},
	{
		column_name: "total_runs",
		field_ids: ["total_runs"],
	},
	{
		column_name: "last_used_date",
		field_ids: ["last_used_date"],
	},
	{
		column_name: "total_actions_count",
		field_ids: ["total_actions_count"],
	},
	{
		column_name: "run_playbook",
		field_ids: ["run_playbook"],
	},
	{
		column_name: "edit_playbook",
		field_ids: ["edit_playbook"],
	},
	{
		column_name: "options",
		field_ids: ["options"],
	},
];

export const templatesMoreInfoCol = [
	{
		column_name: "created_on_date",
		field_ids: ["created_on_date"],
	},
	{
		column_name: "created_by_name",
		field_ids: ["created_by_name"],
	},
	{
		column_name: "last_published_by_name",
		field_ids: ["last_published_by_name"],
	},
];
export const templatesColumnsMapper = {
	applications: {
		dataField: "",
		text: "Applications",
		formatter: (data, row) => {
			return (
				<div
					style={{ marginTop: "-3px" }}
					className="d-flex align-items-center pl-3 pr-3"
				>
					<WorkflowsNameInTable
						hideTitle={true}
						title={row?.workflow_name || row?.name}
						id={row?.workflow_id || row?._id}
						allApps={
							(row?.workflow_apps || row?.apps) &&
							(row?.workflow_apps?.length || row?.apps?.length)
								? row?.workflow_apps || row?.apps
								: []
						}
						totalActionsCount={
							row?.workflow_action_count || row?.action_count
								? row?.workflow_action_count ||
								  row?.action_count
								: 0
						}
						total_apps={row?.workflow_app_count || row?.app_count}
						total_actions={
							row?.workflow_action_count || row?.action_count
						}
					/>
				</div>
			);
		},
	},
	playbook_name: {
		dataField: "",
		text: "Playbook",
		formatter: (data, row) => (
			<OverlayTrigger
				placement="top"
				overlay={
					<Tooltip>{row?.workflow_name || row?.name || ""}</Tooltip>
				}
			>
				<h3 className="black-1 font-14 mb-0 mt-2 text-capitalize truncate_15vw pl-3">
					{row?.workflow_name
						? row?.workflow_name?.charAt(0)?.toUpperCase() +
						  row?.workflow_name?.slice(1)
						: row?.name?.charAt(0)?.toUpperCase() +
						  row?.name?.slice(1)}
				</h3>
			</OverlayTrigger>
		),
	},
	created_by: {
		dataField: "created_by",
		text: "Created By",
		formatter: (row, data) => (
			<div className="workflows-workflow-created-by">
				<CreatedAt
					text={data?.created_at}
					user_name={data?.created_by_user_name}
				/>
			</div>
		),
	},
};
