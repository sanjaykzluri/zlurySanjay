import React from "react";
import warning from "../../../../assets/workflow/warning.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { invalidCharacters } from "./UploadConstantsAndFunctions";

const ErrorMessageTooltip = (props) => {
	return (
		<OverlayTrigger
			placement="top"
			overlay={<Tooltip>{props.message}</Tooltip>}
		>
			<img
				src={warning}
				style={{ width: "12px", height: "12px" }}
				className="m-auto"
				alt="inValid"
			/>
		</OverlayTrigger>
	);
};

const UploadInValidRow = (props) => {
	return (
		<div className="d-flex flex-row columnValues">
			<div className="width10 index grey-1">{props.index + 1}</div>
			<div
				className={
					"d-flex m-0 width20 p-0 " +
					(!props.isValidName && "inValidColumn")
				}
			>
				<div className="ml-0 mr-auto mt-auto mb-auto text-truncate p-0 ">
					{props.name || ""}
				</div>
				{!props.isValidName && (
					<ErrorMessageTooltip
						message={
							!!props.name
								? `Name contains invalid characters`
								: "Empty Name"
						}
					/>
				)}
			</div>
			<div
				className={
					"d-flex width20 m-0 p-0 " +
					(!props.isValidDepartment && "inValidColumn")
				}
			>
				<div className="ml-0 mr-auto mt-auto mb-auto text-truncate p-0 ">
					{props.department || "empty"}
				</div>
				{!props.isValidDepartment && (
					<ErrorMessageTooltip
						message={
							!!props.department
								? `Department contains invalid characters`
								: "Empty Department"
						}
					/>
				)}
			</div>
			<div
				className={
					"d-flex width20 m-0 p-0 " +
					(!props.isValidDesignation && "inValidColumn")
				}
			>
				<div className="ml-0 mr-auto mt-auto mb-auto text-truncate p-0 ">
					{props.designation || "empty"}
				</div>
				{!props.isValidDesignation && (
					<ErrorMessageTooltip
						message={
							!!props.designation
								? `Designation contains invalid characters`
								: "Empty Designation"
						}
					/>
				)}
			</div>
			<div
				className={
					"d-flex width20 m-0 p-0 " +
					(!props.isValidPersonalEmail && "inValidColumn")
				}
			>
				<div className="ml-0 mr-auto mt-auto mb-auto text-truncate p-0 ">
					{props.personalEmail || "empty"}
				</div>
				{!props.isValidPersonalEmail && (
					<ErrorMessageTooltip
						message={
							!!props.personalEmail
								? `Personal Email contains invalid characters`
								: "Empty Personal Email"
						}
					/>
				)}
			</div>
			<div
				className={
					"d-flex width20 m-0 p-0 " +
					(!props.isValidPrimaryEmail && "inValidColumn")
				}
			>
				<div className="ml-0 mr-auto mt-auto mb-auto text-truncate p-0 ">
					{props.primaryEmail || "empty"}
				</div>
				{!props.isValidPrimaryEmail && (
					<ErrorMessageTooltip
						message={
							!!props.primaryEmail
								? `Primary Email contains invalid characters`
								: "Empty Primary Email"
						}
					/>
				)}
			</div>
		</div>
	);
};

export default UploadInValidRow;
