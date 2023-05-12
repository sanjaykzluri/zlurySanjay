import React, { useCallback, useState, useEffect } from "react";
import "../Action/Action.css";
import { debounce } from "../../../../utils/common";
import { Button } from "UIComponents/Button/Button";
import { Select } from "UIComponents/Select/Select";
import { searchUsers } from "services/api/search";

const approvalService = {
	user: {
		api: searchUsers,
		label: "user_name",
		value: "user_id",
		email: "user_email",
		imageKey: "user_logo",
	},
};

const ApprovalAction = ({
	scheduledData,
	approvalData,
	action,
	handleScheduleApprovalChange,
}) => {
	const [approvalAction, setApprovalAction] = useState(approvalData || []);
	const [error, setError] = useState(null);
	const [entityData, setEntityData] = useState([]);
	const [loading, setLoading] = useState(false);

	const debouncedChangeHandler = useCallback(
		debounce((query) => {
			if (query || query === "") {
				approvalService["user"]
					.api(query, null, true, true)
					.then((res) => {
						if (res.data || res.results || res) {
							setEntityData(res.data || res.results || res);
							setLoading(false);
						}
					})
					.catch((err) => {
						console.log("err", err);
					});
			}
		}, 1000),
		[]
	);

	useEffect(() => {
		setEntityData([]);
		setLoading(true);
		debouncedChangeHandler(" ");
	}, []);

	const validation = () => {
		const arr = [...approvalAction];
		const err = { ...error };
		let isError = false;
		let isValidated = true;
		if (arr.length === 0) {
			isValidated = false;
			isError = true;
			Object.assign(err, {
				error: true,
			});
		}
		if (isValidated) {
			Object.assign(err, {
				error: false,
			});
		}
		setError(err);
		return !isError;
	};

	const handleSave = () => {
		if (validation()) {
			handleScheduleApprovalChange(approvalAction, "ApprovalAction");
		}
	};

	return (
		<div
			style={{
				backgroundColor: "#F6F7FC",
				borderTopRightRadius: "4px",
				borderBottomLeftRadius: "4px",
				borderBottomRightRadius: "4px",
			}}
			className={`d-flex p-3 flex-column align-items-start`}
		>
			<span className="bold-400 font-10" style={{ color: "#919AB6" }}>
				Seek approval from someone before you run this action.
			</span>
			<div className="flex-1 d-flex flex-row py-2">
				<Select
					// mode="multi"
					optionsContainerClassName="approver-action"
					className="flex-fill black-1 w-auto mr-3 grey-bg approver-action"
					isOptionsLoading={loading}
					value={approvalAction || []}
					options={entityData || null}
					fieldNames={{
						label: approvalService["user"].label,
						value: approvalService["user"].value,
					}}
					search
					onSearch={(query) => {
						setEntityData([]);
						setLoading(true);
						if (query === "") {
							debouncedChangeHandler(" ");
						} else {
							debouncedChangeHandler(query);
						}
					}}
					placeholder={"Select Approver"}
					onChange={(obj) => {
						const value = [
							{
								[approvalService["user"].label]:
									obj[approvalService["user"].label],
								[approvalService["user"].value]:
									obj[approvalService["user"].value],
								[approvalService["user"].email]:
									obj[approvalService["user"].email],
								[approvalService["user"].imageKey]:
									obj.profile_img,
							},
						];
						setApprovalAction(value);
					}}
				/>
			</div>
			{error?.error && (
				<span className="bold-400 font-10" style={{ color: "#FF6767" }}>
					{"Field is required"}
				</span>
			)}
			<Button
				className="text-captalize font-12 p-0 my-2"
				type="link"
				onClick={() => {
					handleSave();
				}}
			>
				ADD APPROVER
			</Button>
		</div>
	);
};

export default ApprovalAction;
