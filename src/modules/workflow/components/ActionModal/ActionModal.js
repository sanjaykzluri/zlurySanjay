import { NameBadge } from "common/NameBadge";
import React, { useEffect, useState, useRef } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Modal } from "UIComponents/Modal/Modal";
import moment from "moment";
import { Button } from "UIComponents/Button/Button";
import noActionsHereImage from "../../../../assets/noActionsHereImage.svg";
import noActionsHereText from "../../../../assets/noActionsHereText.svg";

function nullCheck(array) {
	let data = [];
	if (array && Array.isArray(array)) {
		data = array;
	}
	return data;
}

export default function ActionModal(props) {
	const {
		openModal,
		data,
		onCloseModal,
		onUseTemplate,
		buttonTitle,
		modalClass,
		workflowId,
		loading,
	} = props;
	const lists = [];
	let counts = 0;

	let workflow_apps = nullCheck(data?.workflow_apps || data?.apps);
	workflow_apps.forEach((el, key) => {
		el?.actions?.forEach((item, index) => {
			counts++;
			lists.push(
				<div
					key={index}
					className="list-item d-flex justify-content-start"
					style={{ padding: "6px 0px", alignItems: "center" }}
				>
					{el.app_logo ? (
						<img
							style={{
								width: "36px",
								height: "26px",
								paddingRight: "10px",
								objectFit: "contain",
								// borderRadius: "15%",
							}}
							src={el.app_logo}
						/>
					) : (
						<NameBadge
							className="mr-2"
							name={el.app_name}
							width={26}
							height={26}
							borderRadius={"15%"}
						/>
					)}
					<p
						style={{
							fontSize: "15px",
							lineHeight: "17.64px",
							marginBottom: "0px",
							marginLeft: "8px",
						}}
					>
						{counts}. {item.action_name}
					</p>
				</div>
			);
		});
	});
	return (
		<Modal
			contentClassName={modalClass}
			dialogClassName="z_i_connect_modal_dialog"
			show={openModal}
			title={
				<div className="title-container">
					<OverlayTrigger
						placement="bottom"
						overlay={
							<Tooltip>{data.workflow_name || data.name}</Tooltip>
						}
					>
						<span
							className="title-text"
							style={{
								width: "370px",
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
								textAlign: "center",
							}}
						>
							{data.workflow_name || data.name}
						</span>
					</OverlayTrigger>
					<span className="sub-title">
						{`Created by ${data.created_by_user_name} on
						${moment(data?.created_at).format("DD MMM 'YY")}`}
					</span>
				</div>
			}
			onClose={() => onCloseModal()}
		>
			<div className="action-container mt-4 mb-5 d-flex flex-column ">
				<div className="action-list m-auto d-flex flex-column pl-5 justify-content-start">
					<p className="list-name">Actions</p>
					<div
						className="list-conatiner d-flex flex-column justify-content-start"
						style={{
							overflowY: "scroll",
							msOverflowY: "scroll",
							height: "350px",
						}}
					>
						{lists.length > 0 ? (
							lists
						) : (
							<div
								style={{
									height: "400px",
									marginRight: "48px",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									flexDirection: "column",
								}}
							>
								<img
									src={noActionsHereImage}
									alt="no actions here"
								/>
								<img
									src={noActionsHereText}
									alt="no actions here"
								/>
							</div>
						)}
					</div>
				</div>
				<div
					style={{ display: "flex", justifyContent: "center" }}
					className="mt-5"
				>
					<Button
						style={{ width: "227px", height: "48px" }}
						disabled={!lists.length > 0 || loading}
						onClick={() => {
							onUseTemplate && onUseTemplate();
						}}
					>
						{buttonTitle}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
