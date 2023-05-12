import React from "react";
import "./Billing.css";
import add from "./add.svg";
import check from "./check.svg";
import visa from "./visa.svg";
import { BillingTable } from "./BillingTable";

const data = [
	{
		id: "1",
		date: "01 Sep 2020",
		type: "Zluri Gold",
		transid: "Zluri_RTY_827364R",
		amount: "$999",
		download: "download",
	},
	{
		id: "2",
		date: "01 Sep 2020",
		type: "Zluri Gold",
		transid: "Zluri_RTY_827364R",
		amount: "$999",
		download: "download",
	},
	{
		id: "3",
		date: "01 Sep 2020",
		type: "Zluri Gold",
		transid: "Zluri_RTY_827364R",
		amount: "$999",
		download: "download",
	},
];
export class Billing extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<>
				<div className="acc__cont">
					<div className="acc__cont__d1">Billing</div>
					<div className="acc__cont__d2">Current Plan</div>
					<div className="bill__cont__d1">
						<div className="bill__cont__d1__l">
							<div className="bill__cont__d1__l__d1">
								Zluri Gold
							</div>
							<div className="bill__cont__d1__l__d2">
								Enim culpa ullamco ea laborum enim deserunt
								cillum dolor tempor dolore in est in et.
							</div>
							<div className="bill__cont__d1__l__d3">
								<div className="d-flex flex-row align-items-center">
									<img
										src={check}
										style={{
											height: "16px",
											width: "16px",
										}}
									></img>
									<div style={{ marginLeft: "6px" }}>
										Enim culpa ullamco ea
									</div>
								</div>
								<div
									className="d-flex flex-row align-items-center"
									style={{ marginLeft: "20%" }}
								>
									<img
										src={check}
										style={{
											height: "16px",
											width: "16px",
										}}
									></img>
									<div style={{ marginLeft: "6px" }}>
										Enim culpa ullamco ea
									</div>
								</div>
							</div>
							<div className="bill__cont__d1__l__d3">
								<div className="d-flex flex-row align-items-center">
									<img
										src={check}
										style={{
											height: "16px",
											width: "16px",
										}}
									></img>
									<div style={{ marginLeft: "6px" }}>
										Enim culpa ullamco ea
									</div>
								</div>
								<div
									className="d-flex flex-row align-items-center"
									style={{ marginLeft: "20%" }}
								>
									<img
										src={check}
										style={{
											height: "16px",
											width: "16px",
										}}
									></img>
									<div style={{ marginLeft: "6px" }}>
										Enim culpa ullamco ea
									</div>
								</div>
							</div>
						</div>
						<div className="bill__cont__d1__r">
							<div className="bill__cont__d1__r__d1">$9.99</div>
							<div className="bill__cont__d1__r__d2">
								{" "}
								per user
							</div>
							<div className="bill__cont__d1__r__d3">
								Renews on 1 Oct for $999.99
							</div>
							<button className="bill__cont__d1__r__d4">
								Upgrade Plan
							</button>
							<button className="bill__cont__d1__r__d5">
								Cancel Subscription
							</button>
						</div>
					</div>
					<hr style={{ margin: "42px 0px 0px" }}></hr>
					<div className="acc__cont__d2">Payment Method</div>
					<div className="ca__cont__d1">
						Enim culpa ullamco ea laborum enim deserunt cillum dolor
						tempor dolore in est in et.
					</div>
					<div className="bill__cont__d2">
						<img
							src={visa}
							style={{ width: "32px", height: "24px" }}
						></img>
						<div className="bill__cont__d2__cardno">
							•••• •••• •••• 2677
						</div>
						<button className="bill__cont__d2__btn1">Remove</button>
						<button className="bill__cont__d2__btn2">
							Cancel Payment Method
						</button>
					</div>
					<button className="add-new-payment">
						<img src={add} style={{ marginRight: 4 }} />
						Add Payment Method
					</button>
					<hr style={{ margin: "32px 0px 0px" }}></hr>
					<div className="acc__cont__d2">Invoices</div>
					<div className="bill__cont__table">
						<BillingTable data={data}></BillingTable>
					</div>
				</div>
			</>
		);
	}
}
