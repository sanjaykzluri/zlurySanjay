import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { Form, Modal, Spinner } from "react-bootstrap";
import "./AddTransactionModal.scss";
import { Loader } from "../../../common/Loader/Loader";
import close from "../../../assets/close.svg";
import Button from "react-bootstrap/Button";
import { Table } from "../../../common";
import { getAppSearchGlobal } from "../../../services/api/search";
import "./WorkFlowModal.css";
import {
	getSimilarTransactions,
	assignTransaction,
} from "../../../services/api/transactions";
import {
	addApplication,
	addCustomApplication,
} from "../../../services/api/applications";
import visa from "../../../assets/transactions/visa.svg";
import bank from "../../../assets/transactions/bank.svg";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import card from "../../../assets/transactions/card.svg";
import master from "../../../assets/transactions/mastercard.svg";
import { AsyncTypeahead } from "../../../common/Typeahead/AsyncTypeahead";
import EmptyTransaction from "../../Applications/AllApps/Transactions/empty.svg";
import { AddApps } from "../../Applications/AllApps/AddApps";
import { TriggerIssue } from "../../../utils/sentry";
import { kFormatter } from "../../../constants/currency";
import Amex from "assets/transactions/Amex.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
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
			? master
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

export function WorkFlowModalins(props) {
	const initialObj = {
		mark_future_transactions: false,
		transactions: [],
	};
	const [finalObj, setfinalObj] = useState(initialObj);
	const [txnsObj, settxnsObj] = useState({});
	const dispatch = useDispatch();
	const { id, data, refreshReduxState } = props;
	const [addingnewappmodalopen, setaddingnewappmodalopen] = useState(false);
	const [zerostep, setzerostep] = useState(true);
	const [firststep, setfirststep] = useState(false);
	const [app_id, setapp_id] = useState("");
	const [app_name, setapp_name] = useState("");
	const [checkbox, setcheckbox] = useState();
	const [similartxns, setsimilartxns] = useState([]);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState();
	const [similarTxnsCount, setSimilarTxnsCount] = useState();
	const [loadingsimilartxns, setloadingsilimartxns] = useState(true);
	const [selectedIds, setSelectedIds] = useState([]);
	const [showAllTxnDescription, setShowAllTxnDescription] = useState(false);
	const [showAllTxnAmount, setShowAllTxnAmount] = useState(false);
	const [showAllPaymentMethod, setShowAllPaymentMethod] = useState(false);
	const [showAllSources, setShowAllSources] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [formErrors, setFormErrors] = useState([]);
	const [assigning, setAssigning] = useState(false);
	const [includeAllSimilarTransactions, setIncludeAllSimilarTransactions] =
		useState(false);
	const [paymentTerm, setPaymentTerm] = useState();
	const [error, setError] = useState(false);

	const handleSubmit = (application) => {
		addApplication(application).then((res) => {
			setaddingnewappmodalopen(false);
			setapp_name(application.app_name);
			setapp_id(res);
		});
	};

	const handleAppAdd = (application) => {
		setSubmitInProgress(true);
		setFormErrors([]);
		let addAppPromise;

		let errors = validateApp(application, true);
		if (errors.length > 0) {
			setFormErrors(errors);
			setSubmitInProgress(false);
			return;
		}
		addAppPromise = addCustomApplication(application);

		addAppPromise
			.then((res) => {
				if (res.error)
					throw new Error(
						"Server returned error object instead of response"
					);
				setaddingnewappmodalopen(false);
				setSubmitInProgress(false);
				if (res && res.org_app_id && res.org_app_name) {
					setapp_name(res.org_app_name);
					setapp_id(res.org_app_id);
					const temp = { ...initialObj };
					temp["org_application_id"] = res.org_app_id;
					setfinalObj(temp);
				}
			})
			.catch((err) => {
				TriggerIssue(
					"Invalid response from add custom application API",
					err
				);
				setSubmitInProgress(false);
				if (err.response && err.response.data) {
					setFormErrors(err.response.data.errors);
				}
			});
	};

	const validateApp = (application, isCustom) => {
		const requiredFieldsCustomApp = ["app_name", "app_category_id"];
		const requiredFieldsForApp = ["app_parent_id"];
		let errors = [];
		const requiredFields = isCustom
			? requiredFieldsCustomApp
			: requiredFieldsForApp;
		requiredFields.forEach((field) => {
			if (!application[field]) {
				errors.push({
					value: application[field],
					msg: "Invalid Value",
					param: field,
				});
			}
		});

		return errors;
	};

	useEffect(() => {
		if (id) {
			let transactions;
			if (Array.isArray(id)) transactions = id;
			else {
				transactions = [id];
			}
			settxnsObj({ transactions: transactions, page: page, row: 100 });
			if (finalObj.app_id || finalObj.org_application_id)
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

	const handleApplicationSelect = (app) => {
		let app_id = app.app_id;
		let key = app.is_global_app ? "app_id" : "org_application_id";

		setapp_id(app_id);
		setapp_name(app.app_name);
		const temp = { ...finalObj };
		temp[key] = app_id;
		setfinalObj(temp);
	};

	const handleCheckboxClick = (e) => {
		setcheckbox(e.target.value);
		const temp = { ...finalObj };
		temp.mark_future_transactions = e.target.checked;
		setfinalObj(temp);
	};

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

	const closeModal = () => {
		props.handleClose();
		setzerostep(true);
		setfirststep(false);
	};

	const previousScreen = () => {
		setzerostep(true);
		setfirststep(false);
	};

	const handleFetchingTransactions = (obj) => {
		setloadingsilimartxns(true);
		setzerostep(false);
		setfirststep(true);
		getSimilarTransactions(obj).then((res) => {
			setsimilartxns(res.similar_transactions);
			setloadingsilimartxns(false);
			setSimilarTxnsCount(res.count);
			setTotalPages(Math.ceil(res.count / 100));
		});
	};

	const handleAssignApp = () => {
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
			includeAllSimilarTransactions: includeAllSimilarTransactions,
		};
		assignTransaction(reqObj)
			.then(() => {
				props.setSelectedIds && props.setSelectedIds([]);
				props.clearCache && props.clearCache();
				props.handleClose && props.handleClose();
				setAssigning(false);
			})
			.catch((err) => {
				TriggerIssue("Error in assigning app to transaction", err);
				setAssigning(false);
				setError(true);
				setTimeout(() => {
					setError(false);
				}, 5000);
			});
	};

	return (
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
						Assign Transaction to Application
					</div>
					<img alt="Close" onClick={props.handleClose} src={close} />
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
												setShowAllTxnDescription(true)
											}
										>
											{`+${data.length - 1} more`}
										</div>
									) : (
										data
											.slice(1)
											.map((txn) => (
												<div className="mt-2">
													{txn.transaction_description ||
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
												txn.actual_amount >= 0 ? (
													<div className="mt-2">
														${txn.actual_amount}
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
						<div className="wfm__cont__d2__d1__text1">Source</div>
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
												setShowAllPaymentMethod(true)
											}
										>
											{`+${data.length - 1} more`}
										</div>
									) : (
										data
											.slice(1)
											.map((txn) =>
												txn.payment_method_name ? (
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
						{zerostep ? (
							<div className="wfm__cont__d2__d2__d1">
								<div className="wfm__cont__d2__d2__d1__d1">
									<AsyncTypeahead
										label="Select Application"
										placeholder="Application"
										fetchFn={getAppSearchGlobal}
										onSelect={handleApplicationSelect}
										keyFields={{
											id: "app_id",
											image: "app_image_url",
											value: "app_name",
										}}
										defaultValue={app_name}
										isWorkFlowModal={true}
										setShowAddAppModal={
											setaddingnewappmodalopen
										}
										setapp_name={setapp_name}
										allowFewSpecialCharacters={true}
									/>
								</div>
								<div
									className="wfm__cont__d2__d2__d1__d2 pt-4 pb-4"
									style={{ padding: "0px 31px" }}
								>
									<Form.Check
										type="checkbox"
										label="Automatically assign all future transactions to this app"
										onClick={handleCheckboxClick}
									/>
								</div>
							</div>
						) : loadingsimilartxns ? (
							<div className="wfm__cont__d2__d2__d1__firststep__loading">
								<Loader height={100} width={100}></Loader>
							</div>
						) : similarTxnsCount && similarTxnsCount > 0 ? (
							<div className="wfm__cont__d2__d2__d1__firststep">
								<div className="wfm__cont__d2__d2__d1__firststep__d1">
									<div>
										We’ve detected {similarTxnsCount}{" "}
										similar transactions in the past.
									</div>
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
											{Math.ceil(similarTxnsCount / 100)}
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
								<div
									className="wfm__cont__d2__d2__d1__firststep__d2 mb-0"
									style={{ marginTop: "8px" }}
								>
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
								<div className="d-flex w-100 mt-2">
									<div className="d-flex flex-column justify-content-between font-13 w-50">
										<div
											style={{
												fontSize: "13px",
												lineHeight: "16px",
												color: "black",
											}}
										>
											Select Similar Transaction:
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
												style={{ marginLeft: "15px" }}
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
												style={{ marginLeft: "40px" }}
											/>
										</div>
									</div>
									{error ? (
										<div className="warningMessage w-50 d-flex align-items-center justify-content-center">
											Server Error! We could not complete
											your request. Please try again.
										</div>
									) : null}
								</div>
							</div>
						) : (
							<div className="wfm__cont__d2__d2__d1__firststep">
								<div className="wfm__cont__d2__d2__d1__firststep__d1">
									We couldn't find any similar transactions in
									the past.
								</div>
								<div className="flex-center flex-column h-100">
									<img src={EmptyTransaction} width="250" />
									<div className="empty-header">
										No other similar transactions found
									</div>
								</div>
							</div>
						)}
						<hr style={{ margin: "0px 10px" }}></hr>
						<div className="wfm__cont__d2__d2__d2 py-3">
							{!zerostep && (
								<button
									className="btn btn-light ml-3 mr-auto"
									onClick={previousScreen}
								>
									Back
								</button>
							)}
							<button
								className="btn btn-link"
								onClick={closeModal}
							>
								Cancel
							</button>
							{zerostep ? (
								<Button
									disabled={
										finalObj.app_id ||
										finalObj.org_application_id
											? false
											: true
									}
									onClick={() =>
										handleFetchingTransactions(txnsObj)
									}
								>
									Next
								</Button>
							) : (
								<Button
									onClick={handleAssignApp}
									disabled={assigning}
								>
									{assigning ? (
										<Spinner
											animation="border"
											role="status"
											variant="light"
											size="sm"
											className="ml-2"
											style={{ borderWidth: 2 }}
										/>
									) : (
										"Assign App"
									)}
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
			{addingnewappmodalopen && (
				<>
					<div className="modal-backdrop show"></div>
					<div style={{ display: "block" }} className="modal"></div>
					<AddApps
						custom={app_name}
						handleSubmit={handleAppAdd}
						show={addingnewappmodalopen}
						onHide={() => setaddingnewappmodalopen(false)}
						submitting={submitInProgress}
						validationErrors={formErrors}
						clearValidationErrors={() => setFormErrors([])}
						style={{ zIndex: "1" }}
					/>
				</>
			)}
		</Modal>
	);
}

WorkFlowModalins.propTypes = {
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	isOpen: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
};
