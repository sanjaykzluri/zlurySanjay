import React, { useState, useRef, useEffect } from "react";
import arrowdropdown from "components/Transactions/Unrecognised/arrowdropdown.svg";
import {
	assignTransaction,
	exportUnrecognisedTransactionCSV,
} from "services/api/transactions";

import {
	setPMTransBulk,
	setTransactionsArchiveBulk,
} from "services/api/transactions";
import { Dropdown } from "react-bootstrap";

import BulkChangePaymentMethod from "modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import { UnassignArchiveModal } from "components/Transactions/Modals/UnassignArchiveModal";
import { WorkFlowModalins } from "components/Transactions/Modals/WorkFlowModal";
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
export function BulkEditUnrecognized({
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
	const [showTxnAssignModal, setShowTxnAssignModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);

	const cancelToken = useRef();

	const refreshReduxState = (showNotif = false) => {
		setChecked([]);
		handleRefresh();
		setSelectedData([]);
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
				type={v2EntitiesTransactions.unrecognized}
			/>
			<Dropdown className="ml-2">
				<Dropdown.Toggle as={bulk_edit_menu}>
					<div className="grey">Bulk Edit</div>
					<img src={arrowdropdown} style={{ marginLeft: "8px" }} />
				</Dropdown.Toggle>
				<Dropdown.Menu className=" p-0">
					<Dropdown.Item
						onClick={() => {
							setShowTxnAssignModal(true);
						}}
					>
						<div className="d-flex flex-row align-items-center">
							Assign Apps
						</div>
					</Dropdown.Item>
					<Dropdown.Item
						onClick={() => {
							setShowArchiveModal(true);
						}}
					>
						<div className="d-flex flex-row align-items-center">
							Archive
						</div>
					</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
			{showTxnAssignModal && !checkAll ? (
				<WorkFlowModalins
					data={selectedData}
					id={checked}
					setSelectedIds={setChecked}
					isOpen={showTxnAssignModal}
					handleClose={() => {
						setShowTxnAssignModal(false);
					}}
					cancelToken={cancelToken}
					clearCache={() => {
						handleRefresh();
						setChecked([]);
						setSelectedData([]);
					}}
					refreshReduxState={() => refreshReduxState(true)}
				/>
			) : null}
			{showArchiveModal && !checkAll && (
				<UnassignArchiveModal
					data={selectedData}
					id={checked}
					setSelectedIds={(v) => setChecked(v)}
					setSelectedTransactions={setSelectedData}
					isOpen={showArchiveModal}
					handleClose={() => {
						setShowArchiveModal(false);
					}}
					cancelToken={cancelToken}
					title={"Archive Transactions"}
					requestFunction={setTransactionsArchiveBulk}
					buttonText={"Archive"}
					isUnrecognisedPage={true}
					refreshReduxState={() => refreshReduxState(true)}
				/>
			)}
			{(showArchiveModal || showTxnAssignModal) && checkAll && (
				<BulkUpdateModal
					metaData={metaData}
					exceptionData={checkAllExceptionData}
					text={
						showArchiveModal
							? `You’re about to archive ${
									metaData?.total -
									checkAllExceptionData?.length
							  } transactions`
							: `You’re about to assign application to ${
									metaData?.total -
									checkAllExceptionData?.length
							  } transactions`
					}
					setSelectedTransactions={setSelectedData}
					isOpen={showArchiveModal || showTxnAssignModal}
					handleClose={() => {
						if (showArchiveModal) {
							setShowArchiveModal(false);
						} else {
							setShowTxnAssignModal(false);
						}
					}}
					setSelectedIds={setChecked}
					refreshReduxState={() => refreshReduxState(true)}
					title={
						showArchiveModal
							? "Archive Transactions"
							: "Assign Application"
					}
					requestFunction={
						showArchiveModal
							? setTransactionsArchiveBulk
							: assignTransaction
					}
					onSuccess={() => {
						if (showTxnAssignModal) {
							dispatch(
								clearAllV2DataCache(
									v2EntitiesTransactions.recognized
								)
							);
						}
					}}
					buttonText={showArchiveModal ? "Archive" : "Assign App"}
					type={v2EntitiesTransactions.unrecognized}
				></BulkUpdateModal>
			)}
		</>
	);
}
