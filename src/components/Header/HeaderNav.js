import React, { useState, useEffect, useRef } from "react";
import { Navbar, Nav, Form, FormControl, Button } from "react-bootstrap";
import { Link, useHistory, useLocation } from "react-router-dom";
import useOutsideClick from "../../common/OutsideClick/OutsideClick";
import notification from "./notification.svg";
import logo4 from "./logo4.svg";
import userAvatar from "../../assets/users/user-avatar.svg";
import backNav from "../../assets/back-nav.svg";
import { useDispatch, useSelector } from "react-redux";
import { openSearch } from "../../actions/ui-action";
import "./Header.css";
import Notification from "../../common/Notification/Notification";
import GettingStartedButton from "../GettingStarted/GettingStartedButton";
import { getValueFromLocalStorage } from "utils/localStorage";
import { PARTNER } from "modules/shared/constants/app.constants";

export function HeaderNav(props) {
	const ref = useRef();
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();
	const [docked, setDocked] = useState(true);
	const [showLogsMenu, setShowLogsMenu] = useState(false);
	const user = useSelector((state) => state.userDetails);
	const partner = getValueFromLocalStorage("partner");

	useEffect(() => {
		if (
			location.pathname === "/checkAuth" ||
			location.pathname === "/login" ||
			location.pathname === "/logout"
		)
			setDocked(false);
		else {
			setDocked(true);
		}
	}, [location]);

	const handleChange = (event) => {
		props.onSearchQueryChange(event.target.value);
	};

	const handleSearchBarClick = () => {
		if (location.pathname !== "/search") {
			dispatch(openSearch());
			history.push("/search");
		}
	};

	const userInfoPic = user?.picture || userAvatar;
	useOutsideClick(ref, () => {
		if (showLogsMenu) setShowLogsMenu(false);
	});
	return (
		<>
			{docked ? (
				<>
					<Navbar bg="white" variant="light" className="Nav">
						{location.pathname == "/search" && (
							<Nav className="mr-4">
								<a
									className="cursor-pointer"
									onClick={history.goBack}
								>
									<img src={backNav} alt="Navigate back" />
								</a>
							</Nav>
						)}
						<Nav className="mr-auto">
							<div className="search">
								<img
									alt=""
									className="search-icon__header"
									src={logo4}
								></img>
								<FormControl
									bsPrefix="header__custom__search"
									style={{ border: "none" }}
									type="text"
									placeholder={`Search ${partner?.name}`}
									value={props.searchKey}
									onClick={handleSearchBarClick}
									onChange={handleChange}
								/>
							</div>
						</Nav>
						<Navbar.Brand>
							<GettingStartedButton />
						</Navbar.Brand>
						<Navbar.Brand>
							<Notification />
						</Navbar.Brand>
						{partner?.name === PARTNER.ZLURI.name && (
							<div style={{ position: "relative" }}>
								<Navbar.Brand>
									<img
										role="button"
										alt=""
										src={userInfoPic}
										width="30"
										height="30"
										className="d-inline-block align-top"
										id="profileimage"
										onClick={() => {
											setShowLogsMenu(true);
										}}
									/>
								</Navbar.Brand>
								{showLogsMenu ? (
									<div
										className="overview__logsbutton__menu menu"
										style={{ height: "fit-content" }}
										ref={ref}
									>
										<button
											onClick={() => {
												history.push(
													"/settings/account"
												);
											}}
										>
											Account Settings
										</button>
										<hr style={{ margin: "0px 18px" }}></hr>
										<button
											onClick={() => {
												history.push("/logout");
											}}
										>
											Logout
										</button>
									</div>
								) : null}
							</div>
						)}
					</Navbar>
					<hr style={{ margin: "0px 12px" }} />
				</>
			) : null}
		</>
	);
}
