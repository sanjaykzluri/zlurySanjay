import React, { useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import arrowdropdown from "../../../../components/Transactions/Unrecognised/arrowdropdown.svg";
import rightarrow from "../../../../assets/users/rightarrow.svg";
import authorised from "../../../../assets/applications/authorised.svg";
import needsreview from "../../../../assets/applications/needsreview.svg";
import restricted from "../../../../assets/applications/restricted.svg";
import unmanaged from "../../../../assets/applications/unmanaged.svg";
import teammanaged from "../../../../assets/applications/teammanaged.svg";
import individuallymanaged from "../../../../assets/applications/individuallymanaged.svg";
import {
	bulkEditAppArchive,
	setAppsBulkAuth,
	setAppsBulkOwner,
	setAppsBulkStatus,
	setAppsBulkType,
} from "../../../../services/api/applications";
import { TriggerIssue } from "../../../../utils/sentry";
import { toast } from "react-toastify";
import { authStatus } from "../../constants/ApplicationConstants";
import DefaultNotificationCard from "../../../../common/Notification/PusherNotificationCards/DefaultNotificationCard";
import { Dots } from "../../../../common/DottedProgress/DottedProgress";
import { SearchSelect } from "../../../../common/Select/SearchSelect";
import { searchUsers } from "../../../../services/api/search";
import { APPLICATION_TYPE } from "../../../../constants";
import { capitalizeFirstLetter } from "../../../../utils/common";
import QuickReviewModal from "../../../../components/Applications/AllApps/QuickReviewModal";
import AppTagsComponent from "../overview/AppTagsComponent";
import ArchiveModal from "common/ArchiveModal/ArchiveModal";

const bulk_edit_menu = React.forwardRef(({ children, onClick }, ref) => (
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

const inner_bulk_edit_dropdown = React.forwardRef(
	({ children, onClick }, ref) => (
		<a
			className="cursor-pointer insidedropdown__allapps__table"
			ref={ref}
			onClick={(e) => onClick(e)}
		>
			{children}
		</a>
	)
);

const managed_auth_status_dropdown = React.forwardRef(
	({ children, onClick }, ref) => (
		<a
			className="cursor-pointer insidedropdown__overviewusers"
			ref={ref}
			onClick={(e) => onClick(e)}
		>
			{children}
		</a>
	)
);

export default function AppBulkEdit({
	checked,
	setChecked,
	dispatch,
	screenTagKey,
	handleRefresh,
	clickedOnQuickReview,
	setClickedOnQuickReview,
	fullRowArray,
	setFullRowArray,
	fullRowMessage,
	setFullRowMessage,
	fetchAppCount,
	checkAll,
	setCheckAll,
	checkAllExceptionData,
	setCheckAllExceptionData,
	metaData,
}) {
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const handleChangeAuthorization = () => {
		fetchAppCount();
		setChecked([]);
		handleRefresh();
		toast(
			<DefaultNotificationCard
				notification={{
					title: "Apps Bulk Edited",
					description:
						"All records have been updated successfully. The changes will reflect in some time.",
				}}
			/>
		);
		setCheckAll(false);
		setCheckAllExceptionData([]);
	};

	const bulkEditAuthorizationStatus = (auth_status) => {
		let ids = checkAll ? checkAllExceptionData : checked;
		setAppsBulkAuth(auth_status, ids, metaData.filter_by, checkAll)
			.then((res) => {
				if (res.status === "success") {
					handleChangeAuthorization();
				}
			})
			.catch((err) => {
				TriggerIssue(
					"Error while changing the authorization status",
					err
				);
			});
	};

	const updateAppOwner = (owner) => {
		let ids = checkAll ? checkAllExceptionData : checked;
		setAppsBulkOwner(owner._id, ids, metaData.filter_by, checkAll)
			.then((res) => {
				if (res.status === "success") {
					handleChangeAuthorization();
				}
			})
			.catch((err) => {
				TriggerIssue("Error updating app owner:", err);
			});
	};

	const handleOnChange = (key, value) => {
		let ids = checkAll ? checkAllExceptionData : checked;
		if (key === "type") {
			setAppsBulkType(value, ids, metaData.filter_by, checkAll)
				.then((res) => {
					if (res.status === "success") {
						handleChangeAuthorization();
					}
				})
				.catch((err) => {
					TriggerIssue("Error updating app type", err);
				});
		}
	};

	return (
		<>
			{screenTagKey === "needs_review" && (
				<Button
					size="sm"
					onClick={() => setClickedOnQuickReview(true)}
					style={{ marginRight: "20px" }}
				>
					Quick Review
				</Button>
			)}
			<Dropdown>
				<Dropdown.Toggle as={bulk_edit_menu}>
					<div className="grey">Bulk Edit</div>
					<img src={arrowdropdown} style={{ marginLeft: "8px" }} />
				</Dropdown.Toggle>
				<Dropdown.Menu className="p-0">
					<Dropdown>
						<Dropdown.Toggle as={inner_bulk_edit_dropdown}>
							<div className="grey">Change Authorization</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position">
							<Dropdown>
								<Dropdown.Toggle
									as={managed_auth_status_dropdown}
								>
									<div className="d-flex flex-row align-items-center">
										<img src={authorised} width={15.33} />
										<div className="overview__dropdownbutton__d2 bold-normal">
											Managed
										</div>
										<img
											src={rightarrow}
											className="ml-4"
										/>
									</div>
								</Dropdown.Toggle>
								<Dropdown.Menu className="managed_auth_status_dropdown_menu">
									<Dropdown.Item
										onClick={() =>
											bulkEditAuthorizationStatus(
												authStatus.CENTRALLY_MANAGED
											)
										}
									>
										<div className="d-flex flex-row align-items-center">
											<img
												src={authorised}
												width={15.33}
											/>
											<div className="overview__dropdownbutton__d2">
												Centrally Managed
											</div>
										</div>
									</Dropdown.Item>
									<Dropdown.Item
										onClick={() =>
											bulkEditAuthorizationStatus(
												authStatus.TEAM_MANAGED
											)
										}
									>
										<div className="d-flex flex-row align-items-center">
											<img
												src={teammanaged}
												width={15.33}
											/>
											<div className="overview__dropdownbutton__d2">
												Team Managed
											</div>
										</div>
									</Dropdown.Item>
									<Dropdown.Item
										onClick={() =>
											bulkEditAuthorizationStatus(
												authStatus.INDIVIDUALLY_MANAGED
											)
										}
									>
										<div className="d-flex flex-row align-items-center">
											<img
												src={individuallymanaged}
												width={15.33}
											/>
											<div className="overview__dropdownbutton__d2">
												Individually Managed
											</div>
										</div>
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
							<Dropdown.Item
								onClick={() =>
									bulkEditAuthorizationStatus(
										authStatus.NEEDSREVIEW
									)
								}
							>
								<div className="d-flex flex-row align-items-center">
									<img src={needsreview} width={15.33} />
									<div className="overview__dropdownbutton__d2">
										Needs Review
									</div>
								</div>
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() =>
									bulkEditAuthorizationStatus(
										authStatus.UNMANAGED
									)
								}
							>
								<div className="d-flex flex-row align-items-center">
									<img src={unmanaged} width={15.33} />
									<div className="overview__dropdownbutton__d2">
										Unmanaged
									</div>
								</div>
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() =>
									bulkEditAuthorizationStatus(
										authStatus.RESTRICTED
									)
								}
							>
								<div className="d-flex flex-row align-items-center">
									<img src={restricted} width={15.33} />
									<div className="overview__dropdownbutton__d2">
										Restricted
									</div>
								</div>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					<Dropdown>
						<Dropdown.Toggle as={inner_bulk_edit_dropdown}>
							<div className="grey">Change Status</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
							<Dropdown.Item
								onClick={() => {
									let ids = checkAll
										? checkAllExceptionData
										: checked;
									setAppsBulkStatus(
										"active",
										ids,
										metaData.filter_by,
										checkAll
									).then((res) => {
										if (res.status === "success") {
											handleChangeAuthorization();
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
									setAppsBulkStatus(
										"inactive",
										ids,
										metaData.filter_by,
										checkAll
									).then((res) => {
										if (res.status === "success") {
											handleChangeAuthorization();
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
						<Dropdown.Toggle as={inner_bulk_edit_dropdown}>
							<div className="grey">Add Tags</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
							<AppTagsComponent
								isBulkEdit={true}
								onAppChange={handleChangeAuthorization}
								metaData={metaData}
								checkAll={checkAll}
								ids={checkAll ? checkAllExceptionData : checked}
							></AppTagsComponent>
						</Dropdown.Menu>
					</Dropdown>
					<Dropdown>
						<Dropdown.Toggle as={inner_bulk_edit_dropdown}>
							<div className="grey">Archive/Unarchive</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
							<Dropdown.Item
								onClick={() => {
									let ids = checkAll
										? checkAllExceptionData
										: checked;
									bulkEditAppArchive(
										ids,
										true,
										metaData.filter_by,
										checkAll
									).then((res) => {
										if (res.status === "success") {
											handleChangeAuthorization();
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
									bulkEditAppArchive(
										ids,
										false,
										metaData.filter_by,
										checkAll
									).then((res) => {
										if (res.status === "success") {
											handleChangeAuthorization();
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
						<Dropdown.Toggle as={inner_bulk_edit_dropdown}>
							<div className="grey">Change Owner</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
							<div className="background-white-on-hover dropdown-item p-0">
								<SearchSelect
									show={true}
									fetchFn={searchUsers}
									onSelect={updateAppOwner}
									keyFields={{
										name: "user_name",
										image: "profile_img",
										email: "user_email",
									}}
									allowFewSpecialCharacters={true}
								/>
							</div>
						</Dropdown.Menu>
					</Dropdown>
					<Dropdown>
						<Dropdown.Toggle as={inner_bulk_edit_dropdown}>
							<div className="grey">Change Type</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
							{Object.keys(APPLICATION_TYPE).map((key, i) => (
								<Dropdown.Item
									onClick={() => {
										handleOnChange(
											"type",
											APPLICATION_TYPE[key]
										);
									}}
								>
									{capitalizeFirstLetter(
										APPLICATION_TYPE[key]
									)}
								</Dropdown.Item>
							))}
						</Dropdown.Menu>
					</Dropdown>
				</Dropdown.Menu>
			</Dropdown>
			{clickedOnQuickReview && (
				<QuickReviewModal
					isOpen={clickedOnQuickReview}
					handleClose={() => setClickedOnQuickReview(false)}
					checked={checked}
					checkAll={checkAll}
					metaData={metaData}
					handleRefresh={handleRefresh}
					setFullRowArray={setFullRowArray}
					fullRowArray={fullRowArray}
					setFullRowMessage={setFullRowMessage}
					fullRowMessage={fullRowMessage}
					setChecked={setChecked}
					setCheckAll={setCheckAll}
					fetchAppCount={fetchAppCount}
					setShowArchiveModal={setShowArchiveModal}
					checkAllExceptionData={checkAllExceptionData}
				/>
			)}
			{showArchiveModal && (
				<ArchiveModal
					isOpen={showArchiveModal}
					ArchiveFunc={(ids, status) =>
						bulkEditAppArchive(
							checkAll ? checkAllExceptionData : checked,
							true,
							metaData.filter_by,
							checkAll
						)
					}
					successResponse={() => handleChangeAuthorization()}
					closeModal={() => {
						setShowArchiveModal(false);
					}}
					type="application"
					name="selected applications"
					subtext="You will no longer be able to track these applications on archiving."
				/>
			)}
		</>
	);
}
