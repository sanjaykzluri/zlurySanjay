import React, { useEffect, useState } from "react";
import "./ReportCard.css";

import download from "../../../../assets/reports/download.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { GenerateReportModal } from "../Modals/GenerateReportModal";
export function ReportCard(props) {
	const [hoveredDivId, setHoveredDivId] = useState(null);
	const [showAllText, setShowAllText] = useState(false);
	const [showGenerateModal, setShowGenerateModal] = useState(false);

	const AllText = ({ content, limit }) => {
		if (content.length <= limit) {
			return <div>{content}</div>;
		}
		const toShow = content.substring(0, limit) + "...";
		return <div>{toShow}</div>;
	};

	const handleOnMouseOver = () => {
		if (props.report.description.length > 240) {
			setHoveredDivId(props.report.id);
			setShowAllText(true);
		}
	};
	const handleOnMouseOut = () => {
		setHoveredDivId(null);
		setShowAllText(false);
	};
	return (
		<>
			<div
				className={`reportcard__cont mr-3 mb-3 ${
					props.report.isBlocked ? "o-6 pointer-events-none" : ""
				}`}
				onMouseEnter={handleOnMouseOver}
				onMouseLeave={handleOnMouseOut}
			>
				{!hoveredDivId ? (
					<>
						<img
							src={props.report.url}
							height={81}
							width={81}
						></img>
						<div className="reportcard__cont__d2">
							{props.report.name}
						</div>
						<div className="reportcard__cont__d3">
							<AllText
								content={props.report.description}
								limit={240}
							></AllText>
						</div>
						{props.report.isBlocked ? (
							<div className="warningMessage text-align-center mt-1 font-11 w-100">
								This report is unavailable at the moment due to
								maintenance activities.
							</div>
						) : (
							<Button
								className="z__button link mt-2 d-flex align-items-center w-auto"
								onClick={() => setShowGenerateModal(true)}
							>
								<img
									src={download}
									style={{ paddingBottom: "2px" }}
									height={20}
									width={20}
								></img>
								Generate Report
							</Button>
						)}
					</>
				) : (
					<>
						<div className="reportcard__cont__hd2">
							<img
								src={props.report.url}
								height={32}
								width={32}
							></img>
							<div className="reportcard__cont__hd2__d2">
								{props.report.name}
							</div>
						</div>
						<div className="reportcard__cont__hd3">
							{props.report.description}
						</div>
						{props.report.isBlocked ? (
							<div className="warningMessage text-align-center mt-1 font-11 w-100">
								This report is unavailable at the moment due to
								maintenance activities.
							</div>
						) : (
							<Button
								className="z__button link mt-2 d-flex align-items-center w-auto"
								onClick={() => setShowGenerateModal(true)}
							>
								<img
									src={download}
									style={{ paddingBottom: "2px" }}
									height={20}
									width={20}
								></img>
								Generate Report
							</Button>
						)}
					</>
				)}
			</div>
			{showGenerateModal && (
				<GenerateReportModal
					appData={props.appData}
					deptData={props.deptData}
					payData={props.payData}
					isOpen={showGenerateModal}
					handleClose={() => setShowGenerateModal(false)}
					report={props.report}
				></GenerateReportModal>
			)}
		</>
	);
}
