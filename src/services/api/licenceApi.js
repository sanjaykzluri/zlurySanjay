import { client } from "../../utils/client";


export async function fetchInitialLicences(appId) {
    var response;
    try {
        response = await client.get(`application/${appId}/licensecontracts/get-initial-licenses`)
    } catch (error) {
        return { error: error };
    }
    return response.data;
}

export async function searchAppLicences(appId, query) {
    var response;
    try {
        response = await client.get(`application/${appId}/licensecontracts/search?q=${query}`)
    } catch (error) {
        return { error: error };
    }
    return response.data;
}

export async function addLicence(appId, requestBody) {
    var response;
    try {
        response = await client.post(`application/${appId}/licensecontracts/add`, requestBody)
    } catch (error) {
        return { error: error };
    }
    return response.data;
}

export async function assignLicence(appId, requestBody) {
    var response;
    try {
        response = await client.post(`application/${appId}/licensecontracts/assign`, requestBody)
    } catch (error) {
        return { error: error };
    }
    return response.data;
}

export async function unAssignLicence(appId, requestBody) {
    var response;
    try {
        response = await client.post(`application/${appId}/licensecontracts/remove`, requestBody)
    } catch (error) {
        return { error: error };
    }
    return response.data;
}

export async function assignRoleAndUpdateLicenseAssignmentDate(appId, requestBody) {
    var response;
    try {
        response = await client.put(`application/${appId}/licensecontracts/assign/details`, requestBody)
    } catch (error) {
        return { error: error };
    }
    return response.data;
}

export async function removeRoleAndUpdateLicenseRemovedDate(appId, requestBody) {
    var response;
    try {
        response = await client.put(`application/${appId}/licensecontracts/remove/details`, requestBody)
    } catch (error) {
        return { error: error };
    }
    return response.data;
}