import React from "react";
import "../../common/empty.css";
import empty from "../../assets/departments/departmentsempty.svg";
import add from "../../assets/addwhite.svg"

export function DepartmentsEmpty() {
	return (
		<div className="d-flex flex-column justify-content-center align-items-center">
			<img src={empty} width={200} />
			<div className="empty-header">No departments created</div>
			<div className="empty-lower">
				Create departments to track teamwise budget and spend
			</div>
			<button
				color="primary"
				className="ov__button2 empty-page-button"
			>
				<img style={{paddingRight:"5px"}} src={add} />
				Create Department
			</button>
		</div>
	);
}
