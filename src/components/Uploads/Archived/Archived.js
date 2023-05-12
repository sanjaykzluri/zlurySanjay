import React, { useEffect, useState } from "react";
import { ArchivedTable } from "./Table";
import { Filters } from "./Filters";

export function Archived() {
	return (
		<div style={{ margin: "0px 40px" }}>
			<ArchivedTable data={[]} />
		</div>
	);
}
