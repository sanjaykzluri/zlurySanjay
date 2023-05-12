import React from "react";
import { defaultReqBody } from "common/infiniteTableUtil";
import { TabNavItemApps } from "../../../components/Applications/TabsNavItemApps";

export function ContractTabs({
	entity,
	contract_id,
	contract_data,
	app_id,
	org_beta_features,
}) {
	const metaDataForUserTableURL = {
		...defaultReqBody,
		filter_by: [
			{
				field_id: "licenses.license_id",
				field_name: "License Id",
				field_values: Array.isArray(contract_data?.licenses)
					? contract_data?.licenses?.map((license) => license._id)
					: [],
				filter_type: "objectId",
				negative: false,
				is_custom: false,
			},
			{
				field_values: false,
				field_id: "user_archive",
				filter_type: "boolean",
				field_name: "Archive",
				negative: false,
				is_custom: false,
			},
		],
	};

	return (
		<ul className="nav nav-tabs">
			<TabNavItemApps hash="#overview" text="Overview" />
			{app_id && (
				<TabNavItemApps
					hash="#users"
					text="Users"
					to={`/licenses/${entity}s/${contract_id}?metaData=${encodeURIComponent(
						JSON.stringify(metaDataForUserTableURL)
					)}#users`}
				/>
			)}
			{app_id && org_beta_features?.includes("optimization") && (
				<TabNavItemApps hash="#optimization" text="Optimization" />
			)}
			<TabNavItemApps hash="#documents" text="Documents" />
		</ul>
	);
}
