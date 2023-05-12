import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import React, { useState, useEffect } from "react";
import ContentLoader from "react-content-loader";
import { useDispatch, useSelector } from "react-redux";
import { searchAllApps, searchUsers } from "services/api/search";
import { DatePicker } from "../../../../UIComponents/DatePicker/DatePicker";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import { convertArrayToBindSelect } from "../../../../utils/convertDataToBindSelect";
import {
	FIELD_TYPE,
	KEY_FIELDS,
} from "../../../custom-fields/constants/constant";
import { getAllCustomField } from "../../../custom-fields/redux/custom-field";
import "./CustomFieldSectionInForm.css";

export function CustomFieldSectionInForm(props) {
	const data = useSelector((state) => state.customFields);
	const [isLoading, setIsLoading] = useState(true);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!Object.keys(data).length) dispatch(getAllCustomField());
		else {
			setIsLoading(false);
		}
	}, [data, props]);

	const mapFieldValueToField = (fields = [], field_id) =>
		fields.find((field) => field.field_id === field_id);

	const customFields = data[props.of]
		? data[props.of].map((field, index) => {
				const value = mapFieldValueToField(
					props.customFieldData,
					field.id
				)
					? mapFieldValueToField(props.customFieldData, field.id)
							.field_value
					: "";
				const isDatePicker =
					FIELD_TYPE.DATE_PICKER.VALUE === field.type;
				const placeholder = `${
					field.type === FIELD_TYPE.TEXT.VALUE ? "Enter" : "Select"
				} ${field.name}`;
				const options = convertArrayToBindSelect(field.options);
				let customEntityValue = mapFieldValueToField(
					props.customFieldData,
					field.id
				);
				return (
					<div className="z__cf__field mb-4 w-100" key={index}>
						<label> {field.name} </label>
						{[
							FIELD_TYPE.DROPDOWN.VALUE,
							FIELD_TYPE.BOOLEAN.VALUE,
						].includes(field.type) && (
							<SelectOld
								value={value}
								className="m-0"
								options={options}
								placeholder={placeholder}
								onSelect={(v) => {
									props.onValueChange(field.id, v.value);
								}}
							/>
						)}
						{FIELD_TYPE.TEXT.VALUE === field.type && (
							<input
								value={value}
								placeholder={placeholder}
								type="text"
								className="w-100 pl-2"
								onChange={(e) => {
									props.onValueChange(
										field.id,
										e.target.value
									);
								}}
							/>
						)}
						{field.type === "reference" && (
							<AsyncTypeahead
								placeholder={field.name}
								fetchFn={
									field.reference === "orgusers"
										? searchUsers
										: searchAllApps
								}
								invalidMessage="Please enter the name."
								defaultValue={
									customEntityValue?.custom_field_name
								}
								onSelect={(selection) => {
									props.onValueChange(
										field.id,
										selection[
											KEY_FIELDS[field.reference].id
										]
									);
								}}
								keyFields={KEY_FIELDS[field.reference]}
								allowFewSpecialCharacters={true}
							/>
						)}
						{isDatePicker && (
							<DatePicker
								value={value ? new Date(value) : null}
								hideIcon={true}
								onChange={(v) => {
									props.onValueChange(field.id, v);
								}}
								placeholder={placeholder}
							/>
						)}
					</div>
				);
		  })
		: null;

	const loader = [1, 2, 3, 4].map((res, index) => (
		<div className="z__cf__field" key={index}>
			<ContentLoader
				speed={2}
				width={180}
				height={16}
				viewBox="0 0 180 16"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
			>
				<rect width="180" height="16" />
			</ContentLoader>
		</div>
	));

	return (
		<>
			{
				<div className="z__cf_form_field mt-2">
					{!isLoading && customFields?.length ? (
						<div className="z__cf_form_header">
							<h3 className="text-uppercase font-14 grey bold-normal">
								Custom fields
							</h3>
							<hr className="mt-0" />
						</div>
					) : null}
					<div className="z__cf_form_body d-flex flex-wrap">
						{isLoading ? loader : customFields}
					</div>
				</div>
			}
		</>
	);
}
