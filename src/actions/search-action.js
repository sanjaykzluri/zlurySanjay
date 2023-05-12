import { searchConstants } from "../constants";
import { getSearch } from "../services/api/search";

export function fetchSearch(key) {
	return async function (dispatch) {
		dispatch({
			type: searchConstants.SEARCH_REQUESTED,
		});
		try {
			const response = await getSearch(key);

			dispatch({
				type: searchConstants.SEARCH_FETCHED,
				payload: {
					data: response,
				},
			});
		} catch (err) {
			dispatch({
				type: searchConstants.SEARCH_FETCHED,
				payload: {
					err,
				},
			});
		}
	};
}
