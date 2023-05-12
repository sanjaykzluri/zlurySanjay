import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import deleteIcon from "assets/deleteIcon.svg";
import { deleteDocumentOfCompliance } from "services/api/applications";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

export default function DeleteDocumentOfCompliance({
	appId,
	onDelete,
	documentId,
	complianceId,
}) {
	const [deleting, setDeleting] = useState(false);

	const callDeleteDocumentOfCompliance = () => {
		setDeleting(true);
		deleteDocumentOfCompliance({ documentId, appId, complianceId })
			.then((res) => {
				if (res.status === apiResponseTypes.SUCCESS) {
					ApiResponseNotification({
						title: "The document has been successfully deleted!",
						description: "",
						responseType: apiResponseTypes.SUCCESS,
					});
					setDeleting(false);
					onDelete && onDelete();
				}
			})
			.catch((err) => {
				ApiResponseNotification({
					title: "Error in deleting the document of the compliance.",
					errorObj: err,
					responseType: apiResponseTypes.ERROR,
				});
				setDeleting(false);
			});
	};

	return (
		<>
			{deleting ? (
				<Spinner
					animation="border"
					role="status"
					variant="dark"
					size="sm"
					style={{ borderWidth: 2 }}
				/>
			) : (
				<div
					className="z-text-primary cursor-pointer"
					onClick={callDeleteDocumentOfCompliance}
				>
					<img src={deleteIcon} alt="Delete" width={16} height={16} />
				</div>
			)}
		</>
	);
}
