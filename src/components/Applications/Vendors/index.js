import React, { useEffect, useState, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NameBadge } from "../../../common/NameBadge";
import { Link } from "react-router-dom";
import check from "../../../assets/applications/check.svg";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { debounce, isEmpty, unescape } from "../../../utils/common";
import { VendorFilters } from "./vendorFilters";
import { EmptySearch } from "../../../common/EmptySearch";
import { EmptyVendors } from "./EmptyVendors";
import { checkSpecialCharacters } from "../../../services/api/search";
import { client } from "../../../utils/client";
import {
	getAllVendorsV2,
	getVendorCostTrend,
	getVendorSpendTrend,
} from "../../../services/api/applications";
import OldInfiniteTable from "../../../common/oldInfiniteTable";
import {
	defaultReqBody,
	filtersRequestBodyGenerator,
	getSearchReqObj,
} from "../../../common/infiniteTableUtil";
import { defaults } from "../../../constants";
import { TriggerIssue } from "../../../utils/sentry";
import { push } from "connected-react-router";
import UserInfoTableComponent from "../../../common/UserInfoTableComponent";
import { ACTION_TYPE } from "../../Users/Applications/Modals/FiltersRenderer/redux";
import { ErrorComponent } from "../../../common/ErrorComponnet";
import SpendCostTrend, {
	HeaderFormatter,
	spendCostTrendType,
} from "../../../modules/spendvscost/components/SpendCostTrend";
import HeaderTitleBC from "../../HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { Empty } from "modules/security/components/Empty/Empty";
import RoleContext from "services/roleContext/roleContext";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";
import { userRoles } from "constants/userRole";

export default function Vendors(props) {
	const { userRole } = useContext(RoleContext);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Applications", "All-Vendors", {
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}, []);

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
				"vendor_name",
				"Vendor Name"
			);
			reqBody.filter_by = [searchObj];
		}

		setIsLoadingData(true);
		try {
			const response = await getAllVendorsV2(reqBody, pageNo, 30);
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
		if (checkSpecialCharacters(searchQuery)) {
			setHasMoreData(false);
		} else {
			setIsLoadingData(true);
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"vendor_name",
				"Vendor Name"
			);
			reqBody.filter_by = [searchObj];
			getAllVendorsV2(reqBody, pageNo, 30, cancelToken.current)
				.then((response) => {
					if (response.data.length < defaults.MINIMUM_ROW) {
						setHasMoreData(false);
					}
					setReqBody(reqBody);
					setData(response.data);
					setMetaData(response.meta);
					setIsLoadingData(false);
					window.analytics.track("Search Vendors Results Displayed", {
						searchQuery: searchQuery,
						currentCategory: "Vendors",
						currentPageName: "Vendors",
						orgId: orgId || "",
						orgName: orgName || "",
					});
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue("Error in searching vendors", error);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

	const columnsMapper = {
		vendor: {
			dataField: "vendor",
			text: "Vendor",
			sortKey: "vendor_name",
			formatter: (row, data) => (
				<div className="flex flex-row align-items-center">
					{data?.vendor_logo ? (
						<img
							src={unescape(data?.vendor_logo)}
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
		contracts: {
			dataField: "total_contracts",
			text: "Contracts",
			sortKey: "total_contracts",
			formatter: (row, data, rowindex) => (
				<div className="flex flex-row align-items-center">{row}</div>
			),
		},
		Cost: {
			dataField: "vendor_cost",
			sortKey: "vendor_cost",
			text: "Cost [YTD]",
			headerFormatter: (row, data) => (
				<HeaderFormatter
					text={"Cost [YTD]"}
					type={spendCostTrendType.COST}
				></HeaderFormatter>
			),
			formatter: (row, data) => (
				<SpendCostTrend
					trendAPI={getVendorCostTrend}
					type={spendCostTrendType.COST}
					id={data?.vendor_id}
					value={data?.vendor_cost}
				/>
			),
		},
		spend: {
			dataField: "total_spend",
			text: "Spend [YTD]",
			sortKey: "total_spend",
			headerFormatter: (row, data) => (
				<HeaderFormatter
					text={"Spend [YTD]"}
					type={spendCostTrendType.SPEND}
				></HeaderFormatter>
			),
			formatter: (row, data) => (
				<SpendCostTrend
					trendAPI={getVendorSpendTrend}
					type={spendCostTrendType.SPEND}
					id={data?.vendor_id}
					value={data?.total_spend}
				/>
			),
		},
		vendor_type: {
			dataField: "vendor_type",
			text: "Type",
			sortKey: "vendor_type",
			formatter: (data) => (
				<div className="flex flex-row center">
					{data === "reseller" ? "Reseller" : "Direct Seller"}
				</div>
			),
		},
		status: {
			dataField: "vendor_status",
			text: "Status",
			sortKey: "vendor_status",
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
		category: {
			dataField: "vendor_category",
			text: "Category",
			sortKey: "vendor_category",
			formatter: (row, data, rowindex) => (
				<div className="flex flex-row align-items-center">
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{row?.[0]}</Tooltip>}
					>
						<div className="truncate_10vw">{row?.[0]}</div>
					</OverlayTrigger>
				</div>
			),
		},
	};

	return (
		<>
			{userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC title="Vendors" />
					<VendorFilters
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
						keyField="vendor_id"
						emptyState={
							searchQuery ? (
								<EmptySearch searchQuery={searchQuery} />
							) : showErrorModal ? (
								<ErrorComponent />
							) : query.metaData ? (
								<Empty />
							) : (
								<EmptyVendors refreshTable={handleRefresh} />
							)
						}
						searchQuery={searchQuery}
						isLoadingData={isLoadingData}
						hasMoreData={hasMoreData}
						rowFormatRequired={(data) => data?.archive}
						rowFormatClassName={"o-6"}
						handleRefresh={handleRefresh}
						v2TableEntity="vendors"
					/>
				</>
			)}
		</>
	);
}
