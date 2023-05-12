export class CustomField {
	constructor(obj) {
		this.options = obj.field_options || [""];
		this.id = obj._id;
		this.name = obj.field_name || "";
		this.type = obj.field_type;
		this.of = obj.entity_type || obj.entity;
		this.reference = obj.field_reference;
		this.integration = obj.integration?.integration_id
			? obj.integration
			: null;
		this.org_integration_custom_path = obj.org_integration_custom_path;
	}
}

export class CustomFieldEdit {
	constructor(obj) {
		this.field_options = obj.options;
		this.field_name = obj.name;
		this.field_type = obj.type;
		this.entity = obj.of;
		this._id = obj.id;
		this.field_reference = obj.field_reference;
		this.integration = obj.integration;
		this.org_integration_id = obj.org_integration_id;
		this.org_integration_custom_path = obj.org_integration_custom_path;
	}
}
