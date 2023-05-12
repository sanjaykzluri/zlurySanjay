import React from "react";
import PropTypes from "prop-types";
import globalError from "../assets/502.svg";
import { Link } from "react-router-dom";

export function PageNotFound() {
	return (
		<div className="d-flex justify-content-center align-items-center flex-column mb-4 vh-100">
			<img
				alt="Error"
				src={globalError}
				width={264}
				style={{ marginBottom: 14 }}
			/>
			<div
				style={{
					fontSize: 26,
					fontWeight: 700,
					lineHeight: "32.76px",
					marginBottom: 23,
				}}
			>
				Oops
			</div>
			<div
				style={{
					fontSize: 18,
					fontWeight: 400,
					lineHeight: "21px",
					marginBottom: 34,
				}}
			>
				We couldn&apos;t find the page you're looking for
			</div>
			<div className="text-center">
				<Link to={"/"}>Go Home</Link>
			</div>
		</div>
	);
}
