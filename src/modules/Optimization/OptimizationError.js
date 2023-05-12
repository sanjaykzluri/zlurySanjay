import React, { useState } from "react";
import optimizationError from "assets/optimization/optimizationError.svg";
import { Button } from "UIComponents/Button/Button";
import { deleteOptimizationReport } from "services/api/optimization";
import { TriggerIssue } from "utils/sentry";
import { Spinner } from "react-bootstrap";

export default function OptimizationError({ entityId, entityType, setError }) {
	const [deleting, setDeleting] = useState(false);
	const callDeleteOptimizationReport = () => {
		setDeleting(true);
		deleteOptimizationReport(entityId, entityType)
			.then((res) => {
				if (res && res.status === "success") {
					setError(false);
					setDeleting(false);
				} else {
					TriggerIssue(
						"Unexpected response from delete optimization report api",
						res
					);
					setDeleting(false);
				}
			})
			.catch((err) => {
				TriggerIssue("Error in deleting optimization report", err);
				setDeleting(false);
			});
	};

	return (
		<>
			<div className="generate_optimization_div align-items-center pt-5">
				<img src={optimizationError} className="mt-3" />
				<div className="font-18 bold-500">Something went wrong!</div>
				<div className="font-14 my-2">
					We could not generate the optimization report.
				</div>
				<Button
					type="submit"
					disabled={deleting}
					onClick={callDeleteOptimizationReport}
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
						"Regenerate Report"
					)}
				</Button>
			</div>
		</>
	);
}
