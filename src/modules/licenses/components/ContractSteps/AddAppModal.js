import React, { useState } from "react";
import { AddApps } from "../../../../components/Applications/AllApps/AddApps";
import {
	addApplication,
	addCustomApplication,
} from "../../../../services/api/applications";
import { TriggerIssue } from "../../../../utils/sentry";
import { useDispatch } from "react-redux";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";
import { useHistory } from "react-router-dom";
import { clearAllV2DataCache as clearAllV2PaginatedDataCache } from "modules/v2PaginatedTable/redux/v2paginated-action";
import ErrorScreen from "../../../../common/ErrorModal/ErrorScreen";

export default function AddAppModal({
	show,
	onHide,
	appName,
	onAddApp,
	redirect = false,
}) {
	const dispatch = useDispatch();
	const history = useHistory();
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [formErrors, setFormErrors] = useState([]);
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
	const handleAppAdd = (application) => {
		setNewAppData(application);
		setSubmitInProgress(true);
		setFormErrors([]);
		let addAppPromise;
		addAppPromise = application.isCustom
			? addCustomApplication(application)
			: addApplication(application);

		let errors = validateApp(application, application.isCustom);
		if (errors.length > 0) {
			setFormErrors(errors);
			setSubmitInProgress(false);
			return;
		}

		if (addAppPromise) {
			addAppPromise
				.then((res) => {
					if (res.error) {
						setFormErrors([res.error]);
					} else {
						dispatch(clearAllV2DataCache("applications"));
						dispatch(clearAllV2PaginatedDataCache("applications"));
						if (redirect) {
							history.push(
								`applications/${res.org_app_id}#overview`
							);
						}
						onHide();
						setFormErrors([]);
						onAddApp &&
							onAddApp(
								res?.org_app_id,
								res?.org_app_name,
								res?.org_app_image
							);
					}

					setSubmitInProgress(false);
				})
				.catch((err) => {
					TriggerIssue("Error creating new application:");
					setSubmitInProgress(false);
					if (err.response && err.response.data) {
						setFormErrors(err.response.data.errors);
					}
				});
		}
	};

	return (
		<>
			<div className="modal-backdrop show"></div>
			<div style={{ display: "block" }} className="modal">
				<AddApps
					custom={appName}
					handleSubmit={handleAppAdd}
					show={show}
					onHide={onHide}
					submitting={submitInProgress}
					validationErrors={formErrors}
					clearValidationErrors={() => setFormErrors([])}
					style={{ zIndex: "1" }}
				/>
			</div>
			{formErrors.length > 0 && show && (
				<ErrorScreen
					isOpen={formErrors.length > 0 && show}
					closeModal={() => {
						setFormErrors([]);
					}}
					isSuccess={!formErrors.length > 0}
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
		</>
	);
}
