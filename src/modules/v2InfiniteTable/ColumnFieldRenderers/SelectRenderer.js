import {
	FIELD_TYPE,
	KEY_FIELDS,
} from "modules/custom-fields/constants/constant";
import { InlineEditField } from "modules/shared/containers/InlineEditField/InlineEditField";
import React from "react";
import { convertArrayToBindSelect } from "utils/convertDataToBindSelect";

export default function SelectRenderer({
	entityId,
	name,
	field_value,
	id,
	type,
	custom_field_id,
	custom_field_name,
	cfValue,
	options,
	handleRefresh,
	reference,
	referenceDisplayValue,
	selectedId,
	...rest
}) {
	return (
		<InlineEditField
			updateService={rest.patchAPI.bind(null, rest.entity_id)}
			patch={{
				op: field_value ? "replace" : "add",
				field: "custom_fields",
				value: field_value,
				custom_field_id: id,
			}}
			title={name}
			hideTitle={true}
			placeholder={`${
				type === FIELD_TYPE.TEXT.VALUE ? "Enter" : "Select"
			} ${name}`}
			inlineValueClassName="schedule-name-inline-edit"
			type={type}
			options={convertArrayToBindSelect(options)}
			refreshPage={handleRefresh}
			reference={reference}
			referenceDisplayValue={referenceDisplayValue}
			keyFields={KEY_FIELDS[reference]}
			selectedId={selectedId}
		/>
	);
}
