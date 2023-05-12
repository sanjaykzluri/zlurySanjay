import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { LoaderPage } from "../common/Loader/LoaderPage";
import { useAuth0 } from "@auth0/auth0-react";
import { client } from "../utils/client";
import { Redirect, useHistory } from "react-router-dom";
import { identifyAndGroup } from "../../src/utils/analytics";
import { TriggerIssue } from "../utils/sentry";
import { SAVE_USER_INFO_OBJECT } from "../constants/user";
import { saveUserDetails } from "../actions/ui-action";
import { USER_ONBOARDING_VIEW_STATUS } from "constants/users";
import { ignoreURL } from "modules/shared/utils/setRedirectURL";
import {
	getValueFromLocalStorage,
	removeFromLocalStorage,
	setValueToLocalStorage,
} from "utils/localStorage";
import { PARTNER } from "modules/shared/constants/app.constants";

export function CheckAuth(props) {
	const {
		isLoading,
		getAccessTokenSilently,
		user,
		loginWithRedirect,
		isAuthenticated,
	} = useAuth0();
	const history = useHistory();
	const dispatch = useDispatch();
	const [displayPage, setDisplayPage] = useState(
		USER_ONBOARDING_VIEW_STATUS.LOADING
	);
	const [errorMessage, setErrorMessage] = useState();
	const [token, setToken] = useState(null);

	const checkForRedirectURL = () => {
		const redirectURL = getValueFromLocalStorage("redirectURL");
		if (redirectURL && !ignoreURL.includes(redirectURL)) {
			removeFromLocalStorage("redirectURL");
			history.push(redirectURL);
			return;
		} else {
			removeFromLocalStorage("redirectURL");
			setDisplayPage(USER_ONBOARDING_VIEW_STATUS.ACTIVE);
		}
	};

	const handleAuthorize = () => {
		client
			.post("/auth/authorize2", {
				email: user.email,
				name: user.name,
				partner: props.partner?.name?.toLowerCase(),
				connection: props.connectionName,
			})
			.then((res) => {
				if (res.data && res.data.success) {
					const { userInfo } = res.data;
					identifyAndGroup(
						user,
						userInfo,
						props.partner?.name === PARTNER.ZLURI.name
					);
					setValueToLocalStorage(
						"userInfo",
						JSON.stringify(userInfo)
					);

					const org_status = userInfo.org_status;
					const user_status = userInfo.user_status;
					setValueToLocalStorage("orgId", userInfo?.org_id);
					setValueToLocalStorage(
						"startMonth",
						userInfo?.org_fy_start_month || 1
					);

					props.setUserRole(userInfo.user_role);
					if (userInfo.user_role === "viewer") {
						props.setIsViewer(true);
					}

					dispatch({
						type: SAVE_USER_INFO_OBJECT,
						payload: {
							...userInfo,
							isViewer: userInfo?.user_role === "viewer",
						},
					});

					if (
						!userInfo.org_fy_start_month &&
						userInfo?.org_onboarding_status !== "step1"
					) {
						TriggerIssue(
							`org_fy_start_month seems to be empty, when made request to /auth/authorize2 for user's info`,
							res
						);
						setErrorMessage(
							"Oraganisation start month seems to be empty"
						);
						setDisplayPage(
							USER_ONBOARDING_VIEW_STATUS.LOGIN_FAILED
						);
						return;
					}

					if (
						user_status === USER_ONBOARDING_VIEW_STATUS.BLOCKED ||
						user_status === USER_ONBOARDING_VIEW_STATUS.INACTIVE
					) {
						setDisplayPage(USER_ONBOARDING_VIEW_STATUS.BLOCKED);
						setValueToLocalStorage("isUserBlocked", true);
						props.setUserBlocked(true);
						return;
					} else {
						props.setUserBlocked(false);
						setValueToLocalStorage("isUserBlocked", false);
					}

					if (userInfo?.user_role === "employee") {
						if (!userInfo.employee_dashboard_enabled) {
							TriggerIssue(
								`user role is employee and employee dashboard is not enabled`,
								res
							);
							setErrorMessage(
								"User role is employee and employee dashboard is not enabled"
							);
							setDisplayPage(
								USER_ONBOARDING_VIEW_STATUS.LOGIN_FAILED
							);
							return;
						}
						setDisplayPage(
							USER_ONBOARDING_VIEW_STATUS.SWITCH_TO_EMPLOYEE_VIEW
						);
						return;
					}

					switch (org_status) {
						case USER_ONBOARDING_VIEW_STATUS.ONBOARDING:
							setDisplayPage(USER_ONBOARDING_VIEW_STATUS.STEPS);
							return;
						case USER_ONBOARDING_VIEW_STATUS.INACTIVE:
							setDisplayPage(
								USER_ONBOARDING_VIEW_STATUS.INACTIVE
							);
							return;
						case USER_ONBOARDING_VIEW_STATUS.COMPLETED:
						case USER_ONBOARDING_VIEW_STATUS.ACTIVE:
						case USER_ONBOARDING_VIEW_STATUS.PROCESSING:
						default:
							checkForRedirectURL();
							return;
					}
				} else {
					TriggerIssue(
						"No success response from authorize2 API",
						res.data
					);
					try {
						const obj = res?.data ? res.data : res;
						setErrorMessage(
							"Authorization failed - " + JSON.stringify(obj)
						);
					} catch (err) {
						TriggerIssue(
							"Error on setting error msg to show on login failed screen - checkauth.js",
							res.data
						);
					}

					setDisplayPage(USER_ONBOARDING_VIEW_STATUS.LOGIN_FAILED);
				}
			})
			.catch((error) => {
				TriggerIssue("Error response from authorize2 API", error);
				try {
					const obj = error?.response
						? error.response.data
						: error?.config
						? error.hasOwnProperty("toJSON")
							? error.toJSON().message
							: error
						: error;
					setErrorMessage(
						"Authorization failed - " + JSON.stringify(obj)
					);
				} catch (err) {
					TriggerIssue(
						"Error on setting error msg to show on login failed screen - checkauth.js",
						error
					);
				}
				setDisplayPage(USER_ONBOARDING_VIEW_STATUS.LOGIN_FAILED);
			});
	};

	useEffect(() => {
		if (token) {
			setValueToLocalStorage("token", token);
		} else {
			getToken();
		}
		if (isAuthenticated && user && token) {
			if (user?.email_verified) {
				setValueToLocalStorage("user", JSON.stringify(user));
				dispatch(saveUserDetails(user));
				handleAuthorize();
			} else {
				setDisplayPage(USER_ONBOARDING_VIEW_STATUS.EMAIL_VERIFICATION);
			}
		}
	}, [token]);

	const getToken = () => {
		let options = { ignoreCache: true };
		if (props.partner?.name !== PARTNER.ZLURI.name) {
			Object.assign(options, {
				appState: {
					returnTo: `/?partner=${props.partner?.name?.toLowerCase()}&iframe=true&connection=${
						props.connectionName
					}`,
				},
				connection: props.connectionName,
			});
		}

		getAccessTokenSilently(options)
			.then((token) => {
				setToken(token);
			})
			.catch((err) => {
				if (props.partner?.name !== PARTNER.ZLURI.name) {
					loginWithRedirect(options);
				} else {
					setDisplayPage(USER_ONBOARDING_VIEW_STATUS.REQUIRED);
					console.error(
						"catch on get token silently, redirecting user to login page - checkauth.js",
						err
					);
				}
			});
	};

	switch (displayPage) {
		case USER_ONBOARDING_VIEW_STATUS.LOADING:
			return <LoaderPage />;
		case USER_ONBOARDING_VIEW_STATUS.STEPS:
		case USER_ONBOARDING_VIEW_STATUS.ONBOARDING:
			return <Redirect to="/steps" />;
		case USER_ONBOARDING_VIEW_STATUS.BLOCKED:
			return <Redirect to="/deactivated" />;
		case USER_ONBOARDING_VIEW_STATUS.SWITCH_TO_EMPLOYEE_VIEW:
			return <Redirect to="/user/overview" />;
		case USER_ONBOARDING_VIEW_STATUS.COMPLETED:
		case USER_ONBOARDING_VIEW_STATUS.ACTIVE:
		case USER_ONBOARDING_VIEW_STATUS.PROCESSING:
			return <Redirect to="/overview" />;
		case USER_ONBOARDING_VIEW_STATUS.INACTIVE:
			return <Redirect to="/orgblocked" />;
		case USER_ONBOARDING_VIEW_STATUS.EMAIL_VERIFICATION:
			return (
				<Redirect
					to={{
						pathname: "/verify",
						state: { user: user },
					}}
				/>
			);
		case USER_ONBOARDING_VIEW_STATUS.LOGIN_FAILED:
			return (
				<Redirect
					to={{
						pathname: "/loginFailed",
						state: { error: errorMessage },
					}}
				/>
			);
		case USER_ONBOARDING_VIEW_STATUS.REQUIRED:
		default:
			return <Redirect to="/login" />;
	}
}
