import React, { useContext, useEffect, useState } from "react";
import uparrow from "../../../../components/Overview/uparrow.svg";
import downarrow from "../../../../assets/downarrow.svg";
import overview2 from "../../../../assets/applications/overview2.svg";
import overview3 from "../../../../assets/applications/overview3.svg";
import overview6 from "../../../../assets/departments/overview6.svg";
import { kFormatter } from "../../../../constants/currency";
import overview_total_apps from "../../../../assets/users/overview_total_apps.svg";
import { MONTH } from "../../../../utils/DateUtility";

export function HeaderRight({ user }) {
	return (
		<>
			{user && !user.loading ? (
				<div className="user_details_section">
					<div className="user_details_section_insights">
						<div className="overview__top__next__ins1">
							Actively used apps
						</div>
						<div className="overview__top__next__ins2">
							<div>
								<img src={overview6} />
							</div>
							<div className="overview__top__next__instext">
								{user.user_active_apps
									? user.user_active_apps.count
									: 0}
							</div>
							<img
								className="overviewins__top__next__insimage"
								src={
									user.user_active_apps &&
									user.user_active_apps.change_count >= 0
										? uparrow
										: downarrow
								}
								alt="Apps Used"
							/>
							<div className="overviewins__top__next__insvalue">
								{user.user_active_apps
									? Math.abs(
											user.user_active_apps.change_count
									  )
									: 0}
							</div>
							<div className="overview__top__next__instext2">
								in{" "}
								{MONTH[user?.user_average_usage?.month_id - 1]}
							</div>
						</div>
					</div>
					<div className="user_details_section_insights">
						<div className="overview__top__next__ins1">
							Avg. Monthly Spend
						</div>
						<div className="overview__top__next__ins2">
							<div>
								<img src={overview2} />
							</div>
							<div className="overview__top__next__instext">
								{user.user_monthly_spend
									? kFormatter(
											user.user_monthly_spend
												.monthly_spend
									  )
									: 0}
							</div>
							<img
								className="overviewins__top__next__insimage"
								src={
									user.user_monthly_spend &&
									user.user_monthly_spend.change >= 0
										? uparrow
										: downarrow
								}
							/>
							<div className="overviewins__top__next__insvalue">
								{user.user_monthly_spend
									? kFormatter(
											Math.abs(
												user.user_monthly_spend.change
											)
									  )
									: 0}
							</div>
							<div className="overview__top__next__instext2">
								in{" "}
								{MONTH[user?.user_average_usage?.month_id - 1]}
							</div>
						</div>
					</div>
					<div className="user_details_section_insights">
						<div className="overview__top__next__ins1">
							Monthly Cost
						</div>
						<div className="overview__top__next__ins2">
							<div>
								<img src={overview2} />
							</div>
							<div className="overview__top__next__instext">
								{user.user_monthly_spend
									? kFormatter(user.user_cost?.cost_YTD)
									: 0}
							</div>
							<img
								className="overviewins__top__next__insimage"
								src={
									user.user_cost &&
									user.user_cost?.change >= 0
										? uparrow
										: downarrow
								}
							/>
							<div className="overviewins__top__next__insvalue">
								{user.user_cost
									? kFormatter(
											Math.abs(user.user_cost.change)
									  )
									: 0}
							</div>
							<div className="overview__top__next__instext2">
								in{" "}
								{MONTH[user?.user_average_usage?.month_id - 1]}
							</div>
						</div>
					</div>
					<div className="user_details_section_insights">
						<div className="overview__top__next__ins1">
							Total Apps
						</div>
						<div className="overview__top__next__ins2">
							<div>
								<img src={overview_total_apps} />
							</div>
							<div className="overview__top__next__instext">
								{user.user_apps_used
									? user.user_apps_used.apps_count
									: 0}
							</div>
							<img
								className="overviewins__top__next__insimage"
								src={
									user.user_apps_used &&
									user.user_apps_used.change >= 0
										? uparrow
										: downarrow
								}
								alt="Apps Used"
							/>
							<div className="overviewins__top__next__insvalue">
								{user.user_apps_used
									? Math.abs(user.user_apps_used.change)
									: 0}
							</div>
							<div className="overview__top__next__instext2">
								in{" "}
								{MONTH[user?.user_average_usage?.month_id - 1]}
							</div>
						</div>
					</div>
					<div className="user_details_section_insights">
						<div className="overview__top__next__ins1">
							Average Usage
						</div>
						<div className="overview__top__next__ins2">
							<div style={{ marginTop: "4px" }}>
								<img src={overview3} />
							</div>
							<div className="overview__top__next__instext">
								{user.user_average_usage?.avg_usage?.toFixed(
									0
								) || 0}
								%
							</div>
							<img
								className="overviewins__top__next__insimage"
								src={
									user.user_average_usage &&
									user.user_average_usage.change >= 0
										? uparrow
										: downarrow
								}
							/>
							<div className="overviewins__top__next__insvalue">
								{user.user_average_usage
									? Math.abs(user.user_average_usage.change)
									: 0}
								%
							</div>
							<div className="overview__top__next__instext2">
								in{" "}
								{MONTH[user?.user_average_usage?.month_id - 1]}
							</div>
						</div>
					</div>
				</div>
			) : (
				<div
					className="user_details_section"
					style={{ width: "auto", height: "91px" }}
				></div>
			)}
		</>
	);
}
