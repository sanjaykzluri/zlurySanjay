import React, { useEffect, useState } from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { LoaderPage } from "./Loader/LoaderPage";
import { setUserOnSentry, TriggerIssue } from "../utils/sentry";
import { clearStorage, getValueFromLocalStorage } from "../utils/localStorage";
import { setRedirectURL } from "../modules/shared/utils/setRedirectURL";
import * as Sentry from "@sentry/react";
import { GlobalError } from "./GlobalError";
import { useAuth0 } from "@auth0/auth0-react";

const ProtectedRoute = ({ children, ...args }) => {
	const { isAuthenticated } = useAuth0();
	const location = useLocation();
	const [loading, setLoading] = useState(true);

	const [isUserInfoAvailable, setIsUserInfoAvailable] = useState(false);
	const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

	useEffect(() => {
		try {
			if (!isAuthenticated) {
				setRedirectURL(
					window.location.href.replace(window.location.origin, "")
				);
				clearStorage();
				setIsUserInfoAvailable(false);
			} else {
				const userInfo = getValueFromLocalStorage("userInfo");
				if (!userInfo || Object.keys(userInfo).length === 0) {
					setIsUserInfoAvailable(false);
					TriggerIssue(
						"UserInfo is not available - protected route",
						userInfo
					);
				} else {
					setIsUserInfoAvailable(true);
					setUserOnSentry(userInfo);
					if (
						userInfo?.org_onboarding_status &&
						userInfo?.org_onboarding_status !== "completed"
					) {
						setIsOnboardingCompleted(false);
					} else {
						setIsOnboardingCompleted(true);
					}
				}
			}
		} catch (error) {
			console.error("Error fetching user info", error);
			TriggerIssue("Error fetching user info", error);
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated]);

	if (loading) {
		return <LoaderPage />;
	}

	if (!isUserInfoAvailable || !isAuthenticated) {
		return <Redirect to="/checkauth" />;
	}

	if (isOnboardingCompleted || args.path === "/steps") {
		return (
			<Route {...args}>
				<Sentry.ErrorBoundary
					fallback={GlobalError}
					key={location.pathname}
				>
					{children}
				</Sentry.ErrorBoundary>
			</Route>
		);
	}

	return <Redirect to="/steps" />;
};

ProtectedRoute.propTypes = {
	children: PropTypes.element,
};

export default ProtectedRoute;
