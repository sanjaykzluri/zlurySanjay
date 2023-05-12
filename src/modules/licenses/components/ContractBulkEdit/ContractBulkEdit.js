import React, { useRef, useState } from "react";
import arrowdropdown from "../../../../assets/arrowdropdown.svg";
import rightarrow from "../../../../assets/users/rightarrow.svg";
import { Dropdown } from "react-bootstrap";
import BulkArchiveUnarchive from "../BulkArchiveUnarchive/BulkArchiveUnarchive";
import {
	bulkArchiveUnarchive,
	bulkChangeStatus,
	bulkDelete,
	bulkUpdatePaymentMethods,
} from "../../../../services/api/licenses";
import BulkDelete from "../BulkDelete/BulkDelete";
import { capitalizeFirstLetter } from "utils/common";
import { showNotificationCard } from "modules/licenses/utils/LicensesUtils";
import BulkChangeStatus from "../BulkChangeStatus/BulkChangeStatus";
import { screenEntity } from "modules/licenses/constants/LicenseConstants";
import BulkChangePaymentMethod from "../BulkChangePaymentMethod/BulkChangePaymentMethod";

const contract_bulk_edit = React.forwardRef(({ children, onClick }, ref) => (
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

const contract_bulk_edit_inner = React.forwardRef(
	({ children, onClick }, ref) => (
		<a
			className="cursor-pointer insidedropdown__allapps__table w-100 pr-1"
			ref={ref}
			onClick={(e) => onClick(e)}
		>
			{children}
		</a>
	)
);

export default function ContractBulkEdit({
	checked,
	handleRefresh,
	setChecked,
	entity,
}) {
	const [archiveEntities, setArchiveEntities] = useState(false);
	const [showBulkArchiveUnarchive, setShowBulkArchiveUnarchive] =
		useState(false);
	const [showBulkDelete, setShowBulkDelete] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState();
	const [showBulkChangeStatus, setShowBulkChangeStatus] = useState(false);

	const openBulkArchiveUnarchive = (archive) => {
		setShowBulkArchiveUnarchive(true);
		setArchiveEntities(archive);
	};

	const openBulkChangeStatus = (status) => {
		setSelectedStatus(status);
		setShowBulkChangeStatus(true);
	};

	return (
		<>
			<Dropdown>
				<Dropdown.Toggle as={contract_bulk_edit}>
					<div className="grey">Bulk Edit</div>
					<img src={arrowdropdown} style={{ marginLeft: "8px" }} />
				</Dropdown.Toggle>
				<Dropdown.Menu className="p-0" style={{ width: "fit-content" }}>
					<Dropdown>
						<Dropdown.Toggle as={contract_bulk_edit_inner}>
							<div className="grey">Archive/Unarchive</div>
							<img
								src={rightarrow}
								style={{ marginLeft: "8px" }}
							/>
						</Dropdown.Toggle>
						<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
							<Dropdown.Item
								onClick={() => openBulkArchiveUnarchive(true)}
							>
								Archive
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => openBulkArchiveUnarchive(false)}
							>
								Unarchive
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					{entity?.slice(0, -1) === screenEntity.SUBSCRIPTION && (
						<Dropdown>
							<Dropdown.Toggle as={contract_bulk_edit_inner}>
								<div className="grey">Change Status</div>
								<img
									src={rightarrow}
									style={{ marginLeft: "8px" }}
								/>
							</Dropdown.Toggle>
							<Dropdown.Menu className="managed_auth_status_dropdown_menu allapps-dropdown-menu-position p-0">
								<Dropdown.Item
									onClick={() =>
										openBulkChangeStatus("active")
									}
								>
									Active
								</Dropdown.Item>
								<Dropdown.Item
									onClick={() =>
										openBulkChangeStatus("cancelled")
									}
								>
									Cancelled
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					)}
					<Dropdown.Item onClick={() => setShowBulkDelete(true)}>
						Delete {entity}
					</Dropdown.Item>
					<div
						className="dropdown"
						style={{ width: "220px", whiteSpace: "nowrap" }}
					>
						<BulkChangePaymentMethod
							bulk_button_class="cursor-pointer insidedropdown__allapps__table w-100 pr-1"
							entity_ids={checked}
							api_call={bulkUpdatePaymentMethods}
							refresh={handleRefresh}
							is_success={(res) =>
								res.result && res.result.status === "success"
							}
						/>
					</div>
				</Dropdown.Menu>
			</Dropdown>
			{showBulkArchiveUnarchive && (
				<BulkArchiveUnarchive
					show={showBulkArchiveUnarchive}
					handleClose={() => setShowBulkArchiveUnarchive(false)}
					entity_ids={checked}
					api_call={bulkArchiveUnarchive}
					refresh={() => {
						showNotificationCard(
							`${capitalizeFirstLetter(entity)} successfully ${
								archiveEntities ? "archived" : "unarchived"
							}`
						);
						handleRefresh();
						setChecked([]);
					}}
					is_success={(res) =>
						res.result && res.result.status === "success"
					}
					archive={archiveEntities}
					entity={entity}
				/>
			)}
			{showBulkChangeStatus && (
				<BulkChangeStatus
					show={showBulkChangeStatus}
					handleClose={() => setShowBulkChangeStatus(false)}
					entity_ids={checked}
					api_call={bulkChangeStatus}
					refresh={() => {
						showNotificationCard(
							`${capitalizeFirstLetter(
								entity
							)} successfully marked as ${selectedStatus}`
						);
						handleRefresh();
						setChecked([]);
					}}
					is_success={(res) =>
						res.result && res.result.status === "success"
					}
					status={selectedStatus}
					entity={entity}
				/>
			)}
			{showBulkDelete && (
				<BulkDelete
					show={showBulkDelete}
					handleClose={() => setShowBulkDelete(false)}
					entity_ids={checked}
					refresh={() => {
						showNotificationCard(
							`${capitalizeFirstLetter(
								entity
							)}s successfully deleted`
						);
						handleRefresh();
						setChecked([]);
					}}
					entity={entity}
					api_call={bulkDelete}
				/>
			)}
		</>
	);
}
