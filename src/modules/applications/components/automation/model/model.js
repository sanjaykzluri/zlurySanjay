export class WorkFlowAutomationRuleRequestModel {
	constructor(obj) {
		this._id = obj?.id;
		this.org_id = obj?.orgId;
		this.name = obj?.name;
		this.description = obj?.description;
		this.created_by = obj?.createdBy;
		this.priority_order = obj?.order;
		this.trigger_identifier = obj?.triggerIdentifier;
		this.trigger_name = obj?.triggerName;
		this.trigger_values = obj?.triggerValues;
		this.selected_trigger = obj?.selected_trigger;
		this.trigger = obj?.trigger;
		this.events = obj?.events;
		this.conditions = obj?.conditions;
		this.status = obj?.status;
		this.created_at = obj?.createdAt;
		this.updated_at = obj?.updatedAt;
		this.tag = obj?.tag;
		this.__v = obj?.v;
		this.last_applied = obj?.lastApplied;
		this.approval_before_running = obj?.approvalBeforeRunning;
		this.approval_before_running_data = obj?.approvalBeforeRunningData;
		this.stop_processing_other_rules = obj?.stopProcessingOtherRules;
		this.notify_users = obj?.notifyUsers || [];
		this.show_notify_users = obj?.notifyUsers?.length > 0 ? true : false;
		this.is_default = obj?.is_default;
		this.miscellaneous = {
			approvers: obj?.approvers
				? obj.approvers.map((item) => {
						if (item.type === "role") {
							const { type, user_role } = item;
							return { type, user_role };
						}
						return item.user_id;
				  })
				: [],
			on_approval_user: obj?.on_approval_user || {},
			on_offboarding_user: obj?.on_offboarding_user || {},

			on_approval_date: obj?.on_approval_date,
			on_offboarding_date: obj?.on_offboarding_date,
			on_approval_playbook: obj?.on_approval_playbook || {},
			offboarding_playbook: obj?.offboarding_playbook || {},
			has_offboarding_playbook: !!obj?.has_offboarding_playbook,
			has_onboarding_playbook: !!obj?.has_onboarding_playbook,
		};
		this.audit_log_event = obj?.audit_log_event;
		this.mini_playbook_data = {
			tags: obj?.mini_playbook_data?.tags,
			department_tags: obj?.mini_playbook_data?.department_tags,
		};
	}
}

export class WorkFlowAutomationRuleResponseModel {
	constructor(obj) {
		this.id = obj?._id;
		this.orgId = obj?.org_id;
		this.name = obj?.name;
		this.description = obj?.description;
		this.createdBy = obj?.created_by;
		this.order = obj?.priority_order;
		this.triggerIdentifier = obj?.trigger_identifier;
		this.triggerName = obj?.trigger?.title;
		this.triggerValues = obj?.trigger?.values;
		this.trigger = obj?.trigger;
		this.selected_trigger = obj?.selected_trigger;
		this.events = obj?.events;
		this.conditions = obj?.conditions;
		this.status = obj?.status;
		this.createdAt = obj?.created_at;
		this.updatedAt = obj?.updated_at;
		this.tag = obj?.tag;
		this.v = obj?.__v;
		this.lastApplied = obj?.last_applied;
		this.approvalBeforeRunning = obj?.approval_before_running;
		this.approvalBeforeRunningData = obj?.approval_before_running_data;
		this.stopProcessingOtherRules = obj?.stop_processing_other_rules;
		this.notifyUsers = obj?.notify_users || [];
		this.showNotifyUsers = obj?.notify_users?.length > 0 ? true : false;
		this.is_default = obj?.is_default || false;
		this.approvers = obj?.miscellaneous?.approvers || [];
		this.on_approval_user = obj?.miscellaneous?.on_approval_user;
		this.on_offboarding_user = obj?.miscellaneous?.on_offboarding_user;
		this.on_approval_playbook = obj?.miscellaneous?.on_approval_playbook;
		this.on_approval_date = obj?.miscellaneous?.on_approval_date;
		this.on_offboarding_date = obj?.miscellaneous?.on_offboarding_date;
		this.offboarding_playbook =
			obj?.miscellaneous?.offboarding_playbook || {};
		this.has_offboarding_playbook =
			!!obj?.miscellaneous?.has_offboarding_playbook;
		this.has_onboarding_playbook =
			!!obj?.miscellaneous?.has_onboarding_playbook;
		this.mini_playbook_data = obj?.mini_playbook_data;
		this.audit_log_event = obj?.audit_log_event;
	}
}
