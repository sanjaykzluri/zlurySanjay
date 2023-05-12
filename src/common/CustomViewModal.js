import dayjs from "dayjs";
import React, { useState } from "react";
import { Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import close from "../assets/close.svg";
import completeiconimg from "../components/Applications/Overview/completeicon.svg";

export const CustomViewModal = (props) => {
	const { handleSubmit, setShowCustomViewModal, isLoading, customViewSaved } =
		props;
	const [customViewName, setcustomViewName] = useState("");
	const [customViewDescription, setcustomViewDescription] = useState("");

	return (
		<>
			<Modal
				show={props.show}
				onHide={() => setShowCustomViewModal(false)}
				centered
				size="md"
			>
				<div className="d-flex flex-row align-items-center py-4">
					<div className="m-auto">
						<span className="contracts__heading d-flex flex-row">
							Set a name for this View
						</span>
					</div>
					<img
						className="pr-4 cursor-pointer"
						alt="Close"
						onClick={() => setShowCustomViewModal(false)}
						src={close}
					/>
				</div>
				<Modal.Body className="bg-white rounded-top">
					<div className="p-3">
						<input
							className="p-2"
							name="Name"
							type="text"
							placeholder="Name"
							value={customViewName}
							onChange={(e) => setcustomViewName(e.target.value)}
							style={{ width: "100%" }}
						/>
						<input
							className="p-2 mt-2"
							name="Description"
							type="text"
							placeholder="Description"
							value={customViewDescription}
							onChange={(e) =>
								setcustomViewDescription(e.target.value)
							}
							style={{ width: "100%" }}
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<div className="m-auto">
						<Button
							className="z__button px-4 py-2 mb-4"
							disabled={!customViewName || !customViewDescription}
							onClick={() => {
								handleSubmit(
									customViewName,
									customViewDescription
								);
							}}
						>
							Save
							{isLoading && (
								<div className="d-inline-flex align-items-center mr-2 ml-2">
									{!customViewSaved && (
										<Spinner
											className="mr-2 ml-2 blue-spinner action-edit-spinner"
											animation="border"
										/>
									)}
									{customViewSaved && (
										<img
											style={{
												position: "relative",
												top: "2px",
											}}
											src={completeiconimg}
											width={14}
										/>
									)}
								</div>
							)}
						</Button>
					</div>
				</Modal.Footer>
				<hr></hr>
			</Modal>
		</>
	);
};
