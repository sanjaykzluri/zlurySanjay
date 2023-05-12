import React, { useEffect } from "react";
import "./Billing.css";
import conversationIcon from "../../../assets/conversation-chat.svg";
import emailActionEdit from "../../../assets/email-action-edit.svg";
import phoneCallIcon from "../../../assets/phone-actions-call.svg";
import { Button } from "../../../UIComponents/Button/Button";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
export function Billing() {
	const history = useHistory();
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const showIntercom = () =>
		window.Intercom(
			"showNewMessage",
			"I would love to upgrade my plan, Can you please help ?"
		);

	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Settings", "Billing", {
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}, []);

	return (
		<>
			<div className="acc__cont" style={{ overflowX: "auto" }}>
				<div className="acc__cont__d1">Billing</div>
				<div className="billing__header">Upgrade Plan</div>
				<div className="billing__container">
					<div className="billing__wrapper">
						<div className="billing__icon">
							<img src={conversationIcon} />
						</div>
						<div className="billing__title">
							Have a quick chat with our customer success team
						</div>
						<div className="billing__button">
							<Button onClick={showIntercom}>Chat with us</Button>
						</div>
					</div>
					<div className="billing__wrapper">
						<div className="billing__icon">
							<img src={emailActionEdit} />
						</div>
						<div className="billing__title">
							Let us know your requirement and we’ll get back to
							you with a great plan
						</div>
						<div className="billing__button">
							<a
								className="action__link"
								target="_blank"
								rel="noreferrer"
								href="https://support.zluri.com/support/tickets/new"
							>
								Contact Support
							</a>
						</div>
					</div>
					<div className="billing__wrapper">
						<div className="billing__icon">
							<img src={phoneCallIcon} />
						</div>
						<div className="billing__title">
							Give us a call and we’ll sort out your requirement
							right away
						</div>
						<div className="billing__button">
							<a
								className="action__link"
								href="tel:+1 628-243-5870"
							>
								+1 628-243-5870
							</a>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
