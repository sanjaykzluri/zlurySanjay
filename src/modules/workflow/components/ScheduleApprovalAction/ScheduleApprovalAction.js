import React, { useState } from "react";
import {
	ACTION_OPTIONS,
	ACTION_RENDER_OPTIONS,
} from "modules/workflow/constants/constant";
import close from "../../../../assets/close.svg";
import bluecross from "../../../../assets/workflow/bluecross.svg";
import ScheduleAction from "../ScheduleAction/ScheduleAction";
import ApprovalAction from "../ApprovalAction/ApprovalAction";

const ScheduleApprovalAction = ({
	scheduledData,
	approvalData,
	action,
	handleScheduleApprovalChange,
	deleteScheduleApprovalData,
	isEditable = true,
}) => {
	const [selectedOption, setSelectedOption] = useState(null);

	const renderApprovalNameList = () => {
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

	const renderSelectedFieldUI = (item, key) => (
		<>
			{key === ACTION_OPTIONS.SCHEDULE &&
				scheduledData &&
				Object.keys(scheduledData).length > 0 && (
					<>
						<img alt="" src={item.selectedIcon} className="px-1" />
						<span
							style={{ color: "#5ABAFF" }}
							className={`font-12 ${!isEditable ? "p-1" : ""}`}
						>
							Scheduled to be run in {scheduledData?.duration}
						</span>
						{selectedOption !== item.value && isEditable && (
							<img
								height={"10px"}
								width={"20px"}
								className="px-1"
								src={bluecross}
								alt=""
								onClick={(e) => {
									e.stopPropagation();
									deleteScheduleApprovalData(
										null,
										"ScheduleAction"
									);
								}}
							/>
						)}
					</>
				)}
			{key === ACTION_OPTIONS.APPROVAL && (
				<>
					<img alt="" src={item.selectedIcon} className="px-1" />
					<span
						style={{ color: "#5ABAFF" }}
						className={`font-12 ${!isEditable ? "p-1" : ""}`}
					>
						Requires approval from {renderApprovalNameList()}
					</span>
					{selectedOption !== item.value && isEditable && (
						<img
							height={"10px"}
							width={"20px"}
							className="px-1"
							src={bluecross}
							alt=""
							onClick={(e) => {
								e.stopPropagation();
								deleteScheduleApprovalData(
									null,
									"ApprovalAction"
								);
							}}
						/>
					)}
				</>
			)}
		</>
	);

	const renderOptions = (
		<div className="d-flex flex-1 align-items-center pt-2">
			{ACTION_RENDER_OPTIONS.map((item, index) => {
				return (
					<div
						onClick={() => {
							if (selectedOption !== item.value) {
								setSelectedOption(item.value);
							}
						}}
						style={{
							backgroundColor:
								selectedOption === item.value || !isEditable
									? "rgba(232, 236, 248, 0.4)"
									: "",
							borderTopLeftRadius:
								selectedOption === item.value || isEditable
									? "4px"
									: "0px",
							borderTopRightRadius:
								selectedOption === item.value || isEditable
									? "4px"
									: "0px",
							borderRadius: !isEditable ? "4px" : "",
						}}
						className={`d-flex align-items-center mr-2 ${
							isEditable ? "px-2 py-2" : ""
						}`}
						key={index}
					>
						{item.value === ACTION_OPTIONS.SCHEDULE &&
						scheduledData &&
						Object.keys(scheduledData).length > 0 &&
						scheduledData?.duration
							? renderSelectedFieldUI(
									item,
									ACTION_OPTIONS.SCHEDULE
							  )
							: item.value === ACTION_OPTIONS.APPROVAL &&
							  approvalData &&
							  approvalData.length > 0
							? renderSelectedFieldUI(
									item,
									ACTION_OPTIONS.APPROVAL
							  )
							: isEditable && (
									<>
										<img
											alt=""
											src={item.icon}
											className="px-1"
										/>
										<span className={`font-12 grey-1`}>
											{item.label}
										</span>
									</>
							  )}
						{selectedOption === item.value && isEditable && (
							<img
								height={"10px"}
								width={"20px"}
								className="px-1"
								src={close}
								alt=""
								onClick={() => setSelectedOption(null)}
							/>
						)}
					</div>
				);
			})}
			{action?.breakOnError && (
				<div
					style={{
						backgroundColor: !isEditable
							? "rgba(232, 236, 248, 0.4)"
							: "",
						borderRadius: "4px",
					}}
					className={`d-flex align-items-center mr-2 ${
						isEditable ? "px-2 py-2" : ""
					}`}
				>
					<span
						style={{ color: "#5ABAFF" }}
						className={`font-12 ${!isEditable ? "p-1" : ""}`}
					>
						Break On Error
					</span>
				</div>
			)}
		</div>
	);

	return (
		<div className="d-flex flex-1 flex-column">
			{renderOptions}
			{selectedOption === ACTION_OPTIONS.SCHEDULE && isEditable && (
				<ScheduleAction
					scheduledData={scheduledData}
					action={action}
					handleScheduleApprovalChange={(obj, key) => {
						setSelectedOption(null);
						handleScheduleApprovalChange(obj, key);
					}}
				/>
			)}
			{selectedOption === ACTION_OPTIONS.APPROVAL && isEditable && (
				<ApprovalAction
					approvalData={approvalData}
					action={action}
					handleScheduleApprovalChange={(obj, key) => {
						setSelectedOption(null);
						handleScheduleApprovalChange(obj, key);
					}}
				/>
			)}
		</div>
	);
};

export default ScheduleApprovalAction;
