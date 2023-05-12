import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getVendorLicenseContractsV2 } from "../../../../../services/api/applications";
import { ContractsFilter } from "./ContractsFilter";
import OldInfiniteTable from "../../../../../common/oldInfiniteTable";
import { EmptySearch } from "../../../../../common/EmptySearch";
import { EmptyContracts } from "../../../Contracts/EmptyContracts";
import { defaults } from "../../../../../constants";
import { checkSpecialCharacters } from "../../../../../services/api/search";
import { client } from "../../../../../utils/client";
import { TriggerIssue } from "../../../../../utils/sentry";
import { debounce, isEmpty, unescape } from "../../../../../utils/common";
import dayjs from "dayjs";
import { DayProgressBar } from "../../../AllApps/Contracts/ContractsTable";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import inactivecheck from "../../../../../assets/applications/inactivecheck.svg";
import check from "../../../../../assets/applications/check.svg";
import { kFormatter } from "../../../../../constants/currency";
import {
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../../../common/infiniteTableUtil";
import AppTableComponent from "../../../../../common/AppTableComponent";
import UserInfoTableComponent from "../../../../../common/UserInfoTableComponent";
import { push } from "connected-react-router";
import { ACTION_TYPE } from "../../../../Users/Applications/Modals/FiltersRenderer/redux";
import { ErrorComponent } from "../../../../../common/ErrorComponnet";
import moment from "moment";
import infinite from "../../../../../assets/infinite.svg";
import { LicenseTypesFormatter } from "../../../../../modules/licenses/components/AllSubsTable/AllSubsTable";
import BulkChangePaymentMethod from "modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import { bulkUpdatePaymentMethods } from "services/api/licenses";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";

export function Contracts(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);

	const id = window.location.pathname.split("/")[3];
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
	const [activeId, setactiveId] = useState([]);
	const [showAddContract, setShowAddContract] = useState(false);

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
				"contract_name",
				"Contract Name"
			);
			reqBody.filter_by = [searchObj];
		}

		setIsLoadingData(true);
		try {
			const response = await getVendorLicenseContractsV2(
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
			if (Array.isArray(newData) && newData.length) {
				let tempIdArr = [];
				if (newData[0]?.contract_id) {
					tempIdArr.push(newData[0]?.contract_id);
				}
				setactiveId(tempIdArr);
			}
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
		if (checkSpecialCharacters(searchQuery)) {
			setHasMoreData(false);
		} else {
			setIsLoadingData(true);
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"contract_name",
				"Contract Name"
			);
			reqBody.filter_by = [searchObj];
			getVendorLicenseContractsV2(
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
		contract: {
			dataField: "contract_name",
			text: "Contract",
			sortKey: "contract_name",
			formatter: (row, data, rowindex) => {
				if (data.isAccessible) {
					let tempId = activeId;
					tempId.push(data.contract_id);
					setactiveId(tempId);
				}
				return (
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
				);
			},
		},
		application: {
			dataField: "app_name",
			text: "Application",
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
			text: "Owner",
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
		cost: {
			dataField: "cost_per_term",
			text: "Cost/Term",
			sortKey: "cost_per_term",
			formatter: (row, data) => (
				<div className="flex flex-row align-items-center">
					{kFormatter(data.cost_per_term)}
				</div>
			),
		},
		status: {
			dataField: "contract_status",
			text: "Status",
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
		contract_end_date: {
			dataField: "contract_end_date",
			text: "End Date",
			sortKey: "contract_end_date",
			formatter: (row, data) => {
				if (data && data.contract_end_date) {
					return (
						<div style={{ marginTop: "11px" }}>
							{moment(data.contract_end_date).year() === 2100 ? (
								<img src={infinite} />
							) : (
								dayjs(data.contract_end_date).format(
									"D MMM YYYY"
								)
							)}
							<DayProgressBar
								isTooltipRequired={true}
								start={data.contract_start_date}
								end={data.contract_end_date}
							/>
						</div>
					);
				}
			},
		},
		license_types: {
			text: "LICENSE TYPES",
			dataField: "license_types",
			sortKey: "license_types",
			formatter: (data, row) => (
				<LicenseTypesFormatter types={data} licenses={row.licenses} />
			),
			headerStyle: {
				fontWeight: "normal",
			},
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
						refresh={() => {
							dispatch(clearAllV2DataCache("contracts"));
							handleRefresh();
						}}
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

	return (
		<>
			<ContractsFilter
				checked={checked}
				setChecked={setChecked}
				searchQuery={searchQuery}
				setSearchQuery={debounce(setSearchQuery, 200)}
				metaData={metaData}
				columnsMapper={columnsMapper}
				usedColumns={metaData?.columns}
				handleRefresh={handleRefresh}
				isLoadingData={isLoadingData}
				showAddContract={showAddContract}
				setShowAddContract={setShowAddContract}
			/>
			<OldInfiniteTable
				checked={checked}
				setChecked={setChecked}
				data={data}
				metaData={metaData}
				handleLoadMore={handleLoadMore}
				columnsMapper={columnsMapper}
				keyField="contract_id"
				handleRefresh={handleRefresh}
				v2TableEntity="vendors"
				emptyState={
					searchQuery ? (
						<EmptySearch searchQuery={searchQuery} />
					) : showErrorModal ? (
						<ErrorComponent />
					) : (
						<EmptyContracts
							showAddContract={() => setShowAddContract(true)}
						/>
					)
				}
				searchQuery={searchQuery}
				isLoadingData={isLoadingData}
				hasMoreData={hasMoreData}
			/>
		</>
	);
}
