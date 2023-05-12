import React, {useContext, useState} from "react";
import { addDepartment } from "../../services/api/departments";
import empty from "../../assets/departments/departmentsempty.svg";
import add from "../../assets/addwhite.svg";
import { useSelector } from "react-redux";
import { AddDepartment } from "./AddDepartment";
import RoleContext from "../../services/roleContext/roleContext";
export function Empty() {
	const [showHide, setshowHide] = useState(false);
	const [formErrors, setFormErrors] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const { isViewer } = useContext(RoleContext);
	const { refreshTable } = useSelector((state) => state.ui);

	const handleDepartmentAdd = (department) => {
		setSubmitting(true);
		setFormErrors([]);
		addDepartment(department).then(() => {
			setshowHide(false);
			setSubmitting(false);
			if (refreshTable) refreshTable();
		})
		.catch((err) => {
			setSubmitting(false);
			if (err.response && err.response.data) {
				setFormErrors(err.response.data.errors);
			}
		});
	};
	return (
		<div
			className="d-flex flex-column justify-content-center align-items-center"
			style={{ margin: "auto" }}
		>
			<img src={empty} width={200} />
			<div className="empty-header">No departments created</div>
			{
				!isViewer &&
				<>
					<div
						className="empty-lower"
					>
						Create departments to track teamwise budget and spend
					</div>
					<button
						className="empty-page-button mt-2"
						onClick={() => setshowHide(true)}
					>
						<img className="mr-2" src={add} />
						Create Department
					</button>
					{showHide ? (
						<AddDepartment
							handleClose={() => {
								setshowHide(false);
								setFormErrors([]);
							}}
							handleSubmit={handleDepartmentAdd}
							isOpen={showHide}
							submitInProgress={submitting}
							validationErrors={formErrors}
						/>
					) : null}
				</>
			}
		</div>
	);
}
