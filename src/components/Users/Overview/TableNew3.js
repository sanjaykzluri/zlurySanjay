import React from "react";
import { Link } from "react-router-dom";
import "../../../App.css";
import { OverlayTrigger , Tooltip } from "react-bootstrap";

export class TableNew3 extends React.Component {
	constructor(props) {
		super(props);
		this.showTooltipLength = 15;
	}

	renderTableHeader() {
		let header = Object.keys(this.props.data[1]).map((key) => key);

		return header.map((key, index) => {
			if (key === "department_name") {
				return <th key={index}>Department </th>;
			} else if (key === "application_id") {
				return <th></th>;
			} else if (key === "application_name") {
				return <th key={index}>Application </th>;
			} else if (key === "total_usage") {
				return <th key={index}>Usage </th>;
			}
		});
	}

	roundOffValue = (value) => {
		return value ? Number.parseFloat(value).toFixed(2) : 0;		
	}

	renderTableData() {
		return this.props.data.map((row, index) => {
			const {
				application_name,
				apps_count,
				users_count,
				total_usage,
				average_usage,
				color,
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
							<div className="d-flex">
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{application_name}
										</Tooltip>
									}
								>
									<>
										{
											row.application_id ? (
												<Link
													to={`/user/applications/${row.application_id}#overview`}
													className="table-link chart_table_app_name"
												>
													{application_name}
												</Link>
											) : (application_name)
										}
									</>
								</OverlayTrigger>
							</div>
						</td>
						<td>{ this.roundOffValue(total_usage) || this.roundOffValue(average_usage)}%</td>
					</tr>
				</>
			);
		});
	}

	render() {
		if (this.props.data && this.props.data.length > 0) {
			this.props.data.sort((a, b) =>
				a.total_usage < b.total_usage ? 1 : -1
			);
			let obj = this.props.data.find(
				(x) => x.application_name === "TOTAL"
			);
			let index = this.props.data.indexOf(obj);
			this.props.data.splice(index, 1);
			this.props.data.unshift(obj);
			return (
				<div>
					<table id="appsdata2">
						<tr>{this.props.data[1]? this.renderTableHeader() : null}</tr>

						<tbody>{this.renderTableData()}</tbody>
					</table>
				</div>
			);
		} else {
			return <></>;
		}
	}
}
