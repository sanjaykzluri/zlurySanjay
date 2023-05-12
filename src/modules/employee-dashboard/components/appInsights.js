import React, { useEffect, useRef, useState } from "react";
import multiple_users from "assets/employee/multiple_users.svg";
import department from "assets/employee/department.svg";
import appowner from "assets/employee/app_owner.svg";
import shield from "assets/employee/shield.svg";
import { Dots } from "common/DottedProgress/DottedProgress";
import { capitalizeFirstLetter } from "utils/common";
import RiskIcon from "components/Applications/SecurityCompliance/RiskIcon";
import Rating from "components/Applications/SecurityCompliance/Rating";
import { authStatusObj } from "common/AppAuthStatus";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";
import ContentLoader from "react-content-loader";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import useOutsideClick from "common/OutsideClick/OutsideClick";
import { useHistory } from "react-router-dom";

export function AppInsights({ data, loading, setActiveTab }) {
	const history = useHistory();
	const [dataset, setDataset] = useState();
	const getStatusText = (status) => {
		return data?.app_archive ? (
			<div className="d-flex align-items-center">
				<Dots color="#717171" />
				<div className="ml-1">Archived</div>
			</div>
		) : status === "active" ? (
			<div className="d-flex align-items-center">
				<Dots color="#40E395" />
				<div className="ml-1">Active</div>
			</div>
		) : (
			<div className="d-flex align-items-center">
				<Dots color="#717171" />
				<div className="ml-1">{capitalizeFirstLetter(status)}</div>
			</div>
		);
	};

	const getAuthText = () => {
		return (
			<div className="d-flex flex-row align-items-center">
				<img
					src={
						authStatusObj[
							(data?.app_auth_status || "needs review")
								?.toLowerCase()
								?.replace(/ /g, "_")
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
										data.app_auth_status?.replace(/ /g, "_")
								  ]?.overviewTooltip
								: authStatusObj.needs_review.overviewTooltip}
						</BootstrapTooltip>
					}
				>
					<div className="ml-2">
						{capitalizeFirstLetter(
							data?.app_auth_status || "Needs Review"
						)}
					</div>
				</OverlayTrigger>
			</div>
		);
	};

	useEffect(() => {
		setDataset([
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
				text: "App Owner",
				value: data?.app_owner_name,
				src: appowner,
			},
			{
				text: "Compliances",
				value: (
					<PillsRenderer
						data={data?.compliance}
						onMoreClick={() => {
							setActiveTab("insights__d");
							history.push("#insights__d");
						}}
						onMoreClickComponent={(data, color) => (
							<a
								href={`#insights__d`}
								onClick={() => {
									setActiveTab("insights__d");
								}}
							>
								<NumberPill
									number={`+ ${data.length - 2}`}
									fontColor={"#222222"}
									fontSize={8}
									fontWeight={700}
									pillBackGround={color[2]}
									borderRadius={"50%"}
									pillHeight={20}
									pillWidth={20}
									style={{
										width: "20px",
										marginRight: "4px",
										cursor: "pointer",
									}}
								/>
							</a>
						)}
					/>
				),
				src: shield,
			},
			{
				text: "Status",
				value: getStatusText(data?.status),
				noMargin: true,
			},
			{
				text: "Authorizarion",
				value: getAuthText(),
				noMargin: true,
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
				value: `${Math.ceil(data?.risk_score)} on 100`,
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
	}, [loading]);

	return (
		<>
			{loading ? (
				<>
					<div className="d-flex column">
						<div className="insights-grid w-100">
							{[1, 2, 3, 4, 5, 6, 7, 8]?.map((item, index) => (
								<div
									key={index}
									className={`d-flex flex-column justify-content-between `}
									style={{ height: "55px" }}
								>
									<div className="grey-1 o-5 font-11">
										<ContentLoader
											width={76}
											height={9}
											backgroundColor={`#DDDDDD`}
										>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div className="d-flex align-items-center">
										<ContentLoader
											style={{ marginRight: 8 }}
											width={26}
											height={26}
											backgroundColor={`#DDDDDD`}
										>
											<circle
												cx="13"
												cy="13"
												r="13"
												fill="#EBEBEB"
											/>
										</ContentLoader>
										<div
											className={`font-16 bold-600 black-1  ${
												item.noMargin ? " " : "ml-2"
											}`}
											style={{ ...item.style }}
										>
											<ContentLoader
												width={65}
												height={18}
												backgroundColor={`#DDDDDD`}
											>
												<rect
													width="65"
													height="18"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</>
			) : (
				<>
					<div className="d-flex column">
						<div className="insights-grid w-100">
							{dataset?.map((item, index) => (
								<div
									key={index}
									className={`d-flex flex-column justify-content-between ${
										index < 4
											? "insights-grid-first-row"
											: "insights-grid-second-row"
									}`}
									style={{ height: "55px" }}
								>
									<div className="grey-1 o-5 font-11">
										{item.text}
									</div>
									<div className="d-flex align-items-center">
										<img src={item.src}></img>
										<div
											className={`font-16 bold-600 black-1  ${
												item.noMargin ? " " : "ml-2"
											}`}
											style={{ ...item.style }}
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
		</>
	);
}

export function PillsRenderer({
	data,
	onMoreClick,
	onMoreClickComponent,
	emptyState,
}) {
	const dropdownref = useRef();
	const [showAdditional, setShowAdditional] = useState(false);
	const color = [
		"rgba(255, 103, 103, 0.15)",
		"rgba(193, 138, 255, 0.15)",
		"rgba(255, 177, 105, 0.15)",
	];

	useOutsideClick(dropdownref, () => {
		if (showAdditional) setShowAdditional(false);
	});
	return (
		<div className="d-flex align-items-center">
			{(!Array.isArray(data) || data?.length === 0) && emptyState}
			{Array.isArray(data) &&
				data.slice(0, 2).map((el, index) => (
					<OverlayTrigger
						placement="top"
						overlay={<BootstrapTooltip>{el}</BootstrapTooltip>}
					>
						<div>
							<NumberPill
								number={el.charAt(0)?.toUpperCase()}
								fontColor={"#222222"}
								fontSize={12}
								fontWeight={700}
								pillBackGround={color[index % 4]} // 4 = length of array
								borderRadius={"50%"}
								pillHeight={20}
								pillWidth={20}
								style={{
									width: "20px",
									marginRight: "4px",
								}}
							/>
						</div>
					</OverlayTrigger>
				))}

			{Array.isArray(data) && data.length > 2 && (
				<div className="position-relative">
					{onMoreClickComponent ? (
						onMoreClickComponent(data, color)
					) : (
						<NumberPill
							number={`+ ${data.length - 2}`}
							fontColor={"#222222"}
							onClick={(e) => {
								onMoreClick
									? onMoreClick()
									: setShowAdditional(true);
							}}
							fontSize={8}
							fontWeight={700}
							pillBackGround={color[2]}
							borderRadius={"50%"}
							pillHeight={20}
							pillWidth={20}
							style={{
								width: "20px",
								marginRight: "4px",
								cursor: "pointer",
							}}
						/>
					)}
					{showAdditional && (
						<div
							className="additionaldept-app-insights-dropdown"
							ref={(el) => {
								if (el) {
									dropdownref.current = el;
								}
							}}
							style={
								data.length > 2
									? {
											paddingBottom: "7px",
									  }
									: {
											cursor: "default",
									  }
							}
						>
							<div
								className="d-flex flex-column mr-1"
								style={{
									marginTop: "9px",
									maxHeight: "210px",
									width: "100%",
									overflowY: "auto",
									overflowX: "none",
								}}
							>
								{data.map((el, index) => {
									if (index > 1) {
										return (
											<OverlayTrigger
												placement="top"
												overlay={
													<BootstrapTooltip>
														{el}
													</BootstrapTooltip>
												}
											>
												<div>
													<NumberPill
														number={el.charAt(0)}
														fontColor={"#222222"}
														fontSize={12}
														fontWeight={700}
														pillBackGround={
															color[index % 4]
														}
														borderRadius={"50%"}
														pillHeight={20}
														pillWidth={20}
														style={{
															width: "20px",
															marginRight: "4px",
														}}
													/>
												</div>
											</OverlayTrigger>
										);
									}
								})}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
