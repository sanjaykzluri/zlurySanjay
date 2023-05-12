import { kFormatter } from "../../../utils/common";
import {
	dateISOSringWithLocalTimezone,
	dateResetTimeZone,
	fixDateTimezone,
	FULL_MONTH,
} from "../../../utils/DateUtility";
import { zeroPad } from "../../../utils/ZeroPad";
import { RENEWAL_TYPE } from "../constants/constant";

export class RenewalPost {
	constructor(obj) {
		this.renewal_repeat_interval = obj.interval;
		this.renewal_repeat_frequency = obj.frequency;
		this.date = dateISOSringWithLocalTimezone(obj.date);
		this.id = obj.id;
		this.renewalID = obj.renewalID;
	}
}

export class RenewalEdit {
	constructor(obj) {
		this.interval = obj.renewal_repeat_interval;
		this.frequency = obj.renewal_repeat_frequency;
		this.date = fixDateTimezone(obj.date);
		this.id = obj.id;
		this.renewalID = obj.renewal_id || obj.renewalID;
		this.name = obj.name;
		this.typeID = obj.type_id;
		this.type = obj.type;
	}
}

export class ListRenewalApplication {
	constructor(obj) {
		let isContract = obj.type === RENEWAL_TYPE.CONTRACT;
		let hasApplication = !!obj.application_id && !!obj.application_name;
		this.renewal_has_application = hasApplication;
		this.id = hasApplication ? obj.application_id : obj.contract_id;
		this.logo = hasApplication ? obj.application_logo : null;
		this.name = hasApplication ? obj.application_name : obj.contract_name;
		this.userCount = isContract
			? obj.contract_user_count
			: obj.application_user_count;
		this.frequency = obj.frequency;
		this.interval = obj.interval;
		this.date = fixDateTimezone(obj.renewal_date);
		this.renewalID = obj.renewal_id;
		this.cost = kFormatter(obj.cost || 0);
		this.actualCost = obj.cost || 0;
		this.reminderDate = obj.reminder
			? fixDateTimezone(obj.reminder.date)
			: null;
		this.type = obj.type;
		this.isPaymentRenewal = obj.type === RENEWAL_TYPE.PAYMENT;
		this.contract_id = obj.contract_id;
		this.contract_type = obj.contract_type;
	}
}

export class MonthlyRenewal {
	constructor(obj) {
		this.applications = obj.renewals.map(
			(item) => new ListRenewalApplication(item)
		);
		this.clubedRenewal = () =>
			Object.values(
				this.applications.reduce((acc, item) => {
					acc[item.date.getDate()] = this.applications.filter(
						(app) => app.date.getDate() === item.date.getDate()
					);
					return acc;
				}, {})
			);
		this.monthID = obj.month_id;
		this.count = () => {
			return zeroPad(this.applications.length, 2);
		};
		this.spend = () =>
			kFormatter(
				this.applications.reduce((acc, items) => {
					return acc + items.actualCost;
				}, 0)
			);
		this.year = obj.year_id;
		this.getMonthYear = () => {
			return `${FULL_MONTH[this.monthID - 1]}\' ${this.year
				?.toString()
				.substr(-2)}`;
		};
		this.getApplications = () =>
			this.applications.filter(
				(res) => res.type === RENEWAL_TYPE.PAYMENT
			);
		this.getContracts = () =>
			this.applications.filter(
				(res) => res.type === RENEWAL_TYPE.CONTRACT
			);
	}
}

export class Renewal {
	constructor(obj) {
		const renewal = obj.app_renewal;
		this.frequency = renewal ? renewal?.repeat_frequency : null;
		this.interval = renewal ? renewal?.repeat_interval : null;
		this.id = obj.app_id;
		this.renewalID = obj.app_renewal_data?.renewal_id;
		this.date = obj.app_renewal_data
			? fixDateTimezone(obj.app_renewal_data.date)
			: null;
		this.reminderDate = obj.app_renewal_data?.reminder
			? fixDateTimezone(obj.app_renewal_data.reminder.date)
			: null;
		this.name = obj.app_name || "";
		this.type = obj.app_renewal_data?.type;
		this.typeID =
			this.type === RENEWAL_TYPE.APPLICATION
				? obj?.app_renewal_data?.org_app_id
				: obj?.app_renewal_data?.org_contract_id;
	}
}

export class CreateMontlyRenewal {
	constructor(month, year, renewals) {
		this.month_id = month;
		this.year_id = year;
		this.renewals = renewals;
	}
}
