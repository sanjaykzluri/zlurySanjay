import React, { useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	setPagePaginatedTable,
	setRowPaginatedTable,
} from "./redux/v2paginated-action";
import rightarrow from "components/Transactions/Recognised/rightarrow.svg";
import leftarrow from "components/Transactions/Recognised/leftarrow.svg";
export function PageButtonRenderer({
	searchQuery,
	v2Entity,
	reqBody,
	totalPages,
	setChecked,
}) {
	const dispatch = useDispatch();
	const reduxData = useSelector(
		(state) =>
			state.v2PaginatedData[v2Entity]?.[`${JSON.stringify(reqBody)}`] ||
			{}
	);

	const handleLeftClick = (e) => {
		if (!reduxData.isLoadingData && reduxData.pageNo > 0) {
			dispatch(
				setPagePaginatedTable(v2Entity, reduxData.pageNo - 1, reqBody)
			);

			setChecked([]);
		}
	};

	const handleRightClick = (e) => {
		if (!reduxData.isLoadingData && reduxData.pageNo < totalPages - 1) {
			dispatch(
				setPagePaginatedTable(v2Entity, reduxData.pageNo + 1, reqBody)
			);
		}
		setChecked([]);
	};

	const handleRowNumberChange = (e) => {
		setChecked([]);
		dispatch(setPagePaginatedTable(v2Entity, 0, reqBody));
		dispatch(setRowPaginatedTable(v2Entity, e.target.value, reqBody));
	};

	return (
		<>
			<div
				className="transaction__table__selectors ml-auto"
				style={{ marginRight: "40px" }}
			>
				<div className="table__info__text__right1">Items per page:</div>
				<div className="table__info__text__right1">
					<select
						className="table__row__select"
						onChange={(e) => {
							handleRowNumberChange(e);
						}}
						name="table__rows"
						value={Number.parseInt(reduxData?.row)}
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
					</select>
				</div>
				<div className="transaction__table__page__selector">
					<div
						hidden={reduxData.pageNo === 0}
						onClick={() => {
							handleLeftClick();
						}}
						className="table__info__text__right2 cursor-pointer"
					>
						<img src={leftarrow} />
					</div>
					<div className="table__info__text__right2">
						Page {reduxData.pageNo + 1 || 0} of{" "}
						{totalPages > 0 ? totalPages : 1}
					</div>
					<div
						hidden={
							(searchQuery &&
								searchQuery.length > 0 &&
								Math.ceil(
									reduxData.searchData?.length /
										Number.parseInt(reduxData.row)
								) <= 1) ||
							totalPages === 0 ||
							reduxData.pageNo === totalPages - 1
						}
						onClick={() => {
							handleRightClick();
						}}
						className="table__info__text__right2 cursor-pointer"
					>
						<img src={rightarrow} />
					</div>
				</div>
			</div>
		</>
	);
}
