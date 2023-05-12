import React from "react";
import {
	getGroupsList,
	getGroupSources,
	getGroupsProperties,
} from "../service/Groups.api";
import { Link } from "react-router-dom";
import { kFormatter } from "constants/currency";
import { getGroupHyperlinkMetaData } from "../utils/Groups.utils";
import InfiniteTableContainer from "modules/v2InfiniteTable/InfiniteTableContainer";
import { SourcesFormatter } from "modules/shared/components/ManualUsage/TableFormatter/SourcesFormatter";
import AppBulkEdit from "modules/applications/components/table/AppBulkEdit";
import GroupsBulkEdit from "./GroupsBulkEdit";

export default function GroupsTable({}) {
	const getColumnsMapper = () => {
		const columnsMapper = {
			group: {
				dataField: "group_name",
				text: "Group",
				sortKey: "group_name",
				formatter: (data, row) => (
					<Link
						to={`/users?metaData=${getGroupHyperlinkMetaData(
							row.group_id
						)}#employees`}
						className="text-decoration-none text-color-black"
					>
						{data}
					</Link>
				),
			},
			tags: {
				dataField: "group_type",
				text: "Tag",
				sortKey: "group_type",
			},
			user_count: {
				dataField: "group_user_count",
				text: "Users",
				sortKey: "group_user_count",
			},
			app_count: {
				dataField: "group_app_count",
				text: "Apps Linked",
				sortKey: "group_app_count",
			},
			spend: {
				dataField: "group_spend",
				text: "Spends (YTD)",
				sortKey: "group_spend",
				formatter: (data) => kFormatter(data),
			},
			cost: {
				dataField: "group_cost",
				text: "Cost (YTD)",
				sortKey: "group_cost",
				formatter: (data) => kFormatter(data),
			},
			source: {
				dataField: "source_array",
				text: "Source",
				formatter: (
					cell,
					row,
					interColumnsStateObject,
					setInterColumnsStateObject
				) => (
					<div>
						<SourcesFormatter
							cell={cell}
							isUserAppActive={"active"}
							completeRow={row}
							is_manual_source_present={
								row.is_manual_source_present
							}
							interColumnsStateObject={interColumnsStateObject}
							setInterColumnsStateObject={
								setInterColumnsStateObject
							}
							isApp={true}
						/>
					</div>
				),
			},
		};
		return columnsMapper;
	};
	const a = {b:1};
	return (
		<>
			<InfiniteTableContainer
				columnsMapper={getColumnsMapper}
				v2TableEntity="groups"
				v2SearchFieldId="group_name"
				v2SearchFieldName="Group Name"
				getAPI={getGroupsList}
				searchAPI={getGroupsList}
				propertyListAPI={getGroupsProperties}
				sourceListAPI={getGroupSources}
				keyField="group_id"
				chipText="Groups"
				hasBulkEdit={true}
				bulkEditComponents={(
					checked,
					setChecked,
					dispatch,
					handleRefresh,
					checkAll,
					setCheckAll,
					checkAllExceptionData,
					setCheckAllExceptionData,
					metaData,
					selectedData,
					setSelectedData) => <GroupsBulkEdit {...{
					checked,
					setChecked,
					dispatch,
					handleRefresh,
					checkAll,
					setCheckAll,
					checkAllExceptionData,
					setCheckAllExceptionData,
					metaData,
					selectedData,
					setSelectedData
					}}> 
					<h5>hello world</h5></GroupsBulkEdit>}
			/>
		</>
	);
}
