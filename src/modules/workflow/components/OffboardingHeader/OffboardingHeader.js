import React from "react";
import logo from "../../../../assets/logo.svg";

const OffboardingHeader = () => {
	return (
		<>
			<div
				style={{ paddingTop: "20px", paddingBottom: "20px" }}
				className="d-flex flex-1 flex-row justify-content-between align-items-center"
			>
				<img src={logo} height={"auto"} width={"auto"} />
				<div className="d-flex align-items-center justify-content-end">
					<a
						style={{ color: "rgba(113, 113, 113, .6)" }}
						className="font-12"
						target="_blank"
						rel="noreferrer"
						href="https://www.zluri.com/zluri-app-terms-of-service"
					>
						Terms and Conditions
					</a>
					<p
						style={{ color: "rgba(113, 113, 113, .6)" }}
						className="font-22 m-2 mb-3"
					>
						.
					</p>
					<a
						style={{ color: "rgba(113, 113, 113, .6)" }}
						className="font-12"
						target="_blank"
						rel="noreferrer"
						href="https://www.zluri.com/privacy-policy/"
					>
						Privacy Policy
					</a>
				</div>
			</div>
			<div style={{ borderTop: "1px solid #EBEBEB" }} />
		</>
	);
};

export default OffboardingHeader;
