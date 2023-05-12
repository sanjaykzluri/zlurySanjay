import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Loader } from "../Loader/Loader";
import "./SuggestionMenu.scss";
import "../../App.css";
import { NameBadge } from "../NameBadge";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { unescape, withHttp } from "../../utils/common";

import needsreview from "../../assets/applications/needsreview.svg";
import restricted from "../../assets/applications/restricted.svg";
import unmanaged from "../../assets/applications/unmanaged.svg";
import teammanaged from "../../assets/applications/teammanaged.svg";
import individuallymanaged from "../../assets/applications/individuallymanaged.svg";
import authorised from "../../assets/applications/authorised.svg";
import integrationAvailable from "../../assets/applications/integrationavailable.svg";
import integrationConnected from "../../assets/workflow/integration-connected.svg";
import overview6 from "assets/departments/overview6.svg";

const APP_AUTH_STATUS = {
	"team managed": teammanaged,
	"needs review": needsreview,
	restricted: restricted,
	"centrally managed": authorised,
	unmanaged: unmanaged,
	"individually managed": individuallymanaged,
};
export function SuggestionMenu(props) {
	if (!props.show) return "";

	const getText = (option) =>
		props?.dataKeys?.text === "" || !option[props.dataKeys.text]
			? option?.toString()
			: option[props.dataKeys.text]?.toString();
	return (
		<>
			<div
				className={`s-menu-container shadow-sm mt-1 ${props.className}`}
				{...props.html}
			>
				{!props.loading &&
					Array.isArray(props.options) &&
					props.options.map(
						(option, index) =>
							(option ||
								typeof option === "boolean" ||
								option == 0) && (
								<div key={index}>
									<button
										disabled={option.disabled}
										className={`s-menu-item px-3 on-hover-effect ${
											option.disabled ? "o-5" : ""
										}`}
										onClick={(e) => {
											e.preventDefault();
											props.onSelect(option);
										}}
									>
										{option[props.dataKeys.image] ? (
											<img
												src={unescape(
													option[props.dataKeys.image]
												)}
												width={24}
												height={24}
												className="img-circle mr-2 object-contain"
											/>
										) : (
											<NameBadge
												name={getText(option)}
												width={24}
												className="mr-3"
											/>
										)}
										<div className="col">
											<div className="row">
												<OverlayTrigger
													placement="top"
													overlay={
														<Tooltip>
															{getText(option)}
														</Tooltip>
													}
												>
													<div
														className={`${
															props.showAdditionalRightInformation &&
															option[
																props.dataKeys
																	.additional_information
															]
																? "suggestion_box_name_max_width"
																: ""
														}`}
													>
														{getText(option)}
													</div>
												</OverlayTrigger>
												{option[
													props.dataKeys.appAuthStatus
												] && (
													<OverlayTrigger
														placement="top"
														overlay={
															<Tooltip>
																{
																	option[
																		props
																			.dataKeys
																			.appAuthStatus
																	]
																}
															</Tooltip>
														}
													>
														<img
															src={
																APP_AUTH_STATUS[
																	option[
																		props
																			.dataKeys
																			.appAuthStatus
																	]
																]
															}
															width={14}
															height={14}
															className="img-circle ml-2 object-contain"
														/>
													</OverlayTrigger>
												)}
												{props.showAdditionalRightInformation &&
													props.additionalInformationFormatter(
														option[
															props.dataKeys
																.additional_information
														] && option
													)}
											</div>
											<div className="row">
												{option[
													props.dataKeys
														.onboardingActionCount
												] === 0 &&
												option[
													props.dataKeys
														.offboardingActionCount
												] === 0 ? (
													<p className="font-10 grey-1 text-capitalize mb-0">
														{
															"Only manual tasks available"
														}
													</p>
												) : (
													<>
														{(option[
															props.dataKeys
																.onboardingActionCount
														] ||
															option[
																props.dataKeys
																	.onboardingActionCount
															] === 0) && (
															<p className="font-10 grey-1 text-capitalize mb-0">
																{`${
																	option[
																		props
																			.dataKeys
																			.onboardingActionCount
																	]
																} onboarding actions`}
															</p>
														)}
														{(option[
															props.dataKeys
																.offboardingActionCount
														] ||
															option[
																props.dataKeys
																	.offboardingActionCount
															] === 0) && (
															<p className="font-10 grey-1 text-capitalize mb-0 ml-1">
																{` | ${
																	option[
																		props
																			.dataKeys
																			.offboardingActionCount
																	]
																} offboarding actions`}
															</p>
														)}
													</>
												)}
												{option[
													props.dataKeys.category
												] && (
													<OverlayTrigger
														placement="top"
														overlay={
															<Tooltip>
																{option[
																	props
																		.dataKeys
																		.category
																]?.[0]?.[
																	"sub_category_name"
																] || ""}
															</Tooltip>
														}
													>
														<div className="font-8 grey-1 mr-2 subcategory__truncate">
															{option[
																props.dataKeys
																	.category
															]?.[0] &&
																option[
																	props
																		.dataKeys
																		.category
																][0]
																	.sub_category_name}
														</div>
													</OverlayTrigger>
												)}
												{option[
													props.dataKeys.app_url
												] && (
													<div
														className="glow_blue font-8 truncate_name"
														onClick={(e) => {
															e.stopPropagation();
															window.open(
																`${withHttp(
																	option[
																		props
																			.dataKeys
																			.app_url
																	]
																)}`,
																"_blank"
															);
														}}
													>
														{
															option[
																props.dataKeys
																	.app_url
															]
														}
													</div>
												)}
											</div>

											{props.isAddAdmin ? (
												<OverlayTrigger
													placement="top"
													overlay={
														<Tooltip>
															{getText(option)}
														</Tooltip>
													}
												>
													<div className="row user_email_suggestion">
														{option[
															props.dataKeys.email
														].length > 27
															? option[
																	props
																		.dataKeys
																		.email
															  ].slice(0, 27) +
															  "..."
															: option[
																	props
																		.dataKeys
																		.email
															  ]}
													</div>
												</OverlayTrigger>
											) : (
												<div className="row user_email_suggestion">
													{
														option[
															props.dataKeys.email
														]
													}
												</div>
											)}
										</div>
										{option[
											props.dataKeys.appIntegrationId
										] && (
											<div
												style={{
													backgroundColor: option[
														props.dataKeys
															.appOrgIntegrationStatus
													]
														? "#40E395"
														: option[
																props.dataKeys
																	.appIntegrationId
														  ]
														? "rgba(90, 186, 255, 0.1)"
														: "transparent",
													borderRadius: "50px",
													alignItems: "center",
												}}
												className="row m-0 py-1 px-3"
											>
												<img
													src={
														option[
															props.dataKeys
																.appOrgIntegrationStatus
														]
															? integrationConnected
															: option[
																	props
																		.dataKeys
																		.appIntegrationId
															  ]
															? integrationAvailable
															: null
													}
													width={12}
													height={12}
													className="img-circle mr-2 object-contain"
												/>
												<p
													style={{
														color: option[
															props.dataKeys
																.appOrgIntegrationStatus
														]
															? "#FFFFFF"
															: option[
																	props
																		.dataKeys
																		.appIntegrationId
															  ]
															? "#484848"
															: "",
													}}
													className="font-10 text-capitalize mb-0"
												>
													{option[
														props.dataKeys
															.appOrgIntegrationStatus
													]
														? "Integration connected"
														: option[
																props.dataKeys
																	.appIntegrationId
														  ]
														? "Integration available"
														: null}
												</p>
											</div>
										)}
										{option[props.dataKeys.app_in_org] && (
											<div
												style={{
													backgroundColor:
														"rgba(90, 186, 255, 0.1)",
													borderRadius: "50px",
													alignItems: "center",
												}}
												className="row m-0 py-1 px-3"
											>
												<img
													src={overview6}
													width={12}
													height={12}
													className="mr-2"
												/>
												<p className="font-10 text-capitalize primary-color mb-0">
													Available in Org
												</p>
											</div>
										)}
									</button>
									{!(index == props.options.length - 1) ? (
										<hr style={{ margin: "0px 18px" }}></hr>
									) : null}
								</div>
							)
					)}
				{props.loading && (
					<div className="s-menu-item pl-0">
						<Loader height={50} width={50} />
					</div>
				)}
				{!props.loading &&
					props.options?.length === 0 &&
					!props.hideNoResultsText && (
						<div
							className="text-center px-2 py-3"
							style={{ fontSize: 13 }}
						>
							<span className="text-secondary">
								No results found.
							</span>
						</div>
					)}

				{props.children}
			</div>
		</>
	);
}

SuggestionMenu.propTypes = {
	show: PropTypes.bool.isRequired,
	loading: PropTypes.bool.isRequired,
	options: PropTypes.array.isRequired,
	onSelect: PropTypes.func.isRequired,
	dataKeys: PropTypes.shape({
		image: PropTypes.string,
		text: PropTypes.string.isRequired,
	}).isRequired,
};

SuggestionMenu.defaultProps = {
	options: [],
};
