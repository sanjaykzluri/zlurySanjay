import React from "react";
import { EmptySearch } from "../../../common/EmptySearch";
import { Empty } from "../components/Empty/Empty";
import {
	templatesColumns,
	templatesColumnsMapper,
	templatesMoreInfoCol,
} from "./templates";
import { draftColumnsMapper, draftColumns } from "./draft";
import { completedColumnsMapper, completedColumns } from "./completed";
import {
	automationRulesColumnsMapper,
	automationRulesColumns,
	rulesMoreInfoCol,
	appRequisitionAutomationRulesColumns,
	appRequisitionRulesMoreInfoCol,
} from "./rules";
import { scheduledRunsColumns } from "./scheduledRuns";
export {
	templatesColumnsMapper,
	templatesColumns,
	draftColumns,
	draftColumnsMapper,
	completedColumnsMapper,
	completedColumns,
	automationRulesColumnsMapper,
};
export const DraftsEmptyScreen = (
	searchQuery,
	showErrorModal,
	addNewTemplateButton,
	metaData,
	onReset
) => {
	return searchQuery ? (
		<EmptySearch
			searchQuery={searchQuery}
			metaData={metaData}
			onReset={() => {
				onReset();
			}}
			isWorkflow={true}
		/>
	) : showErrorModal ? (
		<Empty showErrorModal={showErrorModal} />
	) : (
		<Empty>
			<div
				className="d-flex flex-column justify-content-center align-items-center ml-3"
				style={{
					marginTop: "-5px",
				}}
			>
				<span className="font-18">Nothing found here</span>
				{addNewTemplateButton}
			</div>
		</Empty>
	);
};

export const templatesEmptyScreen = (
	searchQuery,
	showErrorModal,
	addNewTemplateButton,
	metaData,
	onReset
) => {
	return searchQuery ? (
		<EmptySearch
			metaData={metaData}
			onReset={() => {
				onReset();
			}}
			searchQuery={searchQuery}
			isWorkflow={true}
		/>
	) : showErrorModal ? (
		<Empty showErrorModal />
	) : (
		<Empty>
			<div
				className="d-flex flex-column justify-content-center align-items-center ml-3"
				style={{
					marginTop: "-5px",
				}}
			>
				<span className="font-18">Nothing found here</span>
				<span className="font-14">
					You haven’t created any playbooks yet
				</span>
			</div>
		</Empty>
	);
};

export const completedEmptyScreen = (
	searchQuery,
	showErrorModal,
	addNewTemplateButton,
	metaData,
	onReset
) => {
	return searchQuery ? (
		<EmptySearch
			metaData={metaData}
			onReset={() => {
				onReset();
			}}
			searchQuery={searchQuery}
			isWorkflow={true}
		/>
	) : showErrorModal ? (
		<Empty showErrorModal />
	) : (
		<Empty>
			<div
				className="d-flex flex-column justify-content-center align-items-center ml-3"
				style={{
					marginTop: "-5px",
				}}
			>
				<span className="font-18">Nothing found here</span>
				<span className="font-14">
					You haven’t run any workflows yet
				</span>
			</div>
		</Empty>
	);
};

export const automationRulesEmptyScreen = (
	searchQuery,
	showErrorModal,
	addNewRuleButton,
	addNewTemplateButton,
	metaData,
	onReset
) => {
	return searchQuery ? (
		<EmptySearch
			metaData={metaData}
			onReset={() => {
				onReset();
			}}
			searchQuery={searchQuery}
			isWorkflow={true}
		/>
	) : showErrorModal ? (
		<Empty showErrorModal />
	) : (
		<Empty>
			<div
				className="d-flex flex-column justify-content-center align-items-center ml-3"
				style={{
					marginTop: "-5px",
				}}
			>
				{/* <span className="font-18">Nothing found here</span> */}
				<span className="font-14">
					You haven't set up any automation rules
				</span>
				{addNewRuleButton}
			</div>
		</Empty>
	);
};

const scheduledRunsEmptyScreen = (
	searchQuery,
	showErrorModal,
	metaData,
	onReset
) => {
	return searchQuery ? (
		<EmptySearch
			metaData={metaData}
			onReset={() => {
				onReset();
			}}
			searchQuery={searchQuery}
			isWorkflow={true}
		/>
	) : showErrorModal ? (
		<Empty showErrorModal />
	) : (
		<Empty>
			<div
				className="d-flex flex-column justify-content-center align-items-center ml-3"
				style={{
					marginTop: "-5px",
				}}
			>
				<span className="font-18">Nothing found here</span>
				<span className="font-14">
					You haven’t scheduled any workflows yet
				</span>
			</div>
		</Empty>
	);
};

export const TAB_TYPES = {
	"#overview": {
		type: "drafts",
		columns: draftColumns,
		emptyScreen: DraftsEmptyScreen,
	},
	"#drafts": {
		type: "drafts",
		columns: draftColumns,
		emptyScreen: DraftsEmptyScreen,
	},
	"#playbooks": {
		type: "playbooks",
		module: "template",
		columns: templatesColumns,
		moreInfoCol: templatesMoreInfoCol,
		emptyScreen: templatesEmptyScreen,
	},
	"#completed": {
		type: "completed",
		columns: completedColumns,
		emptyScreen: completedEmptyScreen,
	},
	"#rules": {
		type: "rules",
		columns: automationRulesColumns,
		moreInfoCol: rulesMoreInfoCol,
		emptyScreen: automationRulesEmptyScreen,
	},
	apprequisition_rules: {
		type: "rules",
		columns: appRequisitionAutomationRulesColumns,
		moreInfoCol: appRequisitionRulesMoreInfoCol,
		emptyScreen: automationRulesEmptyScreen,
	},
	"#runs": {
		type: "runs",
		columns: scheduledRunsColumns,
		emptyScreen: scheduledRunsEmptyScreen,
	},
};
