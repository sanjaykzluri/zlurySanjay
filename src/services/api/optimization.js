import axios from "axios";
import { client } from "../../utils/client";

export async function generateApplicationOptimization(
	appId,
	first_load = false,
	startMonth,
	startYear,
	endMonth,
	endYear,
	days = 30,
	usage = 30
) {
	let response;
	if (first_load) {
		response = await client.get(
			`applications/${appId}/optimization/generateReport?first_load=${first_load}`
		);
	} else {
		response = await client.get(
			`applications/${appId}/optimization/generateReport?first_load=${first_load}&start_month=${startMonth}&end_month=${endMonth}&start_year=${startYear}&end_year=${endYear}&days=${days}&usage=${usage}`
		);
	}
	return response;
}

export async function generateContractOptimization(
	contractId,
	first_load = false,
	startMonth,
	startYear,
	endMonth,
	endYear,
	days = 30,
	usage = 30
) {
	let response;
	if (first_load) {
		response = await client.get(
			`contracts/${contractId}/optimization/generateReport?first_load=${first_load}`
		);
	} else {
		response = await client.get(
			`contracts/${contractId}/optimization/generateReport?first_load=${first_load}&start_month=${startMonth}&end_month=${endMonth}&start_year=${startYear}&end_year=${endYear}&days=${days}&usage=${usage}`
		);
	}
	return response;
}

export async function getOptimizationLicenseUsageData(
	appId,
	startMonth,
	startYear,
	endMonth,
	endYear
) {
	const response = await client.get(
		`applications/${appId}/optimization?start_month=${startMonth}&end_month=${endMonth}&start_year=${startYear}&end_year=${endYear}`
	);
	return response;
}

export async function getActivelyUsedGraphTableData(
	appId,
	startMonth,
	startYear,
	endMonth,
	endYear
) {
	const response = await client.get(
		`applications/${appId}/optimization/actively-used?start_month=${startMonth}&end_month=${endMonth}&start_year=${startYear}&end_year=${endYear}`
	);
	return response;
}

export async function getUnassignedGraphTableData(
	appId,
	startMonth,
	startYear,
	endMonth,
	endYear
) {
	const response = await client.get(
		`applications/${appId}/optimization/unassigned?start_month=${startMonth}&end_month=${endMonth}&start_year=${startYear}&end_year=${endYear}`
	);
	return response;
}

export async function getUnderUsedGraphTableData(
	appId,
	startMonth,
	startYear,
	endMonth,
	endYear,
	usage = 30
) {
	const response = await client.get(
		`applications/${appId}/optimization/under-used?start_month=${startMonth}&end_month=${endMonth}&start_year=${startYear}&end_year=${endYear}&usage=${usage}`
	);
	return response;
}

export async function getUnusedGraphTableData(
	appId,
	startMonth,
	startYear,
	endMonth,
	endYear,
	days = 30
) {
	const response = await client.get(
		`applications/${appId}/optimization/unused?start_month=${startMonth}&end_month=${endMonth}&start_year=${startYear}&end_year=${endYear}&days=${days}`
	);
	return response;
}

export async function getLeftOrgGraphTableData(
	appId,
	startMonth,
	startYear,
	endMonth,
	endYear
) {
	const response = await client.get(
		`applications/${appId}/optimization/left-org?start_month=${startMonth}&end_month=${endMonth}&start_year=${startYear}&end_year=${endYear}`
	);
	return response;
}

export async function getLicenseUsers(appId, body, searchQuery) {
	const response = await client.post(
		`applications/${appId}/optimization/license/users${
			searchQuery ? `?q=${searchQuery}` : ""
		}`,
		body
	);
	return response.data;
}

export async function deleteOptimizationReport(_id, type) {
	const response = await client.put(`delete-report`, { _id, type });
	return response.data;
}

export async function getOptimizationSummary() {
	const response = await client.get(`optimization/summary`);
	return response.data;
}

export async function getOptimizationSummaryLicenseBreakdown(appId) {
	const response = await client.get(
		`application/${appId}/optimization/licenses-summary`
	);
	return response.data;
}
