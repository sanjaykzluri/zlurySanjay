import React, { useState, useEffect } from "react";
import { Loader } from "../../../common/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { Form, Modal, Spinner } from "react-bootstrap";
import close from "../../../assets/close.svg";
import Button from "react-bootstrap/Button";
import { Table } from "../../../common";
import {
	getSimilarTransactions,
	getSimilarAssignedTransactions,
} from "../../../services/api/transactions";
import visa from "../../../assets/transactions/visa.svg";
import bank from "../../../assets/transactions/bank.svg";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import card from "../../../assets/transactions/card.svg";
import EmptyTransaction from "../../Applications/AllApps/Transactions/empty.svg";
import { TriggerIssue } from "../../../utils/sentry";
import { kFormatter } from "../../../constants/currency";
import Amex from "assets/transactions/Amex.svg";
import warning from "../../../assets/icons/delete-warning.svg";
import AppTableComponent from "../../../common/AppTableComponent";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { transactionConstants } from "../../../constants";
import rightarrow from "../Recognised/rightarrow.svg";
import leftarrow from "../Recognised/leftarrow.svg";
import { dateFormatter } from "../Recognised/RecognisedTransactionsTable";

function getPaymentLogo(paymentMethod) {
	var image;
	var type = paymentMethod.details?.type || paymentMethod.type;
	image =
		type === "credit_card"
			? card
			: type === "visa"
			? visa
			: type === "mastercard"
			? visa
			: type === "american_express"
			? Amex
			: type === "bank"
			? bank
			: type === "other" && paymentMethod.logo_url !== ""
			? paymentMethod.logo_url
			: otherpayment;
	return image;
}

function PaymentFormatter(cell, row, rowIndex, formatExtraData) {
	if (cell) {
		return (
			<>
				{cell.name === null ? (
					<>-</>
				) : (
					<div className="flex flex-row center">
						<img
							src={getPaymentLogo(cell)}
							style={{ height: "14px" }}
						></img>
						<div style={{ marginLeft: "8px" }}>{cell.name}</div>
					</div>
				)}
			</>
		);
	} else {
		return <>-</>;
	}
}
export function UnassignArchiveModal(props) {
	const initialObj = {
		mark_future_transactions: false,
		transactions: [],
	};
	const [finalObj, setfinalObj] = useState(initialObj);
	const dispatch = useDispatch();
	const { id, data, title, refreshReduxState, onSuccess } = props;

	const [txnsObj, settxnsObj] = useState({});
	const [selectedIds, setSelectedIds] = useState([]);
	const [similartxns, setsimilartxns] = useState([]);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState();
	const [similarTxnsCount, setSimilarTxnsCount] = useState();
	const [loadingsimilartxns, setloadingsilimartxns] = useState(true);
	const [showAllTxnDescription, setShowAllTxnDescription] = useState(false);
	const [showAllTxnAmount, setShowAllTxnAmount] = useState(false);
	const [showAllPaymentMethod, setShowAllPaymentMethod] = useState(false);
	const [showAllSources, setShowAllSources] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [assigning, setAssigning] = useState(false);
	const [includeAllSimilarTransactions, setIncludeAllSimilarTransactions] =
		useState(false);
	const [paymentTerm, setPaymentTerm] = useState();

	const handleCheckboxClick = (e) => {
		const temp = { ...finalObj };
		temp.mark_future_transactions = e.target.checked;
		setfinalObj(temp);
	};
	useEffect(() => {
		if (id) {
			let transactions;
			if (Array.isArray(id)) transactions = id;
			else {
				transactions = [id];
			}
			settxnsObj({ transactions: transactions, page: page, row: 100 });
			handleFetchingTransactions({
				transactions: transactions,
				page: page,
				row: 100,
			});
		}
	}, [page]);

	useEffect(() => {
		if (Array.isArray(props.data) && props.data.length) {
			const temp = { ...finalObj };
			temp.transactions = Array.isArray(props.data)
				? props.data.map((t) => t?._id || t?.transaction_upload_id)
				: [];
			setfinalObj(temp);
		}
	}, [props.data]);

	const columns = [
		{
			dataField: "description",
			text: "Transaction Description",
		},
		{
			dataField: "date",
			text: "Trans. Date",
			formatter: dateFormatter,
		},
		{
			dataField: "original_amount",
			text: "Amount",
			formatter: (row, data) => (
				<div>{kFormatter(data.actual_amount)}</div>
			),
		},
		{
			dataField: "source_type",
			text: "Source",
		},
		{
			dataField: "payment_method_id",
			text: "Payment Method",
			formatter: PaymentFormatter,
		},
	];
	if (title === "Unassign Transaction") {
		columns.unshift({
			dataField: "transaction_app",
			text: "Application",
			formatter: (dataField) => (
				<AppTableComponent
					app_name={dataField?.app_name}
					app_logo={dataField?.app_logo_url}
					app_auth_status={dataField?.app_state}
					app_id={dataField?.app_id}
					logo_height="auto"
					logo_width={20}
				/>
			),
		});
	}
	const selectRow = {
		mode: "checkbox",
		clickToSelect: true,
		onSelect: (row, isSelect, rowIndex, e) => {
			if (isSelect) {
				if (!selectedIds.includes(row._id)) {
					setSelectedIds(selectedIds.concat([row._id]));
				}
			} else {
				if (selectedIds.includes(row._id)) {
					setSelectedIds(selectedIds.filter((el) => el !== row._id));
				}
			}
		},
		onSelectAll: (isSelect, rows) => {
			if (isSelect) {
				var temp = rows.map((el) => el._id);
				setSelectedIds(selectedIds.concat([...temp]));
			} else {
				let idsToBeRemoved = rows.map((row) => row._id);
				setSelectedIds(
					selectedIds.filter((el) => !idsToBeRemoved.includes(el))
				);
			}
		},
		selected: selectedIds,
		hideSelectColumn: includeAllSimilarTransactions,
	};
	const stopPropagation = (event) => {
		event.stopPropagation();
	};

	const handleFetchingTransactions = (obj) => {
		setloadingsilimartxns(true);
		if (props.isUnrecognisedPage) {
			getSimilarTransactions(obj).then((res) => {
				setsimilartxns(res.similar_transactions);
				setloadingsilimartxns(false);
				setSimilarTxnsCount(res.count);
				setTotalPages(Math.ceil(res.count / 100));
			});
		} else {
			getSimilarAssignedTransactions(obj).then((res) => {
				setsimilartxns(res.similar_transactions);
				setloadingsilimartxns(false);
				setSimilarTxnsCount(res.count);
				setTotalPages(Math.ceil(res.count / 100));
			});
		}
	};

	const handleRequestFunction = () => {
		setAssigning(true);
		const tempArr = [...finalObj.transactions];
		let transactionArr;
		if (Array.isArray(id)) {
			transactionArr = [...new Set(tempArr.concat(id))];
		} else {
			tempArr.push(id);
			transactionArr = [...new Set(tempArr)];
		}
		transactionArr = transactionArr.concat(selectedIds);
		const reqObj = {
			...finalObj,
			filter_by: [],
			transactions: transactionArr,
			[props.isUnrecognisedPage
				? "includeAllSimilarTransactions"
				: "includeAllSimilarAssignedTransactions"]: includeAllSimilarTransactions,
		};
		props.requestFunction(reqObj).then(() => {
			refreshReduxState();
			props.setSelectedIds([]);
			props.handleClose();
			props.setSelectedTransactions([]);
			onSuccess && onSuccess();
			setAssigning(false);
		});
	};

	const handleUnrecognisedRequestFunction = () => {
		setAssigning(true);
		const tempArr = [...finalObj.transactions];
		let transactionArr;
		if (Array.isArray(id)) {
			transactionArr = [...new Set(tempArr.concat(id))];
		} else {
			tempArr.push(id);
			transactionArr = [...new Set(tempArr)];
		}
		transactionArr = transactionArr.concat(selectedIds);
		const reqObj = {
			...finalObj,
			filter_by: [],
			transactions: transactionArr,
			[props.isUnrecognisedPage
				? "includeAllSimilarTransactions"
				: "includeAllSimilarAssignedTransactions"]: includeAllSimilarTransactions,
		};
		props.requestFunction(reqObj).then(() => {
			refreshReduxState();
			props.setSelectedIds([]);
			props.handleClose();
			onSuccess && onSuccess();
			props.setSelectedTransactions([]);
			setAssigning(false);
		});
	};

	return (
		<>
			<Modal
				show={props.isOpen}
				onHide={props.handleClose}
				size="xl"
				centered
				onClick={stopPropagation}
			>
				<div className="wfm__cont">
					<div className="wfm__cont__d1 py-3">
						<div className="wfm__cont__d1__d1">
							<img
								src={warning}
								alt="warning icon"
								width={23}
								className="mr-2"
							/>{" "}
							{title}
						</div>
						<img
							alt="Close"
							onClick={props.handleClose}
							src={close}
						/>
					</div>
					<hr style={{ margin: "0px 10px" }}></hr>
					<div className="wfm__cont__d2">
						<div className="wfm__cont__d2__d1">
							<div className="wfm__cont__d2__d1__text1">
								Transaction Description
							</div>
							<div className="wfm__cont__d2__d1__text2">
								<div>{data[0]?.transaction_description}</div>
								{data.length > 1 && (
									<>
										{!showAllTxnDescription ? (
											<div
												className="count-text cursor-pointer"
												onClick={() =>
													setShowAllTxnDescription(
														true
													)
												}
											>
												{`+${data.length - 1} more`}
											</div>
										) : (
											data
												.slice(1)
												.map((txn) => (
													<div className="mt-2">
														{txn?.transaction_description ||
															"-"}
													</div>
												))
										)}
									</>
								)}
							</div>
							<div className="wfm__cont__d2__d1__text1">
								Transaction Amount
							</div>
							<div className="wfm__cont__d2__d1__text2">
								<div>{kFormatter(data[0]?.actual_amount)}</div>
								{data.length > 1 && (
									<>
										{!showAllTxnAmount ? (
											<div
												className="count-text cursor-pointer"
												onClick={() =>
													setShowAllTxnAmount(true)
												}
											>
												{`+${data.length - 1} more`}
											</div>
										) : (
											data
												.slice(1)
												.map((txn) =>
													txn?.actual_amount >= 0 ? (
														<div className="mt-2">
															$
															{txn?.actual_amount}
														</div>
													) : (
														<div className="mt-2">
															-
														</div>
													)
												)
										)}
									</>
								)}
							</div>
							<div className="wfm__cont__d2__d1__text1">
								Source
							</div>
							<div className="wfm__cont__d2__d1__text2">
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{data[0]?.source_type === "manually"
												? "Added Manually"
												: data[0]?.source_name || ""}
										</Tooltip>
									}
								>
									<div
										className="text-truncate"
										style={{
											width: "fit-content",
											maxWidth: "200px",
										}}
									>
										{data[0]?.source_type === "manually"
											? "Added Manually"
											: data[0]?.source_name}
									</div>
								</OverlayTrigger>
								{data.length > 1 && (
									<>
										{!showAllSources ? (
											<div
												className="count-text cursor-pointer"
												onClick={() =>
													setShowAllSources(true)
												}
											>
												{`+${data.length - 1} more`}
											</div>
										) : (
											data.slice(1).map((txn) => (
												<OverlayTrigger
													placement="top"
													overlay={
														<Tooltip>
															{txn?.source_type ===
															"manually"
																? "Added Manually"
																: txn?.source_name ||
																  ""}
														</Tooltip>
													}
												>
													<div
														className="mt-2 text-truncate"
														style={{
															width: "fit-content",
															maxWidth: "200px",
														}}
													>
														{txn?.source_type ===
														"manually"
															? "Added Manually"
															: txn?.source_name}
													</div>
												</OverlayTrigger>
											))
										)}
									</>
								)}
							</div>
							<div className="wfm__cont__d2__d1__text1">
								Payment Method
							</div>
							<div className="wfm__cont__d2__d1__text2">
								<div>{data[0]?.payment_method_name || "-"}</div>
								{data.length > 1 && (
									<>
										{!showAllPaymentMethod ? (
											<div
												className="count-text cursor-pointer"
												onClick={() =>
													setShowAllPaymentMethod(
														true
													)
												}
											>
												{`+${data.length - 1} more`}
											</div>
										) : (
											data
												.slice(1)
												.map((txn) =>
													txn ? (
														<div className="mt-2">
															{
																txn.payment_method_name
															}
														</div>
													) : (
														<div className="mt-2">
															-
														</div>
													)
												)
										)}
									</>
								)}
							</div>
						</div>
						<div className="wfm__cont__d2__d2">
							{loadingsimilartxns ? (
								<div className="wfm__cont__d2__d2__d1__firststep__loading">
									<Loader height={100} width={100}></Loader>
								</div>
							) : similarTxnsCount && similarTxnsCount > 0 ? (
								<div className="wfm__cont__d2__d2__d1__firststep">
									<div className="wfm__cont__d2__d2__d1__firststep__d1">
										We’ve detected {similarTxnsCount}{" "}
										similar transactions in the past.
										<div className="transaction__table__page__selector">
											<div
												onClick={() => {
													if (page !== 0) {
														setPage(page - 1);
													}
												}}
												className="table__info__text__right2 cursor-pointer"
											>
												<img src={leftarrow} />
											</div>
											<div className="table__info__text__right2">
												Page {page + 1} of{" "}
												{Math.ceil(
													similarTxnsCount / 100
												)}
											</div>
											<div
												onClick={() => {
													if (page < totalPages - 1) {
														setPage(page + 1);
													}
												}}
												className="table__info__text__right2 cursor-pointer"
											>
												<img src={rightarrow} />
											</div>
										</div>
									</div>
									<div className="wfm__cont__d2__d2__d1__firststep__d2 mb-0">
										<Table
											columns={columns}
											data={similartxns || []}
											hover
											remote={false}
											keyField="_id"
											selectRow={selectRow}
											rowStyle={{ height: "37px" }}
										/>
									</div>
									<div
										className="wfm__cont__d2__d2__d1__firststep__d3 m-auto border-0 border-radius-4"
										style={{
											backgroundColor:
												"rgba(90, 186, 255, 0.1)",
										}}
									>
										{similarTxnsCount &&
											similarTxnsCount > 0 && (
												<div className="d-flex flex-column justify-content-between font-13 w-50">
													<div
														style={{
															fontSize: "13px",
															lineHeight: "16px",
															color: "black",
														}}
													>
														Select Similar
														Transaction:
													</div>
													<div className="d-flex">
														<Form.Check
															className="pl-1"
															type="radio"
															label={`Include All`}
															name="includeAll"
															id="all"
															onClick={() =>
																setIncludeAllSimilarTransactions(
																	true
																)
															}
															style={{
																marginLeft:
																	"15px",
															}}
														/>
														<Form.Check
															className="pl-1"
															type="radio"
															label={`Select Manually`}
															name="includeAll"
															id="manually"
															defaultChecked
															onClick={() =>
																setIncludeAllSimilarTransactions(
																	false
																)
															}
															style={{
																marginLeft:
																	"40px",
															}}
														/>
													</div>
												</div>
											)}
										<Form.Check
											type="checkbox"
											label={
												title === "Unassign Transaction"
													? "Automatically unassign all future transactions from this app"
													: "All future transactions will be archived automatically"
											}
											onClick={handleCheckboxClick}
										/>
									</div>
								</div>
							) : (
								<div className="wfm__cont__d2__d2__d1__firststep">
									<div className="wfm__cont__d2__d2__d1__firststep__d1">
										We couldn't find any similar
										transactions in the past.
									</div>
									<div className="flex-center flex-column h-50">
										<img
											src={EmptyTransaction}
											width="250"
										/>
										<div className="empty-header">
											No other similar transactions found
										</div>
									</div>
									<div
										className="wfm__cont__d2__d2__d1__firststep__d3 border-0 border-radius-4"
										style={{
											backgroundColor:
												"rgba(90, 186, 255, 0.1)",
										}}
									>
										<Form.Check
											type="checkbox"
											label={
												title === "Unassign Transaction"
													? "Automatically unassign all future transactions from this app"
													: "All future transactions will be archived automatically"
											}
											onClick={handleCheckboxClick}
										/>
									</div>
								</div>
							)}
							<hr style={{ margin: "0px 10px" }}></hr>
							<div className="wfm__cont__d2__d2__d2 py-3">
								<button
									className="btn btn-link"
									onClick={() => props.handleClose()}
								>
									Cancel
								</button>
								<Button
									onClick={
										props.isUnrecognisedPage
											? handleUnrecognisedRequestFunction
											: handleRequestFunction
									}
									disabled={assigning}
								>
									{props.buttonText}
									{assigning && (
										<Spinner
											animation="border"
											role="status"
											variant="light"
											size="sm"
											className="ml-2"
											style={{ borderWidth: 2 }}
										>
											<span className="sr-only">
												Loading...
											</span>
										</Spinner>
									)}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
}
