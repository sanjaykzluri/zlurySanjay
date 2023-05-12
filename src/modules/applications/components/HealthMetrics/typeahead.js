import { updateStep } from "common/Stepper/redux";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import React, { useState } from "react";
import { patchApplication, updateAppOwner } from "services/api/applications";
import { searchAppCategories, searchUsers } from "services/api/search";
import { Button } from "UIComponents/Button/Button";
import UpdateCardFooter from "./UpdateCardFooter";
import healthPoints from "assets/applications/card_health_points.svg";
import { useSelector } from "react-redux";

const fieldMap = {
	user: {
		api: searchUsers,
		displayKey: "user_name",
		apiKey: "user_id",
		label: "Owner",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
		updateFn: updateAppOwner,
	},
	app_category: {
		api: searchAppCategories,
		displayKey: "name",
		apiKey: "_id",
		label: "Cateogry",
		imageKey: "profile_img",
		allowFewSpecialCharacters: true,
		updateFn: updateAppOwner,
	},
};
export default function TypeaheadCard({
	label,
	reset,
	entity,
	updateStep,
	field,
	app,
	search_entity,
	handleSubmit,
	setValue,
	value,
	localData,
	updateLocalData,
	...rest
}) {
	const [option, setOption] = useState(null);
	const [submitting, setsubmitting] = useState(false);
	const { SHOW_HEALTH_POINTS } = useSelector((state) => state.featureFlags);

	return (
		<div className="d-flex flex-column h-100">
			{SHOW_HEALTH_POINTS && (
				<img
					width={43}
					height={19}
					className="card__healthpoints align-self-end"
					src={healthPoints}
				/>
			)}
			<div>
				<div className="card__title">{label}</div>
				<AsyncTypeahead
					label=""
					placeholder={label}
					text={localData?.text}
					onTextChange={(text) => updateLocalData({ text })}
					fetchFn={fieldMap[search_entity]?.api}
					invalidMessage="Please enter the owner's name."
					onSelect={(selection) => {
						"id", selection.user_id;
						setOption({
							id: selection[fieldMap[search_entity].apiKey],
							name: selection[fieldMap[search_entity].displayKey],
						});
						setValue(selection[fieldMap[search_entity].apiKey]);
					}}
					keyFields={{
						id: fieldMap[search_entity]?.apiKey,
						image: "profile_img",
						value: fieldMap[search_entity]?.displayKey,
						email: "user_email",
					}}
					suggestionMenuClassname="health__card__typeahead__suggestions"
					allowFewSpecialCharacters
				/>
			</div>
			<UpdateCardFooter
				className="health__card__footer__fixed"
				onCancel={reset}
				onSubmit={updateStep}
				displayKey={!option}
				submitting={submitting}
				disableSave={typeof value !== "string" || value?.length < 1}
			/>
		</div>
	);
}
