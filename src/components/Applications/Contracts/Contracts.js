import React from "react";
import { useDispatch } from "react-redux";
import { searchContractsV2 } from "../../../services/api/search";
import { unescape } from "../../../utils/common";
import dayjs from "dayjs";
import { DayProgressBar } from "../AllApps/Contracts/ContractsTable";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { NameBadge } from "../../../common/NameBadge";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import check from "../../../assets/applications/check.svg";
import { kFormatter } from "../../../constants/currency";
import AppTableComponent from "../../../common/AppTableComponent";
import UserInfoTableComponent from "../../../common/UserInfoTableComponent";
import moment from "moment";
import infinite from "../../../assets/infinite.svg";
import {
	bulkUpdatePaymentMethods,
	getAllContractsPropertiesList,
	getAllContractsV2,
} from "../../../services/api/licenses";
import { LicenseTypesFormatter } from "../../../modules/licenses/components/AllSubsTable/AllSubsTable";
import { getDateDiff, UTCDateFormatter } from "../../../utils/DateUtility";
import BulkChangePaymentMethod from "../../../modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import { clearAllV2DataCache } from "../../../modules/v2InfiniteTable/redux/v2infinite-action";
import InfiniteTableContainer from "../../../modules/v2InfiniteTable/InfiniteTableContainer";
import "./Contracts.css";
import { ContractBulkEditComponents } from "../../../modules/licenses/components/ContractBulkEdit/ContractBulkEditComponents";
import { Dots } from "common/DottedProgress/DottedProgress";
import { AllContractsExport } from "modules/licenses/components/AllContractsTable/AllContractsExport";
import { trackActionSegment } from "modules/shared/utils/segment";
import { contractAgreementTypes } from "modules/licenses/constants/LicenseConstants";

export function Contracts({ fetchLicenseTabCount }) {
	const history = useHistory();
	const dispatch = useDispatch();

	const getColumnsMapper = (handleRefresh) => {
		const columnsMapper = {
			contract: {
				dataField: "contract_name",
				text: "CONTRACT",
				sortKey: "contract_name",
				formatter: (row, data) => (
					<div className="flex flex-row align-items-center">
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{row}</Tooltip>}
						>
							<Link
								to={`/licenses/contracts/${data.contract_id}#overview`}
								className="table-link truncate_10vw"
							>
								{row}
							</Link>
						</OverlayTrigger>
					</div>
				),
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
			owner: {
				dataField: "owner_name",
				text: "OWNER",
				sortKey: "owner_name",
				formatter: (data, row, rowindex) => {
					return (
						<UserInfoTableComponent
							user_account_type={row.owner_account_type}
							user_profile={row.owner_profile}
							row={row}
							user_id={row.owner_id}
							user_name={row.owner_name}
						></UserInfoTableComponent>
					);
				},
			},
			vendor: {
				dataField: "vendor",
				text: "VENDOR",
				sortKey: "vendor_name",
				formatter: (row, data) => (
					<div className="flex flex-row align-items-center">
						{data?.vendor_profile ? (
							<img
								src={unescape(data?.vendor_profile)}
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
			},
			total_licenses: {
				text: "TOTAL LICENSES",
				dataField: "purchased_licenses",
				sortKey: "purchased_licenses",
				formatter: (data, row) => <>{data}</>,
			},
			assigned_license_count: {
				text: "ASSIGNED LICENSES",
				dataField: "assigned_license_count",
				sortKey: "assigned_license_count",
				formatter: (data, row) => <>{data}</>,
			},
			contract_auto_renews: {
				text: "AUTO RENEWAL",
				dataField: "contract_auto_renews",
				sortKey: "contract_auto_renews",
				formatter: (data, row) => <>{data ? "ON" : "OFF"}</>,
			},
			contract_agreement_type: {
				text: "AGREEMENT TYPE",
				dataField: "contract_agreement_type",
				sortKey: "contract_agreement_type",
				formatter: (data, row) => (
					<>{data ? contractAgreementTypes?.[data]?.label : "-"}</>
				),
			},
			cost: {
				dataField: "cost_per_term",
				text: "TOTAL COST",
				sortKey: "cost_per_term",
				formatter: (row, data) => (
					<div className="flex flex-row align-items-center">
						{kFormatter(data.cost_per_term)}
					</div>
				),
			},
			status: {
				dataField: "contract_status",
				text: "STATUS",
				sortKey: "contract_status",
				formatter: (data, row) => (
					<div className="flex flex-row center">
						{new Date(row?.contract_end_date) < new Date() ? (
							<div className="d-flex align-items-center">
								<Dots color="#717171" />
								<div className="ml-1">Expired</div>
							</div>
						) : data === "active" ? (
							<div className="d-flex align-items-center">
								<Dots color="#40E395" />
								<div className="ml-1">Active</div>
							</div>
						) : (
							<div className="d-flex align-items-center">
								<Dots color="#717171" />
								<div className="ml-1">Inactive</div>
							</div>
						)}
					</div>
				),
			},
			contract_end_date: {
				dataField: "contract_end_date",
				text: "END DATE",
				sortKey: "contract_end_date",
				formatter: (row, data) => {
					if (data && data.contract_end_date) {
						return (
							<div>
								{moment(data.contract_end_date).year() ===
								2100 ? (
									<img src={infinite} />
								) : (
									UTCDateFormatter(data.contract_end_date)
								)}
								<DayProgressBar
									isTooltipRequired={true}
									start={data.contract_start_date}
									end={data.contract_end_date}
								/>
								<div className="font-8 o-6 mt-1">
									{getDateDiff(
										data?.contract_end_date,
										new Date()
									) === ""
										? "Contract Time Elapsed"
										: `Ends in ${getDateDiff(
												data?.contract_end_date,
												new Date()
										  )}`}
								</div>
							</div>
						);
					}
				},
			},
			contract_cancel_by: {
				dataField: "contract_cancel_by",
				text: "RENEW/CANCEL BY DATE",
				sortKey: "contract_cancel_by",
				formatter: (data, row) => (
					<>{data ? UTCDateFormatter(data) : ""}</>
				),
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
			v2TableEntity="contracts"
			v2SearchFieldId="contract_name"
			v2SearchFieldName="Contract Name"
			getAPI={getAllContractsV2}
			searchAPI={searchContractsV2}
			propertyListAPI={getAllContractsPropertiesList}
			keyField="contract_id"
			chipText="Contracts"
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
					"contracts",
					fetchLicenseTabCount
				)
			}
			onAddClick={() => {
				trackActionSegment("Clicked on Add new Contract", {}, true);
				history.push("/contract/new");
			}}
			exportComponent={AllContractsExport}
		/>
	);
}
