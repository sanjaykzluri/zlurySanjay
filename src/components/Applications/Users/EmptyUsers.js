import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import "./Users.css";
import empty from "./empty.svg";
import add from '../../../assets/addwhite.svg';
import { AddUser } from '../../Users/AddUser'
import { AddUserApplication } from "./Modals/AddUserApplication";
import { addManualUsage } from "../../../services/api/users";
import { applicationConstants } from "../../../constants";
import RoleContext from "../../../services/roleContext/roleContext";

export function EmptyUsers() {
	const [addUserModalOpen, setAddUserModalOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [refreshTableDueToUsage, setRefreshTableDueToUsage] = useState()
	const [error, setError] = useState(null);
	const [showError, setShowError] = useState(false);
	const dispatch = useDispatch();
	const { refreshTable } = useSelector((state) => state.ui);
	const appId = window.location.pathname.split("/")[2];
	const { isViewer } = useContext(RoleContext);

	const handleAddManualUsage = async ({ userId, frequency, interval }) => {
		try {
			const appId = window.location.pathname.split("/")[2];
			setSubmitting(true);
			const res = await addManualUsage(
				userId,
				appId,
				frequency,
				interval
			);
			if (res.status === "success") {
				setSubmitting(false);
				setAddUserModalOpen(false);
				setRefreshTableDueToUsage(true);
				refreshReduxState();
			}
		} catch (err) {
			let errMessage = err.message;
			if (err.response.data.errors?.includes("user is inactive")) {
				errMessage = "You cannot set manual usage for inactive user";
			} else if (
				err.response.data.errors?.includes("application is inactive")
			) {
				errMessage = err.response.data.errors || 
					"You cannot set manual usage for inactive application";
			}
			setSubmitting(false);
			setAddUserModalOpen(false);
			setError(errMessage);
			setShowError(true);
		}
	};
	const refreshReduxState = () => {
		dispatch({
			type: applicationConstants.DELETE_SINGLE_APPLICATION_USERS_CACHE,
			payload: {
				id: appId,
			},
		});
		refreshTable();
	};
	return (
		<div className="d-flex flex-column justify-content-center align-items-center mt-auto ml-auto mr-auto mb-4">
			<img src={empty} width={200} />
			<div className="departments-empty-header">No users added</div>
			{
				!isViewer &&
				<>
					<div className="users-empty-lower mb-0">
						Add users to track usage, expenses
					</div>
					<div className="users-empty-lower">
						and get better recommendations
					</div>
					<button
						color="primary"
						className="ov__button2 ml-3 mr-3 pr-3 w-auto"
						style={{ width: 176 }}
						onClick={() => setAddUserModalOpen(true)}
					>
						<img src={add} className="ml-2 mr-2"></img>
						Add Users
					</button>
					<AddUserApplication
						isOpen={addUserModalOpen}
						handleClose={() => setAddUserModalOpen(false)}
						submitting={submitting}
						handleSubmit={handleAddManualUsage}
					/>
				</>
			}
		</div>
	);
}
