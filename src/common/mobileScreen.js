import ZluriLogo from "../../src/assets/zluri_logo.svg";
import MobileScreenImage from "../../src/assets/phone-left.png";
import React, { useContext } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import RoleContext from "services/roleContext/roleContext";
import { getValueFromLocalStorage } from "utils/localStorage";
import { PARTNER } from "modules/shared/constants/app.constants";

const MobileScreen = () => {
	let history = useHistory();
	let { partner } = useContext(RoleContext);
	const token = getValueFromLocalStorage("token");

	function handleLogout() {
		history.push("/logout");
	}
	return (
		<>
			{partner?.name === PARTNER.ZLURI.name && (
				<nav className="fixed-top" style={{ background: "#2266E2" }}>
					<div align="center">
						<img src={ZluriLogo} />
					</div>
				</nav>
			)}
			<div className="mt-6" align="center">
				<img src={MobileScreenImage} />
				<div
					style={{
						fontWeight: 600,
						lineHeight: "20px",
						fontSize: "16px",
					}}
				>
					This screen is not compatible
				</div>
				<div
					className="mt-2"
					style={{ color: "#717171", fontSize: "13px" }}
				>
					{`Please use ${partner?.name} on a larger screen`}
				</div>
				{token && (
					<Button
						onClick={() => {
							handleLogout();
						}}
						style={{ backgroundColor: "#2266E2" }}
						className="m-3"
					>
						Logout
					</Button>
				)}
			</div>
		</>
	);
};

export default MobileScreen;
