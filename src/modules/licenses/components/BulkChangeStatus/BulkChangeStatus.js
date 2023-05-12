import React, { useRef, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { TriggerIssue } from "../../../../utils/sentry";
import { Modal, Button } from "react-bootstrap";
import close from "../../../../assets/close.svg";
import { Loader } from "../../../../common/Loader/Loader";
import greenTick from "../../../../assets/green_tick.svg";
import inactive from "../../../../assets/agents/inactive.svg";

export default function BulkChangeStatus({
	show,
	handleClose,
	entity_ids,
	api_call,
	is_success,
	refresh,
	status,
	entity,
}) {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(false);

	const requestEndPoint = (status) => {
		setLoading(true);
		api_call(entity_ids, status)
			.then((res) => {
				if (is_success(res)) {
					setSuccess(true);
					setLoading(false);
					refresh && refresh();
				}
			})
			.catch((err) => {
				TriggerIssue(`Error on bulk changing of ${entity} status`, err);
				setError(true);
				setLoading(false);
			});
	};

	return (
		<Modal show={show} onHide={handleClose} centered>
			<div className="deactivate__cont">
				{loading ? (
					<Loader width={80} height={80} />
				) : (
					<>
						<img
							src={close}
							onClick={handleClose}
							className="cursor-pointer"
						/>
						<div className="deactivate__cont__d1">
							Mark {entity} as {status}?
						</div>
						<div className="deactivate__cont__d2 d-flex flex-column align-items-center">
							{(success || error) && (
								<img
									src={error ? inactive : greenTick}
									height="54px"
									width="54px"
									style={{ marginBottom: "10px" }}
								/>
							)}
							{error
								? "Server Error! We couldn't complete your request."
								: success
								? `The ${entity} were successfully marked as ${status}.`
								: null}
						</div>
						{!(success || error) && (
							<>
								<div className="font-12">{`Do you want to mark the selected ${entity} as ${status}?`}</div>
								<button
									className="deactivate__cont__d3"
									onClick={() => requestEndPoint(status)}
								>
									Confirm
								</button>
							</>
						)}
						<button
							className={
								success || error
									? "deactivate__cont__d3"
									: "deactivate__cont__d4"
							}
							onClick={() => {
								handleClose();
							}}
						>
							{success || error ? "Close" : "Cancel"}
						</button>
					</>
				)}
			</div>
		</Modal>
	);
}
