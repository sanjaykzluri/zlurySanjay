import React, { useContext, useEffect, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import { INTEGRATION_STATUS, REQUEST_STATUS } from "../../constants/constant";
import { IntegrationStatus } from "../../containers/IntegrationStatus/IntegrationStatus";

import { IntegrationCard } from "../IntegrationCard/IntegrationCard";
import { IntegrationPermisionCard } from "../IntegrationPermisionCard/IntegrationPermisionCard";
import ellipsis from "../../../../assets/icons/ellipsis-v.svg";
import sync from "../../../../assets/icons/sync.svg";
import right from "../../../../assets/icons/circle-arrow-right.svg";
import ArrowCornerBlue from "../../../../assets/arrow-corner-right-blue.svg";
import SupportEmail from "../../../../assets/SupportEmail.svg";
import SupportLink from "../../../../assets/SupportLink.svg";
import PrivacyPolicy from "../../../../assets/PrivacyPolicy.svg";
import MarketplaceUrl from "../../../../assets/MarketplaceURL.svg";
import Slider from "react-slick";
import "./AppIntegrationInformation.css";
import { useDispatch, useSelector } from "react-redux";
import {
	remindIntegrationRequest,
	withdrawIntegrationRequest,
} from "../../redux/integrations";
import { Fragment } from "react";
import { Accordion, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import edit from "../../../../assets/icons/edit.svg";
import upDownArrow from "../../../../assets/upDownArrow.svg";
import connectedIcon from "../../../../assets/icons/check-circle.svg";
import disconnectedAccount from "../../../../components/Onboarding/warning.svg";
import disconnectIcon from "../../../../assets/cross-solid.svg";
import addWhiteIcon from "../../../../assets/icons/plus-white.svg";
import moment from "moment";
import InvitedAccount from "./InvitedAccount";
import Account from "./Account";
import { integration } from "../../../../utils/integration";
import { unescape, urlifyImage, withHttp } from "../../../../utils/common";
import { NameBadge } from "../../../../common/NameBadge";
import informationIcon from "../../../../assets/information-circle.svg";
import { useHistory } from "react-router-dom";
import backIcon from "assets/back-icon.svg";

import _ from "underscore";
import RoleContext from "services/roleContext/roleContext";
import { PARTNER } from "modules/shared/constants/app.constants";
export function AppIntegrationInformation(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const dispatch = useDispatch();
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [pendingInvites, setPendingInvites] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [hasAccountsOrInvites, setHasAccountsOrInvites] = useState(false);
	const { partner } = useContext(RoleContext);
	const history = useHistory();

	useEffect(() => {
		//Segment Implementation
		if (props.integration) {
			window.analytics.page("Integrations", "App Info", {
				app_id: props.integration.id,
				app_name: props.integration.name,
				integration_category_id: props.integration.categoryId,
				integration_category_name: props.integration.categoryName,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
		if (
			(props.integration?.accounts ||
				props.integration?.pendingAccounts) &&
			(Array.isArray(props.integration?.accounts) ||
				Array.isArray(props.integration?.pendingAccounts)) &&
			(props.integration?.accounts?.length > 0 ||
				props.integration?.pendingAccounts?.length > 0)
		) {
			setHasAccountsOrInvites(true);
		}
		if (
			props.integration?.accounts &&
			Array.isArray(props.integration?.accounts) &&
			props.integration?.accounts?.length > 0
		) {
			setAccounts(props.integration?.accounts);
		}
		if (
			props.integration?.pendingAccounts &&
			Array.isArray(props.integration?.pendingAccounts) &&
			props.integration?.pendingAccounts?.length > 0
		) {
			setPendingInvites(props.integration?.pendingAccounts);
		}
	}, [props.integration]);
	const [nav, setNav] = useState(null);
	let slider = [];
	const slideNext = () => {
		slider.slickNext();
	};

	useEffect(() => {
		if (
			props.integration?.similarIntegrations?.length > 0 &&
			slider.length === 0
		) {
			setNav(slider);
		}
	}, [slider]);

	const resendInvitation = (item) => {
		dispatch(remindIntegrationRequest(item.id, item.invite_id));
	};

	const withdrawInvitation = (item) => {
		dispatch(withdrawIntegrationRequest(item.id));
	};

	return (
		<div className="z_i_app_info ">
			<div className="d-flex">
				<div
					style={{
						width: "350px",
					}}
				>
					<div
						align="center"
						style={{
							height: "135px",
							border: "1px solid #EBEBEB",
							borderRadius: "4px",
						}}
						className=" pl-0 p-2 mb-2"
					>
						{props.integration.logo ? (
							<div
								className="mr-2 mt-2 mb-auto background-contain background-no-repeat background-position-center"
								style={{
									backgroundImage: `url('${urlifyImage(
										unescape(props.integration.logo)
									)}')`,
									width: "75px",
									height: "75px",
									flexShrink: 0,
								}}
							></div>
						) : (
							<NameBadge
								name={props.integration.name}
								width={48}
								height={48}
								className="mr-2 mt-1 mb-auto"
							/>
						)}
					</div>

					<div
						className={`d-flex flex-column justify-content-between ${
							hasAccountsOrInvites ? "border" : ""
						}`}
					>
						{pendingInvites.length > 0 &&
							pendingInvites.map((pendingAccount, uniqueKey) => (
								<InvitedAccount
									invitedAccount={pendingAccount}
									uniqueKey={uniqueKey}
									integrationLogo={props.integration.logo}
									integrationName={props.integration.name}
									inviteId={pendingAccount.invite_id}
									accountName={pendingAccount.account_name}
									accountDescription={
										pendingAccount.account_description
									}
								/>
							))}

						<IntegrationStatus
							integration={props.integration}
							hasMoreAccount={
								pendingInvites.length > 0 || accounts.length > 0
							}
							setshowUpgradeModal={props.setshowUpgradeModal}
						/>
					</div>
					<div className="flex-fill">
						{props.integration.requestStatus &&
							props.integration.requestStatus ===
								REQUEST_STATUS.PENDING && (
								<div
									style={{
										backgroundColor:
											"rgb(90 186 255 / 10%)",
										border: "1px solid #5ABAFF",
									}}
									className=" mt-4 font-10 primary-color p-3  border-radius-4"
								>
									<h3 className="blod-600 font-12 black-1">
										Request Sent!
									</h3>
									<p className="grey font-11">
										Request to connect{" "}
										{props.integration.requestDetails?.name}{" "}
										has been sent to{" "}
										{
											props.integration.requestDetails
												?.sentToUserEmail
										}{" "}
										on{" "}
										{
											props.integration.requestDetails
												?.requestOn
										}
									</p>
									<ul className="m-0 p-0 d-flex list-style-none ">
										<li>
											<Button
												type="link"
												onClick={() => {
													resendInvitation(
														props.integration
															.requestDetails
													);
												}}
												className="font-11 pl-0"
											>
												Send Reminder
											</Button>
										</li>
										<li>
											<Button
												type="link"
												onClick={() => {
													withdrawInvitation(
														props.integration
															.requestDetails
													);
												}}
												className="font-11 "
											>
												Withdraw Request
											</Button>
										</li>
									</ul>
								</div>
							)}
					</div>
					<div className="flex-fill">
						<div className="mt-4 row">
							<h4 className="grey-1 font-12 bold-600 col-md-4 mt-auto mb-auto text-uppercase">
								Category
							</h4>
							<p className="font-13 bold-500 col-md-8 mt-auto mb-auto">
								{props.integration.categoryName}
							</p>
						</div>
						{props?.integration?.supported_languages?.length >
							0 && (
							<div className="mt-4 row">
								<h4 className="grey-1 font-12 bold-600 col-md-4 mt-auto mb-auto text-uppercase">
									Supported Languages
								</h4>
								{props.integration?.supported_languages?.map(
									(language, index) => (
										<p
											key={index}
											className="font-13 bold-500 col-md-8 mt-auto mb-auto"
										>
											{language}
										</p>
									)
								)}
							</div>
						)}
						{props?.integration?.last_update_date && (
							<div className="mt-4 row">
								<h4 className="grey-1 font-12 bold-600 col-md-4 mt-auto mb-auto text-uppercase">
									Last Update
								</h4>
								<p className="font-13 bold-500 col-md-8 mt-auto mb-auto">
									{props?.integration?.last_update_date}
								</p>
							</div>
						)}
						<div className="mt-4 row">
							<h4 className="grey-1 font-12 bold-600 col-md-4 mt-auto mb-auto text-uppercase">
								Suggested Role
							</h4>
							<p className="font-13 bold-500 col-md-8 mt-auto mb-auto">
								Owner
							</p>
						</div>
						{partner?.name === PARTNER.ZLURI.name && (
							<div className="mt-3 row">
								<h4
									className="grey-1 font-12 bold-600 col-md-4 mb-auto text-uppercase"
									style={{ marginTop: "6px" }}
								>
									Developer
								</h4>
								<ul className="list-unstyled col-md-8 mb-0">
									<li>
										<a
											href={`mailto:${props.integration.developerEmails}`}
											target="_blank"
											rel="noreferrer"
											className="font-13 bold-400"
										>
											{props.integration.developerEmails}
										</a>
									</li>
									<li>
										<a
											href={props.integration.privacyLink}
											target="_blank"
											rel="noreferrer"
											className="font-13 bold-400"
										>
											Privacy Policy
											<img
												className="ml-1"
												src={ArrowCornerBlue}
												style={{ width: "9px" }}
											/>
										</a>
									</li>
								</ul>
							</div>
						)}
						{props.integration?.tags?.length > 0 && (
							<div className="mt-3">
								<h4 className="grey-1 font-12 bold-600 text-uppercase">
									Tags
								</h4>
								<ul className="list-unstyled d-flex z_i_app_info_tag  flex-wrap text-capitalize">
									{props.integration.tags?.map(
										(tag, index) => (
											<li
												key={index}
												className="font-13 pl-2 pr-2 pb-1 pt-1 mr-2 mb-2"
											>
												{tag}
											</li>
										)
									)}
								</ul>
							</div>
						)}
					</div>
					<hr className="mt-0" />
					<div
						className="d-flex"
						style={{ justifyContent: "space-between" }}
					>
						{props.integration.learnURL && (
							<div>
								<a
									className="primary-color text-uppercase font-12 bold-600"
									href={withHttp(props.integration.learnURL)}
									target="_blank"
									rel="noreferrer"
								>
									Learn More
								</a>
								<img
									className="ml-1"
									src={ArrowCornerBlue}
									style={{
										width: "9px",
										height: "9px",
										marginTop: "2px",
									}}
								/>
							</div>
						)}

						<div>
							{props.integration.support_email && (
								<a
									className="primary-color text-uppercase font-12 bold-600"
									href={`mailto:${props.integration.support_email}`}
									target="_blank"
									rel="noreferrer"
								>
									<img
										className="mr-2"
										src={SupportEmail}
										style={{
											width: "14px",
											marginTop: "2px",
										}}
									/>
								</a>
							)}
							{props.integration.support_link && (
								<a
									className="primary-color text-uppercase font-12 bold-600"
									href={withHttp(
										props.integration.support_link
									)}
									target="_blank"
									rel="noreferrer"
								>
									<img
										className="mr-2"
										src={SupportLink}
										style={{
											width: "14px",
											marginTop: "2px",
										}}
									/>
								</a>
							)}
							{props.integration.privacyLink && (
								<a
									className="primary-color text-uppercase font-12 bold-600"
									href={withHttp(
										props.integration.privacyLink
									)}
									target="_blank"
									rel="noreferrer"
								>
									<img
										className="mr-2"
										src={PrivacyPolicy}
										style={{
											width: "14px",
											marginTop: "2px",
										}}
									/>
								</a>
							)}
							{props.integration.app_marketplace_url && (
								<a
									className="primary-color text-uppercase font-12 bold-600"
									href={withHttp(
										props.integration.app_marketplace_url
									)}
									target="_blank"
									rel="noreferrer"
								>
									<img
										className="mr-2"
										src={MarketplaceUrl}
										style={{
											width: "14px",
											marginTop: "2px",
										}}
									/>
								</a>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
