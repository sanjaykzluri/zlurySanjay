import React from "react";
import "./styles.css";
import { planExpirySelector, planSelector } from "./index";
import UpgradeButton from "./UpgradeButton";
import processingIcon from "../../components/GettingStarted/processingIcon.svg";
import { useSelector } from "react-redux";
import { ENTITIES } from "../../constants";
import { onBoardingStatuses } from "../../components/Overview/Overviewins";
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
		subtitle: "Please upgrade to manage your SaaS stack efficiently.",
	},
	basic: {
		title: "Your free trial has ended.",
		subtitle: "Please upgrade to manage your SaaS stack efficiently.",
	},
};

const orgIntegrationStatusSelector = (state) => state.userInfo.org_status;

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

const processingStripEntities = [
	ENTITIES.APPLICATIONS,
	ENTITIES.USERS,
	ENTITIES.DEPARTMENT,
	ENTITIES.TRANSACTIONS,
];

function Strips({ className, style, entity }) {
	const plan = useSelector(planSelector);
	const planExpiryDaysLeft = useSelector(planExpirySelector);
	const orgIntegrationStatus = useSelector(orgIntegrationStatusSelector);
	const title =
		plan === PLANS.TRIAL
			? getTrialPlanTitle(planExpiryDaysLeft)
			: entityMetadata[plan]?.title;
	const subtitle = entityMetadata[plan]?.subtitle;

	return (
		<>
			{shouldShowBanner(plan, entity) ? (
				<div
					className={`strip__wrapper upgrade-strip-wrapper ${className}`}
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
			{orgIntegrationStatus === onBoardingStatuses.PROCESSING &&
			processingStripEntities.includes(entity) ? (
				<div
					className={`strip__wrapper processing__strip__wrapper ${className}`}
					style={style}
				>
					<img src={processingIcon} />
					<div className="processing__strip__description">
						<span className="processing__strip__title">
							{" "}
							We’re processing your data.
						</span>
						<span className="processing__strip__subtitle">
							{" "}
							Your {`${entity}`} data is being populated.
						</span>
					</div>
				</div>
			) : null}
		</>
	);
}

export default Strips;
