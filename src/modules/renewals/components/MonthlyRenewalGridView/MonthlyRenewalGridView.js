import React from "react";
import "./MonthlyRenewalGridView.css";
import { kFormatter } from "../../../../constants/currency";
import { useDispatch, useSelector } from "react-redux";
import { unescape } from "../../../../utils/common";
export function MonthlyRenewalGridView(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const INRFormatter = (str) => {
		const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];
		var len = str.length;
		var suffix = isNaN(str.slice(len - 1)) ? str.slice(len - 1) : "";
		var tier = SI_SYMBOL.findIndex((v) => v === suffix);
		var number = parseFloat(str) * Math.pow(10, tier * 3);
		return kFormatter(number);
	};
	const clickedOnContDiv = () => {
		props.onActive(props.index);
		//Segment Implementation
		window.analytics.track(
			`${props.data.getMonthYear()}'s renewal data clicked`,
			{
				currentCategory: "Applications",
				currentPageName: "Renewals-Grid-View",
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
	};
	const getApplicationLogo = (arr) =>
		arr.map((app, index) => <img src={unescape(app.logo)} key={index} />);
	return (
		<div
			className={`month__card pointer p-3 bold-500 flex-fill ${props.className}`}
			onClick={clickedOnContDiv}
		>
			<div className="month__card-header">
				<h4 className="font-14 black text-uppercase bold-500 mb-3">
					{" "}
					{props.data.getMonthYear()}
					<span className="float-right float-right grey  font-13 bold-500">
						{" "}
						{INRFormatter(props.data.spend())}
					</span>
				</h4>
			</div>
			<div className="month__card-body d-flex flex-column">
				{props.data.getApplications().length > 0 && (
					<div
						style={{ backgroundColor: "#fff2ec" }}
						className="month__card-info mb-2 p-1 pr-2 pl-2 d-inline-flex mb-2"
					>
						<div className="flex-grow-1">
							<p
								style={{ fontSize: "11px" }}
								className="m-0 z__description-highlight"
							>
								{props.data.getApplications().length} Payments
							</p>
						</div>
						<div style={{ marginTop: "-2px" }}>
							{getApplicationLogo(
								props.data.getApplications().slice(0, 4)
							)}
						</div>
					</div>
				)}
				{props.data.getContracts().length > 0 && (
					<div
						style={{ backgroundColor: "#e9f3fa" }}
						className="month__card-info p-1 pr-2 pl-2  d-inline-flex mb-2"
					>
						<div className="flex-grow-1">
							<p
								style={{ fontSize: "11px" }}
								className="m-0 z__description-highlight"
							>
								{props.data.getContracts().length} Contract
								Renewals
							</p>
						</div>
						<div style={{ marginTop: "-2px" }}>
							{getApplicationLogo(
								props.data.getContracts().slice(0, 2)
							)}
						</div>
					</div>
				)}
				{props.data.applications.length === 0 && (
					<div
						style={{ backgroundColor: "#e9f3fa" }}
						className="month__card-info p-1 pr-2 pl-2 d-inline-flex greyBg"
					>
						<div className="flex-grow-1">
							<p
								style={{ fontSize: "11px" }}
								className="m-0 z__description-highlight"
							>
								No Renewals
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
