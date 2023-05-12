import React from "react";
import error from "../../../../assets/icons/error.svg";

const RetryWorkflow = (props) => {
	return (
		<div
			style={{
				justifyContent: "space-between",
				backgroundColor: "rgba(254, 105, 85, 0.1)",
				padding: "18px",
				border: "0.5px solid #FF6767",
				borderRadius: "4px",
				flexDirection: "column",
			}}
			className="d-flex mb-3 "
		>
			<div className="font-14">
				<span className="mr-2">
					<img src={error} />
				</span>
				The workflow run failed. Please try again
			</div>
			<div
				className="primary-color font-14 bold-600 cursor-pointer mt-2"
				onClick={(e) => props.handleRefresh()}
			>
				Retry Workflow
			</div>
		</div>
	);
};

export default RetryWorkflow;
