import React, { useEffect, useContext } from "react";
import NoUsersAddedSVG from "../../../assets/users/empty.svg";
import { EmptySearch } from "../../../common/EmptySearch";
import { useSelector, useDispatch } from "react-redux";
import RoleContext from "../../../services/roleContext/roleContext";
import OldInfiniteTable from "../../../common/oldInfiniteTable";
import { ErrorComponent } from "../../../common/ErrorComponnet";
import { openModal } from "reducers/modal.reducer";
import { trackPageSegment } from "modules/shared/utils/segment";
import AddUserToDepartmentsDropdown from "modules/Departments/components/AddUserToDepartmentDropdown";

function NoUsersAdded({ handleRefresh, department_name, department_id }) {
	const dispatch = useDispatch();
	const { isViewer } = useContext(RoleContext);

	return (
		<div
			style={{ height: "75%", margin: "auto" }}
			className="d-flex flex-column justify-content-center align-items-center"
		>
			<img src={NoUsersAddedSVG} width={200} />
			<div className="empty-header">No users added</div>
			{!isViewer && (
				<>
					<div className="empty-lower">
						Add users to track usage, spend and get better
						recommendations
					</div>
					<AddUserToDepartmentsDropdown
						deptId={department_id}
						deptName={department_name}
						handleRefresh={handleRefresh}
						emptyScreen={true}
					/>
				</>
			)}
		</div>
	);
}

export function UsersTable({
	searchQuery,
	handleFilterData,
	handleLoadMore,
	data,
	metaData,
	checked,
	setChecked,
	isLoadingData,
	hasMoreData,
	columnsMapper,
	handleRefresh,
	showErrorModal,
	department,
}) {
	const id = window.location.pathname.split("/")[2];
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);

	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Departments", "Department-Users", {
			department_name: department,
			department_id: id,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}, []);

	return (
		<OldInfiniteTable
			checked={checked}
			setChecked={(ch) => setChecked(ch)}
			data={data}
			metaData={metaData}
			handleLoadMore={handleLoadMore}
			handleFilterData={handleFilterData}
			columnsMapper={columnsMapper}
			keyField="user_id"
			emptyState={
				searchQuery ? (
					<EmptySearch searchQuery={searchQuery} />
				) : showErrorModal ? (
					<ErrorComponent />
				) : (
					<NoUsersAdded
						handleRefresh={handleRefresh}
						department_name={department}
						department_id={id}
					/>
				)
			}
			searchQuery={searchQuery}
			isLoadingData={isLoadingData}
			hasMoreData={hasMoreData}
			allowFewSpecialCharacters={true}
		/>
	);
}
