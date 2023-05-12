import { getValueFromLocalStorage } from "utils/localStorage";

function getModifiedObject(message, reqObj) {
	return {
		event: message,
		properties: {
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
			time: Number(new Date()),
			identity: {
				organization: {
					id: getValueFromLocalStorage("userInfo")?.org_id || "",
					name: getValueFromLocalStorage("userInfo")?.org_name || "",
				},
				user: {
					email: getValueFromLocalStorage("userInfo")?.email || "",
					id: getValueFromLocalStorage("userInfo")?.user_id || "",
					name: getValueFromLocalStorage("userInfo")?.name || "",
				},
				timestamp: new Date(),
				value: "1",
			},
		},
		...reqObj,
	};
}

export function trackActionSegment(message, reqObj = {}, getModifiedData) {
	const orgId = getValueFromLocalStorage("userInfo")?.org_id || "";
	const orgObj = getValueFromLocalStorage("userInfo") || {};
	const orgName = getValueFromLocalStorage("userInfo")?.org_name || "";

	window.analytics.track(message, {
		...(getModifiedData ? getModifiedObject(message, reqObj) : reqObj),
		orgId: orgId || "",
		orgName: orgName || "",
	});
	return null;
}

export function trackPageSegment(page, subPage, reqObj) {
	const orgId = getValueFromLocalStorage("userInfo")?.org_id || "";
	const orgObj = getValueFromLocalStorage("userInfo") || {};
	const orgName = getValueFromLocalStorage("userInfo")?.org_name || "";
	window.analytics.page(page, subPage, {
		...reqObj,
		orgId: orgId || "",
		orgName: orgName || "",
	});
	return null;
}
