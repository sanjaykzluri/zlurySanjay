import React from "react";
import Papa from "papaparse";
import { Spinner } from "react-bootstrap";
import { addAppUsersByEmails } from "services/api/applications";
import DocumentUpload from "modules/shared/components/DocumentUpload/DocumentUpload";
import { BulkUploadAppUsersEmailHeader } from "modules/licenses/constants/LicenseConstants";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

export default function AddAppUsersUploadCSV({
	setUploading,
	setUploaded,
	appId,
	onSuccess,
	handleClose,
}) {
	const hasInvalidCSVHeader = (header) => {
		if (header[0] === BulkUploadAppUsersEmailHeader) {
			return true;
		}
		return false;
	};

	const readUploadedFile = (file) => {
		setUploading(true);
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			comments: "#",
			complete: (results) => {
				if (!hasInvalidCSVHeader(results.meta.fields)) {
					ApiResponseNotification({
						responseType: apiResponseTypes.ERROR,
						title: "Invalid/Missing Headers",
						description: `The uploaded CSV has invalid/missing headers! Accepted headers are: ${BulkUploadAppUsersEmailHeader}`,
					});
					setTimeout(() => {
						setUploading(false);
					}, [3000]);
					return;
				}
				requestAddAppUsersByEmail(
					appId,
					[...results.data].map(
						(el) => el[BulkUploadAppUsersEmailHeader]
					)
				);
			},
		});
	};

	const requestAddAppUsersByEmail = (appId, emails) => {
		addAppUsersByEmails(appId, emails)
			.then((res) => {
				if (res.status === apiResponseTypes.SUCCESS) {
					ApiResponseNotification({
						responseType: apiResponseTypes.SUCCESS,
						title: "Data uploaded successfully!",
						children: (
							<div className="d-flex flex-column font-12">
								<div>{`New users added: ${
									res.user_app_added_count || 0
								}`}</div>
								<div>{`Users already existing: ${
									res.user_app_edited_count || 0
								}`}</div>
								<div>{`Incorrect emails: ${
									res.incorrect_emails || 0
								}`}</div>
							</div>
						),
					});
					setUploading(false);
					setUploaded(true);
					onSuccess && onSuccess();
					handleClose && handleClose();
				}
			})
			.catch((error) => {
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					title: "Error in adding users via csv!",
					errorObj: error,
				});
				setUploading(false);
			});
	};

	return (
		<>
			<DocumentUpload
				acceptedFileArray={[".csv"]}
				loader={
					<div className="border-radius-8 padding_4 font-10 bold-500 font-white">
						<Spinner
							animation="border"
							role="status"
							variant="dark"
							size="sm"
							style={{ borderWidth: 2 }}
						/>
					</div>
				}
				getSourceUrl={false}
				readUploadedFile={readUploadedFile}
			>
				<div className="primary_bg_2 border-radius-8 padding_4 font-10 bold-500 font-white">
					Upload CSV
				</div>
			</DocumentUpload>
		</>
	);
}
