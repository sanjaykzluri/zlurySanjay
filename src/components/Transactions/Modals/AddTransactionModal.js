import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Form, Modal, Row, Col, Spinner } from "react-bootstrap";
import "./AddTransactionModal.scss";
import { Loader } from "../../../common/Loader/Loader";
import close from "../../../assets/close.svg";
import Button from "react-bootstrap/Button";
import calendar from "../../Applications/Contracts/calendar.svg";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
	checkSpecialCharacters,
	getAppSearchGlobal,
} from "../../../services/api/search";
import { addCustomApplication } from "../../../services/api/applications";
import {
	addTransaction,
	getPaymentMethods,
} from "../../../services/api/transactions";
import { debounce, unescape } from "../../../utils/common";
import { client } from "../../../utils/client";
import {
	AddApps,
	IntegrationAvailableSection,
} from "../../Applications/AllApps/AddApps";
import master from "../../../assets/transactions/mastercard.svg";
import visa from "../../../assets/transactions/visa.svg";
import bank from "../../../assets/transactions/bank.svg";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import card from "../../../assets/transactions/card.svg";
import { DatePicker } from "../../../UIComponents/DatePicker/DatePicker";
import { currencySymbols } from "../../../constants/currency";
import * as Sentry from "@sentry/browser";
import { TriggerIssue } from "../../../utils/sentry";
import { getImageForPaymentMethodDropdown } from "../Recognised/Dropdown";
import integrationavailable from "assets/applications/integrationavailable.svg";
import { getValueFromLocalStorage } from "utils/localStorage";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";
import { dateResetTimeZone } from "utils/DateUtility";

function SuggestionBar(props) {
	return (
		<>
			<div className="SuggestionBardiv__TM shadow-sm d-block">
				{props.loading ? (
					<>
						<div className="option__card__WFM">
							<Loader height={60} width={60}></Loader>
						</div>
					</>
				) : (
					props.options?.map((option, index) => (
						<>
							<button
								className="suggestion-item w-100 pl-3 m-0"
								style={{ textAlign: "left" }}
								onClick={() => {
									let temp = "";
									if (option.is_global_app) {
										temp = "app_id";
									} else {
										temp = "org_application_id";
									}
									props.handleSelect(
										option.app_id ||
											option.org_application_id,
										option.app_name,
										temp,
										option.parentId
									);
									props.onHide();
								}}
							>
								<img
									src={
										unescape(option.app_image_url) ||
										`https://ui-avatars.com/api/?name=${option.app_name}`
									}
									style={{
										height: "24px",
										width: "24px",
										marginRight: "10px",
									}}
								></img>
								<div className="overflow-scroll text-nowrap text-truncate">
									{option.app_name}
								</div>
								{props.showAdditionalRightInformation &&
									props.additionalInformationFormatter(
										option[props.additional_information]
											? true
											: false
									)}
							</button>
							{!(index == props.options.length - 1) ? (
								<hr style={{ margin: "0px 18px" }}></hr>
							) : null}
						</>
					))
				)}
				<button
					className="ml-3 SuggestionBar__button"
					onClick={() => {
						props.handlenewapplication(true);
						props.onHide();
					}}
				>
					+ Add New Application
				</button>
			</div>
		</>
	);
}

export function AddTransactionModal(props) {
	const [value, setvalue] = useState([]);
	const [display, setdisplay] = useState(false);
	const [displayoption, setdisplayoption] = useState(false);
	const [idarray, setid] = useState("");
	const [showcalendar, setshowcalendar] = useState(false);
	const [searchresult, setsearchresult] = useState("");
	const [app_name, setapp_name] = useState("");
	const [app_id, setapp_id] = useState("");
	const [loading, setloading] = useState(true);
	const [showHide, setshowHide] = useState(false);
	const [dd1active, setdd1active] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [tSubmitting, setTSubmitting] = useState(false);
	const [formErrors, setFormErrors] = useState([]);
	const [validated, setValidated] = useState(false);
	const [isAmountEntered, setAmountEntered] = useState(true);

	let currencyOptions = Object.keys(currencySymbols).map((currency) => (
		<option key={currency} value={currency}>
			{currency}
		</option>
	));

	let userInfo = getValueFromLocalStorage("userInfo");
	const currency = userInfo?.org_currency;

	const isFormValid = () => {
		const fieldsToValidate = [
			"actual_amount",
			"currency",
			"original_amount",
			"original_currency",
			"payment_method_id",
		];
		if (fieldsToValidate.find((field) => !finalObj[field])) return false;
		return true;
	};

	const handleSubmitAddTransaction = (event) => {
		if (!event) return;

		event.preventDefault();
		event.stopPropagation();

		if (isFormValid() === false) {
			setValidated(true);
			!finalObj.actual_amount && setAmountEntered(false);
		} else {
			setTSubmitting(true);
			setValidated(false);
			setAmountEntered(true);
			setPaymentValue("");
			addTransaction(finalObj)
				.then((res) => {
					setTSubmitting(false);
					props.handleClose();
					props.modalProps.handleRefresh &&
						props.modalProps.handleRefresh();
				})
				.catch((err) => {
					setTSubmitting(false);
					if (err.response && err.response.data) {
						setFormErrors(err.response.data.errors);
					}
				});
		}
	};

	const [finalObj, setfinalObj] = useState({
		payment_method_id: "",
		description: "Application/added manually",
		original_currency: currency,
		currency: currency,
		date: dateResetTimeZone(new Date()),
	});
	const [paymentName, setPaymentName] = useState("");
	const [paymentValue, setPaymentValue] = useState("");
	const [paymentMethods, setPaymentMethods] = useState([]);
	const [paymentLoading, setPaymentLoading] = useState(true);
	const [addingnewappmodalopen, setaddingnewappmodalopen] = useState(false);
	const [paymentsearchresult, setpaymentsearchresult] = useState([]);
	const [date, setdate] = useState(dateResetTimeZone(new Date()));
	useEffect(() => {
		if (paymentLoading) {
			getPaymentMethods().then((res) => {
				setPaymentMethods(res.data);
				setPaymentLoading(false);
			});
		}
	}, []);
	const cancelToken = useRef();
	useEffect(() => {
		if (props.application) {
			updatevaluefrommodal(
				props.application.app_id,
				props.application.app_name,
				"org_application_id"
			);
		}
		if (props.submitting) setTSubmitting(props.submitting);

		return () => {
			setapp_name("");
			setfinalObj({
				payment_method_id: "",
				description: "Application/added manually",
				original_currency: currency,
				currency: currency,
				date: dateResetTimeZone(new Date()),
			});
			setPaymentName("");
			setdate(dateResetTimeZone(new Date()));
		};
	}, [props]);

	const handleEdit = (key1, key2, value) => {
		const tempDep = { ...finalObj, [key2]: value, [key1]: value };
		setfinalObj(tempDep);
		if (key1 === "actual_amount") setAmountEntered(value ? true : false);
	};
	let handleChange = (key, value) => {
		value = value?.trimStart();
		setapp_name(value);
		setapp_id(null);
		if (cancelToken.current)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);
		cancelToken.current = client.CancelToken.source();
		if (checkSpecialCharacters(value, true)) {
			setshowHide(true);
			setloading(false);
			return;
		} else generateAppSuggestions(value, cancelToken.current);
		if (value.length > 0) {
			setshowHide(true);
			setloading(true);
		} else {
			setshowHide(false);
		}
		if (value.length === 0) {
			const temp = { ...finalObj };
			temp.org_application_id = "";
			delete temp["org_application_id"];
			delete temp["app_id"];
			setfinalObj(temp);
		}
	};

	const generateAppSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				getAppSearchGlobal(query, reqCancelToken).then((res) => {
					setsearchresult(res);
					setloading(false);
				});
			}
		}, 300)
	);

	let handleChangePayment = (value, paymentLoading) => {
		setPaymentValue(value);
		setPaymentName(value);
		const search = value.toLowerCase();
		const matchingPaymentArray = [];
		if (value.length > 0) {
			setdd1active(true);
		} else {
			setdd1active(false);
		}
		if (paymentLoading === false) {
			if (
				Array.isArray(paymentMethods?.payment_ccs) &&
				paymentMethods?.payment_ccs?.length > 0
			) {
				paymentMethods?.payment_ccs.map((el) => {
					if (el.cc_card_name?.toLowerCase().includes(search)) {
						matchingPaymentArray.push(el);
					}
				});
			}
			if (
				Array.isArray(paymentMethods?.payment_banks) &&
				paymentMethods?.payment_banks?.length > 0
			) {
				paymentMethods?.payment_banks.map((el) => {
					if (el.bank_name?.toLowerCase().includes(search)) {
						matchingPaymentArray.push(el);
					}
				});
			}
			if (
				Array.isArray(paymentMethods?.payment_others) &&
				paymentMethods?.payment_others?.length > 0
			) {
				paymentMethods?.payment_others.map((el) => {
					if (
						el.payment_method_name?.toLowerCase().includes(search)
					) {
						matchingPaymentArray.push(el);
					}
				});
			}
		}
		setpaymentsearchresult(matchingPaymentArray);
	};

	const updatevaluefrommodal = (
		app_id,
		app_name,
		key,
		org_application_id
	) => {
		setapp_id(app_id);
		setapp_name(app_name);
		const temp = { ...finalObj };
		temp[key] = app_id;
		temp["hashkey"] = app_name;
		setfinalObj(temp);
	};
	const updatenewappfrommodal = (value) => {
		setaddingnewappmodalopen(value);
	};
	let addCardClose = () => setshowHide(false);

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
					updatevaluefrommodal(
						res.org_app_id,
						res.org_app_name,
						"org_application_id",
						""
					);
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

	const onChangeDate = (date) => {
		setdate(date);
		let temp = { ...finalObj };
		temp["date"] = date;
		setfinalObj(temp);
		setshowcalendar(false);
	};
	function dateFormatter(cell, row) {
		if (cell) {
			let date = new Date(cell)
				.toLocaleDateString("en-GB", {
					day: "numeric",
					month: "short",
					year: "numeric",
				})
				.split(" ")
				.join(" ");

			return <>{date}</>;
		}
		return <>-</>;
	}

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
	function handleClose(e) {
		if (!e) return;

		setValidated(false);
		setAmountEntered(true);
		setPaymentValue("");
		setapp_id(null);
		modalClose();
	}

	const modalClose = () => {
		props.handleClose();
		setshowHide(false);
		setshowcalendar(false);
		setdd1active(false);
		setpaymentsearchresult([]);
	};
	return (
		<>
			<Modal centered show={props.isOpen} onHide={(e) => handleClose(e)}>
				<Form noValidate onSubmit={handleSubmitAddTransaction}>
					<Modal.Header closeButton={false}>
						<Modal.Title>Add Transaction Manually</Modal.Title>
						<img
							alt="Close"
							onClick={(e) => handleClose(e)}
							src={close}
						/>
					</Modal.Header>
					<hr />
					<Modal.Body>
						<div className="addTransactionModal__body_upper">
							<div className="addTransactionModal__body_upper_inner">
								<Form.Group className="w-100">
									<div style={{ marginBottom: "15px" }}>
										<Form.Label style={{ opacity: 0.8 }}>
											Select Application
										</Form.Label>
										<Form.Control
											style={{ width: "100%" }}
											type="text"
											value={app_name}
											isInvalid={validated && !app_id}
											placeholder="Application"
											disabled={
												props.application &&
												props.application.app_id
											}
											onChange={(e) =>
												handleChange(
													"name",
													e.target.value
												)
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please choose a Application name.
										</Form.Control.Feedback>
									</div>
									<div style={{ position: "relative" }}>
										{showHide ? (
											<SuggestionBar
												loading={loading}
												options={searchresult.results}
												onHide={addCardClose}
												handleSelect={
													updatevaluefrommodal
												}
												handlenewapplication={
													updatenewappfrommodal
												}
												additional_information={
													"app_integration_id"
												}
												showAdditionalRightInformation={
													true
												}
												additionalInformationFormatter={(
													value
												) => {
													if (value) {
														return IntegrationAvailableSection();
													}
												}}
											></SuggestionBar>
										) : null}
									</div>
								</Form.Group>
							</div>
						</div>
						<div className="addTransactionModal__body_lower">
							<div
								className="addTransactionModal__body_lower_inner"
								style={{ width: "85%" }}
							>
								<Row className="w-100 m-auto">
									<Col>
										<Form.Group>
											<Form.Label
												style={{ opacity: 0.8 }}
											>
												Amount
											</Form.Label>
											<div
												style={
													isAmountEntered
														? {
																border: "1px solid #DDDDDD",
																borderRadius: 4,
														  }
														: {
																border: "1px solid #dc3545",
																borderRadius: 4,
														  }
												}
												className="d-flex flex-row align-items-center"
											>
												<Form.Control
													required
													defaultValue={currency}
													className="pr-0 cursor-pointer"
													style={{
														border: "none",
														height: "10px !important",
														backgroundImage: "none",
													}}
													as="select"
													isInvalid={
														!finalObj["currency"]
													}
													onChange={(e) =>
														handleEdit(
															"currency",
															"original_currency",
															e.target.value
														)
													}
												>
													{currencyOptions}
												</Form.Control>
												<Form.Control
													required
													style={{
														border: "none",
														height: "10px! important",
														overflowY: "scroll",
													}}
													type="number"
													placeholder="Amount"
													onChange={(e) =>
														handleEdit(
															"actual_amount",
															"original_amount",
															e.target.value
														)
													}
												/>
											</div>
											<Form.Control.Feedback
												className={
													!isAmountEntered
														? "d-block"
														: null
												}
												type="invalid"
											>
												Please enter a valid amount.
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col>
										<Form.Group>
											<Form.Label>
												Transaction Date
											</Form.Label>
											<NewDatePicker
												key={`${date}`}
												placeholder="Transaction Date"
												onChange={onChangeDate}
												calendarClassName="rangefilter-calendar"
												calendarContainerClassName="schedule-date-calendar"
												value={date}
												maxDate={new Date()}
											/>
										</Form.Group>
									</Col>
								</Row>
							</div>
						</div>
						<div
							className="addTransactionModal__body_lower_inner"
							style={{ width: "85%" }}
						>
							<div
								style={{
									width: "45%",
									height: "100%",
									marginLeft: "15px",
								}}
							>
								<Form.Label style={{ opacity: 0.8 }}>
									Payment Method
								</Form.Label>
								<Form.Control
									required
									type="text"
									placeholder="Card"
									value={paymentName || paymentValue}
									isInvalid={validated && !paymentName}
									onChange={(event) =>
										handleChangePayment(
											event.target.value,
											paymentLoading
										)
									}
								></Form.Control>
								<Form.Control.Feedback type="invalid">
									Please select a valid payment method.
								</Form.Control.Feedback>
							</div>
							{dd1active ? (
								<div className="custom__dropdown__payment__dropdown__new__modal">
									{paymentLoading ? (
										<div className="d-flex justify-content-center align-items-center">
											<Loader height={60} width={60} />
										</div>
									) : paymentsearchresult.length > 0 ? (
										paymentsearchresult.map((el, index) => (
											<button
												key={index}
												className="custom__dropdown__payment__dropdown__option"
												onClick={() => {
													setPaymentName(
														el.cc_card_name ||
															el.bank_name ||
															el.payment_method_name
													);
													const temp = {
														...finalObj,
													};
													temp.payment_method_id =
														el.payment_method_id;
													setfinalObj(temp);
													setdd1active(false);
												}}
											>
												<div className="custom__dropdown__payment__dropdown__option__d1">
													<img
														src={getImageForPaymentMethodDropdown(
															el
														)}
														style={{
															marginRight: "8px",
															height: "14px",
															width: "22px",
														}}
													></img>
													{el.cc_card_name ||
														el.bank_name ||
														el.payment_method_name}
												</div>
												<div className="custom__dropdown__payment__dropdown__option__d2">
													{el.bank_masked_account_digits ||
													el.cc_masked_digits
														? "•••• •••• " +
														  (el.bank_masked_account_digits ||
																el.cc_masked_digits)
														: null}
												</div>
											</button>
										))
									) : (
										<div className="d-flex mt-3 mb-3 ml-auto mr-auto">
											No payment methods
										</div>
									)}
								</div>
							) : null}
						</div>
					</Modal.Body>
					<hr />
					<Modal.Footer className="addTransactionModal__footer">
						<button className="btn btn-link" onClick={handleClose}>
							Cancel
						</button>
						<Button disabled={tSubmitting} type="submit">
							Add Transaction
							{tSubmitting && (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									className="ml-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							)}
						</Button>
					</Modal.Footer>
					{addingnewappmodalopen ? (
						<>
							<div className="modal-backdrop show"></div>
							<div
								style={{ display: "block" }}
								className="modal"
							></div>
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
					) : null}
				</Form>
			</Modal>
		</>
	);
}

AddTransactionModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	application: PropTypes.object,
	submitting: PropTypes.bool,
	handleSubmit: PropTypes.func.isRequired,
};
