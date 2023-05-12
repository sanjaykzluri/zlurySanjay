import React from "react";
import { Link } from "react-router-dom";
import "../../../App.css";
import { kFormatter } from "../../../constants/currency";
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export class TableNew2 extends React.Component {
	constructor(props) {
		super(props);
		this.showTooltipLength = 15;
	}

	renderTableHeader() {
		let header = Object.keys(this.props.data[1]).map((key) => key);
		return header.map((key, index) => {
			if (key === "department_name") {
				return <th key={index}>Department </th>;
			} else if (key === "department_id") {
				return <th></th>;
			} else if (key === "users_count") {
				return <th key={index}>Users </th>;
			} else if (key === "total_spend") {
				return <th key={index}>Spend(YTD) </th>;
			}
		});
	}

	renderTableData() {
		return this.props.data.map((row, index) => {
			const {
				department_name,
				apps_count,
				users_count,
				color,
				monthly_spend,
				total_spend
			} = row; //destructuring

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
									backgroundColor: color,
								}}
							></div>
						</td>
						<td>
							<OverlayTrigger
								placement="top"
								overlay={<Tooltip>{department_name}</Tooltip>}
							>
								<div>
								{
									row.department_id ? (
										<Link
											to={`/departments/${row.department_id}#overviewdep`}
											className="table-link chart_table_app_name"
										>
											{department_name}
										</Link>
									) : (department_name)
								}
								</div>
							</OverlayTrigger>
						</td>
						<td>{users_count}</td>
						<td>{kFormatter(total_spend)}</td>
					</tr>
				</>
			);
		});
	}

	render() {
		return (
			(this.props.data?.length) ?
				<div>
					<table id="appsdata2">
						<tr>{this.renderTableHeader()}</tr>
						<tbody>{this.renderTableData()}</tbody>
					</table>
				</div> :
				<></>
		);
	}
}
