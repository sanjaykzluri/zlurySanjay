import React, { useState, useEffect } from "react";
import { Form, Modal, Spinner } from "react-bootstrap";
import close from "assets/close.svg";
import Button from "react-bootstrap/Button";
import warning from "assets/icons/delete-warning.svg";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import { searchAllApps } from "services/api/search";
import AddAppModal from "modules/licenses/components/ContractSteps/AddAppModal";
import { v2EntitiesTransactions } from "constants";

export function BulkUpdateModal(props) {
	const initialObj = {
		mark_future_transactions: false,
		transactions: [],
	};
	const [finalObj, setfinalObj] = useState(initialObj);
	const { title, refreshReduxState, text, metaData, exceptionData, type } =
		props;
	const [assigning, setAssigning] = useState(false);
	const [app, setApp] = useState();
	const [showAddAppModal, setShowAddAppModal] = useState(false);

	const handleRequestFunction = () => {
		setAssigning(true);
		const reqObj = {
			...finalObj,
			["transactions"]: exceptionData,
			set_all: true,
			filter_by: metaData.filter_by,
			type: type || v2EntitiesTransactions.recognized,
		};
		if (title === "Assign Application") {
			let key = app.app_key;
			reqObj[key] = app.app_id;
		}
		props.requestFunction(reqObj).then(() => {
			props.onSuccess && props.onSuccess();
			refreshReduxState();
			props.setSelectedIds([]);
			props.handleClose();
			props.setSelectedTransactions([]);
			setAssigning(false);
		});
	};

	const stopPropagation = (event) => {
		event.stopPropagation();
	};
	return (
		<>
			<Modal
				show={props.isOpen}
				onHide={props.handleClose}
				centered
				onClick={stopPropagation}
				dialogClassName="select_all_bulk_update_modal_dialog"
			>
				<div className="d-flex flex-column align-items-center position-relative">
					<div className="d-flex align-items-center position-relative w-100 py-3">
						<div className="wfm__cont__d1__d1">
							<img
								src={warning}
								alt="warning icon"
								width={23}
								className="mr-2"
							/>{" "}
							{title}
						</div>
						<img
							className="mr-2 cursor-pointer"
							alt="Close"
							onClick={props.handleClose}
							src={close}
						/>
					</div>
					<hr style={{ margin: "0px 10px" }}></hr>
					<div className="bold-600 font-18 mt-3 w-100 p-4 text-align-center">
						{text}
					</div>
					{title === "Assign Application" ? (
						<div className="w-100" style={{ padding: "0px 65px" }}>
							<AsyncTypeahead
								label="Target App"
								placeholder="Enter App Name"
								fetchFn={searchAllApps}
								isInvalid={false}
								invalidMessage="Please select the application."
								onSelect={(selection) => {
									setApp({
										app_id: selection.app_id,
										app_name: selection.app_name,
										app_logo: selection.app_logo,
										app_key: selection.is_global_app
											? "app_id"
											: "org_application_id",
									});
								}}
								requiredValidation={false}
								keyFields={{
									id: "app_id",
									image: "app_logo",
									value: "app_name",
								}}
								allowFewSpecialCharacters={true}
								defaultValue={app?.app_name || ""}
								disabled={false}
								showAddNewText={true}
								appLogo={app?.app_logo}
								setShowAddAppModal={setShowAddAppModal}
								onChange={(val) =>
									setApp({
										app_id: null,
										app_name: val,
										app_logo: null,
										app_key: null,
									})
								}
							/>
						</div>
					) : (
						<div className="grey-1 font-14 text-align-center">
							Are you sure you want to continue?
						</div>
					)}

					<div className="d-flex flex-row align-items-center mb-5 mt-3">
						<Form.Check
							className=""
							checked={finalObj.mark_future_transactions}
							onChange={() => {
								setfinalObj({
									...finalObj,
									mark_future_transactions:
										!finalObj.mark_future_transactions,
								});
							}}
						/>
						<div className="font-13 mr-2 black-1">
							{title === "Unassign transactions"
								? "Automatically unassign all future transactions from this app"
								: title === "Assign Application"
								? "Automatically assign all future transactions to this app"
								: "All future transactions will be archived automatically"}
						</div>
					</div>
					<div className="d-flex flex-column w-100 mt-auto">
						<hr style={{ margin: "0px 10px" }}></hr>
						<div className="wfm__cont__d2__d2__d2 py-3">
							<button
								className="btn btn-link"
								onClick={() => props.handleClose()}
							>
								Cancel
							</button>
							<Button
								onClick={handleRequestFunction}
								disabled={
									assigning ||
									(title === "Assign Application" &&
										!app?.app_id)
								}
							>
								{assigning ? (
									<Spinner
										animation="border"
										role="status"
										variant="light"
										size="sm"
										className="ml-2"
										style={{ borderWidth: 2 }}
									/>
								) : (
									<>{props.buttonText}</>
								)}
							</Button>
						</div>
					</div>
				</div>
				{showAddAppModal && (
					<AddAppModal
						show={showAddAppModal}
						onHide={() => setShowAddAppModal(false)}
						appName={app?.app_name}
						onAddApp={(
							app_id,
							app_name,
							app_logo,
							is_global_app
						) => {
							setApp({
								app_id: app_id,
								app_name: app_name,
								app_logo: app_logo,
								app_key: is_global_app
									? "app_id"
									: "org_application_id",
							});
						}}
					/>
				)}
			</Modal>
		</>
	);
}
