import React from "react";
import moment from "moment";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { searchOnboardingOffboardingUsersV2 } from "../../services/api/search";
import { ChangeDesignation } from "./Overview/ChangeDesignation";
import { ChangeStatus } from "./Overview/ChangeStatus";
import {
	getOnboardingOffboardingUserPropertiesList,
	getOnboardingOffboardingUsersV2,
} from "../../services/api/users";
import _ from "underscore";
import UserAppMetaInfoCard from "../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import UserInfoTableComponent from "../../common/UserInfoTableComponent";
import { UserTableEllipsisDropdown } from "../../common/UserTableEllipsis/UserTableEllipsisDropdown";
import { WORFKFLOW_TYPE } from "../../modules/workflow/constants/constant";
import rightarrow from "../../components/Transactions/Recognised/rightarrow.svg";
import onboarduser from "assets/users/onboarduser.svg";
import offboarduser from "assets/users/offboarduser.svg";
import InfiniteTableContainer from "modules/v2InfiniteTable/InfiniteTableContainer";

export function UsersOnboardingOffboarding({
	screenTagKey,
	fetchUserTabCount,
}) {
	const history = useHistory();

	const statusFormatter = (cell, row) => {
		return (
			<ChangeStatus
				status={row?.user_archive || row?.archive ? "archived" : cell}
				idFromTable={row.user_id}
				disableEdit={row?.user_archive}
			/>
		);
	};

	const designationFormatter = (cell, row) => {
		return (
			<div
				className="designation__column__cell"
				style={{ position: "relative" }}
			>
				<ChangeDesignation
					user={{ ...row, user_designation: row?.designation }}
					status={cell}
					idFromTable={row.org_user_id}
					marginRequired={false}
				/>
			</div>
		);
	};

	const toWorkflow = (user, type) => {
		history.push({
			pathname: "/creating/workflow",
			state: {
				users: [
					{
						...user,
						user_id: user.org_user_id,
						user_name: user.name,
					},
				],
				type,
			},
		});
	};

	const getColumnsMapper = (handleRefresh) => {
		const columnsMapper = {
			user: {
				dataField: "onboardingoffboardingusers.name",
				text: "User",
				sortKey: "onboardingoffboardingusers.name",
				formatter: (data, row, rowindex) => {
					return (
						<UserInfoTableComponent
							user_account_type={row.account_type}
							profile_img={row.profile_img}
							user_profile={row.user_profile}
							user_email={row.email}
							user_status={row.user_status}
							row={row}
							user_id={row.org_user_id}
							user_name={row.name}
							is_external_user={row.is_external}
							tooltipClassName={"userMetaInfoCard"}
							customTooltip={
								<UserAppMetaInfoCard
									title={row?.name}
									description={row?.email}
									isActive={row.status === "active"}
									isUser={true}
									row={row}
									user_status={row.status}
									user_account_type={row.account_type}
								/>
							}
						></UserInfoTableComponent>
					);
				},
			},
			user_email: {
				dataField: "onboardingoffboardingusers.email",
				text: "Email",
				sortKey: "onboardingoffboardingusers.email",
				formatter: (row, data) => (
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{data.email}</Tooltip>}
					>
						<div className="truncate_10vw">{data.email}</div>
					</OverlayTrigger>
				),
			},
			user_designation: {
				dataField: "user_designation",
				text: "Designation",
				sortKey: "onboardingoffboardingusers.designation",
				formatter: designationFormatter,
			},

			user_app_count: {
				dataField: "user_app_count",
				text: "Apps Used",
				sortKey: "user_app_count",
				formatter: (row, data) => (
					<Link
						to={`/users/${data.user_id}#applications`}
						className="table-link"
					>
						{row}
					</Link>
				),
			},
			// team: {
			// 	dataField: "user_department_name",
			// 	text: "Department",
			// 	sortKey: "user_department_name",
			// 	formatter: (row, dataField) => (
			// 		<div className="d-flex">
			// 			<OverlayTrigger
			// 				placement="top"
			// 				overlay={
			// 					<Tooltip>{dataField?.user_department_name}</Tooltip>
			// 				}
			// 			>
			// 				<Link
			// 					to={`/departments/${dataField?.user_department_id}#overviewdep`}
			// 					className="table-link"
			// 				>
			// 					<div className="truncate_name">
			// 						{dataField?.user_department_name}
			// 					</div>
			// 				</Link>
			// 			</OverlayTrigger>
			// 		</div>
			// 	),
			// },
			user_status: {
				dataField: "user_status",
				text: "Status",
				sortKey: "user_status",
				formatter: statusFormatter,
			},
			user_account_type: {
				dataField: "user_account_type",
				text: "Account type",
				sortKey: "user_account_type",
				formatter: (dataField) => (
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{dataField}</Tooltip>}
					>
						<div className="truncate_10vw text-capitalize">
							{dataField}
						</div>
					</OverlayTrigger>
				),
			},
			ellipsis: {
				dataField: "",
				text: "",
				formatter: (row, data) => {
					return (
						<UserTableEllipsisDropdown
							user={data}
							refresh={handleRefresh}
							screenTagKey={screenTagKey}
							fetchUserTabCount={fetchUserTabCount}
						/>
					);
				},
			},
			assigned_to: {
				dataField: "assigned_to",
				text: "Assigned To",
				sortKey: "assigned_to",
				formatter: (dataField, row) => {
					return (
						<UserInfoTableComponent
							user_account_type={dataField.user_account_type}
							profile_img={dataField.profile_img}
							user_profile={dataField.user_profile}
							row={row}
							user_id={dataField._id}
							user_name={dataField.name}
						></UserInfoTableComponent>
					);
				},
			},
			marked_by: {
				dataField: "marked_by",
				text: "Marked By",
				sortKey: "marked_by",
				formatter: (dataField, row) => {
					return (
						<UserInfoTableComponent
							user_account_type={dataField.user_account_type}
							profile_img={dataField.profile_img}
							user_profile={dataField.user_profile}
							row={row}
							user_id={dataField._id}
							user_name={dataField.name}
						></UserInfoTableComponent>
					);
				},
			},
			whats_next: {
				dataField: "",
				text: "What's next",
				formatter: (data, row) => {
					return (
						<div
							className="whats_next_box d-flex align-items-center cursor-pointer justify-content-evenly"
							onClick={() =>
								toWorkflow(
									row,
									screenTagKey === "marked_for_onboarding"
										? WORFKFLOW_TYPE.ONBOARDING
										: WORFKFLOW_TYPE.OFFBOARDING
								)
							}
						>
							<img
								src={
									screenTagKey === "marked_for_onboarding"
										? onboarduser
										: offboarduser
								}
							/>
							<div className="d-flex flex-column align-items-center justify-content-center font-13 bold-600 primary-color">
								{screenTagKey === "marked_for_onboarding"
									? "Onboard User"
									: "Offboard User"}
							</div>
							<img src={rightarrow} className="ml-2" />
						</div>
					);
				},
			},
		};

		if (screenTagKey === "marked_for_onboarding") {
			columnsMapper.onboarding_date = {
				dataField: "onboarding_date",
				sortKey: "date",
				text: "Onboard Date",
				formatter: (row, data) => {
					if (data && data.date) {
						return (
							<>
								{data.date
									? moment(data.date).format("DD MMM YYYY")
									: "-"}
							</>
						);
					}
				},
			};
		} else {
			columnsMapper.offboarding_date = {
				dataField: "offboarding_date",
				sortKey: "date",
				text: "OFFBOARD DATE",
				formatter: (row, data) => {
					if (data && data.date) {
						return (
							<>
								{data.date
									? moment(data.date).format("DD MMM YYYY")
									: "-"}
							</>
						);
					}
				},
			};
		}

		return columnsMapper;
	};

	return (
		<InfiniteTableContainer
			columnsMapper={getColumnsMapper}
			v2TableEntity={screenTagKey}
			v2SearchFieldId="onboardingoffboardingusers.name"
			v2SearchFieldName="User Name"
			getAPI={getOnboardingOffboardingUsersV2}
			searchAPI={searchOnboardingOffboardingUsersV2}
			propertyListAPI={getOnboardingOffboardingUserPropertiesList}
			keyField="_id"
			chipText="Users"
			key={screenTagKey}
			screenType={
				screenTagKey === "marked_for_onboarding"
					? "onboarding"
					: "offboarding"
			}
		/>
	);
}
