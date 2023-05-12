import { LicenseMapperReduxConstants } from "modules/licenses/constants/LicenseConstants";
import { getLicenseMapperUsersForContract } from "modules/licenses/utils/LicensesUtils";
import { getApplicationUsersV2 } from "services/api/applications";
import { TriggerIssue } from "utils/sentry";

export function fetchAllLicenseMapperUsers({ appId, contractId }) {
	return async function (dispatch) {
		try {
			dispatch({
				type: LicenseMapperReduxConstants.REQUEST_ALL_LICENSE_MAPPER_USERS,
			});
			let page = 0;
			let loading = true;
			while (loading) {
				const response = await getApplicationUsersV2(
					appId,
					{ filter_by: [], sort_by: [], columns: [] },
					page,
					1000
				);
				dispatch({
					type: LicenseMapperReduxConstants.FETCH_ALL_LICENSE_MAPPER_USERS,
					payload: {
						hasMoreData: response.data?.length === 1000,
						data: getLicenseMapperUsersForContract(
							[...response.data],
							contractId
						),
						metaData: response.meta,
					},
				});
				if (response.data?.length !== 1000) {
					loading = false;
				}
				page++;
			}
		} catch (err) {
			TriggerIssue(`Error while fetching license mapper users`, err);
		}
	};
}

export function clearAllLicenseMapperUsers() {
	return async function (dispatch) {
		try {
			dispatch({
				type: LicenseMapperReduxConstants.CLEAR_ALL_LICENSE_MAPPER_USERS,
			});
		} catch (err) {
			TriggerIssue(`Error while clearing license mapper users`, err);
		}
	};
}

export function updateAllLicenseMapperUsers({ data }) {
	return async function (dispatch) {
		try {
			dispatch({
				type: LicenseMapperReduxConstants.UPDATE_ALL_LICENSE_MAPPER_USERS,
				payload: { data },
			});
		} catch (err) {
			TriggerIssue(`Error while updating all license mapper users`, err);
		}
	};
}

export function updateFewLicenseMapperUsers({ data }) {
	return async function (dispatch) {
		try {
			dispatch({
				type: LicenseMapperReduxConstants.UPDATE_FEW_LICENSE_MAPPER_USERS,
				payload: { data },
			});
		} catch (err) {
			TriggerIssue(`Error while updating few license mapper users`, err);
		}
	};
}

export function updateLicenseMapperScrollPosition(scrollTop) {
	return async function (dispatch) {
		try {
			dispatch({
				type: LicenseMapperReduxConstants.UPDATE_TABLE_SCROLL_POSITION,
				payload: { scrollTop },
			});
		} catch (err) {
			TriggerIssue(
				`Error while updating scroll position for license mapper table`,
				err
			);
		}
	};
}
