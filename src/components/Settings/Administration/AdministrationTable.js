import React, { useContext, useState, useEffect } from "react";
import { Button } from "../../../UIComponents/Button/Button";
import { Table } from "../../../common";
import PropTypes, { string } from "prop-types";
import "../../../App.css";
import cellEditFactory, { Type } from "react-bootstrap-table2-editor";
import ContentLoader from "react-content-loader";
import "./Administration";
import { useDispatch, useSelector } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import RoleContext from "../../../services/roleContext/roleContext";
import { CustomDropdown } from "../../../UIComponents/Dropdown/Dropdown";
import ConfirmRemoveUser from "./ConfirmRemoveUser";
import {
	addMember,
	removeMember,
	resendRoleInvitation,
} from "../../../services/api/settings";
import { fetchAllAdmins } from "../../../actions/settings-action";
import { TriggerIssue } from "../../../utils/sentry";
import greenTick from "../../../assets/green_tick.svg";
import { timeSince } from "../../../utils/DateUtility";
import group from "../../../assets/users/group.svg";
import service from "../../../assets/users/service.svg";
import { userType } from "../../../constants/users";
import UserInfoTableComponent from "../../../common/UserInfoTableComponent";
import UserAppMetaInfoCard from "../../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import downArrow from "assets/down_arrow.svg";

const loadingData = [
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
];

const loaderColumns = [
	{
		dataField: "name",
		text: "name",
		formatter: () => (
			<div className="d-flex flex-row align-items-center">
				<ContentLoader
					style={{ marginRight: 8 }}
					width={26}
					height={26}
				>
					<circle cx="13" cy="13" r="13" fill="#EBEBEB" />
				</ContentLoader>
				<ContentLoader width={91} height={10}>
					<rect width="91" height="10" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "email",
		text: "email",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "role",
		text: "role",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
];
export function ResendInvite(props) {
	const [inviteSent, setInviteSent] = useState(false);

	return (
		<>
			{!inviteSent ? (
				<Button
					onClick={() => {
						setInviteSent(true);
						resendRoleInvitation(props.email).then((res) => {
							setTimeout(() => {
								setInviteSent(false);
							}, 30000);
						});
					}}
					type="link"
					className="text-decoration-none"
					style={{ fontSize: 14, marginLeft: "-35px" }}
				>
					Resend Invitation
				</Button>
			) : (
				<div
					className="green"
					style={{ fontSize: 14, marginLeft: "10px" }}
				>
					<img
						src={greenTick}
						wdith={18}
						height={18}
						className="mr-1 pb-1"
					/>
					Sent
				</div>
			)}
		</>
	);
}
export function AdministrationTable(props) {
	const [selectedIds, setSelectedIds] = useState([]);
	const { userRole } = useContext(RoleContext);
	const [selectedMember, setSelectedMember] = useState();
	const [showConfirmationScreen, setShowConfirmationScreen] = useState(false);
	const dispatch = useDispatch();
	const [inviteSent, setInviteSent] = useState(false);

	const USER_ROLES = [
		{
			label: "Admin",
			value: "admin",
			handleCallToAction: (member) =>
				handleUpdateUserRole(member, "admin"),
			description: "Admins can manage day to day administrative tasks.",
			showBorderTop: false,
		},
		{
			label: "Viewer",
			value: "viewer",
			handleCallToAction: (member) =>
				handleUpdateUserRole(member, "viewer"),
			description: "Viewers have readOnly access",
			showBorderTop: false,
		},
		{
			label: "IT Admin",
			value: "it admin",
			handleCallToAction: (member) =>
				handleUpdateUserRole(member, "it admin"),
			description: "Has access to all modules except transactions",
			showBorderTop: false,
		},
		{
			label: "Finance Admin",
			value: "finance admin",
			handleCallToAction: (member) =>
				handleUpdateUserRole(member, "finance admin"),
			description:
				"Has access to only overview, transaction & integration modules",
			showBorderTop: false,
		},
		{
			label: "Procurement Admin",
			value: "procurement admin",
			handleCallToAction: (member) =>
				handleUpdateUserRole(member, "procurement admin"),
			description:
				"Has access to only overview, transaction & license modules",
			showBorderTop: false,
		},
		{
			label: "Integration Admin",
			value: "integration admin",
			handleCallToAction: (member) =>
				handleUpdateUserRole(member, "integration admin"),
			description: "Has access to only integration & workflow modules",
			showBorderTop: false,
		},
		{
			label: "Security Admin",
			value: "security admin",
			handleCallToAction: (member) =>
				handleUpdateUserRole(member, "security admin"),
			description:
				"Has access to only security, reports & application overview modules",
			showBorderTop: false,
		},
		{
			label: "Remove User",
			handleCallToAction: (member) => handleRemoveUser(member),
			description: "",
			labelColor: "#FF6767",
			showBorderTop: true,
		},
	];
	if (userRole === "owner") {
		USER_ROLES.unshift({
			label: "Owner",
			value: "owner",
			handleCallToAction: (member) =>
				handleUpdateUserRole(member, "owner"),
			description:
				"Owners have all the privileges and manage the subscription & billing.",
		});
	}

	const userRoleDropdown = (row) => (
		<Dropdown
			options={USER_ROLES}
			optionFormatter={(role) => (
				<div
					className="d-flex flex-column"
					style={{ padding: "4px 0px" }}
				>
					<div
						className={`font-12 bold-600 ${
							role.label === "Remove User" ? "red" : ""
						}`}
					>
						{role.label}
					</div>
					<div>{role.description}</div>
				</div>
			)}
			onOptionSelect={(option) => option.handleCallToAction(row)}
			toggler={
				<div className="d-flex text-capitalize">
					<div>{row.role === "it admin" ? "IT Admin" : row.role}</div>
					<img src={downArrow} className="ml-1" />
				</div>
			}
			optionStyle={{ width: "250px" }}
			menuStyle={{ maxHeight: "500px " }}
		/>
	);

	function handleRemoveUser(member) {
		setSelectedMember(member);
		setShowConfirmationScreen(true);
	}

	function handleUpdateUserRole(member, newRole) {
		if (member.role !== newRole) {
			try {
				addMember({
					user_id: member._id,
					role: newRole,
				}).then((res) => {
					if (res.status !== "success") {
						TriggerIssue(
							"ERROR in updating user_role of member",
							res
						);
					} else {
						dispatch(fetchAllAdmins());
					}
				});
			} catch (error) {
				TriggerIssue("ERROR in updating user_role of member", error);
			}
		}
	}

	function dateFormatter(cell) {
		if (cell) {
			if (
				Math.ceil(Math.abs(new Date() - new Date(cell)) / 1000) <=
				6 * 24 * 60 * 60
			) {
				return timeSince(cell) + " ago";
			}
			let date = new Date(cell)
				.toLocaleDateString("en-GB", {
					day: "numeric",
					month: "short",
					year: "numeric",
				})
				.split(" ")
				.join(" ");

			return <>{date}</>;
		}
		return <>-</>;
	}

	const columns = [
		{
			dataField: "name",
			text: "Name",
			formatter: (data, row, rowindex) => {
				return (
					<UserInfoTableComponent
						user_account_type={row.account_type}
						user_email={row.email}
						user_status={row.user_status}
						row={row}
						user_id={row._id}
						user_name={row.name}
						user_profile={row.profile_img}
					></UserInfoTableComponent>
				);
			},
		},
		{
			dataField: "email",
			text: "Email",
			formatter: (dataField) => (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>{dataField}</Tooltip>}
				>
					<div className="truncate_10vw">{dataField}</div>
				</OverlayTrigger>
			),
		},
		{
			dataField: "role",
			text: "Permission",
			formatter: (cell, row, rowIndex, formatExtraData) =>
				userRole === "owner" ? (
					<>{userRoleDropdown(row)}</>
				) : userRole != "owner" ? (
					row.role !== "owner" ? (
						<>{userRoleDropdown(row)}</>
					) : (
						<div className="grey-1 ml-2 text-capitalize">
							{row.role === "it admin" ? "IT Admin" : row.role}
						</div>
					)
				) : null,
		},
		{
			dataField: "last_login",
			text: "Last Login",
			formatter: (cell, row) => (
				<>
					{row.last_login ? (
						<div>{dateFormatter(row.last_login)}</div>
					) : (
						<ResendInvite
							email={row.email}
							last_login={row.last_login}
						/>
					)}
				</>
			),
		},
	];

	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
		onSelect: (row, isSelect) => {
			if (isSelect) {
				if (!selectedIds.includes(row._id)) {
					setSelectedIds(selectedIds.concat([row._id]));
				}
			} else {
				if (selectedIds.includes(row._id)) {
					setSelectedIds(selectedIds.filter((el) => el !== row._id));
				}
			}
		},
		onSelectAll: (isSelect, rows, e) => {
			if (isSelect) {
				setSelectedIds(rows.map((row) => row._id));
			} else {
				setSelectedIds([]);
			}
		},
	};

	const { admins } = useSelector((state) => state.settings);

	return (
		<>
			{admins.loading && (
				<Table
					columns={loaderColumns}
					data={loadingData || []}
					hover
					remote={false}
					keyField="_id"
					selectRow={selectRow}
				/>
			)}
			{admins &&
				admins.loaded &&
				Array.isArray(admins.data) &&
				admins.data?.length > 0 && (
					<Table
						columns={columns}
						data={props.data}
						hover
						remote={false}
						keyField="_id"
						selectRow={selectRow}
						cellEdit={cellEditFactory({
							mode: "click",
							blurToSave: true,
						})}
					/>
				)}
			{showConfirmationScreen && (
				<ConfirmRemoveUser
					user={selectedMember}
					isOpen={showConfirmationScreen}
					removeUser={removeMember}
					successResponse={() => {
						dispatch(fetchAllAdmins());
					}}
					closeModal={() => {
						setShowConfirmationScreen(false);
						setSelectedMember();
					}}
				/>
			)}
		</>
	);
}

AdministrationTable.propTypes = {
	data: PropTypes.array,
};
