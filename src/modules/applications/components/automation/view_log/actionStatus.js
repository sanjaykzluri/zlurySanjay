import React from "react";
import completedIcon from "assets/completed_icon.svg";
import pendingIcon from "assets/pending_icon.svg";
import failedIcon from "assets/cancelled_icon.svg";
import cancelled from "assets/workflow/Cancelled.svg";
import aborted from "assets/icons/aborted.svg";
export function actionStatus(actionStatus) {
	let statusMap = {
		completed: (
			<>
				<span>
					<img alt="" src={completedIcon} />
				</span>{" "}
				<span>Completed</span>
			</>
		),
		pending: (
			<>
				<span>
					<img alt="" src={pendingIcon} />
				</span>{" "}
				<span>Pending</span>
			</>
		),
		failed: (
			<>
				<span>
					<img alt="" src={failedIcon} />
				</span>{" "}
				<span>Failed</span>
			</>
		),
		cancelled: (
			<>
				<span>
					<img alt="" height={15} width={15} src={cancelled} />
				</span>{" "}
				<span>Cancelled</span>
			</>
		),
		aborted: (
			<>
				<span>
					<img alt="" src={aborted} />
				</span>{" "}
				<span>Aborted</span>
			</>
		),
		scheduled: (
			<>
				<span>
					<img alt="" src={pendingIcon} />
				</span>{" "}
				<span>Scheduled</span>
			</>
		),
		set_for_approval: (
			<>
				<span>
					<img alt="" src={pendingIcon} />
				</span>{" "}
				<span>Awaiting approval</span>
			</>
		),
		rejected: (
			<>
				<span>
					<img alt="" src={failedIcon} />
				</span>{" "}
				<span>Approval Denied</span>
			</>
		),
	};

	return statusMap[actionStatus];
}
