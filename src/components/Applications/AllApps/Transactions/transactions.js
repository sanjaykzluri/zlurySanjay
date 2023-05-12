import React, {useEffect} from "react";
import { TransFilter } from "./TransFilter";
export function Transactions(props) {
	return (
		<>
			<TransFilter application={props.application} />
		</>
	);
}
