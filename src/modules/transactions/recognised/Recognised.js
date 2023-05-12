import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";
import {
	getOrgTriggerStatus,
	getRecognisedTransactionsV2,
	getTransactionsPropertiesList,
	searchRecognisedTransactionsV2,
	setPMTransBulk,
} from "services/api/transactions";
import AppTableComponent from "common/AppTableComponent";
import { kFormatter } from "constants/currency";
import master from "assets/transactions/mastercard.svg";
import visa from "assets/transactions/visa.svg";
import bank from "assets/transactions/bank.svg";
import otherpayment from "assets/transactions/otherpayment.svg";
import card from "assets/transactions/card.svg";
import Amex from "assets/transactions/Amex.svg";
import { showrestrictedPopup } from "common/restrictions";
import BulkChangePaymentMethod from "modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import InfiniteTableContainer from "modules/v2InfiniteTable/InfiniteTableContainer";
import Dropdown from "components/Transactions/Recognised/Dropdown";
import { RecognisedExport } from "./RecognisedExport";
import { BulkEditRecognised } from "./BulkEditRecognised";
import { useDispatch } from "react-redux";
import { openModal } from "reducers/modal.reducer";
import { v2EntitiesTransactions } from "constants";
import "../transactions.css";
import SpendTrigger from "../spend-trigger/SpendTrigger";
import { TriggerIssue } from "utils/sentry";

export default function RecognisedTable() {
	
	const dispatch = useDispatch();
	const [orgTriggerStatus, setOrgTriggerStatus] = useState();
	const [orgTriggerStatusLoading, setOrgTriggerStatusLoading] = useState();

	const fetchAndSetOrgTriggerStatus = () => {
		setOrgTriggerStatusLoading(true);
		getOrgTriggerStatus()
			.then((res) => {
				setOrgTriggerStatusLoading(false);
				setOrgTriggerStatus(res.spends_cal_status);
			})
			.catch((err) => {
				setOrgTriggerStatusLoading(false);
				TriggerIssue("Error in fetching org trigger status", err);
			});
	};

	useEffect(() => {
		fetchAndSetOrgTriggerStatus();
	}, []);

	const getColumnsMapper = (handleRefresh) => {
		const columnsMapper = {
			application: {
				dataField: "app_name",
				text: "Applications",
				sortKey: "app_name",
				// eslint-disable-next-line react/display-name
				formatter: (cell, dataField) => (
					<AppTableComponent
						app_name={dataField?.app_name}
						app_logo={dataField?.app_logo}
						app_auth_status={dataField?.app_state}
						app_id={dataField?.org_application_id}
						logo_height="auto"
						logo_width={28}
					/>
				),
			},
			transaction_description: {
				dataField: "transaction_description",
				text: "Transaction Description",
				sortKey: "transaction_description",
				formatter: (dataField) => (
					<div className="d-flex">
						<OverlayTrigger
							placement="top"
							overlay={
								<BootstrapTooltip>{dataField}</BootstrapTooltip>
							}
						>
							<div className="truncate_10vw">{dataField}</div>
						</OverlayTrigger>
					</div>
				),
			},
			transaction_date: {
				dataField: "transaction_date",
				text: "Transaction Date",
				sortKey: "transaction_date",
				formatter: dateFormatter,
			},
			actual_amount: {
				dataField: "actual_amount",
				text: "Amount",
				sortKey: "actual_amount",
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
				formatter: (cell, row) =>
					kFormatter(cell, row.original_currency),
			},
		};
		return columnsMapper;
	};

	const customProps = {
		columnsMapper: getColumnsMapper,
		v2TableEntity: v2EntitiesTransactions.recognized,
		v2SearchFieldId: "transaction_description",
		v2SearchFieldName: "Transaction Description",
		getAPI: getRecognisedTransactionsV2,
		searchAPI: searchRecognisedTransactionsV2,
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
				<BulkEditRecognised
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
				></BulkEditRecognised>
			);
		},
		onAddClick: (handleRefresh) =>
			dispatch(
				openModal("transaction", {
					handleRefresh,
				})
			),
		exportComponent: RecognisedExport,
		set_all_present: true,
		bulkUpdateViaCSVComponent: () => (
			<SpendTrigger
				loading={orgTriggerStatusLoading}
				orgTriggerStatus={orgTriggerStatus}
				onApiSuccess={fetchAndSetOrgTriggerStatus}
			/>
		),
	};

	return (
		<>
			<InfiniteTableContainer {...customProps} />
		</>
	);
}

export function dateFormatter(row, cell) {
	if (cell) {
		let dateStringArr = new Date(cell.transaction_date || cell.date)
			.toUTCString()
			.split(" ");
		let date =
			dateStringArr[1] + " " + dateStringArr[2] + " " + dateStringArr[3];
		return <>{date}</>;
	}
	return <>-</>;
}
function getReturnTo() {
	return window.location.pathname.split("/")[1];
}
export function sourceFormatter(row, cell) {
	return (
		<>
			<>
				{cell.source_type === "manually" ? (
					<span>Added Manually</span>
				) : cell.source_name ? (
					<OverlayTrigger
						placement="top"
						overlay={
							<BootstrapTooltip>
								{cell.source_name}
							</BootstrapTooltip>
						}
					>
						<div className="truncate_10vw">
							{cell.source_type === "uploads" ? (
								<Link
									className="custom__app__name__css"
									style={{ textDecoration: "none" }}
									to={{
										pathname: `/transactions/uploads/${cell.source_id
											}?returnTo=${getReturnTo()}`,
										hash: "#recognised",
										state: { name: row },
									}}
								>
									{cell.source_name}
								</Link>
							) : (
								cell.source_name
							)}
						</div>
					</OverlayTrigger>
				) : (
					<span>-</span>
				)}
			</>
		</>
	);
}

export function PaymentFormatter(row, cell, rowIndex, formatExtraData) {
	return (
		<div
			onClickCapture={(e) => {
				if (formatExtraData.isBasicSubscription) {
					e.preventDefault();
					e.stopPropagation();
					showrestrictedPopup(formatExtraData.entity);
				}
			}}
		>
			{cell.payment_method_id === null && !formatExtraData.isViewer ? (
				<>
					<Dropdown
						fetch={formatExtraData.refreshReduxState}
						cell={cell}
						id={row.transaction_upload_id || row.transaction_id}
						page={formatExtraData.page}
						segmentCategory="Recognised"
					></Dropdown>
				</>
			) : cell.payment_method_id === null && formatExtraData.isViewer ? (
				<div className="flex flex-row center">
					<div style={{ marginLeft: "8px" }} className="grey-1">
						<span>No Payment Method</span>
					</div>
				</div>
			) : (
				<div className="flex flex-row center">
					<img
						src={getImageForPaymentMethodTable(cell)}
						alt=""
						style={{
							maxHeight: "15px",
							marginRight: "8px",
							minWidth: "20.63px",

						}}
					></img>
					<div style={{ marginLeft: "8px" }}>
						{cell?.payment_method_name}
					</div>
				</div>
			)}
		</div>
	);
}

export function getImageForPaymentMethodTable(paymentMethod) {
	var image;
	var type =
		paymentMethod.payment_method_details_type ||
		paymentMethod.payment_method_type;
	image =
		type === "credit_card"
			? card
			: type === "visa"
				? visa
				: type === "mastercard"
					? master
					: type === "american_express"
						? Amex
						: type === "bank"
							? bank
							: type === "other" && paymentMethod.payment_method_logo_url !== ""
								? paymentMethod.payment_method_logo_url
								: otherpayment;
	return image;
}
