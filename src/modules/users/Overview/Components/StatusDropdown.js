import React, { useContext, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import arrowdropdown from "../../../../components/Transactions/Unrecognised/arrowdropdown.svg";
import { userStatus } from "../../../../constants/users";
import check from "../../../../assets/applications/check.svg";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import edit from "../../../../components/Users/Overview/edit.svg";
import "./components.css";
const bulk_edit_menu = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer autho__dd__cont text-decoration-none w-100  pr-2"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
		style={{ marginTop: "8px", backgroundColor: "#FFFFFF" }}
	>
		{children}
	</a>
));
export function StatusDropdown({ user, changeStatus }) {
	const dropDownOptions = {
		ACTIVE: {
			title: "Active",
			icon: check,
			value: "active",
		},
		INACTIVE: {
			title: "Inactive",
			icon: inactivecheck,
			inactive: "inactive",
		},
		SUSPENDED: {
			title: "Suspended",
			icon: inactivecheck,
			suspended: "suspended",
		},
	};
	const [selectedState, setSelectedState] = useState();
	useEffect(() => {
		if (user && !user.loading) {
			setSelectedState(user.user_status);
		}
	}, [user]);

	const handleChange = (option) => {
		changeStatus(option);
	};
	return (
		<>
			<Dropdown className="w-100">
				<Dropdown.Toggle as={bulk_edit_menu}>
					<div className="w-100 edit_hover_class d-flex align-items-center justify-content-between">
						<div className="d-flex flex-row align-items-center">
							<img
								src={
									dropDownOptions[
										selectedState?.toUpperCase()
									]?.icon
								}
							/>
							<div className="overview__dropdownbutton__d2">
								{
									dropDownOptions[
										selectedState?.toUpperCase()
									]?.title
								}
							</div>
						</div>

						<img src={edit} className="edit_hover_class_img"></img>
					</div>
				</Dropdown.Toggle>
				<Dropdown.Menu className="p-0 w-100">
					{Object.keys(dropDownOptions).map((status) => {
						if (
							typeof user.user_status === "string" &&
							typeof userStatus[status] === "string" &&
							userStatus[status]?.toLocaleLowerCase() ===
								user.user_status?.toLocaleLowerCase()
						)
							return null;
						return (
							<Dropdown.Item
								onClick={() => {
									handleChange(userStatus[status]);
								}}
							>
								<div className="d-flex flex-row align-items-center">
									<img src={dropDownOptions[status].icon} />
									<div className="overview__dropdownbutton__d2">
										{dropDownOptions[status].title}
									</div>
								</div>
							</Dropdown.Item>
						);
					})}
				</Dropdown.Menu>
			</Dropdown>
		</>
	);
}
