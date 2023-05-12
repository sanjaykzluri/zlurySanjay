import { Map } from "immutable";
export const ACTION_TYPE = {
	OPEN_MODAL: "OPEN_MODAL",
	CLOSE_MODAL: "CLOSE_MODAL",
};
const modalState = new Map();
export const openModal = (type, modalProps) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.OPEN_MODAL,
				payload: {
					type,
					modalProps,
				},
			});
		} catch (reason) {
			console.log("Error while opening modal", reason);
		}
	};
};

export const closeModal = (type) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.CLOSE_MODAL,
				payload: { type },
			});
		} catch (reason) {
			console.log("Error while opening modal", reason);
		}
	};
};

export function modalReducer(state = modalState, action) {
	window.modal = modalState;

	switch (action.type) {
		case ACTION_TYPE.OPEN_MODAL:
			return modalState.set(action.payload.type, action.payload);
		case ACTION_TYPE.CLOSE_MODAL:
			let newmodal = modalState.remove(action.payload.type);
			return newmodal;
		default:
			return state;
	}
}
