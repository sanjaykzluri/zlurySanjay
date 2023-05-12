import React from "react";
import close from "assets/close.svg";
import NewGraph from "components/Applications/Overview/NewGraph";
import DepartmentCard from "components/Applications/Overview/DepartmentCard";
import { kFormatter } from "constants/currency";
import { getColor } from "utils/common";

export function AdditionDepartmentsModal({ onHide, app }) {
	return (
		<>
			<div className="modal-backdrop show"></div>
			<div style={{ display: "block" }} className="modal"></div>
			<div show className="addContractModal__TOP h-100 overflow-auto">
				<div className="d-flex flex-row align-items-center py-4">
					<div className="m-auto">
						<span className="contracts__heading">Departments</span>
					</div>
					<img
						alt="Close"
						onClick={onHide}
						src={close}
						className="cursor-pointer mr-4"
					/>
				</div>
				<div className="d-flex flex-column align-items-center">
					<NewGraph
						data={app?.app_departments}
						spend={kFormatter(app?.app_previous_year_dept_spend)}
					/>
					<div className="d-flex flex-column w-100">
						{app?.app_departments?.map((element, index) => {
							return (
								<DepartmentCard
									key={index}
									element={element}
									color={getColor(
										index,
										app?.app_departments?.length
									)}
									style={{
										minHeight: "44px",
										padding: "8px",
										margin: "10px 15px",
									}}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</>
	);
}
