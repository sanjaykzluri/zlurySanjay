import React, { useState } from "react";
import "./RenewalsGridView.css";
import { MonthlyRenewalGridView } from "../MonthlyRenewalGridView/MonthlyRenewalGridView";
import { SelectedRenewalMonthGridView } from "../SelectedRenewalMonthGridView/SelectedRenewalMonthGridView";

export function RenewalsGridView(props) {
	const [activeMonth, setActiveMonth] = useState(props.list[0]);
	const monthlyRenewals = () =>
		props.list.map((item, index) => (
			<MonthlyRenewalGridView
				data={item}
				className={
					activeMonth.monthID === item.monthID ? "is-active" : ""
				}
				index={index}
				key={index}
				onActive={(i) => {
					setActiveMonth(props.list[i]);
				}}
			/>
		));

	return (
		<div className="grid__container d-flex ">
			<div className="block block__year flex-grow-1 d-inline-flex flex-wrap mr-3 ">
				{monthlyRenewals()}
			</div>
			{<SelectedRenewalMonthGridView data={activeMonth} />}
		</div>
	);
}
