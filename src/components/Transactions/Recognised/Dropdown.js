import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import {
	getPaymentMethods,
	setPMTransBulk,
} from "../../../services/api/transactions";
import { useDispatch, useSelector } from "react-redux";
import useOutsideClick from "../../../common/OutsideClick/OutsideClick";
import arrowdropdown from "../Unrecognised/arrowdropdown.svg";
import { fetchRecognisedTransactions } from "../../../actions/transactions-action";
import { defaults } from "../../../constants";
import master from "../../../assets/transactions/mastercard.svg";
import visa from "../../../assets/transactions/visa.svg";
import "../../../App.css";
import bank from "../../../assets/transactions/bank.svg";
import card from "../../../assets/transactions/card.svg";
import otherpayment from "../../../assets/transactions/otherpayment.svg";
import search from "../../../assets/search.svg";
import { Loader } from "../../../common/Loader/Loader";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Amex from "assets/transactions/Amex.svg";

export default function Dropdown(props) {
	const ref = useRef();
	const dispatch = useDispatch();
	const [currentpayment, setcurrentpayment] = useState("Add Payment Method");
	const [finalObj, setfinalObj] = useState({
		payment_method_id: "",
		transactions: [props.id],
	});
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [drowdownactive, setdropdownactive] = useState(false);
	const cell = props.cell;
	const [paymentName, setPaymentName] = useState("");
	const [paymentMethods, setPaymentMethods] = useState([]);
	const [paymentLoading, setPaymentLoading] = useState(true);
	const [addingnewappmodalopen, setaddingnewappmodalopen] = useState(false);
	const [paymentsearchresult, setpaymentsearchresult] = useState([]);
	const [dd1active, setdd1active] = useState(false);
	const showTooltipLength = 20;
	function handleChangePayment(event) {
		event.preventDefault();
		event.stopPropagation();
		const value = event.target.value;
		setPaymentName(value);
		const search = value.toLowerCase();
		const matchingPaymentArray = [];
		if (value.length > 0) {
			setdd1active(true);
		} else {
			setdd1active(false);
		}
		if (paymentLoading === false) {
			paymentMethods.payment_ccs.forEach((el) => {
				if (el.cc_card_name.toLowerCase().includes(search)) {
					matchingPaymentArray.push(el);
				}
			});
			paymentMethods.payment_banks.forEach((el) => {
				if (el.bank_name.toLowerCase().includes(search)) {
					matchingPaymentArray.push(el);
				}
			});
			paymentMethods.payment_others.forEach((el) => {
				if (el.payment_method_name.toLowerCase().includes(search)) {
					matchingPaymentArray.push(el);
				}
			});
		}
		setpaymentsearchresult(matchingPaymentArray);
	}

	useOutsideClick(ref, () => {
		if (drowdownactive) setdropdownactive(false);
	});

	function handleClickPayment(event) {
		event.preventDefault();
		event.stopPropagation();
		setdropdownactive(true);
		if (paymentLoading) {
			getPaymentMethods().then((res) => {
				setPaymentMethods(res.data);
				setPaymentLoading(false);
			});
		}
	}

	function clickOnPaymentMethodTable(id, category) {
		//Segment Implementation
		window.analytics.track("Clicked on Change Payment Method in Table", {
			currentCategory: "Transactions",
			currentPageName: `${category}-Transactions`,
			clickedAppId: id,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}

	return (
		<>
			<button
				ref={ref}
				className="custom__dropdown__payment"
				onClick={(e) => {
					handleClickPayment(e);
					clickOnPaymentMethodTable(props.id, props.segmentCategory);
				}}
			>
				{currentpayment}
				<img src={arrowdropdown} style={{ marginLeft: "6px" }}></img>
				{drowdownactive ? (
					paymentLoading ? (
						<>
							<div className="custom__dropdown__payment__dropdown__new__modal__2">
								<div className="d-flex justify-content-center align-items-center">
									<Loader height={60} width={60} />
								</div>
							</div>
						</>
					) : (
						<div className="custom__dropdown__payment__dropdown__new__modal__2 menu">
							<div
								className="inputWithIconAppsTxns"
								style={
									dd1active && paymentsearchresult
										? {
												marginTop: "9px",
												marginBottom: "9px",
										  }
										: { margin: "auto" }
								}
							>
								<input
									type="text"
									placeholder="Search"
									onChange={(event) =>
										handleChangePayment(event)
									}
								/>
								<img src={search} aria-hidden="true" />
							</div>
							{dd1active &&
							!paymentLoading &&
							paymentsearchresult.length === 0 ? (
								<div className="d-flex mt-2 mb-3 ml-auto mr-auto">
									No payment methods
								</div>
							) : (
								paymentsearchresult.map((el) => (
									<>
										<button
											className="custom__dropdown__payment__dropdown__option"
											onClick={() => {
												const temp = {
													...finalObj,
												};
												temp.payment_method_id =
													el.payment_method_id;
												setfinalObj(temp);
												setPMTransBulk(
													finalObj.transactions,
													el.payment_method_id
												).then(() => {
													dispatch(props.fetch);
													setdd1active(false);
												});
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
												<OverlayTrigger
													placement="top"
													overlay={
														<Tooltip>
															{el.cc_card_name ||
																el.bank_name ||
																el.payment_method_name}
														</Tooltip>
													}
												>
													<div className="truncate_10vw">
														{el.cc_card_name ||
															el.bank_name ||
															el.payment_method_name}
													</div>
												</OverlayTrigger>
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
										<hr style={{ margin: "0px 18px" }} />
									</>
								))
							)}
						</div>
					)
				) : null}
			</button>
		</>
	);
}

export function getImageForPaymentMethodDropdown(paymentMethod) {
	var image;
	image =
		paymentMethod.cc_card_type === "visa"
			? visa
			: paymentMethod.cc_card_type === "mastercard"
			? master
			: paymentMethod.cc_card_type === "american_express"
			? Amex
			: paymentMethod.bank_name
			? bank
			: paymentMethod.cc_card_name
			? card
			: paymentMethod.payment_method_name &&
			  paymentMethod.payment_logo_url !== ""
			? paymentMethod.payment_logo_url
			: otherpayment;
	return image;
}

Dropdown.propTypes = {
	afterSelect: PropTypes.func,
};
