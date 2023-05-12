import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { rangeConstants, fieldNames } from "../../../../constants/reports";
import closeIcon from "../../../../assets/close_icon.svg";
import downArrow from "../../../../assets/down_arrow_Active.svg";
import moment from "moment";
import { useDispatch } from "react-redux";
import { ACTION_TYPE } from "./redux";
import { useSelector } from "react-redux";
import { push } from "connected-react-router/immutable";
import { defaultReqBody } from "../../../../common/infiniteTableUtil";
import { array } from "prop-types";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function Chips({
	searchQuery,
	onClose,
	metaData,
	values,
	text = "Apps",
	inputArea,
	showResetAll = true,
	isInfiniteTable = false,
	isLoadingData,
	setSearchQuery,
	onResetFilters,
}) {
	const router = useSelector((state) => state.router);
	let [activeView, setActiveView] = useState();
	const { hash, pathname, query } = router.location;
	const views = useSelector((state) => state.views);

	useEffect(() => {
		if (query.viewId) {
			const viewName = views[query.viewId]?.name;
			setActiveView(viewName);
		} else if (!query.viewId) {
			setActiveView();
		}
	}, [views, query.viewId]);

	const getFilterText = (filter) => {
		const fieldsNotToBeRendered = ["Archive", "Is_custom"];
		let condition = "is any of ";
		if (
			filter &&
			(filter.filter_type?.toLowerCase() === "range" ||
				filter.filter_type?.toLowerCase() === "date_range")
		) {
			if (
				Array.isArray(filter.field_order) &&
				filter.field_order?.length > 1
			) {
				condition = "is between ";
			} else if (Array.isArray(filter.field_order)) {
				condition = `is ${rangeConstants[filter.field_order[0]]} `;
			}
		}
		if (filter?.filter_type?.toLowerCase() === "search_in_string") {
			condition =
				filter.field_order === "contains"
					? "contains "
					: "does not contain ";
			if (filter.field_order === "contains" && filter.is_exact_array)
				condition = "contains only ";
		} else if (filter?.filter_type?.toLowerCase() === "objectid") {
			condition =
				filter.negative === false ? "is any of " : "is not any of ";
		} else if (filter?.filter_type?.toLowerCase() === "boolean") {
			condition = fieldNames[filter?.field_name]
				? filter?.field_values?.toString().charAt(0).toUpperCase() +
						filter?.field_values?.toString().slice(1) ===
				  "True"
					? fieldNames[filter?.field_name]
						? `is ${fieldNames[filter?.field_name]?.[0]}`
						: "True"
					: fieldNames[filter?.field_name]
					? `is ${fieldNames[filter?.field_name]?.[1]}`
					: "False"
				: "is any of ";
		}

		function displayFiltersApplied(values) {
			if (values && values.length > 2) {
				return (
					<>
						{values.slice(0, 2).join(", ")}(
						<OverlayTrigger
							placement="bottom"
							overlay={
								<Tooltip className="userMetaInfoCard">
									<div
										style={{
											padding: "10px",
										}}
									>
										{values.join(", ")}
									</div>
								</Tooltip>
							}
						>
							<span
								style={{
									fontWeight: 400,
									color: "#717171",
									cursor: "pointer",
									marginRight: "2px",
								}}
							>
								+{values.length - 2} more
								<img
									src={downArrow}
									style={{ marginLeft: "2px" }}
								></img>
							</span>
						</OverlayTrigger>
						)
					</>
				);
			}
			return values.join(", ");
		}

		const appliedFilters = Array.isArray(filter?.field_values)
			? filter.filter_type === "date_range"
				? filter?.field_values.length > 1
					? `${moment(new Date(filter.field_values[0])).format(
							"D MMM YYYY"
					  )} and ${moment(new Date(filter.field_values[1])).format(
							"D MMM YYYY"
					  )}  `
					: filter.timestamp_type
					? moment(new Date(filter.field_values[0])).format(
							"D MMM YYYY"
					  )
					: filter.field_values[0].time
				: displayFiltersApplied(filter?.field_values)
			: filter?.field_values;

		return (
			<>
				<span style={{ color: "#484848" }}>
					{typeof filter?.field_name === "string" &&
						!fieldsNotToBeRendered.includes(filter?.field_name) &&
						filter?.field_name?.charAt(0).toUpperCase() +
							filter?.field_name?.slice(1)}
				</span>{" "}
				<span style={{ color: "#717171" }}>{condition}</span>
				<span style={{ color: "#484848" }}>
					{!fieldNames[filter?.field_name]
						? appliedFilters
							? typeof appliedFilters === "boolean"
								? appliedFilters.toString()
								: appliedFilters
							: "false"
						: null}
				</span>
			</>
		);
	};

	if (!values)
		values = metaData?.filter_by
			? Object.keys(metaData?.filter_by).map((key) =>
					getFilterText(metaData?.filter_by[key])
			  )
			: [];
	const totalApps = metaData?.total || (metaData?.filter_by?.length && 0);
	const smallerWindow = useMediaQuery({ query: `(max-width: 1300px)` });
	const dispatch = useDispatch();

	function handleResetFilters() {
		dispatch(push(`${pathname}${hash}`));
	}
	return (
		<>
			{query?.searchQuery &&
			query?.searchQuery.length > 1 &&
			!isLoadingData &&
			query.metaData &&
			totalApps > 0 ? (
				<>
					<div
						style={{
							marginRight: "10px",
							fontSize: "13px",
							lineHeight: "16px",
							padding: "10px",
							marginLeft: "30px",
							color: "#717171",
							width: "auto",
						}}
						className="d-flex"
					>
						<div className="mx-1 flex" style={{ fontWeight: 600 }}>
							<div>
								Showing {totalApps} results for '{searchQuery}'
							</div>
							<div
								onClick={() => {
									setSearchQuery && setSearchQuery("");
									handleResetFilters();
								}}
								className="ml-2 pr-1 primary-color font-12 cursor-pointer"
							>
								Clear Results
							</div>
						</div>{" "}
					</div>
				</>
			) : (
				<div className="flex ">
					{totalApps > -1 && (
						<div
							style={{
								marginRight: "10px",
								fontSize: "13px",
								lineHeight: "16px",
								padding: "10px",
								marginLeft: "30px",
								color: "#717171",
								width: "auto",
							}}
							className="d-flex"
						>
							<div className="mx-1" style={{ fontWeight: 600 }}>
								Showing {totalApps} {text}
							</div>{" "}
							{values && values.length > 0 && activeView ? (
								<>
									for{" "}
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>{activeView}</Tooltip>
										}
									>
										<div
											className="truncate_10vw mx-1"
											style={{ fontWeight: 600 }}
										>
											{activeView}
										</div>
									</OverlayTrigger>
								</>
							) : (
								<>
									{!isInfiniteTable &&
									metaData?.filter_by?.length
										? "filtered by :"
										: ""}
								</>
							)}
						</div>
					)}
					{!isInfiniteTable && (
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
							}}
							className="md-chips"
						>
							{Array.isArray(values) &&
								values?.map(
									(value, index) =>
										(value ||
											typeof value === "boolean" ||
											value == 0) && (
											<div
												style={{
													backgroundColor:
														"rgba(90, 186, 255, 0.1)",
													padding: "5px",
													marginTop: "5px",
													marginRight: "5px",
												}}
												className="md-chip"
												key={`${value}-${index}`}
											>
												<span
													style={{ color: "#5ABAFF" }}
													className="p-2"
												>
													{typeof value === "boolean"
														? value?.toString()
														: value}
												</span>
												{onClose && (
													<img
														style={{
															cursor: "pointer",
															paddingRight: "5px",
														}}
														src={closeIcon}
														onClick={() =>
															onClose(index)
														}
													/>
												)}
											</div>
										)
								)}
							{Array.isArray(values) &&
								values.length > 1 &&
								showResetAll && (
									<span
										style={{
											fontSize: "12px",
											color: "#5ABAFF",
											fontWeight: 600,
											padding: "5px",
											marginTop: "5px",
											marginRight: "5px",
											cursor: "pointer",
										}}
										onClick={handleResetFilters}
									>
										Reset Filters
									</span>
								)}

							{inputArea}
						</div>
					)}
				</div>
			)}
		</>
	);
}
