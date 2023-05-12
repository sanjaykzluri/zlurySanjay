import React from "react";
import top_right_arrow from "../../../assets/top_right_arrow.svg";
import { Table } from "../../../common";
import ScanResultTemplate from "./ScanResultTemplate";
import _ from "underscore";
import ShowMoreText from "react-show-more-text";
import Grade from "./Grade";
import common_empty from "../../../assets/common/common_empty.png";

function TlsObservatory(props) {
	const getSummaryDetails = (summaryDetails) => {
		return (
			<>
				<div className="d-flex flex-row scan_summary">
					<div className="grey label">Scan ID</div>
					<div
						className={`grey-1 font-13 value ${
							!summaryDetails?.scan_id && "o-5"
						}`}
					>
						{summaryDetails?.scan_id || "data unavailable"}
					</div>
				</div>
				<div className="d-flex flex-row scan_summary">
					<div className="grey label">Start time</div>
					<div
						className={`grey-1 font-13 value ${
							!summaryDetails?.start_time && "o-5"
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
					<div className="grey label">Comaptibility Level</div>
					<div
						className={`grey-1 font-13 value ${
							!summaryDetails?.compatibility_level && "o-5"
						}`}
					>
						{summaryDetails?.compatibility_level
							?.toLocaleLowerCase()
							?.includes("non-compliant")
							? "Not Compliant"
							: summaryDetails?.compatibility_level ||
							  "data unavailable"}
					</div>
				</div>
				{summaryDetails?.certificate_explainer && (
					<div className="d-flex flex-row scan_summary">
						<a
							className="font-14"
							href={summaryDetails?.certificate_explainer}
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

	const renderRowDetail = (key, value, showLightGreyBg, className) => {
		return (
			<div
				className={`d-flex flex-row security_probes_card_column mt-0 mb-0 p-3 ${
					showLightGreyBg && "lightGreyBg"
				}`}
			>
				<div className="label text-capitalize">
					{key ? key.toString().split("_").join(" ") : ""}
				</div>
				<div className={`value ${className}`}>
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
						value || "data unavailable"
					)}
				</div>
			</div>
		);
	};

	const columnValueDefault = (value) => {
		return (
			<div className={`font-14 grey ${!value && "o-6"}`}>
				{value || "data unavailable"}
			</div>
		);
	};

	const cipher_suites_columns = [
		{
			dataField: "cipher_suite",
			text: "Cipher suites",
			formatter: (dataField) => columnValueDefault(dataField),
		},
		{
			dataField: "code",
			text: "Code",
			formatter: (dataField) => columnValueDefault(dataField),
		},
		{
			dataField: "key_size",
			text: "Key Size",
			formatter: (dataField) => columnValueDefault(dataField),
		},
		{
			dataField: "aead",
			text: "aead",
			formatter: (dataField) => (
				<div
					className={`font-13 text-capitalize ${
						_.isBoolean(dataField)
							? dataField
								? "authorized_green"
								: "unauthorized_red"
							: "o-6"
					}`}
				>
					{_.isBoolean(dataField)
						? dataField.toString()
						: "data unavailable"}
				</div>
			),
		},
		{
			dataField: "pfs",
			text: "pfs",
			formatter: (dataField) => (
				<div
					className={`font-13 text-capitalize ${
						_.isBoolean(dataField)
							? dataField
								? "authorized_green"
								: "unauthorized_red"
							: "o-6"
					}`}
				>
					{_.isBoolean(dataField)
						? dataField.toString()
						: "data unavailable"}
				</div>
			),
		},
		{
			dataField: "protocols",
			text: "protocols",
			formatter: (dataField) => columnValueDefault(dataField),
		},
	];

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
			{props.probeDetails?.certificates &&
			_.without(
				_.flatten(_.values(props.probeDetails?.certificates)),
				"",
				"",
				[],
				{},
				null,
				undefined
			).length > 0 ? (
				<div className="mb-4">
					<div className="font-18">Certificate Information</div>
					<div
						className="mr-4 mt-2 d-flex flex-column listViewDetails bg-white security_probes_card"
						style={{ borderRadius: "6px" }}
					>
						{props.probeDetails?.certificates &&
							Object.keys(props.probeDetails?.certificates)
								.length > 0 &&
							Object.keys(props.probeDetails?.certificates).map(
								(key, index) =>
									renderRowDetail(
										key,
										props.probeDetails?.certificates[key],
										index % 2 === 0
									)
							)}
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
						No Certificate Information :)
					</div>
				</div>
			)}
			{props.probeDetails?.cipher_suites &&
			Array.isArray(props.probeDetails?.cipher_suites) &&
			props.probeDetails?.cipher_suites.length > 0 ? (
				<div className="mb-4">
					<div className="font-18">Cipher Suites</div>
					<div
						className="bg-white p-2 mr-4 mt-2"
						style={{ borderRadius: "6px" }}
					>
						<Table
							headerCSSClasses="table_headers grey-1 o-7 font-11"
							data={props.probeDetails?.cipher_suites}
							columns={cipher_suites_columns}
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
						No cipher suites :)
					</div>
				</div>
			)}
			{props.probeDetails?.miscellaneous &&
			_.without(
				_.flatten(_.values(props.probeDetails?.miscellaneous)),
				"",
				"",
				[],
				{},
				null,
				undefined
			).length > 0 ? (
				<div className="mb-4">
					<div className="font-18">Miscellaneous Information</div>
					<div
						className="mr-4 mt-2 d-flex flex-column listViewDetails bg-white security_probes_card"
						style={{ borderRadius: "6px" }}
					>
						{props.probeDetails?.miscellaneous &&
							Object.keys(props.probeDetails?.miscellaneous)
								.length > 0 &&
							Object.keys(props.probeDetails?.miscellaneous).map(
								(key, index) =>
									renderRowDetail(
										key,
										props.probeDetails?.miscellaneous[key],
										index % 2 === 0
									)
							)}
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
						No Miscellaneous info :)
					</div>
				</div>
			)}
		</div>
	);
}

export default TlsObservatory;
