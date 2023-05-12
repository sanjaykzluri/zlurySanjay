import React, { useRef, useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EmptySearch } from "../../../common/EmptySearch";
import { Empty } from "../../../modules/security/components/Empty/Empty";
import moment from "moment";
import { kFormatter } from "../../../constants/currency";
import { timeSince } from "../../../utils/DateUtility";
import { Link, useHistory } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./ApplicationLicenses.css";
import {
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../common/infiniteTableUtil";
import { ACTION_TYPE } from "../../Users/Applications/Modals/FiltersRenderer/redux";
import { push } from "connected-react-router";
import { debounce, isEmpty } from "../../../utils/common";
import { getApplicationLicensesV2 } from "../../../services/api/applications";
import { defaults } from "../../../constants";
import { checkSpecialCharacters } from "../../../services/api/search";
import { client } from "../../../utils/client";
import { TriggerIssue } from "../../../utils/sentry";
import { ApplicationLicensesFilter } from "./ApplicationLicensesFilter";
import { ErrorComponent } from "../../../common/ErrorComponnet";
import OldInfiniteTable from "../../../common/oldInfiniteTable";
import LicenseTableCell from "../../../modules/licenses/components/AllLicensesTable/LicenseTableCell";
import { LicenseUtilization } from "./LicenseUtilization";
import { LicenseEndDateTooltip } from "./LicenseEndDateTooltip";
import {
	getAssignedCountHyperlink,
	getLicenseTermText,
	HeaderFormatter,
} from "modules/licenses/utils/LicensesUtils";
import RoleContext from "services/roleContext/roleContext";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";
import { userRoles } from "constants/userRole";
import CostPerLicenseCell from "modules/licenses/components/AllLicensesTable/CostPerLicenseCell";
import { optimizationDefaultFilter } from "modules/Optimization/constants/OptimizationConstants";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

export default function ApplicationLicenses(props) {
	const { application } = props;
	const history = useHistory();
	const { userRole } = useContext(RoleContext);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const { org_beta_features } = useSelector((state) => state.userInfo);

	const id = window.location.pathname.split("/")[2];
	const cancelToken = useRef();
	const [checked, setChecked] = useState([]);
	const [data, setData] = useState([]);
	const [metaData, setMetaData] = useState();
	const [searchQuery, setSearchQuery] = useState();
	const [hasMoreData, setHasMoreData] = useState(true);
	const [refreshTable, setRefreshTable] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [shouldConcat, setShouldConcat] = useState(false);

	const dispatch = useDispatch();
	const query = useSelector((state) => state.router.location.query);
	const router = useSelector((state) => state.router);
	const { hash } = router.location;
	const [showErrorModal, setShowErrorModal] = useState(false);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(query, reqBody);
			} catch {
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
			}
			setReqBody({ ...reqObj });
		} else if (!query.metaData) {
			dispatch({ type: ACTION_TYPE.RESET_FILTERS });
			setReqBody({ ...defaultReqBody });
		}
		handleRefresh();
	}, [query]);

	useEffect(() => {
		let reqObj = { ...reqBody };
		if (query.metaData) {
			try {
				reqObj = filtersRequestBodyGenerator(query, reqBody);
			} catch {
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
			}
		}
		!isLoadingData && loadData(reqObj);
	}, [pageNo, refreshTable]);

	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
			setIsLoadingData(false);
		}
		if (searchQuery) {
			fetchDataFn();
			reqBody.filter_by = [];
			query.metaData &&
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
		} else if (searchQuery === "") {
			reqBody.filter_by = [];
			handleRefresh();
			setReqBody(reqBody);
			reqBody.filter_by = [];
			query.metaData &&
				dispatch(push(`?metaData=${JSON.stringify(reqBody)}${hash}`));
		}
	}, [searchQuery]);

	function handleLoadMore() {
		setShouldConcat(true);
		if (isLoadingData) return;
		setShouldConcat(true);
		setPageNo((pageNo) => {
			return pageNo + 1;
		});
	}

	function handleRefresh() {
		setData([]);
		setPageNo(0);
		setMetaData();
		setRefreshTable(!refreshTable);
		setHasMoreData(true);
		setShowErrorModal(false);
	}

	async function loadData(reqBody) {
		if (isEmpty(reqBody.filter_by) && searchQuery) {
			const searchObj = getSearchReqObj(
				searchQuery,
				"license_name",
				"License Name"
			);
			reqBody.filter_by = [searchObj];
		}

		setIsLoadingData(true);
		try {
			const response = await getApplicationLicensesV2(
				id,
				reqBody,
				pageNo,
				30
			);
			const totalLoadedRecords = data.length + response.data.length;
			if (totalLoadedRecords === response.meta.total) {
				setHasMoreData(false);
			} else {
				!hasMoreData && setHasMoreData(true);
			}
			let newData = shouldConcat
				? [...data, ...response.data]
				: response.data;
			setIsLoadingData(false);
			setData(newData);
			setMetaData(response.meta);
		} catch (error) {
			setIsLoadingData(false);
			setHasMoreData(false);
			setMetaData(reqBody);
			setShowErrorModal(true);
		}
	}
	const fetchDataFn = () => {
		setData([]);
		setMetaData();
		if (checkSpecialCharacters(searchQuery, true)) {
			setHasMoreData(false);
		} else {
			setIsLoadingData(true);
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"license_name",
				"License Name"
			);
			reqBody.filter_by = [searchObj];
			getApplicationLicensesV2(
				id,
				reqBody,
				pageNo,
				30,
				cancelToken.current
			)
				.then((response) => {
					if (response.data.length < defaults.MINIMUM_ROW) {
						setHasMoreData(false);
					}
					setReqBody(reqBody);
					setData(response.data);
					setMetaData(response.meta);
					setIsLoadingData(false);
					window.analytics.track(
						"Search Contracts Results Displayed",
						{
							searchQuery: searchQuery,
							currentCategory: "Contracts",
							currentPageName: "Contracts",
							orgId: orgId || "",
							orgName: orgName || "",
						}
					);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue(
							"Error in searching license contracts",
							error
						);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

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
						<Link
							to={getAssignedCountHyperlink(data?.license_id, id)}
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
						<Link
							to={
								data?.contract_id
									? `/licenses/mapping/${data?.contract_id}`
									: `/applications/${id}#users`
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
				/>
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
						utilization={data?.[optimizationDefaultFilter] || {}}
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

	return (
		<>
			{userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView height="700px" />
			) : (
				<div className="d-flex flex-column">
					<ApplicationLicensesFilter
						checked={checked}
						setChecked={setChecked}
						searchQuery={searchQuery}
						setSearchQuery={debounce(setSearchQuery, 200)}
						metaData={metaData}
						columnsMapper={columnsMapper}
						usedColumns={metaData?.columns}
						handleRefresh={handleRefresh}
						isLoadingData={isLoadingData}
					/>
					<OldInfiniteTable
						checked={checked}
						setChecked={setChecked}
						data={data}
						metaData={metaData}
						handleLoadMore={handleLoadMore}
						columnsMapper={columnsMapper}
						keyField="license_id"
						handleRefresh={handleRefresh}
						v2TableEntity="contracts"
						emptyState={
							searchQuery ? (
								<EmptySearch searchQuery={searchQuery} />
							) : showErrorModal ? (
								<ErrorComponent />
							) : (
								<Empty />
							)
						}
						searchQuery={searchQuery}
						isLoadingData={isLoadingData}
						hasMoreData={hasMoreData}
						allowFewSpecialCharacters={true}
						disableCheckbox={true}
					/>
				</div>
			)}
		</>
	);
}
