import React, { useState } from "react";
import {
	setPMTransBulk,
	setTransactionsArchiveBulk,
	unAssignTransactionsBulk,
} from "services/api/transactions";
import { Dropdown } from "react-bootstrap";

import BulkChangePaymentMethod from "modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import { UnassignArchiveModal } from "components/Transactions/Modals/UnassignArchiveModal";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import { BulkUpdateModal } from "../modals/BulkUpdateModal";
import { showNotificationCard } from "modules/licenses/utils/LicensesUtils";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";
import { v2EntitiesTransactions } from "constants";

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
export function BulkEditRecognised({
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
	const [unassignModalOpen, setUnassignModalOpen] = useState(false);
	const [archiveModalOpen, setArchiveModalOpen] = useState(false);

	const refreshReduxState = (showNotif = false) => {
		setChecked([]);
		setSelectedData([]);
		handleRefresh();
		setCheckAll(false);
		setCheckAllExceptionData([]);
		if (showNotif) {
			showNotificationCard(
				"Transactions Records Updated",
				"The transactions have been updated. Changes might take some time to reflect."
			);
		}
	};

	return (
		<>
			<BulkChangePaymentMethod
				entity_ids={checked}
				api_call={setPMTransBulk}
				refresh={() => refreshReduxState(false)}
				is_success={(res) => res && res.status === "success"}
				checkAll={checkAll}
				metaData={metaData}
				exceptionData={checkAllExceptionData}
				type={v2EntitiesTransactions.recognized}
			/>
			<Dropdown className="ml-2">
				<Dropdown.Toggle as={bulk_edit_menu}>
					<div className="grey">Bulk Edit</div>
					<img src={arrowdropdown} style={{ marginLeft: "8px" }} />
				</Dropdown.Toggle>
				<Dropdown.Menu className=" p-0">
					<Dropdown.Item
						onClick={() => {
							setUnassignModalOpen(true);
						}}
					>
						<div className="d-flex flex-row align-items-center">
							Unassign Apps
						</div>
					</Dropdown.Item>
					<Dropdown.Item
						onClick={() => {
							setArchiveModalOpen(true);
						}}
					>
						<div className="d-flex flex-row align-items-center">
							Archive
						</div>
					</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
			{unassignModalOpen || archiveModalOpen ? (
				checkAll ? (
					<>
						<BulkUpdateModal
							metaData={metaData}
							exceptionData={checkAllExceptionData}
							text={
								archiveModalOpen
									? `You’re about to archive ${
											metaData?.total -
											checkAllExceptionData?.length
									  } transactions`
									: `You’re about to unassign application from ${
											metaData?.total -
											checkAllExceptionData?.length
									  } transactions`
							}
							setSelectedTransactions={setSelectedData}
							isOpen={unassignModalOpen || archiveModalOpen}
							handleClose={() => {
								if (archiveModalOpen) {
									setArchiveModalOpen(false);
								} else {
									setUnassignModalOpen(false);
								}
							}}
							setSelectedIds={setChecked}
							refreshReduxState={() => refreshReduxState(true)}
							title={
								archiveModalOpen
									? "Archive Transactions"
									: "Unassign Transactions"
							}
							requestFunction={
								archiveModalOpen
									? setTransactionsArchiveBulk
									: unAssignTransactionsBulk
							}
							onSuccess={() => {
								if (unassignModalOpen) {
									dispatch(
										clearAllV2DataCache(
											v2EntitiesTransactions.unrecognized
										)
									);
								}
							}}
							buttonText={
								archiveModalOpen ? "Archive" : "Unassign App"
							}
							type={v2EntitiesTransactions.recognized}
						></BulkUpdateModal>
					</>
				) : (
					<UnassignArchiveModal
						data={selectedData}
						id={checked}
						selectedIds={checked}
						setSelectedTransactions={setSelectedData}
						isOpen={unassignModalOpen || archiveModalOpen}
						handleClose={() => {
							if (archiveModalOpen) {
								setArchiveModalOpen(false);
							} else {
								setUnassignModalOpen(false);
							}
						}}
						setSelectedIds={setChecked}
						refreshReduxState={() => refreshReduxState(true)}
						onSuccess={() => {
							if (unassignModalOpen) {
								dispatch(
									clearAllV2DataCache(
										v2EntitiesTransactions.unrecognized
									)
								);
							}
						}}
						title={
							archiveModalOpen
								? "Archive Transactions"
								: "Unassign Transaction"
						}
						requestFunction={
							archiveModalOpen
								? setTransactionsArchiveBulk
								: unAssignTransactionsBulk
						}
						buttonText={
							archiveModalOpen ? "Archive" : "Unassign App"
						}
					/>
				)
			) : null}
		</>
	);
}
