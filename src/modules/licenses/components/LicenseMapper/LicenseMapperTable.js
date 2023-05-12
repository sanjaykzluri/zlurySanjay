import React, { useEffect, useState } from "react";
import {
	clearAllLicenseMapperUsers,
	fetchAllLicenseMapperUsers,
	updateFewLicenseMapperUsers,
	updateLicenseMapperScrollPosition,
} from "./LicenseMapper-action";
import { EmptySearch } from "common/EmptySearch";
import UserLicensesCell from "./UserLicensesCell";
import { useDispatch, useSelector } from "react-redux";
import { allowScroll, preventScroll } from "actions/ui-action";
import { Empty } from "modules/security/components/Empty/Empty";
import InfiniteTable from "modules/v2InfiniteTable/infiniteTable";
import LicenseMapperTableFilter from "./LicenseMapperTableFilter";
import UserInfoTableComponent from "common/UserInfoTableComponent";
import { ActivityGraphCell } from "components/Users/Applications/Applications";
import UserAppMetaInfoCard from "modules/shared/components/UserAppMetaInfo/UserAppMetaInfoCard";

export default function LicenseMapperTable({ appId, contractId, licenses }) {
	const dispatch = useDispatch();
	const [checked, setChecked] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [checkAll, setCheckAll] = useState(false);
	const [checkAllExceptionData, setCheckAllExceptionData] = useState([]);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);

	const { data, metaData, loaded, loading, hasMoreData, scrollTop } =
		useSelector((state) => state.licenseMapper);

	useEffect(() => {
		if (!loaded) {
			dispatch(fetchAllLicenseMapperUsers({ appId, contractId }));
		}
	}, [data]);

	useEffect(() => {
		setTotalPages(Math.ceil(getSearchData()?.length / 100));
		setChecked([]);
		setPage(0);
	}, [data, searchQuery]);

	useEffect(() => {
		dispatch(preventScroll());
		return function cleanup() {
			dispatch(allowScroll());
			dispatch(clearAllLicenseMapperUsers());
		};
	}, []);

	const getSearchData = () => {
		let temp = [...(data || [])];
		return searchQuery
			? temp.filter(
					(row) =>
						row.user_name
							?.toLowerCase()
							?.includes(searchQuery?.toLowerCase()) ||
						row.user_email
							?.toLowerCase()
							?.includes(searchQuery?.toLowerCase())
			  )
			: temp;
	};

	const handleRefresh = () => {
		setChecked([]);
		dispatch(clearAllLicenseMapperUsers({ appId }));
		setPage(0);
	};

	function updateScrollPosition(scrollTop) {
		dispatch(updateLicenseMapperScrollPosition(scrollTop));
	}

	const unassignUserLicense = (license, user) => {
		let tempUserLicenses = [...user.contracts].filter(
			(lic) => lic.license_id !== license.license_id
		);
		user.contracts = tempUserLicenses;
		if (Array.isArray(user.removed_contracts)) {
			user.removed_contracts = [
				...user.removed_contracts,
				{
					license_id: license.license_id,
					license_unassigned_on: `${
						new Date().toISOString().split("T")[0]
					}T00:00:00.000Z`,
				},
			];
		} else {
			user.removed_contracts = [
				{
					license_id: license.license_id,
					license_unassigned_on: `${
						new Date().toISOString().split("T")[0]
					}T00:00:00.000Z`,
				},
			];
		}
		dispatch(updateFewLicenseMapperUsers({ data: [user] }));
	};

	const assignUserLicense = (license, user) => {
		let tempUserLicenses = [
			...user.contracts,
			{
				license_id: license.license_id,
				license_name: license.license_name,
				license_assigned_on: `${
					new Date().toISOString().split("T")[0]
				}T00:00:00.000Z`,
				license_auto_increment: license.auto_increment,
				integration_id: license.integration_id,
				integration_name: license.integration_name,
				integration_logo: license.integration_logo,
				org_integration_id: license.org_integration_id,
				org_integration_name: license.org_integration_name,
				cost_per_item: license.cost_per_item,
				role: null,
			},
		];
		user.contracts = tempUserLicenses;
		let tempUserRemovedLicenses = Array.isArray(user.removed_contracts)
			? [...user.removed_contracts].filter(
					(lic) => lic.license_id !== license.license_id
			  )
			: [];
		user.removed_contracts = tempUserRemovedLicenses;
		dispatch(updateFewLicenseMapperUsers({ data: [user] }));
	};

	const getColumnsMapper = () => {
		const columnsMapper = {
			user: {
				dataField: "user_name",
				text: "User",
				formatter: (data, row, rowindex) => {
					return (
						<UserInfoTableComponent
							user_account_type={row.user_account_type}
							profile_img={row.profile_img}
							user_profile={row.user_profile}
							user_email={row.user_email}
							user_status={row.user_status}
							user_discovered={row.user_app_discovered}
							row={row}
							user_id={row.user_id}
							user_name={row.user_name}
							is_external_user={row.user_is_external}
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
						/>
					);
				},
			},
			license_details: {
				dataField: "license_name",
				text: "License",
				formatter: (row, data) => (
					<div className="d-flex flex-row align-items-center">
						<UserLicensesCell
							userLicenses={data?.contracts}
							licenseList={[...licenses]}
							onUnassignLicense={(license) =>
								unassignUserLicense(license, data)
							}
							onAssignLicense={(license) =>
								assignUserLicense(license, data)
							}
							user={data}
						/>
					</div>
				),
			},
			user_app_role: {
				dataField: "user_app_role",
				text: "User-App Role",
				formatter: (row, data) => (
					<div className="d-flex flex-row align-items-center">
						{row || "-"}
					</div>
				),
			},
			activity_trend: {
				dataField: "user_app_sources_data",
				text: "Activity",
				formatter: (data, row) => (
					<ActivityGraphCell row={row} data={data} />
				),
			},
		};
		return columnsMapper;
	};

	return (
		<>
			<LicenseMapperTableFilter
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				page={page}
				setPage={setPage}
				totalPages={totalPages}
				licenses={licenses}
				handleRefresh={handleRefresh}
				checked={checked}
				setChecked={setChecked}
				licenseList={[...licenses]}
				appId={appId}
			/>
			<InfiniteTable
				checked={checked}
				setChecked={setChecked}
				data={
					Array.isArray(getSearchData())
						? getSearchData().slice(
								100 * page,
								100 * (page + 1) - 1
						  )
						: []
				}
				metaData={metaData}
				columnsMapper={getColumnsMapper(handleRefresh)}
				keyField={"_id"}
				emptyState={
					searchQuery ? (
						<EmptySearch searchQuery={searchQuery} />
					) : (
						<Empty />
					)
				}
				searchQuery={searchQuery}
				isLoadingData={loading}
				hasMoreData={hasMoreData}
				allowFewSpecialCharacters={true}
				key={`license_mapper_users_${page}`}
				isPaginatedTable={true}
				checkAll={checkAll}
				setCheckAll={setCheckAll}
				checkAllExceptionData={checkAllExceptionData}
				setCheckAllExceptionData={setCheckAllExceptionData}
				tablePadding="0 20px"
				updateScrollPosition={updateScrollPosition}
				scrollTop={scrollTop}
			/>
		</>
	);
}
