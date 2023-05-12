import React from "react";
import ScanResultTemplate from "./ScanResultTemplate";
import top_right_arrow from "../../../assets/top_right_arrow.svg";
import { Table } from "../../../common";
import _ from "underscore";
import Grade from "./Grade";
import common_empty from "../../../assets/common/common_empty.png";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function Immirhil(props) {
	const renderSummaryRow = (label, value) => {
		return (
			<div className="d-flex flex-row scan_summary">
				<div className="grey label">{label}</div>
				<div className={`font-13 grey-1 value ${!value && "o-6"}`}>
					{value && Array.isArray(value)
						? value.map((v, index) => (
								<span>
									{index > 0 && ", "}
									{v}
								</span>
						  ))
						: value || "data unavailable"}
				</div>
			</div>
		);
	};

	const defaultColumn = (value) => {
		return (
			<div className={`font-13 grey-1 ${!value && "o-6"}`}>
				{value || "NA"}
			</div>
		);
	};

	const cipher_suites_columns = [
		{
			dataField: "cipher_suite",
			text: "Cipher suites",
			formatter: (dataField) => (
				<div
					className="font-14 grey"
					style={{ overflow: "hidden", width: "50px" }}
				>
					{dataField ? (
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{dataField}</Tooltip>}
						>
							<div className="text-truncate">{dataField}</div>
						</OverlayTrigger>
					) : (
						"data unavailable"
					)}
				</div>
			),
		},
		{
			dataField: "key_exchange_type",
			text: "Key Type",
			formatter: (dataField) => defaultColumn(dataField),
		},
		{
			dataField: "key_exchange_size",
			text: "Key Size",
			formatter: (dataField) => defaultColumn(dataField),
		},
		{
			dataField: "authentication_type",
			text: "Authentication Type",
			formatter: (dataField) => defaultColumn(dataField),
		},
		{
			dataField: "authentication_key_size",
			text: "Authentication Size",
			formatter: (dataField) => defaultColumn(dataField),
		},
		{
			dataField: "encryption_type",
			text: "Encryption Type",
			formatter: (dataField) => defaultColumn(dataField),
		},
		{
			dataField: "encryption_key_size",
			text: "Encryption Size",
			formatter: (dataField) => defaultColumn(dataField),
		},
		{
			dataField: "encryption_block_size",
			text: "Encryption Block Size",
			formatter: (dataField) => defaultColumn(dataField),
		},
		{
			dataField: "encryption_mode",
			text: "Encryption Mode",
			formatter: (dataField) => defaultColumn(dataField),
		},
		{
			dataField: "mac_type",
			text: "Mac Type",
			formatter: (dataField) => defaultColumn(dataField),
		},
		{
			dataField: "mac_size",
			text: "Mac Size",
			formatter: (dataField) => defaultColumn(dataField),
		},
		{
			dataField: "pfs",
			text: "pfs",
			formatter: (dataField) => defaultColumn(dataField),
		},
	];

	const getSummaryDetails = (summaryDetails) => {
		return (
			<>
				{renderSummaryRow(
					"Host",
					_.first(summaryDetails?.host?.split(" "))
				)}
				{renderSummaryRow(
					"IP address",
					_.first(summaryDetails?.ip_address?.split(" "))
				)}
				{renderSummaryRow(
					"Score",
					`${
						_.isEmpty(
							summaryDetails?.overall_score ||
								summaryDetails?.overcall_score_outof
						)
							? ""
							: `${_.first(
									summaryDetails?.overall_score?.split(" ")
							  )}/${_.first(
									summaryDetails?.overcall_score_outof?.split(
										" "
									)
							  )}`
					}`
				)}
				{renderSummaryRow(
					"Protocol score",
					`${
						_.isEmpty(summaryDetails?.protocol_score_100)
							? ""
							: `${_.first(
									summaryDetails?.protocol_score_100?.split(
										" "
									)
							  )}/100`
					}`
				)}
				{renderSummaryRow(
					"Key exchange score",
					`${
						_.isEmpty(summaryDetails?.key_exchange_score_100)
							? ""
							: `${_.first(
									summaryDetails?.key_exchange_score_100?.split(
										" "
									)
							  )}/100`
					}`
				)}
				{renderSummaryRow(
					"Cipher Score",
					`${
						_.isEmpty(summaryDetails?.cipher_score_100)
							? ""
							: `${_.first(
									summaryDetails?.cipher_score_100.split(" ")
							  )}/100`
					}`
				)}
				{renderSummaryRow(
					"TLS protocol",
					_.first(summaryDetails?.tls_protocol?.split(" "))
				)}
				{renderSummaryRow("Keys", [...new Set(summaryDetails?.keys)])}
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
			<div className="mb-4">
				<div className="font-18 mb-2">Cipher Suites</div>
				{props.probeDetails?.cipher_suites &&
				Array.isArray(props.probeDetails?.cipher_suites) &&
				props.probeDetails?.cipher_suites.length > 0 ? (
					<div
						className="bg-white p-2 mr-4 mt-2 table_scroll_sm"
						style={{ borderRadius: "6px" }}
					>
						<Table
							headerCSSClasses="table_headers grey-1 o-7 font-11"
							data={props.probeDetails?.cipher_suites}
							columns={cipher_suites_columns}
							remote={false}
						/>
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
							No cipher suites :)
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Immirhil;
