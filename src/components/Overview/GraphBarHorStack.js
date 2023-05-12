import React, { useState, Component } from "react";
import "./Overviewins.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import { kFormatter } from "../../constants/currency";
import { getValueFromLocalStorage } from "utils/localStorage";

const BarimageContent = ({ graphdata2 }) => {
	function clickedOnTableGraph(id, name) {
		//Segment Implementation
		window.analytics.track("Clicked on Large Table Graph Data", {
			clickedDepartmentName: name,
			clickedDepartmentId: id,
			currentCategory: "Overview",
			currentPageName: "Overview-HomeScreen",
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
		});
	}

	return (
		<div className="bar__text__contentstack">
			{graphdata2?.map((data, i) => (
				<>
					<div className="bar__text__contentstack__div">
						<Link
							to={`/departments/${encodeURI(
								data._id
							)}#overviewdep`}
							className="table-link bar__text__contentstack__div__d1"
							onClick={() =>
								clickedOnTableGraph(data._id, data.deptName)
							}
						>
							<div className="truncate_name">{data.deptName}</div>
						</Link>
						<div className="bar__text__contentstack__div__d2">
							{kFormatter(data.budget)}
							<div className="dotDivider"></div>
							<span style={{ fontWeight: 600 }}>
								{data.budget > 0
									? `${
											Math.round(data.percentSpent * 10) /
											10
									  }% Spent`
									: "NA"}
							</span>
						</div>
					</div>
				</>
			))}
		</div>
	);
};
const Bar = ({ percent }) => {
	return (
		<div
			className="bar__contentstack"
			style={{ width: `${percent}%` }}
		></div>
	);
};
const Line = (props) => {
	const labelvalue = (props.num * props.maxvalue) / 5;

	return (
		<div
			className="line__text__horbarstack__cont"
			style={{ left: `${props.left}%` }}
		>
			<div className="line__horbarstack" />
			<div className="line__text__horbarstack__cont__text">
				{kFormatter(labelvalue)}
			</div>
		</div>
	);
};
export class GraphBarHorStack extends React.Component {
	renderlines() {
		const { graphdata2 } = this.props;
		const maxvalue = Math.max.apply(
			Math,
			graphdata2?.map(function (o) {
				return o.budget > o.totalSpend ? o.budget : o.totalSpend;
			})
		);
		return Array(6)
			.fill(null)
			?.map((el, i) => (
				<>
					<Line left={i * 20} key={i} maxvalue={maxvalue} num={i} />
				</>
			));
	}

	renderbars() {
		const { graphdata2 } = this.props;
		const maxvalue = Math.max.apply(
			Math,
			graphdata2?.map(function (o) {
				return o.budget > o.totalSpend ? o.budget : o.totalSpend;
			})
		);

		return graphdata2?.map((data, index) => {
			const renderTooltip = (props) => (
				<Tooltip
					className="my-tooltip2"
					bsPrefix="my-tooltip2"
					{...props}
				>
					<div className="my-tooltip2-div1 text-truncate">
						{data.deptName}
					</div>
					<div className="my-tooltip2-div2">
						<div
							className="my-tooltip2-div2-d1"
							style={{
								backgroundColor:
									data.budget - data.totalSpend < 0
										? "#FF6767"
										: "#2266E2",
							}}
						></div>
						<div className="my-tooltip2-div2-d2">Spent</div>
						<div className="my-tooltip2-div2-d3">
							{kFormatter(data.totalSpend)}
						</div>
					</div>
					<div className="my-tooltip2-div2">
						<div
							className="my-tooltip2-div2-d1"
							style={{ backgroundColor: "#FFB169" }}
						></div>
						<div className="my-tooltip2-div2-d2">Remaining</div>
						<div className="my-tooltip2-div2-d3">
							{data.budget - data.totalSpend < 0
								? "-"
								: !(
										isNaN(data.budget) &&
										isNaN(data.totalSpend)
								  ) &&
								  kFormatter(
										parseInt(
											Number(
												data.budget - data.totalSpend
											).toFixed(2)
										)
								  )}
						</div>
					</div>
				</Tooltip>
			);
			const budgetPercent = (data.budget / maxvalue) * 100;
			let spendPercent = 0;
			if (data.percentSpent === 0 && data.totalSpend === 0) {
				spendPercent = 0;
			} else if (data.percentSpent === 0 && data.totalSpend !== 0) {
				spendPercent = (data.totalSpend / maxvalue) * 100 || 0;
			} else {
				spendPercent =
					(data.budget * data.percentSpent) / maxvalue || 0;
			}
			const topPosition = 60 * index + 20;

			return (
				<>
					<OverlayTrigger placement="top" overlay={renderTooltip}>
						<div
							style={{
								width: `100%`,
							}}
						>
							<div
								className="outside__bar__contstack"
								style={{ width: `${budgetPercent}%` }}
							></div>
							<div
								className="bar__contentstack"
								style={{
									width: `${spendPercent}%`,
									position: "absolute",
									top: topPosition,
									background:
										spendPercent > budgetPercent
											? "#FF6767"
											: "#2266e2",
								}}
							></div>
						</div>
					</OverlayTrigger>
				</>
			);
		});
	}
	render() {
		const { graphdata2 } = this.props;

		return (
			<>
				<div className="overv__graphstack">
					<BarimageContent graphdata2={graphdata2}></BarimageContent>
					<div className="bar__lines__contstack">
						{this.renderbars()}
						{this.renderlines()}
					</div>
				</div>
			</>
		);
	}
}
