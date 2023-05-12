import React, { useContext, useEffect, useState, Fragment } from "react";
import {
	DottedRisk,
	getRiskStatus,
} from "../../../../common/DottedRisk/DottedRisk";
import { getCriticalUsersOverview } from "../../../../services/api/security";
import { Accordion, Card, Badge } from "react-bootstrap";
import check from "../../../../components/Integrations/greenTick.svg";
import caret from "../../../../components/Integrations/caret.svg";
import ContentLoader from "react-content-loader";
import _ from "underscore";
import refershBlue from "../../../../components/Uploads/refreshBlue.svg";
import warning from "../../../../components/Onboarding/warning.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import "./CriticalUsers.css";
import Rating, {
	labelTypes,
} from "../../../../components/Applications/SecurityCompliance/Rating";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import activecheck from "../../../../assets/applications/check.svg";
import RiskIcon from "../../../../components/Applications/SecurityCompliance/RiskIcon";
import { TriggerIssue } from "../../../../utils/sentry";
function RiskOverview(props) {
	const [usageActivityRisk, setUsageActivityRisk] = useState();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();
	const badge = {
		fontSize: "10px",
		lineHeight: "13px",
		opacity: "0.5",
		border: "0.5px solid #DDDDDD",
		fontWeight: "normal",
		padding: "2px 5px",
		height: "fit-content",
	};
	const requestEndPoint = () => {
		setLoading(true);
		try {
			getCriticalUsersOverview(props.id).then((res) => {
				if (res?.error) {
					setError(res);
					setLoading(false);
				} else {
					if (res?.data) {
						setUsageActivityRisk(res?.data);
						props.setScopeData(res?.data);
						setLoading(false);
						setError();
					} else {
						TriggerIssue(
							"Unexpected Response from Critical User Overview API"
						);
						setError(
							"Unexpected Response from Critical User Overview API"
						);
						setLoading(false);
					}
				}
			});
		} catch (error) {
			setError(error);
			setLoading(false);
			console.log("Error when fetching risk", error);
		}
	};

	useEffect(() => {
		if (props.currentSection === props.sections.overview) {
			requestEndPoint();
		} else {
			setUsageActivityRisk();
			setError();
			setLoading(true);
		}
	}, [props.currentSection]);

	return (
		<div
			className="position-relative"
			style={{ height: "calc(100vh - 112px)", overflowY: "auto" }}
		>
			{error ? (
				<div
					className="d-flex flex-column justify-content-center"
					style={{ height: "100%" }}
				>
					<img
						src={warning}
						style={{ width: "45px" }}
						className="ml-auto mr-auto"
					/>
					<div className="grey-1 font-18 bold-normal w-75 text-center ml-auto mr-auto mt-2">
						An error occured. Please try again
					</div>

					<div className="ml-auto mr-auto mt-2">
						<Button
							className="primary-color-border d-flex"
							type="link"
							onClick={() => requestEndPoint()}
						>
							<img
								src={refershBlue}
								className="mr-2"
								style={{ width: "15px" }}
							/>
							Retry
						</Button>
					</div>
				</div>
			) : (
				<>
					<div
						className="d-flex flex-row pt-4 pb-4 pl-4"
						style={{ background: "rgba(90, 186, 255, 0.1)" }}
					>
						<div className="d-flex flex-column mr-5">
							<div className="font-12 mb-1">
								{loading ? (
									<ContentLoader width={91} height={10}>
										<rect
											width="91"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								) : (
									<>Status</>
								)}
							</div>
							<div className="d-flex flex-row font-14 mt-1">
								{loading ? (
									<div className="mt-1">
										<ContentLoader width={91} height={10}>
											<rect
												width="91"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								) : (
									<>
										{props.status === "active" ? (
											<img
												src={activecheck}
												className="mr-1"
											/>
										) : (
											<img
												src={inactivecheck}
												className="mr-1"
											/>
										)}
										<div style={{ paddingTop: "1px" }}>
											{props.status === "active"
												? "Active"
												: "Inactive"}
										</div>
									</>
								)}
							</div>
						</div>
						<div className="d-flex flex-column mr-5 ml-3">
							<div className="font-12 mb-1">
								{loading ? (
									<ContentLoader width={91} height={10}>
										<rect
											width="91"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								) : (
									<>Risk</>
								)}
							</div>
							<div
								className="font-14 mt-1"
								style={{ paddingTop: "1px" }}
							>
								{loading ? (
									<ContentLoader width={91} height={10}>
										<rect
											width="91"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								) : (
									<RiskIcon
										riskValue={
											props.securityOverview
												?.max_app_risk_level || 0
										}
										showLable={true}
									/>
								)}
							</div>
						</div>
						<div className="d-flex flex-column mr-5 ml-3">
							<div
								className="d-flex flex-row font-12 mb-1"
								style={{ paddingLeft: "6px" }}
							>
								{loading ? (
									<ContentLoader width={91} height={10}>
										<rect
											width="91"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								) : (
									<>Threat</>
								)}
							</div>
							{loading ? (
								<div
									className="d-flex mt-3"
									style={{ paddingLeft: "6px" }}
								>
									<ContentLoader width={91} height={10}>
										<rect
											width="91"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
							) : (
								<div className="d-flex mt-1">
									<Rating
										width={12}
										height={14}
										rating={
											usageActivityRisk?.max_risk || 0
										}
										iconType="scope"
										showValueInsideIcon={true}
										valueTopPosition={"0.8px"}
										valueLeftPosition={"2.75px"}
									/>
									<div
										className="font-14 pl-3"
										style={{ paddingTop: "1px" }}
									>
										{
											labelTypes.level[
												usageActivityRisk?.max_risk -
													1 || 0
											]
										}
									</div>
								</div>
							)}
						</div>
					</div>
					<div className="borderStyling m-3">
						<div className="p-3" style={{ background: "#EBEBEB" }}>
							<div className="d-flex flex-row align-items-center mb-0">
								{loading ? (
									<ContentLoader width={91} height={12}>
										<rect
											width="91"
											height="12"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								) : (
									<div className="grey font-16 bold-600">
										THREAT
									</div>
								)}
								<div className="ml-auto">
									<Rating
										width={13.8}
										height={15.36}
										rating={
											usageActivityRisk?.max_risk || 0
										}
										iconType="scope"
									/>
								</div>
							</div>
							<div className="d-flex flex-row mt-0">
								{loading ? (
									<ContentLoader width={91} height={10}>
										<rect
											width="91"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								) : (
									<Fragment>
										<div className="font-13 grey-1 bold-normal mt-1">
											{usageActivityRisk?.compromising_scope_count ||
												0}{" "}
											compromising security
										</div>
										<div className="ml-auto text-capitalize font-13 grey-1 o-5 mt-1">
											{usageActivityRisk?.max_risk
												? labelTypes.level[
														usageActivityRisk?.max_risk -
															1
												  ]
												: "Risk unavailable"}
										</div>
									</Fragment>
								)}
							</div>
						</div>
						{loading ? (
							<>
								{_.times(2, (n) => (
									<div key={n}>
										<div className="d-flex border-bottom pt-3 mr-3 mt-3 ml-3">
											<ContentLoader
												height={50}
												width={200}
											>
												<circle
													r="15"
													cx="22"
													cy="20"
													fill="#EBEBEB"
												/>
												<rect
													width="100"
													x="50"
													y="15"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
										<div
											style={{
												borderBottom:
													"0.5px solid #EBEBEB",
											}}
											className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3"
										>
											<ContentLoader
												width={500}
												height={50}
											>
												<rect
													width="160"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
												<rect
													width="91"
													height="10"
													rx="2"
													y={20}
													fill="#EBEBEB"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="120"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="145"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="170"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="195"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="220"
												/>
											</ContentLoader>
										</div>
										<div
											style={{
												borderBottom:
													"0.5px solid #EBEBEB",
											}}
											className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3"
										>
											<ContentLoader
												width={500}
												height={50}
											>
												<rect
													width="280"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
												<rect
													width="130"
													height="10"
													rx="2"
													y={20}
													fill="#EBEBEB"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="150"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="175"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="200"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="225"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="250"
												/>
											</ContentLoader>
										</div>
										<div
											style={{
												borderBottom:
													"0.5px solid #EBEBEB",
											}}
											className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3"
										>
											<ContentLoader
												width={500}
												height={50}
											>
												<rect
													width="160"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
												<rect
													width="91"
													height="10"
													rx="2"
													y={20}
													fill="#EBEBEB"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="120"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="145"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="170"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="195"
												/>
												<rect
													width="20"
													y="20"
													rx="5"
													height="10"
													x="220"
												/>
											</ContentLoader>
										</div>
									</div>
								))}
							</>
						) : (
							<>
								{usageActivityRisk?.scope_data &&
									Array.isArray(
										usageActivityRisk?.scope_data
									) && (
										<Accordion className="pt-1 pl-3 pr-3 pb-1">
											{usageActivityRisk?.scope_data.map(
												(source, index) => (
													<Card
														style={{
															borderBottom:
																"0.5px solid #EBEBEB",
														}}
														className={
															index ===
															usageActivityRisk
																?.scope_data
																?.length -
																1
																? "border-0"
																: "border-left-0 border-top-0 border-right-0"
														}
														key={index}
													>
														<Card.Header
															style={{
																padding: "0",
																position:
																	"relative",
															}}
															className="bg-white border-0"
														>
															<Accordion.Toggle
																style={{
																	color:
																		"#484848",
																	fontSize:
																		"13px",
																	border: "0",
																	padding:
																		"16px 0px",
																	cursor:
																		"pointer",
																}}
																as={Card.Header}
																className="bg-white d-flex"
																variant="link"
																eventKey={
																	source._id
																}
															>
																<div className="d-flex flex-row">
																	<img
																		className="mr-2 mt-2 mb-auto"
																		src={
																			check
																		}
																	></img>
																	<div className="d-flex flex-column">
																		<div className="d-flex flex-row">
																			{
																				source.title
																			}
																			<div className="mr-auto mt-auto mb-auto ml-2">
																				<Badge
																					className="ml-1 mr-1 textColor text-uppercase"
																					style={
																						badge
																					}
																					pill
																					variant="light"
																				>
																					{source.read_only
																						? "read only"
																						: "write"}
																				</Badge>
																			</div>
																		</div>
																		<div className="d-flex flex-row align-items-center mt-2">
																			<div className="grey-1 o-6">
																				via{" "}
																				{
																					source.source
																				}
																			</div>
																			<hr
																				className="vertical-line ml-1 mr-1"
																				style={{
																					height:
																						"13px",
																				}}
																			/>
																			<div className="grey-1 o-6 mr-1 text-capitalize">
																				{`${getRiskStatus(
																					source.risk ||
																						0
																				)} Threat`}
																			</div>
																			<Rating
																				rating={
																					source.risk
																				}
																				iconType="scope"
																			/>
																		</div>
																	</div>

																	<img
																		className="ml-1 mt-2 mb-auto"
																		src={
																			caret
																		}
																	></img>
																</div>
															</Accordion.Toggle>
															<div
																className="riskoverview__font__showusers cursor-pointer"
																onClick={() =>
																	props.changeActiveSectionToCriticalUsers(
																		source.scope
																	)
																}
															>
																{source.app_count
																	? `Show ${source.app_count} Apps`
																	: "Show Apps"}
															</div>
														</Card.Header>
													</Card>
												)
											)}
										</Accordion>
									)}
							</>
						)}
					</div>
				</>
			)}
		</div>
	);
}

export default RiskOverview;
