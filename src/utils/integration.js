import axios from "axios";
import { getValueFromLocalStorage } from "./localStorage";

const integration = axios.create({
	baseURL: process.env.REACT_APP_INTEGRATION_URL,
});

integration.interceptors.request.use((request) => {
	const token = getValueFromLocalStorage("token");
	request.headers.common["Authorization"] = `Bearer ${token}`;
	return request;
});

integration.interceptors.response.use(
	function (response) {
		return response;
	},
	function (error) {
		if (error && error.response && error.response.status === 401) {
			window.location.replace("/logout");
		}
		return Promise.reject(error);
	}
);

integration.CancelToken = axios.CancelToken;
integration.isCancel = axios.isCancel;

export { integration };
