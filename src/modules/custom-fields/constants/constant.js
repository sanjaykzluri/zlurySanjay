import text from "../../../assets/icons/text-box.svg";
import dropdown from "../../../assets/icons/drop-down.svg";
import switchI from "../../../assets/icons/switch.svg";
import datePicker from "../../../assets/icons/date-picker.svg";
import { getValueFromLocalStorage } from "utils/localStorage";

const partner = getValueFromLocalStorage("partner");

export const FIELD_TYPE = {
	TEXT: {
		LABEL: "Text Box",
		ICON: text,
		VALUE: "text",
	},
	DROPDOWN: {
		LABEL: "Dropdown",
		ICON: dropdown,
		VALUE: "select",
	},
	BOOLEAN: {
		LABEL: "Boolean",
		ICON: switchI,
		VALUE: "bool",
	},
	DATE_PICKER: {
		LABEL: "Date Picker",
		ICON: datePicker,
		VALUE: "date",
	},
	ZLURI_ENTITY: {
		LABEL: `${partner?.name} Entity`,
		ICON: datePicker,
		VALUE: "entity",
	},
};

export const CUSTOM_FIELD_ENTITY = {
	APPLICATIONS: "applications",
	DEPARTMENTS: "departments",
	USERS: "users",
	LICENSECONTRACTS: "licensecontracts",
	VENDORS: "vendors",
	CONTRACTS: "contracts",
};

export const CUSTOM_FIELD_ENTITY_LIST = [
	{
		name: "Applications",
		key: "applications",
		field_reference: "orgapplications",
	},
	{ name: "Users", key: "users", field_reference: "orgusers" },
];

export const CUSTOM_FIELD_REFERENCE_KEYS = {
	APPLICATIONS: "orgapplications",
	USERS: "orgusers",
	DEPARTMENTS: "orgdepartments",
	VENDORS: "vendors",
	CONTRACTS: "contracts",
};

export const KEY_FIELDS = {
	orgapplications: {
		id: "app_id",
		image: "app_logo",
		value: "app_name",
	},
	orgusers: {
		id: "user_id",
		image: "profile_img",
		value: "user_name",
		email: "user_email",
	},
};
