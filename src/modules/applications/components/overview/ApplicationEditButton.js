import React, { useState } from "react";
import RoleContext from "../../../../services/roleContext/roleContext";
import editcolumns from "../../../../assets/applications/editcolumns.svg";
import { AppEdit } from "../../../../components/Applications/Overview/AppEdit";
import { TriggerIssue } from "../../../../utils/sentry";
import { updateApplication } from "../../../../services/api/applications";
import { trackPageSegment } from "modules/shared/utils/segment";

export default function ApplicationEditButton({ app, onAppChange }) {
	const { isViewer } = React.useContext(RoleContext);
	const [showAppEdit, setShowAppEdit] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [formErrors, setFormErrors] = useState([]);

	function handleAppEdit(application) {
		setSubmitting(true);
		setFormErrors([]);

		updateApplication(app?.app_id, application)
			.then((res) => {
				if (res.error) {
					setFormErrors(res.error);
				} else {
					setFormErrors([]);
					setShowAppEdit(false);
					onAppChange();
				}
				setSubmitting(false);
			})
			.catch((err) => {
				TriggerIssue("Error updating application:", err);
				setSubmitting(false);

				if (err && err.response && err.response.data) {
					setFormErrors(err.response.data.errors || []);
				}
			});
	}
	return (
		<>
			{!isViewer && (
				<img
					className="ml-1"
					style={{ position: "relative", top: "5px" }}
					type="submit"
					src={editcolumns}
					onClick={() => {
						app && setShowAppEdit(true);
						app &&
							trackPageSegment(
								"Applications",
								"Single Application - Edit App",
								{
									appId: app?.app_id,
									appName: app?.app_name,
								}
							);
					}}
				/>
			)}

			{showAppEdit && (
				<AppEdit
					application={app}
					submitting={submitting}
					show={showAppEdit}
					validationErrors={formErrors}
					onHide={() => setShowAppEdit(false)}
					onSubmit={handleAppEdit}
				/>
			)}
		</>
	);
}
