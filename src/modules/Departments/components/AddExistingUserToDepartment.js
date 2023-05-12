import React, { useCallback, useEffect, useRef, useState } from "react";
import close from "assets/close.svg";
import { debounce } from "utils/common";
import { TriggerIssue } from "utils/sentry";
import { searchUsers } from "services/api/search";
import { Select } from "UIComponents/Select/Select";
import { getAllUsersV2, setUsersDepartment } from "services/api/users";
import { Modal, Button, Spinner } from "react-bootstrap";
import { trackActionSegment } from "modules/shared/utils/segment";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { defaultReqBody } from "modules/workflow/constants/constant";

export default function AddExistingUserToDepartment({
	isOpen,
	handleClose,
	modalProps,
}) {
	const cancelToken = useRef();
	const [usersLoading, setUsersLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		getAllUsersV2(defaultReqBody, 0, 10)
			.then((res) => {
				setUsers(res.data);
				setUsersLoading(false);
			})
			.catch((err) => {
				TriggerIssue("Error in loading users", err);
				setUsersLoading(false);
			});
	}, []);

	const onUsersSearch = useCallback(
		debounce((query) => {
			if (query) {
				setUsersLoading(true);
				searchUsers(query, cancelToken, true)
					.then((res) => {
						if (res.data || res.results || res) {
							setUsers(res.data || res.results || res);
							setUsersLoading(false);
						}
					})
					.catch((err) => {
						TriggerIssue("Error in searching users", err);
					});
			}
		}, 200),
		[usersLoading]
	);

	const onSelectUser = (users) => {
		const userIds = users.map((user) => user.user_id);
		setSelectedUsers([...userIds]);
	};

	const handleSubmit = () => {
		setSubmitting(true);
		setUsersDepartment(modalProps.deptId, selectedUsers)
			.then((res) => {
				if (res.status === "success") {
					ApiResponseNotification({
						responseType: apiResponseTypes.SUCCESS,
						title: "Users added to department successfully!",
						description:
							"All records have been updated successfully. The changes will reflect in some time.",
					});
					trackActionSegment("Added users to department", {
						userIds: selectedUsers,
					});
					handleClose();
					modalProps.handleRefresh && modalProps.handleRefresh();
				}
			})
			.catch((err) => {
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					title: "Error in adding users to department",
					errorObj: err,
					retry: handleSubmit,
				});
			});
	};

	return (
		<Modal centered show={isOpen} onHide={handleClose}>
			<Modal.Header closeButton={false}>
				<Modal.Title
					className="d-flex align-items-center"
					style={{ fontWeight: "600" }}
				>
					<div className="font-18">
						Add existing users to department
					</div>
				</Modal.Title>
				<img alt="Close" onClick={handleClose} src={close} />
			</Modal.Header>
			<hr />
			<Modal.Body
				style={{
					height: "35vh",
					overflowY: "visible",
				}}
			>
				<div style={{ padding: "12px" }}>
					<div className="font-11 warningMessage w-100 text-align-center mb-2 p-1">
						On saving, the department of the selected users will be
						overwritten.
					</div>
					<Select
						mode="multi"
						className="flex-fill black-1 w-auto grey-bg"
						options={users.filter(
							(user) => !selectedUsers.includes(user.user_id)
						)}
						isOptionsLoading={usersLoading}
						fieldNames={{
							label: "user_name",
							value: "user_id",
						}}
						search
						onSearch={(query) => {
							onUsersSearch(query);
						}}
						placeholder={"Select Users"}
						onChange={(users) => onSelectUser(users)}
						value={selectedUsers}
						renderSelectedValues={(
							value,
							props,
							removeSelectedOption
						) => (
							<>
								{Array.isArray(value) &&
									value.map((val, index) => {
										return (
											index < 5 && (
												<div
													className="z-select-selected-option d-flex align-items-center m-2"
													key={index}
												>
													{props.selectedOptionRender(
														val,
														props
													)}
													<span
														className="ml-2 remove-selected-option"
														onClick={(e) => {
															e.stopPropagation();
															removeSelectedOption(
																val
															);
														}}
													>
														<img
															width={8}
															src={close}
														/>
													</span>
												</div>
											)
										);
									})}
								{Array.isArray(value) && value.length > 5 && (
									<NumberPill
										number={`+${value.length - 5} users`}
										className="padding_4 m-1 d-flex align-items-center justify-content-center"
										borderRadius="8px"
									/>
								)}
							</>
						)}
					/>
				</div>
			</Modal.Body>
			<hr />
			<Modal.Footer className="addTransactionModal__footer">
				<button className="btn btn-link" onClick={handleClose}>
					Cancel
				</button>
				<Button
					disabled={submitting || selectedUsers.length === 0}
					onClick={handleSubmit}
				>
					Save
					{submitting && (
						<Spinner
							animation="border"
							role="status"
							variant="light"
							size="sm"
							className="ml-2"
							style={{ borderWidth: 2 }}
						/>
					)}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
