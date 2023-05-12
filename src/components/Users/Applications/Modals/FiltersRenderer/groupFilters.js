import React, { useState, useEffect } from "react";
import {
	Form,
	Button,
	Spinner,
	Accordion,
	Tooltip,
	Card,
	OverlayTrigger,
} from "react-bootstrap";
import { fieldComponentMap } from "./fieldComponentMap";
import { useSelector, useDispatch } from "react-redux";
import { ACTION_TYPE } from "./groupsReducer";
const entityMap = {
	applications: [
		{
			field_name: "Applications",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "app_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
	],
	users: [
		{
			field_name: "Users",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "user_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
	],
	vendors: [
		{
			field_name: "Vendors",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "vendor_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
	],
	payments: [
		{
			field_name: "Payments",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "payment_method_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
	],
	departments: [
		{
			field_name: "Departments",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "department_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
	],
	transactions: [
		{
			field_name: "Transactions",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "transaction_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
	],
	integrations: [
		{
			field_name: "Integrations",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "integration_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
	],
	licenses: [
		{
			field_name: "Licenses",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "license_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
	],
	contracts: [
		{
			field_name: "Contracts",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "contract_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
	],
	userapplications: [
		{
			field_name: "Users",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "user_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
		{
			field_name: "Applications",
			field_type: "entityautocomplete",
			field_values: [],
			field_id: "app_id",
			filter_type: "string",
			negative: false,
			is_field_static: true,
			editable: false,
			draggable: false,
			is_sortable: true,
			sort_default_value: 1,
			is_filterable: true,
		},
	],
};

const accordingKey = {
	entity_group: "Entity",
};

export function GroupFilters({
	group_filters,
	add,
	renderField,
	applied_filters,
}) {
	const dispatch = useDispatch();
	const [groupFilters, setgroupFilters] = useState(group_filters);
	const entity_type = useSelector(
		(state) => state?.groups_filters?.entity_type
	);
	const current_filters = useSelector((state) =>
		state?.groups_filters?.entity_group?.slice(1)
	);
	useEffect(() => {
		if (entity_type && entityMap[entity_type]) {
			setgroupFilters((prevState) => ({
				entity_group: [
					...prevState.entity_group,
					...entityMap[entity_type],
				],
			}));
		} else {
			setgroupFilters((prevState) => ({
				entity_group: [prevState.entity_group[0]],
			}));
		}
	}, [entity_type]);

	return (
		<>
			{Object.keys(groupFilters)?.map((key) => {
				return (
					<Accordion
						className="allapps__filter__item"
						key={key}
						hidden={!key}
					>
						<Card
							style={{
								border: "1px solid #EBEBEB",
								lineHeight: "18px",
								fontSize: "14px",
							}}
						>
							<Accordion.Toggle
								as={Card.Header}
								eventKey="0"
								className="allapps__filter__item-header"
							>
								<div className="flex">
									<div className="flex">
										<div>{accordingKey[key]}</div>
										{key.show_tooltip && (
											<div className="ml-2">
												<OverlayTrigger
													placement="top"
													overlay={
														<Tooltip>
															<div>
																{
																	key.description
																}
															</div>
														</Tooltip>
													}
												>
													<img
														height={15}
														width={15}
														src={tooltipInfo}
													/>
												</OverlayTrigger>
											</div>
										)}
									</div>
									{entity_type && (
										<div
											style={{
												color: "#5ABAFF",
												marginLeft: "10px",
												backgroundColor:
													"rgba(90, 186, 255, 0.1)",
												paddingX: "5px",
												paddingY: "2px",
											}}
											className="md-chip"
										>
											<span
												style={{ marginRight: "3px" }}
											>
												{entity_type}
												{current_filters?.length > 0 &&
													":"}
											</span>
											{current_filters?.length > 1 &&
												current_filters?.map((e) => (
													<>
														{e.field_name}:
														{e.field_values.length}
													</>
												))}
											{current_filters?.length === 1 &&
												current_filters?.map((e) => (
													<>
														{e.field_values.length >
														1
															? e.field_values
																	.length
															: e.field_values[0]
																	?.name}
													</>
												))}
										</div>
									)}
								</div>
								<div>
									<img id={key} src={add} />
								</div>
							</Accordion.Toggle>
							{groupFilters[key].map((listItem) => {
								return (
									<>
										<Accordion.Collapse eventKey="0">
											<Card.Body
												style={{
													padding: "0 5px 0 5px",
												}}
											>
												{renderField(
													fieldComponentMap[
														listItem.searchable
															? "autocomplete"
															: listItem.field_type
													],
													{
														...listItem,
														group_key: key,
													}
												)}
											</Card.Body>
										</Accordion.Collapse>
									</>
								);
							})}
						</Card>
					</Accordion>
				);
			})}
		</>
	);
}
