import React from "react";
import { useDispatch } from "react-redux";
import { openModal } from "reducers/modal.reducer";
import AddAppUsersUploadCSV from "./AddAppUsersUploadCSV";
import AddAppUsersDownloadTemplate from "./AddAppUsersDownloadTemplate";
import { AddAppUsersViaCSVSteps } from "modules/licenses/constants/LicenseConstants";

export default function AddAppUsersViaCSV({
	appId,
	onSuccess,
	children = "Add User Via CSV",
	className = "add_user_via_csv_btn",
	style = {},
}) {
	const dispatch = useDispatch();

	return (
		<>
			<div
				className={className}
				style={style}
				onClick={() =>
					dispatch(
						openModal("bulkAddEditViaUploadCSV", {
							title: "Bulk Add Application Users",
							steps: AddAppUsersViaCSVSteps,
							getStepButtons: ({
								step,
								setUploading,
								setUploaded,
								setInvalidRows,
								handleClose,
							}) => {
								switch (step) {
									case 1:
										return <AddAppUsersDownloadTemplate />;
									case 2:
										return <></>;
									case 3:
										return (
											<AddAppUsersUploadCSV
												setInvalidRows={setInvalidRows}
												setUploading={setUploading}
												setUploaded={setUploaded}
												appId={appId}
												onSuccess={onSuccess}
												handleClose={handleClose}
											/>
										);
									default:
										return <></>;
								}
							},
						})
					)
				}
			>
				{children}
			</div>
		</>
	);
}
