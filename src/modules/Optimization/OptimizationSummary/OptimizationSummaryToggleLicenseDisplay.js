import React from "react";
import { useDispatch, useSelector } from "react-redux";
import downarrow from "assets/auditlogs/downarrow.svg";
import { toggleLicenseRowDisplay } from "../redux/Optimization-action";

export default function OptimizationSummaryToggleLicenseDisplay({ row }) {
	const dispatch = useDispatch();

	const active_license_row_apps = useSelector(
		(state) =>
			state.optimization.optimization_summary.active_license_row_apps
	);

	return (
		<>
			<img
				src={downarrow}
				alt=""
				width={9}
				height={6}
				className="cursor-pointer"
				style={
					active_license_row_apps?.includes(row.app_id)
						? { transform: "rotate(180deg)" }
						: {}
				}
				onClick={() => dispatch(toggleLicenseRowDisplay(row.app_id))}
			/>
		</>
	);
}
