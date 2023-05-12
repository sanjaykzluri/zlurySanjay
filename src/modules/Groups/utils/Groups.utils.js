export const getGroupHyperlinkMetaData = (groupId) => {
	const meta = {
		columns: [],
		filter_by: [],
		group_filter_by: { entity_group: [], entity_type: "" },
		screen_tag: 9,
		sort_by: [],
	};

	meta.filter_by = [
		{
			field_id: "user_groups",
			field_name: "Group ID",
			field_values: [groupId],
			filter_type: "objectId",
			negative: false,
			is_custom: false,
		},
		{
			field_values: false,
			field_id: "user_archive",
			filter_type: "boolean",
			field_name: "Archive",
			negative: false,
			is_custom: false,
		},
	];

	return JSON.stringify(meta);
};
