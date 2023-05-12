import { optimizationSummaryTableFilterKeys } from "../constants/OptimizationConstants";

export class OptimizationSummary {
	constructor(obj) {
		for (const filterKey of optimizationSummaryTableFilterKeys) {
			this[filterKey] = {};
			this[filterKey].data = Array.isArray(obj?.[filterKey]?.data)
				? obj?.[filterKey]?.data?.map(
						(row) => new OptimizationSummaryRow(row)
				  )
				: [];
			this[filterKey].prev_month_estimated_wastage =
				obj?.[filterKey]?.app_estimated_wastage || 0;
			this[filterKey].next_month_potential_savings =
				obj?.[filterKey]?.app_potential_savings || 0;
			this[filterKey].next_month_realised_savings =
				obj?.[filterKey]?.app_realised_savings || 0;
		}
	}
}

export class OptimizationSummaryRow {
	constructor(obj) {
		this.app_id = obj.app_id || null;
		this.app_name = obj.app_name || "";
		this.app_logo = obj.app_logo || null;
		this.app_state = obj.app_state || null;
		this.total_licenses = obj.app_total_seats_license_qty || 0;
		this.unassigned_licenses = obj.unassigned_licenses || 0;
		this.assigned_licenses = obj.assigned_licenses || 0;
		this.actively_used_licenses = obj.actively_used_licenses || 0;
		this.under_used_licenses = obj.under_used_licenses || 0;
		this.unused_licenses = obj.unused_licenses || 0;
		this.left_org_licenses = obj.left_organisation_licenses || 0;
		this.app_usage = obj.app_usage || 0;
		this.app_cost_per_license = obj.app_avg_cost_per_lic || 0;
		this.estimated_wastage = obj.past_month_wastage || 0;
		this.potential_savings = obj.aggregated_monthly_potential_savings || 0;
		this.optimized_licenses = obj.optimized_licenses_count || 0;
		this.realised_savings = obj.annualized_realized_savings || 0;
		this.license_types = obj.app_active_licenses_count || 1;
	}
}

export class OptimizationLicenseSummary {
	constructor(obj) {
		for (const filterKey of optimizationSummaryTableFilterKeys) {
			this[filterKey] = {};
			this[filterKey].data = Array.isArray(obj?.[filterKey]?.data)
				? obj?.[filterKey]?.data?.map(
						(row) => new OptimizationSummaryLicenseRow(row)
				  )
				: [];
		}
	}
}

export class OptimizationSummaryLicenseRow {
	constructor(obj) {
		this.license_id = obj.license_id || null;
		this.license_name = obj.license_name || "";
		this.total_licenses = obj.app_total_seats_license_qty || 0;
		this.unassigned_licenses = obj.unassigned_licenses || 0;
		this.assigned_licenses = obj.assigned_licenses || 0;
		this.actively_used_licenses = obj.actively_used_licenses || 0;
		this.under_used_licenses = obj.under_used_licenses || 0;
		this.unused_licenses = obj.unused_licenses || 0;
		this.left_org_licenses = obj.left_organisation_licenses || 0;
		this.app_cost_per_license = obj.cost_per_license || 0;
		this.estimated_wastage = obj.past_month_wastage || 0;
		this.potential_savings = obj.aggregated_monthly_potential_savings || 0;
		this.optimized_licenses = obj.optimized_licenses_count || 0;
		this.realised_savings = obj.annualized_realized_savings || 0;
	}
}
