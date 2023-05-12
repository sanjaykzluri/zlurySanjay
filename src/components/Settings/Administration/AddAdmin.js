import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Modal, Row, Col, Spinner } from "react-bootstrap";
import close from "../../../assets/close.svg";
import Button from "react-bootstrap/Button";
import { searchUsers } from "../../../services/api/search";
import { AsyncTypeahead } from "../../../common/Typeahead/AsyncTypeahead";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { SelectOld } from "../../../UIComponents/SelectOld/Select";
import RoleContext from "../../../services/roleContext/roleContext";
import { useDispatch, useSelector } from "react-redux";
export function AddAdmin(props) {
	const { userRole } = useContext(RoleContext);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [userExists, setUserExists] = useState(false);
	const USER_ROLES = [
		{
			label: "Admin",
			value: "admin",
			description: "Admins can manage day to day administrative tasks.",
		},
		{
			label: "Viewer",
			value: "viewer",
			description: "Viewers have read-only access",
		},
		{
			label: "IT Admin",
			value: "it admin",
			description: "Has access to all modules except transactions",
		},
		{
			label: "Finance Admin",
			value: "finance admin",
			description:
				"Has access to only overview, transaction & integration modules",
		},
		{
			label: "Procurement Admin",
			value: "procurement admin",
			description:
				"Has access to only overview, transaction & license modules",
		},
		{
			label: "Integration Admin",
			value: "integration admin",
			description: "Has access to only integration & workflow modules",
		},
		{
			label: "Security Admin",
			value: "security admin",
			description:
				"Has access to only security, reports & application overview modules",
		},
	];
	if (userRole === "owner") {
		USER_ROLES.unshift({
			label: "Owner",
			value: "owner",
			description:
				"Owners have all the privileges and manage the subscription & billing.",
		});
	}
	const initialState = {
		user_id: "",
		name: "",
		role: "admin",
	};
	const [member, setMember] = useState({ ...initialState });

	useEffect(() => setUserExists(props.userExists), [props.userExists]);

	useDidUpdateEffect(() => {
		if (!props.isOpen) {
			setMember({ ...initialState });
		}
	}, [props.isOpen]);

	const handleMemberChange = (key, value) => {
		setMember({
			...member,
			[key]: value,
		});
	};

	const handleMemberSelect = (selection) => {
		setUserExists(false);
		setMember({
			...member,
			name: selection.user_name,
			user_id: selection.user_id,
		});
	};

	useEffect(() => {
		//Segment Implementation for Add-Member
		if (props.isOpen) {
			window.analytics.page("Settings", "Administration; Add-Member", {
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [props.isOpen]);

	return (
		<Modal centered show={props.isOpen} onHide={props.handleClose}>
			<Modal.Header closeButton={false} className="align-items-center">
				<Modal.Title className="mx-auto" style={{ fontWeight: "600" }}>
					Add Member
				</Modal.Title>
				<img alt="Close" onClick={props.handleClose} src={close} />
			</Modal.Header>
			<hr />
			<Modal.Body>
				<div className="addTransactionModal__body_lower">
					<div className="p-4 mx-2" style={{ fontSize: 12 }}>
						<Form className="w-100">
							<Row>
								<Col sm="8">
									<AsyncTypeahead
										label="Name"
										placeholder="Enter Name"
										fetchFn={searchUsers}
										onSelect={handleMemberSelect}
										keyFields={{
											id: "user_id",
											image: "profile_img",
											value: "user_name",
											email: "user_email",
										}}
										isAddAdmin={true}
										allowFewSpecialCharacters={true}
									/>
								</Col>
								<Col>
									<label>Permission</label>
									<SelectOld
										className="select_user__role"
										options={USER_ROLES}
										isSearchable={false}
										onSelect={(v) => {
											setMember({
												...member,
												role: v.value,
											});
										}}
									/>
								</Col>
							</Row>
							{userExists && (
								<Row className="d-flex">
									<div className="text-center alert alert-danger m-auto p-2 align-items-center border border-danger">
										User already exists
									</div>
								</Row>
							)}
						</Form>
					</div>
				</div>
			</Modal.Body>
			<hr />
			<Modal.Footer className="addTransactionModal__footer">
				<button className="btn btn-link" onClick={props.handleClose}>
					Cancel
				</button>
				<Button
					disabled={
						!member.user_id || props.submitting || !member.role
					}
					onClick={() => props.handleSubmit(member)}
				>
					Send Invite
					{props.submitting && (
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
		</Modal>
	);
}

AddAdmin.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	submitting: PropTypes.bool,
	handleClose: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};
