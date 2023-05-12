import React, {
	useState,
	useRef,
	useEffect,
	useContext,
	Fragment,
} from "react";
import { useSelector } from "react-redux";
import { InfiniteTable } from "../../../components/Departments/InfiniteTable";
import { NameBadge } from "../../../common/NameBadge";
import ContentLoader from "react-content-loader";
import { AccessedByFilters } from "./Filters/Filters";
import { useLocation } from "react-router-dom";
import { EmptySearch } from "../../../common/EmptySearch";
import { client } from "../../../utils/client";
import { checkSpecialCharacters } from "../../../services/api/search";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { debounce } from "../../../utils/common";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";

import { searchAllCriticalApps } from "../../../services/api/security";
import inactivecheck from "../../../assets/applications/inactivecheck.svg";
import check from "../../../assets/applications/check.svg";
import {
	getAccesedBySingleUser,
	searchAccessedBy,
} from "../../../services/api/users";
import { EmptyUsers } from "./EmptyUsers";
import _ from "underscore";
import UserInfoTableComponent from "../../../common/UserInfoTableComponent";
import UserAppMetaInfoCard from "../../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
const loadingData = [
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
];

const loaderColumns = [
	{
		dataField: "name",
		text: "Department",
		formatter: () => (
			<div className="d-flex flex-row align-items-center">
				<ContentLoader
					style={{ marginRight: 8 }}
					width={26}
					height={26}
				>
					<circle cx="13" cy="13" r="13" fill="#EBEBEB" />
				</ContentLoader>
				<ContentLoader width={91} height={10}>
					<rect width="91" height="10" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "head",
		text: "Head",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
];
export function AccessedByUsers(props) {
	const { refreshTable } = useSelector((state) => state.ui);
	const [selectedIds, setSelectedIds] = useState([]);
	const [searchQuery, setSearchQuery] = useState();
	const cancelToken = useRef();
	const [successResponse, setSuccessResponse] = useState(false);
	const [totalCount, setTotalCount] = useState();
	const [tempCount, setTempCount] = useState(0);
	const location = useLocation();
	const [clickedOnAddUsersEmpty, setClickedOnAddUsersEmpty] = useState(false);
	const [allUsersData, setAllUsersData] = useState([]);
	const id = location.pathname.split("/")[2];
	const onRowSelect = (rows) => {
		setSelectedIds(rows);
	};
	const fetchDataFn = (page, row) => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		}
		if (searchQuery && searchQuery.length > 0) {
			cancelToken.current = client.CancelToken.source();
			if (checkSpecialCharacters(searchQuery, true)) {
				return [];
			}
			return searchAccessedBy(
				id,
				searchQuery,
				page,
				row,
				cancelToken.current
			);
		}
		return getAccesedBySingleUser(id, page, row);
	};
	useEffect(() => {
		if (totalCount > 0) {
			setTempCount(totalCount);
		}
	}, [totalCount]);
	useDidUpdateEffect(() => {
		refreshTable();
	}, [searchQuery]);
	useDidUpdateEffect(() => {
		if (successResponse) {
			refreshTable();
			setSuccessResponse(false);
		}
	}, [successResponse]);
	const columns = [
		{
			dataField: "user_name",
			text: "Users",
			formatter: (data, row, rowindex) => {
				return (
					<UserInfoTableComponent
						user_account_type={row.user_account_type}
						profile_img={row.profile_img}
						user_status={row.user_status}
						row={row}
						user_id={row._id}
						user_name={row.user_name}
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
			dataField: "user_status",
			text: "Usage",
			formatter: (data, row) => (
				<div
					className={
						_.isString(data) && data === "active"
							? "flex flex-row center"
							: "flex flex-row center o-6"
					}
				>
					{typeof data === "string" &&
					data?.toLocaleLowerCase() === "active" ? (
						<img src={check}></img>
					) : (
						<img src={inactivecheck} alt="" />
					)}
					<div
						className="flex flex-row justify-content-center align-items-center"
						style={{ marginLeft: "8px" }}
					>
						{_.isString(data) &&
						!!data &&
						data?.toLowerCase() === "active"
							? "In Use"
							: "Not in use"}
					</div>
				</div>
			),
		},
	];
	return (
		<>
			<AccessedByFilters
				setSuccessResponse={setSuccessResponse}
				selectedIds={selectedIds}
				setSearchQuery={debounce(setSearchQuery, 300)}
				clickedOnAddUsersEmpty={clickedOnAddUsersEmpty}
				setClickedOnAddUsersEmpty={setClickedOnAddUsersEmpty}
				allUsersData={allUsersData}
			></AccessedByFilters>
			<div style={{ padding: "0px 40px" }}>
				<InfiniteTable
					handleCheckedChange={(ch) => onRowSelect(ch)}
					perPage={30}
					loadingData={loadingData}
					loadingColumns={loaderColumns}
					fetchData={fetchDataFn}
					columns={columns}
					apiDataKey={"users"}
					keyField="_id"
					emptyState={
						searchQuery ? (
							<EmptySearch searchQuery={searchQuery} />
						) : (
							<EmptyUsers
								setClickedOnAddUsersEmpty={
									setClickedOnAddUsersEmpty
								}
							/>
						)
					}
					componentWithoutRedux
					searchQuery={searchQuery}
					setCount={setTotalCount}
					setAllUsersData={setAllUsersData}
					perPage={30}
				/>
			</div>
		</>
	);
}
