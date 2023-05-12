import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { SpendVsCostTooltip } from "./SpendVsCostTooltip";

export const StackedBars = ({
	month_data,
	maxValue,
	spendKey,
	costKey,
	savingsKey,
	period,
	left,
}) => {
	const spendPercentage = (month_data[spendKey] / maxValue) * 100;
	const costPercentage = (month_data[costKey] / maxValue) * 100;
	const savingsPercentage = (month_data[savingsKey] / maxValue) * 100;

	return (
		<OverlayTrigger
			placement="auto"
			overlay={
				<Tooltip bsPrefix="spendcost__tooltip">
					<SpendVsCostTooltip
						month_data={month_data}
						spendKey={spendKey}
						costKey={costKey}
						savingsKey={savingsKey}
						period={period}
					/>
				</Tooltip>
			}
		>
			<div
				className="stackedbars__bars__container"
				style={{ left: left }}
			>
				<div
					className="stackedbars__bars__container__spendbar"
					style={{ height: `${spendPercentage}%` }}
				></div>

				<div
					className="stackedbars__bars__container__costbar"
					style={{ height: `${costPercentage}%` }}
				></div>
			</div>
		</OverlayTrigger>
	);
};
