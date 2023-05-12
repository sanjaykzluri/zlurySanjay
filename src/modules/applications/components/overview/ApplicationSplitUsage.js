import React, { useState } from "react";
import { getColor } from "utils/common";
import DepartmentCard from "../../../../components/Applications/Overview/DepartmentCard";
import NewGraph from "../../../../components/Applications/Overview/NewGraph";
import {
	Split,
	splitTypes,
} from "../../../../components/Applications/Overview/Split";
import { kFormatter } from "../../../../constants/currency";
import RoleContext from "../../../../services/roleContext/roleContext";
import { Button } from "../../../../UIComponents/Button/Button";
import { AdditionDepartmentsModal } from "./AdditionalDepartmentsModal";

export default function ApplicationSplitUsage({ app, onAppChange }) {
	const { isViewer } = React.useContext(RoleContext);
	const [showSplitModal, setShowSplitModal] = useState(false);
	const [showAdditionalDepartmentsModal, setShowAdditionDepartmentsModal] =
		useState(false);

	function handleDepartments(departments) {
		departments.map((department) => {
			department.department_split = department.split_percent;
		});
		onAppChange && onAppChange();
	}

	return (
		<>
			<div
				className={`d-flex flex-column ${
					app?.app_archive ? "disabledState" : ""
				}`}
				style={{ marginTop: "6.5px" }}
			>
				<div className="d-flex align-items-center justify-content-between">
					<div className="font-16">
						{`Departments - Split ${
							splitTypes[app?.app_spend_split].outerText ||
							splitTypes[app?.app_spend_split].boxText
						}`}
					</div>
					<div className="">
						{!isViewer && (
							<Button
								type="link"
								onClick={() => setShowSplitModal(true)}
							>
								Edit
							</Button>
						)}
					</div>
				</div>
				{Array.isArray(app?.app_departments) &&
					app?.app_departments.length > 0 && (
						<div className="d-flex">
							<NewGraph
								data={app?.app_departments}
								spend={kFormatter(
									app?.app_previous_year_dept_spend
								)}
							/>
							<div
								className="d-flex"
								style={{
									flexWrap: "wrap",
									height: "fit-content",
								}}
							>
								{app?.app_departments?.map((element, index) => {
									if (index < 2) {
										return (
											<DepartmentCard
												key={index}
												element={element}
												color={getColor(
													index,
													app?.app_departments?.length
												)}
												// style={{ minWidth: "242px" }}
											/>
										);
									} else if (index === 2) {
										return (
											<div
												className="flex-center cursor-pointer border rounded-lg"
												style={{
													minWidth: "100px",
													height: "54px",
													marginLeft: "1%",
													marginTop: "14px",
												}}
												onClick={() =>
													setShowAdditionDepartmentsModal(
														true
													)
												}
											>
												<span
													style={{ fontSize: 14 }}
													className="primary-color"
												>
													{app?.app_departments
														.length - 2}{" "}
													more
												</span>
											</div>
										);
									} else {
										return null;
									}
								})}
							</div>
						</div>
					)}
			</div>
			{showSplitModal && (
				<Split
					info={app?.app_departments}
					show={showSplitModal}
					app_name={app?.app_name}
					handleClose={() => setShowSplitModal(false)}
					handleDepartments={handleDepartments}
					type={app?.app_spend_split}
					app={app}
					onAppChange={onAppChange}
				/>
			)}
			{showAdditionalDepartmentsModal && (
				<>
					<AdditionDepartmentsModal
						app={app}
						onHide={() => setShowAdditionDepartmentsModal(false)}
					/>
				</>
			)}
		</>
	);
}
