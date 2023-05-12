import React from "react";
import "../Overview.css";
import topRowCardIncrease from "assets/overview/topRowCardIncrease.svg";
import topRowCardDecrease from "assets/overview/topRowCardDecrease.svg";
import topRowCardBreakDownProcessing from "assets/overview/topRowCardBreakDownProcessing.svg";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { kFormatter } from "constants/currency";
import {
	getAppCountByAuthStatus,
	getUserCountByType,
	topRowAppBreakDownAuthMetaData,
	topRowUserBreakDownTypeMetaData,
} from "../OverviewUtils";
import { MONTH } from "utils/DateUtility";
import { useHistory } from "react-router-dom";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";

export default function TopRow({ toprow }) {
	const history = useHistory();
	const topRowCardsData = [
		{
			title: "Applications",
			value: toprow?.data?.applications?.count,
			change: toprow?.data?.applications?.change,
			hasBreakDown: true,
			breakDownKeys: [
				"managed",
				"unmanaged",
				"restricted",
				"needs review",
			],
			getBreakDownValue: (auth) =>
				getAppCountByAuthStatus(
					auth,
					toprow?.data?.applications?.break_down
				),
			onBreakDownClick: (auth) =>
				history.push(
					`/applications?metaData=${JSON.stringify(
						topRowAppBreakDownAuthMetaData(
							auth === "managed"
								? [
										"centrally managed",
										"team managed",
										"individually managed",
								  ]
								: [auth]
						)
					)}#${auth?.replaceAll(" ", "_")}`
				),
			breakDownHeader: "Authorization Status",
			onBigBlueClick: () =>
				history.push(
					`/applications?metaData=${JSON.stringify(
						topRowAppBreakDownAuthMetaData([
							"centrally managed",
							"team managed",
							"individually managed",
							"unmanaged",
							"restricted",
							"needs review",
						])
					)}#managed`
				),
		},
		{
			title: "Active Users",
			value: toprow?.data?.active_users?.count,
			change: toprow?.data?.active_users?.change,
			hasBreakDown: true,
			breakDownKeys: ["employee", "group", "service", "external"],
			getBreakDownValue: (type) =>
				getUserCountByType(
					type,
					toprow?.data?.active_users?.break_down
				),
			onBreakDownClick: (type) =>
				history.push(
					`/users?metaData=${JSON.stringify(
						topRowUserBreakDownTypeMetaData([type])
					)}#${type === "employee" ? "employees" : type}`
				),
			breakDownHeader: "Employee Type",
			onBigBlueClick: () =>
				history.push(
					`/users?metaData=${JSON.stringify(
						topRowUserBreakDownTypeMetaData([
							"employee",
							"group",
							"service",
							"external",
						])
					)}#employees`
				),
		},
		{
			title: "Average Usage",
			value: toprow?.data?.average_usage?.percentage,
			change: toprow?.data?.average_usage?.change,
			valueFormatter: (value) => (value ? `${value?.toFixed(1)}%` : "0%"),
			hasBreakDown: true,
			breakDownKeys: toprow?.data?.average_usage?.least_used_apps,
			breakDownKeyFormatter: (app) => (
				<div className="d-flex align-items-center w-75">
					<GetImageOrNameBadge
						url={app?.app_logo}
						name={app?.app_name}
						width={12}
						height={12}
						imageClassName="topRowCardBreakDownRowLogo"
					/>
					<LongTextTooltip
						text={app?.app_name}
						maxWidth={"75%"}
						style={{ fontSize: "11px", marginLeft: "2px" }}
					/>
				</div>
			),
			getBreakDownValue: (app) => app?.app_usage,
			onBreakDownClick: (app) =>
				history.push(`/applications/${app?._id}#overview`),
			breakDownHeader: "Managed apps with low usage",
			onBigBlueClick: () =>
				history.push(
					`/applications?metaData=${JSON.stringify(
						topRowAppBreakDownAuthMetaData(
							[
								"centrally managed",
								"team managed",
								"individually managed",
								"unmanaged",
								"restricted",
								"needs review",
							],
							[
								{
									field_id: "app_usage",
									field_name: "Usage",
									field_values: [0],
									filter_type: "range",
									field_order: ["gt"],
									negative: false,
									is_custom: false,
								},
							],
							[{ app_usage: 1 }]
						)
					)}#managed`
				),
			emptyBreakDownText:
				"Usages are getting processed and will be available soon.",
		},
		{
			title: "Total Spend (YTD)",
			value: toprow?.data?.spends?.total,
			change: toprow?.data?.spends?.change,
			valueFormatter: (value) => kFormatter(value),
			hasBreakDown: true,
			breakDownKeys: toprow?.data?.spends?.highest_spend_apps,
			breakDownKeyFormatter: (app) => (
				<div className="d-flex align-items-center w-75">
					<GetImageOrNameBadge
						url={app?.app_logo}
						name={app?.app_name}
						width={12}
						height={12}
						imageClassName="topRowCardBreakDownRowLogo"
					/>
					<LongTextTooltip
						text={app?.app_name}
						maxWidth={"75%"}
						style={{ fontSize: "11px", marginLeft: "2px" }}
					/>
				</div>
			),
			getBreakDownValue: (app) => app?.app_spend,
			onBreakDownClick: (app) =>
				history.push(`/applications/${app?._id}#overview`),
			breakDownHeader: "Top apps by spend",
			onBigBlueClick: () =>
				history.push(
					`/applications?metaData=${JSON.stringify(
						topRowAppBreakDownAuthMetaData(
							[
								"centrally managed",
								"team managed",
								"individually managed",
								"unmanaged",
								"restricted",
								"needs review",
							],
							[],
							[{ app_spend: -1 }]
						)
					)}#managed`
				),
			emptyBreakDownText:
				"No spends processed for the current financial year.",
		},
		{
			title: "Renewals",
			value: toprow?.data?.renewals?.count,
			change: toprow?.data?.renewals?.change,
			hasBreakDown: true,
			breakDownKeys: Array.isArray(
				toprow?.data?.renewals?.upcoming_renewals
			)
				? toprow?.data?.renewals?.upcoming_renewals.sort(
						(x, y) => y?.cost - x?.cost
				  )
				: [],
			breakDownKeyFormatter: (renewal) => (
				<div className="d-flex align-items-center w-75">
					<GetImageOrNameBadge
						url={renewal?.org_app_id?.app_logo}
						name={
							renewal?.org_app_id?.app_name ||
							renewal?.org_contract_id?.name
						}
						width={12}
						height={12}
						imageClassName="topRowCardBreakDownRowLogo"
					/>
					<LongTextTooltip
						text={renewal?.org_contract_id?.name}
						maxWidth={"75%"}
						style={{ fontSize: "11px", marginLeft: "4px" }}
					/>
				</div>
			),
			getBreakDownValue: (renewal) =>
				kFormatter(renewal?.org_contract_id?.cost),
			onBreakDownClick: (renewal) =>
				history.push(
					`/licenses/${renewal?.org_contract_id?.type}s/${renewal?.org_contract_id?._id}#overview`
				),
			breakDownHeader: "Top upcoming contract renewals",
			onBigBlueClick: () => history.push("/licenses/renewals"),
			emptyBreakDownText:
				"No upcoming contract renewals in the current month.",
		},
	];

	return (
		<div className="topRowContainer">
			{topRowCardsData.map((cardData, index) => (
				<TopRowCard
					key={index}
					title={cardData?.title}
					value={cardData?.value}
					change={cardData?.change}
					changeText={`in ${MONTH[toprow?.data?.month_id - 1]}`}
					noChangeText={!!cardData?.noChangeText}
					valueFormatter={cardData?.valueFormatter}
					hasBreakDown={!!cardData?.hasBreakDown}
					breakDownKeys={cardData?.breakDownKeys}
					getBreakDownValue={cardData?.getBreakDownValue}
					breakDownKeyFormatter={cardData?.breakDownKeyFormatter}
					onBreakDownClick={cardData?.onBreakDownClick}
					breakDownHeader={cardData?.breakDownHeader}
					onBigBlueClick={cardData?.onBigBlueClick}
					emptyBreakDownText={cardData?.emptyBreakDownText}
				/>
			))}
		</div>
	);
}

function TopRowCard({
	value,
	title,
	change = 0,
	changeText,
	breakDownKeys = [],
	getBreakDownValue = (value) => value,
	valueFormatter = (value) => value,
	breakDownKeyFormatter = (key) => (
		<div className="text-capitalize font-11">{key}</div>
	),
	onBreakDownClick,
	breakDownHeader = "",
	onBigBlueClick,
	emptyBreakDownText = "Insights are being processed and unavailable at this moment.",
}) {
	return (
		<div className="topRowCard">
			<div className={`font-14 bold-600 mt-1 mb-2`}>{title}</div>
			<div className="d-flex mb-2">
				<NumberPill
					number={valueFormatter(value || 0)}
					pillHeight={42}
					pillWidth={70}
					borderRadius={32}
					fontSize={24}
					style={{
						padding: "8px",
						cursor: onBigBlueClick ? "pointer" : "default",
					}}
					onClick={() => onBigBlueClick && onBigBlueClick()}
				/>
				<div className="d-flex align-items-center ml-1 pt-3">
					<img
						src={
							change >= 0
								? topRowCardIncrease
								: topRowCardDecrease
						}
						alt=""
						height={7.75}
						width={12.81}
						className="mr-1"
					/>
					<div
						className={`${
							change >= 0 ? "green" : "red"
						} font-11 bold-600`}
					>
						{valueFormatter(Math.abs(change))}
					</div>
					<div className={`ml-1 grey-1 font-11 bold-600`}>
						{changeText}
					</div>
				</div>
			</div>
			{Array.isArray(breakDownKeys) && breakDownKeys?.length > 0 ? (
				<>
					<hr className="m-0 w-100" />
					<div className={`font-11 bold-600 mt-2`}>
						{breakDownHeader}
					</div>
					{breakDownKeys.map((key, index) => (
						<div
							style={{
								margin:
									index === breakDownKeys.length - 1
										? "4px 0 0 0"
										: "4px 0px",
							}}
							className={`topRowCardBreakDownRow ${
								onBreakDownClick ? "cursor-pointer" : ""
							}`}
							key={index}
							onClick={() =>
								onBreakDownClick && onBreakDownClick(key)
							}
						>
							{breakDownKeyFormatter(key)}
							<NumberPill
								number={valueFormatter(getBreakDownValue(key))}
								pillBackGround="#E8F0FC"
								borderRadius={16}
								style={{ padding: "6px" }}
								fontSize={11}
								fontWeight={400}
								fontColor="#222222"
							/>
						</div>
					))}
				</>
			) : (
				<div className="topRowCardBreakDownProcessing">
					<img
						alt=""
						height={22.29}
						width={22.29}
						src={topRowCardBreakDownProcessing}
					/>
					<div className="topRowCardBreakDownProcessingText">
						{emptyBreakDownText}
					</div>
				</div>
			)}
		</div>
	);
}
