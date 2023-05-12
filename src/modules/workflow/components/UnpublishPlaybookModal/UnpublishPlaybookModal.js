import { editWorkflowDetails } from "modules/workflow/service/api";
import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { useHistory } from "react-router";
import { TriggerIssue } from "utils/sentry";
import info from "../../../../assets/icons/info-orange.svg";

const UnpublishPlaybookModal = (props) => {
	const history = useHistory();

	const [isEditing, setIsEditing] = useState(false);

	const editAndUnpublishPlaybook = () => {
		setIsEditing(true);
		editWorkflowDetails(
			props?.data?.workflow_id || props?.data?._id || props?.data?.id,
			{
				is_published: !props.data?.is_published,
			},
			true
		)
			.then((res) => {
				setIsEditing(false);
				if (props.entity !== "appPlaybooks") {
					history.push(`/playbook/${res._id}`);
				}
				if (props.onClose) {
					props.onClose();
				}
			})
			.catch((err) => {
				setIsEditing(false);
				TriggerIssue("Error in unpublish playbook", err);
			});
	};

	return (
		<>
			<Modal
				show={props.show}
				onHide={() => props.onHide}
				style={{ maxWidth: "50%!important" }}
				centered
				className="custom-map-modal"
			>
				<Modal.Header className="pb-1">
					<Modal.Title className=" mt-4 text-center">
						<img height={40} width={40} alt="" src={info} />
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="bg-white rounded-top">
					<div className="px-5">
						<div className="d-flex mt-4 flex-column align-items-center">
							<p className="font-18 bold-600 text-align-center">
								This playbook will be unpublished
							</p>
							<p
								style={{
									textAlign: "center",
									color: "#717171",
									fontFamily: "Sora",
								}}
							>
								To enable editing, this playbook will be
								unpublished. You can publish it once editing is
								complete.
							</p>
						</div>
					</div>
				</Modal.Body>
				<hr></hr>
				<Modal.Footer className="border-top">
					<Button variant="link" onClick={props.onHide}>
						Cancel
					</Button>
					<Button
						className="z-button-primary px-4"
						size="lg"
						onClick={() => {
							editAndUnpublishPlaybook();
						}}
						disabled={isEditing}
					>
						{isEditing && (
							<Spinner
								className="mr-2 mb-1 blue-spinner action-edit-spinner"
								animation="border"
							/>
						)}
						Unpublish and Edit
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default UnpublishPlaybookModal;
