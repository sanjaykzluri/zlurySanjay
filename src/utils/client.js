import axios from "axios";
import { setRedirectURL } from "modules/shared/utils/setRedirectURL";
import { saveAPIResponseToStore } from "../reducers/api.reducer";
import { store } from "../utils/store";
import {
	recursive_decode_request_data,
	recursive_unescape_response_data,
} from "./common";
import { setValueToLocalStorage } from "./localStorage";
import { ErrorResponseFromAPI, TriggerIssue } from "./sentry";
import { clearStorage, getValueFromLocalStorage } from "./localStorage";

const VULNERABLE_URL = [
	"/auth/authorize",
	"/auth/authorize2",
	"organizations",
	"overview",
	"onboarding",
];

const FORCE_VULNERABLE_URL = [
	"manual-task-list",
	"mark-action-as-completed",
	"sign-declaration",
];

// DEFAULTS FOR all the instance of axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.headers.common["strict-transport-security"] =
	"max-age=63072000; includeSubDomains; preload";
axios.defaults.headers.common["Content-Security-Policy"] =
	"upgrade-insecure-requests";
axios.defaults.headers.common["X-Frame-Options"] = "SAMEORIGIN";
axios.defaults.headers.common["X-Content-Type-Options"] = "nosniff";
axios.defaults.headers.common["Referrer-Policy"] = "same-origin";
axios.defaults.headers.common["X-XSS-Protection"] = "1; mode=block";
axios.defaults.headers.common["server"] = "cloudfront";
axios.defaults.headers.common["Permissions-Policy"] =
	"geolocation=(self), midi=(self), push=(self), sync-xhr=(self), microphone=(self), camera=(self), magnetometer=(self), gyroscope=(self), speaker=(self), vibrate=(self), fullscreen=(self), payment=(self)";

function isVulnerableURL(request) {
	if (request) {
		const idx = FORCE_VULNERABLE_URL.findIndex((el) =>
			request.url.includes(el)
		);
		if (idx > -1) return true;
		const index = VULNERABLE_URL.findIndex(
			(el) =>
				request.url.includes(el) &&
				!request.url.includes("workflows") &&
				!request.url.includes("onboarding-offboarding") &&
				!request.url.includes("rules") &&
				!request.url.includes("mini-playbooks") &&
				!request.url.includes("integrations") &&
				!request.url.includes("health-insights") &&
				!request.url.includes("onboarding-users-via-csv")
		);
		return index > -1 ? true : false;
	}
	return true;
}

// Axios instances
const client = axios.create();
const clientV2 = axios.create();
const clientV3 = axios.create();
const clientEmployee = axios.create();
const clientEmployeeV2 = axios.create();

const CLIENT_OBJ = [
	{
		client: client,
		version: null,
	},
	{
		client: clientV2,
		version: "v2",
	},
	{
		client: clientV3,
		version: "v3",
	},
	{
		client: clientEmployee,
		version: "employee",
	},
	{
		client: clientEmployeeV2,
		version: "employee/v2",
	},
];

const ignoreUnescapeDataUrl = [
	"workflows/manual-action/templates",
	"/nodes/application/",
	"/workflows/",
]; // add more url's to ignore unescape

CLIENT_OBJ.forEach((item) => {
	item.client.interceptors.response.use(
		function (response) {
			if (response?.data?.error) {
				ErrorResponseFromAPI(response);
			}
			const ignoreUnescapeUrl = ignoreUnescapeDataUrl.some((v) =>
				response.config.url.includes(v)
			);
			if (!response?.data?.inputFields && !ignoreUnescapeUrl) {
				response.data = recursive_unescape_response_data(
					response?.data
				);
			}
			return response;
		},
		function (error) {
			ErrorResponseFromAPI(error?.response);
			if (
				error &&
				error.response &&
				(error.response.status === 401 ||
					(error.response.status === 400 &&
						error.response.data.userInfo === null))
			) {
				setRedirectURL(
					window.location.href.replace(window.location.origin, "")
				);
				clearStorage();
				window.location.replace("/logout");
			}
			return Promise.reject(error);
		}
	);

	item.client.interceptors.request.use(async (request) => {
		try {
			const token = await window.getAccessTokenSilently();
			setValueToLocalStorage("token", token);
			request.headers.common["Authorization"] = `Bearer ${token}`;
			const orgId = getValueFromLocalStorage("userInfo")
				? getValueFromLocalStorage("userInfo").org_id
				: undefined;
			if (item.version === "v2" && request.data) {
				request.data = recursive_decode_request_data(request.data);
			}
			if (
				!isVulnerableURL(request) ||
				item.version === "employee" ||
				item.version === "employee/v2"
			) {
				request.url = `${
					item.version ? item.version : ""
				}/organization/${orgId}/${request.url}`;
			}
			return request;
		} catch (err) {
			// TriggerIssue(
			// 	"Auth0 refresh grant failed, redirecting user to logout screen - client.js",
			// 	err
			// );
			console.error(
				"Auth0 refresh grant failed, redirecting user to logout screen - client.js",
				err
			);
			setRedirectURL(
				window.location.href.replace(window.location.origin, "")
			);
			window.location.replace("/logout");
		}
	});
});

client.CancelToken = axios.CancelToken;
client.isCancel = axios.isCancel;

const cacheClient = axios.create();

cacheClient.interceptors.request.use(async (request) => {
	try {
		const token = await window.getAccessTokenSilently();
		setValueToLocalStorage("token", token);
		request.headers.common["Authorization"] = `Bearer ${token}`;
		const orgId = getValueFromLocalStorage("userInfo")
			? getValueFromLocalStorage("userInfo").org_id
			: undefined;
		if (!isVulnerableURL(request)) {
			request.url = `/organization/${orgId}/${request.url}`;
		}
		let isCached = store.getState().api.getCalls[request.url];
		if (isCached) {
			request.headers.cached = true;
			request.data = isCached;
			return Promise.reject(request);
		}
		return request;
	} catch (err) {
		TriggerIssue(
			"Auth0 refresh grant failed, redirecting user to logout screen - client.js",
			err
		);
		setRedirectURL(
			window.location.href.replace(window.location.origin, "")
		);
		window.location.replace("/logout");
	}
});

cacheClient.interceptors.response.use(
	(response) => {
		if (response.config.method) {
			if (response.config.url) {
				store.dispatch(
					saveAPIResponseToStore(response.config.url, response.data)
				);
			}
		}
		return response;
	},
	(error) => {
		if (error?.headers?.cached === true) {
			return Promise.resolve(error);
		}
		return Promise.reject(error);
	}
);

export {
	client,
	clientV2,
	clientV3,
	cacheClient,
	clientEmployee,
	clientEmployeeV2,
};
