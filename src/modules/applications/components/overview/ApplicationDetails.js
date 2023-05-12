import React from "react";
import overview2 from "../../../../assets/applications/overview2.svg";
import overview3 from "../../../../assets/applications/overview3.svg";
import uparrow from "../../../../components/Overview/uparrow.svg";
import downarrow from "../../../../assets/downarrow.svg";
import overview_live_users from "../../../../assets/applications/overview_live_users.svg";
import { MONTH } from "../../../../utils/DateUtility";
import { kFormatter } from "../../../../constants/currency";
import { RenewalWidget } from "../../../renewals/containers/RenewalWidget/RenewalWidget";

export default function ApplicationDetails({ app, onAppChange, loading }) {
	return (
		<>
			{loading ? (
				<div
					className="app_details_section"
					style={{ width: "auto", height: "91px" }}
				/>
			) : (
				<div className="app_details_section">
					<div className="app_details_section_insights">
						<div className="overview__top__next__ins1">
							Active Users
						</div>
						<div className="overview__top__next__ins2">
							<div>
								<img src={overview_live_users} />
							</div>
							<div className="app_details_header_text">
								{app?.app_active_users?.count}
							</div>
							{app?.app_active_users?.change_count >= 0 ? (
								<img
									className="overviewins__top__next__insimage"
									src={uparrow}
								/>
							) : (
								<img
									className="overviewins__top__next__insimage"
									src={downarrow}
								/>
							)}
							<div className="overviewins__top__next__insvalue font-12">
								{Math.abs(app?.app_active_users?.change_count)}
							</div>
							<div className="overviewins__top__next__instext2 font-12">
								in {MONTH[app?.app_active_users?.month_id - 1]}
							</div>
						</div>
						<div className="d-flex align-items-center mt-1">
							<div className="font-10 bold-600 grey o-5">
								{app?.app_total_users?.users_count || 0}
							</div>
							<div className="font-10 grey o-5 ml-1">
								Total Users
							</div>
						</div>
					</div>
					<div className="app_details_section_insights">
						<div className="overview__top__next__ins1">
							Average Monthly Spend
						</div>
						<div className="overview__top__next__ins2">
							<div style={{ marginTop: "4px" }}>
								<img src={overview2} />
							</div>
							<div className="app_details_header_text">
								{kFormatter(
									Math.abs(
										app?.app_monthly_spend?.monthly_spend
									) || 0
								)}
							</div>
							{app?.app_monthly_spend?.change >= 0 ? (
								<img
									className="overviewins__top__next__insimage"
									src={uparrow}
								/>
							) : (
								<img
									className="overviewins__top__next__insimage"
									src={downarrow}
								/>
							)}
							<div className="overview__top__next__instext2 font-12">
								{kFormatter(
									Math.abs(app?.app_monthly_spend?.change) ||
										0
								)}
							</div>
							<div className="overviewins__top__next__instext2 font-12">
								in {MONTH[app?.app_active_users?.month_id - 1]}
							</div>
						</div>
					</div>
					<div className="app_details_section_insights">
						<div className="overview__top__next__ins1">
							Est Cost [YTD]
						</div>
						<div className="overview__top__next__ins2">
							<div style={{ marginTop: "4px" }}>
								<img src={overview2} />
							</div>
							<div className="app_details_header_text">
								{kFormatter(
									Math.abs(app?.app_cost?.cost_YTD) || 0
								)}
							</div>
							{app?.app_cost?.change >= 0 ? (
								<img
									className="overviewins__top__next__insimage"
									src={uparrow}
								/>
							) : (
								<img
									className="overviewins__top__next__insimage"
									src={downarrow}
								/>
							)}
							<div className="overview__top__next__instext2">
								{kFormatter(
									Math.abs(app?.app_cost?.change) || 0
								)}
							</div>
							<div className="overviewins__top__next__instext2 font-12">
								in {MONTH[app?.app_active_users?.month_id - 1]}
							</div>
						</div>
					</div>
					<div className="app_details_section_insights">
						<div className="overview__top__next__ins1">
							Average Usage
						</div>
						<div className="overview__top__next__ins2">
							<div>
								<img src={overview3} />
							</div>
							<div className="app_details_header_text">
								{isNaN(
									parseInt(app?.app_average_usage?.avg_usage)
								)
									? 0
									: app?.app_average_usage?.avg_usage?.toFixed(
											0
									  )}
								%
							</div>
							{app?.app_average_usage?.change >= 0 ? (
								<img
									className="overviewins__top__next__insimage"
									src={uparrow}
								/>
							) : (
								<img
									className="overviewins__top__next__insimage"
									src={downarrow}
								/>
							)}
							<div className="overviewins__top__next__insvalue font-12">
								{app?.app_average_usage?.change > 0
									? (app?.app_average_usage?.change.toFixed(
											2
									  ) || 0) + "%"
									: -1 *
											(isNaN(
												parseInt(
													app?.app_average_usage
														?.change
												)
											)
												? 0
												: app?.app_average_usage?.change.toFixed(
														2
												  )) +
									  "%"}
							</div>
							<div className="overviewins__top__next__instext2 font-12">
								in {MONTH[app?.app_active_users?.month_id - 1]}
							</div>
						</div>
					</div>
					<div className="app_details_section_insights">
						<RenewalWidget
							application={app}
							onRenewalAdded={onAppChange}
						/>
					</div>
				</div>
			)}
		</>
	);
}
