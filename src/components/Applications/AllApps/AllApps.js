import React, { useEffect, useState } from "react";
import { ChangeOwner } from "../Overview/ChangeOwner";
import { ChangeStatus } from "../Overview/ChangeStatus";
import {
	getAllApplications,
	getApplicationCostTrend,
	getApplicationSpendTrend,
	getAppPropertiesList,
	setAppsBulkAuth,
	updateAppOwner,
} from "../../../services/api/applications";
import { DottedProgress } from "../../../common/DottedProgress/DottedProgress";
import { useDispatch, useSelector } from "react-redux";
import { searchAllAppsV2, searchAppSource } from "../../../services/api/search";
import { kFormatter } from "../../../constants/currency";
import _ from "underscore";
import AppTableComponent from "../../../common/AppTableComponent";
import dayjs from "dayjs";
import { timeSince } from "../../../utils/DateUtility";
import Rating from "../SecurityCompliance/Rating";
import { SecurityThreatFormatter } from "../../../modules/security/components/CriticalUsers/CriticalUsers";
import { SourcesFormatter } from "../../../modules/shared/components/ManualUsage/TableFormatter/SourcesFormatter";
import SpendCostTrend, {
	HeaderFormatter,
	spendCostTrendType,
} from "../../../modules/spendvscost/components/SpendCostTrend";
import InfiniteTableContainer from "../../../modules/v2InfiniteTable/InfiniteTableContainer";
import { CategoryFormatter } from "../../../modules/applications/components/table/AppCategoryFormatter";
import "./AllApps.css";
import "./NewDropdowns.css";
import { AppExport } from "../../../modules/applications/components/table/AppExport";
import { WhatsNextContainer } from "../../../modules/applications/components/table/WhatsNextContainer";
import AddAppModal from "../../../modules/licenses/components/ContractSteps/AddAppModal";
import AppNotificationCell from "modules/applications/components/table/AppNotificationCell";
import AppBulkUpdateViaCSV from "modules/applications/components/table/AppBulkUpdateViaCSV";
import V2PaginatedTableContainer from "modules/v2PaginatedTable/v2PaginatedTableContainer";
import { SCREEN_TAG_MAP } from "constants/views";
import { V2InfiniteTableLoader } from "modules/v2InfiniteTable/v2InfiniteTableLoader";
import { checkAndFetchViewsData } from "modules/views/redux/viewsnew-action";
import { trackPageSegment } from "modules/shared/utils/segment";
import AppTagsComponent from "modules/applications/components/overview/AppTagsComponent";
import { ContractInfo } from "modules/applications/components/table/ContractInfo";
import InlineLicenceAssg from "components/LicenceAssignment/InlineLicenceAssg";
import { PillsRenderer } from "modules/employee-dashboard/components/appInsights";
import { getOptimizationTableColumnGroups } from "modules/Optimization/utils/OptimizationUtils";
import UserInfoTableComponent from "common/UserInfoTableComponent";
import AppPaymentMethodsCell from "modules/applications/components/table/AppPaymentMethodsCell";
import AppBulkEdit from "modules/applications/components/table/AppBulkEdit";

export function AllApps({ screenTagKey, fetchAppCount }) {
	const dispatch = useDispatch();
	const [fullRowArray, setFullRowArray] = useState([]);
	const [fullRowMessage, setFullRowMessage] = useState([]);
	const [clickedOnQuickReview, setClickedOnQuickReview] = useState(false);
	const [showAddApps, setShowAddApps] = useState(false);
	const [loadingViews, setLoadingViews] = useState(true);
	const [activeView, setActiveView] = useState();

	const { org_beta_features } = useSelector((state) => state.userInfo);

	const viewsData = useSelector(
		(state) => state.viewsnew?.[SCREEN_TAG_MAP[screenTagKey]] || {}
	);

	useEffect(() => {
		dispatch(checkAndFetchViewsData(SCREEN_TAG_MAP[screenTagKey]));
		trackPageSegment("Applications", `${screenTagKey} Applications`);
	}, []);

	useEffect(() => {
		if (viewsData && viewsData.data) {
			let obj = viewsData?.data.find((el) => el.is_default);
			setActiveView(obj);
		}
	}, [viewsData]);

	const getColumnsMapper = (handleRefresh, metaData) => {
		const columnsMapper = {
			application: {
				dataField: "name",
				text: "Applications",
				sortKey: "app_name",
				displayName: "a",
				formatter: (row, data) => {
					return (
						<AppTableComponent
							app_name={data?.app_name}
							app_logo={data?.app_logo}
							app_auth_status={data?.app_state}
							app_id={data?._id}
							logo_height="auto"
							logo_width="28px"
							v2TableEntity="applications"
							screenTagKey={screenTagKey}
						/>
					);
				},
			},
			owner: {
				dataField: "app_owner_name",
				sortKey: "app_owner_name",
				text: "Owner",
				displayName: "b",
				formatter: (data, row) => (
					<ChangeOwner
						fieldName="owner"
						updateFunc={(appId, patchObj) =>
							updateAppOwner(
								appId,
								Array.isArray(patchObj?.patches)
									? patchObj.patches[0].value
									: ""
							)
						}
						userId={row.app_owner_id}
						userName={row.app_owner_name}
						userImage={row.app_owner_profile}
						userAccountType={row.app_owner_account_type}
						idFromTable={row._id}
						isAppTable={true}
						ownerNameStyle="truncate_10vw"
						refreshReduxState={() => {
							handleRefresh();
						}}
						v2TableEntity="applications"
						screenTagKey={screenTagKey}
					/>
				),
			},
			it_owner: {
				dataField: "app_technical_owner_name",
				sortKey: "app_technical_owner_name",
				text: "IT Owner",
				formatter: (data, row) =>
					row?.app_technical_owner_id ? (
						<UserInfoTableComponent
							user_account_type={
								row.app_technical_owner_account_type
							}
							user_profile={row.app_technical_owner_profile}
							user_email={row.app_technical_owner_email}
							user_status={row.user_status}
							row={row}
							user_id={row.app_technical_owner_id}
							user_name={row.app_technical_owner_name}
						/>
					) : (
						<>-</>
					),
			},
			financial_owner: {
				dataField: "app_financial_owner_name",
				sortKey: "app_financial_owner_name",
				text: "Finance Owner",
				formatter: (data, row) =>
					row?.app_financial_owner_id ? (
						<UserInfoTableComponent
							user_account_type={
								row.app_financial_owner_account_type
							}
							user_profile={row.app_financial_owner_profile}
							user_email={row.app_financial_owner_email}
							row={row}
							user_id={row.app_financial_owner_id}
							user_name={row.app_financial_owner_name}
						/>
					) : (
						<>-</>
					),
			},
			app_type: {
				dataField: "app_type",
				sortKey: "app_type",
				text: "Type",
				formatter: (row, data) => (
					<span style={{ textTransform: "capitalize" }}>
						{data.app_type}
					</span>
				),
			},
			app_user_count: {
				dataField: "app_user_count",
				sortKey: "app_user_count",
				text: "Users",
				formatter: (row, data) => <div>{data.app_user_count || 0}</div>,
			},
			app_archive: {
				dataField: "",
				sortKey: "",
				text: "",
			},
			app_spend: {
				dataField: "app_spend",
				sortKey: "app_spend",
				text: "Spend [YTD]",
				headerFormatter: (row, data) => (
					<HeaderFormatter
						text={"Spend [YTD]"}
						type={spendCostTrendType.SPEND}
					/>
				),
				formatter: (row, data) => (
					<SpendCostTrend
						trendAPI={getApplicationSpendTrend}
						type={spendCostTrendType.SPEND}
						id={data?._id}
						value={data?.app_spend}
					/>
				),
			},
			app_cost: {
				dataField: "app_cost",
				sortKey: "app_cost",
				text: "Cost [YTD]",
				headerFormatter: (row, data) => (
					<HeaderFormatter
						text={"Cost [YTD]"}
						type={spendCostTrendType.COST}
					/>
				),
				formatter: (row, data) => (
					<SpendCostTrend
						trendAPI={getApplicationCostTrend}
						type={spendCostTrendType.COST}
						id={data?._id}
						value={data?.app_cost}
					/>
				),
			},
			app_usage: {
				dataField: "app_usage",
				sortKey: "app_usage",
				text: "Usage",
				formatter: (row, data) => (
					<DottedProgress value={data.app_usage || 0} />
				),
			},
			category: {
				dataField: "app_sub_categories",
				sortKey: "app_sub_categories",
				text: "Category",
				formatter: (row, data) => (
					<>
						<CategoryFormatter
							data={data}
							handleRefresh={handleRefresh}
						/>
					</>
				),
			},
			app_status: {
				dataField: "app_status",
				sortKey: "app_status",
				text: "Status",
				displayName: "c",
				formatter: (cell, row) => (
					<ChangeStatus
						disableEdit={true}
						status={
							row.app_archive || row.archive
								? "archived"
								: row.app_status
						}
					/>
				),
			},
			app_department_count: {
				dataField: "app_department_count",
				sortKey: "app_department_count",
				text: "Department Count",
				formatter: (row, data) => (
					<div>{data.app_department_count || 0}</div>
				),
			},
			app_vendors_count: {
				dataField: "app_vendors_count",
				sortKey: "app_vendors_count",
				text: "Vendor Count",
				formatter: (row, data) => (
					<div>{data.app_vendors_count || 0}</div>
				),
			},
			app_contracts_count: {
				dataField: "app_contracts_count",
				sortKey: "app_contracts_count",
				text: "Contracts Count",
				formatter: (row, data) => (
					<div>{data.app_contracts_count || 0}</div>
				),
			},
			active_app_user_count: {
				dataField: "active_app_user_count",
				sortKey: "active_app_user_count",
				text: "Active User Count",
				formatter: (row, data) => (
					<div>{data.active_app_user_count || 0}</div>
				),
			},
			inactive_app_user_count: {
				dataField: "inactive_app_user_count",
				sortKey: "inactive_app_user_count",
				text: "Inactive User Count",
				formatter: (row, data) => (
					<div>{data.inactive_app_user_count || 0}</div>
				),
			},
			app_avg_spend: {
				dataField: "app_avg_spend",
				sortKey: "app_avg_spend",
				text: "Avg Spend",
				formatter: kFormatter,
			},
			app_max_risk: {
				dataField: "app_max_risk",
				text: "Threat",
				sortKey: "app_max_risk",
				formatter: (row, data) => (
					<SecurityThreatFormatter threat={data.app_max_risk} />
				),
			},
			app_discovered: {
				dataField: "app_discovered",
				sortKey: "app_discovered",
				text: "Discovered At",
				formatter: (row, data) => {
					if (data) {
						return (
							<>
								{data.app_discovered
									? dayjs(data.app_discovered).format(
										"D MMM YYYY"
									)
									: "-"}
							</>
						);
					}
				},
			},
			app_last_used: {
				dataField: "app_last_used",
				text: "Last Used",
				sortKey: "app_last_used",
				formatter: (row, data) => (
					<div>
						{data.app_last_used
							? `${timeSince(data.app_last_used)} ago`
							: "-"}
					</div>
				),
			},
			app_next_renewal_date: {
				dataField: "app_next_renewal_date",
				sortKey: "app_next_renewal_date",
				text: "Next Renewal Date",
				formatter: (row, data) => {
					if (data) {
						return (
							<>
								{data.app_next_renewal_date
									? dayjs(data.app_next_renewal_date).format(
										"D MMM YYYY"
									)
									: "-"}
							</>
						);
					}
				},
			},
			app_risk_level: {
				dataField: "app_risk_level",
				text: "Risk Level",
				sortKey: "app_risk_level",
				formatter: (data, row) => (
					<div className="flex flex-row align-items-center">
						<Rating
							rating={Math.ceil(data)}
							iconType="risk"
							singleIcon={true}
							width={12}
							height={12}
						/>
						<div
							className="font-13 pl-1"
							style={{ paddingTop: "1px" }}
						>
							{`Level ${data || 0}`}
						</div>
					</div>
				),
			},
			app_source: {
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
							isApp={true}
						/>
					</div>
				),
			},
			app_tags: {
				dataField: "app_tags",
				text: "Tags",
				formatter: (cell, row) => (
					<AppTagsComponent
						isBulkEdit={false}
						onAppChange={handleRefresh}
						metaData={metaData}
						app={row}
						isTable={true}
					></AppTagsComponent>
				),
			},
			app_external_user_count: {
				dataField: "app_external_user_count",
				text: "External User Count",
			},
			app_internal_user_count: {
				dataField: "app_internal_user_count",
				text: "Internal User Count",
			},
			app_user_with_license_count: {
				dataField: "app_user_with_license_count",
				text: "Users with licenses",
			},
			app_user_without_license_count: {
				dataField: "app_user_without_license_count",
				text: "Users without licenses",
			},
			app_active_contracts: {
				dataField: "app_active_contracts",
				text: "Contracts/ Subscriptions",
				formatter: (row, data) => (
					<>
						<ContractInfo
							data={data}
							handleRefresh={handleRefresh}
						/>
					</>
				),
			},
			app_active_licenses_count: {
				dataField: "app_active_licenses_count",
				text: "Licenses Count",
				sortKey: "app_active_licenses_count",
				formatter: (row, data) => (
					<div>{data.app_active_licenses_count || 0}</div>
				),
			},
			app_active_licenses: {
				dataField: "app_active_licenses",
				text: "Licenses",
				sortKey: "name",
				formatter: (row, data) => (
					<div className="d-flex flex-row align-items-center">
						<InlineLicenceAssg
							isNotActive={data.user_app_status !== "active"}
							licences={data?.app_active_licenses}
							appId={data?.app_id}
							appName={data?.app_name}
							appLogo={data?.app_logo}
							users={[
								{
									user_image: data.user_profile,
									user_name: data.user_name,
									user_id: data.user_id,
									user_app_role: data.user_app_role,
									user_licenses: data?.contracts,
								},
							]}
							userId={data.user_id}
							refresh={handleRefresh}
							isTableCell={true}
							showDateInfo={false}
							addLicenses={false}
							showSwitchButtonToEdit={false}
						/>
					</div>
				),
			},
			app_user_without_license_count: {
				dataField: "app_user_without_license_count",
				text: "Users without licenses",
			},
			app_department_array: {
				dataField: "app_department_array",
				text: "Departments",
				formatter: (cell) => (
					<PillsRenderer
						data={
							Array.isArray(cell)
								? cell
									.filter((dept) => !!dept.dept_name)
									.map((dept) => dept.dept_name || "")
								: []
						}
						emptyState="-"
					/>
				),
			},
			app_payment_method: {
				dataField: "app_payment_method",
				text: "Payment Methods",
				formatter: (cell) =>
					Array.isArray(cell) && cell.filter((n) => n).length > 0 ? (
						<AppPaymentMethodsCell
							paymentMethods={cell.filter((n) => n)}
						/>
					) : (
						"-"
					),
			},
			...(org_beta_features?.includes("optimization")
				? getOptimizationTableColumnGroups("applications")
				: {}),
		};
		if (screenTagKey === "needs_review") {
			columnsMapper.whats_next = {
				dataField: "app_user_count",
				text: "Whats Next",
				formatter: (row, data) => (
					<div>
						<WhatsNextContainer
							data={data}
							setFullRowArray={setFullRowArray}
							fullRowArray={fullRowArray}
							setFullRowMessage={setFullRowMessage}
							fullRowMessage={fullRowMessage}
							// metaData={metaData} TODO: Pass metaData as props (check if its being used)
							fetchAppCount={fetchAppCount}
						/>
					</div>
				),
				skipCellFormat: true,
			};
		} else if (screenTagKey === "restricted") {
			columnsMapper.notifications = {
				dataField: "app_notification",
				text: "Notifications",
				formatter: (data, row) => (
					<AppNotificationCell
						data={data}
						row={row}
						refresh={handleRefresh}
					/>
				),
			};
		}

		return columnsMapper;
	};
	const clickedOnUndo = (ids) => {
		setAppsBulkAuth("needs review", ids).then((res) => {
			if (res.status === "success") {
				let tempArray = [...fullRowArray];
				ids.forEach((el) => {
					let index = tempArray.findIndex((row) => row === el);
					tempArray.splice([index], 1);
				});
				setFullRowArray(tempArray);
				fetchAppCount();
			}
		});
	};

	const fullRowMapper = [
		{
			dataField: "name",
			text: "Applications",
			sortKey: "app_name",
			displayName: "a",
			formatter: (data) => {
				return (
					<AppTableComponent
						app_name={data?.app_name}
						app_logo={data?.app_logo}
						app_auth_status={data?.app_state}
						app_id={data?._id}
						logo_height="auto"
						logo_width="28px"
					/>
				);
			},
		},
		{
			dataField: "aa",
			fullRow: true,
			formatter: (row) => {
				let tempObject = fullRowMessage.find(
					(el) => el.id === row.app_id
				);
				return (
					<div className="d-flex align-items-center">
						<div className="grey-1 font-13">
							{`${row.app_name} ${tempObject?.message}`}
						</div>
						<div
							className="primary-color font-13 cursor-pointer ml-2"
							onClick={() =>
								clickedOnUndo([row.app_id], tempObject.type)
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
		v2TableEntity: "applications",
		v2SearchFieldId: "app_name",
		v2SearchFieldName: "Application Name",
		getAPI: getAllApplications,
		searchAPI: searchAllAppsV2,
		propertyListAPI: getAppPropertiesList,
		keyField: "_id",
		chipText: "Applications",
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
		) => (
			<AppBulkEdit
				{...{
					checked,
					setChecked,
					dispatch,
					screenTagKey,
					handleRefresh,
					clickedOnQuickReview,
					setClickedOnQuickReview,
					fullRowArray,
					setFullRowArray,
					fullRowMessage,
					setFullRowMessage,
					fetchAppCount,
					checkAll,
					setCheckAll,
					checkAllExceptionData,
					setCheckAllExceptionData,
					metaData,
				}}
			/>
		),
		fullRowArray: fullRowArray,
		fullRowMapper: fullRowMapper,
		key: screenTagKey,
		onAddClick: () => setShowAddApps(true),
		exportComponent: AppExport,
		archiveFilterId: "app_archive",
		sourceListAPI: searchAppSource,
		bulkUpdateViaCSVComponent: AppBulkUpdateViaCSV,
		pageLayoutPresent: true,
		rowFormatRequired: (data) => data?.app_archive,
		rowFormatClassName: "o-6",
		user_search: false,
		active_view: activeView,
		set_all_present: true,
		app_search: true,
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

			{showAddApps && (
				<AddAppModal
					show={showAddApps}
					onHide={() => setShowAddApps(false)}
					redirect={true}
				/>
			)}
		</>
	);
}
