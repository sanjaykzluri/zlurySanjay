import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { OverlayTrigger } from "react-bootstrap";
import { useLocation, useHistory, Link } from "react-router-dom";
import { Button } from "../../../../UIComponents/Button/Button";
import WorkflowsTable from "../../components/WorkflowsTable/WorkflowsTable";
import WorkflowTableCTA from "../../components/WorkflowTableCTA/WorkflowTableCTA";
import { draftColumnsMapper, TAB_TYPES } from "../../constants";
import optionsButton from "../../../../assets/optionsButton.svg";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";

const RecentlyEdited = (props) => {
	const {
		data,
		isLoadingData,
		setSelectedWorkflow,
		onDeleteWorkflow,
		metaData,
	} = props;

	const selectedTab = useSelector((state) => state.router.location.hash);
	const history = useHistory();

	const overriddenColumnsMappers = {
		draftsTable: {
			...draftColumnsMapper,
			run_action: {
				dataField: "app_status",
				text: "",
				formatter: (data, row) => (
					<div className="workflows-workflow-action">
						<Link
							to={{
								hash: "#recommended",
								pathname: `/workflow/${row?.workflow_id}`,
							}}
							className="text-decoration-none font-13"
						>
							Edit
						</Link>
					</div>
				),
			},
			options: {
				dataField: "app_status",
				text: "",
				formatter: (data, row) => (
					<Dropdown
						toggler={<img src={optionsButton} />}
						options={[
							{
								label: "Delete Draft",
								onClick: () => {
									setSelectedWorkflow(row);
									onDeleteWorkflow();
								},
							},
						]}
						optionFormatter={(option) => option.label}
						onOptionSelect={(option) => option.onClick()}
						right={0}
					/>
				),
			},
		},
	};

	return (
		<>
			<div className={`mx-auto flex-1 flex-row d-flex pr-4 mt-4`}>
				<div className="d-inline-flex flex-1 flex-column justify-content-center">
					<p className="font-18 bold-600 black mb-0 text-captalize">
						<span style={{ textTransform: "capitalize" }}>
							Recently Edited
						</span>{" "}
					</p>
				</div>
				<Button
					type="link"
					onClick={() => {
						history.push(`#drafts`);
					}}
					className="font-13 ml-3 pl-4 pr-0"
				>
					View All
				</Button>
			</div>
			<div className="mt-2 mb-2">
				<WorkflowsTable
					data={data}
					metaData={metaData}
					type={TAB_TYPES[selectedTab]?.type}
					columns={TAB_TYPES[selectedTab]?.columns}
					columnsMapper={
						selectedTab && selectedTab == "#overview"
							? overriddenColumnsMappers.draftsTable
							: null
					}
					isLoadingData={isLoadingData}
					allowFewSpecialCharacters={true}
					emptyState={TAB_TYPES[selectedTab]?.emptyScreen.call(
						TAB_TYPES[selectedTab]?.emptyScreen
					)}
				/>
			</div>
		</>
	);
};

export default RecentlyEdited;
