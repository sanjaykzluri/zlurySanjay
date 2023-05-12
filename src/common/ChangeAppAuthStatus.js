import React, {
	Fragment,
	useContext,
	useEffect,
	useState,
	useRef,
} from "react";

import { Dropdown } from "react-bootstrap";
import arrowdropdown from "../components/Transactions/Unrecognised/arrowdropdown.svg";
import { authStatusObj } from "./AppAuthStatus";

const bulk_edit_menu = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer autho__dd__cont text-decoration-none w-100 d-flex justify-content-between pr-2"
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
export default function ChangeAppAuthStatus({
	onSelect,
	buttonRender,
	defaultValue = {
		tooltip: "Set Authorizaton",
	},
	optionsRequired = [
		"centrally_managed",
		"team_managed",
		"individually_managed",
		"unmanaged",
		"restricted",
	],
}) {
	const [authState, setAuthState] = useState(defaultValue);

	const dropdownButtonRenderer = () => {
		return (
			<>
				{buttonRender ? (
					buttonRender()
				) : (
					<>
						<div className="d-flex align-items-center">
							{authState.image && (
								<img
									src={authState.image}
									className="mr-1"
								></img>
							)}
							<div className="grey text-capitalize">
								{authState?.tooltip}
							</div>
						</div>

						<img
							src={arrowdropdown}
							style={{ marginLeft: "8px" }}
						></img>
					</>
				)}
			</>
		);
	};
	return (
		<>
			<Dropdown>
				<Dropdown.Toggle as={bulk_edit_menu}>
					{dropdownButtonRenderer()}
				</Dropdown.Toggle>
				<Dropdown.Menu className="p-0">
					{optionsRequired.map((el) => (
						<Dropdown.Item
							onClick={() => {
								setAuthState(authStatusObj[el]);
								onSelect && onSelect(el);
							}}
						>
							<div className="d-flex flex-column">
								<div className="d-flex flex-row align-items-center">
									<img
										src={authStatusObj[el].image}
										width={15.33}
									/>
									<div className="overview__dropdownbutton__d2">
										{authStatusObj[el].tooltip}
									</div>
								</div>
								<div className="font-9 grey-1 mt-1">
									{authStatusObj[el].overviewTooltip}
								</div>
							</div>
						</Dropdown.Item>
					))}
				</Dropdown.Menu>
			</Dropdown>
		</>
	);
}
