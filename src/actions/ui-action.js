import { uiConstants } from "../constants/ui";
import { SAVE_USER_DETAILS } from "../constants/user";

export function preventScroll() {
	return {
		type: uiConstants.NOSCROLL,
		payload: {
			scroll: false,
		},
	};
}

export function allowScroll() {
	return {
		type: uiConstants.NOSCROLL,
		payload: {
			scroll: true,
		},
	};
}

export function openSearch() {
	return {
		type: uiConstants.SEARCH_STATUS,
		payload: {
			searchActive: true,
		},
	};
}

export function closeSearch() {
	return {
		type: uiConstants.SEARCH_STATUS,
		payload: {
			searchActive: false,
		},
	};
}

export function saveUserDetails(data) {
	return {
		type: SAVE_USER_DETAILS,
		payload: data,
	};
}
