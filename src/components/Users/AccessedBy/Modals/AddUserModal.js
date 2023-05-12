import React, { useEffect, useState, useRef } from "react";
import "./AddUserModal.css";
import { debounce, isEmpty } from "../../../../utils/common";
import { defaults } from "../../../../constants";
import { Modal, Spinner } from "react-bootstrap";
import { Button } from "../../../../UIComponents/Button/Button";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import cross from "../../../../assets/reports/cross.svg";
import { checkSpecialCharacters } from "../../../../services/api/search";
import { EmptySearch } from "../../../../common/EmptySearch";
import { client } from "../../../../utils/client";
import OldInfiniteTable from "../../../../common/oldInfiniteTable";
import { useLocation } from "react-router-dom";
import { TriggerIssue } from "../../../../utils/sentry";
import { searchAllUsersV2 } from "../../../../services/api/search";
import {
	getUsersinAddModalAccessedBy,
	searchUsersinAddModalAccessedBy,
} from "../../../../services/api/users";
import { NameBadge } from "../../../../common/NameBadge";
import { unescape } from "../../../../utils/common";
import {
	defaultReqBody,
	getSearchReqObj,
} from "../../../../common/infiniteTableUtil";
import UserAppMetaInfoCard from "../../../../modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";
import { AddUserModalFilters } from "../Filters/AddUserModalFilters";
import Chips from "../../Applications/Modals/FiltersRenderer/Chip";
import UserInfoTableComponent from "../../../../common/UserInfoTableComponent";
import { Empty } from "../../../../modules/security/components/Empty/Empty";
function UserListFormatter({ rowData, unCheckedFromUserListFormatter }) {
	return (
		<>
			{rowData.slice(0, 2).map((element) => (
				<div className="username__accessedby__container">
					<div className="flex flex-row align-items-center">
						{(element?.profile_img || element?.user_profile) && (
							<img
								src={
									unescape(element?.profile_img) ||
									unescape(element?.user_profile)
								}
								alt={element?.name}
								style={{
									height: "auto",
									width: "15px",
								}}
							/>
						)}
						{!element.profile_img && !element.user_profile && (
							<NameBadge width={16} name={element?.name} />
						)}
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{element?.name}</Tooltip>}
						>
							<div
								className="truncate_10vw "
								style={{
									marginLeft: "8px",
									fontSize: "13px",
									marginRight: "3px",
								}}
							>
								{element?.name}
							</div>
						</OverlayTrigger>
						<img
							src={cross}
							height={8}
							width={8}
							className="cursor-pointer"
							onClick={() => {
								unCheckedFromUserListFormatter(
									element?._id,
									element
								);
							}}
						></img>
					</div>
				</div>
			))}
			{rowData.length > 2 && (
				<>
					<div
						className="username__accessedby__container"
						style={{ fontSize: "13px" }}
					>
						{rowData.length - 2} more
					</div>
				</>
			)}
		</>
	);
}
function AddUserModal(props) {
	const location = useLocation();
	const id = location.pathname.split("/")[2];
	const [checked, setChecked] = useState([]);
	const [rowData, setRowData] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [data, setData] = useState([]);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [refreshTable, setRefreshTable] = useState(false);
	const cancelToken = useRef();
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [pageNo, setPageNo] = useState(0);
	const [metaData, setMetaData] = useState({
		columns: [
			{
				group_name: "user",
				field_ids: ["user_name", "user_id", "user_profile"],
			},
			{
				group_name: "team",
				field_ids: ["user_department_name", "user_department_id"],
			},
			{
				group_name: "user_email",
				field_ids: ["user_email"],
			},
			{
				group_name: "user_designation",
				field_ids: ["user_designation"],
			},
			{
				group_name: "user_app_count",
				field_ids: ["user_app_count"],
			},
			{
				group_name: "user_usage",
				field_ids: ["user_usage"],
			},
			{
				group_name: "user_status",
				field_ids: ["user_status"],
			},
			{
				group_name: "user_account_type",
				field_ids: ["user_account_type"],
			},
		],
	});
	const [reqBody, setReqBody] = useState({ ...defaultReqBody });
	const [shouldConcat, setShouldConcat] = useState(false);
	const [manualRefresh, setManualRefresh] = useState(false);
	const dispatch = useDispatch();
	const query = useSelector((state) => state.router.location.query);
	const router = useSelector((state) => state.router);
	const { hash } = router.location;
	const unCheckedFromUserListFormatter = (id, row) => {
		let tempArray = [...checked];
		let tempRowArray = [...rowData];
		tempArray = tempArray.filter((element) => element !== id);
		tempRowArray = tempRowArray.filter((element) => element !== row);
		setChecked(tempArray);
		setRowData(tempRowArray);
	};

	useEffect(() => {
		!isLoadingData && loadData(reqBody);
	}, [pageNo, refreshTable]);

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
		setRefreshTable(!refreshTable);
		setHasMoreData(true);
	}

	async function loadData(reqBody) {
		setIsLoadingData(true);
		try {
			const response = await getUsersinAddModalAccessedBy(
				id,
				pageNo,
				defaults.USERS_TABLE_ROW
			);
			if (response.users.length < defaults.MINIMUM_ROW) {
				setHasMoreData(false);
			} else {
				!hasMoreData && setHasMoreData(true);
			}
			let newData = shouldConcat
				? [...data, ...response.users]
				: response.users;

			setIsLoadingData(false);
			setData(newData);
			let tempRows = rowData.filter(
				(v, i, a) => a.findIndex((t) => t._id === v._id) === i
			);
			setRowData(tempRows);
		} catch (error) {
			setIsLoadingData(false);
			setHasMoreData(false);
		}
	}

	const fetchDataFn = () => {
		setData([]);
		if (checkSpecialCharacters(searchQuery, true)) {
			setHasMoreData(false);
		} else {
			setIsLoadingData(true);
			cancelToken.current = client.CancelToken.source();
			const searchObj = getSearchReqObj(
				searchQuery,
				"user_name",
				"User Name"
			);
			reqBody.filter_by = [searchObj];
			searchUsersinAddModalAccessedBy(
				id,
				searchQuery,
				pageNo,
				defaults.USERS_TABLE_ROW,
				cancelToken.current
			)
				.then((response) => {
					if (response.users.length < defaults.MINIMUM_ROW) {
						setHasMoreData(false);
					}
					setReqBody(reqBody);
					setData(response.users);

					setIsLoadingData(false);
					let tempRows = rowData.filter(
						(v, i, a) => a.findIndex((t) => t._id === v._id) === i
					);
					setRowData(tempRows);
				})
				.catch((error) => {
					if (!client.isCancel(error)) {
						TriggerIssue("Error in searching users", error);
						setIsLoadingData(false);
						setHasMoreData(false);
					}
				});
		}
	};

	useEffect(() => {
		if (cancelToken.current) {
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
			setIsLoadingData(false);
		}
		if (searchQuery) {
			fetchDataFn();
		} else if (searchQuery === "") {
			reqBody.filter_by = [];
			handleRefresh();
		}
	}, [searchQuery]);

	useEffect(() => {
		props.setUserIds(checked);
		let tempRows = [...rowData];
		data.map((row) => {
			if (checked.includes(row._id)) {
				if (!tempRows.find((i) => i._id === row._id)) {
					tempRows.push(row);
				}
			}
			if (!checked.includes(row._id)) {
				tempRows = tempRows.filter((el) => el._id !== row._id);
			}
		});
		tempRows = tempRows.filter(
			(v, i, a) => a.findIndex((t) => t._id === v._id) === i
		);
		setRowData(tempRows);
	}, [checked, data]);

	const columnsMapper = {
		user: {
			dataField: "name",
			text: "User",
			formatter: (data, row, rowindex) => {
				return (
					<UserInfoTableComponent
						user_account_type={row.user_account_type}
						profile_img={row.profile_img}
						user_profile={row.user_profile}
						row={row}
						user_id={row._id}
						user_name={row.name}
						tooltipClassName={"userMetaInfoCard"}
						customTooltip={
							<UserAppMetaInfoCard
								title={row?.name}
								description={row?.email}
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
		user_email: {
			dataField: "email",
			text: "Email",
			formatter: (dataField) => (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>{dataField}</Tooltip>}
				>
					<div className="truncate_10vw">{dataField}</div>
				</OverlayTrigger>
			),
		},
	};
	return (
		<>
			<Modal
				show={props.isOpen}
				onHide={props.handleClose}
				centered
				contentClassName="adduser__accessedby__modal"
			>
				<div className="adduser__accessedby__cont">
					<div className="adduser__accessedby__cont__topmost">
						<div className="adduser__accessedby__cont__topmost__heading">
							Add Users
						</div>
						<img
							src={cross}
							height={12}
							width={12}
							onClick={() => {
								props.handleClose();
							}}
							className="adduser__accessedby__cont__closebutton"
						></img>
					</div>
					<hr style={{ margin: "0px 10px 0px" }}></hr>
					{Array.isArray(rowData) && rowData.length > 0 && (
						<div className="adduser__accessedby__cont__selectedusers">
							<div className="o-8 black font-12">
								Selected Users{" "}
							</div>
							<div className="adduser__accessedby__cont__selectedusers__content">
								<UserListFormatter
									rowData={rowData}
									unCheckedFromUserListFormatter={
										unCheckedFromUserListFormatter
									}
								></UserListFormatter>
							</div>
						</div>
					)}
					<div className="adduser__accessedby__cont__middle">
						<AddUserModalFilters
							checked={checked}
							searchQuery={searchQuery}
							setSearchQuery={debounce(setSearchQuery, 200)}
							manualRefresh={manualRefresh}
							setManualRefresh={setManualRefresh}
							metaData={metaData}
							columnsMapper={columnsMapper}
							usedColumns={metaData?.columns}
							handleRefresh={handleRefresh}
							isLoadingData={isLoadingData}
						></AddUserModalFilters>
					</div>

					<Chips
						searchQuery={searchQuery}
						text={"Users"}
						metaData={metaData}
					/>

					<div className="adduser__accessedby__cont__table">
						<OldInfiniteTable
							setChecked={setChecked}
							checked={checked}
							data={data}
							metaData={metaData}
							hasMoreData={hasMoreData}
							handleLoadMore={handleLoadMore}
							columnsMapper={columnsMapper}
							keyField="_id"
							emptyState={
								searchQuery ? (
									<EmptySearch searchQuery={searchQuery} />
								) : (
									<Empty />
								)
							}
							searchQuery={searchQuery}
							isLoadingData={isLoadingData}
						/>
					</div>
				</div>
				<Modal.Footer>
					<Button type="link" onClick={() => props.handleClose()}>
						Cancel
					</Button>
					<Button
						onClick={() => props.onOk()}
						disabled={
							props.disableOkButton ||
							props.submitInProgress ||
							rowData.length === 0
						}
					>
						{props.submitInProgress ? (
							<Spinner
								animation="border"
								role="status"
								variant="light"
								size="sm"
								className="ml-2"
								style={{ borderWidth: 2 }}
							>
								<span className="sr-only">Loading...</span>
							</Spinner>
						) : (
							"Add Users"
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}

export default AddUserModal;
