import React, { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import "./ChangeStatus.css";
import PropTypes from "prop-types";
import { NameBadge } from "../../common/NameBadge";
import { useDispatch } from "react-redux";
import { updateUser } from "../../services/api/users";
import rightArrow from "../../assets/rightArrow.svg";
import noteIcon from "../../assets/notes-paper.svg";
import { fetchUserDetails } from "./redux";
import { useLocation } from "react-router";
import { capitalizeFirstLetter } from "../../utils/common";
import { ChangeStatus as ChangeStatusInline } from "./Overview/ChangeStatus";
import GetImageOrNameBadge from "../../common/GetImageOrNameBadge";
export function ChangeStatus(props) {
	const { user_name, user_profile_img, user_status, user_id, user_email } =
		props.user;
	const [isShowNote, setShowNote] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	let [note, setNote] = useState();
	const dispatch = useDispatch();
	const location = useLocation();
	const updateUserStatus = () => {
		setSubmitInProgress(true);

		updateUser(user_id, {
			user_name,
			user_email,
			user_status:
				typeof props.newStatus === "string"
					? props.newStatus?.toLocaleLowerCase()
					: "active",
			user_status_change_note: note,
		})
			.then(() => {
				setSubmitInProgress(false);
				if (props.isTableCell) {
					props.refresh();
				} else {
					const id = location.pathname.split("/")[2];
					dispatch(fetchUserDetails(id));
				}

				props.handleClose();
			})
			.catch(() => {
				setSubmitInProgress(false);
				props.handleClose();
			});
	};

	return (
		<Modal
			centered
			show={props.isOpen}
			onHide={props.handleClose}
			dialogClassName="change-statusWrap"
		>
			<Modal.Header>
				<div className="changeStaus_header">
					<div className="changestatus_username">
						<GetImageOrNameBadge
							height={24}
							width={24}
							borderRadius="50%"
							url={user_profile_img}
							name={user_name}
						/>
						<div className="ml-1">{user_name}</div>
					</div>
					<img
						src={rightArrow}
						alt="right-arrow"
						className="right_arrow"
					/>
					<div className="changestatus_status">
						<span>
							<ChangeStatusInline
								status={props.newStatus}
								disableEdit
							/>
						</span>
					</div>
				</div>
			</Modal.Header>
			<Modal.Body className="change__status__body">
				<h4 className="status_mesasge">
					You are about to mark {user_name} as{" "}
					{capitalizeFirstLetter(props.newStatus)}
				</h4>
				<div className="add_note text-center">
					{isShowNote ? (
						<textarea
							className="w-75"
							onChange={(e) => setNote(e.target.value)}
							value={note}
							placeholder="Add a note"
						/>
					) : (
						<>
							<p className="text-center">
								Are you sure you want to continue?
							</p>
							<div>
								<img alt="note" src={noteIcon} />
								<button
									className="note_message btn"
									onClick={() => setShowNote(true)}
								>
									Add a Note <span>(optional)</span>
								</button>
							</div>
						</>
					)}
				</div>
			</Modal.Body>
			<hr />
			<Modal.Footer className="addTransactionModal__footer">
				<button className="btn btn-link" onClick={props.handleClose}>
					Cancel
				</button>
				<Button disabled={submitInProgress} onClick={updateUserStatus}>
					Continue
					{submitInProgress && (
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
					)}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

ChangeStatus.propTypes = {
	user: PropTypes.object.isRequired,
	isOpen: PropTypes.bool.isRequired,
	submitInProgress: PropTypes.bool,
	validationErrors: PropTypes.array,
	handleClose: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};
