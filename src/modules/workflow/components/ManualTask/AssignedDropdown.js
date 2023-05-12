import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import mail from "../../../../assets/workflow/mail.svg";
import jira from "../../../../assets/workflow/jira.svg";
import dropdownarrow from "../../../../assets/workflow/dropdownarrow.svg";

const data = [
	{
		icon: mail,
		title: "via Mail",
		value: "Mail",
		description: "Task will be assigned via email",
		isActive: true,
	},
	{
		icon: jira,
		title: "via Jira",
		value: "Jira",
		description: "Coming Soon",
		isActive: false,
	},
];

const AssignedDropdown = (props) => {
	const { selectedAssignedVia, setSelectedAssignedVia } = props;

	const [AssignedViaData] = useState(data);
	const [selectedAssignedViaData, setSelectedAssignedViaData] =
		useState(selectedAssignedVia);

	useEffect(() => {
		if (selectedAssignedVia) {
			setSelectedAssignedViaData(selectedAssignedVia);
		} else {
			setSelectedAssignedVia(AssignedViaData[0]);
		}
	}, [selectedAssignedVia]);

	const assigned_dropdown = React.forwardRef(({ children, onClick }, ref) => (
		<a
			className="cursor-pointer assigned__via__dropdownbutton text-decoration-none"
			ref={ref}
			onClick={(e) => {
				e.preventDefault();
				onClick(e);
			}}
		>
			{children}
		</a>
	));

	const handleAssignedViaUpdate = (val) => {
		setSelectedAssignedVia(val);
	};

	return (
		<div>
			<Dropdown>
				<Dropdown.Toggle as={assigned_dropdown}>
					<img
						src={
							selectedAssignedViaData &&
							selectedAssignedViaData.icon
								? selectedAssignedViaData.icon
								: AssignedViaData[0].icon
						}
					/>
					<div
						style={{ color: "#5ABAFF" }}
						className="assigned__via__dropdownbutton__d2 grey bold-normal text-capitalize"
					>
						{/* <p style={{ color: "#5ABAFF" }}> */}
						{selectedAssignedVia?.value || AssignedViaData[0].value}
						{/* </p> */}
						<img className="ml-1" src={dropdownarrow} />
					</div>
				</Dropdown.Toggle>
				<Dropdown.Menu>
					{AssignedViaData.map((item, index) => {
						return (
							<Dropdown.Item
								key={index}
								disabled={!item.isActive}
								onClick={() => handleAssignedViaUpdate(item)}
							>
								<div className="flex-1 d-flex flex-row align-items-center ">
									<div className="d-flex flex-column align-items-center">
										<img src={item.icon} width={15.33} />
									</div>
									<div className="flex-1 d-flex flex-column align-items-start justify-center ml-3">
										<div className="d-flex flex-row align-items-center">
											<div className="assigned__via__dropdownbutton__d2__normal">
												{item.title}
											</div>
										</div>
										<div className="d-flex flex-row align-items-center font-9 grey-1">
											<p>{item.description}</p>
										</div>
									</div>
								</div>
							</Dropdown.Item>
						);
					})}
				</Dropdown.Menu>
			</Dropdown>
		</div>
	);
};

export default AssignedDropdown;
