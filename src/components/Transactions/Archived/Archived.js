import React, { useEffect, useState } from "react";
import { ArchivedTable } from "./ArchivedTable";
import { ArchivedFilters } from "./Filters";
import { useDispatch, useSelector } from "react-redux";
import { fetchArchivedTransactions } from "../../../actions/transactions-action";
import { defaults } from "../../../constants";

export function Archived() {
	return (
		<>
			{/* <ArchivedFilters /> */}
			<div style={{ margin: "0px 40px" }}>
				<ArchivedTable />
			</div>
		</>
	);
}
