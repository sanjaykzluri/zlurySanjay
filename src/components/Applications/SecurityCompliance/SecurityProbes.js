import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicationSecurityProbes } from "../../../actions/applications-action";
import { Button } from "../../../UIComponents/Button/Button";
import "./SecurityProbes.css";
import { Tab, Row, Nav } from "react-bootstrap";
import _ from "underscore";
import HttpObservatory from "./HttpObservatory";
import TlsObservatory from "./TlsObservatory";
import ImmuniWeb from "./ImmuniWeb";
import SSLLabs from "./SSLLabs";
import Immirhil from "./Immirhil";
import SecurityHeaders from "./SecurityHeaders";
import HSTSPreload from "./HSTSPreload";
import Grade from "./Grade";
import ContentLoader from "react-content-loader";
import warning from "../../Onboarding/warning.svg";
import InlineEditHost from "./InlineEditHost";
import Rescan from "./Rescan";
import ScanningInProgress from "./ScanningInProgress";
import { appSecurityRescan } from "../../../services/api/applications";
import moment from "moment";

function SecurityProbes(props) {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [showErrorScreen, setShowErrorScreen] = useState(false);
	const [securityProbesData, setSecurityProbesData] = useState();
	const [showRescanningModal, setShowRescanningModal] = useState(false);
	const [rescanInitiated, setRescanInitiated] = useState(false);
	const [reScanningFailed, setRescanningFailed] = useState(false);
	const securityProbes = useSelector(
		(state) =>
			state.applications.singleappSecurityProbes[
				props.application?.app_id
			]
	);

	const refreshSecurityProbes = () => {
		dispatch(fetchApplicationSecurityProbes(props.application.app_id));
	};

	useEffect(() => {
		if (props.application) {
			dispatch(fetchApplicationSecurityProbes(props.application.app_id));
		}
	}, [props.application]);

	useEffect(() => {
		setLoading(true);
		if (!_.isEmpty(securityProbes?.error)) {
			setShowErrorScreen(true);
		} else {
			setShowErrorScreen(false);
		}
		if (!securityProbes?.loading && securityProbes?.data) {
			setSecurityProbesData(securityProbes?.data);
			setLoading(false);
		}
	}, [securityProbes]);

	const getHttpObservatoryStartTime = () => {
		var HttpObservatoryProbeObj =
			Array.isArray(securityProbes?.data?.security_probes) &&
			securityProbes?.data?.security_probes.find(
				(probe) =>
					probe.k === "http_observatory" ||
					probe.k === "http_obervatory"
			);
		return HttpObservatoryProbeObj?.v?.summary?.start_time;
	};

	const mapKeyValueWithComponent = (key, value) => {
		switch (key) {
			case "http_observatory":
			case "http_obervatory":
				return <HttpObservatory probeDetails={value} />;
				break;
			case "tls_observatory":
				return <TlsObservatory probeDetails={value} />;
				break;
			case "immuniweb":
				return <ImmuniWeb probeDetails={value} />;
				break;
			case "ssllabs":
				return <SSLLabs probeDetails={value} />;
				break;
			case "imirhil":
				return <Immirhil probeDetails={value} />;
				break;
			case "securityheaders":
				return <SecurityHeaders probeDetails={value} />;
				break;
			case "hstspreload":
				return <HSTSPreload probeDetails={value} />;
				break;
			default:
				break;
		}
	};

	const handleRescan = () => {
		setRescanInitiated(true);
		appSecurityRescan(props.application.app_id).then((response) => {
			if (response?.status === "success") {
				setShowRescanningModal(true);
				reScanningFailed && setRescanningFailed(false);
			} else {
				setRescanningFailed(true);
			}
			setTimeout(() => {
				setRescanInitiated(false);
			}, [900000]);
		});
	};

	return (
		<>
			{showErrorScreen ? (
				<div
					className="d-flex flex-column p-3"
					style={{ height: "50vh" }}
				>
					<img
						src={warning}
						className="ml-auto mr-auto mt-auto"
						style={{ width: "45.42px" }}
					/>
					<div className="grey-1 font-18 text-center mt-2">
						An error occured. Please try again
					</div>
					<Button
						className="btn btn-outline-primary ml-auto mr-auto mt-2 mb-auto"
						onClick={refreshSecurityProbes}
					>
						<div className="font-13">Retry</div>
					</Button>
				</div>
			) : (
				<>
					{loading ? (
						<div className="d-flex flex-column">
							<div className="d-flex flex-column">
								<div className="m-4">
									<div className="font-18">Scan Summary</div>
									<div className="bg-white security_probes_card d-flex flex-row p-3 mt-2 mr-4">
										<div className="d-flex flex-column ml-2 mr-2 security_probes_card_column">
											<ContentLoader
												height="91"
												width="91"
											>
												<rect
													width="91"
													height="91"
													rx="2"
													fill="#EBEBEB"
													y="0"
													x="00"
												/>
											</ContentLoader>
										</div>
										<div className="d-flex flex-column ml-2 mr-2 security_probes_card_column w-100 pl-4">
											<div className="d-flex flex-row scan_summary mt-3">
												<ContentLoader
													height="12"
													width="100%"
												>
													<rect
														width="90"
														height="12"
														rx="2"
														fill="#EBEBEB"
														y="0"
														x="00"
													/>
													<rect
														width="130"
														height="12"
														rx="2"
														fill="#EBEBEB"
														y="0"
														x="150"
													/>
												</ContentLoader>
											</div>
											<div className="d-flex flex-row scan_summary mt-3">
												<ContentLoader
													height="12"
													width="100%"
												>
													<rect
														width="90"
														height="12"
														rx="2"
														fill="#EBEBEB"
														y="0"
														x="00"
													/>
													<rect
														width="150"
														height="12"
														rx="2"
														fill="#EBEBEB"
														y="0"
														x="150"
													/>
												</ContentLoader>
											</div>
											<div className="d-flex flex-row scan_summary mt-3">
												<ContentLoader
													height="12"
													width="100%"
												>
													<rect
														width="90"
														height="12"
														rx="2"
														fill="#EBEBEB"
														y="0"
														x="00"
													/>
													<rect
														width="130"
														height="12"
														rx="2"
														fill="#EBEBEB"
														y="0"
														x="150"
													/>
												</ContentLoader>
											</div>
										</div>
									</div>
								</div>
								<Tab.Container defaultActiveKey={0}>
									<div
										className="d-flex justify-content-left mt-4 bg-white"
										style={{ paddingLeft: "20px" }}
									>
										<Nav className="security_probes_tabs d-flex flex-row flex-nowrap nav bg-white">
											{_.times(5, (num) => (
												<Nav.Item
													className="security_probe_tab mr-2"
													key={num}
												>
													<Nav.Link
														style={{
															paddingTop: "6px",
															paddingButtom:
																"6px",
														}}
														className="pl-0 pr-0"
														eventKey={num}
													>
														<div className="d-flex flex-column">
															<ContentLoader
																height={100}
																width="100%"
															>
																<rect
																	width="45"
																	height="45"
																	rx="2"
																	fill="#EBEBEB"
																	y="20"
																	x="45"
																/>
																<rect
																	width="85"
																	height="10"
																	rx="2"
																	fill="#EBEBEB"
																	y="80"
																	x="25"
																/>
															</ContentLoader>
														</div>
													</Nav.Link>
												</Nav.Item>
											))}
										</Nav>
									</div>
									<Row className="m-0">
										<Tab.Content className="w-100">
											{_.times(5, (num) => (
												<Tab.Pane
													eventKey={num}
													key={num}
												>
													<div className="bg-white security_probes_card d-flex flex-row p-3 mt-2 mr-4">
														<div className="d-flex flex-column ml-2 mr-2 security_probes_card_column">
															<ContentLoader
																height="91"
																width="91"
															>
																<rect
																	width="91"
																	height="91"
																	rx="2"
																	fill="#EBEBEB"
																	y="0"
																	x="00"
																/>
															</ContentLoader>
														</div>
														<div className="d-flex flex-column ml-2 mr-2 security_probes_card_column w-100 pl-4">
															<div className="d-flex flex-row scan_summary mt-3">
																<ContentLoader
																	height="12"
																	width="100%"
																>
																	<rect
																		width="90"
																		height="12"
																		rx="2"
																		fill="#EBEBEB"
																		y="0"
																		x="00"
																	/>
																	<rect
																		width="130"
																		height="12"
																		rx="2"
																		fill="#EBEBEB"
																		y="0"
																		x="150"
																	/>
																</ContentLoader>
															</div>
															<div className="d-flex flex-row scan_summary mt-3">
																<ContentLoader
																	height="12"
																	width="100%"
																>
																	<rect
																		width="90"
																		height="12"
																		rx="2"
																		fill="#EBEBEB"
																		y="0"
																		x="00"
																	/>
																	<rect
																		width="150"
																		height="12"
																		rx="2"
																		fill="#EBEBEB"
																		y="0"
																		x="150"
																	/>
																</ContentLoader>
															</div>
															<div className="d-flex flex-row scan_summary mt-3">
																<ContentLoader
																	height="12"
																	width="100%"
																>
																	<rect
																		width="90"
																		height="12"
																		rx="2"
																		fill="#EBEBEB"
																		y="0"
																		x="00"
																	/>
																	<rect
																		width="130"
																		height="12"
																		rx="2"
																		fill="#EBEBEB"
																		y="0"
																		x="150"
																	/>
																</ContentLoader>
															</div>
														</div>
													</div>
												</Tab.Pane>
											))}
										</Tab.Content>
									</Row>
								</Tab.Container>
							</div>
						</div>
					) : (
						<div className="d-flex flex-column">
							<div className="d-flex flex-column">
								<div className="m-4">
									<div className="font-18">Scan Summary</div>
									<div className="bg-white security_probes_card d-flex flex-row p-3 mt-2 mr-4">
										<div className="d-flex flex-column ml-2 mr-2 security_probes_card_column">
											<Grade
												className="scan_summary_grade"
												value={
													_.isString(
														securityProbesData?.security_grade
													) &&
													(securityProbesData?.security_grade.toUpperCase() ===
													"X"
														? "?"
														: securityProbesData?.security_grade ||
														  "")
												}
											/>
											<Rescan
												rescan={handleRescan}
												isScanning={
													securityProbesData?.scan_in_progress &&
													!securityProbesData?.scan_failed
												}
												reScanningFailed={
													reScanningFailed
												}
												loading={rescanInitiated}
											/>
										</div>
										<div className="d-flex flex-column ml-2 mr-2 security_probes_card_column w-100 pl-4">
											<div
												className="d-flex flex-row scan_summary"
												style={{ height: "auto" }}
											>
												<div className="grey label">
													Host
												</div>
												{securityProbesData?.scan_in_progress &&
												!securityProbesData?.scan_failed ? (
													<div
														className="grey-1 font-13"
														style={{
															marginLeft: "20px",
														}}
													>
														{
															securityProbesData?.host
														}
													</div>
												) : (
													<InlineEditHost
														app_id={
															props.application
																?.app_id
														}
														host={
															securityProbesData?.host
														}
														refreshSecurityProbes={
															refreshSecurityProbes
														}
													/>
												)}
											</div>
											<div className="d-flex flex-row scan_summary">
												<div className="grey label">
													Scanned on
												</div>
												<div
													className={`grey-1 font-13 value ${
														!securityProbesData?.scan_start_time &&
														!getHttpObservatoryStartTime() &&
														"o-6"
													}`}
												>
													{securityProbesData?.scan_start_time
														? moment(
																securityProbesData?.scan_start_time
														  ).format(
																"Do MMM YYYY"
														  )
														: getHttpObservatoryStartTime()
														? moment(
																getHttpObservatoryStartTime()
														  ).format(
																"Do MMM YYYY"
														  )
														: "data unavailable"}
												</div>
											</div>
											{/* <div className="d-flex flex-row scan_summary">
                                                        <div className="grey label">Duration</div>
                                                        <div className="grey-1 font-13 value">{securityProbesData?.duration} Seconds</div>
                                                    </div> */}
											<div className="d-flex flex-row scan_summary">
												<div className="grey label">
													Score
												</div>
												<div className="grey-1 font-13 value">
													{!!(
														securityProbesData?.score ||
														securityProbesData?.score_total
													) ? (
														<>
															{Math.ceil(
																Number(
																	securityProbesData?.score
																)
															)}
															/
															{
																securityProbesData?.score_total
															}
														</>
													) : (
														<div className="o-6">
															data unavailable
														</div>
													)}
												</div>
											</div>
											<div className="scan_summary">
												<div className="grey-1 o-6 font-11">
													This score is an aggregate
													of scans run on the
													following services
												</div>
											</div>
										</div>
									</div>
								</div>
								<>
									{securityProbesData?.security_probes &&
										Array.isArray(
											securityProbesData?.security_probes
										) &&
										securityProbesData?.security_probes
											?.length > 0 && (
											<Tab.Container
												defaultActiveKey={
													_.first(
														securityProbesData?.security_probes
													).k
												}
											>
												<div
													className="d-flex justify-content-left mt-4 bg-white"
													style={{
														paddingLeft: "20px",
														paddingRight: "20px",
													}}
												>
													<Nav
														navbarBsPrefix="security_probes_tabs d-flex flex-row bg-white"
														style={{
															flexWrap: "nowrap",
															overflowX: "auto",
														}}
													>
														{securityProbesData?.security_probes.map(
															(probe, index) => (
																<Nav.Item
																	className="security_probe_tab mr-2"
																	key={index}
																>
																	<Nav.Link
																		style={{
																			paddingTop:
																				"6px",
																			paddingButtom:
																				"6px",
																		}}
																		className="pl-0 pr-0"
																		eventKey={
																			probe.k
																		}
																	>
																		<div className="d-flex flex-column">
																			<Grade
																				className="ml-auto mr-auto"
																				value={
																					probe
																						.v
																						?.summary
																						?.overall_rating ||
																					""
																				}
																			/>
																			<div className="font-14 grey bold-600 text-center mt-2">
																				{
																					probe
																						.v
																						?.name
																				}
																			</div>
																		</div>
																	</Nav.Link>
																</Nav.Item>
															)
														)}
													</Nav>
												</div>
												<Row className="m-0">
													<Tab.Content className="w-100">
														{securityProbesData?.security_probes.map(
															(probe, index) => (
																<Tab.Pane
																	eventKey={
																		probe.k
																	}
																	key={index}
																>
																	{mapKeyValueWithComponent(
																		probe.k,
																		probe.v
																	)}
																</Tab.Pane>
															)
														)}
													</Tab.Content>
												</Row>
											</Tab.Container>
										)}
								</>
								{showRescanningModal && (
									<ScanningInProgress
										closeModal={() => {
											setShowRescanningModal(false);
											refreshSecurityProbes();
										}}
										isOpen={showRescanningModal}
										className="bg-white ml-4 mr-4 mb-4 rounded"
									/>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</>
	);
}

export default SecurityProbes;
