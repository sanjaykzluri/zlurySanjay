import React, { useEffect } from "react";
import { LoaderPage } from "./Loader/LoaderPage";
import { useAuth0 } from "@auth0/auth0-react";
import { onLogOut } from "../utils/analytics";
import { clearStorage } from "../utils/localStorage";
import { useDispatch } from "react-redux";
import { SAVE_USER_INFO_OBJECT } from "constants/user";

export function Logout() {
	const { logout, loginWithRedirect } = useAuth0();
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch({
			type: SAVE_USER_INFO_OBJECT,
			payload: {},
		});
		clearStorage();
		onLogOut();
		logout({ returnTo: `${window.location.origin}/login` });
	}, []);

	return <LoaderPage />;
}
