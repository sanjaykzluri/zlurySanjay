import { isBasicSubscriptionSelector } from "../../../common/restrictions";
import { RENEWAL_TYPE } from "../constants/constant";
import {
	CreateMontlyRenewal,
	MonthlyRenewal,
	RenewalEdit,
} from "../model/model";
import {
	addRenewalForApplication,
	addSetReminderForApplication,
	deleteReminderForRenewal,
	deleteRenewalForApplication,
	editRenewalForApplication,
	editSetReminderForApplication,
	getAllRenewals,
} from "../service/api";
import { fetchTopRow } from "../../../actions/overview-action";

const ACTION_TYPE = {
	APPLICATION_PAGE_RENEWAL: "APPLICATION_PAGE_RENEWAL",
	REMOVE_APPLICATION_PAGE_RENEWAL: "REMOVE_APPLICATION_PAGE_RENEWAL",
	ADD_RENEWAL: "ADD_RENEWAL",
	ADD_REMINDER_FROM_CALENDER: "ADD_REMINDER_FROM_CALENDER",
	EDIT_REMINDER_FROM_CALENDER: "EDIT_REMINDER_FROM_CALENDER",
	DELETE_REMINDER_FROM_CALENDER: "DELETE_REMINDER_FROM_CALENDAR",
	EDIT_RENEWAL: "EDIT_RENEWAL",
	EDIT_RENEWAL_FROM_CALENDER: "EDIT_RENEWAL_FROM_CALENDER",
	DELETE_RENEWAL_FROM_CALENDER: "DELETE_RENEWAL_FROM_CALENDER",
	ADD_REMINDER: "ADD_REMINDER",
	EDIT_REMINDER: "EDIT_REMINDER",
	DELETE_REMINDER: "DELETE_REMINDER",
	GET_ALL_RENEWALS: "GET_ALL_RENEWALS",
};

export const addRenewal = (applicationId, payload, app_name, orgId) => {
	return async function (dispatch) {
		try {
			const response = await addRenewalForApplication(
				applicationId,
				payload
			);
			if (!response.error) {
				dispatch({
					type: ACTION_TYPE.ADD_RENEWAL,
					payload: {
						...payload,
						renewal_id: response.renewal_id,
						id: applicationId,
						name: app_name,
						type_id: applicationId,
						type: RENEWAL_TYPE.APPLICATION,
					},
				});
				dispatch(fetchTopRow(orgId));
			}
		} catch (err) {
			console.log(err);
		}
	};
};

export const editRenewal = (applicationId, payload, orgId) => {
	return async function (dispatch) {
		try {
			const response = await editRenewalForApplication(payload);
			if (!response.error) {
				dispatch({
					type: ACTION_TYPE.EDIT_RENEWAL,
					payload: {
						...payload,
						renewalID: response.renewal_id,
					},
				});
				dispatch(fetchTopRow(orgId));
			}
		} catch (err) {
			console.log(err);
		}
	};
};

export const addReminder = (renewal, payload) => {
	return async function (dispatch) {
		try {
			const response = await addSetReminderForApplication(
				renewal.id,
				renewal.renewalID,
				payload
			);
			if (!response.error)
				dispatch({ type: ACTION_TYPE.ADD_REMINDER, payload });
		} catch (err) {
			console.log(err);
		}
	};
};

export const editReminder = (renewal, payload) => {
	return async function (dispatch) {
		try {
			const response = await editSetReminderForApplication(
				renewal.id,
				renewal.renewalID,
				payload
			);
			if (!response.error)
				dispatch({ type: ACTION_TYPE.EDIT_REMINDER, payload });
		} catch (err) {
			console.log(err);
		}
	};
};

export const deleteReminder = (renewal, payload) => {
	return async function (dispatch) {
		try {
			const response = await deleteReminderForRenewal(renewal.renewalID);
			if (!response.error)
				dispatch({ type: ACTION_TYPE.DELETE_REMINDER, payload });
		} catch (err) {
			console.log(err);
		}
	};
};

export const applicationRenewal = (payload) => {
	return { type: ACTION_TYPE.APPLICATION_PAGE_RENEWAL, payload };
};

export const removeApplicationRenewal = (payload) => {
	return { type: ACTION_TYPE.REMOVE_APPLICATION_PAGE_RENEWAL, payload };
};

/** FOR CALENDER VIEW */

export const deleteRenewal = (renewal, orgId) => {
	return async function (dispatch) {
		try {
			const response = await deleteRenewalForApplication(
				renewal.renewalID
			);
			if (!response.error) {
				dispatch({ type: ACTION_TYPE.REMOVE_APPLICATION_PAGE_RENEWAL });
				dispatch(fetchTopRow(orgId));
			}
		} catch (err) {
			console.log(err);
		}
	};
};

export const addReminderFromCalender = (renewal, payload) => {
	return async function (dispatch) {
		try {
			const response = await addSetReminderForApplication(
				renewal.id,
				renewal.renewalID,
				payload
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.ADD_REMINDER_FROM_CALENDER,
					payload: { renewal, payload },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const editReminderFromCalender = (renewal, payload) => {
	return async function (dispatch) {
		try {
			const response = await editSetReminderForApplication(
				renewal.id,
				renewal.renewalID,
				payload
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.EDIT_REMINDER_FROM_CALENDER,
					payload: { renewal, payload },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const deleteReminderFromCalender = (renewal, payload) => {
	return async function (dispatch) {
		try {
			const response = await deleteReminderForRenewal(renewal.renewalID);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.DELETE_REMINDER_FROM_CALENDER,
					payload: { renewal, payload },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const editRenewalFromCalender = (renewal, payload) => {
	return async function (dispatch) {
		try {
			const response = await editRenewalForApplication(payload);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.EDIT_RENEWAL_FROM_CALENDER,
					payload: { renewal, payload },
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const deleteRenewalFromCalender = (renewal) => {
	return async function (dispatch) {
		try {
			const response = await deleteRenewalForApplication(
				renewal.renewalID
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.DELETE_RENEWAL_FROM_CALENDER,
					payload: renewal,
				});
		} catch (err) {
			console.log(err);
		}
	};
};

export const getRenewals = (type) => {
	return async function (dispatch, getState) {
		try {
			const isBasicSubscription = isBasicSubscriptionSelector(getState());
			if (isBasicSubscription) {
				dispatch({
					type: ACTION_TYPE.GET_ALL_RENEWALS,
					payload: { data: [], isRestricted: true },
				});
			} else {
				const response = await getAllRenewals(type);
				dispatch({
					type: ACTION_TYPE.GET_ALL_RENEWALS,
					payload: { data: response, isRestricted: false },
				});
			}
		} catch (err) {
			console.log(err);
		}
	};
};

/**
 * STORE
 */
const renewalState = {
	renewal: null,
	renewalsList: null,
};

/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */
export function renewalReducers(state = renewalState, action) {
	let renewalList, renewalIndex, applicationIndex;
	switch (action.type) {
		case ACTION_TYPE.APPLICATION_PAGE_RENEWAL:
			return Object.assign({}, state, { renewal: action.payload });

		case ACTION_TYPE.ADD_RENEWAL:
			return Object.assign(
				{},
				{ renewal: new RenewalEdit(action.payload), renewalsList: [] }
			);

		case ACTION_TYPE.EDIT_RENEWAL:
			return Object.assign(
				{},
				{
					renewal: {
						...state.renewal,
						...new RenewalEdit(action.payload),
						name: state.renewal.name,
						reminderDate: null,
					},
					renewalsList: null,
				}
			);

		case ACTION_TYPE.ADD_REMINDER:
		case ACTION_TYPE.EDIT_REMINDER:
			return Object.assign(
				{},
				{
					renewal: {
						...state.renewal,
						reminderDate: new Date(action.payload.date),
					},
					renewalsList: null,
				}
			);

		case ACTION_TYPE.DELETE_REMINDER:
			return Object.assign(
				{},
				{
					renewal: {
						...state.renewal,
						reminderDate: null,
					},
					renewalsList: null,
				}
			);

		case ACTION_TYPE.REMOVE_APPLICATION_PAGE_RENEWAL:
			renewalList =
				state.renewalsList && Array.isArray(state.renewalsList)
					? [...state.renewalsList]
					: null;
			return Object.assign(
				{},
				{ renewal: null, renewalsList: renewalList }
			);

		case ACTION_TYPE.GET_ALL_RENEWALS:
			let calender = action.payload?.data.length
				? generateRenewalsForAYearAndBindData(action.payload?.data)
				: [];
			return Object.assign({}, state, {
				renewalsList: calender.map((i) => new MonthlyRenewal(i)),
				isRestricted: action?.payload?.isRestricted,
			});

		case ACTION_TYPE.ADD_REMINDER_FROM_CALENDER:
		case ACTION_TYPE.EDIT_REMINDER_FROM_CALENDER:
			renewalList = [...state.renewalsList];
			renewalIndex = renewalList.findIndex(
				(res) =>
					res.monthID ===
					new Date(action.payload.renewal.date).getMonth() + 1
			);
			applicationIndex = renewalList[renewalIndex].applications.findIndex(
				(res) => res.renewalID === action.payload.renewal.renewalID
			);
			renewalList[renewalIndex].applications[applicationIndex] = {
				...renewalList[renewalIndex].applications[applicationIndex],
				reminderDate: new Date(action.payload.payload.date),
			};
			return Object.assign({}, state, { renewalsList: renewalList });

		case ACTION_TYPE.DELETE_REMINDER_FROM_CALENDER:
			renewalList = [...state.renewalsList];
			renewalIndex = renewalList.findIndex(
				(res) =>
					res.monthID ===
					new Date(action.payload.renewal.date).getMonth() + 1
			);
			applicationIndex = renewalList[renewalIndex].applications.findIndex(
				(res) => res.renewalID === action.payload.renewal.renewalID
			);
			renewalList[renewalIndex].applications[applicationIndex] = {
				...renewalList[renewalIndex].applications[applicationIndex],
				reminderDate: null,
			};
			return Object.assign({}, state, { renewalsList: renewalList });

		case ACTION_TYPE.EDIT_RENEWAL_FROM_CALENDER:
			renewalList = [...state.renewalsList];
			renewalIndex = renewalList.findIndex(
				(res) =>
					res.monthID ===
					new Date(action.payload.renewal.date).getMonth() + 1
			);
			applicationIndex = renewalList[renewalIndex].applications.findIndex(
				(res) => res.renewalID === action.payload.renewal.renewalID
			);
			let renewalApplication = renewalList[
				renewalIndex
			].applications.splice(applicationIndex, 1)[0];
			Object.assign(renewalApplication, {
				frequency: action.payload.payload.renewal_repeat_frequency,
				interval: action.payload.payload.renewal_repeat_interval,
				date: new Date(action.payload.payload.date),
				reminderDate: null,
			});
			renewalList[
				renewalList.findIndex(
					(res) =>
						res.monthID === renewalApplication.date.getMonth() + 1
				)
			].applications.push(renewalApplication);
			return Object.assign({}, state, { renewalsList: renewalList });

		case ACTION_TYPE.DELETE_RENEWAL_FROM_CALENDER:
			renewalList = [...state.renewalsList];
			renewalIndex = renewalList.findIndex(
				(res) => res.monthID === action.payload.date.getMonth() + 1
			);
			if (renewalList[renewalIndex].applications.length > 1) {
				applicationIndex = renewalList[
					renewalIndex
				].applications.findIndex(
					(res) => res.renewalID === action.payload.renewalID
				);
				renewalList[renewalIndex].applications.splice(
					applicationIndex,
					1
				);
			} else {
				renewalList.splice(renewalIndex, 1);
			}
			return Object.assign(
				{},
				{ renewal: null, renewalsList: renewalList }
			);

		default:
			return state;
	}
}

/**
 * Function to generate object of type CreateMontlyRenewal for next 2 months from the current month.
 * And replace the one which is available in API response with it
 * @param {*} data
 */
function generateRenewalsForAYearAndBindData(data) {
	const renewalsForAYear = [];
	let [month, year] = [new Date().getMonth() + 1, new Date().getFullYear()];
	let i = 0;
	while (renewalsForAYear.length < 12) {
		if (month + i <= 12)
			renewalsForAYear.push(new CreateMontlyRenewal(month + i, year, []));
		else {
			year++;
			month = 0;
			i = 0;
		}
		i++;
	}
	return renewalsForAYear.reduce((acc, item) => {
		let renewal = data.find(
			(ele) =>
				ele.month_id === item.month_id && ele.year_id === item.year_id
		);
		acc.push(renewal ? renewal : item);
		return acc;
	}, []);
}
