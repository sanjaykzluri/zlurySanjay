import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import Rating from "components/Applications/SecurityCompliance/Rating";
import RiskIcon from "components/Applications/SecurityCompliance/RiskIcon";
import React, { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import { getAppOverview } from "services/api/employeeDashboard";
import { TriggerIssue } from "utils/sentry";
import { PillsRenderer } from "./appInsights";
import {
	Card,
	Spinner,
	Accordion,
	OverlayTrigger,
	Tooltip as BootstrapTooltip,
} from "react-bootstrap";
import multiple_users from "assets/employee/multiple_users.svg";
import department from "assets/employee/department.svg";
import infoimg from "assets/employee/info_img.svg";
import infoimg_red from "assets/employee/infoimg_red.svg";
import applink from "assets/employee/app_link.svg";
import { capitalizeFirstLetter, withHttp } from "utils/common";
import { authStatusObj } from "common/AppAuthStatus";
import { useSelector } from "react-redux";

export function AdditionalInfoContainer({
	data,
	hideMoreInfo,
	setDefaultLicenses,
	setLoadingAdditionalInfo,
}) {
	const [loadingApp, setLoadingApp] = useState(false);
	const [appInfo, setAppInfo] = useState();
	const [dataset, setDataset] = useState();
	const [toggleAdditonalInfo, setToggleAdditionalInfo] = useState(true);
	const { userInfo } = useSelector((state) => state);

	useEffect(() => {
		if (data.app_id) {
			fetchAppOverview(data?.app_id);
		}
	}, [data.app_id]);

	const fetchAppOverview = async (app_id) => {
		setLoadingApp(true);
		try {
			const res = await getAppOverview(app_id);
			if (res) {
				setLoadingApp(false);
				setAppInfo(res);
				handleDataset(res);
				setLoadingAdditionalInfo && setLoadingAdditionalInfo(false);
				setDefaultLicenses &&
					setDefaultLicenses(
						res.app_licenses.map((el) => {
							return {
								title: el.tier_name,
								value: el.tier_name,
								id: el._id,
								tier_pricing_value: el.tier_pricing_value,
								period: el.period,
								tier_is_per_month: el.tier_is_per_month,
								tier_is_billed_annual: el.tier_is_billed_annual,
								tier_currency: el.tier_currency,
							};
						})
					);
			}
		} catch (err) {
			handleDataset([]);
			setLoadingApp(false);
			TriggerIssue("error while fetching App Info", err);
		}
	};

	const handleDataset = (data) => {
		setDataset([
			{
				text: "Authorisation",
				value: (
					<div className="d-flex flex-row align-items-center">
						<img
							src={
								authStatusObj[
									data?.app_auth_status
										?.toLowerCase()
										?.replace(/ /g, "_") || "needs_review"
								]?.image
							}
							height={12}
							width={12}
						/>
						<OverlayTrigger
							placement="top"
							overlay={
								<BootstrapTooltip>
									{data?.app_auth_status
										? authStatusObj?.[
												data.app_auth_status?.replace(
													/ /g,
													"_"
												)
										  ]?.overviewTooltip
										: authStatusObj.needs_review
												.overviewTooltip}
								</BootstrapTooltip>
							}
						>
							<div className="ml-2">
								{capitalizeFirstLetter(
									data?.app_auth_status || "needs review"
								)}
							</div>
						</OverlayTrigger>
					</div>
				),
			},
			{
				text: "Users",
				value: data?.user_count,
				src: multiple_users,
			},
			{
				text: "Departments",
				value: <PillsRenderer data={data?.department_names} />,
				src: department,
			},

			{
				text: "Risk Level",
				value: (
					<RiskIcon
						showLable={true}
						riskValue={data?.risk_level && 2}
						className={"text-capitalize"}
						dataUnavailableStyle={{
							marginTop: "3px",
						}}
					/>
				),
				noMargin: true,
				style: {
					top: "-2px",
				},
			},
			{
				text: "Risk Score",
				value: `${Math.ceil(data?.risk_score || 0)} on 100`,
				noMargin: true,
			},
			{
				text: "Threat Level",
				value: (
					<div className="d-flex flex-row">
						<Rating
							rating={data?.threat || 0}
							iconType="scope"
							width={12}
							height={15}
							showValueInsideIcon={true}
							valueTopPosition={"2px"}
							valueLeftPosition={"3.1px"}
						/>
						<div className=" pl-3">
							{`Level ${data?.threat || 0}`}
						</div>
					</div>
				),
				noMargin: true,
			},
		]);
	};

	return (
		<>
			<Accordion className="w-100 border-0 mb-3">
				<Card className="p-0 w-100 ml-auto mr-auto ml-2 mr-2 border-0">
					{loadingApp ? (
						<>
							<div className="d-flex align-items-center mr-auto ml-1 w-100 p-3">
								<ContentLoader width={150} height={15}>
									<rect
										width={150}
										height={15}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						</>
					) : (
						<>
							<div className="d-flex align-items-center mr-auto ml-1 w-100 p-3">
								<GetImageOrNameBadge
									url={appInfo?.app_logo}
									name={appInfo?.app_name}
									height={40}
									width={40}
									borderRadius="50%"
								/>

								<div className="d-flex flex-column">
									<div className="d-flex align-items-center">
										<div className="bold-600 font-18 ml-2 mr-1">
											{appInfo?.app_name}
										</div>
										<img
											src={applink}
											className="cursor-pointer"
											onClick={(e) => {
												e.stopPropagation();
												window.open(
													`${withHttp(
														appInfo.app_link
													)}`,
													"_blank"
												);
											}}
										></img>
									</div>

									{Array.isArray(appInfo?.app_categories) &&
										appInfo?.app_categories.length > 0 && (
											<>
												<div className="grey-1 font-11 ml-2">
													{
														appInfo
															?.app_categories[0]
															.category_name
													}
												</div>
											</>
										)}
								</div>
								{appInfo?.app_in_org ? (
									<>
										<div className="mr-1 glow_blue font-12 bold-500 cursor-pointer d-flex align-items-center ml-auto">
											<img src={infoimg}></img>
											<div>
												THIS APP IS USED IN YOUR ORG
											</div>
										</div>
									</>
								) : (
									<>
										<div className="mr-1 glow_blue font-12 bold-500 cursor-pointer d-flex align-items-center ml-auto">
											<img src={infoimg_red}></img>
											<div className="red">
												THIS APP IS NOT USED IN YOUR ORG
											</div>
										</div>
									</>
								)}
							</div>
							<div
								className={`ml-1 px-3 pt-1 pb-2 font-12 grey-1 `}
								style={{ lineHeight: "18px" }}
							>
								{appInfo?.description}
							</div>
						</>
					)}

					<Card.Body className="p-0 border-top">
						{userInfo?.apps_permissions?.application_settings
							?.show_insights && (
							<>
								<div
									className="d-flex flex-column px-3"
									style={{
										padding: "18px 0px",
										background: "rgba(244, 246, 250, 0.5)",
									}}
								>
									<div className="d-flex align-items-center justify-content-between">
										{dataset?.map((item, index) => (
											<div
												key={index}
												className={`d-flex flex-column justify-content-between`}
												style={{
													height: "55px",
												}}
											>
												<div className="grey-1 o-5 font-11">
													{item.text}
												</div>
												<div className="d-flex align-items-center">
													<img src={item.src}></img>
													<div
														className={`font-16 bold-600 black-1  ${
															item.noMargin
																? " "
																: "ml-2"
														}`}
														style={{
															...item.style,
														}}
													>
														{item.value}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</>
						)}
					</Card.Body>
				</Card>
			</Accordion>
		</>
	);
}
