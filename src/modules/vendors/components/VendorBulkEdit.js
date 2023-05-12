import React, { useState } from "react";
import arrowdropdown from "assets/arrowdropdown.svg";
import rightarrow from "assets/users/rightarrow.svg";
import { Dropdown } from "react-bootstrap";
import DefaultNotificationCard from "../../../common/Notification/PusherNotificationCards/DefaultNotificationCard";
import { toast } from "react-toastify";
import {
	bulkArchiveUnarchiveVendors,
	bulkDeleteVendors,
} from "services/api/applications";
import ErrorScreen from "common/ErrorModal/ErrorScreen";

const vendor_bulk_edit = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer autho__dd__cont ml-3 mt-auto mb-auto text-decoration-none"
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

const vendor_bulk_edit_inner = React.forwardRef(
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

export default function VendorBulkEdit({ checked, handleRefresh, setChecked }) {
	const [error, setError] = useState();

	const callBulkArchiveUnarchiveVendors = async (archive) => {
		const res = await bulkArchiveUnarchiveVendors(archive, checked);
		if (res.status === "success") {
			toast(
				<DefaultNotificationCard
					notification={{
						title: `Vendors Bulk Edited`,
						description:
							"All records have been updated successfully. The changes will reflect in some time.",
					}}
				/>
			);
			setChecked([]);
			handleRefresh();
		} else {
			setError(res);
		}
	};

	const callBulkDeleteVendors = async () => {
		const res = await bulkDeleteVendors(checked);
		if (res.status === "success") {
			setChecked([]);
			handleRefresh();
		} else {
			setError(res);
		}
	};

	return (
		<>
			<Dropdown>
				<Dropdown.Toggle as={vendor_bulk_edit}>
					<div className="grey">Bulk Edit</div>
					<img src={arrowdropdown} style={{ marginLeft: "8px" }} />
				</Dropdown.Toggle>
				<Dropdown.Menu className="p-0">
					<Dropdown>
						<Dropdown.Toggle as={vendor_bulk_edit_inner}>
							<div className="grey">Archive/Unarchive</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
							<Dropdown.Item
								onClick={() =>
									callBulkArchiveUnarchiveVendors(true)
								}
							>
								Archive
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() =>
									callBulkArchiveUnarchiveVendors(false)
								}
							>
								Unarchive
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					<Dropdown.Item onClick={() => callBulkDeleteVendors()}>
						Delete Vendors
					</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
			{!!error && (
				<ErrorScreen
					isOpen={!!error}
					closeModal={() => setError()}
					isSuccess={!error}
					warningMsgHeading={"Server Error!"}
					warningMsgDescription={
						"We could not complete your request. Please try again after sometime."
					}
					entity={"vendors"}
					errors={error}
				/>
			)}
		</>
	);
}
