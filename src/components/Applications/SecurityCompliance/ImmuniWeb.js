import React from "react";
import ScanResultTemplate from "./ScanResultTemplate";
import top_right_arrow from "../../../assets/top_right_arrow.svg";
import Grade from "./Grade";

function ImmuniWeb(props) {
	const isNotCompliant = (value) => {
		return value === "Non-compliant";
	};

	const isNotVulnerable = (value) => {
		return value === "Not vulnerable";
	};

	const renderSummaryRow = (label, value, className) => {
		return (
			<div className="d-flex flex-row scan_summary">
				<div className="grey label">{label}</div>
				<div className={`font-13 value ${value ? className : "o-6"}`}>
					{value
						? value?.toString()?.split(/[-_]/).join(" ")
						: "data  unavailable"}
				</div>
			</div>
		);
	};

	const getSummaryDetails = (summaryDetails) => {
		return (
			<>
				{renderSummaryRow("Score", summaryDetails?.score, "grey-1")}
				{renderSummaryRow(
					"Protocol score",
					summaryDetails?.score,
					"grey-1"
				)}
				{renderSummaryRow(
					"PCI DSS",
					summaryDetails?.["pci-dss"],
					isNotCompliant(summaryDetails?.["pci-dss"])
						? "unauthorized_red"
						: "authorized_green"
				)}
				{renderSummaryRow(
					"HIPAA",
					summaryDetails?.hipaa,
					isNotCompliant(summaryDetails?.hipaa)
						? "unauthorized_red"
						: "authorized_green"
				)}
				{renderSummaryRow(
					"Nist",
					summaryDetails?.nist,
					isNotCompliant(summaryDetails?.nist)
						? "unauthorized_red"
						: "authorized_green"
				)}
				{renderSummaryRow(
					"Drown",
					summaryDetails?.drown,
					isNotVulnerable(summaryDetails?.drown)
						? "authorized_green"
						: "unauthorized_red"
				)}
				{renderSummaryRow(
					"Heartbleed",
					summaryDetails?.heartbleed,
					isNotVulnerable(summaryDetails?.heartbleed)
						? "authorized_green"
						: "unauthorized_red"
				)}
				{renderSummaryRow(
					"Insecure Renegotiation",
					summaryDetails?.insecure_renegotiation,
					isNotVulnerable(summaryDetails?.insecure_renegotiation)
						? "authorized_green"
						: "unauthorized_red"
				)}
				{renderSummaryRow(
					"Openssl Padding Circle",
					summaryDetails?.openssl_padding_oracle,
					isNotVulnerable(summaryDetails?.openssl_padding_oracle)
						? "authorized_green"
						: "unauthorized_red"
				)}
				{renderSummaryRow(
					"Poodle ssl v3",
					summaryDetails?.Poodle_sslv3,
					isNotVulnerable(summaryDetails?.Poodle_sslv3)
						? "authorized_green"
						: "unauthorized_red"
				)}
				{renderSummaryRow(
					"Poodle TLS",
					summaryDetails?.poodle_tls,
					isNotVulnerable(summaryDetails?.poodle_tls)
						? "authorized_green"
						: "unauthorized_red"
				)}
				{renderSummaryRow("Host", summaryDetails?.host, "grey-1")}
				{summaryDetails?.complete_results_link && (
					<div className="d-flex flex-row scan_summary">
						<a
							className="font-14"
							href={summaryDetails?.complete_results_link}
							target="_blank"
							rel="noreferrer"
							style={{ color: "#5ABAFF" }}
						>
							Certificate Explainer
							<img src={top_right_arrow} className="ml-1" />
						</a>
					</div>
				)}
			</>
		);
	};

	return (
		<div className="d-flex flex-column m-4">
			<div className="mb-4">
				<ScanResultTemplate
					probeName={props.probeDetails?.name}
					leftSideElements={
						<Grade
							className="scan_summary_grade"
							value={
								props.probeDetails?.summary?.overall_rating ||
								""
							}
						/>
					}
					rightSideElements={getSummaryDetails(
						props.probeDetails?.summary
					)}
				/>
			</div>
		</div>
	);
}

export default ImmuniWeb;
