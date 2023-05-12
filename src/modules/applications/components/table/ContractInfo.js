import React, { useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { UTCDateFormatter } from "utils/DateUtility";
import useOutsideClick from "../../../../common/OutsideClick/OutsideClick";

export function ContractInfo({ data, handleRefresh, isNotActive }) {
	const ref = useRef();
	const [additionalContractsOpen, setAdditionalContractsOpen] =
		useState(false);

	useOutsideClick(ref, () => {
		if (additionalContractsOpen) setAdditionalContractsOpen(false);
	});

	const renderContracts = (el, condition = false) => {
		return (
			<>
				{el && (
					<div
						className="allapps-categories-subcategories-cont"
						style={condition ? { marginBottom: "7px" } : {}}
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
						}}
					>
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{el.name || ""}</Tooltip>}
						>
							<div
								className="subcategory__truncate"
								style={{
									textTransform: "uppercase",
									color: "#717171",
									fontSize: "8px",
								}}
							>
								{el.name}
							</div>
						</OverlayTrigger>
						<div className="d-flex">
							<div className="font-weight-normal ml-1">
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{UTCDateFormatter(el.start_date)}{" "}
											{`${
												el.end_date
													? "- " +
													  UTCDateFormatter(
															el.end_date
													  )
													: ""
											}`}
										</Tooltip>
									}
								>
									<div
										className="subcategory__truncate"
										style={{
											fontSize: "10px",
										}}
									>
										{UTCDateFormatter(el.start_date)}{" "}
										{`${
											el.end_date
												? "- " +
												  UTCDateFormatter(el.end_date)
												: ""
										}`}
									</div>
								</OverlayTrigger>
							</div>
						</div>
					</div>
				)}
			</>
		);
	};

	return (
		<>
			{data.app_active_contracts &&
			data.app_active_contracts.length > 0 &&
			Array.isArray(data.app_active_contracts) &&
			data.app_active_contracts.length > 0 ? (
				<>
					<div className="d-flex">
						<div className={` ${isNotActive ? "o-6" : ""}`}>
							{data.app_active_contracts
								.filter((item) => item)
								.slice(0, 1)
								.map((el) => renderContracts(el))}
						</div>

						{data.app_active_contracts.length > 1 && (
							<div style={{ position: "relative" }}>
								<div
									className={`d-flex flex-center cursor-pointer ${
										isNotActive ? "o-6" : ""
									}`}
									style={{
										width: "25px",
										background: "rgba(235, 235, 235, 0.6)",
										borderRadius: " 4px",
										marginLeft: "10px",
										height: "100%",
									}}
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										setAdditionalContractsOpen(true);
									}}
								>
									<span
										style={{
											fontSize: 8,
											color: "#717171",
										}}
									>
										+ {data.app_active_contracts.length - 1}
									</span>
								</div>
								{additionalContractsOpen && (
									<>
										<div
											className="additionalcategories__dropdowncont"
											ref={(el) => {
												if (el) {
													ref.current = el;
												}
											}}
											style={
												data.app_active_contracts
													.length > 4
													? {
															paddingBottom:
																"7px",
													  }
													: { cursor: "default" }
											}
										>
											<div
												className="d-flex flex-column mr-1"
												style={{
													marginTop: "9px",
													maxHeight: "210px",
													width: "100%",
													overflowY: "auto",
													overflowX: "none",
												}}
											>
												{data.app_active_contracts
													.slice(1)
													.map((el) =>
														renderContracts(
															el,
															additionalContractsOpen
														)
													)}
											</div>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</>
			) : (
				""
			)}
		</>
	);
}
