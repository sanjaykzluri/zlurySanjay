import React, { useEffect, useState, useRef } from "react";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import "./InlineEditHost.css";
import edit from "../../../assets/icons/edit.svg";
import completeiconimg from "../../../assets/icons/completeicon.svg";
import acceptbutton from "../../../assets/icons/acceptbutton.svg";
import cancel from "../../../assets/icons/cancel.svg";
import { updatedHost } from "../../../services/api/applications";
import { Spinner } from "react-bootstrap";
import warning from "../../../assets/icons/delete-warning.svg";
import { Modal, Button } from "react-bootstrap";
import inactive from "../../../assets/agents/inactive.svg";
import close from "../../../assets/close.svg";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

function InlineEditHost(props) {
	const [isEditing, setEditing] = useState(false);
	const [host, setHost] = useState(props.host || "");
	const editFieldRef = useRef();
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [updateFailed, setUpdatedFailed] = useState(false);
	const [isWrongDNS, setIsWrongDNS] = useState(false);

	useEffect(() => {
		if (props.host) {
			setHost(props.host);
		}
	}, []);

	useOutsideClickListener(editFieldRef, () => {
		setEditing(false);
		setUpdatedFailed(false);
		setIsWrongDNS(false);
		onEditClose();
	});

	const onEditClose = () => {
		setHost(props.host);
		setIsWrongDNS(false);
		setUpdatedFailed(false);
	};

	const handleHostEdit = (value) => {
		let editedHost = value?.trim();
		setHost(editedHost);
	};

	const handleSave = () => {
		setSubmitting(true);
		updatedHost(props.app_id, host).then((response) => {
			if (response?.status === "success") {
				setSubmitting(false);
				setSubmitted(true);
				setTimeout(() => {
					props.refreshSecurityProbes();
				}, [2000]);
				updateFailed && setUpdatedFailed(false);
			} else {
				if (
					response?.error?.response?.data?.errors.includes(
						"Error: getaddrinfo ENOTFOUND"
					)
				) {
					setIsWrongDNS(true);
				}
				setUpdatedFailed(true);
			}
			setSubmitting(false);
		});
	};

	return (
		<>
			{isEditing ? (
				<>
					<div
						ref={editFieldRef}
						className="overview__middle__topconttext2__EditCategory w-auto"
						style={{ top: "-12px" }}
					>
						<input
							type="text"
							className="overview__middle__topconttext2__EditCategory__input"
							style={{ flexGrow: 1 }}
							placeholder="Enter Host"
							value={host}
							onChange={(e) => handleHostEdit(e.target.value)}
						/>
						{submitting && (
							<div className="d-flex align-items-center mr-2">
								<Spinner
									animation="border"
									variant="light"
									bsPrefix="my-custom-spinner"
									className="my-custom-spinner"
								/>
							</div>
						)}
						{submitted && (
							<div className="d-flex align-items-center mr-2">
								<img src={completeiconimg} />
							</div>
						)}
						{!submitting && !submitted && (
							<>
								<button
									onClick={() => {
										setEditing(false);
										onEditClose();
									}}
									className="overview__middle__topconttext2__EditCategory__button1 mr-1 mt-auto mb-auto"
								>
									<img src={cancel} />
								</button>
								<button
									className="overview__middle__topconttext2__EditCategory__button2 mr-1 mt-auto mb-auto"
									onClick={handleSave}
								>
									<img src={acceptbutton}></img>
								</button>
							</>
						)}
					</div>
					{updateFailed && (
						<Modal
							show={updateFailed}
							onHide={() => setUpdatedFailed(false)}
							centered
						>
							<div
								className="deactivate__cont"
								ref={editFieldRef}
							>
								<img
									src={close}
									onClick={() => setUpdatedFailed(false)}
									className="cursor-pointer"
									width={12}
								/>
								<div className="d-flex flex-column align-items-center justify-content-center">
									<img
										src={inactive}
										height="54px"
										width="54px"
										style={{ marginBottom: "10px" }}
									/>
								</div>
								<div className="bold-600 font-16 mb-2">
									Failed to update the host.
								</div>
								<div className="bold-600 font-14">
									{isWrongDNS
										? "Domain does not exist! Please try with a correct domain."
										: "Server Error! We couldn't complete your request."}
								</div>
							</div>
						</Modal>
					)}
				</>
			) : (
				<div
					className={`grey-1 font-13 value inlineEditHost d-flex ${
						!host && "o-6"
					}`}
				>
					{host ? (
						<LongTextTooltip
							text={host}
							maxWidth={props.maxWidth || "100%"}
						/>
					) : (
						"data unavailable"
					)}
					<img
						src={edit}
						onClick={() => setEditing(true)}
						className="ml-1"
					/>
				</div>
			)}
		</>
	);
}

export default InlineEditHost;
