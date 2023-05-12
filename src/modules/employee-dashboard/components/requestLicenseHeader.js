import React, { useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import backarrow from "assets/licenses/backarrow.svg";
import { useHistory } from "react-router-dom";
import { Button } from "UIComponents/Button/Button";
import { TriggerIssue } from "utils/sentry";
import {
	getAddLicenseRequestPayload,
	getEditLicenseRequestPayload,
} from "../utils/employeeUtils";
import { Modal } from "UIComponents/Modal/Modal";
import warning from "assets/icons/delete-warning.svg";
import { useDispatch, useSelector } from "react-redux";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";
import { trackActionSegment } from "modules/shared/utils/segment";

export default function RequestLicenseHeader({
	reqData,
	apiCall,
	requestType,
	setValidated,
	missingFields,
}) {
	const dispatch = useDispatch();
	const id = window.location.pathname?.split("/")?.[5];
	const { request_license_info } = useSelector((state) => state.employee);
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [errorType, setErrorType] = useState("");
	const handleSubmit = () => {
		// License Name , Description mandatory
		setValidated(true);
		if (missingFields?.length) {
			setError(true);
			setErrorType("missing");
			return;
		}
		if (
			reqData.need_more_licenses &&
			reqData.users.length !== reqData.licenses_required
		) {
			setError(true);
			setErrorType("count");
			return;
		}

		callRequestLicenseAPI();
	};

	const errorTypes = {
		count: {
			msg: "There is a mismatch in number of licenses request and the users included.",
			onOk: () => setError(false),
			onClose: () => callRequestLicenseAPI(),
			onOkText: "Keep Editing",
			onCancelText: "Ignore and Proceed",
		},
		api: {
			msg: "Server Error! We couldn't complete your request. Would you like to try again?",
			onOk: () => callRequestLicenseAPI(),
			onClose: () => setError(false),
			onOkText: "Retry",
			onCancelText: "Cancel",
		},
		missing: {
			msg: `Please fill all the required fields to proceed`,
			onOk: () => setError(false),
			onOkText: "Keep Editing",
			onClose: () => {},
		},
	};

	function callRequestLicenseAPI() {
		setError(false);
		setLoading(true);
		apiCall(
			requestType === "Add"
				? getAddLicenseRequestPayload(reqData)
				: getEditLicenseRequestPayload(reqData, request_license_info),
			id
		)
			.then((res) => {
				if (requestType === "Add") {
					dispatch(clearAllV2DataCache("requests"));
					dispatch(clearAllV2DataCache("approvals"));
					dispatch(clearAllV2DataCache("pending"));
					dispatch(clearAllV2DataCache("completed"));
					trackActionSegment("New application request raised", {
						currentCategory: "Employee View",
						currentPageName: "Request License Page",
					});
				}
				setLoading(false);
				setError(false);
				history.push({
					pathname: `/user/license/request/overview/${res._id}`,
				});
			})
			.catch((err) => {
				TriggerIssue("Error in adding license request", err);
				setError(true);
				setErrorType("api");
			});
	}

	return (
		<>
			<Card className="plan__header__wrapper">
				<div
					className="d-flex align-items-center"
					style={{ width: "60%" }}
				>
					<div className="ml-2">
						<img
							className="cursor-pointer"
							width={16}
							src={backarrow}
							onClick={() => {
								history.push(`/user/app/requests#requests`);
							}}
						/>
					</div>

					<div className="ml-2" style={{ minWidth: "180px" }}>
						{requestType === "Add" ? "New Request" : "Edit Request"}
					</div>
				</div>

				<div
					className="d-flex justify-content-end"
					style={{ width: "40%" }}
				>
					<Button
						onClick={() => {
							handleSubmit();
						}}
					>
						{loading ? (
							<Spinner
								animation="border"
								role="status"
								variant="light"
								size="sm"
								className="ml-2"
								style={{ borderWidth: 2 }}
							>
								<span className="sr-only">Loading...</span>
							</Spinner>
						) : requestType === "Add" ? (
							"Confirm Request"
						) : (
							"Edit Request"
						)}
					</Button>
				</div>
			</Card>
			{error && (
				<Modal
					show={error}
					onClose={errorTypes[errorType]?.onClose}
					hideCloseImage
					size="md"
					footer={true}
					onOk={errorTypes[errorType]?.onOk}
					ok={errorTypes[errorType]?.onOkText}
					cancel={errorTypes[errorType]?.onCancelText}
					onHide={errorTypes[errorType]?.onOk}
					cancelNotPresent={missingFields.length > 0}
				>
					<div className="d-flex flex-column">
						<div className="mt-4 text-center">
							<img src={warning} alt="warning icon" />
						</div>
						<div
							className=" w-100 mt-2 mb-2 bg-white text-center font-18 bold-600 border-0 px-3 pt-3"
							style={{ fontSize: "18px" }}
						>
							{errorTypes[errorType].msg}
						</div>
						{errorType === "count" && (
							<div className="d-flex flex-column text-center grey1 font-14">
								<p>Are you sure you want to continue?</p>
							</div>
						)}
					</div>
				</Modal>
			)}
		</>
	);
}
