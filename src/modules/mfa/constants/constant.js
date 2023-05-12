import phone from "../../../assets/icons/phone.svg";
import authenticator from "../../../assets/icons/authenticator.svg";
import email from "../../../assets/icons/email.svg";
import recoverycode from "../../../assets/icons/recoverycode.svg";
import { getValueFromLocalStorage } from "utils/localStorage";

const partner = getValueFromLocalStorage("partner");

export const MFA_VIEW = {
	ONBOARDING: "ONBOARDING",
	SETTINGS: "SETTINGS",
};

export const AUTHENTICATOR_TYPE = {
	OTP: "otp",
	OOB: "oob",
	RECOVERY_CODE: "recovery-code",
	EMAIL: "email",
	PHONE: "phone_number",
	VOICE: "voice",
	SMS: "sms",
};

export const MFA_TYPE = {
	phone_number: {
		display_name: "Phone number",
		icon: phone,
		iconWidth: 32,
		isPrimary: true,
		active: false,
		authenticator_type: AUTHENTICATOR_TYPE.OOB,
		ui_id: AUTHENTICATOR_TYPE.PHONE,
		help_text: `You will receive an OTP on your phone. Please use that to log in to ${partner?.name}.`,
	},
	authenticator: {
		display_name: "Authenticator",
		icon: authenticator,
		iconWidth: 32,
		authenticator_type: AUTHENTICATOR_TYPE.OTP,
		isPrimary: true,
		active: false,
		ui_id: AUTHENTICATOR_TYPE.OTP,
		help_text:
			"Use your favorite authenticator app like Google Authenticator, Microsoft Authenticator, Authy to set up 2-factor authentication. ",
	},
	email: {
		display_name: "Email",
		icon: email,
		iconWidth: 32,
		authenticator_type: AUTHENTICATOR_TYPE.OOB,
		oob_channel: AUTHENTICATOR_TYPE.EMAIL,
		isPrimary: false,
		active: false,
		ui_id: AUTHENTICATOR_TYPE.EMAIL,
		help_text: `You will receive at your email address. Please use that to log in to ${partner?.name}.`,
	},
	recovery_code: {
		display_name: "Recovery Code",
		icon: recoverycode,
		iconWidth: 32,
		authenticator_type: AUTHENTICATOR_TYPE.RECOVERY_CODE,
		isPrimary: false,
		active: false,
		ui_id: AUTHENTICATOR_TYPE.RECOVERY_CODE,
		help_text:
			"You can use the recovery codes to login in case you have lost access to any of the above authentication methods.",
	},
};

export const AUTH0_ERROR = {
	INVALID_MFA_TOKEN: {
		response: "invalid mfa_token signature",
		display: "Something went wrong, Try again some time later",
	},
	INVALID_OTP: {
		response: "invalid mfa_token signature",
		display: "Try again some time later",
	},
	INVALID_PNUM: {
		response:
			"phone_number is invalid. Should be a 30 characters max string, only + (in the country code), -, digits or spaces are allowed.",
		display:
			"Phone Number is invalid. Should be a 30 characters max string, only + (in the country code), -, digits or spaces are allowed.",
	},
};
