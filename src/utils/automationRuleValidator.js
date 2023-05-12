import _ from "underscore";
const allowedTags = ["onboarding_date", "offboarding_date"];
export const validation = (rule) => {
	if (rule.name === "" || rule.description === "") {
		return false;
	}
	if (
		rule.tag === "apprequisition" &&
		rule?.events?.[0]?.type !== "auto_rejection" &&
		(!rule.approvers ||
			rule.approvers?.length === 0 ||
			(_.isEmpty(rule.on_approval_user) &&
				_.isEmpty(rule.on_approval_playbook)) ||
			(!_.isEmpty(rule.on_approval_user) && !rule.on_approval_date) ||
			(_.isEmpty(rule.on_approval_user) &&
				_.isEmpty(rule.on_approval_playbook)) ||
			(!_.isEmpty(rule.on_offboarding_user) && !rule.on_offboarding_date)) ||
			(rule.disable_access_on_offboarding && (_.isEmpty(rule.on_offboarding_user) || !rule.on_offboarding_date))

	) {
		return false;
	}
	if (
		rule?.conditions &&
		Object.keys(rule?.conditions).length > 0 &&
		!isOperatorAndConditionSelected(rule)
	) {
		return false;
	}
	if (rule.tag !== "apprequisition") {
		if (
			rule?.events?.filter(
				(event) =>
					event.type === "run_workflow" && event.workflowTemplateId
			).length === 0
		) {
			return false;
		}
		if (rule?.showNotifyUsers && rule?.notifyUsers.length === 0) {
			return false;
		}
	}
	return true;
};
const isOperatorAndConditionSelected = (rule) => {
	const { any = [] } = rule?.conditions;
	const arr = [];
	any?.length > 0 &&
		any
			?.map((item) => {
				const { all = [] } = item;
				all?.length > 0 &&
					all?.map((cond) => {
						if (
							(!cond?.hasOwnProperty("operator") ||
								!cond?.hasOwnProperty("value") ||
								!cond?.value ||
								(Array.isArray(cond?.value) &&
									cond?.value?.length === 0)) &&
							cond?.fact !== "no_conditions"
						) {
							arr.push(cond);
							return true;
						}
						return false;
					});
				return false;
			})
			?.filter((_id) => _id);
	if (arr?.length > 0) {
		return false;
	} else {
		return true;
	}
};
