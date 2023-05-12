import _ from "underscore";

export const getAddLicenseRequestPayload = (reqData) => {
	return {
		...(reqData.app_in_org
			? { org_app_id: reqData.app_id }
			: { app_parent_id: reqData.app_id }),

		...(reqData.license_id ? { license_id: reqData.license_id } : {}),
		...(reqData.approvers ? { approvers: reqData.approvers } : {}),
		...(reqData.on_approval_date
			? { on_approval_date: reqData.on_approval_date }
			: {}),
		...(reqData.on_approval_playbook
			? { on_approval_playbook: reqData.on_approval_playbook }
			: {}),
		...(reqData.on_approval_user
			? { on_approval_user: reqData.on_approval_user }
			: {}),
		...(reqData.has_onboarding_playbook
			? { has_onboarding_playbook: reqData.has_onboarding_playbook }
			: {}),
		...(reqData.has_offboarding_playbook
			? { has_offboarding_playbook: reqData.has_offboarding_playbook }
			: {}),
		license_name: reqData.license_name,
		request_role: reqData.request_role,
		quantity: reqData.need_more_licenses ? reqData.licenses_required : 1,
		type: reqData?.app_in_org ? "license" : "application",
		// ...(reqData.license_name
		// 	? {
		// 			cost_per_item: {
		// 				currency: reqData.currency,
		// 				amount: reqData.license_cost,
		// 				complete_term: false,
		// 				frequency: 1,
		// 				period: reqData.per_license_term,
		// 			},
		// 	  }
		// 	: {}),
		// cost_per_item: {
		// 	currency: reqData.currency,
		// 	amount: reqData.license_cost,
		// 	complete_term: false,
		// 	frequency: 1,
		// 	period: reqData.per_license_term,
		// },
		documents: [...reqData.documents],
		requirement_description: reqData.requirement_text,

		other_subscription_users: reqData.users
			.filter((user) => user.user_id !== "me")
			.map((user) => user.user_id),
		...(reqData.subscription_duration_term &&
		reqData.subscription_duration_value
			? {
					subscription_duration: {
						period: reqData.subscription_duration_term,
						frequency: Number.parseInt(
							reqData.subscription_duration_value
						),
					},
			  }
			: {}),
	};
};

export const getUpdatedKeys = (newData, oldData) => {
	let tempArr = [];
	Object.keys(newData).forEach((el) => {
		if (el === "users") {
			let idArr1 = newData[el].map((el) => el.user_id);
			let idArr2 = oldData[el].map((el) => el.user_id);

			if (idArr1.length !== idArr2.length) {
				tempArr.push(el);
				return;
			} else {
				idArr2.forEach((row) => {
					if (!idArr1.includes(row)) {
						tempArr.push(el);
						return;
					}
				});
			}
			return;
		}
		if (newData[el] !== oldData[el]) {
			tempArr.push(el);
		}
	});

	let reqKeys = [
		"need_more_licenses",
		"requirement_text",
		"users",
		"documents",
	];

	let finalKeys = [];
	tempArr.forEach((el) => {
		if (
			el === "license_cost" ||
			el === "currency" ||
			el === "per_license_term"
		) {
			finalKeys.push("cost_per_item");
		} else if (
			el === "subscription_duration_value" ||
			el === "subscription_duration_term"
		) {
			finalKeys.push("subscription_duration");
		} else if (el === "licenses_required") {
			finalKeys.push("quantity");
		} else if (el === "license_name" || el === "license_id") {
			finalKeys.push("license_name");
		} else {
			finalKeys.push(el);
		}
	});

	finalKeys = _.uniq(finalKeys);

	return finalKeys;
};

export const getEditLicenseRequestPayload = (reqData, prevData = {}) => {
	let keys = getUpdatedKeys(reqData, prevData);

	return {
		...(reqData.app_in_org
			? { org_app_id: reqData.app_id }
			: { app_parent_id: reqData.app_id }),
		...(reqData.license_id ? { license_id: reqData.license_id } : {}),
		request_role: reqData.request_role,
		license_name: reqData.license_name,
		quantity: reqData.need_more_licenses ? reqData.licenses_required : 1,
		type: reqData?.is_org_app ? "license" : "application",
		// cost_per_item: {
		// 	currency: reqData.currency,
		// 	amount: reqData.license_cost,
		// 	complete_term: false,
		// 	frequency: 1,
		// 	period: reqData.per_license_term,
		// },
		documents: [...reqData.documents],
		requirement_description: reqData.requirement_text,

		other_subscription_users: reqData.users
			.filter((user) => user.user_id !== "me")
			.map((user) => user.user_id),
		subscription_duration: {
			period: reqData?.subscription_duration_term,
			frequency: Number.parseInt(reqData?.subscription_duration_value),
		},
		...(keys ? { updated_keys: keys } : {}),
	};
};

export const getModifiedLicenseRequestOverview = (res) => {
	let tempUsers =
		Array.isArray(res.other_subscription_users) &&
		res.other_subscription_users.length > 0 &&
		res.other_subscription_users.map((el) => {
			return {
				user_image: el.profile_img,
				user_name: el.name,
				user_id: el._id,
				user_email: el.email,
			};
		});
	return {
		...res,
		license_cost: res.cost_per_item.amount,
		currency: res.cost_per_item.currency,
		per_license_term: res.cost_per_item.period,
		app_name: res.app_name,
		app_logo: res.app_image,
		app_id: res.app_id,
		license_name: res.license_name,
		license_id: res.licenseId,
		requested_on: res.createdAt,
		quantity: res.quantity,
		need_more_licenses: res.quantity !== 1,
		requirement_text: res.requirement_description,
		approvers: res.approvers,
		is_org_app: res.is_org_app,
		user_type: res.user_type,
		request_role: res.request_role,
		requestee_info: res.user_id,
		app_in_org: res.is_org_app,
		users: tempUsers || [],
		subscription_duration_term: res.subscription_duration?.period,
		subscription_duration_value: res.subscription_duration?.frequency,
	};
};

export const getModifiedLicenseCost = (res) => {
	return {
		...res,
		license_cost: res.request_lecense_details.cost_per_item.amount,
		currency: res.request_lecense_details.cost_per_item.currency,
		per_license_term: res.request_lecense_details.cost_per_item.period,
		period: res.request_lecense_details.cost_per_item.period,
	};
};
