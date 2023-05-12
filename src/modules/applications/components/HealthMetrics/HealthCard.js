import React, { useEffect, useState } from "react";
import cardEdit from "assets/applications/card_edit.svg";
import cardAlarmRIng from "assets/card_alarm_ring.svg";
import cardUser from "assets/card_user.svg";
import cardTechnical from "assets/card_user.svg";
import cardFinance from "assets/card_finance.svg";
import cardCategory from "assets/card_category.svg";
import cardMoney from "assets/card_money.svg";
import cardAppLink from "assets/card_app_link.svg";
import cardConnect from "assets/card_connect.svg";
import cardActivity from "assets/card_activity.svg";
import healthPoints from "assets/applications/card_health_points.svg";
import { Card, Dropdown, Form } from "react-bootstrap";
import "./styles.css";
import { Button } from "UIComponents/Button/Button";
import OptionsCard from "./OptionsCard";
import EllipsisSVG from "assets/card_ellipsis.svg";
import CardUserGroup from "assets/card_user_group.svg";
import CardAppType from "assets/card_app_type.svg";
import CardRisk from "assets/card_risk.svg";
import cardDepartment from "assets/card_department.svg";
import cardLock from "assets/card_lock.svg";
import cardContract from "assets/card_contract.svg";
import cardTransactions from "assets/card_transactions.svg";
import cardCost from "assets/card_cost.svg";
import cardLicense from "assets/card_license.svg";
import cardRenewal from "assets/card_renewal.svg";
import IncreaseArrow from "assets/increase_arrow.svg";
import RedirectArrow from "assets/redirect_arrow.svg";
import reviewUserGroup from "assets/review_user_group.svg";
import riskRed from "assets/risk_rating_red.svg";
import { useDispatch, useSelector } from "react-redux";
import { getStringFromTemplate } from "utils/common";
import { fetchAppHealthCard, fetchAppHealthCards } from "./redux";

const REDIRECT_ENTITY = {
	user: () => "/users#employees",
	app_risk: (appId) => `/applications/${appId}#security`,
};

const cardIcons = {
	edit: cardEdit,
	user_group: CardUserGroup,
	app_type: CardAppType,
	card_risk: CardRisk,
	alarm: cardAlarmRIng,
	department: cardDepartment,
	lock: cardLock,
	user: cardUser,
	technical: cardTechnical,
	finance: cardFinance,
	category: cardCategory,
	money: cardMoney,
	app_link: cardAppLink,
	card_connect: cardConnect,
	card_activity: cardActivity,
	card_contract: cardContract,
	card_transactions: cardTransactions,
	card_cost: cardCost,
	card_license: cardLicense,
	card_renewal: cardRenewal,
	review_user_group: reviewUserGroup,
	risk_red: riskRed,
};

const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		<img src={EllipsisSVG} width="14" />
	</a>
));

export default function HealthCard({
	showCard,
	title,
	icon,
	description,
	children,
	meta,
	action,
	updateStep,
	onSubmit,
	largeWidth,
	containerStyle,
	isFirstStep,
	appId,
	cardId,
	reviewMeta,
}) {
	const [cardDescription, setCardDescription] = useState("");
	const [cardTitle, setCardTitle] = useState("");
	const dispatch = useDispatch();
	const { SHOW_HEALTH_POINTS } = useSelector((state) => state.featureFlags);

	useEffect(() => {
		setCardDescription(getStringFromTemplate(description, meta));
	}, [description]);

	useEffect(() => {
		setCardTitle(getStringFromTemplate(title, meta));
	}, [title]);

	return (
		<Card
			className={`card__container ${
				largeWidth ? "option_card-container" : ""
			}`}
			style={containerStyle}
		>
			{showCard ? (
				<div className="">
					<div className="d-flex justify-content-between">
						<div>
							<img src={cardIcons[icon] || cardIcons.edit} />
						</div>
						<div className="d-flex">
							{SHOW_HEALTH_POINTS && (
								<img
									width={43}
									height={19}
									className="card__healthpoints"
									src={healthPoints}
								/>
							)}
							<Dropdown className="card__ellipsis">
								<Dropdown.Toggle as={ellipsis} />
								<Dropdown.Menu className="card__ellipsis__option">
									<Dropdown.Item
										onClick={() => {
											dispatch(
												fetchAppHealthCard(
													appId,
													cardId
												)
											);
										}}
									>
										<div className="d-flex flex-column">
											Refresh Card
										</div>
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</div>
					</div>
					<div className="card__title">{cardTitle}</div>
					<div className="card__description">{cardDescription}</div>
					{reviewMeta && (
						<div className="review__wrapper">
							<div className="d-flex align-items-center">
								<img src={cardIcons[reviewMeta?.icon]} />
								&nbsp;
								{reviewMeta?.title && (
									<span className="review__title">
										{getStringFromTemplate(
											reviewMeta.title,
											meta
										)}
									</span>
								)}
								{reviewMeta?.subtitle && (
									<>
										<img src={IncreaseArrow} />{" "}
										<span className="review__subtitle">
											{getStringFromTemplate(
												reviewMeta.subtitle,
												meta
											)}
										</span>
									</>
								)}
							</div>
							<div className="review__action">
								<a
									target="_blank"
									rel="noreferrer"
									href={REDIRECT_ENTITY[
										reviewMeta?.redirect_entity || "user"
									](appId)}
									className="m-1"
								>
									{reviewMeta?.review_label}
								</a>
								<img src={RedirectArrow} />
							</div>
						</div>
					)}
				</div>
			) : null}
			{children}
		</Card>
	);
}
