import * as Sentry from "@sentry/react";
import { APP_KEY } from "../constants/app.key";
import { getAppKey } from "../utils/getAppKey";

export function InitializeSentry() {
	Sentry.init({
		dsn: getAppKey(APP_KEY.SENTRY_ID),
		environment: getAppKey(APP_KEY.ENVIRONMENT),
	});
}

export function setUserOnSentry(userObj) {
	Sentry.setUser(userObj);
}

export function ErrorResponseFromAPI(obj) {
	if (obj) {
		const captured = {
			url: obj?.config?.baseURL + obj?.config?.url,
			data: JSON.stringify(obj?.config?.data),
			method: obj?.config?.method,
			params: obj?.config?.params,
			response: JSON.stringify(obj?.data),
			status: obj?.status || obj?.response?.status,
		};
		Sentry.captureException(new Error("Error response from API"), {
			extra: captured,
		});
	}
}

export function TriggerIssue(message, data = {}) {
	try {
		let obj = {};
		if (typeof data === "object" && data !== null) {
			Object.keys(data).forEach((item) => {
				switch (item) {
					case "response":
						if (data["response"]) {
							try {
								const temp = {};
								temp.msg = data["response"]["data"];
								temp.stringify = JSON.stringify(
									data["response"]["data"]
								);
								obj["response-data"] = temp;
								obj[`response-status`] =
									data["response"]["status"];
							} catch (err) {
								console.log(err);
							}
						}
						break;
					case "config":
						if (data["config"]) {
							["data", "url", "method"].forEach((item) => {
								obj[`config-${item}`] = data["config"][item];
							});
						}
						break;
					case "request":
					case "toJSON":
						break;
					case "message":
						obj["msg"] = data[item];
						break;
					default:
						obj[item] = data[item];
						break;
				}
			});
		} else {
			obj = { _err: data };
		}
		Sentry.captureException(new Error(message), { extra: obj });
	} catch (err) {
		console.log(err);
	}
}
