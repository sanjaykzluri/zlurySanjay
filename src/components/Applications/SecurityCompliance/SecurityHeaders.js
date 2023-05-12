import React from "react";
import "./SecurityProbes.css";
import top_right_arrow from "../../../assets/top_right_arrow.svg";
import _ from "underscore";
import Grade from "./Grade";
import ShowMoreText from "react-show-more-text";

function SecurityHeaders(props) {
	const renderSummaryRow = (label, value) => {
		return (
			<div className="d-flex flex-row scan_summary">
				<div className="grey label">{label}</div>
				<div className="font-13 value grey-1">
					{value && Array.isArray(value) ? (
						<ShowMoreText
							lines={1}
							more="View more"
							less="View less"
							expanded={false}
						>
							{value.map((v, index) => (
								<span>
									{index > 0 && ", "}
									{v}
								</span>
							))}
						</ShowMoreText>
					) : _.isBoolean(value) ? (
						<div
							className={`${
								value ? "authorized_green" : "unauthorized_red"
							} text-capitalize`}
						>
							{value.toString()}
						</div>
					) : (
						<div className={`${!value && "o-6"}`}>
							{value || "data unavailable"}
						</div>
					)}
				</div>
			</div>
		);
	};

	const getSummaryDetails = (summaryDetails) => {
		return (
			<>
				{renderSummaryRow(
					"Strict Tansport Security",
					summaryDetails?.strict_transport_security
				)}
				{renderSummaryRow(
					"Content Security Policy",
					summaryDetails?.content_security_policy
				)}
				{renderSummaryRow(
					"X frame options",
					summaryDetails?.x_frame_options
				)}
				{renderSummaryRow(
					"X content type options",
					summaryDetails?.x_content_type_options
				)}
				{renderSummaryRow(
					"Referre Policy",
					summaryDetails?.referrer_policy
				)}
				{renderSummaryRow(
					"Permission policy",
					summaryDetails?.permissions_policy
				)}
				{summaryDetails?.complete_result_link && (
					<div className="d-flex flex-row scan_summary">
						<a
							className="font-14"
							href={summaryDetails?.complete_result_link}
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
				<div className="font-18">Security Headers</div>
				<div className="bg-white security_probes_card d-flex flex-row p-3 mt-2 mr-4">
					<div className="d-flex flex-column ml-2 mr-2 security_probes_card_column">
						<Grade
							className="scan_summary_grade"
							value={
								props.probeDetails?.summary?.overall_rating ||
								""
							}
						/>
					</div>
					<div className="d-flex flex-column ml-2 mr-2 security_probes_card_column w-100 pl-4">
						{getSummaryDetails(props.probeDetails?.summary)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default SecurityHeaders;
