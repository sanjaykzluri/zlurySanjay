import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import moment from "moment";
import WorkflowsName from "../components/WorkflowName";
import UserInfoTableComponent from "../../../common/UserInfoTableComponent";
import WorkflowTableCTA from "../components/WorkflowTableCTA/WorkflowTableCTA";
import CreatedAt from "../components/CreatedAt";
import Status from "../components/Status";

const automationRulesColumns = [
	{
		column_name: "arrow",
		field_ids: ["arrow"],
	},
	{
		column_name: "name",
		field_ids: ["name"],
	},
	{
		column_name: "status",
		field_ids: ["status"],
	},
	{
		column_name: "last_run",
		field_ids: ["last_run"],
	},
	{
		column_name: "created_at",
		field_ids: ["created_at"],
	},
	{
		column_name: "edit",
		field_ids: ["edit"],
	},
	{
		column_name: "options",
		field_id: ["options"],
	},
];

export const rulesMoreInfoCol = [
	{
		column_name: "created_by",
		field_ids: ["created_by"],
	},
	{
		column_name: "notify_on_trigger",
		field_ids: ["notify_on_trigger"],
	},
];

const appRequisitionAutomationRulesColumns = [
	{
		column_name: "arrow",
		field_ids: ["arrow"],
	},
	{
		column_name: "name",
		field_ids: ["name"],
	},
	{
		column_name: "status",
		field_ids: ["status"],
	},
	{
		column_name: "created_at",
		field_ids: ["created_at"],
	},
	{
		column_name: "edit",
		field_ids: ["edit"],
	},
	{
		column_name: "options",
		field_id: ["options"],
	},
];

export const appRequisitionRulesMoreInfoCol = [
	{
		column_name: "created_by",
		field_ids: ["created_by"],
	},
];
const DisplayDateAndTime = ({ lastApplied }) => (
	<>
		<div className="flex flex-row align-items-center created-at-component">
			<div className="d-flex flex-column created-at-container">
				<OverlayTrigger
					placement="top"
					overlay={
						<Tooltip>
							{moment(lastApplied).format("DD MMMM YYYY") ==
							"Invalid date"
								? "N/A"
								: moment(lastApplied).format("DD MMMM YYYY")}
						</Tooltip>
					}
				>
					<div className="created-at-date">
						{moment(lastApplied).format("DD MMMM YYYY") ==
						"Invalid date"
							? "N/A"
							: moment(lastApplied).format("DD MMMM YYYY")}
					</div>
				</OverlayTrigger>
			</div>
		</div>
	</>
);

const automationRulesColumnsMapper = {
	last_applied: {
		dataField: "last_applied",
		text: "LAST APPLIED",
		formatter: (data, row) => (
			<div className="workflows-workflow-created-by ml-3">
				<DisplayDateAndTime
					lastApplied={row?.last_applied || new Date()}
				/>
			</div>
		),
	},
	created_at: {
		dataField: "created_at",
		text: "Created At",
		formatter: (data, row) => (
			<div className="workflows-workflow-created-by ml-3">
				<DisplayDateAndTime lastApplied={row?.created_at || "N/A"} />
			</div>
		),
	},
};

export {
	automationRulesColumnsMapper,
	automationRulesColumns,
	appRequisitionAutomationRulesColumns,
};
