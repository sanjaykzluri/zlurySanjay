import React from "react";
import warning from "../Onboarding/warning.svg";
import moment from "moment";
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

const UploadTransInValidRow = (props) => {
	return (
		<div className="d-flex flex-row columnValues">
			<div className="width10 index grey-1">{props.index + 1}</div>
			<div
				className={
					"d-flex m-0 width30 " +
					(!props.isValidDescription && "inValidColumn")
				}
			>
				<div className="ml-0 mr-auto mt-auto mb-auto text-truncate">
					{props.description || "empty"}
				</div>
				{!props.isValidDescription && (
					<ErrorMessageTooltip
						message={
							!!props.description
								? `Description contains invalid characters (${invalidCharacters
										.map((el) => decodeURI(el))
										.join(", ")})`
								: "Empty description"
						}
					/>
				)}
			</div>
			<div
				className={
					"d-flex width20 m-0 " +
					(!props.isValidDate && "inValidColumn")
				}
			>
				<div className="ml-0 mr-auto mt-auto mb-auto text-truncate">
					{props.isValidDate
						? moment(props.date, props.dateFormat).format(
								"DD MMM YY"
						  )
						: props.date || "empty"}
				</div>
				{!props.isValidDate && props.date && (
					<ErrorMessageTooltip message="Invalid date format" />
				)}
			</div>
			<div
				className={
					"d-flex width20 m-0 " +
					(!props.isValidCurrency && "inValidColumn")
				}
			>
				<div className="ml-0 mr-auto mt-auto mb-auto text-truncate">
					{props.currency || "empty"}
				</div>
				{!props.isValidCurrency && props.currency && (
					<ErrorMessageTooltip message="Currency not supported" />
				)}
			</div>
			<div
				className={
					"d-flex width20 m-0 " +
					(!props.isValidAmount && "inValidColumn")
				}
			>
				<div className="ml-0 mr-auto mt-auto mb-auto text-truncate">
					{props.amount || "empty"}
				</div>
				{!props.isValidAmount && props.amount && (
					<ErrorMessageTooltip message="Invalid amount" />
				)}
			</div>
		</div>
	);
};

export default UploadTransInValidRow;
