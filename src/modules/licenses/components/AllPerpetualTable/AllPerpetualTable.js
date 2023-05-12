import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { searchPerpetualV2 } from "../../../../services/api/search";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { kFormatter } from "../../../../constants/currency";
import AppTableComponent from "../../../../common/AppTableComponent";
import {
	bulkUpdatePaymentMethods,
	getAllPerpetuals,
	getPerpetualsPropertiesList,
} from "../../../../services/api/licenses";
import { NameBadge } from "../../../../common/NameBadge";
import { Link } from "react-router-dom";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import check from "../../../../assets/applications/check.svg";
import dayjs from "dayjs";
import { LicenseTypesFormatter } from "../AllSubsTable/AllSubsTable";
import BulkChangePaymentMethod from "../BulkChangePaymentMethod/BulkChangePaymentMethod";
import InfiniteTableContainer from "../../../v2InfiniteTable/InfiniteTableContainer";
import { ContractBulkEditComponents } from "../ContractBulkEdit/ContractBulkEditComponents";
import { clearAllV2DataCache } from "../../../v2InfiniteTable/redux/v2infinite-action";
import { UTCDateFormatter } from "utils/DateUtility";
import { AllPerpetualExport } from "./AllPerpetualExport";
import { trackActionSegment } from "modules/shared/utils/segment";

export default function AllPerpetualTable({ fetchLicenseTabCount }) {
	const history = useHistory();
	const dispatch = useDispatch();

	const getColumnsMapper = (handleRefresh) => {
		const columnsMapper = {
			contract: {
				dataField: "contract_name",
				text: "CONTRACT",
				sortKey: "contract_name",
				formatter: (row, data, rowindex) => {
					return (
						<div className="flex flex-row align-items-center">
							<OverlayTrigger
								placement="top"
								overlay={<Tooltip>{row}</Tooltip>}
							>
								<Link
									to={`/licenses/perpetuals/${data.contract_id}#overview`}
									className="table-link truncate_10vw"
								>
									{row}
								</Link>
							</OverlayTrigger>
						</div>
					);
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
			vendor: {
				dataField: "vendor",
				text: "VENDOR",
				sortKey: "vendor_name",
				formatter: (row, data) => (
					<div className="flex flex-row align-items-center">
						{data?.vendor_profile ? (
							<img
								src={data?.vendor_profile}
								width="24"
								className="mr-2"
							/>
						) : (
							<NameBadge
								name={data?.vendor_name}
								width={24}
								className="mr-2"
							/>
						)}
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{data?.vendor_name}</Tooltip>}
						>
							<Link
								to={`/licenses/vendors/${data?.vendor_id}#overview`}
								className="table-link truncate_10vw"
							>
								{data?.vendor_name}
							</Link>
						</OverlayTrigger>
					</div>
				),
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
			cost: {
				dataField: "cost_per_term",
				text: "TOTAL COST",
				sortKey: "cost_per_term",
				formatter: (row, data) => (
					<div className="flex flex-row align-items-center">
						{kFormatter(row)}
					</div>
				),
			},
			status: {
				dataField: "contract_status",
				text: "STATUS",
				sortKey: "contract_status",
				formatter: (data) => (
					<div className="flex flex-row center">
						{data === "active" ? (
							<img src={check} alt="" />
						) : (
							<img src={inactivecheck}></img>
						)}
						{data === "active" ? (
							<div
								className="flex flex-row justify-content-center align-items-center"
								style={{ marginLeft: "8px" }}
							>
								Active
							</div>
						) : (
							<div
								className="flex flex-row justify-content-center align-items-center"
								style={{ marginLeft: "8px" }}
							>
								Inactive
							</div>
						)}
					</div>
				),
			},
			contract_start_date: {
				dataField: "contract_start_date",
				text: "START DATE",
				sortKey: "contract_start_date",
				formatter: (data) => {
					return (
						<div>
							{data ? UTCDateFormatter(data) : "Data Unavailable"}
						</div>
					);
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
			v2TableEntity="perpetuals"
			v2SearchFieldId="contract_name"
			v2SearchFieldName="Perpetual Name"
			getAPI={getAllPerpetuals}
			searchAPI={searchPerpetualV2}
			propertyListAPI={getPerpetualsPropertiesList}
			keyField="contract_id"
			chipText="Perpetuals"
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
					"perpetuals",
					fetchLicenseTabCount
				)
			}
			onAddClick={() => {
				trackActionSegment("Clicked on Add new Perpetual Contract");
				history.push("/perpetual/new");
			}}
			exportComponent={AllPerpetualExport}
		/>
	);
}
