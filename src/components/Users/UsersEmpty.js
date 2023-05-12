import React, { useState } from "react";
import "../../common/empty.css";
import empty from "../../assets/users/empty.svg";
import add from "../../assets/addwhite.svg";
import { AddUserApplication } from "../Applications/Users/Modals/AddUserApplication";
import { addManualUsage, addUser } from "../../services/api/users";
import { openModal } from "reducers/modal.reducer";
import { useDispatch } from "react-redux";

export function UsersEmpty(props) {
	const dispatch = useDispatch();
	const [addUsersShow, setAddUsersShow] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(false);
	const [showError, setShowError] = useState(false);
	const [formErrors, setFormErrors] = useState([]);

	const handleAddManualUsage = async ({ userId, frequency, interval }) => {
		try {
			const appId = props.appId || window.location.pathname.split("/")[2];
			setSubmitting(true);
			const res = await addManualUsage(
				userId,
				appId,
				frequency,
				interval
			);
			if (res.status === "success") {
				setSubmitting(false);
				setAddUsersShow(false);
				props.handleRefresh();
			}
		} catch (err) {
			let errMessage = err.message;
			if (err.response.data.errors?.includes("user is inactive")) {
				errMessage = "You cannot set manual usage for inactive user";
			} else if (
				err.response.data.errors?.includes("application is inactive")
			) {
				errMessage =
					"You cannot set manual usage for inactive application";
			}
			setSubmitting(false);
			setAddUsersShow(false);
			setError(errMessage);
			setShowError(true);
		}
	};

	const handleUserAdd = (user, callback) => {
		setSubmitting(true);
		setFormErrors([]);
		addUser(user)
			.then((res) => {
				setAddUsersShow(false);
				setSubmitting(false);
				if (
					res.error &&
					res.error === "Error: User with this email already exists"
				) {
					callback(true);
				}
				props.handleRefresh();
			})
			.catch((err) => {
				setSubmitting(false);
				console.error(err.response);
				if (err.response && err.response.data) {
					setFormErrors(err.response.data.errors);
				}
				if (
					err.response &&
					err.response.data &&
					err.response.data.errors ===
						"Error: User with this email already exists"
				) {
					callback(true);
				}
			});
	};

	return (
		<div
			style={{ height: "75%" }}
			className="d-flex flex-column justify-content-center align-items-center mt-auto ml-auto mr-auto"
		>
			<img src={empty} width={200} />
			<div className="empty-header">No users created</div>
			<div className="empty-lower">
				You can add all your users via a CSV or an integration like
				Slack
			</div>
			<button
				onClick={() =>
					props.isAllUsers
						? dispatch(openModal("user"))
						: setAddUsersShow(true)
				}
				color="primary"
				className="ov__button2 empty-page-button w-auto pl-3 pr-3 mt-3"
			>
				<img style={{ paddingRight: "5px" }} src={add} />
				Add Users
			</button>
			{props.isApplicationUser && addUsersShow && (
				<AddUserApplication
					handleClose={() => setAddUsersShow(false)}
					isOpen={addUsersShow}
					handleSubmit={handleAddManualUsage}
					submitting={submitting}
				/>
			)}
		</div>
	);
}
