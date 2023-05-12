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
import Rating, {
	labelTypes,
} from "../../../../components/Applications/SecurityCompliance/Rating";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import activecheck from "../../../../assets/applications/check.svg";
import userIcon from "../../../../assets/user-icon.svg";
import logIcon from "../../../../assets/instance-log-icon.svg";
import instanceConnectedIcon from "../../../../assets/instance-connected-icon.svg";
import licenseIcon from "../../../../assets/license-icon.svg";
import notificationIcon from "../../../../assets/notification-icon.svg";
import browserIcon from "../../../../assets/browser.svg";
import RiskIcon from "../../../../components/Applications/SecurityCompliance/RiskIcon";
import { TriggerIssue } from "../../../../utils/sentry";
import { useLocation } from "react-router-dom";
import UserSourceIconAndCard from "modules/users/components/UserSourceIconAndCard";
import { capitalizeFirstLetter } from "utils/common";
import dayjs from "dayjs";
import { getIntegrationInstanceLogs } from "modules/integrations/service/api";

function InstanceLogs(props) {
	const [overviewData, setOverviewData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();
	const location = useLocation();
	const integrationId = location.pathname.split("/")[2];

	const requestEndPoint = () => {
		setLoading(true);
		try {
			getIntegrationInstanceLogs(props.id || integrationId).then(
				(res) => {
					if (res?.error) {
						setError(res);
						setLoading(false);
					} else {
						if (res) {
							setOverviewData(res);
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
		if (props.currentSection === props.sections.logs) {
			requestEndPoint();
		} else {
			setError();
			setLoading(true);
		}
	}, [props.currentSection]);

	const logTitleMapper = {
		connect: "Instance Connected",
		reconnect: "Instancce Reconnected",
		connect_error: "Connection Error",
		disconnect: "Instance Disconnected",
	};

	const logDescriptionMapper = {
		connect: "Connected by ",
		reconnect: "Reconnected by ",
		connect_error: "Connection Error ",
		disconnect: "Disconnected by ",
	};

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
					) : overviewData.length > 0 ? (
						<>
							<div className="p-4">
								{overviewData?.map((log, index) => (
									<div
										style={{
											borderLeft: "1px solid #EBEBEB",
											justifyContent: "space-between",
										}}
										className="flex"
									>
										<div
											style={{
												flexDirection: "column",
											}}
											className="flex p-2"
										>
											{log.log_type && (
												<div className="font-13 ml-1">
													<span className="mr-2">
														<img
															width={"20px"}
															height="20px"
															style={{
																position:
																	"absolute",
																left: "15px",
																backgroundColor:
																	"white",
															}}
															src={
																log.instance_connected
																	? instanceConnectedIcon
																	: logIcon
															}
														/>
													</span>
													{
														logTitleMapper[
															log.log_type
														]
													}
												</div>
											)}
											{log.log_type && (
												<div
													style={{
														color: "#717171",
													}}
													className="font-11 my-2 ml-3"
												>
													{`${
														logDescriptionMapper[
															log.log_type
														]
													} ${log.created_by.name}`}
												</div>
											)}
										</div>
										<div
											style={{
												color: "rgba(113, 113, 113, 1)",
											}}
											className="font-13"
										>
											{dayjs(log.date).format(
												"D MMM YYYY"
											)}
										</div>
									</div>
								))}
							</div>
						</>
					) : (
						<div align="center" className="my-8">
							No logs Available
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default InstanceLogs;
