import React, { useEffect, useState, useRef, useCallback } from "react";
import { Loader } from "../../../../../common/Loader/Loader";
import "./SuggestionBar.scss";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { unescape } from "../../../../../utils/common";

export function SuggestionBar(props) {
	const onOptionClick = (option) => {
		let selectedValue = undefined;
		if (typeof props.option_id === "object") {
			props.option_id.forEach((value) => {
				selectedValue = selectedValue || option[value];
			});
		} else {
			selectedValue = option[props.option_id];
		}
		props.handleSelect(
			selectedValue,
			option[props.option_name],
			option[props.option_designation],
			option[props.option_image]
		);
		props.onHide();
	};

	return (
		<>
			<div className="SuggestionBardiv__TM shadow-sm d-block">
				{props.loading ? (
					<>
						<div className="option__card__WFM">
							<Loader height={60} width={60}></Loader>
						</div>
					</>
				) : props.options.length > 0 ? (
					props.options.map(
						(option, index) =>
							index < 75 && (
								<>
									<button
										className="suggestion-item w-100 pl-3 m-0"
										onClick={() => onOptionClick(option)}
									>
										<img
											src={
												!!option[props.option_image]
													? unescape(
															option[
																props
																	.option_image
															]
													  )
													: `https://ui-avatars.com/api/?name=${
															option[
																props
																	.option_name
															]
													  }`
											}
											style={{
												height: "24px",
												width: "24px",
												marginRight: "10px",
											}}
										></img>
										<div className="col">
											<div className="row">
												<OverlayTrigger
													placement="top"
													overlay={
														<Tooltip>
															{
																option[
																	props
																		.option_name
																]
															}
														</Tooltip>
													}
												>
													<div
														className={`d-block ${
															props.showAdditionalRightInformation &&
															option[
																props
																	.additional_information
															]
																? "truncate_15vw"
																: ""
														} `}
													>
														{
															option[
																props
																	.option_name
															]
														}
													</div>
												</OverlayTrigger>
												{props.showAdditionalRightInformation &&
													props.additionalInformationFormatter(
														option[
															props
																.additional_information
														]
															? true
															: false
													)}
											</div>
											<div className="row">
												<span className="user_email_suggestion">
													{option[props.option_email]}
												</span>
											</div>
										</div>
									</button>
									{!(index == props.options.length - 1) ? (
										<hr style={{ margin: "0px 18px" }}></hr>
									) : null}
								</>
							)
					)
				) : (
					!props.showAddButton && (
						<div
							style={{
								display: "flex",
								alignContent: "center",
								justifyContent: "center",
								alignItems: "center",
								marginTop: 52,
								marginBottom: 52,
								flexDirection: "column",
							}}
						>
							<p
								style={{
									fontSize: 13,
									lineHeight: "17px",
									padding: 0,
									margin: 0,
									marginBottom: 4,
								}}
							>
								No Users Found
							</p>
							<p
								style={{
									fontSize: 11,
									lineHeight: "14px",
									padding: 0,
									color: "#717171",
									margin: 0,
								}}
							>
								Only users belonging to this dept appear here
							</p>
						</div>
					)
				)}
				{props.showAddButton && (
					<button
						className="SuggestionBar__button"
						onClick={() => {
							props.handleNew(true);
							props.onHide();
						}}
					>
						+ {props.addTitle}
					</button>
				)}
			</div>
		</>
	);
}
