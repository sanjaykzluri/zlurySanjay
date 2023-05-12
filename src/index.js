import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import { store } from "./utils/store";
import Auth0ProviderWithHistory from "./services/auth/auth0provider";
import { Router } from "react-router-dom";
import "./theme.scss";
import "./index.css";
import { InitializeSentry } from "./utils/sentry";
import { segmentAnalytics } from "./utils/analytics";
import { ConnectedRouter } from "connected-react-router/immutable";
import history from "./utils/history";
import ViewSelector from "modules/shared/containers/ViewSelector/ViewSelector";

InitializeSentry();
segmentAnalytics();

ReactDOM.render(
	<Provider store={store}>
		<ConnectedRouter history={history}>
			<Router history={history}>
				<Auth0ProviderWithHistory>
					<ViewSelector />
				</Auth0ProviderWithHistory>
			</Router>
		</ConnectedRouter>
	</Provider>,
	document.getElementById("root")
);

serviceWorker.unregister();
