import React, { useEffect } from "react";
import "../WorkflowSidebar/WorkflowSidebar.css";
import { useDispatch, useSelector } from "react-redux";
import {
	getRecommendedActions,
	getRecommendedApps,
} from "../../redux/workflow";
import noDataIcon from "../../../../assets/icons/no-data.svg";
import RecommendedCardLoader from "../RecommendedCardLoader/RecommendedCardLoader";
import RecommendedApplicationCard from "../RecommendedApplicationCard/RecommendedApplicationCard";
import RecommendedActionCard from "../RecommendedActionCard/RecommendedActionCard";

function Recommended(props) {
	const workflow = useSelector((state) => state.workflows.workflow);
	const recommendedApps = useSelector(
		(state) => state.workflows.recommendedApps
	);
	const recommedendActions = useSelector(
		(state) => state.workflows.recommedendActions
	);
	const editApplication = useSelector(
		(state) => state.workflows.editApplication
	);
	const integrationAccounts = useSelector(
		(state) => state.workflows.integrationAccounts
	);
	const dispatch = useDispatch();

	useEffect(() => {
		if (editApplication?.id && integrationAccounts) {
			const integrationsArray = integrationAccounts[editApplication?.id];
			const selectedIntegrationAccount = integrationsArray
				?.flatMap(
					(item) =>
						item?.accounts &&
						Array.isArray(item?.accounts) &&
						item?.accounts?.length &&
						item?.accounts?.filter(
							(account) =>
								account?.org_integration_id ===
								editApplication?.orgIntegrationID
						)
				)
				?.filter((id) => id);
			dispatch(
				getRecommendedActions(
					editApplication.id,
					selectedIntegrationAccount?.[0]?.parent_integration_id,
					workflow.type
				)
			);
		}
	}, [editApplication, integrationAccounts?.length]);

	useEffect(() => {
		if (Object.keys(workflow)?.length && !recommendedApps) {
			if (props.isTemplate) {
				dispatch(
					getRecommendedApps(
						workflow?.id,
						"user",
						null,
						props?.isTemplate
					)
				);
			} else {
				dispatch(
					getRecommendedApps(
						workflow?.id,
						"user",
						workflow.users?.[0]?.user_id,
						props?.isTemplate
					)
				);
			}
		}
	}, [workflow]);

	const recommendedAppList =
		recommendedApps &&
		recommendedApps.map((app, index) => (
			<RecommendedApplicationCard
				key={index}
				application={app}
				isTemplate={props.isTemplate}
			/>
		));

	const recommendedActionList =
		recommedendActions &&
		recommedendActions.map((action, index) => (
			<RecommendedActionCard
				key={index}
				action={action}
				isTemplate={props.isTemplate}
			/>
		));

	const noData = (type) => (
		<div className="text-center position-center mt-5">
			<img src={noDataIcon} className="mb-1" />
			<p className="grey-1 o-8 font-12">No recommended {type} </p>
		</div>
	);

	return (
		<div className="tab_content">
			<div className="tab_content_header">
				{props.isTemplate ? " Most Used " : "Recommended "}
				{editApplication?.id || editApplication?.apps.length > 0
					? "Actions"
					: "Apps"}
			</div>
			<div className="tab_content_body">
				{editApplication?.id ? (
					!recommendedActionList ? (
						<RecommendedCardLoader />
					) : recommendedActionList.length ? (
						recommendedActionList
					) : (
						noData("actions")
					)
				) : editApplication?.apps.length > 0 ? (
					noData("actions")
				) : !recommendedApps ? (
					<RecommendedCardLoader />
				) : recommendedApps.length > 0 ? (
					recommendedAppList
				) : (
					noData("apps")
				)}
			</div>
		</div>
	);
}

export default Recommended;
