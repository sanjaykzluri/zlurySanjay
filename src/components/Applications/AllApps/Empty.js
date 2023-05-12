import React, { useState, useRef, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../../common/empty.css";
import empty from "../../../assets/empty/NoAppsAdded.svg";
import add from "../../../assets/addwhite.svg";
import { AddApps } from "./AddApps";
import { useDispatch, useSelector } from "react-redux";
import { allowScroll, preventScroll } from "../../../actions/ui-action";
import { fetchAllApplications } from "../../../actions/applications-action";
import {
	addApplication,
	setAppsBulkAuth,
	setAppsBulkStatus,
	setAppsBulkOwner,
	addCustomApplication,
	setAppsBulkType,
} from "../../../services/api/applications";
import { addManualUsage } from "../../../services/api/users";
import { AddApplicationModal } from "../../Users/Applications/Modals/AddApplicationModal";
import { usersConstants } from "../../../constants/users";
import { AddUsersApplicationsToDepartments } from "../../Departments/Applications/Modals/AddUsersApplicationsToDepartments";
import { addManualUsageToDepartmentUsersAppliction } from "../../../services/api/departments";
import { applicationConstants, departmentConstants } from "../../../constants";
import RoleContext from "../../../services/roleContext/roleContext";
import ErrorScreen from "../../../common/ErrorModal/ErrorScreen";

export function Empty(props) {
	const dispatch = useDispatch();
	const { refreshTable } = useSelector((state) => state.ui);
	const location = useLocation();
	const [showHide, setshowHide] = useState(false);
	const [formErrors, setFormErrors] = useState([]);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const cancelToken = useRef();
	const [showError, setShowError] = useState(false);
	const [error, setError] = useState(null);
	const [refreshTableDueToUsage, setRefreshTableDueToUsage] = useState(false);
	const id = window.location.pathname.split("/")[2];
	const { isViewer } = useContext(RoleContext);
	const [newAppData, setNewAppData] = useState();

	const validateApp = (application, isCustom) => {
		const requiredFieldsCustomApp = ["app_name", "app_category_id"];
		const requiredFieldsForApp = ["app_parent_id"];
		let errors = [];
		const requiredFields = isCustom
			? requiredFieldsCustomApp
			: requiredFieldsForApp;
		requiredFields.forEach((field) => {
			if (!application[field]) {
				errors.push({
					value: application[field],
					msg: "Invalid Value",
					param: field,
				});
			}
		});

		return errors;
	};

	const addHideAppClose = () => {
		dispatch(allowScroll());
		setshowHide(false);
		setFormErrors([]);
		setSubmitInProgress(false);
	};

	const handleAppAdd = (application) => {
		setNewAppData(application);
		setSubmitInProgress(true);
		setFormErrors([]);
		let addAppPromise;

		let errors = validateApp(application, application.isCustom);
		if (errors.length > 0) {
			setFormErrors(errors);
			setSubmitInProgress(false);
			return;
		}
		addAppPromise = application.isCustom
			? addCustomApplication(application)
			: addApplication(application);

		if (addAppPromise) {
			addAppPromise
				.then((res) => {
					if (res.error) {
						setFormErrors([res.error]);
					} else {
						setFormErrors([]);
						addHideAppClose();
						refreshReduxState();
					}
					setSubmitInProgress(false);
				})
				.catch((err) => {
					console.error("Error creating new application:", err);
					setSubmitInProgress(false);
					if (err.response && err.response.data) {
						setFormErrors(err.response.data.errors);
					}
				});
		}
	};

	const handleAddApplicationToUser = async ({
		app_id,
		frequency,
		interval,
	}) => {
		try {
			const userId = location.pathname.split("/")[2];
			setSubmitInProgress(true);
			const res = await addManualUsage(
				userId,
				app_id,
				frequency,
				interval
			);
			if (res.status === "success") {
				setSubmitInProgress(false);
				setRefreshTableDueToUsage(true);
				refreshReduxState();
			}
		} catch (err) {
			setSubmitInProgress(false);
			setshowHide(false);
			if (err?.response?.data?.errors?.includes("user is inactive")) {
				setError("You cannot set manual usage for inactive user");
			} else if (
				err?.response?.data?.errors?.includes("application is inactive")
			) {
				setError(
					"You cannot set manual usage for inactive application"
				);
			} else {
				setError(err?.response?.data?.errors || err.message);
			}
			setShowError(true);
		}
	};

	const addApplicationToDepartments = async (appId, users_obj) => {
		try {
			setSubmitInProgress(true);
			const deptId = location.pathname.split("/")[2];
			const result = await addManualUsageToDepartmentUsersAppliction(
				deptId,
				appId,
				users_obj
			);
			if (result.status === "success") {
				setSubmitInProgress(false);
				setshowHide(false);
				setRefreshTableDueToUsage(true);
				refreshReduxState();
			}
		} catch (err) {
			setSubmitInProgress(false);
			setshowHide(false);
			if (err.response.data.errors?.includes("user is inactive")) {
				setError("You cannot set manual usage for inactive user");
			} else if (
				err.response.data.errors?.includes("application is inactive")
			) {
				setError(
					"You cannot set manual usage for inactive application"
				);
			} else {
				setError(err.message);
			}
			setShowError(true);
		}
	};

	const refreshReduxState = () => {
		dispatch({
			type: props.isUserApplication
				? usersConstants.DELETE_SINGLE_USER_APPS_CACHE
				: props.isDepartmentApplication
				? departmentConstants.DELETE_DEPARTMENTS_APPS_CACHE
				: applicationConstants.DELETE_APPLICATIONS_CACHE,
			payload: {
				id: id,
			},
		});
		refreshTable();
	};
	return (
		<div
			style={{ height: "75%" }}
			className="d-flex flex-column justify-content-center align-items-center mt-auto ml-auto mr-auto mb-4"
		>
			<img src={empty} width={200} />
			<div className="empty-header">No apps added</div>
			{!isViewer && (
				<>
					<div className="empty-lower">
						You can add all your apps via a CSV or an integration
						like G-Suite
					</div>
					<button
						color="primary"
						className="ov__button2 empty-page-button w-auto pl-3 pr-3 mt-3"
						onClick={() => {
							dispatch(preventScroll());
							setshowHide(true);
						}}
					>
						<img style={{ paddingRight: "5px" }} src={add} />
						Add Apps
					</button>
				</>
			)}
			{showHide ? (
				props.isUserApplication ? (
					<>
						<AddApplicationModal
							handleClose={() => setshowHide(false)}
							isOpen={showHide}
							handleSubmit={handleAddApplicationToUser}
							submitting={submitInProgress}
						/>
					</>
				) : props.isDepartmentApplication ? (
					<>
						<AddUsersApplicationsToDepartments
							isOpen={showHide}
							handleClose={() => setshowHide(false)}
							submitting={submitInProgress}
							handleSubmit={addApplicationToDepartments}
							id={id}
						/>
					</>
				) : (
					<>
						<div className="modal-backdrop show"></div>
						<div style={{ display: "block" }} className="modal">
							<AddApps
								handleSubmit={handleAppAdd}
								show={showHide}
								onHide={addHideAppClose}
								submitting={submitInProgress}
								validationErrors={formErrors}
								clearValidationErrors={() => setFormErrors([])}
								style={{ zIndex: "1" }}
							/>
						</div>
					</>
				)
			) : null}
			{formErrors.length > 0 && showHide && (
				<ErrorScreen
					isOpen={formErrors.length > 0 && showHide}
					closeModal={() => {
						setFormErrors([]);
					}}
					isSuccess={!formErrors.length}
					loading={submitInProgress}
					successMsgHeading={"Successfuly added application"}
					warningMsgHeading={"The application could not be added."}
					warningMsgDescription={
						"An error occured while adding new application. Would you like to retry?"
					}
					retryFunction={() => {
						handleAppAdd(newAppData);
					}}
					errors={formErrors}
					entity={"application"}
				/>
			)}
		</div>
	);
}
