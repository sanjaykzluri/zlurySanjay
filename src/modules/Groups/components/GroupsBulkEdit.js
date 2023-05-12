import React, { useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import DropdownToggle from "react-bootstrap/esm/DropdownToggle";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import rightarrow from "assets/users/rightarrow.svg";
import { bulkEditGroupsArchive } from "../service/Groups.api";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";
//import { bulkEditGroupsArchive } from "modules/Groups/service/Groups.api";

const bulk_edit_menu = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer autho__dd__cont mt-auto mb-auto text-decoration-none"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
		style={{ width: "100px" }}
	>
		{children}
	</a>
));
bulk_edit_menu.displayName = "bulk_edit_menu";

const inner_bulk_edit_dropdown = React.forwardRef(
	({ children, onClick }, ref) => (
		<a
			className="cursor-pointer insidedropdown__allapps__table"
			ref={ref}
			onClick={(e) => onClick(e)}
		>
			{children}
		</a>
	)
);
inner_bulk_edit_dropdown.displayName = "inner_bulk_edit_dropdown";

export default function GroupsBulkEdit({
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
	setSelectedData,
}) {
	//const [showArchiveModal, setShowArchiveModal] = useState(false);
	const handleRefreshAfterBulkEdit = () => {
		setChecked([]);
		handleRefresh();
		setCheckAll(false);
		setCheckAllExceptionData([]);
	};
	const handleArchiveUnarchive = (archive) => {
		let ids = checkAll ? checkAllExceptionData : checked;
		bulkEditGroupsArchive(ids, archive, metaData.filter_by, checkAll)
			.then((res) => {
				if (res.status === "success") {
					ApiResponseNotification({
						responseType: apiResponseTypes.SUCCESS,
						title: `Groups successfully ${
							archive ? "archived" : "unarchived"
						}!`,
					});
					handleRefreshAfterBulkEdit();
				}
			})
			.catch((err) => {
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					title: `Error while ${
						archive ? "archiving" : "unarchiving"
					} groups!`,
				});
			});
	};
	return (
		<>
			<Dropdown>
				<Dropdown.Toggle as={bulk_edit_menu}>
					<div className="grey">Bulk Edit</div>
					<img src={arrowdropdown} style={{ marginLeft: "8px" }} />
				</Dropdown.Toggle>
				<Dropdown.Menu className="p-0">
					<Dropdown>
						<Dropdown.Toggle as={inner_bulk_edit_dropdown}>
							<div className="grey">Archive/Unarchive</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position">
							<Dropdown.Item
								onClick={() => {
									handleArchiveUnarchive(true);
								}}
							>
								<div className="d-flex flex-row align-items-center">
									Archive
								</div>
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									handleArchiveUnarchive(false);
								}}
							>
								Unarchive
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</Dropdown.Menu>
			</Dropdown>
		</>
	);
}
