import React from "react";
import scheduled from "../../../../assets/workflow/scheduled.svg";
import approved from "../../../../assets/workflow/approved.svg";
import bluecross from "../../../../assets/workflow/bluecross.svg";

const renderApprovalNameList = (approvalData) => {
	switch (approvalData?.length) {
		case 0:
			return;
		case 1:
			return approvalData[0]?.user_name;
		case 2:
			return `${approvalData[0]?.user_name} and ${
				approvalData.length - 1
			} other`;
		default:
			return `${approvalData[0]?.user_name} and ${
				approvalData.length - 1
			} others`;
	}
};

export const renderApprovalDataUI = (approvalData, deleteValue) => {
	return (
		<>
			<img alt="" src={approved} className="px-1" />
			<span style={{ color: "#5ABAFF" }} className={`font-12`}>
				Requires approval from {renderApprovalNameList(approvalData)}
			</span>
			<img
				height={"10px"}
				width={"20px"}
				className="px-1"
				src={bluecross}
				alt=""
				onClick={(e) => {
					e.stopPropagation();
					deleteValue([], "ApprovalAction", true);
				}}
			/>
		</>
	);
};

export const renderScheduledDataUI = (scheduledData, deleteValue) => {
	return (
		scheduledData &&
		Object.keys(scheduledData).length > 0 && (
			<>
				<img alt="" src={scheduled} className="px-1" />
				<span style={{ color: "#5ABAFF" }} className={`font-12`}>
					Scheduled to be run in {scheduledData?.duration}
				</span>
				<img
					height={"10px"}
					width={"20px"}
					className="px-1"
					src={bluecross}
					alt=""
					onClick={(e) => {
						e.stopPropagation();
						deleteValue(null, "ScheduleAction", true);
					}}
				/>
			</>
		)
	);
};
