import React, { useEffect, useState } from "react";
import { getAllCustomField } from "modules/custom-fields/redux/custom-field";
import { useDispatch, useSelector } from "react-redux";
import { InlineEditCFValue } from "./EntityFieldRenderer";
import TextField from "./TextField";
import SelectRenderer from "./SelectRenderer";
import { patchApplication, patchVendors } from "services/api/applications";
import BooleanRenderer from "./BooleanRenderer";
import { patchUser } from "services/api/users";
import DateFieldRenderer from "./DateFieldRenderer";
import { patchDepartments } from "services/api/departments";

const fieldRendererMap = {
	reference: InlineEditCFValue,
	text: TextField,
	select: SelectRenderer,
	data: TextField,
	bool: BooleanRenderer,
	date: DateFieldRenderer,
};
const patchAPImap = {
	application: patchApplication,
	users: patchUser,
	departments: patchDepartments,
	vendors: patchVendors,
};

export default function CustomFieldRenderer({
	data,
	column,
	entity,
	handleRefresh,
	idx,
}) {
	const { customFields } = useSelector((state) => state);
	const [customFieldData, setCustomFieldData] = useState({});
	const [field, setField] = useState();
	// let field =
	useEffect(() => {
		if (Object.keys(customFields).length && entity) {
			const customField = customFields[entity]?.find(
				(field) => field.name === column.group_name
			);
			if (customField) {
				setField(customField);
				const customFieldData = data?.custom_fields?.find(
					(field) => field.field_id === customField.id
				);
				setCustomFieldData(customFieldData);
			}
		}
	}, [customFields, idx]);

	const dispatch = useDispatch();
	useEffect(() => {
		if (!Object.keys(customFields)?.length) dispatch(getAllCustomField());
	}, []);

	return (
		<>
			{field &&
				fieldRendererMap[field.type] &&
				React.createElement(
					fieldRendererMap[field.type] || fieldRendererMap.text,
					{
						...field,
						...customFieldData,
						handleRefresh,
						patchAPI:
							patchAPImap[entity] || patchAPImap.application,
						entity_id: data._id,
					}
				)}
		</>
	);
}
