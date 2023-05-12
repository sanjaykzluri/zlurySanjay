import React, { useEffect, useState } from "react";
import {
	Dropdown,
	OverlayTrigger,
	Tooltip as BootstrapTooltip,
} from "react-bootstrap";
import lowRisk from "../../../assets/low_risk.svg";
import mediumRisk from "../../../assets/medium_risk.svg";
import highRisk from "../../../assets/high_risk.svg";
import dropdownarrow from "../Overview/dropdownarrow.svg";
import needsreview from "../../../assets/applications/needsreview.svg";
import OverviewField from "./OverviewField";
import Rating from "./Rating";
import { getApplicationSecurityOverview, updateManualRisk } from "../../../services/api/applications";
import ShowMoreText from "react-show-more-text";
import _ from "underscore";
import ContentLoader from "react-content-loader";
import Grade from "./Grade";
import moment from "moment";
import { useSelector } from "react-redux";

const auth_status_dropdown = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="security__dropdown"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		{children}
	</a>
));

const dropDownOptions = {
	LOW_RISK: {
		title: "Low Risk",
		icon: lowRisk,
		scoreRange: [1, 2],
		apiValue: 1,
		background: "#40E3951A",
	},
	MEDIUM_RISK: {
		title: "Medium Risk",
		icon: mediumRisk,
		scoreRange: [3],
		apiValue: 3,
		background: "#FFC1171A",
	},
	HIGH_RISK: {
		title: "High Risk",
		icon: highRisk,
		scoreRange: [4, 5],
		apiValue: 5,
		background: "#FF67671A",
	}
};

const getRiskByValue = (value) => {
	if ([1, 2].includes(value)) {
		return dropDownOptions.LOW_RISK;
	} else if ([3].includes(value)) {
		return dropDownOptions.MEDIUM_RISK;
	} else if ([4, 5].includes(value)) {
		return dropDownOptions.HIGH_RISK;
	}
}

export function Header({ application }) {
	const [selectedState, setSelectedState] = useState(
		dropDownOptions.LOW_RISK
	);
	const [data, setData] = useState();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const securityProbeData = useSelector((state) => state.applications?.singleappSecurityProbes?.[application?.app_id]?.data);

	const getHttpObservatoryStartTime = () => {
		var HttpObservatoryProbeObj = Array.isArray(securityProbeData?.security_probes) && securityProbeData?.security_probes.find((probe) => probe.k === "http_observatory" || probe.k === "http_obervatory");
		return HttpObservatoryProbeObj?.v?.summary?.start_time;
	}

	const updateOverview = () => {
		setLoading(true);
		getApplicationSecurityOverview(application?.app_id)
			.then((resp) => {
				setData(resp);
				setLoading(false);
				setSelectedState(getRiskByValue(resp?.manual_risk_level ? resp?.manual_risk_level : resp?.risk_level));
			})
			.catch(() => {
				setError(true);
				setLoading(false);
			});
	}
	useEffect(() => {
		if (application) {
			updateOverview()
		}
	}, [application]);

	const handleRiskLevelChange = (option) => {
		if (option?.title) {
			setSelectedState(option);
		}
		updateManualRisk(application?.app_id, option?.apiValue)
			.then(() => updateOverview());
	}

	return (
		<div>
			<div className="security_compliance_title">
				Security and Compliance Overview
			</div>
			{loading ? (
				_.times(3, (number) => (
					<div className="eventCard mb-3 ml-3 mr-3" key={number}>
						<ContentLoader height="105" width="100%">
							<rect
								width="160"
								height="10"
								rx="2"
								fill="#EBEBEB"
								y="15"
								x="20"
							/>
							<rect
								width="50%"
								height="17"
								rx="2"
								x={100}
								fill="#EBEBEB"
								y="35"
								x="20"
							/>
							<rect
								width="80%"
								height="12"
								rx="2"
								x={100}
								fill="#EBEBEB"
								y="63"
								x="20"
							/>
							<rect
								width="40%"
								height="12"
								rx="2"
								x={100}
								fill="#EBEBEB"
								y="85"
								x="20"
							/>
						</ContentLoader>
					</div>
				))
			) : (
				<div>
					<Dropdown
						className="security__dropdown__wrapper"
						style={{
							backgroundColor: selectedState?.background
						}}
					>
						<Dropdown.Toggle as={auth_status_dropdown}>
							{data?.manual_risk_level ? (
								<OverlayTrigger
									placement="top"
									overlay={
										<BootstrapTooltip>
											<div className="d-flex flex-column">
												<div>Risk manually set by</div>
												<div>
													{data?.manual_risk_updated_by || 'Admin'}
													<br />
													{data?.manual_risk_updated_on && `on ${moment(data?.manual_risk_updated_on).format("Do MMM YY LT")}`}
												</div>
											</div>
										</BootstrapTooltip>
									}
								>
									<div className="d-flex dropdown_button w-100 cursor-pointer">
										<img src={selectedState?.icon || needsreview} width={11} />
										<div className="font-14 grey ml-2 mr-0 grey bold-normal text-capitalize w-100 d-flex">
											{selectedState?.title || <span className="o-5 font-11">Data unavailable</span>}

											<img
												className="ml-auto"
												width={8}
												src={
													dropdownarrow
												}
											/>
										</div>
									</div>
								</OverlayTrigger>
							) : (
								<div className="d-flex dropdown_button w-100 cursor-pointer">
									<img src={selectedState?.icon || needsreview} width={11} />
									<div className="font-14 grey ml-2 mr-0 grey bold-normal text-capitalize w-100 d-flex">
										{selectedState?.title || <span className="o-5 font-11">Data unavailable</span>}

										<img
											className="ml-auto"
											width={8}
											src={
												dropdownarrow
											}
										/>
									</div>
								</div>
							)}
						</Dropdown.Toggle>
						<Dropdown.Menu className="p-0 security__dropdown__menu">
							{Object.values(dropDownOptions).map((option) => (
								<Dropdown.Item
									onClick={() => handleRiskLevelChange(option)}
								>
									<div className="d-flex flex-row align-items-center">
										<img src={option.icon} />
										<div className="overview__dropdownbutton__d2">
											{option.title}
										</div>
									</div>
								</Dropdown.Item>
							))}
							<Dropdown.Divider className="mt-0 mb-0" />
							<Dropdown.Item
								onClick={() => handleRiskLevelChange({ value: null })}
							>Reset Risk</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					<hr />
					<OverviewField
						label="RISK"
						value={
							<Rating
								rating={data?.risk_level ? data?.risk_level : Math.ceil(data?.risk_score / 20)}
								iconType="risk"
								labelType="level"
							/>
						}
						dataUnavailable={!data?.risk_level && !data?.risk_score}
					/>
					<OverviewField
						className="mt-4"
						label="THREAT"
						value={
							<Rating
								rating={data?.threat}
								iconType="scope"
								labelType="level"
							/>
						}
						dataUnavailable={!data?.threat}
					/>
					<hr />
					<OverviewField
						label="COMPLIANCE"
						value={
							<ShowMoreText
								lines={1}
								more="more"
								less="less"
								expanded={false}
							>
								{data?.compliance?.join(", ")}
							</ShowMoreText>
						}
						dataUnavailable={!(data?.compliance && data?.compliance?.length > 0)}
					/>
					<hr />
					<div className="gradeWrap">
						<div className="title">SECURITY GRADE</div>
						<div className="grade_details">
							<Grade
								className="security_grade mr-3"
								value={
									_.isString(data?.security_grade) && (data?.security_grade.toUpperCase() === "X" ? "?" : (data?.security_grade || ""))
								}
							/>
							<div className="security_fields">
								<OverviewField
									label="SCORE"
									value={
										data?.score_total &&
										<div>
											{Math.ceil(Number(data?.score || 0))} on{" "}
											{data?.score_total}
										</div>
									}
									dataUnavailable={!data?.score_total}
								/>
								<OverviewField
									label="SCANNED ON"
									value={<div>{data.scan_start_time ? moment(data.scan_start_time).format("Do MMM YYYY") : moment(getHttpObservatoryStartTime()).format("Do MMM YYYY")}</div>}
									dataUnavailable={!data.scan_start_time && !getHttpObservatoryStartTime()}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
