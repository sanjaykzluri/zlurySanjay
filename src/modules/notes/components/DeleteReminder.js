import React from "react";
import { Button } from "../../../UIComponents/Button/Button";
import wariningIcon from "../../../components/Onboarding/warning.svg";

function DeleteReminder(props) {
	return (
		<div className="row d-flex flex-column grow" ref={props.refrence}>
			<div className="col-md-12 md-4 mb-3 mt-2 d-flex flex-column">
				<img
					src={wariningIcon}
					className="ml-auto mr-auto mb-3 mt-3"
					style={{ width: "12%" }}
					alt="warning"
				></img>
				<p
					className="z__block-header mb-2 ml-auto mr-auto text-center"
					style={{ width: "60%" }}
				>
					Are you sure you want to delete the reminder for this note?
				</p>
			</div>
			<div className="col-md-12 mt-2 text-center d-flex">
				<Button
					onClick={() => props.onConfirmDelete()}
					className="m-auto"
				>
					Delete Reminder
				</Button>
				<Button
					onClick={() => props.onCancelDelete()}
					className="m-auto"
					type="link"
				>
					Cancel
				</Button>
			</div>
		</div>
	);
}

export default DeleteReminder;
