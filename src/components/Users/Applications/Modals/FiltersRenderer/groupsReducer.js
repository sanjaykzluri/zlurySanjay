/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */

export const ACTION_TYPE = {
	UPDATE_GROUP_FILTER: "UPDATE_GROUP_FILTER",
	RESET_GROUP_FILTERS: "RESET_GROUP_FILTERS",
	RESET_GROUP_FILTER: "RESET_GROUP_FILTER",
	SET_GROUP_FILTERS: "SET_GROUP_FILTERS",
	UPDATE_ENTITY_ARRAY: "UPDATE_ENTITY_ARRAY",
	ENTITY_TYPE: "ENTITY_TYPE",
};

const initialState = {
	entity_group: [],
	entity_type: "",
};

export function groupsFilterReducer(state = initialState, action) {
	switch (action.type) {
		case ACTION_TYPE.UPDATE_GROUP_FILTER:
			return {
				...state,
				[action.payload.key]: [action.payload.value],
			};
		case ACTION_TYPE.UPDATE_ENTITY_ARRAY:
			const index = state[action.payload.key]
				.map((value) => value.field_id)
				.indexOf(action.payload.value.field_id);
			if (index > -1) {
				return {
					...state,
					[action.payload.key]: state[action.payload.key]
						.map((value) =>
							value.field_id === action.payload.value.field_id
								? action.payload.value
								: value
						)
						.filter((value) => value.field_values.length > 0),
				};
			} else {
				return {
					...state,
					[action.payload.key]: [
						...state[action.payload.key],
						action.payload.value,
					],
				};
			}
		case ACTION_TYPE.ENTITY_TYPE:
			return {
				...state,
				entity_type: action.payload,
			};
		case ACTION_TYPE.SET_GROUP_FILTERS:
			return { ...action.payload };
		case ACTION_TYPE.RESET_GROUP_FILTERS:
			return initialState;
		case ACTION_TYPE.RESET_GROUP_FILTER:
			delete state[action.payload.key];
			return { ...state };
		default:
			return state;
	}
}
