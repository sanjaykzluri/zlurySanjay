import React from "react";
import warning from "assets/agents/inactive.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroll-component";
import {
	hasValidEmail,
	hasValidLicense,
	hasValidRole,
	hasValidStartDate,
	hasValidEndDate,
} from "modules/licenses/utils/LicensesUtils";

export default function LicenseMapperInvalidRows({
	rows,
	userEmails,
	licenseNames,
	handleClose,
	reUploadFile,
}) {
	return (
		<div className="d-flex flex-column" style={{ padding: "10px" }}>
			<div className="warningMessage w-100 text-align-center">
				The table data has been updated but we found {rows.length} rows
				with errors
			</div>
			<InfiniteScroll
				dataLength={rows.length}
				scrollableTarget="scrollableDiv"
				scrollThreshold="50px"
				className="mt-2 mb-1"
				style={{
					height: "230px",
					overflow: "scroll",
				}}
			>
				<div className="d-flex flex-row o-7 grey-1 font-10 width-fit-content">
					<div
						style={{ width: "25px" }}
						className="index padding_4"
					></div>
					<div style={{ width: "175px" }} className="padding_4">
						Email
					</div>
					<div style={{ width: "175px" }} className="padding_4">
						License
					</div>
					<div style={{ width: "125px" }} className="padding_4">
						Start Date
					</div>
					<div style={{ width: "125px" }} className="padding_4">
						Role
					</div>
					<div style={{ width: "125px" }} className="padding_4">
						End Date
					</div>
				</div>
				{rows.map((row, index) => (
					<InvalidCSVTableRows
						index={index}
						email={row["Email"]}
						emailIsValid={hasValidEmail(row, userEmails)}
						license={row["License"]}
						licenseIsValid={hasValidLicense(row, licenseNames)}
						startDate={row["Start Date"]}
						startDateIsValid={hasValidStartDate(row)}
						role={row["Role"]}
						roleIsValid={hasValidRole(row)}
						endDate={row["End Date"]}
						endDateIsValid={hasValidEndDate(row)}
					/>
				))}
			</InfiniteScroll>
			<div className="d-flex justify-content-center">
				<div
					className="primary_bg_2 border-radius-8 padding_4 font-10 bold-500 font-white cursor-pointer mr-2"
					onClick={handleClose}
				>
					Ignore and Continue
				</div>
				<div
					className="primary_bg_2 border-radius-8 padding_4 font-10 bold-500 font-white cursor-pointer ml-2"
					onClick={reUploadFile}
				>
					Re-upload File
				</div>
			</div>
		</div>
	);
}

const ErrorMessageTooltip = ({ message }) => {
	return (
		<OverlayTrigger placement="top" overlay={<Tooltip>{message}</Tooltip>}>
			<img
				src={warning}
				style={{ width: "12px", height: "12px" }}
				className="m-auto"
				alt="inValid"
			/>
		</OverlayTrigger>
	);
};

const InvalidCSVTableRows = ({
	index,
	email,
	emailIsValid,
	license,
	licenseIsValid,
	startDate,
	startDateIsValid,
	role,
	roleIsValid,
	endDate,
	endDateIsValid,
}) => {
	return (
		<div className="d-flex flex-row columnValues  width-fit-content">
			<div className="index grey-1" style={{ width: "25px" }}>
				{index + 1}
			</div>
			<div
				className={"d-flex " + (!emailIsValid && "inValidColumn")}
				style={{ width: "175px" }}
			>
				<div className="text-truncate">{email || "empty"}</div>
				{!emailIsValid && (
					<ErrorMessageTooltip
						message={
							!!email
								? `This email does not belong to any user of this application.`
								: "Empty description"
						}
					/>
				)}
			</div>
			<div
				className={"d-flex " + (!licenseIsValid && "inValidColumn")}
				style={{ width: "175px" }}
			>
				<div className="text-truncate">{license || "empty"}</div>
				{!licenseIsValid && (
					<ErrorMessageTooltip
						message={
							!!license
								? `This license does not belong to this contract.`
								: "Empty description"
						}
					/>
				)}
			</div>

			<div
				className={"d-flex " + (!startDateIsValid && "inValidColumn")}
				style={{ width: "125px" }}
			>
				<div className="text-truncate">{startDate || "empty"}</div>
				{!startDateIsValid && (
					<ErrorMessageTooltip message="Invalid start date" />
				)}
			</div>
			<div
				className={"d-flex " + (!roleIsValid && "inValidColumn")}
				style={{ width: "125px" }}
			>
				<div className="text-truncate">{role || "empty"}</div>
				{!roleIsValid && (
					<ErrorMessageTooltip
						message={`Special characters are not allowed`}
					/>
				)}
			</div>
			<div
				className={"d-flex " + (!endDateIsValid && "inValidColumn")}
				style={{ width: "125px" }}
			>
				<div className="text-truncate">{endDate || "empty"}</div>
				{!endDateIsValid && (
					<ErrorMessageTooltip message="Invalid end date" />
				)}
			</div>
		</div>
	);
};
