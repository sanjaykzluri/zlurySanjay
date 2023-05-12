import React, { useState, useEffect } from "react";
import { Modal } from "../UIComponents/Modal/Modal";
import warning from "../assets/icons/delete-warning.svg";
import { useDispatch, useSelector } from "react-redux";
import { OverlayTrigger, Tooltip, Form } from "react-bootstrap";

function BulkUpdateModal(props) {
	const [isRequesting, setIsRequesting] = useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [additionalCheck, setAdditionalCheck] = useState(false);
	function handleSubmit() {
		let req_Ids = [];
		req_Ids = props.selectedData.map((el) => el._id);
		let secondary_req_Ids = props.selectedData.map((el) => el.app_id);
		let reqObj = {};
		reqObj.set_all = additionalCheck;
		reqObj[props.api_entity] = req_Ids;
		if (additionalCheck) {
			reqObj[props.secondary_key] = secondary_req_Ids;
		}

		try {
			setIsRequesting(true);
			props.updateFunc(props.parentId, reqObj).then((res) => {
				if (res.success) {
					props.successResponse();
					props.closeModal();
					setIsRequesting(false);
				} else {
					console.log("Response is not as expected", res);
				}
			});
		} catch (error) {
			setIsRequesting(false);
			console.log(error, "Error when archiving " + props.type);
		}
	}
	const fetchSentence = () => {
		let sentence;
		if (
			Array.isArray(props.selectedData) &&
			props.selectedData.length > 1
		) {
			let tooltipText = [];
			props.selectedData.forEach((row) =>
				tooltipText.push(row[props.tooltipInfo])
			);
			if (props.modalType === "archive") {
				sentence = (
					<div>
						You’re about to {props.archiveType}{" "}
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{tooltipText.join(",")}</Tooltip>}
						>
							<span>
								{" "}
								{props.selectedData.length} {props.type}s
							</span>
						</OverlayTrigger>{" "}
						for {props.name}
					</div>
				);
			} else if (props.modalType === "source") {
				sentence = (
					<div>
						You’re about to set Primary source as {props.name} for
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{tooltipText.join(",")}</Tooltip>}
						>
							<span>
								{" "}
								{props.selectedData.length} {props.type}s
							</span>
						</OverlayTrigger>{" "}
					</div>
				);
			}
		} else {
			if (props.modalType === "archive") {
				sentence = `You’re about to ${props.archiveType} ${
					props.selectedData[0]?.[props.tooltipInfo]
				} for ${props.name}`;
			} else if (props.modalType === "source") {
				sentence = `You’re about to set Primary source as ${
					props.name
				} for ${props.selectedData[0]?.[props.tooltipInfo]}`;
			}
		}
		return sentence;
	};

	const fetchAdditionalText = () => {
		let sentence;
		if (props.modalType === "archive") {
			let tooltipText = [];
			props.selectedData.forEach((row) =>
				tooltipText.push(row[props.tooltipInfo])
			);
			sentence = (
				<div>
					<span className="text-capitalize">{props.archiveType}</span>{" "}
					{props.selectedData.length > 1 ? (
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{tooltipText.join(",")}</Tooltip>}
						>
							<span>
								{props.selectedData.length} {props.type}s
							</span>
						</OverlayTrigger>
					) : (
						props.selectedData[0][props.tooltipInfo]
					)}{" "}
					for all {props.type === "app" ? "Users" : "Apps"}
				</div>
			);
		} else if (props.modalType === "source") {
			sentence = `Set ${props.name} as primary source for all users using ${props.appName}`;
		}
		return sentence;
	};

	const fetchButtonText = () => {
		let sentence;
		if (props.modalType === "archive") {
			sentence = (
				<div className="text-capitalize">
					{props.archiveType} {props.type}
				</div>
			);
		} else if (props.modalType === "source") {
			sentence = "Set as primary source";
		}
		return sentence;
	};
	return (
		<Modal
			show={props.isOpen}
			onClose={() => {
				props.closeModal();
			}}
			size="md"
			footer={true}
			onOk={async () => {
				await handleSubmit();
			}}
			submitInProgress={isRequesting}
			disableOkButton={isRequesting}
			ok={fetchButtonText()}
		>
			<div className="d-flex flex-column">
				<div className="mt-4 text-center">
					<img src={warning} alt="warning icon" />
				</div>
				<div
					className="warningMessage w-100 mt-2 mb-2 bg-white text-center font-weight-bold border-0"
					style={{ fontSize: "18px" }}
				>
					{fetchSentence()}
				</div>
				<div className="d-flex flex-column text-center grey1 font-14">
					<p>Are you sure you want to continue?</p>
				</div>
				{props.additionalCheckPresent && (
					<div
						className="d-flex flex-row align-items-center mr-auto ml-auto pl-3 pr-3 pt-1 pb-1"
						style={{
							background: "rgba(255, 177, 105, 0.1)",

							border: "1px solid #FFB169",
						}}
					>
						<Form.Check
							className=""
							checked={additionalCheck}
							onChange={() => {
								setAdditionalCheck(!additionalCheck);
							}}
						/>
						<div className="font-14 mr-2 grey font-12">
							{fetchAdditionalText()}
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
}

export default BulkUpdateModal;
