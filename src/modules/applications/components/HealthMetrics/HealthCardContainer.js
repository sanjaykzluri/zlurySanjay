import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { appSecurityRescan, patchApplication } from "services/api/applications";
import { reviewAllAppUsers } from "services/api/users";
import ApplicationAuthStatusDropdown from "../overview/ApplicationAuthStatusDropdown";
import CardActionButton from "./CardActionButton";
import CompletedCard from "./CompletedCard";
import DropDownButton from "./DropDownButton";
import HealthCard from "./HealthCard";
import OptionsCard from "./OptionsCard";
import RedirectButton from "./RedirectButton";
import { cardStepSelector, localDataSelector, resetStep, updateCardLocalData, updateStep } from "./redux";
import TextAction from "./textAction";
import TypeaheadCard from "./typeahead";
const cardActionTypes = {
	search: {
		steps: [
			{ component: "actionButton", showCard: true, },
			{ component: "typeahead", showCard: false, largeWidth: true },
			{ component: "final", showCard: false },
		],
	},
	radio: {
		steps: [
			{ component: "actionButton", showCard: true, },
			{ component: "radio", showCard: false, largeWidth: true },
			{ component: "final", showCard: false },
		],
	},
	text: {
		steps: [
			{ component: "actionButton", showCard: true, },
			{ component: "text", showCard: true, largeWidth: true},
			{ component: "final", showCard: false },
		],
	},
	select: {
		steps: [
			{ component: "dropDownButton", showCard: true,},
			{ component: "final", showCard: false },
		],
	},
	auth_dropdown: {
		steps: [
			{ component: "dropDownButton", showCard: true,},
			{ component: "final", showCard: false },
		],
	},
	default: {
		steps: [
			{ component: "default", showCard: true, onSubmit: () => null },
		],
	},
	redirect: {
		steps: [
			{ component: "redirectButton", showCard: true, type: "redirect" },
			{ component: "final", showCard: false },
		],
	},
	review: {
		steps: [
			{ component: "actionButton", showCard: true, type: "review" },
			{ component: "final", showCard: false },
		],
	},
	custom: {
		steps: [
			{ component: "actionButton", showCard: true, type: "custom" },
			{ component: "final", showCard: false },
		],
	},

	// text: {
	//     steps: [Card]
	// },
	// redirect: {

	// }
};

const componentsMap = {
	actionButton: <CardActionButton />,
	redirectButton: <RedirectButton />,
	dropDownButton: <DropDownButton />,
	authDropDown: <ApplicationAuthStatusDropdown />,
	typeahead: <TypeaheadCard />,
	radio: <OptionsCard />,
	text: <TextAction />,
	final: <CompletedCard />,
	default: <div></div>,
};

const actions = {
	security_rescan: appSecurityRescan,
	review_users: reviewAllAppUsers,
}
// const actionComponents = {
//     Card: <SearchButton />
// }
export default function HealthCardContainer({
	card_id,
	title,
	description,
	logo,
	healthScore,
	meta,
	action,
	review_meta,
	isRecommended,
	app,
	fetchAppDetails,
	icon,
	tab
}) {
	const step = useSelector(cardStepSelector(card_id));
	const localData = useSelector(localDataSelector(card_id));
	const dispatch =  useDispatch();
	const updateLocalData = (data) => dispatch(updateCardLocalData(card_id, data));
	const [submitting, setsubmitting] = useState(false);
	const [value, setValue] = useState("");
	const {steps} = cardActionTypes?.[action?.type] || cardActionTypes.default;
	const { component, showCard, onSubmit, largeWidth, style, type } = steps[step];
	const patchApp = () => {
		const patchObj = {
			op: action?.op || "replace",
			field: action?.field,
			value: value,
		};
		let data = {
			patches: [patchObj],
		};
		return patchApplication(app?.app_id, data)
		.then(() => fetchAppDetails(false))
	}
	
	const handleSubmit = () => {
		if(action.type === "custom")
		{
			setsubmitting(true)
			const customAction = actions[action.custom_action];
			return customAction(app.app_id).then(() => setsubmitting(false))
		}
		return patchApp();
		// setShow(false)
		
	};
	return (
		<HealthCard
			showCard={showCard}
			title={title}
			description={description}
			logo={logo}
			icon={icon}
			healthScore={healthScore}
			meta={meta}
			action={action}
			reviewMeta={review_meta}
			largeWidth={largeWidth}
			updateStep={() => updateStep((step) => step + 1)}
			isFirstStep={step === 0}
			containerStyle={style}
			isRecommended={isRecommended}
			appId={app?.app_id}
			cardId={card_id}
		>
			{React.cloneElement(componentsMap[component], {
				...action,
				cardId: card_id,
				app,
				title,
				meta,
				type,
				updateStep: () => dispatch(updateStep(card_id)),
				submitting,
				handleSubmit,
				reset: () => dispatch(resetStep(card_id)),
				onSubmit,
				value,
				setValue,
				localData,
				updateLocalData,
				tab
			})}
		</HealthCard>
	);
}
