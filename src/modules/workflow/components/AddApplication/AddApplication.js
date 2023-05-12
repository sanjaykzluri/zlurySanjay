import React, { useEffect, useState } from "react";
import plus from "../../../../assets/icons/plus-blue-bold.svg";
import plusW from "../../../../assets/icons/plus-white-bold.svg";
import star from "../../../../assets/icons/star.svg";
import "./AddApplication.css";
import { Button } from "../../../../UIComponents/Button/Button";
import { AsyncTypeahead } from "../../../../common/Typeahead/AsyncTypeahead";
import { searchAllApps } from "../../../../services/api/search";
import { useDispatch, useSelector } from "react-redux";
import { addAppToWorkflow } from "../../redux/workflow";
import { Spinner } from "react-bootstrap";
import { NameBadge } from "../../../../common/NameBadge";
import { useContext } from "react";
import RoleContext from "services/roleContext/roleContext";

export default function AddApplication(props) {
	const workflow = useSelector((state) => state.workflows.workflow);
	const recommendedApps = useSelector(
		(state) => state.workflows.recommendedApps
	);
	const [showAddAppUI, setShowAddAppUI] = useState(props.showApp || false);
	const [loader, setLoader] = useState(false);
	const dispatch = useDispatch();
	const { partner } = useContext(RoleContext);

	useEffect(() => {
		if (loader) {
			setLoader(false);
			setShowAddAppUI(false);
		}
	}, [workflow]);

	const onSelect = (app) => {
		handleAdd({
			id: app.app_id,
		});
	};

	const handleAdd = (app) => {
		if (app && app.id) {
			setLoader(true);
			dispatch(
				addAppToWorkflow(
					workflow.id,
					{
						app_id: app.id,
						positionAt: props.positionAt,
					},
					false,
					props.isTemplate,
					partner?.name
				)
			);
		}
	};

	const addStaticNode = (type) => {
		setLoader(true);
		dispatch(
			addAppToWorkflow(
				workflow.id,
				{
					node_type: type,
					positionAt: props.positionAt,
				},
				true,
				props.isTemplate,
				partner?.name
			)
		);
	};

	const recommendedAppList =
		recommendedApps &&
		recommendedApps.map((app, index) => (
			<li
				className="mr-2 pointer"
				key={index}
				onClick={() => {
					handleAdd(app);
				}}
			>
				{app.logo ? (
					<img
						className="border-radius-4 object-contain"
						width={24}
						height={24}
						src={app.logo}
					/>
				) : (
					<NameBadge
						className="mr-2 img-circle"
						width={24}
						name={app.name}
					/>
				)}
			</li>
		));

	return (
		<div className="z-workflow-add-application">
			<div
				className={`${
					showAddAppUI ? "active" : ""
				} z-workflow-add-application-btn`}
			>
				<Button
					disabled={workflow.isExecuted}
					style={{ padding: "7px 9px" }}
					onClick={() => {
						setShowAddAppUI(!showAddAppUI);
					}}
					type="link"
				>
					<img src={plus} />
					<img src={plusW} />
				</Button>
			</div>
			{showAddAppUI && (
				<div className="z-w-add-app-ui mb-4 mt-2">
					<div className="position-relative d-flex align-items-center">
						<div className="w-100 ">
							<AsyncTypeahead
								placeholder="Add an app to the workflow"
								fetchFn={searchAllApps}
								invalidMessage="Please select the app."
								onSelect={(app) => {
									onSelect(app);
								}}
								requiredValidation={false}
								keyFields={{
									id: "app_id",
									image: "app_logo",
									value: "app_name",
									appAuthStatus: "app_auth_status",
									onboardingActionCount:
										"app_onboarding_action_count",
									offboardingActionCount:
										"app_offboarding_action_count",
									appIntegrationId: "app_integration_id",
									appOrgIntegrationId: "app_org_intgr_id",
									appOrgIntegrationName: "app_org_intgr_name",
									appOrgIntegrationStatus:
										"app_org_intgr_status",
								}}
								allowFewSpecialCharacters={true}
							/>
							{loader && (
								<div className="text-center mb-2">
									<Spinner
										className="mr-2 blue-spinner"
										animation="border"
									/>
								</div>
							)}
						</div>
					</div>

					{!loader && (
						<div className="border-1 p-3">
							<h4 className="grey font-13">
								{props.isTemplate
									? "Most used apps "
									: "Recommended apps "}

								{!props.isTemplate && (
									<span className="font-10 grey-1 o-8">
										(based on the users you selected)
									</span>
								)}
							</h4>
							<ul className="d-flex list-style-none p-0">
								{recommendedAppList}
								<li className="vertical-divider  ml-1 mr-1"></li>
								{/* {!props.isTemplate && ( */}
								<li
									className="mr-2 pointer static-add-node  font-11 pl-2 pr-2 ml-3 primary-color  d-flex align-items-center"
									onClick={() => {
										addStaticNode("zluri");
									}}
								>
									<img
										className="mr-1"
										src={star}
										width={14}
										height={14}
									/>
									<span>{partner?.name} actions</span>
								</li>
								{/* )} */}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
