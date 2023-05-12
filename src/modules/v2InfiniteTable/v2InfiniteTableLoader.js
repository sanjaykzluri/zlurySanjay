import React, {
	useEffect,
	useState,
	useRef,
	useContext,
	useLayoutEffect,
} from "react";
import { loadingColumns } from "./infiniteTable";

export function V2InfiniteTableLoader() {
	const loadingData = Array(8).fill({ dummy: "Hello" });
	return (
		<>
			<div
				style={{
					padding: "0 40px",
					overflowX: "auto",
					marginTop: "5px",
				}}
			>
				<table className="table table-hover mb-0">
					<thead className="new-infinite-table-header">
						<tr className="table__header">
							<th
								className="selection-cell-header"
								data-row-selection="true"
							></th>
						</tr>
					</thead>
					<tbody style={{ width: "100%" }} id="scrollRoot">
						{loadingData.map((el, key) => (
							<tr key={key} className="table__row">
								{loadingColumns.map((column, index) => (
									<td key={index}>
										{column.formatter
											? column.formatter(
													el[column.dataField],
													el
											  )
											: el[column.dataField]}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
