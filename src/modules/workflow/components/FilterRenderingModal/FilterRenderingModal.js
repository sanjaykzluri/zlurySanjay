import React, { useEffect, useState, useRef, useCallback } from "react";
import {
	Form,
	Button,
	Spinner,
	Accordion,
	Card,
	OverlayTrigger,
} from "react-bootstrap";
import close from "../../../../assets/close.svg";
import add from "../../../../assets/add-blue.svg";
import closeIcon from "../../../../assets/close-icon.svg";
import tooltipInfo from "../../../../assets/warning-solid.svg";
import { fieldComponentMap } from "../../components/FiltersRenderer/fieldComponentMap";
import {
	applyFilters,
	ACTION_TYPE,
} from "../../components/FiltersRenderer/redux";
import { useDispatch, useSelector } from "react-redux";
import _ from "underscore";
import {
	dateConstants,
	fieldNames,
	rangeConstants,
} from "../../../../constants/reports";
import dayjs from "dayjs";
import moment from "moment";
import OverlayTooltip from "UIComponents/OverlayToolTip";
import { Tooltip } from "react-bootstrap";
import { trackActionSegment } from "modules/shared/utils/segment";
import { GroupFilters } from "components/Users/Applications/Modals/FiltersRenderer/groupFilters";

export function FilterRenderingModal({
	onHide,
	submitting,
	handleSubmit,
	filterPropertyList,
	appliedFilters,
	metaData,
	appSourceList,
	groups,
	appLicenseList,
	isRangeFilterRequired,
	onClearAll,
	v2Entity,
	isLoadingSources,
	appliedGroupFilters,
}) {
	const renderField = (Component, fieldProps) =>
		Component && <Component {...fieldProps} />;
	const [filters, setFilters] = useState();
	const [filtersApplied, setFiltersApplied] = useState(appliedFilters);
	const [isResetFilter, setIsResetFilter] = useState(false);
	const [clearAllClicked, setClearAllClicked] = useState(false);
	const dispatch = useDispatch();
	const query = useSelector((state) => state.router.location.query);

	const filtersRedux = useSelector((state) => state.filters);
	useEffect(() => {
		let filters = {};

		if (appliedFilters) {
			appliedFilters
				.filter((el) =>
					filterPropertyList?.find(
						(row) => row.field_id === el.field_id
					)
				)
				.forEach((filter) => {
					filters[filter.field_id] = filter;
				});
		}
		dispatch({
			type: ACTION_TYPE.SET_FILTERS,
			payload: filters,
		});
		if (appliedGroupFilters) {
			dispatch({
				type: "SET_GROUP_FILTERS",
				payload: appliedGroupFilters,
			});
		}

		if (!query.metaData && !_.isEmpty(filtersRedux)) {
			const archiveFilter = appliedFilters.find(
				(filter) => filter.field_id === "app_archive"
			);
			if (archiveFilter)
				dispatch({
					type: ACTION_TYPE.UPDATE_FILTER,
					payload: {
						key: archiveFilter.field_id,
						value: archiveFilter,
					},
				});
		}
	}, []);

	useEffect(() => {
		setFiltersApplied(Object.values(filtersRedux));
		if (!_.isEmpty(filtersRedux)) setIsResetFilter(false);
	}, [filtersRedux]);

	function handleResetFilters() {
		setClearAllClicked(true);
		setIsResetFilter(true);
		dispatch({ type: ACTION_TYPE.RESET_FILTERS });
	}

	const [toggleState, setToggleState] = useState({});

	function handleChange(field_id, bool = true) {
		let img = document.getElementById(field_id);
		if (img) img.src = bool ? closeIcon : add;
		setToggleState({ ...toggleState, [field_id]: !bool });
	}

	const archiveFields = ["app_archive", "user_archive", "dept_archive"];

	useEffect(() => {
		let archiveFilter = {};
		let archiveFilterValue;
		if (filterPropertyList && filtersApplied) {
			const updatedFilters = filterPropertyList
				.filter((filter) => {
					return !!Object.keys(fieldComponentMap).find(
						(fieldType) => filter.field_type === fieldType
					);
				})
				.map((filter) => {
					const matchedItem = filtersApplied.find(
						(appliedFilter) =>
							appliedFilter.field_id === filter.field_id
					);

					archiveFilterValue = filtersApplied.find(
						(appliedFilter) =>
							appliedFilter.field_id === archiveFilter.field_id
					);
					if (filter.field_id === "source_array" && appSourceList) {
						filter.field_values = appSourceList;
						filter.field_type = "select";
					}
					if (
						filter.field_id === "licenses.license_name" &&
						appLicenseList
					) {
						filter.field_values = appLicenseList;
						filter.field_type = "select";
					}

					return {
						...filter,
						...{
							value: matchedItem?.field_values,
							appliedOrder: matchedItem?.field_order,
							isOnly: matchedItem?.is_only,
							timestamp_type: matchedItem?.timestamp_type,
							isNotOf: matchedItem?.negative,
						},
					};
				});

			setFilters(updatedFilters);
		} else if (!filtersApplied) {
			const updatedFilters = filterPropertyList.filter((filter) => {
				if (archiveFields.indexOf(filter?.field_id) > -1) {
					archiveFilter = filter;
				}
				return !!Object.keys(fieldComponentMap).find(
					(fieldType) => filter.field_type === fieldType
				);
			});

			updatedFilters.push(archiveFilter);
			setFilters(updatedFilters);
		}
	}, [filterPropertyList, filtersApplied, appSourceList, isLoadingSources]);

	return (
		<>
			<div
				className="addContractModal__TOP h-100"
				style={{ overflowY: "auto" }}
			>
				<div className="d-flex flex-row align-items-center py-4">
					<div className="m-auto">
						<span className="contracts__heading">Filters</span>
					</div>
					<img
						alt="Close"
						onClick={onHide}
						src={close}
						className="cursor-pointer mr-4"
					/>
				</div>
				<div
					className="flex py-2 px-4"
					style={{
						background: "#EBEBEB",
						justifyContent: "space-between",
					}}
				>
					<div
						style={{
							fontSize: "12px",
						}}
					>
						{filtersApplied?.length}{" "}
						{filtersApplied?.length === 1 ? "Filter" : "Filters"}{" "}
						Applied
					</div>
					<div
						style={{
							fontSize: "12px",
							color: "#2266E2",
							fontWeight: 600,
							cursor: "pointer",
						}}
						onClick={handleResetFilters}
					>
						Clear All
					</div>
				</div>
				<div
					style={{ padding: 0, marginBottom: "200px" }}
					className="allapps__uppermost border-top border-bottom"
				>
					{filters?.map((listItem) => {
						return (
							!listItem.exclude_from_filters && (
								<Accordion
									className="allapps__filter__item"
									key={listItem.field_id}
									hidden={!listItem.field_id}
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
											onClick={(e) =>
												handleChange(
													listItem.field_id,
													toggleState[
														listItem.field_id
													]
												)
											}
											eventKey="0"
											className="allapps__filter__item-header"
										>
											<div className="flex">
												<div className="flex">
													<div>
														{listItem.field_name}
													</div>
													{listItem.show_tooltip && (
														<div className="ml-2">
															<OverlayTrigger
																placement="top"
																overlay={
																	<Tooltip>
																		<div>
																			{
																				listItem.description
																			}
																		</div>
																	</Tooltip>
																}
															>
																<img
																	height={15}
																	width={15}
																	src={
																		tooltipInfo
																	}
																/>
															</OverlayTrigger>
														</div>
													)}
												</div>
												<>
													{listItem?.value?.length >
														0 &&
														((typeof listItem
															?.value[0] ===
															"string" &&
															listItem.field_type !==
																"date_range" &&
															listItem?.value[0]
																?.length > 0) ||
															(typeof listItem
																.value[0] ===
																"object" &&
																listItem
																	.value[0]
																	?.value
																	?.length >
																	0)) && (
															<div
																style={{
																	color: "#5ABAFF",
																	marginLeft:
																		"10px",
																	backgroundColor:
																		"rgba(90, 186, 255, 0.1)",
																	paddingX:
																		"5px",
																	paddingY:
																		"2px",
																}}
																className="md-chip"
															>
																{listItem?.value &&
																	(listItem
																		?.value
																		?.length >
																	1
																		? listItem
																				?.value
																				?.length
																		: typeof listItem
																				.value[0] ===
																		  "string"
																		? decodeURIComponent(
																				listItem?.value[0]
																					?.charAt(
																						0
																					)
																					.toUpperCase() +
																					listItem?.value[0]?.slice(
																						1
																					)
																		  )
																		: listItem
																				?.value[0]
																				?.renderValue)}
															</div>
														)}
													{typeof listItem?.value ===
														"boolean" && (
														<div
															style={{
																color: "#5ABAFF",
																marginLeft:
																	"10px",
																backgroundColor:
																	"rgba(90, 186, 255, 0.1)",
																paddingX: "5px",
																paddingY: "2px",
															}}
															className="md-chip"
														>
															{listItem?.value
																.toString()
																.charAt(0)
																.toUpperCase() +
																listItem?.value
																	.toString()
																	.slice(
																		1
																	) ===
															"True"
																? fieldNames[
																		listItem
																			?.field_name
																  ]
																	? `is ${
																			fieldNames[
																				listItem
																					?.field_name
																			]?.[0]
																	  }`
																	: "True"
																: fieldNames[
																		listItem
																			?.field_name
																  ]
																? `is ${
																		fieldNames[
																			listItem
																				?.field_name
																		]?.[1]
																  }`
																: "False"}
														</div>
													)}
													{Array.isArray(
														listItem?.value
													) &&
														Array.isArray(
															listItem?.appliedOrder
														) &&
														listItem?.value &&
														listItem?.field_type ===
															"range" &&
														(listItem?.value
															?.length > 1 ? (
															<div
																style={{
																	color: "#5ABAFF",
																	marginLeft:
																		"10px",
																	backgroundColor:
																		"rgba(90, 186, 255, 0.1)",
																	paddingX:
																		"5px",
																	paddingY:
																		"2px",
																}}
																className="md-chip"
															>
																{`is between  ${listItem?.value[0]} and ${listItem?.value[1]}`}
															</div>
														) : listItem?.value
																?.length ===
														  1 ? (
															<div
																style={{
																	color: "#5ABAFF",
																	marginLeft:
																		"10px",
																	backgroundColor:
																		"rgba(90, 186, 255, 0.1)",
																	paddingX:
																		"5px",
																	paddingY:
																		"2px",
																}}
																className="md-chip"
															>
																{
																	rangeConstants[
																		listItem
																			?.appliedOrder?.[0]
																	]
																}
																{` ${listItem?.value?.[0]}`}
															</div>
														) : null)}
													{Array.isArray(
														listItem?.value
													) &&
														Array.isArray(
															listItem?.appliedOrder
														) &&
														listItem?.value &&
														listItem?.field_type ===
															"date_range" &&
														(listItem?.value
															?.length > 1 ? (
															<div
																style={{
																	color: "#5ABAFF",
																	marginLeft:
																		"10px",
																	backgroundColor:
																		"rgba(90, 186, 255, 0.1)",
																	paddingX:
																		"5px",
																	paddingY:
																		"2px",
																}}
																className="md-chip"
															>
																{`is between  ${moment(
																	listItem
																		?.value[0]
																).format(
																	"DD MMM YYYY"
																)} and ${moment(
																	listItem
																		?.value[1]
																).format(
																	"DD MMM YYYY"
																)}`}
															</div>
														) : listItem?.value
																?.length ===
														  1 ? (
															<div
																style={{
																	color: "#5ABAFF",
																	marginLeft:
																		"10px",
																	backgroundColor:
																		"rgba(90, 186, 255, 0.1)",
																	paddingX:
																		"5px",
																	paddingY:
																		"2px",
																}}
																className="md-chip"
															>
																{!listItem?.timestamp_type &&
																listItem
																	?.value?.[0]
																	.time
																	? ` ${
																			dateConstants[
																				listItem
																					.appliedOrder?.[0]
																			]
																	  }
								${listItem?.value?.[0].time} days from now `
																	: listItem?.timestamp_type &&
																	  `${
																			rangeConstants[
																				listItem
																					?.appliedOrder?.[0]
																			]
																	  } ${moment(
																			listItem
																				?.value?.[0]
																	  ).format(
																			"D MMM YYYY"
																	  )}`}
															</div>
														) : null)}
												</>
											</div>
											<div>
												<img
													id={listItem.field_id}
													src={add}
												/>
											</div>
										</Accordion.Toggle>
										<Accordion.Collapse eventKey="0">
											<Card.Body>
												{renderField(
													fieldComponentMap[
														listItem.searchable
															? "autocomplete"
															: listItem.field_type
													],
													{
														...listItem,
														appSourceList,
														appLicenseList,
														isLoadingSources,
													}
												)}
											</Card.Body>
										</Accordion.Collapse>
									</Card>
								</Accordion>
							)
						);
					})}
					{groups && groups.entity_group?.length > 0 && (
						<GroupFilters
							group_filters={groups}
							add={add}
							renderField={renderField}
						/>
					)}
				</div>

				<div
					className="fixed-bottom text-right border-top bg-white py-4"
					style={{
						left: "calc(100% - 528px)",
						zIndex: 200,
					}}
				>
					<Button
						variant="link"
						size="sm"
						className="mr-2"
						onClick={onHide}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						disabled={submitting}
						onClick={() => {
							dispatch(applyFilters(isResetFilter));
							if (clearAllClicked) {
								onClearAll && onClearAll();
							}
							handleSubmit && handleSubmit();
							onHide();
							trackActionSegment(
								"Clicked on Apply button in Filter Modal.",
								{ currentPageName: v2Entity }
							);
						}}
						style={{ marginRight: "40px" }}
					>
						Apply
						{submitting && (
							<Spinner
								animation="border"
								role="status"
								variant="light"
								size="sm"
								className="ml-2"
								style={{ borderWidth: 2 }}
							>
								<span className="sr-only">Loading...</span>
							</Spinner>
						)}
					</Button>
				</div>
			</div>
		</>
	);
}
