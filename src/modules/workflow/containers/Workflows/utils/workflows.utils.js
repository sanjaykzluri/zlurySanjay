export const getWorkflowsPlaybookIdFilterMetaData = (playbookId) => {
	const meta = {
		columns: [],
		filter_by: [],
		reset_filter: false,
		sort_by: [],
	};

	meta.filter_by = [
		{
			field_id: "archive",
			field_name: "Archive",
			field_values: false,
			filter_type: "boolean",
			is_custom: false,
			negative: false,
		},
		{
			field_id: "workflow_template_id",
			field_name: "Playbook Id",
			field_values: [playbookId],
			filter_type: "objectId",
			is_custom: false,
			negative: false,
		},
	];

	return JSON.stringify(meta);
};

export const getWorkflowsRuleIdFilterMetaData = (ruleId) => {
	const meta = {
		columns: [],
		filter_by: [],
		reset_filter: false,
		sort_by: [],
	};

	meta.filter_by = [
		{
			field_id: "archive",
			field_name: "Archive",
			field_values: false,
			filter_type: "boolean",
			is_custom: false,
			negative: false,
		},
		{
			field_id: "rule_id",
			field_name: "Rule Id",
			field_values: [ruleId],
			filter_type: "objectId",
			is_custom: false,
			negative: false,
		},
	];

	return JSON.stringify(meta);
};
