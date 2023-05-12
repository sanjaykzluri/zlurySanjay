import React from "react";
import PropTypes from "prop-types";
import globalError from "../assets/502.svg";

export function GlobalError() {
	return (
		<div className="d-flex justify-content-center align-items-center flex-column mb-4">
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
				Something went wrong
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
			<button onClick={() => {window.location.reload()}} className="ov__button2" style={{ width: 230 }}>
				Try again
			</button>
		</div>
	);
}

GlobalError.propTypes = {
	error: PropTypes.object,
	resetErrorBoundary: PropTypes.func,
};
