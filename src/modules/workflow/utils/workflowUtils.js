import { workflowTagClassifications } from "../constants/constant";

export const getHyperLinkMetaData = (
	workflowTag,
	workflowIds = null,
	entity
) => {
	const meta = {
		columns: [],
		filter_by: [],
		sort_by: [],
	};

	switch (workflowTag) {
		case workflowTagClassifications.RUNS:
			if (
				workflowIds &&
				Array.isArray(workflowIds) &&
				workflowIds?.length > 0
			) {
				if (entity === "playbook") {
					meta.filter_by.push({
						field_id: `workflow_template_id`,
						field_name: "Playbook Id",
						field_values: workflowIds,
						filter_type: "objectId",
						negative: false,
						is_custom: false,
					});
				} else if (entity === "draft") {
					meta.filter_by.push({
						field_id: `workflow_draft_id`,
						field_name: "Draft Id",
						field_values: workflowIds,
						filter_type: "objectId",
						negative: false,
						is_custom: false,
					});
				}
			}
			break;
		default:
			break;
	}

	return JSON.stringify(meta);
};
