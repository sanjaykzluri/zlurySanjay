import React, {
	Fragment,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	Legend,
	YAxis,
	XAxis,
	LineChart,
	CartesianGrid,
	ResponsiveContainer,
	ComposedChart,
	Area,
	Tooltip,
} from "recharts";
import Line from "recharts/lib/cartesian/Line";
import _ from "underscore";
import moment from "moment";
import whiteCheck from "../../../../assets/whiteCheck.svg";
import { getUsageActivityDetails } from "../../../../services/api/sourcesApi";
import Manual from "../ManualUsage/TableComponents/Manual";
import ContentLoader from "react-content-loader";
import SourceDetails from "./SourceDetails";
import refershBlue from "../../../../components/Uploads/refreshBlue.svg";
import warning from "../../../../components/Onboarding/warning.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import check from "../../../../assets/applications/check.svg";
import RoleContext from "../../../../services/roleContext/roleContext";
import { unescape } from "../../../../utils/common";
import ManualLogo from "../../../../assets/icons/manual-logo.svg";

function SourceCard({ source, loading }) {
	return (
		<div className="mb-2">
			{loading ? (
				<div className="d-flex flex-row flex-wrap">
					{_.times(4, () => (
						<div className="sourceCard d-flex flex-column justify-content-center">
							<ContentLoader>
								<circle r="18" cx="55" cy="25" fill="#EBEBEB" />
								<rect
									width="68"
									x="20"
									y="55"
									height="10"
									rx="2"
									fill="#EBEBEB"
								/>
								<rect
									width="91"
									y="70"
									x="9"
									height="10"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
					))}
				</div>
			) : (
				<div className="sourceCard d-flex flex-column justify-content-center pt-3">
					<img
						src={
							source.keyword === "manual"
								? ManualLogo
								: unescape(source.logo)
						}
						style={{ width: "26px" }}
						className="ml-auto mr-auto"
					/>
					<div className="font-10 grey-1 text-center mt-1">
						{source.name}
					</div>
					<div className="bold-600 grey-1 text-center font-9 mt-1">
						{_.isBoolean(source.is_primary) ? (
							source.is_primary ? (
								<>Primary Source</>
							) : (
								<>Alternate Source</>
							)
						) : null}
					</div>
					<div className="d-flex flex-row center ml-auto mr-auto mt-1 w-100 justify-content-center">
						{source?.status ? (
							source?.status === "active" ? (
								<>
									<img src={check} alt="" />
									<div className="grey-1 bold-normal font-9 text-right ml-1">
										In use
									</div>
								</>
							) : (
								<>
									<img
										src={inactivecheck}
										style={{ width: "8px", height: "8px" }}
									></img>
									<div className="grey-1 bold-normal font-9 text-right ml-1">
										Not in Use
									</div>
								</>
							)
						) : null}
					</div>
				</div>
			)}
		</div>
	);
}

const renderLegend = (props) => {
	const { payload } = props;
	return (
		<div className="d-flex flex-row justify-content-left ml-3 flex-wrap ">
			{payload.map(
				(entry, index) =>
					entry.type != "none" &&
					entry.value && (
						<div
							key={`item-${index}`}
							className={`d-flex flex-row mr-4 mt-3 cursor-pointer pl-2 pr-2 pt-1 pb-1 rounded-pill ${
								entry.payload.opacity === 1
									? "selectedActivitySource"
									: ""
							}`}
							onClick={() => props.onClick(entry)}
						>
							<div
								style={{
									width: "16px",
									height: "16px",
									background: entry.color,
									borderRadius: 50,
								}}
								className="d-flex mr-2"
							>
								<img
									className="m-auto"
									src={whiteCheck}
									style={{ width: "10px" }}
								/>
							</div>
							<div className="font-12 grey bold-normal">
								{entry.value}
							</div>
						</div>
					)
			)}
		</div>
	);
};

function UsageActivityActivity(props) {
	const [usageActivityDetails, setUsageActivityDetails] = useState();
	const [opacity, setOpacity] = useState({});
	const [manualClicked, setManualClicked] = useState(false);
	const [loading, setLoading] = useState(true);
	const [showSourceDetails, setShowSourceDetails] = useState(false);
	const [selectedSource, setSelectedSource] = useState();
	const colors = ["#FFB26B", "#FF67CB", "#33DB79"];
	const [error, setError] = useState();
	const { isViewer } = useContext(RoleContext);

	const requestEndPoint = () => {
		setLoading(true);
		try {
			getUsageActivityDetails(props.id).then((res) => {
				if (res?.error) {
					setError(res);
				} else {
					setUsageActivityDetails(res?.data);
					setError();
				}
				setLoading(false);
			});
		} catch (error) {
			setError(error);
			setLoading(false);
			console.log("Error when fetching user-app activity details", error);
		}
	};

	useEffect(() => {
		if (props.currentSection === props.sections.activity) {
			requestEndPoint();
		} else {
			setManualClicked(false);
			setUsageActivityDetails();
			setLoading(true);
		}
	}, [props.currentSection]);

	function formatXAxis(tickItem) {
		return moment(tickItem).format("DD MMM");
	}

	const handleClick = useCallback(
		(o) => {
			const { dataKey } = o;
			if (Object.keys(opacity)?.includes(dataKey)) {
				setOpacity({});
			} else {
				setOpacity({ [dataKey]: 1 });
			}
		},
		[opacity, setOpacity]
	);

	const setOpenManualFalse = () => {
		props.setInterColumnsStateObject({
			...props.interColumnsStateObject,
			open_manual: false,
			orgUserAppId: undefined,
		});
	};

	const getSourceName = (recent_activity) => {
		let source;
		if (recent_activity.activityType === "agent") {
			source = _.findWhere(usageActivityDetails?.sources, {
				identifier: _.first(recent_activity.source_types),
			});
		} else {
			source = _.findWhere(usageActivityDetails?.sources, {
				keyword: _.first(recent_activity.source_types),
			});
		}
		return source?.name || "";
	};

	const handleSourceClick = (source) => {
		setShowSourceDetails(true);
		setSelectedSource(source);
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
					{/* <div className="grey-1 o-5 font-14 bold-normal">

                        </div> */}
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
						className="font-16 grey mb-2 bold-normal mt-3"
						style={{ marginLeft: "18px" }}
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
							"Sources"
						)}
					</div>
					<div className="d-flex flex-wrap">
						{loading ? (
							<SourceCard loading={loading} />
						) : (
							usageActivityDetails?.sources?.map(
								(source, index) =>
									Object.keys(source).length > 0 && (
										<div
											onClick={() =>
												source.keyword !== "manual" &&
												handleSourceClick(source)
											}
											className={
												source.keyword !== "manual" &&
												"cursor-pointer"
											}
										>
											<SourceCard
												source={source}
												key={index}
											/>
										</div>
									)
							)
						)}
						{usageActivityDetails?.is_manual_source_present && (
							<div className="sourceCard d-flex flex-column justify-content-center">
								<Manual
									style={{
										left: `${
											usageActivityDetails?.sources
												?.length > 0 &&
											(usageActivityDetails?.sources
												?.length +
												1) %
												4 ===
												0
												? "10px"
												: "60px"
										}`,
									}}
									manualPopoverClassName="usage-activity-manual-usage-popover"
									userId={props.userId}
									classes={"ml-auto mr-auto"}
									isUser={props.isUser}
									userAppId={props.id}
									open_manual={manualClicked}
									setOpenManualFalse={setOpenManualFalse}
									onSave={props.updateManualUsage}
									interColumnsStateObject={
										props.interColumnsStateObject
									}
									refresh={props.refresh}
									leftPosition={"100px"}
								/>
								<div className="font-10 grey-1 text-center mt-1">
									Manual Usage
								</div>
								{!isViewer && (
									<div
										className="cursor-pointer text-primary ml-auto mr-auto mt-1"
										style={{ fontSize: "11px" }}
										onClick={() => {
											if (!isViewer) {
												setManualClicked((val) => !val);
											}
										}}
									>
										+ Add
									</div>
								)}
							</div>
						)}
					</div>
					{
						<div
							className="border-1"
							style={{
								margin: "18px",
								borderRadius: "6px",
								paddingBottom: "30px",
							}}
						>
							{!loading && (
								<div className="grey font-16 bold-normal m-4">
									Recent Activity Trend
								</div>
							)}
							{loading ? (
								<div className="mt-3 mb-3">
									<ContentLoader width={550} height={250}>
										<rect
											x="15"
											y="0"
											rx="9"
											ry="9"
											width="500"
											height="250"
										/>
									</ContentLoader>
								</div>
							) : (
								usageActivityDetails?.source_wise_user_activity_trend && (
									<div style={{ width: "100%", height: 300 }}>
										<ResponsiveContainer width="100%">
											<ComposedChart
												data={
													usageActivityDetails?.source_wise_user_activity_trend
												}
												margin={{
													top: 20,
													right: 30,
													bottom: 20,
													left: -10,
												}}
											>
												<CartesianGrid
													vertical={false}
													horizontal={false}
												/>
												<XAxis
													dataKey="timestamp"
													tickCount={6}
													tickFormatter={formatXAxis}
													tickLine={false}
													axisLine={false}
													tick={{
														fontSize: 10,
														color: "#717171",
													}}
													domain={[0, "auto"]}
												/>
												<YAxis
													axisLine={false}
													tickLine={false}
													tick={{
														fontSize: 10,
														color: "#717171",
														marginLeft: 1,
													}}
												/>
												{colors.map((color, index) => (
													<defs key={index + 1}>
														<linearGradient
															id={`color${color}`}
															x1="0"
															y1="0"
															x2="0"
															y2="1"
														>
															<stop
																offset="5%"
																stopColor={
																	color
																}
																stopOpacity={
																	0.5
																}
															/>
															<stop
																offset="60%"
																stopColor={
																	color
																}
																stopOpacity={
																	0.5
																}
															/>
														</linearGradient>
													</defs>
												))}
												<defs key={0}>
													<linearGradient
														id={`color2266E2`}
														x1="0"
														y1="0"
														x2="0"
														y2="1"
													>
														<stop
															offset="5%"
															stopColor={
																"#2266E2"
															}
															stopOpacity={0.5}
														/>
														<stop
															offset="60%"
															stopColor={
																"#2266E2"
															}
															stopOpacity={0.5}
														/>
													</linearGradient>
												</defs>
												<Legend
													content={renderLegend}
													wrapperStyle={{
														top: 240,
														left: 20,
													}}
													onClick={handleClick}
												/>

												{usageActivityDetails?.sources?.map(
													(source, index) => (
														<Area
															dot={false}
															type="monotone"
															dataKey={
																source.keyword ===
																"agent"
																	? source.identifier
																	: source.keyword
															}
															fill={colors[index]}
															stroke={
																colors[index]
															}
															animationDuration={
																1500
															}
															name={source?.name}
															opacity={
																Object.keys(
																	opacity
																).length > 0
																	? opacity[
																			source.keyword ===
																			"agent"
																				? source.identifier
																				: source.keyword
																	  ] || 0
																	: 0.5
															}
															fill={`url(#color${colors[index]})`}
														/>
													)
												)}
												<Area
													dot={false}
													type="monotone"
													dataKey={"total_activity"}
													name={"Total Activity"}
													fill={"#2266E2"}
													stroke={"#2266E2"}
													animationDuration={1500}
													opacity={
														Object.keys(opacity)
															.length > 0
															? opacity[
																	"total_activity"
															  ] || 0
															: 0.5
													}
													fill={`url(#color2266E2)`}
												/>
												{usageActivityDetails?.sources?.map(
													(source, index) => (
														<Line
															dot={false}
															type="monotone"
															legendType="none"
															dataKey={
																source.keyword ===
																"agent"
																	? source.identifier
																	: source.keyword
															}
															name={source?.name}
															fill={colors[index]}
															stroke={
																colors[index]
															}
															animationDuration={
																3000
															}
															strokeWidth={1}
															opacity={
																Object.keys(
																	opacity
																).length > 0
																	? opacity[
																			source.keyword ===
																			"agent"
																				? source.identifier
																				: source.keyword
																	  ] || 0
																	: 0.5
															}
															label={false}
														/>
													)
												)}
												<Line
													dot={false}
													type="monotone"
													legendType="none"
													dataKey={"total_activity"}
													name={"Total Activity"}
													fill={"#2266E2"}
													stroke={"#2266E2"}
													animationDuration={3000}
													strokeWidth={1}
													opacity={
														Object.keys(opacity)
															.length > 0
															? opacity[
																	"total_activity"
															  ] || 0
															: 0.5
													}
													label={false}
												/>
											</ComposedChart>
										</ResponsiveContainer>
									</div>
								)
							)}
						</div>
					}
					{(loading ||
						(Array.isArray(usageActivityDetails?.recent_activity) &&
							usageActivityDetails?.recent_activity.length >
								0)) && (
						<div className="p-4">
							{loading ? (
								<ContentLoader width={95} height={15}>
									<rect
										width="95"
										height="15"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : (
								<div
									className="pb-3 border-bottom font-16 bold-normal grey"
									style={{
										borderBottom: "1px solid #EBEBEB",
									}}
								>
									Last Activity
								</div>
							)}
							<div className="d-flex flex-column">
								{loading
									? _.times(4, () => (
											<div className="d-flex flex-row pt-3 pb-3">
												<div className="mr-4">
													<ContentLoader
														width={91}
														height={10}
													>
														<rect
															width="91"
															height="10"
															rx="2"
															fill="#EBEBEB"
														/>
													</ContentLoader>
												</div>
												<div>
													<ContentLoader
														width={100}
														height={10}
													>
														<rect
															width="100"
															height="10"
															rx="2"
															fill="#EBEBEB"
														/>
													</ContentLoader>
												</div>
											</div>
									  ))
									: usageActivityDetails?.recent_activity?.map(
											(recent_activity, index) =>
												Object.keys(recent_activity)
													.length > 0 && (
													<div
														className="d-flex pt-3 pb-3"
														style={{
															borderBottom:
																"0.5px solid #EBEBEB",
														}}
														key={index}
													>
														<div className="d-flex flex-column mr-auto">
															<div
																className="mr-auto grey bold-normal"
																style={{
																	fontSize:
																		"13px",
																}}
															>
																{moment().year() ===
																moment(
																	recent_activity.timestamp
																).year()
																	? moment(
																			recent_activity.timestamp
																	  ).format(
																			"DD MMM hh:mm:ss"
																	  )
																	: moment(
																			recent_activity.timestamp
																	  ).format(
																			"DD MMM YYYY hh:mm:ss"
																	  )}
															</div>
															<div className="d-flex flex-row">
																<div className="font-10 grey-1 d-flex">
																	IP:{" "}
																	<div
																		className={`${
																			_.isEmpty(
																				recent_activity
																					?.user_activity_metadata
																					?.ip_address
																			) &&
																			"o-6"
																		} ml-1`}
																	>
																		{recent_activity
																			?.user_activity_metadata
																			?.ip_address ||
																			"unavailable"}
																	</div>
																</div>
																{recent_activity
																	?.user_activity_metadata
																	?.loaction && (
																	<div className="font-10 grey-1 ml-3">
																		{
																			recent_activity
																				?.user_activity_metadata
																				?.loaction
																		}
																	</div>
																)}
															</div>
														</div>
														{getSourceName(
															recent_activity
														) && (
															<div className="grey-1 font-12 o-5">
																via{" "}
																{getSourceName(
																	recent_activity
																)}
															</div>
														)}
													</div>
												)
									  )}
							</div>
						</div>
					)}
					{showSourceDetails && selectedSource && (
						<SourceDetails
							closeSourceDetails={() =>
								setShowSourceDetails(false)
							}
							user_app_id={usageActivityDetails.user_app_id}
							sourceId={selectedSource.keyword}
							identifier={selectedSource.identifier}
							app_name={usageActivityDetails.app_name}
							app_logo={usageActivityDetails.app_logo}
							user_name={usageActivityDetails.user_name}
							user_profile={usageActivityDetails.user_profile}
							isUser={usageActivityDetails.isUser}
							refresh={props.refresh}
						/>
					)}
				</>
			)}
		</div>
	);
}

export default UsageActivityActivity;
