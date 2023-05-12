import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { searchSubscriptionV2 } from "../../../../services/api/search";
import listbullet from "../../../../assets/licenses/listbullet.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { kFormatter } from "../../../../constants/currency";
import AppTableComponent from "../../../../common/AppTableComponent";
import {
	bulkUpdatePaymentMethods,
	getAllSubsPropertiesList,
	getAllSubsV2,
} from "../../../../services/api/licenses";
import { Link } from "react-router-dom";
import "./AllSubsTable.css";
import { LicenseUtilization } from "../../../../components/Applications/Licenses/LicenseUtilization";
import BulkChangePaymentMethod from "../BulkChangePaymentMethod/BulkChangePaymentMethod";
import InfiniteTableContainer from "../../../v2InfiniteTable/InfiniteTableContainer";
import { ContractBulkEditComponents } from "../ContractBulkEdit/ContractBulkEditComponents";
import { clearAllV2DataCache } from "../../../v2InfiniteTable/redux/v2infinite-action";
import StatusPillAndDropdown from "../StatusPillAndDropdown/StatusPillAndDropdown";
import { UTCDateFormatter } from "utils/DateUtility";
import { AllSubsExport } from "./AllSubsExport";
import { trackActionSegment } from "modules/shared/utils/segment";
import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";

export function LicenseTypesFormatter({ types, licenses }) {
	const renderTooltip = () => {
		return (
			<>
				<div className="license-types-tooltip-content">
					<div className="d-flex flex-column w-100">
						<div className="d-flex flex-row w-100">
							<div
								className="font-8 grey-1"
								style={{ width: "60%" }}
							>
								License
							</div>
							<div
								className="d-flex justify-content-end font-8 grey-1 "
								style={{ width: "40%" }}
							>
								Qty
							</div>
						</div>
						<hr style={{ margin: "6px 0px 0px" }}></hr>
						{Array.isArray(licenses) &&
							licenses.map((el, row) => (
								<div
									className="d-flex flex-row"
									style={{ marginTop: "12px" }}
								>
									<div
										className="d-flex align-items-center"
										style={{ width: "60%" }}
									>
										<div
											style={{
												borderRadius: "50%",
												backgroundColor: "#717171",
												height: "6px",
												width: "6px",
											}}
										></div>
										<div className="font-11 grey ml-2 truncate-license-name-in-tooltip">
											{el.name}
										</div>
									</div>
									<div
										className="bold-600 font-11 grey d-flex justify-content-end"
										style={{ width: "40%" }}
									>
										{el.quantity}
									</div>
								</div>
							))}
					</div>
				</div>
			</>
		);
	};
	return (
		<>
			<div className="d-flex align-items-center">
				<div>{types}</div>
				{!isNaN(types) && types > 0 && (
					<OverlayTrigger
						placement="bottom"
						overlay={
							<Tooltip bsPrefix="license-types-tooltip">
								{renderTooltip()}
							</Tooltip>
						}
					>
						<img className="ml-2 " src={listbullet}></img>
					</OverlayTrigger>
				)}
			</div>
		</>
	);
}
export default function AllSubsTable({ fetchLicenseTabCount }) {
	const history = useHistory();
	const dispatch = useDispatch();

	const getColumnsMapper = (handleRefresh) => {
		const columnsMapper = {
			contract: {
				dataField: "contract_name",
				text: "NAME",
				sortKey: "contract_name",
				formatter: (data, row) => (
					<div className="flex flex-row align-items-center">
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{row?.contract_name}</Tooltip>}
						>
							<Link
								to={`/licenses/subscriptions/${row?.contract_id}#overview`}
								className="table-link truncate_10vw"
							>
								{row?.contract_name}
							</Link>
						</OverlayTrigger>
						<StatusPillAndDropdown status={row?.contract_status} />
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			application: {
				dataField: "app_name",
				text: "APPLICATION",
				sortKey: "app_name",
				formatter: (row, data, rowindex) => (
					<AppTableComponent
						app_name={data?.app_name}
						app_logo={data?.app_logo}
						app_auth_status={data?.app_state}
						app_id={data?.app_id}
						logo_height="auto"
						logo_width={28}
					/>
				),
			},
			purchased_licenses: {
				text: "TOTAL LICENSES",
				dataField: "purchased_licenses",
				sortKey: "purchased_licenses",
				formatter: (data, row) => <div>{data || 0}</div>,
				headerStyle: {
					fontWeight: "normal",
				},
			},
			license_types: {
				text: "LICENSE TYPES",
				dataField: "license_types",
				sortKey: "license_types",
				formatter: (data, row) => (
					<LicenseTypesFormatter
						types={data}
						licenses={row.licenses}
					/>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			app_next_renewal_date: {
				text: "NEXT PAYMENT",
				dataField: "app_next_renewal_date",
				sortKey: "app_next_renewal_date",
				formatter: (data, row) => (
					<div className="d-flex flex-column justify-content-center">
						<div>
							{data ? UTCDateFormatter(data) : "Data Unavailable"}
						</div>
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			cost: {
				text: "TOTAL COST",
				dataField: "cost_per_term",
				sortKey: "cost_per_term",
				headerFormatter: (row, data) => (
					<HeaderFormatter
						text={"TOTAL COST"}
						tooltipContent={"Cost of a subscription for the term"}
					/>
				),
				formatter: (data, row) => (
					<div className="d-flex flex-column justify-content-center">
						{kFormatter(data)}
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			documents_count: {
				dataField: "documents_count",
				text: "NO. OF DOCUMENTS",
				sortKey: "documents_count",
			},
			payment_method: {
				dataField: "payment_method_name",
				text: "PAYMENT METHOD",
				sortKey: "payment_method_name",
				formatter: (row, data) => (
					<div className="flex flex-row center">
						<BulkChangePaymentMethod
							entity_ids={[data?.contract_id]}
							api_call={bulkUpdatePaymentMethods}
							refresh={handleRefresh}
							is_success={(res) =>
								res.result && res.result.status === "success"
							}
							is_table_cell={true}
							popover_class="table-cell-change-payment-method"
							payment_method={{
								payment_method_id: data?.payment_method_id,
								payment_method_name: data?.payment_method_name,
								payment_method_type: data?.payment_method_type,
								payment_method_details_type:
									data?.payment_method_details_type,
								payment_method_logo_url:
									data?.payment_method_logo_url ||
									data?.payment_method_logo,
							}}
						/>
					</div>
				),
			},
		};
		return columnsMapper;
	};

	return (
		<InfiniteTableContainer
			columnsMapper={getColumnsMapper}
			v2TableEntity="subscriptions"
			v2SearchFieldId="contract_name"
			v2SearchFieldName="Subscription Name"
			getAPI={getAllSubsV2}
			searchAPI={searchSubscriptionV2}
			propertyListAPI={getAllSubsPropertiesList}
			keyField="contract_id"
			chipText="Subscriptions"
			hasBulkEdit={true}
			singleKeywordSearch={true}
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
				setSelectedData
			) =>
				ContractBulkEditComponents(
					checked,
					setChecked,
					dispatch,
					handleRefresh,
					"subscriptions",
					fetchLicenseTabCount
				)
			}
			onAddClick={() => {
				trackActionSegment("Clicked on Add new Subscription");
				history.push("/subscription/new");
			}}
			exportComponent={AllSubsExport}
		/>
	);
}
