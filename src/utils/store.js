import { createStore, applyMiddleware, compose } from "redux";
import thunkMiddleware from "redux-thunk";
import { routerMiddleware } from "connected-react-router/immutable";
import history from "./history";
import { createRootReducer } from "../reducers";
import { loadState, updateLocalStorage } from "./localStorage";
const traceEnabledEnvironment = ["localhost"];
const trace = !!traceEnabledEnvironment.includes(process.env.REACT_APP_ENV);
const componseEnhance =
	window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?.({ trace }) || compose;
const persistedState = loadState();
export const store = createStore(
	createRootReducer(history),
	persistedState,
	componseEnhance(applyMiddleware(routerMiddleware(history), thunkMiddleware))
);
store.subscribe(updateLocalStorage);
