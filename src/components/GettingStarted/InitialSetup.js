import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScreenIcon from "../../assets/screen-icon.svg";
import ButtonRightArrow from "./button-right-arrow.svg";
import { Button } from "../../UIComponents/Button/Button";
import { updateGettingStartedStatuses, showGettingStartedModal } from "./redux";
import "./styles.css";
import processingIcon from "./processingIcon-large.svg";
import Shimmer from "./Shimmer";
import { useAuth0 } from "@auth0/auth0-react";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";

export default function InitialSetup() {
	const orgName =
		useSelector((state) => state?.userInfo?.org_name) || "Organization";
	const { user } = useAuth0();
	const orgId = useSelector((state) => state?.userInfo?.org_id);

	const dispatch = useDispatch();
	const { partner } = useContext(RoleContext);

	useEffect(() => {
		dispatch(updateGettingStartedStatuses(orgId));
	}, []);

	return (
		<div>
			<div className="initial__setup__wrapper">
				<div className="getting__started__left__section">
					<div className="getting__started__title">
						Hello, {user.name}! Welcome to {partner?.name} 👋
					</div>
					<div className="getting__started__subtitle">
						{orgName}’s SaaS Management journey starts here
					</div>
					<div className="getting__started__button">
						<Button
							onClick={() => dispatch(showGettingStartedModal())}
						>
							Get Started{" "}
							<img className="ml-3" src={ButtonRightArrow} />
						</Button>
					</div>
				</div>
				<div>
					<img src={ScreenIcon} />{" "}
				</div>
			</div>
			<div className="intial__setup__progress">
				<img src={processingIcon} />
				<div className="intial__setup__progress-title">
					We’re setting up {partner?.name} for you
				</div>
				<div className="intial__setup__progress-subtitle">
					We’re processing your data and setting up {partner?.name}{" "}
					for you. Your dashboard will load as soon as your data is
					processed.
				</div>
			</div>
			<Shimmer />
		</div>
	);
}
