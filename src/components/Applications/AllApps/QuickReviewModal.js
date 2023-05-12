import React, { useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import cross from "../../../assets/reports/cross.svg";
import ChangeAppAuthStatus from "../../../common/ChangeAppAuthStatus";
import { AsyncTypeahead } from "../../../common/Typeahead/AsyncTypeahead";
import {
	setAppsBulkAuth,
	setAppsBulkOwner,
} from "../../../services/api/applications";
import { searchUsers } from "../../../services/api/search";
import { Button } from "../../../UIComponents/Button/Button";

export default function QuickReviewModal(props) {
	const [selectedOwner, setSelectedOwner] = useState();
	const [selectedAuthStatus, setSelectedAuthStatus] = useState();
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [error, setError] = useState();
	const appAuthStatusForAPI = {
		centrally_managed: "centrally managed",
		team_managed: "team managed",
		individually_managed: "individually managed",
		unmanaged: "unmanaged",
		restricted: "restricted",
	};

	const handleSubmit = async () => {
		let reqObjForOwner = {
			app_ids: props.checked,
			app_new_owner: selectedOwner?.user_id,
		};
		let reqObjForAppState = {
			app_ids: props.checked,
			app_new_auth: appAuthStatusForAPI[selectedAuthStatus],
		};
		try {
			setSubmitInProgress(true);
			if (selectedOwner?.user_id) {
				const resOwner = await setAppsBulkOwner(
					reqObjForOwner.app_new_owner,
					reqObjForOwner.app_ids
				);
			}

			const resState = await setAppsBulkAuth(
				reqObjForAppState.app_new_auth,
				reqObjForAppState.app_ids
			);

			if (resState.status === "success") {
				setSubmitInProgress(false);
				props.handleClose();
				let tempArray = [...props.fullRowArray];
				let tempMessage = [...props.fullRowMessage];

				props.fetchAppCount && props.fetchAppCount();

				props.checked.forEach((el) => {
					let index = tempMessage.findIndex((row) => row.id === el);
					if (index > -1) {
						tempMessage.splice([index], 1);
					}

					tempMessage.push({
						id: el,
						message: `has been moved to ${appAuthStatusForAPI[selectedAuthStatus]}`,
						type: props.markedType,
					});
					let index2 = tempArray.findIndex((row) => row === el);
					if (index2 > -1) {
						tempArray.splice([index2], 1);
					}
					tempArray.push(el);
				});
				props.setFullRowArray(tempArray);
				props.setFullRowMessage(tempMessage);
				props.setChecked([]);
				props.setCheckAll && props.setCheckAll(false);
				props.fetchAppCount && props.fetchAppCount();
			}
		} catch (err) {
			setSubmitInProgress(false);
			setError(err?.response?.data?.errors || err.message);
		}
	};
	return (
		<>
			<Modal
				show={props.isOpen}
				onHide={props.handleClose}
				centered
				contentClassName="adduser__accessedby__modal"
			>
				<div
					className="adduser__accessedby__cont"
					style={{ height: "fit-content" }}
				>
					<div
						className="adduser__accessedby__cont__topmost"
						style={{ backgroundColor: "rgba(235, 235, 235, 0.5)" }}
					>
						<div className="adduser__accessedby__cont__topmost__heading">
							{`Quick Review ${
								props?.checkAll
									? props?.metaData?.total -
									  props?.checkAllExceptionData?.length
									: props?.checked?.length
							} apps`}
						</div>
						<img
							src={cross}
							height={12}
							width={12}
							onClick={() => {
								props.handleClose();
							}}
							className="adduser__accessedby__cont__closebutton"
						></img>
					</div>
					<div className="d-flex w-100">
						<div
							className=" grey-1 font-11 ml-auto mt-2 cursor-pointer mr-2"
							onClick={() => {
								props.handleClose();
								props.setShowArchiveModal(true);
							}}
						>
							or Archive apps, instead?
						</div>
					</div>
					<div
						className="d-flex flex-column"
						style={{ marginTop: "17px" }}
					>
						<div className="quick_review_suggestion_box">
							<div className="d-flex align-items-center">
								<div className="font-14 bold-600">
									Set Authorization
								</div>
							</div>
							<ChangeAppAuthStatus
								onSelect={(selection) => {
									setSelectedAuthStatus(selection);
								}}
							></ChangeAppAuthStatus>
						</div>
						<div className="quick_review_suggestion_box mb-4">
							<div className="d-flex align-items-center">
								<div className="d-flex flex-column w-100 ">
									<AsyncTypeahead
										label="Assign Owner"
										placeholder="Search User"
										fetchFn={searchUsers}
										onSelect={(selection) => {
											setSelectedOwner(selection);
										}}
										requiredValidation={false}
										keyFields={{
											id: "user_id",
											image: "profile_img",
											value: "user_name",
											email: "user_email",
										}}
										allowFewSpecialCharacters={true}
										labelClassName="font-14 bold-600"
										onChange={() => {
											setSelectedOwner();
										}}
										style={{ marginBottom: "7px" }}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<Modal.Footer>
					<Button type="link" onClick={() => props.handleClose()}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedAuthStatus}
					>
						{submitInProgress ? (
							<Spinner
								animation="border"
								role="status"
								variant="light"
								size="sm"
								className="ml-2"
								style={{ borderWidth: 2 }}
							>
								<span className="sr-only">Loading...</span>
							</Spinner>
						) : (
							"Save"
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
