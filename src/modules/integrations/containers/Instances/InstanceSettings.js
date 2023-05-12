import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import ContentLoader from "react-content-loader";
import _ from "underscore";
import refershBlue from "../../../../components/Uploads/refreshBlue.svg";
import warning from "../../../../components/Onboarding/warning.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { useHistory, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import IntegrationConnectForm from "../IntegrationConnectFormModal/IntegrationConnectForm";
import { updateRequestForIntegrations } from "modules/integrations/redux/integrations";
import { getIntegrationInstanceOverview } from "modules/integrations/service/api";

function InstanceSettings(props) {
	let {
		integration,
		instance,
		handleDisconnect,
		setShowConnectModal,
		handleReconnect,
	} = {
		...props,
	};
	const [overviewData, setOverviewData] = useState();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState();
	const location = useLocation();
	const history = useHistory();
	const integrationId = location.pathname.split("/")[2];
	const isFormBased =
		Array.isArray(integration.form) && integration.form.length > 0;

	useEffect(() => {
		if (props.currentSection === props.sections.settings) {
			requestEndPoint();
		} else {
			setError();
			setLoading(true);
		}
	}, [props.currentSection]);

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
						<>
							{overviewData &&
								typeof overviewData.process_alias ===
									"boolean" && (
									<div className="pl-4">
										<div className="font-16 bold-600 grey pt-4 pb-1 rounded">
											Integration Settings
										</div>
										<Form.Check
											type="checkbox"
											className="d-flex align-items-center font-13"
											label={
												<div
													className="font-13"
													style={{
														paddingTop: "3px",
													}}
												>
													Process email aliases
												</div>
											}
											disabled={true}
											value={overviewData.process_alias}
											checked={overviewData.process_alias}
										/>
									</div>
								)}
							<div className="font-16 bold-600 grey pl-4 pt-4 rounded">
								Organisation Details
							</div>
							{isFormBased ? (
								<div>
									<IntegrationConnectForm
										integration={integration}
										onConnectionSuccessfull={() =>
											props.onConnectionSuccessfull &&
											props.onConnectionSuccessfull()
										}
										orgIntegrationId={instance.id}
										buttonText={"Re-connect"}
										showHelpText={true}
										showAccountForm={false}
										onClose={() => {
											if (
												![
													"/steps",
													"/integrations/connectInvite",
												].includes(
													window.location.pathname
												) &&
												props.isSimilarIntegration &&
												!window.location.pathname.includes(
													"workflow"
												)
											) {
												history.push(
													`/integrations/${props.integration.id}`
												);
												dispatch(
													updateRequestForIntegrations(
														props.integration.id
													)
												);
												dispatch(
													refreshPRState(
														props.integration.id
													)
												);
												dispatch(resetIntegration());
											} else {
												props.onClose &&
													props.onClose();
												props.callbackOnboardingPageOnSuccess &&
													props.callbackOnboardingPageOnSuccess();
											}
										}}
									/>
								</div>
							) : (
								<div className="px-4">
									<div
										style={{
											backgroundColor:
												"rgba(245, 246, 249, 0.7)",
											borderRadius: "4px",
										}}
										className="py-2"
									>
										<div
											style={{
												justifyContent: "space-between",
												width: "70%",
												margin: "0 auto",
											}}
											className="flex font-13 px-4"
										>
											<div className="p-2">
												<div className="grey-1 py-1">
													Connected by
												</div>
												<div className="bold-500 font-14">
													{instance?.connectedBy}
												</div>
											</div>
											<div className="p-2">
												<div className="grey-1 py-1">
													Connected on
												</div>
												<div className="bold-500 font-14">
													{instance?.connectedOn &&
														dayjs(
															instance?.connectedOn
														).format("D MMM YYYY")}
												</div>
											</div>
										</div>
									</div>
									<EditConnectionSecction
										instance={instance}
										integration={integration}
										actionHandler={handleDisconnect}
										connectionHandler={handleReconnect}
									/>
								</div>
							)}
						</>
					)}
				</>
			)}
		</div>
	);
}

export default InstanceSettings;

const EditConnectionSecction = ({
	instance,
	integration,
	actionHandler,
	connectionHandler,
}) => {
	return (
		<div
			style={{
				justifyContent: "center",
				alignItems: "center",
			}}
			className="flex mt-4"
		>
			{instance.status === "connected" ? (
				<>
					<div>
						<Button
							className="ml-3 d-flex"
							onClick={() => {
								actionHandler && actionHandler();
							}}
							type="reverse"
						>
							Disconnect
						</Button>
					</div>
				</>
			) : instance.status === "not-connected" ? (
				<div>
					<Button
						className="ml-3 d-flex px-4"
						onClick={() => {
							connectionHandler &&
								connectionHandler(
									instance.scopes,
									instance.id,
									true
								);
						}}
					>
						Re-connect
					</Button>
				</div>
			) : (
				""
			)}
		</div>
	);
};
