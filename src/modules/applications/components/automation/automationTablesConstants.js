export const appPlaybooksColumns = {
	columns: [
		{
			group_name: "arrow",
			field_ids: [],
			is_sortable: false,
			hide_header: true,
		},
		{
			group_name: "workflow",
			field_ids: [],
			is_sortable: false,
		},
		{
			group_name: "status",
			field_ids: [],
			is_sortable: false,
		},
		{
			group_name: "total_actions",
			field_ids: [],
			is_sortable: false,
		},
		{
			group_name: "runs",
			field_ids: [],
			is_sortable: false,
		},
		{
			group_name: "run_playbook",
			field_ids: [],
			is_sortable: false,
			hide_header: true,
		},
		{
			group_name: "edit",
			field_ids: [],
			is_sortable: false,
			hide_header: true,
		},
		{
			group_name: "options",
			field_ids: [],
			is_sortable: false,
			hide_header: true,
		},
	],
};

export const appPlaybooksMoreInfoCol = [
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

export const automationRulesColumns = {
	columns: [
		{
			group_name: "arrow",
			field_ids: [],
			is_sortable: false,
			hide_header: true,
		},
		{
			group_name: "rule",
			field_ids: [],
			is_sortable: false,
		},
		{
			group_name: "status",
			field_ids: [],
			is_sortable: false,
		},
		{
			group_name: "runs",
			field_ids: [],
			is_sortable: false,
		},

		{
			group_name: "created_by",
			field_ids: [],
			is_sortable: false,
		},
		{
			group_name: "edit",
			field_ids: [],
			is_sortable: false,
			hide_header: true,
		},
		{
			group_name: "options",
			field_ids: [],
			is_sortable: false,
			hide_header: true,
		},
	],
};

export const automationRulesMoreInfoCol = [
	{
		column_name: "created_by_name",
		field_ids: ["created_by_name"],
	},
];

export const automationTableTabs = {
	appPlaybooksProvision: "appPlaybooksProvision",
	appPlaybooksDeprovision: "appPlaybooksDeprovision",
	appPlaybooksAppManagement: "appPlaybooksAppManagement",
	automationRulesProvision: "automationRulesProvision",
	automationRulesDeprovision: "automationRulesDeprovision",
	automationRulesAppManagement: "automationRulesAppManagement",
	runs: "runs",
	miniplaybooks: "miniplaybooks",
};
