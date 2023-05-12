import React, { useState } from "react";
import { Button } from "UIComponents/Button/Button";
import { deleteOptimizationReport } from "services/api/optimization";
import { TriggerIssue } from "utils/sentry";
import { Spinner } from "react-bootstrap";
import refresh_icon from "assets/icons/refresh.svg";
import { reportRegenerateTypes } from "./constants/OptimizationConstants";

export default function ModifyOrRefreshOptimizationReport({
	entityId,
	entityType,
	onDeleteReport,
}) {
	const [deleting, setDeleting] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const callDeleteOptimizationReport = (deleteType) => {
		deleteOptimizationReport(entityId, entityType)
			.then((res) => {
				if (res && res.status === "success") {
					setDeleting(false);
					setRefreshing(false);
					onDeleteReport(deleteType);
				} else {
					TriggerIssue(
						"Unexpected response from delete optimization report api",
						res
					);
					setDeleting(false);
					setRefreshing(false);
				}
			})
			.catch((err) => {
				TriggerIssue("Error in deleting optimization report", err);
				setDeleting(false);
				setRefreshing(false);
			});
	};

	return (
		<div className="d-flex flex-row">
			<Button
				type="borders"
				onClick={() => {
					setDeleting(true);
					callDeleteOptimizationReport(reportRegenerateTypes.MODIFY);
				}}
				disabled={deleting}
			>
				{deleting ? (
					<Spinner
						animation="border"
						role="status"
						variant="light"
						size="sm"
						style={{ borderWidth: 2 }}
					/>
				) : (
					"Modify"
				)}
			</Button>
			<button
				className="appsad ml-3"
				onClick={() => {
					setRefreshing(true);
					callDeleteOptimizationReport(reportRegenerateTypes.REFRESH);
				}}
				style={{ width: "50px", height: "36px" }}
				disabled={refreshing}
			>
				{refreshing ? (
					<Spinner
						animation="border"
						role="status"
						variant="dark"
						size="sm"
						style={{ borderWidth: 2 }}
					/>
				) : (
					<img className="w-100 h-100 m-auto" src={refresh_icon} />
				)}
			</button>
		</div>
	);
}
