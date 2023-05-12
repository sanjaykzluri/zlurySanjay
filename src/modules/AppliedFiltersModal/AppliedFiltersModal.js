import React, { useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import moment from "moment";
import "./AppliedFiltersModal.css";
import { rangeConstants, fieldNames, dateConstants } from "constants/reports";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router/immutable";
import cross from "assets/cross-filter.svg";
import filterIcon from "assets/filterfunnel.svg";
import { ACTION_TYPE } from "components/Users/Applications/Modals/FiltersRenderer/redux";
import { useOutsideClickListener } from "utils/clickListenerHook";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { escapeURL, isEmpty } from "utils/common";
import { filtersRequestBodyGenerator } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";
import { trackActionSegment } from "modules/shared/utils/segment";
import _ from "underscore";

export function AppliedFiltersModal({
	searchQuery,
	metaData,
	onResetFilters,
	preventScroll,
	setShowFilterModal,
	showResetAll = true,
	isLoadingData,
	v2Entity,
}) {
	const ref = useRef();
	const [showAppliedFiltersModal, setShowAppliedFiltersModal] =
		useState(false);
	const router = useSelector((state) => state.router);
	const { hash, pathname, query } = router.location;
	const [numberPill, setnumberPill] = useState(0);
	useEffect(() => {
		setnumberPill(0);
		if (metaData?.filter_by?.length > 0) {
			setnumberPill(metaData.filter_by.length);
		}
		if (metaData?.group_filter_by?.entity_group?.length > 0) {
			setnumberPill(
				(prevState) =>
					prevState + metaData.group_filter_by.entity_group.length
			);
		}
	}, [metaData]);
	const getSingleRow = (filter) => {
		function getRangeDateRangeTextForFilter() {
			let condition;
			if (
				Array.isArray(filter.field_order) &&
				filter.field_order?.length > 1
			) {
				condition = "is between ";
			} else if (Array.isArray(filter.field_order)) {
				condition = `is ${rangeConstants[filter.field_order[0]]} `;
			}

			return condition;
		}

		function displayFiltersApplied(values) {
			if (values && values.length > 1) {
				return (
					<>
						<span
							style={{ padding: "4px" }}
							className="white-bg font-12 cursor-pointer grey-1"
						>
							{Array.isArray(filter?.field_values) &&
							Object.keys(filter.field_values?.[0]).length > 0
								? values[0].renderValue
									? values[0].renderValue.slice(0, 1)
									: typeof values[0] === "string"
									? values.slice(0, 1)
									: values.map((e) => e.name).slice(0, 1)
								: null}
						</span>
						<OverlayTrigger
							placement="bottom"
							overlay={
								<Tooltip className="userMetaInfoCard z-index-10005">
									<div
										style={{
											padding: "10px",
										}}
									>
										{Array.isArray(filter?.field_values) &&
										Object.keys(filter.field_values?.[0])
											.length > 0
											? values[0].renderValue
												? filter?.field_values
														?.map((i) =>
															typeof i ===
															"object"
																? i.renderValue
																: i
														)
														.join(", ")
												: typeof values[0] === "string"
												? values.join(", ")
												: values
														.map((e) => e.name)
														.join(", ")
											: null}
									</div>
								</Tooltip>
							}
						>
							<span
								style={{ padding: "4px" }}
								className="glow_blue white-bg font-12 cursor-pointer ml-1"
							>
								+{values.length - 1}
							</span>
						</OverlayTrigger>
					</>
				);
			}
			return (
				<span
					style={{ padding: "4px" }}
					className="white-bg font-12 cursor-pointer grey-1"
				>
					{Array.isArray(filter?.field_values) &&
					Object.keys(filter.field_values?.[0] || {}).length > 0
						? values[0].renderValue
							? values[0].renderValue
							: typeof values[0] === "string"
							? values.join(", ")
							: values.map((e) => e.name).join(", ")
						: null}
				</span>
			);
		}

		const appliedFilters = Array.isArray(filter?.field_values) ? (
			filter.filter_type?.toLowerCase() === "range" ||
			filter.filter_type?.toLowerCase() === "date_range" ? (
				filter?.field_values.length > 1 ? (
					<div
						className="white-bg font-12 cursor-pointer grey-1"
						style={{ padding: "4px" }}
					>
						{filter.filter_type?.toLowerCase() === "date_range" ? (
							<>
								{moment(
									new Date(filter.field_values[0])
								).format("D MMM YY")}{" "}
								to{" "}
								{moment(
									new Date(filter.field_values[1])
								).format("D MMM YY")}{" "}
							</>
						) : (
							<>
								{filter.field_values[0]} to{" "}
								{filter.field_values[1]}{" "}
							</>
						)}
					</div>
				) : (
					<div
						className="white-bg font-12 cursor-pointer grey-1"
						style={{ padding: "4px" }}
					>
						{filter.timestamp_type ? (
							<>
								{getRangeDateRangeTextForFilter()}
								{moment(
									new Date(filter.field_values[0])
								).format("D MMM YY")}
							</>
						) : filter.filter_type?.toLowerCase() ===
						  "date_range" ? (
							<>
								{dateConstants[filter.field_order[0]]}
								{filter.field_values[0].time} days from now
							</>
						) : (
							<>{filter.field_values[0]}</>
						)}
					</div>
				)
			) : (
				displayFiltersApplied(filter?.field_values)
			)
		) : Array.isArray(filter?.field_values) &&
		  Object.keys(filter.field_values?.[0]).length > 0 ? (
			displayFiltersApplied(
				values?.field_values?.map((i) =>
					typeof i === "object" ? i.renderValue : i
				)
			)
		) : typeof filter.field_values === "object" &&
		  Object.keys(filter.field_values).length > 0 ? (
			displayFiltersApplied(filter.field_values.custom_field_values)
		) : (
			filter?.field_values
		);

		return (
			<div className="applied_filters_modal_content_row d-flex w-100 mb-1 align-items-center">
				<div
					className="grey bold-600 font-12"
					style={{ marginRight: "8px" }}
				>
					{typeof filter?.field_name === "string" &&
						filter?.field_name?.charAt(0).toUpperCase() +
							filter?.field_name?.slice(1)}{" "}
					:
				</div>
				{appliedFilters ? (
					typeof appliedFilters === "boolean" ? (
						<div
							className="white-bg font-12 cursor-pointer grey-1"
							style={{ padding: "4px" }}
						>
							{appliedFilters.toString()}
						</div>
					) : (
						appliedFilters
					)
				) : (
					<div
						className="white-bg font-12 cursor-pointer grey-1"
						style={{ padding: "4px" }}
					>
						false
					</div>
				)}
				{filter.field_name !== "Archive" &&
					filter.field_name !== "Entity" && (
						<>
							<img
								src={cross}
								className="ml-auto cursor-pointer"
								onClick={() =>
									!isLoadingData &&
									handleRemovingFilter(filter)
								}
							></img>
						</>
					)}
			</div>
		);
	};

	const dispatch = useDispatch();

	function handleResetFilters(e) {
		e.stopPropagation();
		setnumberPill(0);
		dispatch(async function (dispatch, getState) {
			const { router } = getState();
			const { hash, query, pathname } = router.location;
			let viewId;
			let reqObj = {};
			if (query.viewId) {
				viewId = query.viewId;
			}
			reqObj.columns = metaData?.columns;
			reqObj.sort_by = metaData?.sort_by;
			reqObj.filter_by = [];
			if (pathname.includes("auditlogs")) {
				reqObj.group_filter_by = {};
			}
			if (hash === "#automation") {
				reqObj.columns = [];
			}
			let url;
			let meta = encodeURIComponent(JSON.stringify(reqObj));
			url = viewId
				? `?metaData=${meta}&viewId=${viewId}${hash}`
				: `?metaData=${meta}${hash}`;
			dispatch(push(url));
			dispatch({
				type: "RESET_GROUP_FILTERS",
			});
		});
		onResetFilters && onResetFilters();
		setShowAppliedFiltersModal(false);
	}

	useOutsideClickListener(ref, () => {
		setShowAppliedFiltersModal(false);
	});

	const handleRemovingFilter = (filterToBeRemoved) => {
		let reqObj = {};
		const { pathname } = router.location;
		let filterByObj = metaData.filter_by
			.filter((filter) => filter.field_id !== filterToBeRemoved.field_id)
			.map((filter) => {
				let obj = {
					field_id: filter.field_id,
					field_name: filter.field_name,
					field_values: filter.field_values,
					filter_type: filter.filter_type,
					field_order: filter.field_order,
					negative: filter.negative,
					is_custom: filter.is_custom || false,
				};

				if (filter.is_custom) {
					obj.field_values = {
						custom_field_id: filter.field_id,
						custom_field_values:
							filter.filter_type === "boolean"
								? [filter.field_values]
								: filter.field_values,
					};
					obj.field_id = filter.original_field_id;
				}
				if (filter.is_exact_array) {
					obj.is_exact_array = filter.is_exact_array;
				}
				return obj;
			});
		let group_filters_empty = true;
		reqObj = filtersRequestBodyGenerator(query);
		if (pathname.includes("auditlogs")) {
			let groupfilterObj = metaData.group_filter_by?.entity_group?.filter(
				(filter) => filter.field_id !== filterToBeRemoved.field_id
			);
			reqObj.group_filter_by = {};
			group_filters_empty = !groupfilterObj?.length > 0;
			reqObj.group_filter_by.entity_group = groupfilterObj;
			reqObj.group_filter_by.entity_type =
				metaData?.group_filter_by?.entity_type;
			dispatch({
				type: "SET_GROUP_FILTERS",
				payload: {
					entity_group: groupfilterObj,
				},
			});
		}

		reqObj.filter_by = filterByObj;

		reqObj.reset_filter = false;
		if (isEmpty(reqObj.filter_by) && group_filters_empty) {
			reqObj.reset_filter = true;
		}
		let meta = encodeURIComponent(JSON.stringify(reqObj));
		dispatch(push(`?metaData=${meta}${hash}`));
		dispatch({
			type: ACTION_TYPE.RESET_FILTERS,
		});
	};

	return (
		<>
			<div
				onClick={() => {
					!isLoadingData && setShowAppliedFiltersModal(true);
					!isLoadingData &&
						trackActionSegment("Clicked on Filter Icon", {
							currentCategory: v2Entity,
						});
				}}
				style={{
					marginRight: "10px",
					position: "relative",
					background: "rgba(90, 186, 255, 0.1)",
					border: "1px solid #EBEBEB",
					height: "33.99px",
				}}
				disabled={true}
				ref={ref}
				className=" filterModal pl-2 pr-2"
			>
				<div className="cursor-pointer align-items-center d-flex h-100">
					<img src={filterIcon} className="mr-1" />
					<span className="grey font-13 mr-2">Filter</span>

					{numberPill > 0 && (
						<NumberPill
							number={numberPill}
							fontColor={"#FFFFFF"}
							fontSize={10}
							fontWeight={700}
							pillBackGround={"#5ABAFF"}
							borderRadius={"50%"}
							pillSize={14}
							className={"filterModal_NumberPill"}
						></NumberPill>
					)}
				</div>

				{showAppliedFiltersModal && (
					<>
						<div className="applied_filters_modal_container">
							<div className="d-flex align-items-center">
								<div className="grey-1 font-12 pl-1">
									APPLIED FILTERS
								</div>
								{((metaData &&
									Array.isArray(metaData?.filter_by)) ||
									metaData?.group_filter_by) &&
									(metaData?.filter_by?.length > 0 ||
										metaData?.group_filter_by?.entity_group
											?.length > 0) && (
										<div
											className="ml-auto pr-1 primary-color font-12 cursor-pointer"
											onClick={(e) =>
												handleResetFilters(e)
											}
										>
											Reset Filters
										</div>
									)}
							</div>
							<div className="applied_filters_modal_content pt-2">
								{(Array.isArray(metaData?.filter_by) &&
									metaData?.filter_by?.length > 0) ||
								metaData?.group_filter_by?.entity_group
									?.length > 0 ? (
									<>
										{metaData?.filter_by?.map((filter) =>
											getSingleRow(filter)
										)}
										{metaData?.group_filter_by?.entity_group?.map(
											(filter) => getSingleRow(filter)
										)}
									</>
								) : (
									<div className="font-12 grey h-100 w-100 d-flex align-items-center justify-content-center">
										No Filters Applied
									</div>
								)}
							</div>
							<div
								className="applied_filters_modal_button w-100 d-flex align-items-center primary-color font-12 justify-content-center cursor-pointer"
								onClick={(e) => {
									e.stopPropagation();
									preventScroll();
									setShowFilterModal(true);
									setShowAppliedFiltersModal(false);
								}}
							>
								+ Add Filters
							</div>
						</div>
					</>
				)}
			</div>
		</>
	);
}
