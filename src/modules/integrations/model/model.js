import {
	getNumberOfDaysBtwnTwoDates,
	timeSince,
} from "../../../utils/DateUtility";
import { isEmpty } from "../../../utils/common";
import { INTEGRATION_STATUS } from "../constants/constant";
import moment from "moment";
export class IntegrationCategory {
	constructor(obj) {
		this.id = obj.category_id;
		this.name = obj.category_name;
	}
}

export class Integration {
	constructor(obj) {
		this.categoryId = obj.integration_category_id || obj.category?._id;
		this.categoryName = obj.integration_category_name || obj.category?.name;
		this.connectURL = obj.integration_connect_url;
		this.disconnectURL = obj.integration_disconnect_url;
		this.learnURL =
			obj.integration_learn_more_link || obj.integration_developer_link;
		this.privacyLink =
			obj.integration_privacy_policy_link || obj.privacy_policy;
		this.description = obj.integration_description;
		this.shortDescription =
			obj.integration_short_description || obj.short_description;
		this.name = obj.integration_name || obj.name;
		this.logo = obj.integration_logo || obj.logo_url;
		this.status = obj?.integration_status
			? obj.integration_status
			: INTEGRATION_STATUS.NOT_CONNECTED;
		this.usersCount = obj.integration_user_count;
		this.id = obj.integration_id || obj._id;
		this.settings = obj.integration_settings;
		this.permissions = obj.integration_permissions || [];
		this.active = obj.integration_active;
		this.developerEmails = obj.integration_developer_email;
		this.tags = obj.integration_tags;
		this.error = obj.integration_error_message;
		this.similarIntegrations = obj.similar_integrations?.map(
			(integration) => new Integration(integration)
		);
		this.isUserMappingEnabled = obj.integration_is_user_mapping;
		this.orgIntegrationID = obj?.org_integration_id;
		this.lastSync = obj?.last_sync_date
			? timeSince(obj.last_sync_date)
			: null;
		this.isPublished =
			obj?.integration_is_published === false ? false : true;
		this.form = obj.integration_form_fields || [];
		this.helpURL = obj.integration_help_url;
		this.helpText = obj.integration_help_text;
		this.requestStatus =
			obj.integration_invite_status || obj.integration_request_status;
		this.requestDetails = obj.integration_invite_object
			? new PendingRequestIntegration(obj.integration_invite_object)
			: null;
		this.accounts = obj.org_intgr_data;
		this.pendingAccounts = obj.pending_accounts_request;
		this.num_pending_accounts = obj.pending_accounts;
		this.error_accounts = obj.error_accounts;
		this.connected_accounts = obj.connected_accounts;
		this.enable_finance_filter = obj.enableFinanceFilter || false;
		this.available_for_poc = obj.available_for_poc || false;
		this.available_to_connect = obj.available_to_connect || false;
		this.supported_plan_types = obj.supported_plan_types;
		this.support_link = obj.support_link;
		this.support_email = obj.support_email;
		this.integration_developer_email = obj.integration_developer_email;
		this.integration_developer_link = obj.integration_developer_link;
		this.privacy_policy = obj.privacy_policy;
		this.app_marketplace_url = obj.app_marketplace_url;
		this.supported_languages = obj.supported_languages;
		this.last_update_date = obj.last_update_date;
		this.is_trusted =
			obj.integration_is_trusted || obj.publish_details?.is_trusted;
		this.connectedScopes = obj.connected_scopes;
		this.allScopes = obj.integration_scopes;
		this.toBeConnectedScopes = obj.new_scopes;
		this.stepsToConnect = obj.steps_to_connect;
		// this.isPublished = obj.publish_details?.is_published;
		this.isTrending =
			obj.publish_details?.is_trending || obj.is_trending || false;
		this.isFeatured =
			obj.publish_details?.is_featured || obj.is_featured || false;
		this.isPopular =
			obj.publish_details?.is_popular || obj.is_popular || false;
		this.disconnected_accounts = obj.disconnected_accounts;
		this.show_data_source_tab = obj.show_data_source_tab || false;
	}
}

export class V2IntegrationCategory {
	constructor(obj) {
		this.categoryId = obj.integration_category_id;
		this.categoryName = obj.integration_category_name;
		this.integrations = isEmpty(obj.integrations)
			? []
			: obj.integrations.map((int) => new Integration(int));
	}
}

export class PendingRequestIntegration {
	constructor(obj) {
		this.name = obj.integration_name;
		this.logo = obj.integration_logo;
		this.requestStatus = obj.request_status;
		this.id = obj.integration_id;
		this.invite_id = obj.invite_id;
		this.requestOn = obj.request_sent_on
			? moment(obj.request_sent_on).format("D MMM 'YY, h:mm")
			: null;
		this.sentToUserID = obj.sent_to_user_id;
		this.accountName = obj.account_name;
		this.sentToUserName = obj.sent_to_user_name;
		this.sentToUserEmail = obj.sent_to_user_email;
		this.expiresOn = obj.expires_on
			? Math.abs(
					moment([
						new Date(obj.expires_on).getUTCFullYear(),
						new Date(obj.expires_on).getMonth(),
						new Date(obj.expires_on).getDate(),
					]).diff(
						moment([
							new Date().getUTCFullYear(),
							new Date().getMonth(),
							new Date().getDate(),
						]),
						"days"
					)
			  )
			: null;
		this.expiresInHours = obj.expires_on
			? Math.abs(
					moment([
						new Date(obj.expires_on).getUTCFullYear(),
						new Date(obj.expires_on).getMonth(),
						new Date(obj.expires_on).getDate(),
						new Date(obj.expires_on).getHours(),
					]).diff(
						moment([
							new Date().getUTCFullYear(),
							new Date().getMonth(),
							new Date().getDate(),
							new Date().getHours(),
						]),
						"hours"
					)
			  )
			: null;
		this.connectedOn = obj.connected_on
			? moment(obj.connected_on).format("D MMM, h:mm")
			: null;
		this.reminding = false;
		this.resending = false;
		this.withdrawing = false;
		this.updatedAt = obj.updated_at;
	}
}

export class V2Integration {
	constructor(obj) {
		this.categoryId = obj.integration_category_id;
		this.categoryName = obj.integration_category_name;
		this.connectURL = obj.integration_connect_url;
		this.disconnectURL = obj.integration_disconnect_url;
		this.learnURL =
			obj.integration_learn_more_link || obj.integration_developer_link;
		this.privacyLink = obj.integration_privacy_policy_link;
		this.description = obj.integration_description;
		this.shortDescription = obj.integration_short_description;
		this.name = obj.integration_name;
		this.logo = obj.integration_logo;
		this.usersCount = obj.integration_user_count;
		this.id = obj.integration_id || obj._id;
		this.settings = obj.integration_settings;
		this.permissions = obj.integration_permissions;
		this.developerEmails = obj.integration_developer_email;
		this.tags = obj.integration_tags;
		this.isUserMappingEnabled = obj.integration_is_user_mapping;
		this.isPublished = obj?.integration_is_published ? true : false;
		this.helpURL = obj.integration_help_url;
		this.helpText = obj.integration_help_text;
		this.instances = isEmpty(obj.org_intgr_data)
			? []
			: obj.org_intgr_data.map(
					(instance) =>
						new Instance(instance, obj.integration_is_user_mapping)
			  );
		this.form = obj.integration_form_fields || [];
		this.available_for_poc = obj.available_for_poc || false;
		this.supported_plan_types = obj.supported_plan_types;
		this.supported_languages = obj.supported_languages;
		this.last_update_date = obj.last_update_date;
		this.is_trusted =
			obj.integration_is_trusted || obj.publish_details?.is_trusted;
		this.shouldMapUser = obj.integration_is_user_mapping;
		this.available_to_connect = obj.available_to_connect || false;
		this.show_data_source_tab = obj.show_data_source_tab || false;
	}
}

export class Instance {
	/**
	 *  connected_on: "12 Jan 2022"
	 *	shouldMapUser: true
	 */
	constructor(obj, shouldMapUser) {
		this.id = obj._id;
		this.orgIntegrationID = obj.org_integration_id;
		this.status = obj?.integration_status
			? obj.integration_status
			: INTEGRATION_STATUS.NOT_CONNECTED;
		this.updatedAt = obj.integration_updated_at;
		this.createdAt = obj.integration_created_at;
		this.error = obj.integration_error_message;
		this.integrationOrgApplicationID = obj.integration_org_application_id;
		this.connectedBy = obj.integration_connected_by;
		this.connectedByEmail = obj.integration_connected_by_email;
		this.orgID = obj.org_id;
		this.name = obj.name;
		this.description = obj.description;
		this.lastSync = obj.last_sync_date && timeSince(obj.last_sync_date);
		this.totalUsers = obj.users_count || 0;
		this.activeUsers = obj.active_users_count || 0;
		this.totalScope = obj.total_scopes;
		this.connectedScope = obj.current_scopes;
		this.connectedOn = obj.connected_on;
		this.shouldMapUser = shouldMapUser;
		this.type = obj.type || "NA";
		this.entities = obj.entity_names;
		this.scopes = obj.scopes_data;
		this.testUrl = obj.integration_test_url;
		this.unMappedUsers = obj.unmapped_users_count;
	}
}

export class Entity {
	constructor(obj) {
		this.id = obj._id;
		this.name = obj.name;
	}
}
