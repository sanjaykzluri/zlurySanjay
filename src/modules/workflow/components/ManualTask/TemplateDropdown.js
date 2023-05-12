import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import dropdownarrow from "../../../../assets/workflow/dropdownarrow.svg";

const TemplateDropdown = (props) => {
	const {
		allManualTaskTemplates,
		selectedManualTaskTemplate,
		setSelectedManualTaskTemplate,
	} = props;

	const manual_dropdown = React.forwardRef(({ children, onClick }, ref) => (
		<a
			className="cursor-pointer assigned__via__dropdownbutton text-decoration-none mb-1"
			ref={ref}
			onClick={(e) => {
				e.preventDefault();
				onClick(e);
			}}
		>
			{children}
		</a>
	));

	const handleManualTemplateUpdate = (val) => {
		setSelectedManualTaskTemplate(val);
	};

	return (
		<div>
			<Dropdown>
				<Dropdown.Toggle as={manual_dropdown}>
					<div
						style={{
							color: "#2266E2",
							backgroundColor: "#E8ECF8",
							borderRadius: "4px",
						}}
						className="assigned__via__dropdownbutton__d2 grey bold-normal text-capitalize"
					>
						{selectedManualTaskTemplate?.title ||
							allManualTaskTemplates[0]?.title}
						<img className="ml-1" src={dropdownarrow} />
					</div>
				</Dropdown.Toggle>
				<Dropdown.Menu>
					{allManualTaskTemplates.map((item, index) => {
						return (
							<Dropdown.Item
								key={index}
								onClick={() => handleManualTemplateUpdate(item)}
							>
								<div className="flex-1 d-flex flex-row align-items-center ">
									<div className="flex-1 d-flex flex-column align-items-start justify-center ml-3">
										<div className="d-flex flex-row align-items-center">
											<div className="assigned__via__dropdownbutton__d2__normal">
												{item.title}
											</div>
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

export default TemplateDropdown;
