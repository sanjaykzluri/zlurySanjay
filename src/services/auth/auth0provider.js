import React from "react";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { Auth0Provider } from "@auth0/auth0-react";

const Auth0ProviderWithHistory = ({ children }) => {
	const history = useHistory();
	const domain = process.env.REACT_APP_AUTH0_DOMAIN;
	const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
	const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

	const onRedirectCallback = (appState) => {
		history.push(appState ? appState.returnTo : window.location.pathname);
	};

	return (
		<Auth0Provider
			domain={domain}
			clientId={clientId}
			redirectUri={window.location.origin}
			onRedirectCallback={onRedirectCallback}
			audience={audience}
			useRefreshTokens={true}
			cacheLocation="localstorage"
		>
			{children}
		</Auth0Provider>
	);
};

Auth0ProviderWithHistory.propTypes = {
	children: PropTypes.element,
};

export default Auth0ProviderWithHistory;
