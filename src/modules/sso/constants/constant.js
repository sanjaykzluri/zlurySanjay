import saml from "../../../assets/icons/saml.svg";
import azure from "../../../assets/icons/azure.svg";
import google from "../../../assets/google-logo.svg";
import { getValueFromLocalStorage } from "utils/localStorage";

const partner = getValueFromLocalStorage("partner");

export const SSO_OPTION = {
	samlp: {
		strategy: "samlp",
		connectionName: "SAML",
		description: `Please select this option to enable your employees to login to ${partner?.name} through any SAML Identity provider (Okta, Google , Azure).`,
		available: true,
		image: saml,
	},
	"google-apps": {
		strategy: "google-apps",
		connectionName: "Google Workspace",
		description: `Please select this option to enable your employees to login to ${partner?.name} through their Google credentials.`,
		available: true,
		image: google,
	},
	azure: {
		strategy: "azure",
		connectionName: "Azure AD",
		description: `Please select this option to enable your employees to login to ${partner?.name} through their Azure AD credentials`,
		available: false,
		image: azure,
	},
};
