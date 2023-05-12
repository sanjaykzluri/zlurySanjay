import moment from "moment";
import React from "react";

export const DayFilter = ({ handleDaysFilter, ref }) => {
	return (
		<>
			<div ref={ref} className="px-2 py-1 days-filter-box">
				<div
					onClick={() => {
						handleDaysFilter(7, "days");
					}}
					className="flex days-filter-text justify-content-between align-items-center"
				>
					<div className="font-13">7 days from today</div>
					<div className="font-11" style={{ color: " #717171" }}>
						{moment().subtract(7, "days").format("D MMM")}
					</div>
				</div>
				<div
					onClick={() => {
						handleDaysFilter(30, "days");
					}}
					className="flex days-filter-text justify-content-between align-items-center"
				>
					<div className="font-13">30 days from today</div>
					<div className="font-11" style={{ color: " #717171" }}>
						{moment().subtract(30, "days").format("D MMM")}
					</div>
				</div>
				<div
					onClick={() => {
						handleDaysFilter(90, "days");
					}}
					className="flex days-filter-text justify-content-between align-items-center"
				>
					<div className="font-13">90 days from today</div>
					<div className="font-11" style={{ color: " #717171" }}>
						{moment().subtract(90, "days").format("D MMM ")}
					</div>
				</div>
				<hr
					style={{
						borderTop: " 1px solid #EBEBEB",
					}}
					className="my-1 ml-1"
				/>

				<div className="flex align-items-center">
					<div className="px-2 py-1">
						<input
							onChange={(e) => {
								handleDaysFilter(e.target.value, "days", true);
							}}
							placeholder="Enter #"
							type="number"
							style={{
								border: "1px solid #DDDDDD",
								padding: "10px",
								width: "80px",
							}}
							className="days-filter-input"
						/>
					</div>
					<div className="font-12">days from today</div>
				</div>
			</div>
		</>
	);
};
