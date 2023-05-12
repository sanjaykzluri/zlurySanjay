import React from "react";
import { Link } from "react-router-dom";
import "../../../App.css";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";

export class TableNew3 extends React.Component {
	constructor(props) {
		super(props);
		this.showTooltipLength = 15;
	}

	renderTableHeader() {
		let header = Object.keys(this.props.data[0]).map((key) => key);

		return header.map((key, index) => {
			if (key === "department_name") {
				return <th key={index}>Department </th>;
			} else if (key === "department_id") {
				return <th></th>;
			} else if (key === "users_count") {
				return <th key={index}>Users </th>;
			} else if (key === "total_usage") {
				return <th key={index}>Usage </th>;
			} else if (key === "total_spend") {
				return <th key={index}>Spend(annual) </th>;
			}
		});
	}

	renderTableData() {
		const data = [...this.props.data];
		data.sort((d1, d2) => {
			if (d1.department_name === "TOTAL") return -1;
			return 1;
		});

		return data.map((row, index) => {
			const {
				department_name,
				apps_count,
				users_count,
				total_usage,
				average_usage,
			} = row; //destructuring

			let usage = 0;
			if (department_name === "TOTAL" && average_usage) {
				usage = Number(average_usage.toFixed(1));
			} else if (total_usage) {
				usage = Number(total_usage.toFixed(1));
			}

			return (
				<>
					<tr>
						<td style={{ width: "50px" }}>
							{" "}
							<div
								style={{
									height: "16px",
									width: "16px",
									borderRadius: "4px",
									backgroundColor: row.color,
								}}
							></div>
						</td>
						<td>
							<OverlayTrigger
								placement="top"
								overlay={
									<BootstrapTooltip>
										{department_name}
									</BootstrapTooltip>
								}
							>
								<div>
									{row.department_id ? (
										<Link
											to={`/departments/${row.department_id}#overviewdep`}
											className="table-link chart_table_app_name"
										>
											{department_name}
										</Link>
									) : (
										department_name
									)}
								</div>
							</OverlayTrigger>
						</td>

						<td>{users_count}</td>
						<td>{usage}%</td>
					</tr>
				</>
			);
		});
	}

	render() {
		return this.props.data?.length ? (
			<div>
				<table id="appsdata2">
					<tr>{this.renderTableHeader()}</tr>
					<tbody>{this.renderTableData()}</tbody>
				</table>
			</div>
		) : (
			<></>
		);
	}
}
