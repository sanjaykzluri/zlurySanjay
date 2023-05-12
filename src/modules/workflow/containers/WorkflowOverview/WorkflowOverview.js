import React from "react";
import WorkflowOverviewHeader from "../../components/WorkflowOverviewHeader/WorkflowOverviewHeader";
import RecentlyEdited from "../../components/RecentlyEdited/RecentlyEdited";
import MostUsedTemplate from "modules/workflow/components/MostUsedTemplate/MostUsedTemplate";
import WorkflowInProgress from "modules/workflow/components/WorkflowInProgress/WorkflowInProgress";

const WorkflowOverview = (props) => {
	const {
		workflowType,
		data,
		isLoadingData,
		setSelectedWorkflow,
		onDeleteWorkflow,
		onCreateNewWorkflow,
		metaData,
	} = props;
	return (
		<>
			<WorkflowOverviewHeader
				onCreateNewWorkflow={onCreateNewWorkflow}
				workflowType={workflowType}
			/>
			<WorkflowInProgress />
			<MostUsedTemplate tag="mostusedtemplates" />
			<RecentlyEdited
				data={data}
				metaData={metaData}
				isLoadingData={isLoadingData}
				workflowType={workflowType}
				setSelectedWorkflow={setSelectedWorkflow}
				onDeleteWorkflow={onDeleteWorkflow}
			/>
		</>
	);
};

export default WorkflowOverview;
