import { applicationConstants, defaults } from "../../../constants";
import { getAllVendors } from "../../../services/api/applications";
import { client } from "../../../utils/client";

export function fetchAllVendors(page, cancelToken) {
	var isCanceled = false;
	if (cancelToken?.current?.token) {
		cancelToken.current.token.cancel("Operation cancelled in favor of a new request");
		isCanceled = true;
	}
	return async function (dispatch, getState) {
		
		dispatch({
			type: applicationConstants.ALL_VENDORS_REQUESTED,
		});
		try {
			cancelToken.current.token = client.CancelToken.source();
			const response = await getAllVendors(page, defaults.ALL_APPLICATIONS_ROW, cancelToken.current.token);

			dispatch({
				type: applicationConstants.ALL_VENDORS_FETCHED,
				payload: {
					data: response.data,
					// count: response.totalRows,
					pageNo: page,
					loading: false,
				},
			});
		} catch (err) {
			dispatch({
				type: applicationConstants.ALL_VENDORS_FETCHED,
				payload: {
					err: err,
					loading: isCanceled
				},
			});
		}
	};
}