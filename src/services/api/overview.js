import { client } from "../../utils/client";

export async function getTopRow(orgId) {
	const response = await client.get(
		`organization/${orgId}/overview/top-row2`
	);
	return response.data;
}

export async function getMiniCharts(orgId) {
	const response = await client.get(
		`organization/${orgId}/overview/minicharts2`
	);
	return response.data;
}

export async function getBudget(orgId) {
	const response = await client.get(`organization/${orgId}/overview/budget`);
	return response.data;
}

export async function getApplications(orgId, sorted_via) {
	const response = await client.get(
		`organization/${orgId}/overview/applications2`,
		{
			params: {
				sorted_via,
			},
		}
	);
	return response.data;
}
export async function getSpendTrendOverview(
	orgId,
	start_month,
	end_month,
	start_year,
	end_year
) {
	const response = await client.get(
		`organization/${orgId}/overview/spendtrend/departments2`,
		{
			params: {
				start_month,
				end_month,
				start_year,
				end_year,
			},
		}
	);
	return response.data;
}

export async function getCategoryWiseTrendOverview(
	orgId,
	start_month,
	end_month,
	start_year,
	end_year
) {
	const response = await client.get(
		`organization/${orgId}/overview/spendtrend/app-category`,
		{
			params: {
				start_month,
				end_month,
				start_year,
				end_year,
			},
		}
	);
	return response.data;
}
