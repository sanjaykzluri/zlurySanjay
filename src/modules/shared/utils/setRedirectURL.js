import { setValueToLocalStorage } from "utils/localStorage";

export const ignoreURL = [
	"/checkauth",
	"/login",
	"/logout",
	"/loginFailed",
	"/checkAuth",
];

export function setRedirectURL() {
	if (
		!ignoreURL.includes(
			window.location.href.replace(window.location.origin, "")
		)
	) {
		setValueToLocalStorage(
			"redirectURL",
			window.location.href.replace(window.location.origin, "")
		);
	}
}
