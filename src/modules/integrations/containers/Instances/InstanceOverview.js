import React, { useContext, useEffect, useState, Fragment } from "react";
import ContentLoader from "react-content-loader";
import _ from "underscore";
import refershBlue from "../../../../components/Uploads/refreshBlue.svg";
import warning from "../../../../components/Onboarding/warning.svg";
import { Button } from "../../../../UIComponents/Button/Button";

import { useLocation } from "react-router-dom";
import UserSourceIconAndCard from "modules/users/components/UserSourceIconAndCard";
import { capitalizeFirstLetter } from "utils/common";
import dayjs from "dayjs";
import { InstanceFeatures } from "./InstanceFeatures";
import { entityImageMapper } from "modules/integrations/components/scopeDetailCard";
import { getIntegrationInstanceOverview } from "modules/integrations/service/api";

function InstanceOverview(props) {
	const [usageActivityRisk, setUsageActivityRisk] = useState();
	const [overviewData, setOverviewData] = useState();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();
	const location = useLocation();
	const integrationId = location.pathname.split("/")[2];
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
			getIntegrationInstanceOverview(props.id || integrationId).then(
				(res) => {
					if (res?.error) {
						setError(res);
						setLoading(false);
					} else {
						if (res) {
							setOverviewData(res);
							// props.setScopeData(res?.data);
							setLoading(false);
							setError();
						}
					}
				}
			);
		} catch (error) {
			setError(error);
			setLoading(false);
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
					{loading ? (
						<>
							{_.times(2, (n) => (
								<div key={n}>
									<div className="d-flex border-bottom pt-3 mr-3 mt-3 ml-3">
										<ContentLoader height={50} width={200}>
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
											borderBottom: "0.5px solid #EBEBEB",
										}}
										className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3"
									>
										<ContentLoader width={500} height={50}>
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
											borderBottom: "0.5px solid #EBEBEB",
										}}
										className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3"
									>
										<ContentLoader width={500} height={50}>
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
											borderBottom: "0.5px solid #EBEBEB",
										}}
										className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3"
									>
										<ContentLoader width={500} height={50}>
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
						overviewData && (
							<>
								<div className="d-flex flex-column border bg-white m-3 rounded">
									<div className="font-16 bold-600 grey bg-light p-3 rounded">
										Users
									</div>

									<div
										style={{ justifyContent: "flex-start" }}
										className="flex font-13 pl-2"
									>
										<div className="p-2">
											<div className="grey-1 py-1">
												Total Users
											</div>
											<div>
												{overviewData?.total_users}
											</div>
										</div>
										<div className="p-2">
											<div className="grey-1 py-1">
												Active Users
											</div>
											<div>
												{overviewData?.active_users}
											</div>
										</div>
										<div className="p-2">
											<div className="grey-1 py-1">
												Unmapped Users
											</div>
											<div>
												{overviewData?.unmapped_users}
											</div>
										</div>
									</div>
								</div>
								{Array.isArray(overviewData?.entities) &&
									overviewData?.entities?.length > 0 && (
										<div className="d-flex flex-column border bg-white m-3 rounded">
											<div
												style={{
													justifyContent:
														"space-between",
												}}
												className="bg-light  flex"
											>
												<div className="font-16 bold-600 grey p-3 rounded">
													Entities
												</div>
												<div className="font-12 grey-1 mt-3 mr-3">
													<span>
														{
															overviewData?.scopes_count
														}{" "}
														Scopes conected via{" "}
														{
															overviewData
																?.entities
																.length
														}{" "}
														entities
													</span>
												</div>
											</div>

											<div
												style={{
													justifyContent:
														"flex-start",
													flexWrap: "wrap",
												}}
												className="flex font-13 pl-2 mb-2"
											>
												{Array.isArray(
													overviewData?.entities
												) &&
													overviewData?.entities
														?.length > 0 &&
													overviewData?.entities.map(
														(entity, index) => (
															<div
																style={{
																	backgroundColor:
																		"rgba(228, 232, 243, 0.6)",
																	borderRadius:
																		"4px",
																}}
																className="px-1 py-1 m-1"
															>
																<img
																	src={
																		entityImageMapper[
																			entity
																		]
																	}
																/>
																<span className="ml-1">
																	{capitalizeFirstLetter(
																		entity
																	)}
																</span>
															</div>
														)
													)}
											</div>
										</div>
									)}
								{Array.isArray(overviewData?.features) &&
									overviewData?.features?.length > 0 && (
										<>
											<div className="font-16 bold-600 grey px-4 py-3 rounded">
												Features
											</div>
											<div className="font-12 px-3 py-3">
												<InstanceFeatures
													features={
														overviewData.features
													}
													showSidebar={true}
													handleReconnect={
														props.handleReconnect
													}
													instance={props.instance}
												/>
											</div>
										</>
									)}
								<div className="d-flex flex-column border bg-white m-3 rounded">
									<div className="font-16 bold-600 grey bg-light p-3 rounded">
										Connection Details
									</div>

									<div
										style={{
											justifyContent: "space-between",
										}}
										className="flex font-13 px-4"
									>
										<div className="p-2">
											<div className="grey-1 py-1">
												Connected by
											</div>
											<div>
												{
													overviewData?.connected_by
														?.name
												}
											</div>
										</div>
										<div className="p-2">
											<div className="grey-1 py-1">
												Connection type
											</div>
											<div>
												{capitalizeFirstLetter(
													overviewData?.connectionMethod
												) || "NA"}
											</div>
										</div>
										<div className="p-2">
											<div className="grey-1 py-1">
												Connected on
											</div>
											<div>
												{overviewData?.connected_on &&
													dayjs(
														overviewData.connected_on
													).format("D MMM YYYY")}
											</div>
										</div>
									</div>
								</div>
							</>
						)
					)}
				</>
			)}
		</div>
	);
}

export default InstanceOverview;
