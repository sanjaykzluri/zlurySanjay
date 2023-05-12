import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import search from "../../../assets/search.svg";
import refresh_icon from "../../../assets/icons/refresh.svg";

import useOutsideClick from "../../../common/OutsideClick/OutsideClick";
import arrowdropdown from "../../Transactions/Unrecognised/arrowdropdown.svg";
import "../../../common/Select/Select.scss";
import { FILTER_TYPES } from "./constants";
import { capitalizeFirstLetter } from "../../../utils/common";

export function UserMappingFilters(props) {
	const { filters } = props;
	const ref = useRef();
	const [dd1active, setdd1active] = useState(false);
	const { refreshTable } = useSelector((state) => state.ui);

	const line_seperator = <hr style={{ margin: "0px 18px" }}></hr>;
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		if (props.checked.length > 0) {
			setdd1active(false);
		}
	}, [props.checked]);

	useOutsideClick(ref, () => {
		if (dd1active) setdd1active(false);
	});

	const handleChangeFilter = (key, value) => {
		setdd1active(false);
		props.setFilters({ ...filters, ...{ [key]: value } });
	};

	return (
		<>
			<div className="usermapping__wrapper">
				<div className="usermapping__container">
					<>
						<button
							className="autho__dd__cont mr-3 mt-auto mb-auto"
							onClick={() => {
								setdd1active(true);
							}}
							style={{ width: 215, padding: "15px 9px" }}
						>
							Showing: {capitalizeFirstLetter(filters.type)} Users
							<img
								src={arrowdropdown}
								style={{ marginLeft: "8px" }}
							></img>
							{dd1active ? (
								<div
									className="autho__dd__cont__list"
									ref={(el) => {
										if (el) {
											ref.current = el;
										}
									}}
								>
									<button
										className="autho__dd__cont__list__option"
										onClick={(e) => {
											handleChangeFilter(
												"type",
												FILTER_TYPES.UNMAPPED
											);
											e.stopPropagation();
										}}
									>
										Unmapped
									</button>
									{line_seperator}
									<button
										className="autho__dd__cont__list__option"
										onClick={(e) => {
											handleChangeFilter(
												"type",
												FILTER_TYPES.MAPPED
											);
											e.stopPropagation();
										}}
									>
										Mapped
									</button>
									{line_seperator}
									<button
										className="autho__dd__cont__list__option"
										onClick={(e) => {
											handleChangeFilter(
												"type",
												FILTER_TYPES.ALL
											);
											e.stopPropagation();
										}}
									>
										All
									</button>
								</div>
							) : null}
						</button>
					</>
					<div className="d-flex">
						<div className="inputWithIconApps mr-3 ml-0 mt-auto mb-auto">
							<input
								type="text"
								value={searchTerm}
								placeholder="Search Users"
								onChange={(e) => {
									setSearchTerm(e.target.value.trim());
									handleChangeFilter(
										"searchTerm",
										e.target.value.trim()
									);
								}}
							/>
							<img src={search} aria-hidden="true" />
						</div>
						<div className="d-flex flex-row">
							<button
								className="appsad ml-3"
								onClick={() => refreshTable()}
								style={{
									width: "50px",
								}}
							>
								<img
									className="w-100 h-100 m-auto"
									src={refresh_icon}
								/>
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
