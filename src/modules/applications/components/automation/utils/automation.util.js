export const getAutomationsPlaybookIdFilterMetaData = (playbookId) => {
	const meta = {
		columns: [],
		filter_by: [],
		group_filter_by: {},
		sort_by: [],
	};

	meta.filter_by = [
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

export const getAutomationsRuleIdFilterMetaData = (ruleId) => {
	const meta = {
		columns: [],
		filter_by: [],
		group_filter_by: {
			entity_group: [],
			entity_type: " ",
		},
		sort_by: [],
	};

	meta.filter_by = [
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
