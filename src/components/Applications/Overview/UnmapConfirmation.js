import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Button } from "../../../UIComponents/Button/Button";
import warning from "../../../assets/icons/delete-warning.svg";
import { Loader } from "../../../common/Loader/Loader";
import { TriggerIssue } from "../../../utils/sentry";
import { patchApplication } from "../../../services/api/applications";

export function UnmapConfirmation(props) {
	const [showUnmapInProcess, setShowUnmapInProcess] = useState(false);
	const handleSubmit = () => {
		setShowUnmapInProcess(true);
		let data = {
			patches: [{ op: "delete", field: "parentId", value: "" }],
		};
		patchApplication(props.app_id, data)
			.then((res) => {
				if (res.status === "success") {
					closeAfterUnmap();
				} else {
					TriggerIssue(
						"The application could not be unmapped due to an error",
						res
					);
					throw new Error(
						"The application could not be unmapped due to an error"
					);
				}
			})
			.catch((err) => {
				TriggerIssue(
					"An error occured while unmapping the application:",
					err
				);
			});
	};
	const closeAfterUnmap = () => {
		props.onClose();
		props.onAppChange();
	};
	return (
		<Modal centered show={props.show} onHide={props.onClose}>
			{!showUnmapInProcess ? (
				<div className="upload__modal">
					<div className="unmap__modal__inner__2">
						<img
							src={warning}
							alt="warning icon"
							height={45}
							width={45}
						/>
						<div className="unmap__modal__heading">
							You are about to unmap {props.app_name}.
						</div>
						<div className="unmap__modal__text">
							Are you sure you want to continue?
						</div>
					</div>
					<div className="unmap__modal__footer border-top">
						<Button
							type="link"
							onClick={() => props.onClose()}
							className="unmap__modal__cancel"
						>
							Cancel
						</Button>
						<Button
							onClick={() => handleSubmit()}
							className="unmap__modal__submit"
						>
							Unmap
						</Button>
					</div>
				</div>
			) : (
				<div className="upload__modal">
					<div className="unmap__modal__inner__2">
						<div className="unmap__modal__heading">
							Unmapping in Progress...
						</div>
						<Loader height={60} width={60} />
						<div
							className="unmap__modal__text"
							style={{ marginTop: "20px", marginBottom: "10px" }}
						>
							This action usually takes few minutes to complete.
							You may close this modal and do other things. We’ll
							notify you once its done.
						</div>
					</div>
					<div className="unmap__modal__footer__2 border-top">
						<Button
							type="link"
							onClick={() => closeAfterUnmap()}
							className="unmap__modal__cancel"
						>
							Close
						</Button>
					</div>
				</div>
			)}
		</Modal>
	);
}
