import React, { useState } from "react";
import licenseOptimization from "assets/applications/license_optimization.svg";
import { LicenseApproveorReject } from "./LicenseAcceptorRejectModal";
export function LicenseReview({ app }) {
	const [showModal, setShowModal] = useState(false);
	return (
		<div
			style={{
				background: "rgba(95, 207, 100, 0.15)",
				height: "74px",
				borderRadius: "4px",
				padding: "15px",
			}}
			className="d-flex justify-content-between"
		>
			<div className="d-flex align-items-center">
				<img src={licenseOptimization} />
				<div
					style={{
						marginLeft: "10px",
						marginTop: "10px",
					}}
				>
					<div
						style={{
							color: "#717171",
							fontFamily: "Sora",
							fontSize: "10px",
							lineHeight: "18px",
						}}
					>
						LICENSE OPTIMIZATIOIN
					</div>
					<p
						style={{
							fontFamily: "Sora",
							fontSize: "16px",
							lineHeight: "18px",
							fontWeight: "600",
							color: "#484848",
						}}
					>
						6 pending requests to keep License
					</p>
				</div>
			</div>
			<button
				type="button"
				className="btn"
				style={{
					width: "max-content",
					marginTop: "5px",
					background: "#FFFFFF",
					color: "#484848",
					border: "1px solid #DDDDDD",
					fontWeight: "700",
				}}
				onClick={() => setShowModal(true)}
			>
				Review Now
			</button>
			{showModal && (
				<LicenseApproveorReject
					app={app}
					closeModal={() => setShowModal(false)}
				/>
			)}
		</div>
	);
}
