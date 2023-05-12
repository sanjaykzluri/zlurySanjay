import React from "react";
import {
	dateResetTimeZone,
	getDateDiff,
	getNthDayBeforeDate,
	UTCDateFormatter,
} from "../../../utils/DateUtility";
import Checklist from "../components/ContractSteps/Checklist";
import ContractBasicDetails from "../components/ContractSteps/ContractBasicDetails";
import LicenseDetails from "../components/ContractSteps/LicenseDetails";
import Review from "../components/ContractSteps/Review";
import {
	defaultLicenseGroup,
	licenseDetailsErrorMsgs,
	licenseFormErrorMsgs,
	LicenseMapperCSVDateFormat,
	screenEntity,
} from "../constants/LicenseConstants";
import moment from "moment";
import { kFormatter } from "constants/currency";
import { toast } from "react-toastify";
import DefaultNotificationCard from "common/Notification/PusherNotificationCards/DefaultNotificationCard";
import { Dots } from "common/DottedProgress/DottedProgress";
import cancelled from "assets/licenses/cancelled.svg";
import _ from "underscore";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { checkSpecialCharacters } from "services/api/search";

export const getFormSteps = (entity, API) => {
	let steps = [
		{
			component: <ContractBasicDetails entity={entity} />,
			title: "Basic Details",
		},
		{
			component: <Checklist entity={entity} />,
			title: "Checklist",
		},
		{
			component: <LicenseDetails entity={entity} />,
			title: "License Details",
		},
		{
			component: <Review entity={entity} saveData={API} />,
			title: "Review",
		},
	];

	if (entity === screenEntity.SUBSCRIPTION) {
		steps.splice(1, 1);
	}

	return steps;
};

export const getAddContractReqBody = (data, entity) => {
	const reqBody = {
		name: data?.name?.trim(),
		vendor_id: data?.vendor_id || null,
		renewed_contract_id:
			entity === screenEntity.CONTRACT
				? data?.renewed_contract_id || null
				: null,
		owners: {
			owner_id: data?.primary_owner_id || null,
			financial_owner_id: data?.financial_owner_id || null,
			it_owner_id: data?.it_owner_id || null,
		},
		status: "active",
		is_app: data?.is_app,
		org_app_id: data?.is_app
			? data?.app_id || data?.org_app_id || null
			: null,
		type: entity,
		description: data?.description,
		start_date: data?.start_date,
		end_date: entity === screenEntity.CONTRACT ? data?.end_date : null,

		cost_amortization: data?.cost_amortization,
		license_group_precedence: data?.license_group_precedence,
		contract: {
			agreement_type:
				entity === screenEntity.CONTRACT ? data?.agreement_type : null,
			cancel_by:
				entity === screenEntity.CONTRACT ? data?.cancel_by : null,
			auto_renews:
				entity === screenEntity.CONTRACT
					? data?.contract_auto_renews
					: false,
			payment: {
				type:
					entity === screenEntity.CONTRACT
						? data?.payment_term
						: null,
				recurring: {
					frequency: screenEntity.CONTRACT
						? data?.payment_term === "recurring"
							? data?.payment_repeat_frequency
							: null
						: null,
					period: screenEntity.CONTRACT
						? data?.payment_term === "recurring"
							? data?.payment_repeat_interval
							: null
						: null,
					repeats_on: screenEntity.CONTRACT
						? data?.payment_term === "recurring"
							? data?.payment_repeat_on
							: null
						: null,
					repeats_on_day: null,
				},
				one_time: {
					payment_date:
						entity === screenEntity.CONTRACT
							? data?.payment_term === "one_time"
								? data?.payment_date
								: null
							: null,
				},
			},
		},
		subscription: {
			next_renewal:
				entity === screenEntity.SUBSCRIPTION
					? data?.next_renewal_date
					: null,
			renewal: {
				frequency:
					entity === screenEntity.SUBSCRIPTION
						? data?.renewal_repeat_frequency
						: null,
				period:
					entity === screenEntity.SUBSCRIPTION
						? data?.renewal_repeat_interval
						: null,
			},
			auto_renews: data?.auto_renews,
		},
		perpetual: {
			payment: {
				type: entity === screenEntity.PERPETUAL ? "one_time" : null,
				date:
					entity === screenEntity.PERPETUAL
						? data?.payment_date
						: null,
			},
		},
		licenses: licensesForAddEditReqPayload(data),
		has_base_price: data?.has_base_price,
		base_price: {
			currency: data?.base_currency,
			amount: data?.has_base_price ? data?.base_price || 0 : null,
			complete_term: data?.complete_term,
			frequency: data?.has_base_price
				? !data?.complete_term
					? data?.base_frequency || 1
					: null
				: null,
			period: data?.has_base_price
				? !data?.complete_term
					? data?.base_period
					: null
				: null,
		},
		checklist: data?.checklist || [],
		documents: data?.documents || [],
		custom_fields: data?.custom_fields || [],
		payment_method_id: data?.payment_method_id || null,
		discount: {
			type: data?.discount_type,
			value: data?.discount_value,
		},
		one_time_fee: data?.one_time_fee,
	};

	return reqBody;
};

export const getEditContractReqBody = (data, entity) => {
	const reqBody = {
		name: data?.name?.trim(),
		vendor_id: data?.vendor_id || null,
		renewed_contract_id:
			entity === screenEntity.CONTRACT
				? data?.renewed_contract_id || null
				: null,
		primary_owner_id: data?.primary_owner_id || null,
		financial_owner_id: data?.financial_owner_id || null,
		it_owner_id: data?.it_owner_id || null,
		status: "active",
		is_app: data?.is_app,
		org_app_id: data?.is_app
			? data?.app_id || data?.org_app_id || null
			: null,
		type: entity,
		description: data?.description,
		start_date: data?.start_date,
		end_date: entity === screenEntity.CONTRACT ? data?.end_date : null,
		cancel_by: entity === screenEntity.CONTRACT ? data?.cancel_by : null,
		agreement_type:
			entity === screenEntity.CONTRACT ? data?.agreement_type : null,
		contract_auto_renews:
			entity === screenEntity.CONTRACT
				? data?.contract_auto_renews
				: false,
		payment_term:
			entity === screenEntity.PERPETUAL
				? "one_time"
				: entity === screenEntity.CONTRACT
				? data?.payment_term
				: null,
		payment_repeat_frequency: screenEntity.CONTRACT
			? data?.payment_term === "recurring"
				? data?.payment_repeat_frequency || 1
				: null
			: null,
		payment_repeat_interval: screenEntity.CONTRACT
			? data?.payment_term === "recurring"
				? data?.payment_repeat_interval || "months"
				: null
			: null,
		payment_repeat_on: screenEntity.CONTRACT
			? data?.payment_term === "recurring"
				? data?.payment_repeat_on
				: null
			: null,
		payment_date:
			entity === screenEntity.CONTRACT ||
			entity === screenEntity.PERPETUAL
				? data?.payment_term === "one_time"
					? data?.payment_date
					: null
				: null,
		next_renewal_date:
			entity === screenEntity.SUBSCRIPTION
				? data?.next_renewal_date
				: null,
		renewal_repeat_frequency:
			entity === screenEntity.SUBSCRIPTION
				? data?.renewal_repeat_frequency || 1
				: null,
		renewal_repeat_interval:
			entity === screenEntity.SUBSCRIPTION
				? data?.renewal_repeat_interval || "months"
				: null,
		auto_renews: data?.auto_renews,
		licenses: licensesForAddEditReqPayload(data).concat(
			getDeletedLicenseArray(data?.deletedLicenses || [])
		),
		has_base_price: data?.has_base_price,
		base_price: data?.has_base_price ? data?.base_price || 0 : null,
		base_currency: data?.base_currency || "USD",
		complete_term: data?.complete_term,
		base_frequency: data?.has_base_price
			? !data?.complete_term
				? data?.base_frequency || 1
				: null
			: null,
		base_period: data?.has_base_price
			? !data?.complete_term
				? data?.base_period
				: null
			: null,
		checklist: data?.checklist || [],
		documents: data?.documents || [],
		custom_fields: data?.custom_fields || [],
		payment_method_id: data?.payment_method_id || null,
		discount_type: data?.discount_type ? data?.discount_type : "percentage",
		discount_value: data?.discount_value || 0,
		one_time_fee: data?.one_time_fee,
		cost_amortization: data?.cost_amortization,
		license_group_precedence: data?.license_group_precedence,
	};

	return reqBody;
};

export const licensesForAddEditReqPayload = (data) => {
	const licenseArray = data?.licenses;
	for (const license of licenseArray) {
		license.name = license.name?.trim();
		license.cost_per_item = {};
		license.cost_per_item.currency = data?.base_currency;
		if (!data?.renewing_contract) {
			delete license.renewed_license_id;
		}
		license.groups = getGroupsForAddEditReqPayload(license.groups);
		license.vendor_id = data?.vendor_id;
	}
	return licenseArray;
};

export const getGroupsForAddEditReqPayload = (groups) => {
	for (let grp of groups) {
		grp.description = grp.description?.trim();
		if (grp.group_type !== "surplus") {
			if (grp.quantity < 0) {
				grp.group_type = "true_down";
			} else {
				grp.group_type = "true_up";
			}
		}
	}
	return groups;
};

export const getDeletedLicenseArray = (licenses) => {
	const licenseArray = licenses;
	for (const license of licenseArray) {
		license.deleted = true;
	}
	const finalLicenseArray = licenseArray.filter((license) => license._id);
	return finalLicenseArray;
};

export function getDateDiffInMonths(a, b, precise = false) {
	if (precise) {
		return moment(a).diff(b, "months", precise);
	}

	let years = moment(a).diff(b, "year");
	b = moment(b).add(years, "years");
	let months = moment(a).diff(b, "months");
	b = moment(b).add(months, "months");

	let days = moment(a).diff(b, "days");
	if (days === 0) {
		days = moment(a).diff(b, "seconds") > 0 ? 1 : 0;
	}
	return days > 0 ? years * 12 + months + 1 : years * 12 + months;
}

export const mulitplier = (period, complete_term, entity, data) => {
	if (entity === screenEntity.PERPETUAL) {
		return 1;
	}

	const diffInMonths =
		entity === screenEntity.CONTRACT
			? getDateDiffInMonths(
					add24HoursToEndDateInTable(data?.end_date),
					data?.start_date,
					true
			  )
			: data?.renewal_repeat_interval === "months"
			? data?.renewal_repeat_frequency
			: data?.renewal_repeat_interval === "years"
			? data?.renewal_repeat_frequency * 12
			: (data?.renewal_repeat_frequency * 7) / 30;

	let frequency_multipler = 1;
	if (period === "months") {
		frequency_multipler = 1;
	} else if (period === "quarter") {
		frequency_multipler = 3;
	} else if (period === "years") {
		frequency_multipler = 12;
	} else if (period === "term") {
		frequency_multipler = diffInMonths;
	}

	return complete_term ? 1 : period ? diffInMonths / frequency_multipler : 1;
};

export const checkLicensesForAddToContract = (licenses, entity) => {
	for (let license of licenses) {
		if (license.integration_id) {
			license.auto_increment = true;
		}
		for (let group of license.groups) {
			if (
				!Object.keys(group).includes("complete_term") &&
				!Object.keys(group).includes("period")
			) {
				group.complete_term = entity !== screenEntity.CONTRACT;
			}
			if (!group.discount_type) {
				group.discount_type = "percentage";
			}
			if (!group.group_type) {
				group.group_type = "true_up";
			}
			if (group.start_date) {
				group.start_date = [
					group.start_date.split("T")[0],
					"00:00:00.000Z",
				].join("T");
			}
		}
	}
	return licenses;
};

export function HeaderFormatter({ text, tooltipContent, onClick }) {
	return (
		<>
			{text}
			{tooltipContent ? (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>{tooltipContent}</Tooltip>}
				>
					<div
						className="ml-1 o-5 grey cursor-pointer"
						style={{ position: "relative", top: "-5px" }}
						onClick={() => onClick && onClick()}
					>
						i
					</div>
				</OverlayTrigger>
			) : (
				<div
					className="ml-1 o-5 grey cursor-pointer"
					style={{ position: "relative", top: "-5px" }}
					onClick={() => onClick && onClick()}
				>
					i
				</div>
			)}
		</>
	);
}

export const add24HoursToEndDateInTable = (date) => {
	return getNthDayBeforeDate(-1, new Date(date));
};

export const getLicenseTermText = (
	license,
	cost_per_item,
	uppercase,
	singleChar,
	slash
) => {
	switch (cost_per_item?.period) {
		case "months":
			return "per month";
		case "years":
			return "per year";
		case "quarter":
			return "per quarter";
		case "term":
			return "per term";
		case "license_term":
			return "per lic. term";
		default:
			return "per term";
	}
};

// export const getLicenseTermText = (
// 	license,
// 	cost_per_item,
// 	uppercase,
// 	singlechar,
// 	slash = false
// ) => {
// 	let text = "per term";

// 	if (
// 		(license.start_date || license.license_start_date) &&
// 		(license.end_date || license.license_end_date)
// 	) {
// 		if (!cost_per_item.complete_term && !cost_per_item.period) {
// 			text = "per term";
// 			return uppercase ? text.toUpperCase() : text;
// 		}

// 		if (cost_per_item.complete_term) {
// 			text = slash ? "/lic. term" : "per lic. term";
// 			return uppercase ? text.toUpperCase() : text;
// 		}

// 		if (!cost_per_item.complete_term && cost_per_item.period) {
// 			text = singlechar
// 				? "p" + cost_per_item?.period?.charAt(0)
// 				: "per " + cost_per_item?.period?.slice(0, -1);
// 			return uppercase ? text.toUpperCase() : text;
// 		}
// 	} else {
// 		if (cost_per_item.complete_term) {
// 			text = slash ? "/term" : "per term";
// 			return uppercase ? text.toUpperCase() : text;
// 		}

// 		if (!cost_per_item.complete_term && cost_per_item.period) {
// 			text = singlechar
// 				? "p" + cost_per_item?.period?.charAt(0)
// 				: "per " + cost_per_item?.period?.slice(0, -1);
// 			return uppercase ? text.toUpperCase() : text;
// 		}
// 	}

// 	return "";
// };

export const showNotificationCard = (title, description, icon) => {
	toast(
		<DefaultNotificationCard
			notification={{
				title: title || "Records Updated",
				description:
					description ||
					"All records have been updated successfully. The changes might take some time to reflect.",
				icon: icon,
			}}
		/>
	);
};

export const getTotalLicenseRowData = (data) => {
	let quantity = 0;
	let in_use = 0;
	let cost = 0;
	let user_quantity = 0;
	if (
		!(data && Array.isArray(data?.licenses) && data?.licenses?.length > 0)
	) {
		return { quantity, in_use, cost };
	}
	for (const license of data?.licenses) {
		if (license.type === "user") {
			user_quantity += license.quantity;
		}
		quantity += license.quantity;
		in_use += license.in_use;
		cost += license.cost;
	}
	return { quantity, in_use, cost, user_quantity };
};

export const statusPill = {
	active: (
		<div className="active-status-pill">
			<Dots color="#40E395" size={6} />
			<div className="font-11 bold-400 license-details-px-1">Active</div>
		</div>
	),
	inactive: (
		<div className="inactive-status-pill">
			<Dots color="#717171" size={6} />
			<div className="font-11 bold-400 license-details-px-1">
				Inactive
			</div>
		</div>
	),
	expired: (
		<div className="expired-status-pill">
			<Dots color="#717171" size={6} />
			<div className="font-11 bold-400 license-details-px-1">Expired</div>
		</div>
	),
	cancelled: (
		<div className="cancelled-status-pill">
			<img src={cancelled} height={6} width={6} />
			<div className="font-11 bold-400 license-details-px-1">
				Cancelled
			</div>
		</div>
	),
};

export const getContractNextPaymentDate = (data) => {
	if (!data?.payment_repeat_on) {
		return null;
	}
	let date = new Date(data?.payment_repeat_on);
	while (date < new Date()) {
		let next_date = moment(date).add(
			data?.payment_repeat_frequency || 1,
			data?.payment_repeat_interval || "months"
		);
		date = next_date;
	}
	return new Date(date);
};

export const getContractPastPaymentDate = (data) => {
	let date = getContractNextPaymentDate(data);
	if (!date) {
		return null;
	}
	let past_date = moment(date).subtract(
		data?.payment_repeat_frequency || 1,
		data?.payment_repeat_interval || "months"
	);
	return new Date(past_date);
};

export const getContractPaymentDateArray = (data) => {
	let date_arr = [];
	if (!data?.payment_repeat_on) {
		return [];
	}
	let date = new Date(data?.payment_repeat_on);
	date_arr.push(new Date(date));
	while (date < new Date(data?.end_date)) {
		let next_date = moment(date).add(
			data?.payment_repeat_frequency || 1,
			data?.payment_repeat_interval || "months"
		);
		date = next_date;
		date_arr.push(new Date(date));
	}
	return date_arr;
};

export const getDefaultLicenseGroup = (data, entity) => {
	return entity === screenEntity.CONTRACT
		? {
				...defaultLicenseGroup,
				start_date: data?.start_date,
				end_date: data?.end_date,
		  }
		: {
				...defaultLicenseGroup,
				start_date: data?.start_date,
		  };
};

export const getGroupCostPerTerm = (
	group,
	entity,
	data,
	returnAmount = false,
	minimum_duration
) => {
	let amount = group?.amount || 0;

	let discount =
		group?.discount_type === "value"
			? group?.discount || 0
			: amount * ((group?.discount || 0) / 100);

	let amountAfterDisc = amount - discount;

	let quantity = group?.quantity || 0;

	let costBeforeTermMultiplier = amountAfterDisc * quantity;

	let termMultiplier =
		mulitplier(group?.period, group?.complete_term, entity, data) || 1;

	const contractMonthsCount =
		entity === screenEntity.CONTRACT
			? getDateDiffInMonths(
					add24HoursToEndDateInTable(data?.end_date),
					data?.start_date,
					true
			  )
			: data?.renewal_repeat_interval === "months"
			? data?.renewal_repeat_frequency
			: data?.renewal_repeat_interval === "years"
			? data?.renewal_repeat_frequency * 12
			: (data?.renewal_repeat_frequency * 7) / 30;

	let periodMultiplier = 1;

	if (entity !== screenEntity.PERPETUAL) {
		let groupMonthsCount = getDateDiffInMonths(
			add24HoursToEndDateInTable(
				entity === screenEntity.CONTRACT
					? group.end_date
					: getMaxGroupStartDateForSubscription(data),
				true
			),
			group.start_date,
			true
		);

		switch (minimum_duration) {
			case "months":
				groupMonthsCount = Math.ceil(groupMonthsCount);
				break;
			case "quarter":
				groupMonthsCount = 3 * Math.ceil(groupMonthsCount / 3);

				break;
			case "years":
				groupMonthsCount = 12 * Math.ceil(groupMonthsCount / 12);
				break;
			case "pro-rata":
			default:
				break;
		}

		periodMultiplier = group.complete_term
			? 1
			: groupMonthsCount / contractMonthsCount;
	}

	let groupCostPerTerm =
		costBeforeTermMultiplier * termMultiplier * periodMultiplier || 0;

	return returnAmount
		? groupCostPerTerm
		: kFormatter(groupCostPerTerm || 0, data?.base_currency);
};

export const getLicenseCostPerTerm = (license, entity, data, returnAmount) => {
	let cost = 0;
	for (const group of license.groups) {
		cost += getGroupCostPerTerm(
			group,
			entity,
			data,
			true,
			license.minimum_duration
		);
	}

	if (returnAmount) {
		return isNaN(cost) ? 0 : cost;
	}

	return isNaN(cost) ? "-" : kFormatter(cost, data?.base_currency);
};

export const getContractCostPerTerm = (data, entity, returnBeforeDiscount) => {
	let cost = 0;
	if (!data) return cost;
	if (Array.isArray(data?.licenses)) {
		for (let license of data?.licenses) {
			cost += getLicenseCostPerTerm(license, entity, data, true);
		}
	}
	if (data?.base_price) {
		cost += data?.base_price || 0;
	}
	if (Array.isArray(data?.one_time_fee)) {
		for (let oneTimeFee of data?.one_time_fee) {
			cost += oneTimeFee.value || 0;
		}
	}

	if (returnBeforeDiscount) {
		return cost;
	}

	if (data?.discount_value > 0) {
		if (data?.discount_type === "value") {
			cost -= data?.discount_value;
		} else {
			cost = cost * (1 - data?.discount_value / 100);
		}
	}

	return isNaN(cost)
		? "-"
		: cost < 0
		? kFormatter(0, data?.base_currency)
		: kFormatter(cost, data?.base_currency);
};

export const getTotalGroupsOfALicense = (license) => {
	let cnt = 0;
	if (Array.isArray(license?.groups)) {
		for (let group of license.groups) {
			if (group.group_type !== "surplus") {
				cnt += group.quantity;
			}
		}
	}
	return cnt;
};

export const getTotalLicenses = (data) => {
	let cnt = 0;
	if (Array.isArray(data?.licenses)) {
		for (let license of data?.licenses) {
			cnt += getTotalGroupsOfALicense(license);
		}
	}
	return cnt;
};

export const getLicenseStartDateForDisplay = (license) => {
	let start = license.groups[0].start_date;
	if (Array.isArray(license.groups)) {
		for (let group of license.groups) {
			if (new Date(start) > new Date(group.start_date)) {
				start = group.start_date;
			}
		}
	}
	return start;
};

export const getLicenseEndDateForDisplay = (license) => {
	let end = license.groups[0].end_date;
	if (Array.isArray(license.groups)) {
		for (let group of license.groups) {
			if (new Date(end) < new Date(group.end_date)) {
				end = group.end_date;
			}
		}
	}
	return end;
};

export const validateLicenses = (licenses, entity, data) => {
	for (let license of licenses) {
		if (
			getTotalGroupsOfALicense(license) < 0 ||
			getLicenseCostPerTerm(license, entity, data, true) < 0
		) {
			return licenseDetailsErrorMsgs.NEGATIVE_VALUE;
		}
	}
	if (_.uniq(licenses, "name").length !== licenses.length) {
		return licenseDetailsErrorMsgs.SAME_NAME;
	}
	return false;
};

export const validateLicenseForm = (license) => {
	if (!license.name) {
		return licenseFormErrorMsgs.EMPTY_FIELDS;
	}
	if (!Array.isArray(license?.groups)) {
		return licenseFormErrorMsgs.GROUPS.NOT_AN_ARRAY;
	}
	if (license?.groups?.length < 1) {
		return licenseFormErrorMsgs.GROUPS.EMPTY;
	}
	for (let group of license?.groups) {
		if (group?.group_type !== "surplus" && !group?.description) {
			return licenseFormErrorMsgs.EMPTY_FIELDS;
		}
	}
	return false;
};

export const getDiscountPerTermOfALicense = (license, data, entity) => {
	let qty = 0;
	let disc = 0;
	for (let group of license.groups) {
		qty += group.quantity;
		let discInAmt = 0;
		if (group.discount_type === "value") {
			discInAmt = group.discount;
		} else {
			discInAmt = (group.discount * group.amount) / 100;
		}
		disc += getGroupCostPerTerm(
			{
				...group,
				amount: discInAmt,
				discount: 0,
			},
			entity,
			data,
			true,
			license.minimum_duration
		);
	}

	return disc / qty;
};

export const addToDate = (date, frequency, period) => {
	let _date = new Date(date);
	switch (period) {
		case "days":
			_date = _date.setDate(_date.getDate() + frequency);
			break;
		case "months":
			_date = _date.setMonth(_date.getMonth() + frequency);
			break;
		case "years":
			_date = _date.setFullYear(_date.getFullYear() + frequency);
			break;
		default:
			break;
	}

	return new Date(_date);
};

export const getMaxGroupStartDateForSubscription = (data) => {
	let date = new Date(data?.next_renewal_date);
	while (date < new Date()) {
		date = addToDate(
			date,
			data?.renewal_repeat_frequency,
			data?.renewal_repeat_interval
		);
	}
	date = addToDate(date, -1, "days");
	return date;
};

export const fillNullLicenseValues = (license) => {
	const keys = ["amount", "quantity", "discount"];
	for (let group of license.groups) {
		for (let key of keys) {
			if (!group[key] || isNaN(group[key])) {
				group[key] = 0;
			}
		}
	}
	return license;
};

export const getLicenseMapperUsersFromAllPages = (reduxData) => {
	let data = [];
	let page = 0;
	while (
		reduxData[`page_${page}_row_50`] &&
		Array.isArray(reduxData[`page_${page}_row_50`])
	) {
		data = [...data, ...reduxData[`page_${page}_row_50`]];
		page++;
	}

	return data;
};

export const getBulkAssignLicenseCSVData = (data) => {
	let csvData = [];

	for (let user of data) {
		if (Array.isArray(user.contracts) && user.contracts.length) {
			for (let contract of user.contracts) {
				csvData.push({
					Email: user.user_email,
					License: contract.license_name,
					"Start Date": contract.license_assigned_on
						? contract.license_assigned_on.split("T")[0]
						: "",
					Role: contract.role,
					"End Date": contract.license_unassigned_on
						? contract.license_unassigned_on.split("T")[0]
						: "",
				});
			}
		} else {
			csvData.push({
				Email: user.user_email,
				License: null,
				"Start Date": null,
				Role: null,
				"End Date": null,
			});
		}
	}

	return csvData;
};

export const updateReduxDataFromCSV = (data, csvData, licenses) => {
	for (let user of data) {
		user.removed_contracts = [...user.contracts];
		user.contracts = [];
		let currentUserRows = [...csvData].filter(
			(row) =>
				row["Email"] === user.user_email ||
				user.user_alternate_emails.includes(row["Email"])
		);
		if (currentUserRows.length) {
			for (let row of currentUserRows) {
				if (row["License"]) {
					const _license = getLicenseFromLicenseList(
						licenses,
						row,
						user
					);
					if (_license) {
						let index = user.removed_contracts.findIndex(
							(contract) =>
								contract.license_id === _license.license_id
						);
						if (!row["End Date"]) {
							user.contracts.push(_license);
							if (index >= 0) {
								let temp = [...user.removed_contracts];
								temp.splice(index, 1);
								user.removed_contracts = [...temp];
							}
						} else {
							if (
								new Date(_license.license_unassigned_on) >
								new Date()
							) {
								user.contracts.push(_license);
								if (index >= 0) {
									let temp = [...user.removed_contracts];
									temp.splice(index, 1);
									user.removed_contracts = [...temp];
								}
							} else if (index >= 0) {
								user.removed_contracts[index] = _license;
							}
						}
					}
				}
			}
		}
	}

	return data;
};

const getLicenseFromLicenseList = (licenses, row, user) => {
	const license = licenses.find((lic) => lic.license_name === row["License"]);
	return license
		? {
				license_id: license.license_id,
				license_name: license.license_name,
				license_assigned_on: row["Start Date"]
					? `${row["Start Date"]}T00:00:00.000Z`
					: `${new Date().toISOString().split("T")[0]}T00:00:00.000Z`,
				license_unassigned_on: row["End Date"]
					? `${row["End Date"]}T00:00:00.000Z`
					: null,
				license_auto_increment: license.auto_increment,
				integration_id: license.integration_id,
				integration_name: license.integration_name,
				integration_logo: license.integration_logo,
				org_integration_id: license.org_integration_id,
				org_integration_name: license.org_integration_name,
				cost_per_item: license.cost_per_item,
				role: row["Role"] || null,
		  }
		: null;
};

export const getLicensesForLicenseMapperCSVExport = (licenses) => {
	let csvData = [];
	for (let license of licenses) {
		csvData.push({
			Name: license.license_name,
		});
	}

	return csvData;
};

export const getLicenseMapperUsersForContract = (data, contractId) => {
	for (let user of data) {
		if (Array.isArray(user.contracts)) {
			user.contracts = user.contracts.filter(
				(contract) => contract.contract_id === contractId
			);
		} else {
			user.contract = [];
		}
	}

	return data;
};

// License Mapper CSV Validations Functions Start

export const hasValidEmail = (row, userEmails) => {
	return userEmails.includes(row["Email"]);
};

export const hasValidLicense = (row, licenseNames) => {
	if (!row["License"]) {
		return true;
	}
	return licenseNames.includes(row["License"]);
};

export const hasValidStartDate = (row) => {
	if (!row["License"]) {
		return true;
	}
	if (!row["Start Date"]) {
		return true;
	}
	if (
		new Date(
			UTCDateFormatter(row["Start Date"], LicenseMapperCSVDateFormat)
		) > new Date()
	) {
		return false;
	} else {
		return (
			UTCDateFormatter(row["Start Date"], LicenseMapperCSVDateFormat) ===
			row["Start Date"]
		);
	}
};

export const hasValidEndDate = (row) => {
	if (!row["End Date"]) {
		return true;
	}
	if (
		new Date(
			UTCDateFormatter(row["End Date"], LicenseMapperCSVDateFormat)
		) <
		new Date(
			UTCDateFormatter(row["Start Date"], LicenseMapperCSVDateFormat)
		)
	) {
		return false;
	} else {
		return (
			UTCDateFormatter(row["End Date"], LicenseMapperCSVDateFormat) ===
			row["End Date"]
		);
	}
};

export const hasValidRole = (row) => {
	if (!row["License"] || !row["Role"]) {
		return true;
	}
	return !checkSpecialCharacters(row["Role"]);
};

// License Mapper CSV Validations Functions End

export const getLicenseMapperRequestBody = (data) => {
	let arr = [];
	for (let user of data) {
		arr.push({
			user_id: user.user_id,
			assign_licenses: Array.isArray(user.contracts)
				? user.contracts.map((license) => {
						return {
							license_id: license.license_id,
							role: license.role,
							start_date:
								license.license_assigned_on ||
								dateResetTimeZone(new Date()),
							end_date: license.license_unassigned_on || null,
						};
				  })
				: [],
			unassign_licenses: Array.isArray(user.removed_contracts)
				? user.removed_contracts.map((license) => {
						return {
							license_id: license.license_id,
							end_date:
								license.license_unassigned_on ||
								dateResetTimeZone(new Date()),
						};
				  })
				: [],
		});
	}
	return { user_mapping_array: arr };
};

export const getCostPerLicenseCellContractTooltip = (license) => {
	return license?.contract_type === "contract"
		? `${getDateDiff(
				add24HoursToEndDateInTable(license?.contract_end_date),
				license?.contract_start_date
		  )} contract term`
		: license?.contract_type === "subscription"
		? `${license?.subscription_frequency || 1} ${
				license?.subscription_frequency === 1
					? license?.subscription_interval?.slice(0, -1) || "year"
					: license?.subscription_interval || "years"
		  } subscription term`
		: "Perpetual Contract";
};

export const getAssignedCountHyperlink = (licenseId, appId) => {
	const meta = {
		columns: [],
		filter_by: [
			{
				field_id: "license_mapped",
				field_name: "License Mapped",
				field_values: true,
				filter_type: "boolean",
				negative: false,
				is_custom: false,
			},
			{
				field_values: false,
				field_id: "user_archive",
				filter_type: "boolean",
				field_name: "User Archive",
				negative: false,
				is_custom: false,
			},
			{
				field_id: "user_app_archive",
				field_name: "User Application Archive",
				field_values: false,
				filter_type: "boolean",
				negative: false,
				is_custom: false,
			},
			{
				field_id: "licenses.license_id",
				field_name: "License Id",
				field_values: [licenseId],
				filter_type: "objectId",
				negative: false,
				is_custom: false,
			},
		],
		sort_by: [],
	};

	return `/applications/${appId}?metaData=${JSON.stringify(meta)}#users`;
};

export const getAllLicenseMapperUserEmails = (data) => {
	let emails = [];
	for (const user of data) {
		emails.push(user.user_email);
		if (Array.isArray(user.user_alternate_emails)) {
			emails = [...emails, ...user.user_alternate_emails];
		}
	}
	return emails;
};

export const getEndDateBySuggestion = (years, startDate) => {
	const startDateArray = startDate?.split("T")?.[0]?.split("-");
	startDateArray[0] = (Number(startDateArray?.[0]) + years)?.toString();
	const dateAfterEndDate = startDateArray?.join("-") + "T00:00:00.000Z";
	return new Date(
		new Date(dateAfterEndDate)?.setDate(
			new Date(dateAfterEndDate)?.getDate() - 1
		)
	)?.toISOString();
};
