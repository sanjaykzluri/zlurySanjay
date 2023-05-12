import React, { useState } from "react";
import { debounce } from "../../../utils/common";
import { UserMappingFilters } from "./UserMappingFilter";
import { UserMappingTable } from "./UserMappingTable";
import { FILTER_TYPES } from "./constants";
import "./styles.css";

export function UserMapping(props) {
	const [checked, setChecked] = useState([]);
	const [filters, setFilters] = useState({
		type: FILTER_TYPES.UNMAPPED,
		searchTerm: "",
	});

	return (
		<>
			<UserMappingFilters
				checked={checked}
				filters={filters}
				setFilters={setFilters}
			/>
			<UserMappingTable
				integrationId={props.integrationId}
				onChecked={setChecked}
				filters={filters}
			/>
		</>
	);
}
