import React, { useRef, useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
	getTransactionsPropertiesList,
	getUnRecognisedTransactionsV2,
	searchUnrecognisedTransactionsV2,
	setPMTransBulk,
} from "services/api/transactions";
import { defaults } from "constants";
import { kFormatter } from "constants/currency";
import { ENTITIES } from "constants";
import RoleContext from "services/roleContext/roleContext";
import {
	isBasicSubscriptionSelector,
	showrestrictedPopup,
} from "common/restrictions";
import { dateFormatter } from "modules/transactions/recognised/Recognised";
import BulkChangePaymentMethod from "modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import InfiniteTableContainer from "modules/v2InfiniteTable/InfiniteTableContainer";
import WorkFlowModal from "components/Transactions/Unrecognised/WorkflowModal";
import { UnRecognizedExport } from "./UnrecognizedExport";
import { BulkEditUnrecognized } from "./BulkEditUnrecognized";

export default function UnRecognizedTable(props) {
	const { isViewer } = useContext(RoleContext);
	const cancelToken = useRef();
	const isBasicSubscription = useSelector(isBasicSubscriptionSelector);

	const getColumnsMapper = (handleRefresh, metaData, setChecked) => {
		let columnsMapper = {
			transaction_description: {
				dataField: "transaction_description",
				sortKey: "transaction_description",
				text: "Transaction Description",
				formatter: (cell, row) => (
					<OverlayTrigger
						placement="top"
						overlay={
							<Tooltip>{row.transaction_description}</Tooltip>
						}
					>
						<div className="truncate_name">
							{row.transaction_description}
						</div>
					</OverlayTrigger>
				),
			},
			transaction_date: {
				dataField: "transaction_date",
				sortKey: "transaction_date",
				text: "Transaction Date",
				formatter: dateFormatter,
			},
			actual_amount: {
				dataField: "transaction_amount",
				sortKey: "actual_amount",
				text: "Amount",
				formatter: (cell, dataField) => {
					return kFormatter(dataField.actual_amount);
				},
			},
			source: {
				dataField: "transaction_source",
				text: "Source",

				formatter: sourceFormatter,
			},
			payment_method: {
				dataField: "transaction_payment_method",
				text: "Payment Method",
				formatter: (row, data) => (
					<div className="flex flex-row center">
						<BulkChangePaymentMethod
							entity_ids={[data?._id]}
							api_call={setPMTransBulk}
							refresh={handleRefresh}
							is_success={(res) =>
								res && res.status === "success"
							}
							is_table_cell={true}
							popover_class="table-cell-change-payment-method"
							payment_method={{
								payment_method_id: data?.payment_method_id,
								payment_method_name: data?.payment_method_name,
								payment_method_type: data?.payment_method_type,
								payment_method_details_type:
									data?.payment_method_details_type,
								payment_method_logo_url:
									data?.payment_method_logo_url,
							}}
						/>
					</div>
				),
			},
			payment_method_details_number: {
				dataField: "payment_method_details_number",
				text: "Last Digits",
				sortKey: "payment_method_details_number",
				formatter: (cell, dataField) =>
					dataField.payment_method_details_number || "-",
			},
			transaction_type: {
				dataField: "transaction_type",
				text: "Transaction Type",
				sortKey: "transaction_type",
				formatter: (cell) => cell || "-",
			},
			account_name: {
				dataField: "account_name",
				text: "Account Name",
				sortKey: "account_name",
				formatter: (cell) => cell || "-",
			},
			original_amount: {
				dataField: "original_amount",
				text: "Original Amount",
				sortKey: "original_amount",
				formatter: (cell, row) => kFormatter(cell, row.original_currency),
			},
		};
		if (!isViewer) {
			columnsMapper.assign_app = {
				dataField: "isActive",
				text: "",
				headerStyle: () => {
					return { width: "16%" };
				},
				formatter: (data, cell, index) => (
					<div
						onClickCapture={(e) => {
							if (isBasicSubscription) {
								e.stopPropagation();
								e.preventDefault();
								showrestrictedPopup(
									ENTITIES.ASSIGN_APPLICATION
								);
							}
						}}
					>
						{cell ? (
							<WorkFlowModal
								id={cell._id}
								data={[cell]}
								cell={cell}
								setSelectedIds={setChecked}
								page={1}
								rows={30}
								cancelToken={cancelToken}
								clearCache={() => {
									handleRefresh();
									setChecked([]);
								}}
							/>
						) : null}
					</div>
				),
			};
		}
		return columnsMapper;
	};

	const customProps = {
		columnsMapper: getColumnsMapper,
		v2TableEntity: "unrecognized",
		v2SearchFieldId: "transaction_description",
		v2SearchFieldName: "Transaction Description",
		getAPI: getUnRecognisedTransactionsV2,
		searchAPI: searchUnrecognisedTransactionsV2,
		propertyListAPI: getTransactionsPropertiesList,
		keyField: "_id",
		chipText: "Transactions",
		hasBulkEdit: true,
		bulkEditComponents: (
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
			setSelectedData
		) => {
			return (
				<BulkEditUnrecognized
					checked={checked}
					setChecked={setChecked}
					dispatch={dispatch}
					handleRefresh={handleRefresh}
					checkAll={checkAll}
					setCheckAll={setCheckAll}
					checkAllExceptionData={checkAllExceptionData}
					setCheckAllExceptionData={setCheckAllExceptionData}
					metaData={metaData}
					selectedData={selectedData}
					setSelectedData={setSelectedData}
				></BulkEditUnrecognized>
			);
		},
		exportComponent: UnRecognizedExport,
		set_all_present: true,
	};
	return (
		<>
			<InfiniteTableContainer {...customProps} />
		</>
	);
}

function sourceFormatter(row, cell) {
	return (
		<>
			{cell.source_type === "manually" ? (
				<span>Added Manually</span>
			) : cell.source_name ? (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>{cell?.source_name}</Tooltip>}
				>
					<div className="truncate_10vw">{cell?.source_name}</div>
				</OverlayTrigger>
			) : (
				<span>-</span>
			)}
		</>
	);
}
