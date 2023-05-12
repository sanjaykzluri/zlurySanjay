import React, { useState, useEffect, useRef, useContext } from "react";
import EllipsisSVG from "../../assets/icons/ellipsis-v.svg";
import RoleContext from "../../services/roleContext/roleContext";

import {
	Dropdown,
	OverlayTrigger,
	Tooltip as BootstrapTooltip,
} from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { userStatus } from "../../constants/users";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserActionHistory } from "../../components/Users/redux";
import { capitalizeFirstLetter } from "../../utils/common";
import { ChangeStatus } from "../../components/Users/ChangeStatus";
import ActionLogHistory from "../../components/Users/ActionLogHistory/ActionLogHistory";
import MarkForOnboardingOffboardingModal from "../../modules/users/components/MarkForOnboardingOffboardingModal";
import {
	archiveUsers,
	removeUserFromOnboardOffboard,
	unArchiveUsers,
} from "../../services/api/users";
import { TriggerIssue } from "utils/sentry";
import ArchiveModal from "common/ArchiveModal/ArchiveModal";

const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		<img src={EllipsisSVG} width="20" />
	</a>
));
export function UserTableEllipsisDropdown({
	user,
	refresh,
	setFullRowArray,
	setFullRowmessage,
	fullRowArray,
	fullRowMessage,
	screenTagKey,
	fetchUserTabCount,
	dropdownClassname,
}) {
	const { isViewer } = useContext(RoleContext);
	const [showChangeStatusPopup, setShowChangeStatusPopup] = useState(false);
	const [statusToUpdate, setStatusToUpdate] = useState("");
	const history = useHistory();
	const dispatch = useDispatch();
	const [showUserHistory, setShowUserHistory] = useState(false);
	const [markedType, setMarkedType] = useState("");
	const [clickedOnMarkedForOnboarding, setClickedOnMarkedForOnboarding] =
		useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const clickedOnAddApp = () => {
		history.push(
			`users/${user.user_id || user.org_user_id || user._id}#applications`
		);
	};
	const changeStatus = (status) => {
		setStatusToUpdate(status);
		setShowChangeStatusPopup(true);
	};

	const fetchActionHistory = () => {
		dispatch(fetchUserActionHistory(user?.user_id || user?.org_user_id));
	};

	const actionHistory = useSelector((state) => state.userActionHistory);

	const clickedOnRemoveFromOnboard = () => {
		removeUserFromOnboardOffboard({
			user_ids: [user.org_user_id],
		}).then((res) => {
			fetchUserTabCount();
			refresh();
		});
	};

	function handleArchivingUsers() {
		setShowArchiveModal(!showArchiveModal);
	}

	function handleUnArchivingUsers() {
		try {
			unArchiveUsers([user?.user_id || user?.org_user_id]).then((res) => {
				if (res.status === "success") {
					fetchUserTabCount();
					refresh();
				} else {
					TriggerIssue(
						"Response is not as expectedwhen unarchiving user",
						res
					);
				}
			});
		} catch (error) {
			TriggerIssue(error, "Error when unarchiving the user");
		}
	}

	return (
		<>
			<Dropdown className="ml-2">
				<Dropdown.Toggle as={ellipsis} />
				<Dropdown.Menu
					className={`${dropdownClassname ? dropdownClassname : ""}`}
				>
					{!isViewer && (
						<>
							<Dropdown.Item onClick={clickedOnAddApp}>
								Add App
							</Dropdown.Item>
							{Object.keys(userStatus).map((status) => {
								if (
									typeof user?.user_status === "string" &&
									typeof userStatus[status] === "string" &&
									userStatus[status]?.toLocaleLowerCase() ===
										user?.user_status?.toLocaleLowerCase()
								)
									return null;
								return (
									<Dropdown.Item
										onClick={() => {
											changeStatus(userStatus[status]);
										}}
									>
										Mark as{" "}
										{capitalizeFirstLetter(
											userStatus[status]
										)}
									</Dropdown.Item>
								);
							})}
							<Dropdown.Divider className="mx-3 my-1" />
						</>
					)}

					<Dropdown.Item
						onClick={() => {
							setShowUserHistory(true);
							fetchActionHistory();
						}}
					>
						View Action History
					</Dropdown.Item>

					<Dropdown.Divider className="mx-3 my-1" />
					{screenTagKey !== "marked_for_onboarding" &&
					screenTagKey !== "marked_for_offboarding" ? (
						<>
							<Dropdown.Item
								onClick={() => {
									setClickedOnMarkedForOnboarding(true);
									setMarkedType("onboarding");
								}}
							>
								Mark for Onboarding
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									setClickedOnMarkedForOnboarding(true);
									setMarkedType("offboarding");
								}}
							>
								Mark for Offboarding
							</Dropdown.Item>
						</>
					) : (
						<>
							<Dropdown.Item onClick={clickedOnRemoveFromOnboard}>
								{`Remove from ${
									screenTagKey === "marked_for_onboarding"
										? "Onboarding"
										: "Offboarding"
								} `}
							</Dropdown.Item>
						</>
					)}
					{!isViewer && screenTagKey !== "marked_for_offboarding" && (
						<>
							<Dropdown.Divider className="mx-3 my-1" />
							{!(user?.user_archive || user?.archive) ? (
								<Dropdown.Item onClick={handleArchivingUsers}>
									Archive User
								</Dropdown.Item>
							) : (
								<Dropdown.Item onClick={handleUnArchivingUsers}>
									Un-archive User
								</Dropdown.Item>
							)}
						</>
					)}
				</Dropdown.Menu>
			</Dropdown>
			{showChangeStatusPopup && (
				<ChangeStatus
					newStatus={statusToUpdate}
					user={{
						...user,
						user_name: user?.name || user?.user_name,
						user_id: user?.user_id || user?.org_user_id,
					}}
					isOpen={showChangeStatusPopup}
					handleClose={() => setShowChangeStatusPopup(false)}
					isTableCell={true}
					refresh={refresh}
				/>
			)}
			{showUserHistory && (
				<ActionLogHistory
					historyType="user"
					actionHistory={actionHistory}
					show={showUserHistory}
					onHide={() => setShowUserHistory(false)}
				/>
			)}
			{clickedOnMarkedForOnboarding && (
				<MarkForOnboardingOffboardingModal
					isOpen={clickedOnMarkedForOnboarding}
					handleClose={() => setClickedOnMarkedForOnboarding(false)}
					checked={[user.user_id]}
					handleRefresh={refresh}
					markedType={markedType}
					setFullRowArray={setFullRowArray}
					fullRowArray={fullRowArray}
					setFullRowmessage={setFullRowmessage}
					fullRowMessage={fullRowMessage}
					fetchUserTabCount={fetchUserTabCount}
				/>
			)}
			{showArchiveModal && (
				<ArchiveModal
					isOpen={showArchiveModal}
					ArchiveFunc={archiveUsers}
					successResponse={() => {
						refresh();
						fetchUserTabCount();
					}}
					closeModal={() => {
						setShowArchiveModal(false);
					}}
					name={user.user_name}
					id={user.user_id || user.org_user_id}
					type="user"
				/>
			)}
		</>
	);
}
