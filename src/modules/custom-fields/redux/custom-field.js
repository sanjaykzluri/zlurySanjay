import { forEach } from "underscore";
import { CustomField } from "../model/model";
import {
	addCustomFieldService,
	editCustomFieldService,
	deleteCustomFieldService,
	getAllCustomFieldService,
} from "../service/api";

const ACTION_TYPE = {
	ADD_CUSTOM_FIELD: "ADD_CUSTOM_FIELD",
	GET_ALL_CUSTOM_FIELDS: "GET_ALL_CUSTOM_FIELDS",
	EDIT_CUSTOM_FIELD: "EDIT_CUSTOM_FIELD",
	DELETE_CUSTOM_FIELD: "DELETE_CUSTOM_FIELD",
};

export const addCustomField = (payload) => {
	return async function (dispatch) {
		try {
			const response = await addCustomFieldService(payload);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.ADD_CUSTOM_FIELD,
					payload: { ...new CustomField(payload), id: response.id },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const editCustomField = (payload) => {
	return async function (dispatch) {
		try {
			const response = await editCustomFieldService(payload);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.EDIT_CUSTOM_FIELD,
					payload: new CustomField(payload),
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const deleteCustomField = (payload) => {
	return async function (dispatch) {
		try {
			const response = await deleteCustomFieldService(payload);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.DELETE_CUSTOM_FIELD,
					payload: new CustomField(payload),
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const getAllCustomField = () => {
	return async function (dispatch) {
		try {
			const response = await getAllCustomFieldService();
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.GET_ALL_CUSTOM_FIELDS,
					payload: response,
				});
		} catch (err) {
			console.log(err);
		}
	};
};

/**
 * STORE
 */
const customFieldsState = {};

/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */
export function customFieldsReducer(state = customFieldsState, action) {
	let of;
	switch (action.type) {
		case ACTION_TYPE.REQUEST_GET_ALL_CUSTOM_FIELDS:
			return { ...state, isCustomFieldRequested: true };

		case ACTION_TYPE.GET_ALL_CUSTOM_FIELDS:
			let results = {};
			action.payload?.forEach((el) => {
				results[el._id] = el.custom_fields.map((item) => {
					item["entity"] = el._id;
					return new CustomField(item);
				});
			});
			return Object.assign({}, state, { ...results });

		case ACTION_TYPE.ADD_CUSTOM_FIELD:
			of = state[action.payload.of];
			of.push(action.payload);
			return Object.assign({}, state, { [action.payload.of]: of });

		case ACTION_TYPE.EDIT_CUSTOM_FIELD:
			of = state[action.payload.of];
			of.splice(
				of.findIndex((ele) => ele.id === action.payload.id),
				1,
				action.payload
			);
			return Object.assign({}, state, { [action.payload.of]: of });

		case ACTION_TYPE.DELETE_CUSTOM_FIELD:
			of = state[action.payload.of];
			of.splice(
				of.findIndex((ele) => ele.id === action.payload.id),
				1
			);
			return Object.assign({}, state, { [action.payload.of]: of });

		default:
			return state;
	}
}
