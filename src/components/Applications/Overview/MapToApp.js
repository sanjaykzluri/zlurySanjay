import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Spinner } from "react-bootstrap";
import { AsyncTypeahead } from "../../../common/Typeahead/AsyncTypeahead";
import { searchGlobalOnlyApps } from "../../../services/api/search";
import { mapToApp } from "../../../services/api/applications";
import { useDispatch, useSelector } from "react-redux";
import ExclamationCircleSVG from "../../../assets/icons/exclamation-circle.svg";
import CheckCircleSVG from "../../../assets/icons/check-circle.svg";
import integrationavailable from "assets/applications/integrationavailable.svg";
import { IntegrationAvailableSection } from "../AllApps/AddApps";

export function MapToApp(props) {
	const [parentApp, setParentApp] = useState();
	const [isMappable, setIsMappable] = useState(true);
	const [isMapped, setIsMapped] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const handleAppMapping = () => {
		setSubmitting(true);

		mapToApp(props.application.app_id, parentApp.app_id)
			.then((res) => {
				if (res.error) {
					setSubmitting(false);
					console.error(
						"Error while mapping app to another app:",
						res.error
					);
					return;
				}

				if (res.status === "fail") {
					setSubmitting(false);
					setIsMappable(false);
					return;
				}

				setIsMapped(true);
				setSubmitting(false);
			})
			.catch((err) => {
				console.error("Error while mapping app to another app:", err);
				setSubmitting(false);
			});
	};
	useEffect(() => {
		//Segment Implementation
		window.analytics.page(
			"Applications",
			"Application-Overview; Map to App",
			{
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
	}, []);
	return !isMapped ? (
		<Modal show={props.show} onHide={props.onHide} centered>
			<Modal.Header closeButton className="border-bottom">
				<Modal.Title className="w-100 text-center">
					Map to App
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="p-5">
					<AsyncTypeahead
						label="Select Application"
						placeholder="Application"
						fetchFn={searchGlobalOnlyApps}
						onSelect={(selection) => setParentApp(selection)}
						keyFields={{
							id: "app_id",
							image: "app_image_url",
							value: "app_name",
							additional_information: "app_integration_id",
						}}
						allowFewSpecialCharacters={true}
						showAdditionalRightInformation={true}
						additionalInformationFormatter={(value) => {
							if (value) {
								return IntegrationAvailableSection();
							}
						}}
					/>
					{!isMappable && (
						<div className="alert-message d-flex align-items-start p-2">
							<img src={ExclamationCircleSVG} className="mr-2" />
							<span>
								You cannot map to {parentApp?.app_name} because
								it already exists in your system. Do you want
								to&nbsp;
								<a
									className="text-underline cursor-pointer"
									onClick={() =>
										props.onMergeClick(parentApp)
									}
								>
									Merge the apps instead?
								</a>
							</span>
						</div>
					)}
				</div>
			</Modal.Body>
			<Modal.Footer className="border-top">
				<Button variant="link" onClick={props.onHide}>
					Close
				</Button>
				<Button
					className="z-button-primary px-4"
					size="lg"
					disabled={submitting || !isMappable || !parentApp}
					onClick={handleAppMapping}
				>
					Map to App
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
		</Modal>
	) : (
		<Modal show={props.show} onHide={props.onMapComplete} centered>
			<Modal.Header closeButton className="pb-2" />
			<Modal.Body>
				<div className="d-flex flex-column align-items-center pb-5 px-3">
					<img src={CheckCircleSVG} width="45" />
					<span
						style={{
							fontSize: 18,
							lineHeight: "28px",
							fontWeight: 600,
						}}
						className="mt-4 px-3 text-center"
					>
						{props.application.app_name} has been mapped to{" "}
						{parentApp.app_name}
					</span>
					<Button
						className="z-btn-primary mt-4 px-4"
						size="lg"
						onClick={props.onMapComplete}
					>
						Close
					</Button>
				</div>
			</Modal.Body>
		</Modal>
	);
}

MapToApp.propTypes = {
	show: PropTypes.bool.isRequired,
	application: PropTypes.object.isRequired,
	onHide: PropTypes.func.isRequired,
	onMapComplete: PropTypes.func.isRequired,
	onMergeClick: PropTypes.func.isRequired,
};
