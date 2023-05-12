import {
	add_edit_Reminder,
	delete_Reminder,
} from "../../../services/api/notes";

const ACTION_TYPE = {
	UPDATE_REMINDER: "UPDATE_NOTE_REMINDER",
};

export const add_edit_ReminderDispatcher = (
	note,
	payload,
	entity,
	callbackFn
) => {
	return async function (dispatch) {
		try {
			var response = await add_edit_Reminder(note._id, payload);
			callbackFn({
				...response,
				error: false,
			});
			if (!response.error) {
				var noteObj = response.note;
				dispatch({
					type: ACTION_TYPE.UPDATE_REMINDER,
					noteObj,
					entity,
				});
			}
		} catch (err) {
			callbackFn({
				error:
					err.response.data ===
					"Too many requests, please try again later."
						? err.response.data
						: true,
			});
			console.log(err);
		}
	};
};

export const deleteReminderDispatcher = (note, payload, entity, callbackFn) => {
	return async function (dispatch) {
		try {
			const response = await delete_Reminder(note._id, payload);
			callbackFn(response);
			if (!response.error) {
				var noteObj = response.note;
				dispatch({
					type: ACTION_TYPE.UPDATE_REMINDER,
					noteObj,
					entity,
				});
			}
		} catch (err) {
			console.log(err);
		}
	};
};

const notesReminder = {
	application: {},
	user: {},
	department: {},
};

/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */

export function noteReminderReducers(state = notesReminder, action) {
	switch (action.type) {
		case ACTION_TYPE.UPDATE_REMINDER:
			return Object.assign(
				{},
				{
					...state,
					[action.entity.type]: {
						[action.entity.id]: {
							...state.application[action.entity.id],
							...{
								[action.noteObj._id]: {
									...action.noteObj,
									reminderDate: new Date(
										action.noteObj.reminder.reminder_date
									),
								},
							},
						},
					},
				}
			);
		default:
			return state;
	}
}
