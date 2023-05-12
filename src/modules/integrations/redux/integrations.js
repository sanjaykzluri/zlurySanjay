import { INTEGRATION_STATUS, REQUEST_STATUS } from "../constants/constant";
import {
	Integration,
	IntegrationCategory,
	PendingRequestIntegration,
	V2Integration,
	V2IntegrationCategory,
} from "../model/model";
import {
	fetchCategoriesService,
	fetchIntegrationsService,
	fetchIntegrationService,
	fetchRecommendedIntegrationsService,
	fetchPendingRequestIntegrationsService,
	remindIntegrationRequestService,
	withdrawIntegrationRequestService,
	fetchIntegrationServiceV2,
	fetchCatalogService,
	fetchIntegrationsCollection,
	reSendInvite,
	fetchAvailableForPocIntegrations,
	fetchAllIntegrations,
	fetchV2IntegrationByID,
	getIntegrationUserMappingCount,
	fetchCarousalImages,
	getIntegrationsErrorStatus,
} from "modules/integrations/service/api";
import moment from "moment";

import { TriggerIssue } from "utils/sentry";

const ACTION_TYPE = {
	FETCH_INTEGRATIONS_CATEGORIES: "FETCH_INTEGRATIONS_CATEGORIES",
	FETCH_INTEGRATION: "FETCH_INTEGRATION",
	FETCH_INTEGRATIONS_CATALOG_SERVICES: "FETCH_INTEGRATIONS_CATALOG_SERVICES",
	FETCH_INTEGRATIONS: "FETCH_INTEGRATIONS",
	FETCH_RECOMMENDED_INTEGRATIONS: "FETCH_RECOMMENDED_INTEGRATIONS",
	FETCH_ESSENTIAL_INTEGRATIONS: "FETCH_ESSENTIAL_INTEGRATIONS",
	FETCH_STAFF_PICK_INTEGRATIONS: "FETCH_STAFF_PICK_INTEGRATIONS",
	REMOVE_INTEGRATION_DETAILS: "REMOVE_INTEGRATION_DETAILS",
	DISCONNECT_INTEGRATION: "DISCONNECT_INTEGRATION",
	INTEGRATION_CONNECTED: "INTEGRATION_CONNECTED",
	SELECTED_CATEGORY: "SELECTED_CATEGORY",
	SELECTED_COLLECTION: "SELECTED_COLLECTION",
	SELECTED_CAPABILITY: "SELECTED_CAPABILITY",
	RECOMMENDED_CATEGORY: "RECOMMENDED_CATEGORY",
	CATEGORY_BY_STATUS: "CATEGORY_BY_STATUS",
	FETCH_PENDING_REQUEST_INTEGRATIONS: "FETCH_PENDING_REQUEST_INTEGRATIONS",
	SHOW_PENDING_REQUEST_INTEGRATIONS: "SHOW_PENDING_REQUEST_INTEGRATIONS",
	INITIATE_REMIND_INTEGRATION_REQUEST: "INITIATE_REMIND_INTEGRATION_REQUEST",
	REMIND_INTEGRATION_REQUEST: "REMIND_INTEGRATION_REQUEST",
	INITIATE_RESEND_INTEGRATION_REQUEST: "INITIATE_RESEND_INTEGRATION_REQUEST",
	RESEND_INTEGRATION_REQUEST: "RESEND_INTEGRATION_REQUEST",
	INITIATE_WITHDRAW_INTEGRATION_REQUEST:
		"INITIATE_WITHDRAW_INTEGRATION_REQUEST",
	WITHDRAW_INTEGRATION_REQUEST: "WITHDRAW_INTEGRATION_REQUEST",
	REFRESH_PR_STATE: "REFRESH_PR_STATE",
	RESET_INTEGRATION: "RESET_INTEGRATION",
	UPDATE_INTEGRATION_REQUEST: "UPDATE_INTEGRATION_REQUEST",
	FETCH_CATALOG_BANNERS: "FETCH_CATALOG_BANNERS",
	FETCH_INTEGRATION_INSTANCES: "FETCH_INTEGRATION_INSTANCES",
	FETCH_INTEGRATION_ERROR_STATUS: "FETCH_INTEGRATION_ERROR_STATUS",
	RESET_INSTANCES: "RESET_INSTANCES",
};

export const resetIntegration = () => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.RESET_INTEGRATION,
			payload: true,
		});
};

export const resetInstances = () => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.RESET_INSTANCES,
			payload: true,
		});
};

export const disconnectIntegration = () => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.DISCONNECT_INTEGRATION,
			payload: true,
		});
};

export const refreshPRState = () => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.REFRESH_PR_STATE,
			payload: true,
		});
};

export const updateRequestForIntegrations = (integrationID) => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.UPDATE_INTEGRATION_REQUEST,
			payload: { id: integrationID },
		});
};

export const showPendingRequestPage = () => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.SHOW_PENDING_REQUEST_INTEGRATIONS,
			payload: null,
		});
};

export const integrationConnected = () => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.INTEGRATION_CONNECTED,
			payload: true,
		});
};

export function refreshIntegrations() {
	return async function (dispatch, getState) {
		const showRecommended = getState().integrations.showRecommended;
		const selectedCategory = getState().integrations.selectedCategory;
		const status = getState().integrations.showCategoryByStatus;
		if (showRecommended) {
			dispatch(fetchRecommendedIntegrations());
			dispatch(showRecommendedCategory());
		} else if (selectedCategory?.id) {
			dispatch(fetchIntegrations(selectedCategory.id));
		} else {
			dispatch(fetchIntegrations(null, null, status));
		}
	};
}

export const fetchCategories = () => {
	return async function (dispatch) {
		try {
			const response = await fetchCategoriesService();
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.FETCH_INTEGRATIONS_CATEGORIES,
					payload: response.map(
						(category) => new IntegrationCategory(category)
					),
				});
		} catch (err) {
			TriggerIssue("Error in fetching categories", err);
		}
	};
};

export const fetchCatalogSidebar = () => {
	return async function (dispatch) {
		try {
			const response = await fetchCatalogService();
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.FETCH_INTEGRATIONS_CATALOG_SERVICES,
					payload: response,
				});
		} catch (err) {
			TriggerIssue("Error in fetching catalog sidebar", err);
		}
	};
};

export const fetchEssentialIntegrations = (status) => {
	return async function (dispatch) {
		try {
			const response = await fetchIntegrationsCollection(
				null,
				undefined,
				status
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.FETCH_ESSENTIAL_INTEGRATIONS,
					payload: {
						integrations: response.map(
							(integration) => new Integration(integration)
						),
						recommended: false,
					},
				});
		} catch (err) {
			TriggerIssue("Error in fetching essential integrations", err);
		}
	};
};

export const fetchStaffPickIntegrations = (status) => {
	return async function (dispatch) {
		try {
			const response = await fetchIntegrationsCollection(
				null,
				undefined,
				status
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.FETCH_STAFF_PICK_INTEGRATIONS,
					payload: {
						integrations: response.map(
							(integration) => new Integration(integration)
						),
						recommended: false,
					},
				});
		} catch (err) {
			TriggerIssue("Error in fetching staff picks integrations", err);
		}
	};
};

export const fetchIntegrations = (
	categoryID,
	sort_by,
	status,
	cancelToken,
	isCollection,
	isCapability
) => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.FETCH_INTEGRATIONS,
			payload: {
				integrations: null,
				recommended: false,
			},
		});

		try {
			let response;
			if (status?.toLowerCase() === "available for poc") {
				response = await fetchAvailableForPocIntegrations(cancelToken);
			} else {
				response =
					categoryID?.toLowerCase() === "all"
						? await fetchAllIntegrations(cancelToken)
						: await fetchIntegrationsService(
								categoryID,
								sort_by,
								status,
								cancelToken,
								isCollection,
								isCapability
						  );
			}

			if (!response.error)
				dispatch({
					type: ACTION_TYPE.FETCH_INTEGRATIONS,
					payload: {
						integrations: response.map(
							(integration) => new Integration(integration)
						),
						recommended: false,
					},
				});
		} catch (err) {
			TriggerIssue("Error in fetching integrations", err);
		}
	};
};

export const fetchCatalogBanners = () => {
	return async function (dispatch) {
		try {
			let data = await fetchCarousalImages();
			if (!data.error)
				dispatch({
					type: ACTION_TYPE.FETCH_CATALOG_BANNERS,
					payload: {
						images: data,
					},
				});
		} catch (err) {
			TriggerIssue("Error in fetching catalog banners", err);
		}
	};
};

export const fetchRecommendedIntegrations = (cancelToken, sort_by) => {
	return async function (dispatch) {
		try {
			const response = await fetchRecommendedIntegrationsService(
				cancelToken,
				sort_by
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.FETCH_RECOMMENDED_INTEGRATIONS,
					payload: {
						integrations: response.map(
							(int) => new Integration(int)
						),
						recommended: true,
					},
				});
		} catch (err) {
			TriggerIssue("Error in fetching recommended integrations", err);
		}
	};
};

export const fetchPendingRequestIntegrations = (pageNo, query = "", sortBy) => {
	return async function (dispatch) {
		try {
			const response = await fetchPendingRequestIntegrationsService(
				pageNo,
				query,
				sortBy
			);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.FETCH_PENDING_REQUEST_INTEGRATIONS,
					payload: {
						integrations: response.requests.map(
							(integration) =>
								new PendingRequestIntegration(integration)
						),
						count: response.count,
						sortBy: sortBy ? true : false,
					},
				});
		} catch (err) {
			TriggerIssue("Error in fetching pending request integrations", err);
		}
	};
};

export const remindIntegrationRequest = (integrationID, inviteID) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.INITIATE_REMIND_INTEGRATION_REQUEST,
				payload: {
					id: integrationID,
					inviteID: inviteID,
					requestType: "reminding",
				},
			});
			const response = await remindIntegrationRequestService(inviteID);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.REMIND_INTEGRATION_REQUEST,
					payload: {
						id: integrationID,
						inviteID: inviteID,
						requestType: "reminding",
					},
				});
		} catch (err) {
			TriggerIssue("Error in reminding integration request", err);
		}
	};
};

export const resendIntegrationRequest = (integrationID, inviteID) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.INITIATE_RESEND_INTEGRATION_REQUEST,
				payload: {
					id: integrationID,
					inviteID: inviteID,
					requestType: "resending",
				},
			});
			const response = await reSendInvite(inviteID);
			if (!response.error)
				dispatch({
					type: ACTION_TYPE.RESEND_INTEGRATION_REQUEST,
					payload: {
						id: integrationID,
						inviteID: inviteID,
						requestType: "resending",
					},
				});
		} catch (err) {
			TriggerIssue("Error in resending integration request", err);
		}
	};
};

export const withdrawIntegrationRequest = (integrationID, inviteID) => {
	return async function (dispatch) {
		try {
			dispatch({
				type: ACTION_TYPE.INITIATE_WITHDRAW_INTEGRATION_REQUEST,
				payload: {
					id: integrationID,
					inviteID: inviteID,
					requestType: "withdrawing",
				},
			});
			const response = await withdrawIntegrationRequestService(
				integrationID,
				inviteID
			);
			if (!response.error) {
				dispatch({
					type: ACTION_TYPE.WITHDRAW_INTEGRATION_REQUEST,
					payload: {
						id: integrationID,
						inviteID: inviteID,
					},
				});
			}
		} catch (err) {
			TriggerIssue("Error in withdrawing integration request", err);
		}
	};
};

export const fetchIntegrationDetails = (id) => {
	return async function (dispatch) {
		try {
			let integration;
			let count;
			fetchIntegrationServiceV2(id).then((response) => {
				integration = response;
				if (!response.error) {
					getIntegrationUserMappingCount(id).then((response) => {
						count = response.total_unmapped_user_key;
						if (!response.error)
							dispatch({
								type: ACTION_TYPE.FETCH_INTEGRATION,
								payload: {
									...new Integration(integration),
									...{ count: count },
								},
							});
					});
				}
			});
		} catch (err) {
			TriggerIssue("Error in fetching integration details", err);
		}
	};
};

export const fetchIntegrationInstances = (id) => {
	return async function (dispatch) {
		try {
			let integration;
			fetchV2IntegrationByID(id).then((response) => {
				integration = response;
				if (!response.error) {
					if (!response.error)
						dispatch({
							type: ACTION_TYPE.FETCH_INTEGRATION_INSTANCES,
							payload: {
								...new V2Integration(integration),
							},
						});
				}
			});
		} catch (err) {
			TriggerIssue("Error in fetching instances", err);
		}
	};
};

export const fetchIntegrationErrorStatus = () => {
	return async function (dispatch) {
		try {
			getIntegrationsErrorStatus().then((response) => {
				if (!response.errors) {
					dispatch({
						type: ACTION_TYPE.FETCH_INTEGRATION_ERROR_STATUS,
						payload: {
							...response,
						},
					});
				}
			});
		} catch (err) {
			TriggerIssue("Error in fetching instances", err);
		}
	};
};

export const setSelectedCategory = (category) => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.SELECTED_CATEGORY,
			payload: category,
		});
};

export const setSelectedCollection = (collection) => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.SELECTED_COLLECTION,
			payload: collection,
		});
};

export const setSelectedCapability = (capability) => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.SELECTED_CAPABILITY,
			payload: capability,
		});
};

export const showRecommendedCategory = () => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.RECOMMENDED_CATEGORY,
			payload: true,
		});
};

export const showCategoryByStatus = (v) => {
	return (dispatch) =>
		dispatch({
			type: ACTION_TYPE.CATEGORY_BY_STATUS,
			payload: v,
		});
};

export const removeIntegrationDetails = () => {
	return async function (dispatch) {
		dispatch({
			type: ACTION_TYPE.REMOVE_INTEGRATION_DETAILS,
		});
	};
};

/**
 * STORE
 */
const integrations = {
	categories: [
		new IntegrationCategory({ category_id: null, category_name: "All" }),
	],
	catalogSidebar: null,
	integrations: null,
	selectedCategory: null,
	selectedCollection: null,
	showCategoryByStatus: null,
	showRecommended: true,
	integration: null,
	showPendingRequest: false,
	pendingRequestIntegrations: [],
	pendingRequestIntegrationsCount: null,
	essentialIntegrations: null,
	staffPickIntegrations: null,
	catalogBanners: null,
	integrationInstances: null,
	integrationErrorStatus: null,
};

/**
 * Reducer
 * @param {*} state // state of the current reducer
 * @param {*} action // action dispatched {type:"",payload:{}}
 */
export function integrationsReducer(state = integrations, action) {
	switch (action.type) {
		case ACTION_TYPE.RESET_INTEGRATION:
			return Object.assign(
				{},
				{ ...state },
				{
					integration: null,
					integrations: null,
					essentialIntegrations: null,
					staffPickIntegrations: null,
				}
			);
		case ACTION_TYPE.RESET_INSTANCES:
			return Object.assign(
				{},
				{ ...state },
				{
					integrationInstances: null,
					integrationErrorStatus: null,
				}
			);
		case ACTION_TYPE.FETCH_INTEGRATIONS_CATEGORIES:
			return Object.assign(
				{},
				{ ...state },
				{
					categories: [...state.categories, ...action.payload],
					showPendingRequest: false,
				}
			);
		case ACTION_TYPE.FETCH_INTEGRATIONS_CATALOG_SERVICES:
			return Object.assign(
				{},
				{ ...state },
				{
					catalogSidebar: {
						...action.payload,
					},
					showPendingRequest: false,
				}
			);
		case ACTION_TYPE.REFRESH_PR_STATE:
			return Object.assign(
				{},
				{ ...state },
				{
					pendingRequestIntegrations: [],
					pendingRequestIntegrationsCount: null,
				}
			);

		case ACTION_TYPE.FETCH_RECOMMENDED_INTEGRATIONS:
			return Object.assign(
				{},
				{ ...state },
				{ recommendedIntegrations: action.payload.integrations }
			);
		case ACTION_TYPE.FETCH_INTEGRATIONS:
			return Object.assign(
				{},
				{ ...state },
				{ integrations: action.payload.integrations }
			);
		case ACTION_TYPE.FETCH_INTEGRATION_INSTANCES:
			return Object.assign(
				{},
				{ ...state },
				{ integrationInstances: action.payload }
			);
		case ACTION_TYPE.FETCH_INTEGRATION_ERROR_STATUS:
			return Object.assign(
				{},
				{ ...state },
				{ integrationErrorStatus: action.payload }
			);
		case ACTION_TYPE.FETCH_ESSENTIAL_INTEGRATIONS:
			return Object.assign(
				{},
				{ ...state },
				{ essentialIntegrations: action.payload.integrations }
			);
		case ACTION_TYPE.FETCH_STAFF_PICK_INTEGRATIONS:
			return Object.assign(
				{},
				{ ...state },
				{ staffPickIntegrations: action.payload.integrations }
			);

		case ACTION_TYPE.FETCH_INTEGRATION:
			return Object.assign(
				{},
				{ ...state },
				{ integration: action.payload }
			);
		case ACTION_TYPE.FETCH_PENDING_REQUEST_INTEGRATIONS: {
			const list = [
				...state.pendingRequestIntegrations,
				...action.payload.integrations,
			];
			return Object.assign(
				{},
				{ ...state },
				{
					pendingRequestIntegrations: list,
					pendingRequestIntegrationsCount: action.payload.count,
				}
			);
		}
		case ACTION_TYPE.REMOVE_INTEGRATION_DETAILS:
			return Object.assign({}, { ...state }, { integration: null });
		case ACTION_TYPE.SELECTED_CATEGORY:
			return Object.assign(
				{},
				{ ...state },
				{
					selectedCategory: action.payload,
					showRecommended: false,
					showCategoryByStatus: null,
					showPendingRequest: false,
				}
			);
		case ACTION_TYPE.SELECTED_COLLECTION:
			return Object.assign(
				{},
				{ ...state },
				{
					selectedCollection: action.payload,
					showRecommended: false,
					showCategoryByStatus: null,
					showPendingRequest: false,
				}
			);
		case ACTION_TYPE.SELECTED_CAPABILITY:
			return Object.assign(
				{},
				{ ...state },
				{
					selectedCapability: action.payload,
					showRecommended: false,
					showCategoryByStatus: null,
					showPendingRequest: false,
				}
			);
		case ACTION_TYPE.RECOMMENDED_CATEGORY:
			return Object.assign(
				{},
				{ ...state },
				{
					integrations: null,
					selectedCategory: null,
					showRecommended: true,
					showCategoryByStatus: null,
					showPendingRequest: false,
				}
			);
		case ACTION_TYPE.SHOW_PENDING_REQUEST_INTEGRATIONS:
			return Object.assign(
				{},
				{ ...state },
				{
					selectedCategory: null,
					showRecommended: null,
					showCategoryByStatus: null,
					showPendingRequest: true,
				}
			);
		case ACTION_TYPE.INITIATE_REMIND_INTEGRATION_REQUEST:
		case ACTION_TYPE.INITIATE_RESEND_INTEGRATION_REQUEST:
		case ACTION_TYPE.INITIATE_WITHDRAW_INTEGRATION_REQUEST: {
			let list = [...state.pendingRequestIntegrations];
			var index = list.findIndex(
				(item) =>
					item.id === action.payload.id &&
					item.invite_id === action.payload.inviteID
			);
			if (index > -1) {
				if (action.payload.requestType === "reminding") {
					list[index].reminding = true;
				}
				if (action.payload.requestType === "resending") {
					list[index].resending = true;
				}
				if (action.payload.requestType === "withdrawing") {
					list[index].withdrawing = true;
				}
			}
			return Object.assign(
				{},
				{ ...state },
				{ pendingRequestIntegrations: list }
			);
		}
		case ACTION_TYPE.REMIND_INTEGRATION_REQUEST:
		case ACTION_TYPE.RESEND_INTEGRATION_REQUEST:
			var list = [...state.pendingRequestIntegrations];
			var index = list.findIndex(
				(item) =>
					item.id === action.payload.id &&
					item.invite_id === action.payload.inviteID
			);
			if (index > -1) {
				list[index].requestStatus = REQUEST_STATUS.PENDING;
				if (action.payload.requestType === "reminding") {
					list[index].reminding = false;
				}
				if (action.payload.requestType === "resending") {
					list[index].resending = false;
					list[index].expiresOn = 2;
				}
				list[index].lastRequestedOn =
					moment().format("D MMM 'YY, h:mm");
				list[index].updatedAt = Number(new Date());
			}
			return state.integration
				? Object.assign(
						{},
						{ ...state },
						{
							pendingRequestIntegrations: list,
							integration: Object.assign(
								{},
								{ ...state.integration },
								{
									requestDetails:
										moment().format("D MMM 'YY, h:mm"),
								}
							),
						}
				  )
				: Object.assign(
						{},
						{ ...state },
						{ pendingRequestIntegrations: list }
				  );
		case ACTION_TYPE.UPDATE_INTEGRATION_REQUEST:
			if (state.integrations?.length) {
				var list = [...state.integrations];
				var index = list.findIndex(
					(item) => item.id === action.payload.id
				);
				if (index > -1) {
					list[index].requestStatus = REQUEST_STATUS.PENDING;
					list[index].requestOn = moment().format("D MMM 'YY, h:mm");
				}
				return Object.assign({}, { ...state }, { integrations: list });
			} else {
				return state;
			}

		case ACTION_TYPE.WITHDRAW_INTEGRATION_REQUEST:
			var list = [...state.pendingRequestIntegrations];
			var index = list.findIndex(
				(item) =>
					item.id === action.payload.id &&
					item.invite_id === action.payload.inviteID
			);
			if (index > -1) {
				list[index].requestStatus = REQUEST_STATUS.CANCELLED;
				list[index].withdrawing = false;
			}
			return state.integration
				? Object.assign(
						{},
						{ ...state },
						{
							pendingRequestIntegrations: list,
							integration: Object.assign(
								{ ...state.integration },
								{
									requestStatus: null,
								}
							),
						}
				  )
				: Object.assign(
						{},
						{ ...state },
						{ pendingRequestIntegrations: list }
				  );
		case ACTION_TYPE.CATEGORY_BY_STATUS:
			return Object.assign(
				{},
				{ ...state },
				{
					selectedCategory: null,
					showRecommended: false,
					showCategoryByStatus: action.payload,
					showPendingRequest: false,
				}
			);
		case ACTION_TYPE.DISCONNECT_INTEGRATION:
			return Object.assign(
				{},
				{ ...state },
				{
					integrations: null,
					integration: Object.assign({}, state.integration, {
						status: INTEGRATION_STATUS.NOT_CONNECTED,
					}),
				}
			);
		case ACTION_TYPE.INTEGRATION_CONNECTED:
			if (state.integration) {
				return Object.assign(
					{},
					{ ...state },
					{
						integrations: null,
						integration: Object.assign({}, state.integration, {
							status: INTEGRATION_STATUS.CONNECTED,
							requestStatus: REQUEST_STATUS.COMPLETED,
						}),
						pendingRequestIntegrations: [],
						pendingRequestIntegrationsCount: null,
					}
				);
			} else {
				return Object.assign({}, { ...state }, { integrations: null });
			}
		case ACTION_TYPE.FETCH_CATALOG_BANNERS:
			return Object.assign(
				{},
				{ ...state },
				{
					catalogBanners: [...action.payload.images],
				}
			);
		default:
			return state;
	}
}
