import React from "react";
import "./styles.css";
import { Button } from "../../UIComponents/Button/Button";
import { planExpirySelector, planSelector } from "./index";
import UpgradeButton from "./UpgradeButton";
import { useSelector } from "react-redux";
import { ENTITIES } from "../../constants";
import { getValueFromLocalStorage } from "utils/localStorage";
const defaultTitle =
	"Your trial has ended. Upgrade to continue using all features.";

const PLANS = {
	TRIAL: "trial",
	BASIC: "basic",
	PRO: "pro",
};

const entityMetadata = {
	trial: {
		expiredTitle: "Your free trial has ended.",
		title: `Your ${
			getValueFromLocalStorage("partner")?.name
		} trial ends in {x} days.`,
		subtitle: "Manage your SaaS stack for as low as $5 per user/month",
	},
	basic: {
		title: "Your free trial has ended.",
		subtitle: "Manage your SaaS stack for as low as $5 per user/month",
	},
};
const restrictedPlans = [PLANS.TRIAL, PLANS.BASIC];

function getTrialPlanTitle(expiry) {
	if (expiry > 0) {
		return entityMetadata[PLANS.TRIAL]?.title?.replace("{x}", expiry);
	} else {
		return entityMetadata[PLANS.TRIAL]?.expiredTitle;
	}
}

function shouldShowBanner(plan, entity) {
	if (plan === PLANS.BASIC) return true;
	if (plan === PLANS.TRIAL && entity === ENTITIES.OVERVIEW) return true;
	return false;
}

function UpgradeStrip({ className, style, entity }) {
	const plan = useSelector(planSelector);
	const planExpiryDaysLeft = useSelector(planExpirySelector);
	const title =
		plan === PLANS.TRIAL
			? getTrialPlanTitle(planExpiryDaysLeft)
			: entityMetadata[plan]?.title;
	const subtitle = entityMetadata[plan]?.subtitle;

	return (
		<>
			{shouldShowBanner(plan, entity) ? (
				<div
					className={`upgrade__strip__wrapper ${className}`}
					style={style}
				>
					<div>
						{title && (
							<div className="upgrade__strip__title">{title}</div>
						)}
						<div className="upgrade__strip__subtitle">
							{subtitle || defaultTitle}
						</div>
					</div>
					<UpgradeButton />
				</div>
			) : null}
		</>
	);
}

export default UpgradeStrip;
