import React, { useEffect } from "react";
import { LoaderPage } from "./Loader/LoaderPage";
import { useAuth0 } from "@auth0/auth0-react";

export function Login() {
	const { loginWithRedirect } = useAuth0();

	useEffect(() => {
		loginWithRedirect();
	}, []);

	return <LoaderPage />;
}
