import React from "react";
import moment from "moment";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { timeSince } from "../../../../utils/DateUtility";
import { kFormatter } from "../../../../constants/currency";
import AppTableComponent from "../../../../common/AppTableComponent";
import { LicenseEndDateTooltip } from "../../../../components/Applications/Licenses/LicenseEndDateTooltip";
import LicenseTableCell from "./LicenseTableCell";
import { LicenseUtilization } from "../../../../components/Applications/Licenses/LicenseUtilization";
import InfiniteTableContainer from "../../../v2InfiniteTable/InfiniteTableContainer";
import {
	getAllLicensesPropertiesList,
	getAllLicensesV2,
} from "../../../../services/api/licenses";
import { searchLicensesV2 } from "../../../../services/api/search";
import { LicenseBulkEditComponents } from "../LicenseBulkEdit/LicenseBulkEdit";
import {
	getAssignedCountHyperlink,
	getLicenseTermText,
	HeaderFormatter,
} from "modules/licenses/utils/LicensesUtils";
import { Link, useHistory } from "react-router-dom";
import { AllLicensesExport } from "./AllLicensesExport";
import { useSelector } from "react-redux";
import CostPerLicenseCell from "./CostPerLicenseCell";
import { optimizationDefaultFilter } from "modules/Optimization/constants/OptimizationConstants";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

export default function AllLicensesTable({ fetchLicenseTabCount }) {
	const history = useHistory();
	const { org_beta_features } = useSelector((state) => state.userInfo);
	const getColumnsMapper = (handleRefresh) => {
		const columnsMapper = {
			license: {
				dataField: "license_name",
				text: "LICENSE",
				sortKey: "license_name",
				formatter: (data, row) => <LicenseTableCell license={row} />,
				headerStyle: {
					fontWeight: "normal",
				},
			},
			application: {
				dataField: "app_name",
				text: "APPLICATION",
				sortKey: "app_name",
				formatter: (row, data) => {
					return (
						<AppTableComponent
							app_name={data?.app_name}
							app_logo={data?.app_logo}
							app_auth_status={data?.app_state}
							app_id={data?.app_id}
							logo_height="auto"
							logo_width="28px"
						/>
					);
				},
			},
			type: {
				dataField: "type",
				text: "TYPE",
				sortKey: "type",
				formatter: (row, data) =>
					row === "user" ? "Seat Based" : "Usage Based",
			},
			quantity: {
				text: "QUANTITY",
				dataField: "quantity",
				sortKey: "quantity",
				formatter: (row, data) => (
					<div className="d-flex flex-column justify-content-center">
						{row}
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			assigned_count: {
				text: "ASSIGNED QUANTITY",
				dataField: "assigned_count",
				sortKey: "assigned_count",
				formatter: (row, data) => (
					<div className="d-flex flex-column justify-content-center">
						{data?.type === "user" ? (
							<>
								{data?.app_id ? (
									<Link
										to={getAssignedCountHyperlink(
											data?.license_id,
											data?.app_id
										)}
										className="custom__app__name__css text-decoration-none"
									>
										<div className="d-flex flex-column mt-1">
											<div>{row}</div>
											{row > data?.quantity && (
												<div className="font-11">
													{`${
														row - data?.quantity
													} extra licenses mapped`}
												</div>
											)}
										</div>
									</Link>
								) : (
									<div className="d-flex flex-column mt-1">
										<div>
											{row > data?.quantity
												? data?.quantity
												: row}
										</div>
										{row > data?.quantity && (
											<div className="font-11">
												{`${
													row - data?.quantity
												} extra licenses mapped`}
											</div>
										)}
									</div>
								)}
							</>
						) : (
							"-"
						)}
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			unassigned_count: {
				text: "UNASSIGNED QUANTITY",
				dataField: "assigned_count",
				formatter: (row, data) => (
					<div className="d-flex flex-column justify-content-center">
						{data?.type === "user" ? (
							<>
								{data?.app_id ? (
									<Link
										to={
											data?.contract_id
												? `/licenses/mapping/${data?.contract_id}`
												: `/applications/${data?.app_id}#users`
										}
										className="custom__app__name__css text-decoration-none"
									>
										<div className="d-flex flex-column mt-1">
											{row > data?.quantity
												? 0
												: data?.quantity - row}
										</div>
									</Link>
								) : (
									<div className="d-flex flex-column mt-1">
										{row > data?.quantity
											? 0
											: data?.quantity - row}
									</div>
								)}
							</>
						) : (
							"-"
						)}
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			utilized_value: {
				text: "UTILIZED VALUE",
				dataField: "assigned_count",
				formatter: (row, data) => (
					<div className="d-flex flex-column justify-content-center">
						{data?.type === "user" ? (
							<div className="d-flex flex-column mt-1">
								<div>
									{kFormatter(
										row *
											data?.cost_per_license
												?.amount_org_currency
									)}
								</div>
								<div className="d-flex">
									<div className="grey-1 font-10 d-flex align-items-center">
										{`${getLicenseTermText(
											data,
											data?.cost_per_license,
											true,
											false
										)}`}
									</div>
								</div>
							</div>
						) : (
							"-"
						)}
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			unutilized_value: {
				text: "UNUTILIZED VALUE",
				dataField: "assigned_count",
				formatter: (row, data) => (
					<div className="d-flex flex-column justify-content-center">
						{data?.type === "user" ? (
							<div className="d-flex flex-column mt-1">
								<div>
									{row > data?.quantity
										? kFormatter(0)
										: kFormatter(
												(data?.quantity - row) *
													data?.cost_per_license
														?.amount_org_currency
										  )}
								</div>
								<div className="d-flex">
									<div className="grey-1 font-10 d-flex align-items-center">
										{`${getLicenseTermText(
											data,
											data?.cost_per_license,
											true,
											false
										)}`}
									</div>
								</div>
							</div>
						) : (
							"-"
						)}
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			end_date: {
				text: "END DATE",
				dataField: "end_date",
				sortKey: "end_date",
				formatter: (data, row) => (
					<div className="d-flex flex-column justify-content-center">
						<div>{moment(data).format("DD MMM YYYY")}</div>
						<div className="d-flex align-items-center grey-1 pt-1">
							<OverlayTrigger
								placement="bottom"
								overlay={
									<Tooltip bsPrefix="license-end-date-tooltip">
										<LicenseEndDateTooltip
											start={row.start_date}
											end={data}
										/>
									</Tooltip>
								}
							>
								<div className="cursor-default">
									{timeSince(data, row.start_date) + " term"}
								</div>
							</OverlayTrigger>
						</div>
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			cost_per_license: {
				text: "COST/LIC",
				dataField: "cost_per_license",
				sortKey: "cost_per_license",
				headerFormatter: (row, data) => (
					<HeaderFormatter
						text={"COST/LIC"}
						tooltipContent={"Cost of a single license for the term"}
					></HeaderFormatter>
				),
				formatter: (data, row) => (
					<CostPerLicenseCell
						license={row}
						cost_per_license={data}
						handleRefresh={handleRefresh}
					/>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			cost_per_term: {
				text: "TOTAL COST",
				dataField: "cost_per_term",
				sortKey: "cost_per_term",
				formatter: (data, row) => (
					<div className="d-flex flex-column justify-content-center">
						{kFormatter(data)}
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			org_integration: {
				text: "SOURCE",
				dataField: "org_integration_name",
				sortKey: "org_integration_name",
				formatter: (data, row) =>
					row?.org_integration_id ? (
						<div
							className="d-flex align-items-center"
							style={{ gap: "4px" }}
						>
							<GetImageOrNameBadge
								url={row?.integration_logo}
								name={data}
								height={28}
								width={28}
							/>
							<Link
								to={`/integrations/${row?.integration_id}/instance#instances`}
								className="custom__app__name__css text-decoration-none"
							>
								<LongTextTooltip text={data} maxWidth={200} />
							</Link>
						</div>
					) : (
						"-"
					),
				headerStyle: {
					fontWeight: "normal",
				},
			},
		};
		if (org_beta_features?.includes("optimization")) {
			columnsMapper.utilization = {
				text: "UTILIZATION",
				dataField: "license_utilization",
				formatter: (data, row) =>
					row?.type === "user" ? (
						<LicenseUtilization
							utilization={
								data?.[optimizationDefaultFilter] || {}
							}
							totalLicenses={row.quantity || 0}
							appId={row?.app_id}
							licenseId={row?.license_id}
						/>
					) : (
						<div
							style={{
								width: "230px",
								whiteSpace: "break-spaces",
								height: "auto",
							}}
						>
							{`N/A (usage based license)`}
						</div>
					),
				headerStyle: {
					fontWeight: "normal",
				},
			};
		}
		return columnsMapper;
	};

	return (
		<InfiniteTableContainer
			columnsMapper={getColumnsMapper}
			v2TableEntity="licenses"
			v2SearchFieldId="license_name"
			v2SearchFieldName="License Name"
			getAPI={getAllLicensesV2}
			searchAPI={searchLicensesV2}
			propertyListAPI={getAllLicensesPropertiesList}
			keyField="license_id"
			chipText="Licenses"
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
				LicenseBulkEditComponents(
					checked,
					setChecked,
					dispatch,
					handleRefresh,
					"licenses",
					fetchLicenseTabCount
				)
			}
			exportComponent={AllLicensesExport}
		/>
	);
}
