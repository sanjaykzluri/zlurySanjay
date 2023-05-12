import React, { useCallback, useState, useEffect, useRef } from "react";
import { debounce } from "../../../../utils/common";
import { Button } from "UIComponents/Button/Button";
import { Select } from "UIComponents/Select/Select";
import { searchUsers } from "services/api/search";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import approval from "../../../../assets/workflow/approval.svg";
import approved from "../../../../assets/workflow/approved.svg";
import { Popover } from "UIComponents/Popover/Popover";
import { TriggerIssue } from "utils/sentry";

const approvalService = {
	user: {
		api: searchUsers,
		label: "user_name",
		value: "user_id",
		email: "user_email",
		imageKey: "user_logo",
	},
};

const ApplicationApproval = (props) => {
	const { setShowAppApproval, showAppApproval } = props;
	const [approvalAction, setApprovalAction] = useState([]);
	const [error, setError] = useState(null);
	const [entityData, setEntityData] = useState([]);
	const [loading, setLoading] = useState(false);

	const ref = useRef();

	const debouncedChangeHandler = useCallback(
		debounce((query) => {
			if (query || query === "") {
				approvalService["user"]
					.api(query, null, true)
					.then((res) => {
						if (res.data || res.results || res) {
							setEntityData(res.data || res.results || res);
							setLoading(false);
						}
					})
					.catch((err) => {
						TriggerIssue(
							"Error in searching Application approval",
							err
						);
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
			// handleScheduleApprovalChange(approvalAction, "ApprovalAction");
		}
	};

	return (
		<>
			<Popover
				align="right"
				show={showAppApproval}
				onClose={() => setShowAppApproval(false)}
				style={{ padding: "0px", maxWidth: "380px", marginTop: "20px" }}
			>
				<div
					style={{
						backgroundColor: "#FFFFFF",
						borderRadius: "8px",
					}}
					className={`d-flex p-3 flex-column align-items-start`}
				>
					<span className="bold-500 font-16 black">
						Add Approvers
					</span>
					<hr
						className="w-100 my-2"
						// style={{ margin: "auto -15px" }}
					></hr>
					<span
						className="bold-400 font-10"
						style={{ color: "#919AB6" }}
					>
						Seek approval from someone before you run this action.
					</span>
					<div className="flex-1 d-flex flex-row py-2">
						<Select
							mode="multi"
							className="flex-fill black-1 w-auto mr-3 grey-bg"
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
								debouncedChangeHandler(query);
							}}
							placeholder={"Select Approver"}
							onChange={(obj) => {
								const value = [];
								obj.filter((item) => {
									value.push({
										[approvalService["user"].label]:
											item[approvalService["user"].label],
										[approvalService["user"].value]:
											item[approvalService["user"].value],
										[approvalService["user"].email]:
											item[approvalService["user"].email],
										[approvalService["user"].imageKey]:
											item.profile_img,
									});
								});
								setApprovalAction(value);
							}}
						/>
					</div>
					{error?.error && (
						<span
							className="bold-400 font-10"
							style={{ color: "#FF6767" }}
						>
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
			</Popover>
		</>
	);
};

export default ApplicationApproval;
