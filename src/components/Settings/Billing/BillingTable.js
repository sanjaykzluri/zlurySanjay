import React from "react";

import { Table } from "../../../common";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import cellEditFactory, { Type } from "react-bootstrap-table2-editor";
import { Link } from "react-router-dom";
import "./Billing.css";
import adobe from "../../../assets/transactions/adobe.svg";
const columns = [
	{
		dataField: "date",
		text: "Date",
		displayName: "a",
	},
	{
		dataField: "type",
		text: "Type",
	},
	{
		dataField: "transid",
		text: "Transaction ID",
	},
	{
		dataField: "amount",
		text: "Amount",
		formatter: (row) => (
			<div className="flex flex-row center">
				<div className="ml-3 flex flex-row justify-content-flex-start align-items-center">
					{row}
					<div style={{ marginLeft: "40px" }}>
						<Button
							variant="link"
							style={{
								textDecoration: "none",
								fontSize: "13px",
								fontWeight: 700,
								color: "#2266E2",
							}}
						>
							Download
						</Button>
					</div>
				</div>
			</div>
		),
	},
];
export function BillingTable(props) {
	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
	};
	return (
		<Table
			columns={columns}
			data={props.data}
			remote={false}
			hover
			keyField="id"
			selectRow={selectRow}
			cellEdit={cellEditFactory({ mode: "click", blurToSave: true })}
		/>
	);
}

BillingTable.propTypes = {
	data: PropTypes.array,
};
