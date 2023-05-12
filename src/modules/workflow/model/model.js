export class WorkFlowApplicationModel {
	constructor(obj) {
		this.id = obj?.app_id;
		this.name = obj?.app_name || obj.name;
		this.logo = obj?.app_logo || obj.logo;
		this.state = obj?.app_state;
		this.url = obj?.app_url;
		this.actions = obj.actions
			? obj.actions.map((action) => new WorkFlowActionModel(action))
			: [];
		this.workflowApplicationID = obj._id;
		this.orgIntegrationID = obj.org_integration_id;
		this.orgIntegrationName = obj.org_integration_name;
		this.isAppAdded = obj?.isAppAdded || false;
		this.isStatic = obj?.is_default || false;
		this.is_default = obj?.is_default || false;
		this.isGrouped = obj?.group_state;
		this.notApplicableUsers = obj?.app_not_used_by || [];
		this.applicableUsers = obj?.app_used_by || [];
		this.apps =
			(obj.apps?.length > 0 &&
				obj.apps.map((app) => {
					return {
						id: app.app_id,
						name: app.app_name,
						logo: app.app_logo,
						notApplicableUsers: app?.app_not_used_by || [],
						applicableUsers: app?.app_used_by || [],
					};
				})) ||
			[];
	}
}

export class WorkFlowApplicationRequestModel {
	constructor(obj) {
		this.app_id = obj?.id;
		this.app_name = obj?.app_name || obj.name;
		this.app_logo = obj?.app_logo || obj.logo;
		this.app_state = obj?.state;
		this.app_url = obj?.url;
		this.actions = obj.actions
			? obj.actions.map(
					(action) => new WorkFlowActionRequestModel(action)
			  )
			: [];
		this._id = obj.workflowApplicationID;
		this.org_integration_id = obj.orgIntegrationID;
		this.org_integration_name = obj.orgIntegrationName;
		this.isAppAdded = obj?.isAppAdded || false;
		this.is_default = obj?.isStatic || false;
		this.group_state = obj?.isGrouped;
		this.app_not_used_by = obj?.notApplicableUsers || [];
		this.app_used_by = obj?.applicableUsers || [];
		this.apps =
			(obj.apps?.length > 0 &&
				obj.apps.map((app) => {
					return {
						app_id: app.app_id,
						app_name: app.app_name,
						app_logo: app.app_logo,
						app_not_used_by: app?.app_not_used_by || [],
						app_used_by: app?.app_used_by || [],
					};
				})) ||
			[];
	}
}

export class AppDescriptionModel {
	constructor(obj) {
		this.id = obj?._id;
		this.name = obj?.app_name || obj?.name;
		this.logo = obj?.app_logo || obj?.logo;
		this.isCustomApp = obj?.app_is_custom;
		this.appState = obj?.app_state;
		this.appStatus = obj?.app_status;
		this.appArchive = obj?.app_archive;
		this.appUsage = obj?.app_usage;
		this.appUserCount = obj?.app_user_count;
		this.appCategory = obj?.app_sub_categories[0]?.category_name
			? obj.app_sub_categories[0].category_name
			: "";
	}
}

export class AllManualTaskTemplatesModel {
	constructor(obj) {
		this.id = obj?._id;
		this.name = obj?.name;
		this.description = obj?.description;
		this.template_id = obj?.template_id;
		this.title = obj?.title;
		this.inputFields = obj?.inputFields || [];
		this.logo = obj?.logo;
	}
}

export class WorkFlowActionModel {
	constructor(obj) {
		this.id = obj?.action_id;
		this.group = obj?.action_group || obj?.group;
		this.orgIntegrationID = obj?.org_integration_id;
		this.type = obj?.type || obj?.action_type;
		this.isPermissionAllowed = obj?.is_permission_allowed;
		this.name = obj?.action_name || obj?.name;
		this.description = obj?.action_description || obj?.description;
		this.breakOnError = obj?.break_on_error || false;
		this.data = obj?.action_data || [];
		this.status = obj?.action_status;
		this.workflowActionID = obj?.workflow_action_id;
		this.singleUse = obj?.singleUse;
		this.isValidated = obj?.is_validated;
		this.isScopeValidated = obj?.is_scope_validated || false;
		this.selectedDynamicOptions = obj?.selected_dynamic_options;
		this.actionType = obj?.actionType;
		this.isCustom = obj?.is_custom || false;
		this.assignee_relation = obj?.assignee_relation || null;
		this.manual_action_template_id = obj?.manual_action_template_id || null;
		this.data_reusable = obj?.data_reusable || false;
		this.uniqId = obj?.uniqId;
		this._id = obj?._id;
		this.dueDateData = obj?.dueDateData;
		this.isScheduledAction = obj?.isScheduledAction;
		this.scheduledData = obj?.scheduledData;
		this.approvers = obj?.approvers;
		this.isSetForApproval = obj?.isSetForApproval;
		this.zluri_user_relation = obj?.zluri_user_relation;
		this.prerequisites = obj?.prerequisites;
		this.sso_action = obj?.sso_action;
		this.sso_data = obj?.sso_data;
	}
}

export class WorkFlowActionRequestModel {
	constructor(obj) {
		this.action_id = obj?.id;
		this.action_group = obj?.action_group || obj?.group;
		this.org_integration_id = obj?.orgIntegrationID;
		this.action_type = obj?.type || obj?.action_type;
		this.is_permission_allowed = obj?.isPermissionAllowed;
		this.action_name = obj?.action_name || obj?.name;
		this.action_description = obj?.action_description || obj?.description;
		this.break_on_error = obj?.breakOnError || false;
		this.action_data = obj?.data || [];
		this.action_status = obj?.status;
		this.workflow_action_id = obj?.workflowActionID;
		this.singleUse = obj?.singleUse;
		this.is_validated = obj?.isValidated;
		this.is_scope_validated = obj?.isScopeValidated || false;
		this.selected_dynamic_options = obj?.selectedDynamicOptions;
		this.actionType = obj?.actionType;
		this.is_custom = obj?.isCustom || false;
		this.assignee_relation = obj?.assignee_relation || null;
		this.manual_action_template_id = obj?.manual_action_template_id || null;
		this.data_reusable = obj?.data_reusable || false;
		this.uniqId = obj?.uniqId;
		this._id = obj?._id;
		this.dueDateData = obj?.dueDateData;
		this.isScheduledAction = obj?.isScheduledAction;
		this.scheduledData = obj?.scheduledData;
		this.approvers = obj?.approvers;
		this.isSetForApproval = obj?.isSetForApproval;
		this.zluri_user_relation = obj?.zluri_user_relation;
		this.prerequisites = obj?.prerequisites;
		this.sso_action = obj?.sso_action;
		this.sso_data = obj?.sso_data;
	}
}

export class WorkflowModel {
	constructor(obj) {
		this.id = obj._id;
		this.name = obj.name;
		this.type = obj.type;
		this.createdOn = new Date(obj.created_on || obj?.created_at);
		this.nodes = obj.nodes
			? obj.nodes.map((item) => new WorkFlowApplicationModel(item))
			: [];
		this.users = obj.users?.map((user) => ({ ...user, _id: user.user_id }));
		this.orgID = obj.org_id;
		this.source = obj.source;
		this.isExecuted = obj.is_executed;
		this.updatedOn = obj.updated_at ? new Date(obj.updated_at) : null;
		this.createdByUserName = obj?.created_by_user_name;
		this.lastUsedByUserName = obj?.last_used_by_user_name;
		this.lastUsedAt = obj?.last_used_at;
		this.publishedByUserName = obj?.published_by_user_name;
		this.publishedAt = obj?.published_at;
		this.is_published = obj?.is_published;
		this.app_count = obj?.app_count;
		this.total_action_count = obj?.total_action_count;
		this.manual_action_count = obj?.manual_action_count;
		this.mini_playbook_data = obj.mini_playbook_data
			? obj.mini_playbook_data
			: undefined;
		this.createdByUserName = obj?.created_by_user_name;
		this.editedByUserName = obj?.edited_by_user_name;
	}
}
export class WorkflowTemplateSearchModel {
	constructor(obj) {
		this.workflowTemplateId =
			obj.workflow_id || obj?.workflowTemplateId || obj?._id;
		this.workflowTemplateName =
			obj.workflow_name || obj?.workflowTemplateName || obj?.name;
		this.type = obj.type;
		this.workflow_apps = obj?.workflow_apps || obj?.apps;
		this.workflow_action_count =
			obj?.workflow_action_count || obj?.action_count;
		this.workflow_app_count = obj?.workflow_app_count || obj?.app_count;
	}
}

export class AutomationRuleEventModel {
	constructor(obj) {
		this.workflowTemplateId =
			obj.workflow_id || obj?.workflowTemplateId || obj?._id;
		this.workflowTemplateName =
			obj.workflow_name || obj?.workflowTemplateName || obj?.name;
		this.type = obj.type;
		this.workflow_action_count =
			obj?.workflow_action_count || obj?.action_count;
		this.workflow_app_count = obj?.workflow_app_count || obj?.app_count;
	}
}

export class Completed {
	constructor(obj) {
		this.workflow_id = obj.workflow_id;
		this.workflow_runId = obj._id;
		this.workflow_name = obj.workflow_name;
		this.workflow_type = obj.workflow_type;
		this.workflow_status = obj.workflow_status;
		this.workflow_template_id = obj.workflow_template_id;
		this.run_for_user_id = obj.run_for_user_id;
		this.run_for_user_name = obj.run_for_user_name;
		this.run_for_user_profile = obj.run_for_user_logo;
		this.created_by_user_id = obj.created_by_user_id;
		this.created_by_user_name = obj.created_by_user_name;
		this.created_by_user_profile = obj.created_by_user_logo;
		this.created_on = obj.created_on;
		this.run_on = obj.run_timestamp;
		this.run_by_user_id = obj.run_by_user_id;
		this.run_by_user_name = obj.run_by_user_name;
		this.workflow_app_count = obj.app_count;
		this.workflow_action_count =
			obj.action_count || obj.total_actions_count;
		this.workflow_apps = obj.apps;
		this.completed_actions_count = obj.completed_actions_count;
		this.pending_actions_count = obj.pending_actions_count;
		this.failed_actions_count = obj.failed_actions_count;
	}
}
export class CompletedApps {
	constructor(obj) {
		this.id = obj.app_id;
		this.app_name = obj.app_name;
		this.app_logo = obj.app_logo;
	}
}

export class WorkFlowOffboardingTasksModel {
	constructor(obj) {
		this.id = obj?.action_id;
		this.workflowActionId = obj?.workflow_action_id;
		this.actionName = obj?.action_name;
		this.appName = obj?.app_name;
		this.appLogo = obj?.app_logo;
		this.appId = obj.app_id;
		this.recentActivity = obj.user_app_last_activity;
		this.userRole = obj.user_app_role;
		this.appUrl = obj?.app_url;
		this.actionStatus = obj?.action_status;
		this.appActionStatus = obj?.app_action_status;
		this.dueDate = obj?.due_date;
	}
}

export class WorkFlowOffboardingDashboardModel {
	constructor(obj) {
		this.id = obj?.workflow_execution_id;
		this.declarationSigned = obj?.declaration_signed;
		this.declarationSignedOn = obj?.declaration_signed_on;
		this.actions = obj.actions
			? obj.actions.map(
					(action) => new WorkFlowOffboardingTasksModel(action)
			  )
			: [];
	}
}

export class CompletedV2 {
	constructor(obj) {
		this.workflow_id = obj.workflow_id;
		this.workflow_runId = obj._id;
		this.workflow_name = obj.name;
		this.workflow_type = obj.type;
		this.workflow_status = obj.status;
		this.workflow_template_id = obj.workflow_template_id;
		this.run_for_user_id = obj.user_id;
		this.run_for_user_name = obj.user_name;
		this.run_for_user_profile = obj.user_logo;
		this.created_by_user_id = obj.created_by_user_id;
		this.created_by_user_name = obj.created_by_user_name;
		this.created_by_user_profile = obj.created_by_user_logo;
		this.created_on = obj.created_on;
		this.run_on = obj.run_timestamp;
		this.run_by_user_id = obj.run_by_user_id;
		this.run_by_user_name = obj.run_by_user_name;
		this.workflow_app_count = obj.app_count;
		this.workflow_action_count =
			obj.action_count || obj.total_actions_count;
		this.workflow_apps = obj.apps;
		this.completed_actions_count = obj.completed_actions_count;
		this.pending_actions_count = obj.pending_actions_count;
		this.failed_actions_count = obj.failed_actions_count;
		this.source = obj?.source;
		this.rule_id = obj?.rule_id;
		this.rule_name = obj?.rule_name;
		this.archive = obj?.archive;
	}
}
export class WorkFlowAutomationRulesModel {
	constructor(obj) {
		this.id = obj?._id;
		this.orgId = obj?.org_id;
		this.name = obj?.name;
		this.description = obj?.description;
		this.createdBy = obj?.created_by;
		this.order = obj?.priority_order;
		this.trigger = obj?.trigger;
		this.events = obj?.events;
		this.status = obj?.status;
		this.createdAt = obj?.created_at;
		this.updatedAt = obj?.updated_at;
		this.v = obj?.__v;
		this.lastApplied = obj?.last_applied;
		this.tag = obj?.tag;
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
		this.triggerName = obj?.trigger_name || obj?.trigger_title;
		this.triggerValues = obj?.trigger_values;
		this.trigger = obj?.trigger;
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
		this.audit_log_event = obj?.audit_log_event;
	}
}

export class WorkFlowAutomationRuleRequestModel {
	constructor(obj) {
		this._id = obj?.id;
		this.org_id = obj?.orgId;
		this.name = obj?.name;
		this.description = obj?.description;
		this.created_by = obj?.createdBy;
		this.priority_order = obj?.order;
		this.audit_log_events = obj?.triggerIdentifier;
		this.trigger_name = obj?.triggerName || obj?.trigger_title;
		this.trigger_values = obj?.triggerValues || obj?.trigger_values;
		this.trigger = obj?.trigger;
		this.events = obj?.events;
		this.conditions = {
			any: obj?.conditions?.any?.filter((value) => value.all.length > 0),
		};
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
	}
}

export class AutomationRuleCustomFieldModel {
	constructor(obj) {
		this._id = obj._id;
		this.name = obj.field_name;
		this.type = obj.field_type;
		this.values = obj.field_options
			? obj.field_options
					.map(
						(item) =>
							(obj.field_options[item] = {
								label: item,
								value: item,
							})
					)
					.filter((item) => item.label !== "")
			: [];
		this.search_entity = obj.field_reference;
		this.orgID = obj.org_id;
		this.isCustomField = true;
		this.path = obj?.path || "";
		this.fact = obj?.fact || "";
	}
}
