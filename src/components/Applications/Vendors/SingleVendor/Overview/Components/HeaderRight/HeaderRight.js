import React, { Component, useState, useEffect, useContext } from "react";
import downarrow from "../../../../../../../assets/downarrow.svg";
import uparrow from "../../../../../../Overview/uparrow.svg";
import { kFormatter } from "../../../../../../../constants/currency";
import annualspend from "../../../../../../../assets/applications/vendors/annual_spend.svg";
import activecontracts from "../../../../../../../assets/applications/vendors/active_contracts.svg";
import totalapps from "../../../../../../../assets/applications/vendors/total_apps.svg";
import ContentLoader from "react-content-loader";
import moment from "moment";

import "./HeaderRight.css";
export function HeaderRight(props) {
	let current_month = moment().format("MMM");
	return (
		<>
			{props.loading ? (
				<div
					className="overview__top__next__vendor"
					style={{ width: "auto", height: "91px" }}
				></div>
			) : (
				<div className="overview__top__next__vendor">
					<div className="overview__top__next__insights">
						<div className="overview__top__next__ins1">
							Active Contracts
						</div>
						<div className="overview__top__next__ins2">
							<div>
								<img src={activecontracts}></img>
							</div>
							<div className="overviewins__top__next__instext">
								{props.vendor?.active_contracts}
							</div>
							{props.vendor?.active_contracts_change >= 0 ? (
								<img
									className="overviewins__top__next__insimage"
									src={uparrow}
								></img>
							) : (
								<img
									className="overviewins__top__next__insimage"
									src={downarrow}
								></img>
							)}
							<div className="overviewins__top__next__insvalue">
								{Math.abs(
									props.vendor?.active_contracts_change
								)}
							</div>
							<div className="overviewins__top__next__instext2">
								{`in ${current_month}`}
							</div>
						</div>
					</div>
					<div className="overview__top__next__insights">
						<div className="overview__top__next__ins1">
							Annual Spend
						</div>
						<div className="overview__top__next__ins2">
							<div style={{ marginTop: "4px" }}>
								<img src={annualspend}></img>
							</div>
							<div className="overview__top__next__instext">
								{kFormatter(
									Math.abs(props.vendor?.annual_spend) || 0
								)}
							</div>
							{props.vendor?.annual_spend_change >= 0 ? (
								<img
									className="overviewins__top__next__insimage"
									src={uparrow}
								></img>
							) : (
								<img
									className="overviewins__top__next__insimage"
									src={downarrow}
								></img>
							)}
							<div className="overview__top__next__instext2">
								{kFormatter(
									Math.abs(
										props.vendor?.annual_spend_change
									) || 0
								)}
							</div>
							<div className="overviewins__top__next__instext2">
								{`in ${current_month}`}
							</div>
						</div>
					</div>
					<div className="overview__top__next__insights">
						<div className="overview__top__next__ins1">
							Est Cost [YTD]
						</div>
						<div className="overview__top__next__ins2">
							<div style={{ marginTop: "4px" }}>
								<img src={annualspend}></img>
							</div>
							<div className="overview__top__next__instext">
								{kFormatter(
									Math.abs(props.vendor?.annual_cost) || 0
								)}
							</div>
							{props.vendor?.annual_cost_change >= 0 ? (
								<img
									className="overviewins__top__next__insimage"
									src={uparrow}
								></img>
							) : (
								<img
									className="overviewins__top__next__insimage"
									src={downarrow}
								></img>
							)}
							<div className="overview__top__next__instext2">
								{kFormatter(
									Math.abs(
										props.vendor?.annual_cost_change
									) || 0
								)}
							</div>
							<div className="overviewins__top__next__instext2">
								{`in ${current_month}`}
							</div>
						</div>
					</div>
					<div className="overview__top__next__insights">
						<div className="overview__top__next__ins1">
							Total Apps
						</div>
						<div className="overview__top__next__ins2">
							<div>
								<img src={totalapps}></img>
							</div>
							<div className="overviewins__top__next__instext">
								{props.vendor?.total_apps}
							</div>
							{props.vendor?.total_apps_change >= 0 ? (
								<img
									className="overviewins__top__next__insimage"
									src={uparrow}
								></img>
							) : (
								<img
									className="overviewins__top__next__insimage"
									src={downarrow}
								></img>
							)}
							<div className="overviewins__top__next__insvalue">
								{Math.abs(props.vendor?.total_apps_change)}
							</div>
							<div className="overviewins__top__next__instext2">
								{`in ${current_month}`}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
