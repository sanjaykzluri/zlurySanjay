import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { toast } from "react-toastify";
import arrowdropdown from "../../../assets/arrowdropdown.svg";
import rightarrow from "../../../assets/users/rightarrow.svg";
import { clearAllV2DataCache } from "../../v2InfiniteTable/redux/v2infinite-action";
import {
	setUserBulkAccountType,
	setUserBulkArchive,
	setUserBulkStatus,
	setUsersDepartment,
} from "../../../services/api/users";
import DefaultNotificationCard from "../../../common/Notification/PusherNotificationCards/DefaultNotificationCard";
import { Dots } from "../../../common/DottedProgress/DottedProgress";
import { SearchSelect } from "../../../common/Select/SearchSelect";
import { searchAllDepartments } from "../../../services/api/search";
import { TriggerIssue } from "../../../utils/sentry";
import { userType } from "../../../constants/users";
import { capitalizeFirstLetter } from "../../../utils/common";
import { trackActionSegment } from "modules/shared/utils/segment";
import MarkForOnboardingOffboardingModal from "./MarkForOnboardingOffboardingModal";
import { markForOnboardingOffboardingType } from "../constants/UserContants";

const bulkEditMenu = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer autho__dd__cont mt-auto mb-auto text-decoration-none"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
		style={{ width: "100px" }}
	>
		{children}
	</a>
));
const innerBulkEditDropdown = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer insidedropdown__users__table"
		ref={ref}
		onClick={(e) => onClick(e)}
	>
		{children}
	</a>
));

export default function UsersBulkEditComponents({
	checked,
	setChecked,
	dispatch,
	handleRefresh,
	fetchUserTabCount,
	checkAll,
	setCheckAll,
	checkAllExceptionData,
	setCheckAllExceptionData,
	metaData,
	disableChangeDeptButton= false
}) {
	const [markedType, setMarkedType] = useState();
	const handleTableRefreshAndNotification = () => {
		fetchUserTabCount();
		setChecked([]);
		handleRefresh();
		toast(
			<DefaultNotificationCard
				notification={{
					title: "Users Bulk Edited",
					description:
						"All records have been updated successfully. The changes will reflect in some time.",
				}}
			/>
		);
		setCheckAll(false);
		setCheckAllExceptionData([]);
	};

	const updateTeamColumn = (team) => {
		let ids = checkAll ? checkAllExceptionData : checked;
		setUsersDepartment(
			team.department_id,
			ids,
			metaData.filter_by,
			checkAll,
			metaData.is_search
		)
			.then((res) => {
				if (res.status === "success") {
					handleTableRefreshAndNotification();
					trackActionSegment("Changed Team of users", {
						userIds: checked,
					});
				}
			})
			.catch((err) => {
				TriggerIssue("Error updating department head", err);
			});
	};

	return (
		<>
			<Dropdown>
				<Dropdown.Toggle as={bulkEditMenu}>
					<div className="grey">Bulk Edit</div>
					<img src={arrowdropdown} style={{ marginLeft: "8px" }} />
				</Dropdown.Toggle>
				<Dropdown.Menu className="p-0">
					<Dropdown>
						<Dropdown.Toggle as={innerBulkEditDropdown}>
							<div className="grey">Change Status</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="marked_for_onboarding_offboarding_inner_dropdown user-status-dropdown-menu-postion p-0">
							<Dropdown.Item
								onClick={() => {
									let ids = checkAll
										? checkAllExceptionData
										: checked;
									setUserBulkStatus(
										"active",
										ids,
										metaData.filter_by,
										checkAll,
										metaData.is_search
									).then((res) => {
										if (res.status === "success") {
											handleTableRefreshAndNotification();
											trackActionSegment(
												"Changed status of users to active",
												{
													userIds: checked,
												}
											);
										}
									});
								}}
							>
								<div className="d-flex flex-row align-items-center">
									<Dots color="#40E395" />
									<div className="ml-1">Active</div>
								</div>
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									let ids = checkAll
										? checkAllExceptionData
										: checked;
									setUserBulkStatus(
										"inactive",
										ids,
										metaData.filter_by,
										checkAll,
										metaData.is_search
									).then((res) => {
										if (res.status === "success") {
											handleTableRefreshAndNotification();
											trackActionSegment(
												"Changed status of users to inactive",
												{
													userIds: checked,
												}
											);
										}
									});
								}}
							>
								<div className="d-flex flex-row align-items-center">
									<Dots color="#717171" />
									<div className="ml-1">Inactive</div>
								</div>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					<Dropdown>
						<Dropdown.Toggle as={innerBulkEditDropdown}>
							<div className="grey">Archive/Unarchive</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="marked_for_onboarding_offboarding_inner_dropdown user-status-dropdown-menu-postion p-0">
							<Dropdown.Item
								onClick={() => {
									let ids = checkAll
										? checkAllExceptionData
										: checked;
									setUserBulkArchive(
										true,
										ids,
										metaData.filter_by,
										checkAll,
										metaData.is_search
									).then((res) => {
										if (res.status === "success") {
											handleTableRefreshAndNotification();
											trackActionSegment(
												"Archived users",
												{
													userIds: checked,
												}
											);
										}
									});
								}}
							>
								<div className="d-flex flex-row align-items-center">
									Archive
								</div>
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									let ids = checkAll
										? checkAllExceptionData
										: checked;
									setUserBulkArchive(
										false,
										ids,
										metaData.filter_by,
										checkAll,
										metaData.is_search
									).then((res) => {
										if (res.status === "success") {
											handleTableRefreshAndNotification();
											trackActionSegment(
												"Unarchived users",
												{
													userIds: checked,
												}
											);
										}
									});
								}}
							>
								<div className="d-flex flex-row align-items-center">
									Unarchive
								</div>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					<Dropdown>
						<Dropdown.Toggle
							disabled={disableChangeDeptButton}
							as={innerBulkEditDropdown}
						>
							<div
								className={
									disableChangeDeptButton ? "" : "grey"
								}
								style={{
									color: disableChangeDeptButton
										? "lightgray"
										: "",
									cursor: disableChangeDeptButton ? "default": "pointer"
								}}
							>
								Change Department
							</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						{!disableChangeDeptButton && (
							<Dropdown.Menu
								disabled={disableChangeDeptButton}
								className="marked_for_onboarding_offboarding_inner_dropdown user-status-dropdown-menu-postion p-0"
							>
								<div className="background-white-on-hover dropdown-item p-0">
									<SearchSelect
										show={true}
										fetchFn={searchAllDepartments}
										onSelect={updateTeamColumn}
										keyFields={{
											id: "department_id",
											name: "department_name_path",
											image: "department_image",
										}}
										showTooltipLength={15}
										allowFewSpecialCharacters={true}
									/>
								</div>
							</Dropdown.Menu>
						)}
					</Dropdown>
					<Dropdown>
						<Dropdown.Toggle as={innerBulkEditDropdown}>
							<div className="grey">Change User Type</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="marked_for_onboarding_offboarding_inner_dropdown user-status-dropdown-menu-postion p-0">
							{Object.keys(userType).map((key, i) => (
								<Dropdown.Item
									onClick={() => {
										let ids = checkAll
											? checkAllExceptionData
											: checked;
										setUserBulkAccountType(
											userType[key],
											ids,
											metaData.filter_by,
											checkAll,
											metaData.is_search
										).then((res) => {
											if (res.status === "success") {
												handleTableRefreshAndNotification();
												trackActionSegment(
													"Changed user-type of users",
													{
														userIds: checked,
													}
												);
											}
										});
									}}
								>
									{capitalizeFirstLetter(userType[key])}
								</Dropdown.Item>
							))}
							<Dropdown.Item className="p-0"></Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					<Dropdown>
						<Dropdown.Toggle as={innerBulkEditDropdown}>
							<div className="grey">Onboarding/Offboarding</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="marked_for_onboarding_offboarding_inner_dropdown user-status-dropdown-menu-postion p-0">
							<Dropdown.Item
								onClick={() =>
									setMarkedType(
										markForOnboardingOffboardingType.ONBOARDING
									)
								}
							>
								Mark for Onboarding
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() =>
									setMarkedType(
										markForOnboardingOffboardingType.OFFBOARDING
									)
								}
							>
								Mark for Offboarding
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</Dropdown.Menu>
			</Dropdown>
			{!!markedType && (
				<MarkForOnboardingOffboardingModal
					isOpen={!!markedType}
					handleClose={() => setMarkedType()}
					checked={checked}
					handleRefresh={() => {
						dispatch(clearAllV2DataCache("marked_for_onboarding"));
						dispatch(clearAllV2DataCache("marked_for_offboarding"));
						handleTableRefreshAndNotification();
					}}
					markedType={markedType}
					checkAll={checkAll}
					checkAllExceptionData={checkAllExceptionData}
					filter_by={metaData.filter_by}
					totalUserCount={metaData.total}
					isUsersTable={true}
				/>
			)}
		</>
	);
}
