import { employeeConstants } from "modules/employee-dashboard/constants/employee";
import { uploadImage } from "services/upload/upload";
import { TriggerIssue } from "utils/sentry";

const initialState = {
	theme: [
		{ item: "navigation_background", color: "#2266e2" },
		{ item: "active_selection", color: "#4E85E8" },
		{ item: "text", color: "#FFFFFF" },
		{ item: "hover_item", color: "#2266e2" },
		{ item: "active_menu_text", color: "#FFFFFF" },
	],
	icons: {
		organizationLogo: {
			url: "",
			text: "Organization Logo",
			loading: false,
		},
		favIcon: {
			url: "",
			text: "Favicon",
			loading: false,
		},
	},
	request_license_info: {},
};

export function setTheme(reqBody) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: employeeConstants.SET_THEME,
				payload: {
					reqBody: reqBody,
				},
			});
		} catch (err) {
			TriggerIssue(`Error while setting theme`, err);
		}
	};
}

export function setIcons(reqBody) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: employeeConstants.SET_ICONS,
				payload: {
					reqBody: reqBody,
				},
			});
		} catch (err) {
			TriggerIssue(`Error while setting theme`, err);
		}
	};
}

export function uploadIcon(entity, file) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: employeeConstants.SET_ICON_LOADING,
				payload: {
					entity: entity,
					loading: true,
				},
			});
			let res = await uploadImage(file);
			dispatch({
				type: employeeConstants.SET_ICON,
				payload: {
					entity: entity,
					url: res.resourceUrl,
				},
			});
		} catch (err) {
			TriggerIssue(`Error in uploading  image`, err);
		}
	};
}

export function setRequestLicenseDataRedux(data) {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: employeeConstants.SET_REQUEST_LICENSE,
				payload: {
					data: data,
				},
			});
		} catch (err) {
			TriggerIssue(`Error while setting request License Data`, err);
		}
	};
}

export function employeeReducer(state = initialState, action) {
	switch (action.type) {
		case employeeConstants.SET_THEME:
			var tempState = { ...state };
			tempState.theme = [...action.payload.reqBody];
			return tempState;
		case employeeConstants.SET_ICONS:
			var tempState = { ...state };
			let temp = { ...action.payload.reqBody };
			Object.keys(temp).forEach((el) => {
				temp[el].loading = false;
			});
			tempState.icons = { ...temp };

			return tempState;
		case employeeConstants.SET_ICON:
			var tempState = { ...state };
			tempState.icons[action.payload.entity] = {
				...tempState.icons[action.payload.entity],
				url: action.payload.url,
				loading: false,
			};
			return tempState;
		case employeeConstants.SET_ICON_LOADING:
			var tempState = { ...state };
			tempState.icons[action.payload.entity].loading = true;
			return tempState;
		case employeeConstants.SET_REQUEST_LICENSE:
			var tempState = { ...state };
			tempState.request_license_info = { ...action.payload.data };
			return tempState;
		default:
			return state;
	}
}
