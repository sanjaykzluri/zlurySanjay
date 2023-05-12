import React from "react";
import { Loader } from "./Loader";

export function LoaderPage() {
	return (
		<div
			className="d-flex justify-content-center align-items-center"
			style={{ height: "100vh" }}
		>
			<Loader height={100} width={100} />
		</div>
	);
}
