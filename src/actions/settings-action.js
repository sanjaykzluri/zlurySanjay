import { settingsConstants } from "../constants/settings";
import { getAdmins } from "../services/api/settings";

export function fetchAllAdmins() {
	return async function (dispatch) {
		dispatch({
			type: settingsConstants.ADMINS_REQUESTED,
		});
		try {
			const response = await getAdmins();
			dispatch({
				type: settingsConstants.ADMINS_FETCHED,
				payload: {
					data: response.admins,
				},
			});
		} catch (err) {
			dispatch({
				type: settingsConstants.ADMINS_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}
