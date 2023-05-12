import {
	getAppHealthCard,
	getAppHealthCards,
	getGlobalHealthCards,
} from "services/api/applications";
import { step } from "services/api/onboarding";
import _ from "underscore";
import { TriggerIssue } from "utils/sentry";

const ACTION_TYPE = {
	SAVE_GLOBAL_CARDS: "SAVE_GLOBAL_CARDS",
	SAVE_APP_CARDS: "SAVE_APP_CARDS",
	FETCH_APP_CARDS: "FETCH_APP_CARDS",
	RESET_APP_CARDS: "RESET_APP_CARDS",
	DELETE_APP_CARD: "DELETE_APP_CARD",
	UPDATE_CARD_STEP: "UPDATE_CARD_STEP",
	RESET_CARD_STEP: "RESET_CARD_STEP",
	FETCH_APP_CARD: "FETCH_APP_CARD",
	UPDATE_APP_CARD: "UPDATE_APP_CARD",
	UPDATE_LOCAL_DATA: "UPDATE_LOCAL_DATA",
};

export const selectGlobalHealthCards = (state) => state.globalHealthCards;
export const selectAppHealthCards = (state) => state.appHealthCards;
export const globalCardsReducer = (state = [], action) => {
	switch (action.type) {
		case ACTION_TYPE.SAVE_GLOBAL_CARDS:
			return action.payload;

		default:
			return state;
	}
};

export const cardStepSelector = (cardId) => (state) => {
	return state?.appHealthCards?.localData?.[cardId]?.step || 0;
};

export const localDataSelector = (cardId) => (state) => {
	return state?.appHealthCards?.localData?.[cardId];
};

export const appCardsReducer = (
	state = { data: [], loading: false },
	action
) => {
	switch (action.type) {
		case ACTION_TYPE.FETCH_APP_CARDS:
			return { ...state, loading: action.payload };
		case ACTION_TYPE.SAVE_APP_CARDS: {
			return {
				data: Array.isArray(action.payload) ? action.payload : [],
				loading: false,
				localData: state.localData,
			};
		}
		case ACTION_TYPE.DELETE_APP_CARD: {
			const updatedData = state.data.filter(
				(card) => card.card_id !== action.payload
			);
			return { ...state, data: updatedData };
		}

		case ACTION_TYPE.FETCH_APP_CARD: {
			const updatedData = state.data.map((card) => {
				if (card.card_id === action.payload) {
					return { ...card, loading: true };
				}
				return card;
			});
			return { ...state, data: updatedData };
		}

		case ACTION_TYPE.UPDATE_APP_CARD: {
			const updatedData = state.data.map((card) => {
				if (card.card_id === action.payload) {
					return { ...action.payload, loading: false };
				}
				return card;
			});
			return { ...state, data: updatedData };
		}

		case ACTION_TYPE.UPDATE_CARD_STEP: {
			return {
				...state,
				localData: {
					[action.payload]: {
						step:
							(state?.localData?.[action.payload]?.step || 0) + 1,
					},
				},
			};
		}

		case ACTION_TYPE.UPDATE_LOCAL_DATA: {
			return {
				...state,
				localData: {
					...state.localData,
					[action.payload?.cardId]: {...state?.localData[action.payload?.cardId], ...action.payload?.data},
				},
			};
		}

		case ACTION_TYPE.RESET_CARD_STEP: {
			return {
				...state,
				localData: {
					...state.localData,
					...{ [action.payload]: { step: 0 } },
				},
			};
		}

		case ACTION_TYPE.RESET_APP_CARDS:
			return { data: [], loading: false };
		default:
			return state;
	}
};

export const fetchGlobalHealthCards = () => {
	return async function (dispatch, getState) {
		try {
			const globalHealthCards = selectGlobalHealthCards(getState());
			if (globalHealthCards?.length > 0) return;
			const data = await getGlobalHealthCards();

			dispatch({
				type: ACTION_TYPE.SAVE_GLOBAL_CARDS,
				payload: data,
			});
		} catch (err) {
			TriggerIssue("Error in fetching global cards", err);
		}
	};
};

export const updateCardLocalData = (cardId, data) => {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: ACTION_TYPE.UPDATE_LOCAL_DATA,
				payload: {cardId, data},
			});
		} catch (err) {
			TriggerIssue("Error in fetching global cards", err);
		}
	};
};

export const updateStep = (cardId) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.UPDATE_CARD_STEP,
			payload: cardId,
		});
	};
};

export const resetStep = (cardId) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.RESET_CARD_STEP,
			payload: cardId,
		});
	};
};

export const resetAppHealthCards = () => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.RESET_APP_CARDS,
		});
	};
};

export const deleteAppHealthCards = (cardId) => {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: ACTION_TYPE.DELETE_APP_CARD,
				payload: cardId,
			});
		} catch (err) {
			TriggerIssue("Error in deleting health card", err);
		}
	};
};

export const fetchAppHealthCard = (appId, cardId) => {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: ACTION_TYPE.FETCH_APP_CARD,
			});

			const appCard = await getAppHealthCard(appId, cardId);
			if (appCard?.completed) {
				dispatch({
					type: ACTION_TYPE.DELETE_APP_CARD,
					payload: cardId,
				});
			} else {
				dispatch({
					type: ACTION_TYPE.UPDATE_APP_CARD,
					payload: appCard?.[0],
				});
			}
		} catch (err) {
			TriggerIssue(`Error in fetching health card ${appCard}`, err);
		}
	};
};
export const fetchAppHealthCards = (appId, showLoader, tab) => {
	return async function (dispatch, getState) {
		try {
			dispatch({
				type: ACTION_TYPE.FETCH_APP_CARDS,
				payload: !!showLoader,
			});
			await dispatch(fetchGlobalHealthCards());
			const globalHealthCards = selectGlobalHealthCards(getState());

			const appCards = await getAppHealthCards(appId, tab);

			const data = appCards.map((appCard) => {
				const globalHealthCard = globalHealthCards.find(
					(globalCard) => globalCard._id === appCard.card_id
				);
				return { ...globalHealthCard, ...appCard };
			});

			dispatch({
				type: ACTION_TYPE.SAVE_APP_CARDS,
				payload: data,
			});
		} catch (err) {
			TriggerIssue("Error in fetching health cards", err);
			dispatch({
				type: ACTION_TYPE.SAVE_APP_CARDS,
				payload: "Error in fetching health cards",
			});
		}
	};
};
