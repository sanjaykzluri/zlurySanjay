import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Spinner } from "react-bootstrap";
import { AsyncTypeahead } from "../../../common/Typeahead/AsyncTypeahead";
import { searchAllApps } from "../../../services/api/search";
import { mergeApps } from "../../../services/api/applications";
import { NameBadge } from "../../../common/NameBadge";
import { useDispatch, useSelector } from "react-redux";
import ExclamationCircleSVG from "../../../assets/icons/exclamation-circle.svg";
import CheckCircleSVG from "../../../assets/icons/check-circle.svg";
import MergeSVG from "../../../assets/icons/merge.svg";
import MergeConfirmation from "./MergeConfirmation";
import { unescape } from "../../../utils/common";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";

export function MergeApps(props) {
	const dispatch = useDispatch();
	const [targetApp, setTargetApp] = useState();
	const [submitting, setSubmitting] = useState(false);
	const [isMergeConfirmed, setIsMergeConfirmed] = useState(false);
	const [wantToMerge, setWantToMerge] = useState(false);
	const [showWarningMessage, setShowWarningMessage] = useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		if (props.targetApp) {
			setTargetApp(props.targetApp);
		}
	}, [props]);

	useEffect(() => {
		!targetApp && setSubmitting(false);
		if (targetApp?._id === props.application.app_id) {
			setShowWarningMessage(true);
		} else {
			setShowWarningMessage(false);
		}
	}, [targetApp]);

	const handleAppMapping = () => {
		let targetAppId = targetApp.app_id || targetApp._id;
		setSubmitting(true);

		mergeApps(props.application.app_id, targetAppId)
			.then((res) => {
				if (res.error) {
					setSubmitting(false);
					console.error("Error while merging apps:", res.error);
					return;
				}
				setIsMergeConfirmed(true);
				setSubmitting(false);
				dispatch(clearAllV2DataCache("applications"));
			})
			.catch((err) => {
				console.error("Error while merging apps:", err);
				setSubmitting(false);
			});
	};
	useEffect(() => {
		//Segment Implementation
		window.analytics.page(
			"Applications",
			"Application-Overview; Merge Apps",
			{
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
	}, []);
	return (
		<Modal
			show={props.show}
			onHide={props.onHide}
			centered
			dialogClassName="merge-app-modal--width"
		>
			{!wantToMerge && !isMergeConfirmed ? (
				<>
					<Modal.Header closeButton className="border-bottom">
						<Modal.Title className="w-100 text-center">
							Merge App
						</Modal.Title>
					</Modal.Header>
					<hr></hr>
					<Modal.Body className="merge-app-modal-body">
						<div className="px-5 py-4">
							{props.targetApp && (
								<div className="alert-message d-flex align-items-start p-2">
									<img
										src={ExclamationCircleSVG}
										className="mr-2"
									/>
									<span>
										You cannot map to{" "}
										{props.targetApp?.app_name} because it
										already exists in your system. Do you
										want to Merge the apps instead?
									</span>
								</div>
							)}
							<div className="d-flex my-3">
								<div style={{ width: "45%" }}>
									<label>Source Application</label>
									<div
										className="d-flex bg-white border rounded-lg align-items-center"
										style={{ padding: "8px 14px" }}
									>
										{props.application.app_logo ? (
											<img
												src={unescape(
													props.application.app_logo
												)}
												width="24"
												className="mr-2"
											/>
										) : (
											<NameBadge
												name={
													props.application.app_name
												}
												width={24}
												variant="round"
												className="mr-2"
											/>
										)}
										<span className="text-truncate">
											{props.application.app_name}
										</span>
									</div>
								</div>
								<div
									className="align-self-center mx-4 mt-2"
									style={{ flexShrink: 0 }}
								>
									<img src={MergeSVG} width="18" />
								</div>
								<div style={{ width: "45%" }}>
									<div className="target-app-input">
										<AsyncTypeahead
											label="Target App"
											placeholder="Application"
											fetchFn={searchAllApps}
											defaultValue={
												props.targetApp?.name || ""
											}
											onSelect={(selection) =>
												setTargetApp(selection)
											}
											keyFields={{
												id: "app_id",
												image: "app_logo",
												value: "app_name",
											}}
											allowFewSpecialCharacters={true}
										/>
									</div>
								</div>
							</div>
							{showWarningMessage ? (
								<div className="d-flex mt-4 flex-column align-items-center">
									<div className="alert-message d-flex align-items-start p-2">
										<img
											src={ExclamationCircleSVG}
											className="mr-2"
										/>
										<span>
											You cannot select same application
											to merge
										</span>
									</div>
								</div>
							) : null}
						</div>
					</Modal.Body>
					<hr></hr>
					<Modal.Footer className="border-top">
						<Button variant="link" onClick={props.onHide}>
							Close
						</Button>
						<Button
							className="z-button-primary px-4"
							size="lg"
							disabled={
								!(
									targetApp &&
									!(
										targetApp?._id ===
										props.application.app_id
									)
								)
							}
							onClick={() => setWantToMerge(true)}
						>
							Merge App
							{submitting && (
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
							)}
						</Button>
					</Modal.Footer>
				</>
			) : wantToMerge && !isMergeConfirmed ? (
				<MergeConfirmation
					show={props.show}
					onHide={props.onHide}
					source={props.application}
					targetSource={targetApp}
					handleMapping={handleAppMapping}
					mergingStatus={submitting}
				/>
			) : (
				<>
					<Modal.Header closeButton className="pb-2" />
					<Modal.Body className="border-bottom">
						<div className="d-flex flex-column align-items-center pb-5 px-3">
							<img src={CheckCircleSVG} width="45" />
							<span
								className="bold-600"
								style={{
									fontSize: 18,
									lineHeight: "28px",
								}}
								className="mt-4 px-3 text-center"
							>
								{props.application.app_name} has been merged
								with {targetApp?.app_name || targetApp?.name}
							</span>
							<Button
								className="z-btn-primary mt-4 px-4"
								size="lg"
								onClick={props.onMergeComplete}
							>
								Close
							</Button>
						</div>
					</Modal.Body>
				</>
			)}
		</Modal>
	);
}

MergeApps.propTypes = {
	show: PropTypes.bool.isRequired,
	application: PropTypes.object.isRequired,
	targetApp: PropTypes.object,
	onHide: PropTypes.func.isRequired,
	onMergeComplete: PropTypes.func.isRequired,
};
