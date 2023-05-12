import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { AsyncTypeahead } from "../../../common/Typeahead/AsyncTypeahead";
import { searchUsers } from "../../../services/api/search";
import { NameBadge } from "../../../common/NameBadge";
import { useDispatch, useSelector } from "react-redux";
import ExclamationCircleSVG from "../../../assets/icons/exclamation-circle.svg";
import CheckCircleSVG from "../../../assets/icons/check-circle.svg";
import MergeSVG from "../../../assets/icons/merge.svg";
import MergeConfirmation from "./MergeConfirmation";
import { unescape } from "../../../utils/common";
import { mergeUsers } from "../../../services/api/users";
import { TriggerIssue } from "../../../utils/sentry";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";

export function MergeUsers(props) {
	const dispatch = useDispatch();
	const [targetUser, setTargetUser] = useState();
	const [submitting, setSubmitting] = useState(false);
	const [isMergeConfirmed, setIsMergeConfirmed] = useState(false);
	const [wantToMerge, setWantToMerge] = useState(false);
	const [showWarningMessage, setShowWarningMessage] = useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		if (props.targetUser) {
			setTargetUser(props.targetUser);
		}
	}, [props]);

	useEffect(() => {
		!targetUser && setSubmitting(false);
		if (targetUser?._id === props.user.user_id) {
			setShowWarningMessage(true);
		} else {
			setShowWarningMessage(false);
		}
	}, [targetUser]);

	const handleUserMapping = () => {
		let targetUserId = targetUser.user_id || targetUser._id;
		setSubmitting(true);

		mergeUsers(props.user.user_id, targetUserId)
			.then((res) => {
				if (res.error) {
					setSubmitting(false);
					TriggerIssue("Error while merging users:", res.error);
					return;
				}
				setIsMergeConfirmed(true);
				setSubmitting(false);
				dispatch(clearAllV2DataCache("users"));
			})
			.catch((err) => {
				TriggerIssue("Error while merging users:", err);

				setSubmitting(false);
			});
	};
	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Users", "User-Overview; Merge Users", {
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}, []);
	return (
		<Modal
			show={props.show}
			onHide={isMergeConfirmed ? props.onMergeComplete : props.onHide}
			centered
			dialogClassName="merge-app-modal--width"
		>
			{!wantToMerge && !isMergeConfirmed ? (
				<>
					<Modal.Header closeButton className="border-bottom">
						<Modal.Title className="w-100 text-center">
							Merge User
						</Modal.Title>
					</Modal.Header>
					<hr></hr>
					<Modal.Body className="merge-app-modal-body">
						<div className="px-5 py-4">
							{props.targetUser && (
								<div className="alert-message d-flex align-items-start p-2">
									<img
										src={ExclamationCircleSVG}
										className="mr-2"
									/>
									<span>
										You cannot map to{" "}
										{props.targetUser?.user_name} because it
										already exists in your system. Do you
										want to Merge the Users instead?
									</span>
								</div>
							)}
							<div className="d-flex my-3">
								<div style={{ width: "45%" }}>
									<label>Source User</label>
									<div
										className="d-flex bg-white border rounded-lg align-items-center"
										style={{ padding: "8px 14px" }}
									>
										{props.user.profile_image ? (
											<img
												src={unescape(
													props.user.profile_image
												)}
												width="24"
												className="mr-2"
											/>
										) : (
											<NameBadge
												name={props.user.user_name}
												width={24}
												variant="round"
												className="mr-2"
											/>
										)}
										<span className="text-truncate">
											{props.user.user_name}
										</span>
									</div>
								</div>
								<div
									className="align-self-center mx-4 mt-2"
									style={{ flexShrink: 0 }}
								>
									<img src={MergeSVG} width="18" />
								</div>
								<div style={{ width: "45%" }}>
									<div className="target-app-input">
										<AsyncTypeahead
											label="Target User"
											placeholder="User"
											fetchFn={searchUsers}
											defaultValue={
												props.targetUser?.name || ""
											}
											onSelect={(selection) =>
												setTargetUser(selection)
											}
											keyFields={{
												id: "_id",
												image: "profile_img",
												value: "user_name",
												email: "user_email",
											}}
											allowFewSpecialCharacters={true}
										/>
									</div>
								</div>
							</div>
							{showWarningMessage ? (
								<div className="d-flex mt-4 flex-column align-items-center">
									<div className="alert-message d-flex align-items-start p-2">
										<img
											src={ExclamationCircleSVG}
											className="mr-2"
										/>
										<span>
											You cannot select same user to merge
										</span>
									</div>
								</div>
							) : null}
						</div>
					</Modal.Body>
					<hr></hr>
					<Modal.Footer className="border-top">
						<Button
							variant="link"
							onClick={
								isMergeConfirmed
									? props.onMergeComplete
									: props.onHide
							}
						>
							Close
						</Button>
						<Button
							className="z-button-primary px-4"
							size="lg"
							disabled={
								!(
									targetUser &&
									!(targetUser?._id === props.user.user_id)
								)
							}
							onClick={() => setWantToMerge(true)}
						>
							Merge User
							{submitting && (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									className="ml-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							)}
						</Button>
					</Modal.Footer>
				</>
			) : wantToMerge && !isMergeConfirmed ? (
				<MergeConfirmation
					show={props.show}
					onHide={props.onHide}
					source={props.user}
					targetSource={targetUser}
					handleMapping={handleUserMapping}
					mergingStatus={submitting}
					isUser={true}
				/>
			) : (
				<>
					<Modal.Header
						onClick={props.onMergeComplete}
						closeButton
						className="pb-2"
					/>
					<Modal.Body className="border-bottom">
						<div className="d-flex flex-column align-items-center pb-5 px-3">
							<img src={CheckCircleSVG} width="45" />
							<span
								className="bold-600"
								style={{
									fontSize: 18,
									lineHeight: "28px",
								}}
								className="mt-4 px-3 text-center"
							>
								{props.user.user_name} has been merged with{" "}
								{targetUser?.user_name || targetUser?.name}
							</span>
							<Button
								className="z-btn-primary mt-4 px-4"
								size="lg"
								onClick={props.onMergeComplete}
							>
								Close
							</Button>
						</div>
					</Modal.Body>
				</>
			)}
		</Modal>
	);
}
