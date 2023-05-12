import React from "react";
import { Table } from "../../../common";
import ScanResultTemplate from "./ScanResultTemplate";
import check from "../../../assets/icons/green-check.svg";
import failed from "../../../assets/cross-solid.svg";
import Grade from "./Grade";
import common_empty from "../../../assets/common/common_empty.png";
import _ from "underscore";

function HttpObservatory(props) {
	const getSummaryDetails = (summaryDetails) => {
		return (
			<>
				<div className="d-flex flex-row scan_summary">
					<div className="grey label">Scan ID</div>
					<div
						className={`grey-1 font-13 value ${
							!summaryDetails?.scan_id && "o-6"
						}`}
					>
						{summaryDetails?.scan_id || "data unavailable"}
					</div>
				</div>
				<div className="d-flex flex-row scan_summary">
					<div className="grey label">Start time</div>
					<div
						className={`grey-1 font-13 value ${
							!summaryDetails?.start_time && "o-6"
						}`}
					>
						{summaryDetails?.start_time || "data unavailable"}
					</div>
				</div>
				{/* <div className="d-flex flex-row scan_summary">
                    <div className="grey label">Duration</div>
                    <div className="grey-1 font-13 value">{securityProbes?.data?.duration} Seconds</div>
                </div> */}
				<div className="d-flex flex-row scan_summary">
					<div className="grey label">Score</div>
					<div
						className={`grey-1 font-13 value ${
							!(
								summaryDetails?.score ||
								summaryDetails?.score_total
							) && "o-6"
						}`}
					>
						{!_.isEmpty(
							summaryDetails?.score || summaryDetails?.score_total
						) ? (
							<>
								{summaryDetails?.score}/
								{summaryDetails?.score_total}
							</>
						) : (
							"data unavailable"
						)}
					</div>
				</div>
				<div className="d-flex flex-row scan_summary">
					<div className="grey label">Tests Passed</div>
					<div
						className={`grey-1 font-13 value ${
							!(
								summaryDetails?.tests_passed ||
								summaryDetails?.test_total
							) && "o-6"
						}`}
					>
						{!_.isEmpty(
							summaryDetails?.tests_passed ||
								summaryDetails?.test_total
						) ? (
							<>
								{summaryDetails?.tests_passed}/
								{summaryDetails?.test_total}
							</>
						) : (
							"data unavailable"
						)}
					</div>
				</div>
			</>
		);
	};

	const grade_columns = [
		{
			dataField: "grade_history_date",
			text: "Grade History Date",
			formatter: (dataField) => (
				<div className={`font-14 grey ${!dataField && "o-6"}`}>
					{dataField || "data unavailable"}
				</div>
			),
		},
		{
			dataField: "grade_history_score",
			text: "Score",
			formatter: (dataField) => (
				<div className={`font-14 grey bold-600 ${!dataField && "o-6"}`}>
					{dataField || "data unavailable"}
				</div>
			),
		},
		{
			dataField: "grade",
			text: "Grade",
			formatter: (dataField) => (
				<>
					{dataField ? (
						<Grade
							className={"mt-auto mb-auto grade_sm"}
							value={dataField}
							style={{ width: "21px", height: "21px" }}
						/>
					) : (
						<div
							className={`font-14 grey bold-600 ${
								!dataField && "o-6"
							}`}
						>
							data unavailable
						</div>
					)}
				</>
			),
		},
	];

	const test_score_columns = [
		{
			dataField: "test",
			text: "Test",
			formatter: (dataField, row) => (
				<>
					{dataField ? (
						<div className="d-flex flex-row">
							<img
								src={row.pass ? check : failed}
								className="mr-2 mb-auto mt-2"
							/>
							<div
								className="font-14 grey bold-600 p-1"
								style={{ borderBottom: "1px dashed #DDDDDD" }}
							>
								{dataField}
							</div>
						</div>
					) : (
						<div
							className={`font-14 grey bold-600 ${
								!dataField && "o-6"
							}`}
						>
							data unavailable
						</div>
					)}
				</>
			),
		},
		{
			dataField: "score",
			text: "Score",
			formatter: (dataField) => (
				<div className={`font-14 grey ${!dataField && "o-6"}`}>
					{dataField || "data unavailable"}
				</div>
			),
		},
		{
			dataField: "reason",
			text: "Reason",
			formatter: (dataField) => (
				<div className={`font-13 grey ${!dataField && "o-6"}`}>
					{dataField || "data unavailable"}
				</div>
			),
		},
	];

	const raw_server_columns = [
		{
			dataField: "header",
			text: "Header",
			formatter: (dataField) => (
				<div className={`font-14 grey bold-600 ${!dataField && "o-6"}`}>
					{dataField || "data unavailable"}
				</div>
			),
		},
		{
			dataField: "value",
			text: "Value",
			formatter: (dataField) => (
				<div
					className={`font-13 grey ${!dataField && "o-6"}`}
					style={{ overflowWrap: "anywhere" }}
				>
					{dataField || "data unavailable"}
				</div>
			),
		},
	];

	return (
		<div className="d-flex flex-column m-4">
			<div className="mb-4">
				<ScanResultTemplate
					probeName={props.probeDetails?.name}
					leftSideElements={
						<>
							<Grade
								className="scan_summary_grade"
								value={
									props.probeDetails?.summary
										?.overall_rating || ""
								}
							/>
						</>
					}
					rightSideElements={getSummaryDetails(
						props.probeDetails?.summary
					)}
				/>
			</div>
			{props.probeDetails?.grade_history &&
			Array.isArray(props.probeDetails?.grade_history) &&
			props.probeDetails?.grade_history.length > 0 ? (
				<div className="mb-4">
					<div className="font-18">Grade History</div>
					<div
						className="bg-white p-2 mr-4 mt-2"
						style={{ borderRadius: "6px" }}
					>
						<Table
							headerCSSClasses="table_headers grey-1 o-7 font-11"
							data={props.probeDetails?.grade_history}
							columns={grade_columns}
							remote={false}
						/>
					</div>
				</div>
			) : (
				<div
					className="d-flex flex-column p-3 bg-white mb-3"
					style={{ height: "30vh", borderRadius: "6px" }}
				>
					<img
						src={common_empty}
						className="mt-auto ml-auto mr-auto"
					/>
					<div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
						No Grade History :)
					</div>
				</div>
			)}
			{props.probeDetails?.test_score &&
			Array.isArray(props.probeDetails?.test_score) &&
			props.probeDetails?.test_score.length > 0 ? (
				<div className="mb-4">
					<div className="font-18">Test Scores</div>
					<div
						className="bg-white p-2 mr-4 mt-2"
						style={{ borderRadius: "6px" }}
					>
						<Table
							headerCSSClasses="table_headers grey-1 o-7 font-11"
							data={props.probeDetails?.test_score}
							columns={test_score_columns}
							remote={false}
						/>
					</div>
				</div>
			) : (
				<div
					className="d-flex flex-column p-3 bg-white mb-3"
					style={{ height: "30vh", borderRadius: "6px" }}
				>
					<img
						src={common_empty}
						className="mt-auto ml-auto mr-auto"
					/>
					<div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
						No Test Scores :)
					</div>
				</div>
			)}
			{props.probeDetails?.raw_server_headers &&
			Array.isArray(props.probeDetails?.raw_server_headers) &&
			props.probeDetails?.raw_server_headers.length > 0 ? (
				<div className="mb-4">
					<div className="font-18">Raw Server Headers</div>
					<div
						className="bg-white p-2 mr-4 mt-2"
						style={{ borderRadius: "6px" }}
					>
						<Table
							headerCSSClasses="table_headers grey-1 o-7 font-11"
							data={props.probeDetails?.raw_server_headers}
							columns={raw_server_columns}
							remote={false}
						/>
					</div>
				</div>
			) : (
				<div
					className="d-flex flex-column p-3 bg-white mb-3"
					style={{ height: "30vh", borderRadius: "6px" }}
				>
					<img
						src={common_empty}
						className="mt-auto ml-auto mr-auto"
					/>
					<div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
						No Raw Server Headers :)
					</div>
				</div>
			)}
		</div>
	);
}

export default HttpObservatory;
