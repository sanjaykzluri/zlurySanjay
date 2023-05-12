import React, { useState } from "react";
import { TriggerIssue } from "../../../../utils/sentry";
import { Modal } from "react-bootstrap";
import close from "../../../../assets/close.svg";
import { Loader } from "../../../../common/Loader/Loader";
import greenTick from "../../../../assets/green_tick.svg";
import inactive from "../../../../assets/agents/inactive.svg";
import { bulkDelete } from "../../../../services/api/licenses";

export default function BulkDelete({
	show,
	handleClose,
	entity_ids,
	refresh,
	entity,
	api_call,
}) {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(false);
	const [deleteLicenses, setDeleteLicenses] = useState(false);

	const requestEndPoint = () => {
		setLoading(true);
		api_call(entity_ids, deleteLicenses)
			.then((res) => {
				if (res.result && res.result.status === "success") {
					setSuccess(true);
					setLoading(false);
					refresh && refresh();
				}
			})
			.catch((err) => {
				TriggerIssue(`Error on bulk deleting ${entity}`, err);
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
							Delete {entity}?
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
								? `The ${entity} were successfully deleted.`
								: null}
						</div>
						{!(success || error) && (
							<>
								{entity !== "licenses" ? (
									<div className="d-flex align-items-center">
										<input
											className="pt-1"
											type="checkbox"
											onClick={() => {
												setDeleteLicenses(
													!deleteLicenses
												);
											}}
											value={deleteLicenses}
											checked={
												deleteLicenses ? true : false
											}
										/>
										<div className="font-14 ml-2">
											{`Delete all licenses associated with the ${entity}?`}
										</div>
									</div>
								) : (
									<div
										className="font-12 warningMessage w-75"
										style={{
											textAlign: "center",
											padding: "4px",
										}}
									>
										Note: Only the manually added licenses
										will be deleted.
									</div>
								)}
								<button
									className="deactivate__cont__d3"
									onClick={() => requestEndPoint()}
								>
									Delete
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
