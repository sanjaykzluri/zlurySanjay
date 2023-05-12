import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import { DottedProgress } from "../../common/DottedProgress/DottedProgress";
import { ChangeDesignation } from "./Overview/ChangeDesignation";
import { ChangeStatus } from "./Overview/ChangeStatus";
import { searchAllUsersV2, searchUserSource } from "../../services/api/search";
import {
	getAllUsersV2,
	getUserCostTrend,
	getUserPropertiesList,
	getUserSpendTrend,
	removeUserFromOnboardOffboard,
	setUsersOwner,
	setUsersReportingManager,
} from "../../services/api/users";

import _ from "underscore";
import UserAppMetaInfoCard from "../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import UserInfoTableComponent from "../../common/UserInfoTableComponent";
import dayjs from "dayjs";
import { timeSince } from "../../utils/DateUtility";
import { SecurityThreatFormatter } from "../../modules/security/components/CriticalUsers/CriticalUsers";
import SpendCostTrend, {
	HeaderFormatter,
	spendCostTrendType,
} from "../../modules/spendvscost/components/SpendCostTrend";
import { SourcesFormatter } from "../../modules/shared/components/ManualUsage/TableFormatter/SourcesFormatter";
import Rating from "../Applications/SecurityCompliance/Rating";
import { UserTableEllipsisDropdown } from "../../common/UserTableEllipsis/UserTableEllipsisDropdown";
import InfiniteTableContainer from "../../modules/v2InfiniteTable/InfiniteTableContainer";
import { clearAllV2DataCache } from "../../modules/v2InfiniteTable/redux/v2infinite-action";
import { UserExport } from "../../modules/users/components/UserExport";
import { kFormatter } from "constants/currency";
import { ChangeOwner } from "components/Applications/Overview/ChangeOwner";
import { openModal } from "reducers/modal.reducer";
import UserBulkUpdateViaCSV from "modules/users/components/UserBulkUpdateViaCSV";
import { fetchViewsList } from "services/api/views";
import { SCREEN_TAG_MAP } from "constants/views";

import { V2InfiniteTableLoader } from "modules/v2InfiniteTable/v2InfiniteTableLoader";
import { checkAndFetchViewsData } from "modules/views/redux/viewsnew-action";
import { trackPageSegment } from "modules/shared/utils/segment";
import V2PaginatedTableContainer from "modules/v2PaginatedTable/v2PaginatedTableContainer";
import UsersBulkEditComponents from "modules/users/components/UsersBulkEditComponents";
import BulkRunAPlaybook from "modules/workflow/components/BulkRunAPlaybook/BulkRunAPlaybook";
import { fetchPrimarySources } from "services/api/settings";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

export function DesignationFormatter({ cell, row, handleRefresh }) {
	return (
		<div
			className="designation__column__cell"
			style={{ position: "relative" }}
		>
			<ChangeDesignation
				user={row}
				status={cell}
				idFromTable={row.user_id}
				marginRequired={false}
				refreshReduxState={handleRefresh}
			/>
		</div>
	);
}
export function Usersins({ screenTagKey, fetchUserTabCount }) {
	const dispatch = useDispatch();
	const [fullRowArray, setFullRowArray] = useState([]);
	const [fullRowMessage, setFullRowmessage] = useState([]);
	const [loadingViews, setLoadingViews] = useState(true);
	const [activeView, setActiveView] = useState();
	const [disableChangeDeptButton, setDisableChangeDeptButton] = useState(false);

	const viewsData = useSelector(
		(state) => state.viewsnew?.[SCREEN_TAG_MAP[screenTagKey]] || {}
	);

	useEffect(() => {
		dispatch(checkAndFetchViewsData(SCREEN_TAG_MAP[screenTagKey]));
	}, []);

	useEffect(() => {
		if (viewsData && viewsData.data) {
			let obj = viewsData?.data.find((el) => el.is_default);
			setActiveView(obj);
		}
	}, [viewsData]);

	useEffect(() => {
		async function getPrimarySources() {
			const response = await fetchPrimarySources();
			const deptObj = response.data.find(
				(item) => item.k === "departments"
			);
			let disableAdd = false;
			if (deptObj) {
				disableAdd = deptObj.v.sources_ids?.some(
					(source) => source.is_primary
				);
			}
			setDisableChangeDeptButton(disableAdd);
		}
		getPrimarySources();
	}, []);

	const statusFormatter = (cell, row) => {
		return (
			<ChangeStatus
				status={row?.user_archive || row?.archive ? "archived" : cell}
				idFromTable={row.user_id}
				disableEdit={row?.user_archive}
				hasStatusHover={true}
				sourceArray={row?.source_array}
			/>
		);
	};

	const getColumnsMapper = (handleRefresh) => {
		const columnsMapper = {
			user: {
				dataField: "user_name",
				text: "User",
				sortKey: "user_name",
				formatter: (data, row, rowindex) => {
					return (
						<UserInfoTableComponent
							user_account_type={row.user_account_type}
							profile_img={row.profile_img}
							user_profile={row.user_profile}
							user_email={row.user_email}
							user_status={row.user_status}
							row={row}
							user_id={row.user_id}
							user_name={row.user_name}
							is_external_user={row.user_is_external}
							tooltipClassName={"userMetaInfoCard"}
							customTooltip={
								<UserAppMetaInfoCard
									title={row?.user_name}
									description={row?.user_email}
									isActive={row.user_status === "active"}
									isUser={true}
									row={row}
									user_status={row.user_status}
								/>
							}
						/>
					);
				},
			},
			user_email: {
				dataField: "user_email",
				text: "Email",
				sortKey: "user_email",
				formatter: (dataField) => (
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{dataField}</Tooltip>}
					>
						<div className="truncate_10vw">{dataField}</div>
					</OverlayTrigger>
				),
			},
			top_level_department: {
				dataField: "user_top_level_department",
				text: "Top Level Department",
				sortKey: "user_department_name_path",
				formatter: (dataField, data) => {
					const dept_name =
						data.user_department_name_path?.split("/")?.[0] || "-";
					const dept_id =
						data.user_department_id_path?.split(",")?.[0] || "";
					return (
						<div className="d-flex">
							{dept_name ? (
								<>
									{dept_id ? (
										<Link
											to={`/departments/${dept_id}#overviewdep`}
											className="table-link"
										>
											<LongTextTooltip
												text={dept_name}
												maxWidth={200}
												style={{
													color: "#222222",
												}}
											/>
										</Link>
									) : (
										<span>{dept_name}</span>
									)}
								</>
							) : (
								"-"
							)}
						</div>
					);
				},
			},
			department_path: {
				dataField: "user_department_name_path",
				text: "Department Path",
				sortKey: "user_department_name_path",
				formatter: (dataField) => (
					<div className="flex flex-row center">
						{dataField ? (
							<LongTextTooltip
								text={dataField}
								maxWidth={200}
								style={{
									color: "#222222",
								}}
							/>
						) : (
							"-"
						)}
					</div>
				),
			},
			user_designation: {
				dataField: "user_designation",
				text: "Designation",
				sortKey: "user_designation",
				formatter: (cell, row) => (
					<DesignationFormatter
						cell={cell}
						row={row}
						handleRefresh={handleRefresh}
					></DesignationFormatter>
				),
			},
			user_usage: {
				dataField: "user_usage",
				text: "Usage",
				sortKey: "user_usage",
				formatter: (dataField) => (
					<DottedProgress value={dataField || 0} />
				),
			},
			user_app_count: {
				dataField: "user_app_count",
				text: "Apps Used",
				sortKey: "user_app_count",
				formatter: (row, data) => (
					<Link
						to={`/users/${data.user_id}#applications`}
						className="table-link"
					>
						{row}
					</Link>
				),
			},
			user_cost_center_name: {
				dataField: "user_cost_center_name",
				text: "Cost Center Name",
				sortKey: "user_cost_center_name",
				formatter: (data) => data || "-",
			},
			user_cost_center_code: {
				dataField: "user_cost_center_code",
				text: "Cost Center Code",
				sortKey: "user_cost_center_code",
				formatter: (data) => data || "-",
			},
			team: {
				dataField: "user_department_name",
				text: "Department",
				sortKey: "user_department_name",
				formatter: (row, dataField) => (
					<div className="d-flex">
						<Link
							to={`/departments/${dataField?.user_department_id}#overviewdep`}
							className="table-link"
						>
							<LongTextTooltip
								text={dataField?.user_department_name}
								maxWidth={200}
								style={{
									color: "#222222",
								}}
							/>
						</Link>
					</div>
				),
			},
			user_status: {
				dataField: "user_status",
				text: "Status",
				sortKey: "user_status",
				formatter: statusFormatter,
			},
			user_account_type: {
				dataField: "user_account_type",
				text: "Account type",
				sortKey: "user_account_type",
				formatter: (dataField) => (
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{dataField}</Tooltip>}
					>
						<div className="truncate_10vw text-capitalize">
							{dataField}
						</div>
					</OverlayTrigger>
				),
			},
			user_role: {
				dataField: "user_role",
				text: "Role",
				sortKey: "user_role",
				formatter: (dataField) => (
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{dataField}</Tooltip>}
					>
						<div className="truncate_10vw text-capitalize">
							{dataField}
						</div>
					</OverlayTrigger>
				),
			},
			critical_apps_count: {
				dataField: "critical_apps_count",
				sortKey: "critical_apps_count",
				text: "Critical Apps",
				formatter: (row, data) => (
					<div>{data.critical_apps_count || 0}</div>
				),
			},
			max_app_risk_level: {
				dataField: "max_app_risk_level",
				text: "Risk Level",
				sortKey: "max_app_risk_level",
				formatter: (row, data) => (
					<div className="flex flex-row align-items-center">
						<Rating
							rating={Math.ceil(data.max_app_risk_level)}
							iconType="risk"
							singleIcon={true}
							width={12}
							height={12}
						/>
						<div
							className="font-13 pl-1"
							style={{ paddingTop: "1px" }}
						>
							{`Level ${data.max_app_risk_level || 0}`}
						</div>
					</div>
				),
			},
			user_created_at: {
				dataField: "user_created_at",
				sortKey: "user_created_at",
				text: "Created At",
				formatter: (row, data) => {
					if (data && data.user_created_at) {
						return (
							<>
								{dayjs(data.user_created_at || 0).format(
									"D MMM YYYY"
								)}
							</>
						);
					}
				},
			},
			user_last_active: {
				dataField: "user_last_active",
				text: "Last Active",
				sortKey: "user_last_active",
				formatter: (row, data) => (
					<div>
						{data.user_last_active
							? `${timeSince(data.user_last_active)} ago`
							: "-"}
					</div>
				),
			},
			user_avg_spend: {
				dataField: "user_avg_spend",
				sortKey: "user_avg_spend",
				text: "Avg Spend",
				formatter: (row, data) => {
					return <div>{kFormatter(data?.user_avg_spend)}</div>;
				},
			},
			user_total_spend: {
				dataField: "user_total_spend",
				sortKey: "user_total_spend",
				text: "Spend [YTD]",
				headerFormatter: (row, data) => (
					<HeaderFormatter
						text={"Spend [YTD]"}
						type={spendCostTrendType.SPEND}
					></HeaderFormatter>
				),
				formatter: (row, data) => (
					<SpendCostTrend
						trendAPI={getUserSpendTrend}
						type={spendCostTrendType.SPEND}
						id={data?.user_id}
						value={data?.user_total_spend}
					/>
				),
			},
			user_max_risk: {
				dataField: "user_max_risk",
				text: "Threat",
				sortKey: "user_max_risk",
				formatter: (data, row) => (
					<SecurityThreatFormatter threat={data} />
				),
			},
			user_cost: {
				dataField: "user_cost",
				sortKey: "user_cost",
				text: "Cost [YTD]",
				headerFormatter: (row, data) => (
					<HeaderFormatter
						text={"Cost [YTD]"}
						type={spendCostTrendType.COST}
					></HeaderFormatter>
				),
				formatter: (row, data) => (
					<SpendCostTrend
						trendAPI={getUserCostTrend}
						type={spendCostTrendType.COST}
						id={data?.user_id}
						value={data?.user_cost}
					/>
				),
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
							user_app_id={row.user_app_id}
							user_name={row.user_name}
							user_profile={row.user_profile}
							user_id={row.user_id}
							completeRow={row}
							is_manual_source_present={
								row.is_manual_source_present
							}
							interColumnsStateObject={interColumnsStateObject}
							setInterColumnsStateObject={
								setInterColumnsStateObject
							}
							org_user_app_id="org_user_app_id"
							org_user_app_source_types="user_source_types"
							org_user_app_sources="user_sources"
							isUserSource={true}
							refresh={() => handleRefresh()}
						/>
					</div>
				),
			},
			ellipsis: {
				dataField: "",
				text: "",
				formatter: (row, data) => {
					return (
						<UserTableEllipsisDropdown
							user={data}
							refresh={() => handleRefresh()}
							setFullRowArray={setFullRowArray}
							fullRowArray={fullRowArray}
							setFullRowmessage={setFullRowmessage}
							fullRowMessage={fullRowMessage}
							screenTagKey={screenTagKey}
							fetchUserTabCount={fetchUserTabCount}
							dropdownClassname="z-index-20"
						/>
					);
				},
				skipCellFormat: true,
			},
			reporting_manager: {
				dataField: "user_reporting_manager_name",
				sortKey: "user_reporting_manager_name",
				text: "Reporting Manager",
				displayName: "b",
				formatter: (data, row) => (
					<ChangeOwner
						fieldName="owner"
						updateFunc={(appId, patchObj) =>
							setUsersReportingManager(
								[row._id],
								Array.isArray(patchObj?.patches)
									? patchObj.patches[0].value
									: ""
							)
						}
						userId={row.user_reporting_manager_id}
						userName={row.user_reporting_manager_name}
						userImage={row.user_reporting_manager_profile_img}
						idFromTable={row._id}
						isAppTable={true}
						ownerNameStyle="truncate_10vw"
						refreshReduxState={() => {
							handleRefresh();
						}}
						componentText={"Reporting Manager"}
					/>
				),
			},
		};

		if (screenTagKey === "group") {
			columnsMapper.user_accessed_by_accounts_size = {
				dataField: "user_accessed_by_accounts_size",
				text: "User count",
			};
		}

		if (screenTagKey === "group" || screenTagKey === "service") {
			columnsMapper.owner = {
				dataField: "user_owner_name",
				sortKey: "user_owner_name",
				text: "Owner",
				displayName: "b",
				formatter: (data, row) => (
					<ChangeOwner
						fieldName="owner"
						updateFunc={(appId, patchObj) =>
							setUsersOwner(
								[row._id],
								Array.isArray(patchObj?.patches)
									? patchObj.patches[0].value
									: ""
							)
						}
						userId={row.user_owner_id}
						userName={row.user_owner_name}
						userImage={row.user_owner_profile_img}
						idFromTable={row._id}
						isAppTable={true}
						ownerNameStyle="truncate_10vw"
						refreshReduxState={() => {
							handleRefresh();
						}}
						componentText={"Owner"}
					/>
				),
			};
		}

		return columnsMapper;
	};

	const clickedOnUndo = (ids) => {
		removeUserFromOnboardOffboard({ user_ids: ids }).then((res) => {
			let tempArray = [...fullRowArray];
			ids.forEach((el) => {
				let index = tempArray.findIndex((row) => row === el);
				tempArray.splice([index], 1);
			});
			setFullRowArray(tempArray);
			fetchUserTabCount();
		});
	};

	const fullRowMapper = [
		{
			dataField: "user_name",
			text: "User",
			sortKey: "user_name",
			formatter: (row, data, rowindex) => {
				return (
					<UserInfoTableComponent
						user_account_type={row.user_account_type}
						profile_img={row.profile_img}
						user_profile={row.user_profile}
						user_email={row.user_email}
						user_status={row.user_status}
						row={row}
						user_id={row.user_id}
						user_name={row.user_name}
						is_external_user={row.user_is_external}
						tooltipClassName={"userMetaInfoCard"}
						customTooltip={
							<UserAppMetaInfoCard
								title={row?.user_name}
								description={row?.user_email}
								isActive={row.user_status === "active"}
								isUser={true}
								row={row}
								user_status={row.user_status}
							/>
						}
					></UserInfoTableComponent>
				);
			},
		},
		{
			dataField: "aa",
			fullRow: true,
			formatter: (row) => {
				let tempObject = fullRowMessage.find(
					(el) => el.id === row.user_id
				);
				return (
					<div className="d-flex align-items-center">
						<div className="grey-1 font-13">
							{`${row.user_name} ${tempObject?.message}`}
						</div>
						<div
							className="primary-color font-13 cursor-pointer ml-2"
							onClick={() =>
								clickedOnUndo([row.user_id], tempObject.type)
							}
						>
							Undo
						</div>
					</div>
				);
			},
		},
	];

	const customProps = {
		columnsMapper: getColumnsMapper,
		screenTagKey: screenTagKey,
		v2TableEntity: "users",
		v2SearchFieldId: "user_name",
		v2SearchFieldName: "User Name",
		getAPI: getAllUsersV2,
		searchAPI: searchAllUsersV2,
		propertyListAPI: getUserPropertiesList,
		keyField: "_id",
		chipText: "Users",
		hasBulkEdit: true,
		bulkEditComponents: (
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
		) => {
			return (
				<>
					<BulkRunAPlaybook
						userIds={checked}
						className="mr-3 z-index-60"
						checkAll={checkAll}
						metaData={metaData}
						checkAllExceptionData={checkAllExceptionData}
						pageLocation={"Users"}
					/>
					<UsersBulkEditComponents
						checked={checked}
						setChecked={setChecked}
						dispatch={dispatch}
						handleRefresh={handleRefresh}
						fetchUserTabCount={fetchUserTabCount}
						checkAll={checkAll}
						setCheckAll={setCheckAll}
						checkAllExceptionData={checkAllExceptionData}
						setCheckAllExceptionData={setCheckAllExceptionData}
						metaData={metaData}
						disableChangeDeptButton={disableChangeDeptButton}
					/>
				</>
			);
		},
		fullRowArray: fullRowArray,
		fullRowMapper: fullRowMapper,
		key: screenTagKey,
		exportComponent: UserExport,
		onAddClick: (handleRefresh) => {
			dispatch(
				openModal("user", {
					screenTagKey,
					handleRefresh,
					fetchUserTabCount,
				})
			);
			trackPageSegment("Users", "Add User");
		},
		archiveFilterId: "user_archive",
		sourceListAPI: searchUserSource,
		bulkUpdateViaCSVComponent: UserBulkUpdateViaCSV,
		rowFormatRequired: (data) => data?.user_archive,
		rowFormatClassName: "o-6",
		user_search: true,
		pageLayoutPresent: true,
		active_view: activeView,
		set_all_present: true,
	};
	return (
		<>
			{viewsData.layout_option && !viewsData?.isLoadingData ? (
				viewsData.layout_option === "paginated" ? (
					<V2PaginatedTableContainer
						{...customProps}
					></V2PaginatedTableContainer>
				) : (
					<InfiniteTableContainer {...customProps} />
				)
			) : (
				<V2InfiniteTableLoader></V2InfiniteTableLoader>
			)}
		</>
	);
}
