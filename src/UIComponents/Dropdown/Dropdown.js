import React from "react";
import { Dropdown } from "react-bootstrap";
import caret from "../../components/Integrations/caret.svg";
import "./Dropdown.css";

export function CustomDropdown(props) {
	const defaultValue = React.forwardRef(({ children, onClick }, ref) => (
		<div
			ref={ref}
			className="cursor-pointer grey-1 text-capitalize"
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				onClick(e);
			}}
		>
			{props.defaultValue}
			<img src={caret} className="ml-2" alt="userRole" />
		</div>
	));

	return (
		<>
			<Dropdown className="ml-2 w-100">
				<Dropdown.Toggle as={defaultValue} />
				<Dropdown.Menu>
					{props.options?.length > 0 &&
						Array.isArray(props.options)
						? props.options?.map((option, index) => (
							<div key={index}>
								{
									(option.showBorderTop != null && option.showBorderTop) &&
									<hr className="p-0 mt-0 mb-0 ml-2 mr-2"></hr>
								}
								<Dropdown.Item
									key={index}
									onClick={() => {
										option.handleCallToAction(props.row);
									}}
								>
									<div
										className="label"
										style={{ color: option.labelColor }}
									>
										{option.label}
									</div>
									<p
										className="description m-0"
										style={{ width: "140px" }}
									>
										{option.description}
									</p>
								</Dropdown.Item>
							</div>
						))
						: null}
				</Dropdown.Menu>
			</Dropdown>
		</>
	);
}
