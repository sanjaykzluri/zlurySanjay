import _ from "underscore";
const initialState = {
	screen: "STEPPER",
	stepConfig: {
		activeStep: 1,
	},
	data: {},
	stepperCardWidth: 1200,
};

const ACTION_TYPE = {
	UPDATE_SCREEN: "UPDATE_SCREEN",
	UPDATE_STEP: "UPDATE_STEP",
	UPDATE_DATA: "UPDATE_DATA",
	SET_REQ_DATA: "SET_REQ_DATA",
	DELETE_REQ_DATA: "DELETE_REQ_DATA",
	SET_INITIAL_STATE: "SET_INITIAL_STATE",
	SET_STEPPER_WIDTH: "SET_STEPPER_WIDTH",
};

export const getStepperDataSelector = (key) => (state) => state.stepper?.data;

export const stepperReducer = (state = initialState, action) => {
	switch (action.type) {
		case ACTION_TYPE.UPDATE_SCREEN:
			return { ...state, ...{ screen: action.payload } };

		case ACTION_TYPE.UPDATE_STEP:
			return {
				...state,
				...{
					stepConfig: {
						...state.stateConfig,
						...{ activeStep: action.payload },
					},
				},
			};

		case ACTION_TYPE.UPDATE_DATA:
			return {
				...state,
				..._.clone({
					data: {
						...state.data,
						...action.payload,
					},
				}),
			};

		case ACTION_TYPE.SET_REQ_DATA:
			return {
				...state,
				data: {
					...action.payload,
				},
			};

		case ACTION_TYPE.DELETE_REQ_DATA:
			return {
				...state,
				data: {},
			};

		case ACTION_TYPE.SET_INITIAL_STATE:
			return initialState;

		case ACTION_TYPE.SET_STEPPER_WIDTH:
			return {
				...state,
				stepperCardWidth: action.payload.stepperWidth,
			};

		default:
			return state;
	}
};

export const updateScreen = (screen) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.UPDATE_SCREEN,
				payload: screen,
			});
		} catch (err) {
			console.error(err);
		}
	};
};

export const updateStep = (step) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.UPDATE_STEP,
				payload: step,
			});
		} catch (err) {
			console.error(err);
		}
	};
};

export const updateStepperData = (data, id) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.UPDATE_DATA,
				payload: data,
			});
		} catch (err) {
			console.error(err);
		}
	};
};

export const setReqData = (data) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.SET_REQ_DATA,
				payload: data,
			});
		} catch (err) {
			console.error(err);
		}
	};
};

export const deleteReqData = () => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.DELETE_REQ_DATA,
			});
		} catch (err) {
			console.error(err);
		}
	};
};

export const setInititalStepperState = () => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.SET_INITIAL_STATE,
			});
		} catch (err) {
			console.error(err);
		}
	};
};

export const setStepperWidth = (stepperWidth) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.SET_STEPPER_WIDTH,
				payload: {
					stepperWidth: stepperWidth > 850 ? stepperWidth : 850,
				},
			});
		} catch (err) {
			console.error(err);
		}
	};
};
