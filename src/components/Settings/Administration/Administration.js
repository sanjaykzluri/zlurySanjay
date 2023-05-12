import React, { useEffect, useState } from "react";
import "./Administration.css";
import { AdministrationTable } from "./AdministrationTable";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAdmins } from "../../../actions/settings-action";
import { AddAdmin } from "./AddAdmin";
import { addMember } from "../../../services/api/settings";
import { Helmet } from "react-helmet";
import RestrictedContent from "../../../common/restrictions/RestrictedContent";
import { ENTITIES } from "../../../constants";
import { getValueFromLocalStorage } from "utils/localStorage";
export function Administration() {
	const [addAdmin, setAddAdmin] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const { admins } = useSelector((state) => state.settings);
	const [userExists, setUserExists] = useState(false);
	const dispatch = useDispatch();
	const orgId = useSelector((state) => state.userInfo.org_id);

	useEffect(() => {
		dispatch(fetchAllAdmins());

		//Segment Implementation
		window.analytics.page("Settings", "Administration", {
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}, []);

	const handleAddMember = (member) => {
		if (!admins.data.some((admin) => admin._id === member.user_id)) {
			setUserExists(false);
			setSubmitting(true);
			addMember(member)
				.then(() => {
					setSubmitting(false);
					setAddAdmin(false);
					dispatch(fetchAllAdmins());
					//Segment Implementation
					window.analytics.track("Added a new Member", {
						newMember: member,
						currentCategory: "Settings",
						currentPageName: "Administration",
						orgId: orgId || "",
						orgName: orgName || "",
					});
				})
				.catch((err) => {
					setSubmitting(false);
					console.error("Error while adding new member", err);
				});
		} else {
			setUserExists(true);
		}
	};

	const orgName = getValueFromLocalStorage("userInfo")?.org_name;

	const clickedOnAdd = () => {
		setAddAdmin(true);
		//Segment
		window.analytics.track("Clicked on Add New Admin Member", {
			currentCategory: "Settings",
			currentPageName: "Administration",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	return (
		<>
			<Helmet>
				<title>{`Administration Settings - ${orgName} - ${
					getValueFromLocalStorage("partner")?.name
				}`}</title>
			</Helmet>
			<div className="acc__cont d-block">
				<div className="acc__cont__d1">Administration</div>
				<RestrictedContent entity={ENTITIES.ADMINISTRATION}>
					<div className="adm__cont__d1__d1 m-auto">Members</div>
					<div className="adm__cont__d1__d2  m-auto">
						<button
							onClick={clickedOnAdd}
							className="adm__cont__button1"
						>
							+ Add
						</button>
						{addAdmin && (
							<AddAdmin
								isOpen={addAdmin}
								submitting={submitting}
								handleClose={() => {
									setAddAdmin(false);
									setUserExists(false);
								}}
								handleSubmit={handleAddMember}
								userExists={userExists}
							/>
						)}
					</div>
					<div
						className="adm__cont__table"
						style={{ marginTop: "16px" }}
					>
						<AdministrationTable
							data={admins.data}
						></AdministrationTable>
					</div>
				</RestrictedContent>
			</div>
		</>
	);
}
