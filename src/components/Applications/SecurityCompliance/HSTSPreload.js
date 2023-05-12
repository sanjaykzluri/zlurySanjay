import React from "react";
import top_right_arrow from "../../../assets/top_right_arrow.svg";
import Grade from "./Grade";

function HSTSPreload(props) {
	return (
		<div className="d-flex flex-column m-4">
			<div className="mb-4">
				<div className="font-18">Scan Result for HSTSPreload</div>
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
						<div className="d-flex flex-row scan_summary">
							<div className="grey label">Preload</div>
							<div className="font-13 value grey-1 w-100">
								{Boolean(
									props.probeDetails?.summary?.preloaded
								) ? (
									(props.probeDetails?.summary?.preloaded).toString()
								) : (
									<div
										className={
											!props.probeDetails?.summary
												?.preloaded
												? "o-6"
												: "text-capitalize"
										}
									>
										{props.probeDetails?.summary
											?.preloaded || "data unavailable"}
									</div>
								)}
							</div>
						</div>
						<div className="d-flex flex-row scan_summary">
							<div className="grey label">Notes</div>
							<div
								className={`font-13 value grey-1 w-100 ${
									!props.probeDetails?.summary?.notes && "o-6"
								}`}
							>
								{props.probeDetails?.summary?.notes ||
									"data unavailable"}
							</div>
						</div>
						{props.probeDetails?.summary?.complete_result_link && (
							<div className="d-flex flex-row scan_summary">
								<a
									className="font-14"
									href={
										props.probeDetails?.summary
											?.complete_result_link
									}
									target="_blank"
									rel="noreferrer"
									style={{ color: "#5ABAFF" }}
								>
									Certificate Explainer
									<img
										src={top_right_arrow}
										className="ml-1"
									/>
								</a>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default HSTSPreload;
