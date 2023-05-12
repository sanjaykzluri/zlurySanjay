import React from "react";
import { Link } from "react-router-dom";
import { kFormatter } from "../../../constants/currency";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
export class TableNew2 extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.showTooltipLength = 15;
	}

	renderTableHeader() {
		let header = Object.keys(this.props.data[1]).map((key) => key);

		return header.map((key, index) => {
			if (key === "application_name") {
				return <th key={index}>Application </th>;
			} else if (key === "total_spend") {
				return <th key={index}>Spend(YTD) </th>;
			}
		});
	}

	renderTableData() {
		return this.props.data.map((row, index) => {
			const {
				application_name,
				apps_count,
				users_count,
				monthly_spend,
				total_spend,
				color,
			} = row || {}; //destructuring

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
										<Tooltip>{application_name}</Tooltip>
									}
								>
									<>
										{row.application_id ? (
											<Link
												to={`/applications/${row.application_id}#overview`}
												className="table-link chart_table_app_name"
											>
												{application_name}
											</Link>
										) : (
											application_name
										)}
									</>
								</OverlayTrigger>
							</div>
						</td>

						<td>{kFormatter(total_spend)}</td>
					</tr>
				</>
			);
		});
	}

	render() {
		if (this.props.data && this.props.data.length > 0) {
			this.props.data.sort((a, b) =>
				a.total_spend < b.total_spend ? 1 : -1
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
						<tr>
							{this.props?.data?.[1] ? (
								<>
									<th></th>
									{this.renderTableHeader()}
								</>
							) : null}
						</tr>
						<tbody>{this.renderTableData()}</tbody>
					</table>
				</div>
			);
		} else {
			return <></>;
		}
	}
}
