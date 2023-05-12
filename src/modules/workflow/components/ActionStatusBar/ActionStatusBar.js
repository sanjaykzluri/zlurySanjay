import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../UIComponents/Button/Button";
import { STATUSES } from "../../constants/constant";

function ActionStatusBar({
	runLog,
	showDetailedLogButton,
	workflowId,
	setShowModal,
}) {
	return (
		<div className="d-flex flex-row status_details">
			<div className="authorized_green status">
				{runLog?.completed_actions_count} completed
			</div>
			<div className="unauthorized_red status">
				{runLog?.failed_actions_count} failed
			</div>
			<div
				className={`${
					runLog.status === STATUSES.PENDING ||
					runLog.workflow_status === STATUSES.PENDING
						? "glow_blue"
						: "grey-1"
				} status`}
			>
				{runLog?.pending_actions_count} Pending
			</div>
			{showDetailedLogButton && (
				<div
					onClick={() => setShowModal(false)}
					className="view_detailed_log"
				>
					<Link
						to={`/workflow/${
							runLog.workflow_id || workflowId
						}/runs/${runLog._id}`}
					>
						View detailed log
					</Link>
				</div>
			)}
		</div>
	);
}

export default ActionStatusBar;
