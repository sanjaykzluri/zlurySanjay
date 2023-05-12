import React, { useRef, useState } from "react";
import arrowdropdown from "../../../../assets/arrowdropdown.svg";
import rightarrow from "../../../../assets/users/rightarrow.svg";
import { Dropdown } from "react-bootstrap";
import BulkArchiveUnarchive from "../BulkArchiveUnarchive/BulkArchiveUnarchive";
import {
	bulkArchiveUnarchive,
	bulkArchiveUnarchiveLicenses,
	bulkDeleteLicenses,
} from "../../../../services/api/licenses";
import BulkDelete from "../BulkDelete/BulkDelete";
import { showNotificationCard } from "modules/licenses/utils/LicensesUtils";
// import { clearAllV2DataCache } from "common/v2InfiniteTable/redux/v2infinite-action";

const license_bulk_edit = React.forwardRef(({ children, onClick }, ref) => (
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

const license_bulk_edit_inner = React.forwardRef(
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

export const LicenseBulkEditComponents = (
	checked,
	setChecked,
	dispatch,
	handleRefresh,
	v2Entity,
	fetchLicenseTabCount
) => (
	<LicenseBulkEdit
		checked={checked}
		handleRefresh={() => {
			fetchLicenseTabCount && fetchLicenseTabCount();
			handleRefresh();
		}}
		setChecked={setChecked}
		entity={v2Entity}
	/>
);

export default function LicenseBulkEdit({
	checked,
	handleRefresh,
	setChecked,
	entity,
}) {
	const [archiveEntities, setArchiveEntities] = useState(false);
	const [showBulkArchiveUnarchive, setShowBulkArchiveUnarchive] =
		useState(false);
	const [showBulkDelete, setShowBulkDelete] = useState(false);

	const openBulkArchiveUnarchive = (archive) => {
		setShowBulkArchiveUnarchive(true);
		setArchiveEntities(archive);
	};

	return (
		<>
			<Dropdown>
				<Dropdown.Toggle as={license_bulk_edit}>
					<div className="grey">Bulk Edit</div>
					<img src={arrowdropdown} style={{ marginLeft: "8px" }} />
				</Dropdown.Toggle>
				<Dropdown.Menu className="p-0">
					<Dropdown>
						<Dropdown.Toggle as={license_bulk_edit_inner}>
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
					<Dropdown.Item onClick={() => setShowBulkDelete(true)}>
						Delete {entity}
					</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
			{showBulkArchiveUnarchive && (
				<BulkArchiveUnarchive
					show={showBulkArchiveUnarchive}
					handleClose={() => setShowBulkArchiveUnarchive(false)}
					entity_ids={checked}
					api_call={bulkArchiveUnarchiveLicenses}
					refresh={() => {
						showNotificationCard(
							`Licenses successfully ${
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
			{showBulkDelete && (
				<BulkDelete
					show={showBulkDelete}
					handleClose={() => setShowBulkDelete(false)}
					entity_ids={checked}
					refresh={() => {
						showNotificationCard(`Licenses successfully deleted`);
						handleRefresh();
						setChecked([]);
					}}
					entity={entity}
					api_call={bulkDeleteLicenses}
				/>
			)}
		</>
	);
}
